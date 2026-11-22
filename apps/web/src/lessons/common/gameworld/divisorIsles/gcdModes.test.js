import { describe, it, expect } from 'vitest';
import { gcd, commonPlanks, commonOf, ladderOf } from './inquiry';
import {
  initWitness,
  witnessReducer,
  witnessResult,
  pairOf,
  initPair,
  pairReducer,
  pairResult,
  foldRuns,
  initFold,
  foldReducer,
  foldResult,
  bothOf,
  initBoth,
  bothReducer,
  bothResult,
} from './gcdModes';

/** The loops collect what does not hold (one `expect` at the end); the reference is computed the slow way. */
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
const play = (reducer, spec, actions, from) => actions.reduce((s, a) => reducer(spec, s, a), from);
/** Every order of a small list (the order he may take the planks in). */
const orders = (list) =>
  list.length <= 1
    ? [list]
    : list.flatMap((x, i) => orders([...list.slice(0, i), ...list.slice(i + 1)]).map((o) => [x, ...o]));

/** His round played through the reducer, the planks of the tray taken in `order` (a yes / yes for each). */
const witnessRun = (a, b, order) => {
  const spec = { rounds: [{ a, b, candidates: order }] };
  let s = initWitness();
  for (const d of order) {
    if (s.stage !== 'take') break;
    s = play(
      witnessReducer,
      spec,
      [
        { type: 'take', d },
        { type: 'say', side: 'a', v: true },
        { type: 'say', side: 'b', v: true },
        { type: 'lay' },
        { type: 'shown' },
      ],
      s,
    );
  }
  if (s.stage === 'enough') s = witnessReducer(spec, s, { type: 'enough', v: true });
  return { ...s.rounds[0], stage: s.stage };
};

describe('common · witness — the round ends on the first plank that fills both, or on the empty tray', () => {
  const RULES = [2, 3, 5, 9, 10];
  it('for every pair up to 150 and every order of the rules’ tray', () => {
    const all = orders(RULES);
    sweep((check) => {
      for (let a = 1; a <= 150; a += 1)
        for (let b = 1; b <= 150; b += 1) {
          const any = RULES.some((d) => a % d === 0 && b % d === 0);
          for (const order of a % 7 === 0 ? all : [all[(a * b) % all.length]]) {
            const w = witnessRun(a, b, order);
            const at = `${a} ${b} ${order}`;
            const stop = order.findIndex((d) => a % d === 0 && b % d === 0);
            check(w.stage === 'seen' && any === (w.witness !== null), `${at} witness`);
            check(w.tried.length === (stop < 0 ? order.length : stop + 1), `${at} stop`);
            check(
              w.tried.slice(0, -1).every((r) => !r.both),
              `${at} none before`,
            );
            if (w.witness !== null)
              check(w.witness === order[stop] && gcd(a, b) % w.witness === 0, `${at} divides gcd`);
            // no witness among the rules' planks proves nothing: the pair may still share a longer plank (85 ; 119 → 17)
          }
        }
    });
    expect(witnessRun(85, 119, RULES)).toMatchObject({ witness: null });
    expect(gcd(85, 119)).toBe(17);
    expect(witnessRun(645, 410, [2, 3, 5, 9, 10])).toMatchObject({ witness: 5 });
  });

  const SPEC = {
    kind: 'common',
    mode: 'witness',
    rounds: [
      { a: 645, b: 410, candidates: [2, 3, 5, 9, 10] },
      { a: 85, b: 119, candidates: [2, 3, 5, 9, 10] },
    ],
  };
  const lay = (d, ga, gb) => [
    { type: 'take', d },
    { type: 'say', side: 'a', v: ga },
    { type: 'say', side: 'b', v: gb },
    { type: 'lay' },
    { type: 'shown' },
  ];

  it('the state machine, played with wrong and out-of-stage moves', () => {
    let s = initWitness();
    // a move that does not belong to the stage changes nothing
    expect(witnessReducer(SPEC, s, { type: 'lay' })).toBe(s);
    expect(witnessReducer(SPEC, s, { type: 'enough', v: true })).toBe(s);
    expect(witnessReducer(SPEC, s, { type: 'take', d: 7 })).toBe(s); // not in the tray
    s = witnessReducer(SPEC, s, { type: 'take', d: 2 });
    expect(witnessReducer(SPEC, s, { type: 'lay' })).toBe(s); // nothing said yet
    s = play(
      witnessReducer,
      SPEC,
      [
        { type: 'say', side: 'a', v: true },
        { type: 'say', side: 'b', v: true },
      ],
      s,
    );
    s = play(witnessReducer, SPEC, [{ type: 'lay' }, { type: 'shown' }], s);
    // 2 fills 410 only: back to the tray, kept with his (wrong) prediction
    expect(s.stage).toBe('take');
    expect(s.placed[0]).toMatchObject({ d: 2, holdsA: false, holdsB: true, guessA: true, guessB: true });
    expect(witnessReducer(SPEC, s, { type: 'take', d: 2 })).toBe(s); // already laid
    s = play(witnessReducer, SPEC, lay(5, false, true), s);
    expect(s).toMatchObject({ stage: 'enough', witness: 5 });
    expect(witnessReducer(SPEC, s, { type: 'take', d: 3 })).toBe(s); // the round is over: no more plank
    s = witnessReducer(SPEC, s, { type: 'enough', v: false });
    expect(s.stage).toBe('seen');
    expect(s.rounds[0]).toEqual({
      a: 645,
      b: 410,
      tried: [
        { d: 2, guessA: true, guessB: true, holdsA: false, holdsB: true, both: false },
        { d: 5, guessA: false, guessB: true, holdsA: true, holdsB: true, both: true },
      ],
      witness: 5,
      enough: false,
    });
    // the second round: no plank of the tray fills both — it ends when the tray is empty, with no question
    s = witnessReducer(SPEC, s, { type: 'next' });
    expect(s).toMatchObject({ ri: 1, stage: 'take', placed: [], witness: null });
    for (const d of [10, 9, 5, 3]) s = play(witnessReducer, SPEC, lay(d, false, false), s);
    expect(s.stage).toBe('take');
    s = play(witnessReducer, SPEC, lay(2, false, false), s);
    expect(s.stage).toBe('seen');
    expect(s.rounds[1]).toMatchObject({ witness: null, enough: null });
    expect(s.rounds[1].tried.map((r) => r.d)).toEqual([10, 9, 5, 3, 2]);
    s = witnessReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(witnessResult(s).rounds).toHaveLength(2);
  });
});

