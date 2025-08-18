/**
 * Exchange Integration Service
 * 
 * Handles product exchanges for both:
 * 1. Recent transactions (localStorage)
 * 2. Historical transactions (CRM invoices)
 * 
 * Exchange workflow:
 * 1. Find original transaction
 * 2. Select items to exchange
 * 3. Choose replacement items
 * 4. Process difference (refund or additional payment)
 */

import { crmIntegration } from './crm-integration'
import { refundIntegration, type RefundableTransaction } from './refund-integration'

export interface ExchangeItem {
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
    stock?: number
  }
  priceDifference: number // positive = customer owes, negative = customer gets refund
}

export interface ExchangeTransaction {
  id: string
  originalTransaction: RefundableTransaction
  exchangeItems: ExchangeItem[]
  totalDifference: number // Total amount customer owes or gets back
  exchangeDate: string
  exchangeTime: string
  cashier: string
  notes?: string
  status: 'pending' | 'completed' | 'cancelled'
}

export interface ExchangeResult {
  success: boolean
  exchangeId?: string
  invoiceNumber?: string
  totalDifference: number
  paymentRequired?: boolean
  refundAmount?: number
  error?: string
}

class ExchangeIntegrationService {
  /**
   * Create an exchange transaction
   */
  async createExchange(
    originalTransaction: RefundableTransaction,
    exchanges: Array<{
      originalItemId: string
      originalQuantity: number
      replacementItemId: string
      replacementItemName: string
      replacementItemPrice: number
      replacementQuantity: number
      replacementItemImage?: string
    }>,
    cashier: string,
    notes?: string
  ): Promise<ExchangeResult> {
    try {
      // Calculate exchange items and differences
      const exchangeItems: ExchangeItem[] = exchanges.map(exchange => {
        const originalItem = originalTransaction.items.find(item => item.id === exchange.originalItemId)
        if (!originalItem) {
          throw new Error(`Original item ${exchange.originalItemId} not found in transaction`)
        }

        const originalValue = originalItem.price * exchange.originalQuantity
        const replacementValue = exchange.replacementItemPrice * exchange.replacementQuantity
        const priceDifference = replacementValue - originalValue

        return {
          originalItem: {
            id: originalItem.id,
            name: originalItem.name,
            price: originalItem.price,
            quantity: exchange.originalQuantity
          },
          replacementItem: {
            id: exchange.replacementItemId,
            name: exchange.replacementItemName,
            price: exchange.replacementItemPrice,
            quantity: exchange.replacementQuantity,
            image: exchange.replacementItemImage
          },
          priceDifference
        }
      })

      const totalDifference = exchangeItems.reduce((sum, item) => sum + item.priceDifference, 0)

      // Create exchange transaction record
      const exchangeTransaction: ExchangeTransaction = {
        id: `EXG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        originalTransaction,
        exchangeItems,
        totalDifference,
        exchangeDate: new Date().toISOString().split('T')[0],
        exchangeTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        cashier,
        notes,
        status: 'pending'
      }

      // Process the exchange in the appropriate system
      let result: ExchangeResult

      if (originalTransaction.source === 'local') {
        result = await this.processLocalExchange(exchangeTransaction)
      } else {
        result = await this.processCRMExchange(exchangeTransaction)
      }

      // Store exchange record locally for tracking
      if (result.success) {
        await this.storeExchangeRecord(exchangeTransaction)
      }

      return result

    } catch (error) {
      console.error('Exchange processing failed:', error)
      return {
        success: false,
        totalDifference: 0,
        error: error instanceof Error ? error.message : 'Exchange processing failed'
      }
    }
  }

  /**
   * Process exchange for local transaction
   */
  private async processLocalExchange(exchange: ExchangeTransaction): Promise<ExchangeResult> {
    try {
      const { useTransactionStore } = await import('../../stores/transactions')
      const store = useTransactionStore.getState()

      // Create exchange transaction record
      const exchangeTransactionData = {
        date: exchange.exchangeDate,
        time: exchange.exchangeTime,
        total: exchange.totalDifference,
        subtotal: exchange.totalDifference / 1.08, // Assuming 8% tax
        tax: exchange.totalDifference * 0.08 / 1.08,
        discount: 0,
        items: [
          // Negative entries for returned items
          ...exchange.exchangeItems.map(item => ({
            id: item.originalItem.id,
            name: `[RETURN] ${item.originalItem.name}`,
            price: item.originalItem.price,
            quantity: -item.originalItem.quantity,
            image: undefined
          })),
          // Positive entries for new items
          ...exchange.exchangeItems.map(item => ({
            id: item.replacementItem.id,
            name: item.replacementItem.name,
            price: item.replacementItem.price,
            quantity: item.replacementItem.quantity,
            image: item.replacementItem.image
          }))
        ],
        paymentMethod: exchange.totalDifference >= 0 ? 'Card' : 'Refund',
        cashier: exchange.cashier,
        customerId: exchange.originalTransaction.customerId,
        customerName: exchange.originalTransaction.customerName,
        status: 'completed' as const,
      }

      store.addTransaction(exchangeTransactionData)

      return {
        success: true,
        exchangeId: exchange.id,
        totalDifference: exchange.totalDifference,
        paymentRequired: exchange.totalDifference > 0,
        refundAmount: exchange.totalDifference < 0 ? Math.abs(exchange.totalDifference) : undefined
      }

    } catch (error) {
      console.error('Local exchange processing failed:', error)
      return {
        success: false,
        totalDifference: exchange.totalDifference,
        error: 'Local exchange processing failed'
      }
    }
  }

  /**
   * Process exchange for CRM transaction
   */
  private async processCRMExchange(exchange: ExchangeTransaction): Promise<ExchangeResult> {
    try {
      // Create exchange invoice in CRM
      const exchangeInvoice = {
        customer_id: exchange.originalTransaction.customerId || '',
        customer: exchange.originalTransaction.customerName || 'Unknown Customer',
        amount: exchange.totalDifference,
        currency: 'USD',
        status: 'paid' as const,
        date: exchange.exchangeDate,
        payment_method: exchange.totalDifference >= 0 ? 'Card' : 'Refund',
        pos_sale_id: exchange.id,
        notes: `Exchange for Invoice ${exchange.originalTransaction.invoiceNumber}. ${exchange.notes || ''}`,
        line_items: [
          // Negative line items for returned products
          ...exchange.exchangeItems.map(item => ({
            sku: item.originalItem.id,
            description: `[RETURN] ${item.originalItem.name}`,
            quantity: -item.originalItem.quantity,
            price: item.originalItem.price,
            total: -Math.abs(item.originalItem.price * item.originalItem.quantity),
            type: 'product' as const
          })),
          // Positive line items for new products
          ...exchange.exchangeItems.map(item => ({
            sku: item.replacementItem.id,
            description: item.replacementItem.name,
            quantity: item.replacementItem.quantity,
            price: item.replacementItem.price,
            total: item.replacementItem.price * item.replacementItem.quantity,
            type: 'product' as const
          }))
        ]
      }

      const result = await crmIntegration.createRefundInvoice(exchangeInvoice)

      if (result.success) {
        // Also add to local transaction store for tracking
        await this.addExchangeToLocalStore(exchange, result.invoice_number)

        return {
          success: true,
          exchangeId: result.invoice_id,
          invoiceNumber: result.invoice_number,
          totalDifference: exchange.totalDifference,
          paymentRequired: exchange.totalDifference > 0,
          refundAmount: exchange.totalDifference < 0 ? Math.abs(exchange.totalDifference) : undefined
        }
      } else {
        return {
          success: false,
          totalDifference: exchange.totalDifference,
          error: result.error || 'CRM exchange creation failed'
        }
      }

    } catch (error) {
      console.error('CRM exchange processing failed:', error)
      return {
        success: false,
        totalDifference: exchange.totalDifference,
        error: 'CRM exchange processing failed'
      }
    }
  }

  /**
   * Add CRM exchange to local transaction store for tracking
   */
  private async addExchangeToLocalStore(exchange: ExchangeTransaction, invoiceNumber?: string) {
    const { useTransactionStore } = await import('../../stores/transactions')
    const store = useTransactionStore.getState()

    const exchangeTransaction = {
      date: exchange.exchangeDate,
      time: exchange.exchangeTime,
      total: exchange.totalDifference,
      subtotal: exchange.totalDifference / 1.08, // Assuming 8% tax
      tax: exchange.totalDifference * 0.08 / 1.08,
      discount: 0,
      items: [
        // Returns
        ...exchange.exchangeItems.map(item => ({
          id: item.originalItem.id,
          name: `[RETURN] ${item.originalItem.name}`,
          price: item.originalItem.price,
          quantity: -item.originalItem.quantity
        })),
        // New items
        ...exchange.exchangeItems.map(item => ({
          id: item.replacementItem.id,
          name: item.replacementItem.name,
          price: item.replacementItem.price,
          quantity: item.replacementItem.quantity
        }))
      ],
      paymentMethod: exchange.totalDifference >= 0 ? 'Card' : 'Refund',
      cashier: 'CRM Exchange',
      customerId: exchange.originalTransaction.customerId,
      customerName: exchange.originalTransaction.customerName,
      status: 'completed' as const,
      receiptNumber: invoiceNumber || exchange.id
    }

    store.addTransaction(exchangeTransaction)
  }

  /**
   * Store exchange record for history tracking
   */
  private async storeExchangeRecord(exchange: ExchangeTransaction) {
    // Store in localStorage for now - could be enhanced to use a dedicated exchange store
    const exchanges = this.getStoredExchanges()
    exchanges.push({
      ...exchange,
      status: 'completed'
    })
    
    localStorage.setItem('pos-exchanges', JSON.stringify(exchanges))
  }

  /**
   * Get stored exchange history
   */
  getStoredExchanges(): ExchangeTransaction[] {
    try {
      const stored = localStorage.getItem('pos-exchanges')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load exchange history:', error)
      return []
    }
  }

  /**
   * Search for refundable/exchangeable transactions
   */
  async searchExchangeableTransactions(params: {
    receiptNumber?: string
    invoiceNumber?: string
    customerId?: string
    customerName?: string
  }) {
    // Reuse the refund integration search functionality
    return refundIntegration.searchRefundableTransactions(params)
  }

  /**
   * Calculate exchange scenarios for given items
   */
  calculateExchangeOptions(
    originalItems: Array<{ id: string; name: string; price: number; quantity: number }>,
    replacementItems: Array<{ id: string; name: string; price: number; quantity: number }>
  ): {
    totalOriginalValue: number
    totalReplacementValue: number
    difference: number
    requiresPayment: boolean
    refundAmount?: number
  } {
    const totalOriginalValue = originalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalReplacementValue = replacementItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const difference = totalReplacementValue - totalOriginalValue

    return {
      totalOriginalValue: Math.round(totalOriginalValue * 100) / 100,
      totalReplacementValue: Math.round(totalReplacementValue * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      requiresPayment: difference > 0,
      refundAmount: difference < 0 ? Math.abs(difference) : undefined
    }
  }
}

export const exchangeIntegration = new ExchangeIntegrationService()