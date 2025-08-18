// Company info service for inventory external API integration

export interface CompanyInfo {
  name: string
  businessName?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  business: {
    taxId?: string
    registrationNumber?: string
    industry?: string
    type?: 'LLC' | 'Corporation' | 'Partnership' | 'Sole Proprietorship'
  }
  branding: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    slogan?: string
  }
  settings: {
    timezone: string
    currency: string
    dateFormat: string
    receiptFooter?: string
    returnPolicy?: string
    warrantyInfo?: string
  }
  locations?: Array<{
    id: string
    name: string
    address: CompanyInfo['address']
    phone: string
    isMainLocation: boolean
  }>
}

interface InventoryApiResponse {
  company?: {
    name?: string
    business_name?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zip_code?: string
      country?: string
    }
    phone?: string
    email?: string
    website?: string
    tax_id?: string
    registration_number?: string
    industry?: string
    business_type?: string
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    slogan?: string
    timezone?: string
    currency?: string
    date_format?: string
    receipt_footer?: string
    return_policy?: string
    warranty_info?: string
  }
  locations?: Array<{
    id: string
    name: string
    address?: {
      street?: string
      city?: string
      state?: string
      zip_code?: string
      country?: string
    }
    phone?: string
    is_main_location?: boolean
  }>
}

class CompanyInfoService {
  private baseUrl: string
  private apiKey: string
  private cachedInfo: CompanyInfo | null = null
  private cacheTimeout: NodeJS.Timeout | null = null
  private cacheExpiration: number = 5 * 60 * 1000 // 5 minutes

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
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
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
        throw new Error(`Inventory API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Inventory API service timeout - request took longer than 15 seconds')
      }
      throw error
    }
  }

  /**
   * Check if inventory API service is available
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey)
  }

  /**
   * Get company information with caching
   */
  async getCompanyInfo(): Promise<CompanyInfo> {
    // Return cached data if available and not expired
    if (this.cachedInfo && this.cacheTimeout) {
      return this.cachedInfo
    }

    try {
      if (!this.isConfigured()) {
        console.warn('Inventory API service not configured, using default company info')
        return this.getDefaultCompanyInfo()
      }

      const response = await this.makeRequest<InventoryApiResponse>('/api/external/company-info')
      
      const companyInfo = this.convertApiResponseToCompanyInfo(response)
      
      // Cache the result
      this.cachedInfo = companyInfo
      
      // Clear existing timeout
      if (this.cacheTimeout) {
        clearTimeout(this.cacheTimeout)
      }
      
      // Set cache expiration
      this.cacheTimeout = setTimeout(() => {
        this.cachedInfo = null
        this.cacheTimeout = null
      }, this.cacheExpiration)
      
      return companyInfo
    } catch (error) {
      console.error('Failed to fetch company info from inventory API:', error)
      
      // Return cached data if available, otherwise return default
      if (this.cachedInfo) {
        console.warn('Using cached company info due to API error')
        return this.cachedInfo
      }
      
      console.warn('Using default company info due to API error')
      return this.getDefaultCompanyInfo()
    }
  }

  /**
   * Force refresh company info from API
   */
  async refreshCompanyInfo(): Promise<CompanyInfo> {
    // Clear cache
    this.cachedInfo = null
    if (this.cacheTimeout) {
      clearTimeout(this.cacheTimeout)
      this.cacheTimeout = null
    }
    
    return this.getCompanyInfo()
  }

  /**
   * Get store locations
   */
  async getStoreLocations(): Promise<CompanyInfo['locations']> {
    const companyInfo = await this.getCompanyInfo()
    return companyInfo.locations || []
  }

  /**
   * Get main store location
   */
  async getMainLocation(): Promise<CompanyInfo['locations'][0] | null> {
    const locations = await this.getStoreLocations()
    return locations.find(loc => loc.isMainLocation) || locations[0] || null
  }

  /**
   * Convert API response to CompanyInfo format
   */
  private convertApiResponseToCompanyInfo(response: InventoryApiResponse): CompanyInfo {
    const company = response.company

    return {
      name: company?.name || company?.business_name || 'MAPOS',
      businessName: company?.business_name,
      address: {
        street: company?.address?.street || '123 Main Street',
        city: company?.address?.city || 'Your City',
        state: company?.address?.state || 'State',
        zipCode: company?.address?.zip_code || '12345',
        country: company?.address?.country || 'US'
      },
      contact: {
        phone: company?.phone || '(555) 123-4567',
        email: company?.email || 'info@yourstore.com',
        website: company?.website
      },
      business: {
        taxId: company?.tax_id,
        registrationNumber: company?.registration_number,
        industry: company?.industry,
        type: this.mapBusinessType(company?.business_type)
      },
      branding: {
        logo: company?.logo_url,
        primaryColor: company?.primary_color || '#8b5cf6',
        secondaryColor: company?.secondary_color || '#06b6d4',
        slogan: company?.slogan
      },
      settings: {
        timezone: company?.timezone || 'America/New_York',
        currency: company?.currency || 'USD',
        dateFormat: company?.date_format || 'MM/dd/yyyy',
        receiptFooter: company?.receipt_footer || 'Thank you for your business!',
        returnPolicy: company?.return_policy || 'Return policy: 30 days with receipt',
        warrantyInfo: company?.warranty_info
      },
      locations: response.locations?.map(location => ({
        id: location.id,
        name: location.name,
        address: {
          street: location.address?.street || '',
          city: location.address?.city || '',
          state: location.address?.state || '',
          zipCode: location.address?.zip_code || '',
          country: location.address?.country || 'US'
        },
        phone: location.phone || '',
        isMainLocation: location.is_main_location || false
      }))
    }
  }

  /**
   * Map API business type to our enum
   */
  private mapBusinessType(apiType?: string): CompanyInfo['business']['type'] {
    if (!apiType) return undefined
    
    const type = apiType.toLowerCase()
    if (type.includes('llc')) return 'LLC'
    if (type.includes('corp') || type.includes('inc')) return 'Corporation'
    if (type.includes('partnership')) return 'Partnership'
    if (type.includes('sole') || type.includes('proprietorship')) return 'Sole Proprietorship'
    
    return undefined
  }

  /**
   * Get default company info when API is unavailable
   */
  private getDefaultCompanyInfo(): CompanyInfo {
    return {
      name: 'MAPOS',
      businessName: 'MAPOS Point of Sale System',
      address: {
        street: '123 Main Street',
        city: 'Your City',
        state: 'State',
        zipCode: '12345',
        country: 'US'
      },
      contact: {
        phone: '(555) 123-4567',
        email: 'info@yourstore.com'
      },
      business: {
        type: 'LLC'
      },
      branding: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#06b6d4'
      },
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        receiptFooter: 'Thank you for your business!\nPlease keep your receipt\nReturn policy: 30 days with receipt',
        returnPolicy: 'Return policy: 30 days with receipt'
      }
    }
  }

  /**
   * Format address for printing
   */
  static formatAddress(address: CompanyInfo['address']): string {
    const parts = [
      address.street,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country !== 'US' ? address.country : null
    ].filter(Boolean)
    
    return parts.join('\n')
  }

  /**
   * Format phone number for display
   */
  static formatPhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    
    // Return original format if not standard US number
    return phone
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cachedInfo = null
    if (this.cacheTimeout) {
      clearTimeout(this.cacheTimeout)
      this.cacheTimeout = null
    }
  }
}

export const companyInfoService = new CompanyInfoService()
export type { InventoryApiResponse }