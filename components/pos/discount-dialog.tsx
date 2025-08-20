"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Percent, DollarSign, Shield, X } from "lucide-react"
import { useUserStore } from "@/stores/user"

interface DiscountDialogProps {
  itemId?: string // If provided, it's an item discount. Otherwise, it's cart discount
  itemName?: string
  currentPrice?: number
  onApply: (discount: DiscountDetails) => void
  onCancel: () => void
}

export interface DiscountDetails {
  type: 'percentage' | 'fixed'
  value: number
  reason: string
  managerApproval?: boolean
  appliedBy: string
  appliedAt: Date
}

export function DiscountDialog({ 
  itemId, 
  itemName, 
  currentPrice = 0, 
  onApply, 
  onCancel 
}: DiscountDialogProps) {
  const { currentUser } = useUserStore()
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState("")
  const [reason, setReason] = useState("")
  const [managerPin, setManagerPin] = useState("")
  const [requiresApproval, setRequiresApproval] = useState(false)
  
  // Check if user has discount permissions
  const hasDiscountPermission = currentUser?.permissions?.some(p => 
    p === '*' || p === 'pos.discount' || p === 'sales.discount' || p === 'manager'
  ) ?? false
  
  const handleApply = () => {
    const value = parseFloat(discountValue)
    
    if (isNaN(value) || value <= 0) {
      return
    }
    
    // Validate percentage discounts
    if (discountType === 'percentage' && value > 100) {
      return
    }
    
    // Check if manager approval is needed (discounts over 20% or $50)
    const needsApproval = discountType === 'percentage' 
      ? value > 20 
      : value > 50
    
    if (needsApproval && !managerPin) {
      setRequiresApproval(true)
      return
    }
    
    onApply({
      type: discountType,
      value,
      reason,
      managerApproval: needsApproval,
      appliedBy: currentUser?.fullName || 'Staff',
      appliedAt: new Date()
    })
  }
  
  const calculateDiscountedPrice = () => {
    const value = parseFloat(discountValue) || 0
    if (discountType === 'percentage') {
      return currentPrice - (currentPrice * value / 100)
    } else {
      return Math.max(0, currentPrice - value)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              {itemId ? `Discount for ${itemName}` : 'Cart Discount'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!hasDiscountPermission ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700">Manager Approval Required</p>
              <p className="text-sm text-slate-500 mt-2">
                You don't have permission to apply discounts. Please ask a manager.
              </p>
            </div>
          ) : (
            <>
              {/* Discount Type */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-slate-700 mb-2">Discount Type</Label>
                <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer">
                      <Percent className="h-4 w-4" />
                      Percentage
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Discount Value */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-slate-700">
                  Discount Value {discountType === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? "0-100" : "0.00"}
                  className="mt-1"
                  autoFocus
                />
                
                {/* Quick discount buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {discountType === 'percentage' ? (
                    [5, 10, 15, 20].map(v => (
                      <Button
                        key={v}
                        variant="outline"
                        size="sm"
                        onClick={() => setDiscountValue(v.toString())}
                      >
                        {v}%
                      </Button>
                    ))
                  ) : (
                    [5, 10, 20, 50].map(v => (
                      <Button
                        key={v}
                        variant="outline"
                        size="sm"
                        onClick={() => setDiscountValue(v.toString())}
                      >
                        ${v}
                      </Button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Reason */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-slate-700">Reason</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Customer loyalty, Damaged item, Special promotion"
                  className="mt-1"
                />
              </div>
              
              {/* Price Preview */}
              {currentPrice > 0 && discountValue && (
                <div className="bg-slate-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Original Price:</span>
                    <span className="font-medium">${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">Discount:</span>
                    <span className="font-medium text-red-600">
                      -{discountType === 'percentage' 
                        ? `${discountValue}%` 
                        : `$${parseFloat(discountValue).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between">
                    <span className="text-slate-700 font-medium">New Price:</span>
                    <span className="font-bold text-green-600">
                      ${calculateDiscountedPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Manager Approval */}
              {requiresApproval && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Label className="text-sm font-medium text-amber-800">
                    Manager PIN Required (Discount over 20% or $50)
                  </Label>
                  <Input
                    type="password"
                    value={managerPin}
                    onChange={(e) => setManagerPin(e.target.value)}
                    placeholder="Enter manager PIN"
                    className="mt-2"
                  />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={!discountValue || !reason}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Apply Discount
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}