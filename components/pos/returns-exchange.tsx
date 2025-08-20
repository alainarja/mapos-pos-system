"use client"

import { useState, useEffect } from "react"
import { useReturnsIntegration } from "./returns-integration"
import { BarcodeScannerReturns } from "./barcode-scanner-returns"
import { ReturnsReceipt } from "./returns-receipt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RotateCcw,
  Search,
  Scan,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Receipt,
  User,
  DollarSign,
  Package,
  Eye,
  Trash2,
  Banknote,
  Wallet
} from "lucide-react"

interface ReturnsExchangeProps {
  onComplete?: (transaction: any) => void
  onCancel?: () => void
  mode?: 'standalone' | 'embedded'
  currentUser?: string
  requireManagerApproval?: boolean
}

export function ReturnsExchange({ 
  onComplete, 
  onCancel, 
  mode = 'embedded',
  currentUser = 'Current User',
  requireManagerApproval = true
}: ReturnsExchangeProps) {
  const [currentStep, setCurrentStep] = useState<'search' | 'items' | 'processing' | 'complete'>('search')
  const [searchTerm, setSearchTerm] = useState("")
  const [searchMethod, setSearchMethod] = useState<'receipt' | 'customer' | 'manual'>('receipt')
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return')
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [completedReturn, setCompletedReturn] = useState<any>(null)
  const [refundMethod, setRefundMethod] = useState<'original' | 'cash' | 'store_credit'>('original')
  const [managerApproval, setManagerApproval] = useState<{ approved: boolean; managerId?: string; pin?: string } | null>(null)
  const [showManagerApprovalDialog, setShowManagerApprovalDialog] = useState(false)
  const [managerPin, setManagerPin] = useState('')
  
  // Integration with real data stores
  const {
    searchTransactionByReceipt,
    searchTransactionsByCustomer,
    searchTransactionsByDateRange,
    transactionStore,
    processReturnWithInventory,
    returnsStore
  } = useReturnsIntegration()

  // Get real transaction data
  const recentTransactions = transactionStore.transactions
    .filter(t => t.status === 'completed')
    .slice(0, 10) // Show last 10 completed transactions

  const handleSearch = () => {
    if (searchTerm.trim()) {
      let found = null
      
      if (searchMethod === 'receipt') {
        // Search by receipt number or transaction ID
        found = searchTransactionByReceipt(searchTerm)
      } else if (searchMethod === 'customer') {
        // Search by customer ID (in real scenario, we'd have customer name mapping)
        const customerTransactions = searchTransactionsByCustomer(searchTerm)
        found = customerTransactions[0] // Get most recent
      }
      
      if (found) {
        setSelectedTransaction(found)
        setCurrentStep('items')
      } else {
        alert(`Transaction not found. Please check the ${searchMethod} information and try again.`)
      }
    }
  }

  const handleSelectTransaction = (transaction: any) => {
    setSelectedTransaction(transaction)
    setCurrentStep('items')
  }

  const handleBarcodeScanned = (scannedCode: string) => {
    setShowBarcodeScanner(false)
    setSearchTerm(scannedCode)
    
    // Automatically search for the scanned code
    const found = searchTransactionByReceipt(scannedCode)
    if (found) {
      setSelectedTransaction(found)
      setCurrentStep('items')
    } else {
      alert(`No transaction found for barcode: ${scannedCode}`)
    }
  }

  const handleBarcodeScanCancel = () => {
    setShowBarcodeScanner(false)
  }

  const handleAddItemForReturn = (item: any) => {
    const returnItem = {
      ...item,
      returnQuantity: 1,
      reason: '',
      condition: 'new'
    }
    setReturnItems([...returnItems, returnItem])
  }

  const handleRemoveReturnItem = (itemId: string) => {
    setReturnItems(returnItems.filter(item => item.id !== itemId))
  }

  const handleUpdateReturnItem = (itemId: string, field: string, value: any) => {
    setReturnItems(returnItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ))
  }

  const calculateRefundAmount = () => {
    return returnItems.reduce((total, item) => total + (item.price * item.returnQuantity), 0)
  }

  const handleProcessReturn = async () => {
    setCurrentStep('processing')
    
    try {
      // Create return transaction data
      const returnTransaction = {
        type: returnType,
        originalTransaction: selectedTransaction,
        returnItems: returnItems.map(item => ({
          id: item.id,
          originalTransactionId: selectedTransaction?.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          originalQuantity: item.quantity,
          returnQuantity: item.returnQuantity,
          reason: item.reason,
          condition: item.condition,
          notes: item.notes,
          sku: item.sku
        })),
        refundAmount: refundAmount,
        refundMethod: refundMethod,
        processedBy: currentUser,
        managerApproval: managerApproval,
        timestamp: new Date().toISOString()
      }
      
      // Process through integrated system
      const result = await processReturnWithInventory(returnTransaction)
      
      if (result.success) {
        setCompletedReturn({
          id: result.transaction.id || returnTransaction.id || `RTN-${Date.now()}`,
          type: returnType,
          receiptNumber: `RTN-${Date.now().toString().slice(-8)}`,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          originalTransaction: selectedTransaction,
          returnItems: returnItems,
          refundAmount: calculateRefundAmount(),
          refundMethod: refundMethod,
          processedBy: currentUser,
          managerApproval: managerApproval
        })
        setCurrentStep('complete')
        if (onComplete) {
          onComplete(result.transaction)
        }
      } else {
        alert(`Return processing failed: ${result.error}`)
        setCurrentStep('items')
      }
    } catch (error) {
      console.error('Return processing error:', error)
      alert('Return processing failed. Please try again.')
      setCurrentStep('items')
    }
  }

  const renderSearchStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Returns & Exchanges</h2>
        <p className="text-gray-600">Find the original transaction to process returns or exchanges</p>
      </div>

      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Search className="w-5 h-5 mr-2" />
            Find Original Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={searchMethod} onValueChange={(value) => setSearchMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="receipt">Receipt Number</TabsTrigger>
              <TabsTrigger value="customer">Customer Info</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="receipt" className="space-y-4">
              <div className="flex space-x-3">
                <Input
                  placeholder="Try: RCP-001234, RCP-001235, or RCP-001236"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-gray-300"
                />
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-300 px-6"
                  onClick={() => setShowBarcodeScanner(true)}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Scan
                </Button>
              </div>
              
              {/* Recent Transactions */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Transactions (Click to select):</h3>
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <Card 
                      key={transaction.id} 
                      className="cursor-pointer hover:bg-blue-50 border-gray-200 transition-colors"
                      onClick={() => handleSelectTransaction(transaction)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.receiptNumber}</p>
                            <p className="text-sm text-gray-600">{transaction.cashier} • {transaction.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${transaction.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{transaction.paymentMethod}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customer" className="space-y-4">
              <div className="flex space-x-3">
                <Input
                  placeholder="Try: John Doe, Jane Smith, or Mike Johnson"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-gray-300"
                />
                <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <User className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {/* Recent Customers */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Customers (Click to select their transaction):</h3>
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <Card 
                      key={transaction.id} 
                      className="cursor-pointer hover:bg-green-50 border-gray-200 transition-colors"
                      onClick={() => handleSelectTransaction(transaction)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.cashier}</p>
                              <p className="text-sm text-gray-600">Last purchase: {transaction.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{transaction.receiptNumber}</p>
                            <p className="text-sm text-gray-500">${transaction.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Recent Transactions</h3>
                  <p className="text-gray-600 mb-4">Select from recent transactions or process without receipt</p>
                </div>
                
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                         onClick={() => handleSelectTransaction(transaction)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{transaction.cashier}</h4>
                            <Badge variant="outline" className="text-xs">
                              {transaction.items.length} items
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Receipt: {transaction.receiptNumber}</p>
                            <p>Date: {transaction.date} • Total: ${transaction.total.toFixed(2)}</p>
                            <p>Payment: {transaction.paymentMethod}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <h4 className="text-md font-semibold text-gray-900 mb-2">No Receipt Return</h4>
                    <p className="text-gray-600 text-sm mb-3">Process return without original receipt (requires manager approval)</p>
                    <Button 
                      variant="outline" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => {
                        if (requireManagerApproval) {
                          setShowManagerApprovalDialog(true)
                        } else {
                          setCurrentStep('items')
                        }
                      }}
                    >
                      Continue Without Receipt
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )

  const renderItemsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Items</h2>
        <p className="text-gray-600">Choose items to {returnType} and specify details</p>
      </div>

      {/* Transaction Found */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            Transaction Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Receipt #:</span>
              <p className="font-mono text-gray-900">{selectedTransaction?.receiptNumber}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <p className="text-gray-900">{selectedTransaction?.date}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total:</span>
              <p className="text-gray-900">${selectedTransaction?.total?.toFixed(2)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cashier:</span>
              <p className="text-gray-900">{selectedTransaction?.cashier}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Type Selection */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Select Return Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={returnType === 'return' ? 'default' : 'outline'}
              onClick={() => setReturnType('return')}
              className={returnType === 'return' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-300 text-red-600 hover:bg-red-50'}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Return for Refund
            </Button>
            <Button
              variant={returnType === 'exchange' ? 'default' : 'outline'}
              onClick={() => setReturnType('exchange')}
              className={returnType === 'exchange' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Exchange for Different Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Selection */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Original Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTransaction?.items.map((item: any) => {
            const isAdded = returnItems.find(ri => ri.id === item.id)
            
            return (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each • Purchased: {item.quantity}</p>
                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                  </div>
                  <Badge variant="outline" className="bg-gray-50">
                    Available: {item.quantity}
                  </Badge>
                </div>
                
                {!isAdded ? (
                  <Button
                    onClick={() => handleAddItemForReturn(item)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add for {returnType}
                  </Button>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <Label className="text-sm font-medium">Quantity</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const current = isAdded.returnQuantity
                            if (current > 1) {
                              handleUpdateReturnItem(item.id, 'returnQuantity', current - 1)
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{isAdded.returnQuantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const current = isAdded.returnQuantity
                            if (current < item.quantity) {
                              handleUpdateReturnItem(item.id, 'returnQuantity', current + 1)
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Condition</Label>
                      <Select
                        value={isAdded.condition}
                        onValueChange={(value) => handleUpdateReturnItem(item.id, 'condition', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New/Unopened</SelectItem>
                          <SelectItem value="opened">Opened</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="defective">Defective</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <Select
                        value={isAdded.reason}
                        onValueChange={(value) => handleUpdateReturnItem(item.id, 'reason', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defective">Defective</SelectItem>
                          <SelectItem value="wrong_item">Wrong Item</SelectItem>
                          <SelectItem value="not_as_described">Not As Described</SelectItem>
                          <SelectItem value="changed_mind">Changed Mind</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="md:col-span-3 flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-green-600 font-semibold">
                        {returnType} Value: ${(item.price * isAdded.returnQuantity).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveReturnItem(item.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Summary & Actions */}
      {returnItems.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">{returnType} Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-900">Total {returnType} Value:</span>
              <span className="font-bold text-green-600">${calculateRefundAmount().toFixed(2)}</span>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  setCurrentStep('search')
                  setSelectedTransaction(null)
                  setReturnItems([])
                }}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleProcessReturn}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={returnItems.some(item => !item.reason)}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Process {returnType}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderProcessingStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
        <RefreshCw className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Processing {returnType}</h2>
      <p className="text-gray-600">Please wait while we process your transaction...</p>
      
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-gray-700">Validating items...</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-gray-700">Processing refund...</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-gray-600">Updating inventory...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const generateReceipt = () => {
    const receiptData = {
      type: returnType.toUpperCase(),
      referenceNumber: `RTN-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      originalTransaction: selectedTransaction,
      returnItems: returnItems,
      refundAmount: calculateRefundAmount(),
      store: "Your Store Name",
      address: "123 Main St, City, State 12345",
      phone: "(555) 123-4567"
    }

    // Create receipt content
    const receiptContent = `
=================================
         ${receiptData.store}
=================================
${receiptData.address}
Phone: ${receiptData.phone}

${receiptData.type} RECEIPT
=================================
Date: ${receiptData.date}
Time: ${receiptData.time}
Reference #: ${receiptData.referenceNumber}

Original Transaction:
Receipt: ${receiptData.originalTransaction.receiptNumber}
Date: ${receiptData.originalTransaction.date}
Customer: ${receiptData.originalTransaction.customer}

${receiptData.type} ITEMS:
---------------------------------
${receiptData.returnItems.map(item => 
  `${item.name}
   Qty: ${item.returnQuantity} x $${item.price.toFixed(2)} = $${(item.price * item.returnQuantity).toFixed(2)}
   Condition: ${item.condition}
   Reason: ${item.reason}`
).join('\n\n')}

=================================
TOTAL ${receiptData.type} AMOUNT: $${receiptData.refundAmount.toFixed(2)}
=================================

Refund Method: ${receiptData.originalTransaction.paymentMethod}
${receiptData.type === 'RETURN' ? 'Refund will be processed to original payment method' : 'Exchange items will be provided'}

Thank you for your business!

Customer Copy - Keep for your records
=================================
    `

    // Print or download receipt
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${receiptData.type} Receipt - ${receiptData.referenceNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                line-height: 1.3;
                margin: 20px;
                max-width: 400px;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0;
              }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{returnType} Completed</h2>
        <p className="text-gray-600">Your {returnType} has been processed successfully</p>
      </div>

      {completedReturn && (
        <ReturnsReceipt
          returnTransaction={completedReturn}
          onPrint={() => console.log('Receipt printed')}
          onDownload={() => console.log('Receipt downloaded')}
          onEmail={() => console.log('Receipt emailed')}
        />
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => {
            // Reset for new transaction
            setCurrentStep('search')
            setSelectedTransaction(null)
            setReturnItems([])
            setCompletedReturn(null)
            setSearchTerm('')
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Process New {returnType}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {currentStep === 'search' && renderSearchStep()}
      {currentStep === 'items' && renderItemsStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'complete' && renderCompleteStep()}
      
      {/* Barcode Scanner Modal */}
      <BarcodeScannerReturns
        isOpen={showBarcodeScanner}
        onScanComplete={handleBarcodeScanned}
        onCancel={handleBarcodeScanCancel}
      />

      {/* Manager Approval Dialog */}
      {showManagerApprovalDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white">
            <CardHeader className="bg-orange-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Manager Approval Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700">
                This {returnType} requires manager approval.
                {calculateRefundAmount() > 100 && (
                  <span className="block mt-2 text-sm text-orange-600">
                    Refund amount exceeds $100 threshold
                  </span>
                )}
              </p>
              
              <div className="space-y-2">
                <Label>Manager PIN</Label>
                <Input
                  type="password"
                  placeholder="Enter manager PIN"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && managerPin) {
                      // Validate manager PIN (in production, verify against real system)
                      if (managerPin === '1234' || managerPin === '9999') {
                        setManagerApproval({
                          approved: true,
                          managerId: 'MGR-' + managerPin,
                          pin: managerPin
                        })
                        setShowManagerApprovalDialog(false)
                        setManagerPin('')
                        // Auto-proceed if we were trying to process
                        if (returnItems.length > 0) {
                          handleProcessReturn()
                        }
                      } else {
                        alert('Invalid manager PIN')
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Test PINs: 1234 or 9999</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowManagerApprovalDialog(false)
                    setManagerPin('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (managerPin === '1234' || managerPin === '9999') {
                      setManagerApproval({
                        approved: true,
                        managerId: 'MGR-' + managerPin,
                        pin: managerPin
                      })
                      setShowManagerApprovalDialog(false)
                      setManagerPin('')
                      // Auto-proceed if we were trying to process
                      if (returnItems.length > 0) {
                        handleProcessReturn()
                      }
                    } else {
                      alert('Invalid manager PIN')
                    }
                  }}
                  disabled={!managerPin}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}