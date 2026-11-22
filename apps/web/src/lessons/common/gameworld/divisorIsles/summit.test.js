import { describe, it, expect } from 'vitest';
import { gcd } from './inquiry';
import {
  divisorsDown,
  plankOn,
  descentOf,
  outsideWitness,
  initSummit,
  summitReducer,
  summitNow,
  summitResult,
} from './summit';

const run = (spec, actions, from = initSummit(spec)) => actions.reduce((s, a) => summitReducer(spec, s, a), from);
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};

describe('summit — the logic of a search for the longest plank of two gaps', () => {
  it('divisorsDown lists every plank of n, the longest first', () => {
    expect(divisorsDown(266)).toEqual([266, 133, 38, 19, 14, 7, 2, 1]);
    expect(divisorsDown(1)).toEqual([1]);
    expect(() => divisorsDown(0)).toThrow(RangeError);
    sweep((check) => {
      for (let n = 1; n <= 400; n += 1) {
        const list = divisorsDown(n);
        const slow = [];
        for (let d = n; d >= 1; d -= 1) if (n % d === 0) slow.push(d);
        check(list.join() === slow.join(), `${n}`);
      }
    });
  });

  it('plankOn writes both divisions and says which gaps the plank fills', () => {
    sweep((check) => {
      for (let a = 1; a <= 60; a += 1)
        for (let b = 1; b <= 60; b += 1)
          for (let d = 1; d <= Math.max(a, b); d += 1) {
            const p = plankOn(a, b, d);
            check(p.qa * d + p.ra === a && p.ra < d && p.qb * d + p.rb === b && p.rb < d, `${a} ${b} ${d}`);
            check(p.fillsA === (p.ra === 0) && p.fillsB === (p.rb === 0), `fills ${a} ${b} ${d}`);
            const kind = p.both ? 'both' : p.fillsA ? 'a' : p.fillsB ? 'b' : 'none';
            check(p.kind === kind, `kind ${a} ${b} ${d}`);
          }
    });
  });

  it('the descent stops on the first plank of the shorter gap that fills the other — and that plank is the gcd', () => {
    sweep((check) => {
      for (let a = 1; a <= 200; a += 1)
        for (let b = 1; b <= 200; b += 1) {
          const D = descentOf(a, b);
          const at = `${a} ${b}`;
          check(D.crown === gcd(a, b), `crown ${at}`);
          check(D.planks.at(-1) === D.crown && D.tries === D.planks.length, `planks ${at}`);
          // every plank tried before the crown fails the longer gap; every plank after it is shorter
          check(
            D.planks.slice(0, -1).every((d) => D.long % d !== 0),
            `before ${at}`,
          );
          check(
            D.rest.every((d) => d < D.crown && D.short % d === 0),
            `rest ${at}`,
          );
          check(D.planks.length + D.rest.length === D.all.length, `all ${at}`);
          // one try exactly when the shorter gap fills the longer
          check((D.tries === 1) === (D.long % D.short === 0), `first ${at}`);
        }
    });
    // the lesson's pairs
    expect(descentOf(266, 322)).toMatchObject({ short: 266, crown: 14, tries: 5, rest: [7, 2, 1] });
    expect(descentOf(198, 234)).toMatchObject({ crown: 18, tries: 6 }); // 198, 99, 66, 33, 22, 18
    expect(descentOf(76, 19)).toMatchObject({ short: 19, crown: 19, tries: 1 });
    expect(descentOf(90, 36)).toMatchObject({ crown: 18, tries: 2 }); // 36 does not fill 90, 18 does
  });

  it('the outside answer is a plank that does not fill the shorter gap — never one that fills both', () => {
    sweep((check) => {
      for (let a = 1; a <= 120; a += 1)
        for (let b = 1; b <= 120; b += 1) {
          const w = outsideWitness(a, b);
          const short = Math.min(a, b);
          if (w === null) {
            check(Math.max(a, b) <= 2, `none ${a} ${b}`);
            continue;
          }
          check(short % w.d !== 0 && !plankOn(a, b, w.d).both && w.d <= Math.max(a, b), `${a} ${b} ${w.d}`);
        }
    });
    // his own try is used when one does not fill the shorter gap
    expect(outsideWitness(266, 322, [plankOn(266, 322, 14), plankOn(266, 322, 28)])).toEqual({ d: 28, mine: true });
    // else the world's plank fills the LONGER gap only (the most telling)
    expect(outsideWitness(266, 322, [plankOn(266, 322, 14)])).toEqual({ d: 23, mine: false });
  });
});

const SPEC = {
  kind: 'summit',
  rounds: [
    { a: 266, b: 322, start: 14 },
    { a: 76, b: 19, mode: 'first', free: 0 },
    { a: 90, b: 36, mode: 'first', free: 0 },
  ],
};

