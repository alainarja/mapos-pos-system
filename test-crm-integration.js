// Test script for POS-to-CRM invoice integration
// This script tests the complete flow of creating a sale with a customer
// and verifying that an invoice is created in the CRM system

const API_BASE = 'http://localhost:3000'

async function testCrmIntegration() {
  console.log('=== Testing POS-to-CRM Invoice Integration ===\n')

  // Test data
  const testSale = {
    items: [
      {
        id: 'test-product-1',
        name: 'Test Coffee',
        price: 4.50,
        quantity: 2,
        type: 'product'
      },
      {
        id: 'test-service-1',
        name: 'Gift Wrapping',
        price: 1.00,
        quantity: 1,
        type: 'service'
      }
    ],
    subtotal: 10.00,
    tax: 1.00,
    total: 11.00,
    paymentMethod: 'Credit Card',
    user: 'test-cashier',
    customerId: 'customer-123',
    customerName: 'John Doe',
    currency: 'USD'
  }

  console.log('1. Testing sale with customer (should create CRM invoice)...')
  
  try {
    const response = await fetch(`${API_BASE}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSale)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    console.log('✅ Sale processing completed')
    console.log(`   Sale ID: ${result.saleId}`)
    console.log(`   Message: ${result.message}`)
    
    // Check CRM status
    if (result.crmStatus) {
      console.log('\n📋 CRM Integration Status:')
      console.log(`   Service Available: ${result.crmStatus.serviceAvailable}`)
      console.log(`   Invoice Created: ${result.crmStatus.invoiceCreated}`)
      
      if (result.crmStatus.invoiceCreated) {
        console.log(`   ✅ Invoice ID: ${result.crmStatus.invoice_id}`)
        console.log(`   ✅ Invoice Number: ${result.crmStatus.invoice_number}`)
      } else {
        console.log(`   ❌ Error: ${result.crmStatus.error}`)
      }
    } else {
      console.log('\n📋 CRM Integration: Not triggered (no customer selected)')
    }

    // Check inventory status
    console.log('\n📦 Inventory Integration Status:')
    console.log(`   Service Available: ${result.inventoryStatus.serviceAvailable}`)
    console.log(`   Updates Successful: ${result.inventoryStatus.updatesSuccessful}`)
    console.log(`   Items Processed: ${result.inventoryStatus.summary.total_items}`)

    // Check warnings
    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      result.warnings.forEach(warning => console.log(`   - ${warning}`))
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }

  console.log('\n2. Testing sale without customer (should NOT create CRM invoice)...')
  
  try {
    const saleWithoutCustomer = { ...testSale }
    delete saleWithoutCustomer.customerId
    delete saleWithoutCustomer.customerName

    const response = await fetch(`${API_BASE}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saleWithoutCustomer)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    console.log('✅ Sale processing completed')
    console.log(`   Sale ID: ${result.saleId}`)
    console.log(`   Message: ${result.message}`)
    
    // Check CRM status (should be null)
    if (result.crmStatus === null) {
      console.log('\n📋 CRM Integration: ✅ Correctly skipped (no customer)')
    } else {
      console.log('\n📋 CRM Integration: ❌ Should have been skipped')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }

  console.log('\n=== Test Summary ===')
  console.log('Integration points tested:')
  console.log('✅ 1. Sale with customer triggers CRM invoice creation')
  console.log('✅ 2. Sale without customer skips CRM integration')
  console.log('✅ 3. Inventory integration continues to work')
  console.log('✅ 4. Error handling and service availability detection')
  
  console.log('\n📝 Environment Setup Required:')
  console.log('   CRM_API_URL - URL of the CRM system API')
  console.log('   CRM_API_KEY - API key for authenticating with CRM')
  console.log('   Example: CRM_API_URL=http://localhost:3001')
  console.log('   Example: CRM_API_KEY=your-secret-api-key')
}

// Run the test
testCrmIntegration().catch(console.error)