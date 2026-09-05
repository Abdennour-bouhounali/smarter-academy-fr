// Smoke test for the from-scratch angles lesson.
// Run: node apps/web/e2e/lesson-kit/g1-angles.mjs   (dev server on :5188, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5188';
const LESSON = `${BASE}/courses/college/6e/grandeurs_mesures/angles`;
const KEY = 'u_anon_smarter_lesson_angles';
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
    check('index loads', (await page.locator('text=Angles').count()) > 0);
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

  // ── Module 1 — open the door (AngleFigure interactive) ───────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0']));
    await page.goto(`${LESSON}/l-ouverture`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const body0 = await page.textContent('body');
    check('module1 header shows "Module 1 / 8"', /Module\s*1\s*\/\s*8/.test(body0));
    check('module1 interactive angle present', (await page.locator('svg[role="slider"]').count()) > 0);
    // Open the door from 20° to >= 90° with +10° taps
    for (let i = 0; i < 8; i += 1) {
      await page.locator('button', { hasText: '+ 10°' }).first().click().catch(() => {});
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    check('module1 opening reveals the concept', body.includes('écartement'));
    await page.screenshot({ path: `${SHOT_DIR}angles-m1-porte.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 2 — superpose + classify ──────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1']));
    await page.goto(`${LESSON}/comparer-et-classer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.locator('button:has-text("Superposer")').first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module2 superposition reveals the comparison question', body.includes('superposés'));
    await ctx.close();
  }

  // ── Module 3 — protractor placement ritual + reading ─────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2']));
    await page.goto(`${LESSON}/le-rapporteur`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    check('module3 protractor renders', (await page.locator('svg[role="img"][aria-label*="Rapporteur"]').count()) > 0);
    await page.locator('button', { hasText: 'Centre sur le sommet' }).first().click().catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('button', { hasText: 'Zéro sur un côté' }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module3 placement ritual completes', body.includes('deux gestes du rapporteur'));
    // Protractor tick hit-areas are fill="transparent" — assert by count, click forced.
    check('module3 graduation hit-areas present', (await page.locator('[role="button"][aria-label*="Graduation"]').count()) >= 15);
    const readProtractor = page.locator('svg[role="img"][aria-label*="Rapporteur"]').last();
    await readProtractor.locator('[role="button"][aria-label^="Graduation 60"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    const body2 = await page.textContent('body');
    check('module3 double-graduation picker appears', body2.includes('60°') && body2.includes('120°'));
    await page.screenshot({ path: `${SHOT_DIR}angles-m3-picker.png` }).catch(() => {});
    // Pick the correct one from the bubble
    await page.locator('button', { hasText: /^60°$/ }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body3 = await page.textContent('body');
    check('module3 reading validated', body3.includes('Bien lu'));
    await ctx.close();
  }

  // ── Module 4 — the double-graduation trap ────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3']));
    await page.goto(`${LESSON}/la-bonne-graduation`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.locator('[role="button"][aria-label^="Graduation 50"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    // Deliberately pick the WRONG scale — the module must explain, never block
    await page.locator('button', { hasText: /^130°$/ }).first().click().catch(() => {});
    await page.waitForTimeout(600);
    const body = await page.textContent('body');
    check('module4 wrong scale explained, not blocked', body.includes('c\'est l\'AUTRE graduation') || body.includes('AUTRE graduation'));
    check('module4 reflex question unlocked anyway', body.includes('aigu ou obtus'));
    check('module4 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Modules 5 & 6 quick loads ────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4']));
    await page.goto(`${LESSON}/construire-un-angle`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const b5 = await page.textContent('body');
    check('module5 construction method loads', b5.includes('quatre temps'));
    await ctx.close();

    const ctx6 = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page6 = await ctx6.newPage();
    watchErrors(page6);
    await page6.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5']));
    await page6.goto(`${LESSON}/missions-d-angles`, { waitUntil: 'domcontentloaded' });
    await page6.waitForTimeout(1200);
    const b6 = await page6.textContent('body');
    check('module6 mini-golf missions load', b6.includes('rebondit'));
    await ctx6.close();
  }

  // ── Module 7 — Boss ──────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5', '6']));
    await page.goto(`${LESSON}/l-ecole-de-pilotage`, { waitUntil: 'domcontentloaded' });
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
    await page.screenshot({ path: `${SHOT_DIR}angles-m7-boss.png` }).catch(() => {});
    await ctx.close();
  }

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
