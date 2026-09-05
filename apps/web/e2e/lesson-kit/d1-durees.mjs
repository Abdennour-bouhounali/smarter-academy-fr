// Smoke test for the from-scratch durees lesson.
// Run: node apps/web/e2e/lesson-kit/d1-durees.mjs   (dev server on :5188, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5188';
const LESSON = `${BASE}/courses/college/6e/grandeurs_mesures/durees`;
const KEY = 'u_anon_smarter_lesson_durees';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
}
function summary() {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) { console.log('FAILED:'); fails.forEach((f) => console.log(` - ${f.name} ${f.detail}`)); }
  return fails.length;
}

function seedArgs(key, completedModules) {
  return { key, completedModules };
}
function seedInit({ key, completedModules }) {
  localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] }));
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const errs = [];
  const watchErrors = (page) => {
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const t = msg.text();
      if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
      errs.push(`console: ${t}`);
    });
    page.on('pageerror', (err) => errs.push(`pageerror: ${err.message}`));
  };

  // ── Index + module 0 ─────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.goto(LESSON, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    check('index loads', (await page.locator('text=Durées').count()) > 0);
    await page.goto(`${LESSON}/mission-de-depart`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const opts = page.locator('div[role="group"] > button[aria-pressed]');
    const n = await opts.count();
    for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 2000 }).catch(() => {});
    const submitBtn = page.locator('button:has-text("Voir mon résultat")');
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(400);
    }
    check('diagnostic reaches result without blocking', (await page.locator('text=/\\/ 10/').count()) > 0);
    await ctx.close();
  }

  // ── Module 1 — header + decimal-time trap ────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0']));
    await page.goto(`${LESSON}/la-course-contre-la-montre`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    check('module1 header shows "Module 1 / 8"', /Module\s*1\s*\/\s*8/.test(body));
    check('module1 no NaN', !body.includes('NaN'));
    await ctx.close();
  }

  // ── Module 2 — ClockFace read + set ──────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1']));
    await page.goto(`${LESSON}/lire-l-heure`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    check('module2 clock renders', (await page.locator('svg[role="img"][aria-label*="Horloge"]').count()) >= 1);
    // Answer both reading MCQs
    await page.locator('div[role="group"] > button', { hasText: /^9 h 15$/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    await page.locator('div[role="group"] > button', { hasText: /^9 h 47$/ }).first().click().catch(() => {});
    await page.waitForTimeout(600);
    // Set-mode clock should now be present with its tap fallbacks
    const setClock = page.locator('svg[role="slider"]');
    check('module2 set-mode clock present', await setClock.count() > 0);
    check('module2 tap fallback buttons present', (await page.locator('button', { hasText: '+5 min' }).count()) > 0);
    // Drive to 16 h 30 using the bump buttons (from 15 h 00: +1h, then +5min ×6)
    await page.locator('button', { hasText: '+1 h' }).first().click().catch(() => {});
    await page.waitForTimeout(150);
    for (let i = 0; i < 6; i += 1) {
      await page.locator('button', { hasText: '+5 min' }).first().click().catch(() => {});
      await page.waitForTimeout(120);
    }
    await page.locator('button:has-text("C\'est réglé")').first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body2 = await page.textContent('body');
    check('module2 clock set to 16 h 30 validated', body2.includes('Parfaitement réglé'));
    await page.screenshot({ path: `${SHOT_DIR}durees-m2-clock.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 3 — full-turn discovery of 1 h = 60 min ───────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2']));
    await page.goto(`${LESSON}/le-secret-du-60`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Advance the minute hand a full turn: 12 × +5 min
    for (let i = 0; i < 12; i += 1) {
      await page.locator('button', { hasText: '+5 min' }).first().click().catch(() => {});
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module3 full turn reveals 1 h = 60 min', body.includes('1 h = 60 min'));
    await page.screenshot({ path: `${SHOT_DIR}durees-m3-tour.png` }).catch(() => {});
    check('module3 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Module 5 — méthode des sauts ─────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4']));
    await page.goto(`${LESSON}/la-methode-des-sauts`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    check('module5 duration line renders', (await page.locator('svg[role="img"][aria-label*="Ligne du temps"]').count()) > 0);
    // Tap the three hops in order
    for (const label of ['+ 13 min', '+ 2 h', '+ 15 min']) {
      await page.locator('button', { hasText: label }).first().click().catch(() => {});
      await page.waitForTimeout(400);
    }
    const body = await page.textContent('body');
    check('module5 three hops built', body.includes('Trois sauts'));
    await page.screenshot({ path: `${SHOT_DIR}durees-m5-sauts.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 6 quick load ──────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5']));
    await page.goto(`${LESSON}/missions-horaires`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const b6 = await page.textContent('body');
    check('module6 missions load', b6.includes('Le train du tournoi'));
    await ctx.close();
  }

  // ── Module 7 — Boss ──────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5', '6']));
    await page.goto(`${LESSON}/le-grand-voyage`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const bossOpts = page.locator('div[role="group"] > button[aria-pressed]');
    const bossCount = await bossOpts.count();
    check('module7 boss renders 10 épreuves silently', bossCount >= 10);
    for (let i = 0; i < bossCount; i += 1) await bossOpts.nth(i).click().catch(() => {});
    const validateBtn = page.locator('button:has-text("Valider mes")');
    if (await validateBtn.isEnabled().catch(() => false)) {
      await validateBtn.click();
      await page.waitForTimeout(600);
      const bodyBoss = await page.textContent('body');
      check('module7 review shows a score', /\/\s*10/.test(bodyBoss));
      check('module7 Terminer appears', bodyBoss.includes('Terminer'));
    }
    await page.screenshot({ path: `${SHOT_DIR}durees-m7-boss.png` }).catch(() => {});
    await ctx.close();
  }

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
