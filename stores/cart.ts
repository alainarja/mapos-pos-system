import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, Customer, HeldCart, AppliedCoupon, SavedCart, CartSaveOptions } from '@/types'

interface DiscountInfo {
  type: 'percentage' | 'fixed'
  value: number
  reason?: string
  managerId?: string
  timestamp: Date
}

interface CartState {
  items: CartItem[]
  selectedCustomer: Customer | null
  discount: number
  discountInfo: DiscountInfo | null
  appliedCoupons: AppliedCoupon[]
  couponValidationError: string | null
  subtotal: number
  tax: number
  total: number
  totalSavings: number
  
  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  applyDiscount: (discount: number) => void
  applyAdvancedDiscount: (discountInfo: DiscountInfo) => void
  applyItemDiscount: (itemId: string, discount: number, type: 'percentage' | 'fixed') => void
  removeDiscount: () => void
  removeItemDiscount: (itemId: string) => void
  applyCoupon: (couponCode: string) => Promise<boolean>
  removeCoupon: (couponId: string) => void
  clearCoupons: () => void
  selectCustomer: (customer: Customer | null) => void
  clearCart: () => void
  calculateTotals: () => void
  holdCart: (cashier: string, reason?: string) => HeldCart | null
  resumeCart: (heldCart: HeldCart) => void
  canHoldCart: () => boolean
  saveCart: (userId: string, username: string, saveOptions: CartSaveOptions) => SavedCart | null
  loadSavedCart: (savedCart: SavedCart) => void
  canSaveCart: () => boolean
  createCartFromTemplate: (templateCart: SavedCart) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedCustomer: null,
      discount: 0,
      discountInfo: null,
      appliedCoupons: [],
      couponValidationError: null,
      subtotal: 0,
      tax: 0,
      total: 0,
      totalSavings: 0,

