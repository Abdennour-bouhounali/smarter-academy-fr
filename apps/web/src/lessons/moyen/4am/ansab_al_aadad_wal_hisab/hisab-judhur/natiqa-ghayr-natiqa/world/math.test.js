import { describe, it, expect } from 'vitest';
import {
  above,
  calculator,
  cut,
  digits,
  isqrt,
  middle,
  rodFact,
  rounded,
  scaled,
  sq,
  typedDecimal,
  typedFrac,
  typedWhole,
  valueOf,
  wholeBelow,
  write,
} from './math';

describe('the shared numbers of the written world of « الأعداد الناطقة والأعداد غير الناطقة »', () => {
  it('reads a typed box as digits only, a decimal in two boxes, a fraction over a bar', () => {
    expect([digits(7), digits('07'), digits(''), digits('2.5'), digits(-3)]).toEqual(['7', '07', null, null, null]);
    expect(typedWhole('0289')).toBe(289);
    expect(write(typedDecimal(5, '07'))).toBe('5,07');
    expect(typedDecimal(5, '')).toBe(null);
    expect(typedFrac(5, 6)).toBe('5/6');
    expect(typedFrac(5, 0)).toBe(null);
    expect(valueOf('not a number')).toBe(null);
    expect(scaled('4,35', 2)).toBe(435);
    expect(scaled('4,355', 2)).toBe(435.5);
    expect(sq('5/6')).toBe('25/36');
  });

  it('the values by default and by excess, the middle mark and the rounded value — computed exactly', () => {
    expect(isqrt(99n)).toBe(9n);
    expect(wholeBelow('19')).toBe(4);
    expect(wholeBelow('0,16')).toBe(0);
    expect([cut('19', 1), above('19', 1), middle('19', 1), rounded('19', 1)]).toEqual(['4,3', '4,4', '4,35', '4,4']);
    expect([cut('66', 2), above('66', 2), middle('66', 2), rounded('66', 2)]).toEqual([
      '8,12',
      '8,13',
      '8,125',
      '8,12',
    ]);
    expect([cut('31', 2), rounded('31', 2)]).toEqual(['5,56', '5,57']);
    expect([cut('2', 2), above('2', 2)]).toEqual(['1,41', '1,42']);
    // the middle mark decides: 4,35² < 19 (the upper mark), 8,125² > 66 (the lower one)
    expect(sq('4,35')).toBe('18,9225');
    expect(sq('8,125')).toBe('66,015625');
  });

  it('what a calculator of ten digits shows: the side itself when it is a decimal, else ten digits rounded', () => {
    expect(calculator('2')).toBe('1,414213562');
    expect(calculator('19')).toBe('4,358898944');
    expect(calculator('31')).toBe('5,567764363');
    expect(calculator('12,96')).toBe('3,6');
    expect(calculator('50/72')).toBe('0,833333333');
    expect(calculator('4/81')).toBe('0,222222222');
  });

  it('says what a rod does on a court in the world’s words, its product isolated left to right', () => {
    expect(rodFact('2,4', '5,76')).toBe('منصّة المقياس 2,4 تركب الساحة 5,76: ⁦2,4 × 2,4 = 5,76⁩.');
    expect(rodFact('0,4', '1,6')).toBe('منصّة المقياس 0,4 تترك شريطًا في الساحة 1,6: ⁦0,4 × 0,4 = 0,16⁩.');
    // a fraction over a real bar (a MathText fact), never « 3/7 » as text
    expect(rodFact('3/7', '9/50')).toBe(
      'منصّة المقياس $\\dfrac{3}{7}$ تعلق في الساحة 0,18: $\\dfrac{3}{7} \\times \\dfrac{3}{7} = \\dfrac{9}{49}$.',
    );
    expect(rodFact('2/7', '4/49').replace(/\$[^$]*\$/g, '')).not.toMatch(/\d\s*\/\s*\d/);
  });
});
