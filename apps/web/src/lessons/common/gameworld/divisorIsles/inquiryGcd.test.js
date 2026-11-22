import { describe, it, expect } from 'vitest';
import {
  gcd,
  commonPlanks,
  commonOf,
  commonSays,
  ladderOf,
  ladderAsk,
  ladderRound,
  ladderStart,
  nestOf,
} from './inquiry';

/**
 * Every experiment of the greatest common divisor is TRUE for every number it may show. The loops collect what does not
 * hold (one `expect` at the end) and the reference is computed the slow way: every plank from 1 up, tried on both gaps.
 */
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
const slowCommon = (a, b) => {
  const out = [];
  for (let d = 1; d <= Math.max(a, b); d += 1) if (a % d === 0 && b % d === 0) out.push(d);
  return out;
};
const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);

describe('the investigation of the greatest common divisor — gcd and the common planks', () => {
  it('gcd is the longest plank that holds both gaps; commonPlanks lists every plank of both, shortest first', () => {
    sweep((check) => {
      for (let a = 1; a <= 160; a += 1)
        for (let b = 1; b <= 160; b += 1) {
          const slow = slowCommon(a, b);
          check(gcd(a, b) === slow.at(-1), `gcd ${a} ${b}`);
          check(same(commonPlanks(a, b), slow), `common ${a} ${b}`);
        }
    });
    expect(gcd(1071, 462)).toBe(21);
    expect(() => gcd(0, 5)).toThrow(RangeError);
  });
});

describe('common — what « تحقّق » judges, with and without the longest (`crown`)', () => {
  const c = commonOf(12, 18, [1, 2, 3, 4, 5, 6, 9, 12]); // both: 1, 2, 3, 6
  it('by default the longest is marked AND the count typed; both must be right', () => {
    expect(commonSays(c, { longest: null, count: null })).toEqual({ needLong: true, needCount: true, ok: false });
    expect(commonSays(c, { longest: 6, count: null })).toEqual({ needLong: false, needCount: true, ok: false });
    expect(commonSays(c, { longest: 3, count: 4 }).ok).toBe(false);
    expect(commonSays(c, { longest: 6, count: 3 }).ok).toBe(false);
    expect(commonSays(c, { longest: 6, count: 4 }).ok).toBe(true);
    // no candidate holds both: nothing can be marked, the count alone is judged
    const none = commonOf(8, 15, [2, 3, 5]);
    expect(commonSays(none, { longest: null, count: 0 })).toEqual({ needLong: false, needCount: false, ok: true });
  });
  it('crown: false — the longest is never asked: no mark is missing, the count alone is judged', () => {
    expect(commonSays(c, { longest: null, count: null }, false)).toEqual({
      needLong: false,
      needCount: true,
      ok: false,
    });
    expect(commonSays(c, { longest: null, count: 3 }, false).ok).toBe(false);
    expect(commonSays(c, { longest: null, count: 4 }, false)).toEqual({ needLong: false, needCount: false, ok: true });
  });
});

describe('common — candidate planks sorted on three shelves', () => {
  it('each candidate holds a, b, both exactly as the division says; the longest of « both » is the gcd when the candidates hold it', () => {
    sweep((check) => {
      for (let a = 1; a <= 90; a += 1)
        for (let b = 1; b <= 90; b += 1) {
          const candidates = Array.from({ length: Math.max(a, b) }, (_, i) => i + 1);
          const c = commonOf(a, b, candidates);
          const at = `${a} ${b}`;
          c.rows.forEach((r) => {
            check(r.holdsA === (a % r.d === 0) && r.holdsB === (b % r.d === 0), `${at} d=${r.d}`);
            check(r.both === (r.holdsA && r.holdsB), `${at} both d=${r.d}`);
          });
          check(same(c.common, slowCommon(a, b)), `${at} common`);
          check(c.longest === gcd(a, b), `${at} longest`);
        }
    });
  });

  it('the rounds a lesson may show: only plank 1 in common, b a multiple of a, a = b, a plank that holds neither', () => {
    expect(commonOf(8, 15, [1, 2, 3, 4, 5]).common).toEqual([1]);
    expect(commonOf(6, 18, [1, 2, 3, 6, 9]).longest).toBe(6);
    expect(commonOf(12, 12, [1, 5, 12]).common).toEqual([1, 12]);
    const none = commonOf(12, 18, [5, 1]);
    expect(none.rows[0]).toEqual({ d: 5, holdsA: false, holdsB: false, both: false });
    expect(commonOf(12, 18, [5]).longest).toBe(null);
  });
});

