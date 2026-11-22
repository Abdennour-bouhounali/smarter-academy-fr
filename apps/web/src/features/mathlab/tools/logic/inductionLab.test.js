/**
 * LE MOTEUR DU SLLAM, prouvé (§29).
 *
 * Trois exigences y sont défendues plutôt que relues :
 *   §7  — on ne prétend pas lire ce qu'on ne lit pas : la grammaire annoncée
 *         est mesurée sur le moteur, et chaque exemple proposé s'évalue ;
 *   §20 — huit marches vertes ne rendent JAMAIS « prouvé » ;
 *   §29 — un élève ne voit jamais `NaN`, `Infinity` ni `undefined`.
 */

import { describe, it, expect } from 'vitest';
import {
  MAX_STEPS, MIN_STEPS, compileRule, evaluateAt, sameValue, testStep, buildSteps,
  climbVerdict, climbSummary, nextUntested, resetSteps,
  SUPPORTED_EXAMPLES, SUPPORTED_GRAMMAR, UNSUPPORTED_NOTES, suggestionsFor,
  BUILDER_TOKENS, appendToken, dropToken,
} from './inductionLab.js';
import { INDUCTION_SEQUENCES, findPreset } from './presets.js';

describe('compileRule — la grammaire réellement supportée (§7)', () => {
  it('accepte ce que le laboratoire propose', () => {
    for (const example of ['2n + 1', '3n - 2', 'n^2', 'n(n+1)/2', '2^n', '(n+1)^2', '4n', 'n/2']) {
      expect(compileRule(example).ok, example).toBe(true);
    }
  });

  it('accepte la notation du cahier — « uₙ = … » et « u_n = … »', () => {
    expect(compileRule('uₙ = 2n + 1').ok).toBe(true);
    expect(compileRule('u_n = n^2').ok).toBe(true);
    // et le résultat est bien celui de l'expression, pas de la ligne entière
    expect(evaluateAt(compileRule('uₙ = 2n + 1'), 3)).toEqual({ ok: true, value: 7 });
  });

  it('accepte le produit implicite ET le produit explicite', () => {
    const implicit = compileRule('2n');
    const explicit = compileRule('2 × n');
    expect(implicit.ok && explicit.ok).toBe(true);
    for (const n of [1, 5, 9]) {
      expect(evaluateAt(implicit, n).value).toBe(evaluateAt(explicit, n).value);
    }
  });

  it('refuse — avec un CODE, jamais un message technique — ce qu’il ne sait pas lire', () => {
    expect(compileRule('').error.code).toBe('empty');
    expect(compileRule('2n +').error.code).toBe('syntax');
    expect(compileRule('2k + 1').error.code).toBe('unknownSymbol');
    // §7 : le factoriel n'est pas supporté, et on ne fait pas semblant.
    expect(compileRule('n!').ok).toBe(false);
  });

  it('la grammaire ANNONCÉE est mesurée sur le moteur, pas recopiée à la main', () => {
    expect(SUPPORTED_GRAMMAR.length).toBeGreaterThanOrEqual(8);
    for (const entry of SUPPORTED_GRAMMAR) {
      expect(compileRule(entry.probe).ok, entry.id).toBe(true);
    }
  });

  it('chaque EXEMPLE proposé à l’élève s’évalue vraiment (§9)', () => {
    expect(SUPPORTED_EXAMPLES.length).toBeGreaterThanOrEqual(6);
    for (const example of SUPPORTED_EXAMPLES) {
      const rule = compileRule(example);
      expect(rule.ok, example).toBe(true);
      for (const n of [1, 2, 3, 4]) {
        expect(evaluateAt(rule, n).ok, `${example} @ ${n}`).toBe(true);
      }
    }
  });

  it('ce qui n’est PAS supporté est nommé plutôt que tu', () => {
    expect(UNSUPPORTED_NOTES).toContain('factorial');
    expect(UNSUPPORTED_NOTES.length).toBeGreaterThan(0);
  });

  it('les suggestions viennent de la grammaire et sont toutes valides', () => {
    for (const source of ['n!', 'xyz', 'n^', '2n +', '']) {
      const suggestions = suggestionsFor(source);
      expect(suggestions.length).toBeGreaterThan(0);
      for (const suggestion of suggestions) expect(compileRule(suggestion).ok, suggestion).toBe(true);
    }
  });

  it('une saisie avec un carré propose en priorité un exemple avec un carré', () => {
    expect(suggestionsFor('n^')[0]).toMatch(/\^|²/);
  });
});

