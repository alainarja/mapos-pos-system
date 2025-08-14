"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Receipt,
  User,
  Clock,
  DollarSign,
  Tag,
  Percent,
  CreditCard,
  Star,
  MapPin,
  Calendar,
  Hash,
  TrendingUp,
  Download,
  Printer,
  Eye,
  X,
} from "lucide-react"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  receipt: {
    id: string
    date: string
    time: string
    cashier: string
    customer?: {
      id: string
      name: string
      email: string
      loyaltyPoints: number
      storeCredit: number
      tier: string
    }
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
      discount?: number
    }>
    subtotal: number
    discount: number
    tax: number
    total: number
    payments: Array<{
      id: string
      type: string
      name: string
      amount: number
    }>
    loyaltyPointsEarned: number
    loyaltyPointsUsed: number
    change?: number
  }
  onPrint?: () => void
  onDownload?: () => void
}

export function TransactionDetailsModal({
  isOpen,
  onOpenChange,
  receipt,
  onPrint,
  onDownload,
}: TransactionDetailsModalProps) {
  const modalVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    }
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-purple-500/30 text-white">
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-purple-300 flex items-center">
              <Receipt className="w-7 h-7 mr-3 text-purple-400" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>

          <motion.div
            variants={containerVariants}
            animate="animate"
            className="space-y-6"
          >
            {/* Transaction Summary Header */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-3">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">${receipt.total.toFixed(2)}</div>
                      <div className="text-sm text-green-400">Total Amount</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-3">
                        <Hash className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-xl font-bold text-white">{receipt.id}</div>
                      <div className="text-sm text-blue-400">Receipt Number</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-3">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-lg font-bold text-white">{receipt.time}</div>
                      <div className="text-sm text-purple-400">{receipt.date}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transaction Info */}
              <motion.div variants={itemVariants}>
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center">
                      <Receipt className="w-5 h-5 mr-2" />
                      Transaction Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <Hash className="w-4 h-4 mr-2" />
                          Receipt ID:
                        </span>
                        <Badge variant="outline" className="font-mono">
                          {receipt.id}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Date:
                        </span>
                        <span className="text-white">{receipt.date}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Time:
                        </span>
                        <span className="text-white">{receipt.time}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Cashier:
                        </span>
                        <span className="text-white">{receipt.cashier}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <Tag className="w-4 h-4 mr-2" />
                          Items:
                        </span>
                        <span className="text-white">{receipt.items.length} items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Customer Info */}
              <motion.div variants={itemVariants}>
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {receipt.customer ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">Name:</span>
                          <span className="text-white font-medium">{receipt.customer.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">Email:</span>
                          <span className="text-white">{receipt.customer.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">Tier:</span>
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            {receipt.customer.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">Loyalty Points:</span>
                          <span className="text-yellow-400 font-medium">{receipt.customer.loyaltyPoints}</span>
                        </div>
                        {receipt.customer.storeCredit > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-purple-300">Store Credit:</span>
                            <span className="text-green-400 font-medium">${receipt.customer.storeCredit.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-400 text-sm">No customer information</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Items Details */}
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Items Purchased
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {receipt.items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-sm text-purple-300">
                            ${item.price.toFixed(2)} × {item.quantity}
                            {item.discount && item.discount > 0 && (
                              <span className="text-green-400 ml-2">
                                ({item.discount}% off)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-white font-semibold">
                          ${(item.price * item.quantity * (1 - (item.discount || 0) / 100)).toFixed(2)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Breakdown */}
            <motion.div variants={itemVariants}>
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Methods */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-purple-300">Payment Methods:</h4>
                    {receipt.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-slate-700/20 rounded">
                        <span className="text-white">{payment.name}</span>
                        <span className="text-white font-medium">${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-purple-500/20" />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Subtotal:</span>
                      <span className="text-white">${receipt.subtotal.toFixed(2)}</span>
                    </div>
                    {receipt.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-purple-300">Discount:</span>
                        <span className="text-green-400">-${receipt.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-purple-300">Tax:</span>
                      <span className="text-white">${receipt.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-purple-500/20" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-white">Total:</span>
                      <span className="text-white">${receipt.total.toFixed(2)}</span>
                    </div>
                    {receipt.change && receipt.change > 0 && (
                      <div className="flex justify-between font-semibold">
                        <span className="text-purple-300">Change:</span>
                        <span className="text-green-400">${receipt.change.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Loyalty Points */}
            {receipt.customer && (receipt.loyaltyPointsEarned > 0 || receipt.loyaltyPointsUsed > 0) && (
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-300 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Loyalty Points Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {receipt.loyaltyPointsUsed > 0 && (
                        <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="text-2xl font-bold text-red-400">-{receipt.loyaltyPointsUsed}</div>
                          <div className="text-sm text-red-300">Points Used</div>
                        </div>
                      )}
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">+{receipt.loyaltyPointsEarned}</div>
                        <div className="text-sm text-green-300">Points Earned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              {onPrint && (
                <Button
                  onClick={onPrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
              )}
              {onDownload && (
                <Button
                  onClick={onDownload}
                  variant="outline"
                  className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}