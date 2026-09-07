import { launch, open, check, summary, settle } from '../_2nde-helpers.mjs';
const B='http://localhost:5250/courses/college/6e/';
const CASES = [
 { n:'AxisCutter', p:'donnees_proportionnalite/graphiques/le-graphique-qui-ment', k:'graphiques', m:7, h:['Pied de l’axe'] },
 { n:'ReadRuler', p:'donnees_proportionnalite/graphiques/lire-comparer-reperer', k:'graphiques', m:5, h:['Règle de lecture'] },
 { n:'StretchLab', p:'donnees_proportionnalite/proportionnalite/le-distributeur', k:'proportionnalite', m:2, h:['Jetons —'] },
 { n:'InvariantRibbon', p:'grandeurs_mesures/longueurs/quelle-unite', k:'longueurs', m:2, h:['Longueur du ruban'] },
 { n:'MeasureLab', p:'nombres_calculs/nombres-decimaux/entre-deux-nombres', k:'nombres-decimaux', m:2, h:['Repère de mesure'] },
 { n:'SamePointLab', p:'nombres_calculs/nombres-decimaux/entre-deux-nombres', k:'nombres-decimaux', m:2, h:['Étiquette 4,50','Étiquette 4,05'] },
 { n:'EstimationScale', p:'nombres_calculs/ordre-grandeur-estimation/ordre-de-grandeur-somme', k:'ordre-grandeur-estimation', m:5, h:['ordre de grandeur'] },
 { n:'RectangleLab', p:'nombres_calculs/ordre-grandeur-estimation/ordre-de-grandeur-produit', k:'ordre-grandeur-estimation', m:7, h:['Premier facteur','Second facteur'] },
];

/* §17bis — on BALAIE la course (Début, milieu, Fin) et on vérifie qu'à chaque
   position l'anneau de focus reste entièrement dans le cadre de la figure :
   pour une poignée SVG, l'anneau doit tenir dans la viewBox ; pour une poignée
   DOM, la boîte peinte (pastille + anneau) doit tenir dans le cadre du dessin. */
const browser = await launch();
for (const c of CASES) {
  const done = Array.from({ length: c.m }, (_, i) => String(i));
  const { ctx, page } = await open(browser, B + c.p, { key:`u_anon_smarter_lesson_${c.k}`, completedModules: done, tag: c.n });
  await settle(page, 1400);
  for (const label of c.h) {
    const el = page.locator(`[role="slider"][aria-label*="${label}"]`).first();
    await el.evaluate((e) => e.focus());
    for (const [pos, key] of [['Début','Home'], ['milieu',null], ['Fin','End']]) {
      if (key) await page.keyboard.press(key);
      else { await page.keyboard.press('Home'); for (let i = 0; i < 5; i += 1) await page.keyboard.press('PageUp'); }
      await settle(page, 200);
      const r = await el.evaluate((e) => {
        const svg = e.closest('svg');
        if (svg) {
          // Le rayon de l'anneau est connu du composant : on relit le <circle>
          // de focus effectivement rendu et on le compare à la viewBox.
          const vb = svg.viewBox.baseVal;
          const rings = [...svg.querySelectorAll('circle[fill="none"]')];
          if (!rings.length) return { kind: 'svg', ok: false, why: 'aucun anneau rendu' };
          const bad = rings.map((cc) => {
            const cx = +cc.getAttribute('cx'); const cy = +cc.getAttribute('cy'); const rr = +cc.getAttribute('r');
            const sw = +(cc.getAttribute('stroke-width') || 1) / 2;
            const out = cx - rr - sw < vb.x || cy - rr - sw < vb.y
              || cx + rr + sw > vb.x + vb.width || cy + rr + sw > vb.y + vb.height;
            return out ? `cx=${cx} cy=${cy} r=${rr}` : null;
          }).filter(Boolean);
          return { kind: 'svg', ok: !bad.length, why: bad.join(', '), n: rings.length };
        }
        // Poignée DOM : l'anneau est un box-shadow INSET, donc il ne peut par
        // construction pas dépasser la pastille ; on vérifie que la PASTILLE
        // reste dans le cadre du dessin, ce qui suffit alors.
        const pill = e.querySelector('span') || e;
        const box = pill.getBoundingClientRect();
        const frame = e.closest('.relative, [class*="rounded"]').getBoundingClientRect();
        const eps = 0.5;
        const out = box.left < frame.left - eps || box.right > frame.right + eps
          || box.top < frame.top - eps || box.bottom > frame.bottom + eps;
        return { kind: 'dom', ok: !out, why: `pastille ${JSON.stringify(box)} vs cadre ${JSON.stringify(frame)}`,
                 shadow: getComputedStyle(pill).boxShadow.slice(0, 60) };
      });
      check(`${c.n} · ${label} · ${pos} de course : l'anneau reste dans le cadre`, r.ok, r.why);
    }
    await el.evaluate((e) => e.blur());
  }
  await ctx.close();
}
await browser.close();
process.exit(summary() ? 1 : 0);
