import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Customer, AppliedCoupon } from '@/types'

export interface TablePosition {
  x: number
  y: number
}

export interface Table {
  id: string
  number: number
  seats: number
  position: TablePosition
  shape: 'square' | 'round' | 'rectangle'
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  rotation?: number
  size?: 'small' | 'medium' | 'large'
}

export interface TableCart {
  tableId: string
  tableName: string
  items: CartItem[]
  selectedCustomer: Customer | null
  discount: number
  discountInfo: any
  appliedCoupons: AppliedCoupon[]
  subtotal: number
  tax: number
  total: number
  totalSavings: number
  startTime: Date
  server?: string
  guestCount?: number
  notes?: string
}

interface RestaurantFloorPlan {
  tables: Table[]
  gridSize: { width: number; height: number }
  cellSize: number
}

interface TablesState {
  isRestaurantMode: boolean
  floorPlan: RestaurantFloorPlan
  tableCarts: Map<string, TableCart>
  activeTableId: string | null
  
  // Restaurant mode
  setRestaurantMode: (enabled: boolean) => void
  
  // Floor plan management
  addTable: (table: Omit<Table, 'id'>) => void
  updateTable: (id: string, updates: Partial<Table>) => void
  removeTable: (id: string) => void
  moveTable: (id: string, position: TablePosition) => void
  updateTableStatus: (id: string, status: Table['status']) => void
  updateFloorPlanSize: (width: number, height: number) => void
  resetFloorPlan: () => void
  loadPresetLayout: (preset: 'small' | 'medium' | 'large') => void
  
  // Table cart management
  setActiveTable: (tableId: string | null) => void
  getTableCart: (tableId: string) => TableCart | undefined
  createTableCart: (tableId: string, tableName: string, server?: string, guestCount?: number) => void
  updateTableCart: (tableId: string, updates: Partial<TableCart>) => void
  clearTableCart: (tableId: string) => void
  transferTable: (fromTableId: string, toTableId: string) => void
  getOccupiedTables: () => Table[]
  getAvailableTables: () => Table[]
  
  // Analytics
  getTableOccupancyRate: () => number
  getAverageTableTime: () => number
  getTotalRevenue: () => number
}

const defaultFloorPlan: RestaurantFloorPlan = {
  tables: [],
  gridSize: { width: 20, height: 15 },
  cellSize: 50
}

