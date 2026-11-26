// The investigation `crews` (crews.js): every day of the design's proof K4 through the reducer, every row of the final
// mission's table through `daysFact`, K3's two stories played through `story` with wrong chips, a pillar that holds too
// far, wrong read-backs — and the moves that do not belong to a stage, which change nothing.
import { describe, it, expect } from 'vitest';
import {
  allButOne,
  backJudge,
  cycleOf,
  daysFact,
  daysNow,
  daysReducer,
  daysResult,
  initDays,
  initStory,
  lcmOf,
  mapJudge,
  nextTogether,
  storyReducer,
  storyResult,
  windowOf,
  worksOn,
} from './crews';

const FIVE = [1, 2, 3, 4, 5].map((sleep) => ({ sleep }));
const DAYS = {
  kind: 'crews',
  mode: 'days',
  teams: FIVE,
  days: 62,
  stages: [
    { ask: 'zero' },
    { teams: [1, 2], run: 'step' },
    { teams: [1, 2, 3], run: 'fast' },
    { teams: [1, 2, 3, 4], run: 'fast', stopOn: 'all-but-one' },
    { teams: [1, 2, 3, 4, 5], run: 'fast' },
  ],
  text: {},
};
const runDays = (spec, moves, from = initDays()) => moves.reduce((s, a) => daysReducer(spec, s, a), from);
/** Steps until the run stops (on a named day) or meets; resumes after each stop. */
const runOut = (spec, s0) => {
  let s = s0;
  for (let k = 0; k < 2000 && s.phase !== 'met'; k += 1)
    s = daysReducer(spec, s, { type: s.phase === 'stop' ? 'resume' : 'step' });
  return s;
};

