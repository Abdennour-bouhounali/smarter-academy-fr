import { chromium } from 'playwright';
const BASE = process.env.QA_BASE || 'http://localhost:5173';
const who = [{ email: 'qa-eleve@smarter.dz', password: 'QaPass2026!' }, { email: 'qa-prof@smarter.dz', password: 'QaPass2026!' }];
const browser = await chromium.launch();
let bad = 0;
for (const w of who) {
  const r = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(w) });
  const d = await r.json(); const tk = d.token ?? d.access_token ?? d.data?.token;
  if (!tk) { console.log('login failed', w.email, r.status); continue; }
  const ctx = await browser.newContext({ locale: 'ar', viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((t) => { try { localStorage.setItem('token', t); } catch {} }, tk);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  for (const slug of ['nashat', 'maarif', 'tariqa', 'atamarran', 'aadad-kabira']) {
    await page.goto(`${BASE}/courses/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-adad-tabii/${slug}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('main h1', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1200);
    // répond à toute question visible (1re option) pour montrer les briques
    for (let i = 0; i < 6; i += 1) {
      const btn = page.locator('[data-tap-option], [role=radio], button[data-option]').first();
      if (!(await btn.count())) break;
      await btn.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    const txt = await page.evaluate(() => document.body.innerText);
    const hit = txt.match(/aucun item[^\n]*/);
    console.log(w.email.split('@')[0], slug, hit ? `✗ ${hit[0]}` : '✓');
    if (hit) bad += 1;
  }
  console.log('console errors:', errs.slice(0, 5));
  await ctx.close();
}
await browser.close(); process.exit(bad ? 1 : 0);
