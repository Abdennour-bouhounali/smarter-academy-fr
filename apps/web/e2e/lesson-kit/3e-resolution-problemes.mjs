// End-to-end smoke test for the 3e lesson « Résolution de problèmes ».
// Run: node apps/web/e2e/lesson-kit/3e-resolution-problemes.mjs
// (dev server on :5203, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5203';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/resolution-problemes-3e`;
const KEY = 'u_anon_smarter_lesson_resolution-problemes-3e';
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
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1600 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || 'rp');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

const body = (page) => page.locator('body').innerText();

/** Le Traducteur : poser une carte dans le membre actif. */
async function tapCard(page, aria, side) {
  const b = page.locator(`button[aria-label="Ajouter ${aria} au membre de ${side}"]`).first();
  await b.click({ timeout: 4000 });
  await page.waitForTimeout(160);
}
async function activateSide(page, side) {
  const b = page.locator(`button[aria-label^="Membre de ${side}"]`).first();
  await b.click({ timeout: 4000 });
  await page.waitForTimeout(160);
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, LESSON, null, { tag: 'index' });
    const b = await body(page);
    check('index: loads', b.length > 200, `body ${b.length} chars`);
    check('index: module 0 card present', /Mission de départ/i.test(b));
    check('index: signature module listed', /Le Traducteur/i.test(b));
    check('index: all nine modules listed', /Le forfait mystère/i.test(b)
      && /Lire comme un détective/i.test(b)
      && /Choisir l’inconnue/i.test(b)
      && /Deux stratégies/i.test(b)
      && /Résoudre et vérifier/i.test(b)
      && /labo de modélisation/i.test(b), b.slice(0, 400));
    check('index: boss listed', /Mission finale/i.test(b));
    check('index: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}rp-index.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 2. Diagnostic non-blocking, prerequisites only ───────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/mission-de-depart`, null, { tag: 'diag' });
    const b0 = await body(page);
    check('diagnostic: tests prerequisites, not the lesson content',
      /Calcul numérique|Calcul littéral|Équations|Proportionnalité/i.test(b0)
      && !/donnée utile|inconnue|traduire/i.test(b0), b0.slice(0, 400));

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
    check('diagnostic: non-blocking (module 1 reachable)', !/verrouill/i.test(b));
    check('diagnostic: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}rp-diagnostic.png` });
    await ctx.close();
  }

  /* ── 3. M1 — the try-value table finds the equilibrium at n = 6 ───── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-forfait-mystere`, ['0'], { tag: 'm1' });
    const head = await body(page);
    check('M1: header shows module 1 of 9', /Module\s*1\s*\/\s*9/i.test(head), head.slice(0, 160));
    check('M1: no NaN', !/NaN/.test(head));

    // Wrong-on-purpose on the prediction, correction stays visible.
    await page.locator('button', { hasText: 'La carte B' }).first().click();
    await page.waitForTimeout(600);
    const wrong = await body(page);
    check('M1: wrong prediction still reveals the correction', /Bonne réponse|24 \+ 5/i.test(wrong));
    check('M1: correction explains the maths, not a bare « Faux »', /9 × 4|36/.test(wrong), wrong.slice(0, 400));

    for (const v of ['2', '4', '6', '7']) {
      const chip = page.locator(`button[aria-label="Tester n = ${v}"]`).first();
      if (await chip.isVisible().catch(() => false)) {
        await chip.click();
        await page.waitForTimeout(450);
      }
    }
    const after = await body(page);
    check('M1: table reaches its goal at n = 6', /6 séances/i.test(after) && /54/.test(after), after.slice(0, 500));
    check('M1: the fixed part is named (not proportional)', /pas le double/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}rp-m1-table.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 4. M3 — the invalid unknown greys the rewrites out ───────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/choisir-linconnue`, ['0', '1', '2'], { tag: 'm3' });
    const head = await body(page);
    check('M3: header shows module 3 of 9', /Module\s*3\s*\/\s*9/i.test(head));
    check('M3: no NaN', !/NaN/.test(head));

    // Wrong-on-purpose: « la somme » cannot rewrite the other quantities.
    const somme = page.locator('button[aria-label^="Appeler x la somme"]').first();
    if (await somme.isVisible().catch(() => false)) {
      await somme.click();
      await page.waitForTimeout(600);
      const b = await body(page);
      check('M3: invalid unknown shows « impossible avec ce choix »', /impossible avec ce choix/i.test(b), b.slice(0, 400));
      check('M3: invalid unknown is not blocking (another choice offered)', /Touche un autre candidat/i.test(b));
    } else {
      check('M3: invalid unknown offered', false, 'button not visible');
    }

    const tom = page.locator(`button[aria-label="Appeler x l'âge de Tom aujourd'hui"]`).first();
    await tom.click();
    await page.waitForTimeout(600);
    const ok = await body(page);
    check('M3: valid unknown rewrites every quantity', /2x \+ 13|2x\+13/.test(ok.replace(/\s+/g, ' ')) || /Somme dans 5 ans/i.test(ok), ok.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}rp-m3-picker.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 5. M4 — SIGNATURE: the EquationBuilder commits 4x + 8 = 40 ───── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-traducteur`, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await body(page);
    check('M4: header shows module 4 of 9', /Module\s*4\s*\/\s*9/i.test(head));
    check('M4: no NaN', !/NaN/.test(head));
    check('M4: builder palette rendered',
      (await page.locator('div[role="group"][aria-label*="Cartes de quantités"]').count()) >= 1);

    // Build 2 × x + 2 × (x + 4) = 40 on the left, 40 on the right.
    await activateSide(page, 'gauche');
    await tapCard(page, 'le nombre 2', 'gauche');
    await tapCard(page, 'le signe multiplié', 'gauche');
    await tapCard(page, 'la largeur x', 'gauche');
    await tapCard(page, 'le signe plus', 'gauche');
    await tapCard(page, 'le nombre 2', 'gauche');
    await tapCard(page, 'le signe multiplié', 'gauche');
    await tapCard(page, 'la longueur x plus 4', 'gauche');
    await activateSide(page, 'droite');
    await tapCard(page, 'le périmètre 40', 'droite');
    await page.waitForTimeout(300);

    // The probe is the feedback BEFORE commit.
    const probe = page.locator('button[aria-label="Tester x égale 5"]').first();
    if (await probe.isVisible().catch(() => false)) {
      await probe.click();
      await page.waitForTimeout(400);
      const p = await body(page);
      check('M4: the probe evaluates both sides before commit', /gauche.*droite|pas encore égal|coïncident/i.test(p), p.slice(0, 400));
    } else {
      check('M4: probe reachable', false, 'probe chip not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}rp-m4-builder.png`, fullPage: true });

    await page.locator('button:has-text("Valider mon équation")').first().click();
    await page.waitForTimeout(800);
    const committed = await body(page);
    check('M4: an equivalent form is accepted (2×x + 2×(x+4) = 40)', /accepté/i.test(committed), committed.slice(0, 600));
    check('M4: acceptance names the equivalence, not a bare « juste »', /mêmes solutions/i.test(committed));
    await page.screenshot({ path: `${SHOT_DIR}rp-m4-committed.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 6. M4 wrong-on-purpose: 3x = 25 + 7 is refused but progresses ── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-traducteur`, ['0', '1', '2', '3'], { tag: 'm4-wrong' });
    // Complete step 1 quickly so step 2 (programme de calcul) opens.
    await activateSide(page, 'gauche');
    await tapCard(page, 'le nombre 4', 'gauche');
    await tapCard(page, 'le signe multiplié', 'gauche');
    await tapCard(page, 'la largeur x', 'gauche');
    await tapCard(page, 'le signe plus', 'gauche');
    await tapCard(page, 'le nombre 2', 'gauche');
    await tapCard(page, 'le signe multiplié', 'gauche');
    await tapCard(page, 'le nombre 4', 'gauche');
    await activateSide(page, 'droite');
    await tapCard(page, 'le périmètre 40', 'droite');
    await page.locator('button:has-text("Valider mon équation")').first().click();
    await page.waitForTimeout(900);

    const step2 = page.locator('button[aria-label="Ajouter le nombre choisi x au membre de gauche"]');
    if ((await step2.count()) >= 1) {
      // Deliberately build the classic trap 3x = 25 + 7.
      // Two builders are on the page now: the step-2 one is the LAST.
      const tap2 = async (aria, side) => {
        await page.locator(`button[aria-label="Ajouter ${aria} au membre de ${side}"]`).last().click({ timeout: 6000 });
        await page.waitForTimeout(160);
      };
      const side2 = async (side) => {
        await page.locator(`button[aria-label^="Membre de ${side}"]`).last().click({ timeout: 6000 });
        await page.waitForTimeout(200);
      };
      await side2('gauche');
      await tap2('le nombre 3', 'gauche');
      await tap2('le signe multiplié', 'gauche');
      await tap2('le nombre choisi x', 'gauche');
      await side2('droite');
      await tap2('le résultat 25', 'droite');
      await tap2('le signe plus', 'droite');
      await tap2('le nombre 7', 'droite');
      await page.waitForTimeout(250);
      await page.locator('button:has-text("Valider mon équation")').last().click();
      await page.waitForTimeout(800);
      const w = await body(page);
      check('M4: the wrong-side trap 3x = 25 + 7 is refused with quantified feedback',
        /ne dit pas la même chose/i.test(w) && /Essai 1 sur 3/i.test(w), w.slice(0, 700));
      check('M4: wrong equation stays on screen (not erased)', /Ton équation/i.test(w));
      await page.screenshot({ path: `${SHOT_DIR}rp-m4-trap.png`, fullPage: true });
    } else {
      check('M4: step 2 reachable after step 1', false, 'programme cards not visible');
    }
    await ctx.close();
  }

  /* ── 7. M5 — strategy chips, the table that fails, decimals ───────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/deux-strategies-un-resultat`, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await body(page);
    check('M5: header shows module 5 of 9', /Module\s*5\s*\/\s*9/i.test(head));
    check('M5: no NaN', !/NaN/.test(head));

    await page.locator('button[aria-label="Proportionnalité pour : la recette de crêpes"]').first().click();
    await page.waitForTimeout(250);
    await page.locator('button[aria-label="Calcul direct pour : le prix de trois articles"]').first().click();
    await page.waitForTimeout(250);
    // Wrong-on-purpose: proportionality where there is a fixed part.
    await page.locator('button[aria-label="Proportionnalité pour : le rectangle de périmètre 62"]').first().click();
    await page.waitForTimeout(700);
    const chips = await body(page);
    check('M5: strategy chips reveal every verdict once all three are chosen',
      /Trois structures, trois stratégies/i.test(chips), chips.slice(0, 500));
    check('M5: the wrong strategy is corrected with an explanation',
      /impossible de la calculer directement/i.test(chips));
    await page.screenshot({ path: `${SHOT_DIR}rp-m5-strategies.png`, fullPage: true });

    // DECIMAL: 437,5 g — wrong on purpose first (1750), then correct.
    const f = page.locator('input[type="text"], input[type="number"]').first();
    await f.fill('1750');
    await page.locator('button:has-text("OK")').first().click();
    await page.waitForTimeout(700);
    const dec = await body(page);
    check('M5: decimal reveal shows 437,5 after a wrong answer',
      /Ta réponse/i.test(dec) && /437,5/.test(dec), dec.slice(0, 600));
    check('M5: the ×7 trap is named explicitly', /250 × 7|comme si 250 g/i.test(dec));

    // The table that never turns green.
    for (const v of ['12', '13', '14']) {
      const chip = page.locator(`button[aria-label="Tester x = ${v}"]`).first();
      if (await chip.isVisible().catch(() => false)) {
        await chip.click();
        await page.waitForTimeout(450);
      }
    }
    const failed = await body(page);
    check('M5: the try-value table visibly fails on 13,5',
      /Aucune ligne verte/i.test(failed), failed.slice(-800));
    // Regression guard: RECTANGLE_62 must carry its OWN fragments — the object
    // spread would otherwise show « périmètre 40 cm / quelles dimensions ? ».
    check('M5: the step-3 statement is the périmètre-62 one, asking for the width',
      /Son périmètre mesure 62 cm/.test(failed) && /Quelle est sa largeur/.test(failed)
      && !/Son périmètre mesure 40 cm/.test(failed), failed.slice(0, 900));
    await page.screenshot({ path: `${SHOT_DIR}rp-m5-table-fails.png`, fullPage: true });

    const why = page.locator('button', { hasText: 'n’est pas un nombre entier' }).first();
    if (await why.isVisible().catch(() => false)) {
      await why.click();
      await page.waitForTimeout(700);
      const w = await body(page);
      check('M5: the failure is explained by the non-integer solution', /13,5/.test(w), w.slice(-600));
    } else {
      check('M5: the « why » question appears after 3 tests', false, 'option not visible');
    }
    await ctx.close();
  }

  /* ── 8. M6 — SolutionStrip refuses one-sided steps, CheckStrip ────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/resoudre-et-verifier`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await body(page);
    check('M6: header shows module 6 of 9', /Module\s*6\s*\/\s*9/i.test(head));
    check('M6: no NaN', !/NaN/.test(head));

    // Wrong-on-purpose: a one-sided step is refused, and says what changes.
    await page.locator('button[aria-label="Étape : Retirer 13 à gauche seulement"]').first().click();
    await page.waitForTimeout(600);
    const refused = await body(page);
    check('M6: a one-sided step is refused with the changed solution',
      /17,5/.test(refused) && /plus le même problème/i.test(refused), refused.slice(0, 700));

    await page.locator('button[aria-label="Étape : − 13 des deux côtés"]').first().click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Étape : ÷ 2 des deux côtés"]').first().click();
    await page.waitForTimeout(700);
    const solved = await body(page);
    check('M6: the chain reaches x = 11 through equivalent steps',
      /x est isolé/i.test(solved), solved.slice(0, 800));
    await page.screenshot({ path: `${SHOT_DIR}rp-m6-strip.png`, fullPage: true });

    // CheckStrip: verify IN THE STORY.
    const checkBtn = page.locator('button:has-text("Remettre la valeur dans l’histoire")').first();
    if (await checkBtn.isVisible().catch(() => false)) {
      await checkBtn.click();
      await page.waitForTimeout(700);
      const c = await body(page);
      check('M6: the check strip recomputes the story and finds 35',
        /la donnée de l’énoncé est retrouvée/i.test(c), c.slice(-900));
      check('M6: the story values are shown (Tom 11, Léa 14)', /11/.test(c) && /14/.test(c));
      await page.screenshot({ path: `${SHOT_DIR}rp-m6-check.png`, fullPage: true });
    } else {
      check('M6: check strip reachable', false, 'button not visible');
    }

    // Step 3: the batch question — BatchChoiceQuestion self-checks once every
    // row is answered (no validate button). Answering « Ça prouve » on all
    // three rows is a wrong-on-purpose path that must still progress.
    const rows3 = page.locator('div[role="group"] button[aria-pressed]');
    const nb = await rows3.count();
    for (let i = 0; i < nb; i += 1) {
      const btn = rows3.nth(i);
      if (await btn.isEnabled().catch(() => false)) {
        await btn.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(120);
      }
    }
    await page.waitForTimeout(800);
    const b3 = await body(page);
    check('M6: the « verify in the last line » trap is corrected',
      /vérifie le DERNIER calcul|dernière ligne/i.test(b3), b3.slice(-900));

    // The five-tab carnet (step 4).
    const tab = page.locator('button[aria-label^="Onglet Équation"]').first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(400);
      const t = await body(page);
      check('M6: the five-tab carnet opens a tab', /même quantité deux fois/i.test(t), t.slice(-500));
    } else {
      check('M6: carnet reachable', false, 'tab not visible after step 3');
    }
    await ctx.close();
  }

  /* ── 9. M7 — DECIMAL reveal 6,25 → « dès 7 séances » ──────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-labo-de-modelisation`, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'm7' });
    const head = await body(page);
    check('M7: header shows module 7 of 9', /Module\s*7\s*\/\s*9/i.test(head));
    check('M7: no NaN', !/NaN/.test(head));

    // Build 9n = 25 + 5n.
    await activateSide(page, 'gauche');
    await tapCard(page, 'neuf n', 'gauche');
    await activateSide(page, 'droite');
    await tapCard(page, 'vingt-cinq euros', 'droite');
    await tapCard(page, 'le signe plus', 'droite');
    await tapCard(page, 'cinq n', 'droite');
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Valider mon équation")').first().click();
    await page.waitForTimeout(800);
    const built = await body(page);
    check('M7: the 25 € forfait equation is accepted', /accepté/i.test(built), built.slice(0, 700));
    await page.screenshot({ path: `${SHOT_DIR}rp-m7-builder.png`, fullPage: true });

    // DECIMAL: 6,25 — wrong on purpose (6) first, then the interpretation.
    const f = page.locator('input[type="text"], input[type="number"]').first();
    await f.fill('6');
    await page.locator('button:has-text("OK")').first().click();
    await page.waitForTimeout(800);
    const dec = await body(page);
    check('M7: the decimal 6,25 is revealed after a wrong integer',
      /Ta réponse/i.test(dec) && /6,25/.test(dec), dec.slice(0, 800));
    check('M7: the reveal says to round AFTER, in the story', /arrondira|après/i.test(dec));

    // Fill the bascule table, then interpret.
    for (const v of ['6', '7']) {
      const chip = page.locator(`button[aria-label="Tester n = ${v}"]`).first();
      if (await chip.isVisible().catch(() => false)) {
        await chip.click();
        await page.waitForTimeout(450);
      }
    }
    await page.screenshot({ path: `${SHOT_DIR}rp-m7-bascule.png`, fullPage: true });

    const interp = page.locator('button', { hasText: 'Dès 7 séances' }).first();
    if (await interp.isVisible().catch(() => false)) {
      await interp.click();
      await page.waitForTimeout(800);
      const i = await body(page);
      check('M7: the interpretation « dès 7 séances » completes the step',
        /dès 7 séances/i.test(i), i.slice(-900));
      check('M7: the interpretation is justified by the two prices (54/55, 63/60)',
        /55/.test(i) && /63/.test(i));
      await page.screenshot({ path: `${SHOT_DIR}rp-m7-interpretation.png`, fullPage: true });
    } else {
      check('M7: the interpretation question appears', false, 'option not visible');
    }
    await ctx.close();
  }

  /* ── 10. Boss: silent → submit → profil → synthèse → reload → redo ── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/mission-finale-le-carnet-complet`,
      ['0', '1', '2', '3', '4', '5', '6', '7'], { tag: 'boss' },
    );
    const b = await body(page);
    check('boss: renders', /Boss final|Mission finale/i.test(b));
    check('boss: no NaN', !/NaN/.test(b));
    check('boss: silent before submit', !/Bonne réponse/i.test(b));
    check('boss: registre chips shown', /24 € \+ 5 €/.test(b) && /Tom et/i.test(b), b.slice(0, 500));
    check('boss: ten épreuves', /Épreuve 10/i.test(b));

    const groups = page.locator('div[role="group"]');
    const nGroups = await groups.count();
    for (let i = 0; i < nGroups; i += 1) {
      const btn = groups.nth(i).locator('button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
    }
    await page.waitForTimeout(500);
    const submit = page.locator('button').filter({ hasText: /Valider mes/ }).first();
    check('boss: submit becomes enabled once every épreuve is answered', await submit.isEnabled().catch(() => false));
    await submit.click();
    await page.waitForTimeout(1200);

    const after = await body(page);
    check('boss: submitting produces a score out of 10', /\/\s*10/.test(after), after.slice(0, 200));
    check('boss: review shows corrections', /Bonne réponse|Ta réponse/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}rp-boss-review.png`, fullPage: true });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(800);
    const profil = await body(page);
    check('boss: profile of mastery reachable', /profil de maîtrise/i.test(profil));
    await page.screenshot({ path: `${SHOT_DIR}rp-boss-profil.png`, fullPage: true });

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(1000);
    const synth = await body(page);
    check('boss: synthèse reuses the frozen Traducteur', /Le Traducteur, figé/i.test(synth), synth.slice(0, 400));
    check('boss: synthèse shows the ticked five-tab carnet', /cinq onglets remplis/i.test(synth));
    check('boss: synthèse shows the frozen check strip', /vérification, faite dans l’histoire/i.test(synth));
    check('boss: completion banner shown', /Mission accomplie|Carnet complet/i.test(synth));
    check('boss: synthèse has no NaN', !/NaN/.test(synth));
    await page.screenshot({ path: `${SHOT_DIR}rp-boss-synthese.png`, fullPage: true });

    // IMPORTANT: reload the SAME page/context so localStorage survives.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    const reloaded = await body(page);
    check('boss: reload shows the saved review', /\/\s*10/.test(reloaded) || /Ta réponse/i.test(reloaded), reloaded.slice(0, 250));

    const redo = page.locator('button:has-text("Refaire le test")').first();
    if (await redo.isVisible().catch(() => false)) {
      await redo.click();
      await page.waitForTimeout(1000);
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
      browser, `${LESSON}/le-traducteur`, ['0', '1', '2', '3', '4'], { tag: 'revisit' },
    );
    const b = await body(page);
    check('revisit: completed module shows all steps unlocked', !/verrouill/i.test(b), b.slice(0, 200));
    check('revisit: every step is visible on a completed module',
      /Le rectangle/i.test(b) && /programme de calcul/i.test(b) && /sans filet/i.test(b), b.slice(0, 500));
    check('revisit: footer recap visible on a completed module', /Traduire, c’est dire deux fois la m/i.test(b));
    check('revisit: footer snapshot lists the module 4 knowledge',
      /Traduire en équation/i.test(b), b.slice(0, 800));
    check('revisit: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}rp-revisit.png`, fullPage: true });
    await ctx.close();
  }

  /* ── 12. Mobile pass (375×667) on the signature modules ───────────── */
  const MOBILE = [
    ['M1', `${LESSON}/le-forfait-mystere`, ['0']],
    ['M4', `${LESSON}/le-traducteur`, ['0', '1', '2', '3']],
    ['M5', `${LESSON}/deux-strategies-un-resultat`, ['0', '1', '2', '3', '4']],
    ['M6', `${LESSON}/resoudre-et-verifier`, ['0', '1', '2', '3', '4', '5']],
    ['M7', `${LESSON}/le-labo-de-modelisation`, ['0', '1', '2', '3', '4', '5', '6']],
    ['boss', `${LESSON}/mission-finale-le-carnet-complet`, ['0', '1', '2', '3', '4', '5', '6', '7']],
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
        // The 28 px timer switch belongs to the shared kit (LessonUI `Toggle`,
        // h-7 w-12) and is identical in every kit lesson — out of this
        // lesson's scope, so it is not counted here.
        if (/\bh-7\b/.test(b.className) && /\bw-12\b/.test(b.className)) return;
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
    await page.screenshot({ path: `${SHOT_DIR}rp-${name.toLowerCase()}-mobile.png` });
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
