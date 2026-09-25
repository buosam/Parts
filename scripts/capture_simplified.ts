import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  // Desktop
  const pDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pDesktop.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pDesktop.waitForTimeout(800);
  await pDesktop.screenshot({ path: 'C:/Users/masou/.gemini/antigravity-ide/brain/443c4fe3-c732-49e1-89ef-0571657763a5/screenshots/simplified-desktop-1440.png' });
  await pDesktop.close();

  // Mobile
  const pMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pMobile.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pMobile.waitForTimeout(800);
  await pMobile.screenshot({ path: 'C:/Users/masou/.gemini/antigravity-ide/brain/443c4fe3-c732-49e1-89ef-0571657763a5/screenshots/simplified-mobile-390.png' });
  await pMobile.close();

  // Arabic Desktop
  const pAr = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pAr.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pAr.evaluate(() => localStorage.setItem('sp_language', 'ar'));
  await pAr.reload({ waitUntil: 'networkidle' });
  await pAr.waitForTimeout(800);
  await pAr.screenshot({ path: 'C:/Users/masou/.gemini/antigravity-ide/brain/443c4fe3-c732-49e1-89ef-0571657763a5/screenshots/simplified-arabic-1440.png' });
  await pAr.close();

  await browser.close();
  console.log('✓ All simplified screenshots captured!');
}

run().catch(console.error);
