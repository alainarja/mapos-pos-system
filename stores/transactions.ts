import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Transaction, CartItem } from '@/types'

interface TransactionStore {
  // State
  transactions: Transaction[]
  searchTerm: string
  dateFilter: {
    start: string | null
    end: string | null
  }
  paymentMethodFilter: string | null
  amountRangeFilter: {
    min: number | null
    max: number | null
  }
  sortBy: 'date' | 'amount' | 'id'
  sortOrder: 'asc' | 'desc'
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'receiptNumber'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  refundTransaction: (id: string) => Promise<boolean>
  
  // Filters and Search
  setSearchTerm: (term: string) => void
  setDateFilter: (start: string | null, end: string | null) => void
  setPaymentMethodFilter: (method: string | null) => void
  setAmountRangeFilter: (min: number | null, max: number | null) => void
  setSortBy: (sortBy: 'date' | 'amount' | 'id') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearFilters: () => void
  
  // Getters
  getFilteredTransactions: () => Transaction[]
  getTransactionById: (id: string) => Transaction | undefined
  getTransactionsByDateRange: (start: string, end: string) => Transaction[]
  getTotalRevenue: () => number
  getRevenueByPaymentMethod: () => Record<string, number>
  getTransactionStats: () => {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    averageAmount: number
  }
  
  // End-of-Day specific functions
  getDailyReport: (date?: string) => {
    date: string
    totalTransactions: number
    totalRevenue: number
    totalTax: number
    totalDiscount: number
    netSales: number
    paymentMethodBreakdown: Record<string, { count: number; amount: number }>
    topItems: Array<{ name: string; quantity: number; revenue: number }>
    hourlyBreakdown: Array<{ hour: string; count: number; amount: number }>
    refundsCount: number
    refundsAmount: number
    averageTransaction: number
    cashierPerformance: Array<{ cashier: string; count: number; amount: number }>
  }
  getShiftSummary: (startTime: string, endTime: string, cashier?: string) => {
    startTime: string
    endTime: string
    cashier: string | null
    transactions: Transaction[]
    totalRevenue: number
    transactionCount: number
    averageTransaction: number
    paymentMethods: Record<string, number>
  }
  getCashReconciliation: (date?: string) => {
    date: string
    expectedCash: number
    actualCash: number | null
    variance: number | null
    cashTransactions: Transaction[]
    cashSales: number
    cashRefunds: number
  }
}

// Generate a unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `TXN-${timestamp}-${random}`.toUpperCase()
}

