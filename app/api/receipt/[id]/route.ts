import { NextRequest, NextResponse } from 'next/server'
import { offlineDB } from '@/lib/offline/indexed-db'
import { companyInfoService, CompanyInfo } from '@/lib/services/company-info-service'

// Public receipt endpoint for sharing via WhatsApp
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptId = params.id
    
    // Get company information from inventory API
    const companyInfo = await companyInfoService.getCompanyInfo()
    
    // Try to get transaction from offline database first
    let transaction = await getTransactionById(receiptId)
    
    if (!transaction) {
      // If not found in offline DB, generate sample data for demo
      const receipt = generateSampleReceipt(receiptId, companyInfo)
      return new NextResponse(receipt, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    
    // Generate receipt HTML from real transaction data
    const receipt = generateReceiptFromTransaction(transaction, companyInfo)
    
    // Return HTML receipt
    return new NextResponse(receipt, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}

// Function to get transaction by ID from offline database
async function getTransactionById(receiptId: string) {
  try {
    await offlineDB.init()
    
    // First try direct ID lookup
    let transaction = await offlineDB.getTransactionById(receiptId)
    
    if (!transaction) {
      // If not found, search all transactions for matching receiptNumber
      const allTransactions = await offlineDB.getAllTransactions()
      transaction = allTransactions.find(t => 
        t.receiptNumber === receiptId || t.id === receiptId
      )
    }
    
    return transaction
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return null
  }
}

// Function to generate receipt HTML from transaction data
function generateReceiptFromTransaction(transaction: any, companyInfo: CompanyInfo) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatAddress = (address: CompanyInfo['address']) => {
    return [
      address.street,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country !== 'US' ? address.country : null
    ].filter(Boolean).join('<br>')
  }
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt #${transaction.receiptNumber || transaction.id}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .receipt {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #333;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .store-name {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .store-info {
      color: #666;
      font-size: 12px;
      margin: 5px 0;
    }
    .items {
      border-bottom: 2px dashed #333;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    .item-name {
      flex: 1;
    }
    .item-qty {
      margin: 0 10px;
      color: #666;
    }
    .item-price {
      font-weight: bold;
    }
    .totals {
      margin: 15px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    .total-label {
      font-weight: bold;
    }
    .grand-total {
      font-size: 18px;
      border-top: 2px solid #333;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #333;
      color: #666;
      font-size: 12px;
    }
    .receipt-id {
      text-align: center;
      margin: 10px 0;
      font-size: 11px;
      color: #999;
    }
    .payment-info {
      margin: 15px 0;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .discount {
      color: #d32f2f;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${companyInfo.branding.logo ? `<img src="${companyInfo.branding.logo}" alt="Logo" style="max-width: 100px; margin-bottom: 10px;">` : ''}
      <h1 class="store-name" style="color: ${companyInfo.branding.primaryColor || '#333'}">${companyInfo.name}</h1>
      ${companyInfo.businessName && companyInfo.businessName !== companyInfo.name ? `<p class="store-info" style="font-weight: bold;">${companyInfo.businessName}</p>` : ''}
      <div class="store-info">${formatAddress(companyInfo.address)}</div>
      <p class="store-info">Tel: ${companyInfo.contact.phone}</p>
      ${companyInfo.contact.email ? `<p class="store-info">Email: ${companyInfo.contact.email}</p>` : ''}
      ${companyInfo.contact.website ? `<p class="store-info">Web: ${companyInfo.contact.website}</p>` : ''}
      ${companyInfo.business.taxId ? `<p class="store-info">Tax ID: ${companyInfo.business.taxId}</p>` : ''}
    </div>
    
    <div class="receipt-id">
      <strong>Receipt #${transaction.receiptNumber || transaction.id}</strong><br>
      ${new Date(transaction.date || Date.now()).toLocaleString()}<br>
      Cashier: ${transaction.cashier || 'Unknown'}
    </div>
    
    <div class="items">
      ${transaction.items.map((item: any) => {
        const itemTotal = item.price * item.quantity
        const taxRate = item.taxRate || 0
        const itemTax = itemTotal * taxRate
        const hasVAT = taxRate > 0
        
        return `
        <div class="item">
          <span class="item-name">
            ${item.name}
            ${hasVAT ? `<small style="color: #666;"> (VAT ${(taxRate * 100).toFixed(1)}%)</small>` : ''}
          </span>
          <span class="item-qty">x${item.quantity}</span>
          <span class="item-price">${formatCurrency(itemTotal)}</span>
        </div>
        ${hasVAT && taxRate > 0 ? `
          <div class="item-tax" style="font-size: 11px; color: #666; margin-left: 20px; margin-bottom: 5px;">
            VAT: ${formatCurrency(itemTax)}
          </div>
        ` : ''}
        `
      }).join('')}
    </div>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal (excl. VAT):</span>
        <span>${formatCurrency(transaction.subtotal || 0)}</span>
      </div>
      ${transaction.discount > 0 ? `
        <div class="total-row discount">
          <span>Discount:</span>
          <span>-${formatCurrency(transaction.discount)}</span>
        </div>
      ` : ''}
      ${(() => {
        const taxTotal = transaction.tax || 0
        const subtotalAfterDiscount = (transaction.subtotal || 0) - (transaction.discount || 0)
        const effectiveTaxRate = subtotalAfterDiscount > 0 ? (taxTotal / subtotalAfterDiscount) * 100 : 0
        
        // Group tax by rate
        const taxBreakdown = (transaction.items || []).reduce((acc: any, item: any) => {
          const taxRate = item.taxRate || 0
          if (taxRate > 0) {
            const ratePercent = (taxRate * 100).toFixed(1)
            const itemTotal = item.price * item.quantity
            const itemTax = itemTotal * taxRate
            
            if (!acc[ratePercent]) {
              acc[ratePercent] = { rate: ratePercent, amount: 0, base: 0 }
            }
            acc[ratePercent].amount += itemTax
            acc[ratePercent].base += itemTotal
          }
          return acc
        }, {})
        
        const taxRows = Object.values(taxBreakdown).map((tax: any) => `
          <div class="total-row" style="font-size: 12px; color: #666;">
            <span>VAT ${tax.rate}% on ${formatCurrency(tax.base)}:</span>
            <span>${formatCurrency(tax.amount)}</span>
          </div>
        `).join('')
        
        return taxRows + `
          <div class="total-row">
            <span><strong>Total VAT:</strong></span>
            <span><strong>${formatCurrency(taxTotal)}</strong></span>
          </div>
        `
      })()}
      <div class="total-row grand-total">
        <span class="total-label">TOTAL (incl. VAT):</span>
        <span class="total-label">${formatCurrency(transaction.total)}</span>
      </div>
    </div>
    
    <div class="payment-info">
      <div class="total-row">
        <span>Payment Method:</span>
        <span>${transaction.paymentMethod || 'Cash'}</span>
      </div>
      ${transaction.paymentBreakdown ? Object.entries(transaction.paymentBreakdown)
        .filter(([_, amount]) => amount && amount > 0)
        .map(([method, amount]) => `
          <div class="total-row">
            <span>${method.toUpperCase()}:</span>
            <span>${formatCurrency(amount as number)}</span>
          </div>
        `).join('') : ''}
    </div>
    
    <div class="footer">
      <p><strong>Thank you for your purchase!</strong></p>
      ${companyInfo.branding.slogan ? `<p style="font-style: italic;">${companyInfo.branding.slogan}</p>` : ''}
      <p>Visit us again soon!</p>
      ${companyInfo.settings.receiptFooter ? `<div style="margin: 10px 0; font-size: 11px;">${companyInfo.settings.receiptFooter.replace(/\n/g, '<br>')}</div>` : ''}
      ${companyInfo.settings.returnPolicy ? `<p style="font-size: 10px; margin-top: 10px;">${companyInfo.settings.returnPolicy}</p>` : ''}
      <p style="margin-top: 15px; font-size: 10px;">
        This is a digital receipt<br>
        Save paper, save trees 🌳
      </p>
    </div>
  </div>
</body>
</html>
  `
}

function generateSampleReceipt(receiptId: string, companyInfo: CompanyInfo) {
  const formatAddress = (address: CompanyInfo['address']) => {
    return [
      address.street,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country !== 'US' ? address.country : null
    ].filter(Boolean).join('<br>')
  }
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt #${receiptId}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .receipt {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #333;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .store-name {
      font-size: 24px;
      font-weight: bold;
      margin: 0;
    }
    .store-info {
      color: #666;
      font-size: 12px;
      margin: 5px 0;
    }
    .items {
      border-bottom: 2px dashed #333;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    .item-name {
      flex: 1;
    }
    .item-qty {
      margin: 0 10px;
      color: #666;
    }
    .item-price {
      font-weight: bold;
    }
    .totals {
      margin: 15px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    .total-label {
      font-weight: bold;
    }
    .grand-total {
      font-size: 18px;
      border-top: 2px solid #333;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #333;
      color: #666;
      font-size: 12px;
    }
    .receipt-id {
      text-align: center;
      margin: 10px 0;
      font-size: 11px;
      color: #999;
    }
    .payment-info {
      margin: 15px 0;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .qr-code {
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${companyInfo.branding.logo ? `<img src="${companyInfo.branding.logo}" alt="Logo" style="max-width: 100px; margin-bottom: 10px;">` : ''}
      <h1 class="store-name" style="color: ${companyInfo.branding.primaryColor || '#333'}">${companyInfo.name}</h1>
      ${companyInfo.businessName && companyInfo.businessName !== companyInfo.name ? `<p class="store-info" style="font-weight: bold;">${companyInfo.businessName}</p>` : ''}
      <div class="store-info">${formatAddress(companyInfo.address)}</div>
      <p class="store-info">Tel: ${companyInfo.contact.phone}</p>
      ${companyInfo.contact.email ? `<p class="store-info">Email: ${companyInfo.contact.email}</p>` : ''}
      ${companyInfo.contact.website ? `<p class="store-info">Web: ${companyInfo.contact.website}</p>` : ''}
      ${companyInfo.business.taxId ? `<p class="store-info">Tax ID: ${companyInfo.business.taxId}</p>` : ''}
    </div>
    
    <div class="receipt-id">
      <strong>Receipt #${receiptId}</strong><br>
      ${new Date().toLocaleString()}
    </div>
    
    <div class="items">
      <div class="item">
        <span class="item-name">Sample Product 1 <small style="color: #666;"> (VAT 8.0%)</small></span>
        <span class="item-qty">x2</span>
        <span class="item-price">$20.00</span>
      </div>
      <div class="item-tax" style="font-size: 11px; color: #666; margin-left: 20px; margin-bottom: 5px;">
        VAT: $1.60
      </div>
      <div class="item">
        <span class="item-name">Sample Product 2 <small style="color: #666;"> (VAT 8.0%)</small></span>
        <span class="item-qty">x1</span>
        <span class="item-price">$15.00</span>
      </div>
      <div class="item-tax" style="font-size: 11px; color: #666; margin-left: 20px; margin-bottom: 5px;">
        VAT: $1.20
      </div>
      <div class="item">
        <span class="item-name">Sample Service</span>
        <span class="item-qty">x1</span>
        <span class="item-price">$25.00</span>
      </div>
    </div>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal (excl. VAT):</span>
        <span>$60.00</span>
      </div>
      <div class="total-row" style="font-size: 12px; color: #666;">
        <span>VAT 8.0% on $35.00:</span>
        <span>$2.80</span>
      </div>
      <div class="total-row" style="font-size: 12px; color: #666;">
        <span>VAT 0.0% on $25.00:</span>
        <span>$0.00</span>
      </div>
      <div class="total-row">
        <span><strong>Total VAT:</strong></span>
        <span><strong>$2.80</strong></span>
      </div>
      <div class="total-row grand-total">
        <span class="total-label">TOTAL (incl. VAT):</span>
        <span class="total-label">$62.80</span>
      </div>
    </div>
    
    <div class="payment-info">
      <div class="total-row">
        <span>Payment Method:</span>
        <span>Cash</span>
      </div>
      <div class="total-row">
        <span>Amount Paid:</span>
        <span>$65.00</span>
      </div>
      <div class="total-row">
        <span>Change:</span>
        <span>$2.20</span>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Thank you for your purchase!</strong></p>
      ${companyInfo.branding.slogan ? `<p style="font-style: italic;">${companyInfo.branding.slogan}</p>` : ''}
      <p>Visit us again soon!</p>
      ${companyInfo.settings.receiptFooter ? `<div style="margin: 10px 0; font-size: 11px;">${companyInfo.settings.receiptFooter.replace(/\n/g, '<br>')}</div>` : ''}
      ${companyInfo.settings.returnPolicy ? `<p style="font-size: 10px; margin-top: 10px;">${companyInfo.settings.returnPolicy}</p>` : ''}
      <p style="margin-top: 15px; font-size: 10px;">
        This is a digital receipt<br>
        Save paper, save trees 🌳
      </p>
    </div>
  </div>
</body>
</html>
  `
}