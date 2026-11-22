import { describe, it, expect } from 'vitest';
import { lockerSlots, booksOf, LOCKER_W } from './geometry';

describe('code-lockers — hall geometry', () => {
  it('lockerSlots stay inside the wall, never overlap, at most 8', () => {
    for (const n of [0, 1, 4, 8, 12]) {
      const xs = lockerSlots(n, 100, 400);
      expect(xs.length).toBe(Math.min(n, 8));
      xs.forEach((x, i) => {
        expect(x).toBeGreaterThanOrEqual(100 - 0.001);
        expect(x + LOCKER_W).toBeLessThanOrEqual(400 + 0.001);
        if (i > 0) expect(x - xs[i - 1]).toBeGreaterThanOrEqual(LOCKER_W - 0.001);
      });
    }
  });
  it('lockerSlots shrinks the step on a narrow wall', () => {
    const xs = lockerSlots(8, 0, 200);
    expect(xs.at(-1) + LOCKER_W).toBeLessThanOrEqual(200 + 0.001);
  });
  it('booksOf is deterministic and fits the width', () => {
    expect(booksOf(120, 2)).toEqual(booksOf(120, 2));
    const b = booksOf(120, 0);
    expect(b.length).toBeGreaterThan(4);
    expect(b.at(-1).x + b.at(-1).w).toBeLessThan(130);
  });
});
