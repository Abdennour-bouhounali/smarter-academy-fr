/**
 * THE EXPERIMENTS of lesson `ikhtizal-kasr`: none in a mirror — the four keys are met on the islands — and the two
 * benches of the workshops before 🎯 (`THULUTH_BENCH`, `TUSU_BENCH`: the notebook of divisions on a marked bridge's two
 * numbers). The shared checks (`describeExperiments`) on each bench, then the lesson's own: the numbers of each notebook,
 * the benches `plain`, what the screen draws.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Inquiry from '../../../../../../common/gameworld/divisorIsles/Inquiry';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { describeExperiments, plain } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { FORGES } from './forges';
import { THULUTH_BENCH, TUSU_BENCH } from './inquiries';
import { KEYS } from './journey';
import { NUMBERS } from './math';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** Every sentence a notebook of divisions can say on its own rounds, row by row. */
function notebookLines(spec) {
  const T = spec.text;
  const lines = [T.write, T.planks, T.countLabel, T.finish, T.next, T.done];
  for (const k of [1, 2, 3, 11]) lines.push(T.folded(k));
  for (const { a, b } of spec.rounds) {
    const L = ladderOf(a, b, spec.mode);
    lines.push(T.lead(a, b, spec.mode), T.goal(a, b, spec.mode));
    for (let w = 0; w <= L.steps; w += 1) lines.push(T.countAsk({ a, b, mode: spec.mode, written: w }));
    for (const row of L.rows) {
      lines.push(T.ask({ a: row.a, b: row.b, mode: spec.mode, row: 1 }));
      for (const hit of [true, false])
        lines.push(
          T.seen({ ...row, mode: spec.mode, said: hit ? (row.next ?? [0, 0]) : [1, 1], hit: hit && Boolean(row.next) }),
        );
    }
    for (const guessed of [L.steps, L.steps + 2]) {
      const end = { a, b, mode: spec.mode, steps: L.steps, guessed, gcd: L.gcd };
      lines.push(T.end(end), T.foundLine(end));
    }
  }
  return lines;
}
/**
 * A bench names no key and states no rule: never the PGCD, a common divisor, « the longest », a fraction's shortest
 * form, nor the words of the lesson's keys.
 */
const NEVER = /PGCD|قاسم|مشترك|أطول|أكبر|أصغر عدد|اختزال|نختزل|غير قابل|كسر/;

// The benches are the TOOL of lesson 6 (its divisions) on a marked bridge's whole and lit stretch; both are the `ladder`
// / `divide` before the same key: each is checked alone (describeExperiments refuses two keys on one (kind, mode)).
describeExperiments({ ofKey: { 'ikhtizal-pgcd': THULUTH_BENCH }, linesOf: (k, s) => notebookLines(s), never: NEVER });
describeExperiments({ ofKey: { 'ikhtizal-pgcd': TUSU_BENCH }, linesOf: (k, s) => notebookLines(s), never: NEVER });

describe('ikhtizal-kasr — the experiments', () => {
  it('no forge keeps an experiment: the four keys are met on the islands and open on their tiles', () => {
    for (const key of KEYS) {
      expect(FORGES[key].inquiry, key).toBeUndefined();
      expect(FORGES[key].predictCases([]), key).toEqual([]);
    }
  });
  it('the benches: 99 and 66 in two rows (the last divisor 33), 243 and 189 in three (27)', () => {
    const one = ladderOf(NUMBERS.thuluth.gap, NUMBERS.thuluth.mark, 'divide');
    const two = ladderOf(NUMBERS.tusu.gap, NUMBERS.tusu.mark, 'divide');
    expect([one.steps, one.gcd]).toEqual([2, NUMBERS.thuluth.plank]);
    expect([two.steps, two.gcd]).toEqual([3, NUMBERS.tusu.plank]);
  });
  it('a bench shows the rows only — never the planks that fill both numbers', () => {
    for (const spec of [THULUTH_BENCH, TUSU_BENCH]) {
      expect(spec.plain).toBe(true);
      const html = renderToString(createElement(Inquiry, { spec, onDone: () => {} }));
      expect(html).toContain('data-iq="ladder"');
      expect(html).toContain('data-iq-plain');
    }
  });
  it('the plain strings of a bench (labels, buttons, the goal) carry no formula', () => {
    const T = THULUTH_BENCH.text;
    for (const x of [T.write, T.planks, T.countLabel, T.finish, T.next, T.done, T.goal(), T.folded(3)]) plain(x);
  });
});
