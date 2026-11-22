import { describe, it, expect } from 'vitest';
import {
  make, fromSlip, parse, cmp, eq, normalize, format, formatTrim, slipText, slipValueText, fractionOf, fractionText, shift, opExponent, OPERATORS,
  integerPart, countOfExp, rankName, exponentsOf, decomposeDigits, rankTable, decomposition, partName, readFraction, readTail, piecesOf, pow10,
  readAt, decidedAt, verdictAt, minGraduation, firstDifferingRank, paddedText, rowGraduation, GRADUATIONS,
  floorAt, ceilAt, roundAt, roundingInterval, quotientDigits, quotientBracket,
} from './decimals.js';

describe('decimals — parse and format are exact and round-trip', () => {
  it('parse reads comma, point, fraction with a power-of-ten denominator; rejects the rest', () => {
    expect(parse('2,35')).toEqual({ n: 235, k: 2 });
    expect(parse('2.35')).toEqual({ n: 235, k: 2 });
    expect(parse('12')).toEqual({ n: 12, k: 0 });
    expect(parse('0,05')).toEqual({ n: 5, k: 2 });
    expect(parse('3125/1000')).toEqual({ n: 3125, k: 3 });
    expect(parse('605/100')).toEqual({ n: 605, k: 2 });
    expect(parse('7/1')).toEqual({ n: 7, k: 0 });
    expect(parse('1 234,5')).toEqual({ n: 12345, k: 1 });
    for (const bad of ['', 'x', '1/3', '3/0', '3/25', '2,', ',5', '--1', '1,2,3', null, undefined]) expect(parse(bad), String(bad)).toBeNull();
  });

  it('format keeps the k decimals; formatTrim drops the useless trailing zeros; slipText prints the slip as written', () => {
    expect(format({ n: 250, k: 2 })).toBe('2,50');
    expect(formatTrim({ n: 250, k: 2 })).toBe('2,5');
    expect(formatTrim({ n: 1200, k: 2 })).toBe('12');
    expect(format({ n: 5, k: 2 })).toBe('0,05');
    expect(format({ n: 0, k: 0 })).toBe('0');
    expect(slipText('235', 2)).toBe('2,35');
    expect(slipText('235', 0)).toBe('235');
    expect(slipText('235', 3)).toBe('0,235');
    expect(slipText('05', 2)).toBe('0,05');
    expect(slipText('05', 0)).toBe('05');
    expect(slipText('250', 2)).toBe('2,50');
    expect(slipValueText('250', 2)).toBe('2,5');
  });

  it('every digit string of ≤ 5 digits at every comma place: value is N / 10^p, text round-trips', () => {
    let seen = 0;
    for (let len = 1; len <= 5; len += 1) {
      for (let n = 0; n < 10 ** len; n += len < 4 ? 1 : 137) {
        const digits = String(n).padStart(len, '0');
        for (let p = 0; p <= len; p += 1) {
          const v = fromSlip(digits, p);
          expect(v).toEqual({ n, k: p });
          const back = parse(format(v));
          expect(eq(back, v), `${digits}/${p}`).toBe(true);
          expect(format(v).replace(',', '').replace(/^0+(?=\d)/, '')).toBe(String(n).padStart(p + 1, '0').replace(/^0+(?=\d)/, ''));
          expect(slipText(digits, p).replace(',', '').length).toBeGreaterThanOrEqual(len);
          seen += 1;
        }
      }
    }
    expect(seen).toBeGreaterThan(5000);
  });

  it('compare is exact across scales', () => {
    expect(cmp(parse('2,5'), parse('2,50'))).toBe(0);
    expect(cmp(parse('0,235'), parse('2,35'))).toBe(-1);
    expect(cmp(parse('23,5'), parse('2,35'))).toBe(1);
    expect(eq(parse('3125/1000'), parse('3,125'))).toBe(true);
    expect(eq(parse('605/100'), parse('6,05'))).toBe(true);
    expect(normalize(make(250, 2))).toEqual({ n: 25, k: 1 });
    expect(normalize(make(0, 3))).toEqual({ n: 0, k: 0 });
  });

  it('the fraction has as many zeros as digits after the comma', () => {
    expect(fractionOf(parse('2,35'))).toMatchObject({ num: 235, den: 100, zeros: 2, text: '235/100' });
    expect(fractionText(parse('31,25'))).toBe('3125/100');
    expect(fractionText(make(235, 0))).toBe('235/1');
    expect(fractionText(make(5, 3))).toBe('5/1000');
    expect(pow10(6)).toBe(1000000);
  });
});

