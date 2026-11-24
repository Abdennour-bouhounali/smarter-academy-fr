import { describe, expect, it } from 'vitest';
import {
  lenApprox,
  lenCompare,
  lenEqual,
  lenOver,
  lenPlus,
  lenRead,
  lenRoot,
  lenTex,
  lenTimes,
  lenWrite,
} from './surd';

describe('a length that is a root, exact (the river’s crooked sides)', () => {
  it('a root is written with its square factors out: √178240 = 8√2785; a rational stays one', () => {
    expect(lenRoot('2785')).toBe('√2785');
    expect(lenRoot('178240')).toBe('8√2785');
    expect(lenRoot('2704')).toBe('52');
    expect(lenRoot('9/4')).toBe('1,5');
    expect(lenWrite('3√12')).toBe('6√3');
    expect(lenRead('√49')).toEqual({ q: { n: 7n, d: 1n }, r: 1n });
  });
  it('products and quotients stay exact: SR/SF = 1/8, SE/SF has its root in the numerator', () => {
    expect(lenOver('√2785', '8√2785')).toBe('0,125');
    expect(lenOver('8√2785', '√2785')).toBe('8');
    expect(lenOver('9', '8√2785')).toBe('9/22280√2785');
    expect(lenTimes('√2785', '√2785')).toBe('2785');
    expect(lenTex('9/22280√2785')).toBe('\\dfrac{9\\sqrt{2785}}{22280}');
    expect(lenTex('8√2785')).toBe('8\\sqrt{2785}');
    expect(lenTex('5/6')).toBe('\\dfrac{5}{6}');
  });
  it('a sum of the same root is one length (RF = SR + SF = 9√2785); two roots are not', () => {
    expect(lenPlus('√2785', '8√2785')).toBe('9√2785');
    expect(lenPlus('9', '72')).toBe('81');
    expect(lenPlus('8√2785', lenTimes('√2785', '-1'))).toBe('7√2785');
    expect(() => lenPlus('√2', '√3')).toThrow();
  });
  it('compared by their squares, never by a float: √2785 < 53, 9/22280√2785 ≠ 1/8', () => {
    expect(lenCompare('√2785', '53')).toBe(-1);
    expect(lenCompare('√2785', '52')).toBe(1);
    expect(lenEqual('2√3', '√12')).toBe(true);
    expect(lenEqual('9/22280√2785', '1/8')).toBe(false);
    expect(lenCompare('-√2', '1')).toBe(-1);
    expect(lenApprox('8√2785')).toBeCloseTo(8 * Math.sqrt(2785), 9);
  });
});
