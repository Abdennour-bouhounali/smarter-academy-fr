import { describe, it, expect } from 'vitest';
import * as P from './polynomials.js';

const t = (c, p = 0) => ({ c, p });

describe('polynomials — calcul exact de l’unité 3 (الحساب الحرفي)', () => {
  it('réduit : semblables regroupés, nuls retirés, puissances décroissantes', () => {
    expect(P.reduce([t(3, 1), t(-3, 0), t(9, 1), t(3, 2)])).toEqual([t(3, 2), t(12, 1), t(-3, 0)]);
    expect(P.reduce([t(3, 1), t(-3, 1)])).toEqual([]);
  });

  it('développe les exemples du manuel (معارف 1 et 2)', () => {
    expect(P.expand([t(5)], [t(1, 1), t(-1)])).toEqual([t(5, 1), t(-5)]);                       // 5(x − 1)
    expect(P.expand([t(2, 1), t(-1)], [t(1, 1), t(4)])).toEqual([t(2, 2), t(7, 1), t(-4)]);     // (2x − 1)(x + 4)
    expect(P.expand([t(3, 1), t(2)], [t(3, 1), t(2)])).toEqual([t(9, 2), t(12, 1), t(4)]);      // (3x + 2)²
    expect(P.expand([t(4), t(-2, 1)], [t(4), t(-2, 1)])).toEqual([t(4, 2), t(-16, 1), t(16)]);  // (4 − 2x)²
    expect(P.expand([t(5, 1), t(-1)], [t(5, 1), t(1)])).toEqual([t(25, 2), t(-1)]);             // (5x − 1)(5x + 1)
  });

  it('les produits partiels sont la grille de Descartes (2x + 1)² = 4x² + 4x + 1', () => {
    const f = [t(2, 1), t(1)];
    const cells = P.partialProducts(f, f);
    expect(cells.map((c) => c.term)).toEqual([t(4, 2), t(2, 1), t(2, 1), t(1)]);
    expect(P.reduce(cells.map((c) => c.term))).toEqual([t(4, 2), t(4, 1), t(1)]);
  });

  it('balayage : le développement a la même valeur que le produit pour tout x de −20 à 20', () => {
    const factors = [[t(3, 1), t(-1)], [t(3), t(1, 1)], [t(1, 1), t(10), t(1, 1)], [t(-1, 1), t(-2)]];
    for (const f of factors) for (const g of factors) for (let x = -20; x <= 20; x++) {
      expect(P.evaluate(P.expand(f, g), x) === P.evaluate(f, x) * P.evaluate(g, x)).toBe(true);
    }
  });

  it('écrit en LaTeX comme le manuel', () => {
    expect(P.termsTex([t(3, 2), t(8, 1), t(-3)])).toBe('3x^2 + 8x - 3');
    expect(P.termsTex([t(-1, 1), t(1)])).toBe('-x + 1');
    expect(P.factorTex([t(3, 1), t(-1)])).toBe('(3x - 1)');
    expect(P.termsTex([])).toBe('0');
  });

  it('facteur commun monôme : 6x² + 4x → 2x ; 9x + 3 → 3', () => {
    expect(P.commonMonomial([t(6, 2), t(4, 1)])).toEqual(t(2, 1));
    expect(P.commonMonomial([t(9, 1), t(3)])).toEqual(t(3, 0));
    expect(P.divideByMonomial([t(6, 2), t(4, 1)], t(2, 1))).toEqual([t(3, 1), t(2)]);
  });
});
