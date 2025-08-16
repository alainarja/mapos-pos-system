const { test, expect } = require('@playwright/test')

test.describe('POS Authentication Debug', () => {
  test('Check authentication configuration and test PINs', async ({ page }) => {
    // Go to POS
    await page.goto('http://localhost:3002')
    
    // Check if we can access the authentication service config
    const configStatus = await page.evaluate(() => {
      if (window.maposUsersAuth) {
        return window.maposUsersAuth.getConfigStatus()
      }
      return { error: 'maposUsersAuth not available' }
    })
    
    console.log('🔧 Config Status:', configStatus)
    
    // Test PIN entry
    await test.step('Test invalid PIN 0000', async () => {
      // Look for PIN interface
      const usePinButton = page.locator('text=Use PIN Instead').first()
      if (await usePinButton.isVisible()) {
        await usePinButton.click()
      }
      
      // Enter invalid PIN
      await page.fill('input[type="password"]', '0000')
      await page.keyboard.press('Enter')
      
      // Wait for response
      await page.waitForTimeout(2000)
      
      // Check if we're still on login screen (should be rejected)
      const isStillOnLogin = await page.locator('text=Enter PIN').isVisible()
      console.log('🔍 After invalid PIN 0000 - Still on login:', isStillOnLogin)
      
      if (!isStillOnLogin) {
        console.log('❌ SECURITY ISSUE: Invalid PIN 0000 was accepted!')
      }
    })
    
    await test.step('Test valid PIN 1234', async () => {
      // Clear and enter valid PIN
      await page.fill('input[type="password"]', '1234')
      await page.keyboard.press('Enter')
      
      // Wait for response
      await page.waitForTimeout(3000)
      
      // Check if we're logged in
      const isLoggedIn = await page.locator('text=Store Manager').isVisible()
      console.log('🔍 After valid PIN 1234 - Logged in:', isLoggedIn)
      
      if (isLoggedIn) {
        console.log('✅ Valid PIN 1234 worked correctly')
      } else {
        console.log('❌ Valid PIN 1234 failed')
      }
    })
    
    await test.step('Check network requests', async () => {
      // Monitor network requests
      const requests = []
      page.on('request', request => {
        if (request.url().includes('pos-auth')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            body: request.postData()
          })
        }
      })
      
      // Try another PIN to see network activity
      await page.goto('http://localhost:3002')
      const usePinButton = page.locator('text=Use PIN Instead').first()
      if (await usePinButton.isVisible()) {
        await usePinButton.click()
      }
      
      await page.fill('input[type="password"]', '5678')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      console.log('🌐 Network requests to pos-auth:', requests)
    })
  })
  
  test('Check environment variables', async ({ page }) => {
    await page.goto('http://localhost:3002')
    
    // Check if environment variables are loaded
    const envCheck = await page.evaluate(() => {
      return {
        hasApiUrl: typeof process !== 'undefined' && process.env && !!process.env.MAPOS_USERS_API_URL,
        hasApiKey: typeof process !== 'undefined' && process.env && !!process.env.MAPOS_USERS_API_KEY,
        nodeEnv: typeof process !== 'undefined' && process.env && process.env.NODE_ENV
      }
    })
    
    console.log('🌍 Environment check:', envCheck)
  })
})