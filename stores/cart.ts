import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product, Customer, HeldCart, AppliedCoupon, SavedCart, CartSaveOptions } from '@/types'
import { storeIdentificationService, StoreLocation } from '@/lib/services/store-identification-service'

interface DiscountInfo {
  type: 'percentage' | 'fixed'
  value: number
  reason?: string
  managerId?: string
  timestamp: Date
}

interface SaleResult {
  success: boolean
  saleId?: string
  message: string
  errors?: any[]
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
  currentStore: StoreLocation | null
  
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
  processSale: (paymentMethod: string, user: string, warehouseId?: string) => Promise<SaleResult>
  initializeStore: () => Promise<void>
  setCurrentStore: (storeId: string) => Promise<void>
  refreshStore: () => Promise<void>
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
      currentStore: null,

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
            taxRate: product.taxExempt ? 0 : (product.taxRate || 0), // Use product tax rate, no default
            cost: product.cost || 0, // Capture cost price for reporting
            type: (product as any).type || 'product' // Include type field for inventory processing
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
          const itemPrice = item.price || 0
          const itemQuantity = item.quantity || 0
          const itemTotal = itemPrice * itemQuantity
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
        
        // Calculate tax based on individual item tax rates
        let totalTax = 0
        const discountRatio = finalSubtotal > 0 ? finalSubtotal / subtotalAfterItemDiscounts : 0
        
        items.forEach(item => {
          const itemPrice = item.price || 0
          const itemQuantity = item.quantity || 0
          const itemTotal = itemPrice * itemQuantity
          let itemAfterDiscount = itemTotal
          
          // Apply item-level discount
          if (item.discount && item.discount > 0) {
            const discountType = (item as any).discountType || 'percentage'
            let itemDiscountAmount = 0
            
            if (discountType === 'percentage') {
              itemDiscountAmount = itemTotal * (item.discount / 100)
            } else {
              itemDiscountAmount = Math.min(item.discount, itemTotal)
            }
            
            itemAfterDiscount = itemTotal - itemDiscountAmount
          }
          
          // Apply proportional cart and coupon discounts to this item
          const itemAfterAllDiscounts = itemAfterDiscount * discountRatio
          
          // Calculate tax for this item based on its tax rate
          const itemTaxRate = item.taxRate || 0
          totalTax += itemAfterAllDiscounts * itemTaxRate
        })
        
        const total = finalSubtotal + totalTax
        const totalSavings = itemSavings + cartDiscountAmount + couponDiscountAmount
        
        set({ 
          subtotal: originalSubtotal, 
          tax: totalTax, 
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
      },

      initializeStore: async () => {
        try {
          console.log('=== INITIALIZING STORE ===')
          const currentStore = await storeIdentificationService.getCurrentStore()
          console.log('Store initialized:', currentStore)
          console.log('Warehouse info:', currentStore?.warehouse)
          set({ currentStore })
        } catch (error) {
          console.error('Failed to initialize store:', error)
        }
      },

      setCurrentStore: async (storeId: string) => {
        try {
          console.log('=== SETTING CURRENT STORE ===')
          console.log('Store ID:', storeId)
          const store = await storeIdentificationService.setCurrentStore(storeId)
          console.log('Store set:', store)
          console.log('Warehouse info:', store?.warehouse)
          set({ currentStore: store })
        } catch (error) {
          console.error('Failed to set current store:', error)
          throw error
        }
      },

      refreshStore: async () => {
        try {
          console.log('=== REFRESHING STORE ===')
          await storeIdentificationService.refreshStores()
          const currentStore = await storeIdentificationService.getCurrentStore()
          console.log('Store refreshed:', currentStore)
          console.log('Warehouse info:', currentStore?.warehouse)
          set({ currentStore })
        } catch (error) {
          console.error('Failed to refresh store data:', error)
        }
      },

      processSale: async (paymentMethod: string, user: string, warehouseId?: string): Promise<SaleResult> => {
        const state = get()
        
        // Validate cart has items
        if (state.items.length === 0) {
          return {
            success: false,
            message: 'Cannot process sale: Cart is empty'
          }
        }
        
        // Validate payment method
        if (!paymentMethod || paymentMethod.trim() === '') {
          return {
            success: false,
            message: 'Payment method is required'
          }
        }
        
        // Validate user
        if (!user || user.trim() === '') {
          return {
            success: false,
            message: 'User information is required'
          }
        }
        
        try {
          // Transform cart items to sale items format
          const saleItems = state.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type || 'product', // Use type from cart item, default to product if not specified
            stock: (item as any).stock,
            cost: item.cost || 0 // Include cost price for reporting
          }))
          
