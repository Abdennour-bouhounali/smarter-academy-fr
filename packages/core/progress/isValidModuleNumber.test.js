import { describe, it, expect } from 'vitest';
import { isValidModuleNumber } from './isValidModuleNumber';

describe('isValidModuleNumber — zéro est un numéro de module', () => {
  // La raison d'être de cette fonction : `if (moduleNumber)` rejetait le
  // module 0 (« أستعدّ »), si bien que sa progression n'était jamais écrite.
  it('accepte 0, le premier module des leçons qui ouvrent sur أستعدّ', () => {
    expect(isValidModuleNumber(0)).toBe(true);
    expect(isValidModuleNumber('0')).toBe(true);
  });

  it('accepte les numéros ordinaires', () => {
    for (const n of [1, 2, 3, 11, 137]) expect(isValidModuleNumber(n)).toBe(true);
    expect(isValidModuleNumber('4')).toBe(true);
  });

  it('refuse une absence de valeur', () => {
    expect(isValidModuleNumber(null)).toBe(false);
    expect(isValidModuleNumber(undefined)).toBe(false);
  });

  it("refuse une chaîne vide, que Number() convertirait en 0", () => {
    expect(isValidModuleNumber('')).toBe(false);
    expect(isValidModuleNumber('   ')).toBe(false);
  });

  it('refuse ce qui n’est pas un entier positif', () => {
    expect(isValidModuleNumber(-1)).toBe(false);
    expect(isValidModuleNumber(1.5)).toBe(false);
    expect(isValidModuleNumber(NaN)).toBe(false);
    expect(isValidModuleNumber(Infinity)).toBe(false);
    expect(isValidModuleNumber('module')).toBe(false);
    expect(isValidModuleNumber({})).toBe(false);
    expect(isValidModuleNumber([])).toBe(false);
  });

  it('refuse un booléen, que Number() convertirait en 0 ou 1', () => {
    expect(isValidModuleNumber(false)).toBe(false);
    expect(isValidModuleNumber(true)).toBe(false);
  });
});
