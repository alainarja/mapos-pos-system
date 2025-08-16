// Test the deployed POS authentication using fetch API calls
// This simulates what the browser would do

const DEPLOYED_POS_URL = 'https://mapos-pos-system.vercel.app'
const DEPLOYED_MAPOS_URL = 'https://maposusers.vercel.app'

async function testDeployedAuthentication() {
  console.log('🧪 Testing Deployed POS Authentication')
  console.log('=' .repeat(50))
  console.log('')

  // Test if MaposUsers API is accessible
  console.log('🔍 Testing MaposUsers API...')
  try {
    const response = await fetch(`${DEPLOYED_MAPOS_URL}/api/test-data`)
    if (response.ok) {
      console.log('✅ MaposUsers API is reachable')
    } else {
      console.log(`❌ MaposUsers API returned ${response.status}`)
    }
  } catch (error) {
    console.log(`❌ MaposUsers API error: ${error.message}`)
  }

  console.log('')
  console.log('🔐 Testing PIN Authentication API...')
  
  const testPins = [
    { pin: '0000', expected: 'reject', name: 'Invalid PIN' },
    { pin: '1234', expected: 'accept', name: 'Manager PIN' },
    { pin: '5678', expected: 'accept', name: 'Cashier PIN' },
    { pin: '9999', expected: 'accept', name: 'Admin PIN' }
  ]

  for (const test of testPins) {
    try {
      console.log(`  Testing ${test.name} (${test.pin})...`)
      
      const response = await fetch(`${DEPLOYED_MAPOS_URL}/api/external/pos-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'development_mapos_users_key'
        },
        body: JSON.stringify({
          type: 'pin',
          pin: test.pin
        })
      })

      const data = await response.json()
      const success = data.success === true
      const shouldAccept = test.expected === 'accept'
      const correct = success === shouldAccept

      if (correct) {
        console.log(`    ✅ ${success ? 'ACCEPTED' : 'REJECTED'} (correct)`)
        if (success && data.user) {
          console.log(`       User: ${data.user.fullName}`)
        }
      } else {
        console.log(`    ❌ ${success ? 'ACCEPTED' : 'REJECTED'} (WRONG!)`)
        console.log(`       Expected: ${test.expected}`)
        console.log(`       Response: ${JSON.stringify(data).substring(0, 100)}...`)
      }

    } catch (error) {
      console.log(`    ❌ ERROR: ${error.message}`)
    }
  }

  console.log('')
  console.log('=' .repeat(50))
  console.log('🎯 Next Steps:')
  console.log('')
  console.log('1. Go to: https://mapos-pos-system.vercel.app/debug')
  console.log('2. Click "Run Debug Tests" to see the frontend config')
  console.log('3. Check if environment variables are set in Vercel')
  console.log('4. Test PIN authentication in the actual UI')
  console.log('')
  console.log('Expected behavior:')
  console.log('  - PIN 0000: Should shake and stay on login (no error message needed)')
  console.log('  - PIN 1234: Should login successfully as Store Manager')
  console.log('  - PIN 5678: Should login successfully as Store Cashier')
  console.log('  - PIN 9999: Should login successfully as POS Administrator')
  console.log('=' .repeat(50))
}

// Run the test
testDeployedAuthentication().catch(console.error)