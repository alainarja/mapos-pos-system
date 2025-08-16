import { NextRequest, NextResponse } from 'next/server'
import { externalAPI } from '@/lib/services/external-api'
import { inventoryIntegration } from '@/lib/services/inventory-integration'

interface SaleItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'service'
  stock?: number
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
      inventoryTransactions: inventoryResult.transactions,
      stockUpdates: inventoryResult.stockUpdates,
      inventorySummary: inventoryResult.summary
    }
    
    // Log the sale for audit purposes
    console.log('POS Sale processed:', {
      saleId,
      itemCount: body.items.length,
      total: body.total,
      paymentMethod: body.paymentMethod,
      user: body.user,
      inventoryUpdates: inventoryResult.summary
    })
    
    // Determine sale success based on inventory service availability
    const saleSuccess = true // Sale always succeeds from POS perspective
    let message = 'Sale completed successfully'
    let status = 200
    
    if (!inventoryResult.inventoryServiceAvailable) {
      message = 'Sale completed successfully (inventory service unavailable - manual stock adjustment may be required)'
      status = 207 // Multi-Status to indicate partial success
    } else if (!inventoryResult.success) {
      message = `Sale completed successfully (${inventoryResult.summary.failed_updates} inventory updates failed)`
      status = 207
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
      ...(inventoryResult.summary.failed_updates > 0 && {
        warnings: inventoryResult.stockUpdates
          .filter(update => !update.success)
          .map(update => `Inventory update failed for item ${update.item_id}: ${update.error}`)
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