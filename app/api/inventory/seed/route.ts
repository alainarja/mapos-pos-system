import { NextRequest, NextResponse } from "next/server"
import { externalAPI } from "@/lib/services/external-api"

export async function POST(request: NextRequest) {
  try {
    // Seed inventory with stock for testing
    console.log('🌱 Seeding inventory with stock...')
    
    const seedItems = [
      {
        sku: 'COFFEE-001',
        quantity: 50, // Add 50 units of coffee
        operation: 'set' // Set absolute quantity
      },
      {
        sku: 'CROISSANT-001', 
        quantity: 30, // Add 30 units of croissant
        operation: 'set' // Set absolute quantity
      }
    ]

    const results = []

    for (const item of seedItems) {
      try {
        console.log(`📦 Adding ${item.quantity} units to ${item.sku}`)
        
        // Try to update inventory through the external API
        const response = await externalAPI.updateInventoryQuantity(
          item.sku,
          item.quantity,
          item.operation
        )
        
        results.push({
          sku: item.sku,
          success: true,
          quantity: item.quantity,
          response: response
        })
        
        console.log(`✅ Successfully updated ${item.sku}`)
      } catch (error) {
        console.error(`❌ Failed to update ${item.sku}:`, error)
        results.push({
          sku: item.sku,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory seeding completed',
      results: results
    })
  } catch (error) {
    console.error('Error seeding inventory:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to seed inventory data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}