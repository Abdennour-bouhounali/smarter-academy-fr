// Carte des connaissances — Vecteurs 2nde : progression cumulative, « À retenir »
// = snapshot de la carte, tiroir = même état, impression, responsive.
// Run: node apps/web/e2e/lesson-kit/2nde-vecteurs-carte.mjs   (vite on :5231, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, noHScroll, nextEnabled, tap, tapOption, SHOT_DIR,
  chromeTop,} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5231';
const LESSON = `${BASE}/courses/lycee/seconde/geometrie/vecteurs-2nde`;
const KEY = 'u_anon_smarter_lesson_vecteurs-2nde';
const SLUG = { 1: 'le-robot-du-depot', 2: 'le-meme-vecteur', 3: 'deux-nombres-suffisent', 4: 'enchainer-les-deplacements', 5: 'etirer-inverser', 6: 'mesurer-un-vecteur', 7: 'problemes-de-geometrie', boss: 'mission-finale-le-depot' };
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));

/* Attendu par module — miroir de knowledge.jsx (ids par module). */
const CONTRIB = {
  1: ['vecteur-deplacement', 'mem-deplacement'],
  2: ['egalite-vecteurs', 'vecteur-nul', 'regle-vecteur-oppose', 'vocab-representant'],
  3: ['coordonnees-vecteur', 'regle-coordonnees', 'regle-egalite-coordonnees', 'methode-calcul-coordonnees', 'vocab-base-orthonormee', 'mem-arrivee-moins-depart', 'mem-oppose', 'formule-coordonnees'],
  4: ['regle-somme', 'vocab-relation-chasles', 'mem-chasles', 'formule-somme', 'formule-chasles'],
  5: ['regle-produit-reel', 'regle-colineaire'],
  6: ['methode-calcul-norme', 'methode-milieu', 'vocab-norme', 'formule-norme', 'formule-milieu'],
  7: ['methode-parallelogramme', 'methode-deplacement-manquant', 'methode-alignement'],
};
const expectedAfter = (n) => Object.entries(CONTRIB).filter(([m]) => Number(m) <= n).flatMap(([, ids]) => ids).sort();
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);

const attrs = (page, sel, attr) => page.locator(sel).evaluateAll((els, a) => els.map((e) => e.getAttribute(a)), attr);
const snapshotIds = (page) => attrs(page, '[data-knowledge-snapshot] [data-knowledge-item]', 'data-knowledge-item');
async function openDrawer(page, mode = 'complete') {
  await page.locator('button[data-km-trigger]').click();
  await settle(page, 500);
  const tab = page.locator(`#km-root button:has-text("${mode === 'complete' ? 'Vue complète' : 'Navigation'}")`);
  if (await tab.count()) { await tab.click(); await settle(page, 300); }
}
const drawerIds = (page) => attrs(page, '#km-root [data-km-completeview] [data-km-item]', 'data-km-item');
async function press(page, scope, label, times = 1) {
  const b = page.locator(`${scope} button[aria-label="${label}"]`).first();
  for (let i = 0; i < times; i += 1) { if (!(await b.isEnabled().catch(() => false))) break; await b.click(); await page.waitForTimeout(60); }
  await settle(page, 300);
}

const browser = await launch();

