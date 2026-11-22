import { chromium } from 'playwright';
const [B, TOKEN, OUT, L] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const [w, h, tag] of [[1280, 900, 'desk'], [360, 780, 'mob']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500 });
  await ctx.addInitScript((t) => localStorage.setItem('token', t), TOKEN);
  const page = await ctx.newPage();
  await page.goto(`${B}/enseignant/pratique/${L}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-practice-level]', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(800);
  const hub = await page.evaluate(() => ({ cards: document.querySelectorAll('[data-practice-level]').length, pill: /محاكاة شهادة التعليم المتوسط/.test(document.body.innerText), h: document.documentElement.scrollWidth > innerWidth }));
  console.log(tag, 'hub', JSON.stringify(hub));
  await page.screenshot({ path: `${OUT}/t-hub-${tag}.png`, fullPage: true });
  for (const lvl of [1, 2, 3, 4, 5]) {
    await page.goto(`${B}/enseignant/pratique/${L}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(`[data-practice-level="${lvl}"]`, { timeout: 20000 });
    await page.locator(`[data-practice-level="${lvl}"]`).first().click();
    const ok = await page.waitForSelector('[data-exam-sheet]', { timeout: 15000 }).then(() => true).catch(() => false);
    const head = ok ? (await page.locator('#exam-sheet-heading').innerText().catch(() => '')).replace(/\s+/g, ' ') : '';
    const h = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(tag, `level ${lvl}`, ok ? 'SHEET' : 'NO-SHEET', head, h ? 'HSCROLL' : '');
    if (tag === 'desk') await page.screenshot({ path: `${OUT}/t-l${lvl}-${tag}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
