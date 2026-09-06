// Carte des connaissances — Statistiques 3e.
//
// Tout le vocabulaire (étendue, médiane, fréquence, effectif) était posé dans
// des `explain`, donc après la question qui l'employait — « étendue »
// apparaissait pour la première fois DANS la demande. Ce test vérifie que
// chaque notion est établie par une brique au moment du geste.
//
// Run: node apps/web/e2e/lesson-kit/3e-statistiques-carte.mjs   (vite :5251, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/college/3e/donnees_probabilites/statistiques-3e`;
const KEY = 'u_anon_smarter_lesson_statistiques-3e';
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
  // Module 3 : « étendue » ne doit pas être lisible avant la brique.
  const { ctx, page } = await o(browser, `${LESSON}/la-valeur-du-milieu`, ['0', '1', '2'], { tag: 'm3' });
  await settle(page);
  const brick = await page.locator('[data-knowledge-brick="etendue"]').count();
  const visible = await page.getByText(/étendue/i).count();
  check('M3 : ni la brique ni le mot « étendue » avant le geste', brick === 0 && visible === 0, `brick=${brick} texte=${visible}`);

  await page.locator('[data-km-trigger]').click();
  await settle(page);
  const leak = await page.locator('[data-km-item="etendue"]').count();
  check('M3 : « étendue » n’est pas encore sur la carte', leak === 0, `count=${leak}`);
  await ctx.close();
}

{
  // Une fois le module 3 validé, la connaissance est acquise et visible.
  const { ctx, page } = await o(browser, `${LESSON}/la-serie-elastique`, ['0','1','2','3'], { tag: 'm4' });
  await settle(page);
  await page.locator('[data-km-trigger]').click();
  await settle(page);
  const known = await page.locator('[data-km-item="etendue"]').count();
  check('M4 : « étendue » est acquise une fois le module 3 validé', known >= 1, `count=${known}`);
  const future = await page.locator('[data-km-item="choisir-indicateur"]').count();
  check('M4 : la matière d’un module plus loin ne fuite pas', future === 0, `count=${future}`);
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  check('M4 : pas de défilement horizontal', scrollW <= 1281, `scrollWidth=${scrollW}`);
  await ctx.close();
}

await browser.close();
summary();
