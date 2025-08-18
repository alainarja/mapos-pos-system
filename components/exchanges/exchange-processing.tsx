'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowRightLeft, 
  Search, 
  Plus, 
  Minus,
  DollarSign,
  ShoppingCart,
  Package,
  Receipt,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { exchangeIntegration, type ExchangeResult } from '@/lib/services/exchange-integration'
import { refundIntegration, type RefundableTransaction } from '@/lib/services/refund-integration'
import { useInventoryStore } from '@/stores/inventory'

interface ExchangeItemPair {
  id: string
  originalItem: {
    id: string
    name: string
    price: number
    quantity: number
  }
  replacementItem: {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  } | null
  priceDifference: number
}

export default function ExchangeProcessing() {
  // Search state
  const [searchParams, setSearchParams] = useState({ customerName: '', invoiceNumber: '' })
  const [searchResults, setSearchResults] = useState<RefundableTransaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<RefundableTransaction | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Exchange state
  const [exchangeItems, setExchangeItems] = useState<ExchangeItemPair[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [replacementSearch, setReplacementSearch] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Results state
  const [exchangeResult, setExchangeResult] = useState<ExchangeResult | null>(null)

  // Get inventory products for replacements
  const { products } = useInventoryStore()

  useEffect(() => {
    setAvailableProducts(products)
  }, [products])

  const handleSearch = async () => {
    if (!searchParams.customerName && !searchParams.invoiceNumber) {
      return
    }

    setIsSearching(true)
    try {
      const results = await exchangeIntegration.searchExchangeableTransactions({
        customerName: searchParams.customerName || undefined,
        invoiceNumber: searchParams.invoiceNumber || undefined
      })
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTransactionSelect = (transaction: RefundableTransaction) => {
    setSelectedTransaction(transaction)
    // Initialize exchange items from original transaction
    const initialExchangeItems: ExchangeItemPair[] = transaction.items.map((item, index) => ({
      id: `exchange-${index}`,
      originalItem: {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      },
      replacementItem: null,
      priceDifference: 0
    }))
    setExchangeItems(initialExchangeItems)
    setExchangeResult(null)
  }

  const handleReplacementSelect = (exchangeId: string, product: any, quantity: number) => {
    setExchangeItems(prev => prev.map(item => {
      if (item.id === exchangeId) {
        const replacementItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image
        }
        const originalValue = item.originalItem.price * item.originalItem.quantity
        const replacementValue = product.price * quantity
        const priceDifference = replacementValue - originalValue

        return {
          ...item,
          replacementItem,
          priceDifference
        }
      }
      return item
    }))
  }

  const removeExchangeItem = (exchangeId: string) => {
    setExchangeItems(prev => prev.filter(item => item.id !== exchangeId))
  }

  const calculateTotals = () => {
    const validExchanges = exchangeItems.filter(item => item.replacementItem)
    const totalDifference = validExchanges.reduce((sum, item) => sum + item.priceDifference, 0)
    const totalOriginalValue = validExchanges.reduce((sum, item) => 
      sum + (item.originalItem.price * item.originalItem.quantity), 0)
    const totalReplacementValue = validExchanges.reduce((sum, item) => 
      sum + (item.replacementItem!.price * item.replacementItem!.quantity), 0)

    return {
      totalOriginalValue,
      totalReplacementValue,
      totalDifference,
      requiresPayment: totalDifference > 0,
      refundAmount: totalDifference < 0 ? Math.abs(totalDifference) : 0
    }
  }

  const handleProcessExchange = async () => {
    if (!selectedTransaction) return

    const validExchanges = exchangeItems.filter(item => item.replacementItem)
    if (validExchanges.length === 0) {
      setExchangeResult({
        success: false,
        totalDifference: 0,
        error: 'Please select replacement items for exchange'
      })
      return
    }

    setIsProcessing(true)
    setExchangeResult(null)

    try {
      const exchanges = validExchanges.map(item => ({
        originalItemId: item.originalItem.id,
        originalQuantity: item.originalItem.quantity,
        replacementItemId: item.replacementItem!.id,
        replacementItemName: item.replacementItem!.name,
        replacementItemPrice: item.replacementItem!.price,
        replacementQuantity: item.replacementItem!.quantity,
        replacementItemImage: item.replacementItem!.image
      }))

      const result = await exchangeIntegration.createExchange(
        selectedTransaction,
        exchanges,
        'Current User',
        notes
      )

      setExchangeResult(result)

      if (result.success) {
        // Reset form on success
        setSelectedTransaction(null)
        setExchangeItems([])
        setNotes('')
        // Remove from search results
        setSearchResults(prev => prev.filter(t => t.id !== selectedTransaction.id))
      }

    } catch (error) {
      setExchangeResult({
        success: false,
        totalDifference: 0,
        error: error instanceof Error ? error.message : 'Exchange processing failed'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(replacementSearch.toLowerCase()) ||
    product.id.toLowerCase().includes(replacementSearch.toLowerCase())
  )

  const totals = calculateTotals()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ArrowRightLeft className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Product Exchange</h1>
          <p className="text-gray-600">Exchange items from previous purchases for different products</p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Original Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name..."
                value={searchParams.customerName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="invoice-number">Invoice/Receipt Number</Label>
              <Input
                id="invoice-number"
                placeholder="Enter invoice number..."
                value={searchParams.invoiceNumber}
                onChange={(e) => setSearchParams(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search Transactions'}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available for Exchange ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((transaction) => (
                <div 
                  key={transaction.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTransaction?.id === transaction.id ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleTransactionSelect(transaction)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={transaction.source === 'local' ? 'default' : 'secondary'}>
                          {transaction.source === 'local' ? 'Recent' : 'Historical'}
                        </Badge>
                        {transaction.invoiceNumber && (
                          <Badge variant="outline">{transaction.invoiceNumber}</Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Date:</strong> {transaction.date} {transaction.time}</div>
                        <div><strong>Customer:</strong> {transaction.customerName || 'Walk-in'}</div>
                        <div><strong>Items:</strong> {transaction.items.map(item => 
                          `${item.name} (×${item.quantity})`).join(', ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${transaction.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exchange Processing */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Process Exchange
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Original Items */}
            <div>
              <h4 className="font-medium mb-3">Original Items to Exchange</h4>
              <div className="space-y-3">
                {exchangeItems.map((exchangeItem) => (
                  <div key={exchangeItem.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Original Item */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Returning:</h5>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeExchangeItem(exchangeItem.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <div className="font-medium">{exchangeItem.originalItem.name}</div>
                          <div className="text-sm text-gray-600">
                            Quantity: {exchangeItem.originalItem.quantity} × ${exchangeItem.originalItem.price.toFixed(2)}
                          </div>
                          <div className="font-bold text-red-600">
                            Value: ${(exchangeItem.originalItem.price * exchangeItem.originalItem.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Replacement Item */}
                      <div>
                        <h5 className="font-medium mb-2">Exchange for:</h5>
                        {exchangeItem.replacementItem ? (
                          <div className="bg-green-50 border border-green-200 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{exchangeItem.replacementItem.name}</div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setExchangeItems(prev => 
                                  prev.map(item => item.id === exchangeItem.id 
                                    ? { ...item, replacementItem: null, priceDifference: 0 }
                                    : item
                                  )
                                )}
                              >
                                Change
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReplacementSelect(
                                  exchangeItem.id, 
                                  { ...exchangeItem.replacementItem, price: exchangeItem.replacementItem!.price },
                                  Math.max(1, exchangeItem.replacementItem.quantity - 1)
                                )}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{exchangeItem.replacementItem.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReplacementSelect(
                                  exchangeItem.id, 
                                  { ...exchangeItem.replacementItem, price: exchangeItem.replacementItem!.price },
                                  exchangeItem.replacementItem.quantity + 1
                                )}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm">× ${exchangeItem.replacementItem.price.toFixed(2)}</span>
                            </div>
                            <div className="font-bold text-green-600">
                              Value: ${(exchangeItem.replacementItem.price * exchangeItem.replacementItem.quantity).toFixed(2)}
                            </div>
                            <div className={`text-sm font-medium ${
                              exchangeItem.priceDifference >= 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {exchangeItem.priceDifference >= 0 ? 'Additional payment: ' : 'Refund: '}
                              ${Math.abs(exchangeItem.priceDifference).toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <div className="mb-3">
                              <Input
                                placeholder="Search replacement products..."
                                value={replacementSearch}
                                onChange={(e) => setReplacementSearch(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                              {filteredProducts.slice(0, 10).map((product) => (
                                <Button
                                  key={product.id}
                                  variant="outline"
                                  size="sm"
                                  className="justify-start h-auto p-2"
                                  onClick={() => handleReplacementSelect(exchangeItem.id, product, 1)}
                                >
                                  <div className="text-left">
                                    <div className="font-medium text-xs">{product.name}</div>
                                    <div className="text-xs text-gray-500">${product.price.toFixed(2)}</div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Summary */}
            {totals.totalDifference !== 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Exchange Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Original Items Value:</span>
                    <span>${totals.totalOriginalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Replacement Items Value:</span>
                    <span>${totals.totalReplacementValue.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className={`flex justify-between font-bold text-lg ${
                    totals.requiresPayment ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    <span>{totals.requiresPayment ? 'Additional Payment Required:' : 'Refund Amount:'}</span>
                    <span>${Math.abs(totals.totalDifference).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="exchange-notes">Exchange Notes (Optional)</Label>
              <Textarea
                id="exchange-notes"
                placeholder="Add any notes about this exchange..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Process Button */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleProcessExchange}
                disabled={isProcessing || exchangeItems.filter(item => item.replacementItem).length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Process Exchange
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {exchangeResult && (
              <Alert className={exchangeResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {exchangeResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={exchangeResult.success ? 'text-green-800' : 'text-red-800'}>
                  {exchangeResult.success ? (
                    <div>
                      <div className="font-medium">Exchange processed successfully!</div>
                      {exchangeResult.invoiceNumber && (
                        <div>Invoice: {exchangeResult.invoiceNumber}</div>
                      )}
                      {exchangeResult.paymentRequired && (
                        <div>Additional payment required: ${Math.abs(exchangeResult.totalDifference).toFixed(2)}</div>
                      )}
                      {exchangeResult.refundAmount && (
                        <div>Refund issued: ${exchangeResult.refundAmount.toFixed(2)}</div>
                      )}
                    </div>
                  ) : (
                    exchangeResult.error
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}