describe('crews — days and cycles', () => {
  it('a team works on day 1 and every cycle after; the cycle is work + rest', () => {
    expect(FIVE.map(cycleOf)).toEqual([2, 3, 4, 5, 6]);
    expect([1, 3, 5, 7].every((d) => worksOn(2, d))).toBe(true);
    expect([2, 4, 6].some((d) => worksOn(2, d))).toBe(false);
    expect(worksOn(3, 0)).toBe(false);
    // for every set of cycles ≤ 12 (pairs and triples), the first day they all work again is 1 + their smallest common multiple
    for (let a = 1; a <= 12; a += 1)
      for (let b = 1; b <= 12; b += 1)
        for (let c = 1; c <= 12; c += 1) {
          let d = 2;
          while (![a, b, c].every((x) => worksOn(x, d))) d += 1;
          expect(nextTogether([a, b, c])).toBe(d);
        }
  });

  it('K4 — teams 1–2 meet on day 7, 1–3 on 13, 1–4 on 61, all five on 61; the product would say 721', () => {
    const cycles = FIVE.map(cycleOf);
    expect([[2, 3], [2, 3, 4], [2, 3, 4, 5], cycles].map(nextTogether)).toEqual([7, 13, 61, 61]);
    expect(lcmOf(cycles)).toBe(60);
    expect(cycles.reduce((p, x) => p * x, 1) + 1).toBe(721);
    // four of five work on days 13 (team 4 rests), 25 (4), 31 (3), 37 (4), 49 (4)
    expect(allButOne(cycles, 61)).toEqual([
      { day: 13, team: 4 },
      { day: 25, team: 4 },
      { day: 31, team: 3 },
      { day: 37, team: 4 },
      { day: 49, team: 4 },
    ]);
  });

  it('K4 — the stages played through the reducer, with a wrong answer on day 1 and predictions that are wrong', () => {
    let s = initDays();
    expect(daysNow(DAYS, s).zero).toBe(true);
    // a run before the day is said: nothing; a wrong chip on day 1 is kept and the stage waits
    expect(runDays(DAYS, [{ type: 'step' }, { type: 'say', text: '7' }])).toEqual(s);
    s = runDays(DAYS, [{ type: 'zero', value: 1 }]);
    expect(s).toMatchObject({ phase: 'say', zero: null, zeroTries: [1] });
    s = runDays(DAYS, [{ type: 'zero', value: 0 }, { type: 'next' }], s);
    expect(s).toMatchObject({ si: 1, phase: 'say', zero: 0 });
    // teams 1–2: he says 6 (a rule of the product?), steps day by day to 7
    expect(runDays(DAYS, [{ type: 'say', text: '1' }], s)).toBe(s); // a day ≥ 2 only
    expect(runDays(DAYS, [{ type: 'say', text: 'x' }], s)).toBe(s);
    s = runDays(DAYS, [{ type: 'say', text: '6' }], s);
    expect(s).toMatchObject({ phase: 'run', said: 6 });
    expect(runDays(DAYS, [{ type: 'next' }], s)).toBe(s); // not met yet
    s = runOut(DAYS, s);
    expect(s).toMatchObject({ phase: 'met', day: 7 });
    s = runDays(DAYS, [{ type: 'next' }, { type: 'say', text: '25' }], s);
    // teams 1–3: fast, pause and resume
    s = runDays(DAYS, [{ type: 'step' }, { type: 'pause' }], s);
    expect(s.paused).toBe(true);
    s = runOut(DAYS, runDays(DAYS, [{ type: 'resume' }], s));
    expect(s).toMatchObject({ phase: 'met', day: 13, said: 25 });
    // teams 1–4, stops on the days where four of five work
    s = runDays(DAYS, [{ type: 'next' }, { type: 'say', text: '721' }], s);
    const stops = [];
    for (let k = 0; k < 200 && s.phase !== 'met'; k += 1) {
      s = daysReducer(DAYS, s, { type: s.phase === 'stop' ? 'resume' : 'step' });
      if (s.phase === 'stop') stops.push(s.day);
    }
    expect(stops).toEqual([13, 25, 31, 37, 49]);
    expect(s).toMatchObject({ phase: 'met', day: 61, said: 721 });
    s = runOut(DAYS, runDays(DAYS, [{ type: 'next' }, { type: 'say', text: '61' }], s));
    expect(s.day).toBe(61);
    s = runDays(DAYS, [{ type: 'next' }], s);
    expect(s.done).toBe(true);
    const r = daysResult(s);
    expect(r.zero).toBe(0);
    expect(r.zeroTries).toEqual([1, 0]);
    expect(r.stages.map((x) => [x.teams.length, x.said, x.day])).toEqual([
      [2, 6, 7],
      [3, 25, 13],
      [4, 721, 61],
      [5, 61, 61],
    ]);
    expect(r.stages[2].sleepers.map((x) => x.team)).toEqual([4, 4, 3, 4, 4]);
  });

  it('refuses a stage whose day is past the days drawn', () => {
    const spec = { ...DAYS, days: 40, stages: [{ teams: [1, 2, 3, 4], run: 'fast' }] };
    expect(() => daysNow(spec, initDays())).toThrow(/past the 40 days/);
  });

  it('K4 last step — rests 3, 13, 18: cycles 4, 14, 19 → day 533; the wrong days of the design', () => {
    const c = [4, 14, 19];
    expect(nextTogether(c)).toBe(533);
    expect(daysFact(c, 533).kind).toBe('first');
    expect(daysFact(c, 267)).toMatchObject({ kind: 'some', idle: [0] }); // team A rests
    expect(daysFact(c, 235).kind).toBe('none');
    expect(daysFact(c, 532).kind).toBe('none');
    expect(daysFact(c, 1065).kind).toBe('again');
  });
});

describe('crews — the final mission’s facts (`daysFact`, three ferries 8, 17, 20)', () => {
  const C = [8, 17, 20]; // north, west, south
  it('every row of the mission’s table: who crosses, who is at port — never the answer', () => {
    const rows = {
      2129: ['some', [0], [1, 2]],
      680: ['none', [], [0, 1, 2]],
      2: ['none', [], [0, 1, 2]],
      1: ['start', [0, 1, 2], []],
      2721: ['again', [0, 1, 2], []],
      41: ['some', [0, 2], [1]],
      161: ['some', [0, 2], [1]],
      341: ['some', [1, 2], [0]],
      681: ['first', [0, 1, 2], []],
    };
    for (const [day, [kind, working, idle]] of Object.entries(rows))
      expect(daysFact(C, Number(day)), day).toEqual({ day: Number(day), kind, working, idle });
    // only 681 is « first », for every day up to 3000
    for (let d = 1; d <= 3000; d += 1) expect(daysFact(C, d).kind === 'first').toBe(d === 681);
    expect(daysFact(C, 0).kind).toBe('nan');
    expect(daysFact(C, 2.5).kind).toBe('nan');
  });

  it('the window: 31 days around the typed day, from day 1 at the least', () => {
    expect(windowOf(681)).toEqual({ from: 666, cols: 31 });
    expect(windowOf(2)).toEqual({ from: 1, cols: 31 });
    expect(windowOf(16)).toEqual({ from: 1, cols: 31 });
    expect(windowOf(17)).toEqual({ from: 2, cols: 31 });
  });
});

