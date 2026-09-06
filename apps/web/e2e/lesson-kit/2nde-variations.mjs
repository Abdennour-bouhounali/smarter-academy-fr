// End-to-end smoke test for the 2nde lesson « Variations et extremums » — lesson flow AND Knowledge Map.
// Run: node apps/web/e2e/lesson-kit/2nde-variations.mjs   (vite on :5241, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5241';
const LESSON = `${BASE}/courses/lycee/seconde/fonctions/variations-extremums-2nde`;
const KEY = 'u_anon_smarter_lesson_variations-extremums-2nde';
const SLUG = { 0: 'mission-de-depart', 1: 'le-randonneur', 2: 'croissante-decroissante', 3: 'le-tableau-de-variations', 4: 'maximum-minimum', 5: 'comparer-sans-calculer', 6: 'atelier-optimiser', boss: 'mission-finale-le-sommet' };
const M = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [k, `${LESSON}/${v}`]));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const CONTRIB = {
  1: ['variations-sens', 'methode-lire-variations-courbe', 'regle-plus-bas-au-bord'],
  2: ['definition-croissante-decroissante', 'vocab-monotone-intervalle', 'mem-croissante-ordre'],
  3: ['tableau-de-variations', 'methode-construire-tableau-variations', 'methode-lire-tableau-variations'],
  4: ['maximum-minimum', 'methode-extremum-tableau', 'mem-valeur-et-endroit'],
  5: ['methode-comparer-images-tableau', 'methode-encadrer-images'],
  6: ['methode-optimiser'],
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
  for (let i = 0; i < times; i += 1) { if (!(await b.isEnabled().catch(() => false))) break; await b.click(); await page.waitForTimeout(40); if (issues && i % 3 === 0) await audit(page, issues); }
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
async function fillArrows(page, scope, pattern) {
  for (let i = 0; i < pattern.length; i += 1) {
    const cell = page.locator(`${scope} button[aria-label^="Flèche de l’intervalle ${i + 1}"]`).first();
    const clicks = pattern[i] === 'croissante' ? 1 : 2;
    for (let k = 0; k < clicks; k += 1) { await cell.click(); await page.waitForTimeout(60); }
  }
  await settle(page);
}

const browser = await launch();
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 85 min', /Le randonneur/.test(b) && /Mission finale/.test(b) && /85\s*min/.test(b) && !/NaN/.test(b));
  await openDrawer(page); check('index: map empty', (await page.locator('#km-root [data-km-empty]').count()) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[0], null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]'); const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")'); if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*10/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}