describe('nest · pair — the planks of both gaps of (a ; b) and of the second pair', () => {
  it('(a ; b), (b ; a − b) and (b ; r) have exactly the same common planks, for every pair up to 200', () => {
    sweep((check) => {
      for (let a = 2; a <= 200; a += 1)
        for (let b = 1; b < a; b += 1) {
          const probes = [1, 2, 3, b, a - b, a, a + 1];
          const diff = pairOf(a, b, [b, a - b], probes);
          check(diff.equal && same(diff.first, commonPlanks(a, b)), `${a} ${b} diff`);
          diff.rows.forEach((r) => check(r.inFirst === r.inSecond, `${a} ${b} diff p=${r.p}`));
          if (a % b) {
            const rest = pairOf(a, b, [b, a % b], probes);
            check(rest.equal, `${a} ${b} rest`);
          }
        }
    });
    // a second pair that is not one of those: the lists differ (the screen shows it as it is)
    expect(pairOf(152, 95, [95, 60], [1]).equal).toBe(false);
    expect(pairOf(152, 95, [95, 57], [19, 3, 5])).toMatchObject({
      first: [1, 19],
      second: [1, 19],
      equal: true,
      rows: [
        { p: 19, holdsA: true, holdsB: true, holdsX: true, holdsY: true, inFirst: true, inSecond: true },
        { p: 3, holdsA: false, holdsB: false, holdsX: false, holdsY: true, inFirst: false, inSecond: false },
        { p: 5, holdsA: false, holdsB: true, holdsX: true, holdsY: false, inFirst: false, inSecond: false },
      ],
    });
    expect(() => pairOf(12, 12, [12, 0], [1])).toThrow(RangeError);
  });

  it('the state machine: two predictions per probe, then the two lists', () => {
    const SPEC = { kind: 'nest', mode: 'pair', rounds: [{ a: 152, b: 95, pair: [95, 57], probes: [19, 5] }] };
    let s = initPair();
    expect(pairReducer(SPEC, s, { type: 'lay' })).toBe(s);
    expect(pairReducer(SPEC, s, { type: 'next' })).toBe(s);
    s = pairReducer(SPEC, s, { type: 'say', side: 'first', v: true });
    expect(pairReducer(SPEC, s, { type: 'lay' })).toBe(s); // the second not said
    expect(pairReducer(SPEC, s, { type: 'say', side: 'third', v: true })).toBe(s);
    s = play(pairReducer, SPEC, [{ type: 'say', side: 'second', v: false }, { type: 'lay' }], s);
    expect(pairReducer(SPEC, s, { type: 'say', side: 'first', v: false })).toBe(s); // the world is laying it
    s = pairReducer(SPEC, s, { type: 'shown' });
    expect(s).toMatchObject({ stage: 'guess', pi: 1, guessFirst: null, guessSecond: null });
    s = play(
      pairReducer,
      SPEC,
      [
        { type: 'say', side: 'first', v: false },
        { type: 'say', side: 'second', v: false },
        { type: 'lay' },
        { type: 'shown' },
      ],
      s,
    );
    expect(s.stage).toBe('compare');
    expect(s.rounds[0]).toEqual({
      a: 152,
      b: 95,
      pair: [95, 57],
      rows: [
        { p: 19, guessFirst: true, guessSecond: false, inFirst: true, inSecond: true },
        { p: 5, guessFirst: false, guessSecond: false, inFirst: false, inSecond: false },
      ],
      first: [1, 19],
      second: [1, 19],
    });
    s = pairReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(pairResult(s).rounds).toHaveLength(1);
  });
});