describe('evaluateAt — l’élève ne voit jamais NaN, Infinity ni undefined (§29)', () => {
  it('refuse une valeur non finie plutôt que de la rendre', () => {
    const rule = compileRule('1/(n-3)');
    expect(rule.ok).toBe(true);
    // n = 3 → division par zéro : le moteur rend ±Infinity, nous rendons un refus.
    const at3 = evaluateAt(rule, 3);
    expect(at3.ok).toBe(false);
    expect(at3.reason).toBe('undefined');
  });

  it('refuse une racine hors domaine', () => {
    const rule = compileRule('sqrt(n - 10)');
    if (rule.ok) expect(evaluateAt(rule, 1).ok).toBe(false);
  });

  it('refuse un nombre au-delà de la précision entière plutôt que de comparer au hasard', () => {
    const rule = compileRule('2^n');
    expect(evaluateAt(rule, 80).ok).toBe(false);
    expect(evaluateAt(rule, 80).reason).toBe('overflow');
  });

  it('rend un nombre fini partout ailleurs', () => {
    const rule = compileRule('2n + 1');
    for (const n of [0, 1, 2, 50]) {
      const result = evaluateAt(rule, n);
      expect(result.ok).toBe(true);
      expect(Number.isFinite(result.value)).toBe(true);
    }
  });

  it('ne lève jamais, même sans règle', () => {
    expect(() => evaluateAt(null, 1)).not.toThrow();
    expect(evaluateAt(null, 1).ok).toBe(false);
    expect(() => evaluateAt({ ok: false }, 1)).not.toThrow();
  });
});

describe('sameValue — la comparaison tolère le flottant, pas l’erreur', () => {
  it('accepte une égalité obtenue par division', () => {
    expect(sameValue(0.1 + 0.2, 0.3)).toBe(true);
    expect(sameValue((3 * 4) / 2, 6)).toBe(true);
  });

  it('refuse deux valeurs réellement différentes', () => {
    expect(sameValue(8, 9)).toBe(false);
    expect(sameValue(6.5, 6)).toBe(false);
  });

  it('refuse le non-fini', () => {
    expect(sameValue(NaN, NaN)).toBe(false);
    expect(sameValue(Infinity, Infinity)).toBe(false);
  });
});

describe('testStep — un verdict qui EXPLIQUE (§5, §18)', () => {
  const step = { n: 4, expected: 9 };

  it('rend la valeur obtenue ET la valeur attendue, pas un booléen', () => {
    const result = testStep(compileRule('2n + 1'), step);
    expect(result).toMatchObject({ status: 'correct', n: 4, expected: 9, actual: 9 });
  });

  it('nomme l’écart quand la règle ne correspond pas', () => {
    const result = testStep(compileRule('2n'), step);
    expect(result).toMatchObject({ status: 'incorrect', expected: 9, actual: 8, reason: 'mismatch' });
  });

  it('nomme la raison quand la règle n’est pas calculable ici', () => {
    const result = testStep(compileRule('1/(n-4)'), step);
    expect(result.status).toBe('incorrect');
    expect(result.actual).toBeNull();
    expect(result.reason).toBe('undefined');
  });
});

describe('buildSteps — les marches viennent de l’EXERCICE, pas de la règle', () => {
  it('construit la suite attendue', () => {
    const steps = buildSteps((n) => 2 * n + 1, { from: 1, count: 4 });
    expect(steps.map((s) => s.n)).toEqual([1, 2, 3, 4]);
    expect(steps.map((s) => s.expected)).toEqual([3, 5, 7, 9]);
    expect(steps.every((s) => s.status === 'untested')).toBe(true);
  });

  it('borne le nombre de marches : on ne lit plus un escalier de cinquante', () => {
    expect(buildSteps((n) => n, { count: 99 })).toHaveLength(MAX_STEPS);
    expect(buildSteps((n) => n, { count: 1 })).toHaveLength(MIN_STEPS);
  });
});

describe('climbVerdict — §20, la distinction qui fait toute l’aire', () => {
  const steps = (statuses) => statuses.map((status, i) => ({ n: i + 1, expected: 0, status }));

  it('rien de testé → « idle »', () => {
    expect(climbVerdict(steps(['untested', 'untested']))).toBe('idle');
  });

  it('des marches vertes, d’autres à faire → « climbing »', () => {
    expect(climbVerdict(steps(['correct', 'correct', 'untested']))).toBe('climbing');
  });

  it('UNE marche rouge RÉFUTE, même si les autres sont vertes (§17)', () => {
    expect(climbVerdict(steps(['correct', 'correct', 'incorrect', 'untested']))).toBe('broken');
    expect(climbVerdict(steps(['correct', 'correct', 'correct', 'incorrect']))).toBe('broken');
  });

  it('TOUT en vert donne « experimental » — jamais « prouvé »', () => {
    const verdict = climbVerdict(steps(['correct', 'correct', 'correct', 'correct']));
    expect(verdict).toBe('experimental');
    expect(verdict).not.toBe('proved');
    expect(verdict).not.toBe('proven');
  });
});