const STORY = {
  kind: 'crews',
  mode: 'story',
  ruler: 700,
  rounds: [
    {
      text: 'gears',
      unit: { options: ['dent', 'tour', 'roue'], right: 'dent' },
      numbers: [32, 20, 52, 12, 2],
      crews: [32, 20],
      ask: [
        { id: 'teeth', label: 't', value: 160 },
        { id: 'turns32', label: 'a', value: 5 },
        { id: 'turns20', label: 'b', value: 8 },
      ],
    },
    {
      text: 'buses',
      unit: { options: ['minute', 'bus', 'heure'], right: 'minute' },
      numbers: [10, 46, 6, 2, 3],
      crews: [10, 46],
      ask: [{ id: 'at', label: 'h', value: [10, 0], clock: true }],
    },
  ],
  text: {},
};
const st = (moves, from = initStory()) => moves.reduce((s, a) => storyReducer(STORY, s, a), from);
const walk = (action) => ({ type: 'walk', action });
const pillar = (d) => {
  const out = [
    walk({ type: 'take' }),
    walk({ type: 'type', text: String(d) }),
    walk({ type: 'plant' }),
    walk({ type: 'lay' }),
  ];
  for (let k = 0; k < 45; k += 1) out.push(walk({ type: 'tick' }));
  return out;
};

