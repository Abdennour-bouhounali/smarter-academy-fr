// Carte des connaissances — Arithmétique 2nde : progression cumulative,
// « À retenir » = snapshot de la carte, tiroir = même état, impression, responsive.
// Run: node apps/web/e2e/lesson-kit/2nde-arithmetique-carte.mjs   (vite on :5240, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, noHScroll, SHOT_DIR,
  chromeTop,} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5240';
const LESSON = `${BASE}/courses/lycee/seconde/nombres_calculs/arithmetique-2nde`;
const KEY = 'u_anon_smarter_lesson_arithmetique-2nde';
const SLUG = {
  1: 'les-paquets-et-les-restes',
  2: 'pair-impair-et-la-lettre',
  3: 'les-criteres-demontres',
  4: 'multiples-communs',
  5: 'demontrer',
  boss: 'mission-finale-latelier',
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));

/* Attendu par module — miroir de knowledge.jsx (ids par module). */
const CONTRIB = {
  1: ['division-euclidienne', 'multiple-diviseur', 'regle-reste-decide', 'mem-multiple-reste'],
  2: ['ecriture-litterale-parite', 'lettre-couvre-tout', 'methode-preuve-parite', 'regle-parite-operations'],
  3: ['criteres-divisibilite', 'critere-est-decoupage'],
  4: ['ppcm', 'pgcd', 'methode-reconnaitre-ppcm-pgcd'],
  5: ['methode-demonstration-arithmetique', 'regle-exemples-pas-preuve', 'mem-conclure-par-definition'],
};
const TOTAL = Object.values(CONTRIB).flat().length;
const expectedAfter = (n) => Object.entries(CONTRIB).filter(([m]) => Number(m) <= n).flatMap(([, ids]) => ids);
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

const browser = await launch();

