import { describe, it, expect } from 'vitest';
import {
  empiricalRule, normalIssues, normalPdf, normalQuery, sampleCurve, shadedInterval, sigmaTicks,
  standardCdf, zScore,
} from './normalDistribution.js';
import { NORMAL_PRESETS, getNormalPreset, matchingNormalPreset } from './normalPresets.js';

/** La loi normale : Φ exacte à 1e−7 près, les requêtes, l'échelle Z. */

describe('Φ, la fonction de répartition de N(0, 1)', () => {
  it('rend les valeurs de référence à 1e−7 près', () => {
    const reference = [
      [0, 0.5],
      [1, 0.8413447461],
      [1.96, 0.9750021049],
      [-2.33, 0.0099030755],
      [3, 0.9986501020],
      [-1, 0.1586552539],
      [2.5, 0.9937903347],
      [0.5, 0.6914624613],
      [-3.5, 0.0002326291],
      [6, 0.9999999990],
      [8, 1 - 6.22096057e-16],
    ];
    for (const [z, expected] of reference) {
      expect(Math.abs(standardCdf(z) - expected), `Φ(${z})`).toBeLessThan(1e-7);
    }
  });

  it('est symétrique : Φ(−z) = 1 − Φ(z)', () => {
    for (const z of [0.1, 0.7, 1.3, 2, 2.9, 4.2, 6.5, 7.5, 10]) {
      expect(standardCdf(-z) + standardCdf(z)).toBeCloseTo(1, 12);
    }
  });

  it('est croissante et reste dans [0 ; 1]', () => {
    let previous = -1;
    for (let z = -12; z <= 12; z += 0.05) {
      const value = standardCdf(z);
      expect(value).toBeGreaterThanOrEqual(previous);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      previous = value;
    }
  });

  it('reste finie aux extrêmes (±40, ±∞)', () => {
    expect(standardCdf(40)).toBe(1);
    expect(standardCdf(-40)).toBe(0);
    expect(standardCdf(Infinity)).toBe(1);
    expect(standardCdf(-Infinity)).toBe(0);
    expect(Number.isFinite(standardCdf(7.0001))).toBe(true);
    // Le raccord entre la série et la fraction continue ne saute pas.
    expect(Math.abs(standardCdf(7) - standardCdf(7.000001))).toBeLessThan(1e-12);
    expect(Math.abs(standardCdf(-7) - standardCdf(-7.000001))).toBeLessThan(1e-12);
  });

  it('retrouve la règle 68–95–99,7 par le calcul', () => {
    const [one, two, three] = empiricalRule();
    expect(one.probability).toBeCloseTo(0.6826894921, 8);
    expect(two.probability).toBeCloseTo(0.9544997361, 8);
    expect(three.probability).toBeCloseTo(0.9973002039, 8);
  });
});

describe('densité et score z', () => {
  it('calcule z = (x − μ)/σ et refuse σ ≤ 0', () => {
    expect(zScore(130, 100, 15)).toBe(2);
    expect(zScore(1, 0, 0)).toBeNull();
    expect(zScore(1, 0, -2)).toBeNull();
    expect(zScore(NaN, 0, 1)).toBeNull();
  });

  it('a son maximum en μ, égal à 1/(σ√(2π))', () => {
    expect(normalPdf(170, 170, 8)).toBeCloseTo(1 / (8 * Math.sqrt(2 * Math.PI)), 12);
    expect(normalPdf(170, 170, 0)).toBeNull();
  });
});

