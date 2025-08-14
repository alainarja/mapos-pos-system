import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HeldCart } from '@/types'

interface HeldCartsState {
  heldCarts: HeldCart[]
  
  // Actions
  addHeldCart: (cart: HeldCart) => void
  removeHeldCart: (id: string) => void
  getHeldCart: (id: string) => HeldCart | undefined
  clearHeldCarts: () => void
  getHeldCartsCount: () => number
  searchHeldCarts: (searchTerm: string) => HeldCart[]
}

export const useHeldCartsStore = create<HeldCartsState>()(
  persist(
    (set, get) => ({
      heldCarts: [],

      addHeldCart: (cart: HeldCart) => {
        const { heldCarts } = get()
        
        // Check if a cart with the same ID already exists (replace if so)
        const existingIndex = heldCarts.findIndex(h => h.id === cart.id)
        
        if (existingIndex >= 0) {
          set({
            heldCarts: heldCarts.map((h, index) => 
              index === existingIndex ? cart : h
            )
          })
        } else {
          set({ heldCarts: [...heldCarts, cart] })
        }
      },

      removeHeldCart: (id: string) => {
        const { heldCarts } = get()
        set({ heldCarts: heldCarts.filter(cart => cart.id !== id) })
      },

      getHeldCart: (id: string) => {
        const { heldCarts } = get()
        return heldCarts.find(cart => cart.id === id)
      },

      clearHeldCarts: () => {
        set({ heldCarts: [] })
      },

      getHeldCartsCount: () => {
        return get().heldCarts.length
      },

      searchHeldCarts: (searchTerm: string) => {
        const { heldCarts } = get()
        if (!searchTerm.trim()) return heldCarts
        
        const term = searchTerm.toLowerCase()
        return heldCarts.filter(cart => 
          cart.customerName?.toLowerCase().includes(term) ||
          cart.holdReason?.toLowerCase().includes(term) ||
          cart.cashier.toLowerCase().includes(term) ||
          cart.id.toLowerCase().includes(term) ||
          cart.items.some(item => item.name.toLowerCase().includes(term))
        )
      }
    }),
    {
      name: 'held-carts-storage',
      partialize: (state) => ({ heldCarts: state.heldCarts })
    }
  )
)