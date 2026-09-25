import { chromium } from 'playwright';
import * as path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\masou\\.gemini\\antigravity-ide\\brain\\443c4fe3-c732-49e1-89ef-0571657763a5\\screenshots';

async function runDeepPortalsQA() {
  console.log('🚀 Running Deep Portals QA for Dealer, Admin, RFQ, and Arabic...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. RFQ Request Modal
  const rfqBtn = page.locator('#hero-cant-find-part-btn').first();
  if (await rfqBtn.isVisible()) {
    await rfqBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-1440-rfq-modal.png') });
    console.log('  ✓ Captured RFQ Modal');
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 2. Dealer Portal
  await page.evaluate(() => {
    const dealerUser = {
      id: 'sup-1',
      name: 'Mustafa Al-Mansour',
      email: 'dealer@iqautomarket.iq',
      role: 'supplier',
      companyName: 'Al-Mansour Automotive Group',
      city: 'Baghdad',
    };
    localStorage.setItem('sp_current_user', JSON.stringify(dealerUser));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const profileBtn = page.locator('#navbar-profile-btn').first();
  if (await profileBtn.isVisible()) {
    await profileBtn.click();
    await page.waitForTimeout(400);
    const dealerLink = page.locator('button:has-text("Dealer Business Portal")').first();
    if (await dealerLink.isVisible()) {
      await dealerLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-1440-dealer-portal.png') });
      console.log('  ✓ Captured Dealer Business Portal');
    }
  }

  // 3. Admin Security Center
  await page.evaluate(() => {
    const adminUser = {
      id: 'adm-1',
      name: 'Governance Admin',
      email: 'security@iqautomarket.iq',
      role: 'admin',
    };
    localStorage.setItem('sp_current_user', JSON.stringify(adminUser));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const profileBtn2 = page.locator('#navbar-profile-btn').first();
  if (await profileBtn2.isVisible()) {
    await profileBtn2.click();
    await page.waitForTimeout(400);
    const adminLink = page.locator('button:has-text("Platform Administration")').first();
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-1440-admin-security-center.png') });
      console.log('  ✓ Captured Admin Security Center');
    }
  }

  // 4. Return to Buyer and Toggle Arabic RTL Part Details
  await page.evaluate(() => {
    const buyerUser = {
      id: 'cust-1',
      name: 'Ahmed Al-Tikriti',
      email: 'ahmed@iqautomarket.iq',
      role: 'customer',
    };
    localStorage.setItem('sp_current_user', JSON.stringify(buyerUser));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const langBtn = page.locator('#btn-language-switcher').first();
  if (await langBtn.isVisible()) {
    await langBtn.click();
    await page.waitForTimeout(800);
    const firstCardAr = page.locator('[id^="master-part-card-"]').first();
    if (await firstCardAr.isVisible()) {
      await firstCardAr.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'arabic-rtl-part-details.png') });
      console.log('  ✓ Captured Arabic RTL Part Details Modal');
    }
  }

  await browser.close();
  console.log('🎉 Deep Portals QA complete!');
}

runDeepPortalsQA().catch(e => {
  console.error(e);
  process.exit(1);
});
