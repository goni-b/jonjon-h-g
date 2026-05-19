const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', exception => {
    console.log('BROWSER_PAGE_ERROR:', exception);
  });

  try {
    await page.goto('http://localhost:8081');
    // Login
    await page.fill('input[type="email"]', 'hofit@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("התחברות")');
    await page.waitForTimeout(1000);
    
    // Switch to Team Manager role to see everything
    // Actually we don't need to if we login as admin
    
    // Go to Shoot Days / Content
    await page.click('text=תוכן');
    await page.waitForTimeout(500);
    
    // Click Scripts tab
    await page.click('text=תסריטים');
    await page.waitForTimeout(500);
    
    // Click on a script card
    await page.click('text=רילס קולקציית קיץ');
    await page.waitForTimeout(1000);
    
    console.log("Successfully opened script card.");
  } catch (error) {
    console.log('PLAYWRIGHT_SCRIPT_ERROR:', error);
  } finally {
    await browser.close();
  }
})();
