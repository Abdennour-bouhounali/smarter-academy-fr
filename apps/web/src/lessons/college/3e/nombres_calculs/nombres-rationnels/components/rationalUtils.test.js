import { describe, it, expect } from 'vitest';
import {
  gcd, lcm, normalize, rat, simplify, isIrreducible, equivalent, compare,
  add, sub, mul, div, inverse, opposite, toDecimal, isDecimal, expandTo,
  commonDivisors, commonDenominator, formatFrac, formatRaw, plainFrac,
  formatDec,
} from './rationalUtils';

describe('gcd / lcm', () => {
  it('calcule le PGCD, toujours positif', () => {
    expect(gcd(24, 36)).toBe(12);
    expect(gcd(-24, 36)).toBe(12);
    expect(gcd(15, 22)).toBe(1);
    expect(gcd(0, 7)).toBe(7);
  });
  it('calcule le PPCM des dénominateurs (2 et 3 → 6, 3 et 4 → 12)', () => {
    expect(lcm(2, 3)).toBe(6);
    expect(lcm(3, 4)).toBe(12);
    expect(lcm(4, 6)).toBe(12);
  });
});

describe('normalize — l’invariant den > 0', () => {
  it('ramène 3/(−4) et −3/4 au MÊME objet', () => {
    expect(normalize(3, -4)).toEqual({ num: -3, den: 4 });
    expect(normalize(-3, 4)).toEqual({ num: -3, den: 4 });
    expect(normalize({ num: 3, den: -4 })).toEqual({ num: -3, den: 4 });
  });
  it('refuse un dénominateur nul', () => {
    expect(() => normalize(3, 0)).toThrow(/Dénominateur nul/);
  });
});

describe('simplify / isIrreducible / commonDivisors', () => {
  it('rend 24/36 irréductible en 2/3', () => {
    expect(simplify(rat(24, 36))).toEqual({ num: 2, den: 3 });
    expect(isIrreducible(rat(24, 36))).toBe(false);
    expect(isIrreducible(rat(2, 3))).toBe(true);
    expect(isIrreducible(rat(15, 22))).toBe(true);
  });
  it('garde le signe au numérateur et ramène 0 à 0/1', () => {
    expect(simplify(rat(-18, 24))).toEqual({ num: -3, den: 4 });
    expect(simplify(rat(6, -8))).toEqual({ num: -3, den: 4 });
    expect(simplify(rat(0, 7))).toEqual({ num: 0, den: 1 });
  });
  it('liste les diviseurs communs > 1 de 24/36', () => {
    expect(commonDivisors(rat(24, 36))).toEqual([2, 3, 4, 6, 12]);
    expect(commonDivisors(rat(15, 22))).toEqual([]);
  });
});

describe('equivalent — même point sur la droite', () => {
  it('3/4, 6/8, 75/100 sont le même nombre', () => {
    expect(equivalent(rat(3, 4), rat(6, 8))).toBe(true);
    expect(equivalent(rat(3, 4), rat(75, 100))).toBe(true);
    expect(equivalent(rat(2, 3), rat(4, 6))).toBe(true);
    expect(equivalent(rat(2, 3), rat(3, 4))).toBe(false);
  });
  it('−3/4 = 3/(−4) : une seule écriture canonique', () => {
    expect(equivalent(rat(-3, 4), rat(3, -4))).toBe(true);
    expect(equivalent(rat(-3, 4), rat(3, 4))).toBe(false);
  });
});

describe('compare — le piège « 1/4 > 1/2 car 4 > 2 »', () => {
  it('1/4 < 1/2, et 2/3 > 3/5', () => {
    expect(compare(rat(1, 4), rat(1, 2))).toBe(-1);
    expect(compare(rat(2, 3), rat(3, 5))).toBe(1);
    expect(compare(rat(3, 4), rat(6, 8))).toBe(0);
  });
  it('ordonne correctement les négatifs : −3/4 < −1/2 < 0', () => {
    expect(compare(rat(-3, 4), rat(-1, 2))).toBe(-1);
    expect(compare(rat(-1, 2), rat(0, 1))).toBe(-1);
    expect(compare(rat(3, -4), rat(-3, 4))).toBe(0);
  });
});

describe('add / sub — le piège « 1/2 + 1/3 = 2/5 »', () => {
  it('1/2 + 1/3 = 5/6, jamais 2/5', () => {
    expect(add(rat(1, 2), rat(1, 3))).toEqual({ num: 5, den: 6 });
    expect(add(rat(1, 2), rat(1, 3))).not.toEqual({ num: 2, den: 5 });
  });
  it('soustrait et simplifie : 3/4 − 1/2 = 1/4 ; 1/3 − 3/4 = −5/12', () => {
    expect(sub(rat(3, 4), rat(1, 2))).toEqual({ num: 1, den: 4 });
    expect(sub(rat(1, 3), rat(3, 4))).toEqual({ num: -5, den: 12 });
    expect(add(rat(2, 5), rat(1, 5))).toEqual({ num: 3, den: 5 });
  });
});

