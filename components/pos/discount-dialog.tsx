"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Percent,
  DollarSign,
  X,
  Check,
  AlertTriangle,
  Shield,
  Tag,
  Calculator
} from "lucide-react"
import { modalVariants, backdropVariants } from "@/lib/animations"

interface DiscountDialogProps {
  isOpen: boolean
  onClose: () => void
  onApplyDiscount: (discount: number, type: 'percentage' | 'fixed', reason?: string, requiresOverride?: boolean) => void
  onApplyItemDiscount?: (itemId: string, discount: number, type: 'percentage' | 'fixed') => void
  currentDiscount?: number
  cartTotal: number
  selectedItemId?: string
  selectedItemName?: string
  selectedItemPrice?: number
  isDarkMode?: boolean
}

export function DiscountDialog({
  isOpen,
  onClose,
  onApplyDiscount,
  onApplyItemDiscount,
  currentDiscount = 0,
  cartTotal,
  selectedItemId,
  selectedItemName,
  selectedItemPrice,
  isDarkMode = false
}: DiscountDialogProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [reason, setReason] = useState('')
  const [showManagerOverride, setShowManagerOverride] = useState(false)
  const [managerId, setManagerId] = useState('')
  const [activeTab, setActiveTab] = useState<'cart' | 'item'>('cart')

  // Predefined discount options
  const quickPercentages = [5, 10, 15, 20, 25, 30]
  const quickAmounts = [5, 10, 20, 50]

  const isItemMode = selectedItemId && onApplyItemDiscount
  const targetAmount = isItemMode && activeTab === 'item' ? (selectedItemPrice || 0) : cartTotal

  const calculatePreview = () => {
    const value = parseFloat(discountValue) || 0
    if (value <= 0) return { discount: 0, newTotal: targetAmount, savings: 0 }

    let discountAmount = 0
    if (discountType === 'percentage') {
      discountAmount = targetAmount * (value / 100)
    } else {
      discountAmount = Math.min(value, targetAmount)
    }

    return {
      discount: discountAmount,
      newTotal: targetAmount - discountAmount,
      savings: discountAmount,
      percentage: (discountAmount / targetAmount) * 100
    }
  }

  const preview = calculatePreview()
  const requiresManagerOverride = preview.percentage > 30 // Require override for >30% discount

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue) || 0
    if (value <= 0) return

    if (requiresManagerOverride && !managerId.trim()) {
      setShowManagerOverride(true)
      return
    }

    if (isItemMode && activeTab === 'item' && selectedItemId && onApplyItemDiscount) {
      onApplyItemDiscount(selectedItemId, value, discountType)
    } else {
      onApplyDiscount(value, discountType, reason || undefined, requiresManagerOverride)
    }
    
    handleClose()
  }

  const handleClose = () => {
    setDiscountValue('')
    setReason('')
    setManagerId('')
    setShowManagerOverride(false)
    setActiveTab('cart')
    onClose()
  }

  const handleQuickDiscount = (value: number, type: 'percentage' | 'fixed') => {
    setDiscountType(type)
    setDiscountValue(value.toString())
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={handleClose}
        />
        
        {/* Dialog */}
        <motion.div
          className="relative z-10 w-full max-w-md mx-4"
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Card
            className={`backdrop-blur-xl transition-all duration-300 ${
              isDarkMode ? 'border-purple-500/30' : 'bg-white/95 border-purple-200'
            }`}
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, oklch(0.12 0.032 264) 0%, oklch(0.14 0.025 280) 100%)'
                : undefined,
              boxShadow: isDarkMode
                ? "0 25px 80px rgba(0,0,0,0.6), 0 10px 40px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 25px 80px rgba(139,92,246,0.3), 0 10px 40px rgba(139,92,246,0.2)",
            }}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-100' 
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
                }`}>
                  Apply Discount
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Selection (if item mode available) */}
              {isItemMode && (
                <div className="flex rounded-lg bg-purple-50 p-1 mb-4">
                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      activeTab === 'cart'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    <Tag className="w-4 h-4 inline mr-2" />
                    Cart Discount
                  </button>
                  <button
                    onClick={() => setActiveTab('item')}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      activeTab === 'item'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4 inline mr-2" />
                    Item: {selectedItemName}
                  </button>
                </div>
              )}

              {/* Target Info */}
              <div className={`p-3 rounded-lg mb-4 ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-purple-50'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-slate-300' : 'text-purple-700'
                  }`}>
                    {activeTab === 'item' ? `${selectedItemName} Price:` : 'Cart Total:'}
                  </span>
                  <span className={`font-bold ${
                    isDarkMode ? 'text-slate-100' : 'text-purple-800'
                  }`}>
                    ${targetAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Discount Type Selection */}
              <div className="flex rounded-lg bg-purple-50 p-1 mb-4">
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    discountType === 'percentage'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  <Percent className="w-4 h-4 inline mr-2" />
                  Percentage
                </button>
                <button
                  onClick={() => setDiscountType('fixed')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    discountType === 'fixed'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Fixed Amount
                </button>
              </div>

              {/* Quick Discount Buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Quick Options:</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(discountType === 'percentage' ? quickPercentages : quickAmounts).map((value) => (
                    <SoundButton
                      key={value}
                      onClick={() => handleQuickDiscount(value, discountType)}
                      variant="outline"
                      size="sm"
                      soundType="click"
                      className="h-10 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      {discountType === 'percentage' ? `${value}%` : `$${value}`}
                    </SoundButton>
                  ))}
                </div>
              </div>

              {/* Custom Discount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom {discountType === 'percentage' ? 'Percentage' : 'Amount'}:
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="pr-8"
                    min="0"
                    max={discountType === 'percentage' ? "100" : targetAmount.toString()}
                    step={discountType === 'percentage' ? "1" : "0.01"}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    {discountType === 'percentage' ? '%' : '$'}
                  </div>
                </div>
              </div>

              {/* Discount Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (Optional):
                </label>
                <Input
                  placeholder="e.g., Loyalty customer, Price match, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Manager Override (if needed) */}
              {showManagerOverride && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Manager Override Required</span>
                  </div>
                  <Input
                    placeholder="Enter Manager ID"
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="border-orange-300 focus:border-orange-500"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    Discounts over 30% require manager approval
                  </p>
                </motion.div>
              )}

              {/* Preview */}
              {preview.savings > 0 && (
                <div className={`p-4 rounded-lg mb-4 border ${
                  requiresManagerOverride 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {requiresManagerOverride ? (
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    ) : (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      requiresManagerOverride ? 'text-orange-700' : 'text-green-700'
                    }`}>
                      Discount Preview
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Discount Amount:</span>
                      <span className="font-medium">${preview.savings.toFixed(2)} ({preview.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Total:</span>
                      <span className="font-bold text-green-600">${preview.newTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <SoundButton
                  onClick={handleApplyDiscount}
                  disabled={!discountValue || parseFloat(discountValue) <= 0 || (requiresManagerOverride && !managerId.trim())}
                  soundType="success"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                >
                  Apply Discount
                </SoundButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}