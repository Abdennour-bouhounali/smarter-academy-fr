// THE EXPERIMENTS of fraction-irreductible: the shared checks (authoring kit) — no two keys share a (kind, mode), no
// sentence names a key or states its rule — over EVERY sentence each experiment can say on its own numbers, then what is
// this lesson's own: the two `measure` specs play the design's numbers on the world's logic (K1 by prime chips, K3 by one
// typed plank), the bench of C keeps its rows, every sentence is French, and no sentence says « premiers entre eux ».
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  describeExperiments,
  said,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { checkOf, countAgain, measureNow, planksUp } from '../../../../../../common/gameworld/divisorIsles/measure';
import { plankOn } from '../../../../../../common/gameworld/divisorIsles/summit';
import { ladderAsk, ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { FORGES } from './forges';
import { NOTEBOOK_BENCH, PGCD_INQUIRY, STRIKE_INQUIRY } from './inquiries';
import { NUMBERS, reduce } from './math';
import { K } from './story';

const { strike: ST, pgcd: PG } = NUMBERS;

// ───────────────────────── every sentence each spec can say ─────────────────────────

/** Every fraction a road of planks (each fills both) can reach from a/b — every stage the screen can show. */
function reachable(a, b, planks) {
  const out = [[a, b]];
  for (let i = 0; i < out.length; i += 1) {
    const [p, q] = out[i];
    for (const d of planks(p, q)) {
      const to = countAgain(p, q, d);
      if (to && !out.some((f) => f[0] === to[0] && f[1] === to[1])) out.push(to);
    }
  }
  return out;
}
function measureLines(spec, tried) {
  const T = spec.text;
  const out = [T.unit, T.lay, T.end, T.predictGo, T.again, T.next, T.done];
  for (const r of spec.rounds) {
    const { a, b, mode } = r;
    out.push(T.lead(a, b, mode), T.goal(a, b, mode), T.predictAsk({ a, b, run: 1, ends: [] }));
    const stages = reachable(a, b, (p, q) => (mode === 'direct' && (p !== a || q !== b) ? [] : tried(p, q)));
    for (const [p, q] of stages) {
      out.push(T.pickAsk({ a, b, p, q, mode, stage: 0, run: 0 }), T.pickAsk({ a, b, p, q, mode, stage: 1, run: 0 }));
      out.push(T.bound({ a, b, p, q, max: Math.max(p, q) }), T.sameRoad({ a, b, d: 2, used: [2] }));
      out.push(T.checkLabel({ p, q }));
      const check = checkOf(p, q);
      if (check.found !== null) out.push(T.checkSeen({ a, b, p, q, ...check }));
      for (const d of tried(p, q)) {
        const f = { ...plankOn(p, q, d), at: [p, q] };
        const to = countAgain(p, q, d);
        if (!to) out.push(T.refused({ a, b, p, q, ...f }));
        else {
          out.push(T.counted({ a, b, d, from: [p, q], to, stage: 1 }));
          const after = checkOf(...to);
          if (mode === 'direct' && after.found !== null)
            out.push(T.notEnough({ a, b, d, end: to, p: to[0], q: to[1], ...after }));
        }
      }
      out.push(T.runLine({ run: 0, chain: '', end: [p, q] }));
    }
    const last = reduce(a, b);
    out.push(T.runEnd({ a, b, mode, run: 0, end: last, chain: [[a, b], last], predicted: null, same: true }));
    out.push(T.foundLine({ a, b, mode, runs: [], refused: [], final: last }));
  }
  return out;
}
/** K1 plays its chips; K3 any length — the design's, the notebook's numbers, the planks of both strips. */
const strikeLines = (spec) => measureLines(spec, () => spec.chips);
const pgcdLines = (spec) =>
  measureLines(spec, (p, q) =>
    [...new Set([2, 9, 19, 38, 342, ...planksUp(p).filter((d) => d <= 400)])].filter((d) => d <= Math.max(p, q)),
  );

function notebookLines(spec) {
  const T = spec.text;
  const out = [T.write, T.planks, T.countLabel, T.finish, T.next, T.done, ...[1, 2, 3, 11].map(T.folded)];
  for (const { a, b } of spec.rounds) {
    const L = ladderOf(a, b, spec.mode);
    out.push(T.lead(a, b, spec.mode), T.goal(a, b, spec.mode));
    L.rows.forEach((r, i) => {
      out.push(T.ask({ a: r.a, b: r.b, mode: spec.mode, row: i + 1 }));
      const f = { ...r, mode: spec.mode };
      out.push(T.seen({ ...f, said: r.next, hit: true }), T.seen({ ...f, said: [r.a, r.value], hit: false }));
      out.push(T.countAsk({ a, b, mode: spec.mode, written: i }));
    });
    for (const guessed of [L.steps, 2, 5])
      out.push(T.end({ a, b, mode: spec.mode, steps: L.steps, guessed, gcd: L.gcd }));
    out.push(T.foundLine({ a, b, mode: spec.mode, steps: L.steps }));
    for (let written = 0; written <= L.steps; written += 1)
      out.push(...T.kept({ ri: 0, written, stage: 'guess', found: [] }));
    out.push(...T.kept({ ri: 0, written: 1, stage: 'seen', found: [{}] }));
  }
  return out;
}

/** The experiment of each key that keeps one (K2 and K4 are met on the islands: no experiment). */
const OF_KEY = { [K.strike]: STRIKE_INQUIRY, [K.pgcd]: PGCD_INQUIRY };
const LINES = { [K.strike]: strikeLines, [K.pgcd]: pgcdLines };
/** The words of each key's name and of what it states: none of its experiment says them. */
const OWN = {
  [K.strike]: /barr|commun|facteurs? premiers?/i,
  [K.pgcd]: /une seule étape|en une étape|dernier reste|diviseurs? communs?/i,
};
/** Words no experiment of the lesson says (the names of its keys, and « premiers entre eux », never said in France here). */
const NEVER = /PGCD|irréductible|simplifi|premiers entre eux|aucun facteur/i;

describeExperiments({ ofKey: OF_KEY, linesOf: (key, spec) => LINES[key](spec), never: NEVER, own: OWN });

describe('the experiments of the lesson — its own checks', () => {
  it('K1 and K3 open on their experiment, K2 and K4 on their tiles (the islands were the situation)', () => {
    expect(FORGES[K.strike].inquiry).toBe(STRIKE_INQUIRY);
    expect(FORGES[K.pgcd].inquiry).toBe(PGCD_INQUIRY);
    expect(FORGES[K.stays].inquiry).toBeUndefined();
    expect(FORGES[K.result].inquiry).toBeUndefined();
    for (const key of Object.keys(FORGES)) expect(FORGES[key].predictCases([])).toEqual([]);
  });

  it('K1: `measure` / `stages`, prime chips only, one road a round — his sign 69/123, then 52/76', () => {
    expect(STRIKE_INQUIRY).toMatchObject({ kind: 'measure', mode: 'stages', typed: false });
    expect(STRIKE_INQUIRY.chips).toEqual([2, 3, 5, 7, 11, 13]);
    expect(STRIKE_INQUIRY.rounds.map((r) => [r.a, r.b, r.mode, r.runs])).toEqual([
      [69, 123, 'stages', 1],
      [52, 76, 'stages', 1],
    ]);
    // his sign's last writing on A: 138/246 by 2
    expect(STRIKE_INQUIRY.rounds[0]).toMatchObject({ a: ST.mark / 2, b: ST.gap / 2 });
    for (let ri = 0; ri < 2; ri += 1) {
      const now = measureNow(STRIKE_INQUIRY, { ri });
      expect([now.typed, now.long, now.runs]).toEqual([false, false, 1]);
      // every chip is prime, and 4 is none: « 2 twice » is SEEN on 52/76
      for (const c of now.chips) expect(planksUp(c)).toEqual([c]);
      expect(Math.max(now.a, now.b)).toBeLessThanOrEqual(130);
    }
    expect(countAgain(69, 123, 3)).toEqual([23, 41]);
    expect(countAgain(52, 76, 2)).toEqual([26, 38]);
    expect(checkOf(26, 38).found).toBe(2);
    expect(countAgain(26, 38, 2)).toEqual([13, 19]);
    expect(checkOf(13, 19).found).toBeNull();
    expect(STRIKE_INQUIRY.text.counted({ d: 3, from: [69, 123], to: [23, 41] })).toBe(
      'En planches de 3 : $69 = 3 \\times 23$ et $123 = 3 \\times 41$.',
    );
  });

  it('K3: `measure` / `direct` on 722/1 786, typed only, long strips — 2 and 19 are not enough, 38 is', () => {
    expect(PGCD_INQUIRY).toMatchObject({ kind: 'measure', mode: 'direct', long: true });
    expect(PGCD_INQUIRY.chips).toBeUndefined();
    const now = measureNow(PGCD_INQUIRY, { ri: 0 });
    expect([now.a, now.b, now.mode, now.typed, now.long, now.chips]).toEqual([722, 1786, 'direct', true, true, null]);
    expect(checkOf(...countAgain(722, 1786, 2)).found).toBe(19);
    expect(checkOf(...countAgain(722, 1786, 19)).found).toBe(2);
    expect(countAgain(722, 1786, 38)).toEqual([19, 47]);
    expect(checkOf(19, 47).found).toBeNull();
    // the notebook's first rest and its last quotient are laid and leave a piece
    expect(countAgain(722, 1786, 342)).toBeNull();
    expect(countAgain(722, 1786, 9)).toBeNull();
    expect(PGCD_INQUIRY.text.notEnough({ a: 722, b: 1786, d: 2, end: [361, 893], found: 19 })).toContain(
      'la planche de 19 remplit encore 361 et 893',
    );
  });

  it('the two keys of one kind have opposite gestures: many prime strikes (stages, chips) / one typed plank (direct)', () => {
    const [k1, k3] = [STRIKE_INQUIRY, PGCD_INQUIRY].map((s) => measureNow(s, { ri: 0 }));
    expect([k1.mode, k1.typed, k1.chips != null]).toEqual(['stages', false, true]);
    expect([k3.mode, k3.typed, k3.chips]).toEqual(['direct', true, null]);
  });

  it('the notebook of C: three rows on (1 786 ; 722), he types two; its card writes the rows it showed', () => {
    expect(NOTEBOOK_BENCH).toMatchObject({ kind: 'ladder', mode: 'divide', plain: true, manual: 2 });
    const L = ladderOf(PG.gap, PG.mark, 'divide');
    expect(L.steps).toBe(3);
    expect(L.gcd).toBe(PG.plank);
    expect(ladderAsk(NOTEBOOK_BENCH, 0)).toBe(2);
    expect(NOTEBOOK_BENCH.text.kept({ ri: 0, written: 3, stage: 'seen', found: [{}] })).toEqual([
      '$1\\,786 = 722 \\times 2 + 342$',
      '$722 = 342 \\times 2 + 38$',
      '$342 = 38 \\times 9 + 0$',
    ]);
    expect(NOTEBOOK_BENCH.text.kept({})).toEqual([]);
    for (const line of notebookLines(NOTEBOOK_BENCH)) {
      said(line);
      expect(line, line).not.toMatch(NEVER);
      expect(line, line).not.toMatch(OWN[K.pgcd]);
      expect(typographyErrors(line), line).toEqual([]);
      expect(agreementErrors(line), line).toEqual([]);
    }
  });

  it('every sentence of every experiment is French: typography and agreement', () => {
    for (const [key, spec] of Object.entries(OF_KEY))
      for (const line of LINES[key](spec)) {
        expect(typographyErrors(line), `${key}: ${line}`).toEqual([]);
        expect(agreementErrors(line), `${key}: ${line}`).toEqual([]);
      }
  });

  it('a plain string holds no formula: goals, units, buttons, the check’s label', () => {
    for (const spec of [STRIKE_INQUIRY, PGCD_INQUIRY]) {
      const T = spec.text;
      const plainOnes = [
        T.unit,
        T.lay,
        T.end,
        T.again,
        T.next,
        T.done,
        T.predictGo,
        ...spec.rounds.flatMap((r) => [T.goal(r.a, r.b, r.mode), T.checkLabel({ p: r.a, q: r.b })]),
      ];
      for (const s of plainOnes) expect(s, s).not.toMatch(/\$|\\/);
    }
    expect(NOTEBOOK_BENCH.text.goal()).not.toMatch(/\$|\\/);
    expect(NOTEBOOK_BENCH.text.countLabel).not.toMatch(/\$|\\/);
  });
});
