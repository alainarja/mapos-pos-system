import { create } from 'zustand'

export interface PrintItem {
  name: string
  quantity: number
  price: number
  total: number
  discount?: number
  discountType?: 'percentage' | 'fixed'
}

export interface Receipt {
  id: string
  timestamp: Date
  cashier: string
  items: PrintItem[]
  subtotal: number
  tax: number
  total: number
  totalSavings?: number
  paymentMethod: string
  discountInfo?: {
    type: 'percentage' | 'fixed'
    value: number
    reason?: string
    managerId?: string
    timestamp: Date
  } | null
  appliedCoupons?: Array<{
    coupon: {
      code: string
      name: string
      type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'category_discount'
      value: number
    }
    discountAmount: number
    appliedAt: Date
  }>
  customer?: {
    name: string
    email?: string
    loyaltyPoints?: number
  }
}

export interface PrintOptions {
  includeLogo: boolean
  includeBarcode: boolean
  includeCustomerInfo: boolean
  paperSize: 'thermal' | 'a4' | 'letter'
  copies: number
}

export interface AutoPrintSettings {
  enabled: boolean
  printImmediately: boolean
  showPreview: boolean
  customerCopy: boolean
  merchantCopy: boolean
  confirmBeforePrint: boolean
  autoAdvanceAfterPrint: boolean
  printDelay: number // seconds to delay before auto-print
}

export interface PrinterInfo {
  id: string
  name: string
  type: 'thermal' | 'inkjet' | 'laser'
  status: 'ready' | 'busy' | 'error' | 'offline'
  isDefault: boolean
  lastUsed?: Date
}

interface PrintStore {
  // State
  lastReceipt: Receipt | null
  printHistory: Receipt[]
  defaultPrintOptions: PrintOptions
  autoPrintSettings: AutoPrintSettings
  availablePrinters: PrinterInfo[]
  selectedPrinter: string
  isConnected: boolean
  printerStatus: 'ready' | 'busy' | 'error' | 'offline'
  printQueue: Receipt[]
  isProcessingQueue: boolean
  
  // Actions
  generateReceipt: (
    items: PrintItem[], 
    paymentInfo: { 
      method: string, 
      subtotal: number, 
      tax: number, 
      total: number, 
      totalSavings?: number,
      discountInfo?: Receipt['discountInfo'],
      appliedCoupons?: Receipt['appliedCoupons']
    }, 
    cashier: string, 
    customer?: Receipt['customer']
  ) => Receipt
  printReceipt: (receipt: Receipt, options?: Partial<PrintOptions>) => Promise<boolean>
  printReceiptWithDialog: (receipt: Receipt) => Promise<boolean>
  autoPrintReceipt: (receipt: Receipt) => Promise<boolean>
  addToQueue: (receipt: Receipt) => void
  processQueue: () => Promise<void>
  printLastReceipt: () => Promise<boolean>
  printDailyReport: () => Promise<boolean>
  printXReport: () => Promise<boolean>
  printZReport: () => Promise<boolean>
  printEndOfDayReport: (reportData: any) => Promise<boolean>
  printTransaction: (transactionId: string) => Promise<boolean>
  updatePrintOptions: (options: Partial<PrintOptions>) => void
  updateAutoPrintSettings: (settings: Partial<AutoPrintSettings>) => void
  setPrinterStatus: (status: PrintStore['printerStatus']) => void
  setSelectedPrinter: (printerId: string) => void
  refreshPrinters: () => Promise<void>
  addToHistory: (receipt: Receipt) => void
  clearPrintHistory: () => void
  clearQueue: () => void
}

