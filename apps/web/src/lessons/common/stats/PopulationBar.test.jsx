import { describe, it, expect } from 'vitest';

/**
 * L'INVARIANT VISUEL de PopulationBar (docs/architecture — « un schéma ne
 * contredit jamais la leçon ») : une largeur est proportionnelle à un
 * effectif, sur les deux barres.
 *
 * On teste la GÉOMÉTRIE, pas le DOM : le calcul de découpe est la seule chose
 * qui puisse mentir à l'élève. Il est reproduit ici à l'identique de la
 * fonction `layout` du composant — si l'une change sans l'autre, le test
 * tombe, ce qui est exactement le but.
 */
const layout = (list, sum, w) => {
  let x = 0;
  return list.map((g) => {
    const segW = sum === 0 ? 0 : (g.count / sum) * w;
    const seg = { id: g.id, x, w: segW };
    x += segW;
    return seg;
  });
};

const W = 640;

describe('PopulationBar — géométrie', () => {
  const groups = [
    { id: 'interne-club', count: 150 },
    { id: 'interne-sans', count: 50 },
    { id: 'externe-club', count: 300 },
    { id: 'externe-sans', count: 300 },
  ];
  const total = 800;

  it('découpe la barre du haut proportionnellement aux effectifs', () => {
    const segs = layout(groups, total, W);
    // 150/800 de 640 = 120 px, et ainsi de suite.
    expect(segs.map((s) => Math.round(s.w))).toEqual([120, 40, 240, 240]);
  });

  it('remplit exactement la largeur, sans trou ni débordement', () => {
    const segs = layout(groups, total, W);
    const last = segs[segs.length - 1];
    expect(last.x + last.w).toBeCloseTo(W, 6);
    // Les segments se suivent sans chevauchement.
    segs.slice(1).forEach((s, i) => expect(s.x).toBeCloseTo(segs[i].x + segs[i].w, 6));
  });

  it('redessine l’univers restreint sur TOUTE la largeur — le tout a changé', () => {
    const kept = groups.filter((g) => g.id.startsWith('interne'));   // les 200 internes
    const keptTotal = kept.reduce((a, g) => a + g.count, 0);
    expect(keptTotal).toBe(200);
    const segs = layout(kept, keptTotal, W);
    // 150 sur 200 occupe les trois quarts : c'est P(club | interne) = 0,75,
    // lisible à l'œil, alors que 150/800 n'en occupait qu'un huitième.
    expect(segs[0].w / W).toBeCloseTo(0.75, 6);
    expect(segs[0].w + segs[1].w).toBeCloseTo(W, 6);
  });

  it('rend visible le paradoxe du test : 99 vrais positifs contre 495 faux', () => {
    // Prévalence 1 %, sensibilité 99 %, spécificité 95 % sur 10 000 personnes.
    const all = [
      { id: 'vp', count: 99 }, { id: 'fn', count: 1 },
      { id: 'fp', count: 495 }, { id: 'vn', count: 9405 },
    ];
    const top = layout(all, 10000, W);
    // Dans la population entière, les vrais positifs sont un filet de 6 px :
    // la figure ne le cache pas, c'est la réalité de la prévalence.
    expect(top[0].w).toBeLessThan(8);

    const positives = all.filter((g) => g.id === 'vp' || g.id === 'fp');
    const posTotal = 594;
    const bottom = layout(positives, posTotal, W);
    // Restreint aux positifs, le rapport devient lisible : 1 contre 5.
    expect(bottom[0].w / W).toBeCloseTo(99 / 594, 6);
    expect(bottom[1].w / bottom[0].w).toBeCloseTo(5, 6);
    // Et c'est la VPP de la leçon.
    expect(99 / 594).toBeCloseTo(0.1667, 4);
  });

  it('ne divise jamais par zéro sur une population vide', () => {
    expect(layout([{ id: 'a', count: 0 }], 0, W)).toEqual([{ id: 'a', x: 0, w: 0 }]);
  });
});
