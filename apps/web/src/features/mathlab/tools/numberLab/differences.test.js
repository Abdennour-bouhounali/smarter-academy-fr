import { describe, it, expect } from 'vitest';
import { euclidSteps, differenceSteps, gcdByDefinition } from '@smarter-academy/core/arithmetic/divisibility.js';
import * as D from './differences.js';

describe('PGCD بالفوارق المتتالية', () => {
  it('48 et 18 : la trace EXACTE du brief, et le PGCD au fruit nul', () => {
    const run = D.differencesRun(48, 18);
    expect(run.steps.map((s) => D.stepEquation(s))).toEqual([
      '48 − 18 = 30', '30 − 18 = 12', '18 − 12 = 6', '12 − 6 = 6', '6 − 6 = 0',
    ]);
    expect(run.steps.map((s) => s.next)).toEqual([[30, 18], [18, 12], [12, 6], [6, 6], [6, 0]]);
    expect(run).toMatchObject({ gcd: 6, total: 5, truncated: false, divisions: 3 });
  });

  it('765 et 135 : huit étapes (« ثمان خطوات » du manuel)', () => {
    const run = D.differencesRun(765, 135);
    expect(run.steps).toHaveLength(8);
    expect(run.total).toBe(8);
    expect(run.gcd).toBe(45);
  });

  it('deux nombres égaux : une étape, a − a = 0', () => {
    expect(D.differencesRun(13, 13)).toMatchObject({ total: 1, gcd: 13, truncated: false });
  });

  it('1 et n : n étapes, PGCD = 1', () => {
    expect(D.differencesRun(1, 9)).toMatchObject({ total: 9, gcd: 1 });
  });

  it('1000 et 1 : 1000 étapes COMPTÉES, 200 montrées, et AUCUN PGCD inventé', () => {
    const run = D.differencesRun(1000, 1);
    expect(run.total).toBe(1000);
    expect(run.steps).toHaveLength(D.DISPLAY_CAP);
    expect(run.truncated).toBe(true);
    expect(run.gcd).toBeNull();
    expect(run.divisions).toBe(1);
  });

  it('le compte Σq d’Euclide est TOUJOURS le nombre de soustractions', () => {
    for (let a = 1; a <= 60; a += 1) {
      for (let b = 1; b <= 60; b += 1) {
        expect(D.differenceCount(a, b), `${a},${b}`).toBe(differenceSteps(a, b).steps.length);
      }
    }
  });

  it('coïncide avec la définition du PGCD', () => {
    for (const [a, b] of [[84, 36], [117, 91], [252, 140], [936, 845]]) {
      expect(D.differencesRun(a, b).gcd).toBe(gcdByDefinition(a, b));
    }
  });

  it('entrées invalides → null', () => {
    for (const [a, b] of [[0, 3], [3, 0], [-1, 4], [2.5, 1]]) expect(D.differencesRun(a, b)).toBeNull();
  });
});

describe('la comparaison avec Euclide', () => {
  it('765 / 135 : 8 soustractions contre 3 divisions', () => {
    const c = D.compareMethods(765, 135);
    expect(c).toMatchObject({ differences: 8, divisions: 3, gcd: 45 });
    expect(c.euclidSteps).toEqual(euclidSteps(765, 135).steps);
  });

  it('48 / 18 : 5 contre 3', () => {
    expect(D.compareMethods(48, 18)).toMatchObject({ differences: 5, divisions: 3 });
  });
});

describe('les rubans à l’échelle', () => {
  it('la pièce coupée mesure le petit, ce qui reste mesure la différence', () => {
    const g = D.ribbonGeometry({ big: 48, small: 18, diff: 30 }, 48);
    expect(g.big).toBe(1);
    expect(g.cut).toEqual({ from: 0, to: 18 / 48 });
    expect(g.rest.to - g.rest.from).toBeCloseTo(30 / 48);
    expect(g.thin).toBe(false);
  });

  it('un ruban invisible à l’échelle est SIGNALÉ', () => {
    expect(D.ribbonGeometry({ big: 1000, small: 1, diff: 999 }, 1000).thin).toBe(true);
  });
});

describe('la saisie', () => {
  it.each([
    ['48', { value: 48 }], [' ٤٨ ', { value: 48 }], ['', { error: 'empty' }], ['abc', { error: 'notNumber' }],
    ['2,5', { error: 'notInteger' }], ['0', { error: 'notPositive' }], ['-4', { error: 'notPositive' }],
    ['2000000', { error: 'tooLarge' }],
  ])('%s', (raw, expected) => expect(D.readPositiveInteger(raw)).toEqual(expected));
});

describe('les exemples', () => {
  it('chaque exemple a un niveau et un déroulé', () => {
    for (const e of D.DIFFERENCE_EXAMPLES) {
      expect(['beginner', 'intermediate', 'advanced']).toContain(e.level);
      expect(D.differencesRun(e.a, e.b)).not.toBeNull();
    }
  });

  it('le tirage aléatoire donne 4 à 14 soustractions et un PGCD > 1', () => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 50; i += 1) {
      const { a, b } = D.randomDifferencePair(random);
      const count = D.differenceCount(a, b);
      expect(count).toBeGreaterThanOrEqual(4);
      expect(count).toBeLessThanOrEqual(14);
      expect(gcdByDefinition(a, b)).toBeGreaterThan(1);
    }
  });
});
