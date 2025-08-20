import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Expense {
  id: string
  description: string
  amount: number
  currency: 'USD' | 'LBP'
  amountInUsd?: number // Calculated USD equivalent
  category: string
  timestamp: Date
  cashier?: string
  exchangeRate?: number // Rate at time of expense
}

export interface CashCount {
  id: string
  timestamp: Date
  cashier: string
  // USD Denominations
  usdDenominations: {
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
  // LBP Denominations
  lbpDenominations: {
    millions: number       // 1,000,000
    fiveHundredThousands: number // 500,000
    twoFiftyThousands: number    // 250,000
    hundredThousands: number      // 100,000
    fiftyThousands: number        // 50,000
    twentyThousands: number       // 20,000
    tenThousands: number          // 10,000
    fiveThousands: number         // 5,000
    thousands: number             // 1,000
    fiveHundreds: number          // 500
  }
  totalCountedUsd: number
  totalCountedLbp: number
  expectedAmountUsd: number
  expectedAmountLbp: number
  varianceUsd: number
  varianceLbp: number
  exchangeRate: number
  notes?: string
}

export interface CashDrawerReport {
  id: string
  date: string
  openingBalanceUsd: number
  openingBalanceLbp: number
  closingBalanceUsd: number
  closingBalanceLbp: number
  cashSalesUsd: number
  cashSalesLbp: number
  mixedPaymentSales: number // Total in USD
  expensesUsd: number
  expensesLbp: number
  depositsUsd: number
  depositsLbp: number
  withdrawalsUsd: number
  withdrawalsLbp: number
  varianceUsd: number
  varianceLbp: number
  exchangeRate: number
  cashCounts: CashCount[]
  expenses_list: Expense[]
  timestamp: Date
}

interface CashManagementState {
  // Cash drawer state - Dual Currency
  currentDrawerAmountUsd: number
  currentDrawerAmountLbp: number
  openingBalanceUsd: number
  openingBalanceLbp: number
  
  // Expenses
  expenses: Expense[]
  
  // Cash counts
  cashCounts: CashCount[]
  
  // Daily reports
  dailyReports: CashDrawerReport[]
  
  // Actions - Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'amountInUsd'>, exchangeRate: number) => void
  removeExpense: (id: string) => void
  removeMultipleExpenses: (ids: string[]) => void
  clearAllExpenses: () => void
  getTodaysExpenses: () => Expense[]
  getAllExpenses: () => Expense[]
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[]
  getTotalExpensesToday: () => { usd: number, lbp: number }
  
  // Actions - Cash Drawer
  setOpeningBalance: (amountUsd: number, amountLbp: number) => void
  updateDrawerAmount: (amountUsd: number, amountLbp: number, isAddition?: boolean) => void
  addSaleToDrawer: (amountUsd: number, amountLbp: number) => void
  
  // Actions - Cash Count
  addCashCount: (count: Omit<CashCount, 'id' | 'timestamp'>) => void
  getLatestCashCount: () => CashCount | null
  
  // Actions - Reports
  generateDailyReport: (exchangeRate: number) => CashDrawerReport
  getDailyReport: (date: string) => CashDrawerReport | null
  
