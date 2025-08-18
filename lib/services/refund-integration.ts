/**
 * Refund Integration Service
 * 
 * Handles refunds for both:
 * 1. Recent transactions (localStorage)
 * 2. Historical transactions (CRM invoices)
 */

import { crmIntegration } from './crm-integration'

export interface RefundableTransaction {
  id: string
  invoiceNumber?: string
  date: string
  time: string
  total: number
  subtotal: number
  tax: number
  discount: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  paymentMethod: string
  cashier: string
  customerId?: string
  customerName?: string
  status: 'completed' | 'refunded'
  source: 'local' | 'crm' // Track data source
  crmInvoiceId?: string
}

export interface RefundSearchParams {
  receiptNumber?: string
  invoiceNumber?: string
  customerId?: string
  customerName?: string
  dateRange?: {
    start: string
    end: string
  }
  phoneNumber?: string
  email?: string
}

class RefundIntegrationService {
  private config = {
    // How far back to search in days for local transactions
    localSearchDays: 30,
    // How far back to search in CRM invoices
    crmSearchDays: 365
  }

  /**
   * Search for refundable transactions across both local and CRM systems
   */
  async searchRefundableTransactions(params: RefundSearchParams): Promise<RefundableTransaction[]> {
    const results: RefundableTransaction[] = []

    try {
      // 1. Search local transactions first (faster)
      const localTransactions = await this.searchLocalTransactions(params)
      results.push(...localTransactions)

      // 2. Search CRM invoices for older transactions
      const crmTransactions = await this.searchCRMInvoices(params)
      results.push(...crmTransactions)

      // 3. Sort by date (newest first) and remove duplicates
      return this.deduplicateAndSort(results)

    } catch (error) {
      console.error('Error searching refundable transactions:', error)
      throw error
    }
  }

  /**
   * Search local localStorage transactions
   */
  private async searchLocalTransactions(params: RefundSearchParams): Promise<RefundableTransaction[]> {
    // Import transaction store dynamically to avoid circular dependencies
    const { useTransactionStore } = await import('../../stores/transactions')
    const store = useTransactionStore.getState()
    
    let transactions = store.transactions.filter(t => 
      t.status === 'completed' && this.isWithinSearchWindow(t.date, this.config.localSearchDays)
    )

    // Apply search filters
    if (params.receiptNumber) {
      transactions = transactions.filter(t => 
        t.receiptNumber?.toLowerCase().includes(params.receiptNumber!.toLowerCase())
      )
    }

    if (params.customerId) {
      transactions = transactions.filter(t => t.customerId === params.customerId)
    }

    if (params.customerName) {
      transactions = transactions.filter(t => 
        t.customerName?.toLowerCase().includes(params.customerName!.toLowerCase())
      )
    }

    if (params.dateRange) {
      transactions = transactions.filter(t => 
        t.date >= params.dateRange!.start && t.date <= params.dateRange!.end
      )
    }

    // Convert to RefundableTransaction format
    return transactions.map(t => ({
      ...t,
      source: 'local' as const
    }))
  }

  /**
   * Search CRM invoices for historical transactions
   */
  private async searchCRMInvoices(params: RefundSearchParams): Promise<RefundableTransaction[]> {
    try {
      if (!crmIntegration.isConfigured()) {
        console.warn('CRM integration not configured, skipping historical search')
        return []
      }

      // Build CRM search parameters
      const searchOptions: any = {
        status: 'paid', // Only search paid invoices (refundable)
        perPage: 50     // Reasonable limit
      }
      
      // Only add search parameters if they look valid
      if (params.customerId && params.customerId.length > 0) {
        // Check if customerId looks like a UUID or valid ID format
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.customerId) || 
            /^[a-zA-Z0-9_-]+$/.test(params.customerId)) {
          searchOptions.customer = params.customerId
        }
      }
      
