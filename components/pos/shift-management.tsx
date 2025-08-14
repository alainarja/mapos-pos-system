"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  CreditCard,
  Banknote,
  PieChart,
  AlertCircle,
  Play,
  Square,
} from "lucide-react"

interface ShiftData {
  id: string
  cashier: string
  startTime: string
  endTime?: string
  openingFloat: number
  cashDrops: CashDrop[]
  sales: ShiftSales
  status: "open" | "closed"
}

interface CashDrop {
  id: string
  amount: number
  time: string
  reason: string
  notes?: string
}

interface ShiftSales {
  totalSales: number
  totalTransactions: number
  totalItems: number
  paymentMethods: {
    cash: number
    card: number
    wallet: number
    giftCard: number
    storeCredit: number
  }
  returns: number
  discounts: number
  tax: number
}

interface ShiftManagementProps {
  currentShift: ShiftData | null
  onShiftStart: (openingFloat: number) => void
  onShiftEnd: (shift: ShiftData) => void
  onCashDrop: (amount: number, reason: string, notes?: string) => void
}

const sampleShiftData: ShiftData = {
  id: "SHIFT-20240115-001",
  cashier: "Current User",
  startTime: "09:00:00",
  openingFloat: 200.0,
  cashDrops: [
    {
      id: "DROP-001",
      amount: 500.0,
      time: "12:30:00",
      reason: "Safe Drop",
      notes: "Lunch rush cash drop",
    },
    {
      id: "DROP-002",
      amount: 300.0,
      time: "15:45:00",
      reason: "Safe Drop",
      notes: "Afternoon cash drop",
    },
  ],
  sales: {
    totalSales: 2847.5,
    totalTransactions: 127,
    totalItems: 342,
    paymentMethods: {
      cash: 1245.75,
      card: 1401.25,
      wallet: 156.5,
      giftCard: 44.0,
      storeCredit: 0.0,
    },
    returns: 89.5,
    discounts: 142.25,
    tax: 227.8,
  },
  status: "open",
}

