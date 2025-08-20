"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Ticket,
  Tag,
  AlertCircle,
  CheckCircle,
  Percent,
  DollarSign,
  Loader2,
  X
} from "lucide-react"
import { couponService, CouponValidationResponse } from "@/lib/services/coupon-service"

interface CouponDialogProps {
  isOpen: boolean
  onClose: () => void
  subtotal: number
  onApplyCoupon: (coupon: AppliedCoupon) => void
  appliedCoupon?: AppliedCoupon | null
}

export interface AppliedCoupon {
  code: string
  discountType: 'percent' | 'amount'
  discountValue: number
  discountAmount: number
  minimumPurchase: number
}

export function CouponDialog({ 
  isOpen, 
  onClose, 
  subtotal, 
  onApplyCoupon,
  appliedCoupon 
}: CouponDialogProps) {
  const [couponCode, setCouponCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<CouponValidationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code")
      return
    }

    setIsValidating(true)
    setError(null)
    setValidationResult(null)

    try {
      const result = await couponService.validateCoupon(couponCode, subtotal)
      
      if (result.valid && result.data) {
        setValidationResult(result)
        // Auto-apply if valid
        handleApplyCoupon(result)
      } else {
        setError(result.error || "Invalid coupon code")
      }
    } catch (err) {
      setError("Failed to validate coupon. Please try again.")
    } finally {
      setIsValidating(false)
    }
  }

  const handleApplyCoupon = (result: CouponValidationResponse) => {
    if (result.valid && result.data) {
      onApplyCoupon({
        code: result.data.code,
        discountType: result.data.discount_type,
        discountValue: result.data.discount_value,
        discountAmount: result.data.discount_amount,
        minimumPurchase: result.data.minimum_purchase
      })
      handleClose()
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setValidationResult(null)
    setError(null)
  }

  const handleClose = () => {
    setCouponCode("")
    setValidationResult(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Apply Coupon
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Current Applied Coupon */}
          {appliedCoupon && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-green-800">
                    Coupon <strong>{appliedCoupon.code}</strong> applied
                  </span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    -{appliedCoupon.discountType === 'percent' 
                      ? `${appliedCoupon.discountValue}%` 
                      : `$${appliedCoupon.discountValue}`}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Coupon Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Enter Coupon Code
            </Label>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g., WELCOME20"
                disabled={isValidating}
                onKeyPress={(e) => e.key === 'Enter' && handleValidateCoupon()}
                className="flex-1"
              />
              <Button
                onClick={handleValidateCoupon}
                disabled={isValidating || !couponCode.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Tag className="h-4 w-4" />
                )}
                Apply
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Result */}
          {validationResult && validationResult.valid && validationResult.data && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-800">Coupon Valid!</h4>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Code:</span>
                  <span className="font-medium">{validationResult.data.code}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount:</span>
                  <div className="flex items-center gap-1">
                    {validationResult.data.discount_type === 'percent' ? (
                      <>
                        <Percent className="h-3 w-3" />
                        <span className="font-medium">{validationResult.data.discount_value}%</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">${validationResult.data.discount_value}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount Amount:</span>
                  <span>-${validationResult.data.discount_amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>New Total:</span>
                  <span>${(subtotal - validationResult.data.discount_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Subtotal Info */}
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Current Subtotal:</span>
              <span className="font-semibold text-lg">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Test Coupon Info */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>Test Coupon:</strong> Use code <Badge variant="outline" className="ml-1">WELCOME20</Badge> for 20% off (min. $50 purchase)
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            {appliedCoupon && (
              <Button
                variant="outline"
                onClick={() => {
                  onApplyCoupon(null as any) // Remove coupon
                  handleClose()
                }}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                Remove Coupon
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}