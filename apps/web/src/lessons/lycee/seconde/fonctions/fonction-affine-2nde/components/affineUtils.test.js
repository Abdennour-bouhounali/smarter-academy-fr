import { describe, it, expect } from 'vitest';
import { affine, imageOf, rate, rateBetween, fromTwoPoints, isAffineTable, zeroOf, variationOf, signTable, solveEq, solveIneq, intervalText, affineText, TABLE_AFFINE, TABLE_NON_AFFINE, POINTS4, G5, F5 } from './affineUtils';

describe('fonction affine', () => {
  it('images, taux constant', () => {
    const f = affine(2, 3);
    expect(imageOf(f, 0)).toBe(3); expect(imageOf(f, 4)).toBe(11);
    expect(rate(f, 1, 4)).toBe(2); expect(rate(f, -2, 7)).toBe(2); expect(rate(f, 1, 1)).toBeNull();
    expect(rateBetween(POINTS4[0], POINTS4[1])).toBe(2);
  });
  it('par deux points ; tables affines ou non', () => {
    expect(fromTwoPoints(POINTS4[0], POINTS4[1])).toEqual({ a: 2, b: 3 });
    expect(fromTwoPoints({ x: 1, y: 2 }, { x: 1, y: 5 })).toBeNull();
    expect(isAffineTable(TABLE_AFFINE)).toBe(true); expect(isAffineTable(TABLE_NON_AFFINE)).toBe(false);
  });
  it('zéro, variations, signe', () => {
    expect(zeroOf(G5)).toBe(2); expect(variationOf(G5)).toBe('decroissante'); expect(signTable(G5)).toEqual({ zero: 2, before: '+', after: '−' });
    expect(zeroOf(F5)).toBe(2); expect(variationOf(F5)).toBe('croissante'); expect(signTable(F5)).toEqual({ zero: 2, before: '−', after: '+' });
    expect(zeroOf(affine(0, 4))).toBeNull(); expect(variationOf(affine(0, 4))).toBe('constante');
  });
  it('équations et inéquations', () => {
    expect(solveEq(F5, 6)).toBe(5); expect(solveEq(G5, 0)).toBe(2);
    expect(intervalText(solveIneq(F5, 6, '>'))).toBe(']5 ; +∞[');
    expect(intervalText(solveIneq(G5, 0, '>'))).toBe(']−∞ ; 2[');      // a < 0 : le sens s'inverse
    expect(intervalText(solveIneq(G5, 0, '<='))).toBe('[2 ; +∞[');
    expect(intervalText(solveIneq(F5, -4, '>='))).toBe('[0 ; +∞[');
  });
  it('écritures', () => {
    expect(affineText(affine(2, -4))).toBe('2x − 4'); expect(affineText(affine(-1, 0))).toBe('−x'); expect(affineText(affine(0.5, 3), 't')).toBe('0,5t + 3'); expect(affineText(affine(0, 7))).toBe('7');
  });
});
