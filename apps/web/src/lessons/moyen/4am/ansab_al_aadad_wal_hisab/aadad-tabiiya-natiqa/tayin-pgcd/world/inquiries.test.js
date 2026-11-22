import { describe, it, expect } from 'vitest';
import {
  commonPlanks,
  divisorsUp,
  initLists,
  listsReducer,
  listsResult,
} from '../../../../../../common/gameworld/divisorIsles/lists';
import { LISTS_BENCH } from './inquiries';
import { FORGES } from './forges';
import { NUMBERS } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|null|\[object/);
/** The words of the procedure and of its name, and any word that would point at the plank to make. */
const RULE_WORDS = /قاسم|قواسم|مشترك|احصر|قاطع|أكبر|أطول|أقصر|PGCD|اصنع|قائمة/;
const run = (actions, from = initLists(LISTS_BENCH)) => actions.reduce((s, a) => listsReducer(LISTS_BENCH, s, a), from);
const lay = (ds) => ds.flatMap((d) => [{ type: 'try', d }, { type: 'shown' }]);

describe('the bench of the first workshop — the two lists, facts only', () => {
  it('no forge of the lesson opens on an experiment: the three keys are met on the islands', () => {
    for (const F of Object.values(FORGES)) expect(F.inquiry, F.key).toBeUndefined();
  });

  it('is the `lists` kind on the two gaps of the convoy « lists », with no crown', () => {
    expect(LISTS_BENCH.kind).toBe('lists');
    expect(LISTS_BENCH.crown).toBe(false);
    expect(LISTS_BENCH.rounds).toEqual([{ a: NUMBERS.lists.gaps[0], b: NUMBERS.lists.gaps[1] }]);
    expect(LISTS_BENCH.writes).toBeUndefined();
  });

  it('played through with every wrong move, it ends on the two lists and their links — nothing picked, nothing crowned', () => {
    const [a, b] = NUMBERS.lists.gaps;
    let s = run([{ type: 'try', d: 99 }, ...lay([8, 5]), { type: 'complete' }]);
    expect(s.last).toMatchObject({ kind: 'missing', d: 1 });
    s = run([...lay(divisorsUp(a)), { type: 'go' }, ...lay(divisorsUp(b)), { type: 'go' }], s);
    expect(s.stage).toBe('link');
    s = run([{ type: 'tap', side: 'a', d: 8 }, { type: 'shown' }, { type: 'allLinked' }], s);
    expect(s.last.kind).toBe('linkMissing');
    s = run(
      commonPlanks(a, b).flatMap((d) => [{ type: 'tap', side: 'b', d }, { type: 'shown' }]),
      s,
    );
    s = run([{ type: 'allLinked' }], s);
    expect(s.stage).toBe('seen');
    expect(s.crown).toBeNull();
    s = run([{ type: 'next' }], s);
    expect(s.done).toBe(true);
    const [round] = listsResult(s).rounds;
    expect(round.links).toEqual([1, 2, 4]);
    expect(round.picks).toEqual([]);
  });

  it('every sentence says what the planks just did on the gaps — none names the procedure or a plank to make', () => {
    const T = LISTS_BENCH.text;
    const [a, b] = NUMBERS.lists.gaps;
    const lines = [T.unit, T.lay, T.claim, T.go, T.allLinked, T.next, T.done, T.lead(a, b), T.goal(a, b)];
    for (const n of [a, b]) {
      lines.push(T.listLabel(n), T.buildAsk({ n, list: [] }), T.bound({ n }), T.closed({ n, list: divisorsUp(n) }));
      for (let d = 1; d <= n; d += 1) {
        const q = Math.floor(n / d);
        const r = n % d;
        lines.push(r ? T.misses({ n, d, q, r }) : T.fills({ n, d, q }));
        if (!r) lines.push(T.again({ n, d, q }), T.missing({ n, d, q }));
      }
    }
    lines.push(T.linkAsk({ a, b }), T.linksDone({ a, b, links: commonPlanks(a, b) }));
    for (const d of divisorsUp(a)) {
      const both = { a, b, d, qa: Math.floor(a / d), qb: Math.floor(b / d) };
      if (b % d) lines.push(T.unlinked({ ...both, n: b, q: Math.floor(b / d), r: b % d }));
      else lines.push(T.linked(both), T.linkMissing(both));
    }
    lines.push(T.foundLine({ a, b, links: commonPlanks(a, b) }));
    for (const line of lines) {
      said(line);
      expect(line, line).not.toMatch(RULE_WORDS);
    }
    // the plain strings (SVG labels, the goal, the buttons) carry no formula
    for (const x of [T.goal(a, b), T.listLabel(a), T.unit, T.lay, T.claim, T.go, T.allLinked, T.done])
      expect(x).not.toMatch(/\$|\\/);
    // a list is joined with a no-break space before its comma
    expect(T.closed({ n: a, list: divisorsUp(a) })).toContain(' ،');
    // the steps the bench does not play are not written: no question of the longest
    for (const k of ['longAsk', 'longer', 'crowned']) expect(T[k], k).toBeUndefined();
  });
});
