import { describe, it, expect } from 'vitest';
import {
  divmod, isDivisor, divisionTestBound, factorPairs, divisors, commonDivisors,
  gcdByDefinition, differenceSteps, differenceStepCount, euclidSteps, areCoprime,
  gcd, isIrreducible, reduceByCommonDivisor, reducePath, reduceFraction,
  euclidStepTex, differenceStepTex, pgcdEqualityTex, reductionStepTex,
} from './divisibility.js';

// Toutes les valeurs ci-dessous sont celles du MANUEL (docs/sources/4am/unit1/extraction.json).
// Un test qui retaperait un autre exemple validerait du code, pas la fidélité au livre.

describe('قاسم عدد طبيعي — activité 1, معارف 1', () => {
  it('420 livres : 28 par étagère tombe juste, 26 non', () => {
    expect(divmod(420, 28)).toEqual({ q: 15, r: 0 });
    expect(divmod(420, 26)).toEqual({ q: 16, r: 4 });
    expect(isDivisor(28, 420)).toBe(true);
    expect(isDivisor(26, 420)).toBe(false);
  });
  it('143 = 11 × 13 ; 120 = 6 × 20', () => {
    expect(divmod(143, 11)).toEqual({ q: 13, r: 0 });
    expect(divmod(120, 6)).toEqual({ q: 20, r: 0 });
  });
  it('refuse une division par 0 et des non-naturels', () => {
    expect(divmod(5, 0)).toBeNull();
    expect(divmod(-5, 2)).toBeNull();
    expect(isDivisor(0, 12)).toBe(false);
  });
});

describe('قواسم عدد طبيعي — activité 2, طريقة p. 11', () => {
  it('60 par couples de facteurs', () => {
    expect(factorPairs(60)).toEqual([[1, 60], [2, 30], [3, 20], [4, 15], [5, 12], [6, 10]]);
    expect(divisors(60)).toEqual([1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60]);
  });
  it('48 et 17', () => {
    expect(divisors(48)).toEqual([1, 2, 3, 4, 6, 8, 12, 16, 24, 48]);
    expect(divisors(17)).toEqual([1, 17]);
  });
  it('105 : on teste jusqu à 10 (10² ≤ 105 < 11²) et on trouve 8 diviseurs', () => {
    expect(divisionTestBound(105)).toBe(10);
    expect(factorPairs(105)).toEqual([[1, 105], [3, 35], [5, 21], [7, 15]]);
    expect(divisors(105)).toEqual([1, 3, 5, 7, 15, 21, 35, 105]);
  });
  it('un carré parfait ne duplique pas sa racine (121 → 1, 11, 121)', () => {
    expect(divisors(121)).toEqual([1, 11, 121]);
  });
  it('exercices 3 et 4 : 84, 910, 1000, 55', () => {
    expect(divisors(84)).toEqual([1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84]);
    expect(divisors(910)).toHaveLength(16);
    expect(divisors(1000)).toHaveLength(16);
    expect(divisors(55)).toEqual([1, 5, 11, 55]);
  });
});

describe('القواسم المشتركة والقاسم المشترك الأكبر — activités 4, 5 ; معارف 3, 4', () => {
  it('12 et 18 → 1, 2, 3, 6', () => {
    expect(commonDivisors(12, 18)).toEqual([1, 2, 3, 6]);
  });
  it('90 et 54 → 18 bouquets', () => {
    expect(commonDivisors(90, 54)).toContain(9);
    expect(gcdByDefinition(90, 54)).toBe(18);
  });
  it('42 et 60 → 6', () => {
    expect(commonDivisors(42, 60)).toEqual([1, 2, 3, 6]);
    expect(gcdByDefinition(42, 60)).toBe(6);
  });
  it('28 et 42 → communs 1, 2, 7, 14 = diviseurs de 14', () => {
    expect(commonDivisors(28, 42)).toEqual([1, 2, 7, 14]);
    expect(commonDivisors(28, 42)).toEqual(divisors(14));
    expect(gcdByDefinition(28, 42)).toBe(14);
  });
  it('نتائج مباشرة : PGCD(28;28)=28, PGCD(7;0)=7, PGCD(40;8)=8, PGCD(8;40)=8', () => {
    expect(gcdByDefinition(28, 28)).toBe(28);
    expect(gcdByDefinition(7, 0)).toBe(7);
    expect(gcdByDefinition(40, 8)).toBe(8);
    expect(gcdByDefinition(8, 40)).toBe(8);
  });
  it('دوري الآن p. 11 : 65 et 78 → 1, 13', () => {
    expect(commonDivisors(65, 78)).toEqual([1, 13]);
  });
});

