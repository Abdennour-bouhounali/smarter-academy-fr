import { describe, it, expect } from 'vitest';
import {
  mean, median, q1, q3, range, interquartileRange, standardDeviation,
} from '../../../../common/stats';
import { TRAJETS_A, TRAJETS_B, ELEVE_LOINTAIN, ATELIER_X, ATELIER_Y } from './data';

/**
 * Les corrections des modules citent ces nombres. Ce test les VÉRIFIE : si
 * une série est retouchée, les énoncés qui deviennent faux sont signalés ici
 * plutôt que découverts par un élève.
 */
describe('série 2de A (référence de la leçon)', () => {
  it('compte 20 valeurs', () => {
    expect(TRAJETS_A).toHaveLength(20);
  });

  it('les indicateurs annoncés dans les modules', () => {
    expect(mean(TRAJETS_A)).toBeCloseTo(19.15, 2);
    expect(median(TRAJETS_A)).toBe(18);          // n pair : (18 + 18)/2
    expect(q1(TRAJETS_A)).toBe(12);              // rang ⌈20/4⌉ = 5
    expect(q3(TRAJETS_A)).toBe(25);              // rang ⌈60/4⌉ = 15
    expect(interquartileRange(TRAJETS_A)).toBe(13);
    expect(range(TRAJETS_A)).toBe(35);
  });

  it('la moyenne dépasse la médiane : la série est étirée vers la droite', () => {
    expect(mean(TRAJETS_A)).toBeGreaterThan(median(TRAJETS_A));
  });
});

describe('série 2de B (même centre, plus resserrée)', () => {
  it('les indicateurs annoncés', () => {
    expect(TRAJETS_B).toHaveLength(20);
    expect(mean(TRAJETS_B)).toBeCloseTo(19.1, 2);
    expect(median(TRAJETS_B)).toBe(19);
    expect(q1(TRAJETS_B)).toBe(17);
    expect(q3(TRAJETS_B)).toBe(21);   // rang ⌈60/4⌉ = 15
    expect(interquartileRange(TRAJETS_B)).toBe(4);
    expect(range(TRAJETS_B)).toBe(11);
  });

  it('même moyenne que A à 0,1 près, mais dispersion bien plus faible', () => {
    expect(Math.abs(mean(TRAJETS_A) - mean(TRAJETS_B))).toBeLessThan(0.1);
    expect(standardDeviation(TRAJETS_B)).toBeLessThan(standardDeviation(TRAJETS_A) / 2);
    expect(interquartileRange(TRAJETS_B)).toBeLessThan(interquartileRange(TRAJETS_A));
    expect(range(TRAJETS_B)).toBeLessThan(range(TRAJETS_A));
  });
});

describe('ajout d’un élève très éloigné (module 5)', () => {
  const withOutlier = [...TRAJETS_A, ELEVE_LOINTAIN];

  it('la moyenne bondit, la médiane bouge à peine', () => {
    const dMean = mean(withOutlier) - mean(TRAJETS_A);
    const dMed = median(withOutlier) - median(TRAJETS_A);
    expect(dMean).toBeGreaterThan(4);
    expect(Math.abs(dMed)).toBeLessThanOrEqual(1);
  });

  it('valeurs exactes citées par le module', () => {
    expect(mean(withOutlier)).toBeCloseTo(23.95, 2);
    expect(median(withOutlier)).toBe(18);
  });
});

describe('linéarité de la moyenne (module 5)', () => {
  it('retirer 5 min à chacun retire 5 min à la moyenne et à la médiane', () => {
    const shifted = TRAJETS_A.map((v) => v - 5);
    expect(mean(shifted)).toBeCloseTo(mean(TRAJETS_A) - 5, 10);
    expect(median(shifted)).toBe(median(TRAJETS_A) - 5);
    // la dispersion, elle, ne change pas
    expect(standardDeviation(shifted)).toBeCloseTo(standardDeviation(TRAJETS_A), 10);
    expect(interquartileRange(shifted)).toBe(interquartileRange(TRAJETS_A));
  });

  it('doubler chaque valeur double moyenne ET écart type', () => {
    const doubled = TRAJETS_A.map((v) => v * 2);
    expect(mean(doubled)).toBeCloseTo(mean(TRAJETS_A) * 2, 10);
    expect(standardDeviation(doubled)).toBeCloseTo(standardDeviation(TRAJETS_A) * 2, 10);
  });
});

describe('ateliers du module 6', () => {
  it('même médiane, dispersions opposées — ce que la comparaison doit révéler', () => {
    expect(median(ATELIER_X)).toBe(median(ATELIER_Y));
    expect(standardDeviation(ATELIER_Y)).toBeGreaterThan(standardDeviation(ATELIER_X) * 2);
    expect(range(ATELIER_Y)).toBeGreaterThan(range(ATELIER_X));
  });

  it('valeurs citées par le module', () => {
    expect(median(ATELIER_X)).toBe(16.5);
    expect(interquartileRange(ATELIER_X)).toBe(4);   // Q3 = 19 (rang 8), Q1 = 15 (rang 3)
    expect(interquartileRange(ATELIER_Y)).toBe(19);  // Q3 = 28, Q1 = 9
    expect(range(ATELIER_X)).toBe(9);
    expect(range(ATELIER_Y)).toBe(36);
  });
});
