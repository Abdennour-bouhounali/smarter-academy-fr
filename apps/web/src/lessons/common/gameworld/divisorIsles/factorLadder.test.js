import { describe, it, expect } from 'vitest';
import {
  isPrime,
  primeFactors,
  layPlank,
  factorNow,
  initFactor,
  factorReducer,
  factorResult,
  laidOf,
  fellHere,
} from './factorLadder';

const play = (spec, actions, from = initFactor(spec)) => actions.reduce((s, a) => factorReducer(spec, s, a), from);
/** Lay plank d: he takes it, the world shows it. */
const lay = (d) => [{ type: 'take', d }, { type: 'shown' }];
const RACK = [2, 3, 4, 5, 6, 7, 9, 11];
// the design's rounds (docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md, key 1) and its last step
const SPEC = { kind: 'ladder', mode: 'factor', rack: RACK, rounds: [{ n: 60 }, { n: 72 }, { n: 495 }], text: {} };
const sieve = (N) => {
  const p = Array(N + 1).fill(true);
  p[0] = p[1] = false;
  for (let i = 2; i * i <= N; i += 1) if (p[i]) for (let j = i * i; j <= N; j += i) p[j] = false;
  return p;
};

describe('ladder · factor — the numbers', () => {
  it('isPrime agrees with a sieve up to 5000; primeFactors multiplies back to n, increasing, every factor prime', () => {
    const S = sieve(5000);
    for (let n = 0; n <= 5000; n += 1) expect(isPrime(n), `${n}`).toBe(S[n]);
    expect(isPrime(2.5)).toBe(false);
    for (let n = 1; n <= 5000; n += 1) {
      const f = primeFactors(n);
      expect(f.reduce((p, x) => p * x, 1)).toBe(n);
      expect(f.every(isPrime)).toBe(true);
      expect([...f].sort((a, b) => a - b)).toEqual(f);
    }
    expect(primeFactors(72)).toEqual([2, 2, 2, 3, 3]);
    expect(primeFactors(495)).toEqual([3, 3, 5, 11]);
    expect(primeFactors(3127)).toEqual([53, 59]);
    expect(() => primeFactors(0)).toThrow(RangeError);
  });

  it('a plank laid on a gap: it holds when it divides (the gap becomes the quotient), else it falls and the gap stays', () => {
    expect(layPlank(72, 2)).toEqual({ plank: 2, held: true, before: 72, after: 36 });
    expect(layPlank(9, 4)).toEqual({ plank: 4, held: false, before: 9, after: 9 });
    expect(layPlank(11, 11)).toEqual({ plank: 11, held: true, before: 11, after: 1 });
    expect(() => layPlank(1, 2)).toThrow(RangeError);
    expect(() => layPlank(12, 1)).toThrow(RangeError);
  });
});

