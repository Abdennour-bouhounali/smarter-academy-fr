import { describe, it, expect } from 'vitest';
import { joinOf, stackOf, peelOf, fitsRow, judgePeelClaim, checkProofOrder, refuteCard } from './inquiry';

/**
 * Every experiment is TRUE for every number it may show. The ranges cover what the lessons that use these kinds give
 * today, with room above: join — gaps up to 160 (the largest given is 152), planks up to 40 (largest 19); stack — gaps
 * up to 60 (18, 21), planks up to 20 (6, 14), up to 1000 copies (100); peel — gaps up to 1000 (962, 735, 100), bridges up
 * to 300 (296, 280, 42), every plank that divides the bridge (planks given up to 74). A lesson that gives more must
 * widen these loops. The loops COLLECT what does not hold (`sweep`, one `expect` at the end): millions of cases stay fast.
 */
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
/** The planks of a gap (its divisors), shortest first. */
const planksOf = (n) => {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};

describe('the investigation of a rule — join: two gaps glued, or cut one from the other', () => {
  it('a plank that fills both gaps fills the glued gap and the cut gap; the facts add up', () => {
    sweep((check) => {
      for (let d = 1; d <= 40; d += 1)
        for (let a = 1; a <= 160; a += 1)
          for (let b = 1; b <= 160; b += 1)
            for (const op of b <= a ? ['sum', 'diff'] : ['sum']) {
              const j = joinOf(d, a, b, op);
              const at = `${d}: ${a} ${op} ${b}`;
              check(j.value === (op === 'sum' ? a + b : a - b), at);
              check(j.planks * d + j.rest === j.value && j.rest < d, at);
              check(j.holds === (j.value % d === 0), at);
              check(j.planksA * d + (a % d) === a && j.planksB * d + (b % d) === b, at);
              if (j.fillsA && j.fillsB) check(j.holds, at);
              // one filled and the other not: the joined gap never holds
              if (j.fillsA !== j.fillsB) check(!j.holds, at);
            }
    });
  }, 30000);

  it('neither gap filled, and the glued gap holds anyway — a fact the world shows', () => {
    expect(joinOf(7, 22, 20, 'sum')).toMatchObject({ value: 42, fillsA: false, fillsB: false, holds: true, planks: 6 });
    expect(joinOf(7, 21, 35, 'sum')).toMatchObject({ value: 56, holds: true, planks: 8, planksA: 3, planksB: 5 });
    expect(joinOf(7, 35, 21, 'diff')).toMatchObject({ value: 14, holds: true, planks: 2 });
    expect(joinOf(7, 21, 30, 'sum')).toMatchObject({ value: 51, holds: false, rest: 2 });
    expect(joinOf(19, 152, 95, 'diff')).toMatchObject({
      value: 57,
      fillsA: true,
      fillsB: true,
      holds: true,
      planks: 3,
    });
    expect(() => joinOf(7, 20, 21, 'diff')).toThrow(RangeError);
  });
});

describe('the investigation of a rule — stack: k copies of one gap', () => {
  it('a plank that fills a gap fills every number of copies of it; it counts k × (base ÷ d) planks', () => {
    sweep((check) => {
      for (let d = 1; d <= 20; d += 1)
        for (let base = 1; base <= 60; base += 1)
          for (const k of [1, 2, 3, 4, 5, 7, 10, 12, 100, 1000]) {
            const s = stackOf(d, base, k);
            const at = `${d}: ${k} × ${base}`;
            check(s.total === k * base && s.planks * d + s.rest === s.total && s.rest < d, at);
            check(s.fillsBase === (base % d === 0), at);
            if (s.fillsBase) check(s.holds && s.planks === k * (base / d), at);
          }
    });
  });
  it('a gap the plank does not fill may still be filled by some copies: a fact, never a verdict', () => {
    expect(stackOf(14, 21, 1)).toMatchObject({ fillsBase: false, holds: false });
    expect(stackOf(14, 21, 2)).toMatchObject({ total: 42, holds: true, planks: 3 });
    expect(stackOf(14, 21, 3)).toMatchObject({ holds: false, rest: 7 });
    expect(stackOf(6, 18, 100)).toMatchObject({ total: 1800, holds: true, planks: 300 });
  });
});

