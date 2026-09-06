// Carte des connaissances — Équations de droites 2nde : progression
// cumulative, « À retenir » = snapshot de la carte, tiroir = même état,
// impression, responsive. Calque de 2nde-vecteurs-carte.mjs (la référence).
// Run: node apps/web/e2e/lesson-kit/2nde-equations-droites-carte.mjs   (vite on :5233, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, noHScroll, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5233';
const LESSON = `${BASE}/courses/lycee/seconde/geometrie/equations-de-droites-2nde`;
const KEY = 'u_anon_smarter_lesson_equations-de-droites-2nde';
const SLUG = {
  1: 'le-laboratoire-des-droites', 2: 'des-points-sur-la-droite', 3: 'de-la-droite-a-l-equation',
  4: 'le-laboratoire-des-coefficients', 5: 'ce-point-est-il-sur-la-droite',
  6: 'atelier-construire-et-resoudre', boss: 'mission-finale-la-droite',
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));

/* Attendu par module — miroir de knowledge.jsx (ids par module). */
const CONTRIB = {
  1: ['droite-point-direction', 'droite-vecteur-directeur', 'droite-vocabulaire-directeur', 'mem-droite-point-direction'],
  2: ['droite-points-parametres', 'droite-pente', 'droite-calculer-pente', 'droite-pente-vers-directeur', 'mem-droite-pente'],
  3: ['droite-equation-idee', 'droite-equation-cartesienne', 'droite-equation-reduite', 'droite-methode-point-vecteur', 'droite-formules-equations', 'mem-droite-deux-ecritures'],
  4: ['droite-role-m-p', 'droite-ordonnee-origine', 'droite-verticale', 'droite-lire-equation', 'droite-tracer', 'mem-droite-m-p'],
  5: ['droite-appartenance', 'droite-methode-tester-point', 'droite-alignement-equation', 'mem-droite-appartenance'],
  6: ['droite-methode-deux-points', 'droite-methode-point-pente', 'droite-lire-cartesienne', 'droite-modeliser', 'mem-droite-trois-chemins'],
};
const TOTAL = Object.values(CONTRIB).flat().length;
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

const browser = await launch();

/* ── Départ : carte vide sur l'index ─────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  check('index: trigger « Ma carte » mounted by the provider', (await page.locator('button[data-km-trigger]').count()) === 1);
  check('index: no « À retenir » module left in the lesson plan', !/À retenir/.test(await body(page)));
  await openDrawer(page);
  check('index: map empty before module 1 (empty state, 0 items)', (await page.locator('#km-root [data-km-empty]').count()) === 1 && (await drawerIds(page)).length === 0);
  const hdr = await page.locator('#app-header').boundingBox();
  const panel = await page.locator('#km-root').boundingBox();
  check('index: panel top anchored under #app-header, right edge fixed', !!hdr && !!panel && Math.abs(panel.y - (hdr.y + hdr.height)) < 2 && Math.abs(panel.x + panel.width - 1280) < 2, JSON.stringify({ hdr, panel }));
  check('index: left-edge resize handle present', (await page.locator('#km-root .cursor-col-resize').count()) === 1);
  await page.screenshot({ path: `${SHOT_DIR}eqdroites-carte-index-empty.png` });
  await ctx.close();
}

/* ── Module ouvert mais non terminé : rien ne se débloque ────────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[1]}`, ['0'], { tag: 'm1-open' });
  await openDrawer(page);
  check('M1 (in progress): drawer still empty — nothing unlocked by merely opening the module', (await drawerIds(page)).length === 0);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300);
  check('M1 (in progress): no snapshot yet', (await page.locator('[data-knowledge-snapshot]').count()) === 0);
  await ctx.close();
}

/* ── M1 → M5 : état cumulé (seed) — snapshot == tiroir == attendu ────────── */
for (const n of [1, 2, 3, 4, 5, 6]) {
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
  check(`M${n}: header count matches`, new RegExp(`${exp.length} découverte`).test(await body(page)));

  if (n === 1) {
    // pas de spoiler : le déterminant n'existe pas encore au module 1
    const txt = await page.locator('#km-root').textContent();
    check('M1: no spoiler — no equation, no slope letter m before module 2', !/équation réduite|équation cartésienne|ordonnée à l’origine/i.test(txt));
  }
  if (n === 4) {
    // navigation mode: category grid, item detail, back
    await page.locator('#km-root button:has-text("Navigation")').click(); await settle(page, 300);
    await page.locator('#km-root [data-km-item="droite-role-m-p"]').click(); await settle(page, 300);
    check('M4: navigation → item detail renders KaTeX', (await page.locator('#km-root .katex').count()) > 0 && /Retour à la carte/.test(await body(page)));
    await page.locator('#km-root button:has-text("Retour à la carte")').click(); await settle(page, 300);
    check('M4: back to the category grid', (await page.locator('#km-root [data-km-navview] [data-km-item]').count()) === exp.length);
    await page.locator('#km-root button:has-text("Vue complète")').click(); await settle(page, 300);
    // impression : la carte imprimée est l'état courant, rien du module 5
    await page.emulateMedia({ media: 'print' }); await settle(page, 400);
    const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
    const screenHidden = await page.locator('#km-root .sa-screen-view').evaluate((e) => getComputedStyle(e).display === 'none');
    const printShown = await page.locator('#km-root .sa-print-view').evaluate((e) => getComputedStyle(e).display !== 'none');
    check('M4: print CSS swaps screen → print view', screenHidden && printShown);
    check('M4: print header carries the lesson title', /ÉQUATIONS DE DROITES/.test(printText));
    check('M4: print view shows the reduced equation, and nothing from M5', /Ordonnée à l['’]origine/.test(printText) && !/Appartenance d['’]un point/.test(printText));
    check('M4: print chrome hidden', await page.locator('#km-root [data-km-noprint]').first().evaluate((e) => getComputedStyle(e).display === 'none'));
    await page.screenshot({ path: `${SHOT_DIR}eqdroites-carte-m4-print.png`, fullPage: true });
    await page.emulateMedia({ media: 'screen' });
  }
  if (n === 6) {
    check(`M6: last content module → map = complete lesson knowledge (${TOTAL} items)`, snap.length === TOTAL && dr.length === TOTAL);
    await page.locator('#km-root').screenshot({ path: `${SHOT_DIR}eqdroites-carte-drawer-complete.png` });
  }
  await ctx.close();
}

