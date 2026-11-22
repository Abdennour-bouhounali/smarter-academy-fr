import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import { factorExpression, integerPairs } from './factor.js';
import { quadraticRoots, vertexOf, discriminant } from './quadratic.js';

const r = (n, d = 1) => R.makeRational(n, d);
const kinds = (result) => result.steps.map((step) => step.kind);

describe('factorExpression — chaque méthode, et toujours vérifiée', () => {
  it('facteur commun : 6x² + 9x = 3x(2x + 3)', () => {
    const result = factorExpression('6x^2 + 9x');
    expect(result.resultLatex).toBe('3x\\left(2x + 3\\right)');
    expect(result.steps[0]).toMatchObject({ kind: 'commonFactor', params: { factor: '3x' } });
    expect(result.steps[0].latex).toContain('3x \\times 2x + 3x \\times 3');
    expect(result.verification).toEqual({ latex: '3x\\left(2x + 3\\right) = 6x^{2} + 9x', holds: true });
  });

  it('différence de deux carrés : 4x² − 9 = (2x − 3)(2x + 3)', () => {
    const result = factorExpression('4x^2 - 9');
    expect(kinds(result)).toEqual(['diffSquares', 'result']);
    expect(result.steps[0].latex).toBe('4x^{2} - 9 = \\left(2x\\right)^{2} - 3^{2} = \\left(2x - 3\\right)\\left(2x + 3\\right)');
    expect(result.verification.holds).toBe(true);
  });

  it('carré parfait : x² + 6x + 9 = (x + 3)², 4x² − 12x + 9 = (2x − 3)²', () => {
    expect(factorExpression('x^2+6x+9').resultLatex).toBe('\\left(x + 3\\right)^{2}');
    expect(factorExpression('x^2+6x+9').steps[0].rules).toEqual(['perfectSquareSum']);
    expect(factorExpression('4x^2-12x+9').resultLatex).toBe('\\left(2x - 3\\right)^{2}');
    expect(factorExpression('4x^2-12x+9').steps[0].rules).toEqual(['perfectSquareDiff']);
  });

  it('somme et produit : x² + 5x + 6, les couples candidats et celui qui convient', () => {
    const result = factorExpression('x^2 + 5x + 6');
    const step = result.steps[0];
    expect(step.kind).toBe('sumProduct');
    expect(step.params).toMatchObject({ product: 6, sum: 5, p: 2, q: 3 });
    expect(step.candidates.filter((c) => c.ok)).toEqual([{ p: 2, q: 3, sum: 5, ok: true }]);
    expect(step.candidates.length).toBeGreaterThan(2);
    expect(result.resultLatex).toBe('\\left(x + 2\\right)\\left(x + 3\\right)');
    expect(factorExpression('x^2-2x-15').resultLatex).toBe('\\left(x - 5\\right)\\left(x + 3\\right)');
  });

  it('méthode ac : 6x² + 5x + 1 et 2x² − 5x + 2, avec le regroupement', () => {
    const result = factorExpression('6x^2+5x+1');
    expect(kinds(result)).toEqual(['acPairs', 'acSplit', 'result']);
    expect(result.steps[1].latex).toContain('6x^{2} + 2x + 3x + 1 = 2x\\left(3x + 1\\right) + 1\\left(3x + 1\\right)');
    expect(result.resultLatex).toBe('\\left(3x + 1\\right)\\left(2x + 1\\right)');
    expect(factorExpression('2x^2 - 5x + 2').resultLatex).toBe('\\left(2x - 1\\right)\\left(x - 2\\right)');
  });

  it('combinaisons : 2x² − 8 = 2(x² − 4) = 2(x − 2)(x + 2) ; −x² + 4 ; x³ − 4x ; x⁴ − 16', () => {
    const combo = factorExpression('2x^2 - 8');
    expect(kinds(combo)).toEqual(['commonFactor', 'diffSquares', 'result']);
    expect(combo.resultLatex).toBe('2\\left(x - 2\\right)\\left(x + 2\\right)');
    expect(factorExpression('-x^2+4').resultLatex).toBe('-\\left(x - 2\\right)\\left(x + 2\\right)');
    expect(factorExpression('-x^2+4').steps[0].rules).toEqual(['factorMinus']);
    expect(factorExpression('x^3 - 4x').resultLatex).toBe('x\\left(x - 2\\right)\\left(x + 2\\right)');
    expect(factorExpression('x^4-16').resultLatex).toBe('\\left(x - 2\\right)\\left(x + 2\\right)\\left(x^{2} + 4\\right)');
    expect(factorExpression('x^2 - 1/4').resultLatex).toBe('\\frac{1}{4}\\left(2x - 1\\right)\\left(2x + 1\\right)');
  });

  it('développe d’abord une saisie non développée', () => {
    const result = factorExpression('(x+1)(x+2)');
    expect(result.steps[0]).toMatchObject({ kind: 'expand', rules: ['expandFirst'] });
    expect(result.resultLatex).toBe('\\left(x + 1\\right)\\left(x + 2\\right)');
  });

  it('les irréductibles le DISENT, sans faux nombre', () => {
    const none = factorExpression('x^2 + 1');
    expect(none.status).toBe('irreducibleReal');
    expect(none.resultLatex).toBe('x^{2} + 1');
    expect(none.discriminant).toMatchObject({ sign: -1, kind: 'none', factored: null });
    const irrational = factorExpression('x^2 + x - 1');
    expect(irrational.status).toBe('irreducibleRational');
    expect(irrational.steps.at(-1).latex).toBe('x_{1} = \\frac{-1 - \\sqrt{5}}{2} \\;;\\; x_{2} = \\frac{-1 + \\sqrt{5}}{2}');
    expect(factorExpression('x^3 + x + 1').status).toBe('degreeTooHigh');
    expect(factorExpression('3x').status).toBe('monomial');
    expect(factorExpression('2x + 3').status).toBe('linear');
  });

  it('le discriminant reste un pli secondaire, cohérent avec la factorisation', () => {
    const d = factorExpression('x^2+5x+6').discriminant;
    expect(d).toMatchObject({ deltaLatex: '1', kind: 'two', rational: true });
    expect(d.lines[0]).toBe('\\Delta = b^{2} - 4ac = 5^{2} - 4 \\times 1 \\times 6 = 1');
    expect(factorExpression('-x^2+4').discriminant.factored).toBe('-\\left(x + 2\\right)\\left(x - 2\\right)');
  });

  it('refuse proprement : plusieurs lettres, constante, syntaxe', () => {
    expect(factorExpression('x + y').error.code).toBe('multivariate');
    expect(factorExpression('5').error.code).toBe('constant');
    expect(factorExpression('x^2 +').ok).toBe(false);
    expect(factorExpression('').error.code).toBe('empty');
  });

  it('sur 400 produits k(ax + b)(cx + d) tirés au hasard : factorisé, et le redéveloppement retombe juste', () => {
    let seed = 11;
    const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
    const int = (min, max) => min + Math.floor(random() * (max - min + 1));
    for (let i = 0; i < 400; i += 1) {
      const k = int(1, 4) * (random() < 0.3 ? -1 : 1);
      const a = int(1, 3);
      const c = int(1, 3);
      const b = int(-6, 6);
      const d = int(-6, 6);
      const source = `${k}(${a}x + (${b}))(${c}x + (${d}))`;
      const result = factorExpression(source);
      expect(result.ok, source).toBe(true);
      expect(result.verification?.holds ?? true, source).toBe(true);
      if (b !== 0 || d !== 0) expect(['factored'], source).toContain(result.status);
    }
  });

  it('integerPairs : les couples de produit donné', () => {
    expect(integerPairs(6)).toEqual([[1, 6], [-1, -6], [2, 3], [-2, -3]]);
    expect(integerPairs(-4)).toEqual([[1, -4], [-1, 4], [2, -2], [-2, 2]]);
  });
});

describe('quadratic — racines exactes', () => {
  it('rationnelles, doubles, absentes, irrationnelles (radical simplifié)', () => {
    expect(quadraticRoots(r(1), r(-5), r(6)).roots.map((x) => x.latex)).toEqual(['2', '3']);
    expect(quadraticRoots(r(1), r(2), r(1))).toMatchObject({ kind: 'double', rational: true });
    expect(quadraticRoots(r(1), r(0), r(1))).toMatchObject({ kind: 'none', roots: [] });
    const irr = quadraticRoots(r(1), r(0), r(-8));
    expect(irr.roots.map((x) => x.latex)).toEqual(['-2\\sqrt{2}', '2\\sqrt{2}']);
    expect(irr.roots[1].approx).toBeCloseTo(Math.sqrt(8), 10);
    expect(quadraticRoots(r(2), r(-2), r(-1)).roots[0].latex).toBe('\\frac{1 - \\sqrt{3}}{2}');
    expect(discriminant(r(1), r(5), r(6))).toEqual(r(1));
    expect(vertexOf(r(1), r(-2), r(-3))).toEqual({ x: r(1), y: r(-4) });
  });
});
