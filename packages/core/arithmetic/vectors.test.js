import { describe, it, expect } from 'vitest';
import { frac } from './linear.js';
import { surdText, surdNumber } from './trigonometry.js';
import {
  point, vec, vecAdd, vecEq, vecNeg, translate, relation, midpoint, symmetric, fourthVertex, parallelogramSum,
  collinear, isParallelogram, distance, distanceSquared, triangleNature, quadNature, onCircle, simplifyNamed, isChain,
  vecLatex, pointLatex, distanceLatex, numLatex, norm,
  crossing, crossingSide, shortestCrossing, crossingAt,
} from './vectors.js';

const A = point(1, 2); const B = point(4, -2);

describe('vectors — coordonnées', () => {
  it('vec = (xB − xA ; yB − yA)', () => {
    expect(vecEq(vec(A, B), point(3, -4))).toBe(true);
    expect(vecEq(vec(B, A), vecNeg(vec(A, B)))).toBe(true);
  });
  it('accepte décimales à virgule, fractions et tableaux', () => {
    expect(vecEq(vec([0, 0], ['1,5', '7/2']), point('3/2', '3,5'))).toBe(true);
  });
  it('translate : MM′ = u', () => {
    const M2 = translate(point(-1, 3), point(2, -5));
    expect(vecEq(M2, point(1, -2))).toBe(true);
  });
  it('relation : منحى، اتجاه، طول', () => {
    expect(relation(point(2, 1), point(2, 1))).toMatchObject({ direction: true, sense: true, length: true, equal: true });
    expect(relation(point(2, 1), point(-2, -1))).toMatchObject({ direction: true, sense: false, length: true, opposite: true, equal: false });
    expect(relation(point(2, 1), point(4, 2))).toMatchObject({ direction: true, sense: true, length: false });
    expect(relation(point(3, 0), point(0, 3))).toMatchObject({ direction: false, sense: null, length: true });
  });
});

describe('vectors — points remarquables', () => {
  it('milieu, symétrique', () => {
    expect(vecEq(midpoint(A, B), point('5/2', 0))).toBe(true);
    expect(vecEq(symmetric(A, midpoint(A, B)), B)).toBe(true);
  });
  it('quatrième sommet : AB = DC', () => {
    const C = point(5, 3);
    const D = fourthVertex(A, B, C);
    expect(vecEq(vec(A, B), vec(D, C))).toBe(true);
    expect(isParallelogram(A, B, C, D)).toBe(true);
    expect(vecEq(parallelogramSum(A, B, D), C)).toBe(true);
    expect(vecEq(vecAdd(vec(A, B), vec(A, D)), vec(A, C))).toBe(true);
  });
  it('alignés ⇒ pas un parallélogramme (aplati)', () => {
    expect(collinear(point(0, 0), point(1, 1), point(3, 3))).toBe(true);
    expect(isParallelogram(point(0, 0), point(1, 0), point(3, 0), point(2, 0))).toBe(false);
  });
});

describe('vectors — distances exactes', () => {
  it('AB = 5, √13, 3√2', () => {
    expect(surdText(distance(A, B))).toBe('5');
    expect(surdText(distance(point(0, 0), point(2, 3)))).toBe('√13');
    expect(surdText(distance(point(-1, -1), point(2, 2)))).toBe('3√2');
    expect(distanceLatex(point(-1, -1), point(2, 2))).toBe('3\\sqrt{2}');
    expect(surdText(norm(point(1, 1)))).toBe('√2');
  });
  it('carrés exacts avec fractions', () => {
    expect(distanceSquared(point('1/2', 0), point(0, 0))).toEqual(frac(1, 4));
  });
});

