// End-to-end smoke test for the 2nde lesson « Signe d'une fonction » — lesson flow AND Knowledge Map.
// Run: node apps/web/e2e/lesson-kit/2nde-signe-fonctions.mjs   (vite on :5241, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
  chromeTop,} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5241';
const LESSON = `${BASE}/courses/lycee/seconde/fonctions/signe-fonctions-2nde`;
const KEY = 'u_anon_smarter_lesson_signe-fonctions-2nde';
const SLUG = { 0: 'mission-de-depart', 1: 'au-dessus-ou-en-dessous', 2: 'les-zeros-et-le-tableau', 3: 'le-signe-d-une-fonction-affine', 4: 'produit-et-quotient', 5: 'resoudre-avec-le-signe', 6: 'atelier-gel-et-benefice', boss: 'mission-finale-le-signe' };
const M = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [k, `${LESSON}/${v}`]));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };
const CONTRIB = {
  1: ['signe-position-courbe', 'zero-fonction', 'regle-signe-constant-entre-zeros', 'mem-au-dessus-en-dessous'],
  2: ['tableau-de-signes', 'methode-construire-tableau', 'methode-lire-tableau'],
  3: ['regle-signe-affine', 'formule-zero-affine', 'mem-signe-de-a'],
  4: ['regle-signe-produit', 'regle-signe-quotient', 'methode-tableau-produit-quotient'],
  5: ['methode-resoudre-par-le-signe', 'methode-verifier-graphiquement', 'vocab-solutions-intervalles'],
  6: ['methode-modeliser-signe'],
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
  for (let i = 0; i < times; i += 1) { if (!(await b.isEnabled().catch(() => false))) break; await b.click(); await page.waitForTimeout(50); if (issues) await audit(page, issues); }
  await settle(page, 300);
}
async function batchFirst(page, scope, rows) {
  const groups = page.locator(`${scope} div[role="group"]`); const n = await groups.count(); let done = 0;
  for (let i = 0; i < n && done < rows; i += 1) {
    const g = groups.nth(i); if (await g.getAttribute('aria-label')) continue;
    const opts = g.locator('button'); if (await opts.count() >= 2 && await opts.first().getAttribute('aria-pressed') !== null) { await opts.first().click(); done += 1; }
  }
  await settle(page);
}
/** Fill an editable sign row: click the i-th "?" cell `times` times (each click toggles + / −). */
async function fillRow(page, scope, pattern) {
  for (let i = 0; i < pattern.length; i += 1) {
    const cell = page.locator(`${scope} button[aria-label^="Signe sur l’intervalle ${i + 1}"]`).first();
    const clicks = pattern[i] === '+' ? 1 : 2;   // ? → + → −
    for (let k = 0; k < clicks; k += 1) { await cell.click(); await page.waitForTimeout(60); }
  }
  await settle(page);
}

