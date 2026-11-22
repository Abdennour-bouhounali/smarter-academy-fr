import { describe, it, expect } from 'vitest';
import { generateChallenge, CHALLENGE_KINDS, explainTerms } from './practice.js';
import { buildRevealSteps, texNumber, DIRECT_TERMS_LIMIT } from './revealSteps.js';

const challengeOf = (kind, seed = 7, difficulty = 'normal') => generateChallenge(seed, { kinds: [kind], difficulty });

describe('texNumber — un nombre écrit pour KaTeX', () => {
  it('écrit la virgule décimale, le vrai signe et les parenthèses demandées', () => {
    expect(texNumber(7)).toBe('7');
    expect(texNumber(0.5)).toBe('0{,}5');
    expect(texNumber(-3)).toBe('-3');
    expect(texNumber(-3, { paren: true })).toBe('(-3)');
    expect(texNumber(3, { paren: true })).toBe('3');
    expect(texNumber(-0)).toBe('0');
    expect(texNumber(1048576)).toBe('1\\,048\\,576');
  });
});

describe('la révélation pas à pas d’un défi (exigence 2026-09-30)', () => {
  it('chaque famille donne plusieurs pas, et le DERNIER est la réponse attendue', () => {
    for (const kind of CHALLENGE_KINDS) {
      for (let seed = 1; seed <= 40; seed += 1) {
        const challenge = challengeOf(kind, seed, ['easy', 'normal', 'hard'][seed % 3]);
        const steps = buildRevealSteps(challenge);
        expect(steps.length).toBeGreaterThanOrEqual(3);
        const last = steps[steps.length - 1];
        expect(last.kind).toBe('answer');
        expect(last.tone).toBe('result');
        expect(last.expected).toBe(challenge.expected);
        // Le premier pas est l'énoncé, jamais la réponse.
        expect(steps[0].kind).toBe('given');
        expect(steps.slice(0, -1).every((step) => step.kind !== 'answer')).toBe(true);
      }
    }
  });

  it('u₀ = 4, r = 3 : u₁ = u₀ + r = 4 + 3 = 7, puis terme à terme jusqu’à la cible', () => {
    const challenge = {
      kind: 'arithmeticTerm', spec: { kind: 'arithmetic', startIndex: 0, first: 4, difference: 3 },
      targetIndex: 5, expected: 19,
    };
    const steps = buildRevealSteps(challenge);
    expect(steps[1].latex).toBe('u_{1} = u_{0} + r = 4 + 3 = 7');
    expect(steps.filter((step) => step.kind === 'term').map((step) => step.value)).toEqual([7, 10, 13, 16, 19]);
    expect(steps.find((step) => step.target).n).toBe(5);
    expect(steps[steps.length - 1].latex).toBe('u_{5} = 19');
  });

  it('une cible lointaine : les premiers termes, puis la formule du terme général', () => {
    const challenge = {
      kind: 'arithmeticTerm', spec: { kind: 'arithmetic', startIndex: 0, first: 2, difference: -4 },
      targetIndex: 12, expected: 2 + 12 * -4,
    };
    const steps = buildRevealSteps(challenge);
    expect(12).toBeGreaterThan(DIRECT_TERMS_LIMIT);
    const formula = steps.find((step) => step.kind === 'formula');
    expect(formula.value).toBe(-46);
    expect(formula.latex).toContain('12 \\times (-4)');
    expect(steps.filter((step) => step.kind === 'term')).toHaveLength(3);
  });

  it('la récurrence affine : uₙ remplacé par sa valeur dans a·uₙ + b', () => {
    const challenge = {
      kind: 'recurrenceTerm', spec: { kind: 'affine', startIndex: 0, first: 3, a: 2, b: -1 },
      targetIndex: 2, expected: 9,
    };
    const steps = buildRevealSteps(challenge);
    expect(steps[0].latex).toBe('u_{0} = 3,\\quad u_{n+1} = 2\\,u_{n} - 1');
    expect(steps[1].latex).toBe('u_{1} = 2\\,u_{0} - 1 = 2 \\times 3 - 1 = 5');
    expect(steps[2].latex).toBe('u_{2} = 2\\,u_{1} - 1 = 2 \\times 5 - 1 = 9');
  });

  it('les valeurs des pas sont celles du MOTEUR (celles de explainTerms)', () => {
    for (const kind of ['arithmeticTerm', 'geometricTerm', 'recurrenceTerm']) {
      for (let seed = 1; seed <= 20; seed += 1) {
        const challenge = challengeOf(kind, seed);
        const engine = new Map(explainTerms(challenge, 30).terms.map((term) => [term.n, term.value]));
        for (const step of buildRevealSteps(challenge).filter((s) => s.kind === 'term')) {
          expect(step.value).toBeCloseTo(engine.get(step.n), 9);
        }
      }
    }
  });

  it('la limite passe par l’équation du point fixe', () => {
    const challenge = challengeOf('limitValue', 3);
    const steps = buildRevealSteps(challenge);
    const kinds = steps.map((step) => step.kind);
    expect(kinds.indexOf('settle')).toBeLessThan(kinds.indexOf('fixedPoint'));
    expect(kinds.indexOf('fixedPoint')).toBe(steps.length - 2);
    expect(steps[steps.length - 1].latex).toBe(`\\ell = ${texNumber(challenge.expected)}`);
  });

  it('« trouver la règle » : trois écarts ou trois rapports, tous égaux à la réponse', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const challenge = challengeOf('findRule', seed);
      const steps = buildRevealSteps(challenge);
      const middle = steps.filter((step) => step.kind === 'difference' || step.kind === 'ratio');
      expect(middle).toHaveLength(3);
      for (const step of middle) expect(step.latex.endsWith(`= ${texNumber(challenge.expected)}`)).toBe(true);
    }
  });

  it('le comportement se termine par une étiquette, pas par un nombre', () => {
    const steps = buildRevealSteps(challengeOf('behaviour', 5));
    const last = steps[steps.length - 1];
    expect(last.latex).toBeNull();
    expect(typeof last.choice).toBe('string');
    expect(steps.some((step) => step.kind === 'compare')).toBe(true);
  });

  it('déterministe, et vide pour un défi sans suite', () => {
    const challenge = challengeOf('geometricTerm', 11);
    expect(buildRevealSteps(challenge)).toEqual(buildRevealSteps(challenge));
    expect(buildRevealSteps(null)).toEqual([]);
    expect(buildRevealSteps({ kind: 'arithmeticTerm' })).toEqual([]);
  });
});
