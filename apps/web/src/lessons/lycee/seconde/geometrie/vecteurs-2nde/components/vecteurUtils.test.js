import { describe, it, expect } from 'vitest';
import {
  vec, add, scale, sub, equal, isZero, opposite, RANGE, inRange, clampToRange,
  directionKey, attributesOf, diagnose, colinearFactor, areColinear,
  isParallelogram, fourthVertex, simplifySqrt, normText, formatNum, formatVec,
  describeMove, signed, midpoint, dist, SCENES,
} from './vecteurUtils';

describe('vecteurs — algèbre', () => {
  it('AB = B − A, addition et opposé', () => {
    const A = { x: -1, y: 2 };
    const B = { x: 3, y: -1 };
    expect(vec(A, B)).toEqual({ x: 4, y: -3 });
    expect(add(A, vec(A, B))).toEqual(B);
    expect(add(vec(A, B), opposite(vec(A, B)))).toEqual({ x: 0, y: 0 });
    expect(sub({ x: 1, y: 1 }, { x: 3, y: -2 })).toEqual({ x: -2, y: 3 });
    expect(isZero(scale({ x: 2, y: -5 }, 0))).toBe(true);
  });

  it('égalité ne dépend pas du point de départ', () => {
    const u = vec({ x: 0, y: 2 }, { x: 4, y: 0 });
    const v = vec({ x: -3, y: 1 }, { x: 1, y: -1 });
    expect(equal(u, v)).toBe(true);
    expect(equal(u, opposite(v))).toBe(false);
  });

  it('cadre : inRange et clamp', () => {
    expect(inRange({ x: 6, y: -6 })).toBe(true);
    expect(inRange({ x: 6.5, y: 0 })).toBe(false);
    expect(clampToRange({ x: 9, y: -9 })).toEqual({ x: RANGE.xMax, y: RANGE.yMin });
  });
});

describe('direction, sens, longueur', () => {
  it('opposés : même direction, sens contraire, même longueur', () => {
    const a = attributesOf({ x: 4, y: 2 }, { x: -4, y: -2 });
    expect(a).toEqual({ direction: true, sens: false, longueur: true, egaux: false });
    expect(diagnose({ x: 4, y: 2 }, { x: -4, y: -2 })).toBe('sens');
  });
  it('multiples positifs : même direction, même sens, autre longueur', () => {
    expect(diagnose({ x: 4, y: 2 }, { x: 2, y: 1 })).toBe('longueur');
    expect(directionKey({ x: 4, y: 2 })).toBe(directionKey({ x: -2, y: -1 }));
  });
  it('composantes échangées : autre direction ; nul ; égaux', () => {
    expect(diagnose({ x: 4, y: 2 }, { x: 2, y: 4 })).toBe('direction');
    expect(diagnose({ x: 4, y: 2 }, { x: 0, y: 0 })).toBe('nul');
    expect(diagnose({ x: 4, y: 2 }, { x: 4, y: 2 })).toBeNull();
  });
  it('les demi-graduations gardent une direction exacte', () => {
    expect(directionKey({ x: 1.5, y: 1 })).toBe(directionKey({ x: 3, y: 2 }));
  });
});

describe('colinéarité par multiple', () => {
  it('trouve k, y compris négatif et fractionnaire', () => {
    expect(colinearFactor({ x: 2, y: 1 }, { x: -4, y: -2 })).toBe(-2);
    expect(colinearFactor({ x: 2, y: 4 }, { x: 1, y: 2 })).toBe(0.5);
    expect(colinearFactor({ x: 0, y: 3 }, { x: 0, y: -9 })).toBe(-3);
  });
  it('null quand ce n’est pas un multiple ; le vecteur nul', () => {
    expect(colinearFactor({ x: 2, y: 1 }, { x: 1, y: 2 })).toBeNull();
    expect(colinearFactor({ x: 2, y: 1 }, { x: 0, y: 0 })).toBe(0);
    expect(colinearFactor({ x: 0, y: 0 }, { x: 1, y: 0 })).toBeNull();
    expect(areColinear({ x: 3, y: 2 }, { x: 9, y: 6 })).toBe(true);
    expect(areColinear({ x: 3, y: 2 }, { x: 9, y: 5 })).toBe(false);
  });
  it('les points de la scène « alignés » le sont, ceux du parallélogramme non', () => {
    const { A, B, C } = SCENES.problemes.alignes;
    expect(colinearFactor(vec(A, B), vec(A, C))).toBe(3);
    const p = SCENES.problemes.para;
    expect(areColinear(vec(p.A, p.B), vec(p.A, p.C))).toBe(false);
  });
});

