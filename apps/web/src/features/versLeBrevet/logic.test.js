import { describe, expect, it } from 'vitest';
import { deal, gcd, lcm, meetings, powerForm } from './logic';
import { UNIT } from '../../lessons/college/3e/nombres_calculs/multiples-et-diviseurs/vers-le-brevet-multiples-et-diviseurs/brevet';

describe('vers le brevet — the numbers', () => {
  it('finds the greatest common divisor and the least common multiple', () => {
    expect(gcd(126, 90)).toBe(18);
    expect(gcd(24, 36)).toBe(12);
    expect(lcm(45, 60)).toBe(180);
    expect(lcm(12, 18)).toBe(36);
  });

  it('deals two stocks into lots and says what stays', () => {
    expect(deal(24, 36, 5)).toEqual({ n: 5, q1: 4, r1: 4, q2: 7, r2: 1 });
    expect(deal(24, 36, 12)).toEqual({ n: 12, q1: 2, r1: 0, q2: 3, r2: 0 });
    expect(deal(24, 36, 0)).toBeNull();
  });

  it('writes a product of primes with its powers', () => {
    expect(powerForm([2, 2, 3, 5])).toBe('2² × 3 × 5');
    expect(powerForm([7, 3, 2, 3])).toBe('2 × 3² × 7');
    expect(powerForm([13])).toBe('13');
  });

  it('lists the moments two rhythms come back, up to their first meeting', () => {
    expect(meetings(12, 18)).toEqual([
      { at: 12, who: 'a' },
      { at: 18, who: 'b' },
      { at: 24, who: 'a' },
      { at: 36, who: 'both' },
    ]);
  });
});

describe('vers le brevet — the content of « Multiples et diviseurs »', () => {
  it('has four lessons, each with its idea, its rule, its trap and its words', () => {
    expect(UNIT.lessons.map((l) => l.id)).toEqual(['dec', 'pgcd', 'ppcm', 'irr']);
    for (const l of UNIT.lessons) {
      for (const key of ['title', 'short', 'idea', 'rule', 'example', 'trap', 'manip'])
        expect(l[key], `${l.id}.${key}`).toBeTruthy();
      expect(l.words.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('the numbers of the solved exercises hold', () => {
    const [lots, trains] = UNIT.solved;
    expect(gcd(lots.picture.a, lots.picture.b)).toBe(lots.picture.n);
    expect([lots.picture.a / 18, lots.picture.b / 18]).toEqual([7, 5]);
    expect([2 * 3 * 3 * 7, 2 * 3 * 3 * 5]).toEqual([lots.picture.a, lots.picture.b]);
    expect(lcm(trains.picture.a, trains.picture.b)).toBe(trains.picture.at);
    expect([3 * 3 * 5, 2 * 2 * 3 * 5, 2 * 2 * 3 * 3 * 5]).toEqual([45, 60, 180]);
    for (const ex of UNIT.solved) expect(ex.lines.length).toBeGreaterThanOrEqual(4);
  });

  it('every quiz question has exactly one right answer and names a lesson of the unit', () => {
    const ids = UNIT.lessons.map((l) => l.id);
    expect(UNIT.quiz).toHaveLength(6);
    for (const q of UNIT.quiz) {
      expect(q.choices.filter((c) => c.ok)).toHaveLength(1);
      expect(ids).toContain(q.lesson);
      expect(q.why).toBeTruthy();
    }
    expect([7 * 13, 2 ** 3 * 5, gcd(48, 36), gcd(15, 28), lcm(4, 6)]).toEqual([91, 40, 12, 1, 12]);
  });
});
