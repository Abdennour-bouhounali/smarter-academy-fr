// End-to-end smoke test for the 2nde lesson « Fonctions de référence » — lesson flow AND Knowledge Map.
// Run: node apps/web/e2e/lesson-kit/2nde-fonctions-reference.mjs   (vite on :5241, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
  chromeTop,} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5241';
const LESSON = `${BASE}/courses/lycee/seconde/fonctions/fonctions-de-reference-2nde`;
const KEY = 'u_anon_smarter_lesson_fonctions-de-reference-2nde';
const SLUG = { 0: 'mission-de-depart', 1: 'trois-machines', 2: 'la-parabole', 3: 'l-hyperbole', 4: 'le-v', 5: 'lire-sur-les-courbes', 6: 'atelier-modeliser', boss: 'mission-finale-les-trois-courbes' };
const M = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [k, `${LESSON}/${v}`]));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const CONTRIB = {
  1: ['trois-references', 'regle-symetrie-entrees', 'regle-pres-loin-zero', 'methode-tableau-tracer'],
  2: ['vocab-monte-descend', 'fonction-carre', 'regle-comparer-carres', 'mem-parabole'],
  3: ['fonction-inverse', 'regle-comparer-inverses', 'mem-hyperbole'],
  4: ['vocab-extremum', 'fonction-valeur-absolue', 'regle-carre-vs-va', 'mem-le-v'],
  5: ['methode-antecedents-reference', 'regle-ordre-references', 'formule-references'],
  6: ['methode-modeliser-reference'],
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
  for (let i = 0; i < times; i += 1) { if (!(await b.isEnabled().catch(() => false))) break; await b.click(); await page.waitForTimeout(60); if (issues) await audit(page, issues); }
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
const entry = async (page, scope, v) => { await page.locator(`${scope} button[aria-label="Entrée ${v}"]`).click(); await settle(page, 150); };
async function custom(page, scope, text) { await page.locator(`${scope} input[type="text"]`).first().fill(text); await page.locator(`${scope} button:has-text("Utiliser")`).first().click(); await settle(page, 150); }

const browser = await launch();
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 80 min', /Trois machines/.test(b) && /Mission finale/.test(b) && /80\s*min/.test(b) && !/NaN/.test(b));
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
/* M1 — three machines */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: lab on screen at once (entries + three machines)', (await page.locator('#step-1 button[aria-label="Entrée 3"]').count()) === 1 && (await page.locator('#step-1 [data-machine]').count()) === 3);
  await audit(page, issues);
  await tap(page, 'Aucune', '#step-1');
  await entry(page, '#step-1', '−3');
  let out = await page.locator('#step-1 [data-machine]').evaluateAll((els) => els.map((e) => e.getAttribute('data-output')));
  check('M1: −3 → 9, −1/3, 3', out[0] === '9' && Math.abs(Number(out[1]) + 1 / 3) < 1e-6 && out[2] === '3', out.join(','));
  await entry(page, '#step-1', '0');
  out = await page.locator('#step-1 [data-machine]').evaluateAll((els) => els.map((e) => e.getAttribute('data-output')));
  check('M1: 0 refused by 1/x only', out[1] === 'refuse' && out[0] === '0' && out[2] === '0');
  await entry(page, '#step-1', '1'); await entry(page, '#step-1', '4'); await audit(page, issues);
  let b = await body(page);
  check('M1: five entries → three behaviours, prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /refuse<\/strong>|refuse/.test(b));
  await entry(page, '#step-2', '3'); await audit(page, issues);
  b = await body(page);
  check('M1: twin 3 / −3 → same square and abs, opposite inverses', /même carré/.test(b) && /inverses opposés/.test(b));
  check('M1: curves traced after six entries', (await page.locator('#step-2 svg polyline').count()) >= 3);
  await custom(page, '#step-3', '0,1'); await custom(page, '#step-3', '100'); await audit(page, issues);
  b = await body(page);
  check('M1: near 0 and far from 0 explode differently', /1\/x explose/.test(b) && /x² qui explose/.test(b));
  await tapOption(page, '#step-4', 1);
  check('M1: refusal corrected', /seule la machine 1\/x/.test(await body(page)));
  check('M1: complete', await nextEnabled(page));
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: snapshot = M1 contribution', sameSet(snap, CONTRIB[1]), snap.join(','));
  await openDrawer(page); check('M1 done: drawer live', sameSet(await drawerIds(page), snap)); await closeDrawer(page);
  check('M1: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}fr-m1.png`, fullPage: true });
  await ctx.close();
}
/* M2 — parabola */
{
  const { ctx, page } = await o(browser, M[2], seedThrough(1), { tag: 'm2' });
  const issues = [];
  await press(page, '#step-1', 'Diminuer a', 6, issues);   // 1 → −2
  await press(page, '#step-1', 'Augmenter a', 8, issues);  // → 2
  let b = await body(page);
  check('M2: mirror f(−a) = f(a), axis of symmetry', /axe de symétrie/.test(b));
  await tap(page, 'plus loin', '#step-2');
  await press(page, '#step-2', 'Diminuer a', 10, issues);  // a: 2 → −3
  await press(page, '#step-2', 'Diminuer b', 10, issues);  // b: 3 → −2
  b = await body(page);
  check('M2: a < b with f(a) > f(b) found on the negatives, prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /\(−3\)² > \(−2\)²/.test(b));
  await tapOption(page, '#step-3', 1);
  await batchFirst(page, '#step-4', 4);
  check('M2: complete', await nextEnabled(page));
  check('M2: snapshot M1..M2', sameSet(await snapshotIds(page), expectedAfter(2)));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M3 — hyperbola */
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'm3' });
  const issues = [];
  await press(page, '#step-1', 'Diminuer a', 8, issues);   // 2 → 0 by 0,25
  let b = await body(page);
  check('M3: near 0 explodes, 0 has no image, ℝ*', /pas d’image/.test(b) && /ℝ\*/.test(b));
  await press(page, '#step-2', 'Diminuer a', 3, issues);   // 1 → −0,5
  b = await body(page);
  check('M3: central symmetry, sign of x', /centre de symétrie/.test(b) && /signe de x/.test(b));
  await tap(page, 'Impossible', '#step-3');
  await press(page, '#step-3', 'Diminuer a', 4, issues);   // a: 1 → −1
  b = await body(page);
  check('M3: a < 0 < b breaks « décroissante sur ℝ* »', /Ta prédiction ne tenait pas/.test(b) && /pas décroissante sur ℝ\*/.test(b));
  await batchFirst(page, '#step-4', 4);
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe (probe to 0)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}fr-m3.png`, fullPage: true });
  await ctx.close();
}
/* M4 — the V */
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'm4' });
  const issues = [];
  await press(page, '#step-1', 'Diminuer a', 6, issues);   // 2 → −1
  let b = await body(page);
  check('M4: V named, two half-lines', /demi-droites/.test(b) && /V<\/strong>|V\./.test(b));
  await press(page, '#step-2', 'Diminuer a', 3, issues);   // 2 → 0,5 : a² < |a|
  await press(page, '#step-2', 'Augmenter a', 4, issues);  // → 2,5 : a² > |a|
  b = await body(page);
  check('M4: x² ≤ |x| exactly on [−1 ; 1]', /−1 ≤ x ≤ 1/.test(b));
  await tapOption(page, '#step-3', 1);
  await batchFirst(page, '#step-4', 4);
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M5 — reading */
{
  const { ctx, page } = await o(browser, M[5], seedThrough(4), { tag: 'm5' });
  const issues = [];
  await press(page, '#step-1', 'Avancer la sonde', 3, issues);   // 1 → 4
  await press(page, '#step-1', 'Reculer la sonde', 5, issues);   // → −1
  let b = await body(page);
  check('M5: x² = 4 two solutions, x² = −1 none', /deux<\/strong> solutions|deux solutions/.test(b) && /aucune/.test(b));
  await press(page, '#step-2', 'Avancer la sonde', 3, issues);   // 0,5 → 2
  check('M5: 1/x = 2 one solution', /une seule<\/strong> solution|une seule solution/.test(await body(page)));
  await press(page, '#step-3', 'Avancer la sonde', 2, issues);   // 1 → 3
  check('M5: |x| = 3 two solutions', /−3 et 3/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M5: complete', await nextEnabled(page));
  check('M5: snapshot M1..M5, nothing from M6', sameSet(await snapshotIds(page), expectedAfter(5)));
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  // print
  await openDrawer(page);
  await page.emulateMedia({ media: 'print' }); await settle(page, 400);
  const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
  check('M5: print carries the title and current items only', /FONCTIONS DE RÉFÉRENCE/.test(printText) && /hyperbole/i.test(printText) && !/Reconnaître une référence dans une situation/.test(printText));
  await page.emulateMedia({ media: 'screen' });
  await ctx.close();
}
/* M6 — practice */
{
  const { ctx, page } = await o(browser, M[6], seedThrough(5), { tag: 'm6' });
  const issues = [];
  await tapOption(page, '#step-1', 3);
  await fillLast(page, '#step-1', '1,125');
  check('M6: half trap targeted', /n’est pas une racine/.test(await body(page)));
  await batchFirst(page, '#step-2', 4);
  await batchFirst(page, '#step-3', 4);
  for (const x of ['−2', '−1', '0,5', '1']) { await page.locator(`#step-4 button[aria-label="Tester x = ${x}"]`).click(); await settle(page, 450); }
  await tapOption(page, '#step-4', 1);
  check('M6: point recognised on the hyperbola', /seule la colonne 1\/x/.test(await body(page)));
  check('M6: complete', await nextEnabled(page));
  check(`M6: complete knowledge (${TOTAL} items)`, (await snapshotIds(page)).length === TOTAL);
  await audit(page, issues);
  check('M6: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, ['0', '1'], { tag: 'boss' });
  check('boss: reachable and silent', /Trois entrées/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
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
  await entry(page, '#step-1', '−3'); await entry(page, '#step-1', '0'); await audit(page, issues);
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page); check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth); const panel = await page.locator('#km-root').boundingBox(); const top = await chromeTop(page);
  check('mobile: drawer fits, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - top) < 2);
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'mobile-m3', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Diminuer a', 8, issues);
  check('mobile M3: no horizontal scroll', await noHScroll(page));
  check('mobile M3: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
