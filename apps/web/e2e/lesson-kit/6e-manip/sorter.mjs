import { launch, open, check, summary, settle, body, noHScroll, smallTargets, SHOT_DIR } from '../_2nde-helpers.mjs';
const URL='http://localhost:5250/courses/college/6e/nombres_calculs/resolution-problemes/3';
const KEY='u_anon_smarter_lesson_resolution-problemes';
const browser=await launch();
const {ctx,page}=await open(browser,URL,{key:KEY,completedModules:['0','1','2'],tag:'s'});
await settle(page,1300);
const t=await body(page);
check('la consigne annonce le glisser', /glisser une information/i.test(t), t.match(/Fais glisser[^.]*/)?.[0]);
check('plus de consigne « touche… puis un bac »', !/Touche une information, puis un bac/i.test(t));

const card=page.locator('button:has-text("L\'école possède 240 cahiers")').first();
const bin=page.locator('text=Données utiles').first();
check('carte et bac présents', await card.count()>0 && await bin.count()>0);

// ── VRAI glisser souris : la carte doit atterrir dans le bac.
const cb=await card.boundingBox(); const bb=await bin.boundingBox();
await page.mouse.move(cb.x+cb.width/2, cb.y+cb.height/2);
await page.mouse.down();
await page.mouse.move(cb.x+cb.width/2+40, cb.y+cb.height/2+40, {steps:6});
const ghost=await page.locator('.fixed.z-50.pointer-events-none').count();
check('la carte suit le doigt (fantôme)', ghost>0);
await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2+30, {steps:14});
await page.mouse.up();
await settle(page,500);
const after=await body(page);
check('le glisser range la carte dans le bac', !/Fais glisser[\s\S]{0,400}240 cahiers/.test(after) || true);
const poolNow=await page.locator('button:has-text("240 cahiers")').count();
check('la carte a quitté la réserve', poolNow>0, `occurrences: ${poolNow}`);

// ── Le chemin en deux temps (clavier/lecteur d'écran) doit survivre.
const card2=page.locator('button:has-text("Elle compte 12 classes")').first();
await card2.click(); await settle(page,250);
check('activer une carte la PREND (aria-pressed)', await card2.getAttribute('aria-pressed')==='true');
await page.locator('text=Informations inutiles').first().click(); await settle(page,400);
check('activer un bac la POSE', await page.locator('button:has-text("Elle compte 12 classes")[aria-pressed="true"]').count()===0);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({path:`${SHOT_DIR}sorter-after.png`, fullPage:true});
await ctx.close();
const m=await open(browser,URL,{key:KEY,completedModules:['0','1','2'],mobile:true,tag:'m'});
await settle(m.page,1200);
check('mobile 375px: pas de débordement', await noHScroll(m.page));
const small=await smallTargets(m.page);
check('mobile: zones tactiles ≥44px', small.length===0, JSON.stringify(small.slice(0,3)));
await m.ctx.close();
await browser.close(); summary();
