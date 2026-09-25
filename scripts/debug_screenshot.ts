import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'C:/Users/masou/.gemini/antigravity-ide/brain/443c4fe3-c732-49e1-89ef-0571657763a5/screenshots/simplified-desktop-1440.png' });
  await browser.close();
}

run().catch(console.error);
