import { describe, it, expect } from 'vitest';
import {
  poly, X, add, sub, mul, scale, evaluate, samePoly, formatPoly, termsOf, symbolicChain, numericChain, squarePieces,
  divideByMonomial, commonMonomial, asDifferenceOfSquares, asPerfectSquare, texPoly,
} from './litteralUtils';

describe('polynomials', () => {
  it('formats French', () => {
    expect(formatPoly(poly(7, -5, 2))).toBe('2x² − 5x + 7');
    expect(formatPoly(poly(0, -1))).toBe('−x');
    expect(formatPoly(poly(3))).toBe('3');
    expect(formatPoly(poly(0))).toBe('0');
    expect(formatPoly(poly(-7, 2, 2))).toBe('2x² + 2x − 7');
    expect(texPoly(poly(-1.5, 1))).toBe('x - 1{,}5');
  });
  it('adds, multiplies, evaluates', () => {
    expect(formatPoly(mul(poly(3, 1), poly(2, 1)))).toBe('x² + 5x + 6');
    expect(formatPoly(mul(poly(3, 1), poly(3, 1)))).toBe('x² + 6x + 9');
    expect(formatPoly(mul(poly(-5, 1), poly(5, 1)))).toBe('x² − 25');
    expect(evaluate(poly(9, 6, 1), 1)).toBe(16);
    expect(samePoly(add(poly(2, -5, 3), poly(-9, 7, -1)), poly(-7, 2, 2))).toBe(true);
    expect(termsOf(poly(-7, 2, 2))).toEqual([{ degree: 0, coef: -7 }, { degree: 1, coef: 2 }, { degree: 2, coef: 2 }]);
  });
});

describe('the magic trick', () => {
  const T1 = [{ op: 'mul', k: 3 }, { op: 'add', k: 9 }, { op: 'div', k: 3 }, { op: 'subx' }];
  const T2 = [{ op: 'add', k: 1 }, { op: 'square' }, { op: 'subsquarex' }];
  it('×3, +9, ÷3, − x always gives 3', () => {
    const chain = symbolicChain(T1);
    expect(formatPoly(chain[chain.length - 1])).toBe('3');
    for (const x of [0, 2.5, -7, 1000]) expect(numericChain(T1, x).pop()).toBe(3);
    expect(formatPoly(chain[2])).toBe('3x + 9');
    expect(formatPoly(chain[3])).toBe('x + 3');
  });
  it('(x + 1)² − x² = 2x + 1', () => {
    expect(formatPoly(symbolicChain(T2).pop())).toBe('2x + 1');
    expect(numericChain(T2, 10).pop()).toBe(21);
  });
});

describe('identities and factoring', () => {
  it('square pieces', () => { expect(squarePieces(3, 2)).toEqual({ a2: 9, ab: 6, b2: 4, total: 25 }); });
  it('common monomial of 4x² + 12x is 4x', () => {
    expect(commonMonomial(poly(0, 12, 4))).toEqual({ k: 4, d: 1 });
    expect(formatPoly(divideByMonomial(poly(0, 12, 4), 4, 1))).toBe('x + 3');
    expect(divideByMonomial(poly(0, 12, 4), 8, 1)).toBe(null);
  });
  it('recognises a² − b² and (ax + b)²', () => {
    expect(asDifferenceOfSquares(poly(-25, 0, 1))).toEqual({ a: 1, b: 5 });
    expect(asDifferenceOfSquares(poly(25, 0, 1))).toBe(null);
    expect(asPerfectSquare(poly(9, 12, 4))).toEqual({ a: 2, b: 3 });
    expect(asPerfectSquare(poly(9, 6, 1))).toEqual({ a: 1, b: 3 });
    expect(asPerfectSquare(poly(9, 0, 1))).toBe(null);
    expect(asPerfectSquare(poly(4, -4, 1))).toEqual({ a: 1, b: -2 });
  });
  it('scale and sub', () => { expect(formatPoly(sub(scale(X, 3), poly(-4)))).toBe('3x + 4'); });
});
