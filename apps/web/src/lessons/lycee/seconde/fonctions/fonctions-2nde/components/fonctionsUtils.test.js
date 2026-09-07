import { describe, it, expect } from 'vitest';
import {
  interval, inInterval, inDomain, intervalText, domainText, imageOf, curvePieces, antecedentsOf, tableOf,
  boxVolume, boxBase, boxExists, BOX, bestBoxOnGrid, POOL, POOL_RANGE, TARIF, FORFAIT, H7, G, F4, PERIMETRE, imageText,
} from './fonctionsUtils';

describe('intervalles', () => {
  it('appartenance avec bornes ouvertes / fermées / infinies', () => {
    const I = interval(0, 10, { openA: true, openB: true });
    expect(inInterval(I, 0)).toBe(false); expect(inInterval(I, 10)).toBe(false); expect(inInterval(I, 5)).toBe(true);
    expect(inInterval(interval(null, 3), -100)).toBe(true); expect(inInterval(interval(null, 3), 3)).toBe(true);
    expect(inDomain([interval(8, 12), interval(14, 20)], 13)).toBe(false);
    expect(inDomain([interval(8, 12), interval(14, 20)], 12)).toBe(true);
  });
  it('écriture française', () => {
    expect(intervalText(interval(0, 10, { openA: true, openB: true }))).toBe(']0 ; 10[');
    expect(intervalText(interval(8, 12))).toBe('[8 ; 12]');
    expect(intervalText(interval(null, 3))).toBe(']−∞ ; 3]');
    expect(domainText([interval(8, 12), interval(14, 20)])).toBe('[8 ; 12] ∪ [14 ; 20]');
    expect(domainText([interval(null, null)])).toBe('ℝ');
  });
});

describe('la boîte', () => {
  it('volume, base, existence', () => {
    expect(boxVolume(3)).toBe(588); expect(boxVolume(2)).toBe(512); expect(boxVolume(5)).toBe(500);
    expect(boxBase(3)).toBe(14);
    expect(boxExists(0)).toBe(false); expect(boxExists(10)).toBe(false); expect(boxExists(12)).toBe(false); expect(boxExists(0.5)).toBe(true);
  });
  it('imageOf refuse hors domaine ; le maximum sur la grille est en 3,5', () => {
    expect(imageOf(BOX, 12)).toBeNull(); expect(imageOf(BOX, 3)).toBe(588);
    expect(bestBoxOnGrid(0.5)).toEqual({ x: 3.5, v: 591.5 });
    expect(imageText(BOX, 12)).toBe('V(12) n’existe pas');
    expect(imageText(BOX, 3)).toBe('V(3) = 588');
  });
  it('400 cm³ a exactement deux antécédents, 600 aucun, 588 deux (dont 3)', () => {
    const range = { xMin: 0, xMax: 10, yMin: 0, yMax: 600 };
    const xs400 = antecedentsOf(BOX, 400, range);
    expect(xs400.length).toBe(2);
    expect(Math.abs(boxVolume(xs400[0]) - 400)).toBeLessThan(0.01);
    expect(Math.abs(boxVolume(xs400[1]) - 400)).toBeLessThan(0.01);
    expect(antecedentsOf(BOX, 600, range)).toEqual([]);
    const xs588 = antecedentsOf(BOX, 588, range);
    expect(xs588.length).toBe(2);
    expect(xs588.some((x) => Math.abs(x - 3) < 1e-3)).toBe(true);
  });
  it('les morceaux de courbe restent dans le domaine ouvert', () => {
    const pcs = curvePieces(BOX, { xMin: 0, xMax: 10, yMin: 0, yMax: 600 });
    expect(pcs.length).toBe(1);
    expect(pcs[0].every((p) => p.x > 0 && p.x < 10)).toBe(true);
  });
});

describe('la piscine (réunion d’intervalles)', () => {
  it('deux morceaux, un trou sans image', () => {
    expect(curvePieces(POOL, POOL_RANGE).length).toBe(2);
    expect(imageOf(POOL, 10)).toBe(45); expect(imageOf(POOL, 13)).toBeNull(); expect(imageOf(POOL, 16)).toBe(80);
    expect(imageOf(POOL, 12)).toBe(40); expect(imageOf(POOL, 14)).toBe(30);
  });
  it('50 nageurs : quatre fois, 45 : quatre fois, 90 : jamais', () => {
    expect(antecedentsOf(POOL, 50, POOL_RANGE).length).toBe(4);
    expect(antecedentsOf(POOL, 45, POOL_RANGE).length).toBe(4);
    expect(antecedentsOf(POOL, 90, POOL_RANGE)).toEqual([]);
  });
  it('tarif par morceaux', () => {
    expect(imageOf(TARIF, 9)).toBe(3); expect(imageOf(TARIF, 15)).toBe(5); expect(imageOf(TARIF, 13)).toBeNull();
  });
});

describe('les autres fonctions', () => {
  it('g, f, P, forfait, h', () => {
    expect(imageOf(G, 2)).toBe(7); expect(imageOf(G, -1)).toBe(-2);
    expect(tableOf(F4, [-2, 3]).map((r) => r.y)).toEqual([1, 6]);
    expect(imageOf(PERIMETRE, 7)).toBe(24); expect(imageOf(PERIMETRE, 0)).toBeNull();
    expect(imageOf(FORFAIT, 5)).toBe(22); expect(imageOf(FORFAIT, 2)).toBe(10); expect(imageOf(FORFAIT, 11)).toBeNull();
    expect(imageOf(H7, 1)).toBe(3); expect(antecedentsOf(H7, 0, { xMin: -3, xMax: 3, yMin: -6, yMax: 5 })).toEqual([-2, 2]);
  });
});
