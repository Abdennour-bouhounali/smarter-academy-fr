import { describe, it, expect } from 'vitest';
import {
  mean, weightedMean, median, q1, q3, quartile, range, interquartileRange,
  fiveNumberSummary, variance, standardDeviation, weightedStandardDeviation,
  frequencyTable, groupIntoClasses, classMean, medianClass, interpolatedMedian,
  crossTable, marginalFrequency, conditionalFrequency, jointFrequency,
  conditionalProbability, diagnosticIndicators, diagnosticCounts,
  formatNumber, formatPercent, formatClass, sorted,
} from './statsUtils';

describe('indicateurs de position', () => {
  it('ne mute pas la série qu’on lui passe', () => {
    const values = [5, 1, 3];
    sorted(values);
    median(values);
    q1(values);
    expect(values).toEqual([5, 1, 3]);
  });

  it('moyenne, et null sur une série vide', () => {
    expect(mean([2, 4, 9])).toBeCloseTo(5, 10);
    expect(mean([])).toBeNull();
  });

  it('médiane : demi-somme centrale si n est pair, valeur centrale si n est impair', () => {
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([7, 1, 3])).toBe(3); // trie avant
  });

  it('quartiles au rang ⌈n/4⌉ et ⌈3n/4⌉ — une valeur de la série', () => {
    // n = 8 : rang Q1 = 2, rang Q3 = 6
    const s = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(q1(s)).toBe(2);
    expect(q3(s)).toBe(6);
    // n = 10 : rang Q1 = ⌈2,5⌉ = 3, rang Q3 = ⌈7,5⌉ = 8
    const t = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(q1(t)).toBe(30);
    expect(q3(t)).toBe(80);
    // n = 9 : rang Q1 = ⌈2,25⌉ = 3, rang Q3 = ⌈6,75⌉ = 7
    const u = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(q1(u)).toBe(3);
    expect(q3(u)).toBe(7);
  });

  it('Q1 ≤ médiane ≤ Q3 sur des séries quelconques', () => {
    const series = [[4, 4, 4, 4], [1, 100], [3, 1, 4, 1, 5, 9, 2, 6], [2, 2, 2, 5, 9]];
    for (const s of series) {
      expect(q1(s)).toBeLessThanOrEqual(median(s));
      expect(median(s)).toBeLessThanOrEqual(q3(s));
    }
  });

  it('étendue et écart interquartile', () => {
    const s = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(range(s)).toBe(7);
    expect(interquartileRange(s)).toBe(4); // 6 − 2
  });

  it('résumé des cinq nombres', () => {
    expect(fiveNumberSummary([1, 2, 3, 4, 5, 6, 7, 8])).toEqual({ min: 1, q1: 2, median: 4.5, q3: 6, max: 8 });
    expect(fiveNumberSummary([])).toBeNull();
  });

  it('série constante : dispersion nulle partout', () => {
    const s = [7, 7, 7, 7, 7];
    expect(interquartileRange(s)).toBe(0);
    expect(range(s)).toBe(0);
    expect(standardDeviation(s)).toBe(0);
  });
});

describe('dispersion', () => {
  it('variance de population (diviseur n) et écart type', () => {
    // [2,4,4,4,5,5,7,9] : moyenne 5, variance 4, écart type 2 — l'exemple canonique
    const s = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(mean(s)).toBe(5);
    expect(variance(s)).toBeCloseTo(4, 10);
    expect(standardDeviation(s)).toBeCloseTo(2, 10);
  });

  it('l’écart type pondéré redonne l’écart type de la série développée', () => {
    const pairs = [{ value: 2, count: 1 }, { value: 4, count: 3 }, { value: 5, count: 2 }, { value: 7, count: 1 }, { value: 9, count: 1 }];
    expect(weightedStandardDeviation(pairs)).toBeCloseTo(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]), 10);
  });

  it('moyenne pondérée = moyenne de la série développée', () => {
    expect(weightedMean([{ value: 10, count: 2 }, { value: 20, count: 3 }])).toBeCloseTo(mean([10, 10, 20, 20, 20]), 10);
    expect(weightedMean([{ value: 1, count: 0 }])).toBeNull();
  });
});

