import { launch, open, check, summary, settle, SHOT_DIR } from '../_2nde-helpers.mjs';
const browser=await launch();
const {ctx,page}=await open(browser,'http://localhost:5250/courses/college/6e/nombres_calculs/resolution-problemes/1',
  {key:'u_anon_smarter_lesson_resolution-problemes',completedModules:['0'],tag:'f'});
await settle(page,1200);
const h=page.locator('[role="slider"][aria-label*="Taille"]');
await h.focus(); await settle(page,300);
// Le contour du navigateur doit être neutralisé sur la zone transparente…
const outline=await h.evaluate(el=>getComputedStyle(el).outlineStyle);
check('pas de contour noir du navigateur sur la poignée', outline==='none', outline);
// …mais un indicateur de focus VISIBLE doit exister (l'anneau dessiné).
const ring=await page.locator('circle[stroke="#14b8a6"][fill="none"]').count();
check('un anneau de focus visible est dessiné à la place', ring>0);
await page.locator('[data-sl-groups]').first().screenshot({path:`${SHOT_DIR}rp-focus.png`});
await ctx.close(); await browser.close(); summary();
