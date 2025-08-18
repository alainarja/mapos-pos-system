import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  timestamp: Date
  cashier?: string
}

export interface CashCount {
  id: string
  timestamp: Date
  cashier: string
  denominations: {
    hundreds: number
    fifties: number
    twenties: number
    tens: number
    fives: number
    ones: number
    quarters: number
    dimes: number
    nickels: number
    pennies: number
  }
  totalCounted: number
  expectedAmount: number
  variance: number
  notes?: string
}

export interface CashDrawerReport {
  id: string
  date: string
  openingBalance: number
  closingBalance: number
  cashSales: number
  expenses: number
  deposits: number
  withdrawals: number
  variance: number
  cashCounts: CashCount[]
  expenses_list: Expense[]
  timestamp: Date
}

interface CashManagementState {
  // Cash drawer state
  currentDrawerAmount: number
  openingBalance: number
  
  // Expenses
  expenses: Expense[]
  
  // Cash counts
  cashCounts: CashCount[]
  
  // Daily reports
  dailyReports: CashDrawerReport[]
  
  // Actions - Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void
  removeExpense: (id: string) => void
  getTodaysExpenses: () => Expense[]
  getTotalExpensesToday: () => number
  
  // Actions - Cash Drawer
  setOpeningBalance: (amount: number) => void
  updateDrawerAmount: (amount: number) => void
  
  // Actions - Cash Count
  addCashCount: (count: Omit<CashCount, 'id' | 'timestamp'>) => void
  getLatestCashCount: () => CashCount | null
  
  // Actions - Reports
  generateDailyReport: () => CashDrawerReport
  getDailyReport: (date: string) => CashDrawerReport | null
  
  // Utility actions
  clearOldData: (daysToKeep?: number) => void
}

const calculateTotal = (denominations: CashCount['denominations']): number => {
  return (
    denominations.hundreds * 100 +
    denominations.fifties * 50 +
    denominations.twenties * 20 +
    denominations.tens * 10 +
    denominations.fives * 5 +
    denominations.ones * 1 +
    denominations.quarters * 0.25 +
    denominations.dimes * 0.10 +
    denominations.nickels * 0.05 +
    denominations.pennies * 0.01
  )
}

