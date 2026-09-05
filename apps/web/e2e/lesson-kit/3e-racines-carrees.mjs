// End-to-end smoke test for the rebuilt 3e lesson « Racine carrée ».
// Run: node apps/web/e2e/lesson-kit/3e-racines-carrees.mjs
// (dev server on :5207, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5207';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/racines-carrees-3e`;
const KEY = 'u_anon_smarter_lesson_racines-carrees-3e';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  diag: `${LESSON}/mission-de-depart`,
  jardin: `${LESSON}/le-jardin-carre`,
  parfaits: `${LESSON}/carres-parfaits`,
  reconstruire: `${LESSON}/le-carre-a-reconstruire`,
  pavage: `${LESSON}/pavage-et-produit`,
  simplifier: `${LESSON}/simplifier-une-racine`,
  pythagore: `${LESSON}/pythagore-et-cie`,
  boss: `${LESSON}/mission-finale`,
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
const body = (page) => page.locator('body').innerText();

// Progress persistence — THE defect of the pre-kit lesson: no module ever
// called useProgress, so completedModules stayed empty forever.
const readCompleted = (page) =>
  page.evaluate((key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}').completedModules || [];
    } catch {
      return null;
    }
  }, KEY);

async function open(browser, url, completedModules, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1600 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || 'rc');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, LESSON, null, { tag: 'index' });
    const b = await body(page);
    check('index: loads', b.length > 200, `body ${b.length} chars`);
    check('index: module 0 card present', /Mission de départ/i.test(b));
    check('index: signature module listed', /carré à reconstruire/i.test(b));
    check('index: boss listed', /Mission finale/i.test(b));
    check('index: no NaN', !/NaN/.test(b));
    check('index: total duration is 78 min', /78\s*min/i.test(b), b.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}rc-index.png` });
    await ctx.close();
  }

  /* ── 2. Diagnostic non-blocking ───────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, M.diag, null, { tag: 'diag' });
    const opts = page.locator('div[role="group"] > button[aria-pressed]');
    const n = await opts.count();
    check('diagnostic: renders options', n >= 12, `${n} options`);
    for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 2000 }).catch(() => {});
    const submit = page.locator('button:has-text("Voir mon résultat")');
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(700);
    }
    const b = await body(page);
    check('diagnostic: reaches a result', /\/\s*10|score|résultat/i.test(b));
    check('diagnostic: never blocks the way forward', !/verrouill/i.test(b));
    check('diagnostic: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}rc-diagnostic.png` });
    await ctx.close();
  }

  /* ── 3. M1 — SquareLab forward/reverse: 49 → 7, then 50 fails ─────── */
  {
    const { ctx, page } = await open(browser, M.jardin, ['0'], { tag: 'm1' });
    const head = await body(page);
    check('M1: header shows module 1 of 8', /Module\s*1\s*\/\s*8/i.test(head), head.slice(0, 200));
    check('M1: no NaN', !/NaN/.test(head));
    check('M1: SquareLab rendered', (await page.locator('svg[role="group"]').count()) >= 1);

    // Wrong on purpose first: the classic « half the area » misconception is
    // out of range, so tap 5 (25 m² — too small), the gap must be quantified.
    await page.locator('button[aria-label="Côté égale 5"]').first().click();
    await page.waitForTimeout(400);
    const wrong = await body(page);
    check('M1: a wrong side quantifies the missing area', /il manque/i.test(wrong) && /m²/.test(wrong), wrong.slice(0, 500));

    // Now the real goal: 7 × 7 = 49.
    await page.locator('button[aria-label="Côté égale 7"]').first().click();
    await page.waitForTimeout(600);
    const solved = await body(page);
    check('M1: step 1 completes on the mathematical goal (side 7)', /le côté du jardin mesure/i.test(solved), solved.slice(0, 600));

    // Step 2: 50 m² — neither 7 nor 7,1 lands on it.
    const plus = page.locator('button[aria-label="Augmenter le côté de 0,1"]');
    const setSeven = page.locator('button[aria-label="Côté égale 7"]');
    if ((await setSeven.count()) > 1) {
      await setSeven.nth(1).click();
      await page.waitForTimeout(350);
      await plus.nth(1).click();
      await page.waitForTimeout(700);
    }
    const step2 = await body(page);
    check('M1: 50 m² is never hit exactly (7 too small, 7,1 too big)', /sans jamais tomber dessus/i.test(step2), step2.slice(-900));
    await page.screenshot({ path: `${SHOT_DIR}rc-m1-jardin.png`, fullPage: true });

    // Step 3: the naming question, answered WRONG on purpose.
    const half = page.locator('button', { hasText: '18' }).first();
    if (await half.isVisible().catch(() => false)) {
      await half.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M1: wrong answer shows the correction', /Bonne réponse/i.test(w));
      check('M1: correction explains the maths, not a bare « Faux »', /moitié|multiplié/i.test(w));
    } else {
      check('M1: naming question reachable', false, 'option not visible');
    }

    // PERSISTENCE — the pre-kit lesson's core defect.
    await page.locator('button[aria-label="Côté égale 6"]').first().click().catch(() => {});
    await page.waitForTimeout(1200);
    const done = await readCompleted(page);
    check('M1: progress persisted — module 1 in completedModules', Array.isArray(done) && done.includes('1'), JSON.stringify(done));
    await ctx.close();
  }

  /* ── 4. M2 — SquareStaircase: all 12 perfect squares ──────────────── */
  {
    const { ctx, page } = await open(browser, M.parfaits, ['0', '1'], { tag: 'm2' });
    const head = await body(page);
    check('M2: header shows module 2 of 8', /Module\s*2\s*\/\s*8/i.test(head));
    check('M2: no NaN', !/NaN/.test(head));

    for (let n = 1; n <= 12; n += 1) {
      await page.locator(`button[aria-label="Marche ${n}"]`).first().click().catch(() => {});
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(700);
    const stair = await body(page);
    check('M2: staircase completes on all 12 perfect squares', /Voilà le répertoire/i.test(stair), stair.slice(0, 700));
    check('M2: names the gap between 49 and 64', /aucun/i.test(stair));
    await page.screenshot({ path: `${SHOT_DIR}rc-m2-escalier.png`, fullPage: true });

    // Step 2: BatchChoiceQuestion — one row answered wrong on purpose (20 → « oui »).
    // Each row exposes its own role="group"; the staircase group is skipped by
    // requiring a « oui »/« non » button inside.
    const batchRows = page.locator('div[role="group"]:has(button:text-is("oui"))');
    const nRows = await batchRows.count();
    check('M2: batch question has its 5 rows', nRows === 5, `${nRows} rows`);
    for (let i = 0; i < nRows; i += 1) {
      // Always pick « oui » — correct for 81, 100, 144 and WRONG for 20, 50.
      await batchRows.nth(i).locator('button:text-is("oui")').first().click().catch(() => {});
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(700);
    const batch = await body(page);
    check('M2: a wrong batch row is corrected with the squares', /16 < 20 < 25|49 < 50 < 64/.test(batch), batch.slice(0, 900));
    check('M2: batch correction names the rule', /carré parfait/i.test(batch));

    // Step 3: place √20 — deliberately wrong at 10 (the « half » trap).
    const ten = page.locator('button[aria-label="Placer sur 10"]').first();
    if (await ten.isVisible().catch(() => false)) {
      await ten.click();
      await page.waitForTimeout(250);
      await page.locator('button:has-text("Vérifier")').first().click();
      await page.waitForTimeout(600);
      const bad = await body(page);
      check('M2: placing √20 at 10 is refuted with numbers', /moitié/i.test(bad), bad.slice(-700));

      await page.locator('button[aria-label="Placer sur 4,5"]').first().click();
      await page.waitForTimeout(250);
      await page.locator('button:has-text("Vérifier")').first().click();
      await page.waitForTimeout(600);
      const good = await body(page);
      check('M2: √20 accepted between 4 and 5', /4 < \\?sqrt|Bien vu/i.test(good), good.slice(-500));
    } else {
      check('M2: number-line placement reachable', false, 'chips not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}rc-m2-droite.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. M3 — SIGNATURE: SquareLab reverse on area 20 ──────────────── */
  {
    const { ctx, page } = await open(browser, M.reconstruire, ['0', '1', '2'], { tag: 'm3' });
    const head = await body(page);
    check('M3: header shows module 3 of 8', /Module\s*3\s*\/\s*8/i.test(head));
    check('M3: no NaN', !/NaN/.test(head));
    check('M3: signature SquareLab rendered', (await page.locator('svg[role="group"]').count()) >= 1);

    // Too small (4 → 16), then too big (5 → 25): the encadrement is the goal.
    await page.locator('button[aria-label="Côté égale 4"]').first().click();
    await page.waitForTimeout(450);
    const low = await body(page);
    check('M3: side 4 quantifies the missing area (16 vs 20)', /il manque/i.test(low), low.slice(0, 600));

    await page.locator('button[aria-label="Côté égale 5"]').first().click();
    await page.waitForTimeout(800);
    const bracketed = await body(page);
    check('M3: signature manipulation completes on the encadrement', /aucun nombre décimal ne tombe juste/i.test(bracketed), bracketed.slice(0, 900));
    check('M3: names √20 and its bracket 4 … 5', /4/.test(bracketed) && /5/.test(bracketed));
    await page.screenshot({ path: `${SHOT_DIR}rc-m3-signature.png`, fullPage: true });

    // Step 2: bracket √50 — wrong on purpose (the first option, 6 < √50 < 7).
    const bracketOptions = page.locator('div[role="group"] > button[aria-pressed]');
    const nBracket = await bracketOptions.count();
    check('M3: the bracket question offers its options', nBracket >= 3, `${nBracket} options`);
    if (nBracket >= 1) {
      await bracketOptions.first().click({ force: true });
      await page.waitForTimeout(700);
      const w = await body(page);
      check('M3: a wrong bracket is corrected with the squares', /Bonne réponse/i.test(w) && /(49|64)/.test(w), w.slice(-800));
    } else {
      check('M3: a wrong bracket is corrected with the squares', false, 'no options');
    }

    // Step 3 and 4: (√13)² and comparing √50 to 7.
    const groups = page.locator('div[role="group"]');
    const nG = await groups.count();
    for (let i = 0; i < nG; i += 1) {
      const btn = groups.nth(i).locator('button:not([disabled])').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(800);
    const after = await body(page);
    check('M3: (√a)² step reveals the correction', /Bonne réponse|s’annulent|annulent/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}rc-m3-compare.png`, fullPage: true });

    const done = await readCompleted(page);
    check('M3: progress persisted for the visited modules', Array.isArray(done) && done.includes('0'), JSON.stringify(done));
    await ctx.close();
  }

  /* ── 6. M4 — SquareComposer: product works, addition breaks ───────── */
  {
    const { ctx, page } = await open(browser, M.pavage, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await body(page);
    check('M4: header shows module 4 of 8', /Module\s*4\s*\/\s*8/i.test(head));
    check('M4: no NaN', !/NaN/.test(head));

    // Test a second pair of areas: the product rule must hold again.
    await page.locator('button[aria-label="A = 16"]').first().click();
    await page.waitForTimeout(600);
    const prod = await body(page);
    check('M4: product step completes over two different pairs', /paires testées/i.test(prod), prod.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}rc-m4-produit.png`, fullPage: true });

    // The addition trap: answer « Vrai » on purpose.
    const vrai = page.locator('button', { hasText: 'Vrai' }).first();
    if (await vrai.isVisible().catch(() => false)) {
      await vrai.click();
      await page.waitForTimeout(600);
      const trap = await body(page);
      check('M4: « √9 + √16 = √25 » is refuted with 3 + 4 = 7 vs 5', /piège/i.test(trap) && /Bonne réponse/i.test(trap), trap.slice(-800));
    } else {
      check('M4: addition trap reachable', false, 'Vrai not visible');
    }

    // Steps 3 and 4: the product then the quotient rule.
    const groups = page.locator('div[role="group"]');
    const nG = await groups.count();
    for (let i = 0; i < nG; i += 1) {
      const btn = groups.nth(i).locator('button:not([disabled])').last();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(700);
    const rules = await body(page);
    check('M4: the product rule is named after the gesture', /\\?sqrt|racine du produit|une seule racine/i.test(rules));
    await page.screenshot({ path: `${SHOT_DIR}rc-m4-somme.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. M5 — SquareTiling: 12 = 2² × 3 → 2√3 ──────────────────────── */
  {
    const { ctx, page } = await open(browser, M.simplifier, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await body(page);
    check('M5: header shows module 5 of 8', /Module\s*5\s*\/\s*8/i.test(head));
    check('M5: no NaN', !/NaN/.test(head));

    // A deliberately impossible tiling first: 3×3 does not divide 12.
    await page.locator('button[aria-label="Découper en 3 sur 3"]').first().click();
    await page.waitForTimeout(500);
    const bad = await body(page);
    check('M5: an impossible tiling says exactly why', /n’est pas un nombre entier|ne se divise pas/i.test(bad), bad.slice(0, 800));

    // The right one: 2×2 → cells of area 3 → 2√3.
    await page.locator('button[aria-label="Découper en 2 sur 2"]').first().click();
    await page.waitForTimeout(800);
    const good = await body(page);
    check('M5: tiling completes on the largest square factor', /quatre cases d’aire 3|quatre cases d'aire 3/i.test(good), good.slice(0, 900));
    check('M5: « À retenir » block present', /À retenir/i.test(good));
    await page.screenshot({ path: `${SHOT_DIR}rc-m5-pavage.png`, fullPage: true });

    // The 2√3 = √6 trap, answered wrong on purpose.
    const six = page.locator('button', { hasText: '6' }).first();
    if (await six.isVisible().catch(() => false)) {
      await six.click().catch(() => {});
      await page.waitForTimeout(600);
      const w = await body(page);
      check('M5: a wrong simplification still reveals the correction', /Bonne réponse|carré parfait/i.test(w));
    }
    await ctx.close();
  }

  /* ── 8. M6 — Pythagore: exact form + decimal reveal ───────────────── */
  {
    const { ctx, page } = await open(browser, M.pythagore, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await body(page);
    check('M6: header shows module 6 of 8', /Module\s*6\s*\/\s*8/i.test(head));
    check('M6: no NaN', !/NaN/.test(head));

    // Step 1: the « diagonal = two sides » trap, on purpose.
    const ten = page.locator('button', { hasText: '10' }).first();
    if (await ten.isVisible().catch(() => false)) {
      await ten.click().catch(() => {});
      await page.waitForTimeout(600);
      const w = await body(page);
      check('M6: « diagonal = 10 cm » is refuted geometrically', /Bonne réponse/i.test(w) && /plus court|bout à bout/i.test(w), w.slice(0, 900));
    } else {
      check('M6: diagonal question reachable', false, 'option not visible');
    }

    // Step 2: DECIMAL reveal — answer 7 (the √49 confusion) then see 7,1.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('7');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(700);
      const r = await body(page);
      check('M6: decimal answer revealed with the French comma', /Ta réponse/i.test(r) && /7,1/.test(r), r.slice(-900));
      check('M6: exact vs rounded is spelled out', /EXACTE|exacte/i.test(r));
    } else {
      check('M6: numeric rounding question reachable', false, 'no input visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}rc-m6-pythagore.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Boss: silent → submit → profil → synthèse → completion ────── */
  {
    const { ctx, page } = await open(browser, M.boss, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'boss' });
    const b = await body(page);
    check('boss: renders', /Boss final|Mission finale/i.test(b));
    check('boss: no NaN', !/NaN/.test(b));
    check('boss: silent before submit', !/Bonne réponse/i.test(b));
    check('boss: registre chips shown', /par les carrés/i.test(b));

    const groups = page.locator('div[role="group"]');
    const nGroups = await groups.count();
    for (let i = 0; i < nGroups; i += 1) {
      const btn = groups.nth(i).locator('button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
    }
    await page.waitForTimeout(500);
    const submit = page.locator('button').filter({ hasText: /Valider mes/ }).first();
    check('boss: submit enabled once every épreuve is answered', await submit.isEnabled().catch(() => false));
    await submit.click();
    await page.waitForTimeout(1200);

    const after = await body(page);
    check('boss: submitting produces a score out of 10', /\/\s*10/.test(after), after.slice(0, 200));
    check('boss: review shows corrections', /Bonne réponse|Ta réponse/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}rc-boss-review.png` });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(800);
    const profil = await body(page);
    check('boss: profile of mastery reachable', /profil de maîtrise/i.test(profil));

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(1000);
    const synth = await body(page);
    check('boss: synthèse reuses the frozen SquareLab (49 → 7)', /jardin de 49/i.test(synth), synth.slice(0, 400));
    check('boss: synthèse reuses the frozen tiling of 12', /découpé en quatre/i.test(synth));
    check('boss: completion banner shown', /Mission accomplie|Bâtisseur de carrés/i.test(synth));
    check('boss: synthèse has no NaN', !/NaN/.test(synth));
    const frozenSvgs = await page.locator('svg[role="img"]').count();
    check('boss: frozen visuals rendered', frozenSvgs >= 2, `${frozenSvgs} frozen svg`);
    await page.screenshot({ path: `${SHOT_DIR}rc-boss-synthese.png`, fullPage: true });

    // Reload the SAME page/context: useFinalTestAttempt persists per browser,
    // so a fresh context would legitimately start blank.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    const reloaded = await body(page);
    check('boss: reload shows the saved review', /Résultat du défi|Refaire le test/i.test(reloaded), reloaded.slice(0, 300));

    const redo = page.locator('button:has-text("Refaire le test")').first();
    if (await redo.isVisible().catch(() => false)) {
      await redo.click();
      await page.waitForTimeout(900);
      const reset = await body(page);
      check('boss: « Refaire le test » resets to a silent quiz', !/Ta réponse/i.test(reset) && /Valider mes/i.test(reset));
    } else {
      check('boss: redo button present after reload', false, 'not visible');
    }
    await ctx.close();
  }

  /* ── 10. Progress persistence across a whole module ───────────────── */
  {
    const { ctx, page } = await open(browser, M.simplifier, ['0', '1', '2', '3', '4'], { tag: 'persist' });
    const before = await readCompleted(page);
    check('persistence: seeded modules readable', Array.isArray(before) && before.includes('4'), JSON.stringify(before));

    // Visiting + completing must ADD module 5, never wipe what was there.
    await page.locator('button[aria-label="Découper en 2 sur 2"]').first().click();
    await page.waitForTimeout(1400);
    const mid = await readCompleted(page);
    check(
      'persistence: earlier modules are never wiped by a new write',
      Array.isArray(mid) && ['0', '1', '2', '3', '4'].every((m) => mid.includes(m)),
      JSON.stringify(mid),
    );
    await ctx.close();
  }

  /* ── 11. Revisit a completed module: every step open ──────────────── */
  {
    const { ctx, page } = await open(browser, M.reconstruire, ['0', '1', '2', '3'], { tag: 'revisit' });
    const b = await body(page);
    check('revisit: completed module opens every step', !/Étape verrouillée|verrouill/i.test(b), b.slice(0, 300));
    check('revisit: footer recap visible on a completed module', /dans les deux sens/i.test(b));
    check('revisit: no NaN', !/NaN/.test(b));
    await ctx.close();
  }

  /* ── 12. Mobile pass on every bespoke manipulative ────────────────── */
  const MOBILE = [
    ['M1', M.jardin, ['0']],
    ['M2', M.parfaits, ['0', '1']],
    ['M3', M.reconstruire, ['0', '1', '2']],
    ['M4', M.pavage, ['0', '1', '2', '3']],
    ['M5', M.simplifier, ['0', '1', '2', '3', '4']],
  ];
  for (const [name, url, seed] of MOBILE) {
    const { ctx, page } = await open(browser, url, seed, { mobile: true, tag: `${name}-mobile` });
    const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
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

    const anyTap = page.locator('main button:visible').first();
    if (await anyTap.isVisible().catch(() => false)) {
      await anyTap.tap().catch(() => {});
      await page.waitForTimeout(400);
    }
    check(`${name} mobile: no NaN after a touch interaction`, !/NaN/.test(await body(page)));
    await page.screenshot({ path: `${SHOT_DIR}rc-${name.toLowerCase()}-mobile.png` });
    await ctx.close();
  }

  /* ── 13. Zero console/page errors ─────────────────────────────────── */
  check('no console/page errors across the run', errs.length === 0, errs.slice(0, 8).join(' | '));

  await browser.close();
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => {
  console.error('RUNNER CRASH', e);
  process.exit(2);
});
