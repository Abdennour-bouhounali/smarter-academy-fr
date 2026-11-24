import { describe, it, expect } from 'vitest';
import {
  read,
  tryRead,
  write,
  tex,
  compare,
  equal,
  plus,
  minus,
  times,
  over,
  isDecimal,
  isInteger,
  fourth,
  approx,
} from './exact';
import { chainHolds, sameRatio } from './authoring/test/ratios';

describe('a number is read as a student types it and written as he writes it', () => {
  it('reads a comma or a point, a true minus, LaTeX, a fraction', () => {
    for (const [t, w] of [
      ['77,5', '77,5'],
      ['77.5', '77,5'],
      ['7{,}5', '7,5'],
      ['$57{,}5$', '57,5'],
      ['−9', '-9'],
      ['5/6', '5/6'],
      ['\\dfrac{5}{6}', '5/6'],
      ['-\\frac{10}{12}', '-5/6'],
      ['3,5/2', '1,75'],
      ['0,25', '0,25'],
      [' ⁦104⁩ ', '104'],
      [38n, '38'],
      [209, '209'],
      ['5.470', '5,47'],
    ])
      expect(write(read(t)), String(t)).toBe(w);
  });
  it('refuses what is not one number', () => {
    for (const bad of ['abc', '1,2,3', '7,', ',', '5/0', '1/2/3', '', '7 5x']) expect(() => read(bad), bad).toThrow();
    expect(tryRead('77,5x')).toBeNull();
    expect(tryRead('77,5')).toEqual(read('155/2'));
  });
  it('writes LaTeX with a comma that opens no space and a real fraction bar', () => {
    expect(tex('77,5')).toBe('77{,}5');
    expect(tex('5/6')).toBe('\\dfrac{5}{6}');
    expect(tex('-1/38')).toBe('-\\dfrac{1}{38}');
    expect(tex(73)).toBe('73');
  });
  it('is exact: 0,1 + 0,2 is 0,3', () => {
    expect(equal(plus('0,1', '0,2'), '0,3')).toBe(true);
    expect(0.1 + 0.2 === 0.3).toBe(false);
    expect(write(minus('77,5', '57,5'))).toBe('20');
    expect(write(times('1,5', 38))).toBe('57');
    expect(write(over(1, 3))).toBe('1/3');
    expect(compare('2/3', '0,6666666666666667')).toBe(-1);
    expect(isDecimal('1/38')).toBe(false);
    expect(isDecimal('5,5')).toBe(true);
    expect(isInteger('6/3')).toBe(true);
    expect(approx('77,5')).toBe(77.5);
  });
});

describe('ratios and the fourth proportional', () => {
  it('compares ratios by the cross products, without a float', () => {
    expect(sameRatio([15, 35], [18, 42])).toBe(true);
    expect(sameRatio([1, 3], ['0,3333333333333333', 1])).toBe(false);
    expect(sameRatio(['57,5', 69], ['77,5', 93])).toBe(true);
    expect(() => sameRatio([1, 0], [2, 3])).toThrow();
    expect(write(over(24, 56))).toBe('3/7');
  });
  it('holds a chain of three ratios only when all three are equal', () => {
    expect(chainHolds([15, 35], [18, 42], [21, 49])).toBe(true);
    expect(chainHolds([15, 35], [18, 42], [20, 49])).toBe(false);
  });
  it('gives the x of a / b = c / x, exactly', () => {
    expect(write(fourth(15, 35, 18))).toBe('42');
    expect(write(fourth(56, 64, '77,5'))).toBe('620/7');
    expect(write(fourth(40, 64, 50))).toBe('80');
    expect(write(fourth(6, 5, 1))).toBe('5/6');
    expect(sameRatio([6, 5], [1, fourth(6, 5, 1)])).toBe(true);
    expect(() => fourth(0, 5, 1)).toThrow();
  });
});
