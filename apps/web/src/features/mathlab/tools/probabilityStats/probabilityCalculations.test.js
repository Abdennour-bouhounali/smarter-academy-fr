import { describe, it, expect } from 'vitest';
import {
  EXPERIMENTS, RANDOM_MAX_SPAN, getExperiment, normalizeRange, theoreticalDistribution, theoreticalFraction,
} from './experiments.js';
import {
  comparisonRows, createSimulation, experimentalFrequencies, fromStoredSimulation,
  matchesExperiment, runBatch, toStoredSimulation,
} from './simulationEngine.js';
import { makeRng } from '../../../../lessons/common/stats/randomUtils.js';

/**
 * Les MATHÉMATIQUES du laboratoire : la loi théorique de chaque expérience,
 * et le fait qu'une simulation tire réellement dans cette loi. Rien n'est
 * comparé à une table recopiée — P(7) = 6/36 est recompté sur les 36 couples.
 */

describe('pièce de monnaie', () => {
  it('a deux issues équiprobables : P(face) = P(pile) = 1/2', () => {
    const distribution = theoreticalDistribution('coin');
    expect(distribution).toHaveLength(2);
    expect(distribution.map((d) => d.key)).toEqual(['tails', 'heads']);
    for (const outcome of distribution) expect(outcome.probability).toBe(0.5);
  });

  it('ne produit que des issues de son univers', () => {
    const rng = makeRng(7);
    for (let i = 0; i < 500; i += 1) expect([0, 1]).toContain(EXPERIMENTS.coin.draw(rng));
  });

  it('donne une fréquence expérimentale proche de 1/2 sur dix mille lancers', () => {
    let simulation = createSimulation('coin');
    simulation = runBatch(simulation, 10000);
    expect(simulation.total).toBe(10000);
    expect(simulation.counts[0] + simulation.counts[1]).toBe(10000);
    const [tails, heads] = experimentalFrequencies(simulation);
    expect(heads).toBeGreaterThan(0.45);
    expect(heads).toBeLessThan(0.55);
    expect(tails + heads).toBeCloseTo(1, 12);
  });
});

describe('dé à six faces', () => {
  it('a six faces, chacune de probabilité 1/6', () => {
    const distribution = theoreticalDistribution('die');
    expect(distribution).toHaveLength(6);
    expect(distribution.map((d) => d.value)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const outcome of distribution) expect(outcome.probability).toBeCloseTo(1 / 6, 12);
    expect(distribution.reduce((s, d) => s + d.probability, 0)).toBeCloseTo(1, 12);
  });

  it('s’écrit en fraction 1/6, comme dans un manuel', () => {
    expect(theoreticalFraction('die', 0)).toEqual({ numerator: 1, denominator: 6 });
  });

  it('ne produit que les faces 1 à 6 et les visite toutes', () => {
    let simulation = createSimulation('die');
    simulation = runBatch(simulation, 6000);
    expect(simulation.counts).toHaveLength(6);
    expect(simulation.counts.reduce((a, b) => a + b, 0)).toBe(6000);
    for (const count of simulation.counts) {
      expect(count).toBeGreaterThan(800);
      expect(count).toBeLessThan(1200);
    }
  });
});

