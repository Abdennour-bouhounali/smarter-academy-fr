// End-to-end smoke test for the 2nde lesson « Positions relatives de deux droites » —
// lesson flow (index, diagnostic, every module driven, boss) AND the Knowledge Map
// (empty start, live unlock, cumulative reveal, no spoiler, print, mobile).
// Run: node apps/web/e2e/lesson-kit/2nde-positions-relatives.mjs   (vite on :5241, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, layoutAudit, aspectAudit, domOverflow, noHScroll, smallTargets,
  readCompleted, nextEnabled, tap, tapOption, runBoss, SHOT_DIR,
  chromeTop,} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5241';
const LESSON = `${BASE}/courses/lycee/seconde/geometrie/positions-relatives-droites-2nde`;
const KEY = 'u_anon_smarter_lesson_positions-relatives-droites-2nde';
const SLUG = { 0: 'mission-de-depart', 1: 'le-laboratoire-des-deux-droites', 2: 'la-direction', 3: 'les-equations', 4: 'le-point-d-intersection', 5: 'deux-trajectoires', boss: 'mission-finale-le-croisement' };
const M = Object.fromEntries(Object.entries(SLUG).map(([k, v]) => [k, `${LESSON}/${v}`]));
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));
const audit = async (page, issues) => { issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page))); };

/* Attendu par module — miroir de knowledge.jsx. */
const CONTRIB = {
  1: ['positions-trois-cas', 'regle-direction-position', 'vocab-secantes-paralleles-confondues', 'mem-trois-comptes'],
  2: ['critere-vecteurs-directeurs', 'critere-pentes', 'methode-comparer-directions', 'formule-det-directions'],
  3: ['critere-equations-reduites', 'critere-equations-cartesiennes', 'methode-ramener-meme-ecriture', 'mem-m-decide-p-departage'],
  4: ['point-intersection-systeme', 'methode-resoudre-systeme', 'regle-nombre-solutions', 'methode-interpretation-graphique', 'formule-abscisse-intersection', 'mem-intersection-systeme'],
  5: ['methode-parallele-par-un-point', 'methode-ab-cd', 'methode-trajectoires'],
};
const TOTAL = Object.values(CONTRIB).flat().length;
const expectedAfter = (n) => Object.entries(CONTRIB).filter(([m]) => Number(m) <= n).flatMap(([, ids]) => ids).sort();
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
const attrs = (page, sel, attr) => page.locator(sel).evaluateAll((els, a) => els.map((e) => e.getAttribute(a)), attr);
const snapshotIds = (page) => attrs(page, '[data-knowledge-snapshot] [data-knowledge-item]', 'data-knowledge-item');
const drawerIds = (page) => attrs(page, '#km-root [data-km-completeview] [data-km-item]', 'data-km-item');
async function openDrawer(page, mode = 'complete') {
  await page.locator('button[data-km-trigger]').click();
  await settle(page, 500);
  const tab = page.locator(`#km-root button:has-text("${mode === 'complete' ? 'Vue complète' : 'Navigation'}")`);
  if (await tab.count()) { await tab.click(); await settle(page, 300); }
}
const closeDrawer = async (page) => { await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300); };

