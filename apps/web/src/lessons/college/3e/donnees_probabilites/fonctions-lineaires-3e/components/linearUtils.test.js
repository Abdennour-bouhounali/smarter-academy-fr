import { describe, it, expect } from 'vitest';
import {
  image, antecedent, coefficientFromPair, tableOf, ratios, isProportionalTable,
  coefficientFromTable, doublingHolds, passesThroughOrigin,
  percentChange, coefficientFromPercent, formatLinear, describeCoefficient,
  priceWithFixed,
} from './linearUtils';

describe('image et antécédent', () => {
  it('calcule ax', () => {
    expect(image(2.5, 4)).toBe(10);
    expect(image(-3, 2)).toBe(-6);
    expect(image(2.5, 0)).toBe(0);
  });

  it('remonte à l’antécédent', () => {
    expect(antecedent(2.5, 10)).toBe(4);
    expect(antecedent(-3, 6)).toBe(-2);
  });

  it('a = 0 : aucun antécédent, ou tous', () => {
    expect(antecedent(0, 5)).toBeNull();
    expect(antecedent(0, 0)).toBe(Infinity);
  });
});

describe('coefficientFromPair — le coefficient de proportionnalité', () => {
  it('se lit en divisant y par x', () => {
    expect(coefficientFromPair(4, 10)).toBe(2.5);
    expect(coefficientFromPair(3, 7.5)).toBe(2.5);
  });

  it('le point (0 ; 0) ne détermine AUCUNE fonction linéaire', () => {
    // Le piège classique : il appartient à toutes les droites linéaires.
    expect(coefficientFromPair(0, 0)).toBeNull();
    expect(coefficientFromPair(0, 5)).toBeNull();
  });

  it('un coefficient retrouvé redonne bien le point de départ', () => {
    const a = coefficientFromPair(6, 15);
    expect(image(a, 6)).toBe(15);
  });
});

describe('tableau et proportionnalité', () => {
  it('les rapports d’un tableau linéaire sont tous égaux', () => {
    expect(ratios(tableOf(3, [1, 2, 5]))).toEqual([3, 3, 3]);
    expect(isProportionalTable(tableOf(3, [1, 2, 5]))).toBe(true);
  });

  it('un tableau non proportionnel est refusé', () => {
    const rows = [{ x: 1, y: 3 }, { x: 2, y: 7 }, { x: 3, y: 9 }];
    expect(isProportionalTable(rows)).toBe(false);
    expect(coefficientFromTable(rows)).toBeNull();
  });

  it('une valeur non nulle en x = 0 casse la proportionnalité', () => {
    // C'est le cas d'une fonction affine : 0 ne donne pas 0.
    expect(isProportionalTable([{ x: 0, y: 2 }, { x: 1, y: 5 }, { x: 2, y: 8 }])).toBe(false);
  });

  it('la colonne x = 0 d’un tableau linéaire ne gêne pas', () => {
    expect(isProportionalTable(tableOf(4, [0, 1, 3]))).toBe(true);
    expect(coefficientFromTable(tableOf(4, [0, 1, 3]))).toBe(4);
  });
});

describe('les deux invariants qui se voient', () => {
  it('doubler x double f(x), pour tout coefficient', () => {
    for (const a of [0.5, 2, -3, 7.25]) {
      for (const x of [1, 4, -2]) expect(doublingHolds(a, x)).toBe(true);
    }
  });

  it('la droite passe toujours par l’origine', () => {
    for (const a of [0.5, 2, -3]) expect(passesThroughOrigin(a)).toBe(true);
  });
});

describe('pourcentages — une évolution EST une fonction linéaire', () => {
  it('traduit un coefficient en pourcentage', () => {
    expect(percentChange(1.2)).toBe(20);
    expect(percentChange(0.75)).toBe(-25);
    expect(percentChange(1)).toBe(0);
  });

  it('et réciproquement', () => {
    expect(coefficientFromPercent(20)).toBe(1.2);
    expect(coefficientFromPercent(-25)).toBe(0.75);
    expect(percentChange(coefficientFromPercent(35))).toBeCloseTo(35, 9);
  });
});

describe('formatLinear', () => {
  it('simplifie les coefficients 1, −1 et 0', () => {
    expect(formatLinear(1)).toBe('f(x) = x');
    expect(formatLinear(-1)).toBe('f(x) = −x');
    expect(formatLinear(0)).toBe('f(x) = 0');
  });

  it('écrit les décimaux à la française et jamais avec un tiret ASCII', () => {
    expect(formatLinear(2.5)).toBe('f(x) = 2{,}5x');
    expect(formatLinear(-4)).toBe('f(x) = −4x');
    expect(formatLinear(-4)).not.toContain('-');
  });

  it('accepte un autre nom et une autre variable', () => {
    expect(formatLinear(3, { name: 'p', variable: 'm' })).toBe('p(m) = 3m');
    expect(formatLinear(3, { withName: false })).toBe('3x');
  });

  it('décrit le coefficient en toutes lettres', () => {
    expect(describeCoefficient(2.5, { per: 'kilo', unit: ' €' })).toBe('2,5 € par kilo');
  });
});

describe('priceWithFixed — la barquette casse la proportionnalité', () => {
  it('sans part fixe, c’est image(a, x)', () => {
    expect(priceWithFixed(4, 2.5)).toBe(image(4, 2.5));
    expect(priceWithFixed(4, 0)).toBe(0);
  });
  it('avec une part fixe, 0 ne donne plus 0 et le tableau n’est plus proportionnel', () => {
    expect(priceWithFixed(4, 0, 1)).toBe(1);
    const rows = [0, 1, 2].map((x) => ({ x, y: priceWithFixed(4, x, 1) }));
    expect(isProportionalTable(rows)).toBe(false);
    const rows0 = [0, 1, 2].map((x) => ({ x, y: priceWithFixed(4, x, 0) }));
    expect(isProportionalTable(rows0)).toBe(true);
  });
});
