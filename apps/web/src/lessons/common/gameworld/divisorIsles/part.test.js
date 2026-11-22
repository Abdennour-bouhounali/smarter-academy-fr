import { describe, it, expect } from 'vitest';
import { gcd } from './inquiry';
import { partOf, recutOf, initPart, partReducer, partNow, partResult } from './part';

const run = (spec, actions, from = initPart(spec)) => actions.reduce((s, a) => partReducer(spec, s, a), from);
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
const ticks = (spec, s, stage) => {
  let at = s;
  for (let k = 0; k < 200 && at.stage === stage; k += 1) at = partReducer(spec, at, { type: 'tick' });
  return at;
};

describe('part — the logic of a part re-cut', () => {
  it('partOf adds the strokes; a round that cannot be drawn throws', () => {
    expect(partOf({ whole: 39, strokes: [5, 8] })).toEqual({ whole: 39, strokes: [5, 8], painted: 13 });
    expect(() => partOf({ whole: 10, strokes: [5, 5] })).toThrow(RangeError); // the whole painted
    expect(() => partOf({ whole: 10, strokes: [] })).toThrow(RangeError);
    expect(() => partOf({ whole: 1, strokes: [1] })).toThrow(RangeError);
  });

  it('a re-cut never moves the painted length, and exists exactly when the plank fills the part and the whole', () => {
    sweep((check) => {
      for (let whole = 2; whole <= 130; whole += 1)
        for (let painted = 1; painted < whole; painted += 1)
          for (let d = 2; d <= whole; d += 1) {
            const r = recutOf(painted, whole, d);
            const fills = painted % d === 0 && whole % d === 0;
            check((r !== null) === fills, `${painted}/${whole} ${d}`);
            if (!r) continue;
            check(r.paintedEnd === painted, `end ${painted}/${whole} ${d}`);
            check(r.cuts.at(-1) === whole && r.cuts.length === r.to[1], `cuts ${painted}/${whole} ${d}`);
            check(r.cuts.includes(painted), `a cut on the painted end ${painted}/${whole} ${d}`);
            check(r.to[0] * whole === r.to[1] * painted, `equal ${painted}/${whole} ${d}`);
          }
    });
    expect(recutOf(13, 39, 13)).toMatchObject({ to: [1, 3], cuts: [13, 26, 39], paintedEnd: 13 });
  });
});

const SPEC = {
  kind: 'part',
  rounds: [
    { whole: 39, strokes: [5, 8], chips: [2, 3, 13] },
    { whole: 22, strokes: [6, 9] }, // 15/22: only the plank 1 is common
  ],
};

describe('part — the state machine plays a whole experiment', () => {
  it('the world paints the strokes, he writes the cells painted, a wrong writing changes nothing', () => {
    let s = initPart(SPEC);
    expect([s.stage, s.shown]).toEqual(['paint', 0]);
    expect(partReducer(SPEC, s, { type: 'write', p: 13, q: 39 })).toBe(s); // not before the paint
    s = partReducer(SPEC, s, { type: 'tick' });
    expect([s.stage, s.shown]).toEqual(['paint', 1]);
    s = partReducer(SPEC, s, { type: 'tick' });
    expect([s.stage, s.shown]).toEqual(['write', 2]);
    expect(partReducer(SPEC, s, { type: 'write', p: 0, q: 39 })).toBe(s);
    s = partReducer(SPEC, s, { type: 'write', p: 8, q: 39 });
    expect([s.stage, s.writes]).toEqual(['write', [{ p: 8, q: 39, ok: false }]]);
    s = partReducer(SPEC, s, { type: 'write', p: 13, q: 39 });
    expect([s.stage, s.writing]).toEqual(['pick', [13, 39]]);
  });

  it('a plank that does not fill both is laid and answered; one that does re-cuts the strip: 13/39 = 1/3', () => {
    let s = run(SPEC, [{ type: 'tick' }, { type: 'tick' }, { type: 'write', p: 13, q: 39 }]);
    expect(partReducer(SPEC, s, { type: 'try', d: 40 }).notice).toEqual({ kind: 'bound', d: 40 });
    expect(partReducer(SPEC, s, { type: 'try', d: 1 }).notice).toEqual({ kind: 'bound', d: 1 });
    s = run(SPEC, [{ type: 'try', d: 3 }, { type: 'shown' }], s);
    expect([s.stage, s.last.ra, s.last.rb, s.cut, s.writing]).toEqual(['pick', 1, 0, 1, [13, 39]]);
    // the claim « none »: the world tries the planks of 13 on 39 and finds 13
    s = partReducer(SPEC, s, { type: 'none' });
    expect(s.stage).toBe('checkRun');
    s = ticks(SPEC, s, 'checkRun');
    expect([s.stage, s.claims]).toEqual(['pick', [{ found: 13 }]]);
    s = run(SPEC, [{ type: 'try', d: 13 }, { type: 'shown' }], s);
    expect([s.stage, s.cut, s.writing]).toEqual(['seen', 13, [1, 3]]);
    expect(s.rounds[0]).toEqual({
      whole: 39,
      strokes: [5, 8],
      writes: [{ p: 13, q: 39, ok: true }],
      tried: [3, 13],
      claims: [{ found: 13 }],
      cut: 13,
      final: [1, 3],
    });
  });

  it('a round where only the plank 1 is common: his claim « none » ends it, the writing unchanged', () => {
    let s = run(SPEC, [{ type: 'next' }], { ...initPart(SPEC), stage: 'seen' });
    expect([s.ri, s.stage]).toEqual([1, 'paint']);
    expect(partNow(SPEC, s)).toMatchObject({ whole: 22, painted: 15, chips: null });
    s = ticks(SPEC, s, 'paint');
    s = run(SPEC, [{ type: 'write', p: 15, q: 22 }, { type: 'try', d: 5 }, { type: 'shown' }, { type: 'none' }], s);
    expect(s.check.tried.map((t) => t.d)).toEqual([3, 5, 15]);
    s = ticks(SPEC, s, 'checkRun');
    expect(s.stage).toBe('seen');
    expect(s.rounds.at(-1)).toMatchObject({ final: [15, 22], cut: 1, claims: [{ found: null }], tried: [5] });
    s = partReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(partResult(s).rounds).toHaveLength(1);
  });

  it('played through for every whole up to 60 and every painted part: the final writing is a re-cut of painted/whole', () => {
    sweep((check) => {
      for (let whole = 2; whole <= 60; whole += 1)
        for (let painted = 1; painted < whole; painted += 1) {
          const strokes = painted > 1 ? [1, painted - 1] : [1];
          const spec = { rounds: [{ whole, strokes }] };
          let s = ticks(spec, initPart(spec), 'paint');
          s = partReducer(spec, s, { type: 'write', p: painted, q: whole });
          const g = gcd(painted, whole);
          if (g > 1) s = run(spec, [{ type: 'try', d: g }, { type: 'shown' }], s);
          else s = ticks(spec, partReducer(spec, s, { type: 'none' }), 'checkRun');
          const f = s.rounds[0]?.final;
          check(s.stage === 'seen' && f[0] * whole === f[1] * painted && gcd(f[0], f[1]) === 1, `${painted}/${whole}`);
        }
    });
  });
});
