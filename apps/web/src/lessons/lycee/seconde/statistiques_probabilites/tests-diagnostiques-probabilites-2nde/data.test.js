import { describe, it, expect } from 'vitest';
import { POPULATION, REFERENCE, counts, scenario, populationGroups, AFFIRMATIONS, SLIDERS } from './data';

/**
 * Ces tests verrouillent le scénario de référence ET les propriétés qui
 * font la démonstration : sans le paradoxe (VPP très inférieure à la
 * sensibilité) et sans l'effet de la prévalence, la leçon ne prouverait rien.
 */

describe('scénario de référence', () => {
  it('donne exactement les effectifs cités dans les modules', () => {
    expect(counts()).toEqual({
      truePositive: 99, falseNegative: 1, falsePositive: 495, trueNegative: 9405,
    });
  });

  it('conserve la population totale', () => {
    const c = counts();
    expect(c.truePositive + c.falseNegative + c.falsePositive + c.trueNegative).toBe(POPULATION);
  });

  it('retrouve la sensibilité et la spécificité annoncées', () => {
    const s = scenario();
    expect(s.sensitivity).toBeCloseTo(0.99, 4);
    expect(s.specificity).toBeCloseTo(0.95, 4);
  });

  it('donne une VPP d’environ 16,7 % — le cœur de la leçon', () => {
    const s = scenario();
    expect(s.positive).toBe(594);
    expect(s.ppv).toBeCloseTo(99 / 594, 10);
    expect(s.ppv * 100).toBeGreaterThan(16.5);
    expect(s.ppv * 100).toBeLessThan(17);
  });

  it('rend le PARADOXE net : la VPP est très inférieure à la sensibilité', () => {
    const s = scenario();
    expect(s.sensitivity - s.ppv).toBeGreaterThan(0.7);
  });

  it('produit plus de faux positifs que de vrais positifs', () => {
    const c = counts();
    expect(c.falsePositive).toBeGreaterThan(c.truePositive * 3);
  });

  it('donne un test NÉGATIF très fiable (affirmation 3)', () => {
    const s = scenario();
    expect(s.npv).toBeGreaterThan(0.999);
  });
});

describe('effet de la prévalence (module 4)', () => {
  const ppvAt = (prevalence) => scenario({ ...REFERENCE, prevalence }).ppv;

  it('fait passer la VPP de quelques pour cent à plus de 90 %', () => {
    expect(ppvAt(0.001)).toBeLessThan(0.05);
    expect(ppvAt(0.4)).toBeGreaterThan(0.9);
  });

  it('est strictement croissante avec la prévalence', () => {
    const values = [0.001, 0.01, 0.05, 0.1, 0.2, 0.4].map(ppvAt);
    for (let i = 1; i < values.length; i += 1) expect(values[i]).toBeGreaterThan(values[i - 1]);
  });

  it('vérifie la valeur citée pour le groupe à risque (affirmation 4)', () => {
    expect(ppvAt(0.4)).toBeCloseTo(3960 / 4260, 6);
    expect(ppvAt(0.4) * 100).toBeGreaterThan(92.5);
    expect(ppvAt(0.4) * 100).toBeLessThan(93.5);
  });

  it('couvre ces prévalences dans les bornes des curseurs', () => {
    expect(SLIDERS.prevalence.min).toBeLessThanOrEqual(0.001);
    expect(SLIDERS.prevalence.max).toBeGreaterThanOrEqual(0.4);
  });
});

describe('groupes pour la grille', () => {
  it('décrit toute la population, sans doublon ni perte', () => {
    const g = populationGroups();
    expect(g.reduce((a, x) => a + x.count, 0)).toBe(POPULATION);
    expect(new Set(g.map((x) => x.id)).size).toBe(4);
  });
});

describe('affirmations du module 5', () => {
  it('en compte quatre, dont au moins une VRAIE', () => {
    expect(AFFIRMATIONS).toHaveLength(4);
    // Un atelier entièrement faux n'apprendrait qu'à répondre « faux ».
    expect(AFFIRMATIONS.filter((a) => a.correct).length).toBeGreaterThanOrEqual(1);
  });

  it('rattache chaque affirmation à un learning point de la leçon', () => {
    for (const a of AFFIRMATIONS) {
      expect(a.lp).toMatch(/^seconde_tests-diagnostiques-probabilites-2nde_P\d+$/);
      expect(a.explain.length).toBeGreaterThan(40);
    }
  });
});