describe('crews — story, played with wrong moves', () => {
  it('judges a chip: the story’s unit; a crew takes a plank of the story that the other crew has not', () => {
    const r = STORY.rounds[0];
    expect(mapJudge(r, { A: null, B: null }, 'unit', 'tour')).toBe(false);
    expect(mapJudge(r, { A: null, B: null }, 'A', 52)).toBe(false); // the sum
    expect(mapJudge(r, { A: null, B: null }, 'A', 12)).toBe(false); // the difference
    expect(mapJudge(r, { A: null, B: null }, 'A', 2)).toBe(false); // the number of wheels
    expect(mapJudge(r, { A: 32, B: null }, 'B', 32)).toBe(false); // the other crew's
    expect(mapJudge(r, { A: 20, B: null }, 'B', 32)).toBe(true); // either order
    expect(backJudge({ clock: true, value: [10, 0] }, { h: '10', min: '00' })).toBe(true);
    expect(backJudge({ clock: true, value: [10, 0] }, { h: '3', min: '50' })).toBe(false);
    expect(backJudge({ clock: true, value: [10, 0] }, undefined)).toBeFalsy();
  });

  it('round 1 — gears: a wrong unit, 52 on A, then 32 and 20; 640 holds (the product), 160 holds; 8 turns refused, then 5', () => {
    // nothing before « Traduis »
    let s = st([{ type: 'chip', slot: 'unit', value: 'dent' }]);
    expect(s).toEqual(initStory());
    s = st([{ type: 'read' }, { type: 'chip', slot: 'unit', value: 'tour' }]);
    expect(s.map.unit).toBe(null);
    expect(s.last).toMatchObject({ type: 'chip', slot: 'unit', value: 'tour', right: false });
    s = st(
      [
        { type: 'chip', slot: 'unit', value: 'dent' },
        { type: 'chip', slot: 'A', value: 52 },
        { type: 'chip', slot: 'A', value: 32 },
        { type: 'chip', slot: 'A', value: 20 }, // A is placed: a second chip on it changes nothing
        { type: 'chip', slot: 'B', value: 32 },
      ],
      s,
    );
    expect(s.map).toEqual({ unit: 'dent', A: 32, B: null });
    // back to the story before any pillar held: refused
    expect(st([{ type: 'back' }], s)).toBe(s);
    s = st([{ type: 'chip', slot: 'B', value: 20 }], s);
    expect(s.stage).toBe('pillar');
    expect(s.mapTries.filter((t) => !t.right).map((t) => t.value)).toEqual(['tour', 52, 32]);
    // 64 does not hold, 640 holds (too far); he could go back on it
    s = st(pillar(64), s);
    expect(s.pillar.now.verdict).toBe('short');
    expect(st([{ type: 'back' }], s)).toBe(s);
    s = st(pillar(640), s);
    expect(s.pillar.now).toMatchObject({ holds: true, verdict: 'paid' });
    s = st(pillar(160), s);
    expect(s.pillar.now.lanes.map((l) => l.planks)).toEqual([5, 8]);
    s = st([{ type: 'back' }], s);
    expect(s.stage).toBe('back');
    // 8 turns for the 32-tooth wheel: refused, the others kept
    s = st(
      [
        { type: 'type', id: 'teeth', value: '160' },
        { type: 'type', id: 'turns32', value: '8' },
        { type: 'type', id: 'turns20', value: '8' },
        { type: 'check' },
      ],
      s,
    );
    expect(s.stage).toBe('back');
    expect(s.last).toMatchObject({ type: 'back', id: 'turns32', said: '8', right: false });
    expect(s.backOk).toEqual({ teeth: true, turns20: true });
    expect(st([{ type: 'type', id: 'teeth', value: '1' }], s)).toBe(s); // a right box is closed
    s = st([{ type: 'type', id: 'turns32', value: '5' }, { type: 'check' }], s);
    expect(s.stage).toBe('seen');
    const r = s.rounds[0];
    expect(r.mapping).toEqual({ unit: 'dent', A: 32, B: 20 });
    expect(r.d).toBe(160);
    expect(r.pillars.map((p) => [p.d, p.holds])).toEqual([
      [64, false],
      [640, true],
      [160, true],
    ]);
    expect(r.said.filter((x) => !x.right)).toEqual([{ id: 'turns32', said: '8', right: false }]);
  });

  it('round 2 — buses: the clock time read back (3 h 50 refused, 10 h 00), then the end', () => {
    // round 2 on its own (round 1 is played above)
    let s = { ...initStory(), ri: 1 };
    s = st(
      [
        { type: 'read' },
        { type: 'chip', slot: 'unit', value: 'heure' },
        { type: 'chip', slot: 'unit', value: 'minute' },
        { type: 'chip', slot: 'A', value: 6 },
        { type: 'chip', slot: 'A', value: 46 },
        { type: 'chip', slot: 'B', value: 10 },
        ...pillar(460),
        ...pillar(230),
        { type: 'back' },
        { type: 'type', id: 'at', value: { h: '3', min: '50' } },
        { type: 'check' },
      ],
      s,
    );
    expect(s.last).toMatchObject({ type: 'back', id: 'at', right: false });
    s = st([{ type: 'type', id: 'at', value: { h: '10', min: '00' } }, { type: 'check' }], s);
    expect(s.stage).toBe('seen');
    expect(s.rounds[0]).toMatchObject({ mapping: { unit: 'minute', A: 46, B: 10 }, d: 230 });
    s = st([{ type: 'next' }], s);
    expect(s.done).toBe(true);
    expect(storyResult(s).rounds).toHaveLength(1);
  });

  it('the pillar of the story is bounded by its own ruler (0 … 700)', () => {
    let s = st([
      { type: 'read' },
      { type: 'chip', slot: 'unit', value: 'dent' },
      { type: 'chip', slot: 'A', value: 32 },
      { type: 'chip', slot: 'B', value: 20 },
      walk({ type: 'type', text: '701' }),
      walk({ type: 'plant' }),
    ]);
    expect(s.pillar.error).toBe('range');
    s = st([walk({ type: 'type', text: '700' }), walk({ type: 'plant' })], s);
    expect(s.pillar.stage).toBe('planted');
  });
});
