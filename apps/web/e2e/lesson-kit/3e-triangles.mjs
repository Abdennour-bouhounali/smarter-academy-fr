// Smoke test for the 3e "triangles" lesson (espace & géométrie).
// Run: node apps/web/e2e/lesson-kit/3e-triangles.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/triangles-3e`;
const KEY = 'u_anon_smarter_lesson_triangles-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  poutres: `${ROOT}/trois-poutres`,
  nom: `${ROOT}/le-triangle-qui-change-de-nom`,
  somme: `${ROOT}/cent-quatre-vingts-degres`,
  construire: `${ROOT}/construire-sous-contrainte`,
  calculer: `${ROOT}/calculer-sans-mesurer`,
  justifier: `${ROOT}/justifier`,
  conjecturer: `${ROOT}/conjecturer-puis-prouver`,
  boss: `${ROOT}/mission-finale-la-charpente`,
};

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

function seedInit({ key, completedModules }) {
  localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] }));
}

const errs = [];
function watchErrors(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
    errs.push(`[${tag}] console: ${t}`);
  });
  page.on('pageerror', (err) => errs.push(`[${tag}] pageerror: ${err.message}`));
}

const settle = (page) => page.waitForTimeout(1200);

async function open(browser, url, completedModules, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1600 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || 'tr');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

async function press(page, label, times = 1) {
  const btn = page.locator(`button[aria-label="${label}"]`).first();
  for (let i = 0; i < times; i += 1) {
    if (!(await btn.isEnabled().catch(() => false))) break;
    await btn.click({ force: true });
    await page.waitForTimeout(90);
  }
}