/** Click an aria-labelled button `times` times (skips when disabled — a bound was reached). */
async function press(page, scope, label, times = 1, issues = null) {
  const b = page.locator(`${scope} button[aria-label="${label}"]`).first();
  await b.waitFor({ state: 'attached', timeout: 4000 }).catch(() => {});
  for (let i = 0; i < times; i += 1) {
    if (!(await b.isEnabled().catch(() => false))) break;
    await b.click();
    await page.waitForTimeout(60);
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
  for (let i = 0; i < rows; i += 1) await groups.nth(i).locator('button').first().click();
  await settle(page);
}
/** Drive M1 to completion (shared by the flow pass and the live-map pass). */
async function driveM1(page, issues = []) {
  await tap(page, 'Éloigner B', '#step-1');
  await press(page, '#step-1', 'v : vers la droite', 1, issues);
  await press(page, '#step-1', 'v : vers le haut', 2, issues);
  await press(page, '#step-2', 'B : vers le haut', 3, issues);
  await page.locator('#step-3 button[aria-pressed]').filter({ hasText: /^B$/ }).click(); await settle(page, 200);
  await press(page, '#step-3', 'B : vers le haut', 1, issues);
  await press(page, '#step-3', 'B : vers le bas', 1, issues);
  await page.locator('#step-3 button[aria-pressed]').filter({ hasText: /^v$/ }).click(); await settle(page, 200);
  await press(page, '#step-3', 'v : vers le haut', 1, issues);
  await tapOption(page, '#step-4', 1);
}

const browser = await launch();

/* ── Index : chargement + carte vide ───────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  const b = await body(page);
  check('index: loads with all modules and 70 min', /laboratoire des deux droites/i.test(b) && /Mission finale/.test(b) && /70\s*min/.test(b) && !/NaN/.test(b));
  check('index: trigger « Ma carte » mounted by the provider', (await page.locator('button[data-km-trigger]').count()) === 1);
  await openDrawer(page);
  check('index: map empty before module 1', (await page.locator('#km-root [data-km-empty]').count()) === 1 && (await drawerIds(page)).length === 0);
  const top = await chromeTop(page);
  const panel = await page.locator('#km-root').boundingBox();
  check('index: panel top under le haut du viewport de leçon, right edge fixed', !!panel && Math.abs(panel.y - top) < 2 && Math.abs(panel.x + panel.width - 1280) < 2, JSON.stringify({ top, panel }));
  check('index: left-edge resize handle present', (await page.locator('#km-root .cursor-col-resize').count()) === 1);
  await ctx.close();
}

/* ── Diagnostic ────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M[0], null, { tag: 'diag' });
  const opts = page.locator('div[role="group"] > button[aria-pressed]');
  const n = await opts.count();
  for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 1500 }).catch(() => {});
  const submit = page.locator('button:has-text("Voir mon résultat")');
  if (await submit.isVisible().catch(() => false)) { await submit.click(); await settle(page); }
  check('diag: result, never blocks', /\/\s*\d+/.test(await body(page)) && !/verrouill/i.test(await body(page)));
  await ctx.close();
}

/* ── M1 — the two-lines laboratory (signature) + live map ──────────────── */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'm1' });
  const issues = [];
  check('M1: the lab is on screen at once (plane slider + D-pad)', (await page.locator('#step-1 [role="slider"]').count()) === 1 && (await page.locator('#step-1 button[aria-label="v : vers la droite"]').count()) === 1);
  await openDrawer(page);
  check('M1 (in progress): drawer empty — opening a module unlocks nothing', (await drawerIds(page)).length === 0);
  await closeDrawer(page);
  await audit(page, issues);
  let b = await body(page);
  check('M1: starts secant with I in frame', /sécantes/.test(b) && /I \(1 ; 1\)/.test(b));
  await tap(page, 'Éloigner B', '#step-1');
  await press(page, '#step-1', 'v : vers la droite', 1, issues);
  b = await body(page);
  check('M1: still secant after one move, guidance shown', /Un point commun encore|Tu chauffes/.test(b));
  await press(page, '#step-1', 'v : vers le haut', 2, issues);
  b = await body(page);
  check('M1: v ∥ u → I vanishes everywhere, prediction quoted', /d’un coup, partout/.test(b) && /Tu n’as pas touché à B/.test(b) && /strictement parallèles/.test(b));
  await press(page, '#step-2', 'B : vers le haut', 2, issues);
  b = await body(page);
  check('M1: moving B keeps 0 common points', /B a bougé 2 fois : toujours aucun point commun/.test(b));
  await press(page, '#step-2', 'B : vers le haut', 1, issues);
  b = await body(page);
  check('M1: B on (d₁) → confondues', /confondues/.test(b) && /tous<\/strong>|tous leurs points|<strong>tous/.test(await page.locator('#step-2').innerHTML()));
  await page.locator('#step-3 button[aria-pressed]').filter({ hasText: /^B$/ }).click(); await settle(page, 200);
  await press(page, '#step-3', 'B : vers le haut', 1, issues);
  await press(page, '#step-3', 'B : vers le bas', 1, issues);
  await page.locator('#step-3 button[aria-pressed]').filter({ hasText: /^v$/ }).click(); await settle(page, 200);
  await press(page, '#step-3', 'v : vers le haut', 1, issues);
  b = await body(page);
  check('M1: the three configurations produced', /Trois situations produites de tes mains/.test(b));
  await tapOption(page, '#step-4', 1);                                 // wrong on purpose
  b = await body(page);
  check('M1: wrong answer corrected from the lab', /Bonne réponse/.test(b) && /TOUTE la droite/.test(b));
  check('M1: complete', await nextEnabled(page));
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: « À retenir » snapshot = M1 contribution exactly', sameSet(snap, CONTRIB[1]), snap.join(','));
  check('M1 done: snapshot flags the 4 new items, bridge sentence kept', /4 nouvelles/.test(await body(page)) && /quatre couples de nombres/.test(await body(page)));
  await openDrawer(page);
  const dr = await drawerIds(page);
  check('M1 done: drawer updated LIVE with the same items', sameSet(dr, snap), dr.join(','));
  check('M1 done: drawer marks them « nouveau »', (await page.locator('#km-root [data-km-new="true"]').count()) === CONTRIB[1].length);
  await closeDrawer(page);
  check('M1: layout safe across the whole run', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}posrel-m1.png`, fullPage: true });
  await ctx.close();
}

/* ── M2 — the direction ────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M[2], seedThrough(1), { tag: 'm2' });
  const issues = [];
  await audit(page, issues);
  check('M2: det shown live', /det\(u, v\)/.test(await body(page)) && /= −3/.test(await body(page)) === false || /−3/.test(await body(page)));
  await tap(page, 'plus grand possible', '#step-1');
  await press(page, '#step-1', 'v : vers la droite', 1, issues);
  await press(page, '#step-1', 'v : vers le haut', 2, issues);
  let b = await body(page);
  check('M2: det = 0 exactly when parallel, slopes equal, prediction contradicted', /un seul nombre/.test(b) && /Ta prédiction ne tenait pas/.test(b));
  await press(page, '#step-2', 'v : vers la gauche', 2, issues);
  b = await body(page);
  check('M2: vertical v → no slope, det decides', /n’existe pas/.test(b) && /sécantes/.test(b));
  await fillLast(page, '#step-3', '-8');                                // u_x·v_x trap
  check('M2: det trap targeted', /u_x · v_x/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M2: batch corrected with the rule', /Même direction ⟺ det/.test(await body(page)));
  check('M2: complete', await nextEnabled(page));
  const snap = await snapshotIds(page);
  check('M2: snapshot = cumulative M1..M2', sameSet(snap, expectedAfter(2)), snap.join(','));
  check('M2: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ── M3 — the equations (sliders) ──────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M[3], seedThrough(2), { tag: 'm3' });
  const issues = [];
  await audit(page, issues);
  check('M3: both equations in the DOM', /y = 0,5x \+ 2/.test(await body(page)) && /y = 2x − 1/.test(await body(page)));
  await tap(page, 'dépend aussi de p₂', '#step-1');
  await press(page, '#step-1', 'Diminuer le coefficient m₂', 3, issues);   // 2 → 0,5
  let b = await body(page);
  check('M3: m₂ = m₁ → strictly parallel for any p₂', /strictement parallèles/.test(b) && /p₂ n’a pas bougé/.test(b));
  await press(page, '#step-2', 'Augmenter l’ordonnée à l’origine p₂', 6, issues); // −1 → 2
  b = await body(page);
  check('M3: p₂ = p₁ → confondues', /même équation/.test(b));
  await tapOption(page, '#step-3', 1);                                  // wrong
  check('M3: cartesian ⟺ reduced explained', /Ramène toujours/.test(await body(page)));
  await batchFirst(page, '#step-4', 4);
  check('M3: complete', await nextEnabled(page));
  const snap = await snapshotIds(page);
  check('M3: snapshot = cumulative M1..M3, nothing from M4', sameSet(snap, expectedAfter(3)) && !snap.includes('point-intersection-systeme'), snap.join(','));
  check('M3: layout safe (m₂ and p₂ swept)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}posrel-m3.png`, fullPage: true });
  await ctx.close();
}

