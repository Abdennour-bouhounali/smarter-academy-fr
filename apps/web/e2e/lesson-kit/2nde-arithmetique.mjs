// End-to-end smoke test for the 2nde lesson « Arithmétique ».
// Run: node apps/web/e2e/lesson-kit/2nde-arithmetique.mjs   (vite on :5230, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, fillOk, tap, tapOption, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5230';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/arithmetique-2nde`;
const KEY = 'u_anon_smarter_lesson_arithmetique-2nde';
const M = {
  diag: `${LESSON}/mission-de-depart`, m1: `${LESSON}/les-paquets-et-les-restes`, m2: `${LESSON}/pair-impair-et-la-lettre`,
  m3: `${LESSON}/les-criteres-demontres`, m4: `${LESSON}/multiples-communs`,
  m5: `${LESSON}/demontrer`, boss: `${LESSON}/mission-finale-latelier`,
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const press = async (page, scope, label, n) => { const b = page.locator(`${scope} button[aria-label="${label}"]`).first(); for (let i = 0; i < n; i += 1) { await b.click(); await page.waitForTimeout(50); } };
const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 65 min', /paquets et les restes/i.test(b) && /Mission finale/.test(b) && /65\s*min/.test(b) && !/NaN/.test(b));
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

/* M1 — packs */
{
  const { ctx, page } = await o(browser, M.m1, ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once', (await page.locator('#step-1 button[aria-label="Augmenter tas A"]').count()) === 1);
  await tap(page, 'Oui, parfois');                                  // prediction, no verdict
  await audit(page, issues);
  let b = await body(page);
  check('M1: 12 and 20 in packs of 4 have no remainder', /12 = 4 × 3 \+ 0/.test(b) && /est un multiple de 4/.test(b));
  await page.locator('#step-1 button:has-text("12 et 20, paquets de 7")').click(); await settle(page); await audit(page, issues);
  b = await body(page);
  check('M1: packs of 7 leave a remainder', /Restes : 5 \+ 6 = 11/.test(b) && /n’est pas un multiple de 7/.test(b));
  await tapOption(page, '#step-1', 1);                               // wrong on purpose
  check('M1: the remainders rule explained', /les restes s’ajoutent/.test(await body(page)));
  await page.locator('#step-2 button:has-text("7 et 9, paquets de 2")').click(); await settle(page); await audit(page, issues);
  await tapOption(page, '#step-2', 1);                               // wrong on purpose
  check('M1: odd + odd = even explained by the packs', /un paquet complet, reste 0|1 jeton seul|paquet de plus/.test(await body(page)));
  await tapOption(page, '#step-3', 1);                               // wrong on purpose
  check('M1: multiple/divisor direction corrected', /le MULTIPLE/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  check('M1: layout safe (tiles capped)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}ar-m1.png`, fullPage: true });
  await ctx.close();
}

/* M2 — parity */
{
  const { ctx, page } = await o(browser, M.m2, ['0', '1'], { tag: 'm2' });
  await fillOk(page, '47', '#step-1');                               // wrong on purpose (k is not n)
  check('M2: k is the number of packs', /NOMBRE DE PAQUETS/.test(await body(page)));
  await tapOption(page, '#step-1', 1);                               // wrong
  check('M2: 2k + 1 covers all odds', /couvre tous les impairs|EST n’importe quel impair/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                               // wrong on purpose
  check('M2: the sum proof is shown', /2\(k \+ m \+ 1\)/.test(await body(page)));
  for (const v of ['1', '2', '3']) { await page.locator(`#step-3 button[aria-label="Tester k = ${v}"]`).click(); await page.waitForTimeout(150); }
  await settle(page);
  await tapOption(page, '#step-3', 1);                               // wrong
  check('M2: odd square explained', /forme d’un IMPAIR/.test(await body(page)));
  const rows = page.locator('#step-4 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M2: complete', await nextEnabled(page));
  await ctx.close();
}

/* M3 — criteria */
{
  const { ctx, page } = await o(browser, M.m3, ['0', '1', '2'], { tag: 'm3' });
  const issues = [];
  await tap(page, 'C’est une astuce sans raison');                   // prediction
  check('M3: the nine split is computed for 4 725', /9 × 523 \+ 18/.test(await body(page)));
  for (const v of ['2346', '1080']) { await page.locator(`#step-1 button[aria-label="Découper ${v}"]`).click(); await page.waitForTimeout(250); await audit(page, issues); }
  check('M3: the split follows the chosen number', /9 × 119 \+ 9/.test(await body(page)));
  await tapOption(page, '#step-1', 1);                               // wrong
  check('M3: the proof of the digit rule', /multiple de 9/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                               // wrong
  check('M3: the rule for 4 explained by 100', /4 divise 100/.test(await body(page)));
  const rows = page.locator('#step-3 div[role="group"]');
  for (let i = 0; i < 4; i += 1) await rows.nth(i).locator('button').first().click();
  await settle(page);
  check('M3: complete', await nextEnabled(page));
  check('M3: split table lays out', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}ar-m3.png`, fullPage: true });
  await ctx.close();
}

/* M4 — common multiples */
{
  const { ctx, page } = await o(browser, M.m4, ['0', '1', '2', '3'], { tag: 'm4' });
  const issues = [];
  await audit(page, issues);
  await press(page, '#step-1', 'Diminuer bus A', 6); await audit(page, issues);
  await press(page, '#step-1', 'Diminuer bus B', 8); await settle(page); await audit(page, issues);
  let b = await body(page);
  check('M4: 6 and 10 meet at 30, not 60', /Premier rendez-vous : 30 min/.test(b) && /et non 60/.test(b));
  await tapOption(page, '#step-1', 1);                               // wrong
  check('M4: PPCM explained', /pas le PREMIER/.test(await body(page)));
  await fillOk(page, '21', '#step-2');                                // wrong on purpose
  check('M4: 21 is not the greatest', /pas le PLUS GRAND/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                               // wrong
  check('M4: divisor requirement explained', /sinon il faudrait découper/.test(await body(page)));
  check('M4: complete', await nextEnabled(page));
  check('M4: rhythm line lays out at both ends', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* M5 — proofs */
{
  const { ctx, page } = await o(browser, M.m5, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  const place = async (t) => { await page.locator(`#step-1 button[aria-label^="Placer : ${t}"]`).click(); await page.waitForTimeout(100); };
  await place('Donc a + b = 7'); await place('Soit a et b'); await place('Alors a = 7k'); await place('Or k + k’'); await place('Donc a + b est');
  await page.locator('#step-1 button:has-text("Vérifier l’ordre")').click(); await settle(page);
  check('M5: break point named', /L’ordre casse à la ligne 1/.test(await body(page)));
  for (const t of ['Donc a + b = 7', 'Soit a et b', 'Alors a = 7k', 'Or k + k’', 'Donc a + b est']) await page.locator(`#step-1 button[aria-label^="Retirer : ${t}"]`).click().catch(() => {});
  await place('Soit a et b'); await place('Alors a = 7k'); await place('Donc a + b = 7'); await place('Or k + k’'); await place('Donc a + b est');
  await page.locator('#step-1 button:has-text("Vérifier l’ordre")').click(); await settle(page);
  check('M5: proof in order', /Démonstration en ordre/.test(await body(page)));
  await tapOption(page, '#step-2', 1);                               // wrong on purpose
  check('M5: 3(n + 1) explained', /3 × \(un entier\)/.test(await body(page)));
  await tapOption(page, '#step-3', 1);                               // wrong
  check('M5: examples are not a proof', /des exemples ne sont pas une preuve|deux consécutifs/.test(await body(page)));
  await fillOk(page, '96', '#step-4');                                // wrong on purpose
  check('M5: 96 targeted', /pas le PREMIER/.test(await body(page)));
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
  check('boss: synthèse IS the complete knowledge map', /Ma carte des connaissances/.test(await body(page)) && (await page.locator('[data-knowledge-snapshot="complete"] [data-km-item]').count()) === 16);
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
  await press(page, '#step-1', 'Augmenter tas A', 8); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await press(page, '#step-1', 'Diminuer paquets de', 2); issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await press(page, '#step-1', 'Augmenter tas B', 10); await settle(page);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  check('mobile: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile: pack tiles stay inside at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}ar-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
