"use client"

/**
 * Returns Integration Component
 * This component handles the integration between returns, transactions, and inventory stores
 * It provides enhanced search functionality and data synchronization
 */

import { useReturnsStore } from "@/stores/returns"
import { useTransactionStore } from "@/stores/transactions"
import { useInventoryStore } from "@/stores/inventory"
import { useEffect } from "react"

export function useReturnsIntegration() {
  const returnsStore = useReturnsStore()
  const transactionStore = useTransactionStore()
  const inventoryStore = useInventoryStore()

  // Enhanced transaction search functions
  const searchTransactionByReceipt = (receiptNumber: string) => {
    const searchTerm = receiptNumber.toLowerCase().trim()
    return transactionStore.transactions.find(t => 
      t.receiptNumber.toLowerCase().includes(searchTerm) ||
      t.id.toLowerCase().includes(searchTerm) ||
      t.receiptNumber.replace(/-/g, '').toLowerCase().includes(searchTerm.replace(/-/g, ''))
    )
  }

  const searchTransactionsByCustomer = (customerId: string) => {
    const searchTerm = customerId.toLowerCase().trim()
    return transactionStore.transactions.filter(t => 
      t.customerId?.toLowerCase().includes(searchTerm) ||
      t.cashier.toLowerCase().includes(searchTerm)
    ).sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
  }

  const searchTransactionsByDateRange = (start: string, end: string) => {
    return transactionStore.transactions.filter(t => 
      t.date >= start && t.date <= end && t.status === 'completed'
    )
  }

  // Inventory update functions
  const updateInventoryForReturn = (returnItems: any[]) => {
    returnItems.forEach(item => {
      // Find the corresponding product by matching item name or id
      const product = inventoryStore.products.find(p => 
        p.id === item.productId || p.name === item.name
      )
      
      if (product && (item.condition === 'new' || item.condition === 'opened')) {
        // Only restock items in good condition
        console.log(`Restocking ${item.returnQuantity} units of ${item.name} (Product ID: ${product.id})`)
        inventoryStore.updateStock(product.id, item.returnQuantity, 'add')
      } else if (product) {
        console.log(`Not restocking ${item.name} due to condition: ${item.condition}`)
      } else {
        console.log(`Product not found for return item: ${item.name}`)
      }
    })
  }

  const revertInventoryUpdate = (returnItems: any[]) => {
    returnItems.forEach(item => {
      const product = inventoryStore.products.find(p => 
        p.id === item.productId || p.name === item.name
      )
      
      if (product && (item.condition === 'new' || item.condition === 'opened')) {
        console.log(`Reverting stock for ${item.name}: removing ${item.returnQuantity} units`)
        inventoryStore.updateStock(product.id, item.returnQuantity, 'subtract')
      }
    })
  }

  // Enhanced return processing with inventory integration
  const processReturnWithInventory = async (returnTransaction: any) => {
    try {
      // Update inventory
      if (returnTransaction.returnItems) {
        updateInventoryForReturn(returnTransaction.returnItems)
      }

      // Create return transaction record
      const returnRecord = {
        ...returnTransaction,
        inventoryUpdated: true,
        processedAt: new Date().toISOString()
      }

      // Add to returns store
      returnsStore.setCurrentReturn(returnRecord)
      returnsStore.completeReturn()

      return { success: true, transaction: returnRecord }
    } catch (error) {
      console.error('Return processing failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Calculate return rate against sales
  const calculateReturnRate = (period: 'day' | 'week' | 'month' = 'month') => {
    const now = new Date()
    let startDate: string
    
    switch (period) {
      case 'day':
        startDate = now.toISOString().split('T')[0]
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        startDate = weekAgo.toISOString().split('T')[0]
        break
      case 'month':
      default:
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        startDate = monthAgo.toISOString().split('T')[0]
        break
    }

    const sales = transactionStore.transactions.filter(t => 
      t.date >= startDate && t.status === 'completed'
    )
    
    const returns = returnsStore.returnTransactions.filter(t => 
      t.date >= startDate && t.status === 'completed'
    )

    const returnRate = sales.length > 0 ? (returns.length / sales.length) * 100 : 0
    const returnValue = returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0)
    const salesValue = sales.reduce((sum, s) => sum + s.total, 0)
    const valueReturnRate = salesValue > 0 ? (returnValue / salesValue) * 100 : 0

    return {
      totalSales: sales.length,
      totalReturns: returns.length,
      returnRate: Math.round(returnRate * 100) / 100,
      salesValue: Math.round(salesValue * 100) / 100,
      returnValue: Math.round(returnValue * 100) / 100,
      valueReturnRate: Math.round(valueReturnRate * 100) / 100
    }
  }

  // Get low stock alerts that might be affected by returns
  const getReturnImpactedStock = () => {
    const lowStockProducts = inventoryStore.getLowStockProducts()
    const recentReturns = returnsStore.returnTransactions
      .filter(t => t.status === 'completed' && t.inventoryUpdated)
      .slice(0, 10) // Last 10 returns

    const impactedProducts = lowStockProducts.filter(product => {
      return recentReturns.some(returnTxn => 
        returnTxn.returnItems?.some(item => item.productId === product.id)
      )
    })

    return {
      lowStockProducts,
      recentReturns,
      impactedProducts
    }
  }

  return {
    // Search functions
    searchTransactionByReceipt,
    searchTransactionsByCustomer, 
    searchTransactionsByDateRange,
    
    // Inventory integration
    updateInventoryForReturn,
    revertInventoryUpdate,
    processReturnWithInventory,
    
    // Analytics
    calculateReturnRate,
    getReturnImpactedStock,
    
    // Store references for direct access
    returnsStore,
    transactionStore,
    inventoryStore
  }
}

// Hook for enhanced returns functionality
export function useEnhancedReturns() {
  const integration = useReturnsIntegration()
  const { returnsStore } = integration

  // Override the store's search functions with our enhanced versions
  useEffect(() => {
    // Monkey patch the returns store with integrated search functions
    returnsStore.searchTransactions = integration.searchTransactionByReceipt as any
    returnsStore.findTransactionByReceipt = integration.searchTransactionByReceipt
    returnsStore.findTransactionsByCustomer = integration.searchTransactionsByCustomer
    returnsStore.findTransactionsByDateRange = integration.searchTransactionsByDateRange
    returnsStore.updateInventoryForReturn = integration.updateInventoryForReturn
  }, [integration, returnsStore])

  return integration
}

// Component that ensures returns integration is active
export function ReturnsIntegrationProvider({ children }: { children: React.ReactNode }) {
  useEnhancedReturns()
  return <>{children}</>
}