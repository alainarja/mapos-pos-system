"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tag,
  X,
  Check,
  AlertCircle,
  Gift,
  Percent,
  DollarSign,
  ShoppingCart,
  Zap
} from "lucide-react"
import { AppliedCoupon } from "@/types"

interface CouponInputProps {
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: (couponId: string) => void
  appliedCoupons: AppliedCoupon[]
  validationError?: string
  isLoading?: boolean
  isDarkMode?: boolean
  disabled?: boolean
}

export function CouponInput({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupons,
  validationError,
  isLoading = false,
  isDarkMode = false,
  disabled = false
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("")
  const [showInput, setShowInput] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (couponCode.trim() && !isLoading && !disabled) {
      onApplyCoupon(couponCode.trim().toUpperCase())
      setCouponCode("")
    }
  }

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-3 w-3" />
      case 'fixed':
        return <DollarSign className="h-3 w-3" />
      case 'buy_x_get_y':
        return <Gift className="h-3 w-3" />
      case 'category_discount':
        return <Tag className="h-3 w-3" />
      default:
        return <Tag className="h-3 w-3" />
    }
  }

  const getCouponColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'fixed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'buy_x_get_y':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'category_discount':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDiscount = (coupon: AppliedCoupon) => {
    const { type, value } = coupon.coupon
    switch (type) {
      case 'percentage':
        return `${value}% OFF`
      case 'fixed':
        return `$${value} OFF`
      case 'buy_x_get_y':
        return `BUY ${coupon.coupon.buyQuantity} GET ${coupon.coupon.getQuantity} FREE`
      case 'category_discount':
        return `${value}% OFF ${coupon.coupon.applicableCategories?.join(', ')}`
      default:
        return 'DISCOUNT'
    }
  }

  return (
    <div className="space-y-3">
      {/* Coupon Input Toggle/Field */}
      {!showInput ? (
        <SoundButton
          onClick={() => setShowInput(true)}
          variant="outline"
          size="sm"
          soundType="click"
          disabled={disabled}
          className={`w-full h-10 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            isDarkMode
              ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
              : 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          <Tag className="h-4 w-4" />
          Add Coupon Code
        </SoundButton>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Enter coupon code..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isLoading || disabled}
                className={`h-10 rounded-lg font-mono uppercase transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400'
                    : 'bg-white border-purple-200 text-slate-900 placeholder:text-purple-400 focus:border-purple-400'
                } ${validationError ? 'border-red-400 focus:border-red-500' : ''}`}
                maxLength={20}
                autoFocus
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>
            <SoundButton
              type="submit"
              soundType="success"
              disabled={!couponCode.trim() || isLoading || disabled}
              className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check className="h-4 w-4" />
              )}
            </SoundButton>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowInput(false)
                setCouponCode("")
              }}
              className={`h-10 px-3 rounded-lg transition-all duration-300 ${
                isDarkMode
                  ? 'border-slate-600 text-slate-400 hover:bg-slate-700'
                  : 'border-purple-200 text-purple-600 hover:bg-purple-50'
              }`}
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
          
          {/* Validation Error */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{validationError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Coupon Suggestions */}
          <div className="grid grid-cols-2 gap-2">
            <SoundButton
              onClick={() => onApplyCoupon('SAVE10')}
              variant="outline"
              size="sm"
              soundType="click"
              disabled={isLoading || disabled}
              className="h-8 text-xs rounded-md border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              <Percent className="h-3 w-3 mr-1" />
              SAVE10
            </SoundButton>
            <SoundButton
              onClick={() => onApplyCoupon('5OFF')}
              variant="outline"
              size="sm"
              soundType="click"
              disabled={isLoading || disabled}
              className="h-8 text-xs rounded-md border-green-200 text-green-600 hover:bg-green-50 transition-all duration-300"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              5OFF
            </SoundButton>
          </div>
        </motion.div>
      )}

      {/* Applied Coupons */}
      <AnimatePresence>
        {appliedCoupons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <Zap className="h-4 w-4" />
              Applied Coupons
            </div>
            {appliedCoupons.map((appliedCoupon, index) => (
              <motion.div
                key={appliedCoupon.coupon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-600'
                    : getCouponColor(appliedCoupon.coupon.type)
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  {getCouponIcon(appliedCoupon.coupon.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm font-mono">
                        {appliedCoupon.coupon.code}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 bg-white/80 text-gray-700"
                      >
                        {formatDiscount(appliedCoupon)}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-75 truncate">
                      {appliedCoupon.coupon.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium">
                        -${appliedCoupon.discountAmount.toFixed(2)}
                      </span>
                      {appliedCoupon.freeItems && appliedCoupon.freeItems.length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          +{appliedCoupon.freeItems.length} free
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <SoundButton
                  onClick={() => onRemoveCoupon(appliedCoupon.coupon.id)}
                  variant="ghost"
                  size="sm"
                  soundType="click"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md flex-shrink-0"
                  title="Remove coupon"
                >
                  <X className="h-3 w-3" />
                </SoundButton>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}