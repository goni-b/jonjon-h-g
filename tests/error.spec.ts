import { test, expect } from '@playwright/test';

test('debug errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', exception => {
    errors.push(exception.message);
  });

  await page.goto('http://localhost:8081');
  
  // Login
  await page.fill('input[type="email"]', 'hofit@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("התחברות")');
  await page.waitForTimeout(1000);
  
  // Go to Shoot Days / Content
  await page.click('text=תוכן');
  await page.waitForTimeout(500);
  
  // Click Scripts tab
  await page.click('text=תסריטים');
  await page.waitForTimeout(500);
  
  // Click on a script card
  await page.click('text=רילס קולקציית קיץ');
  await page.waitForTimeout(1000);
  
  console.log("ERRORS_FOUND:", errors);
});
