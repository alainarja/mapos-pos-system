// Debug the authentication configuration
const { maposUsersAuth } = require('./lib/services/maposusers-auth')

console.log('🔧 POS Authentication Debug')
console.log('=' .repeat(50))

// Check configuration
const config = maposUsersAuth.getConfigStatus()
console.log('📋 Config Status:')
console.log('  Base URL:', config.baseUrl)
console.log('  Has API Key:', config.hasApiKey)
console.log('  Using Mock Auth:', config.usingMockAuth)
console.log('')

// Test environment variables
console.log('🌍 Environment Variables:')
console.log('  NEXT_PUBLIC_MAPOS_USERS_API_URL:', process.env.NEXT_PUBLIC_MAPOS_USERS_API_URL)
console.log('  NEXT_PUBLIC_MAPOS_USERS_API_KEY:', process.env.NEXT_PUBLIC_MAPOS_USERS_API_KEY ? 'SET' : 'NOT SET')
console.log('')

// Test PIN authentication
async function testPinAuth() {
  console.log('🧪 Testing PIN Authentication...')
  
  try {
    // Test invalid PIN
    console.log('  Testing invalid PIN 0000...')
    try {
      await maposUsersAuth.loginWithPin({ pin: '0000' })
      console.log('  ❌ SECURITY ISSUE: Invalid PIN 0000 was accepted!')
    } catch (error) {
      console.log('  ✅ Invalid PIN 0000 correctly rejected:', error.message)
    }
    
    // Test valid PIN
    console.log('  Testing valid PIN 1234...')
    try {
      const result = await maposUsersAuth.loginWithPin({ pin: '1234' })
      console.log('  ✅ Valid PIN 1234 accepted:', result.user.fullName)
    } catch (error) {
      console.log('  ❌ Valid PIN 1234 failed:', error.message)
    }
    
  } catch (error) {
    console.log('  ❌ Test failed:', error.message)
  }
}

testPinAuth().then(() => {
  console.log('')
  console.log('=' .repeat(50))
  console.log('Debug complete!')
})