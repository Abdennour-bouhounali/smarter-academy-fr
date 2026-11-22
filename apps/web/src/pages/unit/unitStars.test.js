import { describe, it, expect } from 'vitest';
import { readStars, totalStars, starsKey } from './unitStars';

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

describe('unit stars — read per student, totalled per lesson', () => {
  it('totals the lesson and survives a damaged value', () => {
    const s = memory();
    s.setItem(starsKey('l1'), JSON.stringify({ m1: { r1: 2 }, m2: { a: 3 } }));
    expect(readStars(s, 'l1')).toEqual({ m1: { r1: 2 }, m2: { a: 3 } });
    expect(totalStars(readStars(s, 'l1'))).toBe(5);
    s.setItem(starsKey('l2'), '{bad');
    expect(readStars(s, 'l2')).toEqual({});
    expect(totalStars(readStars(s, 'nothing'))).toBe(0);
  });
});
