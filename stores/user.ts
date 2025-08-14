import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Shift, Transaction } from '@/types'

interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  currentShift: Shift | null
  authMode: 'login' | 'pin' | 'authenticated'
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>
  loginWithPin: (pin: string) => Promise<boolean>
  logout: () => void
  setAuthMode: (mode: 'login' | 'pin' | 'authenticated') => void
  startShift: (startingCash: number) => void
  endShift: (endingCash: number) => void
  addTransactionToShift: (transaction: Transaction) => void
  updateUserPermissions: (permissions: string[]) => void
}

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@mapos.com",
    role: "admin",
    permissions: ["all"],
    isActive: true,
    lastLogin: new Date()
  },
  {
    id: "2",
    username: "manager",
    email: "manager@mapos.com",
    role: "manager",
    permissions: ["sales", "inventory", "reports", "customers"],
    isActive: true,
    lastLogin: new Date()
  },
  {
    id: "3",
    username: "cashier",
    email: "cashier@mapos.com",
    role: "cashier",
    permissions: ["sales", "customers"],
    isActive: true,
    lastLogin: new Date()
  }
]

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      currentShift: null,
      authMode: 'login',

      login: async (username: string, password: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock authentication - in real app, validate against backend
        if (username && password) {
          const user = mockUsers.find(u => u.username === username)
          if (user) {
            set({
              currentUser: { ...user, lastLogin: new Date() },
              isAuthenticated: true,
              authMode: 'authenticated'
            })
            return true
          }
        }
        return false
      },

      loginWithPin: async (pin: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock PIN validation - in real app, validate against backend
        if (pin === "1234") {
          const pinUser: User = {
            id: "pin-user",
            username: "PIN User",
            email: "pin@mapos.com",
            role: "cashier",
            permissions: ["sales"],
            isActive: true,
            lastLogin: new Date()
          }
          
          set({
            currentUser: pinUser,
            isAuthenticated: true,
            authMode: 'authenticated'
          })
          return true
        }
        return false
      },

      logout: () => {
        const { currentShift } = get()
        
        // End current shift if active
        if (currentShift && currentShift.status === 'active') {
          set({
            currentShift: {
              ...currentShift,
              endTime: new Date(),
              status: 'closed'
            }
          })
        }
        
        set({
          currentUser: null,
          isAuthenticated: false,
          authMode: 'pin', // Go to PIN lock instead of full logout
          currentShift: null
        })
      },

      setAuthMode: (mode: 'login' | 'pin' | 'authenticated') => {
        set({ authMode: mode })
      },

      startShift: (startingCash: number) => {
        const { currentUser } = get()
        if (!currentUser) return
        
        const newShift: Shift = {
          id: `shift-${Date.now()}`,
          userId: currentUser.id,
          startTime: new Date(),
          startingCash,
          sales: 0,
          transactions: [],
          status: 'active'
        }
        
        set({ currentShift: newShift })
      },

      endShift: (endingCash: number) => {
        const { currentShift } = get()
        if (!currentShift || currentShift.status !== 'active') return
        
        set({
          currentShift: {
            ...currentShift,
            endTime: new Date(),
            endingCash,
            status: 'closed'
          }
        })
      },

      addTransactionToShift: (transaction: Transaction) => {
        const { currentShift } = get()
        if (!currentShift || currentShift.status !== 'active') return
        
        set({
          currentShift: {
            ...currentShift,
            transactions: [...currentShift.transactions, transaction],
            sales: currentShift.sales + transaction.total
          }
        })
      },

      updateUserPermissions: (permissions: string[]) => {
        const { currentUser } = get()
        if (!currentUser) return
        
        set({
          currentUser: {
            ...currentUser,
            permissions
          }
        })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        currentShift: state.currentShift
      })
    }
  )
)