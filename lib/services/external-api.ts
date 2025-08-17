// Service to fetch data from external APIs (inventorymarble and maposcrm)

interface ExternalAPIConfig {
  baseUrl: string
  apiKey: string
}

interface PaginationParams {
  page?: number
  perPage?: number
  search?: string
}

interface APIResponse<T> {
  data: T[]
  pagination?: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

class ExternalAPIService {
  private inventoryConfig: ExternalAPIConfig
  private crmConfig: ExternalAPIConfig

  constructor() {
    this.inventoryConfig = {
      baseUrl: process.env.INVENTORY_API_URL || '',
      apiKey: process.env.INVENTORY_API_KEY || ''
    }
    
    this.crmConfig = {
      baseUrl: process.env.CRM_API_URL || '',
      apiKey: process.env.CRM_API_KEY || ''
    }
  }

  private async makeRequest<T>(
    config: ExternalAPIConfig, 
    endpoint: string, 
    params?: Record<string, string>
  ): Promise<APIResponse<T>> {
    const url = new URL(endpoint, config.baseUrl)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Inventory methods
  async getInventoryItems(params?: PaginationParams) {
    return this.makeRequest(
      this.inventoryConfig,
      '/api/external/inventory',
      {
        page: params?.page?.toString() || '1',
        perPage: params?.perPage?.toString() || '100',
        search: params?.search || ''
      }
    )
  }

  // Categories methods
  async getCategories(params?: { search?: string; includeHierarchy?: boolean; parentOnly?: boolean }) {
    return this.makeRequest(
      this.inventoryConfig,
      '/api/external/categories',
      {
        search: params?.search || '',
        includeHierarchy: params?.includeHierarchy ? 'true' : 'false',
        parentOnly: params?.parentOnly ? 'true' : 'false'
      }
    )
  }

  // Services methods
  async getServices(params?: PaginationParams) {
    return this.makeRequest(
      this.inventoryConfig,
      '/api/external/services',
      {
        page: params?.page?.toString() || '1',
        perPage: params?.perPage?.toString() || '100',
        search: params?.search || ''
      }
    )
  }

  // Inventory update methods
  async updateInventoryQuantity(sku: string, quantity: number, operation: string = 'set') {
    const response = await fetch(`${this.inventoryConfig.baseUrl}/api/external/inventory/${sku}/quantity`, {
      method: 'PATCH',
      headers: {
        'x-api-key': this.inventoryConfig.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity,
        operation
      })
    })

    if (!response.ok) {
      throw new Error(`Inventory update failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Customer methods  
  async getCustomers(params?: PaginationParams) {
    return this.makeRequest(
      this.crmConfig,
      '/api/external/customers',
      {
        page: params?.page?.toString() || '1',
        perPage: params?.perPage?.toString() || '100',
        search: params?.search || ''
      }
    )
  }
}

export const externalAPI = new ExternalAPIService()