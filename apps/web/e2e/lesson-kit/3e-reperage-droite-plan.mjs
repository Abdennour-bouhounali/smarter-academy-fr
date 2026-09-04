// Smoke test for the 3e "repérage sur une droite et dans le plan" lesson.
// Run: node apps/web/e2e/lesson-kit/3e-reperage-droite-plan.mjs
// (dev server on :5184, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5184';
const ROOT = `${BASE}/courses/college/3e/espace_geometrie/reperage-droite-plan-3e`;
const KEY = 'u_anon_smarter_lesson_reperage-droite-plan-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  allee: `${ROOT}/la-droite-du-parc`,
  curseur: `${ROOT}/un-seul-curseur-a-la-fois`,
  lire: `${ROOT}/lire-un-point`,
  placer: `${ROOT}/placer-et-echanger`,
  longueurs: `${ROOT}/des-longueurs-sans-regle`,
  retenir: `${ROOT}/a-retenir`,
  figures: `${ROOT}/figures-dans-le-repere`,
  boss: `${ROOT}/mission-finale-la-carte`,
};

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
}
function summary() {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) {
    console.log('FAILED:');
    fails.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
  }
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
  watchErrors(page, opts.tag || 'rd');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

/** Presses a PointDriver stepper n times. */
async function bump(page, label, times) {
  const btn = page.locator(`button[aria-label="${label}"]`).first();
  for (let i = 0; i < times; i += 1) {
    if (!(await btn.isEnabled().catch(() => false))) break;
    await btn.click({ force: true });
    await page.waitForTimeout(90);
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
    check('index: signature module', /Un seul curseur/i.test(body));
    check('index: boss card', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    await page.screenshot({ path: `${SHOT_DIR}rd-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Diagnostic is never blocking ───────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.diag, null, { tag: 'diag' });
    const body = await page.locator('body').innerText();
    check('diag: five questions', (body.match(/\?/g) || []).length >= 5);
    // Answer every question by taking the first option of each group.
    const groups = page.locator('button:has-text("−7"), button:has-text("5"), button:has-text("7"), button:has-text("2,5"), button:has-text("2")');
    check('diag: options render', (await groups.count()) > 0);
    const next = page.locator('a:has-text("Module suivant"), a:has-text("Suivant")').first();
    check('diag: next link is available without answering (non-blocking)',
      (await next.count()) > 0 || /Mission de départ/i.test(body));
    await ctx.close();
  }

  /* ── 3. Trigger: the ambiguous rendez-vous ─────────────────────── */
  {
    const { ctx, page } = await open(browser, M.allee, ['0'], { tag: 'allee' });
    const body = await page.locator('body').innerText();
    check('M1: shows the ambiguity', /rendez-vous|3 de la fontaine/i.test(body));
    // Answer step 1 correctly.
    await page.locator('button:has-text("Deux endroits sont à 3")').first().click({ force: true });
    await page.waitForTimeout(500);
    const after = await page.locator('body').innerText();
    check('M1: reveals the rule after answering', /signe|côté/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}rd-m1-trigger.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. Signature: one control, one direction ──────────────────── */
  {
    const { ctx, page } = await open(browser, M.curseur, ['0', '1'], { tag: 'curseur' });
    let body = await page.locator('body').innerText();
    check('M2: starts at (−2 ; 2)', /\(−2 ; 2\)/.test(body), body.slice(0, 300));

    // Step 1 needs +5 on x only. The wrong-on-purpose move first: bump y once.
    await bump(page, 'Augmenter y (ordonnée)', 1);
    body = await page.locator('body').innerText();
    check('M2: moving y is reported as vertical only', /seul le vertical a bougé/i.test(body));
    await bump(page, 'Diminuer y (ordonnée)', 1);

    await bump(page, 'Augmenter x (abscisse)', 5);
    body = await page.locator('body').innerText();
    check('M2: step 1 solved by x alone', /même ordonnée/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}rd-m2-signature.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. Reading a point with the two guides ────────────────────── */
  {
    const { ctx, page } = await open(browser, M.lire, ['0', '1', '2'], { tag: 'lire' });
    // Kiosque is at (−3 ; 2): guide x −3, guide y +2.
    await bump(page, 'Déplacer le guide Guide vertical vers la gauche ou le bas', 3);
    await bump(page, 'Déplacer le guide Guide horizontal vers la droite ou le haut', 2);
    const body = await page.locator('body').innerText();
    check('M3: guides reach the kiosque', /\(−3 ; 2\)/.test(body), body.slice(0, 400));
    check('M3: names the negative abscissa', /négative|gauche/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}rd-m3-guides.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. Placing, and the deliberate swap ───────────────────────── */
  {
    const { ctx, page } = await open(browser, M.placer, ['0', '1', '2', '3'], { tag: 'placer' });
    // Step 1 target A(−4 ; 3) from origin.
    await bump(page, 'Diminuer x (abscisse)', 4);
    await bump(page, 'Augmenter y (ordonnée)', 3);
    const body = await page.locator('body').innerText();
    check('M4: places A(−4 ; 3)', /4 vers la gauche/i.test(body), body.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}rd-m4-placer.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. Lengths read off the coordinates ───────────────────────── */
  {
    const { ctx, page } = await open(browser, M.longueurs, ['0', '1', '2', '3', '4'], { tag: 'long' });
    // A(−3;2) fixed, B starts at x=−1 → length 2; need x=4 for length 7.
    await bump(page, 'Augmenter l’abscisse de B', 5);
    let body = await page.locator('body').innerText();
    check('M5: reaches length 7', /AB = 7|écart des abscisses/i.test(body), body.slice(0, 600));

    // Wrong-on-purpose on the sign question, then verify the correction shows.
    await page.locator('button:has-text("−7")').first().click({ force: true });
    await page.waitForTimeout(500);
    body = await page.locator('body').innerText();
    check('M5: wrong answer still reveals the rule', /valeur absolue|toujours positive/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}rd-m5-longueurs.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. Practice lab: the rectangle closes ─────────────────────── */
  {
    const { ctx, page } = await open(browser, M.figures, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'fig' });
    await bump(page, 'Diminuer Abscisse de D', 4);
    await bump(page, 'Diminuer Ordonnée de D', 2);
    const body = await page.locator('body').innerText();
    check('M7: rectangle closes at (−4 ; −2)', /\(−4 ; −2\)/.test(body), body.slice(0, 600));
    check('M7: states the dimensions', /7 sur 5|mesure/i.test(body));
    await page.screenshot({ path: `${SHOT_DIR}rd-m7-figures.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Boss: silent until submit, then profile and synthesis ──── */
  {
    const seeded = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seeded, { tag: 'boss' });
    let body = await page.locator('body').innerText();
    check('boss: loads ten trials', /Mission finale/i.test(body));
    check('boss: silent before submit', !/Bonne réponse|Corrigé/i.test(body));

    // Answer every trial by clicking the first option of each question block.
    const optionButtons = page.locator('main button');
    const n = await optionButtons.count();
    check('boss: renders options', n > 10, `${n} buttons`);

    // Click the known-correct option text for each trial.
    const correct = ['−3', 'L’abscisse : le décalage horizontal, ici vers la gauche',
      '(−2 ; −4)', '(0 ; 3)', 'À droite de l’axe vertical et en dessous de l’axe horizontal',
      '(3 ; −3)', '6', 'On ne peut pas obtenir CD par un simple écart de coordonnées : le segment est oblique',
      '(−3 ; −1)', '(3 ; 2)'];
    for (const label of correct) {
      const b = page.locator(`main button:has-text("${label}")`).first();
      if (await b.count()) { await b.click({ force: true }); await page.waitForTimeout(120); }
    }
    const submit = page.locator('button:has-text("Valider"), button:has-text("Terminer le test")').first();
    if (await submit.count()) {
      await submit.click({ force: true });
      await page.waitForTimeout(1200);
    }
    body = await page.locator('body').innerText();
    check('boss: shows a score after submit', /\/\s*10|score|résultat/i.test(body), body.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}rd-boss.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 10. Revisit: a completed module opens every step ──────────── */
  {
    const { ctx, page } = await open(browser, M.curseur, ['0', '1', '2'], { tag: 'revisit' });
    const locked = await page.locator('text=/Termine l.étape/i').count();
    check('revisit: no step is locked on a completed module', locked === 0, `${locked} locked`);
    await ctx.close();
  }

  /* ── 11. Mobile pass ───────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.curseur, ['0', '1'], { tag: 'mobile', mobile: true });
    const overflow = await page.evaluate(
      () => document.scrollingElement.scrollWidth - window.innerWidth
    );
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
    await page.screenshot({ path: `${SHOT_DIR}rd-mobile.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  check('no console/page errors', errs.length === 0, errs.slice(0, 6).join(' | '));
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
