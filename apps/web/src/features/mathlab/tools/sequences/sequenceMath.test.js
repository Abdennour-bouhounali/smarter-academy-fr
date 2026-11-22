import { describe, it, expect } from 'vitest';
import {
  MAX_TERMS, MAX_ITERATIONS, OVERFLOW_LIMIT, SEQUENCE_KINDS,
  isRecursive, isFirstOrder, isUsable, stepFunctionOf,
  generate, termAt, differences, secondDifferences, ratios, partialSums,
  subsequence, observedRange, fixedPoints, affineCoefficients, analyseTrend,
  cobwebPath, compareRuns, crossingIndex, closedForm, nearlyEqual,
} from './sequenceMath.js';
import { compileSequenceExpression } from './sequenceExpression.js';

/**
 * La MATHÉMATIQUE des متتاليات (§52). Chaque famille, chaque lecture, et
 * surtout chaque cas pathologique : §32 et §47 demandent qu'aucune expression
 * d'élève ne casse ni ne gèle quoi que ce soit, et c'est ici que ça se vérifie.
 */

const arithmetic = (first, difference, startIndex = 0) => ({ kind: 'arithmetic', startIndex, initial: [first], difference });
const geometric = (first, ratio, startIndex = 0) => ({ kind: 'geometric', startIndex, initial: [first], ratio });
const affine = (first, a, b, startIndex = 0) => ({ kind: 'affine', startIndex, initial: [first], a, b });
const values = (definition, count) => generate(definition, count).terms.map((term) => term.value);
const explicitOf = (source, startIndex = 0) => {
  const compiled = compileSequenceExpression(source, { explicit: true });

  return { kind: 'explicit', startIndex, initial: [], explicit: compiled.evaluate };
};
const recurrenceOf = (source, first, startIndex = 0) => {
  const compiled = compileSequenceExpression(source, { order: 1 });

  return { kind: 'recurrence', startIndex, initial: [first], step: compiled.evaluate };
};

