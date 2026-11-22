import { describe, it, expect } from 'vitest';
import { gcd } from './inquiry';
import {
  planksUp,
  bothPlanks,
  checkOf,
  countAgain,
  lastOf,
  initMeasure,
  measureReducer,
  measureNow,
  measureResult,
  firstsUsed,
} from './measure';

/** Where a road (a list of planks, each in the unit of the stage before) ends — null if one plank does not fill both. */
function roadEnd(a, b, road) {
  let at = [a, b];
  for (const d of road) {
    at = countAgain(at[0], at[1], d);
    if (!at) return null;
  }
  return at;
}

const run = (spec, actions, from = initMeasure(spec)) => actions.reduce((s, a) => measureReducer(spec, s, a), from);
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
/** Ticks until the world's check is over. */
const finishCheck = (spec, s) => {
  let at = s;
  for (let k = 0; k < 200 && at.stage === 'checkRun'; k += 1) at = measureReducer(spec, at, { type: 'tick' });
  return at;
};
const MAX = 130;

describe('measure — the logic of a change of unit', () => {
  it('planksUp lists the planks of n longer than 1, the shortest first; bothPlanks the common ones', () => {
    expect(planksUp(66)).toEqual([2, 3, 6, 11, 22, 33, 66]);
    expect(planksUp(1)).toEqual([]);
    expect(() => planksUp(0)).toThrow(RangeError);
    expect(bothPlanks(66, 78)).toEqual([2, 3, 6]);
    expect(bothPlanks(11, 13)).toEqual([]);
  });

  it('every road ends on a/g over b/g — whatever the planks he chooses, for every fraction with terms up to 130', () => {
    // every end reachable from (p, q) by a road that goes on until no plank but 1 fills both
    const memo = new Map();
    const ends = (p, q) => {
      const key = `${p}/${q}`;
      if (memo.has(key)) return memo.get(key);
      const planks = bothPlanks(p, q);
      const out = new Set();
      if (!planks.length) out.add(key);
      for (const d of planks) for (const e of ends(p / d, q / d)) out.add(e);
      memo.set(key, out);
      return out;
    };
    sweep((check) => {
      for (let a = 1; a <= MAX; a += 1)
        for (let b = 1; b <= MAX; b += 1) {
          const g = gcd(a, b);
          const e = ends(a, b);
          check(e.size === 1 && e.has(`${a / g}/${b / g}`), `${a}/${b}`);
          check(lastOf(a, b).join() === `${a / g},${b / g}`, `last ${a}/${b}`);
        }
    });
    // the lesson's roads: by 3 then 2, by 2 then 3, by 6 at once
    expect(roadEnd(66, 78, [3, 2])).toEqual([11, 13]);
    expect(roadEnd(66, 78, [2, 3])).toEqual([11, 13]);
    expect(roadEnd(66, 78, [6])).toEqual([11, 13]);
    expect(roadEnd(66, 78, [2, 2])).toBeNull();
  });

  it('one stage ends it exactly when the plank is the gcd (direct), for every fraction up to 130', () => {
    sweep((check) => {
      for (let a = 1; a <= MAX; a += 1)
        for (let b = 1; b <= MAX; b += 1)
          for (const d of bothPlanks(a, b)) {
            const [p, q] = countAgain(a, b, d);
            const ended = checkOf(p, q).found === null;
            check(ended === (d === gcd(a, b)), `${a}/${b} by ${d}`);
          }
    });
    expect(checkOf(...countAgain(66, 99, 33))).toEqual({ tried: [{ d: 2, r: 1, fills: false }], found: null });
    expect(checkOf(...countAgain(66, 99, 3))).toMatchObject({ found: 11 }); // 22/33: 11 still fills both
  });

  it('a refused plank really does not fill both; the check finds a plank exactly when one other than 1 fills both', () => {
    sweep((check) => {
      for (let a = 1; a <= MAX; a += 1)
        for (let b = 1; b <= MAX; b += 1) {
          for (let d = 2; d <= Math.max(a, b); d += 1) {
            const fills = a % d === 0 && b % d === 0;
            check((countAgain(a, b, d) === null) === !fills, `${a}/${b} ${d}`);
          }
          const c = checkOf(a, b);
          check((c.found === null) === (gcd(a, b) === 1), `check ${a}/${b}`);
          check(
            c.tried.every((t) => a % t.d === 0 && t.r === b % t.d),
            `tried ${a}/${b}`,
          );
          check(
            c.tried.slice(0, -1).every((t) => !t.fills),
            `stops ${a}/${b}`,
          );
          if (c.found !== null) check(a % c.found === 0 && b % c.found === 0, `found ${a}/${b}`);
        }
    });
  });

  it('the equal fractions of a chain are equal: p × b = q × a at every stage', () => {
    sweep((check) => {
      for (let a = 1; a <= MAX; a += 1)
        for (let b = 1; b <= MAX; b += 1)
          for (const d of bothPlanks(a, b)) {
            const [p, q] = countAgain(a, b, d);
            check(p * b === q * a && p * d === a && q * d === b, `${a}/${b} ${d}`);
          }
    });
  });
});

