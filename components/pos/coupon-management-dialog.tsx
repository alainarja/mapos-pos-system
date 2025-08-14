"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SoundButton } from "@/components/ui/sound-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  X,
  Plus,
  Edit,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Gift,
  Calendar,
  Users,
  Settings,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { modalVariants, backdropVariants } from "@/lib/animations"
import { Coupon } from "@/types"
import { useCouponStore } from "@/stores/coupons"

interface CouponManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode?: boolean
}

type TabType = 'list' | 'create' | 'edit'

export function CouponManagementDialog({
  isOpen,
  onClose,
  isDarkMode = false
}: CouponManagementDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const { 
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon,
    resetCoupons
  } = useCouponStore()

  // Form state for creating/editing coupons
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as const,
    value: 0,
    minimumPurchase: 0,
    maximumDiscount: 0,
    applicableCategories: [] as string[],
    buyQuantity: 2,
    getQuantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 0,
    isActive: true,
    canStack: false
  })

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && coupon.isActive) ||
                         (statusFilter === 'inactive' && !coupon.isActive)
    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      minimumPurchase: 0,
      maximumDiscount: 0,
      applicableCategories: [],
      buyQuantity: 2,
      getQuantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: 0,
      isActive: true,
      canStack: false
    })
  }

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumPurchase: coupon.minimumPurchase || 0,
      maximumDiscount: coupon.maximumDiscount || 0,
      applicableCategories: coupon.applicableCategories || [],
      buyQuantity: coupon.buyQuantity || 2,
      getQuantity: coupon.getQuantity || 1,
      startDate: coupon.startDate.toISOString().split('T')[0],
      endDate: coupon.endDate.toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 0,
      isActive: coupon.isActive,
      canStack: coupon.canStack
    })
    setActiveTab('edit')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const couponData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      usageLimit: formData.usageLimit > 0 ? formData.usageLimit : undefined,
      minimumPurchase: formData.minimumPurchase > 0 ? formData.minimumPurchase : undefined,
      maximumDiscount: formData.maximumDiscount > 0 ? formData.maximumDiscount : undefined,
      applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : undefined,
      buyQuantity: formData.type === 'buy_x_get_y' ? formData.buyQuantity : undefined,
      getQuantity: formData.type === 'buy_x_get_y' ? formData.getQuantity : undefined,
      stackingRules: {
        allowWithOtherCoupons: formData.canStack,
        allowWithDiscounts: true,
        maxStackingValue: formData.canStack ? 100 : undefined
      }
    }

    if (activeTab === 'edit' && selectedCoupon) {
      updateCoupon(selectedCoupon.id, couponData)
    } else {
      addCoupon(couponData)
    }

    resetForm()
    setSelectedCoupon(null)
    setActiveTab('list')
  }

  const handleClose = () => {
    resetForm()
    setSelectedCoupon(null)
    setActiveTab('list')
    onClose()
  }

  const getCouponStatusColor = (coupon: Coupon) => {
    const now = new Date()
    if (!coupon.isActive) return 'bg-gray-100 text-gray-700'
    if (now > coupon.endDate) return 'bg-red-100 text-red-700'
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const getCouponStatusText = (coupon: Coupon) => {
    const now = new Date()
    if (!coupon.isActive) return 'Inactive'
    if (now > coupon.endDate) return 'Expired'
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return 'Used Up'
    return 'Active'
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
          className="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
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
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-200/30">
                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-slate-100' 
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
                }`}>
                  Coupon Management
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

              {/* Tabs */}
              <div className="flex border-b border-purple-200/30">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                    activeTab === 'list'
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                      : 'text-slate-600 hover:text-purple-600'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  Coupon List
                </button>
                <button
                  onClick={() => {
                    setActiveTab('create')
                    resetForm()
                    setSelectedCoupon(null)
                  }}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
                    activeTab === 'create'
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                      : 'text-slate-600 hover:text-purple-600'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Create Coupon
                </button>
                {activeTab === 'edit' && (
                  <button
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-purple-600 border-b-2 border-purple-600 bg-purple-50/50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Coupon
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[70vh]">
                {activeTab === 'list' && (
                  <div className="p-6">
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                      <Input
                        placeholder="Search coupons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          const confirmed = window.confirm('Reset all coupons to default? This will remove any custom coupons.')
                          if (confirmed) resetCoupons()
                        }}
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Reset to Default
                      </Button>
                    </div>

                    {/* Coupon List */}
                    <div className="space-y-3">
                      {filteredCoupons.map((coupon) => (
                        <Card key={coupon.id} className="border border-purple-100">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-mono font-bold text-lg text-purple-600">
                                    {coupon.code}
                                  </span>
                                  <Badge className={getCouponStatusColor(coupon)}>
                                    {getCouponStatusText(coupon)}
                                  </Badge>
                                  {coupon.type === 'percentage' && (
                                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                                      <Percent className="h-3 w-3 mr-1" />
                                      {coupon.value}% OFF
                                    </Badge>
                                  )}
                                  {coupon.type === 'fixed' && (
                                    <Badge variant="outline" className="border-green-200 text-green-600">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      ${coupon.value} OFF
                                    </Badge>
                                  )}
                                  {coupon.type === 'buy_x_get_y' && (
                                    <Badge variant="outline" className="border-purple-200 text-purple-600">
                                      <Gift className="h-3 w-3 mr-1" />
                                      Buy {coupon.buyQuantity} Get {coupon.getQuantity}
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="font-semibold text-slate-800 mb-1">{coupon.name}</h4>
                                <p className="text-sm text-slate-600 mb-2">{coupon.description}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {coupon.startDate.toLocaleDateString()} - {coupon.endDate.toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Used: {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                                  </span>
                                  {coupon.minimumPurchase && (
                                    <span>Min: ${coupon.minimumPurchase}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => navigator.clipboard.writeText(coupon.code)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Copy code"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => handleEdit(coupon)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit coupon"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => updateCoupon(coupon.id, { isActive: !coupon.isActive })}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title={coupon.isActive ? "Deactivate" : "Activate"}
                                >
                                  {coupon.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                <Button
                                  onClick={() => {
                                    const confirmed = window.confirm(`Delete coupon "${coupon.code}"?`)
                                    if (confirmed) deleteCoupon(coupon.id)
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                                  title="Delete coupon"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredCoupons.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          No coupons found matching your criteria.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(activeTab === 'create' || activeTab === 'edit') && (
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Coupon Code</label>
                          <Input
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            placeholder="e.g., SAVE20"
                            className="font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Coupon Name</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., 20% Off Sale"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Describe what this coupon does..."
                          rows={2}
                          required
                        />
                      </div>

                      {/* Discount Type & Value */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Discount Type</label>
                          <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage Off</SelectItem>
                              <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                              <SelectItem value="buy_x_get_y">Buy X Get Y Free</SelectItem>
                              <SelectItem value="category_discount">Category Discount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                          </label>
                          <Input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                            min="0"
                            max={formData.type === 'percentage' ? "100" : "1000"}
                            step={formData.type === 'percentage' ? "1" : "0.01"}
                            required
                            disabled={formData.type === 'buy_x_get_y'}
                          />
                        </div>
                      </div>

                      {/* Buy X Get Y Specific Fields */}
                      {formData.type === 'buy_x_get_y' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium mb-2">Buy Quantity</label>
                            <Input
                              type="number"
                              value={formData.buyQuantity}
                              onChange={(e) => setFormData({...formData, buyQuantity: parseInt(e.target.value) || 2})}
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Get Quantity (Free)</label>
                            <Input
                              type="number"
                              value={formData.getQuantity}
                              onChange={(e) => setFormData({...formData, getQuantity: parseInt(e.target.value) || 1})}
                              min="1"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Conditions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Minimum Purchase ($)</label>
                          <Input
                            type="number"
                            value={formData.minimumPurchase}
                            onChange={(e) => setFormData({...formData, minimumPurchase: parseFloat(e.target.value) || 0})}
                            min="0"
                            step="0.01"
                            placeholder="0 = No minimum"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Maximum Discount ($)</label>
                          <Input
                            type="number"
                            value={formData.maximumDiscount}
                            onChange={(e) => setFormData({...formData, maximumDiscount: parseFloat(e.target.value) || 0})}
                            min="0"
                            step="0.01"
                            placeholder="0 = No limit"
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Usage Limit</label>
                        <Input
                          type="number"
                          value={formData.usageLimit}
                          onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value) || 0})}
                          min="0"
                          placeholder="0 = Unlimited uses"
                        />
                      </div>

                      {/* Switches */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                            />
                            <label className="text-sm font-medium">Active</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.canStack}
                              onCheckedChange={(checked) => setFormData({...formData, canStack: checked})}
                            />
                            <label className="text-sm font-medium">Can Stack with Other Coupons</label>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab('list')}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <SoundButton
                          type="submit"
                          soundType="success"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                        >
                          {activeTab === 'edit' ? 'Update Coupon' : 'Create Coupon'}
                        </SoundButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}