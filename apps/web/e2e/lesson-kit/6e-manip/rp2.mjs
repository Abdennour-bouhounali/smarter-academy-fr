import { launch, open, check, summary, settle, noHScroll, smallTargets, SHOT_DIR } from '../_2nde-helpers.mjs';
const URL='http://localhost:5250/courses/college/6e/nombres_calculs/resolution-problemes/1';
const KEY='u_anon_smarter_lesson_resolution-problemes';
const st = (p) => p.locator('[data-sl-groups]').first();
const browser=await launch();
const {ctx,page}=await open(browser,URL,{key:KEY,completedModules:['0'],tag:'rp'});
await settle(page,1200);
const lab=st(page);
check('la manipulation est présente', await lab.count()>0);
check('plus aucune barre-curseur sous la figure', !(await page.locator('input[type=range]').count()));

// ── Prise 1 : le BORD DROIT (nombre de classes), glissement souris réel.
const hG=page.locator('[role="slider"][aria-label*="Nombre de"]');
check('poignée « nombre de classes » sur la figure', await hG.count()>0);
const g0=await lab.getAttribute('data-sl-groups');
let bb=await hG.boundingBox();
await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2);
await page.mouse.down(); await page.mouse.move(bb.x+bb.width/2+150, bb.y+bb.height/2, {steps:14}); await page.mouse.up();
await settle(page,400);
const g1=await lab.getAttribute('data-sl-groups');
check('tirer le bord droit change le nombre de classes', g0!==g1, `${g0} → ${g1}`);

// ── Prise 2 : le BORD BAS (taille d'une classe), glissement souris réel.
const vG=page.locator('[role="slider"][aria-label*="Taille"]');
check('poignée « taille d’une classe » sur la figure', await vG.count()>0);
const p0=await lab.getAttribute('data-sl-per');
bb=await vG.boundingBox();
await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2);
await page.mouse.down(); await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2+110, {steps:14}); await page.mouse.up();
await settle(page,400);
const p1=await lab.getAttribute('data-sl-per');
check('tirer le bord bas change la taille de la classe', p0!==p1, `${p0} → ${p1}`);
check('tirer vers le BAS agrandit la classe', Number(p1)>Number(p0), `${p0} → ${p1}`);

// ── Clavier sur les deux prises.
await hG.focus(); await page.keyboard.press('ArrowRight'); await settle(page,220);
check('clavier : le bord droit répond', (await lab.getAttribute('data-sl-groups'))!==g1);
await vG.focus(); await page.keyboard.press('ArrowDown'); await settle(page,220);
check('clavier : le bord bas répond', (await lab.getAttribute('data-sl-per'))!==p1);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({path:`${SHOT_DIR}rp-m1-after.png`, fullPage:true});
await ctx.close();

const m=await open(browser,URL,{key:KEY,completedModules:['0'],mobile:true,tag:'mob'});
await settle(m.page,1200);
check('mobile 375px : pas de débordement', await noHScroll(m.page));
const small=await smallTargets(m.page);
check('mobile : zones tactiles ≥44px', small.length===0, JSON.stringify(small.slice(0,3)));
await m.ctx.close();
await browser.close(); summary();
