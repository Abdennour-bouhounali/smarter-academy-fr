import { describe, it, expect } from 'vitest';
import {
  DATASET_VALUE_BOUND, MAX_DATASET_VALUES, MAX_DISTINCT_BARS, datasetToText,
  distributionOf, histogramBins, parseDataset, parseValue, summarize,
} from './datasetStatistics.js';
import {
  EXAMPLE_DATASET, PROBABILITY_STATS_SCHEMA_VERSION, createProbabilityStatsData,
  normalizeProbabilityStatsData, toStoredData,
} from './probabilityState.js';
import { createSimulation, runBatch, toStoredSimulation } from './simulationEngine.js';

/**
 * La série saisie par l'élève : ce qu'on en lit, ce qu'on en refuse, ce
 * qu'on en calcule, et ce qu'un document en garde.
 */

describe('lire une valeur', () => {
  it('accepte ce qu’un élève écrit vraiment : virgule décimale, vrai moins, espaces', () => {
    expect(parseValue('12')).toBe(12);
    expect(parseValue('12,5')).toBe(12.5);
    expect(parseValue('12.5')).toBe(12.5);
    expect(parseValue('−4')).toBe(-4);
    expect(parseValue('  7  ')).toBe(7);
    expect(parseValue('-0,25')).toBe(-0.25);
  });

  it('refuse ce qui ressemble à un nombre sans en être un', () => {
    for (const bad of ['abc', '12a', '1.2.3', '', '  ', '--3', '1/2', 'NaN', 'Infinity']) {
      expect(parseValue(bad), bad).toBeNaN();
    }
  });

  it('refuse un nombre trop grand pour un graphique', () => {
    expect(parseValue(String(DATASET_VALUE_BOUND * 10))).toBeNaN();
  });
});

describe('lire une série', () => {
  it('lit la série de l’énoncé', () => {
    const { values, invalid } = parseDataset('12, 15, 14, 18, 10, 12, 16');
    expect(values).toEqual([12, 15, 14, 18, 10, 12, 16]);
    expect(invalid).toEqual([]);
  });

  it('accepte le point-virgule, l’espace et le retour à la ligne', () => {
    expect(parseDataset('1 ; 2 ; 3').values).toEqual([1, 2, 3]);
    expect(parseDataset('1 2 3').values).toEqual([1, 2, 3]);
    expect(parseDataset('1\n2\n3').values).toEqual([1, 2, 3]);
    expect(parseDataset('1\t2\t3').values).toEqual([1, 2, 3]);
  });

  it('ne passe PAS une valeur illisible sous silence', () => {
    const { values, invalid } = parseDataset('12, 15, abc, 20');
    expect(values).toEqual([12, 15, 20]);
    expect(invalid).toHaveLength(1);
    expect(invalid[0].text).toBe('abc');
  });

  it('tranche l’ambiguïté de la virgule en faveur du sens : « 12,5 14,2 » est deux décimaux', () => {
    expect(parseDataset('12,5 14,2').values).toEqual([12.5, 14.2]);
    // Mais un collier d'entiers séparés par des virgules reste un collier.
    expect(parseDataset('1, 2, 3, 4').values).toEqual([1, 2, 3, 4]);
    // Et le point-virgule lève toute ambiguïté.
    expect(parseDataset('12,5 ; 14,2 ; 9').values).toEqual([12.5, 14.2, 9]);
  });

  it('borne le nombre de valeurs et le dit', () => {
    const many = Array.from({ length: MAX_DATASET_VALUES + 20 }, (_, i) => i).join(' ');
    const { values, truncated } = parseDataset(many);
    expect(values).toHaveLength(MAX_DATASET_VALUES);
    expect(truncated).toBe(true);
  });

  it('rend une série vide sur une saisie vide, sans rien inventer', () => {
    expect(parseDataset('').values).toEqual([]);
    expect(parseDataset('   ').values).toEqual([]);
    expect(parseDataset(null).values).toEqual([]);
    expect(parseDataset('').invalid).toEqual([]);
  });
});

describe('résumer une série', () => {
  it('[10, 20, 30] → n = 3, moyenne 20, médiane 20, étendue 20', () => {
    const s = summarize([10, 20, 30]);
    expect(s.n).toBe(3);
    expect(s.min).toBe(10);
    expect(s.max).toBe(30);
    expect(s.mean).toBe(20);
    expect(s.median).toBe(20);
    expect(s.range).toBe(20);
  });

  it('[10, 20, 30, 40] → moyenne 25, médiane 25 (demi-somme des deux centrales)', () => {
    const s = summarize([10, 20, 30, 40]);
    expect(s.n).toBe(4);
    expect(s.mean).toBe(25);
    expect(s.median).toBe(25);
    expect(s.range).toBe(30);
  });

  it('ne suppose pas la série triée', () => {
    expect(summarize([18, 10, 15, 12, 14, 16, 12])).toMatchObject({
      n: 7, min: 10, max: 18, range: 8, median: 14,
    });
    expect(summarize([18, 10, 15, 12, 14, 16, 12]).mean).toBeCloseTo(97 / 7, 12);
  });

  it('gère une seule valeur et des valeurs négatives ou décimales', () => {
    expect(summarize([7])).toMatchObject({ n: 1, min: 7, max: 7, range: 0, mean: 7, median: 7 });
    expect(summarize([-5, 5]).mean).toBe(0);
    expect(summarize([1.5, 2.5]).mean).toBe(2);
  });

  it('rend null partout sur une série vide — jamais NaN', () => {
    const s = summarize([]);
    expect(s.n).toBe(0);
    for (const key of ['min', 'max', 'range', 'mean', 'median']) expect(s[key]).toBeNull();
    expect(summarize(null).n).toBe(0);
  });
});