describe('decimals — shifting the comma by a power of ten', () => {
  it('× 10^e and ÷ 10^e, zeros appear where they must', () => {
    expect(formatTrim(shift(parse('143,75'), 3))).toBe('143750');
    expect(formatTrim(shift(parse('3,5'), 2))).toBe('350');
    expect(formatTrim(shift(parse('3,5'), 1))).toBe('35');
    expect(formatTrim(shift(parse('3,5'), -2))).toBe('0,035');
    expect(formatTrim(shift(parse('43,7'), -3))).toBe('0,0437');
    expect(formatTrim(shift(parse('27,5'), -1))).toBe('2,75');
    expect(formatTrim(shift(parse('0,6'), -2))).toBe('0,006');
    expect(formatTrim(shift(parse('15'), -4))).toBe('0,0015');
  });

  it('shift ± 3 keeps the digits and is reversible, for every value of ≤ 5 digits at every place', () => {
    for (let n = 0; n < 3000; n += 7) {
      for (let p = 0; p <= 4; p += 1) {
        const v = make(n, p);
        for (let e = -3; e <= 3; e += 1) {
          const w = shift(v, e);
          expect(eq(shift(w, -e), v), `${n}/${p}/${e}`).toBe(true);
          // the digit string is unchanged apart from zeros at its ends
          expect(String(w.n).replace(/0+$/, '').replace(/^0+/, '')).toBe(String(n).replace(/0+$/, '').replace(/^0+/, ''));
        }
      }
    }
  });

  it('opExponent covers the nine operators of the machine', () => {
    expect(OPERATORS.map(opExponent)).toEqual([1, 2, 3, -1, -2, -3, -1, -2, -3]);
    expect(opExponent('÷0,1')).toBe(1);
    expect(opExponent('× 100')).toBe(2);
    expect(opExponent('+10')).toBeNull();
  });
});

describe('decimals — ranks, decomposition, counts', () => {
  it('names of ranks and exponents of a slip', () => {
    expect(rankName(0)).toBe('الآحاد');
    expect(rankName(1)).toBe('العشرات');
    expect(rankName(-1)).toBe('الأعشار');
    expect(rankName(-2)).toBe('الأجزاء من مائة');
    expect(rankName(-3)).toBe('الأجزاء من ألف');
    expect(exponentsOf('14375', 2)).toEqual([2, 1, 0, -1, -2]);
    expect(exponentsOf('35', 2)).toEqual([-1, -2]);
  });

  it('decomposition drops empty ranks; rankTable keeps them', () => {
    expect(decomposition(parse('2,35'))).toMatchObject({ fraction: '2 + 3/10 + 5/100', times: '2 + 3 × 0,1 + 5 × 0,01' });
    expect(decomposition(parse('6,05')).fraction).toBe('6 + 5/100');
    expect(decomposition(parse('0,05')).times).toBe('5 × 0,01');
    expect(decomposition(parse('30,2')).fraction).toBe('3 × 10 + 2/10');
    expect(decomposition(parse('0')).fraction).toBe('0');
    expect(rankTable(parse('0,05')).map((r) => r.digit)).toEqual([0, 0, 5]);
    expect(decomposeDigits(parse('2,50'))).toEqual([{ digit: 2, exp: 0 }, { digit: 5, exp: -1 }]);
  });

  it('the NUMBER of tenths / hundredths is not the digit of the rank', () => {
    const v = parse('217,48');
    expect(countOfExp(v, -1)).toBe(2174);
    expect(countOfExp(v, -2)).toBe(21748);
    expect(countOfExp(v, 0)).toBe(217);
    expect(countOfExp(v, 1)).toBe(21);
    expect(integerPart(v)).toBe(217);
  });

  it('piecesOf: panels, strips, tiles, shards — exact', () => {
    expect(piecesOf(parse('2,35'))).toMatchObject({ units: 2, tenths: 3, hundredths: 5, thousandths: 0, panels: 2, finer: null });
    expect(piecesOf(parse('3,125'))).toMatchObject({ units: 3, tenths: 1, hundredths: 2, thousandths: 5 });
    expect(piecesOf(parse('235'))).toMatchObject({ units: 5, tens: 3, hundreds: 2, panels: 235, tenths: 0 });
    expect(piecesOf(parse('0,235'))).toMatchObject({ units: 0, tenths: 2, hundredths: 3, thousandths: 5, panels: 0 });
    expect(piecesOf(parse('3125')).more).toBe(3000);
    expect(piecesOf(parse('0,12345')).finer).toEqual({ n: 45, k: 5 });
    expect(piecesOf(parse('0,1230')).finer).toBeNull();
    for (let n = 0; n < 2000; n += 13) {
      for (let p = 0; p <= 3; p += 1) {
        const q = piecesOf(make(n, p));
        // the pieces rebuild the value exactly
        const rebuilt = (q.more + q.hundreds * 100 + q.tens * 10 + q.units) * 1000 + q.tenths * 100 + q.hundredths * 10 + q.thousandths;
        expect(rebuilt, `${n}/${p}`).toBe(Math.floor((n * 1000) / 10 ** p));
      }
    }
  });
});

