// Smoke test for the longueurs manipulation-first upgrades.
// Run: node apps/web/e2e/lesson-kit/l2-longueurs-manipulations.mjs   (dev server on :5186, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5186';
const LESSON = `${BASE}/courses/college/6e/grandeurs_mesures/longueurs`;
const KEY = 'u_anon_smarter_lesson_longueurs';
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

  // ── Module 1 — UnitSwitcher ──────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.goto(`${LESSON}/quelle-unite`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const chips = page.locator('button[aria-pressed]');
    check('module1 unit chips visible', (await chips.count()) >= 4);
    const initialText = await page.textContent('body');
    check('module1 shows km value initially', /465\s*km/.test(initialText.replace(/ /g, ' ')));
    // Tap through mm, cm, m, km
    for (const label of ['mm', 'cm', 'm', 'km']) {
      const btn = page.locator(`button[aria-pressed]`, { hasText: new RegExp(`^${label}$`) }).first();
      await btn.click().catch(() => {});
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(300);
    const afterText = await page.textContent('body');
    check('module1 switching units does not error and shows feedback', afterText.includes('Le trajet Paris–Lyon'));
    await page.screenshot({ path: `${SHOT_DIR}m1-unitswitcher.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 2 — drag-the-object round ─────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1']));
    await page.goto(`${LESSON}/mesurer-comparer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Step 2 (the drag round) is sequentially locked behind step 1's MCQ.
    await page.locator('button[aria-pressed]', { hasText: 'Non : le crayon' }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    const body1 = await page.textContent('body');
    check('module2 shows drag instruction', body1.includes('glisser'));
    const validateBtn = page.locator('button:has-text("Valider la position")');
    check('module2 validate-position button present', await validateBtn.isVisible().catch(() => false));
    // Simulate a drag on the draggable object via pointer events
    const objHandle = page.locator('[role="slider"][aria-label*="Objet"]').first();
    const box = await objHandle.boundingBox().catch(() => null);
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(150);
    }
    check('module2 drag did not error', errs.length === 0, errs.join(' | '));
    if (await validateBtn.isVisible().catch(() => false)) {
      await validateBtn.click();
      await page.waitForTimeout(200);
    }
    const body2 = await page.textContent('body');
    check('module2 proceeds to tap-read phase after validating position', body2.includes('COMMENCE') || body2.includes('Lecture terminée'));
    await page.screenshot({ path: `${SHOT_DIR}m2-drag.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 3 — tappable dual-scale ruler + UnitLadder ────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2']));
    await page.goto(`${LESSON}/construire-unites`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Ruler tick hit-rects are fill="transparent" — assert by count, not isVisible.
    const tick = page.locator('[role="button"][aria-label*="Graduation 3 "]').first();
    check('module3 ruler tick present', (await page.locator('[role="button"][aria-label*="Graduation"]').count()) >= 10);
    await tick.click({ force: true }).catch(() => {});
    await page.waitForTimeout(250);
    const body = await page.textContent('body');
    check('module3 tap reveals paired mm value', /mm — même point/.test(body));
    // The unit ladder lives in step 2, sequentially locked behind step 1's MCQ.
    await page.locator('button[aria-pressed]', { hasText: /^30 mm$/ }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    const body2 = await page.textContent('body');
    check('module3 unit ladder present', body2.includes('Touche une flèche') || body2.includes('Échelle des unités'));
    await ctx.close();
  }

  // ── Module 4 — ConservedSegment ──────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3']));
    await page.goto(`${LESSON}/convertir`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Answer direction question to reveal the NumericQuestion + segment
    const dirBtn = page.locator('button', { hasText: 'PLUS GRAND' }).first();
    await dirBtn.click().catch(() => {});
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    check('module4 conserved segment mounts', body.includes('ne bouge pas'));
    const unitChip = page.locator('button', { hasText: /^cm$/ }).first();
    await unitChip.click().catch(() => {});
    await page.waitForTimeout(300);
    check('module4 switching segment unit does not error', errs.length === 0, errs.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}m4-segment.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 5 — NumberLine drag-estimate + ReferenceRuler ─────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4']));
    await page.goto(`${LESSON}/choisir-estimer`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // Advance through the 4 scenario TapQuestions. Each scenario unlocks the
    // next, and answered grids stay mounted, so target each scenario's own
    // correct option by its distinctive label rather than "first unanswered".
    for (const label of [/^2 m$/, /^100 m$/, /^1 mm$/, /^800 km$/]) {
      const opt = page.locator('div[role="group"] > button', { hasText: label }).last();
      if (await opt.isEnabled().catch(() => false)) {
        await opt.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
    await page.waitForTimeout(500);
    const slider = page.locator('[role="slider"][aria-label*="Curseur"]').first();
    check('module5 NumberLine drag cursor present', await slider.isVisible().catch(() => false));
    const validateEstimate = page.locator('button:has-text("Valider mon estimation")');
    if (await validateEstimate.isVisible().catch(() => false)) {
      await validateEstimate.click();
      await page.waitForTimeout(200);
    }
    const body = await page.textContent('body');
    check('module5 estimate reveals ghost value', body.includes('hauteur réelle') || body.includes('hauteur d\'une porte est d\'environ'));
    const refSlider = page.locator('[role="slider"][aria-label="1 m"]').first();
    check('module5 ReferenceRuler slider present', await refSlider.isVisible().catch(() => false));
    check('module5 no console/page errors', errs.length === 0, errs.join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}m5-estimate.png` }).catch(() => {});
    await ctx.close();
  }

  // ── Module 6 — PolygonPerimeter running total ────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5']));
    await page.goto(`${LESSON}/perimetres`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    // SVG hit-lines are stroke="transparent" — isVisible() reports false for
    // them, so assert presence by count and click with force.
    const edge = page.locator('[role="button"][aria-label*="Côté 1"]').first();
    check('module6 polygon edge present', (await page.locator('[role="button"][aria-label*="Côté"]').count()) >= 3);
    await edge.click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
    const body = await page.textContent('body');
    check('module6 running total shows after first tap', /Périmètre parcouru/.test(body));
    check('module6 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  // ── Module 7 — Boss Final extra stays static ─────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 } });
    const page = await ctx.newPage();
    watchErrors(page);
    await page.addInitScript(seedInit, seedArgs(KEY, ['0', '1', '2', '3', '4', '5', '6']));
    await page.goto(`${LESSON}/mission-finale`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const opts = page.locator('button[aria-pressed]');
    check('module7 boss still renders épreuves', (await opts.count()) >= 10);
    check('module7 no console/page errors', errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  await browser.close();
  process.exit(summary());
}

run().catch((e) => { console.error(e); process.exit(1); });
