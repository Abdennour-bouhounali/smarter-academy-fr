import { describe, it, expect } from 'vitest';
import { roundingLine, ROUNDING_FIGURE } from './figures';

/* Un autre code : tout en entiers, le mudawwar r à `rank` décimales a pour ensemble [r − ½·10^-rank ; r + ½·10^-rank[. */
const scaled = (txt) => { const [a, b = ''] = txt.replace(',', '.').split('.'); return { n: BigInt(a + b), k: b.length }; };
const text = (n, k) => { const s = String(n).padStart(k + 1, '0'); const t = k ? `${s.slice(0, -k)},${s.slice(-k)}` : s; return t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t; };

describe('la figure du mudawwar', () => {
  it('l\'exemple : le mudawwar à l\'unité est 9, donc 8,5 ≤ x < 9,5', () => {
    expect(ROUNDING_FIGURE).toMatchObject({ rank: 0, r: '9', lo: '8,5', hi: '9,5', loIncluded: true, hiIncluded: false });
  });
  it('plusieurs rangs, recalculés en entiers', () => {
    for (const [r, rank] of [['9', 0], ['1,3', 1], ['5,68', 2], ['0,285', 3], ['10,7', 1], ['3', 0]]) {
      const f = roundingLine(r, rank);
      const v = scaled(r);
      const half = 5n; // 5·10^-(rank+1) en unités de 10^-(rank+1)
      const c = v.n * 10n;
      expect(f.lo).toBe(text(c - half, rank + 1));
      expect(f.hi).toBe(text(c + half, rank + 1));
      expect(f.r).toBe(r);
    }
  });
  it('refuse un mudawwar qui n\'a pas le bon nombre de décimales', () => {
    expect(() => roundingLine('9,5', 0)).toThrow();
    expect(() => roundingLine('9', 1)).toThrow();
  });
});
