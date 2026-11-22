import { describe, it, expect } from 'vitest';
import { groupsOf, rebuildOf, estimateSteps, estimateMark, bracketOf, bracketSays } from './inquiry';

/**
 * Every experiment of the Euclidean division is TRUE for every number it may show: a = b × q + r, 0 ≤ r < b. The loops
 * collect what does not hold (one `expect` at the end: hundreds of thousands of cases stay fast).
 */
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};

describe('the investigation of the division — groups: planks laid one at a time', () => {
  it('q planks fit, the next one does not, and the cells left go down by b at each plank', () => {
    sweep((check) => {
      for (let b = 1; b <= 40; b += 1)
        for (let a = 0; a <= 400; a += 1) {
          const g = groupsOf(a, b);
          const at = `${a} by ${b}`;
          check(b * g.q + g.r === a && g.r >= 0 && g.r < b, at);
          check(g.steps.length === g.q + 1, at);
          g.steps.forEach((s, i) => {
            check(s.k === i + 1 && s.fits === i < g.q, `${at} step ${i}`);
            check(s.left === (s.fits ? a - b * s.k : g.r) && s.left >= 0, `${at} left ${i}`);
          });
          // the plank that does not fit is longer than what is left
          check(g.steps.at(-1).left < b, at);
        }
    });
  });

  it('a plank longer than the gap (nothing fits), an exact fit (nothing left), a big gap', () => {
    expect(groupsOf(5, 8)).toEqual({ q: 0, r: 5, steps: [{ k: 1, fits: false, left: 5 }] });
    expect(groupsOf(24, 6)).toMatchObject({ q: 4, r: 0 });
    expect(groupsOf(24, 6).steps.at(-1)).toEqual({ k: 5, fits: false, left: 0 });
    expect(groupsOf(137, 9)).toMatchObject({ q: 15, r: 2 });
    expect(() => groupsOf(5, 0)).toThrow(RangeError);
  });
});

describe('the investigation of the division — rebuild: the gap made by q planks and a piece', () => {
  it('a = b × q + r; a piece shorter than a plank stays, a longer one takes more planks', () => {
    sweep((check) => {
      for (let b = 1; b <= 30; b += 1)
        for (let q = 0; q <= 30; q += 1)
          for (let r = 0; r <= 3 * b; r += 1) {
            const x = rebuildOf(b, q, r);
            const at = `${b} ${q} ${r}`;
            check(x.a === b * q + r && x.valid === r < b, at);
            // what the world lays when the piece is not a leftover IS the division of the gap
            check(x.q2 === Math.floor(x.a / b) && x.r2 === x.a % b, at);
            check(x.more === (x.valid ? 0 : x.q2 - q), at);
            if (x.valid) check(x.q2 === q && x.r2 === r, at);
          }
    });
    expect(rebuildOf(7, 4, 9)).toEqual({ a: 37, valid: false, more: 1, q2: 5, r2: 2 });
  });
});

describe('the investigation of the division — estimate: tens of planks, then units', () => {
  const walk = (a, b, check) => {
    const steps = estimateSteps(a, b);
    let q = 0;
    let left = a;
    const at = `${a} by ${b}`;
    steps.forEach((s, i) => {
      check(s.from === left && s.unit === b * 10 ** s.place, at);
      check(s.q >= 0 && s.q <= 9, at);
      // the biggest that does not pass: q units fit in what was left, q + 1 pass it
      check(s.q * s.unit <= s.from && (s.q + 1) * s.unit > s.from, at);
      // the ruler of a step goes to 10 × unit: what is left before it is always on it
      check(s.from < 10 * s.unit, at);
      check(s.left === s.from - s.q * s.unit && s.left < s.unit, at);
      // places go down one by one to the units
      check(s.place === steps.length - 1 - i, at);
      q += s.q * 10 ** s.place;
      left = s.left;
    });
    check(q === Math.floor(a / b) && left === a % b, at);
  };
  it('two-digit planks on gaps up to four digits (1AM)', () => {
    sweep((check) => {
      for (let b = 11; b <= 99; b += 1) for (let a = 1; a <= 9999; a += 1) walk(a, b, check);
    });
  }, 60000);
  it('any plank (2AM), gaps shorter than a plank, zeros in the quotient', () => {
    sweep((check) => {
      for (let b = 1; b <= 1000; b += 1) for (let a = 0; a <= 100000; a += 997) walk(a, b, check);
    });
    expect(estimateSteps(1005, 5).map((s) => [s.place, s.q])).toEqual([
      [2, 2],
      [1, 0],
      [0, 1],
    ]);
    expect(estimateSteps(5, 12)).toEqual([{ place: 0, unit: 12, q: 0, from: 5, left: 5 }]);
    expect(estimateSteps(943, 23).map((s) => s.q)).toEqual([4, 1]);
  }, 60000);
  it('a mark pressed (blind or not): only the step’s own digit is « ok »; a bigger one passes, a smaller one leaves room', () => {
    sweep((check) => {
      for (let b = 100; b <= 999; b += 7)
        for (let a = 0; a <= 60000; a += 593)
          for (const st of estimateSteps(a, b))
            for (let k = 0; k <= 9; k += 1) {
              const m = estimateMark(st, k);
              const at = `${a} by ${b}, place ${st.place}, k ${k}`;
              check(m.value === k * st.unit && m.next === (k + 1) * st.unit, at);
              check(m.kind === (k === st.q ? 'ok' : k > st.q ? 'passes' : 'short'), at);
            }
    });
    const [tens] = estimateSteps(4576, 208);
    expect(estimateMark(tens, 3)).toMatchObject({ value: 6240, kind: 'passes' });
    expect(estimateMark(tens, 1)).toMatchObject({ value: 2080, kind: 'short', next: 4160 });
    expect(estimateMark(tens, 2)).toMatchObject({ value: 4160, kind: 'ok' });
  });
});

describe('the investigation of the division — bracket: a ÷ b between two consecutive natural numbers', () => {
  it('b × lo ≤ a < b × hi; exact exactly when nothing is left; only the right pair is accepted', () => {
    sweep((check) => {
      for (let b = 1; b <= 60; b += 1)
        for (let a = 0; a <= 1000; a += 1) {
          const x = bracketOf(a, b);
          const at = `${a} by ${b}`;
          check(x.hi === x.lo + 1 && b * x.lo <= a && a < b * x.hi, at);
          check(x.exact === (a === b * x.lo) && x.r === a - b * x.lo, at);
          for (let lo = Math.max(0, x.lo - 3); lo <= x.lo + 3; lo += 1)
            for (let hi = Math.max(0, x.lo - 3); hi <= x.hi + 3; hi += 1)
              check(bracketSays(a, b, lo, hi).ok === (lo === x.lo && hi === x.hi), `${at}: ${lo}, ${hi}`);
        }
    });
  });
  it('the facts of a pair that misses', () => {
    expect(bracketSays(38, 7, 4, 5)).toEqual({ loFits: true, hiPasses: false, consecutive: true, ok: false });
    expect(bracketSays(38, 7, 6, 7)).toMatchObject({ loFits: false, hiPasses: true });
    expect(bracketSays(38, 7, 4, 6)).toMatchObject({ loFits: true, hiPasses: true, consecutive: false });
    expect(bracketOf(42, 7)).toEqual({ lo: 6, hi: 7, exact: true, r: 0 });
  });
});
