import { NextRequest, NextResponse } from 'next/server'

// Public receipt endpoint for sharing via WhatsApp
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptId = params.id
    
    // TODO: In production, fetch from database
    // For now, we'll generate a sample receipt
    const receipt = generateSampleReceipt(receiptId)
    
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

function generateSampleReceipt(receiptId: string) {
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
      <h1 class="store-name">MAPOS Retail Store</h1>
      <p class="store-info">123 Commerce Street</p>
      <p class="store-info">Business City, BC 12345</p>
      <p class="store-info">Tel: (555) 123-4567</p>
    </div>
    
    <div class="receipt-id">
      <strong>Receipt #${receiptId}</strong><br>
      ${new Date().toLocaleString()}
    </div>
    
    <div class="items">
      <div class="item">
        <span class="item-name">Sample Product 1</span>
        <span class="item-qty">x2</span>
        <span class="item-price">$20.00</span>
      </div>
      <div class="item">
        <span class="item-name">Sample Product 2</span>
        <span class="item-qty">x1</span>
        <span class="item-price">$15.00</span>
      </div>
      <div class="item">
        <span class="item-name">Sample Service</span>
        <span class="item-qty">x1</span>
        <span class="item-price">$25.00</span>
      </div>
    </div>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$60.00</span>
      </div>
      <div class="total-row">
        <span>Tax (8%):</span>
        <span>$4.80</span>
      </div>
      <div class="total-row grand-total">
        <span class="total-label">TOTAL:</span>
        <span class="total-label">$64.80</span>
      </div>
    </div>
    
    <div class="payment-info">
      <div class="total-row">
        <span>Payment Method:</span>
        <span>Cash</span>
      </div>
      <div class="total-row">
        <span>Amount Paid:</span>
        <span>$70.00</span>
      </div>
      <div class="total-row">
        <span>Change:</span>
        <span>$5.20</span>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Thank you for your purchase!</strong></p>
      <p>Visit us again soon!</p>
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