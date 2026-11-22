import { describe, it, expect } from 'vitest';
import {
  MAX_PIE_SECTORS, boxPlotNumbers, chartAvailability, classRows, cumulativeSeries, describeDataset,
  modesOf, pieSectors, resolveChart, rowKeyOfValue, sortedMarks, tableGrouping, valueRows, varianceTerms,
} from './descriptiveStats.js';
import { parseDataset, tokenizeDataset, tokensToText } from './datasetStatistics.js';

const EXAMPLE = [12, 15, 15, 18, 20, 21, 21, 25];

describe('les indicateurs', () => {
  it('lit tout d’une série de 8 valeurs, quartiles selon la convention ⌈kn/4⌉', () => {
    const d = describeDataset(EXAMPLE);
    expect(d).toMatchObject({ n: 8, min: 12, max: 25, range: 13, mean: 18.375, median: 19 });
    // Q1 = valeur de rang ⌈8/4⌉ = 2 → 15 ; Q3 = rang ⌈24/4⌉ = 6 → 21.
    expect(d.q1).toBe(15);
    expect(d.q3).toBe(21);
    expect(d.iqr).toBe(6);
    // Variance de POPULATION (diviseur n).
    const expected = EXAMPLE.reduce((s, v) => s + (v - 18.375) ** 2, 0) / 8;
    expect(d.variance).toBeCloseTo(expected, 12);
    expect(d.sd).toBeCloseTo(Math.sqrt(expected), 12);
    expect(d.modes).toEqual({ kind: 'values', values: [15, 21], count: 2 });
  });

  it('une série vide : null partout, jamais NaN', () => {
    const d = describeDataset([]);
    expect(Object.entries(d).filter(([k]) => k !== 'n' && k !== 'modes').every(([, v]) => v === null)).toBe(true);
    expect(d.n).toBe(0);
    expect(d.modes.kind).toBe('empty');
    expect(describeDataset(undefined).n).toBe(0);
  });

  it('une seule valeur : variance nulle, et c’est le mode', () => {
    const d = describeDataset([7]);
    expect(d.variance).toBe(0);
    expect(d.sd).toBe(0);
    expect(d.q1).toBe(7);
    expect(d.modes).toEqual({ kind: 'values', values: [7], count: 1 });
    expect(describeDataset([0.1, 0.1, 0.1]).variance).toBe(0);
  });

  it('le mode : un, plusieurs, ou aucun', () => {
    expect(modesOf([1, 2, 2, 3])).toEqual({ kind: 'values', values: [2], count: 2 });
    expect(modesOf([1, 2, 3]).kind).toBe('none');
    expect(modesOf([2, 2, 5, 5]).kind).toBe('none');
    expect(modesOf([4, 4, 4]).values).toEqual([4]);
  });

  it('écrit la variance terme à terme pour une petite série seulement', () => {
    const terms = varianceTerms([2, 4, 6]);
    expect(terms.map((t) => t.square)).toEqual([4, 0, 4]);
    expect(varianceTerms(new Array(9).fill(1))).toBeNull();
    expect(varianceTerms([])).toBeNull();
  });
});

describe('le tableau', () => {
  it('par valeur : effectif, fréquence, effectifs cumulés croissants, angle', () => {
    const rows = valueRows(EXAMPLE);
    expect(rows.map((row) => [row.value, row.count, row.cumulativeCount])).toEqual([
      [12, 1, 1], [15, 2, 3], [18, 1, 4], [20, 1, 5], [21, 2, 7], [25, 1, 8],
    ]);
    expect(rows[1].frequency).toBe(0.25);
    expect(rows[1].angle).toBe(90);
    expect(rows[rows.length - 1].cumulativeFrequency).toBe(1);
    expect(rows.reduce((s, row) => s + row.angle, 0)).toBeCloseTo(360, 10);
    expect(valueRows([])).toEqual([]);
  });

  it('par classe : les classes de l’histogramme, la dernière fermée, cumulées', () => {
    const values = Array.from({ length: 40 }, (_, i) => 150 + i);
    const rows = classRows(values);
    expect(rows[0].from).toBeLessThanOrEqual(150);
    expect(rows[rows.length - 1].isLast).toBe(true);
    expect(rows[rows.length - 1].cumulativeCount).toBe(40);
    expect(rows.reduce((s, row) => s + row.count, 0)).toBe(40);
    expect(rowKeyOfValue(rows, 150)).toBe('c:0');
    expect(rowKeyOfValue(rows, 189)).toBe(rows[rows.length - 1].key);
    expect(rowKeyOfValue(valueRows(EXAMPLE), 21)).toBe('v:21');
    expect(rowKeyOfValue(valueRows(EXAMPLE), 99)).toBeNull();
  });

  it('se regroupe par classes pour l’histogramme ou une série dispersée', () => {
    expect(tableGrouping('bars', EXAMPLE)).toBe('values');
    expect(tableGrouping('histogram', EXAMPLE)).toBe('classes');
    expect(tableGrouping('box', Array.from({ length: 30 }, (_, i) => i))).toBe('classes');
  });
});

