import { describe, it, expect } from 'vitest';
import {
  counted,
  PLANK,
  FULL_PLANK,
  CELL,
  EMPTY_CELL,
  TRAVELLER,
  CABIN,
  planksOf,
  fullPlanksOf,
  cellsOf,
  emptyCellsOf,
  travellersOf,
  cabinsOf,
  restOf,
  emptyRestOf,
  ofCells,
} from './counted';

const NOUNS = { PLANK, FULL_PLANK, CELL, EMPTY_CELL, TRAVELLER, CABIN };

describe('counted nouns — the agreement of an Arabic noun with its number', () => {
  it('1 and 2 carry no digit: the noun alone, then the dual', () => {
    expect(planksOf(1)).toBe('لوح واحد');
    expect(planksOf(2)).toBe('لوحان');
    expect(cellsOf(1)).toBe('خانة واحدة');
    expect(cellsOf(2)).toBe('خانتان');
    expect(cabinsOf(1)).toBe('عربة واحدة');
    expect(cabinsOf(2)).toBe('عربتان');
    expect(travellersOf(2)).toBe('مسافران');
    for (const noun of Object.values(NOUNS)) for (const n of [1, 2]) expect(counted(n, noun)).not.toMatch(/\d/);
  });

  it('3 … 10 take the plural, 11 … 99 the singular in نصب, the hundreds the bare singular', () => {
    expect([3, 7, 10].map((n) => planksOf(n))).toEqual(['3 ألواح', '7 ألواح', '10 ألواح']);
    expect([11, 25, 99].map((n) => planksOf(n))).toEqual(['11 لوحًا', '25 لوحًا', '99 لوحًا']);
    expect([100, 200, 1000].map((n) => planksOf(n))).toEqual(['100 لوح', '200 لوح', '1000 لوح']);
    expect([3, 10].map((n) => cellsOf(n))).toEqual(['3 خانات', '10 خانات']);
    expect([11, 52, 100, 864].map((n) => cellsOf(n))).toEqual(['11 خانة', '52 خانة', '100 خانة', '864 خانة']);
    expect([6, 12, 78].map((n) => travellersOf(n))).toEqual(['6 مسافرين', '12 مسافرًا', '78 مسافرًا']);
    expect([9, 10, 11].map((n) => cabinsOf(n))).toEqual(['9 عربات', '10 عربات', '11 عربة']);
  });

  it('above 100 the noun follows the last two digits', () => {
    expect(planksOf(103)).toBe('103 ألواح');
    expect(planksOf(110)).toBe('110 ألواح');
    expect(planksOf(125)).toBe('125 لوحًا');
    expect(planksOf(101)).toBe('101 لوح');
    expect(cellsOf(692)).toBe('692 خانة');
    expect(cellsOf(305)).toBe('305 خانات');
  });

  it('an adjective agrees with its noun, whatever the number', () => {
    expect([1, 2, 7, 25, 100].map((n) => fullPlanksOf(n))).toEqual([
      'لوح واحد كامل',
      'لوحان كاملان',
      '7 ألواح كاملة',
      '25 لوحًا كاملًا',
      '100 لوح كامل',
    ]);
    expect([1, 2, 7, 15].map((n) => emptyCellsOf(n))).toEqual([
      'خانة واحدة فارغة',
      'خانتان فارغتان',
      '7 خانات فارغة',
      '15 خانة فارغة',
    ]);
  });

  it('the case changes 1 and 2 only: an object (نصب), or after a preposition (جرّ)', () => {
    expect(planksOf(1, { acc: true })).toBe('لوحًا واحدًا');
    expect(planksOf(2, { acc: true })).toBe('لوحين');
    expect(planksOf(1, { gen: true })).toBe('لوح واحد');
    expect(planksOf(2, { gen: true })).toBe('لوحين');
    expect(fullPlanksOf(2, { acc: true })).toBe('لوحين كاملين');
    expect(ofCells(2)).toBe('خانتين');
    expect(ofCells(1)).toBe('خانة واحدة');
    expect(cabinsOf(2, { acc: true })).toBe('عربتين');
    for (const n of [3, 10, 11, 99, 100, 250])
      for (const noun of Object.values(NOUNS)) {
        expect(counted(n, noun, { acc: true })).toBe(counted(n, noun));
        expect(counted(n, noun, { gen: true })).toBe(counted(n, noun));
      }
  });

  it('0 has its own words, and what is left is a sentence', () => {
    expect(planksOf(0)).toBe('لا لوح');
    expect(restOf(0)).toBe('لم تبقَ أيّ خانة');
    expect([1, 2, 5, 14].map(restOf)).toEqual(['بقيت خانة واحدة', 'بقيت خانتان', 'بقيت 5 خانات', 'بقيت 14 خانة']);
    expect(emptyRestOf(0)).toBe('لم تبقَ أيّ خانة فارغة');
    expect(emptyRestOf(2)).toBe('بقيت خانتان فارغتان');
  });

  it('never glues a number to a word that does not agree: every form, 0 … 1200', () => {
    for (const [name, noun] of Object.entries(NOUNS))
      for (let n = 0; n <= 1200; n += 1) {
        const s = counted(n, noun);
        expect(s, `${name} ${n}`).not.toMatch(/undefined|NaN/);
        const tail = n % 100;
        const form = n === 0 ? noun.zero : n === 1 ? noun.one : n === 2 ? noun.two : null;
        if (form) expect(s).toBe(form);
        else {
          expect(s.startsWith(`${n} `), `${name} ${n}`).toBe(true);
          const word = s.slice(String(n).length + 1);
          expect(word, `${name} ${n}`).toBe(tail >= 3 && tail <= 10 ? noun.few : tail >= 11 ? noun.many : noun.hundred);
        }
      }
  });
});
