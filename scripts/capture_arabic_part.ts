import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('sp_current_user', JSON.stringify({ id: 'cust-1', name: 'Ahmed', role: 'customer' }));
    localStorage.setItem('sp_language', 'ar');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const card = page.locator('[id^="master-part-card-"]').first();
  if (await card.isVisible()) {
    await card.click();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: 'C:/Users/masou/.gemini/antigravity-ide/brain/443c4fe3-c732-49e1-89ef-0571657763a5/screenshots/arabic-rtl-part-details.png',
    });
    console.log('✓ Captured arabic-rtl-part-details.png successfully!');
  } else {
    console.error('Card not found in Arabic view');
  }

  await browser.close();
}

run().catch(console.error);