/* ── Boss : la synthèse EST la carte complète ────────────────────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG.boss}`, ['0', '1'], { tag: 'boss' });
  await settle(page, 500);
  await openDrawer(page);
  check('boss (jumped to, M1 only): drawer honest — only M1 knowledge before the test', (await drawerIds(page)).length === CONTRIB[1].length);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300);
  const groups = page.locator('main div[role="group"]'); const n = await groups.count();
  for (let i = 0; i < n; i += 1) { const opts = groups.nth(i).locator('button[aria-pressed]'); if (await opts.count()) await opts.first().click({ force: true }).catch(() => {}); }
  await settle(page);
  await page.locator('button:has-text("Valider mes 10 réponses")').click(); await settle(page);
  await page.locator('button:has-text("Voir mon profil")').click(); await settle(page);
  await page.locator('button:has-text("Passer à la synthèse")').click(); await settle(page, 800);
  const cards = await attrs(page, '[data-knowledge-snapshot="complete"] [data-km-completeview] [data-km-item]', 'data-km-item');
  check(`boss synthèse: complete map rendered inline — all ${TOTAL} cards`, sameSet(cards, expectedAfter(6)), `${cards.length}`);
  check('boss synthèse: cards carry KaTeX and visuals (not a title list)', (await page.locator('[data-knowledge-snapshot="complete"] .katex').count()) > 3 && (await page.locator('[data-knowledge-snapshot="complete"] svg').count()) > 2);
  check('boss synthèse: no inline print button (print lives in the drawer)', (await page.locator('[data-knowledge-snapshot="complete"]').getByRole('button', { name: 'Imprimer ma carte', exact: true }).count()) === 0 && (await page.locator('[data-knowledge-snapshot="complete"]').getByRole('button', { name: 'Ouvrir et imprimer ma carte' }).count()) === 1);
  await openDrawer(page);
  check('boss synthèse: drawer moved to the same complete state', (await drawerIds(page)).length === TOTAL && new RegExp(`${TOTAL} découvertes`).test(await body(page)));
  await page.screenshot({ path: `${SHOT_DIR}eqdroites-carte-boss-synthese.png`, fullPage: true });
  await ctx.close();
}

/* ── Mobile : tiroir utilisable, pas de débordement ─────────────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[3]}`, seedThrough(3), { tag: 'mobile', mobile: true });
  await settle(page, 500);
  check('mobile: no horizontal scroll with the snapshot', await noHScroll(page));
  await openDrawer(page);
  const vw = await page.evaluate(() => window.innerWidth);
  const panel = await page.locator('#km-root').boundingBox();
  const hdr = await page.locator('#app-header').boundingBox();
  check('mobile: drawer fits the viewport, right edge fixed, under the header', !!panel && panel.width <= vw + 1 && Math.abs(panel.x + panel.width - vw) < 2 && Math.abs(panel.y - (hdr.y + hdr.height)) < 2, JSON.stringify({ vw, panel, hdr }));
  check('mobile: drawer lists the cumulative items', (await drawerIds(page)).length === expectedAfter(3).length);
  await page.screenshot({ path: `${SHOT_DIR}eqdroites-carte-mobile.png` });
  await ctx.close();
}

check('no console errors / page errors across the run', errs.length === 0, errs.slice(0, 3).join(' | '));
await browser.close();
summary();
