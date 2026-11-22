import { describe, it, expect } from 'vitest';
import { sampleFunction, CLAMP_FACTOR } from './functionSampler.js';

const view = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const WIDTH = 600;

const allPoints = (segments) => segments.flat();

describe('échantillonnage — une courbe crédible', () => {
  it('une fonction continue donne UN morceau qui couvre toute la fenêtre', () => {
    const segments = sampleFunction((x) => x * x, view, WIDTH);
    expect(segments).toHaveLength(1);
    expect(segments[0][0][0]).toBe(-5);
    expect(segments[0].at(-1)[0]).toBe(5);
    expect(segments[0].length).toBeGreaterThan(500);
  });

  it('1/x est coupée en 0 : deux morceaux, aucun segment ne traverse l’axe des ordonnées', () => {
    const segments = sampleFunction((x) => 1 / x, view, WIDTH);
    expect(segments).toHaveLength(2);
    expect(segments[0].every(([x]) => x < 0)).toBe(true);
    expect(segments[1].every(([x]) => x > 0)).toBe(true);
  });

  it('1/x est coupée même quand un échantillon tombe exactement sur 0', () => {
    const segments = sampleFunction((x) => (x === 0 ? NaN : 1 / x), { xMin: -1, xMax: 1, yMin: -5, yMax: 5 }, 100);
    expect(segments).toHaveLength(2);
  });

  it('tan(x) est coupée à chaque asymptote', () => {
    const segments = sampleFunction(Math.tan, view, WIDTH);
    // Asymptotes en ±π/2, ±3π/2 sur [−5, 5] : 4 coupures → 5 morceaux.
    expect(segments).toHaveLength(5);
    for (const segment of segments) {
      for (let i = 1; i < segment.length; i += 1) {
        // Aucun segment ne saute d'un bord clampé à l'autre.
        expect(Math.sign(segment[i][1]) * Math.sign(segment[i - 1][1]) >= 0 || Math.abs(segment[i][1] - segment[i - 1][1]) < 10).toBe(true);
      }
    }
  });

  it('une droite très pentue reste continue (ce n’est pas une asymptote)', () => {
    const segments = sampleFunction((x) => 1000 * x, view, WIDTH);
    expect(segments).toHaveLength(1);
  });

  it('sqrt(x) commence exactement en (0, 0), pas un pixel plus loin', () => {
    const segments = sampleFunction(Math.sqrt, view, WIDTH);
    expect(segments).toHaveLength(1);
    const [x0, y0] = segments[0][0];
    expect(Math.abs(x0)).toBeLessThan(1e-3);
    expect(y0).toBeLessThan(0.05);
  });

  it('ln(x) n’existe pas pour x ≤ 0', () => {
    const segments = sampleFunction(Math.log, view, WIDTH);
    expect(segments).toHaveLength(1);
    expect(allPoints(segments).every(([x]) => x > 0)).toBe(true);
  });

  it('sqrt(-x^2) (définie en un seul point) ne produit rien de traçable', () => {
    expect(sampleFunction((x) => Math.sqrt(-x * x), view, WIDTH)).toEqual([]);
  });

  it('les grandes valeurs sont ramenées dans une bande hors écran', () => {
    const segments = sampleFunction((x) => Math.exp(10 * x), view, WIDTH);
    const limit = view.yMax + CLAMP_FACTOR * (view.yMax - view.yMin);
    expect(allPoints(segments).every(([, y]) => y <= limit + 1e-9)).toBe(true);
    expect(allPoints(segments).every(([, y]) => Number.isFinite(y))).toBe(true);
  });

  it('respecte un domaine restreint', () => {
    const segments = sampleFunction((x) => x, view, WIDTH, { domain: { min: -1, max: 2 } });
    expect(segments).toHaveLength(1);
    expect(segments[0][0][0]).toBe(-1);
    expect(segments[0].at(-1)[0]).toBe(2);
    expect(sampleFunction((x) => x, view, WIDTH, { domain: { min: 10, max: null } })).toEqual([]);
  });

  it('|x| garde son angle : la courbe passe par (0, 0)', () => {
    const segments = sampleFunction(Math.abs, view, WIDTH);
    expect(segments).toHaveLength(1);
    expect(segments[0].some(([x, y]) => Math.abs(x) < 0.02 && y < 0.02)).toBe(true);
  });

  it('une valeur non numérique est traitée comme non définie', () => {
    expect(sampleFunction(() => 'oops', view, WIDTH)).toEqual([]);
  });
});
