'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Calculator, DollarSign, X } from 'lucide-react'
import { useCashManagementStore, type CashCount } from '@/stores/cash-management'

interface CashCountDialogProps {
  isOpen: boolean
  onClose: () => void
  expectedAmount: number
  cashier: string
}

interface DenominationCounts {
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

export function CashCountDialog({ isOpen, onClose, expectedAmount, cashier }: CashCountDialogProps) {
  const { addCashCount } = useCashManagementStore()
  
  const [counts, setCounts] = useState<DenominationCounts>({
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
  
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const denominationValues = {
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

  const calculateTotal = () => {
    return Object.entries(counts).reduce((total, [denom, count]) => {
      return total + (count * denominationValues[denom as keyof DenominationCounts])
    }, 0)
  }

  const totalCounted = calculateTotal()
  const variance = totalCounted - expectedAmount

  const handleCountChange = (denomination: keyof DenominationCounts, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    setCounts(prev => ({
      ...prev,
      [denomination]: numValue
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      addCashCount({
        cashier,
        denominations: counts,
        expectedAmount,
        notes: notes.trim() || undefined
      })
      
      // Reset form
      setCounts({
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Expected Amount</p>
                  <p className="text-2xl font-bold text-blue-600">${expectedAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Counted Amount</p>
                  <p className="text-2xl font-bold text-green-600">${totalCounted.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Variance</p>
                  <p className={`text-2xl font-bold ${variance === 0 ? 'text-green-600' : variance > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    {variance >= 0 ? '+' : ''}${variance.toFixed(2)}
                  </p>
                </div>
              </div>
              
              {Math.abs(variance) > 0.01 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Variance Detected</p>
                    <p className="text-sm text-yellow-700">
                      {variance > 0 ? 'Overage' : 'Shortage'} of ${Math.abs(variance).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cash Count Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bills */}
            <Card>
              <CardHeader>
                <CardTitle>Bills</CardTitle>
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
                        value={counts[key as keyof DenominationCounts]}
                        onChange={(e) => handleCountChange(key as keyof DenominationCounts, e.target.value)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500 min-w-[60px] text-right">
                        ${(counts[key as keyof DenominationCounts] * value).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Coins */}
            <Card>
              <CardHeader>
                <CardTitle>Coins</CardTitle>
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
                        value={counts[key as keyof DenominationCounts]}
                        onChange={(e) => handleCountChange(key as keyof DenominationCounts, e.target.value)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500 min-w-[60px] text-right">
                        ${(counts[key as keyof DenominationCounts] * value).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

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