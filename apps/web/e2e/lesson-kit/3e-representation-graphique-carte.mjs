// Carte des connaissances — Représentation graphique 3e.
//
// « Échelle », « carreau » et « graduation » — la CIBLE de la leçon (P2) —
// étaient exigés dès le module 0 sans jamais être posés en position
// d'enseignement ; « croissante / décroissante » et « étendue » vivaient dans
// des `explain`, donc après la réponse. Ce test vérifie que chaque notion est
// posée par une brique APRÈS le geste qui lui donne son sens et AVANT la
// première question qui l'exige, et qu'aucune connaissance d'un module
// ultérieur ne fuite dans la carte.
//
// Run: node apps/web/e2e/lesson-kit/3e-representation-graphique-carte.mjs
//      (vite sur :5253, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';
const BASE = process.env.KIT_BASE || 'http://localhost:5253';
const LESSON = `${BASE}/courses/college/3e/donnees_probabilites/representation-graphique-3e`;
const KEY = 'u_anon_smarter_lesson_representation-graphique-3e';
const o = (b, u, seed, x = {}) => open(b, u, { key: KEY, completedModules: seed, ...x });
const browser = await launch();

{ // M2 — l'échelle : rien avant la bascule, la brique après.
  const { ctx, page } = await o(browser, `${LESSON}/lechelle-qui-change-tout`, ['0', '1'], { tag: 'm2' });
  await settle(page);
  const before = await page.locator('[data-knowledge-brick]').count();
  check('M2 : aucune brique avant d’avoir vu les deux échelles', before === 0, `count=${before}`);
  await page.getByRole('button', { name: /Axe partant de 17/ }).click();
  await page.waitForTimeout(500); await settle(page);
  const n = await page.locator('[data-knowledge-brick="echelle-axe"]').count();
  check('M2 : « echelle-axe » posé après la bascule', n === 1, `count=${n}`);
  await page.locator('[data-km-trigger]').click(); await settle(page);
  const inMap = await page.locator('[data-km-item="echelle-axe"]').count();
  check('M2 : l’échelle entre dans la carte immédiatement', inMap >= 1, `count=${inMap}`);
  for (const leak of ['forme-de-la-courbe', 'verifier-un-graphique', 'echelle-qui-aplatit']) {
    const k = await page.locator(`[data-km-item="${leak}"]`).count();
    check(`M2 : « ${leak} » (module ultérieur) ne fuite pas`, k === 0, `count=${k}`);
  }
  await ctx.close();
}

{ // M5 — les mots de la forme viennent APRÈS la question en mots ordinaires.
  const { ctx, page } = await o(browser, `${LESSON}/quatre-graphiques-quatre-histoires`, ['0', '1', '2', '3', '4'], { tag: 'm5' });
  await settle(page);
  const before = await page.locator('[data-knowledge-brick="forme-de-la-courbe"]').count();
  check('M5 : « forme-de-la-courbe » n’existe pas avant la réponse', before === 0, `count=${before}`);
  const decroissant = await page.getByText(/est décroissant/).count();
  check('M5 : « décroissant » n’est pas encore demandé', decroissant === 0, `count=${decroissant}`);
  await ctx.close();
}

{ // M6 — la brique du défaut n° 4 précède l'appariement des vérifications.
  const { ctx, page } = await o(browser, `${LESSON}/quatre-graphiques-a-reparer`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  await settle(page);
  const etendue = await page.getByText(/Comparer l’étendue des données/).count();
  check('M6 : « étendue » n’est pas demandé d’entrée', etendue === 0, `count=${etendue}`);
  await ctx.close();
}

await browser.close(); summary();