describe('the investigation of a rule — peel: what is left when b is laid on a again and again', () => {
  it('the steps go down by b to a piece shorter than b: a = b × q + r', () => {
    sweep((check) => {
      for (let a = 1; a <= 1000; a += 1)
        for (let b = 1; b <= Math.min(a, 300); b += 1) {
          const p = peelOf(a, b);
          const at = `${a} by ${b}`;
          check(p.steps[0] === a && p.steps.length === p.q + 1, at);
          for (let i = 1; i < p.steps.length; i += 1) if (p.steps[i - 1] - p.steps[i] !== b) check(false, at);
          check(b * p.q + p.r === a && p.r === a % b && p.r < b, at);
        }
    });
    expect(peelOf(53, 12)).toEqual({ q: 4, r: 5, steps: [53, 41, 29, 17, 5] });
    expect(peelOf(735, 280)).toEqual({ q: 2, r: 175, steps: [735, 455, 175] });
    expect(() => peelOf(5, 12)).toThrow(RangeError);
  }, 30000);

  it('a plank that fills both gaps fills the piece left — for every gap, every plank of the bridge', () => {
    sweep((check) => {
      for (let b = 1; b <= 300; b += 1) {
        const planks = planksOf(b);
        for (let a = b + 1; a <= 1000; a += 1)
          for (const d of planks) {
            const f = fitsRow(a, b, d);
            if (f.a && f.b) check(f.r, `${a}, ${b}, ${d}`);
          }
      }
    });
  }, 30000);

  /** rounds whose table holds a plank of a alone, of b alone, and of both — none of them fills the piece by chance */
  const ROUNDS = [
    { a: 54, b: 21, candidates: [2, 3, 6, 7] }, // r = 12: 3 fills both; 6 and 2 fill a only; 7 fills b only
    { a: 70, b: 25, candidates: [5, 7, 2, 10] }, // r = 20: 5 both; 7, 2, 10 a only
    { a: 45, b: 16, candidates: [3, 4, 2, 5] }, // r = 13: no common plank; 3, 5 a only; 4, 2 b only
  ];
  const CLAIMS = [
    { cols: [], link: 'and' },
    { cols: ['a'], link: 'and' },
    { cols: ['b'], link: 'and' },
    { cols: ['a', 'b'], link: 'or' },
    { cols: ['a', 'b'], link: 'and' },
  ];
  const holding = (rounds) => CLAIMS.filter((c) => judgePeelClaim(rounds, c).ok);

  it('of every claim his table allows, exactly one holds: « both gaps ⇒ the piece »', () => {
    expect(holding(ROUNDS)).toEqual([{ cols: ['a', 'b'], link: 'and' }]);
    expect(judgePeelClaim(ROUNDS, { cols: ['a'], link: 'and' }).intruders.length).toBeGreaterThan(0);
    expect(judgePeelClaim(ROUNDS, { cols: ['b'], link: 'and' }).intruders.length).toBeGreaterThan(0);
    expect(judgePeelClaim(ROUNDS, { cols: ['a', 'b'], link: 'or' }).intruders.length).toBeGreaterThan(0);
    const both = judgePeelClaim(ROUNDS, { cols: ['a', 'b'], link: 'and' });
    expect(both.taken.map((f) => f.d)).toEqual([3, 5]);
  });

  it('the example round of GAME_WORLD.md « spec shapes » holds exactly one claim on its own; one round alone may hold two', () => {
    // GAME_WORLD.md: rounds: [{ a: 50, b: 20, candidates: [2, 4, 5, 25] }] — 25 fills a alone, 4 fills b alone, neither
    // fills the piece 10; 2 and 5 fill both
    expect(holding([{ a: 50, b: 20, candidates: [2, 4, 5, 25] }])).toEqual([{ cols: ['a', 'b'], link: 'and' }]);
    // 54 by 21 alone: every plank of a here fills the piece 12 — « fills a » is never refuted, two claims hold
    expect(holding([{ a: 54, b: 21, candidates: [2, 3, 6, 7] }])).toHaveLength(2);
  });

  it('« both gaps ⇒ the piece » is never refuted, whatever the rounds', () => {
    sweep((check) => {
      for (let a = 10; a <= 1000; a += 7)
        for (let b = 3; b < Math.min(a, 300); b += 4) {
          const candidates = [...new Set([...planksOf(b), ...planksOf(a).filter((d) => d <= b)])];
          check(
            judgePeelClaim([{ a, b, candidates }], { cols: ['a', 'b'], link: 'and' }).intruders.length === 0,
            `${a}, ${b}`,
          );
        }
    });
  });
});