describe('ladder — a pair replaced by a simpler pair with the same common planks', () => {
  it('every row keeps the same common planks, the calculation of each row is true, and the last value that is not 0 is the gcd', () => {
    sweep((check) => {
      for (const mode of ['subtract', 'divide'])
        for (let a = 1; a <= 120; a += 1)
          for (let b = 1; b <= 120; b += 1) {
            const l = ladderOf(a, b, mode);
            const at = `${mode} ${a} ${b}`;
            const first = commonPlanks(a, b);
            check(l.gcd === gcd(a, b), `${at} gcd`);
            check(l.steps === l.rows.length && l.steps >= 1, `${at} steps`);
            check(l.rows[0].a === Math.max(a, b) && l.rows[0].b === Math.min(a, b), `${at} first row`);
            l.rows.forEach((r, i) => {
              check(r.a >= r.b && r.b > 0, `${at} row ${i} order`);
              check(same(commonPlanks(r.a, r.b), first), `${at} row ${i} common`);
              if (mode === 'divide') check(r.a === r.b * r.q + r.value && r.value < r.b, `${at} row ${i} division`);
              else check(r.q === 1 && r.value === r.a - r.b, `${at} row ${i} subtraction`);
              const last = i === l.rows.length - 1;
              check(last === (r.value === 0) && last === (r.next === null), `${at} row ${i} stop`);
              if (!last) {
                const n = l.rows[i + 1];
                check(n.a === r.next[0] && n.b === r.next[1], `${at} row ${i} next`);
                const want = mode === 'divide' ? [r.b, r.value] : [Math.max(r.b, r.value), Math.min(r.b, r.value)];
                check(same(r.next, want), `${at} row ${i} next pair`);
              }
            });
            // the last row: a = b when subtracting, b fills a when dividing — b is the last value that is not 0
            const end = l.rows.at(-1);
            check(end.a % end.b === 0 && (mode === 'divide' || end.a === end.b), `${at} end`);
          }
    });
  });

  it('dividing never takes more rows than subtracting', () => {
    sweep((check) => {
      for (let a = 1; a <= 150; a += 1)
        for (let b = 1; b <= 150; b += 1)
          check(ladderOf(a, b, 'divide').steps <= ladderOf(a, b, 'subtract').steps, `${a} ${b}`);
    });
    expect(ladderOf(1071, 462, 'divide')).toMatchObject({ gcd: 21, steps: 3 });
    expect(ladderOf(84, 36, 'subtract').rows.map((r) => [r.a, r.b])).toEqual([
      [84, 36],
      [48, 36],
      [36, 12],
      [24, 12],
      [12, 12],
    ]);
    expect(ladderOf(36, 84, 'divide').rows.map((r) => [r.a, r.b, r.q, r.value])).toEqual([
      [84, 36, 2, 12],
      [36, 12, 3, 0],
    ]);
    expect(() => ladderOf(12, 0, 'divide')).toThrow(RangeError);
    expect(() => ladderOf(12, 4, 'other')).toThrow(RangeError);
  });

  describe('a ladder kept on a workshop’s bench (`spec.from`) starts where he left it', () => {
    const spec = { kind: 'ladder', mode: 'subtract', rounds: [{ a: 259, b: 185 }] };
    it('empty without `from`, or with a state of another round count', () => {
      expect(ladderStart(spec)).toEqual(ladderRound(spec, 0));
      expect(ladderStart(spec)).toMatchObject({ ri: 0, written: 0, stage: 'guess', found: [] });
      expect(ladderStart({ ...spec, from: { ri: 3, found: [] } })).toEqual(ladderRound(spec, 0));
      expect(ladderStart({ ...spec, from: { lists: [] } })).toEqual(ladderRound(spec, 0));
      // a ladder of one row asks the count at once; `manual` is capped at steps − 1
      expect(ladderAsk({ ...spec, rounds: [{ a: 36, b: 12, mode: 'divide' }] }, 0)).toBe(0);
      expect(ladderAsk({ ...spec, manual: 9 }, 0)).toBe(4);
    });
    it('a state that waits for him is given back as it is', () => {
      const s = {
        ri: 0,
        written: 1,
        stage: 'guess',
        guesses: [{ row: 1, said: [185, 74], hit: true }],
        last: null,
        guessed: null,
        found: [],
      };
      expect(ladderStart({ ...spec, from: s })).toBe(s);
    });
    it('a row the world was writing is written; a ladder it was finishing is finished', () => {
      const g = { row: 2, said: [111, 74], hit: true };
      const writing = {
        ri: 0,
        written: 1,
        stage: 'write',
        guesses: [{ row: 1, said: [185, 74], hit: true }, g],
        last: null,
        guessed: null,
        found: [],
      };
      expect(ladderStart({ ...spec, from: writing })).toMatchObject({
        written: 2,
        stage: 'count',
        last: { a: 185, b: 74, mode: 'subtract', value: 111, next: [111, 74], said: [111, 74], hit: true },
      });
      const finishing = { ...writing, written: 2, stage: 'finish', guessed: 5 };
      const done = ladderStart({ ...spec, from: finishing });
      expect(done).toMatchObject({ written: 5, stage: 'seen' });
      expect(done.found).toEqual([
        { a: 259, b: 185, mode: 'subtract', steps: 5, guessed: 5, gcd: 37, guesses: writing.guesses },
      ]);
    });
  });
});

describe('nest — the common planks are the planks of the longest one', () => {
  it('the two lists are equal for every pair, and a probe holds both gaps exactly when it holds g', () => {
    sweep((check) => {
      for (let a = 1; a <= 150; a += 1)
        for (let b = 1; b <= 150; b += 1) {
          const probes = Array.from({ length: Math.max(a, b) + 3 }, (_, i) => i + 1);
          const n = nestOf(a, b, probes);
          const at = `${a} ${b}`;
          check(n.g === gcd(a, b) && n.equal, `${at} equal`);
          check(same(n.common, slowCommon(a, b)) && same(n.divisorsOfG, slowCommon(n.g, n.g)), `${at} lists`);
          n.rows.forEach((r) => {
            check(r.both === (a % r.p === 0 && b % r.p === 0) && r.inG === (n.g % r.p === 0), `${at} p=${r.p}`);
            check(r.both === r.inG, `${at} p=${r.p} nest`);
          });
        }
    });
    expect(nestOf(24, 36, [5, 8, 6, 24]).rows).toEqual([
      { p: 5, inG: false, both: false },
      { p: 8, inG: false, both: false },
      { p: 6, inG: true, both: true },
      { p: 24, inG: false, both: false },
    ]);
  });
});