          // Log sale items to debug cost being sent
          console.log('=== PROCESSING SALE ===')
          console.log('Sale items being sent to API:')
          saleItems.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
              id: item.id,
              name: item.name,
              price: item.price,
              cost: item.cost,
              quantity: item.quantity,
              type: item.type
            })
          })
          
          // Get store metadata
          const storeMetadata = state.currentStore ? 
            storeIdentificationService.getTransactionMetadata(state.currentStore) : null
          
          // IMPORTANT: Always prioritize the passed warehouse ID from authenticated user
          const storeWarehouseId = state.currentStore?.warehouse?.warehouseId
          const finalWarehouseId = warehouseId && warehouseId !== 'undefined' && warehouseId !== 'null' 
            ? warehouseId 
            : storeWarehouseId || 'WH1'
          
          console.log('=== SALE WAREHOUSE INFO ===')
          console.log('Current Store:', state.currentStore)
          console.log('Store Warehouse ID:', storeWarehouseId)
          console.log('Passed Warehouse ID (from user):', warehouseId)
          console.log('Passed Warehouse ID type:', typeof warehouseId)
          console.log('Final Warehouse ID being used:', finalWarehouseId)

          // Get default customer from settings if no customer selected
          // Import settings store dynamically to avoid circular dependency
          const settingsStore = (await import('@/stores/settings')).useSettingsStore.getState()
          const defaultCustomerId = settingsStore.settings.store.defaultCustomerId || 'WALK-IN'
          const defaultCustomerName = settingsStore.settings.store.defaultCustomerName || 'Walk-in Customer'
          
          // Use selected customer or default
          const customerId = state.selectedCustomer?.id || defaultCustomerId
          const customerName = state.selectedCustomer?.name || defaultCustomerName
          
          // Prepare sale transaction data
          const saleTransaction = {
            items: saleItems,
            subtotal: state.subtotal,
            tax: state.tax,
            total: state.total,
            paymentMethod,
            user,
            warehouseId: finalWarehouseId,
            customerId,
            customerName,
            appliedDiscounts: {
              cartDiscount: state.discount,
              discountInfo: state.discountInfo,
              coupons: state.appliedCoupons,
              totalSavings: state.totalSavings
            },
            storeInfo: state.currentStore ? {
              storeId: state.currentStore.id,
              storeName: state.currentStore.name,
              storeCode: state.currentStore.code,
              warehouseId: state.currentStore.warehouse?.warehouseId,
              warehouseName: state.currentStore.warehouse?.warehouseName,
              terminalId: storeMetadata?.terminalId,
              deviceId: storeMetadata?.deviceId
            } : null
          }
          
          // Call sales API
          const response = await fetch('/api/sales', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(saleTransaction)
          })
          
          const result = await response.json()
          
          if (!response.ok) {
            return {
              success: false,
              message: result.error || 'Failed to process sale',
              errors: [result]
            }
          }
          
          if (result.success) {
            // Clear cart on successful sale
            get().clearCart()
            
            return {
              success: true,
              saleId: result.saleId,
              message: result.message || 'Sale completed successfully'
            }
          } else {
            return {
              success: false,
              message: result.message || 'Sale processing failed',
              errors: result.errors
            }
          }
          
        } catch (error) {
          console.error('Sale processing error:', error)
          return {
            success: false,
            message: 'Network error: Failed to connect to sales system',
            errors: [error]
          }
        }
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
      }),
      onRehydrateStorage: () => (state) => {
        // Recalculate totals when store is hydrated from localStorage
        if (state) {
          state.calculateTotals()
        }
      }
    }
  )
)