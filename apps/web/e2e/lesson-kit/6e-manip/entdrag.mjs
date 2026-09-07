import { launch, open, check, summary, settle, body } from '../_2nde-helpers.mjs';
const browser=await launch();
const {ctx,page}=await open(browser,'http://localhost:5250/courses/college/6e/nombres_calculs/nombres-entiers/1',
  {key:'u_anon_smarter_lesson_nombres-entiers',completedModules:['0'],tag:'d'});
await settle(page,1300);
const before=await body(page);
check('le plateau part de 0', /TON NOMBRE\s*0|0\s*objet sur le plateau/.test(before.replace(/\s+/g,' ')));
// VRAI glissement : prendre la pièce « centaine » et la lâcher sur la colonne des centaines.
const piece=page.locator('text=centaine').first();
const zone=page.locator('[data-drop-zone]').first();
const pb=await piece.boundingBox(), zb=await zone.boundingBox();
check('pièce et zone de dépôt présentes', !!pb && !!zb);
if (pb && zb){
  await page.mouse.move(pb.x+pb.width/2, pb.y+pb.height/2);
  await page.mouse.down();
  await page.mouse.move(zb.x+zb.width/2, zb.y+zb.height/2, {steps:16});
  await page.mouse.up();
  await settle(page,500);
}
const after=await body(page);
check('le glisser-déposer pose la pièce', before!==after);
check('le nombre affiché a changé', /100/.test(after.replace(/\s+/g,' ')), after.replace(/\s+/g,' ').match(/TON NOMBRE\s*\S+/)?.[0]);
// Le chemin clavier doit rester disponible.
const poser=page.getByRole('button',{name:/Poser ici/}).first();
check('le chemin « Poser ici » existe toujours', await poser.count()>0);
await ctx.close(); await browser.close(); summary();
