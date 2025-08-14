import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Transaction, CartItem, Product } from '@/types'

export interface ReturnReason {
  id: string
  label: string
  requiresManager: boolean
  allowsExchange: boolean
  restockable: boolean
}

export interface ReturnItem {
  id: string
  originalTransactionId: string
  productId: string
  name: string
  price: number
  originalQuantity: number
  returnQuantity: number
  reason: string
  condition: 'new' | 'opened' | 'damaged' | 'defective'
  notes?: string
  sku?: string
  image?: string
}

export interface ExchangeItem {
  id: string
  originalItem: ReturnItem
  newProductId: string
  newProductName: string
  newPrice: number
  quantity: number
  priceDifference: number
  image?: string
}

export interface ReturnTransaction {
  id: string
  type: 'return' | 'exchange' | 'refund'
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected'
  date: string
  time: string
  originalTransaction: Transaction | null
  originalReceiptNumber?: string
  
  // Return/Exchange Items
  returnItems: ReturnItem[]
  exchangeItems: ExchangeItem[]
  
  // Financial Details
  refundAmount: number
  exchangeDifference: number // negative if refund, positive if additional charge
  totalRefund: number
  
  // Validation & Approval
  requiresManagerApproval: boolean
  managerApproval?: {
    managerId: string
    managerName: string
    approvedAt: string
    reason: string
  }
  
  // Processing Details
  refundMethod: 'original' | 'cash' | 'store_credit' | 'card'
  processedBy: string
  customerId?: string
  
  // Policy Validation
  withinReturnPeriod: boolean
  returnPolicyViolations: string[]
  
  // Documentation
  receiptNumber: string
  notes?: string
  
  // Inventory Impact
  inventoryUpdated: boolean
  restockedItems: string[] // IDs of items that were restocked
}

export interface ReturnPolicy {
  returnPeriodDays: number
  exchangePeriodDays: number
  requireReceiptForReturns: boolean
  requireReceiptForExchanges: boolean
  maxRefundWithoutReceipt: number
  managerApprovalThreshold: number
  allowDamagedReturns: boolean
  allowOpenedReturns: boolean
  restockingFee: number
  restockingFeeThreshold: number
}

export interface ReturnStats {
  totalReturns: number
  totalRefunds: number
  totalExchanges: number
  totalRefundAmount: number
  todayReturns: number
  weekReturns: number
  monthReturns: number
  averageRefundAmount: number
  returnRate: number // percentage of sales
  topReturnReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
}

interface ReturnsStore {
  // State
  returnTransactions: ReturnTransaction[]
  currentReturn: Partial<ReturnTransaction> | null
  searchTerm: string
  dateFilter: { start: string | null; end: string | null }
  statusFilter: string | null
  typeFilter: string | null
  
  // Policies & Settings
  returnReasons: ReturnReason[]
  returnPolicy: ReturnPolicy
  
  // UI State
  isProcessing: boolean
  currentStep: 'search' | 'items' | 'exchange' | 'approval' | 'payment' | 'complete'
  
  // Actions - Return Management
  createReturn: (type: 'return' | 'exchange' | 'refund') => void
  setCurrentReturn: (returnData: Partial<ReturnTransaction>) => void
  addReturnItem: (item: ReturnItem) => void
  removeReturnItem: (itemId: string) => void
  updateReturnItem: (itemId: string, updates: Partial<ReturnItem>) => void
  addExchangeItem: (item: ExchangeItem) => void
  removeExchangeItem: (itemId: string) => void
  updateExchangeItem: (itemId: string, updates: Partial<ExchangeItem>) => void
  
  // Actions - Processing
  calculateRefundAmount: () => number
  calculateExchangeDifference: () => number
  validateReturn: () => { isValid: boolean; violations: string[] }
  submitForApproval: () => Promise<boolean>
  approveReturn: (managerId: string, managerName: string, reason: string) => void
  rejectReturn: (reason: string) => void
  processReturn: (refundMethod: string) => Promise<boolean>
  completeReturn: () => void
  cancelReturn: () => void
  
  // Actions - Lookups & Search
  searchTransactions: (query: string, searchBy: 'receipt' | 'date' | 'customer') => Transaction[]
  findTransactionByReceipt: (receiptNumber: string) => Transaction | null
  findTransactionsByCustomer: (customerId: string) => Transaction[]
  findTransactionsByDateRange: (start: string, end: string) => Transaction[]
  
