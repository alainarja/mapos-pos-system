"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSound } from "@/hooks/use-sound"
import { ReceiptActions } from "./receipt-actions"
import { TransactionDetailsModal } from "./transaction-details-modal"
import { PrintDialog } from "./print-dialog"
import { usePrintStore } from "@/stores/print"
import { useSettingsStore } from "@/stores/settings"
import {
  Check,
  CheckCircle2,
  Printer,
  Mail,
  MessageSquare,
  Receipt,
  ArrowRight,
  Eye,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Gift,
  Wallet,
  Download,
  Share2,
  Star,
  Sparkles,
  Trophy,
  AlertCircle,
} from "lucide-react"

// Confetti particle component
const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899']
  const shapes = ['circle', 'square', 'triangle']
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
  const randomDelay = Math.random() * 3
  const randomDuration = 3 + Math.random() * 4
  const randomX = Math.random() * 100
  const randomRotation = Math.random() * 360

  return (
    <motion.div
      className={`absolute w-3 h-3 ${randomShape === 'circle' ? 'rounded-full' : randomShape === 'square' ? 'rounded-sm' : 'rounded-none'}`}
      style={{ backgroundColor: randomColor, left: `${randomX}%` }}
      initial={{ 
        y: -100, 
        rotation: randomRotation,
        scale: 1,
        opacity: 1
      }}
      animate={{ 
        y: window.innerHeight + 100,
        rotation: randomRotation + 720,
        scale: 0.5,
        opacity: 0
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: "easeOut"
      }}
    />
  )
}

// Floating celebration icons
const CelebrationIcon = ({ icon: Icon, delay }: { icon: any, delay: number }) => {
  return (
    <motion.div
      className="absolute text-yellow-400"
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ 
        scale: [0, 1.2, 1],
        opacity: [0, 1, 0.7],
        rotate: [180, 0, 360],
        y: [-20, -40, -60]
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeOut"
      }}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
  )
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  discount?: number
}

interface Customer {
  id: string
  name: string
  email: string
  loyaltyPoints: number
  storeCredit: number
  tier: string
}

interface PaymentMethod {
  id: string
  type: "cash" | "card" | "wallet" | "gift_card" | "store_credit"
  name: string
  icon: React.ReactNode
  amount: number
}

interface Receipt {
  id: string
  date: string
  time: string
  cashier: string
  customer?: Customer
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  payments: PaymentMethod[]
  loyaltyPointsEarned: number
  loyaltyPointsUsed: number
  change?: number
}

interface EnhancedPaymentCompletionProps {
  receipt: Receipt
  onNewTransaction: () => void
  onPrintReceipt: () => void
  onEmailReceipt?: (email: string, message?: string) => Promise<void>
  onSMSReceipt?: (phone: string, message?: string) => Promise<void>
  onViewDetails?: () => void
  onDownloadPDF?: () => void
  autoAdvanceSeconds?: number
}

const paymentMethodIcons = {
  cash: Banknote,
  card: CreditCard,
  wallet: Smartphone,
  gift_card: Gift,
  store_credit: Wallet,
}