/* ── Départ : carte vide sur l'index ─────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, LESSON, null, { tag: 'index' });
  check('index: trigger « Ma carte » mounted by the provider', (await page.locator('button[data-km-trigger]').count()) === 1);
  await openDrawer(page);
  check('index: map empty before module 1', (await page.locator('#km-root [data-km-empty]').count()) === 1 && (await drawerIds(page)).length === 0);
  const top = await chromeTop(page);
  const panel = await page.locator('#km-root').boundingBox();
  check('index: panel top under le haut du viewport de leçon, right edge flush', !!panel && Math.abs(panel.y - top) < 2 && Math.abs(panel.x + panel.width - 1280) < 2, JSON.stringify({ top, panel }));
  check('index: left-edge resize handle present', (await page.locator('#km-root .cursor-col-resize').count()) === 1);
  await page.screenshot({ path: `${SHOT_DIR}ar-carte-index-empty.png` });
  await ctx.close();
}

/* ── M1 en cours : rien ne se débloque à la simple ouverture ─────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[1]}`, ['0'], { tag: 'm1' });
  await openDrawer(page);
  check('M1 (in progress): drawer still empty — opening a module unlocks nothing', (await drawerIds(page)).length === 0);
  await page.locator('#km-root button[aria-label="Fermer la carte"]').click(); await settle(page, 300);
  check('M1 (in progress): no snapshot rendered yet', (await page.locator('[data-knowledge-snapshot]').count()) === 0);
  await ctx.close();
}

/* ── M1 → M6 : état cumulé (seed) — snapshot == tiroir == attendu ────────── */
for (const n of [1, 2, 3, 4, 5]) {
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[n]}`, seedThrough(n), { tag: `m${n}` });
  await settle(page, 600);
  const snap = await snapshotIds(page);
  const exp = expectedAfter(n);
  check(`M${n}: snapshot = cumulative M1..M${n}`, sameSet(snap, exp), `got ${snap.length}, expected ${exp.length}: missing ${exp.filter((x) => !snap.includes(x))} extra ${snap.filter((x) => !exp.includes(x))}`);
  const future = Object.entries(CONTRIB).filter(([m]) => Number(m) > n).flatMap(([, ids]) => ids);
  check(`M${n}: no future knowledge leaked`, future.every((id) => !snap.includes(id)));
  const newCount = await page.locator(`[data-knowledge-snapshot] [data-knowledge-module="${n}"]`).count();
  check(`M${n}: this module's ${CONTRIB[n].length} items are the detailed ones`, newCount === CONTRIB[n].length && (await page.locator('[data-knowledge-snapshot] :text("nouveau")').count()) === CONTRIB[n].length);
  check(`M${n}: no leftover hand-written « À retenir » card`, !/À retenir :/.test(await body(page)));
  await openDrawer(page);
  const dr = await drawerIds(page);
  check(`M${n}: drawer shows the same ${exp.length} items`, sameSet(dr, snap), dr.join(','));
  check(`M${n}: header count matches`, new RegExp(`${exp.length} découverte`).test(await body(page)));
  if (n === 3) {
    await page.locator('#km-root button:has-text("Navigation")').click(); await settle(page, 300);
    await page.locator('#km-root [data-km-item="criteres-divisibilite"]').click(); await settle(page, 300);
    check('M3: navigation → item detail opens', /Retour à la carte/.test(await body(page)));
    await page.locator('#km-root button:has-text("Retour à la carte")').click(); await settle(page, 300);
    check('M3: back to the category grid', (await page.locator('#km-root [data-km-navview] [data-km-item]').count()) === exp.length);
  }
  if (n === 4) {
    const titles = await page.locator('[data-knowledge-snapshot] [data-knowledge-item]').evaluateAll((els) => els.map((e) => e.textContent.trim()));
    await page.emulateMedia({ media: 'print' }); await settle(page, 400);
    const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
    const screenHidden = await page.locator('#km-root .sa-screen-view').evaluate((e) => getComputedStyle(e).display === 'none');
    const printShown = await page.locator('#km-root .sa-print-view').evaluate((e) => getComputedStyle(e).display !== 'none');
    const nonStar = titles.filter((t) => !t.startsWith('⭐'));
    const missing = nonStar.filter((t) => !printText.includes(t.replace(/\s*nouveau.*$/, '').trim()));
    check('M4: print view lists every current non-⭐ item title', missing.length === 0, missing.join(' | '));
    check('M4: print header carries the lesson title, not « LES VECTEURS »', /ARITHMÉTIQUE/.test(printText) && !/LES VECTEURS/.test(printText));
    check('M4: print view shows nothing from M5', !/chaîne d’une démonstration/.test(printText));
    check('M4: print CSS swaps screen → print view', screenHidden && printShown);
    await page.screenshot({ path: `${SHOT_DIR}ar-carte-m4-print.png`, fullPage: true });
    await page.emulateMedia({ media: 'screen' });
  }
  if (n === 5) {
    check(`M5: last content module → complete lesson knowledge (${TOTAL} items)`, snap.length === TOTAL && dr.length === TOTAL, `${snap.length}/${dr.length}`);
    await page.screenshot({ path: `${SHOT_DIR}ar-carte-m5-final.png`, fullPage: true });
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
  check(`boss synthèse: complete map rendered inline — all ${TOTAL} cards`, sameSet(cards, expectedAfter(5)), `${cards.length}`);
  check('boss synthèse: old hand-written synthèse gone', !/Synthèse : l’atelier/.test(await body(page)));
  check('boss synthèse: no inline print button (print lives in the drawer)', (await page.locator('[data-knowledge-snapshot="complete"]').getByRole('button', { name: 'Ouvrir et imprimer ma carte' }).count()) === 1);
  await openDrawer(page);
  check('boss synthèse: drawer moved to the same complete state', (await drawerIds(page)).length === TOTAL);
  await page.screenshot({ path: `${SHOT_DIR}ar-carte-boss.png`, fullPage: true });
  await ctx.close();
}

/* ── Mobile ──────────────────────────────────────────────────────────────── */
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
  await page.screenshot({ path: `${SHOT_DIR}ar-carte-mobile.png` });
  await ctx.close();
}

check('no console errors / page errors across the run', errs.length === 0, errs.slice(0, 3).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
