import { describe, it, expect } from 'vitest';
import * as R from './relativeOps.js';
import * as P from './powers.js';

describe('relativeOps — lecture et écriture', () => {
  it('parseRel accepte virgule, point, vrai moins, chiffres arabes et fractions', () => {
    expect(R.parseRel('−2,5')).toEqual(P.rat(-5, 2));
    expect(R.parseRel('-2.5')).toEqual(P.rat(-5, 2));
    expect(R.parseRel('٣')).toEqual(P.rat(3));
    expect(R.parseRel('٠٫٤')).toEqual(P.rat(2, 5));
    expect(R.parseRel('3/4')).toEqual(P.rat(3, 4));
    expect(() => R.parseRel('abc')).toThrow();
  });
  it('relText / relTex : virgule décimale, vrai moins, fraction si non décimal', () => {
    expect(R.relText(P.rat(-5, 2))).toBe('−2,5');
    expect(R.relText(P.rat(6, 100))).toBe('0,06');
    expect(R.relText(P.rat(12))).toBe('12');
    expect(R.relText(P.rat(-1, 3))).toBe('−1/3');
    expect(R.relTex(P.rat(-5, 2))).toBe('-2{,}5');
    expect(R.relTex(P.rat(1, 100))).toBe('0{,}01');
    expect(R.relTex(P.rat(-1, 3))).toBe('-\\frac{1}{3}');
    expect(R.isFiniteDecimal(P.rat(7, 20))).toBe(true);
    expect(R.isFiniteDecimal(P.rat(1, 3))).toBe(false);
  });
});

describe('relativeOps — le produit', () => {
  it('la règle des signes, balayée sur des entiers et des décimaux', () => {
    const vals = ['-7', '-2,5', '-1', '0', '0,4', '3', '9'].map(R.parseRel);
    for (const a of vals) for (const b of vals) {
      const p = R.times(a, b);
      expect(P.sign(p)).toBe(R.productSign(a, b));
      expect(R.distance(p)).toEqual(P.mul(R.distance(a), R.distance(b)));
    }
  });
  it('a × 0 = 0 ; (−0,3) × (−0,2) = 0,06', () => {
    expect(R.times(R.parseRel('-12'), 0)).toEqual(P.rat(0));
    expect(R.relText(R.times(R.parseRel('-0,3'), R.parseRel('-0,2')))).toBe('0,06');
  });
  it('repeatedSum : (−2) + (−2) + (−2) = (−2) × 3', () => {
    expect(R.repeatedSum(P.rat(-2), 3).map(R.relText)).toEqual(['−2', '−4', '−6']);
    for (let n = 1; n <= 9; n += 1) expect(R.repeatedSum(P.rat(-2), n).at(-1)).toEqual(R.times(-2, n));
    expect(() => R.repeatedSum(1, 0)).toThrow();
  });
  it('distributeCheck : k × b + k × (−b) = k × 0 = 0 pour tout k, b', () => {
    for (const k of [-4, -1.5, 3]) for (const b of [4, -4, 0.5]) {
      const c = R.distributeCheck(R.parseRel(String(k)), R.parseRel(String(b)));
      expect(c.left).toEqual(c.right);
      expect(c.right).toEqual(P.rat(0));
    }
  });
});

describe('relativeOps — leçon 2 (plusieurs facteurs)', () => {
  const t = (r) => R.relText(r);
  it('product, negativesIn, signByParity', () => {
    expect(t(R.product(['-2', '3', '-1', '-4', '0,5']))).toBe('−12');
    expect(R.negativesIn(['-2', '3', '-1', '-4', '0,5'])).toBe(3);
    expect(R.signByParity(['-2', '3', '-1', '-4', '0,5'])).toBe(-1);
    expect(R.signByParity(['-2', '-3'])).toBe(1);
    expect(R.signByParity(['-2', '0', '-3'])).toBe(0);
    expect(t(R.product([]))).toBe('1');
  });
  it('opposite and square', () => {
    expect(t(R.opposite('-3'))).toBe('3');
    expect(t(R.opposite('8'))).toBe('−8');
    expect(t(R.opposite('0'))).toBe('0');
    expect(t(R.square('-1,5'))).toBe('2,25');
    expect(t(R.square('1,5'))).toBe('2,25');
  });
  it('factorize gives both sides of k×a ± k×b = k×(a ± b)', () => {
    const f = R.factorize('-4,7', '13', '3', '-');
    expect(t(f.split)).toBe('−47');
    expect(t(f.factored)).toBe('−47');
    const g = R.factorize('-3,2', '7', '3', '+');
    expect(t(g.split)).toBe('−32');
    expect(t(g.factored)).toBe('−32');
  });
});

