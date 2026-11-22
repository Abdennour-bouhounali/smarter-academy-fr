import { describe, it, expect } from 'vitest';
import {
  runOp,
  chainOf,
  judge,
  answerOk,
  rodIn,
  initRoundtrip,
  roundtripReducer,
  roundtripResult,
  stepNow,
} from './roundtrip';
import { write, rootOf, times } from './logic';

const SPEC = {
  kind: 'roundtrip',
  rounds: [
    { from: { rod: { root: '23' } }, path: ['build'] },
    { from: { rod: { q: '14' } }, path: ['build', 'take'] },
    { from: { walk: '-9' }, path: ['build', 'take'] },
    { from: { rod: { root: '7' } }, path: ['build', 'take', 'build'] },
  ],
  text: {},
};
const play = (actions, from = initRoundtrip(SPEC), spec = SPEC) =>
  actions.reduce((s, a) => roundtripReducer(spec, s, a), from);
const station = (said) => [{ type: 'say', said }, { type: 'ran' }];

describe('roundtrip — the two stations, exact', () => {
  it('« build » turns a rod into its court; « take » turns a court into its side', () => {
    expect(runOp('build', { rod: { root: '23' } })).toEqual({ court: '23' });
    expect(runOp('build', { rod: { q: '14' } })).toEqual({ court: '196' });
    expect(runOp('take', { court: '196' })).toEqual({ rod: { q: '14' } });
    expect(runOp('take', { court: '23' })).toEqual({ rod: { root: '23' } });
    expect(runOp('build', { walk: '-9' })).toEqual({ court: '81' });
    expect(runOp('take', { court: '81' })).toEqual({ rod: { q: '9' } });
    expect(runOp('build', { rod: { q: '0,5' } })).toEqual({ court: '0,25' });
    expect(runOp('build', { rod: { q: '2/3' } })).toEqual({ court: '4/9' });
    expect(runOp('take', { court: '4/9' })).toEqual({ rod: { q: '2/3' } });
    expect(runOp('take', { court: '2/3' })).toEqual({ rod: { root: '2/3' } });
    expect(rodIn({ walk: '-9' })).toEqual({ q: '-9' });
  });

  it('a station refuses what it cannot take, and a journey must go somewhere', () => {
    expect(() => runOp('take', { rod: { q: '3' } })).toThrow();
    expect(() => runOp('take', { walk: '-3' })).toThrow();
    expect(() => runOp('build', { court: '9' })).toThrow();
    expect(() => runOp('spin', { court: '9' })).toThrow();
    expect(() => chainOf({ from: { rod: { q: '3' } }, path: [] })).toThrow();
    expect(() => chainOf({ from: { rod: { q: '3' } }, path: ['build', 'build'] })).toThrow();
    expect(() => initRoundtrip({ ...SPEC, rounds: [{ from: { rod: { q: '3' } }, path: ['take'] }] })).toThrow();
    expect(() => initRoundtrip({ ...SPEC, rounds: [] })).toThrow();
  });

  it('a chain of three: the wall of 7 → its court → its wall again → the same court', () => {
    expect(chainOf(SPEC.rounds[3])).toEqual([
      { rod: { root: '7' } },
      { court: '7' },
      { rod: { root: '7' } },
      { court: '7' },
    ]);
  });

  it('every rod comes back from its court, every court from its rod, every walk as a length — over the whole range', () => {
    const rods = [];
    for (let k = 0; k <= 400; k += 1) rods.push(String(k / 4).replace('.', ','));
    for (let k = 1; k <= 60; k += 1) rods.push(write(`${k}/7`), write(`${k}/12`), write(times(String(k), '0,01')));
    for (const q of rods) {
      const [, court, back] = chainOf({ from: { rod: { q } }, path: ['build', 'take'] });
      expect(back).toEqual({ rod: { q: write(q) } });
      expect(court.court).toBe(write(times(q, q)));
    }
    for (let n = 1; n <= 40; n += 1) {
      const walk = `-${n}`;
      expect(chainOf({ from: { walk }, path: ['build', 'take'] }).at(-1)).toEqual({ rod: { q: String(n) } });
    }
    for (let a = 0; a <= 1000; a += 1) {
      const [, side, court] = chainOf({ from: { court: String(a) }, path: ['take', 'build'] });
      expect(court).toEqual({ court: String(a) });
      expect(side.rod).toEqual(rootOf(a) != null ? { q: rootOf(a) } : { root: String(a) });
      // a court with no whole side gives its wall, and the wall builds that court exactly
      expect(chainOf({ from: { rod: { root: String(a) } }, path: ['build'] })[1]).toEqual({ court: String(a) });
    }
  });
});

describe('roundtrip — his answer against what came out', () => {
  it('a plaque is right when it is the area', () => {
    expect(judge('build', { area: '23' }, { court: '23' })).toBe(true);
    expect(judge('build', { area: '529' }, { court: '23' })).toBe(false);
    expect(judge('build', { area: '0.25' }, { court: '0,25' })).toBe(true);
    expect(judge('build', { area: '-81' }, { court: '81' })).toBe(false);
  });

  it('a rod is right when it is the same LENGTH, whichever way it is written; a negative number is no length', () => {
    expect(judge('take', { q: '14' }, { rod: { q: '14' } })).toBe(true);
    expect(judge('take', { q: '196' }, { rod: { q: '14' } })).toBe(false);
    expect(judge('take', { q: '-9' }, { rod: { q: '9' } })).toBe(false);
    expect(judge('take', { root: '196' }, { rod: { q: '14' } })).toBe(true);
    expect(judge('take', { root: '23' }, { rod: { root: '23' } })).toBe(true);
    expect(judge('take', { root: '529' }, { rod: { root: '23' } })).toBe(false);
    expect(judge('take', { q: '4,8' }, { rod: { root: '23' } })).toBe(false);
    expect(judge('take', { q: '4/6' }, { rod: { q: '2/3' } })).toBe(true);
  });

  it('only an answer in the station’s shape, that can be read, makes it run', () => {
    expect(answerOk('build', { area: '23' })).toBe(true);
    expect(answerOk('build', { q: '23' })).toBe(false);
    expect(answerOk('build', { area: ',' })).toBe(false);
    expect(answerOk('take', { q: '-9' })).toBe(true);
    expect(answerOk('take', { root: '23' })).toBe(true);
    expect(answerOk('take', { area: '23' })).toBe(false);
    expect(answerOk('take', null)).toBe(false);
  });
});

