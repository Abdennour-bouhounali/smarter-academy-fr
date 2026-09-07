import { launch, open, check, summary, settle, SHOT_DIR } from '../_2nde-helpers.mjs';
const B='http://localhost:5250/courses/college/6e/';

/* Chaque cas : le composant, l'URL, la clé de progression, le nombre de modules
   à débloquer, et pour chaque poignée : son aria-label + comment on constate
   que l'anneau de focus est VISIBLE (un <circle> SVG, ou un box-shadow DOM). */
const CASES = [
 { n:'AxisCutter', p:'donnees_proportionnalite/graphiques/le-graphique-qui-ment', k:'graphiques', m:7,
   h:[{ l:'Pied de l’axe', kind:'dom', ring:'15, 23, 42' }] },
 { n:'ReadRuler', p:'donnees_proportionnalite/graphiques/lire-comparer-reperer', k:'graphiques', m:5,
   h:[{ l:'Règle de lecture', kind:'dom', ring:'190, 18, 60' }] },
 { n:'StretchLab', p:'donnees_proportionnalite/proportionnalite/le-distributeur', k:'proportionnalite', m:2,
   h:[{ l:'Jetons —', kind:'dom', ring:'129, 140, 248' }] },
 { n:'InvariantRibbon', p:'grandeurs_mesures/longueurs/quelle-unite', k:'longueurs', m:2,
   h:[{ l:'Longueur du ruban', kind:'dom', ring:'96, 165, 250' }] },
 { n:'MeasureLab', p:'nombres_calculs/nombres-decimaux/entre-deux-nombres', k:'nombres-decimaux', m:2,
   h:[{ l:'Repère de mesure', kind:'svg', ring:'circle[stroke="#0284c7"][fill="none"][r="13"]' }] },
 { n:'SamePointLab', p:'nombres_calculs/nombres-decimaux/entre-deux-nombres', k:'nombres-decimaux', m:2,
   h:[{ l:'Étiquette 4,5"', kind:'dom', ring:'3, 105, 161' },
      { l:'Étiquette 4,50', kind:'dom', ring:'4, 120, 87' },
      { l:'Étiquette 4,05', kind:'dom', ring:'190, 18, 60' }] },
 { n:'EstimationScale', p:'nombres_calculs/ordre-grandeur-estimation/ordre-de-grandeur-somme', k:'ordre-grandeur-estimation', m:5,
   h:[{ l:'ordre de grandeur', kind:'svg', ring:'circle[stroke="#7c3aed"][fill="none"][r="16.5"]' }] },
 { n:'RectangleLab', p:'nombres_calculs/ordre-grandeur-estimation/ordre-de-grandeur-produit', k:'ordre-grandeur-estimation', m:7,
   h:[{ l:'Premier facteur', kind:'svg', ring:'circle[stroke="#4338ca"][fill="none"][r="14"]' },
      { l:'Second facteur', kind:'svg', ring:'circle[stroke="#0f766e"][fill="none"][r="15"]' }] },
];

const browser = await launch();
for (const c of CASES) {
  const done = Array.from({ length: c.m }, (_, i) => String(i));
  const { ctx, page } = await open(browser, B + c.p, { key:`u_anon_smarter_lesson_${c.k}`, completedModules: done, tag: c.n });
  await settle(page, 1400);
  for (const g of c.h) {
    const sel = g.l.endsWith('"') ? `[role="slider"][aria-label="${g.l.slice(0,-1)}"]` : `[role="slider"][aria-label*="${g.l}"]`;
    const el = page.locator(sel).first();
    /* On reproduit le CLIC — le geste que l'utilisateur a signalé — sans passer
       par `.click()` de Playwright : la poignée est une zone transparente que le
       SVG parent intercepte, et ce n'est pas le hit-testing qu'on teste ici.
       Un `mousedown` suivi d'un `focus()` place l'élément en `:focus` SANS
       `:focus-visible`, exactement comme un vrai clic à la souris — c'est
       précisément l'état où le contour noir apparaissait. */
    await el.evaluate((e) => {
      e.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      e.focus();
      e.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
    await settle(page, 250);
    const act = await el.evaluate((e) => e === document.activeElement);
    check(`${c.n} · ${g.l} · la poignée prend bien le focus`, act, 'pas active');
    const st = await el.evaluate((e) => ({ o: getComputedStyle(e).outlineStyle, s: getComputedStyle(e).boxShadow }));
    check(`${c.n} · ${g.l} · aucun contour du navigateur (clic)`, st.o === 'none', st.o);
    if (g.kind === 'svg') {
      const n = await page.locator(g.ring).count();
      check(`${c.n} · ${g.l} · anneau de focus visible`, n > 0, `sélecteur ${g.ring} absent`);
    } else {
      // L'anneau est un box-shadow porté par la pastille visible.
      const shadows = await el.evaluate((e) => [e, ...e.querySelectorAll('*')].map((x) => getComputedStyle(x).boxShadow).join(' | '));
      check(`${c.n} · ${g.l} · anneau de focus visible`, shadows.includes(g.ring), shadows);
    }
    // Et il disparaît au blur : l'anneau signale bien le focus, pas autre chose.
    await el.evaluate((e) => e.blur());
    await settle(page, 200);
    if (g.kind === 'svg') {
      const n = await page.locator(g.ring).count();
      check(`${c.n} · ${g.l} · l'anneau s'éteint au blur`, n === 0, `${n} anneau(x) restant(s)`);
    } else {
      const shadows = await el.evaluate((e) => [e, ...e.querySelectorAll('*')].map((x) => getComputedStyle(x).boxShadow).join(' | '));
      check(`${c.n} · ${g.l} · l'anneau s'éteint au blur`, !shadows.includes(g.ring), shadows);
    }
  }
  await page.screenshot({ path: `${SHOT_DIR}focus6e-${c.n}.png` });
  await ctx.close();
}
await browser.close();
process.exit(summary() ? 1 : 0);
