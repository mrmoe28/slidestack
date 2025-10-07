#!/usr/bin/env node

import { chromium } from 'playwright';

async function fixVercelSettings() {
  console.log('🚀 Starting Vercel settings automation...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to Vercel project settings
    const projectUrl = 'https://vercel.com/ekoapps/slidestack/settings';
    console.log(`📍 Navigating to ${projectUrl}...`);
    await page.goto(projectUrl);

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if we need to log in
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('⚠️  Not logged in. Please log in manually in the browser window.');
      console.log('   After logging in, the script will continue automatically.');

      // Wait for user to log in (wait for navigation away from login page)
      await page.waitForURL(/vercel\.com\/(?!login)/, { timeout: 120000 });
      console.log('✅ Login detected, continuing...');

      // Navigate to project settings again
      await page.goto(projectUrl);
      await page.waitForTimeout(2000);
    }

    console.log('🔍 Looking for Framework Preset setting...');

    // Look for Framework Preset dropdown or setting
    // Try to find and click on "Framework Preset" section
    const frameworkPresetButton = await page.locator('text=Framework Preset').first();

    if (await frameworkPresetButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found Framework Preset setting');

      // Try to find the dropdown or select element nearby
      const selectElement = await page.locator('select, [role="combobox"]').first();

      if (await selectElement.isVisible({ timeout: 5000 })) {
        // Get current value
        const currentValue = await selectElement.inputValue();
        console.log(`📊 Current framework: ${currentValue || 'Other'}`);

        if (currentValue !== 'nextjs') {
          console.log('🔧 Changing framework to Next.js...');
          await selectElement.selectOption('nextjs');
          await page.waitForTimeout(1000);

          // Look for Save button
          const saveButton = await page.locator('button:has-text("Save")').first();
          if (await saveButton.isVisible({ timeout: 3000 })) {
            await saveButton.click();
            console.log('💾 Clicked Save button');
            await page.waitForTimeout(2000);
            console.log('✅ Framework preset updated to Next.js');
          }
        } else {
          console.log('✅ Framework is already set to Next.js');
        }
      }
    }

    console.log('\n🎯 Checking Build & Development Settings...');

    // Navigate to Build & Development Settings
    await page.goto('https://vercel.com/ekoapps/slidestack/settings/build');
    await page.waitForTimeout(2000);

    // Take a screenshot for verification
    await page.screenshot({ path: '/Users/ekodevapps/Desktop/SlideShow/vercel-settings-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to vercel-settings-screenshot.png');

    console.log('\n✨ Done! Please verify the settings in the browser.');
    console.log('   If changes were made, trigger a new deployment.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/Users/ekodevapps/Desktop/SlideShow/vercel-error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved to vercel-error-screenshot.png');
  } finally {
    // Don't close immediately - let user verify
    console.log('\n⏸️  Browser will remain open for 30 seconds for verification...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

fixVercelSettings().catch(console.error);
