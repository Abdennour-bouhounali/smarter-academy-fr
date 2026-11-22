// Math Lab — solutions pas à pas (MATH_LAB.md §3.4.1), vérifiées dans un vrai navigateur
// sur les routes enseignant (qa-prof@smarter.dz), à 1280 et 390 px. Vite sur 5173, API sur 8000.
// Lancement : node apps/web/e2e/mathlab-step-reveal.mjs — captures dans /tmp/mathlab-steps-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = process.env.QA_OUT || '/tmp/mathlab-steps-qa';
mkdirSync(OUT, { recursive: true });
const res = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: 'qa-prof@smarter.dz', password: 'QaPass2026!' }) });
const d = await res.json(); const token = d.token ?? d.data?.token;
const browser = await chromium.launch();
let ok = 0, ko = 0;
const check = (c, l) => { if (c) ok++; else { ko++; console.log('  ✗', l); } };
for (const vp of [{ width: 1280, height: 800, n: 'd' }, { width: 390, height: 844, n: 'm', touch: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch, locale: 'ar-DZ' });
  await ctx.addInitScript((tk) => { localStorage.setItem('token', tk); localStorage.removeItem('sa-ml-step-player'); }, token);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:5173/enseignant/atelier/algebre?lab=secondaire', { waitUntil: 'networkidle' });
  const innerScrollers = () => page.evaluate(() => [...document.querySelectorAll('[data-ml-algebra] *, [data-ml-alg-section] *')].filter((e) => {
    const cs = getComputedStyle(e); const o = cs.overflowX + cs.overflowY;
    return /auto|scroll/.test(o) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
      && !/sa-ml-alg__stage|panel-body|kit-nav__scroller|^sa-ml-alg$/.test(e.className.toString().trim());
  }).map((e) => e.className.toString().slice(0, 40)));
  async function walk(name, prefix = 'data-ml-alg-step') {
    let i = 0;
    check(await page.locator(`[${prefix}-player]`).count() > 0, `${name}: player shown`);
    await page.screenshot({ path: `${OUT}/${vp.n}-${name}-00.png` });
    for (; i < 40; i++) {
      const next = page.locator(`[${prefix}-next]`).first();
      if (!(await next.count()) || await next.isDisabled()) break;
      await next.click(); await page.waitForTimeout(650);
      if (i < 14) await page.screenshot({ path: `${OUT}/${vp.n}-${name}-${String(i + 1).padStart(2, '0')}.png` });
      const sc = await innerScrollers();
      if (sc.length) check(false, `${name} step ${i + 1}: inner scroller ${sc.join(',')}`);
    }
    return i;
  }
  // 1. Equation
  await page.fill('[data-ml-equation-input]', '2x + 3 = 9'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  check(await page.locator('[data-ml-solution]').count() === 0, 'eq: no answer before');
  await page.locator('[data-ml-alg-solve]').first().click(); await page.waitForTimeout(500);
  const tones = await page.locator('[data-mb-tone="selected"]').allInnerTexts();
  check(tones.length > 0, `eq: first tap designates a token (${tones.join('|')})`);
  // sticky: scroll stage to bottom, player still visible
  await page.evaluate(() => { for (const st of document.querySelectorAll('.sa-ml-alg__stage, .sa-ml-alg')) st.scrollTop = st.scrollHeight / 2; });
  await page.waitForTimeout(200);
  const pb = await page.locator('[data-ml-alg-step-player]').first().boundingBox();
  check(pb && pb.y >= 0 && pb.y < vp.height, `eq: sticky player visible after scroll (y=${pb?.y})`);
  await page.evaluate(() => { for (const st of document.querySelectorAll('.sa-ml-alg__stage, .sa-ml-alg')) st.scrollTop = 0; });
  const n1 = await walk('equation');
  const sol = await page.locator('[data-ml-solution]').innerText().catch(() => '');
  check(sol.includes('3'), `eq: final x = 3 (${sol.replace(/\s+/g, ' ')}) after ${n1} clicks`);
  // 2. Inequality
  await page.locator('[data-ml-alg-tab="inequalities"]').evaluate((el) => el.click()); await page.waitForTimeout(400);
  await page.fill('[data-ml-equation-input]', '-2x < 6'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await page.locator('[data-ml-alg-solve]').first().click(); await page.waitForTimeout(400);
  let sawWarning = false;
  for (let i = 0; i < 30; i++) {
    if (await page.locator('[data-mb-tone="warning"]').count()) { sawWarning = true; await page.screenshot({ path: `${OUT}/${vp.n}-ineq-flip.png` }); }
    const next = page.locator('[data-ml-alg-step-next]').first();
    if (!(await next.count()) || await next.isDisabled()) break;
    await next.click(); await page.waitForTimeout(500);
  }
  check(sawWarning, 'ineq: sign flip shown as warning token');
  await page.screenshot({ path: `${OUT}/${vp.n}-ineq-final.png`, fullPage: true });
  // 3. Factor
  await page.locator('[data-ml-alg-tab="factor"]').evaluate((el) => el.click()); await page.waitForTimeout(400);
  await page.fill('[data-ml-alg-factor-input]', 'x^2 + 5x + 6');
  await page.click('[data-ml-alg-factor-run]'); await page.waitForTimeout(500);
  check((await page.locator('[data-ml-alg-board]').first().innerText()).indexOf('(x+2)') === -1, 'factor: no factorisation at first frame');
  await walk('factor');
  // 4. Systems elimination
  await page.locator('[data-ml-alg-tab="systems"]').evaluate((el) => el.click()); await page.waitForTimeout(400);
  const elim = page.locator('[data-ml-alg-method="elimination"]').first(); if (await elim.count()) await elim.evaluate((el) => el.click());
  await page.click('[data-ml-alg-system-run]'); await page.waitForTimeout(400);
  await walk('systems');
  // 5. Simplify
  await page.locator('[data-ml-alg-tab="simplify"]').evaluate((el) => el.click()); await page.waitForTimeout(400);
  await page.fill('[data-ml-alg-simplify-input]', '3x + 2(x + 4) - x');
  await page.click('[data-ml-alg-simplify-run]'); await page.waitForTimeout(400);
  await walk('simplify');
  // auto mode + mode switch preserves
  await page.click('[data-ml-alg-step-restart]').catch(() => {});
  await page.waitForTimeout(300);
  await page.click('[data-ml-alg-step-mode="auto"]'); await page.waitForTimeout(2600);
  const posAuto = await page.locator('[data-ml-alg-step-position]').first().getAttribute('data-ml-alg-step-position');
  await page.click('[data-ml-alg-step-mode="manual"]'); await page.waitForTimeout(1500);
  const posManual = await page.locator('[data-ml-alg-step-position]').first().getAttribute('data-ml-alg-step-position');
  check(posAuto === posManual && posAuto !== '1/' , `auto advanced then manual kept step (${posAuto} → ${posManual})`);
  check(errs.length === 0, `no page errors ${errs.slice(0, 2).join(' | ')}`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `no page overflow (${overflow})`);
  await ctx.close();
}
await browser.close();
console.log(`${ok} ✓ · ${ko} ✗`);
