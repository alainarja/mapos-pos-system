// Service to handle authentication with maposusers service
export interface AuthConfig {
  baseUrl: string
  apiKey: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface PinCredentials {
  pin: string
  userId?: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  roleId: string
  isActive: boolean
  isVerified: boolean
  permissions: string[]
  modules: string[]
  authMethod: 'login' | 'pin'
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  success: boolean
  user: AuthUser
  tokens: AuthTokens
}

export interface AuthError {
  error: string
  details?: any
}

class MaposUsersAuthService {
  private config: AuthConfig

  constructor() {
    this.config = {
      baseUrl: process.env.MAPOS_USERS_API_URL || '',
      apiKey: process.env.MAPOS_USERS_API_KEY || ''
    }

    if (!this.config.baseUrl || !this.config.apiKey) {
      console.warn('MaposUsers auth service not properly configured. Using mock authentication.')
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.config.baseUrl)

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Authenticate user with email and password
   */
  async loginWithPassword(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      return this.mockLogin(credentials.email, credentials.password)
    }

    try {
      const response = await this.makeRequest<AuthResponse>('/api/external/pos-auth', {
        method: 'POST',
        body: JSON.stringify({
          type: 'login',
          email: credentials.email,
          password: credentials.password
        })
      })

      return response
    } catch (error) {
      console.error('Password login failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  /**
   * Authenticate user with PIN
   */
  async loginWithPin(credentials: PinCredentials): Promise<AuthResponse> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      return this.mockPinLogin(credentials.pin, credentials.userId)
    }

    try {
      const requestBody: any = {
        type: 'pin',
        pin: credentials.pin
      }

      if (credentials.userId) {
        requestBody.userId = credentials.userId
      }

      const response = await this.makeRequest<AuthResponse>('/api/external/pos-auth', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      return response
    } catch (error) {
      console.error('PIN login failed:', error)
      throw new Error(error instanceof Error ? error.message : 'PIN login failed')
    }
  }

  /**
   * Validate an existing token
   */
  async validateToken(token: string): Promise<boolean> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      // Mock validation - check if token looks valid
      return token.length > 20
    }

    try {
      await this.makeRequest('/api/external/pos-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      // Mock refresh
      return {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 8 * 60 * 60
      }
    }

    try {
      const response = await this.makeRequest<{ tokens: AuthTokens }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })

      return response.tokens
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed')
    }
  }

  /**
   * Get user information by token
   */
  async getUserInfo(token: string): Promise<AuthUser> {
    if (!this.config.baseUrl || !this.config.apiKey) {
      // Mock user info
      return {
        id: 'mock_user_id',
        email: 'mock@example.com',
        fullName: 'Mock User',
        roleId: 'pos_cashier',
        isActive: true,
        isVerified: true,
        permissions: ['pos.view', 'pos.basic', 'sales.view'],
        modules: ['POS', 'Sales'],
        authMethod: 'login'
      }
    }

    try {
      const response = await this.makeRequest<{ user: AuthUser }>('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return response.user
    } catch (error) {
      console.error('Get user info failed:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to get user info')
    }
  }

  /**
   * Mock authentication for development/testing
   */
  private async mockLogin(email: string, password: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

    // Mock users for testing
    const mockUsers: Record<string, AuthUser> = {
      'admin@pos.com': {
        id: 'mock_admin_id',
        email: 'admin@pos.com',
        fullName: 'POS Administrator',
        roleId: 'pos_manager',
        isActive: true,
        isVerified: true,
        permissions: ['*'],
        modules: ['POS', 'Sales', 'Inventory', 'CRM', 'Reports'],
        authMethod: 'login'
      },
      'manager@pos.com': {
        id: 'mock_manager_id',
        email: 'manager@pos.com',
        fullName: 'Store Manager',
        roleId: 'pos_manager',
        isActive: true,
        isVerified: true,
        permissions: ['pos.view', 'pos.edit', 'pos.admin', 'pos.reports', 'sales.view', 'sales.edit', 'inventory.view', 'crm.view'],
        modules: ['POS', 'Sales', 'Inventory', 'CRM'],
        authMethod: 'login'
      },
      'cashier@pos.com': {
        id: 'mock_cashier_id',
        email: 'cashier@pos.com',
        fullName: 'Store Cashier',
        roleId: 'pos_cashier',
        isActive: true,
        isVerified: true,
        permissions: ['pos.view', 'pos.basic', 'sales.view', 'inventory.view', 'crm.view'],
        modules: ['POS', 'Sales'],
        authMethod: 'login'
      }
    }

    // Simple validation
    if (password === 'admin' && mockUsers[email]) {
      return {
        success: true,
        user: mockUsers[email],
        tokens: {
          accessToken: 'mock_access_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 8 * 60 * 60
        }
      }
    }

    throw new Error('Invalid email or password')
  }

  /**
   * Mock PIN authentication for development/testing
   */
  private async mockPinLogin(pin: string, userId?: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay

    // Mock PIN mappings
    const pinMappings: Record<string, AuthUser> = {
      '1234': {
        id: 'mock_manager_id',
        email: 'manager@pos.com',
        fullName: 'Store Manager',
        roleId: 'pos_manager',
        isActive: true,
        isVerified: true,
        permissions: ['pos.view', 'pos.edit', 'pos.admin', 'pos.reports', 'sales.view', 'sales.edit', 'inventory.view', 'crm.view'],
        modules: ['POS', 'Sales', 'Inventory', 'CRM'],
        authMethod: 'pin'
      },
      '5678': {
        id: 'mock_cashier_id',
        email: 'cashier@pos.com',
        fullName: 'Store Cashier',
        roleId: 'pos_cashier',
        isActive: true,
        isVerified: true,
        permissions: ['pos.view', 'pos.basic', 'sales.view', 'inventory.view', 'crm.view'],
        modules: ['POS', 'Sales'],
        authMethod: 'pin'
      }
    }

    if (pinMappings[pin]) {
      return {
        success: true,
        user: pinMappings[pin],
        tokens: {
          accessToken: 'mock_pin_access_token_' + Date.now(),
          refreshToken: 'mock_pin_refresh_token_' + Date.now(),
          expiresIn: 8 * 60 * 60
        }
      }
    }

    throw new Error('Invalid PIN')
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.baseUrl && this.config.apiKey)
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus() {
    return {
      hasBaseUrl: !!this.config.baseUrl,
      hasApiKey: !!this.config.apiKey,
      baseUrl: this.config.baseUrl ? this.config.baseUrl.replace(/\/+$/, '') : 'Not configured',
      usingMockAuth: !this.isConfigured()
    }
  }
}

export const maposUsersAuth = new MaposUsersAuthService()