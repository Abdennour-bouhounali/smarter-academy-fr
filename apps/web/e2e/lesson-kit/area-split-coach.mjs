// QA — `area-split` LabCoach: the bubble NEVER covers the working area (the scene, the cards / reduce block, the written line).
//   KIT_BASE=http://localhost:4173 node apps/web/e2e/lesson-kit/area-split-coach.mjs
// Real pages `…/nashr-jabri-3am/nashat` (plot) and `…/tariqa` (arrows), coach ON, lab scrolled to the top of the viewport, five sizes;
// at the first step and after a first gesture. Needs the API on 8000 (teacher account, as the other lesson-kit scripts).
import { chromium } from 'playwright';

const BASE = process.env.KIT_BASE || 'http://localhost:4173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/nashr-jabri-3am';
const SIZES = [[768, 1024], [1024, 768], [1280, 800], [1366, 768], [1920, 1080]];
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };
const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: process.env.QA_PASSWORD || 'QaPass2026!' }) });
const data = await res.json();
const token = data.token ?? data.access_token ?? data.data?.token;
const browser = await chromium.launch();
for (const [w, h] of SIZES) {
  for (const mod of ['nashat', 'tariqa']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'ar' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
    const page = await ctx.newPage();
    await page.goto(`${BASE}${CH}/${mod}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-area-split]', { timeout: 40000 });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    for (const stage of ['first', 'second']) {
      if (stage === 'second') {
        if (mod === 'nashat') { const k = page.locator('[data-as-cut="w"]').first(); const b = await k.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(200); await page.locator('[data-as-tick]').nth(3).click({ force: true }).catch(() => {}); }
        else { await page.locator('[data-as-origin="0"]').first().click(); await page.locator('[data-as-target="0"]').first().click(); }
        await page.waitForTimeout(500);
      }
      await page.evaluate(() => { document.querySelector('[data-as-glance]').scrollIntoView({ block: 'start' }); window.scrollBy(0, -8); });
      await page.waitForTimeout(700);
      const r = await page.evaluate(() => {
        const rect = (el) => { const b = el?.getBoundingClientRect(); return b ? { l: b.left, t: b.top, r: b.right, b: b.bottom } : null; };
        const bubble = rect(document.querySelector('[data-lab-coach]'));
        const work = ['[data-as-yard]', '[data-as-expr]', '[data-as-cards]', '[data-as-cards-wait]', '[data-as-reduce]', '[data-as-line]'].map((s) => [s, rect(document.querySelector(s))]).filter(([, b]) => b);
        return { bubble, work, step: document.querySelector('[data-lab-coach]')?.dataset.step };
      });
      if (!r.bubble) { console.log(`· ${mod} ${w}×${h} ${stage}: no bubble (step done)`); continue; }
      for (const [sel, b] of r.work) {
        const hit = r.bubble.l < b.r && b.l < r.bubble.r && r.bubble.t < b.b && b.t < r.bubble.b;
        check(!hit, `${mod} ${w}×${h} ${stage} (${r.step}): the bubble does not cover ${sel}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
if (failures.length) { console.log(`\n${failures.length} failure(s)`); process.exit(1); }
