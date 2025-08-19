import { NextRequest, NextResponse } from 'next/server'
import { externalAPI } from '@/lib/services/external-api'
import { inventoryIntegration } from '@/lib/services/inventory-integration'
import { crmIntegration } from '@/lib/services/crm-integration'

interface SaleItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
  stock?: number
  cost?: number // Cost price for reporting
}

interface SaleTransaction {
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  user: string
  warehouseId?: string
  customerId?: string
  customerName?: string
  currency?: string
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaleTransaction
    
    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'No items in sale transaction' },
        { status: 400 }
      )
    }

    if (!body.total || body.total <= 0) {
      return NextResponse.json(
        { error: 'Invalid sale total' },
        { status: 400 }
      )
    }

    // Generate unique sale ID
    const saleId = `POS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Process inventory updates using the inventory integration service
    let inventoryResult
    try {
      inventoryResult = await inventoryIntegration.processSaleTransaction(
        saleId,
        body.items,
        body.warehouseId,
        body.user
      )
    } catch (error) {
      console.error('Inventory integration failed:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to process inventory updates',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
    // Process CRM invoice creation 
    // Customer info should be provided by client (either selected or default from settings)
    let crmResult = null
    const customerId = body.customerId
    const customerName = body.customerName
    
    // Always create invoice if customer info is provided
    if (customerId && customerName) {
      try {
        console.log('Creating CRM invoice with:', {
          customerId,
          customerName,
          warehouseId: body.warehouseId,
          total: body.total
        })
      
      crmResult = await crmIntegration.processPOSSale(
        saleId,
        customerId,
        customerName,
        body.total,
        body.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          type: item.type,
          sku: item.id, // Using item ID as SKU for now
          costPrice: item.cost || 0 // Include cost price for reporting
        })),
        body.paymentMethod,
        body.currency || 'USD',
        body.warehouseId // Pass warehouse ID for invoice prefix
      )
        
        console.log('CRM invoice integration result:', {
          success: crmResult.success,
          invoice_id: crmResult.invoice_id,
          invoice_number: crmResult.invoice_number,
          serviceAvailable: crmResult.crmServiceAvailable
        })
      } catch (error) {
        console.error('CRM integration failed:', error)
        crmResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          crmServiceAvailable: false
        }
      }
    } else {
      console.log('No customer info provided, skipping CRM invoice creation')
    }
    
    // Create sale record
    const saleRecord = {
      id: saleId,
      timestamp: new Date().toISOString(),
      items: body.items,
      subtotal: body.subtotal,
      tax: body.tax,
      total: body.total,
      paymentMethod: body.paymentMethod,
      user: body.user,
      warehouseId: body.warehouseId,
      customerId: body.customerId,
      customerName: body.customerName,
      currency: body.currency || 'USD',
      inventoryTransactions: inventoryResult.transactions,
      stockUpdates: inventoryResult.stockUpdates,
      inventorySummary: inventoryResult.summary,
      crmInvoice: crmResult ? {
        success: crmResult.success,
        invoice_id: crmResult.invoice_id,
        invoice_number: crmResult.invoice_number,
        error: crmResult.error
      } : null
    }
    
    // Log the sale for audit purposes
    console.log('POS Sale processed:', {
      saleId,
      itemCount: body.items.length,
      total: body.total,
      paymentMethod: body.paymentMethod,
      user: body.user,
      customerId: body.customerId,
      inventoryUpdates: inventoryResult.summary,
      crmInvoice: crmResult ? {
        success: crmResult.success,
        invoice_number: crmResult.invoice_number,
        serviceAvailable: crmResult.crmServiceAvailable
      } : 'No customer selected'
    })
    
    // Determine sale success based on inventory and CRM service availability
    const saleSuccess = true // Sale always succeeds from POS perspective
    let message = 'Sale completed successfully'
    let status = 200
    const warnings = []
    
    // Check inventory status
    if (!inventoryResult.inventoryServiceAvailable) {
      warnings.push('inventory service unavailable - manual stock adjustment may be required')
      status = 207 // Multi-Status to indicate partial success
    } else if (!inventoryResult.success) {
      warnings.push(`${inventoryResult.summary.failed_updates} inventory updates failed`)
      status = 207
    }
    
    // Check CRM status if customer was selected
    if (body.customerId && crmResult) {
      if (!crmResult.crmServiceAvailable) {
        warnings.push('CRM service unavailable - invoice not created')
        status = 207
      } else if (!crmResult.success) {
        warnings.push('CRM invoice creation failed')
        status = 207
      }
    }
    
    // Build final message
    if (warnings.length > 0) {
      message = `Sale completed successfully (${warnings.join(', ')})`
    } else if (body.customerId && crmResult?.success) {
      message = `Sale completed successfully with inventory updates and CRM invoice ${crmResult.invoice_number}`
    } else {
      message = 'Sale completed successfully with all inventory updates'
    }
    
    return NextResponse.json({
      success: saleSuccess,
      saleId,
      message,
      saleRecord,
      inventoryStatus: {
        serviceAvailable: inventoryResult.inventoryServiceAvailable,
        updatesSuccessful: inventoryResult.success,
        summary: inventoryResult.summary
      },
      crmStatus: crmResult ? {
        serviceAvailable: crmResult.crmServiceAvailable,
        invoiceCreated: crmResult.success,
        invoice_id: crmResult.invoice_id,
        invoice_number: crmResult.invoice_number,
        error: crmResult.error
      } : null,
      ...(warnings.length > 0 && {
        warnings: [
          ...inventoryResult.stockUpdates
            .filter(update => !update.success)
            .map(update => `Inventory update failed for item ${update.item_id}: ${update.error}`),
          ...(crmResult && !crmResult.success ? [`CRM invoice creation failed: ${crmResult.error}`] : [])
        ]
      })
    }, { status })
    
  } catch (error) {
    console.error('Sale processing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process sale transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve sale transactions
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const saleId = url.searchParams.get('saleId')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    if (saleId) {
      // Return specific sale by ID
      // In a real implementation, this would query a database
      return NextResponse.json({
        message: 'Sale lookup by ID not implemented',
        saleId
      })
    }
    
    // Return list of recent sales
    // In a real implementation, this would query a database
    return NextResponse.json({
      message: 'Sale history lookup not implemented',
      limit,
      offset
    })
    
  } catch (error) {
    console.error('Sale lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sale information' },
      { status: 500 }
    )
  }
}