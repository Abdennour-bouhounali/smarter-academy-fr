import { describe, it, expect } from 'vitest';
import {
  parseFactorization,
  productOf,
  isPrime,
  canonicalFactorization,
  factorizationKeyProblem,
  factorizationToLatex,
  factorizationToPlain,
} from './factorization.js';
import { evaluateAnswer } from './answerEvaluator.js';

/** An independent decomposition (trial division), to check the module against. */
function factorize(n) {
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p += 1) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e += 1;
    }
    if (e) out.push({ p, e });
  }
  if (m > 1) out.push({ p: m, e: 1 });
  return out;
}

describe('factorization — reading a product typed by a student', () => {
  it('reads every writing of the same product, in the order written', () => {
    for (const raw of ['2^3*3^2*5', '2³ × 3² × 5', '2^{3}\\times3^{2}\\times5', '2 ^ 3 · 3 ^ 2 · 5', '2^3 x 3^2 X 5']) {
      expect(parseFactorization(raw), raw).toEqual([
        { p: 2, e: 3 },
        { p: 3, e: 2 },
        { p: 5, e: 1 },
      ]);
    }
    expect(parseFactorization('5×2¹³')).toEqual([
      { p: 5, e: 1 },
      { p: 2, e: 13 },
    ]);
  });

  it('refuses what the student could not have meant: digits without a sign, a group that hides a product, objects', () => {
    for (const raw of ['2 3', '2^{3\\times3}', '2^3^2', '', '  ', '2^', '^3', '2,5', '2.5', '-2*3']) {
      expect(parseFactorization(raw), raw).toBeNull();
    }
    expect(parseFactorization(null)).toBeNull();
    expect(parseFactorization(['2'])).toBeNull();
    expect(parseFactorization({ value: '2' })).toBeNull();
  });

  it('computes the product exactly, and null past 2^53 − 1', () => {
    expect(productOf(parseFactorization('2^3*3^2*5'))).toBe(360);
    expect(productOf(parseFactorization('2^53'))).toBeNull();
    expect(productOf(parseFactorization('2^52*1'))).toBe(2 ** 52);
    expect(productOf(parseFactorization('2^60*0'))).toBe(0);
    expect(productOf(parseFactorization('1^999'))).toBe(1);
  });

  it('isPrime and factorize agree with each other up to 2 000', () => {
    for (let n = 2; n <= 2000; n += 1) {
      const f = factorize(n);
      expect(productOf(f)).toBe(n);
      expect(f.every(({ p }) => isPrime(p))).toBe(true);
      expect(isPrime(n)).toBe(f.length === 1 && f[0].e === 1);
    }
    expect(isPrime(1)).toBe(false);
    expect(isPrime(999983)).toBe(true);
    expect(isPrime(999983 * 999979)).toBe(false); // two primes near 10^6: the whole search runs
  });

  it('writes the canonical form: bases increasing, exponents added, exponent 1 omitted', () => {
    expect(canonicalFactorization(parseFactorization('5*3*3*2^2*2'))).toBe('2^3*3^2*5');
    expect(canonicalFactorization(factorize(1400))).toBe('2^3*5^2*7');
    expect(canonicalFactorization(factorize(4641))).toBe('3*7*13*17');
  });

  it('a key must be canonical, prime and of school size', () => {
    expect(factorizationKeyProblem('2^3*3^2*5')).toBeNull();
    expect(factorizationKeyProblem('97')).toBeNull();
    expect(factorizationKeyProblem('3^2*2^3*5')).toMatch(/pas canonique/);
    expect(factorizationKeyProblem('2*2*2*3*3*5')).toMatch(/pas canonique/);
    expect(factorizationKeyProblem('2^3 * 3^2 * 5')).toMatch(/pas canonique/);
    expect(factorizationKeyProblem('2^1*3')).toMatch(/pas canonique/);
    expect(factorizationKeyProblem('4*15')).toMatch(/4 n’est pas premier/);
    expect(factorizationKeyProblem('2^0*3')).toMatch(/exposant vaut 0/);
    expect(factorizationKeyProblem('1')).toMatch(/entre 2 et/);
    expect(factorizationKeyProblem('2^40')).toMatch(/entre 2 et/);
    expect(factorizationKeyProblem(360)).toMatch(/une chaîne/);
  });

  it('shows the product as written, in LaTeX', () => {
    expect(factorizationToLatex('2*2*3^2')).toBe('2 \\times 2 \\times 3^{2}');
    expect(factorizationToLatex('2 3')).toBeNull();
    expect(factorizationToPlain('2^{3}\\times3^{12}\\times5')).toBe('2³ × 3¹² × 5');
    expect(factorizationToPlain('2 3')).toBeNull();
  });
});

describe('factorization — the two modes of the evaluator', () => {
  const q = {
    id: 'q',
    answerType: 'factorization',
    expectedAnswer: '2^2*3^2*7',
    feedback: { correct: 'a', incorrect: 'b' },
  };
  const powers = { ...q, evaluationPolicy: { requiredForm: 'powers' } };
  const outcome = (question, value) => evaluateAnswer({ value }, question);

  it('default: any complete product of primes is right; powers: each prime once', () => {
    expect(outcome(q, '7×3²×2²').outcome).toBe('correct');
    expect(outcome(q, '2×2×3×3×7').outcome).toBe('equivalent_correct');
    expect(outcome(powers, '7×3²×2²').outcome).toBe('correct');
    expect(outcome(powers, '2×2×3×3×7')).toMatchObject({ outcome: 'partially_correct', feedbackKey: 'powersExpected' });
  });

  it('the same wrong answers in both modes', () => {
    for (const question of [q, powers]) {
      expect(outcome(question, '4×9×7')).toMatchObject({ outcome: 'incorrect', feedbackKey: 'notPrime' });
      expect(outcome(question, '1×2²×3²×7')).toMatchObject({ outcome: 'incorrect', feedbackKey: 'notPrime' });
      expect(outcome(question, '2²×3²×7×5⁰')).toMatchObject({ outcome: 'incorrect', feedbackKey: 'zeroExponent' });
      expect(outcome(question, '2×3×7')).toMatchObject({ outcome: 'incorrect', feedbackKey: 'wrongExponents' });
      expect(outcome(question, '2²×3²×5')).toMatchObject({ outcome: 'incorrect', feedbackKey: 'wrongProduct' });
      expect(outcome(question, '2²3²7').outcome).toBe('syntax_error');
    }
  });
});
