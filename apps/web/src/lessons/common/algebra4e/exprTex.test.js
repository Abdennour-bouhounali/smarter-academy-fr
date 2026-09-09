import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { rat, expr, term, equation, solve } from './exprCore';
import {
  texRat, texXTerm, texExpr, texTerms, texProduct, texDoubleProduct,
  texQuadratic, texEquation, texSolution,
} from './exprTex';

/** Toute sortie de ce module doit être du LaTeX que KaTeX accepte réellement. */
const rendable = (tex) => {
  expect(() => katex.renderToString(tex, { throwOnError: true }), tex).not.toThrow();
  return tex;
};

describe('écriture des rationnels', () => {
  it('utilise le moins typographique, jamais le trait d’union', () => {
    expect(texRat(rat(-3))).toBe('−3');
    expect(texRat(rat(-3))).not.toContain('-');
  });

  it('écrit les décimaux à la française, sans espace parasite', () => {
    expect(texRat(rat(5, 2))).toBe('2{,}5');
    expect(texRat(rat(-5, 4))).toBe('−1{,}25');
  });

  it('garde une fraction en fraction quand elle n’est pas décimale', () => {
    expect(texRat(rat(1, 3))).toBe('\\dfrac{1}{3}');
    expect(texRat(rat(-2, 7))).toBe('−\\dfrac{2}{7}');
  });

  it('écrit un entier sans décoration', () => {
    expect(texRat(rat(4))).toBe('4');
    expect(texRat(rat(0))).toBe('0');
  });
});

describe('écriture d’une expression du premier degré', () => {
  it('efface un coefficient 1 et réduit −1 à un signe', () => {
    expect(texXTerm(rat(1))).toBe('x');
    expect(texXTerm(rat(-1))).toBe('−x');
    expect(texXTerm(rat(0))).toBe('');
    expect(texXTerm(rat(3))).toBe('3x');
  });

  it('écrit les deux termes avec un opérateur espacé', () => {
    expect(texExpr(expr(3, -2))).toBe('3x − 2');
    expect(texExpr(expr(3, 2))).toBe('3x + 2');
    expect(texExpr(expr(-1, 5))).toBe('−x + 5');
  });

  it('n’écrit jamais « + −3 » ni « 1x »', () => {
    for (const [a, b] of [[1, 0], [-1, -3], [2, -7], [0, -4], [1, 1]]) {
      const t = texExpr(expr(a, b));
      expect(t, `${a},${b}`).not.toContain('+ −');
      expect(t, `${a},${b}`).not.toMatch(/(^|[^\d.,{}])1x/);
    }
  });

  it('fait disparaître un terme nul, et garde 0 pour l’expression nulle', () => {
    expect(texExpr(expr(3, 0))).toBe('3x');
    expect(texExpr(expr(0, 5))).toBe('5');
    expect(texExpr(expr(0, 0))).toBe('0');
  });

  it('accepte un autre nom d’inconnue', () => {
    expect(texExpr(expr(2, 1), 'n')).toBe('2n + 1');
  });
});

describe('écriture d’une liste de termes non réduite', () => {
  it('pose le signe du premier terme collé, les suivants espacés', () => {
    expect(texTerms([term(3, true), term(2), term(-5, true)])).toBe('3x + 2 − 5x');
    expect(texTerms([term(-3, true), term(2)])).toBe('−3x + 2');
    expect(texTerms([])).toBe('0');
  });

  it('n’écrit jamais deux opérateurs de suite', () => {
    const t = texTerms([term(-1, true), term(-1), term(4, true)]);
    expect(t).toBe('−x − 1 + 4x');
    expect(t).not.toMatch(/[+−]\s*[+−]/);
  });
});

describe('produits et équations', () => {
  it('écrit un produit avec parenthèses, sans facteur 1 superflu', () => {
    expect(texProduct(rat(3), expr(2, -5))).toBe('3(2x − 5)');
    expect(texProduct(rat(1), expr(2, 1))).toBe('(2x + 1)');
    expect(texProduct(rat(-1), expr(2, 1))).toBe('−(2x + 1)');
  });

  it('écrit un produit de deux binômes', () => {
    expect(texDoubleProduct(expr(2, 1), expr(1, -3))).toBe('(2x + 1)(x − 3)');
  });

  it('écrit une forme développée du second degré', () => {
    expect(texQuadratic({ x2: rat(1), x: rat(5), k: rat(6) })).toBe('x^2 + 5x + 6');
    expect(texQuadratic({ x2: rat(2), x: rat(-5), k: rat(-3) })).toBe('2x^2 − 5x − 3');
    expect(texQuadratic({ x2: rat(0), x: rat(3), k: rat(1) })).toBe('3x + 1');
  });

  it('écrit une équation et sa solution', () => {
    const eq = equation(expr(3, 1), expr(0, 7));
    expect(texEquation(eq)).toBe('3x + 1 = 7');
    expect(texSolution(solve(eq))).toBe('x = 2');
    expect(texSolution(solve(equation(expr(3, 1), expr(0, 2))))).toBe('x = \\dfrac{1}{3}');
    expect(texSolution({ kind: 'none' })).toBe('aucune solution');
    expect(texSolution({ kind: 'all' })).toBe('tout nombre convient');
  });
});

describe('tout ce que ce module produit est rendable par KaTeX', () => {
  it('rend les expressions, sur une grille de cas', () => {
    for (let a = -3; a <= 3; a += 1) {
      for (let b = -3; b <= 3; b += 1) {
        rendable(texExpr(expr(a, b)));
        rendable(texProduct(rat(a === 0 ? 1 : a), expr(b, a)));
        rendable(texDoubleProduct(expr(a || 1, b), expr(b || 1, a)));
      }
    }
  });

  it('rend les rationnels non décimaux et les listes de termes', () => {
    rendable(texExpr(expr(rat(1, 3), rat(-2, 7))));
    rendable(texTerms([term(rat(1, 3), true), term(rat(-5, 6))]));
    rendable(texQuadratic({ x2: rat(1), x: rat(-1), k: rat(0) }));
    rendable(texEquation(equation(expr(rat(2, 3), 1), expr(0, rat(-1, 2)))));
  });
});
