import { describe, it, expect } from 'vitest';
import { divmod, packs, addPacks, multiplesBetween, divisors, gcd, lcm, commonMultiples, parityForm, oddSquareForm, digitSum, nineSplit, hundredSplit, divisibleBy, euclidText, isMultiple } from './arithUtils';

describe('paquets et restes', () => {
  it('euclidean division', () => { expect(divmod(23, 7)).toEqual({ q: 3, r: 2 }); expect(euclidText(23, 7)).toBe('23 = 7 × 3 + 2'); expect(divmod(0, 5)).toEqual({ q: 0, r: 0 }); });
  it('two odd numbers: the singles pair up', () => {
    const s = addPacks(7, 9, 2);
    expect(s).toMatchObject({ singlesA: 1, singlesB: 1, singles: 2, extraPack: 1, remainder: 0, isMultiple: true, totalPacks: 8 });
  });
  it('multiples of 7: remainders add mod 7', () => {
    expect(addPacks(14, 21, 7).isMultiple).toBe(true);
    const s = addPacks(12, 20, 7); expect(s).toMatchObject({ singlesA: 5, singlesB: 6, remainder: 4, extraPack: 1, isMultiple: false });
    expect(packs(12, 7)).toEqual({ packs: 1, singles: 5 });
  });
});
describe('multiples, diviseurs, pgcd', () => {
  it('lists', () => {
    expect(multiplesBetween(3, -7, 7)).toEqual([-6, -3, 0, 3, 6]);
    expect(divisors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
    expect(gcd(28, 21)).toBe(7); expect(lcm(6, 10)).toBe(30); expect(commonMultiples(6, 10, 70)).toEqual([30, 60]);
    expect(isMultiple(0, 7)).toBe(true); expect(isMultiple(-21, 7)).toBe(true);
  });
});
describe('parité', () => {
  it('forms 2k / 2k + 1 and the odd square', () => {
    expect(parityForm(13)).toEqual({ k: 6, odd: true }); expect(parityForm(20)).toEqual({ k: 10, odd: false }); expect(parityForm(-3)).toEqual({ k: -2, odd: true });
    expect(oddSquareForm(3)).toEqual({ n: 7, square: 49, m: 24 }); expect(2 * 24 + 1).toBe(49);
  });
});
describe('critères', () => {
  it('nine split proves the digit-sum rule', () => {
    const s = nineSplit(4725);
    expect(s.digitSum).toBe(18); expect(s.ninePart).toBe(4707); expect(s.nineTimes).toBe(523);
    expect(s.parts.map((p) => p.nines)).toEqual([999, 99, 9, 0]);
    expect(divisibleBy(4725, 9).ok).toBe(true); expect(divisibleBy(4725, 3).ok).toBe(true); expect(divisibleBy(2346, 9).ok).toBe(false); expect(divisibleBy(2346, 3).ok).toBe(true);
  });
  it('hundred split proves the rule for 4', () => {
    expect(hundredSplit(1316)).toEqual({ hundreds: 13, last: 16 }); expect(divisibleBy(1316, 4).ok).toBe(true); expect(divisibleBy(1318, 4).ok).toBe(false);
    expect(divisibleBy(731, 2).reason).toContain('impair'); expect(divisibleBy(1080, 10).ok).toBe(true); expect(digitSum(1080)).toBe(9);
  });
});
