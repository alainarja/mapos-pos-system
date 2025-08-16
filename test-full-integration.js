#!/usr/bin/env node

// Full integration test for MAPOS POS with MaposUsers
// Tests the complete authentication flow from POS to MaposUsers

console.log('🧪 MAPOS POS Full Integration Test')
console.log('=' .repeat(50))

// Import the actual authentication service
const { maposUsersAuth } = require('./lib/services/maposusers-auth.ts')

async function testPasswordLogin() {
  console.log('\n📧 Testing Password Authentication...')
  
  const testCredentials = [
    { email: 'manager@pos.com', password: 'admin' },
    { email: 'cashier@pos.com', password: 'admin' },
    { email: 'admin@pos.com', password: 'admin' }
  ]
  
  for (const creds of testCredentials) {
    try {
      console.log(`  Testing: ${creds.email}`)
      const response = await maposUsersAuth.loginWithPassword(creds)
      console.log(`  ✅ Success: ${response.user.fullName} (${response.user.roleId})`)
      console.log(`     Permissions: ${response.user.permissions.slice(0, 3).join(', ')}...`)
      console.log(`     Auth Method: ${response.user.authMethod}`)
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`)
    }
  }
}

async function testPinLogin() {
  console.log('\n📱 Testing PIN Authentication...')
  
  const testPins = [
    { pin: '1234', expectedUser: 'Store Manager' },
    { pin: '5678', expectedUser: 'Store Cashier' }, 
    { pin: '9999', expectedUser: 'POS Administrator' },
    { pin: '0000', expectedUser: 'Invalid PIN' }
  ]
  
  for (const test of testPins) {
    try {
      console.log(`  Testing PIN: ${test.pin}`)
      const response = await maposUsersAuth.loginWithPin({ pin: test.pin })
      console.log(`  ✅ Success: ${response.user.fullName} (${response.user.roleId})`)
      console.log(`     Permissions: ${response.user.permissions.slice(0, 3).join(', ')}...`)
      console.log(`     Auth Method: ${response.user.authMethod}`)
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`)
    }
  }
}

async function testServiceConfiguration() {
  console.log('\n⚙️  Testing Service Configuration...')
  
  const configStatus = maposUsersAuth.getConfigStatus()
  console.log(`  Base URL: ${configStatus.baseUrl}`)
  console.log(`  Has API Key: ${configStatus.hasApiKey}`)
  console.log(`  Using Mock Auth: ${configStatus.usingMockAuth}`)
  
  if (configStatus.usingMockAuth) {
    console.log('  ⚠️  WARNING: Using mock authentication!')
    console.log('     Configure MAPOS_USERS_API_URL and MAPOS_USERS_API_KEY for production.')
  } else {
    console.log('  ✅ Real MaposUsers integration configured')
  }
}

async function testTokenValidation() {
  console.log('\n🔐 Testing Token Validation...')
  
  try {
    // First get a token by logging in
    const loginResponse = await maposUsersAuth.loginWithPassword({
      email: 'manager@pos.com',
      password: 'admin'
    })
    
    const token = loginResponse.tokens.accessToken
    console.log(`  Got token: ${token.substring(0, 20)}...`)
    
    // Test token validation
    const isValid = await maposUsersAuth.validateToken(token)
    console.log(`  ✅ Token validation: ${isValid ? 'Valid' : 'Invalid'}`)
    
    // Test getting user info with token
    if (isValid) {
      const userInfo = await maposUsersAuth.getUserInfo(token)
      console.log(`  ✅ User info: ${userInfo.fullName} (${userInfo.email})`)
    }
    
  } catch (error) {
    console.log(`  ❌ Token test failed: ${error.message}`)
  }
}

async function runFullTest() {
  console.log('\nStarting comprehensive POS integration test...\n')
  
  await testServiceConfiguration()
  await testPasswordLogin()
  await testPinLogin()
  await testTokenValidation()
  
  console.log('\n' + '=' .repeat(50))
  console.log('🏁 Integration Test Complete!')
  console.log('')
  console.log('Next steps:')
  console.log('  1. If using mock auth, set up real MaposUsers service')
  console.log('  2. Create actual users with PIN authentication')
  console.log('  3. Test POS UI with real authentication flow')
  console.log('  4. Deploy and test in production environment')
  console.log('=' .repeat(50))
}

// Handle ES module issues with dynamic import
async function loadESModule() {
  try {
    // Try to import as ES module
    const module = await import('./lib/services/maposusers-auth.js')
    return module.maposUsersAuth
  } catch (error) {
    // Fall back to running basic API tests
    console.log('⚠️  Could not load ES module, running basic API tests...')
    return null
  }
}

// Alternative basic test if module loading fails
async function runBasicApiTest() {
  console.log('\n🔌 Running Basic API Tests...')
  
  const baseUrl = process.env.MAPOS_USERS_API_URL || 'http://localhost:3004'
  const apiKey = process.env.MAPOS_USERS_API_KEY || 'development_mapos_users_key'
  
  console.log(`  Testing connection to: ${baseUrl}`)
  
  try {
    const response = await fetch(`${baseUrl}/api/external/pos-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        type: 'pin',
        pin: '1234'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`  ✅ API connection successful!`)
      console.log(`     User: ${data.user.fullName}`)
      console.log(`     Role: ${data.user.roleId}`)
    } else {
      const error = await response.json()
      console.log(`  ❌ API error: ${error.error}`)
    }
  } catch (error) {
    console.log(`  ❌ Connection failed: ${error.message}`)
    console.log('     Make sure MaposUsers service is running on port 3004')
  }
}

// Main execution
async function main() {
  const authService = await loadESModule()
  
  if (authService) {
    await runFullTest()
  } else {
    await runBasicApiTest()
  }
}

main().catch(console.error)