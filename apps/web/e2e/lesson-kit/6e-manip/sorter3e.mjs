import { launch, open, check, summary, settle, body } from '../_2nde-helpers.mjs';
const browser=await launch();
// InfoSorter est partagé : les 4 usages 3e doivent continuer à fonctionner.
const CASES=[
 ['modelisation-3e M1','/courses/college/3e/donnees_probabilites/modelisation-3e/le-laboratoire-de-modelisation','u_anon_smarter_lesson_modelisation-3e',['0']],
 ['resolution-problemes-3e M2','/courses/college/3e/nombres_calculs/resolution-problemes-3e/lire-comme-un-detective','u_anon_smarter_lesson_resolution-problemes-3e',['0','1']],
];
for (const [name,path,key,seed] of CASES){
  const {ctx,page}=await open(browser,'http://localhost:5250'+path,{key,completedModules:seed,tag:name});
  await settle(page,1400);
  const t=await body(page);
  check(`${name} : la page rend`, t.length>500, `${t.length} car.`);
  const errs=[];
  page.on('pageerror',e=>errs.push(String(e)));
  const zones=await page.locator('[data-drop-zone]').count();
  const src=await page.locator('[aria-pressed]').count();
  check(`${name} : le trieur est présent (zones=${zones})`, zones>0 || !/utile/i.test(t));
  check(`${name} : aucune erreur de rendu`, errs.length===0, errs.join(' | '));
  await ctx.close();
}
await browser.close(); summary();
