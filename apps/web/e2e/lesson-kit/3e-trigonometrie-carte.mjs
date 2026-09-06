// Carte des connaissances — Trigonométrie 3e.
//
// « Opposé » et « adjacent » étaient demandés avant d'être définis : leur sens
// n'existait que dans les `correction`, après la réponse. Ce test vérifie que
// les rôles sont posés par des briques après le geste qui les fait voir
// (l'échange des étiquettes), et avant la première question qui les exige.
//
// Run: node apps/web/e2e/lesson-kit/3e-trigonometrie-carte.mjs   (vite on :5251, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';
const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON=`${BASE}/courses/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e`;
const KEY='u_anon_smarter_lesson_trigonometrie-triangle-rectangle-3e';
const o=(b,u,seed,x={})=>open(b,u,{key:KEY,completedModules:seed,...x});
const browser=await launch();
{
  const {ctx,page}=await o(browser,`${LESSON}/nommer-les-cotes`,['0','1'],{tag:'m2'});
  await settle(page);
  const before=await page.locator('[data-knowledge-brick]').count();
  check('M2 : aucune brique avant d’avoir changé d’angle', before===0, `count=${before}`);
  const askedBefore=await page.getByText(/Quel côté est OPPOSÉ/).count();
  check('M2 : la question sur l’opposé n’est pas encore posée', askedBefore===0, `count=${askedBefore}`);
  await page.getByRole('button',{name:/Étudier l’angle en C/}).click();
  await page.waitForTimeout(800); await settle(page);
  for (const id of ['hypotenuse','cote-oppose','cote-adjacent','mem-roles-relatifs']) {
    const n=await page.locator(`[data-knowledge-brick="${id}"]`).count();
    check(`M2 : « ${id} » posé après le geste`, n===1, `count=${n}`);
  }
  await page.locator('[data-km-trigger]').click(); await settle(page);
  const inMap=await page.locator('[data-km-item="cote-oppose"]').count();
  check('M2 : les rôles entrent dans la carte immédiatement', inMap>=1, `count=${inMap}`);
  const leak=await page.locator('[data-km-item="sinus-cosinus-tangente"]').count();
  check('M2 : les noms du module 4 ne fuitent pas', leak===0, `count=${leak}`);
  await ctx.close();
}
{
  const {ctx,page}=await o(browser,`${LESSON}/trois-rapports-trois-noms`,['0','1','2','3'],{tag:'m4'});
  await settle(page);
  const n=await page.locator('[data-knowledge-brick="sinus-cosinus-tangente"]').count();
  check('M4 : les trois noms sont posés avant le QCM', n===1, `count=${n}`);
  const q=await page.getByText(/Quel rapport le SINUS/).count();
  check('M4 : le QCM demande d’utiliser le nom, non de le deviner', q===1, `count=${q}`);
  await ctx.close();
}
await browser.close(); summary();
