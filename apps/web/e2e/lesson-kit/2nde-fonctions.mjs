// End-to-end smoke test for the 2nde lesson « Fonctions » — lesson flow AND Knowledge Map.
// Run: node apps/web/e2e/lesson-kit/2nde-fonctions.mjs   (vite on :5241, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5241';
const LESSON = `${BASE}/courses/lycee/seconde/fonctions/fonctions-2nde`;
const KEY = 'u_anon_smarter_lesson_fonctions-2nde';
const SLUG = { 0: 'mission-de-depart', 1: 'la-boite', 2: 'image-antecedent-ensemble-de-definition', 3: 'le-tableau-de-valeurs', 4: 'du-tableau-a-la-courbe', 5: 'quatre-registres', 6: 'une-fonction-en-morceaux', 7: 'atelier-modeliser', boss: 'mission-finale-la-boite' };
const M = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [k, `${LESSON}/${v}`]));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };

const CONTRIB = {
  1: ['fonction-dependance', 'vocab-variable', 'mem-un-x-une-valeur'],
  2: ['image-antecedent', 'ensemble-definition', 'vocab-notation-fx', 'methode-lire-image-graphique', 'methode-lire-antecedents-graphique'],
  3: ['methode-calculer-image', 'tableau-valeurs', 'regle-antecedent-equation'],
  4: ['courbe-representative', 'methode-tracer-courbe', 'methode-tester-point', 'mem-point-sur-courbe'],
  5: ['quatre-registres', 'methode-choisir-registre', 'methode-modeliser'],
  6: ['reunion-intervalles', 'vocab-union-intervalles', 'methode-fonction-par-morceaux'],
  7: ['methode-verifier-modele'],
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
  for (let i = 0; i < times; i += 1) {
    if (!(await b.isEnabled().catch(() => false))) break;
    await b.click(); await page.waitForTimeout(60);
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
  const n = await groups.count();
  let done = 0;
  for (let i = 0; i < n && done < rows; i += 1) {
    const g = groups.nth(i);
    const label = await g.getAttribute('aria-label');
    if (label) continue; // skip labelled groups (chips, probes) — batch rows are unlabelled groups
    const opts = g.locator('button');
    if (await opts.count() >= 2 && await opts.first().getAttribute('aria-pressed') !== null) { await opts.first().click(); done += 1; }
  }
  await settle(page);
}
/** Record a box at x (the slider moves by ± buttons of 0,5). */
async function recordAt(page, scope, x, current, issues) {
  const d = Math.round((x - current) * 2);
  await press(page, scope, d > 0 ? 'Augmenter la découpe x' : 'Diminuer la découpe x', Math.abs(d), issues);
  await page.locator(`${scope} button:has-text("Enregistrer cette boîte")`).first().click(); await settle(page, 200);
  return x;
}

const browser = await launch();

/* Index + carte vide */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 85 min', /La boîte/.test(b) && /Mission finale/.test(b) && /85\s*min/.test(b) && !/NaN/.test(b));
  await openDrawer(page);
  check('index: map empty before module 1', (await page.locator('#km-root [data-km-empty]').count()) === 1);
  await ctx.close();
}
/* Diagnostic */
{
  const { ctx, page } = await o(browser, M[0], null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]');
  const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")');
  if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*10/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}
