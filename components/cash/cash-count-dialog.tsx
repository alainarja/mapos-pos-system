'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Calculator, DollarSign, X } from 'lucide-react'
import { useCashManagementStore, type CashCount } from '@/stores/cash-management'

interface CashCountDialogProps {
  isOpen: boolean
  onClose: () => void
  expectedAmountUsd: number
  expectedAmountLbp: number
  cashier: string
  exchangeRate: number
}

interface UsdDenominationCounts {
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

interface LbpDenominationCounts {
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

export function CashCountDialog({ isOpen, onClose, expectedAmountUsd, expectedAmountLbp, cashier, exchangeRate }: CashCountDialogProps) {
  const { addCashCount } = useCashManagementStore()
  
  const [usdCounts, setUsdCounts] = useState<UsdDenominationCounts>({
    hundreds: 0,
    fifties: 0,
    twenties: 0,
    tens: 0,
    fives: 0,
    ones: 0,
    quarters: 0,
    dimes: 0,
    nickels: 0,
    pennies: 0
  })
  
  const [lbpCounts, setLbpCounts] = useState<LbpDenominationCounts>({
    millions: 0,
    fiveHundredThousands: 0,
    twoFiftyThousands: 0,
    hundredThousands: 0,
    fiftyThousands: 0,
    twentyThousands: 0,
    tenThousands: 0,
    fiveThousands: 0,
    thousands: 0,
    fiveHundreds: 0
  })
  
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const usdDenominationValues = {
    hundreds: 100,
    fifties: 50,
    twenties: 20,
    tens: 10,
    fives: 5,
    ones: 1,
    quarters: 0.25,
    dimes: 0.10,
    nickels: 0.05,
    pennies: 0.01
  }
  
  const lbpDenominationValues = {
    millions: 1000000,
    fiveHundredThousands: 500000,
    twoFiftyThousands: 250000,
    hundredThousands: 100000,
    fiftyThousands: 50000,
    twentyThousands: 20000,
    tenThousands: 10000,
    fiveThousands: 5000,
    thousands: 1000,
    fiveHundreds: 500
  }

  const calculateTotalUsd = () => {
    return Object.entries(usdCounts).reduce((total, [denom, count]) => {
      return total + (count * usdDenominationValues[denom as keyof UsdDenominationCounts])
    }, 0)
  }
  
  const calculateTotalLbp = () => {
    return Object.entries(lbpCounts).reduce((total, [denom, count]) => {
      return total + (count * lbpDenominationValues[denom as keyof LbpDenominationCounts])
    }, 0)
  }

  const totalCountedUsd = calculateTotalUsd()
  const totalCountedLbp = calculateTotalLbp()
  const varianceUsd = totalCountedUsd - expectedAmountUsd
  const varianceLbp = totalCountedLbp - expectedAmountLbp

  const handleUsdCountChange = (denomination: keyof UsdDenominationCounts, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    setUsdCounts(prev => ({
      ...prev,
      [denomination]: numValue
    }))
  }
  
  const handleLbpCountChange = (denomination: keyof LbpDenominationCounts, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    setLbpCounts(prev => ({
      ...prev,
      [denomination]: numValue
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      addCashCount({
        cashier,
        usdDenominations: usdCounts,
        lbpDenominations: lbpCounts,
        expectedAmountUsd,
        expectedAmountLbp,
        exchangeRate,
        notes: notes.trim() || undefined
      })
      
      // Reset form
      setUsdCounts({
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        ones: 0,
        quarters: 0,
        dimes: 0,
        nickels: 0,
        pennies: 0
      })
      setLbpCounts({
        millions: 0,
        fiveHundredThousands: 0,
        twoFiftyThousands: 0,
        hundredThousands: 0,
        fiftyThousands: 0,
        twentyThousands: 0,
        tenThousands: 0,
        fiveThousands: 0,
        thousands: 0,
        fiveHundreds: 0
      })
      setNotes('')
      onClose()
    } catch (error) {
      console.error('Failed to save cash count:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Cash Drawer Count</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Expected vs Counted Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Count Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* USD Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">USD Cash Count</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Expected</p>
                      <p className="text-xl font-bold text-blue-600">${expectedAmountUsd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Counted</p>
                      <p className="text-xl font-bold text-green-600">${totalCountedUsd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Variance</p>
                      <p className={`text-xl font-bold ${varianceUsd === 0 ? 'text-green-600' : varianceUsd > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {varianceUsd >= 0 ? '+' : ''}${varianceUsd.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* LBP Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">LBP Cash Count</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Expected</p>
                      <p className="text-xl font-bold text-purple-600">{expectedAmountLbp.toLocaleString()} L.L.</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Counted</p>
                      <p className="text-xl font-bold text-green-600">{totalCountedLbp.toLocaleString()} L.L.</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Variance</p>
                      <p className={`text-xl font-bold ${varianceLbp === 0 ? 'text-green-600' : varianceLbp > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {varianceLbp >= 0 ? '+' : ''}{varianceLbp.toLocaleString()} L.L.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {(Math.abs(varianceUsd) > 0.01 || Math.abs(varianceLbp) > 0) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Variance Detected</p>
                    {Math.abs(varianceUsd) > 0.01 && (
                      <p className="text-sm text-yellow-700">
                        USD: {varianceUsd > 0 ? 'Overage' : 'Shortage'} of ${Math.abs(varianceUsd).toFixed(2)}
                      </p>
                    )}
                    {Math.abs(varianceLbp) > 0 && (
                      <p className="text-sm text-yellow-700">
                        LBP: {varianceLbp > 0 ? 'Overage' : 'Shortage'} of {Math.abs(varianceLbp).toLocaleString()} L.L.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cash Count Tabs */}
          <Tabs defaultValue="usd" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usd">USD Cash</TabsTrigger>
              <TabsTrigger value="lbp">LBP Cash</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usd">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* USD Bills */}
                <Card>
                  <CardHeader>
                    <CardTitle>USD Bills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'hundreds', label: '$100', value: 100 },
                      { key: 'fifties', label: '$50', value: 50 },
                      { key: 'twenties', label: '$20', value: 20 },
                      { key: 'tens', label: '$10', value: 10 },
                      { key: 'fives', label: '$5', value: 5 },
                      { key: 'ones', label: '$1', value: 1 }
                    ].map(({ key, label, value }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 min-w-[60px]">
                          {label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={usdCounts[key as keyof UsdDenominationCounts]}
                            onChange={(e) => handleUsdCountChange(key as keyof UsdDenominationCounts, e.target.value)}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500 min-w-[80px] text-right">
                            ${(usdCounts[key as keyof UsdDenominationCounts] * value).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* USD Coins */}
                <Card>
                  <CardHeader>
                    <CardTitle>USD Coins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'quarters', label: '$0.25', value: 0.25 },
                      { key: 'dimes', label: '$0.10', value: 0.10 },
                      { key: 'nickels', label: '$0.05', value: 0.05 },
                      { key: 'pennies', label: '$0.01', value: 0.01 }
                    ].map(({ key, label, value }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 min-w-[60px]">
                          {label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={usdCounts[key as keyof UsdDenominationCounts]}
                            onChange={(e) => handleUsdCountChange(key as keyof UsdDenominationCounts, e.target.value)}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500 min-w-[80px] text-right">
                            ${(usdCounts[key as keyof UsdDenominationCounts] * value).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="lbp">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LBP Large Bills */}
                <Card>
                  <CardHeader>
                    <CardTitle>LBP Large Bills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'millions', label: '1,000,000 L.L.', value: 1000000 },
                      { key: 'fiveHundredThousands', label: '500,000 L.L.', value: 500000 },
                      { key: 'twoFiftyThousands', label: '250,000 L.L.', value: 250000 },
                      { key: 'hundredThousands', label: '100,000 L.L.', value: 100000 },
                      { key: 'fiftyThousands', label: '50,000 L.L.', value: 50000 }
                    ].map(({ key, label, value }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 min-w-[120px]">
                          {label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={lbpCounts[key as keyof LbpDenominationCounts]}
                            onChange={(e) => handleLbpCountChange(key as keyof LbpDenominationCounts, e.target.value)}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500 min-w-[100px] text-right">
                            {(lbpCounts[key as keyof LbpDenominationCounts] * value).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* LBP Small Bills */}
                <Card>
                  <CardHeader>
                    <CardTitle>LBP Small Bills</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'twentyThousands', label: '20,000 L.L.', value: 20000 },
                      { key: 'tenThousands', label: '10,000 L.L.', value: 10000 },
                      { key: 'fiveThousands', label: '5,000 L.L.', value: 5000 },
                      { key: 'thousands', label: '1,000 L.L.', value: 1000 },
                      { key: 'fiveHundreds', label: '500 L.L.', value: 500 }
                    ].map(({ key, label, value }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 min-w-[120px]">
                          {label}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={lbpCounts[key as keyof LbpDenominationCounts]}
                            onChange={(e) => handleLbpCountChange(key as keyof LbpDenominationCounts, e.target.value)}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500 min-w-[100px] text-right">
                            {(lbpCounts[key as keyof LbpDenominationCounts] * value).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Notes */}
          <div>
            <Label htmlFor="count-notes">Notes (Optional)</Label>
            <Textarea
              id="count-notes"
              placeholder="Add any notes about this cash count..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Cash Count'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}