describe('mul / div / inverse — « diviser rend toujours plus petit » est faux', () => {
  it('multiplie et simplifie : 2/3 × 3/4 = 1/2', () => {
    expect(mul(rat(2, 3), rat(3, 4))).toEqual({ num: 1, den: 2 });
    expect(mul(rat(-2, 3), rat(3, 4))).toEqual({ num: -1, den: 2 });
  });
  it('3/2 ÷ 1/4 = 6 : diviser par un nombre < 1 AGRANDIT', () => {
    expect(div(rat(3, 2), rat(1, 4))).toEqual({ num: 6, den: 1 });
    expect(compare(div(rat(3, 2), rat(1, 4)), rat(3, 2))).toBe(1);
  });
  it('inverse et opposé, et refuse la division par zéro', () => {
    expect(inverse(rat(3, 4))).toEqual({ num: 4, den: 3 });
    expect(inverse(rat(-3, 4))).toEqual({ num: -4, den: 3 });
    expect(opposite(rat(3, 4))).toEqual({ num: -3, den: 4 });
    expect(() => div(rat(1, 2), rat(0, 5))).toThrow(/Division par zéro/);
    expect(() => inverse(rat(0, 5))).toThrow(/inverse/);
  });
});

describe('toDecimal / isDecimal', () => {
  it('3/4 vaut 0,75 et s’écrit avec un décimal fini ; 1/3 non', () => {
    expect(toDecimal(rat(3, 4))).toBe(0.75);
    expect(toDecimal(rat(-3, 4))).toBe(-0.75);
    expect(isDecimal(rat(3, 4))).toBe(true);
    expect(isDecimal(rat(1, 3))).toBe(false);
    expect(isDecimal(rat(6, 8))).toBe(true);
  });
  it('formatDec écrit le moins typographique français U+2212', () => {
    expect(formatDec(toDecimal(rat(-3, 4)))).toBe('−0,75');
    expect(formatDec(toDecimal(rat(3, 4)))).toBe('0,75');
  });
});

describe('expandTo / commonDenominator — la même découpe', () => {
  it('re-découpe 1/2 et 1/3 en sixièmes', () => {
    expect(commonDenominator(rat(1, 2), rat(1, 3))).toBe(6);
    expect(expandTo(rat(1, 2), 6)).toEqual({ num: 3, den: 6, factor: 3 });
    expect(expandTo(rat(1, 3), 6)).toEqual({ num: 2, den: 6, factor: 2 });
  });
  it('refuse un dénominateur qui n’est pas un multiple (7 pour des tiers)', () => {
    expect(expandTo(rat(1, 3), 7)).toBeNull();
    expect(expandTo(rat(1, 3), 12)).toEqual({ num: 4, den: 12, factor: 4 });
  });
});

describe('formatFrac / formatRaw / plainFrac', () => {
  it('sort le signe de la fraction en LaTeX', () => {
    expect(formatFrac(rat(3, 4))).toBe('\\frac{3}{4}');
    expect(formatFrac(rat(-3, 4))).toBe('-\\frac{3}{4}');
    expect(formatFrac(rat(3, -4))).toBe('-\\frac{3}{4}');
    expect(formatFrac(rat(4, 1))).toBe('4');
    expect(formatFrac(rat(-4, 1))).toBe('-4');
    // formatFrac écrit ce qui lui est donné : simplifier reste le travail de `simplify`.
    expect(formatFrac(rat(6, 3))).toBe('\\frac{6}{3}');
    expect(formatFrac(simplify(rat(6, 3)))).toBe('2');
  });
  it('formatRaw garde l’écriture non normalisée 3/(−4)', () => {
    expect(formatRaw(3, -4)).toBe('\\frac{3}{(-4)}');
    expect(plainFrac(rat(3, -4))).toBe('-3/4');
    expect(plainFrac(rat(4, 1))).toBe('4');
  });
});

/**
 * GARDE-FOU DU MODULE 7. L'énoncé promet « on ne coupe pas un maillot en deux ».
 * Cette promesse n'a de sens que si le quotient N'EST PAS entier : avec un prix
 * de 12,50 € il tombait sur 24 pile, et l'élève n'avait rien à interpréter —
 * l'énoncé se contredisait. Ces tests empêchent le mensonge de revenir.
 */
describe('module 7 — le quotient DOIT demander une interprétation', () => {
  const BUDGET = 720;
  const TOURNOI = sub(rat(1, 1), add(rat(1, 3), rat(1, 4))); // 5/12
  const PRIX_MAILLOT = rat(65, 2); // 32,50 €
  const exact = toDecimal(div(mul(TOURNOI, rat(BUDGET, 1)), PRIX_MAILLOT));

  it('la part du tournoi vaut 5/12, soit 300 €', () => {
    expect(plainFrac(TOURNOI)).toBe('5/12');
    expect(toDecimal(mul(TOURNOI, rat(BUDGET, 1)))).toBe(300);
  });

  it('le quotient n’est PAS entier — sinon il n’y a rien à interpréter', () => {
    expect(Number.isInteger(exact)).toBe(false);
  });

  it('la réponse est 9 maillots, et il reste 7,50 €', () => {
    expect(Math.floor(exact)).toBe(9);
    expect(300 - 9 * toDecimal(PRIX_MAILLOT)).toBeCloseTo(7.5, 6);
  });

  it('dix maillots dépasseraient le budget — c’est ce qui impose d’arrondir vers le BAS', () => {
    expect(10 * toDecimal(PRIX_MAILLOT)).toBeGreaterThan(300);
  });
});
