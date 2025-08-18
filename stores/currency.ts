import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CurrencyRates {
  USD_TO_LBP: number
  LBP_TO_USD: number
}

export interface PaymentBreakdown {
  usd: number
  lbp: number
  card: number
  digitalWallet: number
  giftCard: number
}

interface CurrencyStore {
  // Exchange rates
  exchangeRates: CurrencyRates
  lastUpdated: string | null
  
  // Cash drawer tracking by currency
  cashDrawer: {
    usd: number
    lbp: number
  }
  
  // Actions
  setExchangeRate: (usdToLbp: number) => void
  convertUsdToLbp: (usdAmount: number) => number
  convertLbpToUsd: (lbpAmount: number) => number
  
  // Cash drawer management
  addToCashDrawer: (currency: 'usd' | 'lbp', amount: number) => void
  removFromCashDrawer: (currency: 'usd' | 'lbp', amount: number) => void
  setCashDrawerAmount: (currency: 'usd' | 'lbp', amount: number) => void
  getCashDrawerTotal: () => { usd: number; lbp: number; usdEquivalent: number }
  
  // Reset for end of day
  resetCashDrawer: () => void
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      exchangeRates: {
        USD_TO_LBP: 89500, // Default rate - should be updated regularly
        LBP_TO_USD: 1 / 89500
      },
      lastUpdated: null,
      cashDrawer: {
        usd: 100, // Starting cash float
        lbp: 500000 // Starting cash float
      },
      
      // Exchange rate actions
      setExchangeRate: (usdToLbp: number) => {
        set({
          exchangeRates: {
            USD_TO_LBP: usdToLbp,
            LBP_TO_USD: 1 / usdToLbp
          },
          lastUpdated: new Date().toISOString()
        })
      },
      
      convertUsdToLbp: (usdAmount: number) => {
        const { exchangeRates } = get()
        return Math.round(usdAmount * exchangeRates.USD_TO_LBP)
      },
      
      convertLbpToUsd: (lbpAmount: number) => {
        const { exchangeRates } = get()
        return Math.round((lbpAmount * exchangeRates.LBP_TO_USD) * 100) / 100
      },
      
      // Cash drawer actions
      addToCashDrawer: (currency: 'usd' | 'lbp', amount: number) => {
        set((state) => ({
          cashDrawer: {
            ...state.cashDrawer,
            [currency]: state.cashDrawer[currency] + amount
          }
        }))
      },
      
      removFromCashDrawer: (currency: 'usd' | 'lbp', amount: number) => {
        set((state) => ({
          cashDrawer: {
            ...state.cashDrawer,
            [currency]: Math.max(0, state.cashDrawer[currency] - amount)
          }
        }))
      },
      
      setCashDrawerAmount: (currency: 'usd' | 'lbp', amount: number) => {
        set((state) => ({
          cashDrawer: {
            ...state.cashDrawer,
            [currency]: Math.max(0, amount)
          }
        }))
      },
      
      getCashDrawerTotal: () => {
        const { cashDrawer, convertLbpToUsd } = get()
        const lbpInUsd = convertLbpToUsd(cashDrawer.lbp)
        return {
          usd: cashDrawer.usd,
          lbp: cashDrawer.lbp,
          usdEquivalent: Math.round((cashDrawer.usd + lbpInUsd) * 100) / 100
        }
      },
      
      resetCashDrawer: () => {
        set({
          cashDrawer: {
            usd: 100,
            lbp: 500000
          }
        })
      }
    }),
    {
      name: 'currency-store'
    }
  )
)