import { describe, it, expect } from 'vitest';
import * as E from './euclideanDivision.js';

describe('القسمة الإقليدية', () => {
  it('38 = 7 × 5 + 3, et la condition r < b', () => {
    expect(E.euclideanDivision(38, 7)).toMatchObject({
      q: 5, r: 3, exact: false, check: { product: 35, sum: 38, holds: true, rLessThanB: true },
    });
  });

  it('division exacte, dividende plus petit, dividende nul', () => {
    expect(E.euclideanDivision(24, 6)).toMatchObject({ q: 4, r: 0, exact: true });
    expect(E.euclideanDivision(5, 8)).toMatchObject({ q: 0, r: 5 });
    expect(E.euclideanDivision(0, 4)).toMatchObject({ q: 0, r: 0, exact: true });
  });

  it('b = 0 ou un négatif : pas de division', () => {
    expect(E.euclideanDivision(5, 0)).toBeNull();
    expect(E.euclideanDivision(-5, 2)).toBeNull();
  });
});

describe('le dessin compte EXACTEMENT a unités', () => {
  it.each([[38, 7], [24, 6], [5, 8], [0, 4], [120, 7], [121, 7], [1938, 836], [10000, 3], [9_999_999, 2]])(
    '%i ÷ %i',
    (a, b) => {
      const layout = E.divisionLayout(a, b);
      expect(E.layoutUnitCount(layout)).toBe(a);
      // Les intervalles sont contigus : chaque paquet commence où finit le précédent.
      let cursor = 0;
      for (const group of layout.groups) { expect(group.start).toBe(cursor); cursor += group.size; }
      expect(layout.remainder.start).toBe(cursor);
    },
  );

  it('cubes jusqu’à 120, ruban au-delà, paquets fusionnés au-delà de 200', () => {
    expect(E.divisionLayout(120, 7).kind).toBe('blocks');
    expect(E.divisionLayout(121, 7).kind).toBe('bars');
    expect(E.divisionLayout(1938, 836)).toMatchObject({ kind: 'bars', compressed: false });
    const big = E.divisionLayout(10000, 3);
    expect(big).toMatchObject({ kind: 'bars', compressed: true });
    expect(big.groups).toEqual([{ index: 0, start: 0, size: 9999, count: 3333 }]);
  });

  it('38 ÷ 7 : cinq paquets de 7 et un reste de 3', () => {
    const layout = E.divisionLayout(38, 7);
    expect(layout.groups.map((g) => g.size)).toEqual([7, 7, 7, 7, 7]);
    expect(layout.remainder).toEqual({ start: 35, size: 3 });
  });
});

describe('la saisie refuse avec une RAISON', () => {
  it.each([
    ['17', 'dividend', { value: 17 }],
    ['0', 'dividend', { value: 0 }],
    ['0', 'divisor', { error: 'zeroDivisor' }],
    ['-3', 'dividend', { error: 'negative' }],
    ['2,5', 'divisor', { error: 'notInteger' }],
    ['x', 'divisor', { error: 'notNumber' }],
    ['', 'divisor', { error: 'empty' }],
    ['99999999', 'dividend', { error: 'tooLarge' }],
  ])('%s (%s)', (raw, role, expected) => expect(E.readDivisionOperand(raw, role)).toEqual(expected));
});

describe('les deux lectures', () => {
  it('partage et groupement disent la même division', () => {
    expect(E.divisionReadings(E.euclideanDivision(38, 7))).toEqual({
      sharing: { parts: 7, each: 5, left: 3 },
      grouping: { size: 7, packs: 5, left: 3 },
    });
  });

  it('les exemples et le tirage sont des divisions valides', () => {
    for (const e of E.DIVISION_EXAMPLES) expect(E.euclideanDivision(e.a, e.b)).not.toBeNull();
    for (let i = 0; i < 20; i += 1) {
      const { a, b } = E.randomDivision();
      expect(E.euclideanDivision(a, b)).not.toBeNull();
    }
  });
});