export const useCashManagementStore = create<CashManagementState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentDrawerAmount: 200.00, // Starting cash
      openingBalance: 200.00,
      expenses: [],
      cashCounts: [],
      dailyReports: [],

      // Expense actions
      addExpense: (expenseData) => {
        const expense: Expense = {
          ...expenseData,
          id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date()
        }
        
        const { expenses, currentDrawerAmount } = get()
        
        set({
          expenses: [expense, ...expenses],
          currentDrawerAmount: currentDrawerAmount - expense.amount
        })
      },

      removeExpense: (id) => {
        const { expenses } = get()
        const expense = expenses.find(e => e.id === id)
        if (expense) {
          set({
            expenses: expenses.filter(e => e.id !== id),
            currentDrawerAmount: get().currentDrawerAmount + expense.amount
          })
        }
      },

      getTodaysExpenses: () => {
        const { expenses } = get()
        const today = new Date().toDateString()
        return expenses.filter(expense => 
          new Date(expense.timestamp).toDateString() === today
        )
      },

      getTotalExpensesToday: () => {
        const todaysExpenses = get().getTodaysExpenses()
        return todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      },

      // Cash drawer actions
      setOpeningBalance: (amount) => {
        set({ 
          openingBalance: amount,
          currentDrawerAmount: amount
        })
      },

      updateDrawerAmount: (amount) => {
        set({ currentDrawerAmount: amount })
      },

      // Cash count actions
      addCashCount: (countData) => {
        const totalCounted = calculateTotal(countData.denominations)
        const variance = totalCounted - countData.expectedAmount
        
        const cashCount: CashCount = {
          ...countData,
          id: `COUNT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(),
          totalCounted,
          variance
        }
        
        const { cashCounts } = get()
        
        set({
          cashCounts: [cashCount, ...cashCounts],
          currentDrawerAmount: totalCounted
        })
      },

      getLatestCashCount: () => {
        const { cashCounts } = get()
        return cashCounts.length > 0 ? cashCounts[0] : null
      },

      // Report actions
      generateDailyReport: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        const todaysExpenses = state.getTodaysExpenses()
        const todaysCounts = state.cashCounts.filter(count =>
          new Date(count.timestamp).toDateString() === new Date().toDateString()
        )
        
        // Calculate cash sales from transaction store if available
        let cashSales = 0
        try {
          const transactionStore = localStorage.getItem('transaction-store')
          if (transactionStore) {
            const data = JSON.parse(transactionStore)
            const transactions = data?.state?.transactions || []
            const todaysTransactions = transactions.filter((t: any) => 
              t.date === today && t.paymentMethod === 'Cash'
            )
            cashSales = todaysTransactions.reduce((sum: number, t: any) => sum + t.total, 0)
          }
        } catch (error) {
          console.warn('Could not calculate cash sales:', error)
        }

        const report: CashDrawerReport = {
          id: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          date: today,
          openingBalance: state.openingBalance,
          closingBalance: state.currentDrawerAmount,
          cashSales,
          expenses: todaysExpenses.reduce((sum, e) => sum + e.amount, 0),
          deposits: 0, // TODO: Add deposit tracking
          withdrawals: 0, // TODO: Add withdrawal tracking
          variance: state.currentDrawerAmount - (state.openingBalance + cashSales - todaysExpenses.reduce((sum, e) => sum + e.amount, 0)),
          cashCounts: todaysCounts,
          expenses_list: todaysExpenses,
          timestamp: new Date()
        }

        const { dailyReports } = state
        set({
          dailyReports: [report, ...dailyReports.filter(r => r.date !== today)]
        })

        return report
      },

      getDailyReport: (date) => {
        const { dailyReports } = get()
        return dailyReports.find(report => report.date === date) || null
      },

      // Utility actions
      clearOldData: (daysToKeep = 30) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
        
        const { expenses, cashCounts, dailyReports } = get()
        
        set({
          expenses: expenses.filter(e => new Date(e.timestamp) >= cutoffDate),
          cashCounts: cashCounts.filter(c => new Date(c.timestamp) >= cutoffDate),
          dailyReports: dailyReports.filter(r => new Date(r.date) >= cutoffDate)
        })
      }
    }),
    {
      name: 'cash-management-store',
      // Custom storage with proper date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const data = JSON.parse(str)
          
          // Convert date strings back to Date objects
          if (data?.state?.expenses) {
            data.state.expenses = data.state.expenses.map((e: any) => ({
              ...e,
              timestamp: new Date(e.timestamp)
            }))
          }
          if (data?.state?.cashCounts) {
            data.state.cashCounts = data.state.cashCounts.map((c: any) => ({
              ...c,
              timestamp: new Date(c.timestamp)
            }))
          }
          if (data?.state?.dailyReports) {
            data.state.dailyReports = data.state.dailyReports.map((r: any) => ({
              ...r,
              timestamp: new Date(r.timestamp),
              expenses_list: r.expenses_list ? r.expenses_list.map((e: any) => ({
                ...e,
                timestamp: new Date(e.timestamp)
              })) : []
            }))
          }
          
          return data
        },
        setItem: (name, value) => {
          // Convert Date objects to strings before saving
          const data = {
            ...value,
            state: {
              ...value.state,
              expenses: value.state.expenses.map((e: any) => ({
                ...e,
                timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : e.timestamp
              })),
              cashCounts: value.state.cashCounts.map((c: any) => ({
                ...c,
                timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp
              })),
              dailyReports: value.state.dailyReports.map((r: any) => ({
                ...r,
                timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
                expenses_list: r.expenses_list ? r.expenses_list.map((e: any) => ({
                  ...e,
                  timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : e.timestamp
                })) : []
              }))
            }
          }
          
          localStorage.setItem(name, JSON.stringify(data))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)