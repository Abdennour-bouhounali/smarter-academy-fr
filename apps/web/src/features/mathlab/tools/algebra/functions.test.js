import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import {
  makeFunction, functionLatex, analyseFunction, valueTable, frameFunction, normalizeCoefficient,
} from './functions.js';

const r = (n, d = 1) => R.makeRational(n, d);

describe('functions — ce qu’on lit sur la courbe, exactement', () => {
  it('écrit la fonction de chaque famille', () => {
    expect(functionLatex(makeFunction('linear', { a: 2, b: 5, c: 1 }))).toBe('f(x) = 2x');
    expect(functionLatex(makeFunction('affine', { a: -0.5, b: 3, c: 1 }))).toBe('f(x) = -\\frac{1}{2}x + 3');
    expect(functionLatex(makeFunction('quadratic', { a: 1, b: -2, c: -3 }))).toBe('f(x) = x^{2} - 2x - 3');
    expect(makeFunction('quadratic', { a: 0, b: 1, c: 0 }).a).toEqual(r(1));
  });

  it('affine : ordonnée à l’origine, racine, pente, sens de variation', () => {
    const info = analyseFunction(makeFunction('affine', { a: 2, b: 1 }));
    expect(info.yIntercept).toEqual({ x: r(0), y: r(1) });
    expect(info.roots.map((x) => x.value)).toEqual([r(-1, 2)]);
    expect(info.slope).toEqual(r(2));
    expect(info.monotony).toBe('increasing');
    expect(analyseFunction(makeFunction('affine', { a: 0, b: 3 }))).toMatchObject({ rootsKind: 'none', monotony: 'constant' });
    expect(analyseFunction(makeFunction('affine', { a: 0, b: 0 })).rootsKind).toBe('all');
    expect(analyseFunction(makeFunction('linear', { a: -3 })).roots[0].value).toEqual(r(0));
  });

  it('second degré : racines, sommet, axe, ouverture', () => {
    const info = analyseFunction(makeFunction('quadratic', { a: 1, b: -2, c: -3 }));
    expect(info.roots.map((x) => x.value)).toEqual([r(-1), r(3)]);
    expect(info.vertex).toEqual({ x: r(1), y: r(-4) });
    expect(info.opening).toBe('up');
    expect(info.monotony).toBe('decreasingThenIncreasing');
    const down = analyseFunction(makeFunction('quadratic', { a: -1, b: 0, c: 4 }));
    expect(down).toMatchObject({ opening: 'down', monotony: 'increasingThenDecreasing' });
    expect(analyseFunction(makeFunction('quadratic', { a: 1, b: 0, c: 2 })).rootsKind).toBe('none');
    expect(analyseFunction(makeFunction('quadratic', { a: 1, b: 0, c: -2 })).roots.map((x) => x.latex)).toEqual(['-\\sqrt{2}', '\\sqrt{2}']);
  });

  it('tableau de valeurs exact, cadre contenant les points', () => {
    const fn = makeFunction('affine', { a: 0.5, b: -1 });
    const rows = valueTable(fn, -2, 0.5, 7);
    expect(rows[0]).toEqual({ x: r(-2), y: r(-2) });
    expect(rows[6]).toEqual({ x: r(1), y: r(-1, 2) });
    const q = makeFunction('quadratic', { a: 1, b: -6, c: 5 });
    const frame = frameFunction(q);
    expect(frame.xMin).toBeLessThan(1);
    expect(frame.xMax).toBeGreaterThan(5);
    expect(frame.yMin).toBeLessThan(-4);
  });

  it('les coefficients stockés sont ramenés au pas de 0,5 et à leur plage', () => {
    expect(normalizeCoefficient(2.3, 'a', 1)).toBe(2.5);
    expect(normalizeCoefficient(99, 'a', 1)).toBe(5);
    expect(normalizeCoefficient(Number.NaN, 'b', 1)).toBe(1);
  });
});
