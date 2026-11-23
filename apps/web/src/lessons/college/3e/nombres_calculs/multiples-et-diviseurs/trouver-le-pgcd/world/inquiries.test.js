// THE EXPERIMENTS of trouver-le-pgcd: the shared checks (authoring kit) — no two keys share a (kind, mode), no sentence
// names a key or states its rule — over EVERY sentence each experiment and each bench can say on its own numbers, then
// what is this lesson's own: the specs play on the world's logic, the benches keep their state and write it where he
// types the plank (« text.kept »), every sentence is French, and the stall never names a plank.
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  describeExperiments,
  said,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { dealOf } from '../../../../../../common/gameworld/divisorIsles/deal';
import { pairOf } from '../../../../../../common/gameworld/divisorIsles/gcdModes';
import { ladderAsk, ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import {
  MAX_LINES,
  initSheet,
  sheetFrom,
  sheetNow,
  sheetOf,
  sheetReducer,
  zerosOf,
} from '../../../../../../common/gameworld/divisorIsles/sheet';
import { FORGES } from './forges';
import { DEAL_INQUIRY, EUCLIDE_BENCH, PAIR_INQUIRY, SHEET_BENCH } from './inquiries';
import { primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { NUMBERS } from './math';
import { K } from './story';

const { deal: DL, factors: FC, euclide: EU } = NUMBERS;

// ───────────────────────── every sentence each spec can say ─────────────────────────

function dealLines(spec) {
  const T = spec.text;
  const out = [...stringsIn(T.cols), T.toAnswer, T.back, T.check, T.lotsUnit, T.unitA, T.unitB, T.yes, T.no, T.done];
  out.push(T.lead(spec.a, spec.b), T.goal(spec.a, spec.b), T.answerLead({}), T.bound({ max: 12 }));
  out.push(T.choose({ tried: 0 }), T.choose({ tried: 3 }));
  const rows = spec.choices.map((k) => {
    const d = dealOf(spec.a.n, spec.b.n, k);
    return { k, restA: d.rA, restB: d.rB, ok: d.ok, qA: d.qA, qB: d.qB };
  });
  for (const row of rows) {
    out.push(T.ask({ k: row.k }), T.again(row));
    for (const guess of [null, true, false]) out.push(T.dealt({ ...row, guess }));
    const said = { k: row.k, x: row.qA, y: row.qB };
    out.push(T.miss({ kind: 'deal', said, row }), T.miss({ kind: 'deal', said: { ...said, x: 1 }, row }));
    out.push(
      T.miss({ kind: 'bigger', said, row: rows.find((r) => r.k === 6) }),
      T.miss({ kind: 'open', said, row: null }),
    );
  }
  out.push(T.ok({ said: { k: 6, x: 5, y: 7 } }), T.ok({ said: { k: 1, x: 30, y: 42 } }));
  return out;
}

/** Every number a sheet can show: n and its quotients by its primes. */
const sheetsOf = (n) => {
  const out = new Set([n]);
  for (let changed = true; changed; ) {
    changed = false;
    for (const x of [...out])
      for (const p of primeFactors(x))
        if (x / p > 1 && !out.has(x / p)) {
          out.add(x / p);
          changed = true;
        }
  }
  return [...out];
};
function sheetLines(spec) {
  const T = spec.text;
  const out = [T.primeHead, T.prime, T.notebook, T.next, T.done];
  for (const { n } of spec.rounds) {
    out.push(T.lead(n), T.goal(n));
    const factors = primeFactors(n);
    out.push(T.end({ n, factors, attempts: [] }), T.foundLine({ n, factors, attempts: [] }));
    for (const x of sheetsOf(n)) {
      const lines = sheetOf(x, spec.stop);
      const zeros = zerosOf(lines);
      out.push(T.ask({ n: x, lines: lines.length }));
      if (zeros.length) out.push(T.notPrime({ n: x, zeros }), T.notPrime({ n: x, zeros: zeros.slice(0, 1) }));
      for (const l of lines) {
        const a = { type: 'line', before: x, p: l.p, r: l.r, held: l.r === 0, after: l.r ? x : x / l.p };
        out.push(a.held ? T.held(a) : T.miss(a));
      }
    }
  }
  return [...out, ...keptAlong().flat()];
}

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

function pairLines(spec) {
  const T = spec.text;
  const out = [T.lay, T.yes, T.no, T.next, T.done];
  for (const r of spec.rounds) {
    const [x, y] = r.pair;
    const now = pairOf(r.a, r.b, r.pair, r.probes);
    out.push(T.lead(r.a, r.b, r.pair), T.goal(r.a, r.b, r.pair), T.onFirst(r), T.onSecond({ x, y }));
    out.push(T.firstLabel(r.a, r.b), T.secondLabel(x, y), T.compare({ a: r.a, b: r.b, x, y, ...now }));
    for (const row of now.rows) {
      out.push(T.ask({ a: r.a, b: r.b, x, y, p: row.p }));
      for (const first of [true, false])
        out.push(T.seen({ a: r.a, b: r.b, x, y, ...row }, { first, second: row.inSecond }));
      out.push(T.foundLine({ a: r.a, b: r.b, x, y, ...row }));
    }
  }
  return out;
}

/** The states the sheet passes through when he reads its first 0 every time: what `text.kept` writes at each. */
function keptAlong() {
  const out = [];
  let s = initSheet(SHEET_BENCH);
  for (let guard = 0; guard < 200 && !s.done; guard += 1) {
    if (s.stage === 'fill') s = sheetReducer(SHEET_BENCH, s, { type: 'tick' });
    else if (s.stage === 'pick') {
      const p = sheetNow(SHEET_BENCH, s).lines.find((l) => l.r === 0)?.p;
      s = sheetReducer(SHEET_BENCH, s, p == null ? { type: 'prime' } : { type: 'line', p });
    } else s = sheetReducer(SHEET_BENCH, s, { type: 'next' });
    const back = sheetFrom(SHEET_BENCH, s);
    if (back) out.push(SHEET_BENCH.text.kept(back));
  }
  return out;
}

/** The experiment of each key — and the bench of K3, a tool he owns from lesson 1 (K1 has none; K4's bench below). */
const OF_KEY = { [K.lots]: DEAL_INQUIRY, [K.factors]: SHEET_BENCH, [K.euclide]: PAIR_INQUIRY };
const LINES = { [K.lots]: dealLines, [K.factors]: sheetLines, [K.euclide]: pairLines };
/** The words of each key's name and of what it states: none of its experiment (or bench) says them. */
const OWN = {
  [K.lots]: /PGCD|diviseur|planche|pont|fossé|le plus grand nombre/i,
  [K.factors]: /commun|plus petit|PGCD|exposant/i,
  [K.euclide]: /dernier reste|reste qui n’est pas 0|PGCD|les mêmes/i,
};
const NEVER = /lots? identiques|Euclide|algorithme|exposant|diviseurs? communs?/i;

describeExperiments({ ofKey: OF_KEY, linesOf: (key, spec) => LINES[key](spec), never: NEVER, own: OWN });

describe('the experiments of the lesson — its own checks', () => {
  it('K2 and K4 open on their experiment, K1 and K3 on their tiles (the islands were the experiment)', () => {
    expect(FORGES[K.lots].inquiry).toBe(DEAL_INQUIRY);
    expect(FORGES[K.euclide].inquiry).toBe(PAIR_INQUIRY);
    expect(FORGES[K.common].inquiry).toBeUndefined();
    expect(FORGES[K.factors].inquiry).toBeUndefined();
    for (const key of Object.keys(FORGES)) expect(FORGES[key].predictCases([])).toEqual([]);
  });

  it('the division notebook of E: its own (kind, mode), plain, no word of K4, every sentence French', () => {
    const kinds = [...Object.values(OF_KEY), EUCLIDE_BENCH].map((s) => `${s.kind}/${s.mode ?? ''}`);
    expect(new Set(kinds).size).toBe(kinds.length);
    expect(EUCLIDE_BENCH).toMatchObject({ kind: 'ladder', mode: 'divide', plain: true, manual: 2 });
    for (const line of notebookLines(EUCLIDE_BENCH)) {
      said(line);
      expect(line, line).not.toMatch(NEVER);
      expect(line, line).not.toMatch(OWN[K.euclide]);
      expect(typographyErrors(line), line).toEqual([]);
      expect(agreementErrors(line), line).toEqual([]);
    }
  });

  it('the stall: 2, 3, 6 share everything; 5, 10 leave pears; 7 leaves apples; 4, 8, 9, 11, 12 leave both', () => {
    expect([DEAL_INQUIRY.a.n, DEAL_INQUIRY.b.n]).toEqual([DL.apples, DL.pears]);
    const of = (k) => dealOf(DL.apples, DL.pears, k);
    expect(DEAL_INQUIRY.choices.filter((k) => of(k).ok)).toEqual([2, 3, 6]);
    expect(DEAL_INQUIRY.choices.filter((k) => !of(k).rA && of(k).rB)).toEqual([5, 10]);
    expect(DEAL_INQUIRY.choices.filter((k) => of(k).rA && !of(k).rB)).toEqual([7]);
    expect(DEAL_INQUIRY.choices.filter((k) => of(k).rA && of(k).rB)).toEqual([4, 8, 9, 11, 12]);
  });

  it('the sheet of C writes the design’s numbers (868, 434, 217, 31; 490, 245, 49, 7), every sheet ≤ 24 lines', () => {
    expect(SHEET_BENCH.rounds.map((r) => r.n)).toEqual(FC.gaps);
    const seen = keptAlong().at(-1);
    expect(seen).toEqual([
      '$1\\,736 = 2 \\times 2 \\times 2 \\times 7 \\times 31$',
      '$980 = 2 \\times 2 \\times 5 \\times 7 \\times 7$',
    ]);
    for (const { n } of SHEET_BENCH.rounds)
      for (const x of sheetsOf(n)) expect(sheetOf(x, SHEET_BENCH.stop).length).toBeLessThanOrEqual(MAX_LINES);
    const quotients = sheetsOf(FC.gaps[0]);
    for (const x of [868, 434, 217, 31]) expect(quotients).toContain(x);
  });

  it('the sheet KEEPS its state: left half-way, it is read back and its card says how far he went', () => {
    let s = initSheet(SHEET_BENCH);
    while (s.stage === 'fill') s = sheetReducer(SHEET_BENCH, s, { type: 'tick' });
    s = sheetReducer(SHEET_BENCH, s, { type: 'line', p: 2 });
    const back = sheetFrom(SHEET_BENCH, s);
    expect(back).toBeTruthy();
    expect(SHEET_BENCH.text.kept(back)).toEqual(['$1\\,736 = 2 \\times 868$']);
    // a fresh sheet keeps nothing to write
    expect(SHEET_BENCH.text.kept(initSheet(SHEET_BENCH))).toEqual([]);
  });

  it('the notebook of E: three rows, he types the next pair of rows 1 and 2; its card writes the rows it showed', () => {
    const L = ladderOf(...EU.gaps, 'divide');
    expect(L.steps).toBe(3);
    expect(L.gcd).toBe(EU.plank);
    expect(ladderAsk(EUCLIDE_BENCH, 0)).toBe(2);
    expect(EUCLIDE_BENCH.text.kept({ ri: 0, written: 1, stage: 'guess', found: [] })).toEqual([
      '$52\\,015 = 31\\,209 \\times 1 + 20\\,806$',
    ]);
    expect(EUCLIDE_BENCH.text.kept({ ri: 0, written: 3, stage: 'seen', found: [{}] })).toHaveLength(3);
    expect(EUCLIDE_BENCH.text.kept({})).toEqual([]);
  });

  it('the mirror of G: the contrast first (lists differ), then his last two rows (lists equal: 1, 101, 103, 10 403)', () => {
    const [r1, r2] = PAIR_INQUIRY.rounds;
    expect([r1.a, r1.b, ...r1.pair]).toEqual([EU.contrast[0], EU.contrast[1], EU.contrast[0], EU.contrast[2]]);
    const one = pairOf(r1.a, r1.b, r1.pair, r1.probes);
    expect([one.first, one.second, one.equal]).toEqual([[1, 11], [1, 2, 11, 22], false]);
    const two = pairOf(r2.a, r2.b, r2.pair, r2.probes);
    expect([two.first, two.equal]).toEqual([[1, 101, 103, 10403], true]);
    expect([r2.a, r2.b, ...r2.pair]).toEqual([31209, 20806, 20806, 10403]);
    // every probe is drawn: at least 83 px on a 920-px strip (the design's proof)
    for (const r of PAIR_INQUIRY.rounds) {
      const u = 920 / Math.max(r.a, r.b, ...r.pair);
      for (const p of r.probes) expect(p * u, `${r.a} ${p}`).toBeGreaterThanOrEqual(83);
    }
  });

  it('every sentence of every experiment and bench is French: typography and agreement', () => {
    for (const [key, spec] of Object.entries(OF_KEY))
      for (const line of LINES[key](spec)) {
        expect(typographyErrors(line), `${key}: ${line}`).toEqual([]);
        expect(agreementErrors(line), `${key}: ${line}`).toEqual([]);
      }
  });

  it('a plain string holds no formula: labels, goals, units, the stall’s columns', () => {
    const plainOnes = [
      ...stringsIn(DEAL_INQUIRY.text.cols),
      DEAL_INQUIRY.text.goal(),
      DEAL_INQUIRY.text.lotsUnit,
      SHEET_BENCH.text.primeHead,
      SHEET_BENCH.text.notebook,
      ...FC.gaps.map(SHEET_BENCH.text.goal),
      EUCLIDE_BENCH.text.goal(),
      EUCLIDE_BENCH.text.countLabel,
      ...PAIR_INQUIRY.rounds.flatMap((r) => [PAIR_INQUIRY.text.goal(r.a, r.b, r.pair), PAIR_INQUIRY.text.onFirst(r)]),
    ];
    for (const s of plainOnes) expect(s, s).not.toMatch(/\$|\\/);
  });
});