const SPEC = {
  kind: 'measure',
  rounds: [
    { a: 66, b: 78, mode: 'stages', chips: [2, 3, 4, 5, 6] },
    { a: 66, b: 99, mode: 'direct' },
  ],
};

describe('measure — the state machine plays a whole experiment', () => {
  it('stages: a plank that does not fill both is laid and changes nothing; one that does re-counts both strips', () => {
    let s = initMeasure(SPEC);
    expect([s.stage, s.cur, s.chain]).toEqual(['pick', [66, 78], [[66, 78]]]);
    expect(measureNow(SPEC, s)).toMatchObject({
      mode: 'stages',
      g: 6,
      runs: 2,
      last: [11, 13],
      chips: [2, 3, 4, 5, 6],
    });
    // out of 2 … 78: a notice, nothing laid
    expect(measureReducer(SPEC, s, { type: 'try', d: 1 }).notice).toEqual({ kind: 'bound', d: 1 });
    expect(measureReducer(SPEC, s, { type: 'try', d: 79 }).notice).toEqual({ kind: 'bound', d: 79 });
    expect(measureReducer(SPEC, s, { type: 'try', d: null }).notice).toEqual({ kind: 'bound', d: 0 });
    expect(measureReducer(SPEC, s, { type: 'shown' })).toBe(s);
    // 4 fills neither: laid, what is left shows, nothing changes
    s = run(SPEC, [{ type: 'try', d: 4 }, { type: 'shown' }], s);
    expect([s.stage, s.cur, s.chain.length]).toEqual(['pick', [66, 78], 1]);
    expect(s.last).toMatchObject({ d: 4, ra: 2, rb: 2, both: false, at: [66, 78] });
    expect(s.refused).toEqual([{ d: 4, at: [66, 78] }]);
    // by 3 then 2
    s = run(SPEC, [{ type: 'try', d: 3 }, { type: 'shown' }], s);
    expect([s.cur, s.chain]).toEqual([
      [22, 26],
      [
        [66, 78],
        [22, 26],
      ],
    ]);
    s = run(SPEC, [{ type: 'try', d: 2 }, { type: 'shown' }], s);
    expect(s.chain.at(-1)).toEqual([11, 13]);
    expect(s.stages).toEqual([
      { d: 3, from: [66, 78], to: [22, 26] },
      { d: 2, from: [22, 26], to: [11, 13] },
    ]);
  });

  it('stages: the end claim is checked by the world; a wrong claim lets the run go on', () => {
    let s = run(SPEC, [{ type: 'try', d: 2 }, { type: 'shown' }, { type: 'end' }]);
    expect(s.stage).toBe('checkRun');
    expect(s.check).toMatchObject({ at: [33, 39], found: 3, shown: 0, said: 'end' });
    s = finishCheck(SPEC, s);
    expect([s.stage, s.checks]).toEqual(['pick', [{ at: [33, 39], found: 3 }]]);
    s = run(SPEC, [{ type: 'try', d: 3 }, { type: 'shown' }, { type: 'end' }], s);
    expect(s.check.tried.map((t) => t.d)).toEqual([11]);
    s = finishCheck(SPEC, s);
    expect(s.stage).toBe('predict');
    expect(s.runs).toHaveLength(1);
    expect(s.runs[0]).toEqual({
      stages: [
        { d: 2, from: [66, 78], to: [33, 39] },
        { d: 3, from: [33, 39], to: [11, 13] },
      ],
      end: [11, 13],
      predicted: null,
      checks: [
        { at: [33, 39], found: 3 },
        { at: [11, 13], found: null },
      ],
    });
    // the prediction, then another road: its first plank must differ (2 is refused while 3 and 6 are open)
    expect(measureReducer(SPEC, s, { type: 'predict', p: 0, q: 13 })).toBe(s);
    s = measureReducer(SPEC, s, { type: 'predict', p: 11, q: 13 });
    expect([s.stage, s.cur, s.predicted, s.chain]).toEqual(['pick', [66, 78], [11, 13], [[66, 78]]]);
    expect(firstsUsed(s)).toEqual([2]);
    expect(measureReducer(SPEC, s, { type: 'try', d: 2 }).notice).toEqual({ kind: 'same', d: 2 });
    s = run(SPEC, [{ type: 'try', d: 6 }, { type: 'shown' }, { type: 'end' }], s);
    s = finishCheck(SPEC, s);
    expect(s.stage).toBe('seen');
    expect(s.rounds[0]).toMatchObject({ a: 66, b: 78, mode: 'stages', final: [11, 13] });
    expect(s.rounds[0].runs[1]).toMatchObject({ stages: [{ d: 6 }], end: [11, 13], predicted: [11, 13] });
    expect(s.rounds[0].runs.map((r) => r.end)).toEqual([
      [11, 13],
      [11, 13],
    ]);
    expect(s.rounds[0].refused).toEqual([]);
  });

  it('direct: a plank that leaves a fraction to count again is laid honestly, then he starts again; the gcd ends it', () => {
    let s = run(SPEC, [{ type: 'next' }], { ...initMeasure(SPEC), stage: 'seen' });
    expect([s.ri, s.stage]).toEqual([1, 'pick']);
    expect(measureNow(SPEC, s)).toMatchObject({ mode: 'direct', runs: 1, g: 33 });
    expect(measureReducer(SPEC, s, { type: 'end' })).toBe(s); // no end claim in direct mode
    s = run(SPEC, [{ type: 'try', d: 4 }, { type: 'shown' }], s); // fills neither
    expect([s.stage, s.refused]).toEqual(['pick', [{ d: 4, at: [66, 99] }]]);
    s = run(SPEC, [{ type: 'try', d: 3 }, { type: 'shown' }], s);
    expect(s.chain).toEqual([
      [66, 99],
      [22, 33],
    ]);
    expect(s.stage).toBe('checkRun');
    s = finishCheck(SPEC, s);
    expect([s.stage, s.check.found]).toEqual(['again', 11]);
    expect(s.runs[0]).toMatchObject({ stages: [{ d: 3 }], end: [22, 33], checks: [{ at: [22, 33], found: 11 }] });
    s = measureReducer(SPEC, s, { type: 'again' });
    expect([s.stage, s.cur, s.chain]).toEqual(['pick', [66, 99], [[66, 99]]]);
    s = run(SPEC, [{ type: 'try', d: 33 }, { type: 'shown' }], s);
    s = finishCheck(SPEC, s);
    expect(s.stage).toBe('seen');
    expect(s.rounds.at(-1)).toMatchObject({ a: 66, b: 99, mode: 'direct', final: [2, 3] });
    expect(s.rounds.at(-1).runs.map((r) => r.end)).toEqual([
      [22, 33],
      [2, 3],
    ]);
    s = measureReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(measureResult(s).rounds).toHaveLength(1); // the first round was skipped by the forced state
  });

  it('a fraction that cannot be counted again: one run, the claim checked at once; a prime gcd gives one road', () => {
    const spec = {
      rounds: [
        { a: 11, b: 13, mode: 'stages' },
        { a: 14, b: 21, mode: 'stages', runs: 3 },
      ],
    };
    let s = initMeasure(spec);
    expect(measureNow(spec, s).runs).toBe(1);
    s = finishCheck(spec, measureReducer(spec, s, { type: 'end' }));
    expect([s.stage, s.rounds[0].final, s.rounds[0].runs[0].stages]).toEqual(['seen', [11, 13], []]);
    s = measureReducer(spec, s, { type: 'next' });
    expect(measureNow(spec, s).runs).toBe(1); // 7 is the only plank that opens a road
    // a fraction with 1 above: the world has no plank to try, the run ends
    const one = { rounds: [{ a: 1, b: 5 }] };
    const t = finishCheck(one, measureReducer(one, initMeasure(one), { type: 'end' }));
    expect([t.stage, t.rounds[0].runs[0].checks]).toEqual(['seen', [{ at: [1, 5], found: null }]]);
  });

  it('every road chosen at random through the reducer ends on a/g over b/g (fractions up to 130)', () => {
    let seed = 7;
    const rnd = (n) => {
      seed = (seed * 48271) % 2147483647; // exact in a double
      return Math.floor(seed / 7) % n;
    };
    sweep((check) => {
      for (let k = 0; k < 600; k += 1) {
        const a = 1 + rnd(MAX);
        const b = 1 + rnd(MAX);
        const spec = { rounds: [{ a, b, mode: 'stages', runs: 1 }] };
        let s = initMeasure(spec);
        for (let guard = 0; guard < 40 && s.stage !== 'seen'; guard += 1) {
          const planks = bothPlanks(...s.cur);
          if (planks.length && rnd(4))
            s = run(spec, [{ type: 'try', d: planks[rnd(planks.length)] }, { type: 'shown' }], s);
          else if (rnd(3) === 0) s = run(spec, [{ type: 'try', d: 2 + rnd(Math.max(...s.cur)) }, { type: 'shown' }], s);
          else s = finishCheck(spec, measureReducer(spec, s, { type: 'end' }));
        }
        check(s.stage === 'seen' && s.rounds[0].final.join() === lastOf(a, b).join(), `${a}/${b} ${s.stage}`);
        if (s.stage !== 'seen') continue;
        check(
          s.rounds[0].refused.every((r) => r.at[0] % r.d !== 0 || r.at[1] % r.d !== 0),
          `refused ${a}/${b}`,
        );
      }
    });
  });
});