/* ── Départ : carte vide sur l'index ─────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  check('index: trigger « Ma carte » mounted by the provider', (await page.locator('button[data-km-trigger]').count()) === 1);
  await openDrawer(page);
  check('index: map empty before module 1 (empty state, 0 items)', (await page.locator('#km-root [data-km-empty]').count()) === 1 && (await drawerIds(page)).length === 0);
  const top = await chromeTop(page);
  const panel = await page.locator('#km-root').boundingBox();
  check('index: panel top anchored under le haut du viewport de leçon, right edge fixed', !!panel && Math.abs(panel.y - top) < 2 && Math.abs(panel.x + panel.width - 1280) < 2, JSON.stringify({ top, panel }));
  check('index: left-edge resize handle present', (await page.locator('#km-root .cursor-col-resize').count()) === 1);
  await page.screenshot({ path: `${SHOT_DIR}carte-index-empty.png` });
  await ctx.close();
}

/* ── M1 : complétion LIVE → snapshot + tiroir se mettent à jour sans navigation ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[1]}`, ['0'], { tag: 'm1' });
  await openDrawer(page);
  check('M1 (in progress): drawer still empty — nothing unlocked by merely opening the module', (await drawerIds(page)).length === 0);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300);
  check('M1 (in progress): no snapshot yet', (await page.locator('[data-knowledge-snapshot]').count()) === 0);
  // drive the robot (same path as 2nde-vecteurs.mjs)
  const s1 = page.locator('#step-1 [role="slider"]').first(); await s1.focus();
  for (const k of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowUp']) { await page.keyboard.press(k); await page.waitForTimeout(80); }
  await settle(page);
  await tap(page, 'Oui, à la station', '#step-2');
  await press(page, '#step-2', 'Robot : une case vers la droite', 3); await press(page, '#step-2', 'Robot : une case vers le haut', 2);
  await press(page, '#step-3', 'Robot : une case vers la droite', 2); await press(page, '#step-3', 'Robot : une case vers le haut', 1);
  await press(page, '#step-3', 'Robot : une case vers la gauche', 3); await press(page, '#step-3', 'Robot : une case vers le haut', 2);
  await tap(page, 'encore', '#step-4');
  await press(page, '#step-4', 'Robot : une case vers la gauche', 3); await press(page, '#step-4', 'Robot : une case vers le bas', 2);
  await tapOption(page, '#step-5', 0);
  await settle(page);
  const snap = await snapshotIds(page);
  check('M1 done: « À retenir » snapshot = M1 contribution exactly', sameSet(snap, CONTRIB[1]), snap.join(','));
  const b = await body(page);
  check('M1 done: snapshot flags the 2 new items and keeps the naming sentence', /2 nouvelles/.test(b) && /appellent un vecteur/.test(b) && (await page.locator('[data-knowledge-snapshot] :text("nouveau")').count()) >= 2);
  check('M1 done: no old hand-written « Retenons » summary', !/Retenons\./.test(b));
  await openDrawer(page);
  const dr = await drawerIds(page);
  check('M1 done: drawer updated LIVE with the same 2 items', sameSet(dr, snap), dr.join(','));
  check('M1 done: drawer marks them « nouveau » (subtle)', (await page.locator('#km-root [data-km-new="true"]').count()) === 2);
  check('M1 done: « Module suivant » enabled (progression intact)', await nextEnabled(page));
  await page.screenshot({ path: `${SHOT_DIR}carte-m1-live.png`, fullPage: true });
  await ctx.close();
}

/* ── M2 → M8 : état cumulé (seed) — snapshot == tiroir == attendu, jamais de spoiler ── */
for (const n of [2, 3, 4, 5, 6, 7]) {
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[n]}`, seedThrough(n), { tag: `m${n}` });
  await settle(page, 600);
  const snap = await snapshotIds(page);
  const exp = expectedAfter(n);
  check(`M${n}: snapshot = cumulative M1..M${n}`, sameSet(snap, exp), `got ${snap.length}, expected ${exp.length}: missing ${exp.filter((x) => !snap.includes(x))} extra ${snap.filter((x) => !exp.includes(x))}`);
  const future = Object.entries(CONTRIB).filter(([m]) => Number(m) > n).flatMap(([, ids]) => ids);
  check(`M${n}: no future knowledge leaked`, future.every((id) => !snap.includes(id)));
  const newCount = await page.locator(`[data-knowledge-snapshot] [data-knowledge-module="${n}"]`).count();
  check(`M${n}: this module's ${CONTRIB[n].length} items are the detailed ones`, newCount === CONTRIB[n].length && (await page.locator('[data-knowledge-snapshot] :text("nouveau")').count()) === CONTRIB[n].length);
  await openDrawer(page);
  const dr = await drawerIds(page);
  check(`M${n}: drawer shows the same ${exp.length} items`, sameSet(dr, snap), dr.join(','));
  check(`M${n}: revisiting a completed module adds no « nouveau » in the drawer`, (await page.locator('#km-root [data-km-new="true"]').count()) === 0);
  check(`M${n}: header count matches`, new RegExp(`${exp.length} découvertes`).test(await body(page)));
  if (n === 3) {
    // navigation mode: category grid, item detail, back
    await page.locator('#km-root button:has-text("Navigation")').click(); await settle(page, 300);
    await page.locator('#km-root [data-km-item="regle-coordonnees"]').click(); await settle(page, 300);
    check('M3: navigation → item detail renders KaTeX', (await page.locator('#km-root .katex').count()) > 0 && /Retour à la carte/.test(await body(page)));
    await page.locator('#km-root button:has-text("Retour à la carte")').click(); await settle(page, 300);
    check('M3: back to the category grid', (await page.locator('#km-root [data-km-navview] [data-km-item]').count()) === exp.length);
  }
  if (n === 6) {
    // print view reflects the CURRENT knowledge (after M6), incl. the new method titles
    const titles = await page.locator('[data-knowledge-snapshot] [data-knowledge-item]').evaluateAll((els) => els.map((e) => e.textContent.trim()));
    await page.emulateMedia({ media: 'print' }); await settle(page, 400);
    const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
    const screenHidden = await page.locator('#km-root .sa-screen-view').evaluate((e) => getComputedStyle(e).display === 'none');
    const printShown = await page.locator('#km-root .sa-print-view').evaluate((e) => getComputedStyle(e).display !== 'none');
    const nonStar = titles.filter((t) => !t.startsWith('⭐'));
    const missing = nonStar.filter((t) => !printText.includes(t.replace(/\s*nouveau.*$/, '').trim()));
    check('M6: print view lists every current non-⭐ item title', missing.length === 0, missing.join(' | '));
    check('M6: print view shows nothing from M7 (Prouver un alignement)', !/Prouver un alignement/.test(printText));
    check('M6: print CSS swaps screen → print view', screenHidden && printShown);
    await page.screenshot({ path: `${SHOT_DIR}carte-m6-print.png`, fullPage: true });
    await page.emulateMedia({ media: 'screen' });
  }
  if (n === 7) {
    check('M7: last content module → map = complete lesson knowledge (29 items)', snap.length === 29 && dr.length === 29);
    await page.screenshot({ path: `${SHOT_DIR}carte-m7-final.png`, fullPage: true });
    await page.locator('#km-root').screenshot({ path: `${SHOT_DIR}carte-drawer-complete.png` });
  }
  await ctx.close();
}

