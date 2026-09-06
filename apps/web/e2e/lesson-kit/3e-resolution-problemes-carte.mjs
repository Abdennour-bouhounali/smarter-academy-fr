// Carte des connaissances — Résolution de problèmes 3e.
//
// Vérifie la promesse du contrat « connaissances avant la demande »
// (docs/architecture/KNOWLEDGE_DEPENDENCY.md) telle qu'un élève la vit :
// une <KnowledgeBrick> ne paraît qu'APRÈS le geste qui donne son sens à la
// méthode, la carte grandit à cet instant — sans attendre la fin du module —,
// et aucune connaissance d'un module plus loin ne fuite.
//
// Run: node apps/web/e2e/lesson-kit/3e-resolution-problemes-carte.mjs  (vite on :5203, started from apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5203';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/resolution-problemes-3e`;
const KEY = 'u_anon_smarter_lesson_resolution-problemes-3e';
const o = (b, url, seed, extra = {}) => open(b, url, { key: KEY, completedModules: seed, ...extra });

const browser = await launch();

/* ── Index : carte vide au départ ── */
{
  const { ctx, page } = await o(browser, LESSON, [], { tag: 'index' });
  await settle(page);
  const items = await page.locator('[data-km-item]').count();
  check('index : la carte est vide au début de la leçon', items === 0, `items=${items}`);
  await ctx.close();
}

/* ── M2 : « lire un énoncé » n'est posé qu'après le tri ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/lire-comme-un-detective`, ['0', '1'], { tag: 'm2' });
  await settle(page);

  const before = await page.locator('[data-knowledge-brick="lire-un-enonce"]').count();
  check('M2 : aucune brique « lire un énoncé » avant d’avoir trié l’énoncé', before === 0, `count=${before}`);

  const snapshot = await page.locator('[data-knowledge-snapshot]').count();
  check('M2 : le module n’est pas terminé (pas d’« À retenir » de fin)', snapshot === 0, `count=${snapshot}`);

  const leaked = await page.locator('[data-km-item="resoudre-etape-par-etape"]').count();
  check('M2 : la méthode du module 6 ne fuite pas', leaked === 0, `count=${leaked}`);
  await ctx.close();
}

/* ── M6 : les modules validés donnent leur carte, sans fuite ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/resoudre-et-verifier`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  await settle(page);
  await page.locator('[data-km-trigger]').click();
  await settle(page);
  for (const id of ['pourquoi-une-equation', 'lire-un-enonce', 'choisir-linconnue', 'traduire-en-equation', 'choisir-la-strategie']) {
    const n = await page.locator(`[data-km-item="${id}"]`).count();
    check(`M6 : « ${id} » acquis des modules précédents`, n >= 1, `count=${n}`);
  }
  const future = await page.locator('[data-km-item="phrase-de-reponse"]').count();
  check('M6 : la phrase de réponse (module 7) ne fuite pas', future === 0, `count=${future}`);
  await ctx.close();
}

/* ── Boss : la carte complète porte tout le carnet ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/mission-finale-le-carnet-complet`, ['0', '1', '2', '3', '4', '5', '6', '7'], { tag: 'boss' });
  await settle(page);
  await page.locator('[data-km-trigger]').click();
  await settle(page);
  for (const id of ['lire-un-enonce', 'choisir-linconnue', 'traduire-en-equation', 'resoudre-etape-par-etape', 'interpreter-le-resultat', 'phrase-de-reponse']) {
    const n = await page.locator(`[data-km-item="${id}"]`).count();
    check(`boss : « ${id} » est sur la carte complète`, n >= 1, `count=${n}`);
  }
  await ctx.close();
}

/* ── Mobile : la brique tient dans l’écran ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/lire-comme-un-detective`, ['0', '1'], { tag: 'mobile', mobile: true });
  await settle(page);
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  check('mobile : pas de défilement horizontal', scrollW <= 375 + 1, `scrollWidth=${scrollW}`);
  await ctx.close();
}

await browser.close();
process.exit(summary());
