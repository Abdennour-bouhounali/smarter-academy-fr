// Carte des connaissances — DIMENSIONNEMENT (tiroir / plein écran), toutes coques.
//
// Invariants vérifiés, aux six combinaisons coque × largeur :
//   tiroir   : bord droit fixe sur le viewport de la LEÇON, bord gauche seul redimensionnable,
//              haut ancré, aucune redimension verticale, hauteur ⊆ viewport leçon
//   plein    : == viewport de la leçon sur les quatre bords, en-tête jamais couvert,
//              aucune API fullscreen navigateur, pas de défilement horizontal
//   retour   : la largeur mémorisée du tiroir est restaurée
//
// La coque dépend de l'authentification (CourseLayout → StudentLayout | MainLayout) : la sidebar
// élève décale le viewport de la leçon, d'où le mock de /auth/me.
//
// Run: node apps/web/e2e/lesson-kit/km-layout.mjs   (vite sur :5251)
import { chromium } from 'playwright';
const B=process.env.KIT_BASE||'http://localhost:5251';
const URL=`${B}/courses/lycee/seconde/geometrie/vecteurs-2nde/deux-nombres-suffisent`;
const KEY='u_anon_smarter_lesson_vecteurs-2nde';
let pass=0,fail=0;
const check=(n,c,d='')=>{ (c?pass++:fail++); console.log((c?'  ok  ':'FAIL  ')+n+(c?'':'   << '+d)); };
const browser=await chromium.launch({args:['--no-sandbox']});

async function scenario(tag, {auth, vp, collapsed=false}) {
  console.log('\n=== '+tag+' ===');
  const ctx=await browser.newContext({viewport:vp, hasTouch:vp.width<500, isMobile:vp.width<500});
  await ctx.addInitScript(([k,a,c])=>{
    localStorage.setItem(k, JSON.stringify({completedModules:['0','1','2','3'],completedExercises:[]}));
    if(a) localStorage.setItem('token','fake');
    if(c) localStorage.setItem('sidebarCollapsed','true');
    localStorage.removeItem('knowledgeMapExpanded');
  },[KEY,auth,collapsed]);
  const page=await ctx.newPage();
  if(auth) await page.route('**/auth/me', r=>r.fulfill({status:200,contentType:'application/json',
    body:JSON.stringify({success:true,user:{id:1,name:'T',email:'t@t.fr',role:'student',grade:{id:11,name:'2nde',slug:'seconde'}}})}));
  await page.goto(URL,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2600);

  const lessonBox = () => page.evaluate(()=>{
    const m=document.querySelector('main'); const cs=getComputedStyle(m); const r=m.getBoundingClientRect();
    const left=r.left+(parseFloat(cs.paddingLeft)||0), right=window.innerWidth-(r.right-(parseFloat(cs.paddingRight)||0));
    const hdr=document.getElementById('app-header');
    const top=Math.max(hdr?hdr.getBoundingClientRect().height:0,(parseFloat(cs.paddingTop)||0));
    const bottom=parseFloat(cs.paddingBottom)||0;
    return {left,right,top,bottom,width:window.innerWidth-left-right,height:window.innerHeight-top-bottom};
  });

  await page.locator('[data-km-trigger]').click(); await page.waitForTimeout(700);
  const L=await lessonBox();
  let p=await page.locator('#km-root').boundingBox();
  check('drawer: top anchored to lesson viewport top', Math.abs(p.y-L.top)<2, JSON.stringify({p,L}));
  check('drawer: right edge = lesson viewport right edge', Math.abs((p.x+p.width)-(vp.width-L.right))<2, JSON.stringify({p,L}));
  check('drawer: height within lesson viewport', p.height<=L.height+2, `${p.height} vs ${L.height}`);
  check('drawer: lesson still visible to the left', p.x>L.left-1 || vp.width<500, `x=${p.x} left=${L.left}`);

  // resize by dragging the LEFT edge
  const before=p.width;
  const handle=page.locator('#km-root .cursor-col-resize');
  if(await handle.count()){
    const hb=await handle.boundingBox();
    await page.mouse.move(hb.x+hb.width/2, hb.y+hb.height/2);
    await page.mouse.down(); await page.mouse.move(hb.x-140, hb.y+hb.height/2,{steps:12}); await page.mouse.up();
    await page.waitForTimeout(400);
    const p2=await page.locator('#km-root').boundingBox();
    const full = Math.abs(before - L.width) < 2; // déjà pleine largeur (mobile) : impossible d'élargir
    check('resize: left edge moved, width grew', full ? Math.abs(p2.width-before)<2 : p2.width>before+40, `${before}->${p2.width} full=${full}`);
    check('resize: right edge stayed fixed', Math.abs((p2.x+p2.width)-(p.x+p.width))<2);
    check('resize: top unchanged (no vertical resize)', Math.abs(p2.y-p.y)<2);
    p=p2;
  }
  const widthBeforeExpand=p.width;

  // expand
  const exp=page.locator('#km-root [data-km-view="expanded"]');
  if(await exp.count() && await exp.isVisible()){
    await exp.click(); await page.waitForTimeout(700);
    const e=await page.locator('#km-root').boundingBox();
    const L2=await lessonBox();
    check('expanded: left = lesson viewport left', Math.abs(e.x-L2.left)<2, JSON.stringify({e,L2}));
    check('expanded: width = lesson viewport width', Math.abs(e.width-L2.width)<2, `${e.width} vs ${L2.width}`);
    check('expanded: top = lesson viewport top (header intact)', Math.abs(e.y-L2.top)<2, `${e.y} vs ${L2.top}`);
    check('expanded: height = lesson viewport height', Math.abs(e.height-L2.height)<2, `${e.height} vs ${L2.height}`);
    check('expanded: does NOT cover the global header', e.y>=L2.top-0.5);
    check('expanded: no browser fullscreen', await page.evaluate(()=>document.fullscreenElement===null));
    check('expanded: no horizontal page scroll', await page.evaluate(()=>document.scrollingElement.scrollWidth<=window.innerWidth+1));
    // back to drawer
    await page.locator('#km-root [data-km-view="drawer"]').click(); await page.waitForTimeout(700);
    const d=await page.locator('#km-root').boundingBox();
    check('restore: drawer width preserved', Math.abs(d.width-widthBeforeExpand)<3, `${d.width} vs ${widthBeforeExpand}`);
    check('restore: right edge fixed again', Math.abs((d.x+d.width)-(vp.width-L2.right))<2);
  } else { console.log('  (expand control hidden at this width — mobile)'); }
  await ctx.close();
}

await scenario('anon desktop 1280', {auth:false, vp:{width:1280,height:900}});
await scenario('auth desktop 1440 (sidebar 256)', {auth:true, vp:{width:1440,height:900}});
await scenario('auth desktop collapsed sidebar', {auth:true, vp:{width:1440,height:900}, collapsed:true});
await scenario('narrow desktop 1024', {auth:true, vp:{width:1024,height:800}});
await scenario('tablet 820', {auth:true, vp:{width:820,height:1180}});
await scenario('mobile 375', {auth:true, vp:{width:375,height:667}});
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