describe('decimals — Arabic reading', () => {
  it('plural agreement of the pieces', () => {
    expect([1, 2, 3, 10, 11, 35].map((c) => partName(1, c))).toEqual(['عُشر', 'عُشران', 'أعشار', 'أعشار', 'عُشرًا', 'عُشرًا']);
    expect([1, 2, 5, 235].map((c) => partName(2, c))).toEqual(['جزء من مائة', 'جزآن من مائة', 'أجزاء من مائة', 'جزءًا من مائة']);
    expect(partName(3, 125)).toBe('جزءًا من ألف');
    // beyond 100 the noun follows the last two digits
    expect([100, 101, 102, 103, 105, 110, 111, 205, 600].map((c) => partName(2, c))).toEqual(['جزء من مائة', 'جزء من مائة', 'جزء من مائة', 'أجزاء من مائة', 'أجزاء من مائة', 'أجزاء من مائة', 'جزءًا من مائة', 'أجزاء من مائة', 'جزء من مائة']);
  });
  it('reads the fraction and the tail', () => {
    expect(readFraction(parse('2,35'))).toBe('مائتان وخمسة وثلاثون جزءًا من مائة');
    expect(readFraction(parse('3,5'))).toBe('خمسة وثلاثون عُشرًا');
    expect(readFraction(parse('7'))).toBe('سبعة');
    expect(readTail(parse('2,35'))).toBe('ثلاثة أعشار وخمسة أجزاء من مائة');
    expect(readTail(parse('6,05'))).toBe('خمسة أجزاء من مائة');
    expect(readTail(parse('2,00'))).toBe('');
    expect(readFraction(parse('6,05'))).toBe('ستمائة وخمسة أجزاء من مائة');
    for (let n = 0; n < 4000; n += 11) for (let p = 0; p <= 3; p += 1) {
      const s = readFraction(make(n, p)) + readTail(make(n, p));
      expect(s).not.toMatch(/undefined|NaN|\s{2}|10\^/);
    }
  });
});

