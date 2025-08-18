import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings } from '@/types'

interface SettingsState {
  settings: Settings
  
  // Actions
  updateStoreSettings: (updates: Partial<Settings['store']>) => void
  updateCurrencySettings: (updates: Partial<Settings['currency']>) => void
  updateReceiptSettings: (updates: Partial<Settings['receipt']>) => void
  updatePaymentSettings: (updates: Partial<Settings['payment']>) => void
  updateInventorySettings: (updates: Partial<Settings['inventory']>) => void
  updatePrintSettings: (updates: Partial<Settings['print']>) => void
  updateThemeSettings: (updates: Partial<Settings['theme']>) => void
  updateSoundSettings: (updates: Partial<Settings['sound']>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const defaultSettings: Settings = {
  store: {
    name: "MAPOS Retail Store",
    address: {
      street: "123 Commerce Street",
      city: "Business City",
      state: "BC",
      zipCode: "12345",
      country: "USA"
    },
    phone: "(555) 123-4567",
    email: "contact@mapos.com",
    taxRate: 0.08,
    currency: "USD",
    timezone: "America/New_York"
  },
  currency: {
    primaryCurrency: 'USD',
    secondaryCurrency: 'LBP',
    exchangeRate: 89500,
    autoUpdateRate: false,
    showBothCurrencies: true,
    acceptUsdCash: true,
    acceptLbpCash: true
  },
  receipt: {
    header: "Thank you for your purchase!",
    footer: "Visit us again soon!",
    logo: "/images/mapos-logo.png",
    showLogo: true
  },
  payment: {
    acceptCash: true,
    acceptCard: true,
    acceptDigitalWallet: true,
    acceptGiftCard: true
  },
  inventory: {
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    enableBarcodeScanning: true
  },
  print: {
    autoPrintEnabled: true,
    printImmediately: true,
    showPreview: false,
    customerCopy: true,
    merchantCopy: false,
    confirmBeforePrint: false,
    printDelay: 1,
    defaultPrinter: 'default',
    includeLogo: true,
    includeBarcode: true,
    includeCustomerInfo: true,
    paperSize: 'thermal'
  },
  theme: {
    mode: 'light',
    primaryColor: '#8b5cf6'
  },
  sound: {
    enabled: true,
    volume: 0.7,
    clickSound: true,
    successSound: true,
    errorSound: true,
    specialSound: true
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateStoreSettings: (updates: Partial<Settings['store']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            store: { ...settings.store, ...updates }
          }
        })
      },

      updateCurrencySettings: (updates: Partial<Settings['currency']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            currency: { ...settings.currency, ...updates }
          }
        })
      },

      updateReceiptSettings: (updates: Partial<Settings['receipt']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            receipt: { ...settings.receipt, ...updates }
          }
        })
      },

      updatePaymentSettings: (updates: Partial<Settings['payment']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            payment: { ...settings.payment, ...updates }
          }
        })
      },

      updateInventorySettings: (updates: Partial<Settings['inventory']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            inventory: { ...settings.inventory, ...updates }
          }
        })
      },

      updatePrintSettings: (updates: Partial<Settings['print']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            print: { ...settings.print, ...updates }
          }
        })
      },

      updateThemeSettings: (updates: Partial<Settings['theme']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            theme: { ...settings.theme, ...updates }
          }
        })
      },

      updateSoundSettings: (updates: Partial<Settings['sound']>) => {
        const { settings } = get()
        set({
          settings: {
            ...settings,
            sound: { ...settings.sound, ...updates }
          }
        })
      },

      resetSettings: () => {
        set({ settings: defaultSettings })
      },

      exportSettings: () => {
        const { settings } = get()
        return JSON.stringify(settings, null, 2)
      },

      importSettings: (settingsJson: string): boolean => {
        try {
          const importedSettings = JSON.parse(settingsJson) as Settings
          // Validate the settings structure (basic validation)
          if (importedSettings.store && importedSettings.theme && importedSettings.payment) {
            set({ settings: { ...defaultSettings, ...importedSettings } })
            return true
          }
          return false
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      }
    }),
    {
      name: 'settings-storage'
    }
  )
)