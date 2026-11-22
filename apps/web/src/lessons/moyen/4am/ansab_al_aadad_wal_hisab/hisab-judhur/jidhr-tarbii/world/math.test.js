import { describe, it, expect } from 'vitest';
import { decimalsOf, digits, rodFact, scaled, sq, typedDecimal, typedWhole, valueOf, write } from './math';

describe('the shared numbers of the written world', () => {
  it('reads a typed box as digits only, a decimal in two boxes exactly', () => {
    expect([
      digits(7),
      digits('07'),
      digits(' 12 '),
      digits(''),
      digits(' '),
      digits('2.5'),
      digits(-3),
      digits(1.5),
    ]).toEqual(['7', '07', '12', null, null, null, null, null]);
    expect(typedWhole('0289')).toBe(289);
    expect(write(typedDecimal(5, '07'))).toBe('5,07');
    expect(write(typedDecimal('1', '30'))).toBe('1,3');
    expect(typedDecimal(5, '')).toBe(null);
    expect(valueOf('not a number')).toBe(null);
  });

  it('scales a decimal to an integer only when its decimals allow it', () => {
    expect(scaled('5,47', 2)).toBe(547);
    expect(scaled('0,0036', 4)).toBe(36);
    expect(scaled('5,475', 2)).toBe(547.5);
    expect(scaled(null, 2)).toBe(null);
    expect([decimalsOf('5,47'), decimalsOf('30'), decimalsOf('0,06')]).toEqual([2, 0, 2]);
    expect(sq('1,3')).toBe('1,69');
    expect(sq('2/3')).toBe('4/9');
  });

  it('says what a rod does on a court in the world’s words, its product isolated left to right', () => {
    expect(rodFact(6, 36)).toBe('منصّة المقياس 6 تركب الساحة 36: ⁦6 × 6 = 36⁩.');
    expect(rodFact(5, 30)).toBe('منصّة المقياس 5 تترك شريطًا في الساحة 30: ⁦5 × 5 = 25⁩.');
    expect(rodFact('0,8', '0,49')).toBe('منصّة المقياس 0,8 تعلق في الساحة 0,49: ⁦0,8 × 0,8 = 0,64⁩.');
  });
});
