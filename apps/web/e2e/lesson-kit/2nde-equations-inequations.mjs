// End-to-end smoke test for the 2nde lesson « Équations et inéquations ».
// Run: node apps/web/e2e/lesson-kit/2nde-equations-inequations.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, fillOk, tap, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/equations-et-inequations-2nde`;
const KEY = 'u_anon_smarter_lesson_equations-et-inequations-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/le-scanner-de-solutions`, m2: `${LESSON}/isoler-x-sans-casser-legalite`,
  m3: `${LESSON}/le-signe-qui-se-retourne`, m4: `${LESSON}/produit-nul`, m5: `${LESSON}/quotient-et-valeur-interdite`,
  m6: `${LESSON}/modeliser`, boss: `${LESSON}/mission-finale-les-deux-forfaits`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page))); };
const press = async (page, scope, label, n) => { const b = page.locator(`${scope} button[aria-label="${label}"]`).first(); for (let i = 0; i < n; i += 1) { await b.click(); await page.waitForTimeout(50); } };
const op = async (page, scope, label) => { await page.locator(`${scope} button[aria-label="${label}"]`).first().click(); await page.waitForTimeout(200); };
const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 85 min', /scanner de solutions/i.test(b) && /Mission finale/.test(b) && /85\s*min/.test(b) && !/NaN/.test(b));
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

