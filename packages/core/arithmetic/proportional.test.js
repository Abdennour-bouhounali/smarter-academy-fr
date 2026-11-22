import { describe, it, expect } from 'vitest';
import { frac, fracText } from './linear.js';
import {
  ratio, tableRatios, commonRatio, fourthProportional, coefficientFrom, image, antecedent, onLine,
  direction, percentMultiplier, chainMultiplier, percentChange, rule, isLinear, linearityWitnesses,
} from './proportional.js';

const T = (p) => fracText(p);

describe('proportional — tables (unité 6, docs/sources/4am/unit6/extraction.json)', () => {
  it('reconnaît le tableau du ressort (طرائق ص 71) : a = 0,3', () => {
    const r = tableRatios([2, 3, 4, 5], ['0,6', '0,9', '1,2', '1,5']);
    expect(r.proportional).toBe(true);
    expect(T(r.a)).toBe('3/10');
  });
  it('refuse 2x − 1 et x² (نشاط 2), accepte 2x', () => {
    expect(tableRatios(['-2', '1,5', 3, '4,5'], [-5, 2, 5, 8]).proportional).toBe(false);
    expect(tableRatios([-3, 0, 1, 3], [9, 0, 1, 9]).proportional).toBe(false);
    expect(T(commonRatio(['-2', '0,5', '2,5', 3], [-4, 1, 5, 6]))).toBe('2');
  });
  it('une colonne x = 0 n’est compatible qu’avec 0', () => {
    expect(tableRatios([0, 2], [0, 6]).proportional).toBe(true);
    expect(tableRatios([0, 2], [1, 6]).proportional).toBe(false);
  });
  it('le quatrième proportionnel du أستعدّ 4 et le tableau de معارف (f(x) = −3x)', () => {
    expect(T(fourthProportional(-2, 6, 3))).toBe('-9');
    expect(tableRatios(['-3', '-2', '-1,5', '-1', '0', '0,5'], [9, 6, '4,5', 3, 0, '-1,5']).a).toEqual(frac(-3));
  });
  it('ratio refuse x = 0', () => {
    expect(() => ratio(0, 3)).toThrow();
  });
});

describe('proportional — fonctions linéaires', () => {
  it('g(−2) = 6 donne a = −3 ; un nombre nul ne détermine pas a', () => {
    expect(T(coefficientFrom(-2, 6))).toBe('-3');
    expect(T(coefficientFrom('-2/3', '-3/5'))).toBe('9/10');   // تمرين 6
    expect(() => coefficientFrom(0, 0)).toThrow();
  });
  it('images, antécédents, appartenance', () => {
    expect(T(image('0,4', 4))).toBe('8/5');
    expect(T(antecedent('0,4', '3,5'))).toBe('35/4');           // 8,75 (طرائق ص 69)
    expect(onLine('0,2', 400, 80)).toBe(true);                   // تمرين 11
    expect(onLine('-3,2', 5, 16)).toBe(false);                   // تمرين 14 : piège de signe
    expect(onLine('3,2', 5, 16)).toBe(true);
    expect(() => antecedent(0, 1)).toThrow();
  });
  it('le sens de la droite suit le signe de a', () => {
    expect(direction(-2)).toBe('falling');
    expect(direction('0,5')).toBe('rising');
    expect(direction(0)).toBe('flat');
  });
});

describe('proportional — pourcentages', () => {
  it('prendre, augmenter, diminuer', () => {
    expect(T(percentMultiplier(5, 'take'))).toBe('1/20');
    expect(T(percentMultiplier(5, 'increase'))).toBe('21/20');
    expect(T(percentMultiplier(20, 'decrease'))).toBe('4/5');
    expect(() => percentMultiplier(5, 'double')).toThrow();
  });
  it('changements successifs : le réservoir (24,15) et la voiture (0,999306)', () => {
    expect(T(image(chainMultiplier([[30, 'decrease'], [15, 'increase']]), 30))).toBe('483/20');
    expect(T(chainMultiplier([[3, 'increase'], [2, 'decrease'], [1, 'decrease']]))).toBe('499653/500000');
  });
  it('−20 % puis +20 % ne revient pas au prix : −4 %', () => {
    const c = percentChange(chainMultiplier([[20, 'decrease'], [20, 'increase']]));
    expect(c.kind).toBe('decrease');
    expect(T(c.t)).toBe('4');
    expect(percentChange(frac(1)).kind).toBe('none');
  });
});

describe('proportional — règles « machines »', () => {
  it('lit les écritures du manuel', () => {
    expect(rule('2x').kind).toBe('linear');
    expect(rule('2x-1').kind).toBe('affine');
    expect(rule('x^2').kind).toBe('square');
    expect(rule('x²').kind).toBe('square');
    expect(T(rule('-0,5x').a)).toBe('-1/2');
    expect(T(rule('2x-1').at(3))).toBe('5');
    expect(() => rule('2y')).toThrow();
  });
  it('seule a·x est linéaire ; les autres ont un témoin', () => {
    expect(isLinear(rule('1,5x'))).toBe(true);
    expect(linearityWitnesses(rule('1,5x'))).toEqual([]);
    expect(linearityWitnesses(rule('2x-1'))[0].kind).toBe('zero');
    expect(linearityWitnesses(rule('x^2'))[0].kind).toBe('double');
  });
});
