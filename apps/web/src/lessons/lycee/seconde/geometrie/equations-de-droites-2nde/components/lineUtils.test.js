import { describe, it, expect } from 'vitest';
import {
  det, pointAt, slopeOf, slopeFromPoints, lineFromPoints, lineFromSlope, lineFromReduced, lineFromCartesian,
  directionOfCartesian, canonicalCoeffs, cartesianOf, reducedOf, residual, isOnLine, detTest, areAligned, sameLine,
  clipLine, formatCartesian, formatReduced, formatSlope, formatPoint, RANGE, FIGURES,
} from './lineUtils';

describe('modèle point + direction', () => {
  it('pointAt parcourt A + t·u', () => {
    expect(pointAt({ x: 1, y: 3 }, { x: 1, y: 2 }, 2)).toEqual({ x: 3, y: 7 });
    expect(pointAt({ x: 1, y: 3 }, { x: 1, y: 2 }, -1)).toEqual({ x: 0, y: 1 });
  });
  it('la pente est u_y / u_x, null pour une verticale', () => {
    expect(slopeOf({ x: 2, y: 3 })).toBe(1.5);
    expect(slopeOf({ x: -2, y: 4 })).toBe(-2);
    expect(slopeOf({ x: 0, y: 5 })).toBeNull();
    expect(slopeFromPoints({ x: 4, y: 1 }, { x: -2, y: -5 })).toBe(1);
  });
  it('det est nul exactement pour des vecteurs colinéaires', () => {
    expect(det({ x: 1, y: 2 }, { x: 2, y: 4 })).toBe(0);
    expect(det({ x: 1, y: 2 }, { x: -3, y: -6 })).toBe(0);
    expect(det({ x: 1, y: 2 }, { x: 2, y: 5 })).toBe(1);
  });
});

describe('équation cartésienne canonique', () => {
  it('fil rouge A(1;3) u(1;2) → 2x − y + 1 = 0', () => {
    expect(cartesianOf(FIGURES.fil)).toEqual({ a: 2, b: -1, c: 1 });
    expect(formatCartesian(cartesianOf(FIGURES.fil))).toBe('2x − y + 1 = 0');
  });
  it('u et 2u, u et −u donnent la MÊME écriture', () => {
    const A = { x: -1, y: 2 };
    const e1 = cartesianOf({ A, u: { x: 2, y: 3 } });
    expect(cartesianOf({ A, u: { x: 4, y: 6 } })).toEqual(e1);
    expect(cartesianOf({ A, u: { x: -2, y: -3 } })).toEqual(e1);
    expect(cartesianOf({ A, u: { x: 1, y: 1.5 } })).toEqual(e1);
  });
  it('verticale et horizontale', () => {
    expect(formatCartesian(cartesianOf({ A: { x: 3, y: -2 }, u: { x: 0, y: 4 } }))).toBe('x − 3 = 0');
    expect(formatCartesian(cartesianOf({ A: { x: 3, y: -2 }, u: { x: -5, y: 0 } }))).toBe('y + 2 = 0');
  });
  it('coefficients 1 et −1, constante nulle', () => {
    expect(formatCartesian({ a: 1, b: -1, c: 0 })).toBe('x − y = 0');
    expect(formatCartesian({ a: -1, b: 0, c: 5 })).toBe('−x + 5 = 0');
    expect(canonicalCoeffs({ a: -2, b: 4, c: -6 })).toEqual({ a: 1, b: -2, c: 3 });
    expect(canonicalCoeffs({ a: 0, b: -0.5, c: 1.5 })).toEqual({ a: 0, b: 1, c: -3 });
  });
  it('coefficients décimaux non réductibles : signe normalisé, arrondi', () => {
    expect(canonicalCoeffs({ a: -0.3333333, b: 1, c: 0.1 })).toEqual({ a: 0.333333, b: -1, c: -0.1 });
  });
});

