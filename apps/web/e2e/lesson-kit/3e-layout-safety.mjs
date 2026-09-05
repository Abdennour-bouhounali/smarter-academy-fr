import { chromium } from 'playwright';

const BASE = 'http://localhost:5213/courses/college/3e/nombres_calculs';
const results = [];
const check = (n, ok, d='') => { results.push({n, ok}); console.log(`${ok?'PASS':'FAIL'} ${n}${ok?'':' — '+d}`); };

// Measures text/label collisions and container overflow inside a manipulation root.
async function scan(page, label) {
  return page.evaluate((label) => {
    const out = { overlaps: [], clipped: [], overflow: [] };
    // SVG text pairs
    for (const svg of document.querySelectorAll('svg')) {
      const texts = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim());
      const vb = svg.viewBox.baseVal;
      // getBBox() is LOCAL space (ancestor transforms not applied). Convert every
      // box to the svg's own user space before comparing with the viewBox, or a
      // label centred on its group origin looks "clipped" when it is fine.
      const boxOf = (el) => {
        let bb; try { bb = el.getBBox(); } catch { return null; }
        const m = el.getCTM && svg.getCTM ? el.getCTM() : null;
        const sm = svg.getCTM ? svg.getCTM() : null;
        if (!m || !sm) return bb;
        const rel = sm.inverse().multiply(m);
        const pt = (x,y) => { const p = svg.createSVGPoint(); p.x=x; p.y=y; return p.matrixTransform(rel); };
        const c = [pt(bb.x,bb.y), pt(bb.x+bb.width,bb.y), pt(bb.x,bb.y+bb.height), pt(bb.x+bb.width,bb.y+bb.height)];
        const xs = c.map(q=>q.x), ys = c.map(q=>q.y);
        return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs)-Math.min(...xs), height: Math.max(...ys)-Math.min(...ys) };
      };
      for (let i=0;i<texts.length;i++){
        const bb = boxOf(texts[i]); if (!bb) continue;
        if (vb && vb.width) {
          if (bb.x < vb.x-0.5 || bb.y < vb.y-0.5 || bb.x+bb.width > vb.x+vb.width+0.5 || bb.y+bb.height > vb.y+vb.height+0.5)
            out.clipped.push(`"${texts[i].textContent.trim()}" bbox(${bb.x.toFixed(0)},${bb.y.toFixed(0)},${bb.width.toFixed(0)}x${bb.height.toFixed(0)}) vs viewBox ${vb.width}x${vb.height}`);
        }
        for (let j=i+1;j<texts.length;j++){
          const cb = boxOf(texts[j]); if (!cb) continue;
          const ox = Math.min(bb.x+bb.width, cb.x+cb.width) - Math.max(bb.x, cb.x);
          const oy = Math.min(bb.y+bb.height, cb.y+cb.height) - Math.max(bb.y, cb.y);
          if (ox > 1.5 && oy > 1.5)
            out.overlaps.push(`"${texts[i].textContent.trim()}" ∩ "${texts[j].textContent.trim()}" (${ox.toFixed(1)}x${oy.toFixed(1)})`);
        }
      }
    }
    // horizontal page overflow
    if (document.scrollingElement.scrollWidth > window.innerWidth + 1)
      out.overflow.push(`page ${document.scrollingElement.scrollWidth} > ${window.innerWidth}`);
    return out;
  }, label);
}

async function drive(page, name, selector, times) {
  // click a control `times` times (drives a manipulation toward an extreme)
  const btns = page.locator(selector);
  const n = await btns.count();
  if (!n) return false;
  for (let i=0;i<times;i++) await btns.last().click({ force:true }).catch(()=>{});
  await page.waitForTimeout(350);
  return true;
}

const browser = await chromium.launch({ args:['--no-sandbox'] });

const CASES = [
  { key:'equations-produit', mod:'carre-contre-rectangle', seed:['0','1','2','3','4','5'], name:'SquareVsRectangle',
    push: async (p) => { for (const v of ['8','0','0.5']) { const c = p.locator(`button:has-text("${v}")`).first(); if (await c.count()) await c.click({force:true}).catch(()=>{}); await p.waitForTimeout(250);} } },
  { key:'equations-produit', mod:'le-scanner-de-produit', seed:['0','1','2','3','4'], name:'ProductScanner',
    push: async (p) => { await drive(p, 'button[aria-label*="Diminuer"], button:has-text("−")', 14); await drive(p, 'button[aria-label*="Augmenter"], button:has-text("+")', 28); } },
  { key:'multiples-diviseurs', mod:'le-rectangle-detecteur', seed:['0','1','2','3'], name:'RectangleArray',
    push: async (p) => { await drive(p, 'button:has-text("+")', 12); } },
  { key:'puissances-3e', mod:'la-virgule-qui-glisse', seed:['0','1','2','3'], name:'DecimalShifter',
    push: async (p) => { await drive(p, 'button:has-text("−")', 10); await drive(p, 'button:has-text("+")', 20); } },
  { key:'racines-carrees-3e', mod:'le-carre-a-reconstruire', seed:['0','1','2'], name:'SquareLab',
    push: async (p) => { await drive(p, 'button:has-text("+")', 40); await drive(p, 'button:has-text("−")', 60); } },
  { key:'nombres-rationnels', mod:'la-meme-decoupe', seed:['0','1','2','3'], name:'RationalBar',
    push: async (p) => { await drive(p, 'button:has-text("×3")', 4); await drive(p, 'button:has-text("×2")', 4); } },
  { key:'calcul-litteral-algebrique', mod:'le-rectangle-daire', seed:['0','1','2','3'], name:'AlgebraRect',
    push: async (p) => { await drive(p, 'button', 3); } },
];

for (const vp of [{w:1280,h:1400,tag:'desktop'},{w:375,h:667,tag:'mobile'}]) {
  for (const c of CASES) {
    const ctx = await browser.newContext({ viewport:{width:vp.w,height:vp.h}, hasTouch: vp.tag==='mobile', isMobile: vp.tag==='mobile' });
    const page = await ctx.newPage();
    await page.addInitScript(([k,m])=>{ if(!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({completedModules:m, completedExercises:[]})); },
      [`u_anon_smarter_lesson_${c.key}`, c.seed]);
    await page.goto(`${BASE}/${c.key}/${c.mod}`, { waitUntil:'domcontentloaded' });
    await page.waitForFunction(()=>!/Chargement de Smarter Academy/.test(document.body.innerText), null, {timeout:15000}).catch(()=>{});
    await page.waitForTimeout(900);
    await c.push(page).catch(()=>{});
    await page.waitForTimeout(600); // let layout settle before measuring (§17bis)
    const r = await scan(page, c.name);
    const tag = `${c.name} [${vp.tag}]`;
    check(`${tag}: no label overlap`, r.overlaps.length===0, r.overlaps.slice(0,3).join(' | '));
    check(`${tag}: nothing clipped by viewBox`, r.clipped.length===0, r.clipped.slice(0,3).join(' | '));
    check(`${tag}: no horizontal page overflow`, r.overflow.length===0, r.overflow.join(' | '));
    await page.screenshot({ path: `apps/web/e2e/lesson-kit/shots/ovf-${c.name}-${vp.tag}.png`, fullPage:false });
    await ctx.close();
  }
}
const fails = results.filter(r=>!r.ok);
console.log(`\n== ${results.length-fails.length}/${results.length} passed ==`);
await browser.close();