const presetLayouts = {
  small: {
    gridSize: { width: 15, height: 10 },
    tables: [
      { number: 1, seats: 2, position: { x: 2, y: 2 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 2, seats: 2, position: { x: 5, y: 2 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 3, seats: 4, position: { x: 8, y: 2 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 4, seats: 4, position: { x: 11, y: 2 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 5, seats: 4, position: { x: 2, y: 5 }, shape: 'rectangle' as const, status: 'available' as const, size: 'medium' as const },
      { number: 6, seats: 6, position: { x: 6, y: 5 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const },
      { number: 7, seats: 4, position: { x: 11, y: 5 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 8, seats: 2, position: { x: 2, y: 8 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 9, seats: 4, position: { x: 5, y: 8 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 10, seats: 8, position: { x: 9, y: 7 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const, rotation: 0 }
    ]
  },
  medium: {
    gridSize: { width: 20, height: 15 },
    tables: [
      { number: 1, seats: 2, position: { x: 2, y: 2 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 2, seats: 2, position: { x: 5, y: 2 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 3, seats: 4, position: { x: 8, y: 2 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 4, seats: 4, position: { x: 12, y: 2 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 5, seats: 6, position: { x: 16, y: 2 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const },
      { number: 6, seats: 4, position: { x: 2, y: 5 }, shape: 'rectangle' as const, status: 'available' as const, size: 'medium' as const },
      { number: 7, seats: 6, position: { x: 6, y: 5 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const },
      { number: 8, seats: 4, position: { x: 11, y: 5 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 9, seats: 8, position: { x: 15, y: 5 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const },
      { number: 10, seats: 2, position: { x: 2, y: 8 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 11, seats: 4, position: { x: 5, y: 8 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 12, seats: 6, position: { x: 9, y: 8 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const },
      { number: 13, seats: 4, position: { x: 14, y: 8 }, shape: 'round' as const, status: 'available' as const, size: 'medium' as const },
      { number: 14, seats: 2, position: { x: 17, y: 8 }, shape: 'square' as const, status: 'available' as const, size: 'small' as const },
      { number: 15, seats: 10, position: { x: 8, y: 11 }, shape: 'rectangle' as const, status: 'available' as const, size: 'large' as const, rotation: 0 }
    ]
  },
  large: {
    gridSize: { width: 25, height: 20 },
    tables: Array.from({ length: 25 }, (_, i) => ({
      number: i + 1,
      seats: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
      position: { 
        x: 2 + (i % 5) * 4 + Math.floor(i / 5), 
        y: 2 + Math.floor(i / 5) * 3 
      },
      shape: (['square', 'round', 'rectangle'] as const)[Math.floor(Math.random() * 3)],
      status: 'available' as const,
      size: (['small', 'medium', 'large'] as const)[Math.floor(Math.random() * 3)]
    }))
  }
}

export const useTablesStore = create<TablesState>()(
  persist(
    (set, get) => ({
      isRestaurantMode: process.env.NEXT_PUBLIC_RESTAURANT_MODE === 'true',
      floorPlan: defaultFloorPlan,
      tableCarts: new Map(),
      activeTableId: null,
      
      setRestaurantMode: (enabled: boolean) => {
        set({ isRestaurantMode: enabled })
      },
      
      addTable: (table: Omit<Table, 'id'>) => {
        const id = `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          floorPlan: {
            ...state.floorPlan,
            tables: [...state.floorPlan.tables, { ...table, id }]
          }
        }))
      },
      
      updateTable: (id: string, updates: Partial<Table>) => {
        set((state) => ({
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.map(table =>
              table.id === id ? { ...table, ...updates } : table
            )
          }
        }))
      },
      
      removeTable: (id: string) => {
        const { tableCarts } = get()
        const newCarts = new Map(tableCarts)
        newCarts.delete(id)
        
        set((state) => ({
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.filter(table => table.id !== id)
          },
          tableCarts: newCarts,
          activeTableId: state.activeTableId === id ? null : state.activeTableId
        }))
      },
      
      moveTable: (id: string, position: TablePosition) => {
        set((state) => ({
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.map(table =>
              table.id === id ? { ...table, position } : table
            )
          }
        }))
      },
      
      updateTableStatus: (id: string, status: Table['status']) => {
        set((state) => ({
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.map(table =>
              table.id === id ? { ...table, status } : table
            )
          }
        }))
      },
      
      updateFloorPlanSize: (width: number, height: number) => {
        set((state) => ({
          floorPlan: {
            ...state.floorPlan,
            gridSize: { width, height }
          }
        }))
      },
      
      resetFloorPlan: () => {
        set({
          floorPlan: defaultFloorPlan,
          tableCarts: new Map(),
          activeTableId: null
        })
      },
      
      loadPresetLayout: (preset: 'small' | 'medium' | 'large') => {
        const layout = presetLayouts[preset]
        const tables = layout.tables.map((table, index) => ({
          ...table,
          id: `table-${Date.now()}-${index}`
        }))
        
        set({
          floorPlan: {
            tables,
            gridSize: layout.gridSize,
            cellSize: 50
          },
          tableCarts: new Map(),
          activeTableId: null
        })
      },
      
      setActiveTable: (tableId: string | null) => {
        set({ activeTableId: tableId })
      },
      
      getTableCart: (tableId: string) => {
        return get().tableCarts.get(tableId)
      },
      
      createTableCart: (tableId: string, tableName: string, server?: string, guestCount?: number) => {
        const { tableCarts, floorPlan } = get()
        const table = floorPlan.tables.find(t => t.id === tableId)
        
        if (!table) return
        
        const newCart: TableCart = {
          tableId,
          tableName,
          items: [],
          selectedCustomer: null,
          discount: 0,
          discountInfo: null,
          appliedCoupons: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          totalSavings: 0,
          startTime: new Date(),
          server,
          guestCount,
          notes: ''
        }
        
        const newCarts = new Map(tableCarts)
        newCarts.set(tableId, newCart)
        
        set((state) => ({
          tableCarts: newCarts,
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.map(t =>
              t.id === tableId ? { ...t, status: 'occupied' } : t
            )
          }
        }))
      },
      
      updateTableCart: (tableId: string, updates: Partial<TableCart>) => {
        const { tableCarts } = get()
        const cart = tableCarts.get(tableId)
        
        if (!cart) return
        
        const newCarts = new Map(tableCarts)
        newCarts.set(tableId, { ...cart, ...updates })
        
        set({ tableCarts: newCarts })
      },
      
      clearTableCart: (tableId: string) => {
        const { tableCarts } = get()
        const newCarts = new Map(tableCarts)
        newCarts.delete(tableId)
        
        set((state) => ({
          tableCarts: newCarts,
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.map(t =>
              t.id === tableId ? { ...t, status: 'available' } : t
            )
          },
          activeTableId: state.activeTableId === tableId ? null : state.activeTableId
        }))
      },
      
      transferTable: (fromTableId: string, toTableId: string) => {
        const { tableCarts, floorPlan } = get()
        const fromCart = tableCarts.get(fromTableId)
        const toTable = floorPlan.tables.find(t => t.id === toTableId)
        
        if (!fromCart || !toTable) return
        
        const newCarts = new Map(tableCarts)
        newCarts.delete(fromTableId)
        newCarts.set(toTableId, {
          ...fromCart,
          tableId: toTableId,
          tableName: `Table ${toTable.number}`
        })
        
        set((state) => ({
          tableCarts: newCarts,
          floorPlan: {
            ...state.floorPlan,
            tables: state.floorPlan.tables.map(t => {
              if (t.id === fromTableId) return { ...t, status: 'available' }
              if (t.id === toTableId) return { ...t, status: 'occupied' }
              return t
            })
          },
          activeTableId: state.activeTableId === fromTableId ? toTableId : state.activeTableId
        }))
      },
      
      getOccupiedTables: () => {
        return get().floorPlan.tables.filter(t => t.status === 'occupied')
      },
      
      getAvailableTables: () => {
        return get().floorPlan.tables.filter(t => t.status === 'available')
      },
      
      getTableOccupancyRate: () => {
        const { floorPlan } = get()
        if (floorPlan.tables.length === 0) return 0
        const occupied = floorPlan.tables.filter(t => t.status === 'occupied').length
        return (occupied / floorPlan.tables.length) * 100
      },
      
      getAverageTableTime: () => {
        const { tableCarts } = get()
        if (tableCarts.size === 0) return 0
        
        const now = new Date()
        let totalTime = 0
        
        tableCarts.forEach(cart => {
          const duration = now.getTime() - cart.startTime.getTime()
          totalTime += duration
        })
        
        return totalTime / tableCarts.size / 60000 // Return in minutes
      },
      
      getTotalRevenue: () => {
        const { tableCarts } = get()
        let total = 0
        
        tableCarts.forEach(cart => {
          total += cart.total
        })
        
        return total
      }
    }),
    {
      name: 'tables-storage',
      partialize: (state) => ({
        floorPlan: state.floorPlan,
        isRestaurantMode: state.isRestaurantMode
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const data = JSON.parse(str)
          // Convert Map back from array
          if (data.state?.tableCarts) {
            data.state.tableCarts = new Map(data.state.tableCarts)
          }
          return data
        },
        setItem: (name, value) => {
          // Convert Map to array for storage
          const data = { ...value }
          if (data.state?.tableCarts instanceof Map) {
            data.state.tableCarts = Array.from(data.state.tableCarts.entries())
          }
          localStorage.setItem(name, JSON.stringify(data))
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
)