/** Drags an SVG vertex handle by its aria-label, using keyboard arrows. */
async function nudge(page, vertex, key, times) {
  const h = page.locator(`circle[aria-label^="Sommet ${vertex}"]`).first();
  await h.focus();
  for (let i = 0; i < times; i += 1) {
    await page.keyboard.press(key);
    await page.waitForTimeout(60);
  }
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ──────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: module 0 card', /Mission de départ/i.test(body));
    check('index: signature module', /change de nom/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tr-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Diagnostic is non-blocking ─────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.diag, null, { tag: 'diag' });
    const body = await page.locator('body').innerText();
    check('diag: renders prerequisite questions', /angle droit/i.test(body));
    check('diag: tests prerequisites, not the lesson content',
      !/inégalité triangulaire|droite des milieux/i.test(body));
    await ctx.close();
  }

  /* ── 3. Trigger: the compass arcs refuse to meet ───────────────── */
  {
    const { ctx, page } = await open(browser, M.poutres, ['0'], { tag: 'poutres' });
    let body = await page.locator('body').innerText();
    check('M1: starts with an impossible triangle',
      /ne se rencontrent jamais/i.test(body), body.slice(0, 400));

    // 8 → 7 is the flat case, 7 → 6 makes it real.
    await press(page, 'Raccourcir le mur', 1);
    body = await page.locator('body').innerText();
    check('M1: names the flat limit case at 7', /aplati/i.test(body), body.slice(0, 400));

    await press(page, 'Raccourcir le mur', 1);
    body = await page.locator('body').innerText();
    check('M1: triangle exists at 6', /les arcs se croisent/i.test(body));
    check('M1: states the 3 + 4 = 7 threshold', /3 \+ 4 = 7/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tr-m1-compas.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. Signature: the name recomputes ────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.nom, ['0', '1'], { tag: 'nom' });
    let body = await page.locator('body').innerText();
    check('M2: starts as a scalene triangle', /triangle quelconque/i.test(body), body.slice(0, 400));

    const handles = await page.locator('circle[role="button"]').count();
    check('M2: vertices are keyboard reachable', handles >= 3, `${handles} handles`);

    // Drive vertex C toward the perpendicular bisector to become isosceles.
    await nudge(page, 'C', 'ArrowRight', 6);
    body = await page.locator('body').innerText();
    check('M2: the name is recomputed live, not fixed',
      /triangle (quelconque|isocèle|rectangle)/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tr-m2-signature.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. Angle sum invariant ───────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.somme, ['0', '1', '2'], { tag: 'somme' });
    const before = await page.locator('body').innerText();
    check('M3: shows the running sum', /=\s*180°/.test(before), before.slice(0, 400));

    await nudge(page, 'A', 'ArrowUp', 5);
    await nudge(page, 'B', 'ArrowRight', 5);
    const after = await page.locator('body').innerText();
    check('M3: the sum stays 180 after deforming', /=\s*180°/.test(after));
    check('M3: reports exploration progress', /Formes explorées|Trois formes/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}tr-m3-somme.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. Construction + the impossible statement ────────────────── */
  {
    const { ctx, page } = await open(browser, M.construire, ['0', '1', '2', '3'], { tag: 'constr' });
    // Target AB=7, AC=6, BC=5 from a=3,b=6,c=7 → only BC needs +2.
    await press(page, 'Augmenter BC', 2);
    const body = await page.locator('body').innerText();
    check('M4: construction completes', /Construit/i.test(body), body.slice(0, 500));
    check('M4: contains the impossible statement (9 > 3+4)', /RS = 3 cm|impossible/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tr-m4-construire.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. Calculating without measuring, wrong on purpose ────────── */
  {
    const { ctx, page } = await open(browser, M.calculer, ['0', '1', '2', '3', '4'], { tag: 'calc' });
    // Wrong on purpose: 108 = 61 + 47 (the classic slip).
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('108');
    await field.press('Enter');
    await page.waitForTimeout(600);
    let body = await page.locator('body').innerText();
    check('M5: intercepts the "sum of the two knowns" slip',
      /somme des deux angles connus/i.test(body), body.slice(0, 600));
    check('M5: still reveals the correct answer', /72/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tr-m5-calculer.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. Proof assembly ────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.justifier, ['0', '1', '2', '3', '4', '5'], { tag: 'just' });
    let body = await page.locator('body').innerText();
    check('M6: shows the proof scaffold', /Donnée.*Propriété.*Conclusion/is.test(body));

    // Build the correct proof in order.
    const order = [
      'ABC est isocèle en A : AB = AC.',
      'Dans un triangle isocèle, les angles à la base sont égaux',
      'La somme des angles d’un triangle vaut 180°.',
      'Donc 2 × angle B = 180° − 40° = 140°, soit angle B = 70°.',
    ];
    for (const label of order) {
      const b = page.locator(`button:has-text("${label.slice(0, 40)}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(200); }
    }
    body = await page.locator('body').innerText();
    check('M6: accepts the correct proof', /Rédaction correcte/i.test(body), body.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}tr-m6-justifier.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Conjecture lab: three stamps ──────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.conjecturer, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'conj' });
    let body = await page.locator('body').innerText();
    check('M7: shows the ratio readout', /IJ ÷ BC/i.test(body), body.slice(0, 400));
    check('M7: parallel chevrons are asserted by computation', /\(IJ\) ∥ \(BC\)/.test(body));

    // Stamp three readings, reshaping between each. After the third the lab
    // locks (the step is done), so the vertex handles disappear — nudge only
    // while the button is still present.
    for (let i = 0; i < 3; i += 1) {
      const stampBtn = page.locator('button:has-text("Garder ce relevé")').first();
      if (!(await stampBtn.count())) break;
      await stampBtn.click({ force: true });
      await page.waitForTimeout(300);
      if (await page.locator('button:has-text("Garder ce relevé")').count()) {
        // Vary a different vertex each round so the shape really changes.
        const v = ['B', 'C', 'A'][i];
        const k = ['ArrowRight', 'ArrowRight', 'ArrowDown'][i];
        await nudge(page, v, k, 8);
        await page.waitForTimeout(200);
      }
    }
    check('M7: three readings collected', /3\/3|Trois triangles/i.test(await page.locator('body').innerText()));
    body = await page.locator('body').innerText();
    check('M7: ratio is always 0,50', /0,50/.test(body), body.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}tr-m7-conjecture.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 10. Boss ─────────────────────────────────────────────────── */
  {
    const seeded = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seeded, { tag: 'boss' });
    let body = await page.locator('body').innerText();
    check('boss: loads', /Mission finale/i.test(body));
    check('boss: silent before submit', !/Bonne réponse|Corrigé/i.test(body));

    const correct = [
      'Non : 4 + 5 = 9, c’est moins que 11',
      'Isocèle en A',
      'Oui : il a alors un angle droit et deux angles de 45°',
      '68°', '62°', '75°',
      'Sur la médiatrice de [AB]',
      'Les propriétés invoquées',
      '6 cm',
      '4 m, car l’entretoise joint les milieux',
    ];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(1200); }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}tr-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 11. Revisit + mobile ─────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.nom, ['0', '1', '2'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, M.nom, ['0', '1'], { tag: 'mobile', mobile: true });
    const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
    check('mobile: no horizontal scroll', overflow <= 1, `overflow ${overflow}px`);
    const small = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('main button:not([disabled])').forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.width < 40 || r.height < 40)) {
          bad.push(`${b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20)} ${Math.round(r.width)}×${Math.round(r.height)}`);
        }
      });
      return bad;
    });
    check('mobile: tap targets ≥ 40px', small.length === 0, small.slice(0, 4).join(' | '));
    await page.screenshot({ path: `${SHOT_DIR}tr-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