      if (params.customerName && params.customerName.length > 0) {
        // Sanitize customer name to prevent SQL injection
        const sanitizedName = params.customerName.replace(/['"\\;]/g, '')
        if (sanitizedName.length > 0) {
          searchOptions.search = sanitizedName
        }
      }

      if (params.invoiceNumber && params.invoiceNumber.length > 0) {
        // Add invoice number search
        const sanitizedInvoiceNumber = params.invoiceNumber.replace(/['"\\;]/g, '')
        if (sanitizedInvoiceNumber.length > 0) {
          searchOptions.invoice_number = sanitizedInvoiceNumber
        }
      }

      // Use the new searchInvoices method
      const invoiceData = await crmIntegration.searchInvoices(searchOptions)
      
      if (!invoiceData.data || !Array.isArray(invoiceData.data)) {
        return []
      }

      // Convert CRM invoices to RefundableTransaction format
      return invoiceData.data
        .filter((invoice: any) => this.isWithinSearchWindow(invoice.date, this.config.crmSearchDays))
        .map((invoice: any) => this.convertCRMInvoiceToTransaction(invoice))

    } catch (error) {
      console.error('Error searching CRM invoices:', error)
      return [] // Don't fail the entire search if CRM is unavailable
    }
  }

  /**
   * Convert CRM invoice to RefundableTransaction format
   */
  private convertCRMInvoiceToTransaction(invoice: any): RefundableTransaction {
    // Extract time from created_at or use default
    const createdAt = new Date(invoice.created_at || invoice.date)
    const time = createdAt.toLocaleTimeString('en-US', { hour12: false })

    // Safely parse amounts with fallbacks
    const amount = parseFloat(invoice.amount) || parseFloat(invoice.total) || 0
    const tax = parseFloat(invoice.tax) || 0
    const discount = parseFloat(invoice.discount) || 0

    return {
      id: `CRM-${invoice.id}`, // Prefix to distinguish from local transactions
      invoiceNumber: invoice.number || invoice.invoice_number,
      date: invoice.date || invoice.invoice_date || new Date().toISOString().split('T')[0],
      time: time,
      total: amount,
      subtotal: Math.max(0, amount - tax),
      tax: tax,
      discount: discount,
      items: (invoice.line_items || []).map((item: any) => ({
        id: item.sku || item.id || `item-${Math.random()}`,
        name: item.description || item.name || 'Unknown Item',
        price: parseFloat(item.price) || parseFloat(item.unit_price) || 0,
        quantity: parseInt(item.quantity) || 1,
        image: undefined // CRM doesn't store images
      })),
      paymentMethod: this.determineCRMPaymentMethod(invoice),
      cashier: invoice.prepared_by || 'CRM System',
      customerId: invoice.customer_id,
      customerName: invoice.customer,
      status: 'completed' as const,
      source: 'crm' as const,
      crmInvoiceId: invoice.id
    }
  }

  /**
   * Process refund for transaction (local or CRM)
   */
  async processRefund(transaction: RefundableTransaction, refundAmount?: number): Promise<{
    success: boolean
    refundId?: string
    error?: string
  }> {
    try {
      const actualRefundAmount = refundAmount || transaction.total

      if (transaction.source === 'local') {
        return await this.processLocalRefund(transaction, actualRefundAmount)
      } else {
        return await this.processCRMRefund(transaction, actualRefundAmount)
      }
    } catch (error) {
      console.error('Refund processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process refund for local transaction
   */
  private async processLocalRefund(transaction: RefundableTransaction, amount: number) {
    const { useTransactionStore } = await import('../../stores/transactions')
    const store = useTransactionStore.getState()
    
    // Use existing refund logic from transaction store
    const originalId = transaction.id.replace('CRM-', '') // Remove prefix if present
    const success = await store.refundTransaction(originalId)
    
    return {
      success,
      refundId: success ? `REFUND-${Date.now()}` : undefined,
      error: success ? undefined : 'Local refund failed'
    }
  }

  /**
   * Process refund for CRM invoice
   */
  private async processCRMRefund(transaction: RefundableTransaction, amount: number) {
    try {
      // Create refund record in CRM by creating a negative invoice
      const refundInvoice = {
        customer_id: transaction.customerId || '',
        customer: transaction.customerName || 'Unknown Customer',
        amount: -amount,
        currency: 'USD',
        status: 'paid' as const,
        date: new Date().toISOString().split('T')[0],
        payment_method: transaction.paymentMethod,
        pos_sale_id: transaction.id,
        notes: `Refund for Invoice ${transaction.invoiceNumber}`,
        line_items: transaction.items.map(item => ({
          sku: item.id,
          description: item.name,
          quantity: -Math.abs(item.quantity), // Negative quantity for refund
          price: item.price,
          total: -Math.abs(item.price * item.quantity),
          type: 'product' as const
        }))
      }

      // Use the new createRefundInvoice method
      const result = await crmIntegration.createRefundInvoice(refundInvoice)

      if (result.success) {
        // Also add to local transaction store for tracking
        await this.addRefundToLocalStore(transaction, amount, result.invoice_number || `REFUND-${Date.now()}`)

        return {
          success: true,
          refundId: result.invoice_id,
          error: undefined
        }
      } else {
        return {
          success: false,
          error: result.error || 'CRM refund creation failed'
        }
      }

    } catch (error) {
      console.error('CRM refund processing failed:', error)
      return {
        success: false,
        error: 'CRM refund processing failed'
      }
    }
  }

  /**
   * Add CRM refund to local transaction store for tracking
   */
  private async addRefundToLocalStore(originalTransaction: RefundableTransaction, refundAmount: number, refundInvoiceNumber: string) {
    const { useTransactionStore } = await import('../../stores/transactions')
    const store = useTransactionStore.getState()

    const refundTransaction = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      total: -refundAmount,
      subtotal: -refundAmount + (originalTransaction.tax || 0),
      tax: -(originalTransaction.tax || 0),
      discount: 0,
      items: originalTransaction.items.map(item => ({
        ...item,
        quantity: -Math.abs(item.quantity)
      })),
      paymentMethod: originalTransaction.paymentMethod,
      cashier: 'CRM Refund',
      customerId: originalTransaction.customerId,
      customerName: originalTransaction.customerName,
      status: 'refunded' as const,
      receiptNumber: refundInvoiceNumber
    }

    store.addTransaction(refundTransaction)
  }

  /**
   * Helper functions
   */
  private isWithinSearchWindow(date: string, days: number): boolean {
    const transactionDate = new Date(date)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return transactionDate >= cutoffDate
  }

  private deduplicateAndSort(transactions: RefundableTransaction[]): RefundableTransaction[] {
    // Remove duplicates based on original transaction ID or invoice number
    const seen = new Set<string>()
    const unique = transactions.filter(t => {
      const key = t.invoiceNumber || t.id
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    // Sort by date and time (newest first)
    return unique.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
  }

  private determineCRMPaymentMethod(invoice: any): string {
    // Try to determine payment method from CRM invoice
    // This might need adjustment based on your CRM schema
    return invoice.payment_method || 
           invoice.prepared_by === 'POS System' ? 'Card' : 
           'Cash'
  }
}

export const refundIntegration = new RefundIntegrationService()