"use client"

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  X,
  Search,
  Filter,
  Download,
  Printer,
  History,
  RefreshCw,
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Receipt,
  AlertCircle
} from "lucide-react"
import { useTransactionStore } from "@/stores/transactions"
import { usePrintStore } from "@/stores/print"
import { Transaction } from "@/types"

interface SalesHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode?: boolean
}

interface TransactionDetailViewProps {
  transaction: Transaction
  onClose: () => void
  onRefund: (transactionId: string) => Promise<boolean>
  onPrint: (transactionId: string) => Promise<boolean>
  isDarkMode?: boolean
}

function TransactionDetailView({ 
  transaction, 
  onClose, 
  onRefund, 
  onPrint, 
  isDarkMode = false 
}: TransactionDetailViewProps) {
  const [isRefunding, setIsRefunding] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const handleRefund = async () => {
    if (!window.confirm(`Are you sure you want to refund transaction ${transaction.id}?\n\nThis action cannot be undone and will create a refund transaction.`)) {
      return
    }

    setIsRefunding(true)
    try {
      const success = await onRefund(transaction.id)
      if (success) {
        alert('Transaction refunded successfully!')
        onClose()
      } else {
        alert('Failed to process refund. Please try again.')
      }
    } catch (error) {
      alert('Error processing refund. Please try again.')
    } finally {
      setIsRefunding(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      const success = await onPrint(transaction.id)
      if (!success) {
        alert('Failed to print receipt. Please try again.')
      }
    } catch (error) {
      alert('Error printing receipt. Please try again.')
    } finally {
      setIsPrinting(false)
    }
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'refunded': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <Card
        className={`w-[700px] max-h-[90vh] overflow-hidden ${
          isDarkMode 
            ? 'bg-slate-800/95 border-slate-600' 
            : 'bg-white/95 border-purple-200'
        } animate-scale-in`}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-600' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold ${
                  isDarkMode 
                    ? 'text-slate-100' 
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
                }`}>
                  Transaction Details
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {transaction.id} • Receipt #{transaction.receiptNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`px-3 py-1 text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={`${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[calc(90vh-200px)] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Transaction Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-purple-600'}`} />
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Date & Time</p>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {transaction.date} at {transaction.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-purple-600'}`} />
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Payment Method</p>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {transaction.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-purple-600'}`} />
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Cashier</p>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {transaction.cashier}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className={`h-5 w-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Amount</p>
                        <p className={`text-xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          ${Math.abs(transaction.total).toFixed(2)}
                          {transaction.total < 0 && ' (Refund)'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Items List */}
              <div>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Items ({transaction.items.length})
                </h4>
                <div className="space-y-3">
                  {transaction.items.map((item, index) => (
                    <Card
                      key={index}
                      className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-purple-100'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg ${isDarkMode ? 'bg-slate-600' : 'bg-gradient-to-br from-purple-50 to-violet-50'} flex items-center justify-center`}>
                              <Receipt className={`h-6 w-6 ${isDarkMode ? 'text-slate-400' : 'text-purple-600'}`} />
                            </div>
                            <div>
                              <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                {item.name}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                ${item.price.toFixed(2)} × {Math.abs(item.quantity)}
                                {item.quantity < 0 && ' (Refunded)'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              ${Math.abs(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.discount && (
                              <p className="text-sm text-red-500">
                                -{item.discount}% discount
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Transaction Totals */}
              <Card className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200'}`}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Subtotal:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        ${Math.abs(transaction.subtotal).toFixed(2)}
                      </span>
                    </div>
                    {transaction.discount > 0 && (
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Discount:</span>
                        <span className="font-medium text-red-500">
                          -${transaction.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tax:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        ${Math.abs(transaction.tax).toFixed(2)}
                      </span>
                    </div>
                    <Separator className={`${isDarkMode ? 'bg-slate-600' : 'bg-purple-200'}`} />
                    <div className="flex justify-between text-lg font-bold">
                      <span className={`${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Total:</span>
                      <span className={`${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                        ${Math.abs(transaction.total).toFixed(2)}
                        {transaction.total < 0 && ' (Refund)'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-slate-600' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  variant="outline"
                  className={`${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isPrinting ? 'Printing...' : 'Print Receipt'}
                </Button>
                {transaction.status === 'completed' && (
                  <Button
                    onClick={handleRefund}
                    disabled={isRefunding}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isRefunding ? 'Processing...' : 'Refund Transaction'}
                  </Button>
                )}
              </div>
              <Button
                onClick={onClose}
                className={`${isDarkMode ? 'bg-slate-600 hover:bg-slate-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SalesHistoryDialog({ isOpen, onClose, isDarkMode = false }: SalesHistoryDialogProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const {
    searchTerm,
    dateFilter,
    paymentMethodFilter,
    amountRangeFilter,
    sortBy,
    sortOrder,
    setSearchTerm,
    setDateFilter,
    setPaymentMethodFilter,
    setAmountRangeFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    getFilteredTransactions,
    refundTransaction,
    getTransactionStats
  } = useTransactionStore()

  const { printTransaction } = usePrintStore()

  const transactions = useMemo(() => getFilteredTransactions(), [
    searchTerm,
    dateFilter,
    paymentMethodFilter,
    amountRangeFilter,
    sortBy,
    sortOrder,
    getFilteredTransactions
  ])

  const stats = useMemo(() => getTransactionStats(), [getTransactionStats])

  const handleExport = () => {
    const csvData = transactions.map(t => ({
      ID: t.id,
      'Receipt Number': t.receiptNumber,
      Date: t.date,
      Time: t.time,
      Total: t.total,
      'Payment Method': t.paymentMethod,
      Cashier: t.cashier,
      Status: t.status,
      'Item Count': t.items.length
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const paymentMethods = Array.from(new Set(transactions.map(t => t.paymentMethod)))

  if (!isOpen) return null

  if (selectedTransaction) {
    return (
      <TransactionDetailView
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onRefund={refundTransaction}
        onPrint={printTransaction}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card
        className={`w-[900px] max-h-[90vh] ${
          isDarkMode 
            ? 'bg-slate-800/95 border-slate-600' 
            : 'bg-white/95 border-purple-200'
        } animate-scale-in overflow-hidden`}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-600' : 'border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold ${
                  isDarkMode 
                    ? 'text-slate-100' 
                    : 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent'
                }`}>
                  Sales History
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {transactions.length} transactions found
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={`${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Card className={`${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-purple-50 to-violet-50'} border-none`}>
                <CardContent className="p-3 text-center">
                  <TrendingUp className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-purple-600'} mx-auto mb-1`} />
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total</p>
                  <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{stats.total}</p>
                </CardContent>
              </Card>
              <Card className={`${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-emerald-50 to-green-50'} border-none`}>
                <CardContent className="p-3 text-center">
                  <Calendar className={`h-5 w-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mx-auto mb-1`} />
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Today</p>
                  <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{stats.today}</p>
                </CardContent>
              </Card>
              <Card className={`${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border-none`}>
                <CardContent className="p-3 text-center">
                  <DollarSign className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-1`} />
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>This Week</p>
                  <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{stats.thisWeek}</p>
                </CardContent>
              </Card>
              <Card className={`${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-orange-50 to-red-50'} border-none`}>
                <CardContent className="p-3 text-center">
                  <Receipt className={`h-5 w-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mx-auto mb-1`} />
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Avg Amount</p>
                  <p className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>${stats.averageAmount}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-600' : 'border-purple-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-slate-400' : 'text-purple-400'}`} />
                <Input
                  placeholder="Search transactions, receipts, cashier, or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                      : 'bg-white/80 border-purple-200 placeholder:text-purple-400'
                  }`}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-purple-200 text-purple-600'}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className={`${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-purple-200 text-purple-600'}`}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={dateFilter.start || ''}
                    onChange={(e) => setDateFilter(e.target.value || null, dateFilter.end)}
                    className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'border-purple-200'}`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={dateFilter.end || ''}
                    onChange={(e) => setDateFilter(dateFilter.start, e.target.value || null)}
                    className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'border-purple-200'}`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Payment Method
                  </label>
                  <Select value={paymentMethodFilter || ''} onValueChange={(value) => setPaymentMethodFilter(value || null)}>
                    <SelectTrigger className={`${isDarkMode ? 'bg-slate-700 border-slate-600' : 'border-purple-200'}`}>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All methods</SelectItem>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className={`w-full ${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-purple-200 text-purple-600'}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Transactions List */}
          <ScrollArea className="max-h-[calc(90vh-250px)] overflow-y-auto">
            <div className="p-6">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                  <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    No transactions found
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <Card
                      key={transaction.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.01] ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 hover:bg-slate-650' 
                          : 'bg-white border-purple-100 hover:bg-purple-50'
                      } animate-fade-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg ${isDarkMode ? 'bg-slate-600' : 'bg-gradient-to-br from-purple-50 to-violet-50'} flex items-center justify-center`}>
                              <Receipt className={`h-6 w-6 ${isDarkMode ? 'text-slate-400' : 'text-purple-600'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                  {transaction.id}
                                </p>
                                <Badge className={`px-2 py-0.5 text-xs ${getStatusColor(transaction.status)}`}>
                                  {transaction.status}
                                </Badge>
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {transaction.date} at {transaction.time} • {transaction.cashier}
                              </p>
                              <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {transaction.items.length} items • {transaction.paymentMethod}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              ${Math.abs(transaction.total).toFixed(2)}
                              {transaction.total < 0 && (
                                <span className="text-red-500 text-sm ml-1">(Refund)</span>
                              )}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Eye className={`h-4 w-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                              <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Click for details
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-slate-600' : 'border-purple-200'}`}>
            <div className="flex justify-between items-center">
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Showing {transactions.length} transactions
              </p>
              <Button
                onClick={onClose}
                className={`${isDarkMode ? 'bg-slate-600 hover:bg-slate-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}