// End-to-end smoke test for the rebuilt 3e lesson « Puissances ».
// Run: node apps/web/e2e/lesson-kit/3e-puissances.mjs
// (dev server on :5206, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5206';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/puissances-3e`;
const KEY = 'u_anon_smarter_lesson_puissances-3e';
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
  watchErrors(page, opts.tag || 'pu');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
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
    check('index: signature module listed', /Empiler les tours/i.test(b));
    check('index: boss listed', /Mission finale/i.test(b));
    check('index: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}pu-index.png` });
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
      await page.waitForTimeout(600);
    }
    const b = await body(page);
    check('diagnostic: reaches a result', /\/\s*10|score|résultat/i.test(b));
    check('diagnostic: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}pu-diagnostic.png` });
    await ctx.close();
  }

  /* ── 3. M1 — PaperFold reaches 5 folds / 32 layers ───────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-pliage`, ['0'], { tag: 'm1' });
    const head = await body(page);
    check('M1: header shows module 1 of 8', /Module\s*1\s*\/\s*8/i.test(head), head.slice(0, 160));
    check('M1: no NaN', !/NaN/.test(head));

    const fold = page.locator('button[aria-label="Plier la feuille en deux"]').first();
    for (let i = 0; i < 5; i += 1) { await fold.click(); await page.waitForTimeout(150); }
    await page.waitForTimeout(400);
    const folded = await body(page);
    check('M1: signature fold reaches 32 layers', /32/.test(folded), folded.slice(0, 400));
    check('M1: the need for a short name is stated', /Cinq facteurs|déjà long/i.test(folded));
    await page.screenshot({ path: `${SHOT_DIR}pu-m1-fold.png` });

    // Wrong-on-purpose: the base/exponent question.
    const wrong = page.locator('button', { hasText: 'Base 4, exposant 7' }).first();
    if (await wrong.isVisible().catch(() => false)) {
      await wrong.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M1: wrong answer shows the correction', /Bonne réponse/i.test(w));
      check('M1: correction explains the maths, not just « Faux »', /2401|exposant/i.test(w));
    } else {
      check('M1: base/exponent question reachable', false, 'option not visible');
    }

    // The 2^5 = 10 misconception trap, answered right.
    const trap = page.locator('button', { hasText: 'Non, 32 épaisseurs' }).first();
    if (await trap.isVisible().catch(() => false)) {
      await trap.click();
      await page.waitForTimeout(400);
    }
    // Numeric step: answer wrong first, see the reveal.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('4');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(500);
      const r = await body(page);
      check('M1: numeric reveal after a wrong answer', /Ta réponse/i.test(r), r.slice(0, 300));
      check('M1: targeted feedback names the base/exponent confusion', /Tu as lu la base/i.test(r));
    }
    await ctx.close();
  }

  /* ── 4. M2 — PowerExplorer + descending the tower below zero ──────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/la-tour-des-facteurs`, ['0', '1'], { tag: 'm2' });
    const head = await body(page);
    check('M2: header shows module 2 of 8', /Module\s*2\s*\/\s*8/i.test(head));
    check('M2: no NaN', !/NaN/.test(head));

    const plus = page.locator('button[aria-label="Augmenter l’exposant de 1"]').first();
    for (let i = 0; i < 5; i += 1) { await plus.click(); await page.waitForTimeout(120); }
    await page.locator('button[aria-label="Base 3"]').first().click();
    await page.waitForTimeout(500);
    const explored = await body(page);
    check('M2: explorer completes on 3 distinct powers', /multipliée par la base/i.test(explored), explored.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}pu-m2-explorer.png` });

    // Batch question: answer every row (first option each) — non-blocking either way.
    const rows = page.locator('div[role="group"]');
    const nRows = await rows.count();
    for (let i = 0; i < nRows; i += 1) {
      const b = rows.nth(i).locator('button').first();
      if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(500);
    const batched = await body(page);
    check('M2: batch check reveals a correction', /\/\s*4|Quatre sur quatre|piège commun/i.test(batched), batched.slice(0, 300));

    // Descend the base-10 tower to 0 and below.
    const unstack = page.locator('button[aria-label^="Dépiler un facteur"]').first();
    for (let i = 0; i < 4; i += 1) {
      if (await unstack.isEnabled().catch(() => false)) { await unstack.click(); await page.waitForTimeout(200); }
    }
    await page.waitForTimeout(500);
    const desc = await body(page);
    check('M2: descending below zero reveals a^0 = 1 and a^-1', /tour vide vaut/i.test(desc), desc.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}pu-m2-tower.png` });
    await ctx.close();
  }

  /* ── 5. M3 — SIGNATURE: PowerTower merge / split / repeat ─────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/empiler-les-tours`, ['0', '1', '2'], { tag: 'm3' });
    const head = await body(page);
    check('M3: header shows module 3 of 8', /Module\s*3\s*\/\s*8/i.test(head));
    check('M3: no NaN', !/NaN/.test(head));

    // La manipulation est un GESTE (glisser un facteur, puis tirer la tour B
    // sur la tour A). Le chemin sans souris passe par la figure elle-même :
    // activer la réserve PREND le facteur, activer une tour l'y POSE —
    // c'est ce chemin qu'on pilote ici, et l'exercer prouve qu'il marche.
    const supply = page.locator('button[aria-label^="Prendre un facteur"]').first();
    const zoneA = page.locator('[data-drop-zone="A"]').first();
    const zoneB = page.locator('[data-drop-zone="B"]').first();

    check('M3: no merge offered before the towers are built',
      !(await page.locator('button', { hasText: 'Fusionner les tours' }).first().isVisible().catch(() => false)));

    const place = async (zone) => {
      await supply.click(); await page.waitForTimeout(120);
      await zone.click(); await page.waitForTimeout(220);
    };
    // A : 1 → 2 facteurs ; B : 1 → 3 facteurs.
    await place(zoneA);
    await place(zoneB);
    await place(zoneB);
    const ready = await body(page);
    check('M3: towers ready prompt appears', /tours sont prêtes/i.test(ready), ready.slice(0, 400));

    await page.locator('button', { hasText: 'Fusionner les tours' }).first().click();
    await page.waitForTimeout(600);
    const joined = await body(page);

    // LE point de la refonte : l'écriture intermédiaire est montrée, et 3⁵ ne
    // l'est PAS encore — l'élève doit d'abord compter les facteurs.
    check('M3: the equation keeps A × B = C on screen', /Tour C/i.test(joined), joined.slice(0, 500));
    check('M3: the merge shows the repeated-factor stage',
      /Ce que ça veut dire/i.test(joined), joined.slice(0, 600));
    check('M3: the short form is withheld until the student counts',
      !/L’écriture courte|L'écriture courte/.test(joined), joined.slice(0, 600));
    check('M3: the student is asked to COUNT the factors',
      /Combien de facteurs/i.test(joined), joined.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}pu-m3-merge.png` });

    // Les cinq facteurs sont individuellement présents dans le DOM.
    const blocks = await page.locator('button[aria-label*="Facteur 3 au sommet"], div').evaluateAll(
      (els) => els.filter((e) => e.textContent.trim() === '3' && e.className.includes('min-w-[64px]')).length,
    );
    check('M3: the five factors are individually rendered', blocks >= 5, `counted ${blocks}`);

    // On compte : c'est la réponse qui débloque 3⁵.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('5');
      await field.press('Enter');
      await page.waitForTimeout(600);
    }
    const counted = await body(page);
    check('M3: counting reveals the short form 3^5', /écriture courte/i.test(counted), counted.slice(0, 600));
    check('M3: the sum of the counts is read aloud', /2\s*\+\s*3\s*=\s*5|font.{0,40}5 facteurs/.test(counted), counted.slice(0, 800));
    check('M3: the base is explicitly said not to change', /base est restée/i.test(counted));

    // Étape 2 — le quotient : retirer les blocs du sommet un par un.
    const top = page.locator('button[aria-label*="au sommet"]');
    for (let i = 0; i < 2; i += 1) {
      const b = top.last();
      if (await b.isVisible().catch(() => false)) { await b.click(); await page.waitForTimeout(250); }
    }
    const split = await body(page);
    check('M3: quotient step completes (exponents subtract)',
      /exposants|enlever des facteurs/i.test(split), split.slice(0, 400));
    check('M3: the cancelled pairs are shown', /paire/i.test(split), split.slice(0, 400));

    // Étape 3 — les paquets restent distincts.
    const addCopy = page.locator('button', { hasText: 'Ajouter une copie' }).first();
    for (let i = 0; i < 2; i += 1) {
      if (await addCopy.isVisible().catch(() => false)) { await addCopy.click(); await page.waitForTimeout(250); }
    }
    const rep = await body(page);
    check('M3: repeat step counts PACKETS, not a single pile', /paquets? de/i.test(rep), rep.slice(0, 400));
    check('M3: repetition gives 6 factors, distinct from the product’s 5',
      /6 facteurs/.test(rep), rep.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}pu-m3-rules.png` });

    // Wrong-on-purpose on the rule question: 9^5.
    const bad = page.locator('button', { hasText: '9' }).first();
    const badOpt = page.locator('div[role="group"] button').filter({ hasText: '9' }).first();
    if (await badOpt.isVisible().catch(() => false)) {
      await badOpt.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M3: wrong rule answer still reveals the correction', /Bonne réponse|Les deux pièges/i.test(w), w.slice(0, 300));
    } else {
      check('M3: rule question reachable', false, 'option not visible');
    }
    await ctx.close();
  }

  /* ── 6. M4 — DecimalShifter reaches both targets ──────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/la-virgule-qui-glisse`, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await body(page);
    check('M4: header shows module 4 of 8', /Module\s*4\s*\/\s*8/i.test(head));
    check('M4: no NaN', !/NaN/.test(head));

    const up = page.locator('button[aria-label="Augmenter l’exposant de 10 de 1"]').first();
    const down = page.locator('button[aria-label="Diminuer l’exposant de 10 de 1"]').first();
    for (let i = 0; i < 4; i += 1) { await up.click(); await page.waitForTimeout(150); }
    await page.waitForTimeout(500);
    const big = await body(page);
    check('M4: comma glides right to 34 500', /34\s*500/.test(big), big.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}pu-m4-shift-right.png` });

    for (let i = 0; i < 7; i += 1) { await down.click(); await page.waitForTimeout(150); }
    await page.waitForTimeout(600);
    const small = await body(page);
    check('M4: comma glides left to 0,00345', /0,00345/.test(small), small.slice(0, 400));
    check('M4: both targets complete the step', /Les deux cibles sont atteintes/i.test(small), small.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}pu-m4-shift-left.png` });

    // Wrong-on-purpose: the −500 sign trap.
    const signTrap = page.locator('div[role="group"] button').filter({ hasText: '−500' }).first();
    if (await signTrap.isVisible().catch(() => false)) {
      await signTrap.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M4: sign misconception is corrected, not just marked wrong', /porte sur l’EXPOSANT|EXPOSANT/i.test(w), w.slice(0, 300));
    } else {
      check('M4: sign question reachable', false, 'option not visible');
    }

    // Magnitude strip: pick a wrong exponent on purpose, correction visible.
    const strip = page.locator('button[aria-label="10 puissance -4"]').first();
    if (await strip.isVisible().catch(() => false)) {
      await strip.click();
      await page.waitForTimeout(600);
      const s = await body(page);
      check('M4: wrong magnitude pick quantifies the gap in rangs', /rang/i.test(s) && /Bonne réponse|d’écart/i.test(s), s.slice(0, 400));
    } else {
      check('M4: magnitude strip reachable', false, 'strip button not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}pu-m4-strip.png` });
    await ctx.close();
  }

  /* ── 7. M5 — SciNotationBuilder: value invariant, 1 ≤ a < 10 ─────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/ecriture-scientifique`, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await body(page);
    check('M5: header shows module 5 of 8', /Module\s*5\s*\/\s*8/i.test(head));
    check('M5: no NaN', !/NaN/.test(head));
    check('M5: coefficient starts out of range', /trop grand/i.test(head), head.slice(0, 400));

    const left = page.locator('button[aria-label="Déplacer la virgule d’un rang vers la gauche"]').first();
    for (let i = 0; i < 4; i += 1) { await left.click(); await page.waitForTimeout(180); }
    await page.waitForTimeout(500);
    const built = await body(page);
    check('M5: builder reaches 3,45 × 10^4', /3,45/.test(built), built.slice(0, 500));
    check('M5: value invariant is stated', /valeur n’a pas changé|même nombre/i.test(built));
    await page.screenshot({ path: `${SHOT_DIR}pu-m5-builder.png` });

    // Small number: exponent goes negative.
    const rights = page.locator('button[aria-label="Déplacer la virgule d’un rang vers la droite"]');
    const nRight = await rights.count();
    if (nRight > 0) {
      const r = rights.last();
      for (let i = 0; i < 4; i += 1) { await r.click(); await page.waitForTimeout(180); }
      await page.waitForTimeout(600);
      const sm = await body(page);
      check('M5: small number reaches a negative exponent', /exposant est négatif/i.test(sm), sm.slice(0, 500));
    } else {
      check('M5: second builder reachable', false, 'no right button');
    }
    await page.screenshot({ path: `${SHOT_DIR}pu-m5-small.png` });
    await ctx.close();
  }

  /* ── 8. M6 — UniverseScale visits all six objects ────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/lechelle-de-lunivers`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await body(page);
    check('M6: header shows module 6 of 8', /Module\s*6\s*\/\s*8/i.test(head));
    check('M6: no NaN', !/NaN/.test(head));

    for (const name of ['La Voie lactée', 'Le système solaire', 'La Terre (diamètre)', 'Un être humain', 'Un globule rouge', "Un atome d'hydrogène"]) {
      const chip = page.locator(`button[aria-label="Zoomer sur ${name}"]`).first();
      if (await chip.isVisible().catch(() => false)) { await chip.click(); await page.waitForTimeout(200); }
    }
    await page.waitForTimeout(600);
    const explored = await body(page);
    check('M6: all six objects discovered', /31 ordres de grandeur/i.test(explored), explored.slice(0, 500));
    await page.screenshot({ path: `${SHOT_DIR}pu-m6-universe.png` });

    // Wrong-on-purpose on the compare question (coefficient-first trap).
    const trap = page.locator('div[role="group"] button').filter({ hasText: 'Le globule rouge' }).first();
    if (await trap.isVisible().catch(() => false)) {
      await trap.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M6: coefficient-first misconception corrected', /exposant décide en premier/i.test(w), w.slice(0, 300));
    } else {
      check('M6: compare question reachable', false, 'option not visible');
    }

    // Ratio: answer 28 (adds exponents) on purpose, targeted feedback.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('28');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(600);
      const r = await body(page);
      check('M6: ratio reveals 14 after the additive mistake', /Ta réponse/i.test(r) && /14/.test(r), r.slice(0, 400));
      check('M6: targeted feedback names the product rule confusion', /additionné les exposants/i.test(r));
    } else {
      check('M6: ratio question reachable', false, 'field not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}pu-m6-ratio.png` });
    await ctx.close();
  }

  /* ── 9. Boss: silent → submit → profil → synthèse → completion ───── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/mission-finale`, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'boss' },
    );
    const b = await body(page);
    check('boss: renders', /Boss final|Mission finale/i.test(b));
    check('boss: no NaN', !/NaN/.test(b));
    check('boss: silent before submit', !/Bonne réponse/i.test(b));
    check('boss: registre chips shown', /compte les facteurs/i.test(b));

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
    await page.screenshot({ path: `${SHOT_DIR}pu-boss-review.png` });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(700);
    const profil = await body(page);
    check('boss: profile of mastery reachable', /profil de maîtrise/i.test(profil));

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(900);
    const synth = await body(page);
    check('boss: synthèse reuses the frozen towers', /Les deux tours, figées/i.test(synth));
    check('boss: synthèse reuses the frozen shifter', /la virgule, posée/i.test(synth));
    check('boss: completion banner shown', /Mission accomplie|Compteur de facteurs/i.test(synth));
    check('boss: synthèse has no NaN', !/NaN/.test(synth));
    await page.screenshot({ path: `${SHOT_DIR}pu-boss-synthese.png`, fullPage: true });

    // Reload the SAME page/context: localStorage keeps the attempt.
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

  /* ── 10. Revisit a completed module: every step open ─────────────── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/empiler-les-tours`, ['0', '1', '2', '3'], { tag: 'revisit' },
    );
    const b = await body(page);
    check('revisit: completed module shows all steps unlocked', !/verrouill/i.test(b), b.slice(0, 200));
    check('revisit: footer recap visible on a completed module', /compter des blocs/i.test(b));
    check('revisit: no NaN', !/NaN/.test(b));
    await ctx.close();
  }

  /* ── 11. Mobile pass on the signature modules ────────────────────── */
  const MOBILE = [
    ['M1', `${LESSON}/le-pliage`, ['0']],
    ['M3', `${LESSON}/empiler-les-tours`, ['0', '1', '2']],
    ['M4', `${LESSON}/la-virgule-qui-glisse`, ['0', '1', '2', '3']],
    ['M6', `${LESSON}/lechelle-de-lunivers`, ['0', '1', '2', '3', '4', '5']],
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

    const anyTap = page.locator('main button:visible').first();
    if (await anyTap.isVisible().catch(() => false)) {
      await anyTap.tap().catch(() => {});
      await page.waitForTimeout(300);
    }
    check(`${name} mobile: no NaN after a touch interaction`, !/NaN/.test(await body(page)));
    await page.screenshot({ path: `${SHOT_DIR}pu-${name.toLowerCase()}-mobile.png` });
    await ctx.close();
  }

  /* ── 12. Zero console/page errors ────────────────────────────────── */
  check('no console/page errors across the run', errs.length === 0, errs.slice(0, 8).join(' | '));

  await browser.close();
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => {
  console.error('RUNNER CRASH', e);
  process.exit(2);
});
