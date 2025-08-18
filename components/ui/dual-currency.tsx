"use client"

import { useSettingsStore } from "@/stores/settings"
import { DollarSign } from "lucide-react"

interface DualCurrencyProps {
  amount: number
  showSymbol?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  primaryOnly?: boolean
}

export function DualCurrency({ 
  amount, 
  showSymbol = true, 
  className = "",
  size = 'md',
  primaryOnly = false 
}: DualCurrencyProps) {
  const { settings } = useSettingsStore()
  
  // Provide defaults in case currency settings don't exist
  const currencySettings = settings.currency || {
    primaryCurrency: 'USD' as const,
    secondaryCurrency: 'LBP' as const,
    exchangeRate: 89500,
    showBothCurrencies: false
  }
  
  const { primaryCurrency, secondaryCurrency, exchangeRate, showBothCurrencies } = currencySettings
  
  // Convert amount based on primary currency
  const usdAmount = primaryCurrency === 'USD' ? amount : amount / exchangeRate
  const lbpAmount = primaryCurrency === 'LBP' ? amount : amount * exchangeRate
  
  const formatUsd = (value: number) => {
    if (showSymbol) {
      return `$${value.toFixed(2)}`
    }
    return value.toFixed(2)
  }
  
  const formatLbp = (value: number) => {
    if (showSymbol) {
      return `${Math.round(value).toLocaleString()} LBP`
    }
    return Math.round(value).toLocaleString()
  }
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  // If only showing one currency or dual currency is disabled
  if (primaryOnly || !showBothCurrencies) {
    return (
      <span className={`${sizeClasses[size]} ${className}`}>
        {primaryCurrency === 'USD' ? formatUsd(usdAmount) : formatLbp(lbpAmount)}
      </span>
    )
  }
  
  // Show both currencies
  return (
    <div className={`${className}`}>
      <div className={`font-semibold ${sizeClasses[size]}`}>
        {primaryCurrency === 'USD' ? formatUsd(usdAmount) : formatLbp(lbpAmount)}
      </div>
      <div className={`text-gray-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
        {primaryCurrency === 'USD' ? formatLbp(lbpAmount) : formatUsd(usdAmount)}
      </div>
    </div>
  )
}

interface CurrencyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  currency?: 'USD' | 'LBP'
}

export function CurrencyInput({ 
  value, 
  onChange, 
  placeholder = "0.00",
  className = "",
  currency
}: CurrencyInputProps) {
  const { settings } = useSettingsStore()
  const activeCurrency = currency || (settings.currency?.primaryCurrency ?? 'USD')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Allow numbers and decimal points
    if (/^\d*\.?\d*$/.test(newValue) || newValue === '') {
      onChange(newValue)
    }
  }
  
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          activeCurrency === 'USD' ? 'pl-8' : 'pr-12'
        } ${className}`}
      />
      {activeCurrency === 'USD' ? (
        <DollarSign className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
      ) : (
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">LBP</span>
      )}
    </div>
  )
}

export function CurrencyConverter({ amount }: { amount: number }) {
  const { settings } = useSettingsStore()
  const exchangeRate = settings.currency?.exchangeRate ?? 89500
  
  const usdAmount = amount || 0
  const lbpAmount = usdAmount * exchangeRate
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg text-sm">
      <div className="flex justify-between items-center">
        <span>USD:</span>
        <span className="font-mono">${usdAmount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span>LBP:</span>
        <span className="font-mono">{Math.round(lbpAmount).toLocaleString()} LBP</span>
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">
        Rate: 1 USD = {exchangeRate.toLocaleString()} LBP
      </div>
    </div>
  )
}