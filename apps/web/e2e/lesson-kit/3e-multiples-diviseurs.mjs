// Smoke test for the 3e "multiples et diviseurs" lesson (nombres & calculs).
// Run: node apps/web/e2e/lesson-kit/3e-multiples-diviseurs.mjs
// (dev server on :5204, started from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5204';
const ROOT = `${BASE}/courses/college/3e/nombres_calculs/multiples-diviseurs`;
const KEY = 'u_anon_smarter_lesson_multiples-diviseurs';
const TOTAL = 9;
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  index: ROOT,
  diag: `${ROOT}/mission-de-depart`,
  chaises: `${ROOT}/les-36-chaises`,
  lectures: `${ROOT}/deux-lectures-du-meme-produit`,
  grille: `${ROOT}/la-grille-des-multiples`,
  detecteur: `${ROOT}/le-rectangle-detecteur`,
  crible: `${ROOT}/le-crible`,
  arbre: `${ROOT}/larbre-des-facteurs`,
  labo: `${ROOT}/le-labo-des-decompositions`,
  boss: `${ROOT}/mission-finale-la-fete-du-college`,
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
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1500 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || 'md');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

/**
 * The Nth Rectangle-Détecteur, addressed by its own `role="group"` wrapper so
 * chips and the stamp button of DIFFERENT arrays can never be mixed up.
 */
function rectangle(page, ariaLabel) {
  return page.locator(`div[role="group"][aria-label="${ariaLabel}"]`).first();
}

/** Sets the row count of one RectangleArray via its chip (tap-first path). */
async function tapRows(page, ariaLabel, r) {
  const arr = rectangle(page, ariaLabel);
  await arr.locator('div[role="group"][aria-label="Nombre de rangées"]')
    .locator(`button[aria-label^="${r} rangée"]`).first().click({ force: true });
  await page.waitForTimeout(180);
}

