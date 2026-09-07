import { describe, it, expect } from 'vitest';
import { makeRng, randomInt, bernoulli, drawFrom, runBernoulliTrials, rollDice, frequencyTrajectory } from './randomUtils';

describe('générateur reproductible', () => {
  it('même graine, même suite', () => {
    const a = makeRng(42); const b = makeRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('graines différentes, suites différentes', () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });

  it('valeurs dans [0 ; 1[', () => {
    const rng = makeRng(7);
    for (let i = 0; i < 500; i += 1) {
      const u = rng();
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });

  it('randomInt reste dans les bornes, incluses', () => {
    const rng = makeRng(3);
    const seen = new Set();
    for (let i = 0; i < 2000; i += 1) seen.add(randomInt(rng, 1, 6));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('bernoulli : p = 0 jamais, p = 1 toujours', () => {
    const rng = makeRng(11);
    for (let i = 0; i < 100; i += 1) {
      expect(bernoulli(rng, 0)).toBe(false);
      expect(bernoulli(rng, 1)).toBe(true);
    }
  });
});

describe('simulation', () => {
  it('drawFrom respecte les probabilités demandées (loi à trois valeurs)', () => {
    const rng = makeRng(5);
    const weights = [{ value: 'a', p: 0.5 }, { value: 'b', p: 0.3 }, { value: 'c', p: 0.2 }];
    const counts = { a: 0, b: 0, c: 0 };
    const N = 20000;
    for (let i = 0; i < N; i += 1) counts[drawFrom(rng, weights)] += 1;
    expect(counts.a / N).toBeCloseTo(0.5, 1);
    expect(counts.b / N).toBeCloseTo(0.3, 1);
    expect(counts.c / N).toBeCloseTo(0.2, 1);
  });

  it('la fréquence observée s’approche de p quand n grandit — la loi des grands nombres', () => {
    const p = 0.35;
    // Sur UNE série, un petit échantillon peut tomber juste par chance : c'est
    // la fluctuation elle-même. La loi des grands nombres porte sur l'écart
    // MOYEN, que l'on mesure donc sur plusieurs graines.
    const meanGap = (n) => {
      const seeds = [101, 202, 303, 404, 505, 606, 707, 808];
      return seeds.reduce((acc, s) => acc + Math.abs(runBernoulliTrials(makeRng(s), n, p) / n - p), 0) / seeds.length;
    };
    const small = meanGap(20);
    const large = meanGap(50000);
    expect(large).toBeLessThan(0.01);
    expect(large).toBeLessThan(small);
  });

  it('rollDice : les effectifs somment à n, et six faces sortent', () => {
    const counts = rollDice(makeRng(9), 6000);
    expect(counts).toHaveLength(6);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(6000);
    for (const c of counts) expect(c).toBeGreaterThan(800);
  });

  it('la trajectoire est croissante en n, finit à n, et ses fréquences sont dans [0 ; 1]', () => {
    const pts = frequencyTrajectory(makeRng(13), 5000, 0.5);
    expect(pts.length).toBeGreaterThan(5);
    expect(pts[pts.length - 1].n).toBe(5000);
    for (let i = 1; i < pts.length; i += 1) expect(pts[i].n).toBeGreaterThan(pts[i - 1].n);
    for (const pt of pts) {
      expect(pt.frequency).toBeGreaterThanOrEqual(0);
      expect(pt.frequency).toBeLessThanOrEqual(1);
    }
  });

  it('la trajectoire finit plus près de p qu’elle ne commence (stabilisation)', () => {
    const p = 0.5;
    const pts = frequencyTrajectory(makeRng(77), 20000, p);
    const start = Math.abs(pts[0].frequency - p);
    const end = Math.abs(pts[pts.length - 1].frequency - p);
    expect(end).toBeLessThanOrEqual(start);
    expect(end).toBeLessThan(0.02);
  });
});