describe('équation réduite', () => {
  it('fil rouge → y = 2x + 1', () => {
    expect(reducedOf(FIGURES.fil)).toEqual({ vertical: false, m: 2, p: 1 });
    expect(formatReduced(reducedOf(FIGURES.fil))).toBe('y = 2x + 1');
  });
  it('écritures particulières', () => {
    expect(formatReduced({ vertical: false, m: -1, p: 0 })).toBe('y = −x');
    expect(formatReduced({ vertical: false, m: 0, p: -3.5 })).toBe('y = −3,5');
    expect(formatReduced({ vertical: false, m: 0.5, p: -2 })).toBe('y = 0,5x − 2');
    expect(formatReduced({ vertical: false, m: 0, p: 0 })).toBe('y = 0');
    expect(formatReduced(reducedOf({ A: { x: -2.5, y: 1 }, u: { x: 0, y: -1 } }))).toBe('x = −2,5');
  });
  it('lineFromReduced / lineFromSlope / lineFromCartesian sont cohérentes', () => {
    expect(formatReduced(reducedOf(lineFromReduced(-2, 3)))).toBe('y = −2x + 3');
    expect(formatReduced(reducedOf(lineFromSlope({ x: 2, y: 1 }, 0.5)))).toBe('y = 0,5x');
    const l = lineFromCartesian({ a: 3, b: -2, c: 4 });
    expect(cartesianOf(l)).toEqual({ a: 3, b: -2, c: 4 });
    expect(directionOfCartesian({ a: 3, b: -2 })).toEqual({ x: 2, y: 3 });
    expect(lineFromCartesian({ a: 0, b: 0, c: 1 })).toBeNull();
    expect(formatReduced(reducedOf(lineFromCartesian({ a: 2, b: 0, c: -6 })))).toBe('x = 3');
  });
  it('formatSlope : exact ou approché', () => {
    expect(formatSlope(1.5)).toBe('1,5');
    expect(formatSlope(1 / 3)).toBe('≈ 0,33');
    expect(formatSlope(null)).toBe('aucune (verticale)');
  });
});

describe('appartenance et alignement', () => {
  const d = FIGURES.membership; // y = 0,5x + 1
  it('l’équation tranche là où l’œil ne peut pas', () => {
    expect(isOnLine(d, { x: 4, y: 3 })).toBe(true);
    expect(isOnLine(d, { x: 3, y: 2.4 })).toBe(false);
    expect(isOnLine(d, { x: 3, y: 2.5 })).toBe(true);
    expect(isOnLine(d, { x: -5, y: -1.4 })).toBe(false);
    expect(residual(FIGURES.fil, { x: 4, y: 8.9 })).toBeCloseTo(0.1, 9);
  });
  it('detTest et residual s’annulent ensemble', () => {
    for (const t of [-3, -1, 0, 0.5, 2]) {
      const M = pointAt(FIGURES.fil.A, FIGURES.fil.u, t);
      expect(detTest(FIGURES.fil, M)).toBe(0);
      expect(isOnLine(FIGURES.fil, M)).toBe(true);
    }
    expect(detTest(FIGURES.fil, { x: 2, y: 4 })).not.toBe(0);
  });
  it('trois points alignés', () => {
    expect(areAligned({ x: -2, y: -1 }, { x: 2, y: 7 }, { x: 5, y: 13 })).toBe(true);
    expect(areAligned({ x: -2, y: -1 }, { x: 2, y: 7 }, { x: 5, y: 12 })).toBe(false);
  });
  it('sameLine reconnaît deux définitions de la même droite', () => {
    expect(sameLine(FIGURES.fil, lineFromPoints({ x: 0, y: 1 }, { x: -2, y: -3 }))).toBe(true);
    expect(sameLine(FIGURES.fil, lineFromPoints({ x: 0, y: 1 }, { x: -2, y: -2 }))).toBe(false);
    expect(lineFromPoints({ x: 1, y: 1 }, { x: 1, y: 1 })).toBeNull();
  });
});

describe('découpe au cadre', () => {
  it('la droite verticale et la droite oblique traversent le cadre', () => {
    const v = clipLine({ A: { x: 2, y: 0 }, u: { x: 0, y: 1 } }, RANGE);
    expect(v.map((p) => p.x)).toEqual([2, 2]);
    expect(new Set(v.map((p) => p.y))).toEqual(new Set([-6, 6]));
    const o = clipLine(FIGURES.fil, RANGE);
    expect(o).toHaveLength(2);
    for (const p of o) expect(isOnLine(FIGURES.fil, p)).toBe(true);
  });
  it('une droite hors cadre ne se dessine pas', () => {
    expect(clipLine({ A: { x: 0, y: 20 }, u: { x: 1, y: 0 } }, RANGE)).toBeNull();
  });
  it('formatPoint', () => {
    expect(formatPoint({ x: -3, y: 2.5 })).toBe('(−3 ; 2,5)');
  });
});
