import { describe, expect, it } from 'vitest';
import { markVerdict, signChain, signTex } from './mark';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

describe('a bridge with a marked stretch', () => {
  it('holds exactly with the planks common to the whole gap and to the marked stretch', () => {
    for (const [a, m] of [
      [78, 66],
      [27, 25],
      [39, 13],
      [99, 66],
    ])
      for (let b = 1; b <= a; b += 1) {
        const v = markVerdict(a, m, b);
        expect(v.holds).toBe(a % b === 0 && m % b === 0);
        expect(v.holds).toBe(gcd(a, m) % b === 0);
        expect(b * v.q + v.r).toBe(a);
        expect(b * v.mark.q + v.mark.r).toBe(m);
        expect(v.mark.r).toBeLessThan(b);
      }
  });

  it('a plank that fills the gap may still miss the mark: 3 on 25 of 27', () => {
    const v = markVerdict(27, 25, 3);
    expect(v.fills).toBe(true);
    expect(v.joint).toBe(false);
    expect(v.mark).toEqual({ m: 25, q: 8, r: 1 });
    expect(v.holds).toBe(false);
  });

  it('the sign is rewritten once per plank that held, and every writing is the same fraction', () => {
    const chain = signChain(78, 66, [2, 4, 6, 2]);
    expect(chain).toEqual([
      [66, 78],
      [33, 39],
      [11, 13],
    ]);
    for (const [n, d] of chain) expect(n * 78).toBe(d * 66);
    expect(signTex(chain)).toBe('\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}');
  });

  it('a stretch marked in two strokes opens on their sum', () => {
    expect(signTex(signChain(39, 13, [13]), [5, 8])).toBe(
      '\\frac{5}{39} + \\frac{8}{39} = \\frac{13}{39} = \\frac{1}{3}',
    );
  });

  it('a number of four digits or more takes the French thousands (LaTeX thin space)', () => {
    expect(signTex(signChain(1786, 722, [38]))).toBe('\\frac{722}{1\\,786} = \\frac{19}{47}');
  });
});
