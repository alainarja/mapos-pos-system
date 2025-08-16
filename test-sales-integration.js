// Test script to verify POS sales integration with inventory

const testSaleTransaction = {
  items: [
    {
      id: "1",
      name: "Premium Coffee Beans",
      price: 24.99,
      quantity: 2,
      type: "product",
      stock: 50
    },
    {
      id: "service-1",
      name: "Coffee Brewing Service",
      price: 15.00,
      quantity: 1,
      type: "service"
    },
    {
      id: "2", 
      name: "Organic Green Tea",
      price: 18.50,
      quantity: 1,
      type: "product",
      stock: 30
    }
  ],
  subtotal: 83.48,
  tax: 6.68,
  total: 90.16,
  paymentMethod: "Cash",
  user: "test-cashier",
  warehouseId: "warehouse-1",
  customerId: "customer-123"
}

async function testSalesAPI() {
  try {
    console.log('🧪 Testing POS Sales API Integration...')
    console.log('📦 Sale Transaction:', JSON.stringify(testSaleTransaction, null, 2))
    
    const response = await fetch('http://localhost:3003/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSaleTransaction)
    })
    
    const result = await response.json()
    
    console.log('📊 Response Status:', response.status)
    console.log('📋 Response Data:', JSON.stringify(result, null, 2))
    
    if (response.ok && result.success) {
      console.log('✅ Sale processed successfully!')
      console.log('🆔 Sale ID:', result.saleId)
      console.log('💰 Message:', result.message)
      
      if (result.saleRecord?.inventorySummary) {
        console.log('📈 Inventory Summary:', result.saleRecord.inventorySummary)
      }
      
      return true
    } else {
      console.log('❌ Sale processing failed')
      console.log('💥 Error:', result.error || result.message)
      if (result.errors) {
        console.log('🔍 Details:', result.errors)
      }
      return false
    }
    
  } catch (error) {
    console.error('🚨 Network Error:', error.message)
    return false
  }
}

async function testServicesAPI() {
  try {
    console.log('🧪 Testing Services API...')
    
    const response = await fetch('http://localhost:3003/api/services?page=1&perPage=5')
    const result = await response.json()
    
    console.log('📊 Services Response Status:', response.status)
    
    if (response.ok) {
      console.log('✅ Services API working!')
      console.log('📋 Services count:', result.data?.length || 0)
      return true
    } else {
      console.log('❌ Services API failed')
      console.log('💥 Error:', result.error)
      return false
    }
    
  } catch (error) {
    console.error('🚨 Services API Error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting POS Integration Tests...')
  console.log('=' .repeat(50))
  
  // Test Services API first
  const servicesTest = await testServicesAPI()
  console.log('')
  
  // Test Sales API
  const salesTest = await testSalesAPI()
  console.log('')
  
  // Summary
  console.log('=' .repeat(50))
  console.log('📈 Test Results Summary:')
  console.log('Services API:', servicesTest ? '✅ PASS' : '❌ FAIL')
  console.log('Sales API:', salesTest ? '✅ PASS' : '❌ FAIL')
  
  const allPassed = servicesTest && salesTest
  console.log('Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED')
  
  process.exit(allPassed ? 0 : 1)
}

runTests().catch(console.error)