/** Stamps the current pair of one RectangleArray if the rectangle is complete. */
async function stampPair(page, ariaLabel) {
  const btn = rectangle(page, ariaLabel).locator('button:has-text("Garder cette paire")').first();
  if (await btn.isEnabled().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(240);
    return true;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.index, null, { tag: 'index' });
    const body = await page.locator('body').innerText();
    check('index: loads', body.length > 200, `body ${body.length} chars`);
    check('index: shows module 0 card', /Mission de départ/i.test(body));
    check('index: shows the signature module', /Rectangle-Détecteur/i.test(body));
    check('index: shows the boss', /Mission finale/i.test(body));
    check('index: no NaN', !/NaN/.test(body));
    check('index: 85 min announced', /85/.test(body), body.slice(0, 300));
    await page.screenshot({ path: `${SHOT_DIR}md-index.png` });
    await ctx.close();
  }

  /* ── 2. Diagnostic non-blocking ───────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.diag, null, { tag: 'diag' });
    const opts = page.locator('div[role="group"] > button[aria-pressed]');
    const n = await opts.count();
    check('diagnostic: renders options', n >= 15, `${n} options`);
    for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 2000 }).catch(() => {});
    const submit = page.locator('button:has-text("Voir mon résultat")');
    check('diagnostic: submit appears once all answered', await submit.isVisible().catch(() => false));
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(700);
    }
    const body = await page.locator('body').innerText();
    check('diagnostic: reaches a result', /\/\s*10|Ta correction|Ton conseil/i.test(body));
    check('diagnostic: never blocks (continue button present)', /Commencer|Je suis prêt/i.test(body));
    await ctx.close();
  }

  /* ── 3. Module 1 — the 36 chairs, remainder tray ──────────────── */
  {
    const { ctx, page } = await open(browser, M.chaises, ['0'], { tag: 'm1' });
    const head = await page.locator('body').innerText();
    check('M1: shows module 1 of 9', new RegExp(`Module\\s*1\\s*/\\s*${TOTAL}`, 'i').test(head), head.slice(0, 160));
    check('M1: no NaN', !/NaN/.test(head));

    // Step 1: wrong-on-purpose prediction, correction still shown, progresses.
    await page.locator('button:has-text("Oui, ça tombe juste")').first().click();
    await page.waitForTimeout(500);
    const afterPredict = await page.locator('body').innerText();
    check('M1: wrong prediction still reveals the correct answer', /Bonne réponse/i.test(afterPredict));
    check('M1: correction names the remainder', /reste/i.test(afterPredict));

    // Step 2: drive the rectangle to 6 rows (complete) and stamp, then 4 rows.
    const CHAIRS = 'Les 36 chaises de la fête';
    await tapRows(page, CHAIRS, 5);
    const at5 = await page.locator('body').innerText();
    check('M1: 5 rows leaves a visible remainder', /reste 1|1 carreau dans le bac/i.test(at5), at5.slice(0, 400));

    await tapRows(page, CHAIRS, 6);
    const at6 = await page.locator('body').innerText();
    check('M1: 6 rows makes a complete rectangle (reste 0)', /reste 0|bac « reste » vide/i.test(at6));

    const stamp = rectangle(page, CHAIRS).locator('button:has-text("Garder cette paire")').first();
    check('M1: stamp button enabled on a complete rectangle', await stamp.isEnabled());
    check('M1: kept the 6 × 6 pair', await stampPair(page, CHAIRS));
    await tapRows(page, CHAIRS, 4);
    check('M1: kept the 4 × 9 pair', await stampPair(page, CHAIRS));
    await page.waitForTimeout(400);
    const afterStamps = await page.locator('body').innerText();
    check('M1: two kept pairs complete the step', /Quand le bac « reste » est vide/i.test(afterStamps), afterStamps.slice(0, 300));
    check('M1: divisor card lists the found divisors', /Diviseurs trouvés/i.test(afterStamps));
    await page.screenshot({ path: `${SHOT_DIR}md-m1-rectangle.png` });
    await ctx.close();
  }

  /* ── 4. Module 3 — grid painting + digit-sum readout ──────────── */
  {
    const { ctx, page } = await open(browser, M.grille, ['0', '1', '2'], { tag: 'm3' });
    const head = await page.locator('body').innerText();
    check('M3: shows module 3 of 9', new RegExp(`Module\\s*3\\s*/\\s*${TOTAL}`, 'i').test(head));
    check('M3: no NaN', !/NaN/.test(head));

    const grid = page.locator('div[role="group"][aria-label*="multiples de 2"]').first();
    const cells = grid.locator('button');
    check('M3: grid renders 50 cells', (await cells.count()) === 50, `${await cells.count()} cells`);

    // Wrong on purpose: tap 7 (not a multiple of 2) → it must not paint, and say why.
    await grid.locator('button[aria-label="7"]').click();
    await page.waitForTimeout(300);
    const afterWrong = await page.locator('body').innerText();
    check('M3: a non-multiple does not paint and explains why', /ne s’est pas colorié|ne s'est pas colorié/i.test(afterWrong));

    for (const k of [2, 4, 6, 8, 10]) {
      await grid.locator(`button[aria-label^="${k}"]`).first().click();
      await page.waitForTimeout(90);
    }
    const cont = page.locator('button:has-text("Continuer le motif")').first();
    check('M3: continue-the-pattern appears after 5 cells', await cont.isVisible().catch(() => false));
    await cont.click();
    await page.waitForTimeout(500);
    const afterPattern = await page.locator('body').innerText();
    check('M3: the pattern reads as columns', /colonnes pleines|dernier chiffre/i.test(afterPattern));
    await page.screenshot({ path: `${SHOT_DIR}md-m3-grid.png` });
    await ctx.close();
  }

  /* ── 5. Module 4 — SIGNATURE: all 5 pairs of 36 ───────────────── */
  {
    const { ctx, page } = await open(browser, M.detecteur, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await page.locator('body').innerText();
    check('M4: shows module 4 of 9', new RegExp(`Module\\s*4\\s*/\\s*${TOTAL}`, 'i').test(head));
    check('M4: no NaN', !/NaN/.test(head));
    check('M4: gap is quantified up front', /paires? sur|Il t’en manque|Il t'en manque/i.test(head), head.slice(0, 500));

    // Stamp all five pairs of 36 via chips: rows 1, 2, 3, 4, 6.
    const BOXES = 'Rectangle-Détecteur pour 36 boîtes';
    let kept36 = 0;
    for (const r of [1, 2, 3, 4, 6]) {
      await tapRows(page, BOXES, r);
      if (await stampPair(page, BOXES)) kept36 += 1;
    }
    check('M4: five pairs stamped by tapping chips only', kept36 === 5, `${kept36} stamped`);
    const afterAll = await page.locator('body').innerText();
    check('M4: signature reaches its goal (5 pairs of 36)', /36 a exactement/i.test(afterAll), afterAll.slice(0, 600));
    check('M4: the 9 divisors are listed', /1 · 2 · 3 · 4 · 6 · 9 · 12 · 18 · 36/.test(afterAll));
    await page.screenshot({ path: `${SHOT_DIR}md-m4-signature.png` });

    // Mirror question (step 2).
    await page.locator('button:has-text("À partir de 6 rangées")').first().click();
    await page.waitForTimeout(400);
    const afterMirror = await page.locator('body').innerText();
    check('M4: mirror threshold explained', /6 × 6 = 36/.test(afterMirror));

    // Step 3: the four pairs of 24 — chips 1, 2, 3, 4 on its OWN array.
    const CUPS = 'Rectangle-Détecteur pour 24 gobelets';
    await rectangle(page, CUPS).waitFor({ state: 'visible', timeout: 10000 });
    let kept24 = 0;
    for (const r of [1, 2, 3, 4]) {
      await tapRows(page, CUPS, r);
      if (await stampPair(page, CUPS)) kept24 += 1;
    }
    check('M4: four pairs of 24 stamped', kept24 === 4, `${kept24} stamped`);
    const after24 = await page.locator('body').innerText();
    check('M4: 24 completes with its 4 pairs', /24 = 1 × 24/.test(after24), after24.slice(-800));

    // Step 4: three prime verdicts — 13 (stick), 21 (not), 23 (stick).
    for (const [i, stick] of [[0, true], [1, false], [2, true]]) {
      const btn = stick
        ? page.locator('button:has-text("Bâton seulement")').first()
        : page.locator('button:has-text("Il fait un autre rectangle")').first();
      if (await btn.isVisible().catch(() => false)) await btn.click();
      await page.waitForTimeout(350);
      void i;
    }
    const afterVerdicts = await page.locator('body').innerText();
    check('M4: the word "nombre premier" is named after the gesture', /nombre premier/i.test(afterVerdicts));
    check('M4: 1 is explicitly excluded from the primes', /1<\/strong>|1 n’est pas premier|1 n'est pas premier/i.test(afterVerdicts));
    await page.screenshot({ path: `${SHOT_DIR}md-m4-primes.png` });
    await ctx.close();
  }

  /* ── 6. Module 5 — the sieve ──────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.crible, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await page.locator('body').innerText();
    check('M5: shows module 5 of 9', new RegExp(`Module\\s*5\\s*/\\s*${TOTAL}`, 'i').test(head));
    check('M5: no NaN', !/NaN/.test(head));

    await page.locator('button:has-text("Environ 15")').first().click();
    await page.waitForTimeout(400);

    const chips = page.locator('div[role="group"][aria-label="Nombres premiers du crible"] button');
    check('M5: four prime chips', (await chips.count()) === 4, `${await chips.count()} chips`);
    for (const p of [2, 3, 5, 7]) {
      await page.locator(`button[aria-label^="Barrer les multiples de ${p}"]`).first().click({ force: true });
      await page.waitForTimeout(280);
    }
    const afterSieve = await page.locator('body').innerText();
    check('M5: sieve reaches its goal (15 survivors)', /15<\/strong>|Les 15 survivants|survivants/i.test(afterSieve));
    check('M5: the primes to 50 are listed', /2 · 3 · 5 · 7 · 11 · 13 · 17 · 19 · 23 · 29 · 31 · 37 · 41 · 43 · 47/.test(afterSieve));
    await page.screenshot({ path: `${SHOT_DIR}md-m5-sieve.png` });
    await ctx.close();
  }

  /* ── 7. Module 6 — the factor tree refuses to close ───────────── */
  {
    const { ctx, page } = await open(browser, M.arbre, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await page.locator('body').innerText();
    check('M6: shows module 6 of 9', new RegExp(`Module\\s*6\\s*/\\s*${TOTAL}`, 'i').test(head));
    check('M6: no NaN', !/NaN/.test(head));
    check('M6: unfinished leaves are announced', /feuilles? encore à couper/i.test(head), head.slice(0, 600));

    // 36 = 4 × 9 pre-split. Cut 4 → 2 × 2 and 9 → 3 × 3.
    await page.locator('button[aria-label^="Feuille 4, pas encore premier"]').first().click();
    await page.waitForTimeout(250);
    await page.locator('div[role="group"][aria-label="Couper 4 en…"] button:has-text("2 × 2")').first().click();
    await page.waitForTimeout(300);
    const midway = await page.locator('body').innerText();
    check('M6: the tree still refuses to close with 9 open', /feuille encore à couper|feuilles encore à couper/i.test(midway));

    await page.locator('button[aria-label^="Feuille 9, pas encore premier"]').first().click();
    await page.waitForTimeout(250);
    await page.locator('div[role="group"][aria-label="Couper 9 en…"] button:has-text("3 × 3")').first().click();
    await page.waitForTimeout(500);
    const afterTree = await page.locator('body').innerText();
    check('M6: tree completes on all-prime leaves', /Plus une seule feuille à couper/i.test(afterTree), afterTree.slice(0, 700));
    check('M6: the decomposition 2 × 2 × 3 × 3 is stated', /2 × 2 × 3 × 3/.test(afterTree));
    await page.screenshot({ path: `${SHOT_DIR}md-m6-tree.png` });
    await ctx.close();
  }

  /* ── 8. Module 7 — PrimeVenn, decimal-safe numeric traps ──────── */
  {
    const { ctx, page } = await open(browser, M.labo, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'm7' });
    const head = await page.locator('body').innerText();
    check('M7: shows module 7 of 9', new RegExp(`Module\\s*7\\s*/\\s*${TOTAL}`, 'i').test(head));
    check('M7: no NaN', !/NaN/.test(head));
    check('M7: starts at 84 / 126', /84 \/ 126/.test(head), head.slice(0, 500));

    const commons = page.locator('div[role="group"][aria-label="Facteurs communs"] button');
    check('M7: three common-factor chips', (await commons.count()) === 3, `${await commons.count()} chips`);
    await commons.nth(0).click();
    await page.waitForTimeout(300);
    const partial = await page.locator('body').innerText();
    check('M7: one factor gives the partial 42 / 63', /42 \/ 63/.test(partial), partial.slice(0, 500));
    await commons.nth(1).click();
    await page.waitForTimeout(200);
    await commons.nth(2).click();
    await page.waitForTimeout(500);
    const full = await page.locator('body').innerText();
    check('M7: all three factors give the irreducible 2 / 3', /2 \/ 3/.test(full));
    check('M7: irreducibility is named', /irréductible/i.test(full));
    await page.screenshot({ path: `${SHOT_DIR}md-m7-venn.png` });

    // Step 2: wrong-on-purpose 6 → the targeted explainFor must fire.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    await field.fill('6');
    await page.locator('button:has-text("OK")').first().click();
    await page.waitForTimeout(500);
    const afterTrap = await page.locator('body').innerText();
    check('M7: the trap value 6 gets a targeted correction', /ce n’est pas le plus grand|ce n'est pas le plus grand/i.test(afterTrap), afterTrap.slice(-700));
    check('M7: the correct tile side 42 is revealed', /42/.test(afterTrap));

    // Step 3: wrong-on-purpose 30 (12 + 18) → targeted trap, then the clock.
    const field3 = page.locator('input[type="text"], input[type="number"]').first();
    await field3.fill('30');
    await page.locator('button:has-text("OK")').first().click();
    await page.waitForTimeout(500);
    const afterBusTrap = await page.locator('body').innerText();
    check('M7: 12 + 18 = 30 gets its own correction', /n’additionne pas|n'additionne pas/i.test(afterBusTrap));
    check('M7: the real meeting point 36 min is revealed', /36/.test(afterBusTrap));

    await page.locator('button:has-text("7 h 36")').first().click();
    await page.waitForTimeout(500);
    const afterClock = await page.locator('body').innerText();
    check('M7: the clock readout is formatted (7 h 36)', /7 h 36/.test(afterClock));
    await page.screenshot({ path: `${SHOT_DIR}md-m7-bus.png` });
    await ctx.close();
  }

  /* ── 9. Boss: silent → submit → profil → synthèse → completion ── */
  {
    const seed = ['0', '1', '2', '3', '4', '5', '6', '7'];
    const { ctx, page } = await open(browser, M.boss, seed, { tag: 'boss' });
    const body = await page.locator('body').innerText();
    check('boss: renders', /Mission finale|Boss final/i.test(body));
    check('boss: no NaN', !/NaN/.test(body));
    check('boss: silent before submit', !/Bonne réponse/i.test(body));
    check('boss: registre chips shown', /Tombola/i.test(body));

    const groups = page.locator('div[role="group"]');
    const nGroups = await groups.count();
    for (let i = 0; i < nGroups; i += 1) {
      const btn = groups.nth(i).locator('button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
    }
    await page.waitForTimeout(300);
    const submit = page.locator('button').filter({ hasText: /Valider mes/ }).first();
    check('boss: submit enabled once all answered', await submit.isEnabled().catch(() => false));
    await submit.click();
    await page.waitForTimeout(900);
    const afterSubmit = await page.locator('body').innerText();
    check('boss: submitting produces a score out of 10', /\/\s*10/.test(afterSubmit));
    check('boss: review shows corrections', /Bonne réponse|Ta réponse/i.test(afterSubmit));
    await page.screenshot({ path: `${SHOT_DIR}md-boss-review.png` });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(600);
    const profil = await page.locator('body').innerText();
    check('boss: profil lists the skills', /profil de maîtrise/i.test(profil));

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(800);
    const synth = await page.locator('body').innerText();
    check('boss: synthèse reuses the Rectangle-Détecteur', /Rectangle-Détecteur/i.test(synth));
    check('boss: synthèse reuses the factor tree of 60', /60 = 2² × 3 × 5/.test(synth), synth.slice(-900));
    check('boss: completion banner', /Fête réussie|Patron de la fête/i.test(synth));
    await page.screenshot({ path: `${SHOT_DIR}md-boss-synthese.png`, fullPage: true });
    // Reload the SAME context: useFinalTestAttempt persists per browser, so a
    // fresh context would start with empty localStorage and legitimately show a
    // blank quiz. Reloading in place is what actually exercises the restore.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const reloaded = await page.locator('body').innerText();
    check('boss: reload shows the saved review', /Résultat du défi|Refaire le test/i.test(reloaded), reloaded.slice(0, 400));

    const redo = page.locator('button').filter({ hasText: /Refaire le test/ }).first();
    if (await redo.isVisible().catch(() => false)) {
      await redo.click();
      await page.waitForTimeout(800);
      const afterRedo = await page.locator('body').innerText();
      check('boss: "Refaire le test" resets to a silent quiz', !/Bonne réponse/i.test(afterRedo) && /Valider mes/i.test(afterRedo));
    } else {
      check('boss: "Refaire le test" resets to a silent quiz', false, 'redo button not found');
    }
    await ctx.close();
  }

/* ── 10. Revisit: a completed module shows every step open ────── */
  {
    const { ctx, page } = await open(browser, M.detecteur, ['0', '1', '2', '3', '4'], { tag: 'revisit' });
    const body = await page.locator('body').innerText();
    check('revisit: completed module opens every step', !/Étape verrouillée|verrouillé/i.test(body), body.slice(0, 400));
    const chips = page.locator('div[role="group"][aria-label="Nombre de rangées"]');
    check('revisit: the manipulation is still present', (await chips.count()) >= 1);
    await ctx.close();
  }

  /* ── 11. Mobile pass ──────────────────────────────────────────── */
  for (const [name, url, seed] of [
    ['M4', M.detecteur, ['0', '1', '2', '3']],
    ['M3', M.grille, ['0', '1', '2']],
    ['M6', M.arbre, ['0', '1', '2', '3', '4', '5']],
    ['M7', M.labo, ['0', '1', '2', '3', '4', '5', '6']],
  ]) {
    const { ctx, page } = await open(browser, url, seed, { mobile: true, tag: `${name}-mobile` });
    const overflow = await page.evaluate(
      () => document.scrollingElement.scrollWidth - window.innerWidth,
    );
    check(`${name} mobile: no horizontal page scroll`, overflow <= 1, `overflow ${overflow}px`);

    const small = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('main button').forEach((b) => {
        if (b.disabled) return;
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40) {
          out.push(`${(b.getAttribute('aria-label') || b.textContent).trim().slice(0, 18)}:${Math.round(r.height)}`);
        }
      });
      return out;
    });
    check(`${name} mobile: tap targets ≥ 40 px`, small.length === 0, small.slice(0, 6).join(', '));

    // A real touch tap must work on the primary control.
    if (name === 'M4') {
      const chip = rectangle(page, 'Rectangle-Détecteur pour 36 boîtes')
        .locator('div[role="group"][aria-label="Nombre de rangées"] button[aria-label^="6 rangées"]').first();
      if (await chip.count()) {
        await chip.tap({ force: true });
        await page.waitForTimeout(300);
        const t = await page.locator('body').innerText();
        check('M4 mobile: tapping a chip completes the rectangle', /reste 0|bac « reste » vide/i.test(t));
      }
    }
    await page.screenshot({ path: `${SHOT_DIR}md-${name.toLowerCase()}-mobile.png` });
    await ctx.close();
  }

  /* ── 12. Zero console/page errors across the run ──────────────── */
  check('no console/page errors across the run', errs.length === 0, errs.slice(0, 8).join(' | '));

  await browser.close();
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => {
  console.error('RUNNER CRASH', e);
  process.exit(2);
});