describe('climbSummary et nextUntested', () => {
  const steps = [
    { n: 1, status: 'correct' }, { n: 2, status: 'incorrect' },
    { n: 3, status: 'untested' }, { n: 4, status: 'untested' },
  ];

  it('compte ce qu’il faut pour §23', () => {
    expect(climbSummary(steps)).toMatchObject({ correct: 1, incorrect: 1, untested: 2, total: 4 });
  });

  it('trouve la prochaine marche à tester', () => {
    expect(nextUntested(steps)).toBe(2);
    expect(nextUntested(steps, 3)).toBe(3);
    expect(nextUntested(steps.map((s) => ({ ...s, status: 'correct' })))).toBeNull();
  });
});

describe('resetSteps — §15, changer de règle efface les verdicts', () => {
  it('remet tout à « untested » sans toucher aux valeurs attendues', () => {
    const before = [{ n: 1, expected: 3, status: 'correct', actual: 3, reason: null }];
    const after = resetSteps(before);
    expect(after[0]).toMatchObject({ n: 1, expected: 3, status: 'untested', actual: null });
  });
});

describe('le constructeur de règle (§8) — une seule grammaire', () => {
  it('assemble une règle que le MÊME compilateur relit', () => {
    let source = '';
    for (const id of ['2', 'times', 'n', 'plus', '1']) source = appendToken(source, id);
    expect(compileRule(source).ok).toBe(true);
    expect(evaluateAt(compileRule(source), 3).value).toBe(7);
  });

  it('retire un jeton entier, pas un caractère', () => {
    const source = appendToken(appendToken('', 'n'), 'plus');
    expect(dropToken(source)).toBe('n');
  });

  it('ignore un jeton inconnu plutôt que de corrompre la règle', () => {
    expect(appendToken('n', 'inexistant')).toBe('n');
  });

  it('offre de quoi écrire les exemples du programme', () => {
    const ids = BUILDER_TOKENS.map((token) => token.id);
    for (const needed of ['n', 'plus', 'minus', 'times', 'divide', 'power', 'open', 'close']) {
      expect(ids).toContain(needed);
    }
  });
});

/**
 * §10, §29 — LE CŒUR : une règle juste verdit TOUTES les marches, et le
 * piège de chaque suite en verdit quelques-unes puis casse. Si cette épreuve
 * tombait, l'écran enseignerait le contraire de ce qu'il prétend montrer.
 */
describe('chaque suite du laboratoire, contre sa règle et contre son piège', () => {
  for (const sequence of INDUCTION_SEQUENCES) {
    const steps = buildSteps(sequence.expected, { from: sequence.from, count: sequence.count });

    it(`${sequence.id} : la bonne règle « ${sequence.answer} » verdit toutes les marches`, () => {
      const rule = compileRule(sequence.answer);
      expect(rule.ok).toBe(true);
      for (const step of steps) {
        expect(testStep(rule, step).status, `n = ${step.n}`).toBe('correct');
      }
    });

    it(`${sequence.id} : le piège « ${sequence.trap} » verdit quelques marches PUIS casse (§17)`, () => {
      const rule = compileRule(sequence.trap);
      expect(rule.ok).toBe(true);
      const results = steps.map((step) => testStep(rule, step).status);
      const firstBroken = results.indexOf('incorrect');
      // Il doit tenir au moins deux marches — sinon ce n'est pas un piège,
      // et la leçon « réussir quelques fois ne prouve rien » ne se joue pas.
      expect(firstBroken, `casse trop tôt : ${results.join(',')}`).toBeGreaterThanOrEqual(2);
      expect(firstBroken, 'ne casse jamais : ce n’est pas un piège').toBeLessThan(steps.length);
      expect(results.slice(0, firstBroken).every((s) => s === 'correct')).toBe(true);
    });

    it(`${sequence.id} : aucune valeur attendue n’est non finie`, () => {
      for (const step of steps) {
        expect(Number.isFinite(step.expected), `n = ${step.n}`).toBe(true);
      }
    });
  }

  it('le piège de « 2^n » tient TROIS marches — le meilleur exemple de §17', () => {
    const sequence = findPreset(INDUCTION_SEQUENCES, 'powersOfTwo');
    const steps = buildSteps(sequence.expected, { from: sequence.from, count: sequence.count });
    const rule = compileRule(sequence.trap);
    const results = steps.map((step) => testStep(rule, step).status);
    expect(results.slice(0, 3)).toEqual(['correct', 'correct', 'correct']);
    expect(results[3]).toBe('incorrect');
  });
});