describe('summit — the state machine plays a whole experiment', () => {
  it('free tries: any length is laid and answered; a both-filling longer try becomes the best; out of range is refused', () => {
    let s = initSummit(SPEC);
    expect([s.stage, s.best, s.last.d]).toEqual(['free', 14, 14]);
    s = summitReducer(SPEC, s, { type: 'try', d: 400 });
    expect([s.stage, s.refused]).toEqual(['free', 400]);
    s = summitReducer(SPEC, s, { type: 'try', d: null });
    expect([s.stage, s.refused]).toEqual(['free', 0]);
    expect(summitReducer(SPEC, s, { type: 'shown' })).toBe(s); // nothing waits for the world
    s = run(SPEC, [{ type: 'try', d: 28 }, { type: 'shown' }], s);
    expect([s.stage, s.best, s.refused]).toEqual(['free', 14, null]);
    expect(s.tries[0]).toMatchObject({ d: 28, fillsA: false, fillsB: false });
    // 7 fills both but is shorter than 14: the best stays
    s = run(SPEC, [{ type: 'try', d: 7 }, { type: 'shown' }], s);
    expect([s.stage, s.best]).toEqual(['outside', 14]);
  });

  it('the outside prediction, the descent, the crown and the shorter planks', () => {
    let s = run(SPEC, [
      { type: 'try', d: 28 },
      { type: 'shown' },
      { type: 'try', d: 7 },
      { type: 'shown' },
      { type: 'say', v: true },
      { type: 'shown' },
    ]);
    expect(s.stage).toBe('outsideSeen');
    expect(s.outside).toMatchObject({ d: 28, mine: true, guess: true, both: false });
    s = summitReducer(SPEC, s, { type: 'go' });
    expect(s.stage).toBe('descent');
    // 266, 133, 38, 19 do not fill 322; 14 does
    for (const [i, v] of [false, true, false, false].entries()) {
      s = run(SPEC, [{ type: 'say', v }, { type: 'shown' }], s);
      expect([s.stage, s.descent.length, s.descent[i].holds]).toEqual(['descent', i + 1, false]);
    }
    s = run(SPEC, [{ type: 'say', v: true }, { type: 'shown' }], s);
    expect([s.stage, s.crown]).toEqual(['rest', 14]);
    s = summitReducer(SPEC, s, { type: 'say', v: true });
    expect(s.stage).toBe('restRun');
    s = run(SPEC, [{ type: 'tick' }, { type: 'tick' }], s);
    expect([s.stage, s.restShown, s.last.d]).toEqual(['restRun', 2, 2]);
    s = summitReducer(SPEC, s, { type: 'tick' });
    expect(s.stage).toBe('seen');
    expect(s.rounds[0]).toEqual({
      a: 266,
      b: 322,
      mode: 'search',
      tries: [
        { d: 28, fillsA: false, fillsB: false },
        { d: 7, fillsA: true, fillsB: true },
      ],
      outside: { d: 28, guess: true, mine: true },
      descent: [
        { d: 266, guess: false, holds: false },
        { d: 133, guess: true, holds: false },
        { d: 38, guess: false, holds: false },
        { d: 19, guess: false, holds: false },
        { d: 14, guess: true, holds: true },
      ],
      crown: 14,
      checkedRest: true,
    });
  });

  it('mode first: the count before the descent, one prediction, the world finishes; the shorter gap may hold at once', () => {
    const at2 = run(SPEC, [{ type: 'next' }], { ...initSummit(SPEC), stage: 'seen' });
    expect([at2.ri, at2.stage]).toEqual([1, 'count']);
    expect(summitNow(SPEC, at2)).toMatchObject({ mode: 'first', free: 0, asksOutside: false, short: 19 });
    let s = summitReducer(SPEC, at2, { type: 'count', n: 0 });
    expect(s).toBe(at2);
    s = run(SPEC, [{ type: 'count', n: 1 }, { type: 'say', v: true }, { type: 'shown' }], at2);
    expect(s.stage).toBe('seen');
    expect(s.rounds.at(-1)).toMatchObject({ a: 76, b: 19, mode: 'first', crown: 19, guessCount: 1, checkedRest: null });
    s = summitReducer(SPEC, s, { type: 'next' });
    // 90 and 36: 36 does not fill 90 — he says it for 36 only; the world goes on 18 (it holds)
    s = run(SPEC, [{ type: 'count', n: 1 }, { type: 'say', v: false }, { type: 'shown' }], s);
    expect(s.stage).toBe('run');
    expect(summitReducer(SPEC, s, { type: 'say', v: true })).toBe(s);
    s = summitReducer(SPEC, s, { type: 'tick' });
    expect([s.stage, s.crown]).toEqual(['seen', 18]);
    expect(s.rounds.at(-1).descent).toEqual([
      { d: 36, guess: false, holds: false },
      { d: 18, guess: null, holds: true },
    ]);
    expect(s.rounds.at(-1).guessCount).toBe(1);
    s = summitReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(summitResult(s).rounds.map((r) => r.a)).toEqual([76, 90]); // the first round was skipped by the forced state
  });

  it('saying « no » to the shorter planks ends the round; a crown of 1 asks nothing more', () => {
    const spec = {
      rounds: [
        { a: 12, b: 18, free: 0, outside: false },
        { a: 8, b: 15, free: 0, outside: false },
      ],
    };
    let s = initSummit(spec);
    expect(s.stage).toBe('descent');
    s = run(spec, [{ type: 'say', v: false }, { type: 'shown' }, { type: 'say', v: true }, { type: 'shown' }], s);
    expect([s.stage, s.crown]).toEqual(['rest', 6]);
    s = summitReducer(spec, s, { type: 'say', v: false });
    expect([s.stage, s.rounds[0].checkedRest]).toEqual(['seen', false]);
    s = summitReducer(spec, s, { type: 'next' });
    for (let k = 0; k < 4; k += 1) s = run(spec, [{ type: 'say', v: false }, { type: 'shown' }], s);
    expect([s.stage, s.crown, s.rounds[1].checkedRest]).toEqual(['seen', 1, null]);
  });
});