  // Actions - Inventory Integration
  updateInventoryForReturn: (returnItems: ReturnItem[]) => void
  revertInventoryUpdate: (returnId: string) => void
  
  // Actions - Filters & UI
  setSearchTerm: (term: string) => void
  setDateFilter: (start: string | null, end: string | null) => void
  setStatusFilter: (status: string | null) => void
  setTypeFilter: (type: string | null) => void
  setCurrentStep: (step: ReturnsStore['currentStep']) => void
  clearFilters: () => void
  
  // Getters
  getFilteredReturns: () => ReturnTransaction[]
  getReturnById: (id: string) => ReturnTransaction | undefined
  getReturnsByStatus: (status: string) => ReturnTransaction[]
  getReturnsByType: (type: string) => ReturnTransaction[]
  getPendingApprovals: () => ReturnTransaction[]
  getReturnStats: () => ReturnStats
  
  // Policy & Validation
  isWithinReturnPeriod: (transactionDate: string) => boolean
  requiresManagerApproval: (amount: number, items: ReturnItem[]) => boolean
  getApplicableReturnReasons: (condition: string) => ReturnReason[]
}

// Default return reasons
const defaultReturnReasons: ReturnReason[] = [
  {
    id: 'defective',
    label: 'Defective/Damaged',
    requiresManager: false,
    allowsExchange: true,
    restockable: false
  },
  {
    id: 'wrong_item',
    label: 'Wrong Item',
    requiresManager: false,
    allowsExchange: true,
    restockable: true
  },
  {
    id: 'not_as_described',
    label: 'Not as Described',
    requiresManager: false,
    allowsExchange: true,
    restockable: true
  },
  {
    id: 'changed_mind',
    label: 'Changed Mind',
    requiresManager: false,
    allowsExchange: true,
    restockable: true
  },
  {
    id: 'duplicate',
    label: 'Duplicate Purchase',
    requiresManager: false,
    allowsExchange: false,
    restockable: true
  },
  {
    id: 'gift_return',
    label: 'Gift Return',
    requiresManager: false,
    allowsExchange: true,
    restockable: true
  },
  {
    id: 'quality_issues',
    label: 'Quality Issues',
    requiresManager: true,
    allowsExchange: true,
    restockable: false
  },
  {
    id: 'other',
    label: 'Other',
    requiresManager: true,
    allowsExchange: true,
    restockable: false
  }
]

// Default return policy
const defaultReturnPolicy: ReturnPolicy = {
  returnPeriodDays: 30,
  exchangePeriodDays: 30,
  requireReceiptForReturns: false,
  requireReceiptForExchanges: false,
  maxRefundWithoutReceipt: 100,
  managerApprovalThreshold: 100,
  allowDamagedReturns: false,
  allowOpenedReturns: true,
  restockingFee: 0,
  restockingFeeThreshold: 0
}

// Generate unique return transaction ID
const generateReturnId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `RTN-${timestamp}-${random}`.toUpperCase()
}

