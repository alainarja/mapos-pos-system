"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, Coins, ArrowRight } from "lucide-react"
import { useSettingsStore } from "@/stores/settings"

interface MixedCurrencyPaymentProps {
  total: number // Total in primary currency (USD)
  onComplete: (paymentDetails: PaymentDetails) => void
  onCancel: () => void
}

export interface PaymentDetails {
  method: string
  usdAmount: number
  lbpAmount: number
  totalInUsd: number
  changeDue: number
  changeCurrency: 'USD' | 'LBP'
  exchangeRate: number
}

export function MixedCurrencyPayment({ total, onComplete, onCancel }: MixedCurrencyPaymentProps) {
  const { settings } = useSettingsStore()
  const exchangeRate = settings.currency.exchangeRate || 89500
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash')
  const [usdAmount, setUsdAmount] = useState("")
  const [lbpAmount, setLbpAmount] = useState("")
  const [changeCurrency, setChangeCurrency] = useState<'USD' | 'LBP'>('USD')
  
  // Calculate total in LBP
  const totalInLbp = total * exchangeRate
  
  // Calculate total paid in USD equivalent
  const totalPaidInUsd = parseFloat(usdAmount || "0") + (parseFloat(lbpAmount || "0") / exchangeRate)
  
  // Calculate change due
  const changeDue = totalPaidInUsd - total
  const changeDueInLbp = changeDue * exchangeRate
  
  // Quick cash buttons for USD
  const quickUsdAmounts = [5, 10, 20, 50, 100, Math.ceil(total)]
  
  // Quick cash buttons for LBP (in thousands)
  const quickLbpAmounts = [
    50000, 100000, 250000, 500000, 1000000,
    Math.ceil(totalInLbp / 50000) * 50000
  ]
  
  const handleComplete = () => {
    if (totalPaidInUsd >= total) {
      onComplete({
        method: paymentMethod === 'mixed' ? 'Mixed (Cash)' : paymentMethod === 'cash' ? 'Cash' : 'Card',
        usdAmount: parseFloat(usdAmount || "0"),
        lbpAmount: parseFloat(lbpAmount || "0"),
        totalInUsd: totalPaidInUsd,
        changeDue: changeDue,
        changeCurrency: changeCurrency,
        exchangeRate: exchangeRate
      })
    }
  }
  
  const formatLbp = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 bg-white">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Multi-Currency Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Exchange Rate Display */}
          <div className="bg-slate-100 p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-600">Exchange Rate:</span>
              <span className="font-bold text-slate-800">1 USD = {formatLbp(exchangeRate)} LBP</span>
            </div>
          </div>
          
          {/* Total Due Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Total in USD</div>
              <div className="text-2xl font-bold text-blue-800">${total.toFixed(2)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Total in LBP</div>
              <div className="text-2xl font-bold text-purple-800">{formatLbp(totalInLbp)} L.L.</div>
            </div>
          </div>
          
          {/* Payment Method Tabs */}
          <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="cash">Cash Only</TabsTrigger>
              <TabsTrigger value="card">Card</TabsTrigger>
              <TabsTrigger value="mixed">Mixed Cash</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cash" className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Pay Full Amount In:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUsdAmount(total.toFixed(2))
                      setLbpAmount("0")
                    }}
                    className="h-12 border-blue-300 hover:bg-blue-50"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    USD Only
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUsdAmount("0")
                      setLbpAmount(totalInLbp.toFixed(0))
                    }}
                    className="h-12 border-purple-300 hover:bg-purple-50"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    LBP Only
                  </Button>
                </div>
              </div>
              
              {/* Amount Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">USD Amount</Label>
                  <Input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 text-lg font-semibold"
                  />
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {quickUsdAmounts.slice(0, 6).map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setUsdAmount(amount.toString())}
                        className="text-xs"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">LBP Amount</Label>
                  <Input
                    type="number"
                    value={lbpAmount}
                    onChange={(e) => setLbpAmount(e.target.value)}
                    placeholder="0"
                    className="mt-1 text-lg font-semibold"
                  />
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {quickLbpAmounts.slice(0, 6).map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setLbpAmount(amount.toString())}
                        className="text-xs"
                      >
                        {formatLbp(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="card">
              <div className="text-center py-8">
                <div className="text-lg font-medium text-slate-700 mb-4">
                  Process card payment for:
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${total.toFixed(2)}
                </div>
                <div className="text-lg text-purple-600">
                  ({formatLbp(totalInLbp)} L.L.)
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mixed" className="space-y-4">
              <div className="text-sm text-slate-600 mb-2">
                Accept payment in both USD and LBP simultaneously
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">USD Amount</Label>
                  <Input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 text-lg font-semibold"
                  />
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {quickUsdAmounts.slice(0, 6).map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setUsdAmount(amount.toString())}
                        className="text-xs"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">LBP Amount</Label>
                  <Input
                    type="number"
                    value={lbpAmount}
                    onChange={(e) => setLbpAmount(e.target.value)}
                    placeholder="0"
                    className="mt-1 text-lg font-semibold"
                  />
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {quickLbpAmounts.slice(0, 6).map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setLbpAmount(amount.toString())}
                        className="text-xs"
                      >
                        {formatLbp(amount)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Payment Summary */}
          {paymentMethod !== 'card' && (
            <div className="bg-slate-50 p-4 rounded-lg mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">USD Received:</span>
                <span className="font-semibold">${parseFloat(usdAmount || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">LBP Received:</span>
                <span className="font-semibold">{formatLbp(parseFloat(lbpAmount || "0"))} L.L.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total in USD:</span>
                <span className="font-semibold">${totalPaidInUsd.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-slate-700">Change Due:</span>
                  <div className="text-right">
                    {changeDue > 0 ? (
                      <>
                        <div className="text-green-600">${changeDue.toFixed(2)}</div>
                        <div className="text-sm text-green-600">({formatLbp(changeDueInLbp)} L.L.)</div>
                      </>
                    ) : changeDue < 0 ? (
                      <div className="text-red-600">${Math.abs(changeDue).toFixed(2)} short</div>
                    ) : (
                      <div className="text-green-600">Exact</div>
                    )}
                  </div>
                </div>
                
                {changeDue > 0 && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant={changeCurrency === 'USD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChangeCurrency('USD')}
                      className="flex-1"
                    >
                      Change in USD
                    </Button>
                    <Button
                      variant={changeCurrency === 'LBP' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChangeCurrency('LBP')}
                      className="flex-1"
                    >
                      Change in LBP
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={paymentMethod !== 'card' && totalPaidInUsd < total}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Complete Payment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}