export function ShiftManagement({ currentShift, onShiftStart, onShiftEnd, onCashDrop }: ShiftManagementProps) {
  const [mode, setMode] = useState<"overview" | "start" | "end" | "cash_drop">("overview")
  const [openingFloat, setOpeningFloat] = useState("")
  const [cashDropAmount, setCashDropAmount] = useState("")
  const [cashDropReason, setCashDropReason] = useState("")
  const [cashDropNotes, setCashDropNotes] = useState("")
  const [endingCash, setEndingCash] = useState("")
  const [shiftNotes, setShiftNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const shift = currentShift || sampleShiftData

  const calculateExpectedCash = () => {
    const totalCashDrops = shift.cashDrops.reduce((sum, drop) => sum + drop.amount, 0)
    return shift.openingFloat + shift.sales.paymentMethods.cash - totalCashDrops
  }

  const calculateCashVariance = () => {
    const expected = calculateExpectedCash()
    const actual = Number.parseFloat(endingCash) || 0
    return actual - expected
  }

  const handleStartShift = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onShiftStart(Number.parseFloat(openingFloat))
    setIsProcessing(false)
    setMode("overview")
  }

  const handleCashDrop = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onCashDrop(Number.parseFloat(cashDropAmount), cashDropReason, cashDropNotes)
    setCashDropAmount("")
    setCashDropReason("")
    setCashDropNotes("")
    setIsProcessing(false)
    setMode("overview")
  }

  const handleEndShift = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const endedShift = {
      ...shift,
      endTime: new Date().toLocaleTimeString(),
      status: "closed" as const,
    }
    onShiftEnd(endedShift)
    setIsProcessing(false)
    setMode("overview")
  }

  if (mode === "start") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Start New Shift</h2>
          <p className="text-purple-300">Enter the opening cash float to begin your shift</p>
        </div>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300">Opening Cash Float</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="opening-float" className="text-purple-300">
                Cash Amount ($)
              </Label>
              <Input
                id="opening-float"
                type="number"
                step="0.01"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                className="bg-slate-700/50 border-purple-500/30 text-white text-lg"
                placeholder="0.00"
              />
            </div>

            <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-white font-semibold">Important</span>
              </div>
              <p className="text-blue-300 text-sm">
                Count your cash drawer carefully. This amount will be used to calculate your end-of-shift variance.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setMode("overview")}
                variant="outline"
                className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartShift}
                disabled={!openingFloat || Number.parseFloat(openingFloat) < 0 || isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Starting..." : "Start Shift"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "cash_drop") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Cash Drop</h2>
          <p className="text-purple-300">Remove excess cash from the register</p>
        </div>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300">Cash Drop Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cash-drop-amount" className="text-purple-300">
                Amount to Drop ($)
              </Label>
              <Input
                id="cash-drop-amount"
                type="number"
                step="0.01"
                value={cashDropAmount}
                onChange={(e) => setCashDropAmount(e.target.value)}
                className="bg-slate-700/50 border-purple-500/30 text-white text-lg"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="cash-drop-reason" className="text-purple-300">
                Reason
              </Label>
              <select
                id="cash-drop-reason"
                value={cashDropReason}
                onChange={(e) => setCashDropReason(e.target.value)}
                className="w-full bg-slate-700/50 border border-purple-500/30 text-white rounded-md px-3 py-2"
              >
                <option value="">Select reason</option>
                <option value="Safe Drop">Safe Drop</option>
                <option value="Bank Deposit">Bank Deposit</option>
                <option value="Change Fund">Change Fund</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="cash-drop-notes" className="text-purple-300">
                Notes (Optional)
              </Label>
              <Textarea
                id="cash-drop-notes"
                value={cashDropNotes}
                onChange={(e) => setCashDropNotes(e.target.value)}
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setMode("overview")}
                variant="outline"
                className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCashDrop}
                disabled={!cashDropAmount || !cashDropReason || Number.parseFloat(cashDropAmount) <= 0 || isProcessing}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing ? "Processing..." : "Record Cash Drop"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === "end") {
    const expectedCash = calculateExpectedCash()
    const variance = calculateCashVariance()

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Square className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">End Shift</h2>
          <p className="text-purple-300">Complete your shift and generate end-of-day report</p>
        </div>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300">Cash Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-300">Opening Float:</span>
                  <span className="text-white">${shift.openingFloat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Cash Sales:</span>
                  <span className="text-white">${shift.sales.paymentMethods.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">Cash Drops:</span>
                  <span className="text-red-400">
                    -${shift.cashDrops.reduce((sum, drop) => sum + drop.amount, 0).toFixed(2)}
                  </span>
                </div>
                <Separator className="bg-purple-500/20" />
                <div className="flex justify-between font-semibold">
                  <span className="text-purple-300">Expected Cash:</span>
                  <span className="text-white">${expectedCash.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="ending-cash" className="text-purple-300">
                    Actual Cash Count ($)
                  </Label>
                  <Input
                    id="ending-cash"
                    type="number"
                    step="0.01"
                    value={endingCash}
                    onChange={(e) => setEndingCash(e.target.value)}
                    className="bg-slate-700/50 border-purple-500/30 text-white text-lg"
                    placeholder="0.00"
                  />
                </div>

                {endingCash && (
                  <div
                    className={`p-3 rounded-lg border ${
                      Math.abs(variance) < 0.01
                        ? "bg-green-600/20 border-green-500/30"
                        : Math.abs(variance) <= 5
                          ? "bg-yellow-600/20 border-yellow-500/30"
                          : "bg-red-600/20 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Variance:</span>
                      <span
                        className={`font-bold ${
                          Math.abs(variance) < 0.01
                            ? "text-green-400"
                            : variance > 0
                              ? "text-green-400"
                              : "text-red-400"
                        }`}
                      >
                        {variance > 0 ? "+" : ""}${variance.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 opacity-80">
                      {Math.abs(variance) < 0.01
                        ? "Perfect balance!"
                        : Math.abs(variance) <= 5
                          ? "Minor variance - within acceptable range"
                          : "Significant variance - requires manager review"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="shift-notes" className="text-purple-300">
                Shift Notes (Optional)
              </Label>
              <Textarea
                id="shift-notes"
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                className="bg-slate-700/50 border-purple-500/30 text-white"
                placeholder="Any notes about the shift..."
              />
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setMode("overview")}
                variant="outline"
                className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEndShift}
                disabled={!endingCash || isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? "Ending Shift..." : "End Shift"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Shift Management</h2>
        <p className="text-purple-300">Monitor and manage your current shift</p>
      </div>

      {/* Shift Status */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Current Shift
            </span>
            <Badge className={shift.status === "open" ? "bg-green-600" : "bg-red-600"}>
              {shift.status === "open" ? "Active" : "Closed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-purple-300 text-sm">Shift ID</p>
              <p className="text-white font-semibold">{shift.id}</p>
            </div>
            <div>
              <p className="text-purple-300 text-sm">Cashier</p>
              <p className="text-white font-semibold">{shift.cashier}</p>
            </div>
            <div>
              <p className="text-purple-300 text-sm">Started</p>
              <p className="text-white font-semibold">{shift.startTime}</p>
            </div>
          </div>

          {shift.status === "open" && (
            <div className="flex space-x-4">
              <Button
                onClick={() => setMode("cash_drop")}
                variant="outline"
                className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Cash Drop
              </Button>
              <Button
                onClick={() => setMode("end")}
                variant="outline"
                className="border-red-500/30 text-red-300 hover:bg-red-500/20"
              >
                <Square className="w-4 h-4 mr-2" />
                End Shift
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white">${shift.sales.totalSales.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white">{shift.sales.totalTransactions}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Items Sold</p>
                <p className="text-2xl font-bold text-white">{shift.sales.totalItems}</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Avg. Sale</p>
                <p className="text-2xl font-bold text-white">
                  $
                  {shift.sales.totalTransactions > 0
                    ? (shift.sales.totalSales / shift.sales.totalTransactions).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-300">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <Banknote className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-purple-300 text-sm">Cash</p>
              <p className="text-white font-semibold">${shift.sales.paymentMethods.cash.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <CreditCard className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-purple-300 text-sm">Card</p>
              <p className="text-white font-semibold">${shift.sales.paymentMethods.card.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-400 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <p className="text-purple-300 text-sm">Wallet</p>
              <p className="text-white font-semibold">${shift.sales.paymentMethods.wallet.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-400 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <p className="text-purple-300 text-sm">Gift Card</p>
              <p className="text-white font-semibold">${shift.sales.paymentMethods.giftCard.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-orange-400 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <p className="text-purple-300 text-sm">Store Credit</p>
              <p className="text-white font-semibold">${shift.sales.paymentMethods.storeCredit.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Drops */}
      {shift.cashDrops.length > 0 && (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-300">Cash Drops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shift.cashDrops.map((drop) => (
                <div key={drop.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{drop.reason}</p>
                    <p className="text-purple-300 text-sm">{drop.time}</p>
                    {drop.notes && <p className="text-purple-400 text-xs">{drop.notes}</p>}
                  </div>
                  <span className="text-orange-400 font-semibold">${drop.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-purple-500/20">
                <span className="text-purple-300 font-semibold">Total Drops:</span>
                <span className="text-orange-400 font-bold">
                  ${shift.cashDrops.reduce((sum, drop) => sum + drop.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!currentShift && (
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">No Active Shift</h3>
            <p className="text-purple-300 text-sm mb-4">Start a new shift to begin processing sales</p>
            <Button onClick={() => setMode("start")} className="bg-green-600 hover:bg-green-700">
              Start New Shift
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
