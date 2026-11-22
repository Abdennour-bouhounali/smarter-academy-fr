// validate-exercises.mjs on a FRENCH bank: the exam sheet's sub-items « a) », « b) », the brevet tags, the French
// provenance and French typography are enforced by the gate itself (the rules: scripts/validate-lib.mjs, tested in
// validate-lib.test.mjs). Each case writes a small synthetic 3e bank and runs the validator on it.
import { describe, it, expect, afterAll } from 'vitest';
import { examExercise, validateBank, cleanBanks } from './__fixtures__/practice/bank.mjs';

afterAll(cleanBanks);
const variant = (change) => {
  const ex = examExercise(1);
  change(ex);
  return ex;
};

describe('validate-exercises — a French exam-format bank', () => {
  it('accepts a clean 3e sheet: a) and b), the brevet tags, « Sur le modèle du brevet 2023 », French typography', () => {
    const r = validateBank([examExercise(1)]);
    expect(r.ok, r.out).toBe(true);
  });

  it('refuses an Arabic sub-item letter and an upper-case one; refuses b) before a) in a step', () => {
    expect(validateBank([variant((ex) => (ex.questions[0].sub = '\u0627'))]).out).toMatch(
      /sub « .* » : une lettre minuscule/,
    );
    expect(validateBank([variant((ex) => (ex.questions[0].sub = 'A'))]).out).toMatch(/une lettre minuscule a, b, c/);
    const backwards = validateBank([
      variant((ex) => {
        ex.questions[0].sub = 'b';
        ex.questions[1].sub = 'a';
      }),
    ]);
    expect(backwards.ok).toBe(false);
    expect(backwards.out).toMatch(/sub « a » recule après « b »/);
  });

  it('a new step starts its sub-items again at a)', () => {
    const r = validateBank([
      variant((ex) => {
        ex.questions[0].sub = 'b';
        ex.questions[1].step = '02';
        ex.questions[1].sub = 'a';
      }),
    ]);
    expect(r.out).not.toMatch(/recule/);
  });

  it('refuses a 3e exercise without its brevet tags, and brevet: 1 with a calculator', () => {
    const untagged = validateBank([
      variant((ex) => {
        delete ex.brevet;
        delete ex.calculator;
      }),
    ]);
    expect(untagged.ok).toBe(false);
    expect(untagged.out).toMatch(/brevet est obligatoire en 3e/);
    expect(untagged.out).toMatch(/calculator est obligatoire en 3e/);
    expect(
      validateBank([
        variant((ex) => {
          ex.brevet = 1;
          ex.calculator = true;
        }),
      ]).out,
    ).toMatch(/SANS calculatrice/);
  });

  it('refuses an Algerian provenance: a « bem » source, a « BEM <year> » badge', () => {
    const r = validateBank([
      variant((ex) => {
        ex.metadata.source = { type: 'bem', year: 2016, part: 2, exercise: 1 };
        ex.metadata.exam = { kind: 'excerpt', badge: 'BEM 2016', heading: 'Exercice 1', points: '03' };
      }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.out).toMatch(/« bem » cite l’examen algérien/);
    expect(r.out).toMatch(/metadata.source.type = "brevet"/);
  });

  it('refuses French typography mistakes in the statement, a hint and a formula of the model answer', () => {
    const r = validateBank([
      variant((ex) => {
        ex.statement.content = "Un fleuriste a 84 roses : combien d'œillets ?";
        ex.questions[0].hints[0].content = 'Pense à la 3ème règle.';
        ex.questions[0].solution.lines = ['On a $x = 2,5$.'];
      }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.out).toMatch(/statement.content : typographie « espace »/);
    expect(r.out).toMatch(/statement.content : typographie « apostrophe »/);
    expect(r.out).toMatch(/hints\[0\].content : typographie « ordinal »/);
    expect(r.out).toMatch(/solution.lines\[0\] : typographie « virgule »/);
  });
});
