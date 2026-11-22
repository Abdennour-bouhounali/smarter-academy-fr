import { describe, it, expect } from 'vitest';
import {
  COINS,
  DIVISIONS,
  DIVISIONS_GEN,
  PLANKS,
  PLANKS_ACC,
  ROWS,
  ROWS_ACC,
  SUBTRACTIONS,
  SUBTRACTIONS_GEN,
  coinsLeft,
  commonDivisors,
  counted,
  differences,
  divTex,
  divisionTex,
  divisorsOf,
  emptyCells,
  euclid,
  gcd,
  listAr,
  ltr,
  pgcdTex,
  planks,
  planksFill,
  planksOf,
  range,
  roadOf,
  subTex,
} from './numbers';

/** The PGCD by listing, independent of Euclid. */
const byListing = (a, b) => Math.max(...range(1, Math.max(a, b)).filter((d) => a % d === 0 && b % d === 0));

describe('authoring/numbers.js — the arithmetic', () => {
  it('the PGCD, the divisors, the common divisors agree with a listing', () => {
    for (let a = 1; a <= 90; a += 1)
      for (let b = 1; b <= 90; b += 1) {
        expect(gcd(a, b)).toBe(byListing(a, b));
        expect(commonDivisors(a, b)).toEqual(divisorsOf(gcd(a, b)));
      }
    expect(gcd(27, 0)).toBe(27);
    expect(divisorsOf(12)).toEqual([1, 2, 3, 4, 6, 12]);
    expect(range(3, 1)).toEqual([]);
  });

  it('the two algorithms end on the PGCD; the subtractions are the quotients of the divisions, summed', () => {
    for (let a = 1; a <= 120; a += 1)
      for (let b = 1; b <= 60; b += 1) {
        const E = euclid(a, b);
        const D = differences(a, b);
        expect(E.at(-1).r).toBe(0);
        expect(E.at(-1).b).toBe(gcd(a, b));
        expect(D.at(-1).d).toBe(0);
        expect(D.at(-1).y).toBe(gcd(a, b));
        expect(D).toHaveLength(E.reduce((n, s) => n + s.q, 0));
        for (const s of E) expect(s.b * s.q + s.r).toBe(s.a);
      }
    expect(euclid(1833, 546).map((s) => [s.q, s.r])).toEqual([
      [3, 195],
      [2, 156],
      [1, 39],
      [4, 0],
    ]);
  });

  it('a convoy: what a plank does gap after gap', () => {
    expect(roadOf([152, 95, 57], Infinity, 8)).toEqual([
      { a: 152, did: 'fills' },
      { a: 95, did: 'open' },
    ]);
    expect(roadOf([259, 185], 12, 1)).toEqual([{ a: 259, did: 'coins' }]);
    expect(roadOf([259, 185], 12, 37, (a) => a === 259)).toEqual([{ a: 259, did: 'fills' }]);
  });
});

describe('authoring/numbers.js — the formulas and the sentence', () => {
  it('LaTeX with two backslashes; a list with a no-break space before its comma; an isolated equality', () => {
    expect(pgcdTex(152, 95)).toBe('\\mathrm{PGCD}(152 ; 95)');
    expect(divTex({ a: 962, b: 296, q: 3, r: 74 })).toBe('962 = 296 \\times 3 + 74');
    expect(divisionTex(962, 296)).toBe('962 = 296 \\times 3 + 74');
    expect(subTex({ x: 259, y: 185, d: 74 })).toBe('259 - 185 = 74');
    expect(listAr([1, 2, 4])).toBe('1\u00a0، 2\u00a0، 4');
    expect(ltr('7 + 5 = 12')).toBe('\u20667 + 5 = 12\u2069');
  });
});

describe('authoring/numbers.js — the Arabic agreement', () => {
  it('one, two, three to ten, eleven and more; past 100 the last two digits decide', () => {
    expect([1, 2, 3, 10, 11, 99].map((n) => counted(n, COINS))).toEqual([
      'قطعة واحدة',
      'قطعتان',
      '3 قطع',
      '10 قطع',
      '11 قطعة',
      '99 قطعة',
    ]);
    expect([100, 101, 103, 110, 111, 1003, 1833].map((n) => counted(n, ROWS))).toEqual([
      '100 سطر',
      '101 سطر',
      '103 أسطر',
      '110 أسطر',
      '111 سطرًا',
      '1003 أسطر',
      '1833 سطرًا',
    ]);
    // a table without a fifth form keeps its fourth for a round hundred
    expect(counted(200, COINS)).toBe('200 قطعة');
  });

  it('every table of the world agrees with 1, 2, 3–10 and 11+', () => {
    const forms = (t) => [1, 2, 5, 31].map((n) => counted(n, t));
    expect(forms(PLANKS)).toEqual(['لوح واحد', 'لوحان', '5 ألواح', '31 لوحًا']);
    expect(forms(PLANKS_ACC)).toEqual(['لوحًا واحدًا', 'لوحين', '5 ألواح', '31 لوحًا']);
    expect(forms(DIVISIONS)).toEqual(['قسمة واحدة', 'قسمتان', '5 قسمات', '31 قسمة']);
    expect(forms(DIVISIONS_GEN)).toEqual(['قسمة واحدة', 'قسمتين', '5 قسمات', '31 قسمة']);
    expect(forms(SUBTRACTIONS)).toEqual(['عملية طرح واحدة', 'عمليتا طرح', '5 عمليات طرح', '31 عملية طرح']);
    expect(forms(SUBTRACTIONS_GEN)).toEqual(['عملية طرح واحدة', 'عمليتي طرح', '5 عمليات طرح', '31 عملية طرح']);
    expect(forms(ROWS_ACC)).toEqual(['سطرًا واحدًا', 'سطرين', '5 أسطر', '31 سطرًا']);
  });

  it('the sentences of the world: planks, coins left, empty cells, planks that fill', () => {
    expect([planks(1), planks(2), planks(12), planks(444)]).toEqual(['لوح واحد', 'لوحان', '12 لوحًا', '444 لوحًا']);
    expect([coinsLeft(0), coinsLeft(2), coinsLeft(14)]).toEqual([
      'ولم يبقَ في الكيس شيء',
      'وبقيت في الكيس قطعتان',
      'وبقيت في الكيس 14 قطعة',
    ]);
    expect([1, 2, 6, 28].map(emptyCells)).toEqual([
      'بقيت خانة واحدة فارغة',
      'بقيت خانتان فارغتان',
      'بقيت 6 خانات فارغة',
      'بقيت 28 خانة فارغة',
    ]);
    expect([1, 2, 4, 47].map((q) => planksFill(q, 39))).toEqual([
      'لوح واحد طوله 39 يملأ',
      'لوحان طولهما 39 يملآن',
      '4 ألواح طولها 39 تملأ',
      '47 لوحًا طولها 39 تملأ',
    ]);
    expect(planksOf(73, 28)).toBe('73 لوحًا طولها 28');
  });
});
