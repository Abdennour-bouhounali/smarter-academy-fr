import { describe, it, expect } from 'vitest';
import {
  gcd, reduce, isDecimalFraction, longDivision, decimalText, classify, familiesOf, truncatedDigits, bracketAt,
  landsAt, roundedAt, sqrtIntegerBracket, sqrtTenthBracket, squareOfDecimal,
} from './realsUtils';

describe('fractions', () => {
  it('reduces and detects decimal denominators', () => {
    expect(reduce(6, -8)).toEqual({ p: -3, q: 4 });
    expect(gcd(84, 126)).toBe(42);
    expect(isDecimalFraction(3, 8)).toBe(true);
    expect(isDecimalFraction(7, 20)).toBe(true);
    expect(isDecimalFraction(1, 3)).toBe(false);
    expect(isDecimalFraction(5, 6)).toBe(false);
    expect(isDecimalFraction(9, 12)).toBe(true); // 3/4
  });
});

describe('longDivision — the remainder decides', () => {
  it('3/8 stops (remainder 0)', () => {
    const d = longDivision(3, 8);
    expect(d.terminates).toBe(true);
    expect(d.digits).toEqual([3, 7, 5]);
    expect(decimalText(3, 8)).toEqual({ text: '0,375', period: null, exact: true });
  });
  it('1/3 repeats with period 3', () => {
    const d = longDivision(1, 3);
    expect(d.terminates).toBe(false);
    expect(d.periodLength).toBe(1);
    expect(decimalText(1, 3).period).toBe('3');
  });
  it('2/7 has a period of six digits and 5/6 a pre-period', () => {
    expect(longDivision(2, 7).periodLength).toBe(6);
    const d = longDivision(5, 6);
    expect(d.periodStart).toBe(1);
    expect(d.periodLength).toBe(1);
    expect(decimalText(5, 6).text).toBe('0,83333333…');
  });
  it('integers have no digits, negatives keep their sign', () => {
    expect(decimalText(9, 3)).toEqual({ text: '3', period: null, exact: true });
    expect(decimalText(-7, 1).text).toBe('−7');
    expect(decimalText(-9, 4).text).toBe('−2,25');
    expect(decimalText(-1, 3).text).toBe('−0,33333333…');
  });
});

describe('classify / familiesOf', () => {
  it('finds the smallest family', () => {
    expect(classify({ kind: 'rational', p: 7, q: 1 })).toBe('N');
    expect(classify({ kind: 'rational', p: -7, q: 1 })).toBe('Z');
    expect(classify({ kind: 'rational', p: 9, q: 3 })).toBe('N');  // √9 = 3
    expect(classify({ kind: 'rational', p: 3, q: 4 })).toBe('D');
    expect(classify({ kind: 'rational', p: 1, q: 3 })).toBe('Q');
    expect(classify({ kind: 'irrational', id: 'sqrt2' })).toBe('R');
    expect(familiesOf({ kind: 'rational', p: 3, q: 4 })).toEqual(['D', 'Q', 'R']);
  });
});

describe('zoom digits and brackets (exact, truncated)', () => {
  const s2 = { kind: 'irrational', id: 'sqrt2' };
  const third = { kind: 'rational', p: 1, q: 3 };
  const half3 = { kind: 'rational', p: 3, q: 2 };
  it('truncates, never rounds', () => {
    expect(truncatedDigits(s2, 3)).toBe('1,414');
    expect(truncatedDigits(s2, 4)).toBe('1,4142');
    expect(truncatedDigits(third, 3)).toBe('0,333');
    expect(truncatedDigits(half3, 2)).toBe('1,50');
    expect(truncatedDigits(half3, 0)).toBe('1');
  });
  it('brackets √2 at every zoom level', () => {
    expect(bracketAt(s2, 2)).toMatchObject({ lo: 1.41, hi: 1.42 });
    expect(bracketAt(s2, 4)).toMatchObject({ lo: 1.4142, hi: 1.4143 });
    expect(bracketAt(s2, 0)).toMatchObject({ lo: 1, hi: 2 });
  });
  it('lands on a graduation only for terminating decimals', () => {
    expect(landsAt(half3, 1)).toBe(true);
    expect(landsAt(half3, 0)).toBe(false);
    expect(landsAt({ kind: 'rational', p: 2, q: 8 }, 2)).toBe(true);
    for (let k = 0; k < 8; k += 1) {
      expect(landsAt(third, k)).toBe(false);
      expect(landsAt(s2, k)).toBe(false);
    }
  });
  it('rounds with the next digit', () => {
    expect(roundedAt(s2, 2)).toBe(1.41);
    expect(roundedAt(s2, 3)).toBe(1.414);
    expect(roundedAt({ kind: 'irrational', id: 'pi' }, 2)).toBe(3.14);
    expect(roundedAt({ kind: 'rational', p: 2, q: 3 }, 2)).toBe(0.67);
  });
});

describe('square roots by squares', () => {
  it('brackets √10 between 3 and 4, then 3,1 and 3,2', () => {
    expect(sqrtIntegerBracket(10)).toEqual({ lo: 3, hi: 4 });
    expect(sqrtTenthBracket(10)).toEqual({ lo: 3.1, hi: 3.2 });
    expect(sqrtIntegerBracket(50)).toEqual({ lo: 7, hi: 8 });
    expect(sqrtTenthBracket(50)).toEqual({ lo: 7, hi: 7.1 });
  });
  it('the square of an approximation never gives 2', () => {
    expect(squareOfDecimal(1.41, 2)).toBe(1.9881);
    expect(squareOfDecimal(1.414, 3)).toBe(1.999396);
    expect(squareOfDecimal(1.4142, 4)).toBe(1.99996164);
  });
});