// Generate a receipt number
const generateReceiptNumber = () => {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const timeStr = date.getTime().toString().slice(-4)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${dateStr}-${timeStr}-${random}`
}

// Mock transaction data with proper structure
const generateMockTransactions = (): Transaction[] => {
  const today = new Date()
  const mockTransactions: Transaction[] = []
  
  // Generate transactions for the last 30 days
  for (let i = 0; i < 50; i++) {
    const transactionDate = new Date(today.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000))
    const items: CartItem[] = []
    const itemCount = Math.floor(Math.random() * 5) + 1
    
    let subtotal = 0
    for (let j = 0; j < itemCount; j++) {
      const mockItems = [
        { name: "Golden Croissant", price: 4.50, image: "/golden-croissant.png" },
        { name: "Blueberry Muffin", price: 3.25, image: "/blueberry-muffin.png" },
        { name: "Chocolate Bar", price: 2.99, image: "/chocolate-bar.png" },
        { name: "Cup of Green Tea", price: 2.50, image: "/cup-of-green-tea.png" },
        { name: "Protein Bar", price: 5.99, image: "/protein-bar.png" },
        { name: "Coffee Beans", price: 8.99, image: "/pile-of-coffee-beans.png" },
        { name: "Energy Drink", price: 3.49, image: "/vibrant-energy-drink.png" },
        { name: "Wrap Sandwich", price: 7.25, image: "/wrap-sandwich.png" }
      ]
      
      const mockItem = mockItems[Math.floor(Math.random() * mockItems.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const itemTotal = mockItem.price * quantity
      
      items.push({
        id: `item-${j}-${i}`,
        name: mockItem.name,
        price: mockItem.price,
        quantity: quantity,
        image: mockItem.image
      })
      
      subtotal += itemTotal
    }
    
    const tax = subtotal * 0.08
    const discount = Math.random() > 0.8 ? subtotal * (Math.random() * 0.2) : 0
    const total = subtotal + tax - discount
    
    const paymentMethods = ["Cash", "Card", "Digital Wallet", "Gift Card"]
    const cashiers = ["John Smith", "Sarah Johnson", "Mike Wilson", "Emma Davis", "Current User"]
    const statuses: Transaction['status'][] = ["completed", "completed", "completed", "refunded", "cancelled"]
    
    mockTransactions.push({
      id: generateTransactionId(),
      date: transactionDate.toISOString().split('T')[0],
      time: transactionDate.toLocaleTimeString('en-US', { hour12: false }),
      total: Math.round(total * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      items: items,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      cashier: cashiers[Math.floor(Math.random() * cashiers.length)],
      customerId: Math.random() > 0.5 ? `customer-${Math.floor(Math.random() * 10)}` : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      receiptNumber: generateReceiptNumber()
    })
  }
  
  return mockTransactions.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      // Initial State
      transactions: generateMockTransactions(),
      searchTerm: '',
      dateFilter: {
        start: null,
        end: null
      },
      paymentMethodFilter: null,
      amountRangeFilter: {
        min: null,
        max: null
      },
      sortBy: 'date',
      sortOrder: 'desc',
      
      // Actions
      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: generateTransactionId(),
          receiptNumber: generateReceiptNumber()
        }
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions]
        }))
      },
      
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map(transaction =>
            transaction.id === id ? { ...transaction, ...updates } : transaction
          )
        }))
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(transaction => transaction.id !== id)
        }))
      },
      
      refundTransaction: async (id) => {
        try {
          const transaction = get().getTransactionById(id)
          if (!transaction || transaction.status !== 'completed') {
            return false
          }
          
          // Create refund transaction
          const refundTransaction: Transaction = {
            ...transaction,
            id: generateTransactionId(),
            receiptNumber: generateReceiptNumber(),
            total: -transaction.total,
            subtotal: -transaction.subtotal,
            tax: -transaction.tax,
            discount: -transaction.discount,
            status: 'refunded' as const,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            items: transaction.items.map(item => ({ ...item, quantity: -item.quantity }))
          }
          
          // Update original transaction status
          get().updateTransaction(id, { status: 'refunded' })
          
          // Add refund transaction
          set((state) => ({
            transactions: [refundTransaction, ...state.transactions]
          }))
          
          return true
        } catch (error) {
          console.error('Refund failed:', error)
          return false
        }
      },
      
      // Filters and Search
      setSearchTerm: (term) => set({ searchTerm: term }),
      setDateFilter: (start, end) => set({ dateFilter: { start, end } }),
      setPaymentMethodFilter: (method) => set({ paymentMethodFilter: method }),
      setAmountRangeFilter: (min, max) => set({ amountRangeFilter: { min, max } }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      
      clearFilters: () => set({
        searchTerm: '',
        dateFilter: { start: null, end: null },
        paymentMethodFilter: null,
        amountRangeFilter: { min: null, max: null },
        sortBy: 'date',
        sortOrder: 'desc'
      }),
      
      // Getters
      getFilteredTransactions: () => {
        const state = get()
        let filtered = [...state.transactions]
        
        // Search filter
        if (state.searchTerm) {
          const searchLower = state.searchTerm.toLowerCase()
          filtered = filtered.filter(transaction =>
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.receiptNumber.toLowerCase().includes(searchLower) ||
            transaction.cashier.toLowerCase().includes(searchLower) ||
            transaction.paymentMethod.toLowerCase().includes(searchLower) ||
            transaction.items.some(item => item.name.toLowerCase().includes(searchLower))
          )
        }
        
        // Date filter
        if (state.dateFilter.start) {
          filtered = filtered.filter(transaction => transaction.date >= state.dateFilter.start!)
        }
        if (state.dateFilter.end) {
          filtered = filtered.filter(transaction => transaction.date <= state.dateFilter.end!)
        }
        
        // Payment method filter
        if (state.paymentMethodFilter) {
          filtered = filtered.filter(transaction => transaction.paymentMethod === state.paymentMethodFilter)
        }
        
        // Amount range filter
        if (state.amountRangeFilter.min !== null) {
          filtered = filtered.filter(transaction => Math.abs(transaction.total) >= state.amountRangeFilter.min!)
        }
        if (state.amountRangeFilter.max !== null) {
          filtered = filtered.filter(transaction => Math.abs(transaction.total) <= state.amountRangeFilter.max!)
        }
        
        // Sort
        filtered.sort((a, b) => {
          let aValue: string | number
          let bValue: string | number
          
          switch (state.sortBy) {
            case 'date':
              aValue = new Date(`${a.date} ${a.time}`).getTime()
              bValue = new Date(`${b.date} ${b.time}`).getTime()
              break
            case 'amount':
              aValue = Math.abs(a.total)
              bValue = Math.abs(b.total)
              break
            case 'id':
            default:
              aValue = a.id
              bValue = b.id
              break
          }
          
          if (state.sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
        
        return filtered
      },
      
      getTransactionById: (id) => {
        return get().transactions.find(transaction => transaction.id === id)
      },
      
      getTransactionsByDateRange: (start, end) => {
        return get().transactions.filter(transaction => 
          transaction.date >= start && transaction.date <= end
        )
      },
      
      getTotalRevenue: () => {
        return get().transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, transaction) => sum + transaction.total, 0)
      },
      
      getRevenueByPaymentMethod: () => {
        const transactions = get().transactions.filter(t => t.status === 'completed')
        const revenue: Record<string, number> = {}
        
        transactions.forEach(transaction => {
          if (!revenue[transaction.paymentMethod]) {
            revenue[transaction.paymentMethod] = 0
          }
          revenue[transaction.paymentMethod] += transaction.total
        })
        
        return revenue
      },
      
      getTransactionStats: () => {
        const transactions = get().transactions.filter(t => t.status === 'completed')
        const today = new Date().toISOString().split('T')[0]
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const todayTransactions = transactions.filter(t => t.date === today)
        const weekTransactions = transactions.filter(t => t.date >= weekAgo)
        const monthTransactions = transactions.filter(t => t.date >= monthAgo)
        
        const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
        const averageAmount = transactions.length > 0 ? totalRevenue / transactions.length : 0
        
        return {
          total: transactions.length,
          today: todayTransactions.length,
          thisWeek: weekTransactions.length,
          thisMonth: monthTransactions.length,
          averageAmount: Math.round(averageAmount * 100) / 100
        }
      },

      // End-of-Day specific functions
      getDailyReport: (date) => {
        const reportDate = date || new Date().toISOString().split('T')[0]
        const dayTransactions = get().transactions.filter(t => t.date === reportDate)
        const completedTransactions = dayTransactions.filter(t => t.status === 'completed')
        const refundTransactions = dayTransactions.filter(t => t.status === 'refunded')
        
        // Basic totals
        const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0)
        const totalTax = completedTransactions.reduce((sum, t) => sum + t.tax, 0)
        const totalDiscount = completedTransactions.reduce((sum, t) => sum + t.discount, 0)
        const netSales = totalRevenue - totalDiscount
        const refundsAmount = Math.abs(refundTransactions.reduce((sum, t) => sum + t.total, 0))
        
        // Payment method breakdown
        const paymentMethodBreakdown: Record<string, { count: number; amount: number }> = {}
        completedTransactions.forEach(t => {
          if (!paymentMethodBreakdown[t.paymentMethod]) {
            paymentMethodBreakdown[t.paymentMethod] = { count: 0, amount: 0 }
          }
          paymentMethodBreakdown[t.paymentMethod].count += 1
          paymentMethodBreakdown[t.paymentMethod].amount += t.total
        })
        
        // Top items
        const itemSales: Record<string, { quantity: number; revenue: number }> = {}
        completedTransactions.forEach(t => {
          t.items.forEach(item => {
            if (!itemSales[item.name]) {
              itemSales[item.name] = { quantity: 0, revenue: 0 }
            }
            itemSales[item.name].quantity += item.quantity
            itemSales[item.name].revenue += item.price * item.quantity
          })
        })
        const topItems = Object.entries(itemSales)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)
        
        // Hourly breakdown
        const hourlyData: Record<string, { count: number; amount: number }> = {}
        for (let i = 0; i < 24; i++) {
          const hour = i.toString().padStart(2, '0') + ':00'
          hourlyData[hour] = { count: 0, amount: 0 }
        }
        
        completedTransactions.forEach(t => {
          const hour = t.time.split(':')[0] + ':00'
          if (hourlyData[hour]) {
            hourlyData[hour].count += 1
            hourlyData[hour].amount += t.total
          }
        })
        
        const hourlyBreakdown = Object.entries(hourlyData)
          .map(([hour, data]) => ({ hour, ...data }))
          .filter(entry => entry.count > 0)
        
        // Cashier performance
        const cashierData: Record<string, { count: number; amount: number }> = {}
        completedTransactions.forEach(t => {
          if (!cashierData[t.cashier]) {
            cashierData[t.cashier] = { count: 0, amount: 0 }
          }
          cashierData[t.cashier].count += 1
          cashierData[t.cashier].amount += t.total
        })
        
        const cashierPerformance = Object.entries(cashierData)
          .map(([cashier, data]) => ({ cashier, ...data }))
          .sort((a, b) => b.amount - a.amount)
        
        return {
          date: reportDate,
          totalTransactions: completedTransactions.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalTax: Math.round(totalTax * 100) / 100,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          netSales: Math.round(netSales * 100) / 100,
          paymentMethodBreakdown,
          topItems,
          hourlyBreakdown,
          refundsCount: refundTransactions.length,
          refundsAmount: Math.round(refundsAmount * 100) / 100,
          averageTransaction: completedTransactions.length > 0 ? Math.round((totalRevenue / completedTransactions.length) * 100) / 100 : 0,
          cashierPerformance
        }
      },
      
      getShiftSummary: (startTime, endTime, cashier) => {
        const shiftTransactions = get().transactions.filter(t => {
          const transactionDateTime = new Date(`${t.date} ${t.time}`)
          const shiftStart = new Date(startTime)
          const shiftEnd = new Date(endTime)
          
          const matchesCashier = !cashier || t.cashier === cashier
          const inTimeRange = transactionDateTime >= shiftStart && transactionDateTime <= shiftEnd
          
          return matchesCashier && inTimeRange && t.status === 'completed'
        })
        
        const totalRevenue = shiftTransactions.reduce((sum, t) => sum + t.total, 0)
        const averageTransaction = shiftTransactions.length > 0 ? totalRevenue / shiftTransactions.length : 0
        
        // Payment method breakdown for shift
        const paymentMethods: Record<string, number> = {}
        shiftTransactions.forEach(t => {
          paymentMethods[t.paymentMethod] = (paymentMethods[t.paymentMethod] || 0) + t.total
        })
        
        return {
          startTime,
          endTime,
          cashier: cashier || null,
          transactions: shiftTransactions,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          transactionCount: shiftTransactions.length,
          averageTransaction: Math.round(averageTransaction * 100) / 100,
          paymentMethods
        }
      },
      
      getCashReconciliation: (date) => {
        const reconciliationDate = date || new Date().toISOString().split('T')[0]
        const cashTransactions = get().transactions.filter(t => 
          t.date === reconciliationDate && 
          t.paymentMethod === 'Cash' && 
          t.status === 'completed'
        )
        
        const cashRefunds = get().transactions.filter(t =>
          t.date === reconciliationDate &&
          t.paymentMethod === 'Cash' &&
          t.status === 'refunded' &&
          t.total < 0
        )
        
        const cashSales = cashTransactions.reduce((sum, t) => sum + t.total, 0)
        const cashRefundsAmount = Math.abs(cashRefunds.reduce((sum, t) => sum + t.total, 0))
        const expectedCash = cashSales - cashRefundsAmount
        
        // actualCash would be set by the cashier during end-of-day process
        // variance would be calculated when actualCash is provided
        
        return {
          date: reconciliationDate,
          expectedCash: Math.round(expectedCash * 100) / 100,
          actualCash: null, // To be filled during cash counting
          variance: null, // To be calculated when actualCash is provided
          cashTransactions,
          cashSales: Math.round(cashSales * 100) / 100,
          cashRefunds: Math.round(cashRefundsAmount * 100) / 100
        }
      }
    }),
    {
      name: 'transaction-store'
    }
  )
)