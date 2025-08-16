// Test script to verify PIN integration with MaposUsers
// This script tests the POS authentication against the MaposUsers service

const testPinAuth = async () => {
  const baseUrl = 'http://localhost:3004'
  const apiKey = 'development_mapos_users_key'
  
  const testPins = ['1234', '5678', '9999', '0000', '2024']
  
  console.log('Testing PIN authentication against MaposUsers API...\n')
  
  for (const pin of testPins) {
    try {
      console.log(`Testing PIN: ${pin}`)
      
      const response = await fetch(`${baseUrl}/api/external/pos-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          type: 'pin',
          pin: pin
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ PIN ${pin} - Success: ${data.user.fullName} (${data.user.roleId})`)
      } else {
        const error = await response.json()
        console.log(`❌ PIN ${pin} - Failed: ${error.error}`)
      }
    } catch (error) {
      console.log(`❌ PIN ${pin} - Error: ${error.message}`)
    }
    console.log('')
  }
}

// Test password login too
const testPasswordAuth = async () => {
  const baseUrl = 'http://localhost:3004'
  const apiKey = 'development_mapos_users_key'
  
  const testCredentials = [
    { email: 'admin@pos.com', password: 'admin' },
    { email: 'manager@pos.com', password: 'admin' },
    { email: 'cashier@pos.com', password: 'admin' }
  ]
  
  console.log('Testing password authentication against MaposUsers API...\n')
  
  for (const creds of testCredentials) {
    try {
      console.log(`Testing login: ${creds.email}`)
      
      const response = await fetch(`${baseUrl}/api/external/pos-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          type: 'login',
          email: creds.email,
          password: creds.password
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Login ${creds.email} - Success: ${data.user.fullName} (${data.user.roleId})`)
      } else {
        const error = await response.json()
        console.log(`❌ Login ${creds.email} - Failed: ${error.error}`)
      }
    } catch (error) {
      console.log(`❌ Login ${creds.email} - Error: ${error.message}`)
    }
    console.log('')
  }
}

const runTests = async () => {
  console.log('='.repeat(60))
  console.log('MAPOS POS-MaposUsers Integration Test')
  console.log('='.repeat(60))
  console.log('')
  
  await testPasswordAuth()
  console.log('-'.repeat(40))
  await testPinAuth()
  
  console.log('='.repeat(60))
  console.log('Test completed!')
  console.log('='.repeat(60))
}

// Run the tests
runTests().catch(console.error)