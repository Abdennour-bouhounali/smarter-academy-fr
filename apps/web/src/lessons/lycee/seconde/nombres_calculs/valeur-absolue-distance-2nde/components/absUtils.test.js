import { describe, it, expect } from 'vitest';
import { abs, distance, absText, solveAbsEquation, absInequalitySet, centerRadius, notation, satisfies } from './absUtils';

describe('valeur absolue et distance', () => {
  it('abs is the distance to zero, opposite numbers share it', () => {
    expect(abs(-5)).toBe(5); expect(abs(5)).toBe(5); expect(abs(0)).toBe(0); expect(abs(-2.5)).toBe(2.5);
  });
  it('distance is symmetric and ignores the order', () => {
    expect(distance(-3, 5)).toBe(8); expect(distance(5, -3)).toBe(8);
    expect(distance(-7, -2)).toBe(5); expect(distance(1.5, 4)).toBe(2.5); expect(distance(4, 4)).toBe(0);
  });
  it('absText writes the rule', () => {
    expect(absText(-3, true)).toBe('|−3| = −(−3) = 3');
    expect(absText(4, true)).toBe('|4| = 4');
    expect(absText(-2.5)).toBe('|−2,5| = 2,5');
  });
  it('|x − 3| = 2 has two solutions, = 0 one, < 0 none', () => {
    expect(solveAbsEquation(3, 2)).toEqual([1, 5]);
    expect(solveAbsEquation(3, 0)).toEqual([3]);
    expect(solveAbsEquation(3, -1)).toEqual([]);
  });
  it('|x − 3| ≤ 2 ⇔ x ∈ [1 ; 5], strict → open', () => {
    expect(notation(absInequalitySet(3, 2))).toBe('[1 ; 5]');
    expect(notation(absInequalitySet(3, 2, true))).toBe(']1 ; 5[');
    expect(notation(absInequalitySet(20, 0.5))).toBe('[19,5 ; 20,5]');
    expect(notation(absInequalitySet(3, 0))).toBe('{3}');
    expect(notation(absInequalitySet(3, -1))).toBe('∅');
  });
  it('centre and radius from an interval', () => {
    expect(centerRadius(-1, 7)).toEqual({ a: 3, r: 4 });
    expect(centerRadius(2, 8)).toEqual({ a: 5, r: 3 });
    expect(centerRadius(19.5, 20.5)).toEqual({ a: 20, r: 0.5 });
  });
  it('satisfies matches the set', () => {
    expect(satisfies(5, 3, 2)).toBe(true); expect(satisfies(5, 3, 2, true)).toBe(false);
    expect(satisfies(0.9, 3, 2)).toBe(false); expect(satisfies(1, 3, 2)).toBe(true);
  });
});