  // Utility actions
  clearOldData: (daysToKeep?: number) => void
}

const calculateTotalUsd = (denominations: CashCount['usdDenominations']): number => {
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

const calculateTotalLbp = (denominations: CashCount['lbpDenominations']): number => {
  return (
    denominations.millions * 1000000 +
    denominations.fiveHundredThousands * 500000 +
    denominations.twoFiftyThousands * 250000 +
    denominations.hundredThousands * 100000 +
    denominations.fiftyThousands * 50000 +
    denominations.twentyThousands * 20000 +
    denominations.tenThousands * 10000 +
    denominations.fiveThousands * 5000 +
    denominations.thousands * 1000 +
    denominations.fiveHundreds * 500
  )
}

export const useCashManagementStore = create<CashManagementState>()(
  persist(
    (set, get) => ({
      // Initial state - Dual Currency
      currentDrawerAmountUsd: 200.00, // Starting USD cash
      currentDrawerAmountLbp: 5000000, // Starting LBP cash (5 million)
      openingBalanceUsd: 200.00,
      openingBalanceLbp: 5000000,
      expenses: [],
      cashCounts: [],
      dailyReports: [],

      // Expense actions
      addExpense: (expenseData, exchangeRate) => {
        const expense: Expense = {
          ...expenseData,
          id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(),
          exchangeRate,
          amountInUsd: expenseData.currency === 'USD' 
            ? expenseData.amount 
            : expenseData.amount / exchangeRate
        }
        
        const { expenses, currentDrawerAmountUsd, currentDrawerAmountLbp } = get()
        
        if (expense.currency === 'USD') {
          set({
            expenses: [expense, ...expenses],
            currentDrawerAmountUsd: currentDrawerAmountUsd - expense.amount
          })
        } else {
          set({
            expenses: [expense, ...expenses],
            currentDrawerAmountLbp: currentDrawerAmountLbp - expense.amount
          })
        }
      },

      removeExpense: (id) => {
        const { expenses } = get()
        const expense = expenses.find(e => e.id === id)
        if (expense) {
          if (expense.currency === 'USD') {
            set({
              expenses: expenses.filter(e => e.id !== id),
              currentDrawerAmountUsd: get().currentDrawerAmountUsd + expense.amount
            })
          } else {
            set({
              expenses: expenses.filter(e => e.id !== id),
              currentDrawerAmountLbp: get().currentDrawerAmountLbp + expense.amount
            })
          }
        }
      },

      removeMultipleExpenses: (ids) => {
        const { expenses, currentDrawerAmountUsd, currentDrawerAmountLbp } = get()
        const expensesToRemove = expenses.filter(e => ids.includes(e.id))
        
        let usdRefund = 0
        let lbpRefund = 0
        
        expensesToRemove.forEach(expense => {
          if (expense.currency === 'USD') {
            usdRefund += expense.amount
          } else {
            lbpRefund += expense.amount
          }
        })
        
        set({
          expenses: expenses.filter(e => !ids.includes(e.id)),
          currentDrawerAmountUsd: currentDrawerAmountUsd + usdRefund,
          currentDrawerAmountLbp: currentDrawerAmountLbp + lbpRefund
        })
      },

      clearAllExpenses: () => {
        const { expenses, currentDrawerAmountUsd, currentDrawerAmountLbp } = get()
        
        let usdRefund = 0
        let lbpRefund = 0
        
        expenses.forEach(expense => {
          if (expense.currency === 'USD') {
            usdRefund += expense.amount
          } else {
            lbpRefund += expense.amount
          }
        })
        
        set({
          expenses: [],
          currentDrawerAmountUsd: currentDrawerAmountUsd + usdRefund,
          currentDrawerAmountLbp: currentDrawerAmountLbp + lbpRefund
        })
      },

      getTodaysExpenses: () => {
        const { expenses } = get()
        const today = new Date().toDateString()
        return expenses.filter(expense => 
          new Date(expense.timestamp).toDateString() === today
        )
      },

      getAllExpenses: () => {
        return get().expenses
      },

      getExpensesByDateRange: (startDate, endDate) => {
        const { expenses } = get()
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.timestamp)
          return expenseDate >= startDate && expenseDate <= endDate
        })
      },

      getTotalExpensesToday: () => {
        const todaysExpenses = get().getTodaysExpenses()
        return {
          usd: todaysExpenses
            .filter(e => e.currency === 'USD')
            .reduce((sum, expense) => sum + expense.amount, 0),
          lbp: todaysExpenses
            .filter(e => e.currency === 'LBP')
            .reduce((sum, expense) => sum + expense.amount, 0)
        }
      },

      // Cash drawer actions
      setOpeningBalance: (amountUsd, amountLbp) => {
        set({
          openingBalanceUsd: amountUsd,
          openingBalanceLbp: amountLbp,
          currentDrawerAmountUsd: amountUsd,
          currentDrawerAmountLbp: amountLbp
        })
      },

      updateDrawerAmount: (amountUsd, amountLbp, isAddition = true) => {
        const { currentDrawerAmountUsd, currentDrawerAmountLbp } = get()
        if (isAddition) {
          set({
            currentDrawerAmountUsd: currentDrawerAmountUsd + amountUsd,
            currentDrawerAmountLbp: currentDrawerAmountLbp + amountLbp
          })
        } else {
          set({
            currentDrawerAmountUsd: currentDrawerAmountUsd - amountUsd,
            currentDrawerAmountLbp: currentDrawerAmountLbp - amountLbp
          })
        }
      },

      addSaleToDrawer: (amountUsd, amountLbp) => {
        const { currentDrawerAmountUsd, currentDrawerAmountLbp } = get()
        set({
          currentDrawerAmountUsd: currentDrawerAmountUsd + amountUsd,
          currentDrawerAmountLbp: currentDrawerAmountLbp + amountLbp
        })
      },

      // Cash count actions
      addCashCount: (countData) => {
        const cashCount: CashCount = {
          ...countData,
          id: `CC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: new Date(),
          totalCountedUsd: calculateTotalUsd(countData.usdDenominations),
          totalCountedLbp: calculateTotalLbp(countData.lbpDenominations),
          varianceUsd: calculateTotalUsd(countData.usdDenominations) - countData.expectedAmountUsd,
          varianceLbp: calculateTotalLbp(countData.lbpDenominations) - countData.expectedAmountLbp
        }
        
        set({
          cashCounts: [cashCount, ...get().cashCounts]
        })
      },

      getLatestCashCount: () => {
        const { cashCounts } = get()
        return cashCounts.length > 0 ? cashCounts[0] : null
      },

      // Report actions
      generateDailyReport: (exchangeRate) => {
        const { 
          openingBalanceUsd, 
          openingBalanceLbp,
          currentDrawerAmountUsd,
          currentDrawerAmountLbp,
          cashCounts,
          expenses 
        } = get()
        
        const today = new Date().toDateString()
        const todaysCashCounts = cashCounts.filter(
          cc => new Date(cc.timestamp).toDateString() === today
        )
        const todaysExpenses = expenses.filter(
          e => new Date(e.timestamp).toDateString() === today
        )
        
        const totalExpensesUsd = todaysExpenses
          .filter(e => e.currency === 'USD')
          .reduce((sum, e) => sum + e.amount, 0)
        const totalExpensesLbp = todaysExpenses
          .filter(e => e.currency === 'LBP')
          .reduce((sum, e) => sum + e.amount, 0)
        
        const cashSalesUsd = currentDrawerAmountUsd - openingBalanceUsd + totalExpensesUsd
        const cashSalesLbp = currentDrawerAmountLbp - openingBalanceLbp + totalExpensesLbp
        
        const latestCount = todaysCashCounts[0]
        const varianceUsd = latestCount ? latestCount.varianceUsd : 0
        const varianceLbp = latestCount ? latestCount.varianceLbp : 0
        
        const report: CashDrawerReport = {
          id: `CDR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          date: today,
          openingBalanceUsd,
          openingBalanceLbp,
          closingBalanceUsd: currentDrawerAmountUsd,
          closingBalanceLbp: currentDrawerAmountLbp,
          cashSalesUsd,
          cashSalesLbp,
          mixedPaymentSales: 0, // Will be calculated from actual sales
          expensesUsd: totalExpensesUsd,
          expensesLbp: totalExpensesLbp,
          depositsUsd: 0,
          depositsLbp: 0,
          withdrawalsUsd: 0,
          withdrawalsLbp: 0,
          varianceUsd,
          varianceLbp,
          exchangeRate,
          cashCounts: todaysCashCounts,
          expenses_list: todaysExpenses,
          timestamp: new Date()
        }
        
        set({
          dailyReports: [report, ...get().dailyReports]
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
        
        set({
          expenses: get().expenses.filter(e => new Date(e.timestamp) > cutoffDate),
          cashCounts: get().cashCounts.filter(cc => new Date(cc.timestamp) > cutoffDate),
          dailyReports: get().dailyReports.filter(r => new Date(r.timestamp) > cutoffDate)
        })
      }
    }),
    {
      name: 'cash-management-storage'
    }
  )
)