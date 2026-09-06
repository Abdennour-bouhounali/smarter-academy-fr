// Carte des connaissances — Proportionnalité 3e.
//
// Les six modules posaient toute leur matière dans leur footer, donc après
// leurs questions. Ce test vérifie que chaque notion est établie par une brique
// au moment du geste, et que la carte grandit à cet instant.
//
// Run: node apps/web/e2e/lesson-kit/3e-proportionnalite-carte.mjs   (vite :5251, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/college/3e/donnees_probabilites/proportionnalite-3e`;
const KEY = 'u_anon_smarter_lesson_proportionnalite-3e';
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
  const { ctx, page } = await o(browser, `${LESSON}/le-nombre-cache`, ['0', '1'], { tag: 'm2' });
  await settle(page);
  const before = await page.locator('[data-knowledge-brick="coefficient-proportionnalite"]').count();
  check('M2 : le coefficient n’est pas nommé avant d’avoir révélé les rapports', before === 0, `count=${before}`);

  const cells = page.locator('button:has-text("?")');
  const total = await cells.count();
  for (let i = 0; i < total; i += 1) {
    await cells.nth(0).click().catch(() => {});
    await page.waitForTimeout(220);
  }
  await settle(page);

  const after = await page.locator('[data-knowledge-brick="coefficient-proportionnalite"]').count();
  check('M2 : le coefficient est posé une fois les rapports révélés', after === 1, `count=${after}`);

  await page.locator('[data-km-trigger]').click();
  await settle(page);
  const inMap = await page.locator('[data-km-item="coefficient-proportionnalite"]').count();
  check('M2 : il entre dans la carte à cet instant', inMap >= 1, `count=${inMap}`);
  const leak = await page.locator('[data-km-item="coefficient-multiplicateur"]').count();
  check('M2 : la matière du module 5 ne fuite pas', leak === 0, `count=${leak}`);
  await ctx.close();
}

{
  const { ctx, page } = await o(browser, `${LESSON}/le-labo-des-sciences`, ['0','1','2','3','4','5'], { tag: 'm6', mobile: true });
  await settle(page);
  const n = await page.locator('[data-knowledge-brick="grandeurs-quotient"]').count();
  check('M6 mobile : les trois grandeurs quotient sont posées avant la question', n === 1, `count=${n}`);
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  check('M6 mobile : pas de défilement horizontal', scrollW <= 376, `scrollWidth=${scrollW}`);
  await ctx.close();
}

await browser.close();
summary();
