import { chromium } from 'playwright';

const DEPLOYMENT_URL = 'https://slidestack.vercel.app';
const TEST_PROJECT_URL = 'https://slidestack.vercel.app/projects/be2998ac-ff6e-40bc-99c7-4e75fd43fc07/edit';

async function testTimeline() {
  console.log('🚀 Starting Timeline UI Tests (Headless Mode)\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to project editor
    console.log('📍 Navigating to project editor...');
    await page.goto(TEST_PROJECT_URL, { waitUntil: 'networkidle' });
    console.log('✅ Page loaded\n');

    // Test 1: Verify no-scroll layout (100vh)
    console.log('🧪 Test 1: Verify 100vh fixed layout (no scrolling)');
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    const hasVerticalScroll = bodyHeight > windowHeight;
    console.log(`   Body height: ${bodyHeight}px, Window height: ${windowHeight}px`);
    console.log(hasVerticalScroll ? '   ❌ FAIL: Page has vertical scroll' : '   ✅ PASS: No vertical scroll\n');

    // Test 2: Timeline controls visibility
    console.log('🧪 Test 2: Verify timeline controls are visible');
    const playButton = await page.locator('button:has-text(""), button svg.lucide-play').first().isVisible();
    const skipBackButton = await page.locator('button svg.lucide-skip-back').first().isVisible();
    const skipForwardButton = await page.locator('button svg.lucide-skip-forward').first().isVisible();
    const zoomInButton = await page.locator('button svg.lucide-zoom-in').first().isVisible();
    const zoomOutButton = await page.locator('button svg.lucide-zoom-out').first().isVisible();

    console.log(`   Play button: ${playButton ? '✅' : '❌'}`);
    console.log(`   Skip back button: ${skipBackButton ? '✅' : '❌'}`);
    console.log(`   Skip forward button: ${skipForwardButton ? '✅' : '❌'}`);
    console.log(`   Zoom in button: ${zoomInButton ? '✅' : '❌'}`);
    console.log(`   Zoom out button: ${zoomOutButton ? '✅' : '❌'}\n`);

    // Test 3: Time display format
    console.log('🧪 Test 3: Verify time display format (MM:SS:FF)');
    const timeDisplay = await page.locator('.font-mono').first().textContent();
    const timeFormatRegex = /\d{2}:\d{2}:\d{2}\s*\/\s*\d{2}:\d{2}:\d{2}/;
    const hasCorrectFormat = timeFormatRegex.test(timeDisplay);
    console.log(`   Time display: "${timeDisplay}"`);
    console.log(hasCorrectFormat ? '   ✅ PASS: Correct format\n' : '   ❌ FAIL: Wrong format\n');

    // Test 4: Timeline canvas exists
    console.log('🧪 Test 4: Verify timeline canvas exists');
    const timelineCanvas = await page.locator('.bg-gray-800.border-b').first().isVisible();
    console.log(timelineCanvas ? '   ✅ PASS: Timeline canvas visible\n' : '   ❌ FAIL: Timeline canvas not found\n');

    // Test 5: Track labels
    console.log('🧪 Test 5: Verify track labels');
    const timelineLabel = await page.locator('text=TIMELINE').isVisible();
    const videoLabel = await page.locator('text=VIDEO').isVisible();
    console.log(`   TIMELINE label: ${timelineLabel ? '✅' : '❌'}`);
    console.log(`   VIDEO label: ${videoLabel ? '✅' : '❌'}\n`);

    // Test 6: Zoom controls functionality
    console.log('🧪 Test 6: Test zoom controls functionality');
    const initialZoom = await page.locator('text=/\\d+%/').first().textContent();
    console.log(`   Initial zoom: ${initialZoom}`);

    await page.locator('button svg.lucide-zoom-in').first().click();
    await page.waitForTimeout(500);
    const zoomedIn = await page.locator('text=/\\d+%/').first().textContent();
    console.log(`   After zoom in: ${zoomedIn}`);

    await page.locator('button svg.lucide-zoom-out').first().click();
    await page.waitForTimeout(500);
    const zoomedOut = await page.locator('text=/\\d+%/').first().textContent();
    console.log(`   After zoom out: ${zoomedOut}`);
    console.log(initialZoom !== zoomedIn ? '   ✅ PASS: Zoom controls work\n' : '   ❌ FAIL: Zoom not changing\n');

    // Test 7: Transport controls clickable
    console.log('🧪 Test 7: Test transport controls are clickable');
    await page.locator('button svg.lucide-play').first().click();
    await page.waitForTimeout(200);
    const pauseButton = await page.locator('button svg.lucide-pause').first().isVisible();
    console.log(pauseButton ? '   ✅ PASS: Play/Pause toggle works\n' : '   ❌ FAIL: Play/Pause not toggling\n');

    // Pause it back
    if (pauseButton) {
      await page.locator('button svg.lucide-pause').first().click();
    }

    // Test 8: Check for playhead element
    console.log('🧪 Test 8: Verify playhead exists');
    const playhead = await page.locator('.bg-red-500').first().isVisible();
    console.log(playhead ? '   ✅ PASS: Playhead visible\n' : '   ❌ FAIL: Playhead not found\n');

    // Test 9: Check timeline drop zone
    console.log('🧪 Test 9: Verify timeline drop zone exists');
    const dropZoneText = await page.locator('text="Drag media files here to build your slideshow"').isVisible();
    console.log(dropZoneText ? '   ✅ PASS: Drop zone message visible\n' : '   ⚠️  INFO: Drop zone may have clips already\n');

    // Test 10: Verify dark theme
    console.log('🧪 Test 10: Verify professional dark theme');
    const darkBg = await page.locator('.bg-gray-900').first().isVisible();
    const timelineBg = await page.locator('.bg-gray-800').first().isVisible();
    console.log(`   Dark background (gray-900): ${darkBg ? '✅' : '❌'}`);
    console.log(`   Timeline background (gray-800): ${timelineBg ? '✅' : '❌'}\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ Timeline UI Tests Complete!');
    console.log('═══════════════════════════════════════\n');

    // Take a screenshot for verification
    console.log('📸 Taking screenshot of timeline...');
    await page.screenshot({
      path: '/Users/ekodevapps/Desktop/SlideShow/timeline-test-screenshot.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: timeline-test-screenshot.png\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    await page.screenshot({ path: '/Users/ekodevapps/Desktop/SlideShow/error-screenshot.png' });
    console.log('📸 Error screenshot saved: error-screenshot.png');
  } finally {
    await browser.close();
    console.log('🏁 Test session closed');
  }
}

testTimeline().catch(console.error);
