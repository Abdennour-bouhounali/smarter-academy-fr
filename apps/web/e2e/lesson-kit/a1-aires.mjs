// Smoke test for the from-scratch aires lesson.
// Run: node apps/web/e2e/lesson-kit/a1-aires.mjs   (dev server on :5188, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5188';
const LESSON = `${BASE}/courses/college/6e/grandeurs_mesures/aires`;
const KEY = 'u_anon_smarter_lesson_aires';
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
    check('index loads', (await page.locator('text=Aires').count()) > 0);
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

  // ── Module 1 — pave both gardens ─────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0']));
    await page.goto(`${LESSON}/la-guerre-des-pelouses`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const body0 = await page.textContent('body');
    check('module1 header shows "Module 1 / 8"', /Module\s*1\s*\/\s*8/.test(body0));
    // Paint all cells of both gardens (12 + 9 = 21 buttons labelled Carreau)
    const cellsA = page.locator('[role="group"][aria-label="Jardin A"] button');
    const nA = await cellsA.count();
    for (let i = 0; i < nA; i += 1) await cellsA.nth(i).click().catch(() => {});
    const cellsB = page.locator('[role="group"][aria-label="Jardin B"] button');
    const nB = await cellsB.count();
    for (let i = 0; i < nB; i += 1) await cellsB.nth(i).click().catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module1 paving verdict names aire', body.includes('mesurer une') && body.includes('aire'));
    await page.screenshot({ path: `${SHOT_DIR}aires-m1-paver.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 2 — ShapeComposer recomposition ───────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1']));
    await page.goto(`${LESSON}/meme-contour-meme-aire`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Tap piece A (4 carreaux) then its slot; then piece B then its slot.
    await page.locator('[role="button"][aria-label*="Pièce de 4"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('[role="button"][aria-label^="Emplacement slot-A"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    await page.locator('[role="button"][aria-label*="Pièce de 2"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('[role="button"][aria-label^="Emplacement slot-B"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(600);
    const body = await page.textContent('body');
    check('module2 recomposition conserves area', body.includes('conserve'));
    await page.screenshot({ path: `${SHOT_DIR}aires-m2-composer.png` }).catch(() => {});
    check('module2 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Module 4 — row painting → L × l ──────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3']));
    await page.goto(`${LESSON}/la-formule-du-rectangle`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    for (let i = 0; i < 4; i += 1) {
      await page.locator('button', { hasText: 'Colorier une ligne' }).first().click().catch(() => {});
      await page.waitForTimeout(400);
    }
    const body = await page.textContent('body');
    check('module4 multiplication emerges from rows', body.includes('A = L × l'));
    await page.screenshot({ path: `${SHOT_DIR}aires-m4-lignes.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 5 — dm² prediction + static 10×10 ─────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4']));
    await page.goto(`${LESSON}/les-unites-d-aire`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.locator('button', { hasText: '100 carreaux' }).first().click().catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Quadriller en cm")').first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module5 ×100 discovery lands', body.includes('1 dm² = 100 cm²'));
    check('module5 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Module 6 quick load ──────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5']));
    await page.goto(`${LESSON}/chantiers-d-aires`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const b6 = await page.textContent('body');
    check('module6 chantiers load with AnswerBuilder', b6.includes('Résultat et unité'));
    await ctx.close();
  }

  // ── Module 7 — Boss ──────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5', '6']));
    await page.goto(`${LESSON}/le-chantier-de-l-ecole`, { waitUntil: 'domcontentloaded' });
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
    await page.screenshot({ path: `${SHOT_DIR}aires-m7-boss.png` }).catch(() => {});
    await ctx.close();
  }

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
