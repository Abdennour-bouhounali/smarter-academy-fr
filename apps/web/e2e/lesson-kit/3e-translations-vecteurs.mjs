// Smoke test for the 3e "translations et vecteurs" lesson.
// Run: node apps/web/e2e/lesson-kit/3e-translations-vecteurs.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/translations-vecteurs-3e`;
const KEY = 'u_anon_smarter_lesson_translations-vecteurs-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  trajet: `${ROOT}/le-meme-trajet`,
  attributs: `${ROOT}/direction-sens-longueur`,
  figure: `${ROOT}/toute-la-figure-bouge`,
  vagabonde: `${ROOT}/la-fleche-vagabonde`,
  nombres: `${ROOT}/deux-nombres-suffisent`,
  notation: `${ROOT}/vecteur-et-translation`,
  problemes: `${ROOT}/problemes-de-deplacement`,
  boss: `${ROOT}/mission-finale-la-choregraphie`,
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
  watchErrors(page, opts.tag || 'tv');
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

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: module 0 card', /Mission de départ/i.test(body));
    check('index: signature module', /flèche vagabonde/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tv-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Diagnostic ────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.diag, null, { tag: 'diag' });
    const body = await page.locator('body').innerText();
    check('diag: tests prerequisites', /coordonnées|parallélogramme/i.test(body));
    check('diag: does not teach vectors', !/vecteur égaux|composantes/i.test(body));
    await ctx.close();
  }

  /* ── 3. Trigger: reproduce the trip, diagnosed by attribute ───── */
  {
    const { ctx, page } = await open(browser, M.trajet, ['0'], { tag: 'trajet' });
    let body = await page.locator('body').innerText();
    check('M1: starts with a wrong displacement', /direction n’est pas la même|sens|longueur/i.test(body));

    // (1;-2) → (4;2): +3 horizontal, +4 vertical.
    await press(page, 'Augmenter Déplacement horizontal', 3);
    await press(page, 'Augmenter Déplacement vertical', 4);
    body = await page.locator('body').innerText();
    check('M1: reaching the same displacement is recognised',
      /trajets sont identiques/i.test(body), body.slice(0, 500));
    check('M1: states arrival differs', /pas arrivés au même endroit/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tv-m1-trajet.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. The three attributes, judged separately ───────────────── */
  {
    const { ctx, page } = await open(browser, M.attributs, ['0', '1'], { tag: 'attr' });
    let body = await page.locator('body').innerText();
    check('M2: three lamps rendered', /Direction[\s\S]*Sens[\s\S]*Longueur/i.test(body));

    // Reference is (3;2); go to (-3;-2) = opposite → same direction, opposite sense.
    // The three lamps are read individually so the page title cannot satisfy the assertion.
    const lampText = async (label) => {
      const el = page.locator(`div:has(> p:text-is("${label}")) > p`).last();
      return (await el.count()) ? (await el.innerText()).trim() : '(absent)';
    };
    await press(page, 'Diminuer Déplacement horizontal', 6);
    await press(page, 'Diminuer Déplacement vertical', 4);
    const [dirLamp, sensLamp, lenLamp] = await Promise.all([
      lampText('Direction'), lampText('Sens'), lampText('Longueur'),
    ]);
    check('M2: opposite vector keeps direction and length identical',
      dirLamp === 'identique' && lenLamp === 'identique',
      `direction=${dirLamp} longueur=${lenLamp}`);
    check('M2: but the sense is reported as different',
      sensLamp === 'différent', `sens=${sensLamp}`);
    await page.screenshot({ path: `${SHOT_DIR}tv-m2-attributs.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. Translating a whole figure ────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.figure, ['0', '1', '2'], { tag: 'fig' });
    await press(page, 'Augmenter Déplacement horizontal', 4);
    await press(page, 'Augmenter Déplacement vertical', 3);
    const body = await page.locator('body').innerText();
    check('M3: figure translated and named superposable',
      /superposable/i.test(body), body.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}tv-m3-figure.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. Signature: the arrow travels, unchanged ───────────────── */
  {
    const { ctx, page } = await open(browser, M.vagabonde, ['0', '1', '2', '3'], { tag: 'vag' });
    let body = await page.locator('body').innerText();
    const compStepper = await page.locator('button[aria-label="Augmenter Déplacement horizontal"]').count();
    check('M4: the components are LOCKED — only the origin can move', compStepper === 0,
      `${compStepper} component steppers found`);
    check('M4: origin steppers present', /Origine/.test(body));

    for (let i = 0; i < 3; i += 1) {
      const btn = page.locator('button:has-text("Poser la flèche ici")').first();
      if (!(await btn.count())) break;
      await btn.click({ force: true });
      await page.waitForTimeout(250);
      if (await page.locator('button:has-text("Poser la flèche ici")').count()) {
        // Move ACROSS the vector's own direction so the arrows do not stack
        // on one line — that is what makes the invariant readable.
        await press(page, 'Augmenter Origine — y', 3);
        await press(page, 'Diminuer Origine — x', 2);
      }
    }
    body = await page.locator('body').innerText();
    check('M4: three placements recognised as the same vector',
      /même vecteur/i.test(body), body.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}tv-m4-signature.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. Coordinates, wrong on purpose ─────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.nombres, ['0', '1', '2', '3', '4'], { tag: 'nb' });
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('-6');            // départ − arrivée instead of arrivée − départ
    await field.press('Enter');
    await page.waitForTimeout(600);
    const body = await page.locator('body').innerText();
    check('M5: intercepts the reversed subtraction',
      /soustrait dans l’autre sens|ARRIVÉE − DÉPART/i.test(body), body.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}tv-m5-nombres.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. Practice lab: close the parallelogram ─────────────────── */
  {
    const { ctx, page } = await open(browser, M.problemes, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'prob' });
    // D target is (2;-1) starting from (0;0).
    await press(page, 'Augmenter Abscisse de D', 2);
    await press(page, 'Diminuer Ordonnée de D', 1);
    const body = await page.locator('body').innerText();
    check('M7: parallelogram closes', /parallélogramme/i.test(body), body.slice(0, 600));
    check('M7: says it was obtained by calculation', /calcul/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}tv-m7-problemes.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Boss ──────────────────────────────────────────────────── */
  {
    const seeded = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seeded, { tag: 'boss' });
    let body = await page.locator('body').innerText();
    check('boss: loads', /Mission finale/i.test(body));
    check('boss: silent before submit', !/Bonne réponse|Corrigé/i.test(body));

    const correct = [
      'Ils sont différents : le déplacement dit de combien bouger',
      'Même direction et même longueur, mais des sens contraires',
      'Non : les composantes ne se correspondent pas',
      '(1 ; 1)',
      'Un triangle superposable',
      'Oui : le point d’application ne fait pas partie du vecteur',
      '(4 ; −3)',
      'Oui : les deux valent (4 ; −2)',
      '(2 ; 3)',
      '(−1 ; 2)',
    ];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) { await submit.click({ force: true }); await page.waitForTimeout(1200); }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}tv-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 10. Revisit + mobile ─────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.vagabonde, ['0', '1', '2', '3', '4'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, M.vagabonde, ['0', '1', '2', '3'], { tag: 'mobile', mobile: true });
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
    await page.screenshot({ path: `${SHOT_DIR}tv-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
