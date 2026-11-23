// validate-exercises.mjs on a `factorization` question (3e, « Décomposer un nombre en facteurs premiers »): the key is
// CANONICAL and its bases are prime; `requiredForm: 'powers'` belongs to this type and needs its own feedback; the
// key does not leak in a hint written in LaTeX. Each case writes a small synthetic 3e bank and runs the validator.
import { describe, it, expect, afterAll } from 'vitest';
import { examExercise, validateBank, cleanBanks } from './__fixtures__/practice/bank.mjs';

afterAll(cleanBanks);

/** The exam exercise of the fixture, its first question turned into a decomposition of 360. */
const withFactorization = (change = () => {}) => {
  const ex = examExercise(1);
  Object.assign(ex.questions[0], {
    statement: 'Décompose $360$ en produit de facteurs premiers.',
    answerType: 'factorization',
    answerFormat: 'Un produit de puissances de nombres premiers',
    expectedAnswer: '2^3*3^2*5',
  });
  change(ex.questions[0]);
  return ex;
};

describe('validate-exercises — a factorization question', () => {
  it('accepts a canonical key, in both modes', () => {
    const plain = validateBank([withFactorization()]);
    expect(plain.ok, plain.out).toBe(true);
    const powers = validateBank([
      withFactorization((q) => {
        q.evaluationPolicy = { requiredForm: 'powers' };
        q.feedback.powersExpected = 'Écris chaque premier une seule fois, avec son exposant.';
      }),
    ]);
    expect(powers.ok, powers.out).toBe(true);
  });

  it('refuses a key that is not canonical, or whose bases are not prime', () => {
    const disorder = validateBank([withFactorization((q) => (q.expectedAnswer = '3^2*2^3*5'))]);
    expect(disorder.ok).toBe(false);
    expect(disorder.out).toMatch(/n'est pas une décomposition canonique : pas canonique : « 2\^3\*3\^2\*5 » attendu/);
    expect(validateBank([withFactorization((q) => (q.expectedAnswer = '2*2*2*3*3*5'))]).out).toMatch(/pas canonique/);
    expect(validateBank([withFactorization((q) => (q.expectedAnswer = '8*45'))]).out).toMatch(/8 n’est pas premier/);
    expect(validateBank([withFactorization((q) => (q.expectedAnswer = 360))]).out).toMatch(/une chaîne comme/);
  });

  it('`powers` needs its feedback, and is refused on another type', () => {
    const bare = validateBank([withFactorization((q) => (q.evaluationPolicy = { requiredForm: 'powers' }))]);
    expect(bare.ok).toBe(false);
    expect(bare.out).toMatch(/requiredForm « powers » exige feedback\.powersExpected/);
    const ex = examExercise(1);
    ex.questions[0].evaluationPolicy = { requiredForm: 'powers' };
    expect(validateBank([ex]).out).toMatch(/requiredForm « powers » ne vaut que pour answerType « factorization »/);
  });

  it('a hint that writes the decomposition in LaTeX leaks the answer', () => {
    const leak = validateBank([
      withFactorization(
        (q) => (q.hints = [{ id: 'h1', type: 'look', content: 'Pense à $2^{3} \\times 3^{2} \\times 5$.' }]),
      ),
    ]);
    expect(leak.ok).toBe(false);
    expect(leak.out).toMatch(/l'indice 1 divulgue la réponse/);
  });
});
