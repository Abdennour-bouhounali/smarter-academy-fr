// Carte des connaissances — Fonctions 3e.
//
// Vérifie la promesse du contrat « connaissances avant la demande »
// (docs/architecture/KNOWLEDGE_DEPENDENCY.md) telle qu'un élève la vit :
// une <KnowledgeBrick> ne paraît qu'APRÈS le geste qui donne son sens au mot,
// la carte grandit à cet instant — sans attendre la fin du module —, et aucune
// connaissance d'un module plus loin ne fuite.
//
// Run: node apps/web/e2e/lesson-kit/3e-fonctions-carte.mjs   (vite on :5251, started from apps/web/)
import { launch, open, check, summary, errs, settle } from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-3e';
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

/* ── M2 : la brique n'existe qu'après le geste ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/image-et-antecedent`, ['0', '1'], { tag: 'm2' });
  await settle(page);

  const brickBefore = await page.locator('[data-knowledge-brick="image"]').count();
  check('M2 étape 1 : aucune brique « image » avant d’avoir lancé la machine', brickBefore === 0, `count=${brickBefore}`);

  const promptBefore = await page.getByText(/image de 3/).count();
  check('M2 : le mot « image » n’est demandé nulle part avant d’être posé', promptBefore === 0, `count=${promptBefore}`);

  // Lancer la machine : le geste qui fait naître la connaissance.
  await page.getByRole('button', { name: /Lancer|lancer/ }).first().click();
  await page.waitForTimeout(1500);
  await settle(page);

  const brickAfter = await page.locator('[data-knowledge-brick="image"]').count();
  check('M2 étape 1 : la brique « image » paraît après le lancement', brickAfter === 1, `count=${brickAfter}`);

  const tryIt = await page.locator('[data-knowledge-brick="image"] [data-knowledge-brick-tryit]').count();
  check('M2 : la brique porte son essai immédiat', tryIt === 1, `count=${tryIt}`);

  // La carte grandit AVANT la fin du module : c'est tout l'enjeu.
  const snapshot = await page.locator('[data-knowledge-snapshot]').count();
  check('M2 : le module n’est pas terminé (pas d’« À retenir » de fin)', snapshot === 0, `count=${snapshot}`);

  await page.locator('[data-km-trigger]').click();
  await settle(page);
  const inMap = await page.locator('[data-km-item="image"]').count();
  check('M2 : « image » est DANS la carte dès que la brique l’a posée', inMap >= 1, `count=${inMap}`);
  const leaked = await page.locator('[data-km-item="fonction-affine"]').count();
  check('M2 : aucune connaissance d’un module plus loin ne fuite', leaked === 0, `count=${leaked}`);
  await ctx.close();
}

/* ── M5 : les modules validés donnent leur carte ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/lineaire-affine-ou-ni-lun-ni-lautre`, ['0','1','2','3','4'], { tag: 'm5' });
  await settle(page);
  await page.locator('[data-km-trigger]').click();
  await settle(page);
  for (const id of ['image', 'antecedent', 'notation-fx', 'tableau-de-valeurs', 'representation-graphique']) {
    const n = await page.locator(`[data-km-item="${id}"]`).count();
    check(`M5 : « ${id} » acquis des modules précédents`, n >= 1, `count=${n}`);
  }
  const future = await page.locator('[data-km-item="modeliser"]').count();
  check('M5 : la méthode du module 7 ne fuite pas', future === 0, `count=${future}`);
  await ctx.close();
}

/* ── Mobile : la brique tient dans l’écran ── */
{
  const { ctx, page } = await o(browser, `${LESSON}/retrouver-la-regle`, ['0','1','2','3','4','5'], { tag: 'mobile', mobile: true });
  await settle(page);
  const brick = page.locator('[data-knowledge-brick="methode-retrouver-a-b"]').first();
  const n = await brick.count();
  check('mobile : la brique de méthode est présente', n === 1, `count=${n}`);
  if (n) {
    const box = await brick.boundingBox();
    check('mobile : la brique ne déborde pas de l’écran', box && box.width <= 375, `w=${box?.width}`);
  }
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  check('mobile : pas de défilement horizontal', scrollW <= 375 + 1, `scrollWidth=${scrollW}`);
  await ctx.close();
}

await browser.close();
summary();

