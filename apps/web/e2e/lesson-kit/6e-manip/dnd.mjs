import { launch, open, check, summary, settle, body, noHScroll } from '../_2nde-helpers.mjs';
const URL='http://localhost:5250/courses/college/6e/nombres_calculs/quatre-operations/diviser';
const KEY='u_anon_smarter_lesson_quatre-operations';
const browser=await launch();
const {ctx,page}=await open(browser,URL,{key:KEY,completedModules:['0','1','2','3','4'],tag:'m5'});
await settle(page,1000);
const pile=page.locator('[style*="touch-action"]').first();
const friend=page.locator('[data-friend="0"]');
check('les amis sont des zones de dépôt', await friend.count()>0);
const before=await friend.first().textContent();
// Vrai glissement : on prend une bille du tas et on la lâche sur l'ami 0.
const pb=await page.locator('.bg-amber-400').first().boundingBox();
const fb=await friend.first().boundingBox();
if (pb && fb){
  await page.mouse.move(pb.x+pb.width/2, pb.y+pb.height/2);
  await page.mouse.down();
  await page.mouse.move(fb.x+fb.width/2, fb.y+fb.height/2, {steps:14});
  await page.mouse.up();
  await settle(page,400);
}
const after=await friend.first().textContent();
check('le glisser-déposer donne une bille', before!==after, `${before} → ${after}`);
// Le clic doit continuer à fonctionner (secours + clavier).
await friend.first().click(); await settle(page,300);
const after2=await friend.first().textContent();
check('le clic fonctionne toujours', after!==after2, `${after} → ${after2}`);
check('pas de défilement horizontal', await noHScroll(page));
await ctx.close(); await browser.close(); summary();