describe('relativeOps — leçon 3 (le quotient)', () => {
  const t = (r) => R.relText(r);
  it('divide, missingFactor, quotientSign', () => {
    expect(t(R.divide('48', '-6'))).toBe('−8');
    expect(t(R.divide('-0,36', '-0,9'))).toBe('0,4');
    expect(t(R.divide('4', '-6'))).toBe('−2/3');
    expect(() => R.divide('3', '0')).toThrow();
    expect(t(R.missingFactor('-6', '48'))).toBe('−8');
    expect(t(R.missingFactor('-8', '-2'))).toBe('0,25');
    expect(R.quotientSign('-6', '3')).toBe(-1);
    expect(R.quotientSign('-6', '-3')).toBe(1);
    expect(R.quotientSign('0', '-3')).toBe(0);
    expect(() => R.quotientSign('2', '0')).toThrow();
  });
  it('every quotient inverts the product: b × (a ÷ b) = a', () => {
    for (const a of ['-99', '-7,5', '0', '4', '12,6']) for (const b of ['-20', '-0,4', '3', '2,5', '7']) {
      expect(R.sameValue(R.times(b, R.divide(a, b)), a)).toBe(true);
    }
  });
  it('writingsOf: the three writings are one number; −a/−b = a/b', () => {
    for (const [a, b] of [['2', '3'], ['5', '8'], ['-2', '3'], ['7', '-4']]) {
      const w = R.writingsOf(a, b);
      expect(w).toHaveLength(3);
      expect(w.every((x) => R.sameValue(x.value, w[0].value))).toBe(true);
      expect(R.sameValue(w[0].value, R.opposite(R.divide(a, b)))).toBe(true);
    }
    expect(R.sameValue(R.divide('-2', '-3'), R.divide('2', '3'))).toBe(true);
    expect(R.sameValue('-4/6', R.divide('4', '-6'))).toBe(true);
    expect(R.sameValue('2/-3', '-2/3')).toBe(true);
  });
  it('isFiniteDecimal: −2/3 is not a decimal, −1/4 is', () => {
    expect(R.isFiniteDecimal(R.divide('-2', '3'))).toBe(false);
    expect(R.isFiniteDecimal(R.divide('-1', '4'))).toBe(true);
  });
  it('evaluate follows the priorities and writes its steps', () => {
    expect(t(R.evaluate('5 − (3 × (−4) + 7)').value)).toBe('10');
    expect(R.evaluate('5 − (3 × (−4) + 7)').steps).toEqual(['5 − (3 × (−4) + 7)', '5 − (−12 + 7)', '5 − (−5)', '10']);
    expect(t(R.evaluate('(−18) ÷ (2 − 5) + 4 × (−0,5)').value)).toBe('4');
    expect(t(R.evaluate('20 − 4 × 3').value)).toBe('8');
    expect(t(R.evaluate('−(2 + 3) × 4').value)).toBe('−20');
    expect(t(R.evaluate('(9 + 3 × (−5)) ÷ (1 + 2 × (−2))').value)).toBe('2');
    expect(t(R.evaluate('−7 + 10 − 5').value)).toBe('−2');
    expect(t(R.evaluate('7 ÷ (−4)').value)).toBe('−1,75');
    expect(t(R.evaluate('2 ÷ 3').value)).toBe('2/3');
    expect(() => R.evaluate('4 ÷ (3 − 3)')).toThrow();
    expect(() => R.evaluate('4 ++')).toThrow();
  });
});
