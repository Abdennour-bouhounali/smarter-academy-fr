// End-to-end smoke test for the 2nde lesson « Colinéarité et alignement ».
// Run: node apps/web/e2e/lesson-kit/2nde-colinearite.mjs   (vite on :5232, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5232';
const LESSON = `${BASE}/courses/lycee/seconde/geometrie/colinearite-alignement-2nde`;
const KEY = 'u_anon_smarter_lesson_colinearite-alignement-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/le-rail`, m2: `${LESSON}/trois-points-une-droite`,
  m3: `${LESSON}/des-coordonnees-proportionnelles`, m4: `${LESSON}/le-detecteur`,
  m5: `${LESSON}/alignement-et-parallelisme`, boss: `${LESSON}/mission-finale-le-detecteur`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };

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
  check('index: loads with all modules and 64 min', /Le rail/.test(b) && /Mission finale/.test(b) && /64\s*min/.test(b) && !/NaN/.test(b));
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M.diag, null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]');
  const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")');
  if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*\d+/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}

/* M1 — the rail (signature) */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once', (await page.locator('#step-1 [role="slider"]').count()) === 1 && (await page.locator('#step-1 button[aria-label="Augmenter x de v"]').count()) === 1);
  await tap(page, 'il faut la même longueur', '#step-1');           // wrong prediction, no verdict
  // keyboard path on the plane: one step right
  await page.locator('#step-1 [role="slider"]').first().focus();
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120); await audit(page, issues);
  let b = await body(page);
  check('M1: keyboard moves v, legend shows (4 ; −1)', /\(4 ; −1\)/.test(b) && /différente/.test(b));
  await press(page, '#step-1', 'Augmenter y de v', 3, issues);      // (4 ; 2) : on the rail, longer
  b = await body(page);
  check('M1: longer vector on the rail, prediction contradicted', /Le rail te contredit/.test(b) && /ne regarde pas la longueur/.test(b));
  await press(page, '#step-2', 'Diminuer x de v', 6, issues);
  await press(page, '#step-2', 'Diminuer y de v', 3, issues);       // (−2 ; −1)
  b = await body(page);
  check('M1: opposite sense, same direction', /sens contraire/.test(b) && /un demi-tour ne change pas la direction/.test(b));
  await press(page, '#step-3', 'Augmenter x de v', 1, issues);      // (−1 ; −1) leaves the rail
  b = await body(page);
  check('M1: leaves the rail, same factor stated', /a quitté le rail/.test(b) && /même/.test(b));
  // sweep v to every bound, auditing labels at each stop (zero vector is refused)
  await press(page, '#step-3', 'Augmenter x de v', 12, issues);
  await press(page, '#step-3', 'Augmenter y de v', 12, issues);
  await press(page, '#step-3', 'Diminuer x de v', 12, issues);
  await press(page, '#step-3', 'Diminuer y de v', 12, issues);
  await tapOption(page, '#step-4', 1);                                // wrong on purpose
  b = await body(page);
  check('M1: colinéaires named, wrong answer corrected on the rail', /Regarde le rail/.test(b) && /colinéaires/.test(b));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe (v swept to all four bounds)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}col-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — three points */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  const issues = [];
  await tap(page, 'Oui', '#step-1');
  await press(page, '#step-1', 'Diminuer x de C', 1, issues);
  await press(page, '#step-1', 'Augmenter y de C', 4, issues);      // (3 ; 2) aligned
  let b = await body(page);
  check('M2: first aligned position, lamps agree', /1 position alignée sur 3/.test(b) && /alignés/.test(b));
  await press(page, '#step-1', 'Augmenter x de C', 2, issues);
  await press(page, '#step-1', 'Augmenter y de C', 1, issues);      // (5 ; 3)
  await press(page, '#step-1', 'Diminuer x de C', 10, issues);
  await press(page, '#step-1', 'Diminuer y de C', 5, issues);       // (−5 ; −2) beyond A
  b = await body(page);
  check('M2: three positions incl. beyond A, alignés ⇔ colinéaires', /de l’autre côté de A/.test(b) && /AC roule sur le rail de AB/.test(b));
  await tapOption(page, '#step-2', 0);                                // wrong on purpose (« oui »)
  check('M2: near miss (5 ; 4) explained', /\(5 ; 3\)/.test(await body(page)));
  await tapOption(page, '#step-3', 3);                                // wrong on purpose (« entre »)
  check('M2: the bridge stated', /colinéaires/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}col-m2.png`, fullPage: true });
  await ctx.close();
}

/* M3 — proportional coordinates */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await press(page, '#step-1', 'Augmenter k', 2, issues);           // 2
  let b = await body(page);
  check('M3: k = 2 table shows (4 ; 2)', /\(4 ; 2\)/.test(b));
  await press(page, '#step-1', 'Diminuer k', 8, issues);            // → −2 through 0
  b = await body(page);
  check('M3: v = k·u for every k, coordinates proportional', /proportionnelles/.test(b) && /vecteur nul/.test(b));
  await batchFirst(page, '#step-2', 4);                              // r2 wrong on purpose
  check('M3: cross products shown', /produits en croix/i.test(await body(page)) && /2 × 3 = 6 et 1 × 4 = 4/.test(await body(page)));
  await fillLast(page, '#step-3', '-9');                             // sign trap
  check('M3: sign trap targeted', /Le signe/.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe (k swept −2 → 2)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M4 — the detector */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  const issues = [];
  await tap(page, 'perpendiculaires', '#step-1');
  await audit(page, issues);
  let b = await body(page);
  check('M4: det live before any move', /3 × 2 − 1 × 1 = 6 − 1 = 5/.test(b));
  await press(page, '#step-1', 'Augmenter x de v', 5, issues);      // v (6 ; 2) → det 0
  b = await body(page);
  check('M4: det = 0 ⇔ flat, prediction contradicted', /Le détecteur te contredit/.test(b) && /plat/.test(b));
  await press(page, '#step-2', 'Augmenter y de v', 1, issues);      // (6 ; 3) det 3
  await press(page, '#step-2', 'Diminuer y de v', 2, issues);       // (6 ; 1) det −3
  await press(page, '#step-2', 'Diminuer x de v', 2, issues);       // (4 ; 1) det −1
  b = await body(page);
  check('M4: sign and near-flat |det| = 1', /le déterminant tranche/.test(b));
  // sweep u and v to the corners: the plane refits, labels must hold
  await press(page, '#step-2', 'Augmenter x de u', 12, issues);
  await press(page, '#step-2', 'Augmenter y de u', 12, issues);
  await press(page, '#step-2', 'Augmenter x de v', 12, issues);
  await press(page, '#step-2', 'Augmenter y de v', 12, issues);
  b = await body(page);
  check('M4: (6 ; 6) and (6 ; 6) are collinear, det 0', /6 × 6 − 6 × 6 = 36 − 36 = 0/.test(b));
  await press(page, '#step-2', 'Diminuer x de u', 12, issues);
  await press(page, '#step-2', 'Diminuer y de v', 12, issues);
  await fillLast(page, '#step-3', '22');                             // added the products
  check('M4: added-products trap', /AJOUTÉ/.test(await body(page)));
  await tapOption(page, '#step-4', 1);                                // wrong on purpose
  check('M4: decision with det', /36 − 36 = 0/.test(await body(page)));
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe (u, v swept to the corners, plane refits)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}col-m4.png`, fullPage: true });
  await ctx.close();
}

