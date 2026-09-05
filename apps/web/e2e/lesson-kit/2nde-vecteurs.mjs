// End-to-end smoke test for the 2nde lesson « Vecteurs ».
// Run: node apps/web/e2e/lesson-kit/2nde-vecteurs.mjs   (vite on :5231, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5231';
const LESSON = `${BASE}/courses/lycee/seconde/geometrie/vecteurs-2nde`;
const KEY = 'u_anon_smarter_lesson_vecteurs-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/le-robot-du-depot`, m2: `${LESSON}/le-meme-vecteur`,
  m3: `${LESSON}/deux-nombres-suffisent`, m4: `${LESSON}/enchainer-les-deplacements`, m5: `${LESSON}/etirer-inverser`,
  m6: `${LESSON}/mesurer-un-vecteur`, m7: `${LESSON}/a-retenir`, m8: `${LESSON}/problemes-de-geometrie`,
  boss: `${LESSON}/mission-finale-le-depot`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };

/** Click an aria-labelled button `times` times (skips when disabled — a bound was reached). */
async function press(page, scope, label, times = 1, issues = null) {
  const b = page.locator(`${scope} button[aria-label="${label}"]`).first();
  for (let i = 0; i < times; i += 1) {
    if (!(await b.isEnabled().catch(() => false))) break;
    await b.click();
    await page.waitForTimeout(60);
    if (issues) await audit(page, issues);
  }
  await settle(page, 300);
}
/** Type into the LAST numeric field of a scope and press OK. */
async function fillLast(page, scope, value) {
  await page.locator(`${scope} input[type="text"]`).last().fill(value);
  await page.locator(`${scope} button:has-text("OK")`).last().click();
  await settle(page);
}
async function batchFirst(page, scope, rows) {
  const groups = page.locator(`${scope} div[role="group"]`);
  for (let i = 0; i < rows; i += 1) await groups.nth(i).locator('button').first().click();
  await settle(page);
}

const browser = await launch();

/* Index + diagnostic */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 90 min', /robot du dépôt/i.test(b) && /Mission finale/.test(b) && /90\s*min/.test(b) && !/NaN/.test(b));
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M.diag, null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]');
  const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")');
  if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*10/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}

