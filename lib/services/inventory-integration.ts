// Service for integrating with external inventory API for stock management

interface InventoryTransaction {
  item_id: string
  quantity: number
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer'
  reference_type: 'pos_sale' | 'manual' | 'transfer' | 'restock'
  reference_id: string
  notes?: string
  location_id?: string
  user_id?: string
}

interface StockUpdateResult {
  success: boolean
  item_id: string
  previous_quantity?: number
  new_quantity?: number
  error?: string
}

interface InventoryIntegrationConfig {
  baseUrl: string
  apiKey: string
}

class InventoryIntegrationService {
  private config: InventoryIntegrationConfig

  constructor() {
    this.config = {
      baseUrl: process.env.INVENTORY_API_URL || '',
      apiKey: process.env.INVENTORY_API_KEY || ''
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if inventory service is configured
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new Error('Inventory service not configured - missing base URL or API key')
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
        throw new Error(`Inventory API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Inventory service timeout - request took longer than 10 seconds')
      }
      throw error
    }
  }

  /**
   * Create an inventory transaction record
   */
  async createTransaction(transaction: InventoryTransaction): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
    try {
      const result = await this.makeRequest('/api/external/inventory/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction)
      })
      
      return {
        success: true,
        transaction_id: (result as any).id || (result as any).transaction_id
      }
    } catch (error) {
      console.error('Failed to create inventory transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update stock quantity for an item
   */
  async updateStock(itemId: string, quantityChange: number, warehouseId?: string): Promise<StockUpdateResult> {
    try {
      const requestBody = {
        quantity_change: quantityChange,
        location_id: warehouseId,
        operation: 'deduct' // or 'add' for positive changes
      }

      const result = await this.makeRequest(`/api/external/inventory/${itemId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify(requestBody)
      })

      return {
        success: true,
        item_id: itemId,
        previous_quantity: (result as any).previous_quantity,
        new_quantity: (result as any).new_quantity
      }
    } catch (error) {
      console.error(`Failed to update stock for item ${itemId}:`, error)
      return {
        success: false,
        item_id: itemId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process a complete sale transaction with inventory updates
   */
  async processSaleTransaction(
    saleId: string,
    items: Array<{ id: string; quantity: number; type: 'product' | 'service' }>,
    warehouseId?: string,
    userId?: string
  ): Promise<{ 
    success: boolean; 
    transactions: Array<{ item_id: string; transaction_id?: string; success: boolean; error?: string }>; 
    stockUpdates: StockUpdateResult[];
    summary: { total_items: number; successful_updates: number; failed_updates: number }
    inventoryServiceAvailable: boolean;
  }> {
    const transactions = []
    const stockUpdates = []
    let successfulUpdates = 0
    let failedUpdates = 0
    let inventoryServiceAvailable = true

    // Check if inventory service is available first
    if (!this.config.baseUrl || !this.config.apiKey) {
      console.warn('Inventory service not configured - skipping inventory updates')
      inventoryServiceAvailable = false
      
      // Mark all products as failed but don't prevent sale
      const productItems = items.filter(item => item.type === 'product')
      productItems.forEach(item => {
        transactions.push({
          item_id: item.id,
          success: false,
          error: 'Inventory service not configured'
        })
        stockUpdates.push({
          success: false,
          item_id: item.id,
          error: 'Inventory service not configured'
        })
      })
      
      return {
        success: false, // Inventory updates failed but sale can continue
        transactions,
        stockUpdates,
        summary: {
          total_items: productItems.length,
          successful_updates: 0,
          failed_updates: productItems.length
        },
        inventoryServiceAvailable: false
      }
    }

    // Process each item
    for (const item of items) {
      // Skip services as they don't affect inventory
      if (item.type === 'service') {
        continue
      }

      try {
        // Create inventory transaction record with shorter timeout
        const transaction: InventoryTransaction = {
          item_id: item.id,
          quantity: item.quantity,
          type: 'sale',
          reference_type: 'pos_sale',
          reference_id: saleId,
          notes: `POS Sale #${saleId} - Quantity: ${item.quantity}`,
          location_id: warehouseId,
          user_id: userId
        }

        const transactionResult = await this.createTransaction(transaction)
        transactions.push({
          item_id: item.id,
          transaction_id: transactionResult.transaction_id,
          success: transactionResult.success,
          error: transactionResult.error
        })

        // Update stock if transaction was successful
        if (transactionResult.success) {
          const stockResult = await this.updateStock(item.id, -item.quantity, warehouseId)
          stockUpdates.push(stockResult)
          
          if (stockResult.success) {
            successfulUpdates++
          } else {
            failedUpdates++
          }
        } else {
          failedUpdates++
          stockUpdates.push({
            success: false,
            item_id: item.id,
            error: transactionResult.error || 'Transaction creation failed'
          })
        }

      } catch (error) {
        console.error(`Failed to process inventory for item ${item.id}:`, error)
        
        // Check if this is a service availability issue
        if (error instanceof Error && (
          error.message.includes('timeout') || 
          error.message.includes('not configured') ||
          error.message.includes('Connection failed') ||
          error.message.includes('read-only') ||
          error.message.includes('Method Not Allowed')
        )) {
          inventoryServiceAvailable = false
        }
        
        failedUpdates++
        transactions.push({
          item_id: item.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        stockUpdates.push({
          success: false,
          item_id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const totalProductItems = items.filter(item => item.type === 'product').length

    return {
      success: failedUpdates === 0,
      transactions,
      stockUpdates,
      summary: {
        total_items: totalProductItems,
        successful_updates: successfulUpdates,
        failed_updates: failedUpdates
      },
      inventoryServiceAvailable
    }
  }

  /**
   * Get current stock level for an item
   */
  async getStockLevel(itemId: string, warehouseId?: string): Promise<{ success: boolean; quantity?: number; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (warehouseId) {
        params.append('location_id', warehouseId)
      }

      const queryString = params.toString()
      const endpoint = `/api/external/inventory/${itemId}${queryString ? `?${queryString}` : ''}`
      
      const result = await this.makeRequest(endpoint, {
        method: 'GET'
      })

      return {
        success: true,
        quantity: (result as any).current_quantity || (result as any).quantity || 0
      }
    } catch (error) {
      console.error(`Failed to get stock level for item ${itemId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if the inventory service is available
   */
  async checkConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest('/api/external/inventory/health', {
        method: 'GET'
      })
      
      return { success: true }
    } catch (error) {
      console.error('Inventory service connection check failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }
}

export const inventoryIntegration = new InventoryIntegrationService()