describe('effectifs et regroupement en classes', () => {
  it('table des effectifs triée par valeur', () => {
    expect(frequencyTable([3, 1, 3, 2, 3])).toEqual([
      { value: 1, count: 1 }, { value: 2, count: 1 }, { value: 3, count: 3 },
    ]);
  });

  it('classes [a ; b[ sauf la dernière, fermée — aucune valeur perdue', () => {
    const values = [0, 5, 10, 15, 19, 20];
    const classes = groupIntoClasses(values, [0, 10, 20]);
    expect(classes.map((c) => c.count)).toEqual([2, 4]);
    // la valeur 10 est dans la 2e classe, la valeur 20 (max) est comptée
    expect(classes.reduce((a, c) => a + c.count, 0)).toBe(values.length);
  });

  it('fréquences cumulées croissantes, la dernière vaut 1', () => {
    const classes = groupIntoClasses([1, 2, 3, 11, 12, 21], [0, 10, 20, 30]);
    expect(classes.map((c) => c.cumulativeCount)).toEqual([3, 5, 6]);
    expect(classes[classes.length - 1].cumulativeFrequency).toBeCloseTo(1, 10);
  });

  it('densité = effectif / amplitude (classes d’amplitudes inégales)', () => {
    const classes = groupIntoClasses([1, 2, 3, 4, 25], [0, 10, 30]);
    expect(classes[0].density).toBeCloseTo(4 / 10, 10);
    expect(classes[1].density).toBeCloseTo(1 / 20, 10);
  });

  it('moyenne estimée par les centres ≠ moyenne exacte (le prix du regroupement)', () => {
    const values = [1, 2, 3, 19];
    const classes = groupIntoClasses(values, [0, 10, 20]);
    expect(classMean(classes)).toBeCloseTo((5 * 3 + 15 * 1) / 4, 10);
    expect(classMean(classes)).not.toBeCloseTo(mean(values), 5);
  });

  it('classe médiane = première dont la fréquence cumulée atteint 0,5', () => {
    const classes = groupIntoClasses([1, 2, 11, 12, 21], [0, 10, 20, 30]);
    expect(medianClass(classes).from).toBe(10);
  });

  it('médiane interpolée tombe dans la classe médiane', () => {
    const classes = groupIntoClasses([1, 2, 11, 12, 21], [0, 10, 20, 30]);
    const m = interpolatedMedian(classes);
    expect(m).toBeGreaterThanOrEqual(10);
    expect(m).toBeLessThanOrEqual(20);
  });
});

describe('tableaux croisés', () => {
  const OBS = [
    { sport: 'foot', classe: '2A' }, { sport: 'foot', classe: '2A' }, { sport: 'foot', classe: '2B' },
    { sport: 'danse', classe: '2A' }, { sport: 'danse', classe: '2B' }, { sport: 'danse', classe: '2B' },
    { sport: 'judo', classe: '2B' },
  ];
  const T = crossTable(OBS, 'sport', 'classe', ['foot', 'danse', 'judo'], ['2A', '2B']);

  it('effectifs, marges et total', () => {
    expect(T.cells.foot['2A']).toBe(2);
    expect(T.rowTotals.danse).toBe(3);
    expect(T.colTotals['2B']).toBe(4);
    expect(T.grandTotal).toBe(7);
  });

  it('la somme des marges vaut le total, des deux côtés', () => {
    const rows = Object.values(T.rowTotals).reduce((a, b) => a + b, 0);
    const cols = Object.values(T.colTotals).reduce((a, b) => a + b, 0);
    expect(rows).toBe(T.grandTotal);
    expect(cols).toBe(T.grandTotal);
  });

  it('conditionnelle et marginale n’ont PAS le même dénominateur', () => {
    // parmi les 2A (3 élèves), la proportion de foot = 2/3
    expect(conditionalFrequency(T, { axis: 'col', key: '2A' }, 'foot')).toBeCloseTo(2 / 3, 10);
    // parmi les footeux (3), la proportion de 2A = 2/3 aussi ici, mais c'est une AUTRE question
    expect(conditionalFrequency(T, { axis: 'row', key: 'foot' }, '2A')).toBeCloseTo(2 / 3, 10);
    // la marginale rapporte au total, pas à une sous-population
    expect(marginalFrequency(T, 'row', 'foot')).toBeCloseTo(3 / 7, 10);
    expect(jointFrequency(T, 'foot', '2A')).toBeCloseTo(2 / 7, 10);
  });

  it('les conditionnelles selon une même condition somment à 1', () => {
    const s = ['foot', 'danse', 'judo'].reduce((a, sp) => a + conditionalFrequency(T, { axis: 'col', key: '2B' }, sp), 0);
    expect(s).toBeCloseTo(1, 10);
  });

  it('P_B(A) et P_A(B) diffèrent en général', () => {
    // parmi les 2B (4), la proportion de judo = 1/4 ; parmi les judokas (1), la proportion de 2B = 1
    expect(conditionalFrequency(T, { axis: 'col', key: '2B' }, 'judo')).toBeCloseTo(0.25, 10);
    expect(conditionalFrequency(T, { axis: 'row', key: 'judo' }, '2B')).toBeCloseTo(1, 10);
  });

  it('une condition d’effectif nul renvoie null, jamais NaN', () => {
    const empty = crossTable([], 'a', 'b', ['x'], ['y']);
    expect(conditionalFrequency(empty, { axis: 'row', key: 'x' }, 'y')).toBeNull();
    expect(marginalFrequency(empty, 'row', 'x')).toBeNull();
  });
});

