// Smoke test for the masses kit port + manipulation-first upgrades.
// Run: node apps/web/e2e/lesson-kit/m1-masses-manipulations.mjs   (dev server on :5187, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5187';
const LESSON = `${BASE}/courses/college/6e/grandeurs_mesures/masses`;
const KEY = 'u_anon_smarter_lesson_masses';
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

  // ── Index + module 0 diagnostic ──────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.goto(LESSON, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    check('index loads', (await page.locator('text=Masses').count()) > 0);
    check('module 0 diagnostic card visible', (await page.locator('text=Mission de départ').count()) > 0);

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
    check('diagnostic reaches result screen without blocking', (await page.locator('text=/\\/ 10/').count()) > 0);
    await ctx.close();
  }

  // ── Module 1 — balance drag + header total ───────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0']));
    await page.goto(`${LESSON}/sac-mystere`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    check('module1 header shows "Module 1 / 8"', /Module\s*1\s*\/\s*8/.test(body));
    check('module1 no NaN', !body.includes('NaN'));
    // Tap-place fallback (keyboard/touch-safe alternative to drag)
    const leftBtn = page.locator('button[aria-label*="plateau de gauche"]').first();
    const rightBtn = page.locator('button[aria-label*="plateau de droite"]').last();
    check('module1 tap-place buttons present', (await page.locator('button[aria-label*="plateau de"]').count()) >= 2);
    await leftBtn.click().catch(() => {});
    await page.waitForTimeout(250);
    await rightBtn.click().catch(() => {});
    await page.waitForTimeout(400);
    const body2 = await page.textContent('body');
    check('module1 verdict question appears once both pans loaded', body2.includes('D’après la balance'));
    await page.screenshot({ path: `${SHOT_DIR}masses-m1-balance.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 2 — UnitSwitcher ──────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1']));
    await page.goto(`${LESSON}/choisir-unite`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const initial = await page.textContent('body');
    check('module2 shows t value initially', /12\s*t/.test(initial.replace(/ /g, ' ')));
    // Anchored exact-match regex: a bare 'g' would also match 'kg' and 'mg'.
    for (const label of ['mg', 'g', 'kg', 't']) {
      const btn = page.locator('button[aria-pressed]', { hasText: new RegExp(`^${label}$`) }).first();
      await btn.click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);
    const after = await page.textContent('body');
    check('module2 unit switch completes and shows feedback', after.includes('Le camion n’a pas changé de masse'));
    await page.screenshot({ path: `${SHOT_DIR}masses-m2-switcher.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 3 — balance equilibrium + gauge read manipulation ─────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2']));
    await page.goto(`${LESSON}/comparer-mesurer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Place the three 100 g weights left and the 300 g weight right → equilibrium.
    for (let i = 0; i < 3; i += 1) {
      await page.locator('button[aria-label*="plateau de gauche"]').first().click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.locator('button[aria-label*="plateau de droite"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module3 equilibrium reached and explained', body.includes('La balance s’équilibre'));
    // Gauge read: hit-rects are fill="transparent" → assert by count, click forced.
    check('module3 gauge graduations tappable', (await page.locator('[role="button"][aria-label*="Graduation"]').count()) >= 5);
    await page.locator('[role="button"][aria-label="Graduation 500 g"]').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    const body2 = await page.textContent('body');
    check('module3 gauge reading gives feedback', /Bien lu|la barre s’arrête/.test(body2));
    await page.screenshot({ path: `${SHOT_DIR}masses-m3-gauge.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 3b — unbalanced arrangement must not lock the student ─────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2']));
    await page.goto(`${LESSON}/comparer-mesurer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Deliberately unbalanced: all four weights on the left pan.
    for (let i = 0; i < 4; i += 1) {
      await page.locator('button[aria-label*="plateau de gauche"]').first().click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    check('module3 unbalanced shows honest gap message', body.includes('ne s’équilibrent pas'));
    check('module3 unbalanced does NOT claim equilibrium', !body.includes('La balance s’équilibre'));
    check('module3 unbalanced offers an escape hatch', body.includes('montre-moi l’équilibre'));
    await page.locator('button:has-text("montre-moi l’équilibre")').first().click().catch(() => {});
    await page.waitForTimeout(400);
    const body2 = await page.textContent('body');
    check('module3 escape hatch reveals the solution', body2.includes('La balance s’équilibre'));
    await ctx.close();
  }

  // ── Module 4 — build rounds + UnitLadder ─────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3']));
    await page.goto(`${LESSON}/relations-unites`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const body = await page.textContent('body');
    check('module4 build round present', body.includes('Empile des blocs'));
    check('module4 no console/page errors so far', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Module 5 — ConservedMass + decimal-safe NumericQuestion ──────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4']));
    await page.goto(`${LESSON}/conversions`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.locator('button', { hasText: 'PLUS GRAND' }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    check('module5 conserved mass mounts', body.includes('Le bloc ne change pas de taille'));
    // Round 1 (3 kg → g) is an integer; answer it to unlock round 2 (2500 g → 2,5 kg).
    await page.locator('input[type="text"]').first().fill('3000');
    await page.locator('button:has-text("OK")').first().click().catch(() => {});
    await page.waitForTimeout(600);
    // Round 2 direction is "PLUS PETIT"; then submit a wrong value to force the reveal.
    await page.locator('button', { hasText: 'PLUS PETIT' }).last().click().catch(() => {});
    await page.waitForTimeout(500);
    const inputs = page.locator('input[type="text"]');
    await inputs.last().fill('999').catch(() => {});
    await page.locator('button:has-text("OK")').last().click().catch(() => {});
    await page.waitForTimeout(500);
    const body2 = await page.textContent('body');
    check('module5 decimal answer shown as 2,5 (not truncated to 2)', body2.includes('2,5'));
    await page.screenshot({ path: `${SHOT_DIR}masses-m5-conversion.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 7 — Boss Final silent-until-submit ────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5', '6']));
    await page.goto(`${LESSON}/mission-finale`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const bossOpts = page.locator('div[role="group"] > button[aria-pressed]');
    const bossCount = await bossOpts.count();
    check('module7 boss renders 10 épreuves at once (silent form)', bossCount >= 10);
    for (let i = 0; i < bossCount; i += 1) await bossOpts.nth(i).click().catch(() => {});
    const validateBtn = page.locator('button:has-text("Valider mes")');
    check('module7 validate button present', await validateBtn.isVisible().catch(() => false));
    if (await validateBtn.isEnabled().catch(() => false)) {
      await validateBtn.click();
      await page.waitForTimeout(600);
      const bodyBoss = await page.textContent('body');
      check('module7 review shows a score', /\/\s*10/.test(bodyBoss));
      check('module7 Terminer button appears on last module', bodyBoss.includes('Terminer'));
    }
    await page.screenshot({ path: `${SHOT_DIR}masses-m7-boss.png` }).catch(() => {});
    await ctx.close();
  }

  check('no console/page errors across the run', errs.length === 0, errs.join(' | '));

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
