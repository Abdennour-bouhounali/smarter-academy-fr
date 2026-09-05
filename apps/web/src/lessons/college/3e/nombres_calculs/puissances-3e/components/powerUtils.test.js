import { describe, it, expect } from 'vitest';
import {
  pow, expand, tower, towerValue, mergeTowers, splitTowers, repeatTower,
  shiftDecimal, formatShift, commaMove, toScientific, fromScientific,
  isValidMantissa, orderOfMagnitude, magnitudeRatio,
  formatPower, formatExpanded, formatScientific, formatAsFraction, formatDec,
} from './powerUtils';

describe('pow', () => {
  it('calcule les puissances à exposant positif de façon exacte', () => {
    expect(pow(2, 5)).toBe(32);
    expect(pow(3, 4)).toBe(81);
    expect(pow(10, 6)).toBe(1000000);
  });
  it('vaut 1 pour tout exposant 0 — le socle de la tour vide', () => {
    expect(pow(7, 0)).toBe(1);
    expect(pow(10, 0)).toBe(1);
  });
  it('rend une fraction pour un exposant négatif', () => {
    expect(pow(10, -2)).toBe(0.01);
    expect(pow(2, -3)).toBe(0.125);
    expect(pow(5, -1)).toBe(0.2);
  });
});

describe('expand', () => {
  it('donne la liste des facteurs répétés', () => {
    expect(expand(3, 4)).toEqual([3, 3, 3, 3]);
    expect(expand(7, 1)).toEqual([7]);
  });
  it('est vide pour n ≤ 0 — rien à empiler', () => {
    expect(expand(3, 0)).toEqual([]);
    expect(expand(3, -2)).toEqual([]);
  });
});

describe('les trois règles lues sur le compte de blocs', () => {
  it('mergeTowers additionne les exposants (a^m × a^n = a^(m+n))', () => {
    expect(mergeTowers(tower(3, 2), tower(3, 4))).toEqual(tower(3, 6));
    expect(mergeTowers(tower(10, 5), tower(10, -3))).toEqual(tower(10, 2));
    expect(towerValue(mergeTowers(tower(2, 3), tower(2, 2)))).toBe(32);
  });
  it('mergeTowers refuse deux bases différentes', () => {
    expect(mergeTowers(tower(3, 2), tower(5, 2))).toBeNull();
    expect(splitTowers(tower(3, 2), tower(5, 2))).toBeNull();
  });
  it('splitTowers soustrait les exposants (a^m ÷ a^n = a^(m−n))', () => {
    expect(splitTowers(tower(7, 6), tower(7, 4))).toEqual(tower(7, 2));
    expect(splitTowers(tower(10, 2), tower(10, 5))).toEqual(tower(10, -3));
  });
  it('splitTowers d’exposants égaux donne l’exposant 0, donc 1', () => {
    const t = splitTowers(tower(5, 3), tower(5, 3));
    expect(t).toEqual(tower(5, 0));
    expect(towerValue(t)).toBe(1);
  });
  it('repeatTower multiplie les exposants ((a^m)^k = a^(m×k))', () => {
    expect(repeatTower(tower(2, 3), 2)).toEqual(tower(2, 6));
    expect(towerValue(repeatTower(tower(2, 3), 2))).toBe(64);
    expect(repeatTower(tower(10, -2), 3)).toEqual(tower(10, -6));
  });
});

describe('shiftDecimal — la virgule qui glisse', () => {
  it('décale vers la droite pour n > 0', () => {
    expect(shiftDecimal(3.45, 4)).toBe(34500);
    expect(shiftDecimal(3.45, 2)).toBe(345);
    expect(shiftDecimal(1.27, 7)).toBe(12700000);
  });
  it('décale vers la gauche pour n < 0, sans artefact de flottant', () => {
    expect(shiftDecimal(3.45, -3)).toBe(0.00345);
    expect(shiftDecimal(3.45, -4)).toBe(0.000345);
    expect(shiftDecimal(8, -6)).toBe(0.000008);
  });
  it('ne bouge rien pour n = 0 et gère les négatifs', () => {
    expect(shiftDecimal(3.45, 0)).toBe(3.45);
    expect(shiftDecimal(-2.5, 3)).toBe(-2500);
  });
  it('formatShift produit du français (virgule + espace fine)', () => {
    expect(formatShift(3.45, 4)).toBe('34 500');
    expect(formatShift(3.45, -3)).toBe('0,00345');
  });
  it('commaMove dit combien de rangs et dans quel sens', () => {
    expect(commaMove(4)).toEqual({ rangs: 4, sens: 'droite' });
    expect(commaMove(-3)).toEqual({ rangs: 3, sens: 'gauche' });
    expect(commaMove(0)).toEqual({ rangs: 0, sens: 'aucun' });
  });
});

describe('écriture scientifique', () => {
  it('extrait { a, n } avec 1 ≤ a < 10', () => {
    expect(toScientific(34500)).toEqual({ a: 3.45, n: 4 });
    expect(toScientific(0.00038)).toEqual({ a: 3.8, n: -4 });
    expect(toScientific(12700000)).toEqual({ a: 1.27, n: 7 });
    expect(toScientific(1.7)).toEqual({ a: 1.7, n: 0 });
  });
  it('fait l’aller-retour sans perte', () => {
    for (const x of [34500, 0.00038, 12700000, 1.7, 0.000008]) {
      const s = toScientific(x);
      expect(isValidMantissa(s.a)).toBe(true);
      expect(fromScientific(s)).toBe(x);
    }
  });
  it('rejette les mantisses hors [1 ; 10[', () => {
    expect(isValidMantissa(38)).toBe(false);
    expect(isValidMantissa(0.38)).toBe(false);
    expect(isValidMantissa(9.99)).toBe(true);
  });
  it('donne l’ordre de grandeur et le rapport de deux ordres', () => {
    expect(orderOfMagnitude(34500)).toBe(4);
    expect(orderOfMagnitude(0.00345)).toBe(-3);
    expect(magnitudeRatio(1e21, 1.27e7)).toBe(14);
  });
});

describe('affichage', () => {
  it('formate les puissances en LaTeX', () => {
    expect(formatPower(3, 4)).toBe('3^{4}');
    expect(formatPower(10, -2)).toBe('10^{-2}');
    expect(formatExpanded(3, 4)).toBe('3 \\times 3 \\times 3 \\times 3');
    expect(formatExpanded(3, 0)).toBe('1');
    expect(formatAsFraction(10, -3)).toBe('\\frac{1}{10^{3}}');
  });
  it('formate une écriture scientifique avec la virgule LaTeX', () => {
    expect(formatScientific({ a: 3.45, n: -3 })).toBe('3{,}45\\times10^{-3}');
    expect(formatScientific({ a: 1, n: 21 })).toBe('1\\times10^{21}');
  });
  it('re-exporte formatDec, qui émet le moins typographique français', () => {
    expect(formatDec(-2.5)).toBe('−2,5');
  });
});
