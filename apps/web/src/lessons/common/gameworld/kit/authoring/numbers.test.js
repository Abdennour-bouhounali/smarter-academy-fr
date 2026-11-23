import { describe, it, expect } from 'vitest';
import {
  CELLS,
  COINS,
  DIVISIONS,
  PLANKS,
  ROWS,
  SUBTRACTIONS,
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
  listFr,
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
  it('LaTeX with two backslashes; a French list « a, b et c »', () => {
    expect(pgcdTex(152, 95)).toBe('\\mathrm{PGCD}(152 ; 95)');
    expect(divTex({ a: 962, b: 296, q: 3, r: 74 })).toBe('962 = 296 \\times 3 + 74');
    expect(divisionTex(962, 296)).toBe('962 = 296 \\times 3 + 74');
    expect(subTex({ x: 259, y: 185, d: 74 })).toBe('259 - 185 = 74');
    expect(listFr([1, 2, 4, 8])).toBe('1, 2, 4 et 8');
    expect(listFr([3, 9])).toBe('3 et 9');
    expect(listFr([7])).toBe('7');
    expect(listFr([])).toBe('');
  });
});

const NB = ' ';

describe('authoring/numbers.js — the French agreement', () => {
  it('0 and 1 take the singular, 2 and more the plural; a no-break space joins the number and its noun', () => {
    expect([0, 1, 2, 3, 10, 11, 100, 101, 1833].map((n) => counted(n, COINS))).toEqual(
      [
        '0 pièce',
        '1 pièce',
        '2 pièces',
        '3 pièces',
        '10 pièces',
        '11 pièces',
        '100 pièces',
        '101 pièces',
        '1\u202f833 pièces',
      ].map((s) => s.replace(' ', NB)),
    );
    expect(counted(3, ['fois', 'fois'])).toBe(`3${NB}fois`);
  });

  it('a whole number of four digits or more takes the narrow no-break space of the thousands (the core’s formatFr)', () => {
    const THIN = '\u202f';
    expect(counted(756, CELLS)).toBe(`756${NB}cases`);
    expect(counted(999, CELLS)).toBe(`999${NB}cases`);
    expect(counted(1400, CELLS)).toBe(`1${THIN}400${NB}cases`);
    expect(counted(2431, PLANKS)).toBe(`2${THIN}431${NB}planches`);
    expect(counted(1234567, COINS)).toBe(`1${THIN}234${THIN}567${NB}pièces`);
    // the agreement is the number's, not the last group's
    expect(counted(1001, CELLS)).toBe(`1${THIN}001${NB}cases`);
    // what is not a whole number is written as it is given
    expect(counted('…', CELLS)).toBe(`…${NB}cases`);
  });

  it('every table of the world agrees with 1 and with 2 and more', () => {
    const forms = (t) => [1, 2, 31].map((n) => counted(n, t).replace(NB, ' '));
    expect(forms(PLANKS)).toEqual(['1 planche', '2 planches', '31 planches']);
    expect(forms(DIVISIONS)).toEqual(['1 division', '2 divisions', '31 divisions']);
    expect(forms(SUBTRACTIONS)).toEqual(['1 soustraction', '2 soustractions', '31 soustractions']);
    expect(forms(ROWS)).toEqual(['1 ligne', '2 lignes', '31 lignes']);
    expect(forms(CELLS)).toEqual(['1 case', '2 cases', '31 cases']);
  });

  it('the sentences of the world: planks, coins left, empty cells, planks that fill', () => {
    const plain = (s) => s.replaceAll(NB, ' ');
    expect([planks(1), planks(2), planks(444)].map(plain)).toEqual(['1 planche', '2 planches', '444 planches']);
    expect([coinsLeft(0), coinsLeft(1), coinsLeft(14)].map(plain)).toEqual([
      'et la bourse est vide',
      'et il reste 1 pièce dans la bourse',
      'et il reste 14 pièces dans la bourse',
    ]);
    expect([0, 1, 2, 28].map(emptyCells).map(plain)).toEqual([
      'il reste 0 case vide',
      'il reste 1 case vide',
      'il reste 2 cases vides',
      'il reste 28 cases vides',
    ]);
    expect([1, 2, 47].map((q) => planksFill(q, 39)).map(plain)).toEqual([
      '1 planche de 39 remplit',
      '2 planches de 39 remplissent',
      '47 planches de 39 remplissent',
    ]);
    expect(plain(planksOf(73, 28))).toBe('73 planches de 28');
  });
});
