// The arithmetic and the writing of decomposer-en-facteurs-premiers: the decompositions with their powers, where the
// trial divisions stop, and the French typography laid on a sentence.
import { describe, it, expect } from 'vitest';
import { typographyErrors } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import {
  fr,
  frAll,
  isPrime,
  nb,
  powText,
  powTex,
  powersOf,
  primeFactors,
  stopOf,
  sup,
  triedPrimes,
  tx,
  valueOfPowers,
} from './math';

describe('decomposer-en-facteurs-premiers — math.js', () => {
  it('a decomposition with its powers, as LaTeX and as plain text, and back to its value', () => {
    expect(powersOf(72)).toEqual([
      { p: 2, e: 3 },
      { p: 3, e: 2 },
    ]);
    expect(powTex(powersOf(1400))).toBe('2^{3} \\times 5^{2} \\times 7');
    expect(powText(powersOf(504))).toBe('2³ × 3² × 7');
    expect(sup(12)).toBe('¹²');
    for (let n = 2; n <= 5000; n += 1) {
      expect(valueOfPowers(powersOf(n))).toBe(n);
      for (const { p, e } of powersOf(n)) {
        expect(isPrime(p)).toBe(true);
        expect(e).toBeGreaterThanOrEqual(1);
      }
    }
    expect(primeFactors(2431)).toEqual([11, 13, 17]);
    expect(primeFactors(4641)).toEqual([3, 7, 13, 17]);
    expect(primeFactors(3127)).toEqual([53, 59]);
  });

  it('where the trial divisions stop: the largest number whose square does not pass n', () => {
    for (let n = 1; n <= 20000; n += 1) {
      const s = stopOf(n);
      expect(s * s <= n && n < (s + 1) * (s + 1), String(n)).toBe(true);
    }
    expect(triedPrimes(97)).toEqual([2, 3, 5, 7]);
    expect(triedPrimes(143)).toEqual([2, 3, 5, 7, 11]);
    expect(triedPrimes(3127).at(-1)).toBe(53);
  });

  it('numbers written the French way', () => {
    expect(nb(2431)).toBe('2 431');
    expect(nb(97)).toBe('97');
    expect(tx(1400)).toBe('1\\,400');
  });

  it('French typography on a sentence, formulas left alone', () => {
    expect(fr("Va à l'île : prends « 3 » ; vite ! Prêt ?")).toBe('Va à l’île : prends « 3 » ; vite ! Prêt ?');
    expect(fr('Le reste : $\\texttt{=MOD(91;7)}$ ; ok')).toBe('Le reste : $\\texttt{=MOD(91;7)}$ ; ok');
    expect(typographyErrors(fr('Un fossé de 60 cases : prends un moule ; puis construis !'))).toEqual([]);
    const t = frAll({ a: 'x : y', f: (n) => `n ? ${n}`, l: ['a ; b'] });
    expect(t.a).toBe('x : y');
    expect(t.f(2)).toBe('n ? 2');
    expect(t.l).toEqual(['a ; b']);
  });
});
