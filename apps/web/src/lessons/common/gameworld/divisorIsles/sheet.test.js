import { describe, it, expect } from 'vitest';
import {
  MAX_LINES,
  primesUpTo,
  stopOf,
  sheetOf,
  zerosOf,
  initSheet,
  sheetNow,
  sheetReducer,
  sheetResult,
} from './sheet';
import { isPrime, primeFactors } from './factorLadder';

// the design's numbers (docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md, key 4)
const SPEC = { kind: 'sheet', rounds: [{ n: 2431 }, { n: 4641 }, { n: 3127 }], text: {} };
const play = (spec, actions, from = initSheet(spec)) => actions.reduce((s, a) => sheetReducer(spec, s, a), from);
/** The world fills column B to the end. */
const fill = (spec, s) => {
  let x = s;
  while (x.stage === 'fill') x = sheetReducer(spec, x, { type: 'tick' });
  return x;
};
/** He reads the FIRST 0 of the sheet, or says « prime » when there is none — to the end of the round. */
const firstZero = (spec, s0) => {
  let s = fill(spec, s0);
  while (s.stage === 'pick') {
    const z = zerosOf(sheetNow(spec, s).lines);
    s = fill(spec, sheetReducer(spec, s, z.length ? { type: 'line', p: z[0] } : { type: 'prime' }));
  }
  return s;
};