// Generate return receipt number
const generateReturnReceiptNumber = () => {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const timeStr = date.getTime().toString().slice(-4)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RTN-${dateStr}-${timeStr}-${random}`
}

export const useReturnsStore = create<ReturnsStore>()(
  persist(
    (set, get) => ({
      // Initial State
      returnTransactions: [],
      currentReturn: null,
      searchTerm: '',
      dateFilter: { start: null, end: null },
      statusFilter: null,
      typeFilter: null,
      
      returnReasons: defaultReturnReasons,
      returnPolicy: defaultReturnPolicy,
      
      isProcessing: false,
      currentStep: 'search',
      
      // Actions - Return Management
      createReturn: (type) => {
        const newReturn: Partial<ReturnTransaction> = {
          id: generateReturnId(),
          type,
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          returnItems: [],
          exchangeItems: [],
          refundAmount: 0,
          exchangeDifference: 0,
          totalRefund: 0,
          requiresManagerApproval: false,
          refundMethod: 'original',
          processedBy: 'Current User', // TODO: Get from auth store
          withinReturnPeriod: true,
          returnPolicyViolations: [],
          receiptNumber: generateReturnReceiptNumber(),
          inventoryUpdated: false,
          restockedItems: []
        }
        
        set({ currentReturn: newReturn, currentStep: 'search' })
      },
      
      setCurrentReturn: (returnData) => {
        const { currentReturn } = get()
        set({ 
          currentReturn: currentReturn ? { ...currentReturn, ...returnData } : returnData
        })
      },
      
      addReturnItem: (item) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const updatedReturn = {
          ...currentReturn,
          returnItems: [...(currentReturn.returnItems || []), item]
        }
        
        set({ currentReturn: updatedReturn })
        get().calculateRefundAmount()
      },
      
      removeReturnItem: (itemId) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const updatedReturn = {
          ...currentReturn,
          returnItems: (currentReturn.returnItems || []).filter(item => item.id !== itemId)
        }
        
        set({ currentReturn: updatedReturn })
        get().calculateRefundAmount()
      },
      
      updateReturnItem: (itemId, updates) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const updatedReturn = {
          ...currentReturn,
          returnItems: (currentReturn.returnItems || []).map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        }
        
        set({ currentReturn: updatedReturn })
        get().calculateRefundAmount()
      },
      
      addExchangeItem: (item) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const updatedReturn = {
          ...currentReturn,
          exchangeItems: [...(currentReturn.exchangeItems || []), item]
        }
        
        set({ currentReturn: updatedReturn })
        get().calculateExchangeDifference()
      },
      
      removeExchangeItem: (itemId) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const updatedReturn = {
          ...currentReturn,
          exchangeItems: (currentReturn.exchangeItems || []).filter(item => item.id !== itemId)
        }
        
        set({ currentReturn: updatedReturn })
        get().calculateExchangeDifference()
      },
      
      updateExchangeItem: (itemId, updates) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const updatedReturn = {
          ...currentReturn,
          exchangeItems: (currentReturn.exchangeItems || []).map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          )
        }
        
        set({ currentReturn: updatedReturn })
        get().calculateExchangeDifference()
      },
      
      // Actions - Processing
      calculateRefundAmount: () => {
        const { currentReturn } = get()
        if (!currentReturn || !currentReturn.returnItems) return 0
        
        const refundAmount = currentReturn.returnItems.reduce(
          (total, item) => total + (item.price * item.returnQuantity), 0
        )
        
        get().setCurrentReturn({ refundAmount })
        return refundAmount
      },
      
      calculateExchangeDifference: () => {
        const { currentReturn } = get()
        if (!currentReturn) return 0
        
        const returnValue = (currentReturn.returnItems || []).reduce(
          (total, item) => total + (item.price * item.returnQuantity), 0
        )
        
        const exchangeValue = (currentReturn.exchangeItems || []).reduce(
          (total, item) => total + (item.newPrice * item.quantity), 0
        )
        
        const difference = exchangeValue - returnValue
        
        get().setCurrentReturn({ exchangeDifference: difference })
        return difference
      },
      
      validateReturn: () => {
        const { currentReturn, returnPolicy } = get()
        if (!currentReturn) return { isValid: false, violations: ['No return transaction'] }
        
        const violations: string[] = []
        
        // Check return period
        if (currentReturn.originalTransaction) {
          const transactionDate = new Date(currentReturn.originalTransaction.date)
          const daysDiff = Math.floor((Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDiff > returnPolicy.returnPeriodDays) {
            violations.push(`Return period exceeded (${daysDiff} days, limit: ${returnPolicy.returnPeriodDays} days)`)
          }
        }
        
        // Check refund limits
        if (!currentReturn.originalTransaction && currentReturn.refundAmount > returnPolicy.maxRefundWithoutReceipt) {
          violations.push(`Refund amount exceeds no-receipt limit ($${currentReturn.refundAmount} > $${returnPolicy.maxRefundWithoutReceipt})`)
        }
        
        // Check item conditions
        const damagedItems = (currentReturn.returnItems || []).filter(item => 
          item.condition === 'damaged' || item.condition === 'defective'
        )
        
        if (damagedItems.length > 0 && !returnPolicy.allowDamagedReturns) {
          violations.push('Policy does not allow returns of damaged items')
        }
        
        get().setCurrentReturn({ 
          returnPolicyViolations: violations,
          withinReturnPeriod: violations.length === 0
        })
        
        return { isValid: violations.length === 0, violations }
      },
      
      submitForApproval: async () => {
        const { currentReturn, requiresManagerApproval } = get()
        if (!currentReturn) return false
        
        const needsApproval = requiresManagerApproval(
          currentReturn.refundAmount || 0, 
          currentReturn.returnItems || []
        )
        
        if (needsApproval) {
          get().setCurrentReturn({ 
            status: 'pending',
            requiresManagerApproval: true 
          })
          set({ currentStep: 'approval' })
        } else {
          set({ currentStep: 'payment' })
        }
        
        return true
      },
      
      approveReturn: (managerId, managerName, reason) => {
        const { currentReturn } = get()
        if (!currentReturn) return
        
        const approval = {
          managerId,
          managerName,
          approvedAt: new Date().toISOString(),
          reason
        }
        
        get().setCurrentReturn({ 
          managerApproval: approval,
          status: 'processing'
        })
        set({ currentStep: 'payment' })
      },
      
      rejectReturn: (reason) => {
        get().setCurrentReturn({ 
          status: 'rejected',
          notes: reason
        })
        set({ currentStep: 'complete' })
      },
      
      processReturn: async (refundMethod) => {
        set({ isProcessing: true })
        
        try {
          const { currentReturn } = get()
          if (!currentReturn) return false
          
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Update inventory
          if (currentReturn.returnItems) {
            get().updateInventoryForReturn(currentReturn.returnItems)
          }
          
          get().setCurrentReturn({ 
            refundMethod: refundMethod as any,
            status: 'completed',
            inventoryUpdated: true
          })
          
          return true
        } catch (error) {
          console.error('Return processing failed:', error)
          return false
        } finally {
          set({ isProcessing: false })
        }
      },
      
      completeReturn: () => {
        const { currentReturn, returnTransactions } = get()
        if (!currentReturn) return
        
        const completedReturn: ReturnTransaction = {
          ...currentReturn,
          status: 'completed'
        } as ReturnTransaction
        
        set({ 
          returnTransactions: [completedReturn, ...returnTransactions],
          currentReturn: null,
          currentStep: 'search'
        })
      },
      
      cancelReturn: () => {
        set({ 
          currentReturn: null,
          currentStep: 'search',
          isProcessing: false
        })
      },
      
      // Actions - Lookups & Search (These would integrate with the transaction store)
      searchTransactions: (query, searchBy) => {
        // This would integrate with the transaction store
        // For now, return empty array - will be implemented in integration
        return []
      },
      
      findTransactionByReceipt: (receiptNumber) => {
        // This would integrate with the transaction store
        return null
      },
      
      findTransactionsByCustomer: (customerId) => {
        // This would integrate with the transaction store
        return []
      },
      
      findTransactionsByDateRange: (start, end) => {
        // This would integrate with the transaction store
        return []
      },
      
      // Actions - Inventory Integration
      updateInventoryForReturn: (returnItems) => {
        // This would integrate with the inventory store
        const restockableItems = returnItems.filter(item => {
          const reason = get().returnReasons.find(r => r.id === item.reason)
          return reason?.restockable && (item.condition === 'new' || item.condition === 'opened')
        })
        
        // Update inventory quantities for restockable items
        restockableItems.forEach(item => {
          // This would call inventory store methods
          console.log(`Restocking ${item.returnQuantity} units of ${item.name}`)
        })
        
        const { currentReturn } = get()
        if (currentReturn) {
          get().setCurrentReturn({
            restockedItems: restockableItems.map(item => item.id)
          })
        }
      },
      
      revertInventoryUpdate: (returnId) => {
        // This would revert inventory changes if return is cancelled
        console.log(`Reverting inventory changes for return ${returnId}`)
      },
      
      // Actions - Filters & UI
      setSearchTerm: (term) => set({ searchTerm: term }),
      setDateFilter: (start, end) => set({ dateFilter: { start, end } }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setTypeFilter: (type) => set({ typeFilter: type }),
      setCurrentStep: (step) => set({ currentStep: step }),
      
      clearFilters: () => set({
        searchTerm: '',
        dateFilter: { start: null, end: null },
        statusFilter: null,
        typeFilter: null
      }),
      
      // Getters
      getFilteredReturns: () => {
        const { returnTransactions, searchTerm, dateFilter, statusFilter, typeFilter } = get()
        let filtered = [...returnTransactions]
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          filtered = filtered.filter(return_ => 
            return_.id.toLowerCase().includes(searchLower) ||
            return_.receiptNumber.toLowerCase().includes(searchLower) ||
            return_.originalReceiptNumber?.toLowerCase().includes(searchLower) ||
            return_.returnItems.some(item => item.name.toLowerCase().includes(searchLower))
          )
        }
        
        if (dateFilter.start) {
          filtered = filtered.filter(return_ => return_.date >= dateFilter.start!)
        }
        if (dateFilter.end) {
          filtered = filtered.filter(return_ => return_.date <= dateFilter.end!)
        }
        
        if (statusFilter) {
          filtered = filtered.filter(return_ => return_.status === statusFilter)
        }
        
        if (typeFilter) {
          filtered = filtered.filter(return_ => return_.type === typeFilter)
        }
        
        return filtered.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
      },
      
      getReturnById: (id) => {
        return get().returnTransactions.find(return_ => return_.id === id)
      },
      
      getReturnsByStatus: (status) => {
        return get().returnTransactions.filter(return_ => return_.status === status)
      },
      
      getReturnsByType: (type) => {
        return get().returnTransactions.filter(return_ => return_.type === type)
      },
      
      getPendingApprovals: () => {
        return get().returnTransactions.filter(return_ => 
          return_.status === 'pending' && return_.requiresManagerApproval
        )
      },
      
      getReturnStats: () => {
        const { returnTransactions } = get()
        const completedReturns = returnTransactions.filter(r => r.status === 'completed')
        
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const todayReturns = completedReturns.filter(r => r.date === today)
        const weekReturns = completedReturns.filter(r => r.date >= weekAgo)
        const monthReturns = completedReturns.filter(r => r.date >= monthAgo)
        
        const totalRefundAmount = completedReturns.reduce((sum, r) => sum + r.totalRefund, 0)
        const averageRefundAmount = completedReturns.length > 0 ? totalRefundAmount / completedReturns.length : 0
        
        // Calculate return reasons statistics
        const reasonCounts: Record<string, number> = {}
        completedReturns.forEach(return_ => {
          return_.returnItems.forEach(item => {
            reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1
          })
        })
        
        const topReturnReasons = Object.entries(reasonCounts)
          .map(([reason, count]) => ({
            reason,
            count,
            percentage: (count / Object.values(reasonCounts).reduce((a, b) => a + b, 0)) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        return {
          totalReturns: returnTransactions.filter(r => r.type === 'return').length,
          totalRefunds: returnTransactions.filter(r => r.type === 'refund').length,
          totalExchanges: returnTransactions.filter(r => r.type === 'exchange').length,
          totalRefundAmount: Math.round(totalRefundAmount * 100) / 100,
          todayReturns: todayReturns.length,
          weekReturns: weekReturns.length,
          monthReturns: monthReturns.length,
          averageRefundAmount: Math.round(averageRefundAmount * 100) / 100,
          returnRate: 0, // Would need sales data to calculate
          topReturnReasons
        }
      },
      
      // Policy & Validation
      isWithinReturnPeriod: (transactionDate) => {
        const { returnPolicy } = get()
        const daysDiff = Math.floor((Date.now() - new Date(transactionDate).getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= returnPolicy.returnPeriodDays
      },
      
      requiresManagerApproval: (amount, items) => {
        const { returnPolicy } = get()
        
        // High value returns
        if (amount > returnPolicy.managerApprovalThreshold) {
          return true
        }
        
        // Items requiring manager approval
        const { returnReasons } = get()
        const hasManagerRequiredReason = items.some(item => {
          const reason = returnReasons.find(r => r.id === item.reason)
          return reason?.requiresManager
        })
        
        if (hasManagerRequiredReason) {
          return true
        }
        
        // Damaged items
        const hasDamagedItems = items.some(item => 
          item.condition === 'damaged' || item.condition === 'defective'
        )
        
        return hasDamagedItems
      },
      
      getApplicableReturnReasons: (condition) => {
        const { returnReasons } = get()
        
        if (condition === 'damaged' || condition === 'defective') {
          return returnReasons.filter(r => r.id === 'defective' || r.id === 'quality_issues' || r.id === 'other')
        }
        
        return returnReasons
      }
    }),
    {
      name: 'returns-store',
      partialize: (state) => ({
        returnTransactions: state.returnTransactions,
        returnReasons: state.returnReasons,
        returnPolicy: state.returnPolicy
      })
    }
  )
)