describe('vectors — natures', () => {
  it('triangle rectangle / isocèle / équilatéral par les carrés', () => {
    expect(triangleNature(point(0, 0), point(4, 0), point(0, 3)).right).toBe('A');
    const iso = triangleNature(point(-2, 0), point(2, 0), point(0, 5));
    expect(iso.isosceles).toBe('C');
    expect(triangleNature(point(0, 0), point(2, 2), point(4, 0))).toMatchObject({ right: 'B', isosceles: 'B' });
  });
  it('quadrilatères', () => {
    expect(quadNature(point(0, 0), point(2, 0), point(2, 2), point(0, 2))).toBe('square');
    expect(quadNature(point(0, 0), point(4, 0), point(4, 2), point(0, 2))).toBe('rectangle');
    expect(quadNature(point(0, 0), point(2, 1), point(4, 0), point(2, -1))).toBe('rhombus');
    expect(quadNature(point(0, 0), point(4, 0), point(5, 2), point(1, 2))).toBe('parallelogram');
    expect(quadNature(point(0, 0), point(4, 0), point(5, 2), point(0, 2))).toBe('none');
  });
  it('appartenance à un cercle', () => {
    expect(onCircle(point(1, 1), 5, point(4, 5))).toBe(true);
    expect(onCircle(point(0, 0), { q: frac(1), r: 13 }, point(2, 3))).toBe(true);
    expect(onCircle(point(0, 0), 3, point(2, 3))).toBe(false);
  });
});

describe('vectors — vecteurs nommés (Chasles)', () => {
  it('شال، متعاكسان، معدوم', () => {
    expect(simplifyNamed(['AB', 'BC'])).toBe('AC');
    expect(simplifyNamed(['AB', 'BC', 'CD'])).toBe('AD');
    expect(simplifyNamed(['AB', 'BA'])).toBe('0');
    expect(simplifyNamed(['AB', '-CB'])).toBe('AC');
    expect(simplifyNamed(['AB', 'CD'])).toBe(null);
    expect(simplifyNamed(['MA', 'AM′'])).toBe('MM′');
  });
  it('chaîne raccordée', () => {
    expect(isChain(['AB', 'BC', 'CD'])).toBe(true);
    expect(isChain(['AB', 'CD'])).toBe(false);
  });
});

describe('vectors — traverser un courant (majmu-shuaayn, تحدّ p. 127)', () => {
  it('le تحدّ : 4 km/h contre 2 km/h → 30° vers l’amont, vitesse réelle 2√3', () => {
    const k = crossing({ swim: 4, current: 2 });
    expect(k.possible).toBe(true);
    expect(k.sin).toEqual(frac(1, 2));
    expect(k.angle).toBe(30);
    expect(surdText(k.speed)).toBe('2√3');
    expect(Math.abs(k.approxAngle - 30)).toBeLessThan(1e-9);
  });
  it('un sinus non remarquable : pas d’angle entier exact', () => {
    const k = crossing({ swim: 5, current: 3 });
    expect(k.angle).toBe(null);
    expect(surdText(k.speed)).toBe('4');
    expect(crossing({ swim: 2, current: 2 }).possible).toBe(false);
  });
  it('le côté d’arrivée, balayé sur −45°…80° : la cible est 30° et rien d’autre', () => {
    for (let t = -45; t <= 80; t += 1) {
      const side = crossingSide({ swim: 4, current: 2 }, t);
      expect(side, String(t)).toBe(t === 30 ? 'target' : t < 30 ? 'downstream' : 'upstream');
    }
  });
});