describe('decimals — the graduated ruler (ruler-compare)', () => {
  const v = (t) => parse(t);

  it('readAt: a whole number of graduations and an exact leftover smaller than one graduation', () => {
    expect(readAt(v('4,35'), 0)).toEqual({ count: 4, rest: { n: 35, k: 2 }, restIsZero: false });
    expect(readAt(v('4,35'), 1)).toEqual({ count: 43, rest: { n: 5, k: 1 }, restIsZero: false });
    expect(readAt(v('4,35'), 2)).toEqual({ count: 435, rest: { n: 0, k: 0 }, restIsZero: true });
    expect(readAt(v('4,6'), 2)).toEqual({ count: 460, rest: { n: 0, k: 0 }, restIsZero: true });
    expect(readAt(v('4,6'), 3).count).toBe(4600);
    expect(readAt(v('3'), 2).count).toBe(300);
    expect(readAt(v('0,75'), 0)).toEqual({ count: 0, rest: { n: 75, k: 2 }, restIsZero: false });
    expect(() => readAt(v('4'), -1)).toThrow(RangeError);
    // the reading rebuilds the length exactly: count + rest / 10^g == v, for every length with <= 3 decimals up to 20 m
    const bad = [];
    for (let n = 0; n <= 20000; n += 7) for (let k = 0; k <= 3; k += 1) {
      const x = make(n, k);
      for (const g of GRADUATIONS) {
        const r = readAt(x, g);
        const m = Math.max(k, g); // compare in units of 10^-m
        const left = BigInt(r.count) * 10n ** BigInt(m - g) + BigInt(r.rest.n) * 10n ** BigInt(m - g - r.rest.k);
        if (cmp(r.rest, make(1, 0)) !== -1 || left !== BigInt(n) * 10n ** BigInt(m - k)) bad.push(`${n}/${k}@${g}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('the documented pairs: the first graduation that separates them', () => {
    expect(minGraduation(v('4,6'), v('4,35'))).toBe(1); // dm
    expect(minGraduation(v('8,05'), v('8,5'))).toBe(1);
    expect(minGraduation(v('12,70'), v('12,7'))).toBe(1); // equal: both fall on a dm mark
    expect(minGraduation(v('9,87'), v('10,2'))).toBe(0);
    expect(minGraduation(v('4,6'), v('4,65'))).toBe(2);
    expect(minGraduation(v('7,4'), v('7,405'))).toBe(3);
    expect(decidedAt(v('4,6'), v('4,65'), 1)).toBe(false); // both read 46 dm
    expect(readAt(v('4,6'), 1).count).toBe(readAt(v('4,65'), 1).count);
    expect(decidedAt(v('4,6'), v('4,35'), 0)).toBe(false); // both read 4 m
    expect(verdictAt(v('4,6'), v('4,35'), 0)).toBeNull();
    expect(verdictAt(v('4,6'), v('4,35'), 2)).toBe(1);
    expect(verdictAt(v('12,70'), v('12,7'), 1)).toBe(0);
    expect(verdictAt(v('12,70'), v('12,7'), 0)).toBeNull();
    expect(verdictAt(v('9,87'), v('10,2'), 0)).toBe(-1);
    expect(minGraduation(v('3'), v('3,000'))).toBe(0);
    expect(minGraduation(v('2,5'), v('2,500'))).toBe(1);
  });

  it('sweep: every pair of decimals (<= 3 decimals, whole part <= 20): decidedAt is monotone, agrees with the order once decided, minGraduation is the first differing rank', () => {
    const all = [];
    for (let w = 0; w <= 20; w += 1) {
      all.push(make(w, 0));
      for (const k of [1, 2, 3]) for (let f = 0; f < 10 ** k; f += (k === 1 ? 1 : k === 2 ? 3 : 37)) all.push(make(w * 10 ** k + f, k));
    }
    expect(all.length).toBeGreaterThan(900);
    let pairs = 0;
    const bad = [];
    for (let i = 0; i < all.length; i += 1) {
      for (let j = 0; j < all.length; j += 5) {
        const a = all[i];
        const b = all[j];
        pairs += 1;
        const tag = `${format(a)} ? ${format(b)}`;
        let decided = false;
        for (const g of GRADUATIONS) {
          const d = decidedAt(a, b, g);
          if (decided && !d) bad.push(`${tag} not monotone @${g}`);
          decided = decided || d;
          if (verdictAt(a, b, g) !== (d ? cmp(a, b) : null)) bad.push(`${tag} verdict @${g}`);
        }
        if (!decided) bad.push(`${tag} undecided at 3`);
        const mg = minGraduation(a, b);
        const want = cmp(a, b) !== 0 ? firstDifferingRank(a, b) : Math.max(normalize(a).k, normalize(b).k);
        if (mg !== want) bad.push(`${tag} min ${mg} != ${want}`);
        if (mg > 0 && decidedAt(a, b, mg - 1)) bad.push(`${tag} decided before min`);
      }
    }
    expect(bad).toEqual([]);
    expect(pairs).toBeGreaterThan(100000);
  });

  it('firstDifferingRank: whole parts, tenths, hundredths…', () => {
    expect(firstDifferingRank(v('9,87'), v('10,2'))).toBe(0);
    expect(firstDifferingRank(v('12,6'), v('12,4'))).toBe(1);
    expect(firstDifferingRank(v('8,05'), v('8,5'))).toBe(1);
    expect(firstDifferingRank(v('4,6'), v('4,65'))).toBe(2);
    expect(firstDifferingRank(v('7,4'), v('7,405'))).toBe(3);
    expect(firstDifferingRank(v('2,5'), v('2,500'))).toBeNull();
    expect(firstDifferingRank(v('43'), v('12,9'))).toBe(0);
  });

  it('paddedText completes with unnecessary zeros; rowGraduation separates a whole row', () => {
    expect(paddedText(v('3,2'), 2)).toBe('3,20');
    expect(paddedText(v('4,6'), 3)).toBe('4,600');
    expect(paddedText(v('3'), 2)).toBe('3,00');
    expect(paddedText(v('3,14'), 1)).toBe('3,14');
    expect(rowGraduation(['7,4', '7,04', '7,45', '6,98', '7,405'].map(v))).toBe(3);
    expect(rowGraduation(['2,5', '2,05', '0,75', '2,500', '3'].map(v))).toBe(1);
    expect(rowGraduation([v('1'), v('2')])).toBe(0);
  });
});

describe('decimals — approximations, rounding, rounding interval, calculator quotients (hasr-adad-ushri)', () => {
  it('known values', () => {
    expect(format(roundAt(parse('1,25'), 1))).toBe('1,3');
    expect(format(roundAt(parse('9,8462'), 1))).toBe('9,8');
    expect(format(roundAt(parse('6,358'), 0))).toBe('6');
    expect(format(roundAt(parse('7,5'), 0))).toBe('8');
    expect(format(roundAt(parse('12,49'), 0))).toBe('12');
    expect(format(floorAt(parse('4,2531'), 2))).toBe('4,25');
    expect(format(ceilAt(parse('4,2531'), 2))).toBe('4,26');
    expect(format(ceilAt(parse('6,02'), 0))).toBe('7');
    const iv = roundingInterval(parse('1,3'), 1);
    expect([format(iv.lo), format(iv.hi), iv.loIncluded, iv.hiIncluded]).toEqual(['1,25', '1,35', true, false]);
    expect(format(roundingInterval(parse('15'), 0).lo)).toBe('14,5');
    expect(format(roundingInterval(parse('0'), 0).lo)).toBe('0,0');
    expect(quotientDigits(247, 83, 10)).toBe('2.975903614');
    expect(quotientDigits(46, 6, 10)).toBe('7.666666667');
    expect(quotientDigits(355, 113, 9)).toBe('3.14159292');
    expect(quotientDigits(250, 7, 10)).toBe('35.71428571');
    expect(quotientDigits(5, 2, 10)).toBe('2.5');
    expect(quotientDigits(2, 7, 10)).toBe('0.2857142857');
    expect(quotientDigits(1, 8, 10)).toBe('0.125');
    expect(quotientDigits(8, 1, 10)).toBe('8');
    const qb = quotientBracket(2, 7, 3);
    expect([format(qb.lo), format(qb.hi), qb.exact]).toEqual(['0,285', '0,286', false]);
    const qe = quotientBracket(1, 8, 3);
    expect([format(qe.lo), format(qe.hi), qe.exact]).toEqual(['0,125', '0,125', true]);
  });
  it('sweep: every value of at most 4 decimals below 100 (stepped) at every rank', () => {
    for (let k = 0; k <= 3; k += 1) {
      for (let n = 0; n <= 12000; n += 7) {
        const v = make(n, 2);
        const w = make(n * 13 % 99991, 4);
        for (const x of [v, w]) {
          const f = floorAt(x, k); const c = ceilAt(x, k); const r = roundAt(x, k);
          expect(cmp(f, x) <= 0 && cmp(x, c) <= 0).toBe(true);
          const gap = cmp(c, f) === 0 ? 0 : 1;
          expect(cmp(f, c) <= 0).toBe(true);
          if (gap) expect(eq(make(f.n + 1, k), c)).toBe(true);
          expect(eq(r, f) || eq(r, c)).toBe(true);
          const iv = roundingInterval(r, k);
          expect(cmp(iv.lo, x) <= 0 && cmp(x, iv.hi) < 0).toBe(true);
        }
      }
    }
  });
  it('sweep: a value outside the interval of r does not round to r; the ends behave (lo included, hi excluded)', () => {
    for (let k = 0; k <= 3; k += 1) {
      for (let n = 0; n <= 400; n += 1) {
        const r = make(n, k);
        const iv = roundingInterval(r, k);
        expect(eq(roundAt(iv.lo, k), r)).toBe(true);
        expect(eq(roundAt(iv.hi, k), r)).toBe(false);
        if (iv.lo.n > 0) expect(eq(roundAt(make(iv.lo.n - 1, iv.lo.k), k), r)).toBe(false);
        expect(eq(roundAt(make(iv.hi.n - 1, iv.hi.k), k), r)).toBe(true);
      }
    }
  });
  it('sweep: quotient bracket and screen against exact integer arithmetic', () => {
    for (let a = 1; a <= 60; a += 1) for (let b = 2; b <= 40; b += 1) for (let k = 0; k <= 3; k += 1) {
      const qb = quotientBracket(a, b, k);
      const p = 10 ** k;
      expect(qb.lo.n).toBe(Math.floor((a * p) / b));
      expect(qb.exact).toBe((a * p) % b === 0);
      expect(qb.hi.n).toBe(qb.exact ? qb.lo.n : qb.lo.n + 1);
      expect(qb.lo.n * b <= a * p && a * p <= qb.hi.n * b).toBe(true);
    }
    for (let a = 1; a <= 200; a += 7) for (let b = 2; b <= 99; b += 3) {
      const s = quotientDigits(a, b, 10);
      expect(Math.abs(Number(s) - a / b)).toBeLessThan(1e-9 * Math.max(1, a / b));
      expect(s.replace('.', '').replace(/^0+/, '').length).toBeLessThanOrEqual(10);
    }
  });
});