describe('les requêtes', () => {
  it('P(X ≤ x) = Φ(z)', () => {
    const r = normalQuery({ mu: 100, sigma: 15, x: 130, a: 0, b: 0, query: 'le' });
    expect(r.ok).toBe(true);
    expect(r.z).toBe(2);
    expect(r.probability).toBeCloseTo(0.9772498681, 9);
  });

  it('P(X ≥ x) = 1 − Φ(z)', () => {
    const r = normalQuery({ mu: 100, sigma: 15, x: 130, a: 0, b: 0, query: 'ge' });
    expect(r.probability).toBeCloseTo(0.0227501319, 9);
  });

  it('P(a ≤ X ≤ b) = Φ(z_b) − Φ(z_a)', () => {
    const r = normalQuery({ mu: 170, sigma: 8, x: 0, a: 162, b: 178, query: 'between' });
    expect(r.za).toBe(-1);
    expect(r.zb).toBe(1);
    expect(r.probability).toBeCloseTo(0.6826894921, 9);
    const point = normalQuery({ mu: 0, sigma: 1, x: 0, a: 1, b: 1, query: 'between' });
    expect(point.probability).toBe(0);
  });

  it('donne le même résultat en échelle X qu’après standardisation (échelle Z)', () => {
    const x = normalQuery({ mu: 11, sigma: 3, x: 15, a: 0, b: 0, query: 'ge' });
    const z = normalQuery({ mu: 0, sigma: 1, x: 4 / 3, a: 0, b: 0, query: 'ge' });
    expect(x.probability).toBeCloseTo(z.probability, 14);
  });

  it('refuse σ ≤ 0, a > b et les valeurs non finies — par des CODES, jamais NaN', () => {
    expect(normalQuery({ mu: 0, sigma: 0, x: 1, a: 0, b: 1, query: 'le' })).toEqual({ ok: false, issues: ['sigma'] });
    expect(normalQuery({ mu: 0, sigma: -3, x: 1, a: 0, b: 1, query: 'le' }).issues).toContain('sigma');
    expect(normalQuery({ mu: 0, sigma: 1, x: 1, a: 2, b: 1, query: 'between' }).issues).toEqual(['order']);
    expect(normalQuery({ mu: 0, sigma: 1, x: NaN, a: 0, b: 1, query: 'le' }).issues).toEqual(['finite']);
    expect(normalIssues({ mu: 1e9, sigma: 1, x: 0, a: 0, b: 0, query: 'le' })).toEqual(['finite']);
    // a > b n'est pas un problème quand la requête ne l'utilise pas.
    expect(normalQuery({ mu: 0, sigma: 1, x: 1, a: 2, b: 1, query: 'le' }).ok).toBe(true);
  });
});

describe('le dessin', () => {
  it('échantillonne la courbe une fois, sur μ ± 4σ ou sur [−4 ; 4] en échelle Z', () => {
    const x = sampleCurve(170, 8, 'x', 160);
    expect(x.points).toHaveLength(161);
    expect(x.from).toBe(138);
    expect(x.to).toBe(202);
    expect(x.peak).toBeCloseTo(normalPdf(170, 170, 8), 12);
    const z = sampleCurve(170, 8, 'z', 80);
    expect(z.from).toBe(-4);
    expect(z.to).toBe(4);
    expect(z.peak).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12);
    expect(sampleCurve(0, 0).points).toEqual([]);
  });

  it('place la région ombrée et les repères μ + kσ dans l’échelle dessinée', () => {
    const params = { mu: 100, sigma: 15, x: 130, a: 85, b: 115, query: 'ge' };
    expect(shadedInterval(params, normalQuery(params), 'x')).toEqual({ lo: 130, hi: Infinity });
    expect(shadedInterval(params, normalQuery(params), 'z')).toEqual({ lo: 2, hi: Infinity });
    const between = { ...params, query: 'between' };
    expect(shadedInterval(between, normalQuery(between), 'z')).toEqual({ lo: -1, hi: 1 });
    expect(sigmaTicks(100, 15, 'x').map((t) => t.t)).toEqual([55, 70, 85, 100, 115, 130, 145]);
    expect(sigmaTicks(100, 15, 'z').map((t) => t.t)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
    expect(shadedInterval(params, { ok: false }, 'x')).toBeNull();
  });
});

describe('les exemples', () => {
  it('sont tous calculables et reconnaissables', () => {
    for (const preset of NORMAL_PRESETS) {
      expect(normalQuery(preset.params).ok, preset.id).toBe(true);
      expect(matchingNormalPreset(preset.params)).toBe(preset.id);
    }
    expect(getNormalPreset('iq').params.mu).toBe(100);
    expect(matchingNormalPreset({ mu: 3, sigma: 2 })).toBeNull();
  });
});

describe('le calcul écrit et la région', () => {
  it('ferme la région ombrée sur ses bords exacts, coupée au cadre', async () => {
    const { regionPoints } = await import('./normalDistribution.js');
    const curve = sampleCurve(0, 1, 'z', 80);
    const region = regionPoints(curve, { lo: -Infinity, hi: 0.33 }, 0, 1, 'z');
    expect(region[0].t).toBe(-4);
    expect(region.at(-1).t).toBe(0.33);
    expect(region.at(-1).y).toBeCloseTo(normalPdf(0.33, 0, 1), 12);
    expect(regionPoints(curve, { lo: 5, hi: 6 }, 0, 1, 'z')).toEqual([]);
    expect(regionPoints(curve, null, 0, 1, 'z')).toEqual([]);
  });
});
