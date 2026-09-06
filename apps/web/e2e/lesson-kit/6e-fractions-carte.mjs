// Carte des connaissances — Fractions 6e : progression cumulative, « À retenir »
// = snapshot de la carte, tiroir = même état, impression, responsive.
//
// PREMIÈRE SUITE « carte » DE 6e. Elle verrouille le même contrat DOM que les
// suites de 2nde, sur la leçon qui sert de référence au chantier 6e :
// aucune connaissance d'un module ultérieur ne fuite, la carte grandit au
// module validé, et la synthèse du boss EST la carte complète.
//
// Run: node apps/web/e2e/lesson-kit/6e-fractions-carte.mjs   (vite on :5250, started from apps/web/)
import {
  launch, open, check, summary, errs, body, settle, noHScroll, SHOT_DIR,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5250';
const LESSON = `${BASE}/courses/college/6e/nombres_calculs/fractions`;
const KEY = 'u_anon_smarter_lesson_fractions';
const SLUG = {
  1: 'partage-impossible',
  2: 'construire-une-fraction',
  3: 'numerateur-denominateur',
  4: 'lire-et-representer',
  5: 'station-quantite',
  6: 'fraction-quotient',
  7: 'fractions-simples',
  8: 'sur-la-droite-graduee',
  9: 'fractions-decimales',
  boss: 'la-mission-du-partage',
};
const o = (browser, url, seed, extra = {}) => open(browser, url, { key: KEY, completedModules: seed, ...extra });
const seedThrough = (n) => Array.from({ length: n + 1 }, (_, i) => String(i));

/* Attendu par module — miroir exact de knowledge.jsx (ids par module). */
const CONTRIB = {
  1: ['part-egale', 'fraction-ecriture'],
  2: ['role-du-bas'],
  3: ['numerateur', 'denominateur', 'mem-haut-bas'],
  4: ['meme-quantite-deux-dessins', 'equivalence-decoupe'],
  5: ['fraction-quantite'],
  6: ['fraction-quotient'],
  7: ['fractions-usuelles'],
  8: ['comparer-a-un', 'fraction-nombre-droite'],
  9: ['fraction-decimale'],
};
const TOTAL = Object.values(CONTRIB).flat().length;
const expectedAfter = (n) => Object.entries(CONTRIB).filter(([m]) => Number(m) <= n).flatMap(([, ids]) => ids);
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);

const attrs = (page, sel, attr) => page.locator(sel).evaluateAll((els, a) => els.map((e) => e.getAttribute(a)), attr);
const snapshotIds = (page) => attrs(page, '[data-knowledge-snapshot] [data-knowledge-item]', 'data-knowledge-item');
const drawerIds = (page) => attrs(page, '#km-root [data-km-completeview] [data-km-item]', 'data-km-item');
const closeDrawer = async (page) => {
  await page.keyboard.press('Escape');
  await settle(page, 350);
  if (await page.locator('#km-root').count()) {
    await page.locator('#km-root button[aria-label="Fermer la carte"]').click({ force: true }).catch(() => {});
    await settle(page, 250);
  }
};
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
  check('index: trigger « Ma carte » monté par le provider', (await page.locator('button[data-km-trigger]').count()) === 1);
  await openDrawer(page);
  check('index: carte vide avant le module 1', (await page.locator('#km-root [data-km-empty]').count()) === 1 && (await drawerIds(page)).length === 0);
  await page.screenshot({ path: `${SHOT_DIR}6e-fr-carte-index-empty.png` });
  await ctx.close();
}

