// End-to-end smoke test for the 2nde lesson « Valeur absolue et distance ».
// Run: node apps/web/e2e/lesson-kit/2nde-valeur-absolue.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, fillOk, tap, sweepSliders, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/valeur-absolue-distance-2nde`;
const KEY = 'u_anon_smarter_lesson_valeur-absolue-distance-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/deux-bateaux-une-distance`, m2: `${LESSON}/calculer-une-valeur-absolue`,
  m3: `${LESSON}/la-distance-entre-deux-nombres`, m4: `${LESSON}/le-faisceau`,
  m5: `${LESSON}/situations`, boss: `${LESSON}/mission-finale-le-phare`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page))); };
const press = async (page, scope, label, n) => { const b = page.locator(`${scope} button[aria-label="${label}"]`).first(); for (let i = 0; i < n; i += 1) { await b.click(); await page.waitForTimeout(60); } };
const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 59 min', /Deux bateaux/.test(b) && /Mission finale/.test(b) && /59\s*min/.test(b) && !/NaN/.test(b));
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

/* M1 */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  await tap(page, 'B (km −4) est plus loin');
  check('M1: prediction silent', !/Bonne réponse/.test(await body(page)));
  // sweep the handle to both ends by keyboard, audit
  await sweepSliders(page, issues);
  // stepper: bring to −4 then +4 (start 3 → after End/Home/→→→ the value is min+1.5 = −8.5)
  const val = async () => Number((await page.locator('#step-1 [role="slider"]').first().getAttribute('aria-valuenow')));
  const goTo = async (target) => { const v = await val(); const steps = Math.round((target - v) / 0.5); if (steps > 0) await press(page, '#step-1', 'Augmenter bateau', steps); else await press(page, '#step-1', 'Diminuer bateau', -steps); await settle(page, 200); };
  await goTo(-4); await audit(page, issues);
  check('M1: distance 4 at −4', /distance : 4 km/.test(await body(page)));
  await goTo(4); await audit(page, issues);
  let b = await body(page);
  check('M1: same bar at +4, prediction contradicted', /la barre mesure 4 km/.test(b) && /La côte te contredit/.test(b));
  const s3 = page.locator('#step-2 [role="slider"]').first();
  await s3.focus(); await page.keyboard.press('Home'); for (let i = 0; i < 10; i += 1) await page.keyboard.press('ArrowRight'); // −10 + 5 = −5
  await settle(page, 200); await audit(page, issues);
  check('M1: first position at 5 km found', /Une position trouvée/.test(await body(page)));
  for (let i = 0; i < 20; i += 1) await page.keyboard.press('ArrowRight'); // −5 + 10 = 5
  await settle(page, 200); await audit(page, issues);
  check('M1: both −5 and 5 found', /Deux positions/.test(await body(page)));
  await tap(page, '−7');   // wrong on purpose
  check('M1: |−7| corrected as a distance', /jamais négative/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe on sweeps', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}va-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  for (const c of ['−3', '3', '0']) { await page.locator(`button[aria-label="Entrer ${c}"]`).click(); await page.waitForTimeout(120); }
  await page.locator('input[aria-label="Un nombre à entrer"]').fill('-4,5');
  await page.locator('button:has-text("Entrer")').last().click(); await settle(page);
  let b = await body(page);
  check('M2: machine explains −(−12,75)-style opposite', /|−4,5| = 4,5/.test(b) && /l’opposé de/.test(b));
  await tap(page, 'On ne peut pas savoir');   // wrong
  check('M2: −x explained', /−\(−8\) = 8/.test(await body(page)));
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 5; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M2: complete', await nextEnabled(page));
  await ctx.close();
}

/* M3 */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await press(page, '#step-1', 'Augmenter B', 2); await audit(page, issues);
  await page.locator('#step-1 button:has-text("Les deux avancent de 2 km")').click(); await page.waitForTimeout(150); await audit(page, issues);
  await page.locator('#step-1 button:has-text("Les deux avancent de 2 km")').click(); await settle(page); await audit(page, issues);
  check('M3: translation invariance stated', /n’a pas bougé/.test(await body(page)));
  await tap(page, '5 − 3 = 2');   // wrong
  check('M3: sign trap corrected', /oublie le signe/.test(await body(page)));
  await fillOk(page, '9,5', '#step-3');   // wrong (added)
  check('M3: 9,5 targeted', /MÊME côté/.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M4 */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  const issues = [];
  const s = page.locator('#step-1 [role="slider"]').first();
  await s.focus(); await page.keyboard.press('End'); await page.waitForTimeout(150); await audit(page, issues);  // 10 → out
  await page.keyboard.press('Home'); await page.waitForTimeout(150); await audit(page, issues);                 // −10 → out
  for (let i = 0; i < 26; i += 1) await page.keyboard.press('ArrowRight');                                     // 3 → in
  await page.waitForTimeout(150); await audit(page, issues);
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('ArrowRight');                                      // 5 → edge
  await settle(page); await audit(page, issues);
  let b = await body(page);
  check('M4: edge found, verdict éclairé', /|5 − 3| = 2 → éclairé/.test(b));
  await tap(page, ']−∞ ; 5]');   // wrong
  check('M4: symmetric beam explained', /SYMÉTRIQUE/.test(await body(page)));
  // step 2: wrong once, then set a=3, r=4
  await page.locator('#step-2 button:has-text("Valider mon réglage")').click(); await settle(page);
  check('M4: wrong setting described', /Pas encore/.test(await body(page)));
  await press(page, '#step-2', 'Augmenter centre a', 3);
  await press(page, '#step-2', 'Augmenter rayon r', 6);
  await audit(page, issues);
  await page.locator('#step-2 button:has-text("Valider mon réglage")').click(); await settle(page);
  check('M4: centre 3 rayon 4 accepted', /Construction juste/.test(await body(page)));
  await page.locator('#step-3 button[aria-label^="Bord du faisceau"]').click(); await settle(page, 200); await audit(page, issues);
  check('M4: strict bord → dans le noir at 5', /dans le noir/.test(await body(page)));
  await tap(page, 'Oui, comme avant');   // wrong
  check('M4: open interval explained', /\]1 ; 5\[/.test(await body(page)));
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}va-m4.png`, fullPage: true });
  await ctx.close();
}

/* M5 */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const lay = await layoutAudit(page);
  check('M5: tolerance line lays out', lay.length === 0, lay.join(' | '));
  await tap(page, '[20 ; 20,5]', '#step-1');   // wrong
  check('M5: two-sided tolerance explained', /DEUX côtés/.test(await body(page)));
  await fillOk(page, '0,55', '#step-1');        // wrong (distance not overshoot)
  check('M5: 0,55 targeted', /dépassement est 0,55 − 0,5/.test(await body(page)));
  await tap(page, '|T − 2| ≤ 8', '#step-2');
  await tap(page, '[10,5 ; 13,5]', '#step-3');
  await tap(page, 'Au km 1', '#step-4');
  check('M5: complete', await nextEnabled(page));
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
  check('boss: synthèse IS the complete knowledge map', /Ma carte des connaissances/.test(await body(page)) && (await page.locator('[data-knowledge-snapshot="complete"] [data-km-item]').count()) === 14);
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('6'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 + M4 */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'mobile', mobile: true });
  const issues = [];
  const s = page.locator('#step-1 [role="slider"]').first();
  await s.focus();
  for (const k of ['End', 'Home', 'PageUp', 'PageUp']) { await page.keyboard.press(k); await page.waitForTimeout(150); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page))); }
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: beam line lays out at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}va-m4-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
