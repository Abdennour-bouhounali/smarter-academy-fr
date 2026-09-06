// Carte des connaissances — Théorème de Thalès 3e.
//
// « Sécantes » et la configuration elle-même n'apparaissaient que dans les
// options d'un QCM et dans le footer : l'élève devait reconnaître une
// définition qu'il n'avait jamais lue. Ce test vérifie qu'elles sont posées
// avant la question qui les exige, et que la carte grandit à ce moment-là.
//
// Run: node apps/web/e2e/lesson-kit/3e-thales-carte.mjs   (vite on :5251, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/college/3e/espace_geometrie/thales-3e`;
const KEY = 'u_anon_smarter_lesson_thales-3e';
const o = (b, u, seed, x = {}) => open(b, u, { key: KEY, completedModules: seed, ...x });

const browser = await launch();

{
  const { ctx, page } = await o(browser, LESSON, [], { tag: 'index' });
  await settle(page);
  const n = await page.locator('[data-km-item]').count();
  check('index : la carte est vide au début', n === 0, `count=${n}`);
  await ctx.close();
}

{
  const { ctx, page } = await o(browser, `${LESSON}/reconnaitre-la-configuration`, ['0', '1'], { tag: 'm2' });
  await settle(page);
  for (const id of ['droites-secantes', 'configuration-thales']) {
    const n = await page.locator(`[data-knowledge-brick="${id}"]`).count();
    check(`M2 : « ${id} » posé avant la question`, n === 1, `count=${n}`);
  }
  const brick = await page.locator('[data-knowledge-brick="droites-secantes"]').boundingBox();
  const q = await page.getByText(/Qu’ont en commun ces deux figures/).boundingBox();
  check('M2 : la brique précède la question à l’écran', brick && q && brick.y < q.y, `brick=${brick?.y} q=${q?.y}`);

  await page.locator('[data-km-trigger]').click();
  await settle(page);
  const inMap = await page.locator('[data-km-item="configuration-thales"]').count();
  check('M2 : la configuration entre dans la carte dès qu’elle est posée', inMap >= 1, `count=${inMap}`);
  const leak = await page.locator('[data-km-item="reciproque-thales"]').count();
  check('M2 : la réciproque (module 5) ne fuite pas', leak === 0, `count=${leak}`);
  await ctx.close();
}

{
  const { ctx, page } = await o(browser, `${LESSON}/et-si-ce-nest-pas-parallele`, ['0','1','2','3','4'], { tag: 'm5', mobile: true });
  await settle(page);
  const locked = await page.locator('[data-knowledge-brick="reciproque-thales"]').count();
  check('M5 mobile : rien n’est posé tant que l’étape 1 n’est pas faite', locked === 0, `count=${locked}`);
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  check('M5 mobile : pas de défilement horizontal', scrollW <= 376, `scrollWidth=${scrollW}`);
  await ctx.close();
}

await browser.close();
summary();