describe('roundtrip — the state machine, played through', () => {
  it('asks before the first station, runs it, shows it, and goes on station by station', () => {
    let s = initRoundtrip(SPEC);
    expect(s).toMatchObject({ ri: 0, si: 0, stage: 'ask', steps: [], rows: [] });
    expect(stepNow(SPEC, s)).toEqual({ op: 'build', in: { rod: { root: '23' } }, out: { court: '23' }, last: true });
    s = play([{ type: 'say', said: { area: '529' } }], s);
    expect(s).toMatchObject({ stage: 'run', pending: { area: '529' } });
    s = play([{ type: 'ran' }], s);
    expect(s.stage).toBe('seen');
    expect(s.steps).toEqual([
      { op: 'build', in: { rod: { root: '23' } }, out: { court: '23' }, predicted: { area: '529' }, right: false },
    ]);
    expect(s.rows).toHaveLength(1);
    s = play([{ type: 'next' }], s);
    expect(s).toMatchObject({ ri: 1, si: 0, stage: 'ask', steps: [] });
    s = play([...station({ area: '196' }), { type: 'next' }], s);
    expect(s).toMatchObject({ ri: 1, si: 1, stage: 'ask' });
    expect(stepNow(SPEC, s).in).toEqual({ court: '196' });
    s = play(station({ q: '196' }), s);
    expect(s.rows[1]).toEqual({
      from: { rod: { q: '14' } },
      path: ['build', 'take'],
      steps: [
        { op: 'build', in: { rod: { q: '14' } }, out: { court: '196' }, predicted: { area: '196' }, right: true },
        { op: 'take', in: { court: '196' }, out: { rod: { q: '14' } }, predicted: { q: '196' }, right: false },
      ],
    });
  });

  it('the walk to the left: the court holds 81 tiles and the side that comes out is 9; the sign does not come back', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }, ...station({ area: '196' }), { type: 'next' }]);
    s = play([...station({ q: '14' }), { type: 'next' }], s);
    expect(stepNow(SPEC, s)).toMatchObject({ op: 'build', in: { walk: '-9' } });
    s = play([...station({ area: '-81' }), { type: 'next' }, ...station({ q: '-9' })], s);
    expect(s.rows[2].steps.map((x) => [x.out, x.predicted, x.right])).toEqual([
      [{ court: '81' }, { area: '-81' }, false],
      [{ rod: { q: '9' } }, { q: '-9' }, false],
    ]);
  });

  it('a chain of three ends the experiment, and the result keeps every station', () => {
    let s = play([...station({ area: '23' }), { type: 'next' }]);
    s = play([...station({ area: '196' }), { type: 'next' }, ...station({ q: '14' }), { type: 'next' }], s);
    s = play([...station({ area: '81' }), { type: 'next' }, ...station({ q: '9' }), { type: 'next' }], s);
    s = play([...station({ area: '49' }), { type: 'next' }, ...station({ root: '7' }), { type: 'next' }], s);
    s = play([...station({ area: '7' })], s);
    expect(s.stage).toBe('seen');
    s = play([{ type: 'next' }], s);
    expect(s.done).toBe(true);
    const r = roundtripResult(s);
    expect(r.rows).toHaveLength(4);
    expect(r.rows[3].steps.map((x) => [x.op, x.right])).toEqual([
      ['build', false],
      ['take', true],
      ['build', true],
    ]);
    expect(r.rows.flatMap((x) => x.steps).filter((x) => x.right)).toHaveLength(7);
  });

  it('an answer it cannot read is a notice and nothing runs; a move out of its stage changes nothing', () => {
    const s0 = initRoundtrip(SPEC);
    const n = play([{ type: 'say', said: { area: '' } }], s0);
    expect(n).toMatchObject({ stage: 'ask', notice: 'unread' });
    expect(play([{ type: 'say', said: { q: '23' } }], s0).notice).toBe('unread');
    expect(play([{ type: 'say', said: { area: '23' } }], n).notice).toBe(null);
    for (const a of [{ type: 'ran' }, { type: 'next' }, { type: '??' }]) expect(roundtripReducer(SPEC, s0, a)).toBe(s0);
    const r = play([{ type: 'say', said: { area: '23' } }], s0);
    for (const a of [{ type: 'say', said: { area: '1' } }, { type: 'next' }])
      expect(roundtripReducer(SPEC, r, a)).toBe(r);
    const seen = play([{ type: 'ran' }], r);
    for (const a of [{ type: 'say', said: { area: '1' } }, { type: 'ran' }])
      expect(roundtripReducer(SPEC, seen, a)).toBe(seen);
  });

  it('keeps the numbers he typed as the world writes them', () => {
    const s = play(station({ area: '23.0' }));
    expect(s.steps[0].predicted).toEqual({ area: '23' });
    expect(s.steps[0].right).toBe(true);
  });
});