/* M1 — the box (signature) + live map */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once (slider + record)', (await page.locator('#step-1 input[type="range"]').count()) === 1 && (await page.locator('#step-1 button:has-text("Enregistrer cette boîte")').count()) === 1);
  await audit(page, issues);
  let b = await body(page);
  check('M1: starts at x = 2 with V = 512', /découpe x = 2 cm/.test(b) && /volume 512 cm³/.test(b));
  await tap(page, 'la moitié', '#step-1');
  let cur = 2;
  cur = await recordAt(page, '#step-1', 2, cur, issues);
  await page.locator('#step-1 button:has-text("Déjà enregistrée")').count().then((n) => check('M1: re-recording the same x is refused (one x, one V)', n === 1));
  cur = await recordAt(page, '#step-1', 5, cur, issues);
  b = await body(page);
  check('M1: x = 5 gives 500 (not the biggest)', /volume 500 cm³/.test(b));
  cur = await recordAt(page, '#step-1', 8, cur, issues);
  b = await body(page);
  check('M1: three boxes → dependence noticed', /une découpe donne un volume/.test(b));
  // step 2: table shown, find > 580
  cur = await recordAt(page, '#step-2', 3, cur, issues);
  b = await body(page);
  check('M1: table shows the boxes, x = 3 → 588 beats the prediction', /Ta prédiction : la moitié/.test(b) && /588/.test(b) && /3,5/.test(b));
  // step 3: graph, 6 records
  cur = await recordAt(page, '#step-3', 1, cur, issues);
  cur = await recordAt(page, '#step-3', 6, cur, issues);
  b = await body(page);
  check('M1: six points → the curve appears', /une <strong>courbe<\/strong>|courbe/.test(b) && (await page.locator('#step-3 svg polyline').count()) >= 1);
  await audit(page, issues);
  await tapOption(page, '#step-4', 1);                                  // wrong on purpose
  b = await body(page);
  check('M1: domain corrected from the lab', /Bonne réponse/.test(b) && /bornes sont exclues/i.test(b));
  check('M1: complete, « fonction » named only in the footer', (await nextEnabled(page)) && /appellent une <strong>fonction<\/strong>|appellent une fonction/.test(await page.locator('[data-knowledge-snapshot]').innerHTML()));
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: snapshot = M1 contribution exactly', sameSet(snap, CONTRIB[1]), snap.join(','));
  await openDrawer(page);
  check('M1 done: drawer updated live', sameSet(await drawerIds(page), snap));
  await closeDrawer(page);
  check('M1: layout safe across the run (x swept 1 → 8)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}fo-m1.png`, fullPage: true });
  await ctx.close();
}
/* M2 — probe */
{
  const { ctx, page } = await o(browser, M[2], seedThrough(1), { tag: 'm2' });
  const issues = [];
  await audit(page, issues);
  await press(page, '#step-1', 'Reculer la sonde', 4, issues);              // 4 → 2
  let b = await body(page);
  check('M2: image of 2 named, notation V(2) = 512', /l’image<\/strong> de 2|image/.test(b) && /512/.test(b) && (await page.locator('#step-1 .katex').count()) > 0);
  await press(page, '#step-2', 'Avancer la sonde', 2, issues);              // 200 → 400
  b = await body(page);
  check('M2: two antecedents of 400', /antécédents<\/strong> de 400|antécédents/.test(b) && /1,3/.test(b) && /5,9/.test(b));
  await tapOption(page, '#step-3', 1);                                       // [0 ; 10] wrong
  check('M2: domain notation corrected', /crochets ouverts/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M2: complete', await nextEnabled(page));
  check('M2: snapshot = M1..M2', sameSet(await snapshotIds(page), expectedAfter(2)));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M3 — formula + table */
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'm3' });
  const issues = [];
  for (const x of [1, 2, 3]) { await page.locator(`#step-1 button[aria-label="Tester x = ${x}"]`).click(); await settle(page, 450); }
  await audit(page, issues);
  await tapOption(page, '#step-1', 1);                                       // wrong formula
  let b = await body(page);
  check('M3: formula revealed by the table, wrong pick corrected', /une seule colonne reproduit/.test(b));
  await fillLast(page, '#step-2', '31');                                     // (3·2)² trap
  check('M3: square trap targeted', /Le carré porte sur x seul/.test(await body(page)));
  await fillLast(page, '#step-2', '-8');                                     // sign trap
  check('M3: negative-square trap targeted', /Le carré vient d’abord/.test(await body(page)));
  await batchFirst(page, '#step-3', 4);
  check('M3: table limits explained', /entre deux colonnes/.test(await body(page)));
  await fillLast(page, '#step-4', '25');                                     // image instead of antecedent
  check('M3: image-vs-antecedent trap', /l’IMAGE de 11/.test(await body(page)));
  check('M3: complete', await nextEnabled(page));
  check('M3: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M4 — plot the table */
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'm4' });
  const issues = [];
  const targets = [[-2, 1], [-1, -2], [0, -3], [1, -2], [2, 1], [3, 6]];
  for (const [x, y] of targets) {
    await page.locator(`#step-1 button[aria-label="Placer le point d’abscisse ${String(x).replace('-', '−')}"]`).click(); await settle(page, 150);
    const s = page.locator('#step-1 [role="slider"]').first(); await s.focus();
    // from the origin: x steps then y steps
    for (let i = 0; i < Math.abs(x); i += 1) { await page.keyboard.press(x > 0 ? 'ArrowRight' : 'ArrowLeft'); await page.waitForTimeout(40); }
    for (let i = 0; i < Math.abs(y); i += 1) { await page.keyboard.press(y > 0 ? 'ArrowUp' : 'ArrowDown'); await page.waitForTimeout(40); }
    await settle(page, 150); await audit(page, issues);
  }
  let b = await body(page);
  check('M4: six points placed by keyboard, curve drawn', /Les 6 points sont posés/.test(b) && (await page.locator('#step-1 svg polyline').count()) >= 1);
  await tapOption(page, '#step-2', 1);
  check('M4: between two points explained', /ne s’arrête pas aux points/.test(await body(page)));
  await tapOption(page, '#step-3', 2);                                       // "oui : f(3) = 6" (wrong)
  check('M4: (6 ; 3) vs (3 ; 6) explained', /l’abscisse est 6/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M4: complete', await nextEnabled(page));
  check('M4: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}fo-m4.png`, fullPage: true });
  await ctx.close();
}
/* M5 — registers */
{
  const { ctx, page } = await o(browser, M[5], seedThrough(4), { tag: 'm5' });
  const issues = [];
  await audit(page, issues);
  await batchFirst(page, '#step-1', 3);
  check('M5: curves matched with a hint', /on calcule deux ou trois images/.test(await body(page)));
  await tapOption(page, '#step-2', 2);                                       // 5x (wrong)
  check('M5: perimeter corrected', /quatre côtés/.test(await body(page)));
  await fillLast(page, '#step-2', '14');
  check('M5: antecedent trap (÷2 forgotten)', /Divise par 2/.test(await body(page)));
  await batchFirst(page, '#step-3', 4);
  for (const x of [0, 1, 2]) { await page.locator(`#step-4 button[aria-label="Tester x = ${x}"]`).click(); await settle(page, 450); }
  await tapOption(page, '#step-4', 1);
  check('M5: same function, two expressions', /mêmes images pour TOUT x/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* M6 — union of intervals */
{
  const { ctx, page } = await o(browser, M[6], seedThrough(5), { tag: 'm6' });
  const issues = [];
  await audit(page, issues);
  await press(page, '#step-1', 'Avancer la sonde', 2, issues);              // 8 → 10
  let b = await body(page);
  check('M6: n(10) = 45 read', /n\(10\) = 45/.test(b));
  await press(page, '#step-1', 'Avancer la sonde', 3, issues);              // → 13
  b = await body(page);
  check('M6: 13 has no image (gap), not zero', /pas d’image/.test(b) && /Ce n’est pas « 0 nageur »/.test(b));
  await tapOption(page, '#step-2', 1);                                       // [8 ; 20] wrong
  check('M6: union notation corrected', /contiendrait 13/.test(await body(page)));
  await batchFirst(page, '#step-3', 4);
  await page.locator('#step-4 button:has-text("ses antécédents")').click(); await settle(page, 200);
  await press(page, '#step-4', 'Avancer la sonde', 3, issues);              // 20 → 50
  b = await body(page);
  check('M6: 50 swimmers four times across both pieces', /4 fois/.test(b));
  check('M6: complete', await nextEnabled(page));
  check('M6: snapshot = M1..M6, nothing from M7', sameSet(await snapshotIds(page), expectedAfter(6)));
  check('M6: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  // print
  await openDrawer(page);
  await page.emulateMedia({ media: 'print' }); await settle(page, 400);
  const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
  check('M6: print view has the title and current items only', /FONCTIONS/.test(printText) && /réunion d’intervalles/i.test(printText) && !/Vérifier un modèle/.test(printText));
  await page.emulateMedia({ media: 'screen' });
  await page.screenshot({ path: `${SHOT_DIR}fo-m6.png`, fullPage: true });
  await ctx.close();
}
/* M7 — practice */
{
  const { ctx, page } = await o(browser, M[7], seedThrough(6), { tag: 'm7' });
  const issues = [];
  await audit(page, issues);
  await tapOption(page, '#step-1', 1);
  await fillLast(page, '#step-1', '3125');
  check('M7: one-side trap targeted', /d’un seul côté/.test(await body(page)));
  await batchFirst(page, '#step-2', 4);
  await batchFirst(page, '#step-3', 4);
  check('M7: complete', await nextEnabled(page));
  check(`M7: complete lesson knowledge (${TOTAL} items)`, (await snapshotIds(page)).length === TOTAL);
  check('M7: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}
/* Boss */
{
  const { ctx, page } = await o(browser, M.boss, ['0', '1'], { tag: 'boss' });
  check('boss: reachable and silent', /La dépendance/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score', /\/ 10/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page, 800);
  const cards = await attrs(page, '[data-knowledge-snapshot="complete"] [data-km-completeview] [data-km-item]', 'data-km-item');
  check(`boss synthèse: complete map inline (${TOTAL} cards)`, sameSet(cards, expectedAfter(7)), `${cards.length}`);
  const lay = await layoutAudit(page);
  check('boss: synthèse lays out', lay.length === 0, lay.join(' | '));
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('8'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await ctx.close();
}
/* Mobile */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'mobile-m1', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Augmenter la découpe x', 4, issues);
  await page.locator('#step-1 button:has-text("Enregistrer cette boîte")').click(); await settle(page, 200);
  check('mobile M1: box recorded with the ± path', /1 boîte enregistrée/.test(await body(page)));
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth);
  const panel = await page.locator('#km-root').boundingBox();
  const hdr = await page.locator('#app-header').boundingBox();
  check('mobile: drawer fits, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - (hdr.y + hdr.height)) < 2);
  await page.screenshot({ path: `${SHOT_DIR}fo-m1-mobile.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[6], seedThrough(5), { tag: 'mobile-m6', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Avancer la sonde', 12, issues);
  check('mobile M6: no horizontal scroll', await noHScroll(page));
  check('mobile M6: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