const browser = await launch();
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 80 min', /Au-dessus ou en dessous/.test(b) && /Mission finale/.test(b) && /80\s*min/.test(b) && !/NaN/.test(b));
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
/* M1 — the painting probe */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: lab on screen at once (probe + ± buttons)', (await page.locator('#step-1 [role="slider"]').count()) === 1 && (await page.locator('#step-1 button[aria-label="Avancer la sonde"]').count()) === 1);
  await audit(page, issues);
  check('M1: starts at 12 h, positive', (await page.locator('#step-1 [data-sign]').getAttribute('data-sign')) === '+');
  await tap(page, 'Une fois', '#step-1');
  await press(page, '#step-1', 'Reculer la sonde', 12, issues);  // 12 → 0
  let b = await body(page);
  check('M1: 6 h crossed → zero seen, 2 h negative', /touche l’axe|en dessous/.test(b));
  await press(page, '#step-1', 'Avancer la sonde', 24, issues);  // 0 → 24
  b = await body(page);
  check('M1: day swept, zeros at 6 h and 18 h, prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /6 h<\/strong>|6 h/.test(b) && /il gèle/.test(b));
  await press(page, '#step-2', 'Reculer la sonde', 4, issues);   // 0 → −4
  await press(page, '#step-2', 'Avancer la sonde', 9, issues);   // → 5
  b = await body(page);
  check('M1: three zeros found, alternation − + − +', /− \+ − \+/.test(b));
  await tapOption(page, '#step-3', 2);
  check('M1: signe de x ≠ signe de f(x) explained', /rien à voir avec le signe de x/.test(await body(page)));
  await tapOption(page, '#step-4', 1);
  check('M1: complete', await nextEnabled(page));
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: snapshot = M1 contribution', sameSet(snap, CONTRIB[1]), snap.join(','));
  await openDrawer(page); check('M1 done: drawer live', sameSet(await drawerIds(page), snap)); await closeDrawer(page);
  check('M1: layout safe across both sweeps', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}sg-m1.png`, fullPage: true });
  await ctx.close();
}
/* M2 — table */
{
  const { ctx, page } = await o(browser, M[2], seedThrough(1), { tag: 'm2' });
  const issues = [];
  await audit(page, issues);
  await tapOption(page, '#step-1', 1);
  check('M2: zeros are abscissas', /Un zéro est une abscisse/.test(await body(page)));
  await fillRow(page, '#step-2', ['−', '+', '+', '+']);            // one wrong on purpose
  let b = await body(page);
  check('M2: table revealed with per-cell correction', /Regarde les cases corrigées/.test(b) && (await page.locator('#step-2 button:has-text("→ −")').count()) === 1);
  await batchFirst(page, '#step-3', 4);
  await batchFirst(page, '#step-4', 4);
  check('M2: complete', await nextEnabled(page));
  check('M2: snapshot M1..M2', sameSet(await snapshotIds(page), expectedAfter(2)));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M3 — affine */
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'm3' });
  const issues = [];
  await audit(page, issues);
  check('M3: zero shown live', /zéro : x = −0,5/.test(await body(page)));
  await press(page, '#step-1', 'Diminuer l’ordonnée à l’origine b', 8, issues);   // b: 1 → −3 → zero 1,5
  let b = await body(page);
  check('M3: zero at 1,5 → −b/a', /−b\/a<\/strong>|−b\/a/.test(b));
  await tap(page, 'Elle ne bouge pas', '#step-2');
  await press(page, '#step-2', 'Diminuer le coefficient a', 5, issues);           // a: 2 → −0,5
  b = await body(page);
  check('M3: negative a flips the + side, prediction contradicted', /Ta prédiction ne tenait pas/.test(b) && /le signe de a<\/strong>|signe de a/.test(b));
  await tapOption(page, '#step-3', 2);
  check('M3: zero 1,5 not 3', /pas 3/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe (a and b swept)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}sg-m3.png`, fullPage: true });
  await ctx.close();
}
/* M4 — product / quotient */
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'm4' });
  const issues = [];
  await fillRow(page, '#step-1', ['+', '−', '+']);
  let b = await body(page);
  check('M4: product row right, curve confirms', /Trois cases justes/.test(b) && (await page.locator('#step-1 [role="img"], #step-1 svg').count()) >= 1);
  await audit(page, issues);
  await fillRow(page, '#step-2', ['+', '+', '+']);                    // wrong middle
  b = await body(page);
  check('M4: quotient corrected, double bar explained', /double barre/.test(b) && (await page.locator('#step-2 button:has-text("→ −")').count()) === 1);
  check('M4: double bar rendered', (await page.locator('#step-2 [aria-label="valeur interdite"]').count()) >= 1);
  await tapOption(page, '#step-3', 1);
  await batchFirst(page, '#step-4', 4);
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M5 — solve */
{
  const { ctx, page } = await o(browser, M[5], seedThrough(4), { tag: 'm5' });
  const issues = [];
  await tapOption(page, '#step-1', 1);
  await tapOption(page, '#step-2', 1);
  let b = await body(page);
  check('M5: f(x) > 0 corrected with the bands', /deux morceaux, réunis par ∪/.test(b) && (await page.locator('#step-2 svg rect').count()) > 0);
  await audit(page, issues);
  await tapOption(page, '#step-3', 1);
  check('M5: ≤ includes the zeros', /crochets/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M5: forbidden value never included', /1 interdit|jamais une valeur interdite/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  check('M5: snapshot M1..M5, nothing from M6', sameSet(await snapshotIds(page), expectedAfter(5)));
  await openDrawer(page);
  await page.emulateMedia({ media: 'print' }); await settle(page, 400);
  const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
  check('M5: print carries the title and current items only', /SIGNE D’UNE FONCTION/.test(printText) && /Signe d’un quotient/.test(printText) && !/Le signe répond à une question/.test(printText));
  await page.emulateMedia({ media: 'screen' });
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M6 — practice */
{
  const { ctx, page } = await o(browser, M[6], seedThrough(5), { tag: 'm6' });
  const issues = [];
  await tapOption(page, '#step-1', 1);
  check('M6: gel corrected on the curve', /SOUS l’axe/.test(await body(page)));
  await audit(page, issues);
  await batchFirst(page, '#step-2', 4);
  await tapOption(page, '#step-3', 1);
  check('M6: complete', await nextEnabled(page));
  check(`M6: complete knowledge (${TOTAL})`, (await snapshotIds(page)).length === TOTAL);
  check('M6: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, ['0', '1'], { tag: 'boss' });
  check('boss: reachable and silent', /Sur la courbe/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
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
  await press(page, '#step-1', 'Reculer la sonde', 12, issues);
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page); check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth); const panel = await page.locator('#km-root').boundingBox(); const top = await chromeTop(page);
  check('mobile: drawer fits, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - top) < 2);
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'mobile-m4', mobile: true });
  const issues = [];
  await fillRow(page, '#step-1', ['+', '−', '+']); await audit(page, issues);
  check('mobile M4: no horizontal scroll with the table', await noHScroll(page));
  check('mobile M4: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
