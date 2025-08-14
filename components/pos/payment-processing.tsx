"use client"

import type React from "react"

import { useState } from "react"
import { EnhancedPaymentCompletion } from "./enhanced-payment-completion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Banknote,
  Smartphone,
  Gift,
  Percent,
  Plus,
  Minus,
  X,
  Check,
  ReceiptIcon,
  Printer,
  Mail,
  Wallet,
} from "lucide-react"

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

interface PaymentProcessingProps {
  cart: CartItem[]
  customer: Customer | null
  subtotal: number
  onPaymentComplete: (receipt: any) => void
  onCancel: () => void
}

export function PaymentProcessing({ cart, customer, subtotal, onPaymentComplete, onCancel }: PaymentProcessingProps) {
  const [payments, setPayments] = useState<PaymentMethod[]>([])
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receipt, setReceipt] = useState<any | null>(null)

  const TAX_RATE = 0.08 // 8% tax
  const LOYALTY_POINTS_VALUE = 0.01 // $0.01 per point

  const discount = appliedPromo?.discount || 0
  const loyaltyDiscount = loyaltyPointsToUse * LOYALTY_POINTS_VALUE
  const discountAmount = (subtotal * discount) / 100 + loyaltyDiscount
  const taxableAmount = subtotal - discountAmount
  const tax = taxableAmount * TAX_RATE
  const total = taxableAmount + tax

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remaining = Math.max(0, total - totalPaid)
  const change = Math.max(0, totalPaid - total)

  const paymentMethods = [
    {
      type: "cash" as const,
      name: "Cash",
      icon: <Banknote className="w-5 h-5" />,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      type: "card" as const,
      name: "Card",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      type: "wallet" as const,
      name: "Digital Wallet",
      icon: <Smartphone className="w-5 h-5" />,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      type: "gift_card" as const,
      name: "Gift Card",
      icon: <Gift className="w-5 h-5" />,
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      type: "store_credit" as const,
      name: "Store Credit",
      icon: <Wallet className="w-5 h-5" />,
      color: "bg-orange-600 hover:bg-orange-700",
      disabled: !customer || customer.storeCredit <= 0,
    },
  ]

  const addPayment = (type: PaymentMethod["type"], name: string, amount: number) => {
    const payment: PaymentMethod = {
      id: Date.now().toString(),
      type,
      name,
      icon: paymentMethods.find((pm) => pm.type === type)?.icon || <CreditCard className="w-4 h-4" />,
      amount,
    }
    setPayments([...payments, payment])
  }

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id))
  }

  const applyPromoCode = () => {
    // Demo promo codes
    const promoCodes: Record<string, number> = {
      SAVE10: 10,
      WELCOME15: 15,
      STUDENT20: 20,
      VIP25: 25,
    }

    const discountPercent = promoCodes[promoCode.toUpperCase()]
    if (discountPercent) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: discountPercent })
      setPromoCode("")
    }
  }

  const processPayment = async () => {
    if (remaining > 0.01) return

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const loyaltyPointsEarned = Math.floor(total * 10) // 10 points per dollar
    const newReceipt = {
      id: `RCP-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      cashier: "Current User",
      customer: customer || undefined,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      payments,
      loyaltyPointsEarned,
      loyaltyPointsUsed: loyaltyPointsToUse,
      change: change > 0 ? change : undefined,
    }

    setReceipt(newReceipt)
    setIsProcessing(false)
    setShowReceipt(true)
  }

  const completeTransaction = () => {
    if (receipt) {
      onPaymentComplete(receipt)
    }
  }

  if (showReceipt && receipt) {
    return (
      <EnhancedPaymentCompletion
        receipt={receipt}
        onNewTransaction={completeTransaction}
        onPrintReceipt={() => {
          // This will trigger the print dialog with advanced options
          console.log('Print receipt requested')
        }}
        onEmailReceipt={async (email: string, message?: string) => {
          // Simulate email sending
          console.log('Sending email receipt to:', email, 'with message:', message)
          await new Promise(resolve => setTimeout(resolve, 1500))
          // In a real app, this would call your email service
        }}
        onSMSReceipt={async (phone: string, message?: string) => {
          // Simulate SMS sending
          console.log('Sending SMS receipt to:', phone, 'with message:', message)
          await new Promise(resolve => setTimeout(resolve, 1200))
          // In a real app, this would call your SMS service
        }}
        onViewDetails={() => {
          // View details functionality - could open a detailed transaction view
          console.log('Viewing transaction details for receipt:', receipt.id)
        }}
        onDownloadPDF={() => {
          // PDF download functionality
          console.log('Downloading PDF receipt for:', receipt.id)
          // In a real app, this would generate and download a PDF
        }}
        autoAdvanceSeconds={30}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Payment Processing</h2>
        <p className="text-purple-300">Choose payment methods and complete the transaction</p>
      </div>

      {/* Order Summary */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-white">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator className="bg-purple-500/20" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Subtotal:</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-purple-300">Discount:</span>
                <span className="text-green-400">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-purple-300">Tax (8%):</span>
              <span className="text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-purple-500/20 pt-2">
              <span className="text-white">Total:</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Code & Loyalty Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300 text-sm">Promo Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-600/20 rounded-lg border border-green-500/30">
                <div className="flex items-center">
                  <Percent className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-white font-semibold">{appliedPromo.code}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">{appliedPromo.discount}% off</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAppliedPromo(null)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-white"
                />
                <Button onClick={applyPromoCode} disabled={!promoCode} className="bg-purple-600 hover:bg-purple-700">
                  Apply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {customer && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300 text-sm">Loyalty Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Available:</span>
                <span className="text-purple-400 font-semibold">{customer.loyaltyPoints} pts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoyaltyPointsToUse(Math.max(0, loyaltyPointsToUse - 100))}
                  className="text-purple-400 hover:text-white p-1"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={loyaltyPointsToUse}
                  onChange={(e) =>
                    setLoyaltyPointsToUse(
                      Math.min(customer.loyaltyPoints, Math.max(0, Number.parseInt(e.target.value) || 0)),
                    )
                  }
                  className="bg-slate-700/50 border-purple-500/30 text-white text-center"
                  max={customer.loyaltyPoints}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoyaltyPointsToUse(Math.min(customer.loyaltyPoints, loyaltyPointsToUse + 100))}
                  className="text-purple-400 hover:text-white p-1"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-purple-300">
                Using {loyaltyPointsToUse} points = ${(loyaltyPointsToUse * LOYALTY_POINTS_VALUE).toFixed(2)} off
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Methods */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <Button
                key={method.type}
                onClick={() => {
                  const amount = Math.min(
                    remaining,
                    method.type === "store_credit" ? customer?.storeCredit || 0 : remaining,
                  )
                  if (amount > 0) {
                    addPayment(method.type, method.name, amount)
                  }
                }}
                disabled={method.disabled || remaining <= 0}
                className={`${method.color} text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {method.icon}
                <span className="ml-2 text-sm">{method.name}</span>
              </Button>
            ))}
          </div>

          {/* Applied Payments */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-purple-300 font-semibold text-sm">Applied Payments:</h4>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-500/10"
                >
                  <div className="flex items-center">
                    {payment.icon}
                    <span className="text-white ml-2">{payment.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">${payment.amount.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePayment(payment.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Summary */}
          <div className="space-y-2 p-4 bg-slate-700/20 rounded-lg border border-purple-500/10">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Total Due:</span>
              <span className="text-white font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Total Paid:</span>
              <span className="text-white font-semibold">${totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Remaining:</span>
              <span className={`font-semibold ${remaining > 0 ? "text-red-400" : "text-green-400"}`}>
                ${remaining.toFixed(2)}
              </span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">Change:</span>
                <span className="text-green-400 font-semibold">${change.toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 bg-transparent"
        >
          Cancel
        </Button>
        <Button
          onClick={processPayment}
          disabled={remaining > 0.01 || isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Complete Payment (${remaining > 0 ? `$${remaining.toFixed(2)} remaining` : "Ready"})`
          )}
        </Button>
      </div>
    </div>
  )
}