describe('probabilités conditionnelles et tests diagnostiques', () => {
  it('P_B(A) = effectif(A∩B) / effectif(B)', () => {
    expect(conditionalProbability(30, 120)).toBeCloseTo(0.25, 10);
    expect(conditionalProbability(1, 0)).toBeNull();
  });

  it('sensibilité et VPP sont deux choses différentes (le piège de la leçon)', () => {
    // 10 000 personnes, prévalence 1 %, sensibilité 99 %, spécificité 95 %
    const counts = diagnosticCounts({ population: 10000, prevalence: 0.01, sensitivity: 0.99, specificity: 0.95 });
    expect(counts).toEqual({ truePositive: 99, falseNegative: 1, falsePositive: 495, trueNegative: 9405 });
    const ind = diagnosticIndicators(counts);
    expect(ind.total).toBe(10000);
    expect(ind.sensitivity).toBeCloseTo(0.99, 10);
    expect(ind.specificity).toBeCloseTo(0.95, 10);
    // P(malade | test +) = 99 / 594 ≈ 16,7 % — très loin des 99 % de la sensibilité
    expect(ind.ppv).toBeCloseTo(99 / 594, 10);
    expect(ind.ppv).toBeLessThan(0.2);
  });

  it('les quatre effectifs se répartissent exactement sur la population', () => {
    const counts = diagnosticCounts({ population: 10000, prevalence: 0.023, sensitivity: 0.9, specificity: 0.88 });
    const { truePositive, falseNegative, falsePositive, trueNegative } = counts;
    expect(truePositive + falseNegative + falsePositive + trueNegative).toBe(10000);
  });

  it('une prévalence plus forte relève la VPP, à test constant', () => {
    const low = diagnosticIndicators(diagnosticCounts({ population: 100000, prevalence: 0.001, sensitivity: 0.99, specificity: 0.95 }));
    const high = diagnosticIndicators(diagnosticCounts({ population: 100000, prevalence: 0.2, sensitivity: 0.99, specificity: 0.95 }));
    expect(high.ppv).toBeGreaterThan(low.ppv);
  });
});

describe('formatage français', () => {
  it('virgule décimale, signe moins typographique, tirets sur null', () => {
    expect(formatNumber(3.5)).toBe('3,5');
    expect(formatNumber(-2.25)).toBe('−2,25');
    expect(formatNumber(4)).toBe('4');
    expect(formatNumber(null)).toBe('—');
  });

  it('pourcentages', () => {
    expect(formatPercent(0.375)).toBe('37,5 %');
    expect(formatPercent(1)).toBe('100 %');
  });

  it('intervalle de classe : dernière fermée à droite', () => {
    expect(formatClass({ from: 10, to: 20, isLast: false })).toBe('[10 ; 20[');
    expect(formatClass({ from: 20, to: 30, isLast: true })).toBe('[20 ; 30]');
  });
});
