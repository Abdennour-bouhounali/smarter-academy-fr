import { describe, it, expect } from 'vitest';
import { longDivision, twin, paperRows, quotientSoFar, thinking, conclusion, METHOD } from './longDivision';

describe('mode papier — the division as it is written on paper', () => {
  it('poses 756 ÷ 36 in two steps: 75 then 36', () => {
    const d = longDivision(756, 36);
    expect(d.steps).toEqual([
      { part: 75, digit: 2, product: 72, rest: 3, col: 1, next: 6 },
      { part: 36, digit: 1, product: 36, rest: 0, col: 2, next: null },
    ]);
    expect([d.q, d.r]).toEqual([21, 0]);
    expect(paperRows(d, 1)).toEqual([
      { kind: 'minus', text: '72', end: 1 },
      { kind: 'rest', text: '3', end: 1, last: false },
    ]);
    expect(paperRows(d, 2)).toEqual([
      { kind: 'minus', text: '72', end: 1 },
      { kind: 'rest', text: '36', end: 2, last: false },
      { kind: 'minus', text: '36', end: 2 },
      { kind: 'rest', text: '0', end: 2, last: true },
    ]);
    expect(quotientSoFar(d, 1)).toBe('2');
    expect(quotientSoFar(d, 2)).toBe('21');
  });

  it('writes the quotient digit by digit for every division, zeros included', () => {
    for (let a = 1; a <= 1200; a += 7)
      for (let b = 2; b <= 40; b += 3) {
        const d = longDivision(a, b);
        expect(Number(quotientSoFar(d, d.steps.length)), `${a} ÷ ${b}`).toBe(Math.floor(a / b));
        expect(d.steps.at(-1).rest).toBe(a % b);
        for (const s of d.steps) {
          expect(s.rest).toBeLessThan(b);
          expect(s.digit).toBeLessThanOrEqual(9);
          expect(s.product + s.rest).toBe(s.part);
        }
      }
    const z = longDivision(612, 6); // 6 → 1, then 1 < 6: a 0 in the quotient, then 12 → 2
    expect(z.steps.map((s) => s.digit)).toEqual([1, 0, 2]);
    expect(thinking(z, 1).join(' ')).toContain('J’écris 0 au quotient');
    expect(longDivision(5, 9).steps).toEqual([{ part: 5, digit: 0, product: 0, rest: 5, col: 0, next: null }]);
  });

  it('says each step aloud and ends on the check and the sentence', () => {
    const d = longDivision(756, 36);
    expect(thinking(d, 0)[0]).toContain('7 est plus petit que 36');
    expect(thinking(d, 0).join(' ')).toContain('36 \\times 2 = 72');
    expect(thinking(d, 0).at(-1)).toContain('J’abaisse le chiffre 6');
    expect(thinking(d, 1).at(-1)).toContain('le quotient est 21 et le reste est 0');
    expect(conclusion(d).check).toContain('36 \\times 21 + 0 = 756');
    expect(conclusion(d).sentence).toBe('Le reste est 0, donc 36 est un diviseur de 756.');
    expect(conclusion(longDivision(756, 32)).sentence).toContain('n’est pas un diviseur');
    expect(METHOD.map((m) => m.id)).toEqual(['read', 'ask', 'tool', 'compute', 'verify', 'write']);
  });

  it('builds a twin of the same nature that never shows the student his own numbers', () => {
    for (const [a, b] of [
      [756, 32],
      [756, 36],
      [96, 6],
      [143, 11],
      [360, 19],
      [185, 30],
      [420, 28],
    ]) {
      const t = twin(a, b);
      expect(t.a).not.toBe(a);
      expect(t.b).not.toBe(b);
      expect(t.a % t.b === 0).toBe(a % b === 0);
      expect(Math.floor(t.a / t.b)).not.toBe(Math.floor(a / b));
      expect(t.b).toBeGreaterThan(1);
    }
  });
});
