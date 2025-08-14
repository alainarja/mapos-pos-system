const { chromium } = require('playwright');

async function debugSite() {
  const browser = await chromium.launch({ 
    headless: true // Run in headless mode since we're in WSL
  });
  
  const page = await browser.newPage();
  
  // Capture console errors and warnings
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    console.log('Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage.png', fullPage: true });
    console.log('Screenshot saved as homepage.png');
    
    // Check for visible errors
    const pageContent = await page.content();
    
    // Check if main elements are present
    const hasLogo = await page.locator('img[alt="MAPOS"]').count() > 0;
    const hasCart = await page.locator('text=Cart').count() > 0;
    
    console.log('\n=== Page Status ===');
    console.log('Logo present:', hasLogo);
    console.log('Cart present:', hasCart);
    
    // Try to navigate to different sections
    const categoryButton = await page.locator('text=All Categories').first();
    if (await categoryButton.count() > 0) {
      await categoryButton.click();
      console.log('Clicked on All Categories');
      await page.waitForTimeout(1000);
    }
    
    // Check for product cards
    const productCards = await page.locator('.cursor-pointer.group').count();
    console.log('Product cards found:', productCards);
    
    // Test filter shortcut
    await page.keyboard.press('Control+f');
    await page.waitForTimeout(500);
    const filterDialog = await page.locator('text=Filter Products').count() > 0;
    console.log('Filter dialog opens with Ctrl+F:', filterDialog);
    
    if (filterDialog) {
      await page.keyboard.press('Escape');
    }
    
    // Test navbar buttons
    const buttons = [
      { selector: '[title="Cash Management"]', name: 'Cash Management' },
      { selector: '[title="Print Menu"]', name: 'Print Menu' },
      { selector: '[title="Sales History"]', name: 'Sales History' },
      { selector: '[title="Coupon Management"]', name: 'Coupon Management' }
    ];
    
    console.log('\n=== Testing Navbar Buttons ===');
    for (const button of buttons) {
      const btn = await page.locator(button.selector).first();
      if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(500);
        const dialogOpen = await page.locator('.fixed.inset-0').count() > 0;
        console.log(`${button.name} button works:`, dialogOpen);
        
        if (dialogOpen) {
          // Close dialog
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      } else {
        console.log(`${button.name} button not found`);
      }
    }
    
    console.log('\n=== Console Errors ===');
    if (errors.length > 0) {
      errors.forEach(err => console.log('ERROR:', err));
    } else {
      console.log('No console errors found');
    }
    
    console.log('\n=== Console Warnings ===');
    if (warnings.length > 0) {
      warnings.forEach(warn => console.log('WARNING:', warn));
    } else {
      console.log('No console warnings found');
    }
    
    // Check for React error boundaries
    const errorBoundary = await page.locator('text=Something went wrong').count() > 0;
    if (errorBoundary) {
      console.log('\n⚠️ React Error Boundary triggered!');
    }
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugSite().then(() => {
  console.log('\nDebug complete!');
}).catch(console.error);