      addItem: (product: Product, quantity = 1) => {
        const { items, calculateTotals } = get()
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
            category: product.category,
            discount: 0,
            taxRate: 0.08 // 8% tax rate
          }
          set({ items: [...items, newItem] })
        }
        
        calculateTotals()
      },

      removeItem: (id: string) => {
        const { items, calculateTotals } = get()
        set({ items: items.filter(item => item.id !== id) })
        calculateTotals()
      },

      updateQuantity: (id: string, quantity: number) => {
        const { items, calculateTotals } = get()
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set({
          items: items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        })
        calculateTotals()
      },

      applyDiscount: (discount: number) => {
        set({ discount })
        get().calculateTotals()
      },

      applyAdvancedDiscount: (discountInfo: DiscountInfo) => {
        set({ 
          discount: discountInfo.value,
          discountInfo 
        })
        get().calculateTotals()
      },

      applyItemDiscount: (itemId: string, discount: number, type: 'percentage' | 'fixed') => {
        const { items, calculateTotals } = get()
        const updatedItems = items.map(item => {
          if (item.id === itemId) {
            const discountValue = type === 'percentage' ? discount : 
              Math.min(discount, item.price * item.quantity) // Cap fixed discount at item total
            return { ...item, discount: discountValue, discountType: type }
          }
          return item
        })
        set({ items: updatedItems })
        calculateTotals()
      },

      removeDiscount: () => {
        set({ discount: 0, discountInfo: null })
        get().calculateTotals()
      },

      removeItemDiscount: (itemId: string) => {
        const { items, calculateTotals } = get()
        const updatedItems = items.map(item => {
          if (item.id === itemId) {
            return { ...item, discount: 0, discountType: undefined }
          }
          return item
        })
        set({ items: updatedItems })
        calculateTotals()
      },

      applyCoupon: async (couponCode: string) => {
        // Import the coupon store dynamically to avoid circular dependency
        const { useCouponStore } = await import('./coupons')
        const { validateCoupon, calculateCouponDiscount, incrementUsage } = useCouponStore.getState()
        
        const { items, appliedCoupons } = get()
        const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        // Clear any previous validation error
        set({ couponValidationError: null })
        
        const validation = validateCoupon(couponCode, items, cartTotal, appliedCoupons)
        
        if (!validation.valid) {
          set({ couponValidationError: validation.error })
          return false
        }
        
        if (!validation.coupon) {
          set({ couponValidationError: 'Invalid coupon' })
          return false
        }
        
        const discountCalculation = calculateCouponDiscount(validation.coupon, items, cartTotal)
        
        const newAppliedCoupon: AppliedCoupon = {
          coupon: validation.coupon,
          appliedAt: new Date(),
          discountAmount: discountCalculation.discountAmount,
          applicableItems: discountCalculation.applicableItems,
          freeItems: discountCalculation.freeItems
        }
        
        // Add the coupon and recalculate totals
        set({ 
          appliedCoupons: [...appliedCoupons, newAppliedCoupon],
          couponValidationError: null
        })
        
        // Increment usage count
        incrementUsage(validation.coupon.id)
        
        // Recalculate totals
        get().calculateTotals()
        
        return true
      },

      removeCoupon: (couponId: string) => {
        const { appliedCoupons } = get()
        set({ 
          appliedCoupons: appliedCoupons.filter(ac => ac.coupon.id !== couponId),
          couponValidationError: null
        })
        get().calculateTotals()
      },

      clearCoupons: () => {
        set({ 
          appliedCoupons: [],
          couponValidationError: null
        })
        get().calculateTotals()
      },

      selectCustomer: (customer: Customer | null) => {
        set({ selectedCustomer: customer })
      },

      clearCart: () => {
        set({
          items: [],
          selectedCustomer: null,
          discount: 0,
          discountInfo: null,
          appliedCoupons: [],
          couponValidationError: null,
          subtotal: 0,
          tax: 0,
          total: 0,
          totalSavings: 0
        })
      },

      calculateTotals: () => {
        const { items, discount, discountInfo, appliedCoupons } = get()
        
        // Calculate subtotal with item-level discounts
        let originalSubtotal = 0
        let subtotalAfterItemDiscounts = 0
        let itemSavings = 0
        
        items.forEach(item => {
          const itemTotal = item.price * item.quantity
          originalSubtotal += itemTotal
          
          if (item.discount && item.discount > 0) {
            const discountType = (item as any).discountType || 'percentage'
            let itemDiscountAmount = 0
            
            if (discountType === 'percentage') {
              itemDiscountAmount = itemTotal * (item.discount / 100)
            } else {
              itemDiscountAmount = Math.min(item.discount, itemTotal)
            }
            
            subtotalAfterItemDiscounts += (itemTotal - itemDiscountAmount)
            itemSavings += itemDiscountAmount
          } else {
            subtotalAfterItemDiscounts += itemTotal
          }
        })
        
        // Apply cart-level discount
        let cartDiscountAmount = 0
        if (discount > 0) {
          if (discountInfo?.type === 'fixed') {
            cartDiscountAmount = Math.min(discount, subtotalAfterItemDiscounts)
          } else {
            cartDiscountAmount = subtotalAfterItemDiscounts * (discount / 100)
          }
        }
        
        // Apply coupon discounts
        let couponDiscountAmount = 0
        appliedCoupons.forEach(appliedCoupon => {
          couponDiscountAmount += appliedCoupon.discountAmount
        })
        
        const finalSubtotal = Math.max(0, subtotalAfterItemDiscounts - cartDiscountAmount - couponDiscountAmount)
        const tax = finalSubtotal * 0.08 // 8% tax
        const total = finalSubtotal + tax
        const totalSavings = itemSavings + cartDiscountAmount + couponDiscountAmount
        
        set({ 
          subtotal: originalSubtotal, 
          tax, 
          total,
          totalSavings
        })
      },

      canHoldCart: () => {
        const { items } = get()
        return items.length > 0
      },

      holdCart: (cashier: string, reason?: string) => {
        const state = get()
        
        // Don't hold empty carts
        if (!state.canHoldCart()) {
          return null
        }

        const heldCart: HeldCart = {
          id: `held-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          items: [...state.items],
          selectedCustomer: state.selectedCustomer,
          discount: state.discount,
          discountInfo: state.discountInfo,
          appliedCoupons: [...state.appliedCoupons],
          subtotal: state.subtotal,
          tax: state.tax,
          total: state.total,
          totalSavings: state.totalSavings,
          timestamp: new Date(),
          holdReason: reason,
          cashier,
          customerName: state.selectedCustomer?.name
        }

        // Clear the current cart after holding
        set({
          items: [],
          selectedCustomer: null,
          discount: 0,
          discountInfo: null,
          appliedCoupons: [],
          couponValidationError: null,
          subtotal: 0,
          tax: 0,
          total: 0,
          totalSavings: 0
        })

        return heldCart
      },

      resumeCart: (heldCart: HeldCart) => {
        set({
          items: [...heldCart.items],
          selectedCustomer: heldCart.selectedCustomer,
          discount: heldCart.discount,
          discountInfo: heldCart.discountInfo,
          appliedCoupons: [...(heldCart.appliedCoupons || [])],
          couponValidationError: null,
          subtotal: heldCart.subtotal,
          tax: heldCart.tax,
          total: heldCart.total,
          totalSavings: heldCart.totalSavings
        })
        
        // Recalculate totals to ensure consistency
        get().calculateTotals()
      },

      canSaveCart: () => {
        const { items } = get()
        return items.length > 0
      },

      saveCart: (userId: string, username: string, saveOptions: CartSaveOptions) => {
        const state = get()
        
        // Don't save empty carts
        if (!state.canSaveCart()) {
          return null
        }

        const now = new Date()
        const savedCart: SavedCart = {
          id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          items: [...state.items],
          selectedCustomer: state.selectedCustomer,
          discount: state.discount,
          discountInfo: state.discountInfo,
          appliedCoupons: [...state.appliedCoupons],
          subtotal: state.subtotal,
          tax: state.tax,
          total: state.total,
          totalSavings: state.totalSavings,
          createdAt: now,
          updatedAt: now,
          savedBy: username,
          userId,
          label: saveOptions.label,
          description: saveOptions.description,
          customerName: state.selectedCustomer?.name,
          isTemplate: saveOptions.isTemplate || false,
          tags: saveOptions.tags || [],
          category: saveOptions.category || 'saved'
        }

        return savedCart
      },

      loadSavedCart: (savedCart: SavedCart) => {
        set({
          items: [...savedCart.items],
          selectedCustomer: savedCart.selectedCustomer,
          discount: savedCart.discount,
          discountInfo: savedCart.discountInfo,
          appliedCoupons: [...(savedCart.appliedCoupons || [])],
          couponValidationError: null,
          subtotal: savedCart.subtotal,
          tax: savedCart.tax,
          total: savedCart.total,
          totalSavings: savedCart.totalSavings
        })
        
        // Recalculate totals to ensure consistency
        get().calculateTotals()
      },

      createCartFromTemplate: (templateCart: SavedCart) => {
        // Clear current cart first
        get().clearCart()
        
        // Load template items without customer and discounts for new transaction
        set({
          items: [...templateCart.items],
          selectedCustomer: null, // Don't carry over customer from template
          discount: 0, // Reset discounts for new transaction
          discountInfo: null,
          appliedCoupons: [], // Reset coupons for new transaction
          couponValidationError: null,
          subtotal: 0,
          tax: 0,
          total: 0,
          totalSavings: 0
        })
        
        // Recalculate totals
        get().calculateTotals()
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        selectedCustomer: state.selectedCustomer,
        discount: state.discount,
        discountInfo: state.discountInfo,
        appliedCoupons: state.appliedCoupons
      })
    }
  )
)