/* M1 — the hiker */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: lab on screen at once (hiker + ±)', (await page.locator('#step-1 [role="slider"]').count()) === 1 && (await page.locator('#step-1 button[aria-label="Avancer le randonneur"]').count()) === 1);
  await audit(page, issues);
  check('M1: starts at 0 km, 300 m, climbing', /altimètre : 300 m/.test(await body(page)) && (await page.locator('#step-1 [data-direction]').getAttribute('data-direction')) === 'croissante');
  await tap(page, 'Vers 8,5 km', '#step-1');
  await press(page, '#step-1', 'Avancer le randonneur', 6, issues);   // → 3
  let b = await body(page);
  check('M1: 0 → 3 climbing only, summit ring', /n’a fait que <strong>monter<\/strong>|monter/.test(b) && /620/.test(b));
  await press(page, '#step-2', 'Avancer le randonneur', 14, issues);  // → 10
  b = await body(page);
  check('M1: whole trail: highest 620 at 3 km, prediction contradicted, four segments', /Ta prédiction ne tenait pas/.test(b) && /620 m, à 3 km/.test(b) && /Quatre tronçons/.test(b));
  await tapOption(page, '#step-3', 1);                                 // the valley (wrong)
  check('M1: lowest at the border explained', /Un creux n’est pas toujours/.test(await body(page)));
  await tapOption(page, '#step-4', 3);                                 // "devient négative"
  check('M1: descending ≠ negative', /ne veut pas dire « négatif »/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: snapshot = M1 contribution', sameSet(snap, CONTRIB[1]), snap.join(','));
  await openDrawer(page); check('M1 done: drawer live', sameSet(await drawerIds(page), snap)); await closeDrawer(page);
  check('M1: layout safe across the trail', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}va-m1.png`, fullPage: true });
  await ctx.close();
}
/* M2 — definition */
{
  const { ctx, page } = await o(browser, M[2], seedThrough(1), { tag: 'm2' });
  const issues = [];
  await audit(page, issues);
  for (let k = 0; k < 3; k += 1) await press(page, '#step-1', 'Augmenter b', 1, issues);       // three pairs (0,5 ; 1,5) (0,5 ; 2) (0,5 ; 2,5)
  let b = await body(page);
  check('M2: three pairs on the climb → croissante defined', /croissante sur \[0 ; 3\]/.test(b));
  for (let k = 0; k < 3; k += 1) await press(page, '#step-2', 'Augmenter b', 1, issues);
  b = await body(page);
  check('M2: décroissante on [3 ; 6]', /décroissante sur \[3 ; 6\]/.test(b));
  await tap(page, 'Croissante', '#step-3');
  await press(page, '#step-3', 'Diminuer a', 3, issues);     // a: 2 → 0,5 (h ≈ 305 < h(4) = 560 → up)
  await press(page, '#step-3', 'Augmenter a', 4, issues);    // a → 2,5 (h ≈ 600 > 560 → down)
  b = await body(page);
  check('M2: not monotone on [0 ; 6], prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /pas <strong>monotone<\/strong>|monotone/.test(b));
  await batchFirst(page, '#step-4', 4);
  check('M2: complete', await nextEnabled(page));
  check('M2: snapshot M1..M2', sameSet(await snapshotIds(page), expectedAfter(2)));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M3 — table */
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'm3' });
  const issues = [];
  await audit(page, issues);
  await fillArrows(page, '#step-1', ['croissante', 'decroissante', 'croissante', 'croissante']);   // last one wrong (1 click each: the reveal disables the cells)
  let b = await body(page);
  check('M3: table revealed with per-arrow correction', /Regarde les flèches corrigées/.test(b) && (await page.locator('#step-1 button:has-text("→ ↘")').count()) === 1);
  await batchFirst(page, '#step-2', 4);
  await tapOption(page, '#step-3', 1);
  check('M3: curve matched from the table', /Seule la courbe A/.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}va-m3.png`, fullPage: true });
  await ctx.close();
}
/* M4 — extremums */
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'm4' });
  const issues = [];
  check('M4: max on [0 ; 10] shown', (await page.locator('#step-1 [data-max]').getAttribute('data-max')) === '620');
  await press(page, '#step-1', 'Augmenter a', 10, issues);   // a → 5
  let b = await body(page);
  check('M4: on [5 ; 10] the max is 560 at 8,5', (await page.locator('#step-1 [data-max]').getAttribute('data-max')) === '560' && /560 m, atteint en 8,5 km/.test(b));
  await fillLast(page, '#step-2', '3');                        // the place instead of the value
  check('M4: value vs place trap', /l’ENDROIT/.test(await body(page)));
  await fillLast(page, '#step-2', '620');
  check('M4: abscissa trap', /valeur du maximum/.test(await body(page)));
  await tapOption(page, '#step-3', 1);
  check('M4: minimum at the border', /La plus petite est 300/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe (interval swept)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M5 — compare */
{
  const { ctx, page } = await o(browser, M[5], seedThrough(4), { tag: 'm5' });
  const issues = [];
  await audit(page, issues);
  await batchFirst(page, '#step-1', 4);
  check('M5: « on ne peut pas savoir » legitimised', /pas un aveu/.test(await body(page)));
  await tapOption(page, '#step-2', 2);
  check('M5: encadrement corrected', /des abscisses, pas des images/.test(await body(page)));
  await batchFirst(page, '#step-3', 4);
  check('M5: complete', await nextEnabled(page));
  check('M5: snapshot M1..M5, nothing from M6', sameSet(await snapshotIds(page), expectedAfter(5)));
  await openDrawer(page);
  await page.emulateMedia({ media: 'print' }); await settle(page, 400);
  const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
  check('M5: print carries the title and current items only', /VARIATIONS ET EXTREMUMS/.test(printText) && /Tableau de variations/.test(printText) && !/Optimiser/.test(printText));
  await page.emulateMedia({ media: 'screen' });
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M6 — optimise */
{
  const { ctx, page } = await o(browser, M[6], seedThrough(5), { tag: 'm6' });
  const issues = [];
  await tapOption(page, '#step-1', 1);
  await audit(page, issues);
  await batchFirst(page, '#step-2', 4);
  await fillLast(page, '#step-3', '100');
  check('M6: max-vs-A(5) trap', /100 est le maximum/.test(await body(page)));
  await fillLast(page, '#step-3', '10');
  await tapOption(page, '#step-4', 3);
  check('M6: value vs place on the cost table', /Ne confonds pas la valeur/.test(await body(page)));
  check('M6: complete', await nextEnabled(page));
  check(`M6: complete knowledge (${TOTAL})`, (await snapshotIds(page)).length === TOTAL);
  check('M6: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, ['0', '1'], { tag: 'boss' });
  check('boss: reachable and silent', /Croissante/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score', /\/ 10/.test(await body(page)));
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
  await press(page, '#step-1', 'Avancer le randonneur', 6, issues);
  check('mobile M1: summit reached with the ± path', /620/.test(await body(page)));
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page); check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth); const panel = await page.locator('#km-root').boundingBox(); const hdr = await page.locator('#app-header').boundingBox();
  check('mobile: drawer fits, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - (hdr.y + hdr.height)) < 2);
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'mobile-m3', mobile: true });
  const issues = [];
  await audit(page, issues);
  check('mobile M3: no horizontal scroll with the table', await noHScroll(page));
  check('mobile M3: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
