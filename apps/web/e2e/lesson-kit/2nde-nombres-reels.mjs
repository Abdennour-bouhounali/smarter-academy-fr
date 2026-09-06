// End-to-end smoke test for the 2nde lesson « Nombres réels ».
// Run: node apps/web/e2e/lesson-kit/2nde-nombres-reels.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, fillOk, tap, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/nombres-reels-2nde`;
const KEY = 'u_anon_smarter_lesson_nombres-reels-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/le-zoom-infini`, m2: `${LESSON}/les-familles-de-nombres`,
  m3: `${LESSON}/decimal-ou-pas`, m4: `${LESSON}/exact-ou-approche`,
  m5: `${LESSON}/encadrer-et-comparer`, boss: `${LESSON}/mission-finale-la-diagonale`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page))); };
const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules', /zoom infini/i.test(b) && /Mission finale/.test(b) && /75\s*min/.test(b) && !/NaN/.test(b));
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

/* M1 — zoom */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  await tap(page, 'Oui, en zoomant assez');            // wrong prediction, no verdict
  check('M1: prediction silent', !/Bonne réponse/.test(await body(page)));
  const zoom = page.locator('#step-1 button[aria-label="Zoomer fois dix"]');
  await zoom.click(); await settle(page, 300); await audit(page, issues);
  let b = await body(page);
  check('M1: 1,5 lands on a graduation after one zoom', /tombe pile/.test(b) && /1,5 = 1,5/.test(b));
  await page.locator('#step-1 button[aria-label="Chercher √2"]').click(); await settle(page, 200);
  for (let i = 0; i < 6; i += 1) { await zoom.click(); await page.waitForTimeout(200); await audit(page, issues); }
  b = await body(page);
  check('M1: √2 never lands; digits 1,41421', /1,41421/.test(b) && /encadrement/.test(b));
  check('M1: prediction quoted back and contradicted', /Le zoom te contredit/.test(b));
  check('M1: zoom capped at 6', await zoom.isDisabled());
  await page.locator('#step-1 button[aria-label="Dézoomer"]').click(); await settle(page, 200); await audit(page, issues);
  const z3 = page.locator('#step-2 button[aria-label="Zoomer fois dix"]');
  for (let i = 0; i < 3; i += 1) { await z3.click(); await page.waitForTimeout(200); await audit(page, issues); }
  b = await body(page);
  check('M1: 1/3 repeats', /répète le même chiffre/.test(b) && /0,333/.test(b));
  await page.locator('#step-2 button[aria-label="Chercher π"]').click(); await settle(page, 200);
  for (let i = 0; i < 5; i += 1) { await z3.click(); await page.waitForTimeout(150); await audit(page, issues); }
  check('M1: π digits', /3,14159/.test(await body(page)));
  await tap(page, '1,4 et 1,5');                         // wrong on purpose
  check('M1: encadrement corrected', /fenêtre 1,41 → 1,42/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe across 14 zooms', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}nr-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — families */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  const place = async (n, fam) => {
    await page.locator(`button[aria-label="Nombre ${n}"]`).first().click();
    await page.locator(`button[aria-label^="Ranger dans ${fam}"]`).first().click();
    await page.waitForTimeout(120);
  };
  await page.locator('button[aria-label="Nombre 1/3"]').click();
  check('M2: expansion shown on tap', /1\/3 = 0,33333333…/.test(await body(page)) && /période 3/.test(await body(page)));
  await page.locator('button[aria-label^="Ranger dans 𝔻"]').click();   // wrong on purpose
  check('M2: wrong family explained', /plus petite famille est ℚ/.test(await body(page)));
  await place('3/4', '𝔻'); await place('√9', 'ℕ'); await place('\u22127', 'ℤ'); await place('√2', 'ℝ');
  await place('0,5', '𝔻'); await place('π', 'ℝ'); await place('12', 'ℕ');
  check('M2: words revealed after sorting', /irrationnel/.test(await body(page)) && /ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ/.test(await body(page)));
  const rows = page.locator('#step-2 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M2: complete', await nextEnabled(page));
  await ctx.close();
}

/* M3 — division */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const next = page.locator('#step-1 button[aria-label="Chiffre suivant"]');
  for (let i = 0; i < 3; i += 1) { await next.click(); await page.waitForTimeout(150); }
  let b = await body(page);
  check('M3: 3/8 stops at remainder 0', /s’arrête/.test(b) && /0,375/.test(b) && await next.isDisabled());
  await page.locator('#step-1 button[aria-label="Développer 1/3"]').click(); await settle(page, 200);
  await next.click(); await page.waitForTimeout(150); await next.click(); await settle(page);
  b = await body(page);
  check('M3: 1/3 remainder returns, period named', /se répéter/.test(b) && /période 3/.test(b));
  await tap(page, 'L’écriture s’arrête', '#step-2');    // wrong prediction, no verdict
  const n2 = page.locator('#step-2 button[aria-label="Chiffre suivant"]');
  for (let i = 0; i < 7; i += 1) { await n2.click(); await page.waitForTimeout(120); }
  b = await body(page);
  check('M3: 2/7 period 285714 and prediction contradicted', /285714/.test(b) && /La division te contredit/.test(b));
  await tap(page, 'nombre impair');                     // wrong on purpose
  check('M3: pigeonhole on remainders explained', /six restes non nuls/.test(await body(page)));
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M3: complete', await nextEnabled(page));
  await ctx.close();
}

