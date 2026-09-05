import { describe, it, expect } from 'vitest';
import {
  frac, fracText, fracTex, fracFromDecimal, fracValue,
  lineFromPointVector, lineFromTwoPoints, lineFromSlopeIntercept, verticalLine, normalizeLine,
  directionOf, det, relativePosition, commonPointsCount, intersection, slopeOf, reducedEquation,
  isOn, parallelThrough, yAt, lineText, lineTex, cartesianText, frameFor, clipLine, intersectionInFrame,
} from './droitesUtils';

const d1 = lineFromPointVector({ x: -3, y: -1 }, { x: 2, y: 1 });   // y = 0,5x + 0,5
const d2 = lineFromPointVector({ x: 3, y: -1 }, { x: 1, y: -1 });   // y = −x + 2

describe('rationnels', () => {
  it('réduit et normalise le signe', () => {
    expect(frac(6, -4)).toEqual({ n: -3, d: 2 });
    expect(frac(0, 7)).toEqual({ n: 0, d: 1 });
    expect(() => frac(1, 0)).toThrow();
  });
  it('affiche un décimal quand la fraction termine, la fraction sinon', () => {
    expect(fracText(frac(1, 2))).toBe('0,5');
    expect(fracText(frac(-3, 4))).toBe('−0,75');
    expect(fracText(frac(7, 3))).toBe('7/3');
    expect(fracText(frac(-1, 3))).toBe('−1/3');
    expect(fracTex(frac(-1, 3))).toBe('−\\frac{1}{3}');
    expect(fracFromDecimal(-1.5)).toEqual({ n: -3, d: 2 });
    expect(fracFromDecimal(0.45)).toEqual({ n: 9, d: 20 });
  });
});

describe('forme canonique', () => {
  it('deux descriptions de la même droite donnent le même objet', () => {
    expect(lineFromPointVector({ x: -3, y: -1 }, { x: 2, y: 1 })).toEqual(lineFromPointVector({ x: 1, y: 1 }, { x: -4, y: -2 }));
    expect(lineFromSlopeIntercept(0.5, 0.5)).toEqual(d1);
    expect(lineFromTwoPoints({ x: 1, y: 1 }, { x: 3, y: 2 })).toEqual(d1);
    expect(normalizeLine({ a: 2, b: -4, c: 8 })).toEqual(lineFromSlopeIntercept(0.5, 2));
  });
  it('vecteur directeur dérivé, réduit', () => {
    expect(directionOf(d1)).toEqual({ x: 2, y: 1 });
    expect(directionOf(lineFromPointVector({ x: 0, y: 0 }, { x: -4, y: -2 }))).toEqual({ x: 2, y: 1 });
    expect(directionOf(verticalLine(3))).toEqual({ x: 0, y: 1 });
  });
  it('refuse un vecteur nul', () => {
    expect(() => lineFromPointVector({ x: 0, y: 0 }, { x: 0, y: 0 })).toThrow();
  });
});

