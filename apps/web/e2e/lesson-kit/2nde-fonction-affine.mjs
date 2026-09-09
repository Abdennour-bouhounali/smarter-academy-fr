// End-to-end smoke test for the 2nde lesson « Fonction affine » — lesson flow AND Knowledge Map.
// Run: node apps/web/e2e/lesson-kit/2nde-fonction-affine.mjs   (vite on :5241, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
  chromeTop,} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5241';
const LESSON = `${BASE}/courses/lycee/seconde/fonctions/fonction-affine-2nde`;
const KEY = 'u_anon_smarter_lesson_fonction-affine-2nde';
const SLUG = { 0: 'mission-de-depart', 1: 'le-reservoir', 2: 'le-taux-d-accroissement', 3: 'croissante-ou-decroissante', 4: 'retrouver-la-fonction', 5: 'signe-equations-inequations', 6: 'atelier-modeliser', boss: 'mission-finale-le-robinet' };
const M = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [k, `${LESSON}/${v}`]));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const CONTRIB = {
  1: ['fonction-affine-ab', 'vocab-coefficient-ordonnee', 'mem-a-taux-b-depart'],
  2: ['taux-accroissement', 'methode-reconnaitre-affine-table', 'formule-taux'],
  3: ['regle-signe-a-variations', 'methode-lire-a-b-graphique'],
  4: ['methode-determiner-affine', 'mem-deux-points'],
  5: ['regle-signe-affine-zero', 'methode-equation-affine', 'methode-inequation-affine'],
  6: ['methode-modeliser-affine'],
};
const TOTAL = Object.values(CONTRIB).flat().length;
const expectedAfter = (n) => Object.entries(CONTRIB).filter(([m]) => Number(m) <= n).flatMap(([, ids]) => ids).sort();
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
const attrs = (page, sel, attr) => page.locator(sel).evaluateAll((els, a) => els.map((e) => e.getAttribute(a)), attr);
const snapshotIds = (page) => attrs(page, '[data-knowledge-snapshot] [data-knowledge-item]', 'data-knowledge-item');
const drawerIds = (page) => attrs(page, '#km-root [data-km-completeview] [data-km-item]', 'data-km-item');
async function openDrawer(page, mode = 'complete') {
  await page.locator('button[data-km-trigger]').click(); await settle(page, 500);
  const tab = page.locator(`#km-root button:has-text("${mode === 'complete' ? 'Vue complète' : 'Navigation'}")`);
  if (await tab.count()) { await tab.click(); await settle(page, 300); }
}
const closeDrawer = async (page) => { await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300); };
async function press(page, scope, label, times = 1, issues = null) {
  const b = page.locator(`${scope} button[aria-label="${label}"]`).first();
  await b.waitFor({ state: 'attached', timeout: 4000 }).catch(() => {});
  for (let i = 0; i < times; i += 1) { if (!(await b.isEnabled().catch(() => false))) break; await b.click(); await page.waitForTimeout(50); if (issues && i % 2 === 0) await audit(page, issues); }
  await settle(page, 300);
}
async function fillLast(page, scope, value) { await page.locator(`${scope} input[type="text"]`).last().fill(value); await page.locator(`${scope} button:has-text("OK")`).last().click(); await settle(page); }
async function batchFirst(page, scope, rows) {
  const groups = page.locator(`${scope} div[role="group"]`); const n = await groups.count(); let done = 0;
  for (let i = 0; i < n && done < rows; i += 1) {
    const g = groups.nth(i); if (await g.getAttribute('aria-label')) continue;
    const opts = g.locator('button'); if (await opts.count() >= 2 && await opts.first().getAttribute('aria-pressed') !== null) { await opts.first().click(); done += 1; }
  }
  await settle(page);
}

const browser = await launch();
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 75 min', /Le réservoir/.test(b) && /Mission finale/.test(b) && /75\s*min/.test(b) && !/NaN/.test(b));
  await openDrawer(page); check('index: map empty', (await page.locator('#km-root [data-km-empty]').count()) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[0], null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]'); const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")'); if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*\d+/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}
