// Carte des connaissances — ORGANISATION DE L'INFORMATION (hiérarchie, révélation, impression).
//
//   révélation progressive : modules 1..N ⇒ exactement les items cumulés, rien de plus
//   hiérarchie             : strates IDÉES / PROPRIÉTÉS / MÉTHODES + bandeau « À RETENIR »
//   modes                  : navigation (structure), vue complète, vue détail, retour
//   impression             : bascule écran→impression, mêmes strates, aucun chrome de tiroir
//
// Run: node apps/web/e2e/lesson-kit/km-structure.mjs   (vite sur :5251)
import { chromium } from 'playwright';
const B=process.env.KIT_BASE||'http://localhost:5251';
const LESSON=`${B}/courses/lycee/seconde/geometrie/vecteurs-2nde`;
const KEY='u_anon_smarter_lesson_vecteurs-2nde';
const SLUG={4:'enchainer-les-deplacements',7:'problemes-de-geometrie',boss:'mission-finale-le-depot'};
const CONTRIB={1:['vecteur-deplacement','mem-deplacement'],2:['egalite-vecteurs','vecteur-nul','regle-vecteur-oppose','vocab-representant'],3:['coordonnees-vecteur','regle-coordonnees','regle-egalite-coordonnees','methode-calcul-coordonnees','vocab-base-orthonormee','mem-arrivee-moins-depart','mem-oppose','formule-coordonnees'],4:['regle-somme','vocab-relation-chasles','mem-chasles','formule-somme','formule-chasles'],5:['regle-produit-reel','regle-colineaire'],6:['methode-calcul-norme','methode-milieu','vocab-norme','formule-norme','formule-milieu'],7:['methode-parallelogramme','methode-deplacement-manquant','methode-alignement']};
const expectedAfter=n=>Object.entries(CONTRIB).filter(([m])=>+m<=n).flatMap(([,i])=>i).sort();
let pass=0,fail=0; const errs=[];
const check=(n,c,d='')=>{(c?pass++:fail++);console.log((c?'  ok  ':'FAIL  ')+n+(c?'':'   << '+d));};
const browser=await chromium.launch({args:['--no-sandbox']});

async function open(seed,slug,vp={width:1280,height:1600}){
  const ctx=await browser.newContext({viewport:vp,hasTouch:vp.width<500,isMobile:vp.width<500});
  await ctx.addInitScript(([k,m])=>localStorage.setItem(k,JSON.stringify({completedModules:m,completedExercises:[]})),[KEY,seed]);
  const page=await ctx.newPage();
  page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.goto(slug?`${LESSON}/${slug}`:LESSON,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500); return {ctx,page};
}
const ids=(page,sel)=>page.locator(sel).evaluateAll(e=>e.map(x=>x.getAttribute('data-km-item')));
async function drawer(page,mode='complete'){
  await page.locator('[data-km-trigger]').click(); await page.waitForTimeout(600);
  const t=page.locator(`#km-root button:has-text("${mode==='complete'?'Vue complète':'Navigation'}")`);
  if(await t.count()){await t.click();await page.waitForTimeout(400);}
}

/* progressive reveal: seeded through module N → exactly the cumulative set */
for (const n of [1,3,4,7]) {
  const seed=Array.from({length:n+1},(_,i)=>String(i));
  const {ctx,page}=await open(seed, SLUG[4]);
  await drawer(page);
  const got=(await ids(page,'#km-root [data-km-completeview] [data-km-item]')).sort();
  check(`M${n}: cumulative knowledge = exactly modules 1..${n}`, JSON.stringify(got)===JSON.stringify(expectedAfter(n)), `${got.length} vs ${expectedAfter(n).length}`);
  if(n===7){
    // hierarchy present
    check('M7: strata rendered (hierarchy, not a flat card list)', (await page.locator('#km-root [data-km-stratum]').count())>=3);
    check('M7: À-retenir highlight band present', (await page.locator('#km-root [data-km-highlight]').count())>=1);
    check('M7: KaTeX preserved in complete view', (await page.locator('#km-root .katex').count())>10);
    // navigation mode
    await page.locator('#km-root button:has-text("Navigation")').click(); await page.waitForTimeout(500);
    check('M7: navigation mode shows structured hierarchy', (await page.locator('#km-root [data-km-structured] [data-km-stratum]').count())>=3);
    check('M7: progression trail present', (await page.locator('#km-root [data-km-progression]').count())===1);
    // detail view
    const first=page.locator('#km-root [data-km-structured] [data-km-item]').first();
    const t=await first.textContent(); await first.click(); await page.waitForTimeout(500);
    check('M7: detail view opens for an item', (await page.locator('#km-root button:has-text("Retour à la carte")').count())===1, t);
    await page.locator('#km-root button:has-text("Retour à la carte")').click(); await page.waitForTimeout(400);
    check('M7: back returns to the structure', (await page.locator('#km-root [data-km-stratum]').count())>=3);
    // print
    await page.locator('#km-root button:has-text("Vue complète")').click(); await page.waitForTimeout(400);
    await page.emulateMedia({media:'print'}); await page.waitForTimeout(500);
    const sh=await page.locator('#km-root .sa-screen-view').evaluate(e=>getComputedStyle(e).display==='none');
    const pv=await page.locator('#km-root .sa-print-view').evaluate(e=>getComputedStyle(e).display!=='none');
    check('M7: print CSS swaps screen → print view', sh&&pv);
    const ptxt=(await page.locator('#km-root .sa-print-view').textContent()).replace(/\s+/g,' ');
    check('M7: print keeps the hierarchy labels', /IDÉES/.test(ptxt)&&/PROPRIÉTÉS/.test(ptxt)&&/MÉTHODES/.test(ptxt));
    check('M7: print shows À RETENIR hero', /À Retenir/i.test(ptxt));
    const noprint=await page.locator('#km-root [data-km-noprint]').evaluateAll(e=>e.every(x=>getComputedStyle(x).display==='none'));
    check('M7: no drawer chrome leaks into print', noprint);
    await page.screenshot({path:'e2e/lesson-kit/shots/km-print-new.png',fullPage:true});
    await page.emulateMedia({media:'screen'});
  }
  await ctx.close();
}

/* boss synthèse still renders the complete map inline */
{
  const {ctx,page}=await open(['0','1','2','3','4','5','6','7'], SLUG.boss);
  const cards=await ids(page,'[data-knowledge-snapshot="complete"] [data-km-completeview] [data-km-item]');
  if(cards.length){
    check('boss: inline complete map still renders all items', cards.length===29, `${cards.length}`);
    check('boss: no inline print button', (await page.locator('[data-knowledge-snapshot="complete"]').getByRole('button',{name:'Imprimer ma carte',exact:true}).count())===0);
  } else console.log('  (boss synthèse not reached without taking the test — skipped)');
  await ctx.close();
}
check('no console/page errors', errs.length===0, errs.slice(0,3).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
