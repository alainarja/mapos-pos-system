import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Coupon, AppliedCoupon, CartItem } from '@/types'

interface CouponState {
  coupons: Coupon[]
  
  // Actions
  getCouponByCode: (code: string) => Coupon | null
  validateCoupon: (code: string, cartItems: CartItem[], cartTotal: number, appliedCoupons: AppliedCoupon[]) => {
    valid: boolean
    error?: string
    coupon?: Coupon
  }
  calculateCouponDiscount: (coupon: Coupon, cartItems: CartItem[], cartTotal: number) => {
    discountAmount: number
    applicableItems?: string[]
    freeItems?: CartItem[]
  }
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => void
  updateCoupon: (id: string, updates: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  incrementUsage: (id: string) => void
  resetCoupons: () => void
}

const generateId = () => `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const defaultCoupons: Coupon[] = [
  // Percentage Discounts
  {
    id: 'SAVE10',
    code: 'SAVE10',
    name: '10% Off Everything',
    description: 'Get 10% off your entire purchase',
    type: 'percentage',
    value: 10,
    minimumPurchase: 0,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'SAVE20',
    code: 'SAVE20',
    name: '20% Off $50+',
    description: 'Get 20% off when you spend $50 or more',
    type: 'percentage',
    value: 20,
    minimumPurchase: 50,
    maximumDiscount: 100,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'VIP25',
    code: 'VIP25',
    name: 'VIP 25% Discount',
    description: '25% off for VIP customers (minimum $100)',
    type: 'percentage',
    value: 25,
    minimumPurchase: 100,
    maximumDiscount: 200,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageLimit: 100,
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Fixed Amount Discounts
  {
    id: '5OFF',
    code: '5OFF',
    name: '$5 Off Any Purchase',
    description: 'Get $5 off your purchase',
    type: 'fixed',
    value: 5,
    minimumPurchase: 0,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: true,
    stackingRules: {
      allowWithOtherCoupons: true,
      allowWithDiscounts: true,
      maxStackingValue: 50
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '10OFF25',
    code: '10OFF25',
    name: '$10 Off $25+',
    description: 'Get $10 off when you spend $25 or more',
    type: 'fixed',
    value: 10,
    minimumPurchase: 25,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'WELCOME15',
    code: 'WELCOME15',
    name: 'New Customer $15 Off',
    description: 'Welcome! Get $15 off your first order of $50+',
    type: 'fixed',
    value: 15,
    minimumPurchase: 50,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageLimit: 1000,
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Buy X Get Y Free
  {
    id: 'BUY2GET1',
    code: 'BUY2GET1',
    name: 'Buy 2 Get 1 Free',
    description: 'Buy 2 drinks, get 1 free',
    type: 'buy_x_get_y',
    value: 0,
    buyQuantity: 2,
    getQuantity: 1,
    applicableCategories: ['Beverages'],
    freeItemCategories: ['Beverages'],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: true,
    stackingRules: {
      allowWithOtherCoupons: true,
      allowWithDiscounts: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'BUY3GET2',
    code: 'BUY3GET2',
    name: 'Buy 3 Get 2 Free Snacks',
    description: 'Buy 3 snacks, get 2 free',
    type: 'buy_x_get_y',
    value: 0,
    buyQuantity: 3,
    getQuantity: 2,
    applicableCategories: ['Snacks'],
    freeItemCategories: ['Snacks'],
    minimumPurchase: 20,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Category-Specific Discounts
  {
    id: 'SNACKS15',
    code: 'SNACKS15',
    name: '15% Off All Snacks',
    description: 'Get 15% off all snack items',
    type: 'category_discount',
    value: 15,
    applicableCategories: ['Snacks'],
    minimumPurchase: 0,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: true,
    stackingRules: {
      allowWithOtherCoupons: true,
      allowWithDiscounts: true,
      maxStackingValue: 30
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'DRINKS20',
    code: 'DRINKS20',
    name: '20% Off Beverages',
    description: 'Get 20% off all beverage items',
    type: 'category_discount',
    value: 20,
    applicableCategories: ['Beverages'],
    minimumPurchase: 10,
    maximumDiscount: 25,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Limited Time / Special Offers
  {
    id: 'FLASH30',
    code: 'FLASH30',
    name: 'Flash Sale 30% Off',
    description: 'Limited time: 30% off everything (max $50 discount)',
    type: 'percentage',
    value: 30,
    maximumDiscount: 50,
    minimumPurchase: 30,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    usageLimit: 500,
    usageCount: 0,
    isActive: true,
    canStack: false,
    stackingRules: {
      allowWithOtherCoupons: false,
      allowWithDiscounts: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'WEEKEND',
    code: 'WEEKEND',
    name: 'Weekend Special',
    description: '$7 off weekend purchases over $35',
    type: 'fixed',
    value: 7,
    minimumPurchase: 35,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    usageCount: 0,
    isActive: true,
    canStack: true,
    stackingRules: {
      allowWithOtherCoupons: true,
      allowWithDiscounts: true,
      maxStackingValue: 40
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: defaultCoupons,

      getCouponByCode: (code: string) => {
        const { coupons } = get()
        return coupons.find(coupon => 
          coupon.code.toLowerCase() === code.toLowerCase() && coupon.isActive
        ) || null
      },

      validateCoupon: (code: string, cartItems: CartItem[], cartTotal: number, appliedCoupons: AppliedCoupon[]) => {
        const { getCouponByCode } = get()
        const coupon = getCouponByCode(code)

        if (!coupon) {
          return { valid: false, error: 'Coupon code not found' }
        }

        // Check if coupon is active
        if (!coupon.isActive) {
          return { valid: false, error: 'This coupon is no longer active' }
        }

        // Check date validity
        const now = new Date()
        if (now < coupon.startDate || now > coupon.endDate) {
          return { valid: false, error: 'This coupon has expired or is not yet valid' }
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return { valid: false, error: 'This coupon has reached its usage limit' }
        }

        // Check if already applied
        const isAlreadyApplied = appliedCoupons.some(ac => ac.coupon.id === coupon.id)
        if (isAlreadyApplied) {
          return { valid: false, error: 'This coupon is already applied' }
        }

        // Check minimum purchase requirement
        if (coupon.minimumPurchase && cartTotal < coupon.minimumPurchase) {
          return { 
            valid: false, 
            error: `Minimum purchase of $${coupon.minimumPurchase.toFixed(2)} required` 
          }
        }

        // Check stacking rules
        if (appliedCoupons.length > 0 && !coupon.canStack) {
          return { valid: false, error: 'This coupon cannot be combined with other offers' }
        }

        // Check if other coupons allow stacking with this one
        const hasNonStackableCoupons = appliedCoupons.some(ac => 
          !ac.coupon.canStack || 
          !ac.coupon.stackingRules?.allowWithOtherCoupons
        )
        if (hasNonStackableCoupons && appliedCoupons.length > 0) {
          return { valid: false, error: 'Cannot combine with currently applied coupons' }
        }

        // Check category-specific requirements for buy X get Y and category discounts
        if ((coupon.type === 'buy_x_get_y' || coupon.type === 'category_discount') && coupon.applicableCategories) {
          const applicableItems = cartItems.filter(item => 
            coupon.applicableCategories!.includes(item.category || '')
          )
          
          if (applicableItems.length === 0) {
            return { 
              valid: false, 
              error: `This coupon only applies to ${coupon.applicableCategories.join(', ')} items` 
            }
          }

          // For buy X get Y, check if we have enough qualifying items
          if (coupon.type === 'buy_x_get_y' && coupon.buyQuantity) {
            const totalQualifyingQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0)
            if (totalQualifyingQuantity < coupon.buyQuantity) {
              return { 
                valid: false, 
                error: `Need at least ${coupon.buyQuantity} qualifying items` 
              }
            }
          }
        }

        return { valid: true, coupon }
      },

      calculateCouponDiscount: (coupon: Coupon, cartItems: CartItem[], cartTotal: number) => {
        let discountAmount = 0
        let applicableItems: string[] = []
        let freeItems: CartItem[] = []

        switch (coupon.type) {
          case 'percentage':
            discountAmount = cartTotal * (coupon.value / 100)
            if (coupon.maximumDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maximumDiscount)
            }
            applicableItems = cartItems.map(item => item.id)
            break

          case 'fixed':
            discountAmount = Math.min(coupon.value, cartTotal)
            applicableItems = cartItems.map(item => item.id)
            break

          case 'category_discount':
            if (coupon.applicableCategories) {
              const categoryItems = cartItems.filter(item => 
                coupon.applicableCategories!.includes(item.category || '')
              )
              const categoryTotal = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
              discountAmount = categoryTotal * (coupon.value / 100)
              if (coupon.maximumDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maximumDiscount)
              }
              applicableItems = categoryItems.map(item => item.id)
            }
            break

          case 'buy_x_get_y':
            if (coupon.applicableCategories && coupon.buyQuantity && coupon.getQuantity) {
              const qualifyingItems = cartItems.filter(item => 
                coupon.applicableCategories!.includes(item.category || '')
              )
              
              // Sort by price (ascending) to give away cheapest items
              const sortedItems = [...qualifyingItems].sort((a, b) => a.price - b.price)
              
              let totalQualifyingQuantity = qualifyingItems.reduce((sum, item) => sum + item.quantity, 0)
              const setsEligible = Math.floor(totalQualifyingQuantity / coupon.buyQuantity)
              const freeItemsToGive = setsEligible * coupon.getQuantity
              
              let freeItemsGiven = 0
              for (const item of sortedItems) {
                if (freeItemsGiven >= freeItemsToGive) break
                
                const itemsToMakeFree = Math.min(item.quantity, freeItemsToGive - freeItemsGiven)
                if (itemsToMakeFree > 0) {
                  freeItems.push({
                    ...item,
                    quantity: itemsToMakeFree
                  })
                  discountAmount += item.price * itemsToMakeFree
                  freeItemsGiven += itemsToMakeFree
                }
              }
              
              applicableItems = qualifyingItems.map(item => item.id)
            }
            break
        }

        return { discountAmount, applicableItems, freeItems }
      },

      addCoupon: (couponData) => {
        const { coupons } = get()
        const newCoupon: Coupon = {
          ...couponData,
          id: generateId(),
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set({ coupons: [...coupons, newCoupon] })
      },

      updateCoupon: (id: string, updates: Partial<Coupon>) => {
        const { coupons } = get()
        set({
          coupons: coupons.map(coupon =>
            coupon.id === id
              ? { ...coupon, ...updates, updatedAt: new Date() }
              : coupon
          )
        })
      },

      deleteCoupon: (id: string) => {
        const { coupons } = get()
        set({ coupons: coupons.filter(coupon => coupon.id !== id) })
      },

      incrementUsage: (id: string) => {
        const { coupons } = get()
        set({
          coupons: coupons.map(coupon =>
            coupon.id === id
              ? { ...coupon, usageCount: coupon.usageCount + 1, updatedAt: new Date() }
              : coupon
          )
        })
      },

      resetCoupons: () => {
        set({ coupons: defaultCoupons })
      }
    }),
    {
      name: 'coupon-storage',
      partialize: (state) => ({
        coupons: state.coupons
      })
    }
  )
)