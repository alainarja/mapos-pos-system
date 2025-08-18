"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSettingsStore } from "@/stores/settings"
import { useCurrencyStore } from "@/stores/currency"
import { DualCurrency, CurrencyInput } from "@/components/ui/dual-currency"
import { DollarSign, Calculator } from "lucide-react"

interface MultiCurrencyCashCalculatorProps {
  totalAmount: number
  onPaymentComplete: (paymentBreakdown: PaymentBreakdown) => void
  onCancel: () => void
}

interface PaymentBreakdown {
  usd: number
  lbp: number
  totalPaid: number
  change: number
  changeBreakdown: {
    usd: number
    lbp: number
  }
}

export function MultiCurrencyCashCalculator({ 
  totalAmount, 
  onPaymentComplete, 
  onCancel 
}: MultiCurrencyCashCalculatorProps) {
  const { settings } = useSettingsStore()
  const { exchangeRates, addToCashDrawer } = useCurrencyStore()
  
  const [usdTendered, setUsdTendered] = useState('')
  const [lbpTendered, setLbpTendered] = useState('')
  
  // Provide defaults in case currency settings don't exist
  const currencySettings = settings.currency || {
    exchangeRate: 89500,
    acceptUsdCash: true,
    acceptLbpCash: true
  }
  const { exchangeRate, acceptUsdCash, acceptLbpCash } = currencySettings
  
  // Calculate totals
  const usdAmount = parseFloat(usdTendered) || 0
  const lbpAmount = parseFloat(lbpTendered) || 0
  
  // Convert LBP to USD for comparison
  const lbpInUsd = lbpAmount / exchangeRate
  const totalPaidUsd = usdAmount + lbpInUsd
  
  const isPaid = totalPaidUsd >= totalAmount
  const changeUsd = isPaid ? totalPaidUsd - totalAmount : 0
  
  // Prefer giving change in the same currency as much as possible
  const calculateChange = () => {
    if (changeUsd === 0) return { usd: 0, lbp: 0 }
    
    // If customer paid mostly in USD, give change in USD
    if (usdAmount >= lbpInUsd) {
      return { usd: changeUsd, lbp: 0 }
    }
    
    // If customer paid mostly in LBP, give change in LBP
    const changeLbp = changeUsd * exchangeRate
    return { usd: 0, lbp: changeLbp }
  }
  
  const changeBreakdown = calculateChange()
  
  const handleCompletePayment = () => {
    if (!isPaid) return
    
    const paymentBreakdown: PaymentBreakdown = {
      usd: usdAmount,
      lbp: lbpAmount,
      totalPaid: totalPaidUsd,
      change: changeUsd,
      changeBreakdown
    }
    
    // Add to cash drawer
    if (usdAmount > 0) {
      addToCashDrawer('usd', usdAmount)
    }
    if (lbpAmount > 0) {
      addToCashDrawer('lbp', lbpAmount)
    }
    
    onPaymentComplete(paymentBreakdown)
  }
  
  // Quick amount buttons for USD
  const usdQuickAmounts = [1, 5, 10, 20, 50, 100]
  // Quick amount buttons for LBP  
  const lbpQuickAmounts = [1000, 5000, 10000, 20000, 50000, 100000]
  
  const addUsdAmount = (amount: number) => {
    const current = parseFloat(usdTendered) || 0
    setUsdTendered((current + amount).toString())
  }
  
  const addLbpAmount = (amount: number) => {
    const current = parseFloat(lbpTendered) || 0
    setLbpTendered((current + amount).toString())
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800">💰 Multi-Currency Cash Calculator</h3>
        <div className="bg-emerald-50 p-3 rounded-lg">
          <p className="text-sm text-emerald-600 mb-1">Total Amount Due:</p>
          <DualCurrency amount={totalAmount} size="lg" className="text-emerald-800" />
        </div>
      </div>
      
      {/* USD Payment Section */}
      {acceptUsdCash && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <Label className="text-blue-800 font-semibold">US Dollar Payment</Label>
            </div>
            
            <CurrencyInput
              value={usdTendered}
              onChange={setUsdTendered}
              currency="USD"
              placeholder="0.00"
              className="mb-3"
            />
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {usdQuickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => addUsdAmount(amount)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  +${amount}
                </Button>
              ))}
            </div>
            
            {usdAmount > 0 && (
              <div className="bg-blue-50 p-2 rounded text-sm">
                <p><strong>USD Received:</strong> ${usdAmount.toFixed(2)}</p>
                <p><strong>LBP Equivalent:</strong> {(usdAmount * exchangeRate).toLocaleString()} LBP</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* LBP Payment Section */}
      {acceptLbpCash && (
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-600">🇱🇧</span>
              <Label className="text-orange-800 font-semibold">Lebanese Pound Payment</Label>
            </div>
            
            <CurrencyInput
              value={lbpTendered}
              onChange={setLbpTendered}
              currency="LBP"
              placeholder="0"
              className="mb-3"
            />
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {lbpQuickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => addLbpAmount(amount)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  +{(amount / 1000)}k
                </Button>
              ))}
            </div>
            
            {lbpAmount > 0 && (
              <div className="bg-orange-50 p-2 rounded text-sm">
                <p><strong>LBP Received:</strong> {lbpAmount.toLocaleString()} LBP</p>
                <p><strong>USD Equivalent:</strong> ${lbpInUsd.toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Payment Summary */}
      <Card className={`border-2 ${isPaid ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 text-gray-800">Payment Summary</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount Due:</span>
              <span className="font-mono">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-mono">${totalPaidUsd.toFixed(2)}</span>
            </div>
            
            {changeUsd > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Change Due:</span>
                <div className="text-right font-mono">
                  {changeBreakdown.usd > 0 && <div>${changeBreakdown.usd.toFixed(2)}</div>}
                  {changeBreakdown.lbp > 0 && <div>{Math.round(changeBreakdown.lbp).toLocaleString()} LBP</div>}
                </div>
              </div>
            )}
            
            {totalPaidUsd < totalAmount && (
              <div className="flex justify-between text-red-600">
                <span>Remaining:</span>
                <span className="font-mono">${(totalAmount - totalPaidUsd).toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCompletePayment}
          disabled={!isPaid}
          className={`flex-1 ${isPaid ? 'bg-green-600 hover:bg-green-700' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Complete Payment
        </Button>
      </div>
      
      {/* Exchange Rate Display */}
      <div className="text-center text-xs text-gray-500">
        Exchange Rate: 1 USD = {exchangeRate.toLocaleString()} LBP
      </div>
    </div>
  )
}