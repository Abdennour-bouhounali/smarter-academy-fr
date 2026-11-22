import { describe, it, expect } from 'vitest';
import { gcd } from './inquiry';
import {
  divisorsUp,
  plankFill,
  addPair,
  isComplete,
  missingPlank,
  columnsOf,
  commonPlanks,
  longerLinked,
  initLists,
  listsReducer,
  listsNow,
  listsResult,
} from './lists';
import { columnFrame } from './InquiryLists';

const run = (spec, actions, from = initLists(spec)) => actions.reduce((s, a) => listsReducer(spec, s, a), from);
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};
const N = 120;

/** Build a gap's list the way a student would: every plank up to √n typed once (the world writes the partners). */
const buildAll = (n) => {
  const out = [];
  for (let d = 1; d * d <= n; d += 1) out.push({ type: 'try', d }, { type: 'shown' });
  return out;
};
/** Play a whole round without a mistake: both lists, every common plank linked from list a, the longest. */
const playRound = (a, b) => [
  ...buildAll(a),
  { type: 'go' },
  ...buildAll(b),
  { type: 'go' },
  ...commonPlanks(a, b).flatMap((d) => [{ type: 'tap', side: 'a', d }, { type: 'shown' }]),
  { type: 'allLinked' },
  { type: 'pick', d: gcd(a, b) },
];

describe('lists — the logic of listing the planks of two gaps and crossing the lists', () => {
  it('divisorsUp lists every plank of n, the shortest first', () => {
    expect(divisorsUp(32)).toEqual([1, 2, 4, 8, 16, 32]);
    expect(divisorsUp(44)).toEqual([1, 2, 4, 11, 22, 44]);
    expect(divisorsUp(1)).toEqual([1]);
    expect(Math.max(...Array.from({ length: N }, (_, i) => divisorsUp(i + 1).length))).toBe(16);
  });

  it('plankFill is the Euclidean division, and a plank that fills has its partner', () => {
    sweep((check) => {
      for (let n = 1; n <= N; n += 1)
        for (let d = 1; d <= n; d += 1) {
          const f = plankFill(n, d);
          check(f.q * d + f.r === n && f.r >= 0 && f.r < d, `${n} ${d}`);
          check(f.fills === (n % d === 0), `fills ${n} ${d}`);
          check(!f.fills || (f.partner * d === n && divisorsUp(n).includes(f.partner)), `partner ${n} ${d}`);
        }
    });
  });

  it('typing every plank up to √n builds the whole list by pairs; a missing plank is always a real plank', () => {
    sweep((check) => {
      for (let n = 1; n <= N; n += 1) {
        let list = [];
        for (let d = 1; d * d <= n; d += 1) if (n % d === 0) list = addPair(list, n, d);
        check(list.join() === divisorsUp(n).join() && isComplete(n, list), `${n}`);
        // every partial list: the plank shown is missing from it and is a plank of n, and its partner is missing too
        let part = [];
        for (let d = 1; d * d <= n; d += 1) {
          if (n % d !== 0) continue;
          const m = missingPlank(n, part);
          check(m !== null && n % m === 0 && !part.includes(m) && !part.includes(n / m), `missing ${n} ${d}`);
          part = addPair(part, n, d);
        }
        check(missingPlank(n, part) === null, `none ${n}`);
      }
    });
  });

  it('for every pair up to 120: the planks that link are exactly the common planks, the longest is the gcd', () => {
    let widest = 0;
    sweep((check) => {
      for (let a = 1; a <= N; a += 1)
        for (let b = 1; b <= N; b += 1) {
          const A = divisorsUp(a);
          const B = divisorsUp(b);
          // a tap of a plank of either list links exactly when it fills the other gap
          const fromA = A.filter((d) => b % d === 0);
          const fromB = B.filter((d) => a % d === 0);
          const common = commonPlanks(a, b);
          check(fromA.join() === common.join() && fromB.join() === common.join(), `links ${a} ${b}`);
          check(common.join() === A.filter((d) => B.includes(d)).join(), `cross ${a} ${b}`);
          check(Math.max(...common) === gcd(a, b), `longest ${a} ${b}`);
          // a pick shorter than the longest is always answered by a longer linked plank
          common
            .filter((d) => d !== gcd(a, b))
            .forEach((d) => {
              const l = longerLinked(common, d);
              check(l !== null && l > d && common.includes(l), `longer ${a} ${b} ${d}`);
            });
          widest = Math.max(widest, columnsOf(A, B).length);
        }
    });
    // the two lists side by side fit the scene: one column per plank of either list, wide enough for three digits
    const f = columnFrame(widest);
    expect(widest).toBe(22); // 84 and 120
    expect(f.w).toBeGreaterThanOrEqual(40);
  });

  it('the state machine played through every pair up to 120 without a mistake ends on the gcd', () => {
    sweep((check) => {
      for (let a = 1; a <= N; a += 7)
        for (let b = 1; b <= N; b += 1) {
          const spec = { rounds: [{ a, b }] };
          const s = run(spec, playRound(a, b));
          const r = s.rounds[0];
          check(s.stage === 'seen' && s.crown === gcd(a, b), `seen ${a} ${b}`);
          check(
            r?.lists.a.join() === divisorsUp(a).join() && r.lists.b.join() === divisorsUp(b).join(),
            `lists ${a} ${b}`,
          );
          check(r?.links.join() === commonPlanks(a, b).join() && r.firstPick === gcd(a, b), `links ${a} ${b}`);
        }
    });
  });
});

