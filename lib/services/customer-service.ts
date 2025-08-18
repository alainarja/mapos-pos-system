// Customer service for CRM integration and local customer management

import { Customer } from '@/types'

interface CrmCustomer {
  id: string
  name: string
  email: string
  phone: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  notes?: string
  created_at?: string
  updated_at?: string
  total_spent?: number
  visit_count?: number
  loyalty_points?: number
  tier?: string
}

interface CustomerSearchParams {
  search?: string
  email?: string
  phone?: string
  limit?: number
  offset?: number
}

interface CustomerCreateData {
  name: string
  email: string
  phone: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  notes?: string
}

class CustomerService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CRM_API_URL || process.env.CRM_API_URL || ''
    this.apiKey = process.env.NEXT_PUBLIC_CRM_API_KEY || process.env.CRM_API_KEY || ''
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('CRM service not configured - missing base URL or API key')
    }

    const url = `${this.baseUrl}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout
    
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
   * Check if CRM service is available
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey)
  }

  /**
   * Search customers in CRM system
   */
  async searchCustomers(params: CustomerSearchParams): Promise<{
    data: Customer[]
    pagination: {
      total: number
      page: number
      perPage: number
      totalPages: number
    }
  }> {
    try {
      if (!this.isConfigured()) {
        console.warn('CRM service not configured, returning empty results')
        return {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            perPage: params.limit || 20,
            totalPages: 0
          }
        }
      }

      const searchParams = new URLSearchParams()
      
      if (params.search) searchParams.append('search', params.search)
      if (params.email) searchParams.append('email', params.email)
      if (params.phone) searchParams.append('phone', params.phone)
      if (params.limit) searchParams.append('perPage', params.limit.toString())
      if (params.offset) searchParams.append('page', Math.floor(params.offset / (params.limit || 20)) + 1 + '')

      const result = await this.makeRequest<{
        data: CrmCustomer[]
        pagination: any
      }>(`/api/external/customers?${searchParams.toString()}`)

      // Convert CRM customers to our Customer format
      const customers: Customer[] = result.data.map(this.convertCrmCustomerToLocal)

      return {
        data: customers,
        pagination: result.pagination
      }
    } catch (error) {
      console.error('Customer search failed:', error)
      throw new Error('Failed to search customers: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Create new customer in CRM system
   */
  async createCustomer(customerData: CustomerCreateData): Promise<Customer> {
    try {
      if (!this.isConfigured()) {
        throw new Error('CRM service not configured - cannot create customer')
      }

      const crmCustomerData = {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        notes: customerData.notes
      }

      const result = await this.makeRequest<CrmCustomer>('/api/external/customers', {
        method: 'POST',
        body: JSON.stringify(crmCustomerData)
      })

      return this.convertCrmCustomerToLocal(result)
    } catch (error) {
      console.error('Customer creation failed:', error)
      throw new Error('Failed to create customer: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Get customer by ID from CRM system
   */
  async getCustomer(id: string): Promise<Customer | null> {
    try {
      if (!this.isConfigured()) {
        return null
      }

      const result = await this.makeRequest<CrmCustomer>(`/api/external/customers/${id}`)
      return this.convertCrmCustomerToLocal(result)
    } catch (error) {
      console.error('Customer fetch failed:', error)
      return null
    }
  }

  /**
   * Update customer in CRM system
   */
  async updateCustomer(id: string, updates: Partial<CustomerCreateData>): Promise<Customer> {
    try {
      if (!this.isConfigured()) {
        throw new Error('CRM service not configured - cannot update customer')
      }

      const result = await this.makeRequest<CrmCustomer>(`/api/external/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })

      return this.convertCrmCustomerToLocal(result)
    } catch (error) {
      console.error('Customer update failed:', error)
      throw new Error('Failed to update customer: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Convert CRM customer format to local Customer interface
   */
  private convertCrmCustomerToLocal(crmCustomer: CrmCustomer): Customer {
    return {
      id: crmCustomer.id,
      name: crmCustomer.name,
      email: crmCustomer.email,
      phone: crmCustomer.phone,
      loyaltyPoints: crmCustomer.loyalty_points || 0,
      storeCredit: 0, // CRM might not have this field
      tier: this.mapTierFromCrm(crmCustomer.tier),
      address: crmCustomer.address ? {
        street: crmCustomer.address.street || '',
        city: crmCustomer.address.city || '',
        state: crmCustomer.address.state || '',
        zipCode: crmCustomer.address.zipCode || '',
        country: crmCustomer.address.country || ''
      } : undefined,
      notes: crmCustomer.notes,
      isActive: true,
      createdAt: crmCustomer.created_at ? new Date(crmCustomer.created_at) : new Date(),
      lastVisit: undefined, // Would need to be calculated from transactions
      totalSpent: crmCustomer.total_spent || 0,
      visitCount: crmCustomer.visit_count || 0
    }
  }

  /**
   * Map CRM tier to local loyalty tier
   */
  private mapTierFromCrm(crmTier?: string): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (!crmTier) return 'bronze'
    
    const tier = crmTier.toLowerCase()
    if (['gold', 'silver', 'platinum'].includes(tier)) {
      return tier as 'gold' | 'silver' | 'platinum'
    }
    return 'bronze'
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate phone format (basic validation)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
    return phoneRegex.test(phone)
  }
}

export const customerService = new CustomerService()
export type { CustomerSearchParams, CustomerCreateData }