describe('les familles de متتاليات (§3)', () => {
  it('arithmétique : u₀ = 2, r = 3 donne 2, 5, 8, 11…', () => {
    expect(values(arithmetic(2, 3), 6)).toEqual([2, 5, 8, 11, 14, 17]);
  });

  it('arithmétique de raison négative DÉCROÎT — le geste de §4', () => {
    expect(values(arithmetic(3, -1), 5)).toEqual([3, 2, 1, 0, -1]);
  });

  it('géométrique : u₀ = 2, q = 1,5', () => {
    expect(values(geometric(2, 1.5), 4)).toEqual([2, 3, 4.5, 6.75]);
  });

  it('géométrique de raison 1 est CONSTANTE, de raison 0 s’annule après le premier terme (§14)', () => {
    expect(values(geometric(5, 1), 4)).toEqual([5, 5, 5, 5]);
    expect(values(geometric(5, 0), 4)).toEqual([5, 0, 0, 0]);
  });

  it('géométrique de raison −1 ALTERNE (§14, §20)', () => {
    expect(values(geometric(3, -1), 5)).toEqual([3, -3, 3, -3, 3]);
  });

  it('affine : u₀ = 0, a = 0,5, b = 2 monte vers 4 sans l’atteindre (§15)', () => {
    const terms = values(affine(0, 0.5, 2), 5);
    expect(terms).toEqual([0, 2, 3, 3.5, 3.75]);
    expect(terms.every((value) => value < 4)).toBe(true);
  });

  it('explicite : u(n) = 2n + 1', () => {
    expect(values(explicitOf('2n + 1'), 4)).toEqual([1, 3, 5, 7]);
  });

  it('second ordre : Fibonacci (§40)', () => {
    const fib = { kind: 'secondOrder', startIndex: 0, initial: [0, 1], a: 1, b: 1 };
    expect(values(fib, 10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  it('second ordre paramétrique : u(n+2) = 2u(n+1) − u(n) est arithmétique', () => {
    const linear = { kind: 'secondOrder', startIndex: 0, initial: [1, 4], a: 2, b: -1 };
    expect(values(linear, 5)).toEqual([1, 4, 7, 10, 13]);
  });

  it('l’indice de départ décale la suite, pas ses valeurs (§4)', () => {
    const run = generate(arithmetic(2, 3, 1), 3);
    expect(run.terms.map((term) => term.n)).toEqual([1, 2, 3]);
    expect(run.terms.map((term) => term.value)).toEqual([2, 5, 8]);
  });

  it('chaque famille annoncée est reconnue', () => {
    expect(SEQUENCE_KINDS).toHaveLength(6);
    expect(isRecursive('explicit')).toBe(false);
    expect(isRecursive('arithmetic')).toBe(true);
    expect(isFirstOrder('secondOrder')).toBe(false);
    expect(isFirstOrder('recurrence')).toBe(true);
  });
});

describe('la sûreté : rien ne casse, rien ne gèle (§32, §47)', () => {
  it('une division par zéro ARRÊTE la suite proprement, sans lever', () => {
    const definition = recurrenceOf('1/(u-2)', 2);
    const run = generate(definition, 8);
    expect(run.terms.map((term) => term.value)).toEqual([2]);
    expect(run.stopped).toEqual({ n: 1, reason: 'undefined' });
  });

  it('un terme qui explose arrête la suite avec « overflow », jamais Infinity', () => {
    const run = generate(geometric(1, 10), 40);
    expect(run.stopped.reason).toBe('overflow');
    expect(run.terms.every((term) => Math.abs(term.value) <= OVERFLOW_LIMIT)).toBe(true);
    expect(run.terms.some((term) => !Number.isFinite(term.value))).toBe(false);
  });

  it('une racine de négatif ou un logarithme de zéro n’engendrent pas NaN dans les termes', () => {
    for (const source of ['sqrt(u - 10)', 'ln(u - 1)', '1/(u*0)']) {
      const run = generate(recurrenceOf(source, 1), 6);
      expect(run.terms.every((term) => Number.isFinite(term.value)), source).toBe(true);
    }
  });

  it('une règle illisible ne rend aucun terme au-delà des initiaux, et le DIT', () => {
    const run = generate({ kind: 'recurrence', startIndex: 0, initial: [1], step: null }, 5);
    expect(run.stopped).toEqual({ n: 1, reason: 'invalidRule' });
  });

  it('une règle qui LÈVE est traitée comme un terme indéfini, pas comme un plantage', () => {
    const throwing = { kind: 'recurrence', startIndex: 0, initial: [1], step: () => { throw new Error('boom'); } };
    expect(() => generate(throwing, 5)).not.toThrow();
    expect(generate(throwing, 5).stopped.reason).toBe('undefined');
  });

  it('une règle qui rend autre chose qu’un nombre est indéfinie', () => {
    const weird = { kind: 'recurrence', startIndex: 0, initial: [1], step: () => 'beaucoup' };
    expect(generate(weird, 4).stopped.reason).toBe('undefined');
  });

  it('le nombre de termes est BORNÉ : on ne demande pas un million de termes', () => {
    expect(generate(arithmetic(0, 1), 10_000).terms).toHaveLength(MAX_TERMS);
    expect(generate(arithmetic(0, 1), Number.POSITIVE_INFINITY).terms).toHaveLength(0);
    expect(generate(arithmetic(0, 1), -5).terms).toHaveLength(0);
    expect(generate(arithmetic(0, 1), Number.NaN).terms).toHaveLength(0);
  });

  it('un terme explicite indéfini est SAUTÉ, pas fatal : 1/n existe partout sauf en 0 (§32)', () => {
    const run = generate(explicitOf('1/n'), 4);
    expect(run.terms.map((term) => term.n)).toEqual([1, 2, 3]);
    expect(run.stopped).toBeNull();
  });

  it('isUsable refuse le non fini et le colossal', () => {
    expect(isUsable(5)).toBe(true);
    expect(isUsable(Number.NaN)).toBe(false);
    expect(isUsable(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isUsable(OVERFLOW_LIMIT * 10)).toBe(false);
  });

  it('un terme initial inutilisable est refusé tout de suite', () => {
    expect(generate({ ...arithmetic(0, 1), initial: [Number.NaN] }, 4).stopped.reason).toBe('undefined');
    expect(generate({ ...arithmetic(0, 1), initial: [1e300] }, 4).stopped.reason).toBe('overflow');
  });
});

describe('un terme lointain (§12)', () => {
  it('u(1000) d’une arithmétique, sans garder mille termes', () => {
    expect(termAt(arithmetic(2, 3), 1000)).toEqual({ ok: true, n: 1000, value: 3002 });
  });

  it('u(10000) de 1/n approche zéro', () => {
    const far = termAt(explicitOf('1/n', 1), 10_000);
    expect(far.ok).toBe(true);
    expect(far.value).toBeCloseTo(1e-4, 10);
  });

  it('Fibonacci u(30) = 832040', () => {
    expect(termAt({ kind: 'secondOrder', startIndex: 0, initial: [0, 1], a: 1, b: 1 }, 30).value).toBe(832040);
  });

  it('au-delà du plafond d’itérations, on le DIT plutôt que de geler l’onglet (§47)', () => {
    const result = termAt(arithmetic(0, 1), MAX_ITERATIONS + 10);
    expect(result).toEqual({ ok: false, n: MAX_ITERATIONS + 10, reason: 'iterationCap' });
  });

  it('un terme lointain qui explose rend « overflow » et l’indice où ça a lâché', () => {
    const result = termAt(geometric(1, 2), 500);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('overflow');
    expect(result.n).toBeLessThan(500);
  });

  it('les premiers termes sont rendus directement, sans itérer', () => {
    expect(termAt(arithmetic(7, 3), 0).value).toBe(7);
    expect(termAt({ kind: 'secondOrder', startIndex: 0, initial: [5, 9], a: 1, b: 1 }, 1).value).toBe(9);
  });

  it('un indice avant le début n’a pas de terme', () => {
    expect(termAt(arithmetic(2, 3, 1), 0).ok).toBe(false);
  });
});

describe('les lectures sur les termes (§17, §34, §35, §36)', () => {
  const terms = generate(arithmetic(2, 3), 5).terms;

  it('les différences d’une arithmétique sont CONSTANTES — le geste de 4AM (LP 2.1)', () => {
    expect(differences(terms).map((delta) => delta.value)).toEqual([3, 3, 3, 3]);
  });

  it('les différences secondes d’une suite de carrés sont constantes (§41)', () => {
    const squares = generate(explicitOf('n^2', 1), 6).terms;
    expect(differences(squares).map((d) => d.value)).toEqual([3, 5, 7, 9, 11]);
    expect(secondDifferences(squares).map((d) => d.value)).toEqual([2, 2, 2, 2]);
  });

  it('les rapports d’une géométrique sont constants', () => {
    const geo = generate(geometric(2, 0.5), 5).terms;
    expect(ratios(geo).map((ratio) => ratio.value)).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it('un terme nul n’a PAS de rapport — et on le dit, on ne rend pas l’infini (§35)', () => {
    const withZero = [{ n: 0, value: 0 }, { n: 1, value: 4 }, { n: 2, value: 8 }];
    const result = ratios(withZero);
    expect(result[0]).toEqual({ n: 0, value: null, defined: false });
    expect(result[1]).toEqual({ n: 1, value: 2, defined: true });
    expect(result.some((row) => row.value === Number.POSITIVE_INFINITY)).toBe(false);
  });

  it('un TROU dans les indices ne produit ni différence ni rapport fantôme', () => {
    const holed = [{ n: 1, value: 1 }, { n: 3, value: 9 }];
    expect(differences(holed)).toEqual([]);
    expect(ratios(holed)).toEqual([]);
  });

  it('les sommes partielles s’accumulent (§36)', () => {
    expect(partialSums(terms).map((sum) => sum.value)).toEqual([2, 7, 15, 26, 40]);
  });

  it('la somme d’une géométrique de raison 1/2 approche 2 (§36)', () => {
    const sums = partialSums(generate(geometric(1, 0.5), 20).terms);
    expect(sums[sums.length - 1].value).toBeCloseTo(2, 5);
  });

  it('les sous-suites paires et impaires séparent une suite alternée (§23)', () => {
    const alternating = generate(geometric(3, -1), 6).terms;
    expect(subsequence(alternating, 'even').map((term) => term.value)).toEqual([3, 3, 3]);
    expect(subsequence(alternating, 'odd').map((term) => term.value)).toEqual([-3, -3, -3]);
  });

  it('l’étendue OBSERVÉE dit où elle a été vue, et ne prétend pas borner la suite (§22)', () => {
    expect(observedRange(generate(geometric(3, -1), 4).terms)).toEqual({ min: -3, max: 3, minAt: 1, maxAt: 0 });
    expect(observedRange([])).toBeNull();
  });
});

describe('les points fixes (§10, §15)', () => {
  it('une affine a un point fixe EXACT : b/(1−a)', () => {
    expect(fixedPoints(affine(0, 0.5, 2))).toEqual({ points: [4], exact: true });
    expect(fixedPoints(affine(0, 0.8, 4))).toEqual({ points: [20], exact: true });
  });

  it('u(n+1) = u(n) + b sans b nul n’a AUCUN point fixe', () => {
    expect(fixedPoints(arithmetic(0, 3))).toEqual({ points: [], exact: true });
  });

  it('u(n+1) = u(n) : TOUT réel est point fixe, et on le dit explicitement', () => {
    expect(fixedPoints(arithmetic(0, 0))).toEqual({ points: [], exact: true, everyPoint: true });
    expect(fixedPoints(geometric(0, 1))).toEqual({ points: [], exact: true, everyPoint: true });
  });

  it('une géométrique a 0 pour point fixe', () => {
    expect(fixedPoints(geometric(2, 0.5)).points).toEqual([0]);
  });

  it('une récurrence libre est résolue NUMÉRIQUEMENT, et marquée comme approchée (§11)', () => {
    const result = fixedPoints(recurrenceOf('u^2 - 1', 0.5), { min: -3, max: 3 });
    expect(result.exact).toBe(false);
    // x² − 1 = x a pour solutions (1 ± √5)/2 ≈ 1,618 et −0,618
    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toBeCloseTo(-0.6180339887, 6);
    expect(result.points[1]).toBeCloseTo(1.6180339887, 6);
  });

  it('un second ordre n’a pas de point fixe à une dimension — on n’en invente pas', () => {
    expect(fixedPoints({ kind: 'secondOrder', startIndex: 0, initial: [0, 1], a: 1, b: 1 }).points).toEqual([]);
  });

  it('les coefficients affines sont reconnus dans les trois familles qui en sont', () => {
    expect(affineCoefficients(arithmetic(0, 3))).toEqual({ a: 1, b: 3 });
    expect(affineCoefficients(geometric(0, 2))).toEqual({ a: 2, b: 0 });
    expect(affineCoefficients(affine(0, 0.5, 2))).toEqual({ a: 0.5, b: 2 });
    expect(affineCoefficients(explicitOf('n'))).toBeNull();
  });
});

describe('la tendance : une OBSERVATION, pas un théorème (§11, §21, §51)', () => {
  const trendOf = (definition, count = 14) => analyseTrend(definition, generate(definition, count).terms);

  it('croissante, décroissante, constante', () => {
    expect(trendOf(arithmetic(0, 2)).status).toBe('increasing');
    expect(trendOf(arithmetic(20, -2)).status).toBe('decreasing');
    expect(trendOf(geometric(5, 1)).status).toBe('constant');
  });

  it('une affine contractante est le SEUL cas marqué « prouvé » — c’est un théorème du cours', () => {
    const trend = trendOf(affine(0, 0.5, 2));
    expect(trend.status).toBe('approaching');
    expect(trend.approachingValue).toBe(4);
    expect(trend.proven).toBe(true);
    expect(trend.observedOnly).toBe(false);
  });

  it('pour une récurrence quelconque, la tendance reste une OBSERVATION (§11)', () => {
    const trend = trendOf(recurrenceOf('u/2 + 1', 10));
    expect(trend.observedOnly).toBe(true);
    expect(trend.proven).toBe(false);
  });

  it('une suite explosive est « diverging » et n’annonce aucune limite', () => {
    const trend = trendOf(geometric(1, 2), 20);
    expect(trend.status).toBe('diverging');
    expect(trend.approachingValue).toBeNull();
  });

  it('(−1)ⁿ ALTERNE sans converger (§24)', () => {
    const trend = trendOf(explicitOf('(-1)^n'), 10);
    expect(trend.status).toBe('alternating');
    expect(trend.alternatingSign).toBe(true);
    expect(trend.approachingValue).toBeNull();
  });

  it('(−1)ⁿ/n alterne MAIS son amplitude décroît : c’est la distinction de §24', () => {
    const definition = explicitOf('(-1)^n/n', 1);
    const trend = analyseTrend(definition, generate(definition, 16).terms);
    expect(trend.alternatingSign).toBe(true);
    expect(trend.amplitudeShrinking).toBe(true);
    expect(trend.status).toBe('approaching');
    expect(trend.approachingValue).toBe(0);
  });

  it('une suite géométrique de raison −0,6 converge en oscillant (§24)', () => {
    const trend = trendOf(geometric(4, -0.6), 20);
    expect(trend.alternatingSign).toBe(true);
    expect(trend.amplitudeShrinking).toBe(true);
  });

  it('un cycle de période 2 n’est pas annoncé convergent', () => {
    const cycle = trendOf(recurrenceOf('3.2u(1-u)', 0.3), 30);
    expect(['oscillating', 'alternating', 'mixed']).toContain(cycle.status);
    expect(cycle.proven).toBe(false);
  });

  it('sans termes, on ne prétend rien', () => {
    expect(analyseTrend(arithmetic(0, 1), []).status).toBe('unknown');
    expect(analyseTrend(arithmetic(0, 1), [{ n: 0, value: 1 }]).status).toBe('unknown');
  });

  it('la monotonie est rendue telle qu’observée (§21)', () => {
    expect(trendOf(arithmetic(0, 2)).monotonic).toBe('up');
    expect(trendOf(arithmetic(0, -2)).monotonic).toBe('down');
    expect(trendOf(geometric(3, -1)).monotonic).toBe('none');
  });
});

describe('la toile d’araignée (§9)', () => {
  it('le chemin monte puis se reporte sur la diagonale, deux points par pas', () => {
    const definition = affine(0, 0.5, 2);
    const path = cobwebPath(definition, generate(definition, 3).terms);
    // (u₀,u₀) puis, par pas : (uₙ, uₙ₊₁) vertical, (uₙ₊₁, uₙ₊₁) horizontal
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[1]).toEqual({ x: 0, y: 2 });
    expect(path[2]).toEqual({ x: 2, y: 2 });
    expect(path[3]).toEqual({ x: 2, y: 3 });
    expect(path[4]).toEqual({ x: 3, y: 3 });
  });

  it('chaque point du chemin est sur la diagonale ou sur la courbe', () => {
    const definition = affine(10, 0.5, 2);
    const path = cobwebPath(definition, generate(definition, 8).terms);
    for (let i = 1; i < path.length; i += 2) {
      // point vertical : y = f(x)
      expect(path[i].y).toBeCloseTo(0.5 * path[i].x + 2, 9);
    }
    for (let i = 2; i < path.length; i += 2) {
      expect(path[i].x).toBeCloseTo(path[i].y, 9);
    }
  });

  it('une suite définie au second ordre n’a pas de toile — elle n’a pas UN antécédent', () => {
    const fib = { kind: 'secondOrder', startIndex: 0, initial: [0, 1], a: 1, b: 1 };
    expect(cobwebPath(fib, generate(fib, 6).terms)).toEqual([]);
  });

  it('le chemin est borné : on ne trace pas cinq cents pas', () => {
    const definition = arithmetic(0, 1);
    expect(cobwebPath(definition, generate(definition, 200).terms, 10)).toHaveLength(21);
  });
});

describe('la comparaison de deux متتاليات (§33)', () => {
  it('ne compare que les indices COMMUNS, avec différence et rapport', () => {
    const left = generate(arithmetic(0, 2), 4).terms;
    const right = generate(arithmetic(0, 1), 3).terms;
    const rows = compareRuns(left, right);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toEqual({ n: 2, left: 4, right: 2, difference: 2, ratio: 2 });
  });

  it('un rapport sur un terme nul n’existe pas', () => {
    const rows = compareRuns([{ n: 0, value: 5 }], [{ n: 0, value: 0 }]);
    expect(rows[0].ratio).toBeNull();
  });

  it('le croisement est l’indice où la différence change de signe', () => {
    // 0,2,4,6 contre 10,9,8,7 : elles se croisent entre n=2 et n=3
    const left = generate(arithmetic(0, 2), 5).terms;
    const right = generate(arithmetic(10, -1), 5).terms;
    expect(crossingIndex(compareRuns(left, right))).toBe(4);
  });

  it('deux suites qui ne se croisent pas rendent null', () => {
    const left = generate(arithmetic(0, 1), 4).terms;
    const right = generate(arithmetic(100, 1), 4).terms;
    expect(crossingIndex(compareRuns(left, right))).toBeNull();
  });
});

describe('la forme explicite, quand le cours la donne (§16)', () => {
  it('arithmétique : u(n) = u₀ + n·r, et elle redonne les mêmes termes', () => {
    const definition = arithmetic(2, 3);
    const closed = closedForm(definition);
    expect(closed.kind).toBe('arithmetic');
    for (const term of generate(definition, 10).terms) {
      expect(closed.closed(term.n), `u(${term.n})`).toBeCloseTo(term.value, 9);
    }
  });

  it('géométrique : u(n) = u₀·qⁿ', () => {
    const definition = geometric(2, 1.5);
    const closed = closedForm(definition);
    for (const term of generate(definition, 10).terms) {
      expect(closed.closed(term.n), `u(${term.n})`).toBeCloseTo(term.value, 9);
    }
  });

  it('affine : u(n) = L + (u₀ − L)·aⁿ, avec L le point fixe', () => {
    const definition = affine(10, 0.5, 2);
    const closed = closedForm(definition);
    expect(closed.params.limit).toBe(4);
    for (const term of generate(definition, 12).terms) {
      expect(closed.closed(term.n), `u(${term.n})`).toBeCloseTo(term.value, 9);
    }
  });

  it('une affine de a = 1 est une arithmétique, et la forme le reconnaît', () => {
    expect(closedForm(affine(2, 1, 3)).kind).toBe('arithmetic');
    expect(closedForm(affine(2, 1, 3)).closed(4)).toBe(14);
  });

  it('l’indice de départ décale l’exposant', () => {
    const closed = closedForm(arithmetic(2, 3, 1));
    expect(closed.closed(1)).toBe(2);
    expect(closed.closed(4)).toBe(11);
  });

  it('une récurrence libre n’a PAS de forme explicite : on ne l’invente pas (§16)', () => {
    expect(closedForm(recurrenceOf('u^2 - 1', 0.5))).toBeNull();
    expect(closedForm({ kind: 'secondOrder', startIndex: 0, initial: [0, 1], a: 1, b: 1 })).toBeNull();
    expect(closedForm(null)).toBeNull();
  });
});

describe('la tolérance (§46)', () => {
  it('compare RELATIVEMENT : 0,1 + 0,2 vaut 0,3', () => {
    expect(nearlyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(nearlyEqual(1e6, 1e6 + 1)).toBe(false);
    expect(nearlyEqual(1e12, 1e12 + 1)).toBe(true);
  });

  it('rien n’est « presque égal » à NaN', () => {
    expect(nearlyEqual(Number.NaN, Number.NaN)).toBe(false);
    expect(nearlyEqual(1, Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe('la règle « un terme → le suivant » (§9)', () => {
  it('existe pour les familles du premier ordre, pas pour les autres', () => {
    expect(stepFunctionOf(arithmetic(0, 3))(5)).toBe(8);
    expect(stepFunctionOf(geometric(0, 2))(5)).toBe(10);
    expect(stepFunctionOf(affine(0, 0.5, 2))(4)).toBe(4);
    expect(stepFunctionOf(explicitOf('n'))).toBeNull();
    expect(stepFunctionOf({ kind: 'secondOrder', startIndex: 0, initial: [0, 1], a: 1, b: 1 })).toBeNull();
  });

  it('un paramètre non fini ne donne pas de règle', () => {
    expect(stepFunctionOf({ kind: 'arithmetic', startIndex: 0, initial: [0], difference: Number.NaN })).toBeNull();
  });
});
