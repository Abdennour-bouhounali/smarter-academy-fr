// End-to-end smoke test for the 2nde lesson « Calcul littéral ».
// Run: node apps/web/e2e/lesson-kit/2nde-calcul-litteral.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, fillOk, tap, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/calcul-litteral-2nde`;
const KEY = 'u_anon_smarter_lesson_calcul-litteral-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/le-tour-de-magie`, m2: `${LESSON}/reduire`, m3: `${LESSON}/developper-laire-qui-se-decoupe`,
  m4: `${LESSON}/factoriser-le-facteur-commun`, m5: `${LESSON}/trois-formes-trois-usages`, m6: `${LESSON}/demontrer-et-resoudre`, boss: `${LESSON}/mission-finale-le-magicien`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const press = async (page, scope, label, n) => { const b = page.locator(`${scope} button[aria-label="${label}"]`).first(); for (let i = 0; i < n; i += 1) { await b.click(); await page.waitForTimeout(60); } };
const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 80 min', /tour de magie/i.test(b) && /Mission finale/.test(b) && /80\s*min/.test(b) && !/NaN/.test(b));
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

/* M1 — magic trick */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once', (await page.locator('#step-1 button[aria-label="Essayer 5"]').count()) === 1);
  await tap(page, 'Oui, il change');                         // prediction, no verdict
  for (const c of ['5', '−7', '2,5']) { await page.locator(`#step-1 button[aria-label="Essayer ${c}"]`).click(); await page.waitForTimeout(150); await audit(page, issues); }
  await page.locator('#step-1 input[aria-label="Ton nombre de départ"]').fill('-1000000');
  await page.locator('#step-1 button:has-text("Essayer")').click(); await settle(page, 300); await audit(page, issues);
  let b = await body(page);
  check('M1: always 3, prediction contradicted', /−1 000 000 → 3/.test(b) && /Les essais te contredisent/.test(b));
  await page.locator('#step-1 button:has-text("Suivre avec")').click(); await settle(page, 300); await audit(page, issues);
  b = await body(page);
  check('M1: symbolic chain shown', /3x \+ 9/.test(b) && /x \+ 3/.test(b));
  await tap(page, 'Parce que 9 ÷ 3 = 3');                     // wrong
  check('M1: proof by the letter explained', /tester des nombres ne prouve rien/.test(await body(page)));
  for (const c of ['1', '4', '6']) { await page.locator(`#step-2 button[aria-label="Essayer ${c}"]`).click(); await page.waitForTimeout(120); }
  await page.locator('#step-2 button:has-text("Suivre avec")').click(); await settle(page, 300); await audit(page, issues);
  check('M1: second trick chain 2x + 1', /2x \+ 1/.test(await body(page)));
  await page.locator('#step-2 input[aria-label^="Sans calculer"]').fill('121');   // wrong on purpose
  await page.locator('#step-2 button:has-text("OK")').first().click(); await settle(page);
  check('M1: 121 targeted', /retirer 10² = 100/.test(await body(page)));
  await tap(page, 'Que x vaut 3', '#step-3');                  // wrong
  check('M1: equality of expressions named', /vraie pour TOUT x/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe (long numbers)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}cl2-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — reduce */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  const term = (scope, l) => page.locator(`${scope} button[aria-label="Terme ${l}"]`).first();
  await term('#step-1', '3x²').click(); await term('#step-1', '−5x').click(); await settle(page, 200);   // refused on purpose
  check('M2: unlike merge refused', /Empilement refusé/.test(await body(page)));
  await term('#step-1', '3x²').click(); await term('#step-1', '−x²').click(); await page.waitForTimeout(150);
  await term('#step-1', '−5x').click(); await term('#step-1', '7x').click(); await page.waitForTimeout(150);
  await term('#step-1', '2').click(); await term('#step-1', '−9').click(); await settle(page);
  let b = await body(page);
  check('M2: reduced to 2x² + 2x − 7 with value unchanged', /2x² \+ 2x − 7/.test(b) && /n’a jamais bougé/.test(b));
  await term('#step-2', '4x').click(); await term('#step-2', 'x').click(); await page.waitForTimeout(150);
  await term('#step-2', '−3').click(); await term('#step-2', '0,5').click(); await settle(page);
  check('M2: second reduction with decimal −2,5', /−2x² \+ 5x − 2,5/.test(await body(page)));
  await tap(page, 'Oui : 3 + 2 = 5', '#step-3');               // wrong prediction, no verdict
  for (const v of ['1', '2', '3']) { await page.locator(`#step-3 button[aria-label="Tester x = ${v}"]`).click(); await page.waitForTimeout(150); }
  await settle(page);
  await tap(page, 'la ligne x = 1 le prouve', '#step-3');      // wrong
  check('M2: single agreeing value refuted', /16 ≠ 40/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  await ctx.close();
}

