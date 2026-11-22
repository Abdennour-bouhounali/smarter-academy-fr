import { describe, it, expect } from 'vitest';
import * as S from './squareRoots.js';

/* Les nombres sont ceux du manuel, unité 2 (pp. 19–30). */
describe('squareRoots — racines carrées exactes', () => {
  it('carrés parfaits et racines entières (نشاط 1 : 36, 81 ; تمرين 3)', () => {
    for (const [n, r] of [[36, 6], [81, 9], [289, 17], [0, 0], [1, 1], [144, 12]]) expect(S.integerSqrt(n)).toBe(r);
    for (const n of [5, 7, 13, 6, 2, 3, 48]) expect(S.isPerfectSquare(n)).toBe(false);
    expect(S.isPerfectSquare(-4)).toBe(false);
    expect(S.isPerfectSquare(2.25)).toBe(false);
  });

  it('√ d’un rationnel : ناطق ⇔ numérateur et dénominateur carrés (نشاط 2 ، معارف 2)', () => {
    expect(S.rationalSqrt({ num: 25, den: 9 })).toEqual({ num: 5, den: 3 });
    expect(S.rationalSqrt({ num: 16, den: 9 })).toEqual({ num: 4, den: 3 });
    expect(S.rationalSqrt({ num: 25, den: 100 })).toEqual({ num: 1, den: 2 }); // √0,25 = 0,5
    expect(S.rationalSqrt({ num: 4, den: 100 })).toEqual({ num: 1, den: 5 }); // √0,04 = 0,2
    expect(S.rationalSqrt({ num: 169, den: 1 })).toEqual({ num: 13, den: 1 });
    for (const a of [[7, 1], [13, 1], [6, 1], [25, 13], [16, 13]]) expect(S.rationalSqrt({ num: a[0], den: a[1] })).toBeNull();
    // une fraction non réduite qui cache un carré : 8/18 = 4/9
    expect(S.rationalSqrt({ num: 8, den: 18 })).toEqual({ num: 2, den: 3 });
  });

  it('compare un carré à l’aire EN ENTIERS : 2,23² < 5 < 2,24² ; 0,7² = 0,49', () => {
    expect(S.compareSquare(223, 100, { num: 5, den: 1 })).toBe(-1);
    expect(S.compareSquare(224, 100, { num: 5, den: 1 })).toBe(1);
    expect(S.compareSquare(2236, 1000, { num: 5, den: 1 })).toBe(-1);
    expect(S.compareSquare(2237, 1000, { num: 5, den: 1 })).toBe(1);
    expect(S.compareSquare(7, 10, { num: 49, den: 100 })).toBe(0);
    expect(S.compareSquare(4, 3, { num: 16, den: 9 })).toBe(0);
    expect(S.compareSquare(6, 1, { num: 36, den: 1 })).toBe(0);
  });

  it('aucune graduation décimale jusqu’au millième ne donne 5 exactement', () => {
    for (const scale of [1, 10, 100, 1000]) {
      for (let v = 0; v <= 3 * scale; v += 1) expect(S.compareSquare(v, scale, { num: 5, den: 1 })).not.toBe(0);
    }
  });

  it('le carré EXACT de la lecture de la calculatrice (نشاط 1 : إيمان على حق)', () => {
    expect(S.squareOfDecimal('2,236067978')).toBe('5,000000002237008484');
    expect(S.squareOfDecimal('2,236')).toBe('4,999696');
    expect(S.squareOfDecimal('1.414213562')).toBe('1,999999998944727844');
    expect(() => S.squareOfDecimal('abc')).toThrow();
  });

  it('écritures décimales exactes et carrés d’un côté gradué', () => {
    expect(S.exactDecimal(223, 2)).toBe('2,23');
    expect(S.exactDecimal(7, 1)).toBe('0,7');
    expect(S.exactDecimal(-15, 1)).toBe('−1,5');
    expect(S.exactDecimal(36, 0)).toBe('36');
    expect(S.squareOf(223, 100)).toMatchObject({ decimal: '4,9729' });
    expect(S.squareOf(4, 3)).toEqual({ num: 16, den: 9, decimal: null });
  });

  it('n = a² × b avec b le plus petit (طريقة p. 25 ; تمرين 18)', () => {
    const cases = { 8: [2, 2], 18: [3, 2], 50: [5, 2], 32: [4, 2], 75: [5, 3], 288: [12, 2], 300: [10, 3], 363: [11, 3], 6250: [25, 10], 28: [2, 7], 63: [3, 7], 7: [1, 7], 144: [12, 1] };
    for (const [n, [a, b]] of Object.entries(cases)) {
      expect(S.largestSquareFactor(Number(n)), n).toEqual({ a, b });
      expect(a * a * b).toBe(Number(n));
      expect(S.isSquareFree(b)).toBe(true);
    }
  });

  it('tous les pavages k × k d’un carré d’aire n', () => {
    expect(S.squareDivisors(288)).toEqual([1, 2, 3, 4, 6, 12]);
    expect(S.squareDivisors(28)).toEqual([1, 2]);
    expect(S.squareDivisors(144)).toEqual([1, 2, 3, 4, 6, 12]);
    // le plus grand k donne toujours b sans facteur carré, les autres non (sauf k maximal)
    for (const n of [18, 50, 72, 288, 300, 6250]) {
      const ks = S.squareDivisors(n);
      const kmax = ks[ks.length - 1];
      expect(S.isSquareFree(n / (kmax * kmax)), `${n}`).toBe(true);
      for (const k of ks.slice(0, -1)) expect(S.isSquareFree(n / (k * k)), `${n}/${k}`).toBe(false);
    }
  });

  it('écrit une racine simplifiée', () => {
    expect(S.simplifiedRootText(288)).toBe('12√2');
    expect(S.simplifiedRootText(7)).toBe('√7');
    expect(S.simplifiedRootText(36)).toBe('6');
    expect(S.simplifiedRootText(0)).toBe('0');
  });
});
