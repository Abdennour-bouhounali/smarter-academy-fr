import { describe, it, expect } from 'vitest';
import { fiveNumberSummary, median, q1, q3, range, interquartileRange } from '../../../../common/stats';
import { BREST, TOULOUSE, EMBRUN } from './data';

/**
 * Les cinq nombres de chaque ville sont cités dans les énoncés et les
 * corrections : ils sont vérifiés ici, pas écrits de mémoire.
 */
describe('les trois villes', () => {
  it('trente relevés chacune', () => {
    for (const s of [BREST, TOULOUSE, EMBRUN]) expect(s).toHaveLength(30);
  });

  it('Brest — les cinq nombres cités', () => {
    // n = 30 : rang Q1 = ⌈7,5⌉ = 8, rang Q3 = ⌈22,5⌉ = 23, médiane = (15e + 16e)/2
    expect(fiveNumberSummary(BREST)).toEqual({ min: 14, q1: 17, median: 19, q3: 21, max: 24 });
    expect(interquartileRange(BREST)).toBe(4);
    expect(range(BREST)).toBe(10);
  });

  it('Toulouse — les cinq nombres cités', () => {
    expect(fiveNumberSummary(TOULOUSE)).toEqual({ min: 16, q1: 21, median: 24, q3: 27, max: 32 });
    expect(interquartileRange(TOULOUSE)).toBe(6);
    expect(range(TOULOUSE)).toBe(16);
  });

  it('Embrun — les cinq nombres cités', () => {
    expect(fiveNumberSummary(EMBRUN)).toEqual({ min: 6, q1: 13, median: 17.5, q3: 25, max: 35 });
    expect(interquartileRange(EMBRUN)).toBe(12);
    expect(range(EMBRUN)).toBe(29);
  });
});

describe('ce que la comparaison doit révéler', () => {
  it('Toulouse a la médiane la plus haute', () => {
    expect(median(TOULOUSE)).toBeGreaterThan(median(BREST));
    expect(median(TOULOUSE)).toBeGreaterThan(median(EMBRUN));
  });

  it('Brest est la plus régulière, Embrun la plus dispersée', () => {
    expect(interquartileRange(BREST)).toBeLessThan(interquartileRange(TOULOUSE));
    expect(interquartileRange(TOULOUSE)).toBeLessThan(interquartileRange(EMBRUN));
    expect(range(BREST)).toBeLessThan(range(EMBRUN));
  });

  it('LE CONTRE-EXEMPLE : Embrun a la médiane la plus BASSE et pourtant le maximum le plus HAUT', () => {
    expect(median(EMBRUN)).toBeLessThan(median(TOULOUSE));
    expect(Math.max(...EMBRUN)).toBeGreaterThan(Math.max(...TOULOUSE));
    // Donc « la ville la plus froide » y connaît le jour le plus chaud du mois.
  });

  it('les quartiles restent ordonnés dans les trois villes', () => {
    for (const s of [BREST, TOULOUSE, EMBRUN]) {
      expect(q1(s)).toBeLessThanOrEqual(median(s));
      expect(median(s)).toBeLessThanOrEqual(q3(s));
    }
  });

  it('la boîte de Brest est entièrement contenue dans celle d’Embrun', () => {
    // Utilisé par le module 3 : une boîte étroite « à l'intérieur » d'une large.
    expect(q1(BREST)).toBeGreaterThan(q1(EMBRUN));
    expect(q3(BREST)).toBeLessThan(q3(EMBRUN));
  });
});
