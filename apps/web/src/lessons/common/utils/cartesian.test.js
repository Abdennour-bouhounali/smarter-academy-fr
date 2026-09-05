import { describe, it, expect } from 'vitest';
import {
  sampleFunction, clipSegmentToRange, clipAffineToRange, imageAt, antecedentsOf,
  extremum, variationIntervals, curveIntersections, readWithTolerance, niceRange, inRange,
} from './cartesian';

const R = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const near = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('sampleFunction', () => {
  it('échantillonne d’un bout à l’autre de l’étendue', () => {
    const pts = sampleFunction((x) => 2 * x + 1, R, 10);
    expect(pts).toHaveLength(11);
    expect(pts[0]).toEqual({ x: -5, y: -9 });
    expect(pts[10]).toEqual({ x: 5, y: 11 });
  });

  it('ignore les valeurs non finies plutôt que de produire des NaN', () => {
    const pts = sampleFunction((x) => (x === 0 ? Infinity : 1 / x), R, 10);
    expect(pts.every((p) => Number.isFinite(p.y))).toBe(true);
  });
});

describe('clipSegmentToRange', () => {
  it('une droite raide reste dans le cadre — jamais y = 400 dans un viewBox de 300', () => {
    // y = 5x sur [−5 ; 5] monterait à ±25 : le tracé doit s'arrêter à ±5.
    const seg = clipAffineToRange(R, 5, 0);
    near(seg.from.y, -5);
    near(seg.to.y, 5);
    near(seg.from.x, -1);
    near(seg.to.x, 1);
  });

  it('laisse intact un segment déjà entièrement dedans', () => {
    const seg = clipSegmentToRange(R, { x: -2, y: -1 }, { x: 3, y: 2 });
    expect(seg.from).toEqual({ x: -2, y: -1 });
    expect(seg.to).toEqual({ x: 3, y: 2 });
  });

  it('renvoie null quand la droite ne traverse pas le cadre', () => {
    expect(clipAffineToRange(R, 0, 40)).toBeNull();
    expect(clipSegmentToRange(R, { x: 8, y: 8 }, { x: 9, y: 9 })).toBeNull();
  });

  it('gère l’horizontale et la verticale sans division par zéro', () => {
    const h = clipAffineToRange(R, 0, 2);
    expect(h.from.y).toBe(2);
    expect(h.to.y).toBe(2);
    const v = clipSegmentToRange(R, { x: 1, y: -20 }, { x: 1, y: 20 });
    near(v.from.y, -5);
    near(v.to.y, 5);
  });
});

describe('imageAt', () => {
  const line = sampleFunction((x) => 2 * x + 1, R, 100);

  it('lit l’image d’un x du domaine', () => {
    near(imageAt(line, 2), 5);
    near(imageAt(line, 0), 1);
  });

  it('renvoie null hors du domaine', () => {
    expect(imageAt(line, 9)).toBeNull();
    expect(imageAt(line, -9)).toBeNull();
    expect(imageAt([], 0)).toBeNull();
  });
});

describe('antecedentsOf — la dissymétrie image / antécédent', () => {
  const para = sampleFunction((x) => x * x, { xMin: -3, xMax: 3, yMin: 0, yMax: 9 }, 600);

  it('une parabole donne DEUX antécédents pour une même image', () => {
    const xs = antecedentsOf(para, 4);
    expect(xs).toHaveLength(2);
    near(xs[0], -2, 0.02);
    near(xs[1], 2, 0.02);
  });

  it('le sommet n’en donne qu’un', () => {
    expect(antecedentsOf(para, 0)).toHaveLength(1);
  });

  it('un niveau jamais atteint n’en donne aucun', () => {
    expect(antecedentsOf(para, -3)).toHaveLength(0);
  });

  it('une droite en donne exactement un', () => {
    const line = sampleFunction((x) => 2 * x + 1, R, 200);
    const xs = antecedentsOf(line, 5);
    expect(xs).toHaveLength(1);
    near(xs[0], 2, 0.05);
  });
});

describe('extremum et variationIntervals', () => {
  const curve = [
    { x: 0, y: 0 }, { x: 1, y: 3 }, { x: 2, y: 5 },
    { x: 3, y: 5 }, { x: 4, y: 2 }, { x: 5, y: 1 },
  ];

  it('trouve le maximum et le minimum', () => {
    expect(extremum(curve, 'max').y).toBe(5);
    expect(extremum(curve, 'min').y).toBe(0);
  });

  it('découpe en croissante, constante, décroissante', () => {
    expect(variationIntervals(curve)).toEqual([
      { from: 0, to: 2, direction: 'croissante' },
      { from: 2, to: 3, direction: 'constante' },
      { from: 3, to: 5, direction: 'decroissante' },
    ]);
  });

  it('une droite croissante donne un seul intervalle', () => {
    const line = sampleFunction((x) => 2 * x, R, 20);
    const v = variationIntervals(line);
    expect(v).toHaveLength(1);
    expect(v[0].direction).toBe('croissante');
  });
});

describe('curveIntersections', () => {
  it('les deux forfaits se croisent là où le prix est le même', () => {
    // 9n contre 24 + 5n → n = 6
    const range = { xMin: 0, xMax: 12, yMin: 0, yMax: 120 };
    const a = sampleFunction((x) => 9 * x, range, 240);
    const b = sampleFunction((x) => 24 + 5 * x, range, 240);
    const hits = curveIntersections(a, b);
    expect(hits).toHaveLength(1);
    near(hits[0].x, 6, 0.05);
    near(hits[0].y, 54, 0.5);
  });

  it('deux parallèles ne se croisent pas', () => {
    const a = sampleFunction((x) => 2 * x + 1, R, 50);
    const b = sampleFunction((x) => 2 * x + 3, R, 50);
    expect(curveIntersections(a, b)).toHaveLength(0);
  });
});

describe('readWithTolerance', () => {
  it('accepte une lecture graphique approchée, refuse une vraie erreur', () => {
    expect(readWithTolerance(3, 3.2)).toBe(true);
    expect(readWithTolerance(3, 3.5)).toBe(true);
    expect(readWithTolerance(3, 4)).toBe(false);
    expect(readWithTolerance(3, NaN)).toBe(false);
  });
});

describe('niceRange et inRange', () => {
  it('arrondit l’étendue au pas', () => {
    expect(niceRange([2, 17, 9], 5)).toEqual({ min: 0, max: 20 });
    expect(niceRange([-3, 4], 1)).toEqual({ min: -3, max: 4 });
  });

  it('ne renvoie jamais une étendue plate', () => {
    expect(niceRange([7, 7], 5)).toEqual({ min: 5, max: 10 });
    expect(niceRange([], 2)).toEqual({ min: 0, max: 2 });
  });

  it('teste l’appartenance au cadre', () => {
    expect(inRange(R, { x: 0, y: 0 })).toBe(true);
    expect(inRange(R, { x: 5, y: -5 })).toBe(true);
    expect(inRange(R, { x: 6, y: 0 })).toBe(false);
  });
});
