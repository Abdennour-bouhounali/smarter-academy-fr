import { describe, it, expect } from 'vitest';
import { divmod, differenceSteps, euclidSteps, gcd, isIrreducible } from './divisibility.js';

// Toutes les valeurs ci-dessous sont celles du MANUEL (docs/sources/4am/unit1/extraction.json).
// Un test qui retaperait un autre exemple validerait du code, pas la fidélité au livre.

describe('قاسم عدد طبيعي — activité 1, معارف 1', () => {
  it('420 livres : 28 par étagère tombe juste, 26 non', () => {
    expect(divmod(420, 28)).toEqual({ q: 15, r: 0 });
    expect(divmod(420, 26)).toEqual({ q: 16, r: 4 });
  });
  it('143 = 11 × 13 ; 120 = 6 × 20', () => {
    expect(divmod(143, 11)).toEqual({ q: 13, r: 0 });
    expect(divmod(120, 6)).toEqual({ q: 20, r: 0 });
  });
  it('refuse une division par 0 et des non-naturels', () => {
    expect(divmod(5, 0)).toBeNull();
    expect(divmod(-5, 2)).toBeNull();
  });
});

describe('خوارزمية الفروق المتتابعة — activité 6أ, طريقة p. 13', () => {
  it('117 et 91 : la trace du manuel, jusqu au fruit nul, PGCD = 13', () => {
    const { steps, gcd: g } = differenceSteps(117, 91);
    expect(steps.map((s) => [s.big, s.small, s.diff])).toEqual([
      [117, 91, 26], [91, 26, 65], [65, 26, 39], [39, 26, 13], [26, 13, 13], [13, 13, 0],
    ]);
    expect(g).toBe(13);
  });
  it('252 et 140 → 28 (le manuel imprime « 25 », coquille)', () => {
    const { steps, gcd: g } = differenceSteps(252, 140);
    expect(steps[1]).toEqual({ big: 140, small: 112, diff: 28 });
    expect(g).toBe(28);
  });
  it('378 et 315 → 63', () => {
    expect(differenceSteps(378, 315).gcd).toBe(63);
  });
  it('765 et 135 : « تلزم ثمان خطوات »', () => {
    expect(differenceSteps(765, 135).steps).toHaveLength(8);
  });
  it('exercice 19 : 437/1035 → 23, 3906/7914 → 6, 943/861 → 41, 1111/111111 → 11', () => {
    expect(differenceSteps(437, 1035).gcd).toBe(23);
    expect(differenceSteps(3906, 7914).gcd).toBe(6);
    expect(differenceSteps(943, 861).gcd).toBe(41);
    expect(differenceSteps(1111, 111111).gcd).toBe(11);
  });
  it('coïncide toujours avec Euclide', () => {
    for (const [a, b] of [[21, 14], [45, 18], [252, 140], [936, 845], [5858, 6767]]) {
      expect(differenceSteps(a, b).gcd).toBe(gcd(a, b));
    }
  });  it('48 et 18 : 48 − 18 = 30 ; 30 − 18 = 12 ; 18 − 12 = 6 ; 12 − 6 = 6 ; 6 − 6 = 0', () => {
    const r = differenceSteps(48, 18);
    expect(r.steps.map((s) => [s.big, s.small, s.diff])).toEqual([
      [48, 18, 30], [30, 18, 12], [18, 12, 6], [12, 6, 6], [6, 6, 0],
    ]);
    expect(r).toMatchObject({ gcd: 6, complete: true });
  });
  it('deux nombres égaux : une seule étape, a − a = 0, PGCD = a', () => {
    expect(differenceSteps(13, 13)).toEqual({ steps: [{ big: 13, small: 13, diff: 0 }], gcd: 13, complete: true });
  });
  it('1 et n : n étapes, PGCD = 1', () => {
    const r = differenceSteps(1, 7);
    expect(r.steps).toHaveLength(7);
    expect(r).toMatchObject({ gcd: 1, complete: true });
  });
  it('une trace COUPÉE par maxSteps ne ment pas : complete = false, gcd = null', () => {
    const r = differenceSteps(1000, 1, { maxSteps: 200 });
    expect(r.steps).toHaveLength(200);
    expect(r.complete).toBe(false);
    expect(r.gcd).toBeNull();
    // Coupée juste au fruit nul : complète.
    expect(differenceSteps(1000, 1, { maxSteps: 1000 })).toMatchObject({ gcd: 1, complete: true });
    expect(differenceSteps(1000, 1, { maxSteps: 999 })).toMatchObject({ gcd: null, complete: false });
  });
  it('entrées invalides : pas de trace, pas de PGCD', () => {
    for (const [a, b] of [[0, 5], [5, 0], [-3, 4], [2.5, 1], [NaN, 1]]) {
      expect(differenceSteps(a, b)).toEqual({ steps: [], gcd: null, complete: false });
    }
  });
});

describe('خوارزمية إقليدس — activité 6ب, طريقة p. 13', () => {
  it('1938 et 836 : trois divisions, PGCD = 38', () => {
    const { steps, gcd: g } = euclidSteps(1938, 836);
    expect(steps).toEqual([
      { a: 1938, b: 836, q: 2, r: 266 },
      { a: 836, b: 266, q: 3, r: 38 },
      { a: 266, b: 38, q: 7, r: 0 },
    ]);
    expect(g).toBe(38);
  });
  it('765 et 135 : 3 divisions contre 8 différences, PGCD = 45', () => {
    const { steps, gcd: g } = euclidSteps(765, 135);
    expect(steps.map((s) => s.r)).toEqual([90, 45, 0]);
    expect(g).toBe(45);
    expect(steps.length).toBeLessThan(differenceSteps(765, 135).steps.length);
  });
  it('3356 et 1528 → 4 ; 285 et 45 → 15 ; 21957 et 43351 → 563 ; 19251 et 22816 → 713', () => {
    expect(euclidSteps(3356, 1528).gcd).toBe(4);
    expect(euclidSteps(285, 45).gcd).toBe(15);
    expect(euclidSteps(21957, 43351).gcd).toBe(563);
    expect(euclidSteps(19251, 22816).gcd).toBe(713);
  });
  it('معارف 4 : PGCD(45;18) = PGCD(18;9) = PGCD(9;0) = 9', () => {
    const { steps } = euclidSteps(45, 18);
    expect(steps.map((s) => [s.a, s.b])).toEqual([[45, 18], [18, 9]]);
  });
  it('le défi d ouverture : 936 et 845 → 13 écoles', () => {
    expect(gcd(936, 845)).toBe(13);
    expect(936 / 13).toBe(72);
    expect(845 / 13).toBe(65);
  });
});

describe('اختزال كسر — irréductible', () => {
  it('15/22 déjà irréductible ; 28/42 non', () => {
    expect(isIrreducible(15, 22)).toBe(true);
    expect(isIrreducible(28, 42)).toBe(false);
  });
});