describe('les graphiques permis', () => {
  it('refuse le diagramme circulaire au-delà de 8 modalités, avec la raison', () => {
    expect(chartAvailability(EXAMPLE).pie).toEqual({ available: true });
    const many = Array.from({ length: MAX_PIE_SECTORS + 1 }, (_, i) => i);
    expect(chartAvailability(many).pie).toEqual({ available: false, reason: 'tooManyForPie' });
  });

  it('refuse les bâtons au-delà de 15 valeurs distinctes, l’histogramme d’une seule valeur, tout sur une série vide', () => {
    const spread = Array.from({ length: 30 }, (_, i) => i * 1.5);
    expect(chartAvailability(spread).bars.reason).toBe('tooManyForBars');
    expect(chartAvailability([3, 3, 3]).histogram.reason).toBe('singleValue');
    expect(Object.values(chartAvailability([])).every((c) => c.reason === 'empty')).toBe(true);
    expect(chartAvailability([3]).box.available).toBe(true);
  });

  it('résout le choix : automatique par défaut, repli honnête si impossible', () => {
    expect(resolveChart(null, EXAMPLE)).toEqual({ chart: 'bars', fallback: false, automatic: 'bars' });
    expect(resolveChart('pie', EXAMPLE).chart).toBe('pie');
    const spread = Array.from({ length: 30 }, (_, i) => i * 1.5);
    expect(resolveChart(null, spread).chart).toBe('histogram');
    expect(resolveChart('pie', spread)).toEqual({ chart: 'histogram', fallback: true, automatic: 'histogram' });
  });

  it('dessine la boîte à partir des cinq nombres', () => {
    expect(boxPlotNumbers(EXAMPLE)).toEqual({ min: 12, q1: 15, median: 19, q3: 21, max: 25 });
    expect(boxPlotNumbers([])).toBeNull();
  });

  it('ferme le cercle à 360° exactement', () => {
    const sectors = pieSectors(valueRows([1, 2, 2, 3, 3, 3]));
    expect(sectors[0].start).toBe(0);
    expect(sectors[sectors.length - 1].end).toBe(360);
    expect(sectors[1].start).toBeCloseTo(60, 10);
  });

  it('les effectifs cumulés : escalier pour des valeurs, polygone pour des classes', () => {
    const steps = cumulativeSeries(EXAMPLE, 'values');
    expect(steps.kind).toBe('steps');
    expect(steps.points.map((p) => p.y)).toEqual([1, 3, 4, 5, 7, 8]);
    const polygon = cumulativeSeries(Array.from({ length: 40 }, (_, i) => 150 + i), 'classes');
    expect(polygon.kind).toBe('polygon');
    expect(polygon.points[0].y).toBe(0);
    expect(polygon.points[polygon.points.length - 1].y).toBe(40);
    expect(cumulativeSeries([], 'values').points).toEqual([]);
  });

  it('marque les rangs de Q1, Me, Q3 dans la série ordonnée', () => {
    expect(sortedMarks(8)).toEqual({ q1: 2, q3: 6, median: [4, 5] });
    expect(sortedMarks(7)).toEqual({ q1: 2, q3: 6, median: [4] });
    expect(sortedMarks(1)).toEqual({ q1: 1, q3: 1, median: [1] });
    expect(sortedMarks(0).median).toEqual([]);
  });
});

describe('l’éditeur en pastilles relit ce qu’il écrit', () => {
  it('retrouve les mêmes jetons, virgule décimale comprise', () => {
    for (const text of ['12, 15, 15', '12,5 14,2', '12 ; 15,5 ; -4', '3\n4\n5', '1, abc, 3']) {
      const tokens = tokenizeDataset(text);
      expect(tokenizeDataset(tokensToText(tokens))).toEqual(tokens);
      expect(parseDataset(tokensToText(tokens)).values).toEqual(parseDataset(text).values);
    }
    expect(tokensToText(['1', ' ', '2,5'])).toBe('1 ; 2,5');
  });
});

describe('les formules et la lecture graphique', () => {
  it('lit la médiane estimée sur le polygone des effectifs cumulés', async () => {
    const { cumulativeCrossing } = await import('./descriptiveStats.js');
    const polygon = { kind: 'polygon', points: [{ x: 0, y: 0 }, { x: 10, y: 4 }, { x: 20, y: 10 }] };
    expect(cumulativeCrossing(polygon, 5)).toBeCloseTo(10 + (1 / 6) * 10, 12);
    expect(cumulativeCrossing(polygon, 12)).toBeNull();
    expect(cumulativeCrossing({ kind: 'steps', points: polygon.points }, 5)).toBeNull();
  });

});