/* M4 — rounding lab */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  const issues = [];
  const plus = page.locator('#step-1 button[aria-label="Augmenter la précision"]');
  for (let i = 0; i < 4; i += 1) { await plus.click(); await page.waitForTimeout(200); await audit(page, issues); }
  let b = await body(page);
  check('M4: square of the rounding never 2', /1,99996164/.test(b) && /pas 2/.test(b));
  check('M4: precision capped at 4', await plus.isDisabled());
  await page.locator('#step-1 button[aria-label="Approcher 2/3"]').click(); await settle(page, 200);
  for (let i = 0; i < 2; i += 1) { await plus.click(); await page.waitForTimeout(150); await audit(page, issues); }
  b = await body(page);
  check('M4: 2/3 rounds up at the hundredth', /0,66 ≤ 2\/3 < 0,67/.test(b) && /chiffre suivant : 6/.test(b));
  await tap(page, '0,66', '#step-2');                    // wrong on purpose
  check('M4: truncation vs rounding explained', /troncature/.test(await body(page)));
  await tap(page, '18{,}85', '#step-3').catch(() => {});
  const opt = page.locator('#step-3 button[aria-pressed]').nth(2);
  if (!/Bonne réponse|exacte/.test(await body(page))) { await opt.click({ force: true }); await settle(page); }
  check('M4: exact 6π explained', /6π/.test(await body(page)));
  await fillOk(page, '3,1', '#step-4');                  // wrong on purpose
  check('M4: 3,1 targeted as truncation', /3,1 est la troncature/.test(await body(page)));
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe on precision sweeps', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}nr-m4.png`, fullPage: true });
  await ctx.close();
}

/* M5 */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const issues = [];
  for (const a of ['5', '2', '3', '4']) { await page.locator(`#step-1 button[aria-label="Essayer ${a}"]`).click(); await page.waitForTimeout(150); }
  await audit(page, issues);
  let b = await body(page);
  check('M5: integer bracket 3 ≤ √10 < 4', /3 ≤ √10 < 4/.test(b) && /5² = 25/.test(b));
  for (const a of ['3,5', '3,1', '3,2']) { await page.locator(`#step-2 button[aria-label="Essayer ${a}"]`).click(); await page.waitForTimeout(150); }
  await audit(page, issues);
  check('M5: tenth bracket 3,1 ≤ √10 < 3,2', /3,1 ≤ √10 < 3,2/.test(await body(page)));
  // ordering: wrong on purpose (√2 before 1,41)
  for (const t of ['1,4', '√2', '1,41', '1,42', '3/2']) { await page.locator(`#step-3 button[aria-label="Placer ${t}"]`).click(); await page.waitForTimeout(100); }
  await page.locator('#step-3 button:has-text("Vérifier")').click(); await settle(page);
  b = await body(page);
  check('M5: ordering break point named, formative', /casse|ordre/i.test(b) && await page.locator('#step-4').count() > 0);
  await fillOk(page, '400', '#step-4');                  // wrong on purpose (half)
  check('M5: half trap targeted', /pas la moitié/.test(await body(page)));
  await tap(page, '28 m', '#step-4');                    // wrong on purpose
  check('M5: rounding up imposed by the situation', /trop court/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, null, { tag: 'boss' });
  check('boss: reachable and silent', /Épreuve 1/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score shown', /\/ 10/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page);
  check('boss: synthèse IS the complete knowledge map', /Ma carte des connaissances/.test(await body(page)) && (await page.locator('[data-knowledge-snapshot="complete"] [data-km-item]').count()) === 17);
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('6'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}

/* Mobile M1 */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'mobile', mobile: true });
  const issues = [];
  await page.locator('button[aria-pressed]').filter({ hasText: 'Non, jamais' }).first().tap();
  const zoom = page.locator('#step-1 button[aria-label="Zoomer fois dix"]');
  await page.locator('#step-1 button[aria-label="Chercher √2"]').tap(); await page.waitForTimeout(200);
  for (let i = 0; i < 6; i += 1) { await zoom.tap(); await page.waitForTimeout(200); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page))); }
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: 7-decimal windows lay out cleanly', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}nr-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