describe('ladder · fold — the rows that take away the same gap are one Euclidean division', () => {
  it('every run is a = b × q + r with 0 ≤ r < b, the runs are the rows of the division ladder, for every pair up to 150', () => {
    sweep((check) => {
      for (let a = 1; a <= 150; a += 1)
        for (let b = 1; b <= 150; b += 1) {
          const f = foldRuns(a, b);
          const div = ladderOf(a, b, 'divide');
          const at = `${a} ${b}`;
          check(f.runs.length === div.steps && f.gcd === gcd(a, b), `${at} runs`);
          f.runs.forEach((run, k) => {
            const d = div.rows[k];
            check(run.a === run.b * run.q + run.r && run.r >= 0 && run.r < run.b, `${at} run ${k} division`);
            check(run.a === d.a && run.b === d.b && run.q === d.q && run.r === d.value, `${at} run ${k} = divide row`);
            check(run.to - run.from + 1 === run.q, `${at} run ${k} rows`);
            const rows = f.rows.slice(run.from, run.to + 1);
            check(
              rows.every((r) => r.b === run.b),
              `${at} run ${k} same gap`,
            );
            check(k === 0 || f.runs[k - 1].to + 1 === run.from, `${at} run ${k} contiguous`);
          });
          check(f.runs.at(-1).to === f.steps - 1, `${at} covers`);
        }
    });
    expect(foldRuns(962, 296).runs.map(({ a, b, q, r }) => [a, b, q, r])).toEqual([
      [962, 296, 3, 74],
      [296, 74, 4, 0],
    ]);
  });

  const SPEC = { kind: 'ladder', mode: 'fold', rounds: [{ a: 962, b: 296 }] };
  const ticks = (n) => Array.from({ length: n }, () => ({ type: 'tick' }));

  it('the state machine: the world writes the run, a wrong fold is kept, the world finishes in folded lines', () => {
    let s = initFold();
    expect(s.stage).toBe('write');
    expect(foldReducer(SPEC, s, { type: 'fold', q: 3, r: 74 })).toBe(s); // the rows are not written yet
    s = play(foldReducer, SPEC, ticks(2), s);
    expect(s).toMatchObject({ stage: 'write', written: 2 });
    s = foldReducer(SPEC, s, { type: 'tick' });
    expect(s).toMatchObject({ stage: 'fold', written: 3 });
    expect(foldReducer(SPEC, s, { type: 'tick' })).toBe(s);
    expect(foldReducer(SPEC, s, { type: 'fold', q: -1, r: 74 })).toBe(s);
    s = foldReducer(SPEC, s, { type: 'fold', q: 2, r: 370 });
    expect(s).toMatchObject({ stage: 'fold', miss: { q: 2, r: 370 }, said: { q: 2, r: 370 } });
    s = foldReducer(SPEC, s, { type: 'fold', q: 3, r: 74 });
    expect(s).toMatchObject({ stage: 'finish', lines: 1, miss: null });
    s = foldReducer(SPEC, s, { type: 'tick' });
    expect(s.stage).toBe('seen');
    expect(s.rounds[0]).toEqual({
      a: 962,
      b: 296,
      gcd: 74,
      steps: 7,
      lines: 2,
      folds: [{ rows: [1, 3], a: 962, b: 296, said: { q: 2, r: 370 }, q: 3, r: 74 }],
    });
    s = foldReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(foldResult(s).rounds).toHaveLength(1);
  });

  it('with folds: 2 he folds the second run too, then the ladder ends on his fold', () => {
    const two = { ...SPEC, folds: 2 };
    let s = play(foldReducer, two, [...ticks(3), { type: 'fold', q: 3, r: 74 }], initFold());
    expect(s).toMatchObject({ stage: 'write', run: 1, written: 0, lines: 1 });
    s = play(foldReducer, two, [...ticks(4), { type: 'fold', q: 4, r: 0 }], s);
    expect(s.stage).toBe('seen');
    expect(s.rounds[0].folds.map((f) => f.rows)).toEqual([
      [1, 3],
      [4, 7],
    ]);
  });
});

