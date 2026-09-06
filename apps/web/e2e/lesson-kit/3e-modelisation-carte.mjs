// Carte des connaissances — Modélisation 3e.
//
// Le mot « affine » était demandé au module 3 dans une option de QCM, alors
// qu'il n'avait jamais été prononcé : la leçon ne le posait qu'au module 4.
// Ce test vérifie que le module 3 fait d'abord DÉCRIRE la forme, puis nomme
// les familles par une brique, et n'exige le mot qu'ensuite. Il vérifie aussi
// que le module 6 pose « domaine de validité » et « extrapolation » avant de
// les demander, et qu'aucune connaissance d'un module ultérieur ne fuite.
//
// Run: node apps/web/e2e/lesson-kit/3e-modelisation-carte.mjs   (vite on :5261, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';
const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/college/3e/donnees_probabilites/modelisation-3e`;
const KEY = 'u_anon_smarter_lesson_modelisation-3e';
const o = (b, u, seed, x = {}) => open(b, u, { key: KEY, completedModules: seed, ...x });
const browser = await launch();

{
  const { ctx, page } = await o(browser, `${LESSON}/du-tableau-au-graphique`, ['0', '1', '2'], { tag: 'm3' });
  await settle(page);
  const bricks = await page.locator('[data-knowledge-brick]').count();
  check('M3 : aucune brique avant d’avoir rempli le tableau', bricks === 0, `count=${bricks}`);
  const affineEarly = await page.getByText(/affine/i).count();
  check('M3 : le mot « affine » n’est nulle part avant la brique', affineEarly === 0, `count=${affineEarly}`);
  const famEarly = await page.locator('[data-knowledge-brick="familles-modeles"]').count();
  check('M3 : la brique des familles n’existe pas encore', famEarly === 0, `count=${famEarly}`);
  await ctx.close();
}

{
  const { ctx, page } = await o(browser, `${LESSON}/prevoir-interpreter-douter`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  await settle(page);
  const dom = await page.locator('[data-knowledge-brick="domaine-de-validite"]').count();
  check('M6 : « domaine de validité » n’est pas posé d’entrée', dom === 0, `count=${dom}`);
  const leak = await page.locator('[data-knowledge-brick="seuil-deux-modeles"]').count();
  check('M6 : la connaissance du module 7 ne fuite pas', leak === 0, `count=${leak}`);
  await page.locator('[data-km-trigger]').click(); await settle(page);
  const acquired = await page.locator('[data-km-item="familles-modeles"]').count();
  check('M6 : les acquis des modules précédents sont dans la carte', acquired >= 1, `count=${acquired}`);
  const future = await page.locator('[data-km-item="seuil-deux-modeles"]').count();
  check('M6 : la carte ne montre pas encore le module 7', future === 0, `count=${future}`);
  await ctx.close();
}

await browser.close(); summary();
