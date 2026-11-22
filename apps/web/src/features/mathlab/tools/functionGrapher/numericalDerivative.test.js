import { describe, it, expect } from 'vitest';
import { derivativeAt, derivativeFunction, tangentAt, constrainAlongCurve } from './numericalDerivative.js';
import { compileSource } from './expressionEvaluator.js';
import { sampleFunction } from './functionSampler.js';

const fn = (source) => compileSource(source).fn;

describe('dérivée numérique — exacte aux décimales montrées', () => {
  it.each([
    ['x^2', 2, 4],
    ['x^2', -3, -6],
    ['x^3', 2, 12],
    ['2x+3', 5, 2],
    ['2x+3', -100, 2],
    ['\\sin(x)', 0, 1],
    ['\\sin(x)', Math.PI / 3, Math.cos(Math.PI / 3)],
    ['\\cos(x)', Math.PI / 2, -1],
    ['e^x', 1, Math.E],
    ['\\sqrt{x}', 4, 0.25],
    ['\\frac{1}{x}', 2, -0.25],
    ['\\frac{1}{x}', -0.5, -4],
    ['\\ln(x)', 3, 1 / 3],
    ['\\left|x\\right|', 1, 1],
    ['\\left|x\\right|', -2, -1],
    ['x^2', 1000, 2000],
    ['5', 7, 0],
  ])('(%s)′(%s) = %s', (source, x, expected) => {
    const result = derivativeAt(fn(source), x);
    expect(result.ok).toBe(true);
    expect(result.value).toBeCloseTo(expected, 6);
  });

  it('refuse honnêtement : bord du domaine, pôle, angle', () => {
    expect(derivativeAt(fn('\\sqrt{x}'), 0)).toEqual({ ok: false, reason: 'undefined' });
    expect(derivativeAt(fn('\\sqrt{x}'), -1)).toEqual({ ok: false, reason: 'undefined' });
    expect(derivativeAt(fn('\\frac{1}{x}'), 0)).toEqual({ ok: false, reason: 'undefined' });
    expect(derivativeAt(fn('\\ln(x)'), 0)).toEqual({ ok: false, reason: 'undefined' });
    expect(derivativeAt(fn('\\left|x\\right|'), 0)).toEqual({ ok: false, reason: 'corner' });
    expect(derivativeAt(fn('\\left|x-2\\right|'), 2)).toEqual({ ok: false, reason: 'corner' });
    expect(derivativeAt(fn('x'), NaN)).toEqual({ ok: false, reason: 'undefined' });
  });

  it('ne prend pas une forte courbure pour un angle', () => {
    expect(derivativeAt(fn('\\sin(20x)'), 0.3).ok).toBe(true);
    expect(derivativeAt(fn('x^{10}'), 1.5).ok).toBe(true);
    expect(derivativeAt(fn('\\frac{1}{x}'), 0.01).value).toBeCloseTo(-10000, 0);
  });

  it('la tangente est un point et une pente, ou rien', () => {
    expect(tangentAt(fn('x^2'), 3)).toMatchObject({ x: 3, y: 9 });
    expect(tangentAt(fn('x^2'), 3).slope).toBeCloseTo(6, 8);
    expect(tangentAt(fn('\\left|x\\right|'), 0)).toBeNull();
    expect(tangentAt(fn('\\sqrt{x}'), -4)).toBeNull();
  });

  it('A glisse le long de la courbe sans franchir un pôle ni sortir du domaine', () => {
    const inverse = fn('\\frac{1}{x}');
    expect(constrainAlongCurve(inverse, 0.5, 0.2)).toBe(0.2);
    expect(constrainAlongCurve(inverse, 0.5, -0.5)).toBe(0.5);
    expect(constrainAlongCurve(inverse, 0.001, -0.001)).toBe(0.001);
    const root = fn('\\sqrt{x}');
    expect(constrainAlongCurve(root, 1, -1)).toBe(1);
    expect(constrainAlongCurve(root, 1, 0)).toBe(0);
    expect(constrainAlongCurve(fn('1000x'), 0, 1, 10)).toBe(1);
    expect(constrainAlongCurve(Math.tan, 1, 2)).toBe(1);
  });

  it('f′ se trace avec le traceur du grapheur, coupée là où elle n’existe pas', () => {
    const view = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
    const inverse = sampleFunction(derivativeFunction(fn('\\frac{1}{x}')), view, 600);
    expect(inverse).toHaveLength(2);
    expect(inverse.flat().every(([, y]) => y <= 0)).toBe(true);
    const root = sampleFunction(derivativeFunction(fn('\\sqrt{x}')), view, 600);
    expect(root).toHaveLength(1);
    expect(root.flat().every(([x]) => x > 0)).toBe(true);
    const abs = sampleFunction(derivativeFunction(fn('\\left|x\\right|')), view, 600);
    // −1 à gauche, +1 à droite, et rien qui les relie en 0.
    expect(abs).toHaveLength(2);
    expect(abs[0].every(([, y]) => Math.abs(y + 1) < 1e-3)).toBe(true);
    expect(abs[1].every(([, y]) => Math.abs(y - 1) < 1e-3)).toBe(true);
    const square = sampleFunction(derivativeFunction(fn('x^2')), view, 600);
    expect(square).toHaveLength(1);
    for (const [x, y] of square[0]) expect(y).toBeCloseTo(2 * x, 5);
  });
});