describe('ladder · both — the two ladders of one pair, and his prediction', () => {
  it('the counts are the true lengths of both algorithms; the same length only for twin gaps, for every pair up to 150', () => {
    sweep((check) => {
      for (let a = 1; a <= 150; a += 1)
        for (let b = 1; b <= 150; b += 1) {
          const o = bothOf(a, b);
          const at = `${a} ${b}`;
          // the slow way: count the subtractions and the divisions of Euclid
          let [x, y] = [Math.max(a, b), Math.min(a, b)];
          let subs = 0;
          let divs = 0;
          for (;;) {
            divs += 1;
            const q = Math.floor(x / y);
            const r = x % y;
            subs += q;
            if (r === 0) break;
            [x, y] = [y, r];
          }
          check(o.steps.subtract === subs && o.steps.divide === divs, `${at} counts`);
          check(o.by === subs - divs && o.shorter === (subs === divs ? 'same' : 'divide'), `${at} shorter`);
          check((o.shorter === 'same') === (a === b), `${at} same only for twins`);
          check(o.gcd === gcd(a, b), `${at} gcd`);
        }
    });
    expect(bothOf(1003, 34)).toMatchObject({ steps: { subtract: 31, divide: 2 }, shorter: 'divide', by: 29 });
    expect(bothOf(45, 45)).toMatchObject({ steps: { subtract: 1, divide: 1 }, shorter: 'same', by: 0 });
  });

  it('the state machine: a prediction first, then both ladders in step, then the counts', () => {
    const SPEC = {
      kind: 'ladder',
      mode: 'both',
      rounds: [
        { a: 1003, b: 34 },
        { a: 45, b: 45 },
      ],
    };
    let s = initBoth();
    expect(bothReducer(SPEC, s, { type: 'tick' })).toBe(s); // nothing runs before he has said
    expect(bothReducer(SPEC, s, { type: 'say', shorter: 'faster', by: 3 })).toBe(s);
    expect(bothReducer(SPEC, s, { type: 'say', shorter: 'divide', by: 0 })).toBe(s); // shorter by 0 rows: not a prediction
    expect(bothReducer(SPEC, s, { type: 'say', shorter: 'divide' })).toBe(s);
    s = bothReducer(SPEC, s, { type: 'say', shorter: 'subtract', by: 5 });
    expect(s).toMatchObject({ stage: 'run', said: { shorter: 'subtract', by: 5 } });
    expect(bothReducer(SPEC, s, { type: 'say', shorter: 'divide', by: 29 })).toBe(s); // said once
    for (let k = 1; k < 31; k += 1) s = bothReducer(SPEC, s, { type: 'tick' });
    expect(s).toMatchObject({ stage: 'run', shown: 30 });
    s = bothReducer(SPEC, s, { type: 'tick' });
    expect(s.stage).toBe('seen');
    expect(s.rounds[0]).toEqual({
      a: 1003,
      b: 34,
      said: { shorter: 'subtract', by: 5 },
      steps: { subtract: 31, divide: 2 },
      shorter: 'divide',
      by: 29,
      gcd: 17,
    });
    s = bothReducer(SPEC, s, { type: 'next' });
    s = bothReducer(SPEC, s, { type: 'say', shorter: 'same', by: 7 });
    expect(s.said).toEqual({ shorter: 'same', by: 0 });
    s = bothReducer(SPEC, s, { type: 'tick' });
    expect(s.stage).toBe('seen');
    s = bothReducer(SPEC, s, { type: 'next' });
    expect(s.done).toBe(true);
    expect(bothResult(s).rounds.map((r) => r.shorter)).toEqual(['divide', 'same']);
  });
});

describe('common — a gap of 0 cells, twins, and the gap 1 (lesson 5, « direct results »)', () => {
  it('0 = d × 0: every plank fills the gap 0, so « both » is the planks of the other gap', () => {
    const c = commonOf(27, 0, [1, 2, 3, 9, 27, 5]);
    expect(c.rows.every((r) => r.holdsB)).toBe(true);
    expect(c.common).toEqual([1, 3, 9, 27]);
    expect(c.longest).toBe(27);
    expect(commonOf(0, 12, [5, 12]).common).toEqual([12]);
    expect(commonOf(27, 27, [1, 3, 9, 27, 2]).longest).toBe(27);
    expect(commonOf(27, 1, [1, 3, 27]).common).toEqual([1]);
    expect(() => commonOf(0, 0, [1])).toThrow(RangeError);
    expect(() => commonOf(27, 0, [0])).toThrow(RangeError);
  });
});