/* ── Boss : la synthèse EST la carte complète (vue complète du tiroir, dans la page) ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG.boss}`, ['0', '1'], { tag: 'boss' });
  await settle(page, 500);
  await openDrawer(page);
  check('boss (jumped to, M1 only): drawer honest — only M1 knowledge before the test', (await drawerIds(page)).length === CONTRIB[1].length);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300);
  const groups = page.locator('main div[role="group"]'); const n = await groups.count();
  for (let i = 0; i < n; i += 1) { const opts = groups.nth(i).locator('button[aria-pressed]'); if (await opts.count()) await opts.first().click({ force: true }).catch(() => {}); }
  await settle(page);
  await page.locator('button:has-text("Valider mes")').click(); await settle(page);
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page, 800);
  const cards = await attrs(page, '[data-knowledge-snapshot="complete"] [data-km-completeview] [data-km-item]', 'data-km-item');
  check('boss synthèse: complete map rendered inline — all 29 cards, drawer presentation', sameSet(cards, expectedAfter(7)), `${cards.length}`);
  check('boss synthèse: cards carry KaTeX and visuals (not a title list)', (await page.locator('[data-knowledge-snapshot="complete"] .katex').count()) > 20 && (await page.locator('[data-knowledge-snapshot="complete"] svg').count()) > 5);
  check('boss synthèse: no inline print button (print lives in the drawer)', (await page.locator('[data-knowledge-snapshot="complete"]').getByRole('button', { name: 'Imprimer ma carte', exact: true }).count()) === 0 && (await page.locator('[data-knowledge-snapshot="complete"]').getByRole('button', { name: 'Ouvrir et imprimer ma carte' }).count()) === 1);
  check('boss synthèse: old hand-written synthèse gone', (await page.locator('svg[aria-label^="Le dépôt"]').count()) === 0);
  await openDrawer(page);
  check('boss synthèse: drawer moved to the same complete state', (await drawerIds(page)).length === 29 && /29 découvertes/.test(await body(page)));
  await page.screenshot({ path: `${SHOT_DIR}carte-boss-synthese.png`, fullPage: true });
  await ctx.close();
}

/* ── Mobile : tiroir utilisable, pas de débordement ─────────────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[4]}`, seedThrough(4), { tag: 'mobile', mobile: true });
  await settle(page, 500);
  check('mobile: no horizontal scroll with the snapshot', await noHScroll(page));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth);
  const panel = await page.locator('#km-root').boundingBox();
  const top = await chromeTop(page);
  check('mobile: drawer fits the viewport, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - top) < 2, JSON.stringify({ vw, panel, top }));
  check('mobile: drawer lists the cumulative items', (await drawerIds(page)).length === expectedAfter(4).length);
  await page.screenshot({ path: `${SHOT_DIR}carte-mobile.png` });
  await ctx.close();
}

check('no console errors / page errors across the run', errs.length === 0, errs.slice(0, 3).join(' | '));
await browser.close();
summary();