/* M1 — the tank */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: lab on screen at once (tank + clock)', (await page.locator('#step-1 [data-volume]').count()) === 1 && (await page.locator('#step-1 button[aria-label="Avancer d’une minute"]').count()) === 1);
  await audit(page, issues);
  check('M1: V(0) = 10', (await page.locator('#step-1 [data-volume]').getAttribute('data-volume')) === '10');
  await tap(page, 'Plus qu’au début', '#step-1');
  await press(page, '#step-1', 'Avancer d’une minute', 5, issues);
  let b = await body(page);
  check('M1: +3 per minute, table shown, prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /\+3 L à chaque minute/.test(b) && (await page.locator('#step-1 [data-volume]').getAttribute('data-volume')) === '25');
  await press(page, '#step-2', 'Augmenter le volume initial b', 3, issues);
  await press(page, '#step-2', 'Diminuer le volume initial b', 6, issues);
  b = await body(page);
  check('M1: b slides the line', /glisse<\/strong>|glisse/.test(b) && /t = 0/.test(b));
  await press(page, '#step-3', 'Diminuer le débit a', 8, issues);      // 3 → −1
  await press(page, '#step-3', 'Augmenter le débit a', 2, issues);     // → 0
  b = await body(page);
  check('M1: a negative empties, a = 0 stagnates, line pivots', /se vide/.test(b) && /pivote/.test(b));
  await tapOption(page, '#step-4', 1);
  check('M1: a and b read in V(t) = 2t + 12', /2 L\/min et 12 L/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: snapshot = M1 contribution', sameSet(snap, CONTRIB[1]), snap.join(','));
  await openDrawer(page); check('M1 done: drawer live', sameSet(await drawerIds(page), snap)); await closeDrawer(page);
  check('M1: layout safe (t, a, b swept)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}fa-m1.png`, fullPage: true });
  await ctx.close();
}
/* M2 — rate */
{
  const { ctx, page } = await o(browser, M[2], seedThrough(1), { tag: 'm2' });
  const issues = [];
  await audit(page, issues);
  check('M2: rate 3 shown', (await page.locator('#step-1 [data-rate]').getAttribute('data-rate')) === '3');
  await tap(page, 'plus grand', '#step-1');
  await press(page, '#step-1', 'Augmenter t₂', 1, issues); await press(page, '#step-1', 'Augmenter t₂', 1, issues); await press(page, '#step-1', 'Diminuer t₁', 1, issues);
  let b = await body(page);
  check('M2: constant rate named, prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /taux d’accroissement<\/strong>|taux d’accroissement/.test(b));
  await press(page, '#step-2', 'Augmenter x₂', 3, issues);
  b = await body(page);
  check('M2: non-affine curve gives changing rates', /n’est pas affine/.test(b));
  await batchFirst(page, '#step-3', 4);
  await tapOption(page, '#step-4', 1);
  check('M2: inverted quotient corrected', /Pas l’inverse/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  check('M2: snapshot M1..M2', sameSet(await snapshotIds(page), expectedAfter(2)));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M3 — variations */
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'm3' });
  const issues = [];
  await press(page, '#step-1', 'Diminuer le débit a', 4, issues);    // 2 → 0
  check('M3: a = 0 → constante', (await page.locator('#step-1 [data-variation]').getAttribute('data-variation')) === 'constante');
  await press(page, '#step-1', 'Diminuer le débit a', 2, issues);    // → −1
  await settle(page, 600);
  let b = await body(page);
  check('M3: only the sign of a decides', /seul le <strong>signe de a<\/strong>|signe de a/.test(b));
  await batchFirst(page, '#step-2', 4);
  await tapOption(page, '#step-3', 2);
  check('M3: a and b read from the graph', /l’escalier/.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M4 — two points */
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'm4' });
  const issues = [];
  await audit(page, issues);
  await fillLast(page, '#step-1', '6');
  check('M4: difference-only trap', /divise par la différence des x/.test(await body(page)));
  await fillLast(page, '#step-2', '5');
  check('M4: b ≠ f(1) trap', /pas f\(0\)/.test(await body(page)));
  await tapOption(page, '#step-3', 1);
  await audit(page, issues);
  await batchFirst(page, '#step-4', 4);
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}fa-m4.png`, fullPage: true });
  await ctx.close();
}
/* M5 — solve */
{
  const { ctx, page } = await o(browser, M[5], seedThrough(4), { tag: 'm5' });
  const issues = [];
  await audit(page, issues);
  await fillLast(page, '#step-1', '30');
  check('M5: b-instead-of-zero trap', /volume de départ/.test(await body(page)));
  await batchFirst(page, '#step-2', 4);
  await fillLast(page, '#step-3', '-2.5');
  check('M5: sign trap on the equation', /deux négatifs/.test(await body(page)));
  await tapOption(page, '#step-4', 1);
  check('M5: inequality sense reversed', /RETOURNE l’inégalité/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  check('M5: snapshot M1..M5, nothing from M6', sameSet(await snapshotIds(page), expectedAfter(5)));
  await openDrawer(page);
  await page.emulateMedia({ media: 'print' }); await settle(page, 400);
  const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
  check('M5: print carries the title and current items only', /FONCTION AFFINE/.test(printText) && /Résoudre ax \+ b > k/.test(printText) && !/Modéliser par une fonction affine/.test(printText));
  await page.emulateMedia({ media: 'screen' });
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M6 — practice */
{
  const { ctx, page } = await o(browser, M[6], seedThrough(5), { tag: 'm6' });
  await batchFirst(page, '#step-1', 4);
  await tapOption(page, '#step-2', 1);
  check('M6: téléphérique corrected', /négatif : ça descend/.test(await body(page)));
  await fillLast(page, '#step-3', '8');
  check('M6: candle trap', /entièrement consumée/.test(await body(page)));
  await tapOption(page, '#step-3', 1);
  check('M6: complete', await nextEnabled(page));
  check(`M6: complete knowledge (${TOTAL})`, (await snapshotIds(page)).length === TOTAL);
  await ctx.close();
}
/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, ['0', '1'], { tag: 'boss' });
  check('boss: reachable and silent', /Reconnaître/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes")').click(); await settle(page);
  check('boss: score', /\/ \d+/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page, 800);
  const cards = await attrs(page, '[data-knowledge-snapshot="complete"] [data-km-completeview] [data-km-item]', 'data-km-item');
  check(`boss synthèse: complete map (${TOTAL} cards)`, sameSet(cards, expectedAfter(6)), `${cards.length}`);
  const lay = await layoutAudit(page); check('boss: synthèse lays out', lay.length === 0, lay.join(' | '));
  const completed = await readCompleted(page, KEY); check('boss: completed in storage', Array.isArray(completed) && completed.includes('7'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}
/* Mobile */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'mobile-m1', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Avancer d’une minute', 5, issues);
  check('mobile M1: minutes advanced with the ± path', (await page.locator('#step-1 [data-volume]').getAttribute('data-volume')) === '25');
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page); check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth); const panel = await page.locator('#km-root').boundingBox(); const top = await chromeTop(page);
  check('mobile: drawer fits, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - top) < 2);
  await ctx.close();
}
check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