/* M3 — identities */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await tap(page, 'Oui', '#step-1');                           // prediction
  await press(page, '#step-1', 'Augmenter a', 3); await audit(page, issues);
  await press(page, '#step-1', 'Augmenter b', 2); await audit(page, issues);
  await press(page, '#step-1', 'Diminuer a', 5); await audit(page, issues);
  let b = await body(page);
  check('M3: legend derives from a, b', /\(1 \+ 4\)² = 25 = 1 \+ 2 × 4 \+ 16/.test(b));
  for (const v of ['1', '2']) { await page.locator(`#step-1 button[aria-label="Tester x = ${v}"]`).click(); await page.waitForTimeout(150); }
  await settle(page);
  await tap(page, 'a² + b²', '#step-1');                        // wrong
  check('M3: two rectangles explained', /Deux rectangles, pas un/.test(await body(page)));
  await press(page, '#step-2', 'Augmenter b', 1); await audit(page, issues);
  await tap(page, 'a² − b²', '#step-2');                        // wrong
  check('M3: corner counted twice explained', /Enlevé deux fois/.test(await body(page)));
  await press(page, '#step-3', 'Diminuer a', 2); await audit(page, issues);
  await tap(page, 'a² − b² = (a − b)²', '#step-3');             // wrong
  check('M3: difference of squares explained', /facteur \(a − b\) en commun/.test(await body(page)));
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M3: complete', await nextEnabled(page));
  check('M3: square labels never overlap across a, b', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}cl2-m3.png`, fullPage: true });
  await ctx.close();
}

/* M4 — factor */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  await page.locator('#step-1 button[aria-label="Facteur 4"]').click(); await settle(page, 200);
  check('M4: partial factor explained', /on peut sortir plus/.test(await body(page)));
  await page.locator('#step-1 button[aria-label="Facteur 4x"]').click(); await settle(page);
  check('M4: 4x(x + 3) shown', /4x\(x \+ 3\)/.test(await body(page)));
  await page.locator('#step-2 button[aria-label="Facteur x"]').click(); await settle(page, 200);
  check('M4: binomial factor explained', /binôme ENTIER/.test(await body(page)));
  await page.locator('#step-2 button[aria-label="Facteur x + 1"]').click(); await settle(page);
  check('M4: (x + 1)(3x + 1)', /\(x \+ 1\)\(3x \+ 1\)/.test(await body(page)));
  // step 3: three wrong picks → reveal
  await page.locator('#step-3 button[aria-label="Facteur (x − 5)²"]').click(); await settle(page, 200);
  await page.locator('#step-3 button[aria-label="Facteur x(x − 25)"]').click(); await settle(page, 200);
  await page.locator('#step-3 button[aria-label="Facteur (x − 5)²"]').click().catch(() => {}); await settle(page, 200);
  let b = await body(page);
  check('M4: reveal after the cap', /on te le montre/.test(b) || /\(x − 5\)\(x \+ 5\)/.test(b));
  await page.locator('#step-4 button[aria-label="Facteur (2x + 3)²"]').click(); await settle(page);
  check('M4: perfect square recognised', /a² \+ 2ab \+ b² = \(a \+ b\)²/.test(await body(page)));
  for (const v of ['0', '1', '2']) { await page.locator(`#step-5 button[aria-label="Tester x = ${v}"]`).click(); await page.waitForTimeout(150); }
  await settle(page);
  check('M4: complete', await nextEnabled(page));
  await ctx.close();
}

/* M5 */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const opts = (scope) => page.locator(`${scope} button[aria-pressed]`);
  await opts('#step-1').nth(1).click({ force: true }); await settle(page);       // wrong
  check('M5: developed form for A(0)', /lecture directe/.test(await body(page)));
  await opts('#step-2').nth(1).click({ force: true }); await settle(page);       // right
  await opts('#step-3').nth(0).click({ force: true }); await settle(page);       // wrong
  check('M5: square form for the minimum', /Un carré n’est jamais négatif/.test(await body(page)));
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M5: complete', await nextEnabled(page));
  await ctx.close();
}

/* M6 */
{
  const { ctx, page } = await o(browser, M.m6, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  const place = async (t) => { await page.locator(`#step-1 button[aria-label^="Placer : ${t}"]`).click(); await page.waitForTimeout(100); };
  // wrong order on purpose first
  await place('Après ÷3'); await place('Soit x'); await place('Donc le résultat'); await place('Après ×3'); await place('Après − le nombre');
  await page.locator('#step-1 button:has-text("Vérifier l’ordre")').click(); await settle(page);
  check('M6: break point named', /L’ordre casse à la ligne 1/.test(await body(page)));
  for (const t of ['Après ÷3', 'Soit x', 'Donc le résultat', 'Après ×3', 'Après − le nombre']) await page.locator(`#step-1 button[aria-label^="Retirer : ${t}"]`).click().catch(() => {});
  await place('Soit x'); await place('Après ×3'); await place('Après ÷3'); await place('Après − le nombre'); await place('Donc le résultat');
  await page.locator('#step-1 button:has-text("Vérifier l’ordre")').click(); await settle(page);
  check('M6: proof in order', /Démonstration en ordre/.test(await body(page)));
  for (const v of ['3', '4', '7']) { await page.locator(`#step-2 button[aria-label="Tester n = ${v}"]`).click(); await page.waitForTimeout(150); }
  await settle(page);
  await tap(page, 'Les cinq lignes vertes', '#step-2');       // wrong
  check('M6: identity proves the square', /\(n \+ 1\)²/.test(await body(page)) && /ne couvrent pas/.test(await body(page)));
  await fillOk(page, '4', '#step-3');                          // wrong
  check('M6: 4 targeted', /quatre coins de 2 × 2/.test(await body(page)));
  await tap(page, '2x, en simplifiant', '#step-4');           // wrong
  check('M6: factors not terms', /FACTEURS, jamais des termes/.test(await body(page)));
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
  check('boss: synthèse IS the complete knowledge map', /Ma carte des connaissances/.test(await body(page)) && (await page.locator('[data-knowledge-snapshot="complete"] [data-km-item]').count()) === 19);
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('7'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 + M3 */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'mobile', mobile: true });
  const issues = [];
  for (let i = 0; i < 3; i += 1) { await page.locator('#step-1 button[aria-label="Augmenter a"]').tap(); await page.waitForTimeout(120); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page))); }
  for (let i = 0; i < 2; i += 1) { await page.locator('#step-1 button[aria-label="Augmenter b"]').tap(); await page.waitForTimeout(120); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page))); }
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: identity square lays out at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}cl2-m3-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