describe('ladder · factor — the state machine', () => {
  it('refuses a round that could never reach 1 (a prime factor missing from the rack), a plank of 1, a gap under 2', () => {
    expect(() => factorNow({ rack: [2, 3], rounds: [{ n: 70 }] }, { ri: 0 })).toThrow(/needs the planks 5,7/);
    expect(() => factorNow({ rack: [1, 2], rounds: [{ n: 8 }] }, { ri: 0 })).toThrow(RangeError);
    expect(() => factorNow({ rack: [2, 2], rounds: [{ n: 8 }] }, { ri: 0 })).toThrow(RangeError);
    expect(() => factorNow({ rack: [2], rounds: [{ n: 1 }] }, { ri: 0 })).toThrow(RangeError);
    // a round's own rack wins over the spec's
    expect(factorNow({ rack: [2], rounds: [{ n: 9, rack: [3] }] }, { ri: 0 }).rack).toEqual([3]);
  });

  it('every n ≤ 600, played with ANY order of planks that hold, ends at 1 on planks whose product is n', () => {
    const rack = Array.from({ length: 599 }, (_, i) => i + 2);
    for (let n = 2; n <= 600; n += 1) {
      const spec = { rack, rounds: [{ n }] };
      // the smallest plank that holds, again and again: the prime factors, increasing
      let s = initFactor(spec);
      while (s.stage === 'pick') s = play(spec, lay(rack.find((d) => s.gap % d === 0)), s);
      expect(s.stage, `${n}`).toBe('seen');
      expect(s.rounds[0].planks, `${n}`).toEqual(primeFactors(n));
      // the largest plank that holds: the gap itself, at once
      const big = play(spec, lay(n));
      expect(big.rounds[0].planks).toEqual([n]);
    }
  });

  it('72 with the design’s rack: 4, 6, 9 never hold once the 2s and 3s are laid; 2 must be taken AGAIN', () => {
    const spec = { ...SPEC, rounds: [{ n: 72 }] };
    let s = play(spec, [...lay(2), ...lay(3)]); // « one division per prime, then move on »
    expect(s.gap).toBe(12); // … leaves 12, still even
    expect(s.stage).toBe('pick');
    s = play(spec, [...lay(2), ...lay(2), ...lay(3)], s);
    expect(s.stage).toBe('seen');
    expect(s.rounds[0].planks).toEqual([2, 3, 2, 2, 3]);
    // 495: 2 falls (the order of the tries is kept), then 3, 3, 5, 11; 9 tried after the two 3s falls on 55
    const t = play({ ...SPEC, rounds: [{ n: 495 }] }, [
      ...lay(2),
      ...lay(3),
      ...lay(3),
      ...lay(9),
      ...lay(4),
      ...lay(5),
      ...lay(11),
    ]);
    expect(t.rounds[0].attempts.map((a) => [a.plank, a.held, a.before, a.after])).toEqual([
      [2, false, 495, 495],
      [3, true, 495, 165],
      [3, true, 165, 55],
      [9, false, 55, 55],
      [4, false, 55, 55],
      [5, true, 55, 11],
      [11, true, 11, 1],
    ]);
    expect(t.rounds[0].planks).toEqual([3, 3, 5, 11]);
    expect(t.rounds[0].fell).toBe(3);
    // on every quotient whose 2s and 3s are gone, 4, 6 and 9 fall — for each of the design's numbers
    for (const n of [60, 72, 495, 126]) {
      let m = n;
      while (m % 2 === 0) m /= 2;
      while (m % 3 === 0) m /= 3;
      if (m > 1) for (const d of [4, 6, 9]) expect(layPlank(m, d).held, `${n} → ${m} · ${d}`).toBe(false);
    }
  });

  it('a composite plank that divides is laid like any other (the world refuses nothing he chooses)', () => {
    const s = play({ ...SPEC, rounds: [{ n: 60 }] }, [...lay(4), ...lay(6)]);
    expect(laidOf(s.attempts)).toEqual([4]);
    expect(s.gap).toBe(15);
    expect(fellHere(s)).toEqual([6]); // 6 fell on 15
    const t = play({ ...SPEC, rounds: [{ n: 60 }] }, [...lay(3), ...lay(5)], s);
    expect(t.stage).toBe('seen');
    expect(t.rounds[0].planks).toEqual([4, 3, 5]);
    expect(fellHere(t)).toEqual([]);
  });

  it('moves out of their stage change nothing; next goes round by round, then done; the result is every round', () => {
    const s0 = initFactor(SPEC);
    expect(factorReducer(SPEC, s0, { type: 'shown' })).toBe(s0);
    expect(factorReducer(SPEC, s0, { type: 'next' })).toBe(s0);
    expect(factorReducer(SPEC, s0, { type: 'take', d: 8 })).toBe(s0); // not on the rack
    expect(factorReducer(SPEC, s0, { type: 'nonsense' })).toBe(s0);
    const s1 = factorReducer(SPEC, s0, { type: 'take', d: 2 });
    expect(s1.stage).toBe('lay');
    expect(factorReducer(SPEC, s1, { type: 'take', d: 3 })).toBe(s1); // one plank at a time
    let s = play(SPEC, [...lay(2), ...lay(2), ...lay(3), ...lay(5)]);
    expect(s.stage).toBe('seen');
    expect(factorReducer(SPEC, s, { type: 'take', d: 2 })).toBe(s);
    s = play(SPEC, [{ type: 'next' }, ...lay(2), ...lay(2), ...lay(2), ...lay(3), ...lay(3), { type: 'next' }], s);
    expect(s.ri).toBe(2);
    expect(s.gap).toBe(495);
    s = play(SPEC, [...lay(3), ...lay(3), ...lay(5), ...lay(11), { type: 'next' }], s);
    expect(s.done).toBe(true);
    const r = factorResult(s);
    expect(r.rounds.map((x) => [x.n, x.planks.join('·'), x.fell])).toEqual([
      [60, '2·2·3·5', 0],
      [72, '2·2·2·3·3', 0],
      [495, '3·3·5·11', 0],
    ]);
    for (const round of r.rounds)
      for (const a of round.attempts) expect(Object.keys(a).sort()).toEqual(['after', 'before', 'held', 'plank']);
  });
});
