// Simple test to check if POS is using real authentication
const puppeteer = require('puppeteer')

async function testPOSAuth() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  
  try {
    console.log('🔧 Testing POS Authentication...')
    console.log('')
    
    // Go to POS
    await page.goto('http://localhost:3000')
    console.log('📱 Navigated to POS at http://localhost:3000')
    
    // Wait for page to load
    await page.waitForTimeout(2000)
    
    // Check if "Use PIN Instead" button exists
    const usePinButton = await page.$('text=Use PIN Instead')
    if (usePinButton) {
      console.log('✅ Found "Use PIN Instead" button')
      await usePinButton.click()
      await page.waitForTimeout(1000)
    } else {
      console.log('⚠️  "Use PIN Instead" button not found, looking for PIN input directly')
    }
    
    // Look for PIN input field
    const pinInput = await page.$('input[type="password"]') || await page.$('input[placeholder*="PIN"]')
    
    if (!pinInput) {
      console.log('❌ No PIN input field found')
      await browser.close()
      return
    }
    
    console.log('✅ Found PIN input field')
    
    // Test invalid PIN 0000
    console.log('')
    console.log('🧪 Testing invalid PIN 0000...')
    await pinInput.click()
    await pinInput.type('0000')
    await page.keyboard.press('Enter')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check if we're still on login screen
    const stillOnLogin = await page.$('input[type="password"]') !== null
    if (stillOnLogin) {
      console.log('✅ Invalid PIN 0000 correctly rejected')
    } else {
      console.log('❌ SECURITY ISSUE: Invalid PIN 0000 was accepted!')
    }
    
    // Test valid PIN 1234
    console.log('')
    console.log('🧪 Testing valid PIN 1234...')
    await pinInput.click()
    await pinInput.type('1234', { delay: 100 })
    await page.keyboard.press('Enter')
    
    // Wait for response
    await page.waitForTimeout(4000)
    
    // Check if we're logged in (look for user name or different UI)
    const loggedIn = await page.$eval('body', el => el.textContent.includes('Store Manager') || el.textContent.includes('Welcome') || el.textContent.includes('Dashboard'))
    
    if (loggedIn) {
      console.log('✅ Valid PIN 1234 correctly accepted')
    } else {
      console.log('❌ Valid PIN 1234 was rejected')
    }
    
    console.log('')
    console.log('🔍 Current page title:', await page.title())
    console.log('🔍 Current URL:', page.url())
    
    // Check console for any authentication config info
    const consoleLogs = await page.evaluate(() => {
      return window.console.logs || []
    })
    
    if (consoleLogs.length > 0) {
      console.log('🔍 Console logs:', consoleLogs)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

// Run the test
testPOSAuth().catch(console.error)