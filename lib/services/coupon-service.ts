// Coupon Service - Integration with Inventory Marble API
const API_KEY = 'kdlsgnardongsergsdgdrgewa'
const BASE_URL = 'https://inventorymarble.vercel.app/api/external'

export interface Coupon {
  id: string
  code: string
  description: string
  discount_type: 'percent' | 'amount'
  discount_value: number
  minimum_purchase: number
  usage_limit: number | null
  usage_count: number
  remaining_uses: number | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
}

export interface CouponValidationResponse {
  valid: boolean
  data?: {
    code: string
    discount_type: 'percent' | 'amount'
    discount_value: number
    discount_amount: number
    minimum_purchase: number
  }
  error?: string
}

export interface CouponApplicationResponse {
  success: boolean
  data?: {
    code: string
    usage_count: number
    remaining_uses: number | null
  }
  error?: string
}

class CouponService {
  private headers = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json'
  }

  async getAllCoupons(): Promise<Coupon[]> {
    try {
      const response = await fetch(`${BASE_URL}/coupons`, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch coupons: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching coupons:', error)
      return []
    }
  }

  async validateCoupon(code: string, purchaseAmount?: number): Promise<CouponValidationResponse> {
    try {
      const response = await fetch(`${BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          code: code.toUpperCase(),
          purchase_amount: purchaseAmount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          valid: false,
          error: data.error || `Validation failed: ${response.statusText}`
        }
      }

      return data
    } catch (error) {
      console.error('Error validating coupon:', error)
      return {
        valid: false,
        error: 'Failed to validate coupon. Please try again.'
      }
    }
  }

  async applyCoupon(
    code: string, 
    purchaseAmount?: number, 
    orderId?: string,
    metadata?: Record<string, any>
  ): Promise<CouponApplicationResponse> {
    try {
      const response = await fetch(`${BASE_URL}/coupons/apply`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          code: code.toUpperCase(),
          purchase_amount: purchaseAmount,
          order_id: orderId,
          metadata
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Application failed: ${response.statusText}`
        }
      }

      return data
    } catch (error) {
      console.error('Error applying coupon:', error)
      return {
        success: false,
        error: 'Failed to apply coupon. Please try again.'
      }
    }
  }

  calculateDiscountAmount(
    subtotal: number,
    discountType: 'percent' | 'amount',
    discountValue: number
  ): number {
    if (discountType === 'percent') {
      return subtotal * (discountValue / 100)
    } else {
      // Fixed amount discount - cannot exceed subtotal
      return Math.min(discountValue, subtotal)
    }
  }

  formatCouponCode(code: string): string {
    return code.toUpperCase().trim()
  }

  isValidCouponFormat(code: string): boolean {
    // Basic validation - at least 3 characters, alphanumeric
    const formatted = this.formatCouponCode(code)
    return formatted.length >= 3 && /^[A-Z0-9]+$/.test(formatted)
  }
}

// Export singleton instance
export const couponService = new CouponService()