/* ── M4 — the intersection point (zoom + system) ───────────────────────── */
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'm4' });
  const issues = [];
  await audit(page, issues);
  check('M4: I(−2 ; 1) computed and shown', /I \(−2 ; 1\)/.test(await body(page)));
  await tap(page, 'Elles sont parallèles', '#step-1');
  await press(page, '#step-1', 'Augmenter le coefficient m₂', 2, issues);          // −1 → 0
  await press(page, '#step-1', 'Diminuer l’ordonnée à l’origine p₂', 2, issues);   // −1 → −2 : x = −8
  let b = await body(page);
  check('M4: I left the frame but is still known', /hors du cadre/.test(b) && /I \(−8 ; −2\)/.test(b));
  await page.locator('#step-1 button:has-text("±15")').click(); await settle(page); await audit(page, issues);
  b = await body(page);
  check('M4: zoom out finds I, prediction contradicted', /Le dessin a des bords/.test(b) && /Ta prédiction ne tenait pas/.test(b));
  await page.locator('#step-1 button:has-text("±40")').click(); await settle(page); await audit(page, issues);
  await fillLast(page, '#step-2', '-3');                                 // forgot to divide
  check('M4: division trap targeted', /oublié de diviser/.test(await body(page)));
  await fillLast(page, '#step-2', '-3');                                 // y with x = 2
  check('M4: y trap targeted', /remplacé x par 2/.test(await body(page)));
  await tapOption(page, '#step-3', 1);                                  // "je me suis trompé"
  check('M4: no-solution ⟺ parallel explained', /Le calcul est juste/.test(await body(page)));
  await batchFirst(page, '#step-4', 3);
  check('M4: complete', await nextEnabled(page));
  const snap = await snapshotIds(page);
  check('M4: snapshot = cumulative M1..M4', sameSet(snap, expectedAfter(4)), snap.join(','));
  // print view reflects the CURRENT knowledge
  await openDrawer(page);
  await page.emulateMedia({ media: 'print' }); await settle(page, 400);
  const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
  const screenHidden = await page.locator('#km-root .sa-screen-view').evaluate((e) => getComputedStyle(e).display === 'none');
  const printShown = await page.locator('#km-root .sa-print-view').evaluate((e) => getComputedStyle(e).display !== 'none');
  check('M4: print view carries the lesson title and current items, nothing from M5', /POSITIONS RELATIVES DE DEUX DROITES/.test(printText) && /Point d’intersection et système/.test(printText) && !/Parallèle passant par un point/.test(printText));
  check('M4: print CSS swaps screen → print view', screenHidden && printShown);
  await page.emulateMedia({ media: 'screen' });
  check('M4: layout safe (I out of frame, three zooms)', issues.length === 0, issues.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}posrel-m4.png`, fullPage: true });
  await ctx.close();
}

/* ── M5 — practice ─────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M[5], seedThrough(4), { tag: 'm5' });
  const issues = [];
  await audit(page, issues);
  await fillLast(page, '#step-1', '9');                                  // 3x = 9 not divided
  check('M5: drones x trap targeted', /oublié de diviser/.test(await body(page)));
  await fillLast(page, '#step-1', '3');
  check('M5: crossing at (3 ; 3)', /\(3 ; 3\)/.test(await body(page)));
  await fillLast(page, '#step-2', '-3');                                 // kept p of the first road
  check('M5: parallel trap (kept p) targeted', /PREMIÈRE route/.test(await body(page)));
  await audit(page, issues);
  await tapOption(page, '#step-3', 1);                                  // sécantes (wrong)
  check('M5: (AB) ∥ (CD) proved in two steps', /Deux étapes/.test(await body(page)));
  await audit(page, issues);
  await tapOption(page, '#step-4', 1);                                  // parallèles (wrong)
  check('M5: 0 = 0 ⟺ confondues', /les désigne tous/.test(await body(page)));
  check('M5: complete', await nextEnabled(page));
  const snap = await snapshotIds(page);
  check(`M5: last content module → complete lesson knowledge (${TOTAL} items)`, snap.length === TOTAL && sameSet(snap, expectedAfter(5)));
  // navigation mode: item detail with KaTeX, back
  await openDrawer(page, 'navigation');
  await page.locator('#km-root [data-km-item="formule-abscisse-intersection"]').click(); await settle(page, 300);
  check('M5: navigation → item detail renders KaTeX', (await page.locator('#km-root .katex').count()) > 0 && /Retour à la carte/.test(await body(page)));
  await page.locator('#km-root button:has-text("Retour à la carte")').click(); await settle(page, 300);
  check('M5: back to the grid with every item', (await page.locator('#km-root [data-km-navview] [data-km-item]').count()) === TOTAL);
  check('M5: layout safe', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ── Boss ──────────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, M.boss, ['0', '1'], { tag: 'boss' });
  check('boss: reachable and silent', /Hors du dessin/.test(await body(page)) && !/Bonne réponse/.test(await body(page)));
  await openDrawer(page);
  check('boss (jumped to, M1 only): drawer honest — only M1 knowledge', (await drawerIds(page)).length === CONTRIB[1].length);
  await closeDrawer(page);
  await runBoss(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  check('boss: score', /\/ 10/.test(await body(page)));
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page, 800);
  const cards = await attrs(page, '[data-knowledge-snapshot="complete"] [data-km-completeview] [data-km-item]', 'data-km-item');
  check(`boss synthèse: complete map inline — all ${TOTAL} cards`, sameSet(cards, expectedAfter(5)), `${cards.length}`);
  check('boss synthèse: cards carry KaTeX and visuals', (await page.locator('[data-knowledge-snapshot="complete"] .katex').count()) > 5 && (await page.locator('[data-knowledge-snapshot="complete"] svg').count()) > 3);
  const lay = await layoutAudit(page);
  check('boss: synthèse lays out', lay.length === 0, lay.join(' | '));
  await openDrawer(page);
  check('boss synthèse: drawer moved to the complete state', (await drawerIds(page)).length === TOTAL);
  await closeDrawer(page);
  const completed = await readCompleted(page, KEY);
  check('boss: completed in storage', Array.isArray(completed) && completed.includes('6'));
  await page.reload({ waitUntil: 'domcontentloaded' }); await settle(page, 1500);
  check('boss: reload restores review', /Résultat du défi/.test(await body(page)));
  await page.screenshot({ path: `${SHOT_DIR}posrel-boss.png`, fullPage: true });
  await ctx.close();
}

/* ── Mobile : M1 with the D-pad, drawer geometry ───────────────────────── */
{
  const { ctx, page } = await o(browser, M[1], ['0'], { tag: 'mobile-m1', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'v : vers la droite', 1, issues);
  await press(page, '#step-1', 'v : vers le haut', 2, issues);
  check('mobile M1: parallel reached with the D-pad', /d’un coup, partout/.test(await body(page)));
  check('mobile M1: no horizontal scroll', await noHScroll(page));
  const small = await smallTargets(page);
  check('mobile M1: targets ≥ 40 px', small.length === 0, small.join(', '));
  check('mobile M1: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth);
  const panel = await page.locator('#km-root').boundingBox();
  const top = await chromeTop(page);
  check('mobile: drawer fits the viewport, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - top) < 2, JSON.stringify({ vw, panel, top }));
  await page.screenshot({ path: `${SHOT_DIR}posrel-m1-mobile.png`, fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await o(browser, M[4], seedThrough(3), { tag: 'mobile-m4', mobile: true });
  const issues = [];
  await press(page, '#step-1', 'Augmenter le coefficient m₂', 2, issues);
  await press(page, '#step-1', 'Diminuer l’ordonnée à l’origine p₂', 2, issues);
  await page.locator('#step-1 button:has-text("±40")').click(); await settle(page); await audit(page, issues);
  check('mobile M4: no horizontal scroll at ±40', await noHScroll(page));
  check('mobile M4: layout safe at 375 px', issues.length === 0, issues.slice(0, 3).join(' | '));
  await ctx.close();
}

check('zero console/page errors across the run', errs.length === 0, errs.slice(0, 4).join(' | '));
await browser.close();
process.exitCode = summary() ? 1 : 0;