export const usePrintStore = create<PrintStore>((set, get) => ({
  // Initial state
  lastReceipt: null,
  printHistory: [],
  defaultPrintOptions: {
    includeLogo: true,
    includeBarcode: true,
    includeCustomerInfo: true,
    paperSize: 'thermal',
    copies: 1,
  },
  autoPrintSettings: {
    enabled: true,
    printImmediately: true,
    showPreview: false,
    customerCopy: true,
    merchantCopy: false,
    confirmBeforePrint: false,
    autoAdvanceAfterPrint: true,
    printDelay: 1, // 1 second delay
  },
  availablePrinters: [
    { id: 'default', name: 'Default Printer', type: 'thermal', status: 'ready', isDefault: true },
    { id: 'thermal1', name: 'Star TSP143III', type: 'thermal', status: 'ready', isDefault: false },
    { id: 'receipt1', name: 'Epson TM-T88V', type: 'thermal', status: 'ready', isDefault: false },
  ],
  selectedPrinter: 'default',
  isConnected: true,
  printerStatus: 'ready',
  printQueue: [],
  isProcessingQueue: false,

  // Actions
  generateReceipt: (items, paymentInfo, cashier, customer) => {
    const receipt: Receipt = {
      id: `TXN-${Date.now()}`,
      timestamp: new Date(),
      cashier,
      items,
      subtotal: paymentInfo.subtotal,
      tax: paymentInfo.tax,
      total: paymentInfo.total,
      totalSavings: paymentInfo.totalSavings,
      paymentMethod: paymentInfo.method,
      discountInfo: paymentInfo.discountInfo,
      appliedCoupons: paymentInfo.appliedCoupons,
      customer,
    }
    
    set({ lastReceipt: receipt })
    get().addToHistory(receipt)
    return receipt
  },

  printReceipt: async (receipt, options) => {
    const printOptions = { ...get().defaultPrintOptions, ...options }
    
    try {
      set({ printerStatus: 'busy' })
      
      // Add notification for print start
      try {
        const { useNotificationStore } = await import('./notifications')
        const notificationStore = useNotificationStore.getState()
        notificationStore.addNotification({
          type: 'info',
          title: 'Printing Receipt',
          message: `Printing receipt ${receipt.id}...`
        })
      } catch (notificationError) {
        console.warn('Failed to add print notification:', notificationError)
      }
      
      // Simulate printing process based on printer type
      const selectedPrinter = get().availablePrinters.find(p => p.id === get().selectedPrinter)
      const printDelay = selectedPrinter?.type === 'thermal' ? 1000 : 2000
      
      // Check if printer is available
      if (!selectedPrinter || selectedPrinter.status === 'offline') {
        throw new Error(`Selected printer is ${selectedPrinter?.status || 'not found'}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, printDelay))
      
      // Generate print content
      const printContent = get().formatReceiptForPrint(receipt, printOptions)
      
      // Print using browser's print API
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      } else {
        throw new Error('Failed to open print window')
      }
      
      // Update printer last used time
      set(state => ({
        availablePrinters: state.availablePrinters.map(p => 
          p.id === state.selectedPrinter 
            ? { ...p, lastUsed: new Date() }
            : p
        ),
        printerStatus: 'ready'
      }))
      
      // Add success notification
      try {
        const { useNotificationStore } = await import('./notifications')
        const notificationStore = useNotificationStore.getState()
        notificationStore.addNotification({
          type: 'success',
          title: 'Print Successful',
          message: `Receipt ${receipt.id} printed successfully${printOptions.copies > 1 ? ` (${printOptions.copies} copies)` : ''}`
        })
      } catch (notificationError) {
        console.warn('Failed to add success notification:', notificationError)
      }
      
      return true
    } catch (error) {
      console.error('Print error:', error)
      set({ printerStatus: 'error' })
      
      // Add error notification
      try {
        const { useNotificationStore } = await import('./notifications')
        const notificationStore = useNotificationStore.getState()
        notificationStore.addNotification({
          type: 'error',
          title: 'Print Failed',
          message: error instanceof Error ? error.message : 'Unknown print error occurred',
          action: {
            label: 'Retry',
            callback: () => get().printReceipt(receipt, options)
          }
        })
      } catch (notificationError) {
        console.warn('Failed to add error notification:', notificationError)
      }
      
      return false
    }
  },

  printReceiptWithDialog: async (receipt) => {
    // This would trigger the print dialog component
    // Implementation depends on how the dialog is integrated
    return await get().printReceipt(receipt)
  },

  autoPrintReceipt: async (receipt) => {
    const { autoPrintSettings, defaultPrintOptions } = get()
    
    if (!autoPrintSettings.enabled) {
      return false
    }

    // Add delay if configured
    if (autoPrintSettings.printDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, autoPrintSettings.printDelay * 1000))
    }

    // Configure print options based on auto-print settings
    const printOptions = {
      ...defaultPrintOptions,
      copies: (
        (autoPrintSettings.customerCopy ? 1 : 0) + 
        (autoPrintSettings.merchantCopy ? 1 : 0)
      ) || 1
    }

    return await get().printReceipt(receipt, printOptions)
  },

  addToQueue: (receipt) => {
    set(state => ({
      printQueue: [...state.printQueue, receipt]
    }))
    
    // Auto-process queue if not already processing
    if (!get().isProcessingQueue) {
      get().processQueue()
    }
  },

  processQueue: async () => {
    const { printQueue, isProcessingQueue } = get()
    
    if (isProcessingQueue || printQueue.length === 0) {
      return
    }

    set({ isProcessingQueue: true })
    
    try {
      while (get().printQueue.length > 0) {
        const receipt = get().printQueue[0]
        
        // Remove from queue first
        set(state => ({
          printQueue: state.printQueue.slice(1)
        }))
        
        // Print the receipt
        await get().printReceipt(receipt)
        
        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Queue processing error:', error)
    } finally {
      set({ isProcessingQueue: false })
    }
  },

  printLastReceipt: async () => {
    const { lastReceipt } = get()
    if (lastReceipt) {
      return await get().printReceipt(lastReceipt)
    }
    return false
  },

  printDailyReport: async () => {
    try {
      set({ printerStatus: 'busy' })
      
      // Generate daily report content
      const reportContent = get().formatDailyReportForPrint()
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(reportContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
      
      set({ printerStatus: 'ready' })
      return true
    } catch (error) {
      console.error('Print daily report error:', error)
      set({ printerStatus: 'error' })
      return false
    }
  },

  printXReport: async () => {
    try {
      set({ printerStatus: 'busy' })
      
      const reportContent = get().formatXReportForPrint()
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(reportContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
      
      set({ printerStatus: 'ready' })
      return true
    } catch (error) {
      console.error('Print X-Report error:', error)
      set({ printerStatus: 'error' })
      return false
    }
  },

  printZReport: async () => {
    try {
      set({ printerStatus: 'busy' })
      
      const reportContent = get().formatZReportForPrint()
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(reportContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
      
      set({ printerStatus: 'ready' })
      return true
    } catch (error) {
      console.error('Print Z-Report error:', error)
      set({ printerStatus: 'error' })
      return false
    }
  },

  printEndOfDayReport: async (reportData) => {
    try {
      set({ printerStatus: 'busy' })
      
      const reportContent = get().formatEndOfDayReportForPrint(reportData)
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(reportContent)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
      
      set({ printerStatus: 'ready' })
      return true
    } catch (error) {
      console.error('Print End-of-Day Report error:', error)
      set({ printerStatus: 'error' })
      return false
    }
  },

  printTransaction: async (transactionId) => {
    // Try to find in print history first
    let receipt = get().printHistory.find(r => r.id === transactionId)
    
    if (!receipt) {
      // If not found, try to find in transaction store and convert to receipt format
      try {
        const { useTransactionStore } = await import('./transactions')
        const transactionStore = useTransactionStore.getState()
        const transaction = transactionStore.getTransactionById(transactionId)
        
        if (transaction) {
          // Convert transaction to receipt format
          receipt = {
            id: transaction.receiptNumber || transaction.id,
            timestamp: new Date(`${transaction.date}T${transaction.time}`),
            cashier: transaction.cashier,
            items: transaction.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            })),
            subtotal: transaction.subtotal,
            tax: transaction.tax,
            total: transaction.total,
            paymentMethod: transaction.paymentMethod,
            customer: transaction.customerId ? {
              name: `Customer ${transaction.customerId}`,
              email: undefined,
              loyaltyPoints: undefined
            } : undefined
          }
        }
      } catch (error) {
        console.error('Error loading transaction:', error)
      }
    }
    
    if (receipt) {
      return await get().printReceipt(receipt)
    }
    return false
  },

  updatePrintOptions: (options) => {
    set((state) => ({
      defaultPrintOptions: { ...state.defaultPrintOptions, ...options }
    }))
  },

  updateAutoPrintSettings: (settings) => {
    set((state) => ({
      autoPrintSettings: { ...state.autoPrintSettings, ...settings }
    }))
  },

  setSelectedPrinter: (printerId) => {
    set({ selectedPrinter: printerId })
  },

  refreshPrinters: async () => {
    // In a real implementation, this would query the system for available printers
    try {
      // Simulate printer discovery
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock updated printer list
      const updatedPrinters: PrinterInfo[] = [
        { id: 'default', name: 'Default Printer', type: 'thermal', status: 'ready', isDefault: true },
        { id: 'thermal1', name: 'Star TSP143III', type: 'thermal', status: 'ready', isDefault: false },
        { id: 'receipt1', name: 'Epson TM-T88V', type: 'thermal', status: 'ready', isDefault: false },
        { id: 'laser1', name: 'Brother HL-L2350DW', type: 'laser', status: 'offline', isDefault: false },
      ]
      
      set({ availablePrinters: updatedPrinters })
    } catch (error) {
      console.error('Failed to refresh printers:', error)
    }
  },

  setPrinterStatus: (status) => {
    set({ printerStatus: status })
  },

  addToHistory: (receipt) => {
    set((state) => ({
      printHistory: [...state.printHistory, receipt]
    }))
  },

  clearPrintHistory: () => {
    set({ printHistory: [] })
  },

  clearQueue: () => {
    set({ printQueue: [] })
  },

  // Helper methods (not exposed in interface but available via get())
  formatReceiptForPrint: (receipt: Receipt, options: PrintOptions) => {
    const { includeLogo, includeBarcode, includeCustomerInfo } = options
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.id}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
          }
          .receipt { 
            max-width: 300px; 
            margin: 0 auto; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .store-info {
            font-size: 10px;
          }
          .transaction-info {
            margin: 15px 0;
            font-size: 11px;
          }
          .items {
            margin: 15px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 30px;
            text-align: center;
          }
          .item-price {
            width: 60px;
            text-align: right;
          }
          .totals {
            border-top: 1px solid #000;
            margin-top: 10px;
            padding-top: 5px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .total-line.final {
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin: 10px 0;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${includeLogo ? '<div class="logo">MAPOS</div>' : ''}
            <div class="store-info">
              Point of Sale System<br>
              123 Main Street<br>
              Your City, State 12345<br>
              Phone: (555) 123-4567
            </div>
          </div>
          
          <div class="transaction-info">
            <div><strong>Receipt #:</strong> ${receipt.id}</div>
            <div><strong>Date:</strong> ${receipt.timestamp.toLocaleDateString()}</div>
            <div><strong>Time:</strong> ${receipt.timestamp.toLocaleTimeString()}</div>
            <div><strong>Cashier:</strong> ${receipt.cashier}</div>
            ${includeCustomerInfo && receipt.customer ? `
              <div><strong>Customer:</strong> ${receipt.customer.name}</div>
              ${receipt.customer.loyaltyPoints ? `<div><strong>Loyalty Points:</strong> ${receipt.customer.loyaltyPoints}</div>` : ''}
            ` : ''}
          </div>

          <div class="items">
            <div style="border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
              <strong>ITEMS PURCHASED</strong>
            </div>
            ${receipt.items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">$${item.total.toFixed(2)}</div>
              </div>
              ${item.discount && item.discount > 0 ? `
                <div class="item" style="font-size: 10px; color: #666;">
                  <div class="item-name">  Item Discount</div>
                  <div class="item-qty"></div>
                  <div class="item-price">-$${
                    item.discountType === 'fixed' 
                      ? item.discount.toFixed(2)
                      : (item.total * (item.discount / 100)).toFixed(2)
                  }</div>
                </div>
              ` : ''}
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>$${receipt.subtotal.toFixed(2)}</span>
            </div>
            
            ${receipt.discountInfo ? `
              <div class="total-line" style="color: #2c5aa0;">
                <span>Store Discount (${receipt.discountInfo.type === 'percentage' ? receipt.discountInfo.value + '%' : '$' + receipt.discountInfo.value}):</span>
                <span>-$${(receipt.discountInfo.type === 'percentage' 
                  ? receipt.subtotal * (receipt.discountInfo.value / 100)
                  : Math.min(receipt.discountInfo.value, receipt.subtotal)
                ).toFixed(2)}</span>
              </div>
            ` : ''}
            
            ${receipt.appliedCoupons && receipt.appliedCoupons.length > 0 ? `
              <div style="border-top: 1px solid #ccc; padding-top: 5px; margin-top: 5px;">
                <div style="font-weight: bold; margin-bottom: 3px;">COUPONS APPLIED:</div>
                ${receipt.appliedCoupons.map(applied => `
                  <div class="total-line" style="color: #d97706; font-size: 11px;">
                    <span>${applied.coupon.code} - ${applied.coupon.name}</span>
                    <span>-$${applied.discountAmount.toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${receipt.totalSavings && receipt.totalSavings > 0 ? `
              <div class="total-line" style="color: #059669; font-weight: bold; border-top: 1px solid #ccc; padding-top: 5px; margin-top: 5px;">
                <span>YOU SAVED:</span>
                <span>$${receipt.totalSavings.toFixed(2)}</span>
              </div>
            ` : ''}
            
            <div class="total-line">
              <span>Tax:</span>
              <span>$${receipt.tax.toFixed(2)}</span>
            </div>
            <div class="total-line final">
              <span>TOTAL:</span>
              <span>$${receipt.total.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Payment Method:</span>
              <span>${receipt.paymentMethod}</span>
            </div>
          </div>

          ${includeBarcode ? `
            <div class="barcode">
              |||| || ||| |||| |||<br>
              ${receipt.id}
            </div>
          ` : ''}

          <div class="footer">
            Thank you for your business!<br>
            Please keep your receipt<br>
            Return policy: 30 days with receipt<br>
            <br>
            Powered by MAPOS
          </div>
        </div>
      </body>
      </html>
    `
  },

  formatDailyReportForPrint: () => {
    const today = new Date()
    const todayReceipts = get().printHistory.filter(
      receipt => receipt.timestamp.toDateString() === today.toDateString()
    )
    
    const totalSales = todayReceipts.reduce((sum, receipt) => sum + receipt.total, 0)
    const totalTransactions = todayReceipts.length
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .report { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin: 20px 0; }
          .summary-item { display: flex; justify-content: space-between; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h1>MAPOS - Daily Sales Report</h1>
            <p>Date: ${today.toDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Sales Summary</h3>
            <div class="summary-item">
              <strong>Total Transactions:</strong>
              <span>${totalTransactions}</span>
            </div>
            <div class="summary-item">
              <strong>Total Sales:</strong>
              <span>$${totalSales.toFixed(2)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Time</th>
                <th>Cashier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${todayReceipts.map(receipt => `
                <tr>
                  <td>${receipt.id}</td>
                  <td>${receipt.timestamp.toLocaleTimeString()}</td>
                  <td>${receipt.cashier}</td>
                  <td>${receipt.items.length}</td>
                  <td>$${receipt.total.toFixed(2)}</td>
                  <td>${receipt.paymentMethod}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `
  },

  formatXReportForPrint: () => {
    const today = new Date()
    const todayReceipts = get().printHistory.filter(
      receipt => receipt.timestamp.toDateString() === today.toDateString()
    )
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>X-Report</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 20px; font-size: 12px; }
          .report { max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; }
          .section { margin: 15px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h2>MAPOS X-REPORT</h2>
            <p>Date: ${today.toLocaleDateString()}</p>
            <p>Time: ${today.toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h4>TRANSACTION SUMMARY</h4>
            <div class="line">
              <span>Transactions Count:</span>
              <span>${todayReceipts.length}</span>
            </div>
            <div class="line">
              <span>Gross Sales:</span>
              <span>$${todayReceipts.reduce((sum, r) => sum + r.total, 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="section">
            <h4>PAYMENT METHODS</h4>
            <div class="line">
              <span>Cash:</span>
              <span>$${todayReceipts.filter(r => r.paymentMethod === 'Cash').reduce((sum, r) => sum + r.total, 0).toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Card:</span>
              <span>$${todayReceipts.filter(r => r.paymentMethod === 'Card').reduce((sum, r) => sum + r.total, 0).toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Digital:</span>
              <span>$${todayReceipts.filter(r => r.paymentMethod === 'Digital Wallet').reduce((sum, r) => sum + r.total, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },

  formatZReportForPrint: () => {
    const today = new Date()
    const todayReceipts = get().printHistory.filter(
      receipt => receipt.timestamp.toDateString() === today.toDateString()
    )
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Z-Report</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 20px; font-size: 12px; }
          .report { max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; }
          .section { margin: 15px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h2>MAPOS Z-REPORT</h2>
            <p>END OF DAY REPORT</p>
            <p>Date: ${today.toLocaleDateString()}</p>
            <p>Time: ${today.toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h4>FINAL TOTALS</h4>
            <div class="line">
              <span>Total Transactions:</span>
              <span>${todayReceipts.length}</span>
            </div>
            <div class="line">
              <span>Gross Sales:</span>
              <span>$${todayReceipts.reduce((sum, r) => sum + r.subtotal, 0).toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Tax Collected:</span>
              <span>$${todayReceipts.reduce((sum, r) => sum + r.tax, 0).toFixed(2)}</span>
            </div>
            <div class="line total">
              <span>NET TOTAL:</span>
              <span>$${todayReceipts.reduce((sum, r) => sum + r.total, 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="section">
            <p><strong>*** END OF BUSINESS DAY ***</strong></p>
            <p>This report closes the current business day.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  formatEndOfDayReportForPrint: (reportData: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>End of Day Report</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            margin: 20px; 
            font-size: 12px; 
            line-height: 1.4;
          }
          .report { max-width: 600px; margin: 0 auto; }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px;
          }
          .section { margin: 20px 0; border-bottom: 1px solid #ccc; padding-bottom: 15px; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; }
          .subtitle { font-weight: bold; margin: 10px 0 5px 0; color: #333; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
          .cash-section { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; }
          .variance-ok { color: #008000; }
          .variance-error { color: #dc3545; font-weight: bold; }
          @media print {
            body { margin: 10px; font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <h2>MAPOS END OF DAY REPORT</h2>
            <p><strong>Date: ${new Date(reportData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</strong></p>
            <p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
            <p>Prepared by: ${reportData.generatedBy}</p>
          </div>
          
          <div class="section">
            <h3>SALES SUMMARY</h3>
            <div class="line">
              <span>Total Transactions:</span>
              <span>${reportData.totalTransactions}</span>
            </div>
            <div class="line">
              <span>Gross Sales:</span>
              <span>$${(reportData.totalRevenue + reportData.totalDiscount).toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Total Discounts:</span>
              <span>-$${reportData.totalDiscount.toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Net Sales:</span>
              <span>$${reportData.netSales.toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Tax Collected:</span>
              <span>$${reportData.totalTax.toFixed(2)}</span>
            </div>
            <div class="line total">
              <span>TOTAL REVENUE:</span>
              <span>$${reportData.totalRevenue.toFixed(2)}</span>
            </div>
            <div class="line">
              <span>Average Transaction:</span>
              <span>$${reportData.averageTransaction.toFixed(2)}</span>
            </div>
            ${reportData.refundsCount > 0 ? `
            <div class="line" style="color: #dc3545;">
              <span>Refunds (${reportData.refundsCount}):</span>
              <span>-$${reportData.refundsAmount.toFixed(2)}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <h3>PAYMENT METHOD BREAKDOWN</h3>
            ${Object.entries(reportData.paymentMethodBreakdown).map(([method, data]: [string, any]) => `
              <div class="line">
                <span>${method} (${data.count} trans):</span>
                <span>$${data.amount.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          ${reportData.cashReconciliation ? `
          <div class="section cash-section">
            <h3>CASH RECONCILIATION</h3>
            <div class="line">
              <span>Expected Cash:</span>
              <span>$${reportData.cashReconciliation.expectedCash.toFixed(2)}</span>
            </div>
            ${reportData.cashReconciliation.actualCash !== null ? `
              <div class="line">
                <span>Actual Cash Count:</span>
                <span>$${reportData.cashReconciliation.actualCash.toFixed(2)}</span>
              </div>
              <div class="line total ${reportData.cashReconciliation.variance === 0 ? 'variance-ok' : 'variance-error'}">
                <span>Variance:</span>
                <span>${reportData.cashReconciliation.variance === 0 ? 'BALANCED' : 
                  (reportData.cashReconciliation.variance > 0 ? '+' : '') + 
                  '$' + reportData.cashReconciliation.variance.toFixed(2)}</span>
              </div>
              ${Math.abs(reportData.cashReconciliation.variance) > 0.01 ? `
                <div style="color: #dc3545; font-weight: bold; text-align: center; margin-top: 10px;">
                  ⚠️ CASH VARIANCE REQUIRES MANAGER ATTENTION ⚠️
                </div>
              ` : `
                <div style="color: #008000; font-weight: bold; text-align: center; margin-top: 10px;">
                  ✓ CASH DRAWER BALANCED
                </div>
              `}
            ` : `
              <div style="color: #ffc107; text-align: center; margin-top: 10px;">
                CASH COUNT NOT COMPLETED
              </div>
            `}
          </div>
          ` : ''}

          <div class="section">
            <h3>TOP SELLING ITEMS</h3>
            ${reportData.topItems.slice(0, 10).map((item: any, index: number) => `
              <div class="line">
                <span>${index + 1}. ${item.name} (×${item.quantity}):</span>
                <span>$${item.revenue.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>CASHIER PERFORMANCE</h3>
            ${reportData.cashierPerformance.map((cashier: any) => `
              <div class="line">
                <span>${cashier.cashier} (${cashier.count} trans):</span>
                <span>$${cashier.amount.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          ${reportData.hourlyBreakdown.length > 0 ? `
          <div class="section">
            <h3>HOURLY SALES BREAKDOWN</h3>
            <div class="grid">
              ${reportData.hourlyBreakdown.map((hour: any) => `
                <div class="line">
                  <span>${hour.hour}:</span>
                  <span>$${hour.amount.toFixed(2)} (${hour.count})</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h3>SIGNATURES</h3>
            <div style="margin: 30px 0;">
              <div style="border-top: 1px solid #000; width: 200px; display: inline-block; margin: 10px 20px;">
                <p style="text-align: center; margin: 5px 0; font-size: 10px;">CASHIER SIGNATURE</p>
              </div>
              <div style="border-top: 1px solid #000; width: 200px; display: inline-block; margin: 10px 20px;">
                <p style="text-align: center; margin: 5px 0; font-size: 10px;">MANAGER SIGNATURE</p>
              </div>
            </div>
            <div style="margin: 20px 0;">
              <div style="border-top: 1px solid #000; width: 100px; display: inline-block; margin: 10px 20px;">
                <p style="text-align: center; margin: 5px 0; font-size: 10px;">DATE</p>
              </div>
              <div style="border-top: 1px solid #000; width: 100px; display: inline-block; margin: 10px 20px;">
                <p style="text-align: center; margin: 5px 0; font-size: 10px;">TIME</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div style="text-align: center; font-weight: bold;">
              <p>*** END OF BUSINESS DAY ***</p>
              <p>This report closes the current business day.</p>
              <p>System Date: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },
}))