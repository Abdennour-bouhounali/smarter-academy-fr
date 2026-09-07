import { launch, open, check, summary, settle, noHScroll, smallTargets, body, SHOT_DIR } from '../_2nde-helpers.mjs';
const URL='http://localhost:5250/courses/college/6e/nombres_calculs/quatre-operations/multiplier';
const KEY='u_anon_smarter_lesson_quatre-operations';
const browser=await launch();
const {ctx,page}=await open(browser,URL,{key:KEY,completedModules:['0','1','2','3'],tag:'m4'});
await settle(page,900);
for (let i=0;i<4;i++){ const b=page.locator('button[aria-label="Poser une boîte de 3 objets"]'); if(await b.count()){await b.click();await settle(page,200);} }
await page.locator('button:has-text("Continuer")').first().click().catch(()=>{}); await settle(page,500);
const corner=page.locator('[role="slider"][aria-label*="Coin"]');
if (await corner.count()){ await corner.focus();
  for (const k of ['ArrowRight','ArrowDown','ArrowRight','ArrowDown','ArrowLeft','ArrowUp']){ await page.keyboard.press(k); await settle(page,170);} }
await page.getByRole('button', { name: /exploré la grille/ }).click().catch(()=>{}); await settle(page,700);

const cutter=page.locator('[role="slider"][aria-label="Trait de coupe du rectangle"]');
check('le trait de coupe existe', await cutter.count()>0);
if (await cutter.count()){
  const before=await cutter.getAttribute('aria-valuetext');
  await cutter.focus();
  for (let i=0;i<3;i++){ await page.keyboard.press('ArrowRight'); await settle(page,180); }
  const after=await cutter.getAttribute('aria-valuetext');
  check('déplacer le trait change les deux morceaux', before!==after, `${before} → ${after}`);
  const t=await body(page);
  check('la somme des morceaux reste 161', /161/.test(t));
  await page.keyboard.press('End'); await settle(page,220);
  for (let i=0;i<2;i++){ await page.keyboard.press('ArrowLeft'); await settle(page,170); }
  const vt=await cutter.getAttribute('aria-valuetext');
  check('la coupe atteint bien 20 colonnes', /après 20 colonnes/.test(vt||''), vt);
  const t2=await body(page);
  check('la coupe ronde 20|3 est reconnue', /140/.test(t2) || /coupe utile/.test(t2));
}
check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({path:`${SHOT_DIR}q4-m4-split.png`, fullPage:true});
await ctx.close();
const m=await open(browser,URL,{key:KEY,completedModules:['0','1','2','3'],mobile:true,tag:'mm'});
await settle(m.page,900);
check('mobile 375px: pas de débordement', await noHScroll(m.page));
const small=await smallTargets(m.page);
check('mobile: zones tactiles ≥44px', small.length===0, JSON.stringify(small.slice(0,3)));
await m.ctx.close();
await browser.close(); summary();