describe('parallélogramme et milieu', () => {
  it('ABCD ⟺ AB = DC, et le quatrième sommet', () => {
    const { A, B, C } = SCENES.problemes.para;
    const D = fourthVertex(A, B, C);
    expect(D).toEqual({ x: -1, y: -5 });
    expect(inRange(D)).toBe(true);
    expect(isParallelogram(A, B, C, D)).toBe(true);
    expect(isParallelogram(A, B, D, C)).toBe(false); // ordre des sommets
    expect(isParallelogram(A, B, C, { x: 0, y: 0 })).toBe(false);
  });
  it('un quadrilatère aplati n’est pas un parallélogramme', () => {
    const A = { x: 0, y: 0 };
    expect(isParallelogram(A, A, { x: 1, y: 1 }, { x: 1, y: 1 })).toBe(false);
  });
  it('milieu et distance des scènes', () => {
    const { A, B } = SCENES.milieu;
    expect(midpoint(A, B)).toEqual({ x: -1, y: 1 });
    expect(dist(A, B)).toBe(10);
    expect(equal(vec(A, midpoint(A, B)), vec(midpoint(A, B), B))).toBe(true);
  });
});

describe('norme', () => {
  it('√ simplifiée', () => {
    expect(simplifySqrt(25)).toEqual({ coef: 5, radicand: 1 });
    expect(simplifySqrt(20)).toEqual({ coef: 2, radicand: 5 });
    expect(simplifySqrt(13)).toEqual({ coef: 1, radicand: 13 });
    expect(simplifySqrt(0)).toEqual({ coef: 1, radicand: 0 });
  });
  it('texte de la norme : entier, radical, radical simplifié', () => {
    expect(normText({ x: 3, y: 4 })).toMatchObject({ exact: '5', approx: null, value: 5, squares: '3² + 4² = 25' });
    expect(normText({ x: 2, y: 3 })).toMatchObject({ exact: '√13', approx: '3,61' });
    expect(normText({ x: 4, y: 2 })).toMatchObject({ exact: '2√5', approx: '4,47' });
    expect(normText({ x: -6, y: -8 })).toMatchObject({ exact: '10', squares: '−6² + −8² = 100' });
    expect(normText({ x: 0, y: 0 })).toMatchObject({ exact: '0', value: 0 });
  });
  it('doubler le vecteur double la norme (pas ×4)', () => {
    expect(normText(scale({ x: 3, y: 4 }, 2)).value).toBe(10);
  });
});

describe('écriture française', () => {
  it('formatNum, formatVec, signed', () => {
    expect(formatNum(-2)).toBe('−2');
    expect(formatNum(-0)).toBe('0');
    expect(formatNum(0.5)).toBe('0,5');
    expect(formatNum(1 / 3)).toBe('0,33');
    expect(formatVec({ x: 3, y: -2 })).toBe('(3 ; −2)');
    expect(signed(3)).toBe('+3');
    expect(signed(-1.5)).toBe('−1,5');
    expect(signed(0)).toBe('0');
  });
  it('describeMove', () => {
    expect(describeMove({ x: 3, y: 2 })).toBe('3 vers la droite et 2 vers le haut');
    expect(describeMove({ x: -1, y: 0 })).toBe('1 vers la gauche');
    expect(describeMove({ x: 0, y: -2.5 })).toBe('2,5 vers le bas');
    expect(describeMove({ x: 0, y: 0 })).toBe('aucun déplacement');
  });
});

describe('scènes : toutes dans le cadre, aucune ne satisfait son but au départ', () => {
  it('le dépôt', () => {
    const { start, station, start2, chain } = SCENES.depot;
    for (const p of [start, station, start2]) expect(inRange(p)).toBe(true);
    expect(vec(start, station)).toEqual({ x: 3, y: 2 });
    expect(inRange(add(start2, vec(start, station)))).toBe(true);
    const total = add(chain[0], chain[1]);
    expect(inRange(add(start, chain[0]))).toBe(true);
    expect(inRange(add(start, total))).toBe(true);
    expect(equal(vec(start, start2), vec(start, station))).toBe(false); // le second robot n'est pas déjà à l'arrivée
  });
  it('somme, Chasles, étirer, norme', () => {
    const s = SCENES.somme;
    expect(inRange(add(add(s.origin, s.u), s.v))).toBe(true);
    const c = SCENES.chasles;
    expect(add(vec(c.A, c.B), vec(c.B, c.C))).toEqual(vec(c.A, c.C));
    const e = SCENES.etirer;
    for (const k of [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3]) expect(inRange(add(e.origin, scale(e.u, k)))).toBe(true);
    const n = SCENES.norme;
    expect(inRange(add(n.origin, n.u))).toBe(true);
    expect(normText(n.u).exact).toBe('5');
  });
  it('problèmes', () => {
    const m = SCENES.problemes.manquant;
    expect(sub(vec(m.depart, m.arrivee), m.u)).toEqual({ x: 2, y: -3 });
    expect(inRange(add(m.depart, m.u))).toBe(true);
  });
});
