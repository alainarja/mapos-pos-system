// Store/Warehouse identification service for POS location tracking

export interface StoreLocation {
  id: string
  name: string
  code: string // Short code for the store (e.g., "NYC-01", "LA-MAIN")
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    phone: string
    email?: string
    manager?: string
  }
  settings: {
    timezone: string
    currency: string
    taxRate?: number
    isMainLocation: boolean
    isActive: boolean
  }
  warehouse?: {
    warehouseId: string
    warehouseName: string
    inventoryManaged: boolean
  }
  pos: {
    terminalId?: string
    deviceId?: string
    registerId?: string
  }
}

interface InventoryApiStoreResponse {
  stores?: Array<{
    id: string
    name: string
    code?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zip_code?: string
      country?: string
    }
    phone?: string
    email?: string
    manager_name?: string
    timezone?: string
    currency?: string
    tax_rate?: number
    is_main_location?: boolean
    is_active?: boolean
    warehouse_id?: string
    warehouse_name?: string
    inventory_managed?: boolean
  }>
  current_store?: {
    id: string
    name: string
    code?: string
  }
}

class StoreIdentificationService {
  private baseUrl: string
  private apiKey: string
  private cachedStores: StoreLocation[] = []
  private currentStore: StoreLocation | null = null
  private cacheTimeout: NodeJS.Timeout | null = null
  private cacheExpiration: number = 10 * 60 * 1000 // 10 minutes

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL || process.env.INVENTORY_API_URL || ''
    this.apiKey = process.env.NEXT_PUBLIC_INVENTORY_API_KEY || process.env.INVENTORY_API_KEY || ''
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('Inventory API service not configured - missing base URL or API key')
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Store API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Store API timeout - request took longer than 15 seconds')
      }
      throw error
    }
  }

  /**
   * Check if store identification service is available
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey)
  }

  /**
   * Get all available stores
   */
  async getStores(): Promise<StoreLocation[]> {
    // Return cached data if available and not expired
    if (this.cachedStores.length > 0 && this.cacheTimeout) {
      return this.cachedStores
    }

    try {
      if (!this.isConfigured()) {
        console.warn('Store API service not configured, using default store')
        return [this.getDefaultStore()]
      }

      const response = await this.makeRequest<InventoryApiStoreResponse>('/api/external/stores')
      
      const stores = response.stores?.map(this.convertApiStoreToStoreLocation) || [this.getDefaultStore()]
      
      // Cache the result
      this.cachedStores = stores
      
      // Clear existing timeout
      if (this.cacheTimeout) {
        clearTimeout(this.cacheTimeout)
      }
      
      // Set cache expiration
      this.cacheTimeout = setTimeout(() => {
        this.cachedStores = []
        this.cacheTimeout = null
      }, this.cacheExpiration)
      
      return stores
    } catch (error) {
      console.error('Failed to fetch stores from API:', error)
      
      // Return cached data if available, otherwise return default
      if (this.cachedStores.length > 0) {
        console.warn('Using cached store data due to API error')
        return this.cachedStores
      }
      
      console.warn('Using default store due to API error')
      return [this.getDefaultStore()]
    }
  }

  /**
   * Get current store/POS location
   */
  async getCurrentStore(): Promise<StoreLocation> {
    if (this.currentStore) {
      return this.currentStore
    }

    try {
      if (!this.isConfigured()) {
        this.currentStore = this.getDefaultStore()
        return this.currentStore
      }

      const response = await this.makeRequest<InventoryApiStoreResponse>('/api/external/stores/current')
      
      if (response.current_store) {
        // Find the full store data
        const stores = await this.getStores()
        const current = stores.find(store => store.id === response.current_store!.id)
        
        if (current) {
          this.currentStore = current
          return current
        }
      }

      // Fallback to first store or default
      const stores = await this.getStores()
      this.currentStore = stores[0] || this.getDefaultStore()
      return this.currentStore
    } catch (error) {
      console.error('Failed to get current store:', error)
      
      if (this.currentStore) {
        return this.currentStore
      }

      this.currentStore = this.getDefaultStore()
      return this.currentStore
    }
  }

  /**
   * Set current store by ID
   */
  async setCurrentStore(storeId: string): Promise<StoreLocation> {
    try {
      if (this.isConfigured()) {
        // Notify API of store change
        await this.makeRequest('/api/external/stores/current', {
          method: 'PUT',
          body: JSON.stringify({ store_id: storeId })
        })
      }

      const stores = await this.getStores()
      const store = stores.find(s => s.id === storeId)
      
      if (!store) {
        throw new Error(`Store with ID ${storeId} not found`)
      }

      this.currentStore = store
      
      // Store in localStorage for persistence
      localStorage.setItem('current-store-id', storeId)
      
      return store
    } catch (error) {
      console.error('Failed to set current store:', error)
      throw error
    }
  }

  /**
   * Get store by ID
   */
  async getStoreById(storeId: string): Promise<StoreLocation | null> {
    const stores = await this.getStores()
    return stores.find(store => store.id === storeId) || null
  }

  /**
   * Refresh stores from API
   */
  async refreshStores(): Promise<StoreLocation[]> {
    // Clear cache
    this.cachedStores = []
    this.currentStore = null
    if (this.cacheTimeout) {
      clearTimeout(this.cacheTimeout)
      this.cacheTimeout = null
    }
    
    return this.getStores()
  }

  /**
   * Initialize store identification - try to restore from localStorage
   */
  async initialize(): Promise<StoreLocation> {
    try {
      // Try to restore from localStorage
      const savedStoreId = localStorage.getItem('current-store-id')
      
      if (savedStoreId) {
        const store = await this.getStoreById(savedStoreId)
        if (store) {
          this.currentStore = store
          return store
        }
      }

      // Fall back to getting current store from API
      return await this.getCurrentStore()
    } catch (error) {
      console.error('Failed to initialize store identification:', error)
      this.currentStore = this.getDefaultStore()
      return this.currentStore
    }
  }

  /**
   * Convert API store format to StoreLocation
   */
  private convertApiStoreToStoreLocation(apiStore: any): StoreLocation {
    return {
      id: apiStore.id,
      name: apiStore.name,
      code: apiStore.code || this.generateStoreCode(apiStore.name),
      address: {
        street: apiStore.address?.street || '',
        city: apiStore.address?.city || '',
        state: apiStore.address?.state || '',
        zipCode: apiStore.address?.zip_code || '',
        country: apiStore.address?.country || 'US'
      },
      contact: {
        phone: apiStore.phone || '',
        email: apiStore.email,
        manager: apiStore.manager_name
      },
      settings: {
        timezone: apiStore.timezone || 'America/New_York',
        currency: apiStore.currency || 'USD',
        taxRate: apiStore.tax_rate,
        isMainLocation: apiStore.is_main_location || false,
        isActive: apiStore.is_active !== false
      },
      warehouse: apiStore.warehouse_id ? {
        warehouseId: apiStore.warehouse_id,
        warehouseName: apiStore.warehouse_name || 'Main Warehouse',
        inventoryManaged: apiStore.inventory_managed !== false
      } : undefined,
      pos: {
        terminalId: this.generateTerminalId(),
        deviceId: this.getDeviceId(),
        registerId: apiStore.code || this.generateStoreCode(apiStore.name)
      }
    }
  }

  /**
   * Generate a store code if not provided
   */
  private generateStoreCode(storeName: string): string {
    return storeName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6) || 'STORE1'
  }

  /**
   * Generate a terminal ID
   */
  private generateTerminalId(): string {
    const stored = localStorage.getItem('terminal-id')
    if (stored) return stored

    const terminalId = `T${Date.now().toString().slice(-6)}`
    localStorage.setItem('terminal-id', terminalId)
    return terminalId
  }

  /**
   * Get device ID (browser fingerprint)
   */
  private getDeviceId(): string {
    const stored = localStorage.getItem('device-id')
    if (stored) return stored

    // Simple device fingerprint
    const deviceId = btoa(
      navigator.userAgent + 
      navigator.language + 
      screen.width + 
      screen.height + 
      new Date().getTimezoneOffset()
    ).replace(/[^A-Za-z0-9]/g, '').substring(0, 16)
    
    localStorage.setItem('device-id', deviceId)
    return deviceId
  }

  /**
   * Get default store when API is unavailable
   */
  private getDefaultStore(): StoreLocation {
    return {
      id: 'default-store',
      name: 'Main Store',
      code: 'MAIN01',
      address: {
        street: '123 Main Street',
        city: 'Your City',
        state: 'State',
        zipCode: '12345',
        country: 'US'
      },
      contact: {
        phone: '(555) 123-4567'
      },
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        isMainLocation: true,
        isActive: true
      },
      warehouse: {
        warehouseId: 'default-warehouse',
        warehouseName: 'Main Warehouse',
        inventoryManaged: true
      },
      pos: {
        terminalId: this.generateTerminalId(),
        deviceId: this.getDeviceId(),
        registerId: 'MAIN01'
      }
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cachedStores = []
    this.currentStore = null
    if (this.cacheTimeout) {
      clearTimeout(this.cacheTimeout)
      this.cacheTimeout = null
    }
  }

  /**
   * Format store for display
   */
  static formatStoreForDisplay(store: StoreLocation): string {
    return `${store.name} (${store.code})`
  }

  /**
   * Get transaction metadata for store
   */
  getTransactionMetadata(store: StoreLocation) {
    return {
      storeId: store.id,
      storeName: store.name,
      storeCode: store.code,
      warehouseId: store.warehouse?.warehouseId,
      warehouseName: store.warehouse?.warehouseName,
      terminalId: store.pos.terminalId,
      deviceId: store.pos.deviceId,
      registerId: store.pos.registerId,
      location: {
        address: store.address,
        timezone: store.settings.timezone
      }
    }
  }
}

export const storeIdentificationService = new StoreIdentificationService()
export type { InventoryApiStoreResponse }