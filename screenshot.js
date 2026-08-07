import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    console.log("Page loaded successfully.");
    
    // Click the referral trigger button
    console.log("Clicking Abrir Painel...");
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Abrir Painel')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    console.log("Finished waiting after click.");
  } catch (e) {
    console.log("Error loading page:", e);
  }

  await browser.close();
})();

