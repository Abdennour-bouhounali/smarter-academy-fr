import { describe, it, expect } from 'vitest';
import { makeRng } from '@smarter-academy/core';
import {
  ZERO, FACES, MAX_TOTAL, CHART, fairWeights, loadedWeights, probabilities, rollOnce, rollMany,
  totalOf, frequencies, pct, formatPct, leaders, laggards, spreadPoints, faceList,
  scaleMax, barGeometry, textWidth,
} from './diceUtils';

describe('le dé comme vecteur de poids', () => {
  it('un dé équilibré donne 1/6 à chaque face, somme exacte 1', () => {
    const p = probabilities(fairWeights());
    expect(p).toHaveLength(6);
    p.forEach((x) => expect(x).toBe(1 / 6));
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
  });

  it('alourdir la face 6 lui donne 3/8 et 1/8 aux autres', () => {
    const p = probabilities(loadedWeights(6));
    expect(p[5]).toBe(3 / 8);
    expect(p[0]).toBe(1 / 8);
    expect(loadedWeights(null)).toEqual(fairWeights());
  });

  it('rollOnce ne sort que des faces de 1 à 6', () => {
    const rng = makeRng(7);
    for (let i = 0; i < 500; i += 1) {
      const f = rollOnce(rng);
      expect(f).toBeGreaterThanOrEqual(1);
      expect(f).toBeLessThanOrEqual(6);
    }
  });
});

describe('une série de lancers est une série statistique', () => {
  it('rollMany ajoute exactement n lancers sans toucher à l’entrée', () => {
    const r = rollMany(ZERO, 25, makeRng(3));
    expect(totalOf(r.counts)).toBe(25);
    expect(ZERO).toEqual([0, 0, 0, 0, 0, 0]);
    expect(FACES).toContain(r.last);
    expect(r.counts[r.last - 1]).toBeGreaterThan(0);
  });

  it('la même graine rejoue la même série', () => {
    const a = rollMany(ZERO, 100, makeRng(2026));
    const b = rollMany(ZERO, 100, makeRng(2026));
    expect(a).toEqual(b);
  });

  it('les fréquences sont exactes et somment à 1 ; nulles sans lancer', () => {
    const { counts } = rollMany(ZERO, 60, makeRng(11));
    const f = frequencies(counts);
    expect(f.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(f[0]).toBe(counts[0] / 60);
    expect(frequencies(ZERO)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('sur beaucoup de lancers, un dé équilibré serre 1/6 ; un dé truqué non', () => {
    const fair = frequencies(rollMany(ZERO, 12000, makeRng(5)).counts);
    fair.forEach((x) => expect(Math.abs(x - 1 / 6)).toBeLessThan(0.02));
    const loaded = frequencies(rollMany(ZERO, 12000, makeRng(5), loadedWeights(2)).counts);
    expect(Math.abs(loaded[1] - 3 / 8)).toBeLessThan(0.025);
    expect(Math.abs(loaded[0] - 1 / 8)).toBeLessThan(0.02);
  });

  it('les fréquences se stabilisent : l’écart entre faces diminue avec le nombre de lancers', () => {
    // Propriété en moyenne : on la vérifie sur dix graines, pas sur une seule.
    let smaller = 0;
    for (let s = 1; s <= 10; s += 1) {
      const rng = makeRng(100 + s);
      const few = spreadPoints(rollMany(ZERO, 10, rng).counts);
      const many = spreadPoints(rollMany(ZERO, 1000, rng).counts);
      if (many < few) smaller += 1;
    }
    expect(smaller).toBe(10);
  });
});

describe('lectures dérivées', () => {
  it('pct et formatPct n’arrondissent que l’affichage', () => {
    expect(pct(18 / 100)).toBe(18);
    expect(formatPct(18 / 100, 100)).toBe('18,0 %');
    expect(formatPct(1 / 6, 1000)).toBe('16,7 %');
    expect(formatPct(0, 0)).toBe('—');
  });

  it('leaders et laggards rendent TOUTES les faces à égalité', () => {
    expect(leaders([3, 5, 5, 1, 0, 2])).toEqual([2, 3]);
    expect(laggards([3, 5, 5, 1, 0, 2])).toEqual([5]);
    expect(laggards([3, 5, 5, 0, 0, 2])).toEqual([4, 5]);
    expect(leaders(ZERO)).toEqual([]);
  });

  it('spreadPoints est l’écart max − min en points ; null sans lancer', () => {
    expect(spreadPoints([4, 0, 1, 3, 0, 2])).toBe(40);
    expect(spreadPoints(ZERO)).toBeNull();
  });

  it('faceList écrit une liste lisible', () => {
    expect(faceList([3])).toBe('3');
    expect(faceList([3, 5])).toBe('3 et 5');
    expect(faceList([2, 3, 5])).toBe('2, 3 et 5');
  });
});

describe('sécurité d’affichage — chaque état valide a une mise en page valide', () => {
  const EXTREMES = [
    [...ZERO],
    [1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1],
    [4, 0, 1, 3, 0, 2],
    [17, 16, 17, 16, 17, 17],
    [MAX_TOTAL, 0, 0, 0, 0, 0],
    [16666, 16667, 16666, 16667, 16666, 16667],
    [37000, 12500, 12500, 12500, 12500, 13000],
  ];
  const THEORIES = [null, probabilities(fairWeights()), probabilities(loadedWeights(1)), probabilities(loadedWeights(6))];

  it('aucune barre, étiquette ou repère ne sort du cadre', () => {
    for (const counts of EXTREMES) for (const theory of THEORIES) {
      const { bars, scaleMax: sm } = barGeometry(counts, theory);
      expect(sm).toBeGreaterThanOrEqual(1);
      for (const b of bars) {
        expect(b.h).toBeGreaterThanOrEqual(0);
        expect(b.y).toBeGreaterThanOrEqual(CHART.TOP - 1e-9);
        expect(b.y + b.h).toBeLessThanOrEqual(CHART.BASE + 1e-9);
        // L'étiquette (12 px de haut) reste sous le bord supérieur.
        expect(b.labelY - 12).toBeGreaterThanOrEqual(0);
        expect(textWidth(b.label, 12)).toBeLessThan(CHART.COL - 8);
        if (b.tick !== null) {
          expect(b.tick).toBeGreaterThanOrEqual(CHART.TOP - 1e-9);
          expect(b.tick).toBeLessThanOrEqual(CHART.BASE + 1e-9);
        }
        expect(Number.isNaN(b.y) || Number.isNaN(b.h)).toBe(false);
      }
    }
  });

  it('l’échelle contient toujours la barre la plus haute et le repère le plus haut', () => {
    const counts = [10, 10, 10, 10, 10, 350];
    expect(scaleMax(counts)).toBe(350);
    expect(scaleMax([100, 100, 100, 100, 100, 100], probabilities(loadedWeights(1)))).toBe(225);
    expect(scaleMax(ZERO)).toBe(1);
  });
});