describe('خوارزمية الفروق المتتابعة — activité 6أ, طريقة p. 13', () => {
  it('117 et 91 : la trace du manuel, jusqu au fruit nul, PGCD = 13', () => {
    const { steps, gcd: g } = differenceSteps(117, 91);
    expect(steps.map((s) => [s.big, s.small, s.diff])).toEqual([
      [117, 91, 26], [91, 26, 65], [65, 26, 39], [39, 26, 13], [26, 13, 13], [13, 13, 0],
    ]);
    expect(g).toBe(13);
    expect(differenceStepTex(steps[0])).toBe('117 - 91 = 26');
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
    expect(differenceStepCount(765, 135)).toBe(8);
  });
  it('exercice 19 : 437/1035 → 23, 3906/7914 → 6, 943/861 → 41, 1111/111111 → 11', () => {
    expect(differenceSteps(437, 1035).gcd).toBe(23);
    expect(differenceSteps(3906, 7914).gcd).toBe(6);
    expect(differenceSteps(943, 861).gcd).toBe(41);
    expect(differenceSteps(1111, 111111).gcd).toBe(11);
  });
  it('coïncide toujours avec la définition', () => {
    for (const [a, b] of [[21, 14], [45, 18], [252, 140], [936, 845], [5858, 6767]]) {
      expect(differenceSteps(a, b).gcd).toBe(gcdByDefinition(a, b));
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
    expect(euclidStepTex(steps[0])).toBe('1938 = 836 \\times 2 + 266');
  });
  it('765 et 135 : 3 divisions contre 8 différences, PGCD = 45', () => {
    const { steps, gcd: g } = euclidSteps(765, 135);
    expect(steps.map((s) => s.r)).toEqual([90, 45, 0]);
    expect(g).toBe(45);
    expect(steps.length).toBeLessThan(differenceStepCount(765, 135));
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
    expect(pgcdEqualityTex(45, 18, 18, 9)).toBe('\\mathrm{PGCD}(45\\ ;\\ 18) = \\mathrm{PGCD}(18\\ ;\\ 9)');
  });
  it('le défi d ouverture : 936 et 845 → 13 écoles', () => {
    expect(gcd(936, 845)).toBe(13);
    expect(936 / 13).toBe(72);
    expect(845 / 13).toBe(65);
  });
});

describe('العددان الأوليان فيما بينهما — activité 7, معارف 5, exercices 23–27, 39', () => {
  it('17 et 18, 22 et 35, 15 et 22 sont premiers entre eux ; 27 et 36 non', () => {
    expect(areCoprime(17, 18)).toBe(true);
    expect(areCoprime(22, 35)).toBe(true);
    expect(areCoprime(15, 22)).toBe(true);
    expect(areCoprime(27, 36)).toBe(false);
    expect(gcdByDefinition(27, 36)).toBe(9);
  });
  it('143/153, 104/147, 56/65, 23/29 : oui ; 253/407 : non (PGCD 11)', () => {
    expect(areCoprime(143, 153)).toBe(true);
    expect(areCoprime(104, 147)).toBe(true);
    expect(areCoprime(56, 65)).toBe(true);
    expect(areCoprime(23, 29)).toBe(true);
    expect(gcd(253, 407)).toBe(11);
  });
});

describe('اختزال كسر — activité 8, معارف 6, طريقة p. 13', () => {
  it('le chemin de سمير : 84/48 ÷4 → 21/12 ÷3 → 7/4, irréductible', () => {
    const { path, ok, irreducible } = reducePath(84, 48, [4, 3]);
    expect(ok).toBe(true);
    expect(path.map((p) => [p.n, p.d])).toEqual([[84, 48], [21, 12], [7, 4]]);
    expect(irreducible).toBe(true);
    expect(reductionStepTex(84, 48, 4)).toBe('\\dfrac{84}{48} = \\dfrac{84 \\div 4}{48 \\div 4} = \\dfrac{21}{12}');
  });
  it('un diviseur qui ne divise pas les deux arrête le chemin', () => {
    expect(reduceByCommonDivisor(21, 12, 2)).toBeNull();
    expect(reducePath(21, 12, [2]).ok).toBe(false);
  });
  it('en une fois par le PGCD : 84/48 → 7/4 (PGCD 12), 28/42 → 2/3 (14), 595/560 → 17/16 (35)', () => {
    expect(reduceFraction(84, 48)).toMatchObject({ n: 7, d: 4, gcd: 12 });
    expect(reduceFraction(28, 42)).toMatchObject({ n: 2, d: 3, gcd: 14 });
    const r = reduceFraction(595, 560);
    expect(r).toMatchObject({ n: 17, d: 16, gcd: 35 });
    expect(r.euclid.map((s) => s.r)).toEqual([35, 0]);
  });
  it('188/252 → 47/63 ; 915/372 → 305/124 ; 15/22 déjà irréductible', () => {
    expect(reduceFraction(188, 252)).toMatchObject({ n: 47, d: 63, gcd: 4 });
    expect(reduceFraction(915, 372)).toMatchObject({ n: 305, d: 124, gcd: 3 });
    expect(isIrreducible(15, 22)).toBe(true);
    expect(isIrreducible(28, 42)).toBe(false);
  });
  it('exercice 28', () => {
    const cases = [[529, 69, 23, 3], [91, 28, 13, 4], [707, 909, 7, 9], [1111, 1919, 11, 19],
      [20418, 12190, 10209, 6095], [42354, 10080, 2353, 560], [312054, 21870, 52009, 3645]];
    for (const [n, d, rn, rd] of cases) expect(reduceFraction(n, d)).toMatchObject({ n: rn, d: rd });
  });
  it('exercices 34–40', () => {
    expect(reduceFraction(1005, 315)).toMatchObject({ n: 67, d: 21, gcd: 15 });
    expect(reduceFraction(441, 210)).toMatchObject({ n: 21, d: 10, gcd: 21 });
    expect(reduceFraction(496, 806)).toMatchObject({ n: 8, d: 13, gcd: 62 });
    expect(reduceFraction(45, 162)).toMatchObject({ n: 5, d: 18, gcd: 9 });
    expect(reduceFraction(5175, 3825)).toMatchObject({ n: 23, d: 17, gcd: 225 });
    expect(reduceFraction(22816, 19251)).toMatchObject({ n: 32, d: 27, gcd: 713 });
  });
});
