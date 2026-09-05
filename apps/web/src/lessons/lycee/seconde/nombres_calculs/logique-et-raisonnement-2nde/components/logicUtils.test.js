import { describe, it, expect } from 'vitest';
import { isPrime, smallestFactorization, euler, prop, and, or, not, caseOf, counterexample, implies, equivalence, universalCounterexample, range, pigeonhole, consecutiveProduct } from './logicUtils';

describe('Euler polynomial — 40 examples are not a proof', () => {
  it('is prime for n = 0..39 and composite at 40 and 41', () => {
    for (let n = 0; n <= 39; n += 1) expect(isPrime(euler(n))).toBe(true);
    expect(euler(40)).toBe(1681); expect(smallestFactorization(1681)).toEqual({ a: 41, b: 41 });
    expect(smallestFactorization(euler(41))).toEqual({ a: 41, b: 43 });
    expect(isPrime(1)).toBe(false); expect(isPrime(2)).toBe(true); expect(isPrime(91)).toBe(false);
  });
});
describe('connecteurs', () => {
  const P = prop('pair', 'n est pair', (n) => n % 2 === 0);
  const Q = prop('gt5', 'n > 5', (n) => n > 5);
  it('ET, OU (inclusif), NON', () => {
    expect(and(P, Q).test(8)).toBe(true); expect(and(P, Q).test(4)).toBe(false);
    expect(or(P, Q).test(8)).toBe(true); expect(or(P, Q).test(3)).toBe(false); expect(or(P, Q).test(7)).toBe(true);
    expect(not(P).test(3)).toBe(true);
    expect(range(0, 12).filter((n) => !or(P, Q).test(n))).toEqual([1, 3, 5]);
  });
});
describe('implication, réciproque, équivalence', () => {
  const M4 = prop('m4', 'n est multiple de 4', (n) => n % 4 === 0);
  const P = prop('pair', 'n est pair', (n) => n % 2 === 0);
  const D = range(0, 24);
  it('multiple de 4 ⇒ pair, mais pas la réciproque (6)', () => {
    expect(implies(M4, P, D)).toBe(true); expect(counterexample(P, M4, D)).toBe(2);
    expect(caseOf(M4, P, 8)).toBe('TT'); expect(caseOf(M4, P, 6)).toBe('FT'); expect(caseOf(M4, P, 7)).toBe('FF');
  });
  it('x² = 9 ⇔ x = 3 fails backward-only: −3', () => {
    const S = prop('sq', 'x² = 9', (x) => x * x === 9); const T = prop('t3', 'x = 3', (x) => x === 3);
    const e = equivalence(T, S, [-3, 3, 0, 9, 1.5]);
    expect(e).toEqual({ forward: null, backward: -3, equivalent: false });
    const T2 = prop('t3b', 'x = 3 ou x = −3', (x) => x === 3 || x === -3);
    expect(equivalence(T2, S, [-3, 3, 0, 9, 1.5]).equivalent).toBe(true);
  });
  it('universal claims fall to one counterexample', () => {
    const odd = prop('odd', 'n impair', (n) => n % 2 !== 0); const primeP = prop('prime', 'n premier', isPrime);
    expect(universalCounterexample(prop('x', 'impair ⇒ premier', (n) => !odd.test(n) || primeP.test(n)), range(3, 20))).toBe(9);
  });
});
describe('absurde', () => {
  it('pigeonhole forces a shared month at the 13th pupil', () => {
    expect(pigeonhole(12).firstShare).toBe(null); expect(pigeonhole(13).firstShare).toBe(13); expect(pigeonhole(30).forced).toBe(true);
  });
  it('n(n + 1) is always even', () => { for (let n = -5; n <= 20; n += 1) expect(consecutiveProduct(n).even).toBe(true); expect(consecutiveProduct(7).evenFactor).toBe(8); });
});