describe('deux dés — la somme', () => {
  const distribution = theoreticalDistribution('twoDice');

  it('a onze sommes possibles, de 2 à 12', () => {
    expect(distribution).toHaveLength(11);
    expect(distribution.map((d) => d.value)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('a une loi de somme 1', () => {
    expect(distribution.reduce((s, d) => s + d.probability, 0)).toBeCloseTo(1, 12);
  });

  it('donne P(7) = 6/36 et P(2) = P(12) = 1/36 — la somme 7 est six fois plus probable que la somme 2', () => {
    const p = (value) => distribution.find((d) => d.value === value).probability;
    expect(p(7)).toBeCloseTo(6 / 36, 12);
    expect(p(2)).toBeCloseTo(1 / 36, 12);
    expect(p(12)).toBeCloseTo(1 / 36, 12);
    expect(p(7) / p(2)).toBeCloseTo(6, 12);
  });

  it('est symétrique autour de 7', () => {
    for (let s = 2; s <= 7; s += 1) {
      const low = distribution.find((d) => d.value === s).probability;
      const high = distribution.find((d) => d.value === 14 - s).probability;
      expect(low).toBeCloseTo(high, 12);
    }
  });

  it('s’écrit en fraction sur 36 : la somme 7 est 6/36', () => {
    expect(theoreticalFraction('twoDice', 5)).toEqual({ numerator: 6, denominator: 36 });
    expect(theoreticalFraction('twoDice', 0)).toEqual({ numerator: 1, denominator: 36 });
  });

  it('ne produit que des sommes de 2 à 12, et la somme 7 domine à l’expérience', () => {
    let simulation = createSimulation('twoDice');
    simulation = runBatch(simulation, 36000);
    expect(simulation.counts).toHaveLength(11);
    expect(simulation.counts.reduce((a, b) => a + b, 0)).toBe(36000);
    const frequencies = experimentalFrequencies(simulation);
    expect(frequencies[5]).toBeGreaterThan(frequencies[0]);
    expect(frequencies[5]).toBeCloseTo(6 / 36, 1);
  });
});

describe('générateur d’entiers', () => {
  it('a une loi uniforme sur l’intervalle demandé', () => {
    const distribution = theoreticalDistribution('random', { min: 1, max: 20 });
    expect(distribution).toHaveLength(20);
    expect(distribution[0].value).toBe(1);
    expect(distribution[19].value).toBe(20);
    for (const outcome of distribution) expect(outcome.probability).toBeCloseTo(1 / 20, 12);
  });

  it('ne tire que dans [min ; max], bornes comprises', () => {
    const params = { min: -3, max: 4 };
    let simulation = createSimulation('random', params);
    simulation = runBatch(simulation, 4000, params);
    expect(simulation.counts).toHaveLength(8);
    for (const count of simulation.counts) expect(count).toBeGreaterThan(0);
  });

  it('redresse des bornes incohérentes plutôt que de les refuser', () => {
    expect(normalizeRange({ min: 20, max: 1 })).toEqual({ min: 1, max: 20 });
    expect(normalizeRange({ min: 2.7, max: 8.2 })).toEqual({ min: 3, max: 8 });
    expect(normalizeRange({ min: 'x', max: null })).toEqual({ min: 1, max: 20 });
  });

  it('borne l’étendue pour que l’histogramme reste lisible', () => {
    const { min, max } = normalizeRange({ min: 0, max: 5000 });
    expect(max - min + 1).toBe(RANDOM_MAX_SPAN);
  });
});

describe('le moteur de simulation', () => {
  it('n’accumule que des effectifs : cent mille tirages tiennent en six nombres', () => {
    let simulation = createSimulation('die');
    simulation = runBatch(simulation, 100000);
    expect(simulation.counts).toHaveLength(6);
    expect(simulation.total).toBe(100000);
    expect(JSON.stringify(simulation.counts).length).toBeLessThan(60);
  });

  it('est reproductible à graine égale, et différente d’une graine à l’autre', () => {
    const a = runBatch(createSimulation('die', {}, 12345), 1000);
    const b = runBatch(createSimulation('die', {}, 12345), 1000);
    const c = runBatch(createSimulation('die', {}, 54321), 1000);
    expect(a.counts).toEqual(b.counts);
    expect(c.counts).not.toEqual(a.counts);
  });

  it('enchaîne les lots comme une seule série : 2 × 500 = 1 × 1000', () => {
    const inOne = runBatch(createSimulation('die', {}, 99), 1000);
    const inTwo = runBatch(runBatch(createSimulation('die', {}, 99), 500), 500);
    expect(inTwo.total).toBe(1000);
    expect(inTwo.counts).toEqual(inOne.counts);
  });

  it('relève une trajectoire bornée, qui finit sur l’état courant', () => {
    const simulation = runBatch(createSimulation('coin', {}, 5), 10000, {}, 10000);
    expect(simulation.trajectory.length).toBeGreaterThan(5);
    expect(simulation.trajectory.length).toBeLessThanOrEqual(60);
    const last = simulation.trajectory[simulation.trajectory.length - 1];
    expect(last.n).toBe(10000);
    expect(last.frequency).toBeCloseTo(simulation.counts[1] / 10000, 12);
  });

  it('montre la fréquence se rapprocher de 1/2 quand n grandit (loi des grands nombres)', () => {
    // On compare l'écart à 0,5 sur dix graines : à 10 lancers il est grand,
    // à 10 000 il est petit. C'est une propriété de la loi, pas d'un tirage.
    const gap = (n) => {
      const errors = [];
      for (let seed = 1; seed <= 10; seed += 1) {
        const simulation = runBatch(createSimulation('coin', {}, seed * 7919), n);
        errors.push(Math.abs(simulation.counts[1] / n - 0.5));
      }

      return errors.reduce((a, b) => a + b, 0) / errors.length;
    };
    expect(gap(10000)).toBeLessThan(gap(10));
    expect(gap(10000)).toBeLessThan(0.02);
  });

  it('rend des fréquences nulles, jamais NaN, sur une simulation vide', () => {
    const simulation = createSimulation('die');
    expect(experimentalFrequencies(simulation)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(runBatch(simulation, 0)).toBe(simulation);
  });

  it('assemble le tableau de comparaison : effectif, fréquence, probabilité', () => {
    const simulation = runBatch(createSimulation('die', {}, 3), 600);
    const rows = comparisonRows(simulation);
    expect(rows).toHaveLength(6);
    expect(rows.reduce((s, r) => s + r.count, 0)).toBe(600);
    expect(rows.reduce((s, r) => s + r.frequency, 0)).toBeCloseTo(1, 12);
    for (const row of rows) expect(row.probability).toBeCloseTo(1 / 6, 12);
  });

  it('rapporte le DERNIER tirage avec ses composantes — ce que l’objet animé doit montrer', () => {
    // Un dé : la composante est la face, et l'effectif de cette face a bien monté.
    for (let seed = 1; seed <= 30; seed += 1) {
      const before = createSimulation('die', {}, seed);
      const after = runBatch(before, 1);
      expect(after.last.parts).toHaveLength(1);
      expect(after.last.parts[0]).toBe(after.last.index + 1);
      expect(after.counts[after.last.index]).toBe(before.counts[after.last.index] + 1);
    }
    // Deux dés : deux faces dont la somme est l'issue comptée.
    for (let seed = 1; seed <= 30; seed += 1) {
      const after = runBatch(createSimulation('twoDice', {}, seed), 1);
      const [a, b] = after.last.parts;
      expect(a).toBeGreaterThanOrEqual(1); expect(a).toBeLessThanOrEqual(6);
      expect(b).toBeGreaterThanOrEqual(1); expect(b).toBeLessThanOrEqual(6);
      expect(a + b - 2).toBe(after.last.index);
      expect(after.counts[after.last.index]).toBe(1);
    }
    // La pièce : 0 = ظهر, 1 = وجه ; le générateur : le nombre lui-même.
    const coin = runBatch(createSimulation('coin', {}, 3), 1);
    expect([0, 1]).toContain(coin.last.parts[0]);
    const params = { min: 10, max: 12 };
    const random = runBatch(createSimulation('random', params, 3), 1, params);
    expect(random.last.parts[0]).toBe(10 + random.last.index);
  });

  it('le tirage détaillé consomme les mêmes nombres que le tirage simple : la série ne change pas', () => {
    // Les effectifs d'un lot en une fois et d'un lot tirage par tirage sont identiques.
    const whole = runBatch(createSimulation('twoDice', {}, 77), 300);
    let stepwise = createSimulation('twoDice', {}, 77);
    for (let i = 0; i < 300; i += 1) stepwise = runBatch(stepwise, 1);
    expect(stepwise.counts).toEqual(whole.counts);
    expect(stepwise.last).toEqual(whole.last);
  });

  it('enregistre et relit le dernier tirage, et écarte un tirage incohérent', () => {
    const simulation = runBatch(createSimulation('twoDice', {}, 5), 20);
    const stored = toStoredSimulation(simulation);
    expect(stored.last).toEqual(simulation.last);
    expect(fromStoredSimulation(stored, 'twoDice').last).toEqual(simulation.last);
    expect(fromStoredSimulation({ ...stored, last: { index: 99, parts: [1, 1] } }, 'twoDice').last).toBeNull();
    expect(fromStoredSimulation({ ...stored, last: { index: 3, parts: ['a'] } }, 'twoDice').last).toBeNull();
    expect(fromStoredSimulation({ ...stored, last: null }, 'twoDice').last).toBeNull();
  });

  it('reconnaît qu’une simulation ne va plus avec son expérience', () => {
    const simulation = runBatch(createSimulation('die'), 10);
    expect(matchesExperiment(simulation, 'die')).toBe(true);
    expect(matchesExperiment(simulation, 'coin')).toBe(false);
    expect(matchesExperiment(null, 'die')).toBe(false);
  });
});

describe('une simulation enregistrée puis relue', () => {
  it('fait l’aller-retour sans rien perdre', () => {
    const simulation = runBatch(createSimulation('twoDice', {}, 4242), 500);
    const stored = toStoredSimulation(simulation);
    const restored = fromStoredSimulation(stored, 'twoDice');
    expect(restored.total).toBe(500);
    expect(restored.counts).toEqual(simulation.counts);
    expect(restored.seed).toBe(4242);
  });

  it('n’enregistre rien tant que rien n’est tiré', () => {
    expect(toStoredSimulation(createSimulation('coin'))).toBeNull();
    expect(toStoredSimulation(null)).toBeNull();
  });

  it('écarte ce qui ne tient pas debout plutôt que d’afficher un graphique faux', () => {
    const valid = toStoredSimulation(runBatch(createSimulation('die', {}, 1), 60));
    expect(fromStoredSimulation({ ...valid, total: 61 }, 'die')).toBeNull();
    expect(fromStoredSimulation({ ...valid, counts: [10, 10] }, 'die')).toBeNull();
    expect(fromStoredSimulation({ ...valid, counts: [10, 10, 10, 10, 10, -10] }, 'die')).toBeNull();
    expect(fromStoredSimulation(valid, 'coin')).toBeNull();
    expect(fromStoredSimulation(null, 'die')).toBeNull();
    expect(fromStoredSimulation({ nonsense: true }, 'die')).toBeNull();
  });

  it('accepte une simulation du générateur seulement pour le même intervalle', () => {
    const params = { min: 1, max: 6 };
    const stored = toStoredSimulation(runBatch(createSimulation('random', params, 8), 60, params));
    expect(fromStoredSimulation(stored, 'random', params)).not.toBeNull();
    expect(fromStoredSimulation(stored, 'random', { min: 1, max: 20 })).toBeNull();
  });
});

describe('le catalogue des expériences', () => {
  it('donne à chacune une loi de somme 1 sur un univers non vide', () => {
    const params = { min: 1, max: 20 };
    for (const id of Object.keys(EXPERIMENTS)) {
      const outcomes = getExperiment(id).outcomes(params);
      const probabilities = getExperiment(id).probabilities(params);
      expect(outcomes.length).toBeGreaterThan(0);
      expect(probabilities).toHaveLength(outcomes.length);
      expect(probabilities.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
      for (const p of probabilities) expect(p).toBeGreaterThan(0);
    }
  });

  it('retombe sur la pièce devant un identifiant inconnu', () => {
    expect(getExperiment('inconnu').id).toBe('coin');
  });
});
