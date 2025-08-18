// Service for integrating with external CRM API for invoice creation

interface CrmInvoice {
  customer_id: string
  customer: string
  amount: number
  currency?: string
  line_items?: Array<{
    description: string
    quantity: number
    price: number
    total: number
    sku?: string
    type?: 'product' | 'service'
  }>
  status?: 'paid'
  date?: string
  payment_method?: string
  pos_sale_id?: string
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
      baseUrl: process.env.CRM_API_URL || '',
      apiKey: process.env.CRM_API_KEY || ''
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
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
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
        throw new Error('CRM service timeout - request took longer than 10 seconds')
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
    }>,
    paymentMethod: string,
    currency: string = 'USD'
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
        currency,
        status: 'paid', // POS sales are immediately paid
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        payment_method: paymentMethod,
        pos_sale_id: saleId,
        notes: `POS Sale #${saleId} - Payment: ${paymentMethod}`,
        line_items: items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          sku: item.sku,
          type: item.type
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
}

export const crmIntegration = new CrmIntegrationService()