describe('vectors — le plus court passage (« ممر الراجلين »)', () => {
  it('l’exemple de l’extraction : B′(4 ; −1), M(1/2 ; 2), minimum √85 + 2', () => {
    const k = shortestCrossing({ A: [-3, 5], B: [4, -3], width: 2 });
    expect(vecEq(k.Bp, point(4, -1))).toBe(true);
    expect(vecEq(k.M, point('1/2', 2))).toBe(true);
    expect(vecEq(k.N, point('1/2', 0))).toBe(true);
    expect(surdText(k.ABp)).toBe('√85');
    expect(k.MN).toEqual(frac(2));
    // MB′BN متوازي أضلاع : NB = MB′ (relation), et A, M, B′ alignés
    expect(relation(vec(k.N, point(4, -3)), vec(k.M, k.Bp)).equal).toBe(true);
    expect(collinear(point(-3, 5), k.M, k.Bp)).toBe(true);
  });
  it('balayé : aucun passage n’est plus court que AB′ + MN, l’égalité au seul x optimal', () => {
    const data = { A: [0, 3], B: [3, -2], width: 2 };
    const k = shortestCrossing(data);
    expect(vecEq(k.M, point(1, 2))).toBe(true);
    const min = surdNumber(k.ABp) + 2;
    for (let i = -8; i <= 16; i += 1) {
      const c = crossingAt(data, frac(i, 4));
      const L = surdNumber(c.AM) + 2 + surdNumber(c.NB);
      if (i === 4) expect(Math.abs(L - min)).toBeLessThan(1e-12);
      else expect(L).toBeGreaterThan(min + 1e-9);
    }
  });
  it('refuse une bande vide ou des points du mauvais côté', () => {
    expect(() => shortestCrossing({ A: [0, 1], B: [3, -2], width: 2 })).toThrow();
    expect(() => crossingAt({ A: [0, 3], B: [3, 1], width: 2 }, 0)).toThrow();
    expect(() => crossingAt({ A: [0, 3], B: [3, -1], width: 0 }, 0)).toThrow();
  });
});

describe('vectors — deux parcours (أدمج تعلّماتي, وضعية العدّاءين p. 148)', () => {
  it('le manuel : trois demi-cercles de rayon 1 (3π ≈ 9,42) contre √13 + √5 + √17 ≈ 9,96', async () => {
    const V = await import('./vectors.js');
    const r1 = V.routeLength({ start: [-2, 0], pieces: [{ to: [0, 0], arc: 'cw' }, { to: [2, 0], arc: 'ccw' }, { to: [4, 0], arc: 'cw' }] });
    expect(r1.latex).toBe('3\\pi');
    expect(r1.pieces.map((p) => V.pointLatex('I', p.centre))).toEqual(['I(-1\\,;\\,0)', 'I(1\\,;\\,0)', 'I(3\\,;\\,0)']);
    expect(r1.number).toBeCloseTo(3 * Math.PI, 12);
    const r2 = V.routeLength({ start: [-2, 3], pieces: [{ to: [1, 1] }, { to: [3, 2] }, { to: [4, -2] }] });
    expect(r2.latex).toBe('\\sqrt{13} + \\sqrt{5} + \\sqrt{17}');
    expect(r2.number.toFixed(2)).toBe('9.96');
    expect(r1.number < r2.number).toBe(true);
  });
  it('regroupe les racines semblables et les rayons ; le demi-cercle se referme au symétrique', async () => {
    const V = await import('./vectors.js');
    expect(V.surdSumLatex(V.surdSum([V.distance([0, 0], [3, -4]), V.distance([0, 0], [3, 3]), V.distance([0, 0], [2, -2])]))).toBe('5 + 5\\sqrt{2}');
    const r = V.routeLength({ start: [-3, 0], pieces: [{ to: [1, 0], arc: 'cw' }, { to: [3, 0] }] });
    expect(r.latex).toBe('2\\pi + 2');
    expect(surdText(V.semicircle([0, 0], [4, 2]).radius)).toBe('√5');
    expect(vecEq(V.arcEnd([-2, 0], [-1, 0]), point(0, 0))).toBe(true);
    expect(vecEq(V.arcEnd([-2, 0], [0, 0]), point(2, 0))).toBe(true); // le centre sur l'extrémité : un arc deux fois trop grand
    expect(V.surdSumLatex([])).toBe('0');
  });
});

describe('vectors — écritures', () => {
  it('LaTeX', () => {
    expect(vecLatex(point(3, -2))).toBe('\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}');
    expect(pointLatex('A', point('2,5', -1))).toBe('A(2{,}5\\,;\\,-1)');
    expect(numLatex(frac(-1, 3))).toBe('-\\dfrac{1}{3}');
  });
});
