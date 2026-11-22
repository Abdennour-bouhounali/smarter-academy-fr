import { describe, it, expect } from 'vitest';
import * as P from './powers.js';

describe('les puissances, EXACTES', () => {
  it('2^5 écrite en produit', () => {
    const r = P.powerOf(2, 5);
    expect(r.text).toBe('32');
    expect(r.latex).toBe('2^{5} = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32');
  });

  it('exposant nul et exposants négatifs', () => {
    expect(P.powerOf(7, 0).latex).toBe('7^{0} = 1');
    expect(P.powerOf(2, -3)).toMatchObject({ text: '1/8', latex: '2^{-3} = \\frac{1}{2^{3}} = \\frac{1}{8}' });
    expect(P.powerOf(2, -3).decimal).toEqual({ text: '0,125', exact: true });
    expect(P.powerOf(-2, -3).text).toBe('−1/8');
    expect(P.powerOf(-5, -2).text).toBe('1/25');
    expect(P.powerOf(3, -1).decimal.exact).toBe(false);
  });

  it('bases négatives : le signe suit la parité de l’exposant', () => {
    expect(P.powerOf(-2, 3).text).toBe('−8');
    expect(P.powerOf(-3, 4).text).toBe('81');
    expect(P.powerOf(-2, 3).latex).toContain('(-2) \\times (-2)');
  });

  it('grand exposant : EXACT (BigInt), jamais 1e+21', () => {
    const r = P.powerOf(10, 21);
    expect(r.value.n.toString()).toBe(`1${'0'.repeat(21)}`);
    expect(r.latex).not.toMatch(/e\+|Infinity|NaN/);
    expect(P.powerOf(2, 30).text).toBe('1073741824');
    expect(P.powerOf(2, 20).latex).toContain('\\underbrace');
  });

  it('refus motivés', () => {
    expect(P.powerOf(0, 0)).toEqual({ error: 'zeroPowerZero' });
    expect(P.powerOf(0, -2)).toEqual({ error: 'divisionByZero' });
    expect(P.powerOf(0, 3).text).toBe('0');
    expect(P.powerOf(2, 31)).toEqual({ error: 'exponentTooLarge' });
    expect(P.powerOf(1001, 2)).toEqual({ error: 'baseTooLarge' });
    expect(P.powerOf(999, 30)).toEqual({ error: 'tooLarge' });
    expect(P.powerOf(2.5, 2)).toEqual({ error: 'notInteger' });
  });
});

describe('les règles, VÉRIFIÉES par le calcul', () => {
  it('produit, quotient, puissance de puissance', () => {
    expect(P.applyPowerRule('product', 2, 3, 2)).toMatchObject({ resultExp: 5, holds: true, left: '32', right: '32' });
    expect(P.applyPowerRule('quotient', 2, 3, 5)).toMatchObject({ resultExp: -2, holds: true, right: '\\frac{1}{4}' });
    expect(P.applyPowerRule('power', 3, 2, 3)).toMatchObject({ resultExp: 6, holds: true, right: '729' });
    expect(P.applyPowerRule('product', 2, 3, 2).latexExpanded).toBe('(2 \\times 2 \\times 2) \\times (2 \\times 2) = 2 \\times 2 \\times 2 \\times 2 \\times 2');
  });

  it('exposants négatifs et nuls : la règle tient toujours', () => {
    for (const rule of P.POWER_RULES) {
      for (const [m, n] of [[-3, 2], [0, 4], [5, -5], [-2, -3]]) {
        expect(P.applyPowerRule(rule, -3, m, n).holds, `${rule} ${m} ${n}`).toBe(true);
      }
    }
  });

  it('refus : base nulle, bornes', () => {
    expect(P.applyPowerRule('product', 0, 1, 2)).toEqual({ error: 'zeroBase' });
    expect(P.applyPowerRule('product', 2, 13, 2)).toEqual({ error: 'exponentTooLarge' });
    expect(P.applyPowerRule('nope', 2, 1, 2)).toEqual({ error: 'unknownRule' });
  });
});

describe('puissances de 10 et écriture scientifique', () => {
  it('10^3 et 10^-3', () => {
    expect(P.powerOfTen(3).text).toBe('1000');
    expect(P.powerOfTen(-3).text).toBe('0,001');
  });

  it.each([
    ['123000', '1,23', 5, 'left'],
    ['0,00045', '4,5', -4, 'right'],
    ['7', '7', 0, 'none'],
    ['384400000', '3,844', 8, 'left'],
    ['0.0000012', '1,2', -6, 'right'],
    ['-0,05', '5', -2, 'right'],
    ['12,50', '1,25', 1, 'left'],
  ])('%s → %s × 10^%i', (raw, mantissa, exponent, direction) => {
    const r = P.scientificNotation(raw);
    expect(r).toMatchObject({ mantissa, exponent, direction, shift: Math.abs(exponent) });
  });

  it('une valeur NÉGATIVE garde son signe dans le LaTeX', () => {
    expect(P.scientificNotation('-0,05').latex).toBe('-0{,}05 = -5 \\times 10^{-2}');
  });

  it('refus', () => {
    expect(P.scientificNotation('0')).toEqual({ error: 'zero' });
    expect(P.scientificNotation('')).toEqual({ error: 'empty' });
    expect(P.scientificNotation('1e5')).toEqual({ error: 'notNumber' });
    expect(P.scientificNotation('1'.repeat(31))).toEqual({ error: 'tooLong' });
  });
});

describe('racines carrées, simplifiées EXACTEMENT', () => {
  it('√72 = √(36 × 2) = 6√2', () => {
    const r = P.simplifySqrt(72);
    expect(r).toMatchObject({ outer: 6, inner: 2, perfect: false, simplified: true, approx: '8,485' });
    expect(r.steps).toEqual(['\\sqrt{72} = \\sqrt{36 \\times 2}', '= \\sqrt{36} \\times \\sqrt{2}', '= 6\\sqrt{2}']);
    expect(r.bounds).toMatchObject({ low: 8, high: 9, lowSquare: 64, highSquare: 81 });
  });

  it('√50 = 5√2, √49 = 7, √1 = 1, √0 = 0', () => {
    expect(P.simplifySqrt(50)).toMatchObject({ outer: 5, inner: 2 });
    expect(P.simplifySqrt(49)).toMatchObject({ outer: 7, inner: 1, perfect: true, latex: '\\sqrt{49} = 7' });
    expect(P.simplifySqrt(1)).toMatchObject({ outer: 1, perfect: true });
    expect(P.simplifySqrt(0)).toMatchObject({ outer: 0, perfect: true });
  });

  it('un premier ne se simplifie pas', () => {
    expect(P.simplifySqrt(7)).toMatchObject({ outer: 1, inner: 7, simplified: false, latex: '\\sqrt{7}', approx: '2,645' });
  });

  it('la valeur approchée est TRONQUÉE, pas un flottant arrondi', () => {
    expect(P.approxSqrt(2, 3)).toBe('1,414');
    expect(P.approxSqrt(99, 3)).toBe('9,949');
  });

  it('refus', () => {
    expect(P.simplifySqrt(-4)).toEqual({ error: 'negative' });
    expect(P.simplifySqrt(2.5)).toEqual({ error: 'notInteger' });
    expect(P.simplifySqrt(P.MAX_ROOT + 1)).toEqual({ error: 'tooLarge' });
  });
});