describe('sheet — the numbers', () => {
  it('column A: the primes p with p² ⩽ n by default — 2 431 → 15 lines (up to 47), 4 641 → 19 (67), 3 127 → 16 (53)', () => {
    expect(primesUpTo(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
    expect(
      sheetOf(2431)
        .map((l) => l.p)
        .at(-1),
    ).toBe(47);
    expect(sheetOf(2431)).toHaveLength(15);
    expect(sheetOf(4641)).toHaveLength(19);
    expect(
      sheetOf(3127)
        .map((l) => l.p)
        .at(-1),
    ).toBe(53);
    expect(sheetOf(3127)).toHaveLength(16);
    for (const l of sheetOf(3127)) expect(l.p * l.p).toBeLessThanOrEqual(3127);
    expect(59 * 59).toBeGreaterThan(3127);
    // column B: the remainder of n by A
    for (const l of sheetOf(2431)) expect(l.r).toBe(2431 % l.p);
    expect(zerosOf(sheetOf(2431))).toEqual([11, 13, 17]);
    expect(zerosOf(sheetOf(3127))).toEqual([53]);
  });

  it('the stop: the lesson may give a number or its own function; a sheet holds at most 24 lines', () => {
    expect(stopOf(100)).toBe(10);
    expect(stopOf(100, 30)).toBe(30);
    expect(stopOf(100, (n) => n / 2)).toBe(50);
    expect(sheetOf(221, 30).map((l) => l.p)).toEqual(primesUpTo(30));
    expect(() => stopOf(100, 'all')).toThrow(RangeError);
    expect(() => sheetOf(1)).toThrow(RangeError);
    expect(() => sheetOf(100, 100)).toThrow(/at most 24/);
    expect(primesUpTo(89)).toHaveLength(MAX_LINES);
    expect(sheetOf(3)).toEqual([]); // no prime with p² ⩽ 3
  });
});

describe('sheet — the state machine', () => {
  it('2 431: the world fills B; 11 divides (221, a SHORTER sheet), then 13 (17), then « prime » is accepted', () => {
    let s = initSheet(SPEC);
    expect(s.stage).toBe('fill');
    expect(sheetReducer(SPEC, s, { type: 'line', p: 11 })).toBe(s); // not while the world fills
    expect(sheetReducer(SPEC, s, { type: 'prime' })).toBe(s);
    s = fill(SPEC, s);
    expect([s.stage, s.filled]).toEqual(['pick', 15]);
    s = play(SPEC, [{ type: 'line', p: 7 }], s); // 2431 = 7 × 347 + 2: the remainder is what happened
    expect(s.n).toBe(2431);
    expect(s.last).toMatchObject({ type: 'line', p: 7, r: 2, held: false, after: 2431 });
    expect(s.stage).toBe('pick');
    s = play(SPEC, [{ type: 'prime' }], s); // a 0 stands on the sheet: refused, its lines shown
    expect(s.last).toMatchObject({ type: 'prime', held: false, zeros: [11, 13, 17] });
    expect(s.stage).toBe('pick');
    s = play(SPEC, [{ type: 'line', p: 11 }], s);
    expect([s.n, s.stage, s.filled]).toEqual([221, 'fill', 0]);
    expect(sheetNow(SPEC, s).lines.map((l) => l.p)).toEqual([2, 3, 5, 7, 11, 13]); // the sheet shortens
    s = play(SPEC, [{ type: 'line', p: 13 }], fill(SPEC, s));
    expect(s.n).toBe(17);
    expect(sheetNow(SPEC, s).lines.map((l) => l.p)).toEqual([2, 3]);
    s = play(SPEC, [{ type: 'prime' }], fill(SPEC, s));
    expect(s.stage).toBe('seen');
    expect(s.rounds[0].factors).toEqual([11, 13, 17]);
    expect(s.rounds[0].attempts.map((a) => [a.type, a.before, a.p ?? null, a.held, a.lines])).toEqual([
      ['line', 2431, 7, false, 15],
      ['prime', 2431, null, false, 15],
      ['line', 2431, 11, true, 15],
      ['line', 221, 13, true, 6],
      ['prime', 17, null, true, 2],
    ]);
  });

  it('3 127 = 53 × 59: the 0 is on the LAST line (53); after it 59 has no line with a 0 — prime', () => {
    const s = firstZero(SPEC, { ...initSheet(SPEC), ri: 2, n: 3127 });
    expect(s.rounds.at(-1)).toMatchObject({ n: 3127, factors: [53, 59] });
    expect(s.rounds.at(-1).attempts[0]).toMatchObject({ p: 53, lines: 16, zeros: [53] });
  });

  it('every n from 2 to 3 200, read by the first 0: the factors are its prime factors and every « prime » said is true', () => {
    for (let n = 2; n <= 3200; n += 1) {
      const spec = { rounds: [{ n }] };
      const s = firstZero(spec, initSheet(spec));
      expect(s.stage, `${n}`).toBe('seen');
      expect(s.rounds[0].factors, `${n}`).toEqual(primeFactors(n));
      for (const a of s.rounds[0].attempts)
        if (a.type === 'prime') expect(isPrime(a.before), `${n}: ${a.before}`).toBe(true);
    }
  });

  it('a fixed stop past the number: a quotient of 1 ends the round; a line not on the sheet changes nothing', () => {
    const spec = { stop: 30, rounds: [{ n: 26 }] };
    let s = fill(spec, initSheet(spec));
    expect(sheetReducer(spec, s, { type: 'line', p: 31 })).toBe(s);
    expect(sheetReducer(spec, s, { type: 'line', p: 4 })).toBe(s);
    s = play(spec, [{ type: 'line', p: 2 }], s);
    s = play(spec, [{ type: 'line', p: 13 }], fill(spec, s));
    expect(s.stage).toBe('seen');
    expect(s.n).toBe(1);
    expect(sheetNow(spec, s).lines).toEqual([]);
    expect(s.rounds[0].factors).toEqual([2, 13]);
  });

  it('next goes round by round, then done; the result keeps every round', () => {
    let s = firstZero(SPEC, initSheet(SPEC));
    expect(sheetReducer(SPEC, s, { type: 'tick' })).toBe(s);
    s = firstZero(SPEC, play(SPEC, [{ type: 'next' }], s));
    s = firstZero(SPEC, play(SPEC, [{ type: 'next' }], s));
    s = play(SPEC, [{ type: 'next' }], s);
    expect(s.done).toBe(true);
    expect(sheetResult(s).rounds.map((r) => [r.n, r.factors.join('·')])).toEqual([
      [2431, '11·13·17'],
      [4641, '3·7·13·17'],
      [3127, '53·59'],
    ]);
  });
});