/* ── M1 en cours : rien ne se débloque à la simple ouverture ─────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[1]}`, ['0'], { tag: 'm1' });
  await openDrawer(page);
  check('M1 (en cours): tiroir encore vide — ouvrir un module ne débloque rien', (await drawerIds(page)).length === 0);
  await closeDrawer(page);
  check('M1 (en cours): aucun snapshot rendu tant que les étapes ne sont pas faites', (await page.locator('[data-knowledge-snapshot]').count()) === 0);
  await ctx.close();
}

/* ── M1 → M9 : état cumulé (seed) — snapshot == tiroir == attendu ────────── */
for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[n]}`, seedThrough(n), { tag: `m${n}` });
  await settle(page, 600);
  const snap = await snapshotIds(page);
  const exp = expectedAfter(n);
  check(`M${n}: snapshot = cumul M1..M${n}`, sameSet(snap, exp),
    `got ${snap.length}, expected ${exp.length}: manquants ${exp.filter((x) => !snap.includes(x))} en trop ${snap.filter((x) => !exp.includes(x))}`);

  // LE test « zéro spoiler » : rien d'un module ultérieur ne doit apparaître.
  const future = Object.entries(CONTRIB).filter(([m]) => Number(m) > n).flatMap(([, ids]) => ids);
  check(`M${n}: aucune connaissance future ne fuite`, future.every((id) => !snap.includes(id)));

  const newCount = await page.locator(`[data-knowledge-snapshot] [data-knowledge-module="${n}"]`).count();
  check(`M${n}: les ${CONTRIB[n].length} items de ce module sont ceux qui sont détaillés`, newCount === CONTRIB[n].length);

  await openDrawer(page);
  const dr = await drawerIds(page);
  check(`M${n}: le tiroir montre les mêmes ${exp.length} items`, sameSet(dr, snap), dr.join(','));

  if (n === 3) {
    // Le vocabulaire de la leçon est bien posé au module qui l'enseigne.
    await page.locator('#km-root button:has-text("Navigation")').click(); await settle(page, 300);
    await page.locator('#km-root [data-km-item="numerateur"]').click(); await settle(page, 300);
    check('M3: navigation → le détail de « numérateur » s’ouvre', /Retour à la carte/.test(await body(page)));
    await page.locator('#km-root button:has-text("Retour à la carte")').click(); await settle(page, 300);
  }

  if (n === 9) {
    const titles = await page.locator('[data-knowledge-snapshot] [data-knowledge-item]').evaluateAll((els) => els.map((e) => e.textContent.trim()));
    await page.emulateMedia({ media: 'print' }); await settle(page, 400);
    const printText = (await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g, ' ');
    const nonStar = titles.filter((t) => !t.startsWith('⭐'));
    const missing = nonStar.filter((t) => !printText.includes(t.replace(/\s*nouveau.*$/, '').trim()));
    check('M9: la vue impression liste chaque item non-⭐ courant', missing.length === 0, missing.join(' | '));
    check('M9: l’en-tête d’impression porte le titre de CETTE leçon', /LES FRACTIONS/.test(printText) && !/LES VECTEURS/.test(printText));
    await page.screenshot({ path: `${SHOT_DIR}6e-fr-carte-m9-print.png`, fullPage: true });
    await page.emulateMedia({ media: 'screen' });
    check(`M9: dernier module de contenu → carte complète (${TOTAL} items)`, snap.length === TOTAL && dr.length === TOTAL, `${snap.length}/${dr.length}`);
  }
  await ctx.close();
}

/* ── Boss : la synthèse EST la carte complète ────────────────────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG.boss}`, ['0', '1'], { tag: 'boss' });
  await settle(page, 500);
  await openDrawer(page);
  check('boss (atteint avec M1 seul): tiroir honnête — seules les connaissances de M1',
    (await drawerIds(page)).length === CONTRIB[1].length);
  await ctx.close();
}

/* ── Mobile 375 px ───────────────────────────────────────────────────────── */
{
  const { ctx, page } = await o(browser, `${LESSON}/${SLUG[3]}`, seedThrough(3), { tag: 'mobile', mobile: true });
  await settle(page, 600);
  check('mobile: pas de défilement horizontal sur le module', await noHScroll(page));
  await openDrawer(page);
  check('mobile: le tiroir s’ouvre et reste dans la fenêtre', await noHScroll(page));
  await page.screenshot({ path: `${SHOT_DIR}6e-fr-carte-mobile.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
summary();
if (errs.length) { console.log(`\n${errs.length} erreur(s) console :`); errs.slice(0, 10).forEach((e) => console.log('  ', e)); }
