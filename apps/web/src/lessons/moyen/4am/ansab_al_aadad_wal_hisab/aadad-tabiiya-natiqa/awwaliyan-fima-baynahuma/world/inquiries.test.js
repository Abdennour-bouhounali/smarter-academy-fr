/**
 * THE EXPERIMENTS of lesson `awwaliyan-fima-baynahuma`: the mirror of ✅ (`PROOF_INQUIRY`) and the two benches of the
 * workshops (`PROOF_BENCH`, `HIDDEN_BENCH`). The shared checks (`describeExperiments`) on each, then the lesson's own:
 * the numbers of each notebook, the bench `plain` and the mirror not, what the screens draw.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Inquiry from '../../../../../../common/gameworld/divisorIsles/Inquiry';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { describeExperiments, plain } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { FORGES } from './forges';
import { HIDDEN_BENCH, PROOF_BENCH, PROOF_INQUIRY } from './inquiries';

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
/** No experiment names a key or what it states, nor the conclusion of the lesson. */
const NEVER = /PGCD|قاسم|مشترك|أوّليّ|فيما بينهما|غير معدوم|آخر باق|الوحيد|وحده|يكفي/;

// ✅'s experiment is the one it keeps in its mirror. The benches are the workshops' notebooks — the TOOL of the lesson
// before (lesson 6's divisions), played on the convoy's own gaps; they are no key's experiment, and both are the
// `ladder` / `divide`: each is checked alone (describeExperiments refuses two keys on one (kind, mode)).
describeExperiments({
  ofKey: { 'ithbat-awwaliyan': PROOF_INQUIRY },
  linesOf: (key, spec) => notebookLines(spec),
  never: NEVER,
  own: { 'ithbat-awwaliyan': /إذا كان|1 وحده|الألواح نفسها/ },
});
describeExperiments({ ofKey: { 'ithbat-awwaliyan': PROOF_BENCH }, linesOf: (k, s) => notebookLines(s), never: NEVER });
describeExperiments({ ofKey: { 'shahid-wahid': HIDDEN_BENCH }, linesOf: (k, s) => notebookLines(s), never: NEVER });

describe('awwaliyan-fima-baynahuma — the experiments', () => {
  it('✅ keeps its experiment in the mirror; 🤝 and ❌ have none (met on the islands)', () => {
    expect(FORGES['ithbat-awwaliyan'].inquiry).toBe(PROOF_INQUIRY);
    expect(FORGES.awwaliyan.inquiry).toBeUndefined();
    expect(FORGES['shahid-wahid'].inquiry).toBeUndefined();
  });
  it('the mirror: two NEW notebooks — 4 rows ending on 1, then 3 ending on 11; never the bench’s 35 and 26', () => {
    const [one, other] = PROOF_INQUIRY.rounds.map(({ a, b }) => ladderOf(a, b, 'divide'));
    expect([one.steps, one.gcd]).toEqual([4, 1]);
    expect([other.steps, other.gcd]).toEqual([3, 11]);
    const bench = PROOF_BENCH.rounds.flatMap(({ a, b }) => [a, b]);
    for (const { a, b } of PROOF_INQUIRY.rounds) for (const x of [a, b]) expect(bench).not.toContain(x);
  });
  it('a bench shows the rows only; the mirror keeps the column of the planks of every row', () => {
    for (const spec of [PROOF_BENCH, HIDDEN_BENCH]) {
      const html = renderToString(createElement(Inquiry, { spec, onDone: () => {} }));
      expect(html).toContain('data-iq-plain');
    }
    const html = renderToString(createElement(Inquiry, { spec: PROOF_INQUIRY, onDone: () => {} }));
    expect(html).toContain('data-iq="ladder"');
    expect(html).not.toContain('data-iq-plain');
    expect(html).toContain('data-iq-ticks="1"');
  });
  it('the plain strings of the mirror (labels, buttons, the goal) carry no formula', () => {
    const T = PROOF_INQUIRY.text;
    for (const x of [T.write, T.planks, T.countLabel, T.finish, T.next, T.done, T.goal(), T.folded(3)]) plain(x);
  });
});
