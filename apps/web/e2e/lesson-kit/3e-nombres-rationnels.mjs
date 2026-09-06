// End-to-end smoke test for the rebuilt 3e lesson « Nombres rationnels ».
// Run: node apps/web/e2e/lesson-kit/3e-nombres-rationnels.mjs
// (dev server on :5205, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5205';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/nombres-rationnels`;
const KEY = 'u_anon_smarter_lesson_nombres-rationnels';
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
  watchErrors(page, opts.tag || 'nr');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // The lazy module chunk can still be in flight after `domcontentloaded`;
  // a fixed settle races it when several contexts load at once. Wait for the
  // app shell to be replaced by real content, then settle.
  await page
    .waitForFunction(() => !/Chargement de Smarter/i.test(document.body.innerText), null, { timeout: 15000 })
    .catch(() => {});
  await settle(page);
  return { ctx, page };
}

const body = (page) => page.locator('body').innerText();

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, LESSON, null, { tag: 'index' });
    const b = await body(page);
    check('index: loads', b.length > 200, `body ${b.length} chars`);
    check('index: module 0 card present', /Mission de départ/i.test(b));
    check('index: signature module listed', /La même découpe/i.test(b));
    check('index: boss listed', /Mission finale/i.test(b));
    check('index: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}nr-index.png` });
    await ctx.close();
  }

  /* ── 2. Diagnostic non-blocking ───────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/mission-de-depart`, null, { tag: 'diag' });
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
    check('diagnostic: reaches a result', /\/\s*10|score|résultat|correction/i.test(b));
    check('diagnostic: never blocks (next link present)', /Module 1|Suivant|Commencer/i.test(b));
    check('diagnostic: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}nr-diagnostic.png` });
    await ctx.close();
  }

  /* ── 3. M1 — RationalBar: the marker never moves ──────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/deux-noms-un-nombre`, ['0'], { tag: 'm1' });
    const head = await body(page);
    check('M1: header shows module 1 of 9', /Module\s*1\s*\/\s*9/i.test(head), head.slice(0, 160));
    check('M1: no NaN', !/NaN/.test(head));

    const x2 = page.locator('button[aria-label^="Couper chaque part en 2"]').first();
    const x3 = page.locator('button[aria-label^="Couper chaque part en 3"]').first();

    check('M1: re-cut chips rendered', await x2.isVisible());

    // ── Le geste signature : GLISSER sur la figure elle-même. ──────────
    // Le peigne change l'écriture ; le marqueur, lui, ne doit pas bouger d'un
    // pixel. C'est toute la leçon, et c'est vérifiable au pixel près.
    const bar = page.locator('[data-rb-num]').first();
    const readBar = async () => ({
      num: Number(await bar.getAttribute('data-rb-num')),
      den: Number(await bar.getAttribute('data-rb-den')),
    });
    const markerX = () => page.locator('svg circle').first().getAttribute('cx');

    check('M1: the figure itself carries two drag handles', (await page.locator('svg [role="slider"]').count()) === 2);

    const beforeDrag = await readBar();
    const beforeMark = await markerX();
    const comb = page.locator('svg [role="slider"]').first();
    const cb = await comb.boundingBox();
    await page.mouse.move(cb.x + cb.width * 0.3, cb.y + cb.height / 2);
    await page.mouse.down();
    await page.mouse.move(cb.x + cb.width * 0.75, cb.y + cb.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    const afterDrag = await readBar();
    const afterMark = await markerX();

    check('M1: dragging the comb re-writes the fraction',
      afterDrag.den !== beforeDrag.den, `${beforeDrag.num}/${beforeDrag.den} → ${afterDrag.num}/${afterDrag.den}`);
    check('M1: … and the marker does NOT move — the number is unchanged',
      afterMark === beforeMark && (afterDrag.num / afterDrag.den) === (beforeDrag.num / beforeDrag.den),
      `marker ${beforeMark} → ${afterMark}`);

    await x2.click(); await page.waitForTimeout(300);
    await x2.click(); await page.waitForTimeout(500);
    const after = await body(page);
    check('M1: signature manipulation completes on 3 writings', /écritures différentes/i.test(after), after.slice(0, 400));
    check('M1: decimal value shown and unchanged', /0,75/.test(after), after.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}nr-m1-bar.png` });

    // Wrong-on-purpose: the batch row calling 4/3 « même point ».
    const rows = page.locator('div[role="group"]');
    const nRows = await rows.count();
    for (let i = 0; i < nRows; i += 1) {
      const first = rows.nth(i).locator('button').first();
      if (await first.isVisible().catch(() => false)) await first.click().catch(() => {});
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(600);
    const batch = await body(page);
    check('M1: batch correction reveals the maths after a wrong row', /1,33|autre point|valeur décimale/i.test(batch), batch.slice(0, 500));

    // The « rationnel » vocabulary is named only AFTER the gesture: the word
    // must NOT be on the page while the student is still manipulating. It is
    // posed by the brick of a later step, which the sequential unlock keeps
    // out of reach until the manipulations are done — c'est le contrat
    // « connaissances avant la demande » lu à l'endroit, dans le temps.
    check('M1: « rationnel » is not named while the student is still manipulating',
      !/nombre rationnel/i.test(batch) && /écritures différentes/i.test(batch), batch.slice(0, 400));
    await ctx.close();
  }

  /* ── 4. M2 — Simplifier reaches the irreducible form ──────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/rendre-irreductible`, ['0', '1'], { tag: 'm2' });
    const head = await body(page);
    check('M2: header shows module 2 of 9', /Module\s*2\s*\/\s*9/i.test(head));
    check('M2: no NaN', !/NaN/.test(head));

    // Wrong-on-purpose: 5 is not a common divisor of 24 and 36.
    const five = page.locator('button[aria-label="Diviser le numérateur et le dénominateur par 5"]').first();
    await five.click();
    await page.waitForTimeout(400);
    const refused = await body(page);
    check('M2: a non-divisor is refused with the mathematical reason', /n’est pas un diviseur commun|n'est pas un diviseur commun/i.test(refused), refused.slice(0, 400));
    check('M2: refusal does not reset the fraction', /24/.test(refused));

    // Now simplify step by step: ÷2, ÷2, ÷3 → 2/3
    for (const d of ['2', '2', '3']) {
      const b = page.locator(`button[aria-label="Diviser le numérateur et le dénominateur par ${d}"]`).first();
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(350); }
    }
    await page.waitForTimeout(500);
    const done = await body(page);
    check('M2: Simplifier reaches the irreducible form', /Irréductible/i.test(done), done.slice(0, 400));
    check('M2: the history trail shows the path', /Trajet/i.test(done));
    await page.screenshot({ path: `${SHOT_DIR}nr-m2-simplifier.png` });
    await ctx.close();
  }

  /* ── 4bis. M2 — deux chemins, puis la copie de Tom ────────────────── */
  {
    // Module 2 déjà terminé : toutes les étapes sont déverrouillées, on peut
    // aller voir directement les deux ajouts du module.
    const { ctx, page } = await open(browser, `${LESSON}/rendre-irreductible`, ['0', '1', '2'], { tag: 'm2b' });
    const t = await body(page);
    check('M2: the two forced routes are offered with DIFFERENT divisors',
      /CHEMIN A/i.test(t) && /CHEMIN B/i.test(t), t.slice(0, 300));
    check('M2: each route is a real Simplifier', (await page.locator('main :text("Trajet")').count()) >= 2);

    // La copie de Tom : accuser une ligne juste donne sa raison, accuser la
    // bonne la nomme — et seule la faute ouvre la réparation.
    check('M2: the faulty copy is shown line by line', (await page.locator('[data-spot-line]').count()) === 3);
    await page.locator('[data-spot-line="l1"]').click();
    await page.waitForTimeout(300);
    check('M2: accusing a correct line explains why it is correct',
      /Ligne juste/i.test(await body(page)));
    check('M2: the repair is not offered before the fault is found',
      (await page.locator('[data-spot-repair]').count()) === 0);
    await page.locator('[data-spot-line="l2"]').click();
    await page.waitForTimeout(400);
    const spotted = await body(page);
    check('M2: the fault is named — only the numerator was divided',
      /n’a divisé QUE le haut|n'a divisé QUE le haut/i.test(spotted), spotted.slice(0, 400));
    check('M2: the repair opens once the fault is located',
      (await page.locator('[data-spot-repair]').count()) === 3);
    await page.locator('[data-spot-repair="both"]').click();
    await page.waitForTimeout(400);
    check('M2: repairing restores the value', /Réparée/i.test(await body(page)));
    await ctx.close();
  }

  /* ── 5. M3 — NumberLine place mode, stepper-driven ────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/comparer`, ['0', '1', '2'], { tag: 'm3' });
    const head = await body(page);
    check('M3: header shows module 3 of 9', /Module\s*3\s*\/\s*9/i.test(head));
    check('M3: no NaN', !/NaN/.test(head));

    const plus = page.locator('button[aria-label="Avancer d’un douzième"]').first();
    check('M3: tap-first stepper present', await plus.isVisible());

    // §6bis.3 : plus de « Valider » entre le geste et sa conséquence. L'écart à
    // la cible se lit EN DIRECT, à chaque pas.
    check('M3: no « Valider » button stands between the gesture and its effect',
      (await page.locator('button[aria-label="Valider la position du curseur"]').count()) === 0);
    const wrong = await body(page);
    check('M3: the gap to the target is quantified live, before any validation',
      /douzième/i.test(wrong), wrong.slice(0, 500));

    // Then walk to 9/12 — reaching the target IS the validation.
    for (let i = 0; i < 3; i += 1) { await plus.click(); await page.waitForTimeout(160); }
    await page.waitForTimeout(600);
    const right = await body(page);
    check('M3: placing 3/4 on the twelfths line completes', /9/.test(right) && /est à DROITE|à DROITE/i.test(right), right.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}nr-m3-numberline.png` });

    // Étape 2 : la molette de découpe commune. 10 ne convient pas à 2/3 ;
    // 15 convient aux deux, et la comparaison devient une lecture.
    const dial = page.locator('[data-cut-den]').first();
    check('M3: the common-cut dial is offered', await dial.isVisible().catch(() => false));
    check('M3: the starting cut does NOT already work — there is something to find',
      (await dial.getAttribute('data-cut-ok')) === 'false');
    const track = page.locator('[role="slider"][aria-label="Nombre de parts de la découpe commune"]').first();
    await track.focus();
    for (let i = 0; i < 6; i += 1) {
      if ((await dial.getAttribute('data-cut-ok')) === 'true') break;
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
    }
    const dialed = await body(page);
    check('M3: a common cut can be reached, and both fractions are rewritten on it',
      (await dial.getAttribute('data-cut-ok')) === 'true' && /Même découpe/i.test(dialed), dialed.slice(0, 400));
    await page.waitForTimeout(400);

    // The « 1/4 > 1/2 » misconception question, answered wrong on purpose.
    const trap = page.locator('button', { hasText: 'C’est vrai : un plus grand dénominateur' }).first();
    if (await trap.isVisible().catch(() => false)) {
      await trap.click();
      await page.waitForTimeout(500);
      const t = await body(page);
      check('M3: the 1/4 > 1/2 trap is corrected with maths', /plus petite|plus fines|quart de pizza/i.test(t), t.slice(0, 400));
    } else {
      check('M3: misconception question reachable', false, 'option not visible');
    }
    await ctx.close();
  }

  /* ── 6. M4 — SIGNATURE: two bars re-cut into sixths ───────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/la-meme-decoupe`, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await body(page);
    check('M4: header shows module 4 of 9', /Module\s*4\s*\/\s*9/i.test(head));
    check('M4: no NaN', !/NaN/.test(head));
    check('M4: two-bar svg rendered', (await page.locator('svg[role="group"]').count()) >= 1);
    check('M4: the mismatch is named before any rule', /n’ont pas la même taille|n'ont pas la même taille/i.test(head), head.slice(0, 500));

    // Bar 1 (1/2) ×3 → 3/6 ; Bar 2 (1/3) ×2 → 2/6.
    const b1x3 = page.locator('button[aria-label^="Couper chaque part en 3 : Barre 1"]').first();
    const b2x2 = page.locator('button[aria-label^="Couper chaque part en 2 : Barre 2"]').first();
    check('M4: per-bar chips are labelled distinctly', await b1x3.isVisible() && await b2x2.isVisible());
    await b1x3.click(); await page.waitForTimeout(350);
    await b2x2.click(); await page.waitForTimeout(700);

    const cut = await body(page);
    check('M4: signature manipulation completes on a shared cut', /Même découpe/i.test(cut), cut.slice(0, 500));
    check('M4: the sum is read off the parts (5 sixths)', /5 parts sur 6|3 \+ 2 = 5/i.test(cut), cut.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}nr-m4-decoupe.png` });

    // Step 2: the picker refuses a non-multiple (7), then accepts 6.
    const seven = page.locator('button[aria-label="Essayer 7 parts"]').first();
    if (await seven.isVisible().catch(() => false)) {
      await seven.click();
      await page.waitForTimeout(500);
      const bad = await body(page);
      check('M4: the picker refuses 7 with its reason', /n’est pas un multiple|n'est pas un multiple/i.test(bad), bad.slice(0, 400));
      await page.locator('button[aria-label="Essayer 6 parts"]').first().click();
      await page.waitForTimeout(600);
      const good = await body(page);
      check('M4: the picker accepts 6 and rewrites both fractions', /plus petite découpe|PPCM/i.test(good), good.slice(0, 500));
      // RÉGRESSION : le sélecteur recevait des constantes, si bien que choisir
      // une découpe ne recoupait rien. L'étape 2 doit AGIR sur les barres.
      const cut = page.locator('[data-rb-num]').first();
      check('M4: choosing a common cut actually RE-CUTS both bars',
        (await cut.getAttribute('data-rb-den')) === (await cut.getAttribute('data-rb-den2'))
        && Number(await cut.getAttribute('data-rb-den')) % 6 === 0,
        `${await cut.getAttribute('data-rb-num')}/${await cut.getAttribute('data-rb-den')} + ${await cut.getAttribute('data-rb-num2')}/${await cut.getAttribute('data-rb-den2')}`);
    } else {
      check('M4: common-denominator picker reachable', false, 'candidate not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}nr-m4-picker.png` });

    // Step 3 must be answered before step 4 unlocks (sequential step locking).
    const ruleCard = page.locator('button', { hasText: 'Il a additionné aussi les dénominateurs' }).first();
    if (await ruleCard.isVisible().catch(() => false)) {
      await ruleCard.click();
      await page.waitForTimeout(600);
      check('M4: the « 1/2 + 1/3 = 2/5 » trap is corrected numerically', /0,4/.test(await body(page)));
    } else {
      check('M4: rule question reachable', false, 'option not visible');
    }

    // Nommer l'erreur ne suffit plus : il faut la RÉPARER sur les barres, puis
    // lire la somme sur la découpe qu'on vient de faire.
    const repairBars = page.locator('[data-rb-num]').last();
    check('M4: naming the error is not enough — a repair bar is offered',
      await repairBars.isVisible().catch(() => false));
    const rx3 = page.locator('button[aria-label^="Couper chaque part en 3 : Barre 1"]').last();
    const rx2 = page.locator('button[aria-label^="Couper chaque part en 2 : Barre 2"]').last();
    if (await rx3.isVisible().catch(() => false)) {
      await rx3.click(); await page.waitForTimeout(300);
      await rx2.click(); await page.waitForTimeout(500);
      check('M4: repairing the copy brings both halves onto the same cut',
        (await repairBars.getAttribute('data-rb-den')) === (await repairBars.getAttribute('data-rb-den2')),
        `${await repairBars.getAttribute('data-rb-den')} vs ${await repairBars.getAttribute('data-rb-den2')}`);
      const sumField = page.locator('input[type="text"], input[type="number"]').first();
      if (await sumField.isVisible().catch(() => false)) {
        await sumField.fill('5');
        await page.locator('button:has-text("OK")').first().click();
        await page.waitForTimeout(600);
        check('M4: the repaired sum is read off the parts', /5/.test(await body(page)));
      }
    }

    // Step 4 numeric: wrong first, then the correction shows the expected value.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('2');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(600);
      const r = await body(page);
      check('M4: a wrong numeric answer reveals the right one', /Ta réponse/i.test(r) && /Bonne réponse/i.test(r), r.slice(0, 400));
    } else {
      check('M4: numeric subtraction reachable', false, 'field not visible');
    }
    await ctx.close();
  }

  /* ── 7. M5 — FractionAreaGrid paints 6 green cells of 12 ──────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/fraction-de-fraction`, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await body(page);
    check('M5: header shows module 5 of 9', /Module\s*5\s*\/\s*9/i.test(head));
    check('M5: no NaN', !/NaN/.test(head));

    // Transparent SVG hit rects are not "visible": count and force-click.
    const cols = page.locator('rect[aria-label^="Colonne"]');
    const rows = page.locator('rect[aria-label^="Ligne"]');
    check('M5: grid headers are tappable', (await cols.count()) === 4 && (await rows.count()) === 3,
      `${await cols.count()} cols / ${await rows.count()} rows`);

    // Wrong on purpose first: only 2 columns → gap must be quantified.
    await cols.nth(0).click({ force: true }); await page.waitForTimeout(160);
    await cols.nth(1).click({ force: true }); await page.waitForTimeout(400);
    const partial = await body(page);
    check('M5: partial painting quantifies the remaining gap', /Il te faut/i.test(partial), partial.slice(0, 400));

    await cols.nth(2).click({ force: true }); await page.waitForTimeout(160);
    await rows.nth(0).click({ force: true }); await page.waitForTimeout(160);
    await rows.nth(1).click({ force: true }); await page.waitForTimeout(700);
    const painted = await body(page);
    check('M5: 6 green cells out of 12 reached', /6 \/ 12/.test(painted), painted.slice(0, 500));
    check('M5: the product is smaller than both factors', /plus PETIT/i.test(painted), painted.slice(0, 600));
    await page.screenshot({ path: `${SHOT_DIR}nr-m5-grid.png` });

    // Step 2 must be answered before step 3 unlocks.
    const prodCard = page.locator('button', { hasText: '2 × 3 cases vertes, et 3 × 4 cases en tout' }).first();
    if (await prodCard.isVisible().catch(() => false)) {
      await prodCard.click();
      await page.waitForTimeout(600);
      check('M5: the product rule is read off the grid', /rectangle vert/i.test(await body(page)));
    } else {
      check('M5: product rule question reachable', false, 'option not visible');
    }

    // Étape 3 : la division se COMPTE avant de s'écrire. Six quarts remplissent
    // exactement 3/2 — le résultat dépasse le dividende, et l'élève le pose lui-même.
    const pc = page.locator('[data-packets]').first();
    check('M5: division is manipulated, not just typed', await pc.isVisible().catch(() => false));
    const addPacket = page.locator('button[aria-label="Poser un paquet de plus"]').first();
    for (let i = 0; i < 8; i += 1) {
      if ((await pc.getAttribute('data-packets-full')) === 'true') break;
      await addPacket.click(); await page.waitForTimeout(160);
    }
    check('M5: 1/4 packets fill 3/2 exactly — and it takes SIX of them',
      (await pc.getAttribute('data-packets-full')) === 'true' && (await pc.getAttribute('data-packets')) === '6',
      `${await pc.getAttribute('data-packets')} packets`);
    // Un paquet de plus doit être REFUSÉ avec sa raison, pas déborder.
    await addPacket.click(); await page.waitForTimeout(300);
    check('M5: one packet too many is refused with its reason',
      (await pc.getAttribute('data-packets')) === '6' && /dépasserait/i.test(await body(page)));

    // Step 3: « diviser rend plus petit » trap, answered wrong on purpose.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('0,375');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(600);
      const r = await body(page);
      check('M5: the « dividing shrinks » trap is corrected', /diviser rend plus petit|plus grand/i.test(r), r.slice(0, 500));
      check('M5: decimal reveal shows the expected value', /Bonne réponse/i.test(r) && /6/.test(r));
    } else {
      check('M5: division question reachable', false, 'field not visible');
    }
    await ctx.close();
  }

  /* ── 8. M6 — l'expression se replie sous les doigts de l'élève ────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/dans-quel-ordre`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await body(page);
    check('M6: header shows module 6 of 9', /Module\s*6\s*\/\s*9/i.test(head));
    check('M6: no NaN', !/NaN/.test(head));

    const expr = page.locator('[data-expr]').first();
    check('M6: the expression itself is the manipulation',
      (await expr.getAttribute('data-expr')) === '1/2 + 2/3 × 3/4',
      await expr.getAttribute('data-expr'));

    // Wrong on purpose: the + must be REFUSED with its reason, and the
    // expression must be left strictly untouched.
    await page.locator('[data-expr-op="n-add"]').first().click();
    await page.waitForTimeout(400);
    const refused = await body(page);
    check('M6: tapping the + first is refused with the priority rule',
      /Pas encore/i.test(refused) && /passe AVANT/i.test(refused), refused.slice(0, 500));
    check('M6: a refused operator leaves the expression untouched',
      (await expr.getAttribute('data-expr')) === '1/2 + 2/3 × 3/4');

    // The × collapses in place, and the chain is BUILT from that pick.
    await page.locator('[data-expr-op="n-mul"]').first().click();
    await page.waitForTimeout(600);
    check('M6: executing the product folds it into its value',
      (await expr.getAttribute('data-expr')) === '1/2 + 1/2',
      await expr.getAttribute('data-expr'));
    const s1 = await body(page);
    check('M6: the calc chain is built from the student’s own pick',
      /Le produit, prioritaire/i.test(s1), s1.slice(0, 500));

    await page.locator('[data-expr-op="n-add"]').first().click();
    await page.waitForTimeout(600);
    check('M6: the expression reduces to a single number',
      (await expr.getAttribute('data-expr-done')) === 'true' && (await expr.getAttribute('data-expr')) === '1',
      await expr.getAttribute('data-expr'));
    await page.screenshot({ path: `${SHOT_DIR}nr-m6-reducer.png` });

    // Étape 2 : l'élève FABRIQUE l'erreur — l'addition d'abord donne 7/8.
    const free = page.locator('[data-expr]').nth(1);
    if (await free.isVisible().catch(() => false)) {
      await page.locator('[data-expr]').nth(1).locator('[data-expr-op="n-add"]').click();
      await page.waitForTimeout(500);
      await page.locator('[data-expr]').nth(1).locator('[data-expr-op]').first().click();
      await page.waitForTimeout(600);
      check('M6: forcing the addition first produces 7/8 — the student makes the error',
        (await free.getAttribute('data-expr')) === '7/8', await free.getAttribute('data-expr'));
      check('M6: the two orders are contrasted as an ORDER problem, not a calculation slip',
        /C’est l’ORDRE qui était faux|c'est l'ORDRE qui était faux/i.test(await body(page)));
    } else {
      check('M6: free-order step reachable', false, 'expression not visible');
    }
    await ctx.close();
  }

  /* ── 9. M7 — budget lab, decimal reveal ───────────────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-budget-du-club`, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'm7' });
    const head = await body(page);
    check('M7: header shows module 7 of 9', /Module\s*7\s*\/\s*9/i.test(head));
    check('M7: no NaN', !/NaN/.test(head));
    // Étape 1 : le budget se COMPOSE, il ne se lit plus sur une image figée.
    const bar = page.locator('[data-budget-used]').first();
    check('M7: the budget bar is composed by the student, not displayed',
      await bar.isVisible().catch(() => false));
    check('M7: it starts EMPTY — there is something to do',
      (await bar.getAttribute('data-budget-used')) === '0');
    const handles = page.locator('[role="separator"]');
    check('M7: each budget line has a draggable boundary', (await handles.count()) === 2);
    await handles.nth(0).focus();
    for (let i = 0; i < 4; i += 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(110); }
    await handles.nth(1).focus();
    for (let i = 0; i < 3; i += 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(110); }
    check('M7: composing 1/3 + 1/4 leaves exactly 5 twelfths for the tournament',
      (await bar.getAttribute('data-budget-used')) === '7' && (await bar.getAttribute('data-budget-left')) === '5',
      `used ${await bar.getAttribute('data-budget-used')}, left ${await bar.getAttribute('data-budget-left')}`);
    check('M7: the sum is named only AFTER the gesture produced it',
      /7 douzièmes/i.test(await body(page)));

    // Step 1: the modelling QCM (KaTeX options → match on the aria/plain label).
    const addCard = page.locator('div[role="group"] button').first();
    check('M7: modelling question rendered', await addCard.isVisible());
    await addCard.click();
    await page.waitForTimeout(700);
    const modelled = await body(page);
    check('M7: choosing the addition explains the situation', /s’ajoutent|s'ajoutent/i.test(modelled), modelled.slice(0, 400));
    // Step 2: wrong on purpose (7, the spent part) then the right value.
    let field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('7');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(600);
      const r = await body(page);
      check('M7: spent-vs-remaining confusion is corrected', /part déjà dépensée/i.test(r), r.slice(0, 500));
    } else {
      check('M7: remaining-part question reachable', false, 'field not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}nr-m7-budget.png` });
    await ctx.close();
  }

  /* ── 9bis. M7 — le quotient qui ne tombe PAS juste ────────────────── */
  {
    // Le module promettait « on ne coupe pas un maillot en deux » alors que
    // 300 ÷ 12,50 = 24 pile : rien à interpréter. À 32,50 €, 300 ÷ 32,50 =
    // 9,23… et la promesse devient vraie.
    const { ctx, page } = await open(browser, `${LESSON}/le-budget-du-club`, ['0', '1', '2', '3', '4', '5', '6', '7'], { tag: 'm7b' });
    const t = await body(page);
    check('M7: the jersey price makes the division genuinely non-exact', /32,50/.test(t), t.slice(0, 300));

    const jersey = page.locator('input[type="text"], input[type="number"]').last();
    if (await jersey.isVisible().catch(() => false)) {
      // 10 dépasse le budget — la correction doit le dire en euros.
      await jersey.fill('10');
      await page.locator('button:has-text("OK")').last().click();
      await page.waitForTimeout(700);
      const over = await body(page);
      check('M7: over-buying is refused in euros, not by decree',
        /325/.test(over) && /budget/i.test(over), over.slice(0, 400));
      check('M7: the exact quotient is shown as a CALCULATION, not as the answer',
        /9,23/.test(over), over.slice(0, 400));
      check('M7: the leftover money is named', /7,50/.test(over), over.slice(0, 400));
    } else {
      check('M7: jersey question reachable', false, 'field not visible');
    }
    await ctx.close();
  }

  /* ── 10. Boss: silent → submit → profil → synthèse → completion ───── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/mission-finale`, ['0', '1', '2', '3', '4', '5', '6', '7'], { tag: 'boss' },
    );
    const b = await body(page);
    check('boss: renders', /Boss final|Mission finale/i.test(b));
    check('boss: no NaN', !/NaN/.test(b));
    check('boss: silent before submit', !/Bonne réponse/i.test(b));
    check('boss: registre chips shown', /est un point/i.test(b));

    const groups = page.locator('div[role="group"]');
    const nGroups = await groups.count();
    for (let i = 0; i < nGroups; i += 1) {
      const btn = groups.nth(i).locator('button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
    }
    await page.waitForTimeout(400);
    const submit = page.locator('button').filter({ hasText: /Valider mes/ }).first();
    check('boss: submit becomes enabled once every épreuve is answered', await submit.isEnabled().catch(() => false));
    await submit.click();
    await page.waitForTimeout(1000);

    const after = await body(page);
    check('boss: submitting produces a score out of 10', /\/\s*10/.test(after), after.slice(0, 200));
    check('boss: review shows corrections', /Bonne réponse|Ta réponse/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}nr-boss-review.png` });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(700);
    const profil = await body(page);
    check('boss: profile of mastery reachable', /profil de maîtrise/i.test(profil));

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(900);
    const synth = await body(page);
    check('boss: synthèse reuses the frozen RationalBar', /barre élastique/i.test(synth), synth.slice(0, 400));
    check('boss: synthèse shows 2/3 = 4/6 = 6/9', /trois découpes/i.test(synth));
    check('boss: completion banner shown', /Mission accomplie|mille noms/i.test(synth));
    check('boss: synthèse has no NaN', !/NaN/.test(synth));
    const frozenSvgs = await page.locator('svg[role="img"]').count();
    check('boss: frozen visuals rendered', frozenSvgs >= 3, `${frozenSvgs} frozen svg`);
    await page.screenshot({ path: `${SHOT_DIR}nr-boss-synthese.png`, fullPage: true });

    // Reload the SAME page/context: a fresh context would start with empty
    // localStorage and falsely report a lost attempt.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    const reloaded = await body(page);
    check('boss: reload shows the saved review', /\/\s*10/.test(reloaded) || /Ta réponse/i.test(reloaded));

    const redo = page.locator('button:has-text("Refaire le test")').first();
    if (await redo.isVisible().catch(() => false)) {
      await redo.click();
      await page.waitForTimeout(900);
      const reset = await body(page);
      check('boss: « Refaire le test » resets to a silent quiz', !/Ta réponse/i.test(reset));
    } else {
      check('boss: redo button present after reload', false, 'not visible');
    }
    await ctx.close();
  }

  /* ── 11. Revisit a completed module: every step open ──────────────── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/la-meme-decoupe`, ['0', '1', '2', '3', '4'], { tag: 'revisit' },
    );
    const b = await body(page);
    check('revisit: completed module shows all steps unlocked', !/verrouill/i.test(b), b.slice(0, 200));
    check('revisit: footer recap visible on a completed module', /même taille/i.test(b));
    check('revisit: no NaN', !/NaN/.test(b));
    await ctx.close();
  }

  /* ── 12. Mobile pass on the signature modules ─────────────────────── */
  const MOBILE = [
    ['M1', `${LESSON}/deux-noms-un-nombre`, ['0']],
    ['M2', `${LESSON}/rendre-irreductible`, ['0', '1']],
    ['M3', `${LESSON}/comparer`, ['0', '1', '2']],
    ['M4', `${LESSON}/la-meme-decoupe`, ['0', '1', '2', '3']],
    ['M5', `${LESSON}/fraction-de-fraction`, ['0', '1', '2', '3', '4']],
    ['M6', `${LESSON}/dans-quel-ordre`, ['0', '1', '2', '3', '4', '5']],
    ['M7', `${LESSON}/le-budget-du-club`, ['0', '1', '2', '3', '4', '5', '6']],
  ];
  for (const [name, url, seed] of MOBILE) {
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

    // §6ter.5 : les poignées de glissement comptent AUSSI, et elles ne sont pas
    // des <button>. Leur taille se MESURE (getBoundingClientRect), elle ne se
    // déduit pas du viewBox — un rect de 24 unités SVG ne fait que 12 px réels
    // sur une barre rendue à 0,52×.
    const smallHandles = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('main [role="slider"], main [role="separator"]').forEach((h) => {
        const r = h.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.width < 44 && r.height < 44) {
          out.push(`${(h.getAttribute('aria-label') || '?').slice(0, 22)}:${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      });
      return out;
    });
    check(`${name} mobile: drag handles ≥ 44 px`, smallHandles.length === 0, smallHandles.slice(0, 4).join(', '));

    const anyTap = page.locator('main button:visible').first();
    if (await anyTap.isVisible().catch(() => false)) {
      await anyTap.tap().catch(() => {});
      await page.waitForTimeout(300);
    }
    check(`${name} mobile: no NaN after a touch interaction`, !/NaN/.test(await body(page)));
    await page.screenshot({ path: `${SHOT_DIR}nr-${name.toLowerCase()}-mobile.png` });
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
