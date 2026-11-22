import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  RANK_NAMES, digitsByRank, countOfRank, valueOfCounts, isWritable, decompose, classesOf, spaced, toArabicWords, classWordsOf,
} from './placeValue.js';

const extraction = JSON.parse(readFileSync(new URL('../../../docs/sources/1am/unit1/extraction.json', import.meta.url), 'utf8'));
const el = (id) => extraction.elements.find((e) => e.id === id);
const num = (s) => Number(String(s).replace(/\s/g, ''));

describe('placeValue — rangs, comptes, valeur', () => {
  it('digitsByRank and countOfRank tell « رقم » from « عدد » (2017: 1 and 201)', () => {
    expect(digitsByRank(2017)).toEqual({ 0: 7, 1: 1, 2: 0, 3: 2 });
    expect(digitsByRank(0)).toEqual({ 0: 0 });
    expect(countOfRank(2017, 1)).toBe(201);
    expect(countOfRank(2017, 0)).toBe(2017);
    expect(countOfRank(2017, 2)).toBe(20);
    expect(countOfRank(2017, 3)).toBe(2);
    expect(countOfRank(3005, 1)).toBe(300);
    expect(countOfRank(1345, 2)).toBe(13);
  });

  it('valueOfCounts accepts any counts; isWritable only 0..9 per rank', () => {
    const start = { 3: 1, 2: 13, 1: 24, 0: 37 };
    expect(valueOfCounts(start)).toBe(2577);
    expect(isWritable(start)).toBe(false);
    expect(isWritable({ 3: 2, 2: 5, 1: 7, 0: 7 })).toBe(true);
    expect(valueOfCounts({})).toBe(0);
    expect(() => valueOfCounts({ 0: -1 })).toThrow(RangeError);
    for (let n = 0; n < 5000; n += 7) expect(valueOfCounts(digitsByRank(n))).toBe(n);
  });

  it('decompose: the non-zero ranks from the highest', () => {
    expect(decompose(6392)).toEqual([
      { digit: 6, rank: 3, value: 1000 }, { digit: 3, rank: 2, value: 100 }, { digit: 9, rank: 1, value: 10 }, { digit: 2, rank: 0, value: 1 },
    ]);
    expect(decompose(2017).map((t) => t.rank)).toEqual([3, 1, 0]);
    expect(decompose(0)).toEqual([]);
  });

  it('classesOf / spaced group by three from the RIGHT with U+00A0', () => {
    expect(classesOf(4908732)).toEqual(['4', '908', '732']);
    expect(classesOf(45671)).toEqual(['45', '671']);
    expect(classesOf(999)).toEqual(['999']);
    expect(spaced(4908732)).toBe('4 908 732');
    expect(spaced(1000)).toBe('1 000');
  });

  it('RANK_NAMES are the ten ranks of the جدول المراتب', () => {
    expect(RANK_NAMES).toHaveLength(10);
    expect(RANK_NAMES[0]).toBe('الآحاد');
    expect(RANK_NAMES[3]).toBe('الآلاف');
    expect(RANK_NAMES[9]).toBe('الملايير');
  });

  it('rejects what is not a natural below 10^12', () => {
    for (const bad of [-1, 1.5, 10 ** 12, Number.NaN]) expect(() => digitsByRank(bad)).toThrow(RangeError);
    expect(() => toArabicWords(10 ** 12)).toThrow(RangeError);
  });
});

describe('placeValue — toArabicWords (the platform spelling of build-extraction.py)', () => {
  it('matches EVERY words answer of the extraction', () => {
    const act = el('act-1').answer;
    expect(toArabicWords(act.next.digits)).toBe(act.next.words);
    expect(toArabicWords(act.previous.digits)).toBe(act.previous.words);
    for (const [n, a] of Object.entries(el('know-1').answer)) {
      if (a && typeof a === 'object' && a.words) {
        expect(toArabicWords(Number(n)), n).toBe(a.words);
        expect(spaced(Number(n)).replace(/ /g, ' ')).toBe(a.spaced);
      }
    }
    for (const a of el('ex-3').answer) {
      expect(toArabicWords(a.n), String(a.n)).toBe(a.words);
      expect(spaced(a.n).replace(/ /g, ' ')).toBe(a.spaced);
    }
    const d2 = el('deep-2').answer;
    expect(toArabicWords(9999999999)).toBe(d2['9999999999']);
    expect(toArabicWords(num(d2.next.digits))).toBe(d2.next.words);
    expect(toArabicWords(4467070000)).toBe(d2.words['نبتون']);
    expect(toArabicWords(1427000000)).toBe(d2.words['زحل']);
    expect(toArabicWords(149600000)).toBe(d2.words['الأرض']);
    const prep4 = el('prep').items.find((i) => i.n === 4);
    expect(toArabicWords(20892)).toBe(prep4.options[prep4.correct[0]]);
    expect(toArabicWords(el('self-1').answer.a)).toBe(el('self-1').answer.wordsCheck);
  });

  it('spot values', () => {
    const cases = {
      0: 'صفر', 11: 'أحد عشر', 12: 'اثنا عشر', 13: 'ثلاثة عشر', 71: 'واحد وسبعون', 100: 'مائة', 101: 'مائة وواحد', 200: 'مائتان',
      1000: 'ألف', 2000: 'ألفان', 3000: 'ثلاثة آلاف', 10000: 'عشرة آلاف', 11000: 'أحد عشر ألفا', 200000: 'مائتا ألف',
      1000000: 'مليون', 2000000: 'مليونان', [10 ** 10]: 'عشرة ملايير', 2017: 'ألفان وسبعة عشر', 7065: 'سبعة آلاف وخمسة وستون',
      765: 'سبعمائة وخمسة وستون', 999: 'تسعمائة وتسعة وتسعون',
    };
    for (const [n, w] of Object.entries(cases)) expect(toArabicWords(Number(n)), n).toBe(w);
  });

  it('a sweep 0..100 000: no undefined, no double space, no « و » at an end', () => {
    for (let n = 0; n <= 100000; n += 1) {
      const w = toArabicWords(n);
      if (w.includes('undefined') || w.includes('  ') || /(^|\s)و$/.test(w) || w !== w.trim()) throw new Error(`${n}: «${w}»`);
    }
  });
});

describe('placeValue — classWordsOf (the reading by classes)', () => {
  it('reads 4 908 732 class by class, and the classes joined give toArabicWords', () => {
    expect(classWordsOf(4908732)).toEqual([
      { k: 2, digits: '4', words: 'أربعة ملايين' }, { k: 1, digits: '908', words: 'تسعمائة وثمانية آلاف' }, { k: 0, digits: '732', words: 'سبعمائة واثنان وثلاثون' },
    ]);
    expect(classWordsOf(7065).map((c) => c.digits)).toEqual(['7', '065']);
    for (const n of [0, 7, 1000, 2017, 45671, 200000, 1000001, 149600000, 9999999999]) {
      expect(classWordsOf(n).map((c) => c.words).join(' و'), String(n)).toBe(toArabicWords(n));
    }
  });
});