describe('lists — the state machine, wrong moves included', () => {
  const SPEC = {
    rounds: [
      { a: 32, b: 44 },
      { a: 65, b: 39 },
    ],
  };

  it('a plank that fills writes its partner; one that does not adds nothing; a refused length stays in build', () => {
    let s = run(SPEC, [{ type: 'try', d: 99 }]);
    expect(s.stage).toBe('build');
    expect(s.last).toMatchObject({ kind: 'refused', n: 32, d: 99 });
    s = run(SPEC, [{ type: 'try', d: 0 }], s);
    expect(s.last).toMatchObject({ kind: 'refused', d: 0 });
    s = run(SPEC, [{ type: 'try', d: null }], s); // an empty box
    expect(s.last).toMatchObject({ kind: 'refused', d: null });
    s = run(SPEC, [{ type: 'try', d: 4 }], s);
    expect(s.stage).toBe('buildLay');
    expect(run(SPEC, [{ type: 'try', d: 5 }], s)).toBe(s); // the world is laying: nothing else
    s = run(SPEC, [{ type: 'shown' }], s);
    expect(s.lists.a).toEqual([4, 8]);
    expect(s.last).toMatchObject({ kind: 'fill', d: 4, q: 8 });
    s = run(SPEC, [{ type: 'try', d: 5 }, { type: 'shown' }], s);
    expect(s.lists.a).toEqual([4, 8]);
    expect(s.last).toMatchObject({ kind: 'miss', d: 5, q: 6, r: 2 });
    s = run(SPEC, [{ type: 'try', d: 8 }, { type: 'shown' }], s);
    expect(s.last).toMatchObject({ kind: 'again', d: 8, q: 4 });
    expect(s.typed.a).toEqual([
      { d: 4, fills: true, known: false },
      { d: 5, fills: false, known: false },
      { d: 8, fills: true, known: true },
    ]);
  });

  it('« complete » said early shows ONE missing plank; the world closes a full list; then the second gap', () => {
    let s = run(SPEC, [{ type: 'try', d: 4 }, { type: 'shown' }, { type: 'complete' }]);
    expect(s.stage).toBe('build');
    expect(s.lists.a).toEqual([4, 8]); // the list is not given
    expect(s.last).toMatchObject({ kind: 'missing', n: 32, d: 1, q: 32 });
    expect(s.early.a).toEqual([1]);
    s = run(SPEC, [{ type: 'try', d: 1 }, { type: 'shown' }, { type: 'try', d: 2 }, { type: 'shown' }], s);
    expect(s.stage).toBe('closed');
    expect(s.last).toMatchObject({ kind: 'closed', list: [1, 2, 4, 8, 16, 32] });
    expect(run(SPEC, [{ type: 'complete' }], s)).toBe(s);
    s = run(SPEC, [{ type: 'go' }], s);
    expect(s).toMatchObject({ stage: 'build', side: 'b', last: null });
    s = run(SPEC, buildAll(44), s);
    expect(s.stage).toBe('closed');
    s = run(SPEC, [{ type: 'go' }], s);
    expect(s.stage).toBe('link');
    expect(s.lists).toEqual({ a: [1, 2, 4, 8, 16, 32], b: [1, 2, 4, 11, 22, 44] });
  });

  it('links: a wrong one is answered by its division, « all linked » early shows one missing link, then the longest', () => {
    let s = run(SPEC, [...buildAll(32), { type: 'go' }, ...buildAll(44), { type: 'go' }]);
    expect(run(SPEC, [{ type: 'tap', side: 'a', d: 3 }], s)).toBe(s); // not a plank of the list
    s = run(SPEC, [{ type: 'tap', side: 'a', d: 8 }, { type: 'shown' }], s);
    expect(s.links).toEqual([]);
    expect(s.last).toMatchObject({ kind: 'unlinked', d: 8, side: 'a', other: 'b', on: { n: 44, q: 5, r: 4 } });
    s = run(SPEC, [{ type: 'tap', side: 'b', d: 4 }, { type: 'shown' }], s);
    expect(s.links).toEqual([4]);
    expect(s.last).toMatchObject({ kind: 'link', d: 4, qa: 8, qb: 11 });
    expect(run(SPEC, [{ type: 'tap', side: 'a', d: 4 }], s)).toBe(s); // already linked
    s = run(SPEC, [{ type: 'allLinked' }], s);
    expect(s.stage).toBe('link');
    expect(s.last).toMatchObject({ kind: 'linkMissing', d: 1 });
    s = run(
      SPEC,
      [{ type: 'tap', side: 'a', d: 1 }, { type: 'shown' }, { type: 'tap', side: 'a', d: 2 }, { type: 'shown' }],
      s,
    );
    s = run(SPEC, [{ type: 'allLinked' }], s);
    expect(s.stage).toBe('longest');
    expect(run(SPEC, [{ type: 'pick', d: 8 }], s)).toBe(s); // not linked
    s = run(SPEC, [{ type: 'pick', d: 1 }], s);
    expect(s.stage).toBe('longest');
    expect(s.last).toMatchObject({ kind: 'longer', d: 1, longer: 2 });
    s = run(SPEC, [{ type: 'pick', d: 4 }], s);
    expect(s.stage).toBe('seen');
    expect(s.crown).toBe(4);
    expect(s.rounds[0]).toMatchObject({
      a: 32,
      b: 44,
      lists: { a: [1, 2, 4, 8, 16, 32], b: [1, 2, 4, 11, 22, 44] },
      early: { a: [], b: [], links: [1] },
      taps: [
        { d: 8, from: 'a', holds: false },
        { d: 4, from: 'b', holds: true },
        { d: 1, from: 'a', holds: true },
        { d: 2, from: 'a', holds: true },
      ],
      links: [1, 2, 4],
      common: [1, 2, 4],
      picks: [1, 4],
      firstPick: 1,
      longest: 4,
    });
  });

  it('`crown: false` (spec or round): the round ends on its links — no longest asked, nothing crowned', () => {
    const upToLinks = [
      ...buildAll(32),
      { type: 'go' },
      ...buildAll(44),
      { type: 'go' },
      { type: 'tap', side: 'a', d: 4 },
      { type: 'shown' },
    ];
    const links = [1, 2].flatMap((d) => [{ type: 'tap', side: 'b', d }, { type: 'shown' }]);
    for (const spec of [{ crown: false, rounds: [{ a: 32, b: 44 }] }, { rounds: [{ a: 32, b: 44, crown: false }] }]) {
      let s = run(spec, [...upToLinks, { type: 'allLinked' }]);
      expect(s.stage).toBe('link'); // a link missing is still answered by a fact
      expect(s.last).toMatchObject({ kind: 'linkMissing', d: 1 });
      s = run(spec, [...links, { type: 'allLinked' }], s);
      expect(s.stage).toBe('seen');
      expect(s.crown).toBeNull();
      expect(s.last).toEqual({ kind: 'linksDone', links: [1, 2, 4] });
      expect(run(spec, [{ type: 'pick', d: 4 }], s)).toBe(s); // nothing to pick
      expect(s.rounds).toHaveLength(1);
      expect(s.rounds[0]).toMatchObject({ links: [1, 2, 4], common: [1, 2, 4], picks: [], firstPick: null });
      s = run(spec, [{ type: 'next' }], s);
      expect(s.done).toBe(true);
      expect(listsResult(s).rounds).toHaveLength(1);
    }
    // a round may keep its crown while another drops it; a spec without the option plays as before
    const mixed = { crown: false, rounds: [{ a: 32, b: 44, crown: true }] };
    expect(run(mixed, [...upToLinks, ...links, { type: 'allLinked' }]).stage).toBe('longest');
    expect(run(SPEC, [...upToLinks, ...links, { type: 'allLinked' }]).stage).toBe('longest');
  });

  it('the next round starts empty; the last one ends the experiment with every round', () => {
    let s = run(SPEC, playRound(32, 44));
    expect(listsNow(SPEC, s)).toMatchObject({ a: 32, b: 44, longest: 4 });
    s = run(SPEC, [{ type: 'next' }], s);
    expect(s).toMatchObject({ ri: 1, stage: 'build', side: 'a', links: [], crown: null, done: false });
    expect(s.lists).toEqual({ a: [], b: [] });
    s = run(SPEC, [...playRound(65, 39), { type: 'next' }], s);
    expect(s.done).toBe(true);
    const r = listsResult(s);
    expect(r.rounds.map((x) => [x.a, x.b, x.longest, x.links.join()])).toEqual([
      [32, 44, 4, '1,2,4'],
      [65, 39, 13, '1,13'],
    ]);
  });
});
