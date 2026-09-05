import { describe, it, expect } from 'vitest';
import {
  isqrt, isPerfectSquare, bracket, largestSquareFactor, simplifyRoot,
  rootProduct, rootQuotient, approxRoot, formatRoot, formatSqrt, formatBracket,
  compareRootToNumber, compareRoots, squareOfRoot, formatDec,
} from './rootUtils';

describe('isqrt / isPerfectSquare', () => {
  it('rend la racine entière par défaut', () => {
    expect(isqrt(49)).toBe(7);
    expect(isqrt(20)).toBe(4);
    expect(isqrt(0)).toBe(0);
    expect(isqrt(1)).toBe(1);
    expect(isqrt(143)).toBe(11);
    expect(isqrt(144)).toBe(12);
  });

  it('reconnaît les carrés parfaits, et seulement eux', () => {
    [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144].forEach((n) => {
      expect(isPerfectSquare(n)).toBe(true);
    });
    [2, 3, 12, 20, 50, 99, 143].forEach((n) => {
      expect(isPerfectSquare(n)).toBe(false);
    });
    expect(isPerfectSquare(-4)).toBe(false);
    expect(isPerfectSquare(6.25)).toBe(false); // 2,5² : pas un carré d'ENTIER
  });
});

describe('bracket', () => {
  it('encadre √20 entre 4 et 5, √50 entre 7 et 8', () => {
    expect(bracket(20)).toEqual([4, 5]);
    expect(bracket(50)).toEqual([7, 8]);
    expect(bracket(2)).toEqual([1, 2]);
  });
  it('ne encadre pas un carré parfait : les deux bornes coïncident', () => {
    expect(bracket(49)).toEqual([7, 7]);
    expect(bracket(144)).toEqual([12, 12]);
  });
});

describe('largestSquareFactor / simplifyRoot', () => {
  it('extrait le PLUS GRAND carré parfait, pas le premier venu', () => {
    expect(largestSquareFactor(12)).toBe(4);
    expect(largestSquareFactor(72)).toBe(36); // pas 4 ni 9
    expect(largestSquareFactor(50)).toBe(25);
    expect(largestSquareFactor(7)).toBe(1);
  });

  it('simplifie √12 = 2√3, √50 = 5√2, √72 = 6√2', () => {
    expect(simplifyRoot(12)).toEqual({ coef: 2, radicand: 3 });
    expect(simplifyRoot(50)).toEqual({ coef: 5, radicand: 2 });
    expect(simplifyRoot(72)).toEqual({ coef: 6, radicand: 2 });
  });

  it('rend un entier pur pour un carré parfait, et laisse un premier intact', () => {
    expect(simplifyRoot(36)).toEqual({ coef: 6, radicand: 1 });
    expect(simplifyRoot(1)).toEqual({ coef: 1, radicand: 1 });
    expect(simplifyRoot(7)).toEqual({ coef: 1, radicand: 7 });
    expect(simplifyRoot(0)).toEqual({ coef: 0, radicand: 1 });
  });
});

describe('rootProduct / rootQuotient', () => {
  it('√4 × √9 = 6 et √2 × √18 = 6 (le produit passe sous une seule racine)', () => {
    expect(rootProduct(4, 9)).toEqual({ coef: 6, radicand: 1 });
    expect(rootProduct(2, 18)).toEqual({ coef: 6, radicand: 1 });
    expect(rootProduct(2, 6)).toEqual({ coef: 2, radicand: 3 }); // √12
  });

  it('√50 ÷ √2 = 5, et refuse un quotient non entier', () => {
    expect(rootQuotient(50, 2)).toEqual({ coef: 5, radicand: 1 });
    expect(rootQuotient(12, 3)).toEqual({ coef: 2, radicand: 1 });
    expect(rootQuotient(10, 4)).toBeNull();
    expect(rootQuotient(10, 0)).toBeNull();
  });

  it("le piège de l'addition : √9 + √16 ≠ √25", () => {
    const somme = Math.sqrt(9) + Math.sqrt(16); // 3 + 4 = 7
    expect(somme).toBe(7);
    expect(Math.sqrt(25)).toBe(5);
    expect(somme).not.toBe(Math.sqrt(25));
    // mais le PRODUIT, lui, passe bien : √9 × √16 = √144 = 12
    expect(rootProduct(9, 16)).toEqual({ coef: 12, radicand: 1 });
  });
});

describe('approxRoot', () => {
  it('approche √20 ≈ 4,47 et √2 ≈ 1,414', () => {
    expect(approxRoot(20, 2)).toBe(4.47);
    expect(approxRoot(2, 3)).toBe(1.414);
    expect(approxRoot(49, 2)).toBe(7);
  });
});

describe('formatRoot / formatSqrt / formatBracket (LaTeX)', () => {
  it('écrit 2√3, 6, √3 et 0', () => {
    expect(formatRoot(12)).toBe('2\\sqrt{3}');
    expect(formatRoot(36)).toBe('6');
    expect(formatRoot({ coef: 1, radicand: 3 })).toBe('\\sqrt{3}');
    expect(formatRoot({ coef: 0, radicand: 1 })).toBe('0');
    expect(formatSqrt(20)).toBe('\\sqrt{20}');
  });

  it("écrit l'encadrement 4 < √20 < 5, ou l'égalité pour un carré parfait", () => {
    expect(formatBracket(20)).toBe('4 < \\sqrt{20} < 5');
    expect(formatBracket(49)).toBe('\\sqrt{49} = 7');
  });
});

describe('comparaisons par les carrés', () => {
  it('compare √50 à 7 sans approximation décimale', () => {
    expect(compareRootToNumber(50, 7)).toBe(1);   // 50 > 49
    expect(compareRootToNumber(49, 7)).toBe(0);
    expect(compareRootToNumber(48, 7)).toBe(-1);
  });

  it('compare 2√3 et 3√2 par leurs carrés (12 < 18)', () => {
    const a = simplifyRoot(12); // 2√3
    const b = simplifyRoot(18); // 3√2
    expect(squareOfRoot(a)).toBe(12);
    expect(squareOfRoot(b)).toBe(18);
    expect(compareRoots(a, b)).toBe(-1);
    expect(compareRoots(b, a)).toBe(1);
    expect(compareRoots(a, a)).toBe(0);
  });

  it('démonte « 2√3 = √6 » : leurs carrés valent 12 et 6', () => {
    expect(squareOfRoot(simplifyRoot(12))).toBe(12);
    expect(squareOfRoot({ coef: 1, radicand: 6 })).toBe(6);
    expect(compareRoots(simplifyRoot(12), { coef: 1, radicand: 6 })).toBe(1);
  });
});

describe('typographie française', () => {
  it('formatDec émet le moins U+2212, pas le tiret ASCII', () => {
    expect(formatDec(-4)).toBe('−4');
    expect(formatDec(-4)).not.toBe('-4');
    expect(formatDec(4.47)).toBe('4,47');
  });
});
