'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Receipt, 
  Calendar, 
  User, 
  DollarSign, 
  RefreshCcw,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react'
import { refundIntegration, type RefundableTransaction, type RefundSearchParams } from '@/lib/services/refund-integration'

export default function RefundLookup() {
  const [searchParams, setSearchParams] = useState<RefundSearchParams>({})
  const [searchResults, setSearchResults] = useState<RefundableTransaction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<RefundableTransaction | null>(null)
  const [isProcessingRefund, setIsProcessingRefund] = useState(false)
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [refundResult, setRefundResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSearch = async () => {
    if (!searchParams.receiptNumber && !searchParams.invoiceNumber && 
        !searchParams.customerId && !searchParams.customerName) {
      setSearchError('Please enter at least one search criteria')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])

    try {
      const results = await refundIntegration.searchRefundableTransactions(searchParams)
      setSearchResults(results)
      
      if (results.length === 0) {
        setSearchError('No refundable transactions found matching your search criteria')
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleRefundSelect = (transaction: RefundableTransaction) => {
    setSelectedTransaction(transaction)
    setRefundAmount(transaction.total.toFixed(2))
    setRefundResult(null)
  }

  const handleProcessRefund = async () => {
    if (!selectedTransaction) return

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0 || amount > selectedTransaction.total) {
      setRefundResult({ 
        success: false, 
        message: 'Invalid refund amount' 
      })
      return
    }

    setIsProcessingRefund(true)
    setRefundResult(null)

    try {
      const result = await refundIntegration.processRefund(selectedTransaction, amount)
      
      if (result.success) {
        setRefundResult({ 
          success: true, 
          message: `Refund processed successfully. Refund ID: ${result.refundId}` 
        })
        
        // Remove the refunded transaction from results
        setSearchResults(prev => prev.filter(t => t.id !== selectedTransaction.id))
        setSelectedTransaction(null)
        setRefundAmount('')
      } else {
        setRefundResult({ 
          success: false, 
          message: result.error || 'Refund processing failed' 
        })
      }
    } catch (error) {
      setRefundResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Refund processing failed' 
      })
    } finally {
      setIsProcessingRefund(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <RefreshCcw className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Refund & Exchange</h1>
          <p className="text-gray-600">Search and process refunds for recent and historical transactions</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Transaction Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="receipt-number">Receipt Number</Label>
              <Input
                id="receipt-number"
                placeholder="Enter receipt number..."
                value={searchParams.receiptNumber || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, receiptNumber: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="invoice-number">Invoice Number (CRM)</Label>
              <Input
                id="invoice-number"
                placeholder="Enter invoice number..."
                value={searchParams.invoiceNumber || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="customer-id">Customer ID</Label>
              <Input
                id="customer-id"
                placeholder="Enter customer ID..."
                value={searchParams.customerId || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, customerId: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name..."
                value={searchParams.customerName || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            {isSearching ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Transactions
              </>
            )}
          </Button>

          {searchError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length} found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTransaction?.id === transaction.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleRefundSelect(transaction)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={transaction.source === 'local' ? 'default' : 'secondary'}>
                          {transaction.source === 'local' ? 'Recent' : 'Historical'}
                        </Badge>
                        {transaction.invoiceNumber && (
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            {transaction.invoiceNumber}
                          </Badge>
                        )}
                        {transaction.source === 'local' && (
                          <Badge variant="outline">
                            <Receipt className="h-3 w-3 mr-1" />
                            {transaction.id}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{transaction.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{transaction.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span>{transaction.paymentMethod}</span>
                        </div>
                        {transaction.customerName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{transaction.customerName}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Items:</strong> {transaction.items.map(item => 
                          `${item.name} (×${item.quantity})`
                        ).join(', ')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${transaction.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cashier: {transaction.cashier}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund Processing */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" />
              Process Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Transaction Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{selectedTransaction.id}</span>
                  </div>
                  {selectedTransaction.invoiceNumber && (
                    <div className="flex justify-between">
                      <span>Invoice Number:</span>
                      <span className="font-mono">{selectedTransaction.invoiceNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Original Amount:</span>
                    <span className="font-bold">${selectedTransaction.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{selectedTransaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="capitalize">{selectedTransaction.source} Transaction</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Refund Amount</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="refund-amount">Refund Amount ($)</Label>
                    <Input
                      id="refund-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedTransaction.total}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRefundAmount((selectedTransaction.total / 2).toFixed(2))}
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRefundAmount(selectedTransaction.total.toFixed(2))}
                    >
                      Full Refund
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleProcessRefund}
                disabled={isProcessingRefund || !refundAmount || parseFloat(refundAmount) <= 0}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessingRefund ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Process Refund
                  </>
                )}
              </Button>
            </div>

            {refundResult && (
              <Alert className={refundResult.success ? '' : 'border-red-200 bg-red-50'}>
                {refundResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={refundResult.success ? 'text-green-800' : 'text-red-800'}>
                  {refundResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}