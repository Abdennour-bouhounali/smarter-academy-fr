import { chromium } from 'playwright';
const [B, TOKEN, PATH, OUT] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 1400 }, isMobile: true });
await ctx.addInitScript((t) => localStorage.setItem('token', t), TOKEN);
const p = await ctx.newPage(); await p.goto(`${B}/enseignant/pratique/${PATH}`);
await p.waitForSelector('[data-exam-sheet]'); await p.waitForTimeout(800);
const start = p.getByRole('button', { name: /ابدأ/ });
if (await start.count()) { await start.first().click(); await p.waitForTimeout(1500); }
await p.waitForSelector('math-field', { timeout: 15000 }); await p.waitForTimeout(800);
console.log(await p.evaluate(() => {
  const W = innerWidth; const out = [`scrollWidth=${document.documentElement.scrollWidth}`];
  for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if ((r.right > W + 1 || r.left < -1) && r.width > 0) out.push(`${e.tagName}.${String(e.className).slice(0, 50)} [${Math.round(r.left)}..${Math.round(r.right)}] ${[...e.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name).join(',')}`); }
  return out.slice(0, 12).join('\n');
}));
const box = p.locator('[data-answer-box]').first(); await box.screenshot({ path: OUT });
await b.close();