export function EnhancedPaymentCompletion({
  receipt,
  onNewTransaction,
  onPrintReceipt,
  onEmailReceipt,
  onSMSReceipt,
  onViewDetails,
  onDownloadPDF,
  autoAdvanceSeconds = 30
}: EnhancedPaymentCompletionProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(autoAdvanceSeconds)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [autoPrintCompleted, setAutoPrintCompleted] = useState(false)
  const [autoPrintError, setAutoPrintError] = useState<string | null>(null)
  const { playSuccess, playSpecial } = useSound()
  const { autoPrintReceipt, generateReceipt } = usePrintStore()
  const { settings } = useSettingsStore()

  // Play success sounds and handle auto-print on mount
  useEffect(() => {
    const playSuccessSounds = async () => {
      await playSuccess()
      setTimeout(() => playSpecial(), 500)
    }
    playSuccessSounds()

    // Handle automatic receipt printing
    const handleAutoPrint = async () => {
      if (settings.print.autoPrintEnabled && settings.print.printImmediately && !autoPrintCompleted) {
        try {
          // Convert receipt to print format
          const printReceipt = generateReceipt(
            receipt.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              discount: item.discount
            })),
            {
              method: receipt.payments.map(p => p.name).join(', '),
              subtotal: receipt.subtotal,
              tax: receipt.tax,
              total: receipt.total,
              totalSavings: receipt.loyaltyPointsUsed * 0.01, // Assuming $0.01 per point
            },
            receipt.cashier,
            receipt.customer
          )

          const success = await autoPrintReceipt(printReceipt)
          
          if (success) {
            setAutoPrintCompleted(true)
            // Show brief success message
            setTimeout(() => {
              // Optional: Show notification that receipt was auto-printed
            }, 100)
          } else {
            setAutoPrintError('Auto-print failed')
          }
        } catch (error) {
          console.error('Auto-print error:', error)
          setAutoPrintError('Auto-print failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
      }
    }

    // Delay auto-print based on settings
    const delay = settings.print.printDelay * 1000
    const timer = setTimeout(handleAutoPrint, delay)

    return () => clearTimeout(timer)
  }, [playSuccess, playSpecial, settings.print, receipt, autoPrintCompleted, generateReceipt, autoPrintReceipt])

  // Auto-advance timer
  useEffect(() => {
    if (autoAdvanceTimer <= 0) return
    
    const timer = setInterval(() => {
      setAutoAdvanceTimer(prev => {
        if (prev <= 1) {
          onNewTransaction()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoAdvanceTimer, onNewTransaction])

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleNewTransaction = useCallback(() => {
    setAutoAdvanceTimer(0)
    onNewTransaction()
  }, [onNewTransaction])

  const handleManualPrint = () => {
    setShowPrintDialog(true)
  }

  const handlePrintDialogComplete = () => {
    setShowPrintDialog(false)
    // Optional: Show success message or update UI
  }

  const successVariants = {
    initial: { scale: 0, opacity: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.8
      }
    }
  }

  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const staggerItem = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute -bottom-32 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Success Header */}
          <motion.div 
            className="text-center relative"
            variants={staggerItem}
          >
            {/* Floating celebration icons */}
            <div className="absolute inset-0 pointer-events-none">
              <CelebrationIcon icon={Star} delay={0.5} />
              <CelebrationIcon icon={Sparkles} delay={1} />
              <CelebrationIcon icon={Trophy} delay={1.5} />
            </div>

            <motion.div
              className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-2xl"
              variants={successVariants}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>

            <motion.h1 
              className="text-5xl font-bold text-white mb-4 font-bruno-ace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Payment Successful!
            </motion.h1>
            
            <motion.p 
              className="text-xl text-purple-200 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Transaction completed successfully
            </motion.p>

            <motion.div
              className="flex items-center justify-center space-x-4 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                <Receipt className="w-4 h-4 mr-1" />
                Receipt #{receipt.id}
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Clock className="w-4 h-4 mr-1" />
                {receipt.time}
              </Badge>
            </motion.div>
          </motion.div>

          {/* Transaction Summary Card */}
          <motion.div variants={cardVariants}>
            <Card className="bg-slate-800/50 backdrop-blur-lg border-purple-500/30 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-purple-300 flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                  Transaction Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Amount Display */}
                <div className="text-center py-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
                  <div className="text-6xl font-bold text-white mb-2">
                    ${receipt.total.toFixed(2)}
                  </div>
                  <div className="text-green-300 text-lg">Total Amount</div>
                  {receipt.change && receipt.change > 0 && (
                    <div className="text-yellow-300 text-lg mt-2">
                      Change: ${receipt.change.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-purple-300 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Methods
                  </h3>
                  <motion.div 
                    className="grid gap-3"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {receipt.payments.map((payment) => {
                      const IconComponent = paymentMethodIcons[payment.type]
                      return (
                        <motion.div
                          key={payment.id}
                          variants={staggerItem}
                          className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-purple-500/10"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <IconComponent className="w-5 h-5 text-purple-300" />
                            </div>
                            <span className="text-white font-medium">{payment.name}</span>
                          </div>
                          <span className="text-white font-bold text-lg">
                            ${payment.amount.toFixed(2)}
                          </span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </div>

                {/* Items Summary */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-purple-300">
                    Items ({receipt.items.length})
                  </h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {receipt.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm py-2 px-3 bg-slate-700/20 rounded-lg"
                      >
                        <div>
                          <span className="text-white">{item.name}</span>
                          <span className="text-purple-300 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-white font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loyalty Points */}
                {receipt.customer && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Loyalty Points</div>
                        <div className="text-yellow-300 text-sm">
                          +{receipt.loyaltyPointsEarned} earned
                          {receipt.loyaltyPointsUsed > 0 && ` • -${receipt.loyaltyPointsUsed} used`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          {(onEmailReceipt || onSMSReceipt) && (
            <ReceiptActions
              receipt={{
                id: receipt.id,
                date: receipt.date,
                time: receipt.time,
                cashier: receipt.cashier,
                customer: receipt.customer,
                total: receipt.total,
              }}
              onEmailSend={onEmailReceipt || (async () => {})}
              onSMSSend={onSMSReceipt || (async () => {})}
              onPrint={handleManualPrint}
              onDownload={onDownloadPDF}
              autoPrintStatus={autoPrintCompleted ? 'completed' : autoPrintError ? 'error' : 'pending'}
            />
          )}

          {/* Fallback simple action buttons if receipt actions not available */}
          {!onEmailReceipt && !onSMSReceipt && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={staggerItem}>
                <Button
                  onClick={handleManualPrint}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl relative"
                >
                  <Printer className="w-6 h-6 mr-3" />
                  {autoPrintCompleted ? 'Print Another Copy' : 'Print Receipt'}
                  {autoPrintCompleted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </Button>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Button
                  onClick={() => setShowDetailsModal(true)}
                  variant="outline"
                  className="w-full h-16 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 bg-transparent font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
                >
                  <Eye className="w-6 h-6 mr-3" />
                  View Details
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* View Details Button (always show even with receipt actions) */}
          {(onEmailReceipt || onSMSReceipt) && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={() => setShowDetailsModal(true)}
                variant="ghost"
                className="text-purple-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Transaction Details
              </Button>
            </motion.div>
          )}

          {/* Auto-Print Status */}
          {settings.print.autoPrintEnabled && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {autoPrintCompleted ? (
                <div className="flex items-center justify-center space-x-2 text-green-300">
                  <Check className="w-5 h-5" />
                  <span>Receipt printed automatically</span>
                </div>
              ) : autoPrintError ? (
                <div className="flex items-center justify-center space-x-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span>Auto-print failed: {autoPrintError}</span>
                  <Button
                    onClick={handleManualPrint}
                    size="sm"
                    variant="outline"
                    className="ml-2 text-xs border-red-400 text-red-300 hover:bg-red-500/20"
                  >
                    Print Manually
                  </Button>
                </div>
              ) : settings.print.printDelay > 0 ? (
                <div className="flex items-center justify-center space-x-2 text-purple-300">
                  <Printer className="w-5 h-5" />
                  <span>Auto-printing in {Math.max(1, settings.print.printDelay)} seconds...</span>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* New Transaction Button with Timer */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Button
              onClick={handleNewTransaction}
              className="w-full md:w-auto px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-2xl rounded-2xl"
            >
              <ArrowRight className="w-6 h-6 mr-3" />
              Start New Transaction
            </Button>
            
            {autoAdvanceTimer > 0 && (
              <motion.div
                className="text-purple-300 text-lg"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Auto-advancing in {autoAdvanceTimer} seconds
              </motion.div>
            )}
          </motion.div>

          {/* Receipt Toggle */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              onClick={() => setShowReceipt(!showReceipt)}
              variant="ghost"
              className="text-purple-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
            >
              {showReceipt ? 'Hide' : 'Show'} Full Receipt
              <Receipt className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Full Receipt (Collapsible) */}
          <AnimatePresence>
            {showReceipt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <Card className="bg-slate-800/50 backdrop-blur-lg border-purple-500/30 shadow-2xl">
                  <CardContent className="p-8 space-y-6">
                    {/* Receipt Header */}
                    <div className="text-center border-b border-purple-500/20 pb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Receipt className="w-8 h-8 text-purple-300" />
                      </div>
                      <h3 className="text-white font-bruno-ace text-2xl">MAPOS Store</h3>
                      <p className="text-purple-300 text-sm mt-2">123 Main Street, City, State 12345</p>
                      <p className="text-purple-300 text-sm">Phone: (555) 123-4567</p>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Receipt #:</span>
                          <span className="text-white font-mono">{receipt.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Date:</span>
                          <span className="text-white">{receipt.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Time:</span>
                          <span className="text-white">{receipt.time}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Cashier:</span>
                          <span className="text-white">{receipt.cashier}</span>
                        </div>
                        {receipt.customer && (
                          <div className="flex justify-between">
                            <span className="text-purple-300">Customer:</span>
                            <span className="text-white">{receipt.customer.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-purple-500/20" />

                    {/* Totals */}
                    <div className="space-y-2 text-lg">
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
                      <div className="flex justify-between font-bold text-xl border-t border-purple-500/20 pt-2">
                        <span className="text-white">Total:</span>
                        <span className="text-white">${receipt.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-center pt-6 border-t border-purple-500/20">
                      <p className="text-purple-300">Thank you for shopping with MAPOS!</p>
                      <p className="text-purple-400 text-sm mt-1">Visit us again soon</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        receipt={receipt}
        onPrint={handleManualPrint}
        onDownload={onDownloadPDF}
      />

      {/* Print Dialog */}
      <PrintDialog
        isOpen={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        receipt={{
          id: receipt.id,
          timestamp: new Date(`${receipt.date}T${receipt.time}`),
          cashier: receipt.cashier,
          items: receipt.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            discount: item.discount
          })),
          subtotal: receipt.subtotal,
          tax: receipt.tax,
          total: receipt.total,
          totalSavings: receipt.loyaltyPointsUsed * 0.01,
          paymentMethod: receipt.payments.map(p => p.name).join(', '),
          customer: receipt.customer,
          change: receipt.change
        }}
        onPrintComplete={handlePrintDialogComplete}
        showPreview={true}
        allowMultipleCopies={true}
        showPrinterSelection={true}
      />
    </div>
  )
}