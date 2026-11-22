import { describe, it, expect } from 'vitest';
import * as F from './fractions2.js';
import * as D from './decimals.js';

describe('fractions2 — E1 (kasr-hasil-qisma)', () => {
  it('clearDecimals : le rang qui rend le diviseur naturel', () => {
    expect(F.clearDecimals('4,2', '0,35')).toEqual({ ka: 1, kb: 2, k: 2, a10: 420, b10: 35 });
    expect(F.clearDecimals('15,96', '2,8')).toMatchObject({ kb: 1, k: 2, a10: 1596, b10: 280 });
    expect(F.clearDecimals('4,6', '0,7')).toMatchObject({ k: 1, a10: 46, b10: 7 });
    expect(F.clearDecimals('8', '3')).toMatchObject({ k: 0, a10: 8, b10: 3 });
    expect(F.clearDecimals('2,50', '1,0')).toMatchObject({ kb: 0, k: 1, a10: 25, b10: 10 });
    expect(() => F.clearDecimals('1', '0')).toThrow();
  });
  it('decimalQuotientBracket : 8/3, 9/4, 12,5/0,35, 5/7', () => {
    const t = (r) => [D.format(r.lo), D.format(r.hi), r.exact];
    expect(t(F.decimalQuotientBracket('8', '3', 0))).toEqual(['2', '3', false]);
    expect(t(F.decimalQuotientBracket('8', '3', 1))).toEqual(['2,6', '2,7', false]);
    expect(t(F.decimalQuotientBracket('8', '3', 2))).toEqual(['2,66', '2,67', false]);
    expect(t(F.decimalQuotientBracket('9', '4', 2))).toEqual(['2,25', '2,25', true]);
    expect(t(F.decimalQuotientBracket('12,5', '0,35', 2))).toEqual(['35,71', '35,72', false]);
    expect(t(F.decimalQuotientBracket('5', '7', 2))).toEqual(['0,71', '0,72', false]);
    expect(t(F.decimalQuotientBracket('4,6', '0,7', 2))).toEqual(['6,57', '6,58', false]);
  });
  it('decimalQuotientBracket : balayage — b × lo ≤ a < b × hi, largeur 10^-k', () => {
    for (let a10 = 1; a10 <= 999; a10 += 7) for (const b of ['2', '3', '7', '12', '0,7', '1,8', '0,35']) {
      const a = D.format(D.make(a10, 1));
      for (const k of [0, 1, 2]) {
        const r = F.decimalQuotientBracket(a, b, k);
        expect(F.fitsAtRank(a, b, D.format(r.lo)).verdict).not.toBe('over');
        const hi = F.fitsAtRank(a, b, D.format(r.hi)).verdict;
        expect(hi).toBe(r.exact ? 'exact' : 'over');
        expect(r.hi.n - r.lo.n).toBe(r.exact ? 0 : 1);
      }
    }
  });
  it('fitsAtRank : 3 × 2,66 laisse 0,02 ; 3 × 2,67 déborde de 0,01 ; 4 × 2,25 tombe juste', () => {
    const f = (a, b, q) => { const r = F.fitsAtRank(a, b, q); return [r.verdict, D.format(r.gap)]; };
    expect(f('8', '3', '2,66')).toEqual(['fits', '0,02']);
    expect(f('8', '3', '2,67')).toEqual(['over', '0,01']);
    expect(f('9', '4', '2,25')).toEqual(['exact', '0,00']);
    expect(f('4,6', '0,7', '6,57')).toEqual(['fits', '0,001']);
    expect(F.fitsAtRank('8', '3', '2').product).toEqual(D.make(6, 0));
  });
  it('isDecimalQuotient : 9/4 oui, 8/3 non, 4,6/0,7 non, 13,5/1,8 oui, 5/6 non, 7/8 oui', () => {
    expect(['9|4', '8|3', '4,6|0,7', '13,5|1,8', '5|6', '7|8', '3,6|0,08'].map((s) => F.isDecimalQuotient(...s.split('|')))).toEqual([true, false, false, true, false, true, true]);
  });
});

