import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = 'C:\\Users\\masou\\.gemini\\antigravity-ide\\brain\\443c4fe3-c732-49e1-89ef-0571657763a5\\screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runQA() {
  console.log('🚀 Starting Comprehensive Playwright UI/UX QA Suite...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'desktop-1024', width: 1024, height: 768 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-375', width: 375, height: 667 },
    { name: 'mobile-360', width: 360, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: 'en-US',
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Capture Base Homepage
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${vp.name}-homepage.png`),
      fullPage: false,
    });
    console.log(`  ✓ Captured ${vp.name} Homepage`);

    if (vp.name === 'desktop-1440') {
      // 1. Search Auto-complete
      const searchInput = page.locator('#global-part-search-input');
      if (await searchInput.isVisible()) {
        await searchInput.click();
        await searchInput.fill('Brake');
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-1440-autocomplete.png`),
        });
        console.log(`  ✓ Captured Auto-complete Suggestions`);
        await searchInput.fill('');
      }

      // 2. Open Progressive Vehicle Selector
      const vehiclePill = page.locator('#hero-vehicle-select-btn, #navbar-active-vehicle-pill').first();
      if (await vehiclePill.isVisible()) {
        await vehiclePill.click();
        await page.waitForTimeout(700);

        // Capture step (Model selection for default Toyota)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-1440-vehicle-selector-step2-model.png`),
        });
        console.log(`  ✓ Captured Vehicle Selector Step 2 (Model)`);

        // Select Camry
        const camryBtn = page.locator('[data-testid="model-btn-Camry"]').first();
        if (await camryBtn.isVisible()) {
          await camryBtn.click();
          await page.waitForTimeout(500);

          // Capture Step 3 (Year)
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `desktop-1440-vehicle-selector-step3-year.png`),
          });
          console.log(`  ✓ Captured Vehicle Selector Step 3 (Year)`);

          // Select 2022
          const yearBtn = page.locator('[data-testid="year-btn-2022"]').first();
          if (await yearBtn.isVisible()) {
            await yearBtn.click();
            await page.waitForTimeout(500);

            // Capture Step 4 (Engine)
            await page.screenshot({
              path: path.join(SCREENSHOT_DIR, `desktop-1440-vehicle-selector-step4-engine.png`),
            });
            console.log(`  ✓ Captured Vehicle Selector Step 4 (Engine)`);

            // Confirm
            const confirmBtn = page.locator('#btn-confirm-vehicle').first();
            if (await confirmBtn.isVisible()) {
              await confirmBtn.click();
              await page.waitForTimeout(800);
            }
          }
        }
      }

      // 3. Captured updated results with Camry fitment
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `desktop-1440-camry-fitment-results.png`),
      });
      console.log(`  ✓ Captured Camry Fitment Results`);

      // 4. Open Part Details Modal
      const firstCard = page.locator('[id^="master-part-card-"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-1440-part-details-modal.png`),
        });
        console.log(`  ✓ Captured Part Details Modal`);

        // Add to Order CTA
        const addBtn = page.locator('#add-part-to-cart-cta').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
          await page.waitForTimeout(600);
        } else {
          const closeBtn = page.locator('#close-part-detail-btn').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(400);
          }
        }
      }

      // 5. Open Shopping Cart & Checkout Modal
      const cartBtn = page.locator('#navbar-cart-btn').first();
      if (await cartBtn.isVisible()) {
        await cartBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-1440-cart-checkout-modal.png`),
        });
        console.log(`  ✓ Captured Cart & Checkout Modal`);

        const closeBtn = page.locator('button:has(svg.lucide-x)').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(400);
        }
      }

      // 6. Open Sanawia OCR Modal
      const ocrBtn = page.locator('#hero-upload-sanawia-btn').first();
      if (await ocrBtn.isVisible()) {
        await ocrBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-1440-sanawia-ocr-modal.png`),
        });
        console.log(`  ✓ Captured Sanawia OCR Modal`);

        const closeBtn = page.locator('button:has(svg.lucide-x)').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(400);
        }
      }

      // 7. Open Request Part (RFQ) Modal
      const rfqBtn = page.locator('#hero-request-quote-btn').first();
      if (await rfqBtn.isVisible()) {
        await rfqBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `desktop-1440-rfq-request-modal.png`),
        });
        console.log(`  ✓ Captured Request Part RFQ Modal`);

        const closeBtn = page.locator('button:has(svg.lucide-x)').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(400);
        }
      }

      // 8. Dealer Business Portal Switch
      const profileBtn = page.locator('#navbar-profile-btn').first();
      if (await profileBtn.isVisible()) {
        await profileBtn.click();
        await page.waitForTimeout(400);
        const dealerLink = page.locator('button:has-text("Dealer Business Portal")').first();
        if (await dealerLink.isVisible()) {
          await dealerLink.click();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `desktop-1440-dealer-portal.png`),
          });
          console.log(`  ✓ Captured Dealer Business Portal`);
        }

        // Switch to Admin Portal
        const profileBtn2 = page.locator('#navbar-profile-btn').first();
        if (await profileBtn2.isVisible()) {
          await profileBtn2.click();
          await page.waitForTimeout(400);
          const adminLink = page.locator('button:has-text("Admin Security Center")').first();
          if (await adminLink.isVisible()) {
            await adminLink.click();
            await page.waitForTimeout(1000);
            await page.screenshot({
              path: path.join(SCREENSHOT_DIR, `desktop-1440-admin-security-center.png`),
            });
            console.log(`  ✓ Captured Admin Security Center`);
          }
        }
      }

      // 9. Arabic Native RTL Deep Test
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      const langBtn = page.locator('#btn-language-switcher').first();
      if (await langBtn.isVisible()) {
        await langBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `arabic-rtl-homepage.png`),
        });
        console.log(`  ✓ Captured Arabic RTL Native Homepage`);

        // Open Part Detail in Arabic
        const firstCardAr = page.locator('[id^="master-part-card-"]').first();
        if (await firstCardAr.isVisible()) {
          await firstCardAr.click();
          await page.waitForTimeout(800);
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `arabic-rtl-part-details.png`),
          });
          console.log(`  ✓ Captured Arabic RTL Part Details Modal`);
        }
      }
    }

    if (vp.name === 'mobile-390') {
      // Mobile Vehicle Selector
      const vehiclePill = page.locator('#hero-vehicle-select-btn').first();
      if (await vehiclePill.isVisible()) {
        await vehiclePill.click();
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `mobile-390-vehicle-selector.png`),
        });
        console.log(`  ✓ Captured Mobile 390px Vehicle Selector`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\n🎉 Comprehensive Playwright UI/UX QA completed successfully!');
}

runQA().catch(err => {
  console.error('QA Script Error:', err);
  process.exit(1);
});