/* M5 — alignment and parallelism */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const issues = [];
  await tap(page, 'CD = AB', '#step-1');
  await audit(page, issues);
  let b = await body(page);
  check('M5: lines secant at start, det shown', /sécantes/.test(b) && /det\(AB, CD\) = 3 × 1 − 2 × 4/.test(b));
  await press(page, '#step-1', 'Diminuer x de D', 1, issues);
  await press(page, '#step-1', 'Augmenter y de D', 1, issues);      // (3 ; 4) parallel
  b = await body(page);
  check('M5: first parallel position, k shown', /parallèles/.test(b) && /CD = 1·AB/.test(b));
  await press(page, '#step-1', 'Diminuer x de D', 6, issues);
  await press(page, '#step-1', 'Diminuer y de D', 4, issues);       // (−3 ; 0) : CD = −AB
  b = await body(page);
  check('M5: opposite-sense parallel, prediction corrected', /Trop fort/.test(b) && /le même test/.test(b));
  await tapOption(page, '#step-2', 0);                                // wrong on purpose (« oui »)
  check('M5: the eye cannot decide', /suggère, elle ne prouve rien/.test(await body(page)));
  await fillLast(page, '#step-3', '-9');
  check('M5: sign trap on PR', /Signe inversé/.test(await body(page)));
  await fillLast(page, '#step-3', '1');
  check('M5: −2 forgotten trap', /oublie que l’ordonnée/.test(await body(page)));
  await batchFirst(page, '#step-4', 3);
  check('M5: det decides where the eye hesitated', /L’œil hésitait, le déterminant a tranché/.test(await body(page)));
  await fillLast(page, '#step-5', '4');
  check('M5: missing coordinate trap targeted', /ordonnée de EG/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  check('M5: layout safe (D swept, second rail pivots)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}col-m5.png`, fullPage: true });
  await ctx.close();
}

/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, null, { tag: 'boss' });
  check('boss: reachable and silent', /Sens contraire/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score', /\/ 10/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page);
  // La synthèse est désormais la carte des connaissances complète (cf. 2nde-colinearite-carte.mjs).
  check('boss: synthèse = complete knowledge map', (await page.locator('[data-knowledge-snapshot="complete"]').count()) === 1);
  const lay = await layoutAudit(page);
  check('boss: synthèse lays out', lay.length === 0, lay.join(' | '));
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('6'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 + M4 */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'mobile-m1', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Augmenter x de v', 12, issues);
  await press(page, '#step-1', 'Augmenter y de v', 12, issues);
  await press(page, '#step-1', 'Diminuer x de v', 12, issues);
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}col-m1-mobile.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'mobile-m4', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Augmenter x de u', 12, issues);
  await press(page, '#step-1', 'Diminuer y de v', 12, issues);
  check('mobile M4: no horizontal scroll with a refitted plane', await noHScroll(page));
  check('mobile M4: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