describe('fractions2 — E2 (jam-tarh-kusur)', () => {
  it('isMultipleCase : 12/4 oui, 3/2 non (3AM)', () => {
    expect(F.isMultipleCase(12, 4)).toMatchObject({ big: 12n, small: 4n, k: 3n });
    expect(F.isMultipleCase(7, 7)).toMatchObject({ k: 1n });
    expect(F.isMultipleCase(3, 2)).toBe(null);
    expect(F.isMultipleCase(6, 4)).toBe(null);
  });
  it('rewriteTo refuse un non-multiple', () => {
    expect(F.rewriteTo('1/4', 12)).toMatchObject({ k: 3n, n: 3n, d: 12n });
    expect(() => F.rewriteTo('1/4', 10)).toThrow();
  });
  it('sumMultipleCase : 5/12 + 1/4 = 8/12 = 2/3 ; 4/9 + 5/18 + 1/6 = 8/9 ; 3AM refusé ; négatif refusé', () => {
    const s = F.sumMultipleCase([{ p: '5/12' }, { p: '1/4' }]);
    expect(s.total).toMatchObject({ n: 8n, d: 12n }); expect(s.reduced).toEqual({ n: 2n, d: 3n });
    expect(F.sumMultipleCase([{ p: '4/9' }, { p: '5/18' }, { p: '1/6' }]).reduced).toEqual({ n: 8n, d: 9n });
    expect(F.sumMultipleCase([{ p: '3/4' }, { p: '5/12', sign: -1 }]).reduced).toEqual({ n: 1n, d: 3n });
    expect(() => F.sumMultipleCase([{ p: '1/3' }, { p: '1/2' }])).toThrow();
    expect(() => F.sumMultipleCase([{ p: '1/4' }, { p: '3/4', sign: -1 }])).toThrow();
  });
  it('complement : 1 − 5/9 = 4/9 ; 2 − 1/6 = 11/6', () => {
    expect(F.complement('5/9')).toMatchObject({ n: 4n, d: 9n });
    expect(F.complement('1/6', 2)).toMatchObject({ n: 11n, d: 6n });
    expect(() => F.complement('7/6')).toThrow();
  });
});

describe('fractions2 — E3 (jida-kasrayn)', () => {
  it('productGrid : 2/3 × 3/4 = 6/12 = 1/2 sur une grille 3 × 4', () => {
    const g = F.productGrid('2/3', '3/4');
    expect(g).toMatchObject({ cols: 3n, rows: 4n, shaded: 6n, total: 12n, reduced: { n: 1n, d: 2n } });
    expect(F.productGrid('3/2', '2/3').reduced).toEqual({ n: 1n, d: 1n });
    expect(F.productGrid('7/4', '4/3').reduced).toEqual({ n: 7n, d: 3n });
  });
  it('timesNumber : 4 × 3/11 = 12/11 ; 5/7 × 2,8 = 14/7 ; 2 × 3/5 = 6/5', () => {
    expect(F.timesNumber(4, '3/11')).toMatchObject({ n: 12n, d: 11n });
    const y = F.timesNumber('2,8', '5/7');
    expect(y.n * 7n).toBe(14n * y.d);
    expect(F.timesNumber(2, '3/5')).toMatchObject({ n: 6n, d: 5n });
  });
  it('fractionOf : 3/8 de 48 = 18 ; 3/4 de 2/5 = 6/20', () => {
    const a = F.fractionOf('3/8', 48); expect(a.n).toBe(18n * a.d);
    expect(F.fractionOf('3/4', '2/5')).toMatchObject({ n: 6n, d: 20n });
  });
  it('ofRemainder : 1/4 dépensé puis 2/3 du reste = 6/12 ; 1/3 puis 1/2 du reste = 2/6', () => {
    expect(F.ofRemainder('1/4', '2/3')).toMatchObject({ n: 6n, d: 12n });
    expect(F.ofRemainder('1/3', '1/2')).toMatchObject({ n: 2n, d: 6n });
  });
});

describe('fractions2 — E4 (muqarana-kasrayn)', () => {
  it('compareCase : les quatre cas de 2AM et le cas de 3AM', () => {
    expect(F.compareCase('5/8', '7/8')).toBe('sameDen');
    expect(F.compareCase('3/5', '3/8')).toBe('sameNum');
    expect(F.compareCase('3/4', '7/12')).toBe('multiple');
    expect(F.compareCase('9/7', '8/9')).toBe('viaOne');
    expect(F.compareCase('2/3', '3/5')).toBeNull();
    expect(F.compareCase('3,2/4', '11,3/20')).toBe('multiple');
  });
  it('compareSimple : signe exact, écriture sur le plus grand dénominateur', () => {
    expect(F.compareSimple('3/4', '7/12')).toMatchObject({ sign: 1, method: 'multiple', rewritten: { D: 12n, p: { n: 9, d: 12 } } });
    expect(F.compareSimple('5/8', '7/8').sign).toBe(-1);
    expect(F.compareSimple('2,5/4', '5/8').sign).toBe(0);
    expect(F.compareSimple('2,5/4', '5,5/8').sign).toBe(-1);
    expect(F.compareSimple('7/11', '4/3')).toMatchObject({ sign: -1, method: 'viaOne' });
    expect(() => F.compareSimple('2/3', '3/5')).toThrow();
  });
  it('orderSimple et vsOne', () => {
    expect(F.orderSimple(['2/3', '5/9', '7/9'])).toEqual(['5/9', '2/3', '7/9']);
    expect(F.orderSimple(['9/13', '15/11', '4/13', '11/13', '12/11'], 'desc')).toEqual(['15/11', '12/11', '11/13', '9/13', '4/13']);
    expect(() => F.orderSimple(['3/4', '1/3'])).toThrow();
    expect([F.vsOne('7/9'), F.vsOne('5/5'), F.vsOne('9/8')]).toEqual([-1, 0, 1]);
  });
});
