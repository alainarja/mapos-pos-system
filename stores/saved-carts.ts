import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SavedCart, CartSaveOptions } from '@/types'

interface SavedCartsState {
  savedCarts: SavedCart[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addSavedCart: (cart: SavedCart) => Promise<boolean>
  removeSavedCart: (id: string) => Promise<boolean>
  updateSavedCart: (id: string, updates: Partial<SavedCart>) => Promise<boolean>
  getSavedCart: (id: string) => SavedCart | undefined
  clearSavedCarts: () => Promise<boolean>
  clearError: () => void
  setLoading: (loading: boolean) => void
  getSavedCartsCount: () => number
  searchSavedCarts: (searchTerm: string) => SavedCart[]
  getSavedCartsByUser: (userId: string) => SavedCart[]
  getSavedCartsByCategory: (category: 'customer' | 'template' | 'quote' | 'saved') => SavedCart[]
  getTemplates: () => SavedCart[]
  duplicateSavedCart: (id: string, newLabel: string, userId: string, username: string) => Promise<SavedCart | null>
  exportSavedCart: (id: string) => string | null
  importSavedCart: (cartData: string, userId: string, username: string) => Promise<SavedCart | null>
  getRecentSavedCarts: (limit?: number) => SavedCart[]
  getSavedCartStats: () => {
    total: number
    templates: number
    byCategory: Record<string, number>
    byUser: Record<string, number>
  }
}

export const useSavedCartsStore = create<SavedCartsState>()(
  persist(
    (set, get) => ({
      savedCarts: [],
      isLoading: false,
      error: null,

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      addSavedCart: async (cart: SavedCart) => {
        set({ isLoading: true, error: null })
        
        try {
          // Validate cart data
          if (!cart.id || !cart.label || !cart.items || cart.items.length === 0) {
            throw new Error('Invalid cart data: missing required fields')
          }

          const { savedCarts } = get()
          
          // Check if a cart with the same ID already exists (replace if so)
          const existingIndex = savedCarts.findIndex(c => c.id === cart.id)
          
          if (existingIndex >= 0) {
            set({
              savedCarts: savedCarts.map((c, index) => 
                index === existingIndex ? { ...cart, updatedAt: new Date() } : c
              ),
              isLoading: false
            })
          } else {
            set({ 
              savedCarts: [...savedCarts, cart],
              isLoading: false
            })
          }
          
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save cart'
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },

      removeSavedCart: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          if (!id) {
            throw new Error('Cart ID is required')
          }

          const { savedCarts } = get()
          const cartExists = savedCarts.some(cart => cart.id === id)
          
          if (!cartExists) {
            throw new Error('Cart not found')
          }

          set({ 
            savedCarts: savedCarts.filter(cart => cart.id !== id),
            isLoading: false
          })
          
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove cart'
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },

      updateSavedCart: async (id: string, updates: Partial<SavedCart>) => {
        set({ isLoading: true, error: null })
        
        try {
          if (!id) {
            throw new Error('Cart ID is required')
          }

          const { savedCarts } = get()
          const cartExists = savedCarts.some(cart => cart.id === id)
          
          if (!cartExists) {
            throw new Error('Cart not found')
          }

          set({
            savedCarts: savedCarts.map(cart =>
              cart.id === id 
                ? { ...cart, ...updates, updatedAt: new Date() }
                : cart
            ),
            isLoading: false
          })
          
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update cart'
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },

      getSavedCart: (id: string) => {
        const { savedCarts } = get()
        return savedCarts.find(cart => cart.id === id)
      },

      clearSavedCarts: async () => {
        set({ isLoading: true, error: null })
        
        try {
          set({ savedCarts: [], isLoading: false })
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to clear saved carts'
          set({ error: errorMessage, isLoading: false })
          return false
        }
      },

      getSavedCartsCount: () => {
        return get().savedCarts.length
      },

      searchSavedCarts: (searchTerm: string) => {
        const { savedCarts } = get()
        if (!searchTerm.trim()) return savedCarts
        
        const term = searchTerm.toLowerCase()
        return savedCarts.filter(cart => 
          cart.label.toLowerCase().includes(term) ||
          cart.description?.toLowerCase().includes(term) ||
          cart.customerName?.toLowerCase().includes(term) ||
          cart.savedBy.toLowerCase().includes(term) ||
          cart.tags?.some(tag => tag.toLowerCase().includes(term)) ||
          cart.items.some(item => item.name.toLowerCase().includes(term))
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },

      getSavedCartsByUser: (userId: string) => {
        const { savedCarts } = get()
        return savedCarts
          .filter(cart => cart.userId === userId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },

      getSavedCartsByCategory: (category: 'customer' | 'template' | 'quote' | 'saved') => {
        const { savedCarts } = get()
        return savedCarts
          .filter(cart => cart.category === category)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },

      getTemplates: () => {
        const { savedCarts } = get()
        return savedCarts
          .filter(cart => cart.isTemplate === true)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },

      duplicateSavedCart: async (id: string, newLabel: string, userId: string, username: string) => {
        set({ error: null })
        
        try {
          if (!id || !newLabel || !userId || !username) {
            throw new Error('Missing required parameters for duplication')
          }

          const { savedCarts, addSavedCart } = get()
          const originalCart = savedCarts.find(cart => cart.id === id)
          
          if (!originalCart) {
            throw new Error('Original cart not found')
          }

          const now = new Date()
          const duplicatedCart: SavedCart = {
            ...originalCart,
            id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: newLabel,
            createdAt: now,
            updatedAt: now,
            savedBy: username,
            userId,
            isTemplate: false // Duplicates are not templates by default
          }

          const success = await addSavedCart(duplicatedCart)
          return success ? duplicatedCart : null
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate cart'
          set({ error: errorMessage })
          return null
        }
      },

      exportSavedCart: (id: string) => {
        const { savedCarts } = get()
        const cart = savedCarts.find(c => c.id === id)
        
        if (!cart) {
          return null
        }

        try {
          const exportData = {
            version: '1.0',
            type: 'saved-cart',
            data: cart,
            exportedAt: new Date().toISOString()
          }
          return JSON.stringify(exportData, null, 2)
        } catch (error) {
          console.error('Failed to export saved cart:', error)
          return null
        }
      },

      importSavedCart: async (cartData: string, userId: string, username: string) => {
        set({ error: null })
        
        try {
          if (!cartData || !userId || !username) {
            throw new Error('Missing required parameters for import')
          }

          const importedData = JSON.parse(cartData)
          
          if (importedData.type !== 'saved-cart' || !importedData.data) {
            throw new Error('Invalid cart data format')
          }

          // Validate imported cart data
          if (!importedData.data.items || importedData.data.items.length === 0) {
            throw new Error('Imported cart has no items')
          }

          const now = new Date()
          const importedCart: SavedCart = {
            ...importedData.data,
            id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
            savedBy: username,
            userId,
            label: `${importedData.data.label} (Imported)`
          }

          const success = await get().addSavedCart(importedCart)
          return success ? importedCart : null
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to import saved cart'
          set({ error: errorMessage })
          console.error('Failed to import saved cart:', error)
          return null
        }
      },

      getRecentSavedCarts: (limit = 10) => {
        const { savedCarts } = get()
        return savedCarts
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit)
      },

      getSavedCartStats: () => {
        const { savedCarts } = get()
        
        const stats = {
          total: savedCarts.length,
          templates: savedCarts.filter(cart => cart.isTemplate).length,
          byCategory: {} as Record<string, number>,
          byUser: {} as Record<string, number>
        }

        savedCarts.forEach(cart => {
          // Count by category
          const category = cart.category || 'saved'
          stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
          
          // Count by user
          stats.byUser[cart.savedBy] = (stats.byUser[cart.savedBy] || 0) + 1
        })

        return stats
      }
    }),
    {
      name: 'saved-carts-storage',
      partialize: (state) => ({ savedCarts: state.savedCarts }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migrations if needed in the future
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            savedCarts: persistedState.savedCarts?.map((cart: any) => ({
              ...cart,
              category: cart.category || 'saved',
              tags: cart.tags || [],
              isTemplate: cart.isTemplate || false
            })) || []
          }
        }
        return persistedState
      }
    }
  )
)