describe('positions relatives', () => {
  it('sécantes, parallèles, confondues', () => {
    expect(relativePosition(d1, d2)).toBe('secantes');
    const p = lineFromPointVector({ x: 0, y: 3 }, { x: -2, y: -1 });
    expect(relativePosition(d1, p)).toBe('paralleles');
    const c = lineFromPointVector({ x: 5, y: 3 }, { x: 4, y: 2 });
    expect(relativePosition(d1, c)).toBe('confondues');
    expect(commonPointsCount('secantes')).toBe(1);
    expect(commonPointsCount('paralleles')).toBe(0);
    expect(commonPointsCount('confondues')).toBe(Infinity);
  });
  it('le déterminant des vecteurs directeurs tranche, même pour une verticale', () => {
    expect(det({ x: 2, y: 1 }, { x: 4, y: 2 })).toBe(0);
    expect(det({ x: 2, y: 1 }, { x: 0, y: 3 })).toBe(6);
    expect(relativePosition(verticalLine(2), verticalLine(-1))).toBe('paralleles');
    expect(relativePosition(verticalLine(2), verticalLine(2))).toBe('confondues');
    expect(relativePosition(verticalLine(2), d1)).toBe('secantes');
    expect(slopeOf(verticalLine(2))).toBeNull();
  });
  it('intersection exacte (Cramer) sur les deux droites, null ⟺ non sécantes', () => {
    const I = intersection(d1, d2);
    expect(I).toEqual({ x: { n: 1, d: 1 }, y: { n: 1, d: 1 } });
    expect(isOn(d1, { x: 1, y: 1 }) && isOn(d2, { x: 1, y: 1 })).toBe(true);
    const e1 = lineFromSlopeIntercept(2, -1);
    const e2 = lineFromSlopeIntercept(-1, 5);
    expect(intersection(e1, e2)).toEqual({ x: frac(2), y: frac(3) });
    const far1 = lineFromSlopeIntercept(0.5, 1);
    const far2 = lineFromSlopeIntercept(0.45, 4);
    expect(intersection(far1, far2)).toEqual({ x: frac(60), y: frac(31) });
    expect(intersection(d1, lineFromPointVector({ x: 0, y: 3 }, { x: -2, y: -1 }))).toBeNull();
    expect(intersection(d1, d1)).toBeNull();
    // Rationnel non entier : y = 0,5x + 0,5 et y = −2x + 7 → x = 13/5
    const J = intersection(d1, lineFromSlopeIntercept(-2, 7));
    expect(J.x).toEqual({ n: 13, d: 5 });
    expect(fracValue(J.y)).toBeCloseTo(1.8);
    // vérification : le point est sur chaque droite (a·x + b·y + c = 0 en rationnels)
    for (const L of [d1, lineFromSlopeIntercept(-2, 7)]) {
      expect(L.a * J.x.n * J.y.d + L.b * J.y.n * J.x.d + L.c * J.x.d * J.y.d).toBe(0);
    }
  });
  it('balayage : null ⟺ non sécantes, et I appartient aux deux droites', () => {
    const vs = [];
    for (let x = -3; x <= 3; x += 1) for (let y = -3; y <= 3; y += 1) if (x || y) vs.push({ x, y });
    const pts = [{ x: -3, y: -1 }, { x: 0, y: 0 }, { x: 2, y: 3 }, { x: -5, y: 4 }];
    let n = 0;
    for (const u of vs) for (const v of vs) for (const A of pts) for (const B of pts) {
      const L1 = lineFromPointVector(A, u);
      const L2 = lineFromPointVector(B, v);
      const pos = relativePosition(L1, L2);
      const I = intersection(L1, L2);
      expect(I === null).toBe(pos !== 'secantes');
      expect(det(u, v) === 0).toBe(pos !== 'secantes');
      if (I) {
        for (const L of [L1, L2]) expect(L.a * I.x.n * I.y.d + L.b * I.y.n * I.x.d + L.c * I.x.d * I.y.d).toBe(0);
      }
      if (pos === 'confondues') expect(isOn(L1, B)).toBe(true);
      n += 1;
    }
    expect(n).toBeGreaterThan(30000);
  });
});

describe('pente, équations, textes', () => {
  it('équation réduite et cartésienne', () => {
    expect(reducedEquation(d1)).toEqual({ kind: 'reduced', m: frac(1, 2), p: frac(1, 2) });
    expect(lineText(d1)).toBe('y = 0,5x + 0,5');
    expect(lineText(d2)).toBe('y = −x + 2');
    expect(lineText(lineFromSlopeIntercept(1, 0))).toBe('y = x');
    expect(lineText(lineFromSlopeIntercept(0, -3))).toBe('y = −3');
    expect(lineText(lineFromSlopeIntercept(2, 0))).toBe('y = 2x');
    expect(lineText(lineFromPointVector({ x: 0, y: 0 }, { x: 3, y: 1 }))).toBe('y = 1/3x');
    expect(lineText(verticalLine(3))).toBe('x = 3');
    expect(lineTex(d2)).toBe('y = −x + 2');
    expect(lineTex(lineFromSlopeIntercept(-1.5, 2.5))).toBe('y = −1{,}5x + 2{,}5');
    expect(cartesianText(d1)).toBe('x − 2y + 1 = 0');
    expect(cartesianText(verticalLine(3))).toBe('x − 3 = 0');
    expect(cartesianText(lineFromSlopeIntercept(0, 2))).toBe('y − 2 = 0');
  });
  it('parallèle par un point, ordonnée en x', () => {
    const L = lineFromSlopeIntercept(-2, 3);
    const P = parallelThrough(L, { x: 1, y: 4 });
    expect(lineText(P)).toBe('y = −2x + 6');
    expect(relativePosition(L, P)).toBe('paralleles');
    expect(yAt(L, 2)).toEqual(frac(-1));
    expect(yAt(verticalLine(1), 2)).toBeNull();
  });
});

describe('cadres', () => {
  it('borne les graduations et coupe la droite au cadre', () => {
    expect(frameFor(6)).toEqual({ range: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 }, step: 1, unit: 34 });
    expect(frameFor(15).step).toBe(2);
    expect(frameFor(40).step).toBe(5);
    const [P, Q] = clipLine(d2, frameFor(6).range);
    expect(P.y).toBeCloseTo(-P.x + 2);
    expect(Q.y).toBeCloseTo(-Q.x + 2);
    expect(clipLine(verticalLine(3), frameFor(6).range)[0].x).toBe(3);
    expect(clipLine(verticalLine(9), frameFor(6).range)).toBeNull();
    expect(intersectionInFrame(intersection(d1, d2), frameFor(6).range)).toBe(true);
    expect(intersectionInFrame(intersection(lineFromSlopeIntercept(0.5, 1), lineFromSlopeIntercept(0.45, 4)), frameFor(40).range)).toBe(false);
  });
});
