// Smoke test for the from-scratch perimetres lesson.
// Run: node apps/web/e2e/lesson-kit/p1-perimetres.mjs   (dev server on :5188, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5188';
const LESSON = `${BASE}/courses/college/6e/grandeurs_mesures/perimetres`;
const KEY = 'u_anon_smarter_lesson_perimetres';
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
    check('index loads', (await page.locator('text=Périmètres').count()) > 0);
    check('module 0 card visible', (await page.locator('text=Mission de départ').count()) > 0);

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

  // ── Module 1 — trace-the-contour trigger ─────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0']));
    await page.goto(`${LESSON}/la-cloture-du-parc`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    check('module1 header shows "Module 1 / 8"', /Module\s*1\s*\/\s*8/.test(body));
    check('module1 polygon sides present', (await page.locator('[role="button"][aria-label*="Côté"]').count()) >= 4);
    for (let i = 1; i <= 4; i += 1) {
      await page.locator(`[role="button"][aria-label*="Côté ${i}"]`).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(250);
    }
    const body2 = await page.textContent('body');
    check('module1 trace completes and names the concept', body2.includes('périmètre'));
    await page.screenshot({ path: `${SHOT_DIR}perim-m1-trace.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 2 — irregular pentagon via vertices prop ──────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1']));
    await page.goto(`${LESSON}/le-tour-complet`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Step 1 triangle: 3 sides
    for (let i = 1; i <= 3; i += 1) {
      await page.locator(`[role="button"][aria-label*="Côté ${i}"]`).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(400);
    // Step 2 pentagon should now be unlocked: 5 sides (second polygon on the page)
    const sideCount = await page.locator('[role="button"][aria-label*="Côté"]').count();
    check('module2 pentagon appears after triangle (>= 8 sides total)', sideCount >= 8);
    await ctx.close();
  }

  // ── Module 3 — FormulaBuilder ────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2']));
    await page.goto(`${LESSON}/les-formules-magiques`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Trace the rectangle's 4 sides to unlock the equal-sides MCQ
    for (let i = 1; i <= 4; i += 1) {
      await page.locator(`[role="button"][aria-label*="Côté ${i}"]`).first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(300);
    await page.locator('button[aria-pressed]', { hasText: 'Les côtés opposés sont égaux' }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    // FormulaBuilder chips appear (step 2)
    const chip2 = page.locator('button[aria-label="Placer 2"]').first();
    check('module3 formula chips present', await chip2.isVisible().catch(() => false));
    // Build P = 2 × ( L + l )
    for (const label of ['2', '×', '(', 'L', '+', 'l', ')']) {
      await page.locator(`button[aria-label="Placer ${label}"]`).first().click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    check('module3 rectangle formula validated', body.includes('P = 2 × (L + l)'));
    await page.screenshot({ path: `${SHOT_DIR}perim-m3-formula.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 4 — CircleUnroller with prediction ────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3']));
    await page.goto(`${LESSON}/le-tour-du-cercle`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Predict "un peu plus de 3"
    await page.locator('button', { hasText: 'Un peu plus de 3 diamètres' }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    const rollBtn = page.locator('button:has-text("Faire rouler")');
    check('module4 roll button appears after prediction', await rollBtn.isVisible().catch(() => false));
    for (let i = 0; i < 3; i += 1) {
      await page.locator('button', { hasText: /Faire rouler|Finir le tour/ }).first().click().catch(() => {});
      await page.waitForTimeout(900);
    }
    await page.locator('button', { hasText: /Finir le tour/ }).first().click().catch(() => {});
    await page.waitForTimeout(900);
    const body = await page.textContent('body');
    check('module4 π discovered after rolling', body.includes('3,14'));
    await page.screenshot({ path: `${SHOT_DIR}perim-m4-unroll.png` }).catch(() => {});
    check('module4 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Module 5 + 6 quick loads ─────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4']));
    await page.goto(`${LESSON}/les-bons-reflexes`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const b5 = await page.textContent('body');
    check('module5 unit-choice batch present', b5.includes('À chaque tour, son unité'));
    await ctx.close();

    // Module 6 needs module 5 seeded complete (sequential unlock).
    const ctx6 = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page6 = await ctx6.newPage();
    watchErrors(page6);
    await page6.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5']));
    await page6.goto(`${LESSON}/ateliers-du-geometre`, { waitUntil: 'domcontentloaded' });
    await page6.waitForTimeout(1200);
    const b6 = await page6.textContent('body');
    check('module6 ateliers load with AnswerBuilder', b6.includes('Résultat et unité'));
    check('modules 5-6 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx6.close();
  }

  // ── Module 7 — Boss ──────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5', '6']));
    await page.goto(`${LESSON}/le-parc-a-amenager`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const bossOpts = page.locator('div[role="group"] > button[aria-pressed]');
    const bossCount = await bossOpts.count();
    check('module7 boss renders 10 épreuves silently', bossCount >= 10);
    for (let i = 0; i < bossCount; i += 1) await bossOpts.nth(i).click().catch(() => {});
    const validateBtn = page.locator('button:has-text("Valider mes")');
    check('module7 validate button present', await validateBtn.isVisible().catch(() => false));
    if (await validateBtn.isEnabled().catch(() => false)) {
      await validateBtn.click();
      await page.waitForTimeout(600);
      const bodyBoss = await page.textContent('body');
      check('module7 review shows a score', /\/\s*10/.test(bodyBoss));
      check('module7 Terminer appears on last module', bodyBoss.includes('Terminer'));
    }
    await page.screenshot({ path: `${SHOT_DIR}perim-m7-boss.png` }).catch(() => {});
    await ctx.close();
  }

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
