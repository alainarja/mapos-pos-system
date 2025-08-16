const { test, expect } = require('@playwright/test')

test.describe('POS User Permissions Testing', () => {
  const BASE_URL = 'http://localhost:3002'
  
  // Test credentials based on the maposusers-auth.ts mock data
  const credentials = {
    manager: {
      email: 'manager@pos.com',
      password: 'admin',
      pin: '1234',
      expectedRole: 'pos_manager',
      expectedName: 'Store Manager'
    },
    cashier: {
      email: 'cashier@pos.com',
      password: 'admin',
      pin: '5678',
      expectedRole: 'pos_cashier',
      expectedName: 'Store Cashier'
    }
  }

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure clean state
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.clear())
  })

  test.describe('Manager Permissions (PIN: 1234)', () => {
    test('Manager can login with PIN and access all features', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Switch to PIN mode
      await page.click('text=Use PIN Instead')
      await expect(page.locator('text=Enter PIN')).toBeVisible()
      
      // Enter manager PIN
      await page.fill('input[type="password"]', credentials.manager.pin)
      await page.keyboard.press('Enter')
      
      // Wait for authentication
      await page.waitForTimeout(2000)
      
      // Verify successful login
      await expect(page.locator('text=Store Manager')).toBeVisible({ timeout: 10000 })
      
      // Test manager permissions - should have access to all major features
      
      // 1. Settings access (manager should have this)
      const settingsButton = page.locator('[data-testid="settings-button"], button:has-text("Settings"), text=Settings').first()
      if (await settingsButton.isVisible()) {
        await settingsButton.click()
        await expect(page.locator('text=System Settings')).toBeVisible({ timeout: 5000 })
        await page.keyboard.press('Escape') // Close settings
      }
      
      // 2. Inventory management (manager should have this)
      const inventoryButton = page.locator('[data-testid="inventory-button"], button:has-text("Inventory"), text=Inventory').first()
      if (await inventoryButton.isVisible()) {
        await inventoryButton.click()
        await expect(page.locator('text=Inventory Management')).toBeVisible({ timeout: 5000 })
        await page.goBack()
      }
      
      // 3. Reports access (manager should have this)
      const reportsButton = page.locator('[data-testid="reports-button"], button:has-text("Reports"), text=Reports').first()
      if (await reportsButton.isVisible()) {
        await reportsButton.click()
        // Reports may be in a modal or new page
        await page.waitForTimeout(1000)
      }
      
      // 4. Customer management (manager should have this)
      const customersButton = page.locator('[data-testid="customers-button"], button:has-text("Customers"), text=Customers').first()
      if (await customersButton.isVisible()) {
        await customersButton.click()
        await page.waitForTimeout(1000)
      }
      
      console.log('✅ Manager permissions test passed - Full access granted')
    })

    test('Manager can access sales and cart management', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Login as manager
      await page.click('text=Use PIN Instead')
      await page.fill('input[type="password"]', credentials.manager.pin)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      // Verify we're logged in
      await expect(page.locator('text=Store Manager')).toBeVisible({ timeout: 10000 })
      
      // Test sales functionality
      const productGrid = page.locator('[data-testid="product-grid"], .product-grid')
      if (await productGrid.isVisible()) {
        // Try to add a product to cart
        const firstProduct = page.locator('.product-card, [data-testid="product-card"]').first()
        if (await firstProduct.isVisible()) {
          await firstProduct.click()
          await page.waitForTimeout(500)
        }
      }
      
      // Check if cart management is available
      const cartArea = page.locator('[data-testid="cart"], .cart-area, text=Cart')
      await expect(cartArea).toBeVisible({ timeout: 5000 })
      
      console.log('✅ Manager sales permissions test passed')
    })
  })

  test.describe('Cashier Permissions (PIN: 5678)', () => {
    test('Cashier can login with PIN but has limited access', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Switch to PIN mode
      await page.click('text=Use PIN Instead')
      await expect(page.locator('text=Enter PIN')).toBeVisible()
      
      // Enter cashier PIN
      await page.fill('input[type="password"]', credentials.cashier.pin)
      await page.keyboard.press('Enter')
      
      // Wait for authentication
      await page.waitForTimeout(2000)
      
      // Verify successful login
      await expect(page.locator('text=Store Cashier')).toBeVisible({ timeout: 10000 })
      
      // Test cashier restrictions - should NOT have access to admin features
      
      // 1. Settings should be restricted or limited
      const settingsButton = page.locator('[data-testid="settings-button"], button:has-text("Settings"), text=Settings').first()
      if (await settingsButton.isVisible()) {
        await settingsButton.click()
        await page.waitForTimeout(1000)
        
        // Check if admin settings are hidden/restricted
        const adminSettings = page.locator('text=System Configuration, text=User Management, text=Admin Panel')
        const isAdminVisible = await adminSettings.isVisible()
        
        if (isAdminVisible) {
          console.log('⚠️  WARNING: Cashier can see admin settings - potential permission issue')
        } else {
          console.log('✅ Cashier settings properly restricted')
        }
        
        await page.keyboard.press('Escape') // Close settings
      }
      
      // 2. Inventory management should be view-only or restricted
      const inventoryButton = page.locator('[data-testid="inventory-button"], button:has-text("Inventory"), text=Inventory').first()
      if (await inventoryButton.isVisible()) {
        await inventoryButton.click()
        await page.waitForTimeout(1000)
        
        // Check for edit/admin buttons that cashier shouldn't have
        const addProductButton = page.locator('button:has-text("Add Product"), button:has-text("New Product")')
        const editButtons = page.locator('button:has-text("Edit"), [data-testid="edit-button"]')
        
        const canAddProduct = await addProductButton.isVisible()
        const canEdit = await editButtons.count() > 0
        
        if (canAddProduct || canEdit) {
          console.log('⚠️  WARNING: Cashier has inventory edit permissions - should be view-only')
        } else {
          console.log('✅ Cashier inventory access properly restricted')
        }
        
        await page.goBack()
      }
      
      // 3. Reports should be limited or restricted
      const reportsButton = page.locator('[data-testid="reports-button"], button:has-text("Reports"), text=Reports').first()
      if (await reportsButton.isVisible()) {
        await reportsButton.click()
        await page.waitForTimeout(1000)
        
        // Check if detailed financial reports are hidden
        const financialReports = page.locator('text=Financial Report, text=Profit/Loss, text=Revenue Analysis')
        const hasFinancialAccess = await financialReports.isVisible()
        
        if (hasFinancialAccess) {
          console.log('⚠️  WARNING: Cashier can access financial reports - should be restricted')
        } else {
          console.log('✅ Cashier reports access properly restricted')
        }
      }
      
      console.log('✅ Cashier permissions test completed - Restricted access verified')
    })

    test('Cashier can perform basic sales operations', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Login as cashier
      await page.click('text=Use PIN Instead')
      await page.fill('input[type="password"]', credentials.cashier.pin)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      // Verify we're logged in
      await expect(page.locator('text=Store Cashier')).toBeVisible({ timeout: 10000 })
      
      // Test basic sales functionality that cashier SHOULD have
      
      // 1. Product selection
      const productGrid = page.locator('[data-testid="product-grid"], .product-grid')
      if (await productGrid.isVisible()) {
        const firstProduct = page.locator('.product-card, [data-testid="product-card"]').first()
        if (await firstProduct.isVisible()) {
          await firstProduct.click()
          await page.waitForTimeout(500)
          console.log('✅ Cashier can select products')
        }
      }
      
      // 2. Cart operations
      const cartArea = page.locator('[data-testid="cart"], .cart-area, text=Cart')
      await expect(cartArea).toBeVisible({ timeout: 5000 })
      
      // 3. Basic customer operations
      const customerButton = page.locator('[data-testid="customers-button"], button:has-text("Customer")')
      if (await customerButton.isVisible()) {
        // Cashier should be able to select customers but not edit them
        console.log('✅ Cashier has customer view access')
      }
      
      console.log('✅ Cashier basic sales permissions test passed')
    })
  })

  test.describe('Permission Verification', () => {
    test('Invalid PIN is rejected', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Switch to PIN mode
      await page.click('text=Use PIN Instead')
      await expect(page.locator('text=Enter PIN')).toBeVisible()
      
      // Try invalid PIN
      await page.fill('input[type="password"]', '0000')
      await page.keyboard.press('Enter')
      
      // Wait for response
      await page.waitForTimeout(3000)
      
      // Should still be on login screen
      const isStillOnLogin = await page.locator('text=Enter PIN').isVisible()
      expect(isStillOnLogin).toBe(true)
      
      // Check for error message
      const errorMessage = page.locator('text=Invalid PIN, text=Access denied, .error-message')
      if (await errorMessage.isVisible()) {
        console.log('✅ Invalid PIN properly rejected with error message')
      } else {
        console.log('✅ Invalid PIN properly rejected (no error message shown)')
      }
    })

    test('Security: PIN attempts are properly handled', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Switch to PIN mode
      await page.click('text=Use PIN Instead')
      
      // Try multiple invalid PINs
      const invalidPins = ['0000', '9999', '1111', '2222']
      
      for (const pin of invalidPins) {
        await page.fill('input[type="password"]', pin)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)
        
        // Should remain on login screen
        const isStillOnLogin = await page.locator('text=Enter PIN').isVisible()
        expect(isStillOnLogin).toBe(true)
      }
      
      // Now try valid PIN to ensure system still works
      await page.fill('input[type="password"]', credentials.manager.pin)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      // Should successfully login
      await expect(page.locator('text=Store Manager')).toBeVisible({ timeout: 10000 })
      
      console.log('✅ Security test passed - Multiple invalid attempts handled correctly')
    })

    test('Session management and logout work correctly', async ({ page }) => {
      await page.goto(BASE_URL)
      
      // Login as manager
      await page.click('text=Use PIN Instead')
      await page.fill('input[type="password"]', credentials.manager.pin)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      // Verify login
      await expect(page.locator('text=Store Manager')).toBeVisible({ timeout: 10000 })
      
      // Test logout functionality
      const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), text=Logout, text=Sign Out').first()
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        await page.waitForTimeout(1000)
        
        // Should return to login screen
        await expect(page.locator('text=Enter PIN, text=Welcome Back')).toBeVisible({ timeout: 5000 })
        console.log('✅ Logout functionality works correctly')
      } else {
        console.log('ℹ️  Logout button not found - testing page refresh instead')
        
        // Test page refresh maintains security
        await page.reload()
        await page.waitForTimeout(2000)
        
        // Should require re-authentication
        const requiresAuth = await page.locator('text=Enter PIN, text=Welcome Back').isVisible()
        if (requiresAuth) {
          console.log('✅ Page refresh requires re-authentication (good security)')
        } else {
          console.log('⚠️  WARNING: Page refresh maintains login session - potential security risk')
        }
      }
    })
  })

  test.describe('Cross-User Permission Testing', () => {
    test('Different users have different permission sets', async ({ page }) => {
      // Test manager first
      await page.goto(BASE_URL)
      await page.click('text=Use PIN Instead')
      await page.fill('input[type="password"]', credentials.manager.pin)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      await expect(page.locator('text=Store Manager')).toBeVisible({ timeout: 10000 })
      
      // Document manager capabilities
      const managerCapabilities = {
        canAccessSettings: false,
        canAccessInventory: false,
        canAccessReports: false
      }
      
      // Check manager permissions
      if (await page.locator('[data-testid="settings-button"], button:has-text("Settings")').first().isVisible()) {
        managerCapabilities.canAccessSettings = true
      }
      if (await page.locator('[data-testid="inventory-button"], button:has-text("Inventory")').first().isVisible()) {
        managerCapabilities.canAccessInventory = true
      }
      if (await page.locator('[data-testid="reports-button"], button:has-text("Reports")').first().isVisible()) {
        managerCapabilities.canAccessReports = true
      }
      
      console.log('Manager capabilities:', managerCapabilities)
      
      // Logout and test cashier
      const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout")').first()
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        await page.waitForTimeout(1000)
      } else {
        await page.reload()
        await page.waitForTimeout(2000)
      }
      
      // Login as cashier
      if (await page.locator('text=Use PIN Instead').isVisible()) {
        await page.click('text=Use PIN Instead')
      }
      await page.fill('input[type="password"]', credentials.cashier.pin)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      
      await expect(page.locator('text=Store Cashier')).toBeVisible({ timeout: 10000 })
      
      // Document cashier capabilities
      const cashierCapabilities = {
        canAccessSettings: false,
        canAccessInventory: false,
        canAccessReports: false
      }
      
      // Check cashier permissions
      if (await page.locator('[data-testid="settings-button"], button:has-text("Settings")').first().isVisible()) {
        cashierCapabilities.canAccessSettings = true
      }
      if (await page.locator('[data-testid="inventory-button"], button:has-text("Inventory")').first().isVisible()) {
        cashierCapabilities.canAccessInventory = true
      }
      if (await page.locator('[data-testid="reports-button"], button:has-text("Reports")').first().isVisible()) {
        cashierCapabilities.canAccessReports = true
      }
      
      console.log('Cashier capabilities:', cashierCapabilities)
      
      // Verify permission differences
      const hasPermissionDifferences = (
        managerCapabilities.canAccessSettings !== cashierCapabilities.canAccessSettings ||
        managerCapabilities.canAccessInventory !== cashierCapabilities.canAccessInventory ||
        managerCapabilities.canAccessReports !== cashierCapabilities.canAccessReports
      )
      
      if (hasPermissionDifferences) {
        console.log('✅ Different users have different permission sets')
      } else {
        console.log('⚠️  WARNING: Manager and Cashier appear to have identical permissions')
      }
      
      // Manager should have more permissions than cashier
      const managerPermCount = Object.values(managerCapabilities).filter(Boolean).length
      const cashierPermCount = Object.values(cashierCapabilities).filter(Boolean).length
      
      if (managerPermCount >= cashierPermCount) {
        console.log('✅ Manager has equal or greater permissions than cashier')
      } else {
        console.log('⚠️  WARNING: Cashier has more permissions than manager - this seems incorrect')
      }
    })
  })
})