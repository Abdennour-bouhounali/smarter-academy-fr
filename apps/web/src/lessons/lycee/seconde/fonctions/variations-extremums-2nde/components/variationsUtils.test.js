import { describe, it, expect } from 'vitest';
import { TRAIL, PARAB, BOSSE, ENCLOS, imageOf, variationOn, variationTable, monotonyIntervals, maxOn, minOn, compareByTable, curvePieces, TRAIL_RANGE } from './variationsUtils';

describe('le sentier', () => {
  it('passe par ses sommets et ses vallées', () => {
    expect(imageOf(TRAIL, 0)).toBe(300); expect(imageOf(TRAIL, 3)).toBe(620); expect(imageOf(TRAIL, 6)).toBe(380); expect(imageOf(TRAIL, 8.5)).toBe(560); expect(imageOf(TRAIL, 10)).toBe(420);
    expect(imageOf(TRAIL, 11)).toBeNull();
  });
  it('tableau de variations : ↗ ↘ ↗ ↘', () => {
    const t = variationTable(TRAIL);
    expect(t.bounds.map((b) => b.x)).toEqual([0, 3, 6, 8.5, 10]);
    expect(t.arrows).toEqual(['croissante', 'decroissante', 'croissante', 'decroissante']);
    expect(variationOn(TRAIL, 1, 5)).toBeNull();
  });
  it('extremums sur le domaine et sur un sous-intervalle', () => {
    expect(maxOn(TRAIL)).toEqual({ value: 620, at: [3] });
    expect(minOn(TRAIL)).toEqual({ value: 300, at: [0] });
    expect(maxOn(TRAIL, 4, 10)).toEqual({ value: 560, at: [4, 8.5] });   // h(4) = 560 aussi : atteint deux fois
    expect(maxOn(TRAIL, 5, 10)).toEqual({ value: 560, at: [8.5] });
    expect(minOn(TRAIL, 5, 10)).toEqual({ value: 380, at: [6] });
  });
  it('comparer par le tableau', () => {
    expect(compareByTable(TRAIL, 1, 2)).toBe('<');      // croissante sur [0 ; 3]
    expect(compareByTable(TRAIL, 4, 5)).toBe('>');      // décroissante sur [3 ; 6]
    expect(compareByTable(TRAIL, 2, 5)).toBe('indetermine');
    expect(compareByTable(TRAIL, 5, 4)).toBe('<');
  });
  it('la courbe est dans le cadre', () => {
    const pcs = curvePieces(TRAIL, TRAIL_RANGE); expect(pcs.length).toBe(1); expect(pcs[0].every((p) => p.y >= 0 && p.y <= 700)).toBe(true);
  });
});
describe('les autres fonctions', () => {
  it('parabole : minimum −2 en 1, décroissante puis croissante', () => {
    expect(variationTable(PARAB).arrows).toEqual(['decroissante', 'croissante']); expect(minOn(PARAB)).toEqual({ value: -2, at: [1] }); expect(maxOn(PARAB)).toEqual({ value: 6, at: [-3] });
  });
  it('bosse : ↗ ↘ ↗, extremums locaux en −2 et 2', () => {
    expect(variationTable(BOSSE).arrows).toEqual(['croissante', 'decroissante', 'croissante']);
    expect(imageOf(BOSSE, -2)).toBe(4); expect(imageOf(BOSSE, 2)).toBe(-4);
    expect(maxOn(BOSSE)).toEqual({ value: 4, at: [-2, 4] });   // atteint deux fois
    expect(compareByTable(BOSSE, -1, 1)).toBe('>');
    expect(compareByTable(BOSSE, -3, 3)).toBe('indetermine');
  });
  it('enclos : aire maximale 100 pour x = 10', () => {
    expect(maxOn(ENCLOS)).toEqual({ value: 100, at: [10] }); expect(monotonyIntervals(ENCLOS).map((i) => i.direction)).toEqual(['croissante', 'decroissante']);
    expect(imageOf(ENCLOS, 5)).toBe(75); expect(imageOf(ENCLOS, 15)).toBe(75);
  });
});