/* M1 — scanner */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  await tap(page, 'Une seule');                      // wrong prediction, no verdict
  check('M1: prediction silent', !/Bonne réponse/.test(await body(page)));
  const s = page.locator('#step-1 [role="slider"]').first();
  await s.focus(); await page.keyboard.press('End'); await page.waitForTimeout(150); await audit(page, issues);
  check('M1: at x = 10 A > B', /A > B/.test(await body(page)));
  await page.keyboard.press('Home'); await page.waitForTimeout(150); await audit(page, issues);
  await press(page, '#step-1', 'Augmenter x', 8); await settle(page); await audit(page, issues);
  let b = await body(page);
  check('M1: equality found at x = 4', /égalité !/.test(b) && /x = 4/.test(b) && /résoudre l’équation/.test(b));
  await tap(page, '{4}', '#step-2');                  // wrong on purpose
  b = await body(page);
  check('M1: region [0 ; 4[ revealed and prediction contradicted', /\[0 ; 4\[/.test(b) && /Le scanner te contredit/.test(b));
  check('M1: region drawn on the line', (await page.locator('#step-2 svg[aria-label^="Axe des x"]').count()) === 1);
  await press(page, '#step-3', 'Augmenter x', 4); await settle(page); await audit(page, issues);
  await tap(page, 'Une infinité', '#step-3');         // wrong on purpose
  check('M1: parallel plans → ∅', /ensemble des solutions est vide/.test(await body(page)));
  await fillOk(page, '29', '#step-4');                 // wrong on purpose
  check('M1: 29 targeted (2x = 2 × x)', /pas « 2 collé à x »/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}eq-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — isoler x */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  await op(page, '#step-1', '− 5 à gauche seulement');
  check('M2: one-sided op flagged', /solutions changées/.test(await body(page)));
  await page.locator('#step-1 button:has-text("Annuler")').click(); await settle(page, 200);
  await op(page, '#step-1', '− 5 des deux côtés'); await op(page, '#step-1', '÷ 2 des deux côtés');
  let b = await body(page);
  check('M2: x = 4 isolated', /x isolé/.test(b) && /x = 4 apparaît/.test(b));
  await op(page, '#step-2', '− x des deux côtés'); await op(page, '#step-2', '+ 4 des deux côtés'); await op(page, '#step-2', '÷ 2 des deux côtés');
  check('M2: x = 5', /x = 5/.test(await body(page)));
  // step 3: exhaust 5 ops then reveal
  for (let i = 0; i < 5; i += 1) await op(page, '#step-3', '÷ 7 des deux côtés').catch(() => {});
  await page.locator('#step-3 button:has-text("montre-moi")').click(); await settle(page);
  b = await body(page);
  check('M2: reveal gives the exact fraction', /valeur EXACTE/.test(b));
  await tap(page, 'c’est pareil', '#step-3');         // wrong
  check('M2: 2,33 refuted numerically', /18,31/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  await page.screenshot({ path: `${SHOT_DIR}eq-m2.png`, fullPage: true });
  await ctx.close();
}

/* M3 — sign flip */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  for (const k of ['−1', '2', '−2', '3']) { await page.locator(`#step-1 button[aria-label="Multiplier par ${k}"]`).click(); await page.waitForTimeout(150); await audit(page, issues); }
  let b = await body(page);
  check('M3: × 3 keeps order, −1 flips (status text)', /6 < 15/.test(b));
  await tap(page, 'Rien, comme pour une égalité');    // wrong
  check('M3: flip explained', /−2 > −5/.test(await body(page)));
  await op(page, '#step-2', '− 4 des deux côtés'); await op(page, '#step-2', '÷ (−3) des deux côtés');
  b = await body(page);
  check('M3: inequality solved x ≥ −2', /x ≥ −2/.test(b));
  await tap(page, ']−∞ ; −2]', '#step-3');            // wrong
  check('M3: half-line drawn after reveal', (await page.locator('#step-3 svg[aria-label^="Solutions"]').count()) === 1);
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe on multipliers', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M4 — produit nul */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  const issues = [];
  const s = page.locator('#step-1 [role="slider"]').first();
  await s.focus(); await page.keyboard.press('End'); await page.waitForTimeout(120); await audit(page, issues);
  await page.keyboard.press('Home'); await page.waitForTimeout(120); await audit(page, issues);
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowRight');   // −3
  await page.waitForTimeout(150); await audit(page, issues);
  check('M4: product null at −3', /produit nul !/.test(await body(page)));
  for (let i = 0; i < 10; i += 1) await page.keyboard.press('ArrowRight');  // 2
  await settle(page); await audit(page, issues);
  check('M4: both roots found', /Deux solutions/.test(await body(page)));
  await tap(page, 'seulement si les deux facteurs');   // wrong
  check('M4: rule explained', /UN facteur nul|Un seul facteur nul suffit/.test(await body(page)));
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 3; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  await tap(page, 'Oui, c’est la même règle', '#step-4');   // wrong
  check('M4: product = 3 trap', /ne marche que pour 0/.test(await body(page)));
  await tap(page, 'Une : 3', '#step-5');                    // wrong
  check('M4: −3 recalled', /\(−3\)² = 9/.test(await body(page)));
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M5 — quotient */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const issues = [];
  const s = page.locator('#step-1 [role="slider"]').first();
  await s.focus(); await page.keyboard.press('Home'); for (let i = 0; i < 8; i += 1) await page.keyboard.press('ArrowRight');  // −1
  await page.waitForTimeout(150); await audit(page, issues);
  check('M5: forbidden value shown', /valeur interdite/.test(await body(page)));
  for (let i = 0; i < 8; i += 1) await page.keyboard.press('ArrowRight');   // 3
  await settle(page); await audit(page, issues);
  check('M5: zero found', /quotient nul !/.test(await body(page)) && /Une seule solution : 3/.test(await body(page)));
  await tap(page, '{3 ; −1}', '#step-2');                  // wrong
  check('M5: −1 refused as solution', /jamais une solution/.test(await body(page)));
  await tap(page, '{−2}', '#step-3');                      // wrong
  check('M5: double zero trap', /interdite AVANT/.test(await body(page)));
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M5: complete', await nextEnabled(page));
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M6 */
{
  const { ctx, page } = await o(browser, M.m6, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  await tap(page, 'x + (x + 3) = 26', '#step-1');           // wrong
  check('M6: perimeter equation explained', /fait le TOUR/.test(await body(page)));
  await fillOk(page, '6,5', '#step-1');                      // wrong
  check('M6: 6,5 targeted', /oublié de développer/.test(await body(page)));
  await tap(page, 'h = 5 exactement', '#step-2');           // wrong
  check('M6: inequality budget explained', /INÉQUATION/.test(await body(page)));
  await tap(page, '60t = 90(t + 1)', '#step-3');            // wrong
  await fillOk(page, '2', '#step-3');                        // wrong
  check('M6: 2 h targeted', /temps de roulage de B/.test(await body(page)));
  await tap(page, 'La largeur vaut −2 cm', '#step-4');      // wrong
  check('M6: interpretation explained', /interpréter avant de conclure/i.test(await body(page)));
  check('M6: complete', await nextEnabled(page));
  await ctx.close();
}

/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, null, { tag: 'boss' });
  check('boss: reachable and silent', /Épreuve 1/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score', /\/ 10/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page);
  check('boss: synthèse with the plans line', (await page.locator('svg[aria-label^="De 0 à 4 exclu"]').count()) === 1);
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('7'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'mobile', mobile: true });
  const issues = [];
  await page.locator('button[aria-pressed]').filter({ hasText: 'Une infinité' }).first().tap();
  const s = page.locator('#step-1 [role="slider"]').first();
  await s.focus();
  for (const k of ['End', 'Home', 'PageUp']) { await page.keyboard.press(k); await page.waitForTimeout(150); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page))); }
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: scanner lays out at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}eq-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
