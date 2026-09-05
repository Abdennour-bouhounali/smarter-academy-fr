// End-to-end smoke test for the 3e lesson « Calcul littéral et algébrique ».
// Run: node apps/web/e2e/lesson-kit/3e-calcul-litteral.mjs
// (dev server on :5202, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5202';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/calcul-litteral-algebrique`;
const KEY = 'u_anon_smarter_lesson_calcul-litteral-algebrique';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const M = {
  diag: `${LESSON}/mission-de-depart`,
  bordure: `${LESSON}/trois-formules-pour-une-bordure`,
  termes: `${LESSON}/termes-et-facteurs`,
  reduire: `${LESSON}/reduire-sans-se-tromper`,
  rect: `${LESSON}/le-rectangle-daire`,
  carre: `${LESSON}/le-carre-de-cote-a-plus-b`,
  factoriser: `${LESSON}/factoriser-le-chemin-inverse`,
  choisir: `${LESSON}/choisir-la-bonne-forme`,
  boss: `${LESSON}/mission-finale-le-jardin-de-maya`,
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
  watchErrors(page, opts.tag || 'cl');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

/** Count the transparent SVG hit rects of an AlgebraRect (never "visible"). */
const pieceHits = (page) => page.locator('svg rect[role="button"][aria-label^="Compter le morceau"]');

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, LESSON, null, { tag: 'index' });
    const b = await body(page);
    check('index: loads', b.length > 200, `body ${b.length} chars`);
    check('index: module 0 card present', /Mission de départ/i.test(b));
    check('index: signature module listed', /rectangle d’aire|rectangle d'aire/i.test(b));
    check('index: boss listed', /Mission finale/i.test(b));
    check('index: no NaN', !/NaN/.test(b));
    check('index: total duration is 85 min', /85\s*min/i.test(b), b.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}cl-index.png` });
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
    await page.screenshot({ path: `${SHOT_DIR}cl-diagnostic.png` });
    await ctx.close();
  }

  /* ── 3. M1 — BorderPattern + first ValueTable ─────────────────────── */
  {
    const { ctx, page } = await open(browser, M.bordure, ['0'], { tag: 'm1' });
    const head = await body(page);
    check('M1: header shows module 1 of 9', /Module\s*1\s*\/\s*9/i.test(head), head.slice(0, 200));
    check('M1: no NaN', !/NaN/.test(head));

    // Wrong on purpose: 8 (the « forgot the corners » trap) then the real answer.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('8');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(700);
      const w = await body(page);
      check('M1: a wrong count is corrected with the maths', /Ta réponse/i.test(w) && /coins/i.test(w), w.slice(0, 700));
    } else {
      check('M1: numeric count reachable', false, 'no input');
    }

    // Step 2 unlocks step 3: answer « Les trois » (the fourth option).
    const trois = page.locator('button[aria-pressed]').filter({ hasText: 'Les trois' }).first();
    if (await trois.count()) { await trois.click({ force: true }); await page.waitForTimeout(800); }
    check('M1: the three-formulas question is answerable', (await body(page)).includes('Les trois'));

    // Step 3: three chips on the ValueTable.
    for (const v of [1, 2, 3]) {
      await page.locator(`button[aria-label="Tester n = ${v}"]`).first().click().catch(() => {});
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(700);
    const t = await body(page);
    check('M1: value table completes on 3 tested values', /expression littérale/i.test(t), t.slice(-900));
    check('M1: names « même expression »', /même expression/i.test(t));
    await page.screenshot({ path: `${SHOT_DIR}cl-m1-bordure.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. M3 — merge refusal, then the 3x + 2 vs 5x tester ──────────── */
  {
    const { ctx, page } = await open(browser, M.reduire, ['0', '1', '2'], { tag: 'm3' });
    const head = await body(page);
    check('M3: header shows module 3 of 9', /Module\s*3\s*\/\s*9/i.test(head));
    check('M3: no NaN', !/NaN/.test(head));

    // Wrong on purpose: 5x with −8 — unlike terms, the merge must be REFUSED.
    const cards = page.locator('button[aria-label^="Terme "]');
    const nCards = await cards.count();
    check('M3: term cards rendered', nCards >= 4, `${nCards} cards`);
    await cards.nth(0).click();          // 5x
    await page.waitForTimeout(200);
    await cards.nth(1).click();          // −8
    await page.waitForTimeout(600);
    const refused = await body(page);
    check('M3: an unlike merge is refused with the tile reason', /Empilement refusé/i.test(refused) && /tuile/i.test(refused), refused.slice(0, 800));

    // Now the real goal: 5x with −2x, then −8 with +3.
    const tapTerm = async (label) => {
      const btn = page.locator(`button[aria-label="Terme ${label}"]`).first();
      if (await btn.count()) { await btn.click({ force: true }).catch(() => {}); await page.waitForTimeout(280); }
    };
    await tapTerm('5x'); await tapTerm('−2x');
    await page.waitForTimeout(450);
    await tapTerm('−8'); await tapTerm('3');
    await page.waitForTimeout(900);
    const reduced = await body(page);
    check('M3: step 1 completes on the reduced form 3x − 5', /3x\s*[−-]\s*5/.test(reduced) && /Réduire/i.test(reduced), reduced.slice(0, 1400));
    check('M3: the word « réduire » is named after the gesture', /forme de tuile/i.test(reduced));
    await page.screenshot({ path: `${SHOT_DIR}cl-m3-reduire.png`, fullPage: true });

    // Step 2: 4x² − x − 3x² — one merge, the −x stays alone.
    await tapTerm('4x²'); await tapTerm('−3x²');
    await page.waitForTimeout(900);
    const step2 = await body(page);
    check('M3: step 2 completes leaving x² − x', /x²\s*[−-]\s*x/.test(step2), step2.slice(0, 1600));

    // Step 3: predict WRONG on purpose, then the x = 1 trap and x = 2.
    const predict = page.locator('button[aria-pressed]').filter({ hasText: 'Oui, on additionne 3 et 2' }).first();
    if (await predict.count()) {
      await predict.click({ force: true });
      await page.waitForTimeout(800);
      const pr = await body(page);
      check('M3: the wrong prediction still reveals the correction', /Bonne réponse/i.test(pr), pr.slice(-900));
    } else {
      check('M3: prediction question reachable', false, 'not visible');
    }
    await page.locator('button[aria-label="Tester x = 1"]').first().click().catch(() => {});
    await page.waitForTimeout(700);
    const one = await body(page);
    check('M3: x = 1 is presented as a trap, not a proof', /ça prouve quelque chose|surprise/i.test(one), one.slice(-900));
    await page.locator('button[aria-label="Tester x = 2"]').first().click().catch(() => {});
    await page.waitForTimeout(900);
    const two = await body(page);
    check('M3: x = 2 kills the equality (8 vs 10)', /8 d’un côté|8 d'un côté/i.test(two), two.slice(-1100));
    check('M3: names the tester rule', /réfute/i.test(two));
    await page.screenshot({ path: `${SHOT_DIR}cl-m3-tester.png`, fullPage: true });

    const done = await readCompleted(page);
    check('M3: progress persisted', Array.isArray(done) && done.includes('0'), JSON.stringify(done));
    await ctx.close();
  }

  /* ── 5. M4 — SIGNATURE AlgebraRect: split + count reaches the goal ── */
  {
    const { ctx, page } = await open(browser, M.rect, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await body(page);
    check('M4: header shows module 4 of 9', /Module\s*4\s*\/\s*9/i.test(head));
    check('M4: no NaN', !/NaN/.test(head));
    check('M4: AlgebraRect rendered', (await page.locator('svg[role="group"]').count()) >= 1);

    // Before splitting, no piece is countable — the gesture has an order.
    check('M4: pieces locked before the split', (await pieceHits(page).count()) === 0, `${await pieceHits(page).count()} hits`);

    await page.locator('button[aria-label^="Séparer le côté x + 2"]').first().click();
    await page.waitForTimeout(500);
    const hits = pieceHits(page);
    const nHits = await hits.count();
    check('M4: splitting a side unlocks its 2 pieces', nHits === 2, `${nHits} hit rects`);

    // Count only ONE piece: the incompleteness must be quantified.
    await hits.nth(0).click({ force: true });
    await page.waitForTimeout(500);
    const partial = await body(page);
    check('M4: one counted piece quantifies the gap', /1 morceau encore gris|Il reste 1 morceau/i.test(partial), partial.slice(0, 900));

    await pieceHits(page).nth(1).click({ force: true });
    await page.waitForTimeout(800);
    const solved = await body(page);
    check('M4: signature manipulation completes on the real goal', /3\(x \+ 2\) = 3x \+ 6|Développer/i.test(solved), solved.slice(0, 1100));
    check('M4: the word « développer » is named after the gesture', /distributivité/i.test(solved));
    await page.screenshot({ path: `${SHOT_DIR}cl-m4-rectangle.png`, fullPage: true });

    // Step 2: the 8x − 3 trap, seen as a grey piece.
    await page.locator('button[aria-label^="Séparer le côté 2x − 3"]').first().click().catch(() => {});
    await page.waitForTimeout(500);
    const hits2 = pieceHits(page);
    const n2 = await hits2.count();
    check('M4: the 4 × (2x − 3) rectangle exposes 2 pieces', n2 >= 2, `${n2} hits`);
    if (n2 >= 2) {
      await hits2.nth(n2 - 2).click({ force: true });
      await page.waitForTimeout(600);
      const trap = await body(page);
      check('M4: one piece counted names the 8x − 3 misconception', /8x\s*[−-]\s*3/.test(trap), trap.slice(0, 1200));
      await pieceHits(page).last().click({ force: true });
      await page.waitForTimeout(700);
      const full = await body(page);
      check('M4: both pieces counted gives 8x − 12', /8x\s*[−-]\s*12/.test(full), full.slice(0, 1400));
    }
    await page.screenshot({ path: `${SHOT_DIR}cl-m4-negatif.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. M5 — the (a + b)² square: 4 pieces + merge ────────────────── */
  {
    const { ctx, page } = await open(browser, M.carre, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await body(page);
    check('M5: header shows module 5 of 9', /Module\s*5\s*\/\s*9/i.test(head));
    check('M5: no NaN', !/NaN/.test(head));

    // Wrong prediction on purpose: a² + b² is the FIRST option of the grid.
    const grid = page.locator('div[role="group"] > button[aria-pressed]');
    const nOpts = await grid.count();
    check('M5: the prediction offers its 4 options', nOpts === 4, `${nOpts} options`);
    await grid.nth(0).click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
    const pred = await body(page);
    check('M5: the a² + b² prediction is corrected, not blocked', /Bonne réponse/i.test(pred) && /gris/i.test(pred), pred.slice(0, 1100));

    // Split both sides, count the four pieces, merge the two ab.
    const splits = page.locator('button[aria-label^="Séparer le côté a + b"]');
    const nSplit = await splits.count();
    check('M5: two side buttons offered', nSplit === 2, `${nSplit} buttons`);
    await splits.nth(0).click();
    await page.waitForTimeout(400);
    await page.locator('button[aria-label^="Séparer le côté a + b"]:not([disabled])').first().click();
    await page.waitForTimeout(600);

    const sq = pieceHits(page);
    const nSq = await sq.count();
    check('M5: the square exposes its 4 pieces', nSq === 4, `${nSq} hits`);
    // Count a² and b² only first: exactly the misconception, visible as 2 greys.
    await sq.nth(0).click({ force: true });
    await page.waitForTimeout(250);
    await pieceHits(page).nth(3).click({ force: true });
    await page.waitForTimeout(700);
    const twoOnly = await body(page);
    check('M5: counting only a² and b² names the misconception', /rectangles ab dorment|a² \+ b²/i.test(twoOnly), twoOnly.slice(0, 1200));

    await pieceHits(page).nth(1).click({ force: true });
    await page.waitForTimeout(250);
    await pieceHits(page).nth(2).click({ force: true });
    await page.waitForTimeout(600);
    const merge = page.locator('button[aria-label="Regrouper les deux morceaux semblables"]').first();
    check('M5: merge enabled once all 4 pieces are counted', await merge.isEnabled().catch(() => false));
    await merge.click();
    await page.waitForTimeout(800);
    const done = await body(page);
    check('M5: the square manipulation completes on a² + 2ab + b²', /identité remarquable/i.test(done), done.slice(0, 1400));
    await page.screenshot({ path: `${SHOT_DIR}cl-m5-carre.png`, fullPage: true });

    // Step 3: two tested values.
    for (const v of [3, 5]) {
      await page.locator(`button[aria-label="Tester a = ${v}"]`).first().click().catch(() => {});
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(700);
    const tested = await body(page);
    check('M5: the tester shows 25 vs 13 for a = 3', /25/.test(tested) && /13/.test(tested), tested.slice(-1000));

    // Step 4: the slide toggle.
    await page.locator('button[aria-label="Faire glisser le morceau découpé"]').first().click().catch(() => {});
    await page.waitForTimeout(700);
    const slid = await body(page);
    check('M5: the slide toggle proves a² − b² = (a + b)(a − b)', /Rien n’a été ajouté|Rien n'a été ajouté/i.test(slid), slid.slice(-900));
    await page.screenshot({ path: `${SHOT_DIR}cl-m5-glisse.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 7. M6 — the common factor must be tapped in BOTH terms ──────── */
  {
    const { ctx, page } = await open(browser, M.factoriser, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await body(page);
    check('M6: header shows module 6 of 9', /Module\s*6\s*\/\s*9/i.test(head));
    check('M6: no NaN', !/NaN/.test(head));

    // Wrong on purpose: only the 3 of 6x — the 3(2x + 9) trap must be named.
    await page.locator('button[aria-label="Facteur 3 de 6x"]').first().click();
    await page.waitForTimeout(700);
    const half = await body(page);
    check('M6: one term only names the 3(2x + 9) trap', /3\(2x \+ 9\)/.test(half), half.slice(0, 1000));

    await page.locator('button[aria-label="Facteur 3 de 9"]').first().click();
    await page.waitForTimeout(900);
    const built = await body(page);
    check('M6: both terms tapped rebuilds the rectangle', /Factoriser/i.test(built) && /hauteur/i.test(built), built.slice(0, 1400));
    check('M6: the factored form 3(2x + 3) is written', /3\(2x\s*\+\s*3\)/.test(built), built.slice(0, 1600));
    check('M6: rebuilt AlgebraRect is frozen', (await page.locator('svg[role="img"]').count()) >= 1);
    await page.screenshot({ path: `${SHOT_DIR}cl-m6-factoriser.png`, fullPage: true });

    // Step 2 — x² − 25, answered WRONG on purpose ((x − 5)², the first option).
    // The value-table chips also carry aria-pressed, so the option grid is
    // picked by excluding any group that holds a « Tester … » chip.
    const optionGrid = (pg) => pg.locator('div[role="group"]:has(> button[aria-pressed]):not(:has(button[aria-label^="Tester"]))');
    const grids = optionGrid(page);
    const nGrids = await grids.count();
    check('M6: the x² − 25 question offers an option grid', nGrids >= 1, `${nGrids} grids`);
    if (nGrids >= 1) {
      await grids.last().locator('button[aria-pressed]').first().click({ force: true });
      await page.waitForTimeout(900);
      const w = await body(page);
      check('M6: a wrong factorisation shows the correction', /Bonne réponse/i.test(w), w.slice(-1100));
    } else {
      check('M6: a wrong factorisation shows the correction', false, 'no grid');
    }

    // Step 3 — recognise (x + 3)², answered RIGHT (the first option).
    const grids3 = optionGrid(page);
    if ((await grids3.count()) >= 1) {
      await grids3.last().locator('button[aria-pressed]').first().click({ force: true });
      await page.waitForTimeout(900);
    }
    const sqr = await body(page);
    check('M6: the square recognition rebuilds a frozen square', /côté x\s*\+\s*3/i.test(sqr), sqr.slice(-1500));

    // Step 4 — « À retenir » is read-only: no fake interaction, but it opens.
    const retenir = await body(page);
    check('M6: « À retenir » card present and unlocked', /À retenir/i.test(retenir) && !/À retenir — termine/i.test(retenir), retenir.slice(-900));
    await page.screenshot({ path: `${SHOT_DIR}cl-m6-retenir.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 8. M7 — goal-driven choice + explicit hand-off ───────────────── */
  {
    const { ctx, page } = await open(browser, M.choisir, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'm7' });
    const head = await body(page);
    check('M7: header shows module 7 of 9', /Module\s*7\s*\/\s*9/i.test(head));
    check('M7: no NaN', !/NaN/.test(head));

    // Step 1: pick the developed form, then the DECIMAL-capable numeric answer.
    const first = page.locator('div[role="group"] > button[aria-pressed]').first();
    await first.click({ force: true });
    await page.waitForTimeout(700);
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('10000');   // wrong on purpose: forgot the −9
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(800);
      const w = await body(page);
      check('M7: the 10 000 trap is corrected with 9 991', /9 991|9991/.test(w) && /Ta réponse/i.test(w), w.slice(0, 1200));
    } else {
      check('M7: numeric step reachable', false, 'no input');
    }
    await page.screenshot({ path: `${SHOT_DIR}cl-m7-calculer.png`, fullPage: true });

    // Step 2: the hand-off link to Équations produit nul — this lesson does not solve.
    const groups = page.locator('div[role="group"]');
    const nG = await groups.count();
    for (let i = 0; i < nG; i += 1) {
      const btn = groups.nth(i).locator('button[aria-pressed]:not([disabled])').first();
      if (await btn.count()) await btn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(900);
    const handoff = await body(page);
    check('M7: hand-off to Équations produit nul is stated', /Équations produit nul/i.test(handoff), handoff.slice(0, 1500));
    const link = page.locator('a[href$="/equations-produit"]').first();
    check('M7: hand-off link points at the equations lesson', (await link.count()) >= 1);

    // Step 3 must be answered before the step-4 chips exist: the frame area.
    const frameGrid = page.locator('div[role="group"]:has(> button[aria-pressed]):not(:has(button[aria-label^="Tester"]))');
    if ((await frameGrid.count()) >= 1) {
      await frameGrid.last().locator('button[aria-pressed]').first().click({ force: true });
      await page.waitForTimeout(900);
    }
    const frame = await body(page);
    check('M7: the frame area reduces to 8x + 16', /8x\s*\+\s*16/.test(frame), frame.slice(-1200));

    // Step 4: the two-value ritual.
    for (const v of [0, 2]) {
      await page.locator(`button[aria-label="Tester x = ${v}"]`).first().click().catch(() => {});
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(800);
    const ritual = await body(page);
    check('M7: the ritual completes on two values', /La question décide|la question décide/i.test(ritual), ritual.slice(-1100));
    await page.screenshot({ path: `${SHOT_DIR}cl-m7-ritual.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 9. Boss: silent → submit → profil → synthèse → reload → redo ── */
  {
    const { ctx, page } = await open(browser, M.boss, ['0', '1', '2', '3', '4', '5', '6', '7'], { tag: 'boss' });
    const b = await body(page);
    check('boss: renders', /Boss final|Mission finale/i.test(b));
    check('boss: no NaN', !/NaN/.test(b));
    check('boss: silent before submit', !/Bonne réponse/i.test(b));
    check('boss: registre chips shown', /4n \+ 4/.test(b) && /\(a \+ b\)²/.test(b), b.slice(0, 900));
    check('boss: ten épreuves listed', /10\s*\/\s*10/.test(b), b.slice(0, 400));

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
    await page.screenshot({ path: `${SHOT_DIR}cl-boss-review.png` });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(800);
    const profil = await body(page);
    check('boss: profile of mastery reachable', /profil de maîtrise/i.test(profil));

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(1000);
    const synth = await body(page);
    check('boss: synthèse reuses the frozen (a + b)² square', /quatre morceaux|carré de côté a \+ b/i.test(synth), synth.slice(0, 600));
    check('boss: synthèse lists the three identities', /\(a\s*\+\s*b\)\(a\s*[−-]\s*b\)/.test(synth), synth.slice(0, 1600));
    check('boss: synthèse shows the frozen value table', /25/.test(synth) && /13/.test(synth));
    check('boss: completion banner shown', /Mission accomplie|Jardinier algébriste/i.test(synth));
    check('boss: synthèse has no NaN', !/NaN/.test(synth));
    const frozenSvgs = await page.locator('svg[role="img"]').count();
    check('boss: frozen visuals rendered', frozenSvgs >= 1, `${frozenSvgs} frozen svg`);
    await page.screenshot({ path: `${SHOT_DIR}cl-boss-synthese.png`, fullPage: true });

    // Reload the SAME page/context: the saved attempt lives in this browser.
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

  /* ── 10. Seeded revisit of a completed module ─────────────────────── */
  {
    const { ctx, page } = await open(browser, M.rect, ['0', '1', '2', '3', '4'], { tag: 'revisit' });
    const b = await body(page);
    check('revisit: completed module opens every step', !/Étape verrouillée|verrouill/i.test(b), b.slice(0, 300));
    check('revisit: all four step titles visible', /Un parterre de 3 sur x \+ 2/i.test(b) && /Sans dessin/i.test(b), b.slice(0, 900));
    check('revisit: footer recap visible', /découper le rectangle/i.test(b));
    check('revisit: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}cl-revisit.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 11. Mobile pass at 375 × 667 ─────────────────────────────────── */
  const MOBILE = [
    ['M1', M.bordure, ['0']],
    ['M2', M.termes, ['0', '1']],
    ['M3', M.reduire, ['0', '1', '2']],
    ['M4', M.rect, ['0', '1', '2', '3']],
    ['M5', M.carre, ['0', '1', '2', '3', '4']],
    ['M6', M.factoriser, ['0', '1', '2', '3', '4', '5']],
    ['M7', M.choisir, ['0', '1', '2', '3', '4', '5', '6']],
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
    await page.screenshot({ path: `${SHOT_DIR}cl-${name.toLowerCase()}-mobile.png` });
    await ctx.close();
  }

  /* ── 12. Zero console/page errors ─────────────────────────────────── */
  check('no console/page errors across the run', errs.length === 0, errs.slice(0, 8).join(' | '));

  await browser.close();
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => {
  console.error('RUNNER CRASH', e);
  process.exit(2);
});
