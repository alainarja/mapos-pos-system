// Service for integrating with external CRM API for invoice creation

interface CrmInvoice {
  customer_id: string
  customer: string
  amount: number
  paid_amount?: number // Add paid_amount field
  currency?: string
  line_items?: Array<{
    description: string
    quantity: number
    price: number
    total: number
    sku?: string
    type?: 'product' | 'service'
    cost_price?: number // Cost price for reporting
  }>
  status?: 'paid'
  date?: string
  payment_method?: string
  pos_sale_id?: string
  warehouse_id?: string // Warehouse ID for invoice prefix
  notes?: string
}

interface CrmInvoiceResult {
  success: boolean
  invoice_id?: string
  invoice_number?: string
  error?: string
}

interface CrmIntegrationConfig {
  baseUrl: string
  apiKey: string
}

class CrmIntegrationService {
  private config: CrmIntegrationConfig

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_CRM_API_URL || process.env.CRM_API_URL || '',
      apiKey: process.env.NEXT_PUBLIC_CRM_API_KEY || process.env.CRM_API_KEY || ''
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if CRM service is configured
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new Error('CRM service not configured - missing base URL or API key')
    }

    const url = `${this.config.baseUrl}${endpoint}`
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`CRM API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('CRM service timeout - request took longer than 20 seconds')
      }
      throw error
    }
  }

  /**
   * Create an invoice in the CRM system
   */
  async createInvoice(invoice: CrmInvoice): Promise<CrmInvoiceResult> {
    try {
      const result = await this.makeRequest('/api/external/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice)
      })
      
      return {
        success: true,
        invoice_id: (result as any).invoice_id,
        invoice_number: (result as any).invoice_number
      }
    } catch (error) {
      console.error('Failed to create CRM invoice:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process a complete POS sale and create corresponding CRM invoice
   */
  async processPOSSale(
    saleId: string,
    customerId: string,
    customerName: string,
    totalAmount: number,
    items: Array<{
      id: string
      name: string
      quantity: number
      price: number
      total: number
      type: 'product' | 'service'
      sku?: string
      costPrice?: number // Cost price for reporting
    }>,
    paymentMethod: string,
    currency: string = 'USD',
    warehouseId?: string
  ): Promise<{
    success: boolean
    invoice_id?: string
    invoice_number?: string
    error?: string
    crmServiceAvailable: boolean
  }> {
    let crmServiceAvailable = true

    // Check if CRM service is available first
    if (!this.config.baseUrl || !this.config.apiKey) {
      console.warn('CRM service not configured - skipping invoice creation')
      return {
        success: false,
        error: 'CRM service not configured',
        crmServiceAvailable: false
      }
    }

    try {
      // Prepare invoice data
      const invoice: CrmInvoice = {
        customer_id: customerId,
        customer: customerName,
        amount: totalAmount,
        paid_amount: totalAmount, // For POS sales, paid amount equals total amount
        currency,
        status: 'paid', // POS sales are immediately paid
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        payment_method: paymentMethod,
        pos_sale_id: saleId,
        warehouse_id: warehouseId, // Include warehouse ID for invoice number prefix
        notes: `POS Sale #${saleId} - Payment: ${paymentMethod}`,
        line_items: items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          sku: item.sku,
          type: item.type,
          cost_price: item.costPrice || 0 // Include cost price for reporting
        }))
      }

      const result = await this.createInvoice(invoice)

      return {
        success: result.success,
        invoice_id: result.invoice_id,
        invoice_number: result.invoice_number,
        error: result.error,
        crmServiceAvailable: true
      }

    } catch (error) {
      console.error(`Failed to process CRM invoice for sale ${saleId}:`, error)
      
      // Check if this is a service availability issue
      if (error instanceof Error && (
        error.message.includes('timeout') || 
        error.message.includes('not configured') ||
        error.message.includes('Connection failed') ||
        error.message.includes('Method Not Allowed')
      )) {
        crmServiceAvailable = false
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        crmServiceAvailable
      }
    }
  }

  /**
   * Check if the CRM service is available
   */
  async checkConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to make a simple GET request to test the connection
      await this.makeRequest('/api/external/invoices?page=1&perPage=1', {
        method: 'GET'
      })
      
      return { success: true }
    } catch (error) {
      console.error('CRM service connection check failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  /**
   * Public method to check if CRM integration is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.baseUrl && this.config.apiKey)
  }

  /**
   * Public method to make arbitrary CRM API requests (for refund system)
   */
  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Check if CRM service is configured
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new Error('CRM service not configured - missing base URL or API key')
    }

    const url = `${this.config.baseUrl}${endpoint}`
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          ...options.headers
        }
      })

      clearTimeout(timeoutId)
      return response

    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('CRM service timeout - request took longer than 20 seconds')
      }
      throw error
    }
  }

  /**
   * Search CRM invoices for refund processing
   */
  async searchInvoices(params: {
    customer?: string
    search?: string
    status?: string
    perPage?: number
    page?: number
  }): Promise<{
    data: any[]
    pagination: any
  }> {
    const searchParams = new URLSearchParams()
    
    if (params.customer) searchParams.append('customer', params.customer)
    if (params.search) searchParams.append('search', params.search)
    if (params.status) searchParams.append('status', params.status)
    if (params.perPage) searchParams.append('perPage', params.perPage.toString())
    if (params.page) searchParams.append('page', params.page.toString())

    const response = await this.makeRequest(`/api/external/invoices?${searchParams.toString()}`, {
      method: 'GET'
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`CRM search failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Create a refund invoice in CRM
   */
  async createRefundInvoice(refundData: CrmInvoice): Promise<CrmInvoiceResult> {
    try {
      const response = await this.makeRequest('/api/external/invoices', {
        method: 'POST',
        body: JSON.stringify(refundData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`CRM refund creation failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      
      return {
        success: result.success || false,
        invoice_id: result.invoice_id,
        invoice_number: result.invoice_number,
        error: result.error
      }

    } catch (error) {
      console.error('CRM refund creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const crmIntegration = new CrmIntegrationService()