describe('the investigation of a rule — letters: a proof assembled from cards', () => {
  const k = (s) => s.a / s.d;
  const k2 = (s) => s.b / s.d;
  const CARDS = [
    { id: 'ka', needs: ['d|a'], gives: ['k'], ok: true, holdsOn: (s) => s.a === s.d * k(s) },
    { id: 'kb', needs: ['d|b'], gives: ["k'"], ok: true, holdsOn: (s) => s.b === s.d * k2(s) },
    {
      id: 'sum',
      needs: ['k', "k'"],
      gives: ['dk+dk'],
      ok: true,
      holdsOn: (s) => s.a + s.b === s.d * k(s) + s.d * k2(s),
    },
    { id: 'fact', needs: ['dk+dk'], gives: ['d(k+k)'], ok: true, holdsOn: (s) => s.a + s.b === s.d * (k(s) + k2(s)) },
    { id: 'end', needs: ['d(k+k)'], gives: [], ok: true, holdsOn: () => true },
    { id: 'same', needs: ['k'], ok: false, holdsOn: (s) => s.a + s.b === s.d * k(s) * k2(s) },
    { id: 'one', ok: false, holdsOn: (s) => s.a + s.b === 56 },
  ];
  const GIVEN = ['d|a', 'd|b'];
  const SAMPLES = [
    { d: 7, a: 21, b: 35 },
    { d: 3, a: 12, b: 6 },
    { d: 5, a: 40, b: 15 },
  ];

  it('the right order passes; a card that uses what is not written yet is stopped with what it lacks', () => {
    expect(checkProofOrder(CARDS, ['ka', 'kb', 'sum', 'fact', 'end'], GIVEN).ok).toBe(true);
    expect(checkProofOrder(CARDS, ['kb', 'ka', 'sum', 'fact', 'end'], GIVEN).ok).toBe(true);
    expect(checkProofOrder(CARDS, ['ka', 'sum'], GIVEN)).toEqual({ ok: false, at: 1, missing: ["k'"] });
    expect(checkProofOrder(CARDS, ['end'], GIVEN)).toEqual({ ok: false, at: 0, missing: ['d(k+k)'] });
    expect(checkProofOrder(CARDS, ['ka'])).toEqual({ ok: false, at: 0, missing: ['d|a'] });
  });

  it('a true line is never refuted on any sample; a false one is refuted by a sample the world picks', () => {
    const many = [];
    for (let d = 1; d <= 12; d += 1)
      for (let x = 1; x <= 9; x += 1) for (let y = 1; y <= 9; y += 1) many.push({ d, a: d * x, b: d * y });
    for (const c of CARDS.filter((x) => x.ok)) expect(refuteCard(c, many), c.id).toBe(null);
    expect(
      refuteCard(
        CARDS.find((c) => c.id === 'same'),
        SAMPLES,
      ),
    ).toEqual({ d: 7, a: 21, b: 35 }); // 7 × 3 × 5 ≠ 56
    expect(
      refuteCard(
        CARDS.find((c) => c.id === 'one'),
        SAMPLES,
      ),
    ).toEqual({ d: 3, a: 12, b: 6 });
  });
});

describe('the investigation of a rule — peel: a row of the judged claim names its own gap and bridge', () => {
  it('every taken row carries the gap and the bridge it belongs to, and the three facts as booleans', () => {
    const rounds = [{ a: 100, b: 42, candidates: [2, 5, 3] }];
    const j = judgePeelClaim(rounds, { cols: ['a'], link: 'and' });
    expect(j.intruders).toEqual([expect.objectContaining({ gap: 100, bridge: 42, d: 5, a: true, b: false, r: false })]);
  });
});