describe('représenter une série', () => {
  it('choisit des bâtons quand les valeurs distinctes sont peu nombreuses', () => {
    const { kind, bins } = distributionOf([1, 2, 2, 3, 3, 3]);
    expect(kind).toBe('bars');
    expect(bins).toHaveLength(3);
    expect(bins.map((b) => b.count)).toEqual([1, 2, 3]);
    expect(bins.reduce((s, b) => s + b.frequency, 0)).toBeCloseTo(1, 12);
  });

  it('bascule en classes quand il y en a trop pour un bâton chacune', () => {
    const values = Array.from({ length: 200 }, (_, i) => i);
    const { kind, bins } = distributionOf(values);
    expect(kind).toBe('classes');
    expect(bins.length).toBeGreaterThanOrEqual(5);
    expect(bins.length).toBeLessThanOrEqual(13);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(200);
  });

  it('garde les bâtons jusqu’au seuil exactement', () => {
    const values = Array.from({ length: MAX_DISTINCT_BARS }, (_, i) => i);
    expect(distributionOf(values).kind).toBe('bars');
    expect(distributionOf([...values, MAX_DISTINCT_BARS]).kind).toBe('classes');
  });

  it('compte chaque valeur une fois et une seule, la maximale comprise', () => {
    const values = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
    const bins = histogramBins(values);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(values.length);
    expect(bins[bins.length - 1].isLast).toBe(true);
  });

  it('survit à une série constante', () => {
    const { bins } = distributionOf([4, 4, 4, 4]);
    expect(bins).toHaveLength(1);
    expect(bins[0].count).toBe(4);
    expect(histogramBins([4, 4, 4])[0].count).toBe(3);
  });

  it('rend une distribution vide sur une série vide', () => {
    expect(distributionOf([]).bins).toEqual([]);
  });

  // Le texte est ce qu'on REMET dans le champ de saisie : il doit pouvoir
  // être relu par parseDataset. Le vrai signe moins est affaire d'affichage
  // (formatValue), pas de saisie.
  it('réécrit une série avec la virgule décimale, et se relit elle-même', () => {
    expect(datasetToText([12, 15.5, -4])).toBe('12 ; 15,5 ; -4');
    expect(parseDataset(datasetToText([12, 15.5, -4])).values).toEqual([12, 15.5, -4]);
  });
});

describe('l’état du document', () => {
  it('ouvre sur la pièce, sans aucun tirage, avec la série d’exemple', () => {
    const data = createProbabilityStatsData();
    expect(data.mode).toBe('experiment');
    expect(data.experiment).toBe('coin');
    expect(data.simulation).toBeNull();
    expect(data.dataset).toBe(EXAMPLE_DATASET);
    expect(data.settings).toEqual({ compare: true, showMean: true, showMedian: true, watchRolls: true });
    expect(PROBABILITY_STATS_SCHEMA_VERSION).toBe(2);
  });

  it('redresse n’importe quel document en un état sûr', () => {
    const data = normalizeProbabilityStatsData({
      mode: 'nawak', experiment: 'roulette', draws: -5, range: { min: 50, max: 2 },
      settings: { compare: false, showMean: 'oui' }, dataset: 42,
    });
    expect(data.mode).toBe('experiment');
    expect(data.experiment).toBe('coin');
    expect(data.draws).toBe(1);
    expect(data.range).toEqual({ min: 2, max: 50 });
    expect(data.settings.compare).toBe(false);
    expect(data.settings.showMean).toBe(true);
    expect(data.dataset).toBe(EXAMPLE_DATASET);
    expect(normalizeProbabilityStatsData(null).experiment).toBe('coin');
    expect(normalizeProbabilityStatsData(undefined).mode).toBe('experiment');
  });

  it('garde une saisie FAUTIVE telle quelle, pour que l’élève la corrige', () => {
    const data = normalizeProbabilityStatsData({ dataset: '12, abc, 15' });
    expect(data.dataset).toBe('12, abc, 15');
  });

  it('relit une simulation enregistrée, et écarte celle d’une autre expérience', () => {
    const simulation = toStoredSimulation(runBatch(createSimulation('die', {}, 11), 120));
    expect(normalizeProbabilityStatsData({ experiment: 'die', simulation }).simulation.total).toBe(120);
    expect(normalizeProbabilityStatsData({ experiment: 'coin', simulation }).simulation).toBeNull();
  });

  it('enregistre la simulation sous forme d’effectifs, jamais de tirages', () => {
    const data = normalizeProbabilityStatsData({ experiment: 'die' });
    const stored = toStoredData({ ...data, simulation: runBatch(createSimulation('die', {}, 2), 50000) });
    expect(stored.simulation.total).toBe(50000);
    expect(stored.simulation.counts).toHaveLength(6);
    expect(JSON.stringify(stored).length).toBeLessThan(3000);
  });

  it('accepte une amorce de leçon, mais jamais une simulation toute faite', () => {
    const data = createProbabilityStatsData({ mode: 'dataset', values: [3, 1, 2], simulation: { total: 99 } });
    expect(data.mode).toBe('dataset');
    expect(data.dataset).toBe('3 ; 1 ; 2');
    expect(data.simulation).toBeNull();
    expect(createProbabilityStatsData({ experiment: 'twoDice' }).experiment).toBe('twoDice');
  });
});