/* M1 — the robot (signature) */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once (D-pad + plane)', (await page.locator('#step-1 button[aria-label="Robot : une case vers la droite"]').count()) === 1 && (await page.locator('#step-1 [role="slider"]').count()) === 1);
  // keyboard path on the plane: 3 right, 2 up
  const s1 = page.locator('#step-1 [role="slider"]').first();
  await s1.focus();
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowRight']) { await page.keyboard.press(k); await page.waitForTimeout(80); }
  await audit(page, issues);
  let b = await body(page);
  check('M1: recipe written in words while moving', /3 vers la droite/.test(b) && /Pour l’instant/.test(b));
  for (const k of ['ArrowUp', 'ArrowUp']) { await page.keyboard.press(k); await page.waitForTimeout(80); }
  await settle(page); await audit(page, issues);
  b = await body(page);
  check('M1: station reached, recipe stated', /Sa recette : 3 vers la droite et 2 vers le haut/.test(b));
  // step 2: wrong prediction, then reproduce with the D-pad
  await tap(page, 'Oui, à la station', '#step-2');
  await press(page, '#step-2', 'Robot : une case vers la droite', 3, issues);
  b = await body(page);
  check('M1: partial trip diagnosed by attribute', /direction n’est pas la même/.test(b));
  await press(page, '#step-2', 'Robot : une case vers le haut', 2, issues);
  b = await body(page);
  check('M1: same recipe, other arrival (4 ; 4), prediction contradicted', /Le sol te contredit/.test(b) && /\(4 ; 4\)/.test(b));
  // step 3: chain two orders
  await press(page, '#step-3', 'Robot : une case vers la droite', 2, issues);
  await press(page, '#step-3', 'Robot : une case vers le haut', 1, issues);
  check('M1: first order executed', /Ordre 1 exécuté/.test(await body(page)));
  await press(page, '#step-3', 'Robot : une case vers la gauche', 3, issues);
  await press(page, '#step-3', 'Robot : une case vers le haut', 2, issues);
  b = await body(page);
  check('M1: direct trip = combination', /trajet direct/.test(b) && /1 vers la gauche et 3 vers le haut/.test(b));
  // step 4: return with a wrong prediction
  await tap(page, 'encore', '#step-4');
  await press(page, '#step-4', 'Robot : une case vers la gauche', 3, issues);
  await press(page, '#step-4', 'Robot : une case vers le bas', 2, issues);
  b = await body(page);
  check('M1: return = opposite sense', /sens contraire/.test(b) && /3 vers la gauche et 2 vers le bas/.test(b));
  await tapOption(page, '#step-5', 1);                                // wrong on purpose
  b = await body(page);
  check('M1: wrong answer corrected from the student’s own robots, vecteur named only in the footer', /même recette/.test(b) && /appellent un vecteur/.test(b));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe across the whole run', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}vec-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — the same vector */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  const issues = [];
  await tap(page, 'Non, il change', '#step-1');
  // sweep the origin to every bound (buttons disable at the frame), auditing each stop
  await press(page, '#step-1', 'Augmenter A — x', 12, issues);
  await press(page, '#step-1', 'Augmenter A — y', 12, issues);
  await press(page, '#step-1', 'Diminuer A — x', 12, issues);
  await press(page, '#step-1', 'Diminuer A — y', 12, issues);
  await page.locator('#step-1 button:has-text("Poser la flèche ici")').click(); await settle(page, 200);
  await page.locator('#step-1 button:has-text("Poser la flèche ici")').click(); await settle(page, 200);
  check('M2: too-close placement refused', /Trop près/.test(await body(page)));
  await press(page, '#step-1', 'Augmenter A — x', 3, issues);
  await page.locator('#step-1 button:has-text("Poser la flèche ici")').click(); await settle(page, 200);
  await press(page, '#step-1', 'Augmenter A — y', 4, issues);
  await page.locator('#step-1 button:has-text("Poser la flèche ici")').click(); await settle(page);
  let b = await body(page);
  check('M2: three representatives, one vector, prediction contradicted', /même vecteur/.test(b) && /La figure te contredit/.test(b) && /représentant/.test(b));
  await press(page, '#step-2', 'Diminuer Horizontal', 2, issues);
  await press(page, '#step-2', 'Augmenter Vertical', 1, issues);
  check('M2: zero vector named', /vecteur nul/.test(await body(page)));
  await press(page, '#step-3', 'Diminuer Horizontal', 4, issues);
  check('M2: partial opposite diagnosed', /direction n’est pas la même|sens est inversé|longueur diffère/.test(await body(page)));
  await press(page, '#step-3', 'Diminuer Vertical', 4, issues);
  check('M2: opposite vector named', /vecteur opposé/.test(await body(page)));
  await tapOption(page, '#step-4', 1);                                // wrong on purpose
  check('M2: infinity of representatives', /infinité/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  check('M2: layout safe (origin swept to all four bounds)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M3 — coordinates */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await audit(page, issues);
  // sweep to the longest reachable vector (10 ; 7), then to (3 ; 2)
  await press(page, '#step-1', 'Augmenter Horizontal', 12, issues);
  await press(page, '#step-1', 'Augmenter Vertical', 12, issues);
  check('M3: bounds hold the tip in frame', /\(10 ; 7\)/.test(await body(page)));
  await press(page, '#step-1', 'Diminuer Horizontal', 7, issues);
  await press(page, '#step-1', 'Diminuer Vertical', 5, issues);
  let b = await body(page);
  check('M3: base named after the reading', /base orthonormée/.test(b) && /coordonnées/.test(b));
  // step 2: move A then B
  await page.locator('#step-2 button[aria-pressed]').filter({ hasText: /^A$/ }).click(); await settle(page, 200);
  await press(page, '#step-2', 'Augmenter A — x', 1, issues);
  b = await body(page);
  check('M3: moving A changes AB, table shows xB − xA', /−1 − \(−3\) = 2/.test(b));
  await page.locator('#step-2 button[aria-pressed]').filter({ hasText: /^B$/ }).click(); await settle(page, 200);
  await press(page, '#step-2', 'Diminuer B — x', 4, issues);
  await press(page, '#step-2', 'Augmenter B — y', 2, issues);
  b = await body(page);
  check('M3: AB = (−2 ; 4) reached, rule stated', /−5 − \(−3\) = −2/.test(b) && /la règle, elle, ne bouge pas/.test(b));
  await fillLast(page, '#step-3', '4');                               // sign trap
  check('M3: départ − arrivée trap targeted', /Signe inversé/.test(await body(page)));
  await fillLast(page, '#step-3', '-1');                              // forgot the −3
  check('M3: 2 − 3 trap targeted', /oublie que l’ordonnée/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M3: batch corrected', /Calcule arrivée − départ|bon critère/.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe (12-unit and 1-unit vectors, staircase)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}vec-m3.png`, fullPage: true });
  await ctx.close();
}

/* M4 — sum */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  const issues = [];
  await tap(page, '(2 ; 4)', '#step-1');                              // the displacement, not the point
  await press(page, '#step-1', 'Diminuer v — horizontal', 2, issues);
  await press(page, '#step-1', 'Augmenter v — vertical', 2, issues);
  let b = await body(page);
  check('M4: sum is the direct trip; coordinates add', /3 \+ \(−1\)/.test(b) && /est le DÉPLACEMENT total/.test(b));
  await tap(page, 'u encore', '#step-2');
  await press(page, '#step-2', 'Diminuer v — horizontal', 4, issues);
  await press(page, '#step-2', 'Diminuer v — vertical', 2, issues);
  b = await body(page);
  check('M4: u + (−u) = 0 with the ring', /anneau/.test(b) && /éloigne deux fois plus/.test(b));
  await tapOption(page, '#step-3', 1);                                // wrong on purpose
  check('M4: Chasles explained', /Chasles/.test(await body(page)));
  await batchFirst(page, '#step-4', 3);
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M5 — scalar */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const issues = [];
  await tap(page, 'sens contraire', '#step-1');
  await press(page, '#step-1', 'Augmenter k', 6, issues);             // → 3 (bound)
  let b = await body(page);
  check('M5: k = 3 in frame, coordinates scaled', /3·/.test(b) && /\(6 ; 3\)/.test(b));
  await press(page, '#step-1', 'Diminuer k', 14, issues);             // → −3 (bound)
  b = await body(page);
  check('M5: k = −3 reverses the sense', /sens contraire/.test(b) && /\(−6 ; −3\)/.test(b));
  await press(page, '#step-1', 'Augmenter k', 6, issues);             // → 0
  b = await body(page);
  check('M5: all three goals visited, direction kept', /retourne le sens/.test(b) && /k négatif qui retourne/.test(b));
  await batchFirst(page, '#step-2', 4);
  await press(page, '#step-3', 'Augmenter Horizontal', 2, issues);    // (3 ; 2) not a multiple
  check('M5: not a multiple stated', /Pas un multiple/.test(await body(page)));
  await press(page, '#step-3', 'Augmenter Horizontal', 1, issues);    // (4 ; 2) = 2·u
  check('M5: colinéaires named with k = 2', /colinéaires/.test(await body(page)) && /= 2·/.test(await body(page)));
  await tapOption(page, '#step-4', 1);                                // wrong on purpose
  check('M5: complete', await nextEnabled(page));
  check('M5: layout safe (k swept −3 → 3)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}vec-m5.png`, fullPage: true });
  await ctx.close();
}

/* M6 — norm, distance, midpoint */
{
  const { ctx, page } = await o(browser, M.m6, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  const issues = [];
  await press(page, '#step-1', 'Augmenter Horizontal', 1, issues);    // (3 ; 1)
  check('M6: non-integer norm shown exactly and approximately', /√10 ≈ 3,16/.test(await body(page)));
  await press(page, '#step-1', 'Augmenter Vertical', 3, issues);      // (3 ; 4)
  check('M6: (3 ; 4) → 5', /= 5/.test(await body(page)));
  await press(page, '#step-1', 'Augmenter Horizontal', 3, issues);
  await press(page, '#step-1', 'Augmenter Vertical', 4, issues);      // (6 ; 8)
  check('M6: doubling doubles the norm, orthonormée named', /double/.test(await body(page)) && /orthonormée/.test(await body(page)));
  await fillLast(page, '#step-2', '7');                               // sum of the steps
  check('M6: 7 trap targeted', /somme des marches/.test(await body(page)));
  await press(page, '#step-3', 'Diminuer I — x', 4, issues);
  await press(page, '#step-3', 'Augmenter I — y', 8, issues);
  check('M6: midpoint reached, mean formula', /moyennes/.test(await body(page)));
  await tapOption(page, '#step-4', 1);                                // wrong on purpose
  check('M6: midpoint trap corrected', /SOMME des coordonnées/.test(await body(page)));
  check('M6: complete', await nextEnabled(page));
  check('M6: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M7 — formalisation */
{
  const { ctx, page } = await o(browser, M.m7, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'm7' });
  await batchFirst(page, '#step-1', 5);
  await tap(page, '(−3 ; 2)', '#step-2');                             // wrong
  check('M7: coefficient of i explained', /coefficient de i/.test(await body(page)));
  await batchFirst(page, '#step-3', 4);
  check('M7: complete', await nextEnabled(page));
  await ctx.close();
}

/* M8 — problems */
{
  const { ctx, page } = await o(browser, M.m8, ['0', '1', '2', '3', '4', '5', '6', '7'], { tag: 'm8' });
  const issues = [];
  await audit(page, issues);
  check('M8: gap to AB quantified', /Il manque/.test(await body(page)));
  await press(page, '#step-1', 'Diminuer D — x', 4, issues);
  await press(page, '#step-1', 'Diminuer D — y', 6, issues);
  check('M8: parallelogram closed, D computed', /se ferme/.test(await body(page)) && /\(−1 ; −5\)/.test(await body(page)));
  await fillLast(page, '#step-2', '6');                               // total instead of v
  check('M8: total-instead-of-v trap', /trajet TOTAL/.test(await body(page)));
  await fillLast(page, '#step-2', '3');
  check('M8: sign trap on v', /redescend|Signe/.test(await body(page)));
  await tapOption(page, '#step-3', 1);                                // wrong
  check('M8: alignment proved by colinearity', /AC = 3·AB/.test(await body(page)));
  check('M8: complete', await nextEnabled(page));
  check('M8: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, null, { tag: 'boss' });
  check('boss: reachable and silent', /Le même vecteur \?/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score', /\/ 10/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page);
  check('boss: synthèse frozen depot', (await page.locator('svg[aria-label^="Le dépôt"]').count()) === 1);
  const lay = await layoutAudit(page);
  check('boss: synthèse lays out', lay.length === 0, lay.join(' | '));
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('9'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 + M5 */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'mobile-m1', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Robot : une case vers la droite', 3, issues);
  await press(page, '#step-1', 'Robot : une case vers le haut', 2, issues);
  check('mobile M1: station reached with the D-pad', /Sa recette/.test(await body(page)));
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}vec-m1-mobile.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'mobile-m5', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Augmenter k', 6, issues);
  await press(page, '#step-1', 'Diminuer k', 14, issues);
  check('mobile M5: no horizontal scroll at k = −3', await noHScroll(page));
  check('mobile M5: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
