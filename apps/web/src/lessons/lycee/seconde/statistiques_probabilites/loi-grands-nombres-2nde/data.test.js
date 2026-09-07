import { describe, it, expect } from 'vitest';
import { makeRng, drawFrom, runBernoulliTrials, frequencyTrajectory } from '../../../../common/stats';
import { EXPERIMENTS, DICE_CANDIDATES, TRIAL_STEPS, experimentById } from './data';

/**
 * Ces tests protègent les AFFIRMATIONS PÉDAGOGIQUES de la leçon, pas
 * seulement la forme des données : chaque module promet à l'élève un
 * phénomène observable, et un phénomène qui ne se produirait pas ferait
 * mentir le cours.
 */

describe('expériences du laboratoire', () => {
  it('déclare une probabilité valide pour chaque événement suivi', () => {
    for (const e of EXPERIMENTS) {
      expect(e.p).toBeGreaterThan(0);
      expect(e.p).toBeLessThan(1);
      expect(e.outcomes.length).toBeGreaterThan(0);
    }
  });

  it('retrouve une expérience par son id, et retombe sur la première sinon', () => {
    expect(experimentById('de-six').p).toBeCloseTo(1 / 6, 10);
    expect(experimentById('inconnu')).toBe(EXPERIMENTS[0]);
  });

  it('propose des paliers strictement croissants d’un facteur 10', () => {
    expect(TRIAL_STEPS).toEqual([10, 100, 1000, 10000]);
  });
});

describe('dés du module 4', () => {
  it('propose exactement un dé pipé parmi trois', () => {
    expect(DICE_CANDIDATES).toHaveLength(3);
    expect(DICE_CANDIDATES.filter((d) => d.rigged)).toHaveLength(1);
  });

  it('donne des lois de probabilité qui somment à 1', () => {
    for (const d of DICE_CANDIDATES) {
      expect(d.weights).toHaveLength(6);
      expect(d.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    }
  });

  it('rend le dé pipé DÉTECTABLE en longue série et AMBIGU en série courte', () => {
    // C'est la promesse pédagogique du module 4 : ce n'est pas l'œil qui
    // tranche, c'est n. On mesure le taux de détection dans les deux cas.
    const rigged = DICE_CANDIDATES.find((d) => d.rigged);
    const fair = DICE_CANDIDATES.find((d) => !d.rigged);
    const freq6 = (rng, n, weights) => {
      const w = weights.map((p, i) => ({ value: i, p }));
      let c = 0;
      for (let i = 0; i < n; i += 1) if (drawFrom(rng, w) === 5) c += 1;
      return c / n;
    };
    const detectionRate = (n) => {
      let seed = 1; let hits = 0; const T = 120;
      for (let t = 0; t < T; t += 1) {
        const rng = makeRng(seed);
        seed = (seed * 1664525 + 1013904223) >>> 0;
        if (freq6(rng, n, rigged.weights) > freq6(rng, n, fair.weights)) hits += 1;
      }
      return hits / T;
    };
    expect(detectionRate(30)).toBeLessThan(0.85);      // série courte : peu concluante
    expect(detectionRate(3000)).toBeGreaterThan(0.95); // longue série : sans appel
  });
});

describe('phénomène central : la fréquence se resserre', () => {
  it('donne un écart moyen à p bien plus petit sur 10 000 lancers que sur 10', () => {
    const p = 1 / 6;
    const meanGap = (n) => {
      let seed = 7; let total = 0; const T = 60;
      for (let t = 0; t < T; t += 1) {
        const rng = makeRng(seed);
        seed = (seed * 1664525 + 1013904223) >>> 0;
        total += Math.abs(runBernoulliTrials(rng, n, p) / n - p);
      }
      return total / T;
    };
    expect(meanGap(10000)).toBeLessThan(meanGap(10) / 10);
  });

  it('produit une trajectoire qui finit près de p, en réutilisant les mêmes tirages', () => {
    const points = frequencyTrajectory(makeRng(2026), 10000, 0.5);
    expect(points.length).toBeGreaterThan(10);
    expect(points[points.length - 1].n).toBe(10000);
    expect(Math.abs(points[points.length - 1].frequency - 0.5)).toBeLessThan(0.03);
    // les n sont strictement croissants : c'est UNE série qu'on regarde
    for (let i = 1; i < points.length; i += 1) expect(points[i].n).toBeGreaterThan(points[i - 1].n);
  });

  it('donne deux séries DIFFÉRENTES pour deux graines différentes', () => {
    // Sans cela, « relancer » serait un bouton décoratif.
    const a = runBernoulliTrials(makeRng(1), 1000, 0.5);
    const b = runBernoulliTrials(makeRng(2), 1000, 0.5);
    expect(a).not.toBe(b);
  });

  it('rejoue la MÊME série à graine égale', () => {
    expect(runBernoulliTrials(makeRng(99), 500, 0.3)).toBe(runBernoulliTrials(makeRng(99), 500, 0.3));
  });
});
