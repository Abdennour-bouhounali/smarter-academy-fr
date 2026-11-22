/**
 * THE EXPERIMENTS of lesson `jidhr-tarbii`: ✍️ `calc` and 🔁 `roundtrip` (key 🔑 has none — it is met on the courts).
 * The shared checks (`describeExperiments`: no two keys share a (kind, mode); no sentence names a key or states its
 * rule; Arabic agreement), then the lesson's own: every sentence each screen can say, in every state its reducer can
 * reach, is a FACT; the numbers are the story's; the screens render whole; the plain strings carry no formula.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Inquiry from '../../../../../../common/gameworld/rootCourts/Inquiry';
import { CalcView } from '../../../../../../common/gameworld/rootCourts/InquiryCalc';
import { RoundtripView } from '../../../../../../common/gameworld/rootCourts/InquiryRoundtrip';
import { initCalc, calcReducer, zoomTex, MAX_CELL } from '../../../../../../common/gameworld/rootCourts/calc';
import { longestCell } from '../../../../../../common/gameworld/rootCourts/test/calcTable';
import { chainOf, initRoundtrip, roundtripReducer } from '../../../../../../common/gameworld/rootCourts/roundtrip';
import { rootOf, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { describeExperiments, plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { FORGES, calculator } from './forges';
import { BUILD, CALC_INQUIRY, ROUNDTRIP_INQUIRY, ROUNDTRIP_NUMBERS, TAKE } from './inquiries';
import { CALCULATOR, COURTS, STORY } from './story';
import { KEYS } from './tablets';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

const [K1, K2, K3] = KEYS;

/** Every state of the `calc` experiment, its predictions right or wrong, every press of the magnifier. */
function calcStates(sayOf) {
  const out = [];
  let s = initCalc(CALC_INQUIRY);
  out.push(s);
  while (!s.done) {
    const a =
      s.stage === 'say'
        ? { type: 'say', v: sayOf(s) }
        : {
            build: { type: 'built' },
            zoom: { type: 'zoom' },
            seen: { type: 'next' },
            wall: { type: 'clamp' },
            clamping: { type: 'clamped' },
          }[s.stage];
    s = calcReducer(CALC_INQUIRY, s, a);
    out.push(s);
  }
  return out;
}
const CALC_STATES = [...calcStates(() => true), ...calcStates(() => false)];

/** Every sentence the `calc` screen can say. */
function calcLines() {
  const T = CALC_INQUIRY.text;
  const a = CALC_INQUIRY.a;
  const lines = [T.lead({ a }), T.goal({ a }), T.wallAsk({ a, rows: [] }), T.wallNote({ a })];
  for (const s of CALC_STATES) {
    if (s.stage === 'say' || s.stage === 'build')
      lines.push(T.ask({ a, i: s.i, q: s.rod?.q ?? null, calc: s.calc, wall: s.wall }));
    const row = ['zoom', 'seen'].includes(s.stage) ? s.rows.at(-1) : null;
    if (!row) continue;
    const args = {
      ...row,
      q: row.s.q ?? null,
      wall: row.s.root != null,
      right: row.predicted === (row.kind === 'ride'),
      k: s.zk,
      need: s.need,
      zoom: zoomTex(s.zk),
    };
    lines.push(s.stage === 'zoom' ? T.thin(args) : T.fact(args));
  }
  return lines;
}
const CALC_PLAIN = [
  'wallName',
  'unknown',
  'yes',
  'no',
  'zoomIn',
  'colRod',
  'colCovers',
  'colDiff',
  'band',
  'jam',
  'rides',
  'clamp',
  'next',
  'done',
];

/** Every answer a student types at a station: the right one, and the errors the forge fights. */
const answersAt = (op, out) => {
  if (op === 'build') {
    const a = out.court;
    return [{ area: a }, { area: write(`${Number(a.replace(',', '.')) ** 2}`) }, { area: `-${a}` }];
  }
  const r = out.rod;
  return r.root != null ? [{ root: r.root }, { q: r.root }] : [{ q: r.q }, { q: `-${r.q}` }, { root: r.q }];
};
/** Every sentence the `roundtrip` screen can say, at every station of every journey, whatever he typed. */
function roundtripLines() {
  const T = ROUNDTRIP_INQUIRY.text;
  const lines = [T.goal({}), T.unread];
  const n = ROUNDTRIP_INQUIRY.rounds.length;
  ROUNDTRIP_INQUIRY.rounds.forEach((r, i) => {
    const chain = chainOf(r);
    lines.push(T.lead({ i, n, from: r.from, path: r.path, si: 0 }));
    r.path.forEach((op, si) => {
      const args = { i, n, from: r.from, path: r.path, si, op, in: chain[si] };
      lines.push(op === 'build' ? T.askBuild(args) : T.askTake(args));
      for (const x of answersAt(op, chain[si + 1])) {
        const st = { op, in: chain[si], out: chain[si + 1], predicted: x };
        for (const right of [true, false])
          lines.push(T.ran({ ...st, said: x, right, si, last: si + 1 >= r.path.length, from: r.from, path: r.path }));
      }
    });
  });
  return lines;
}
/** The plain strings of the roundtrip screen: labels in SVG, buttons, the goal. */
function roundtripPlain() {
  const T = ROUNDTRIP_INQUIRY.text;
  const things = ROUNDTRIP_INQUIRY.rounds.flatMap(chainOf);
  return [
    T.goal({}),
    T.buildName,
    T.takeName,
    T.tiles,
    T.formNumber,
    T.formWall,
    T.wallBox,
    T.run,
    T.unknown,
    T.go,
    T.next,
    T.done,
    ...things.filter((t) => t.court != null).map((t) => T.plaque({ area: t.court })),
    ...things.filter((t) => t.rod?.root != null).map((t) => T.wallLabel({ area: t.rod.root })),
  ];
}

/**
 * Never in an experiment: the words of key ✍️ (exact, approximate, value) and the sign √ in ✍️'s; the words of key 🔁
 * (go and come back, undo, inverse) and any square or root in 🔁's; and in both, « wrong ».
 */
const NEVER = /خطأ|خاطئ|غلط|قيمة|مضبوط|بالضبط|مقرّب|مقرب|تقريب/;
const OWN = { [K2]: /√|\\sqrt|جذر/, [K3]: /√|\\sqrt|جذر|مربّع|مربع|ذهاب|إياب|يلغي|تلغي|عكس|\^/ };

describeExperiments({
  ofKey: { [K2]: CALC_INQUIRY, [K3]: ROUNDTRIP_INQUIRY },
  linesOf: (key) => (key === K2 ? calcLines() : roundtripLines()),
  never: NEVER,
  own: OWN,
});

/** What the student SEES on a rendered screen: the text, without tags nor KaTeX's hidden TeX source. */
const seen = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');

describe('jidhr-tarbii — the experiments', () => {
  it('key 🔑 has none: it is met on the courts; ✍️ and 🔁 open on their own, of two kinds', () => {
    expect(FORGES[K1].inquiry).toBeUndefined();
    expect(FORGES[K2].inquiry).toBe(CALC_INQUIRY);
    expect(FORGES[K3].inquiry).toBe(ROUNDTRIP_INQUIRY);
    expect([CALC_INQUIRY.kind, ROUNDTRIP_INQUIRY.kind]).toEqual(['calc', 'roundtrip']);
  });
  it('✍️ is the court of 30, its rods 5 then 5,5 then the calculator’s ten digits — the story’s, never retyped', () => {
    expect(CALC_INQUIRY.a).toBe(COURTS.first);
    expect(CALC_INQUIRY.rods).toEqual([{ q: '5' }, { q: '5,5' }, { calc: CALCULATOR }]);
    expect(CALC_INQUIRY.wall).toBe(true);
    expect(calculator(COURTS.first)).toBe(CALCULATOR);
  });
  it('✍️ writes no number longer than its table holds: the calculator’s row is the longest, 21 characters', () => {
    // screenshot review 2026-11-21: « 0,00000000565919375 » and its zoom ran past the column; the layout is computed for
    // MAX_CELL (rootCourts/calc.js › CALC_LAYOUT), and this lesson's longest cell is bound here
    expect(longestCell(CALC_INQUIRY)).toBeLessThanOrEqual(MAX_CELL);
    expect(longestCell(CALC_INQUIRY)).toBe(21);
  });
  it('the experiments open only after tablet 🔑: the calculator once he is back with key 🔑 and has found the nearest mark, the stations with ✍️', () => {
    const game = (keys, ridden = {}, flags = {}) => ({ state: { keys }, ridden, flags });
    const feature = (id) => STORY.terraces.find((t) => t.feature?.id === id).feature;
    expect([feature('calc').forge, feature('stations').forge]).toEqual([K2, K3]);
    expect(STORY.featureOpen(game([]), feature('calc'))).toBe(false);
    expect(STORY.featureOpen(game([], { c49: true }), feature('calc'))).toBe(false);
    // back with key 🔑 is not enough: he first finds the nearest mark of the rod on the court of 30 (`flags.near`)
    expect(STORY.featureOpen(game([K1], { c49: true }), feature('calc'))).toBe(false);
    expect(STORY.featureOpen(game([K1], { c49: true }, { near: true }), feature('calc'))).toBe(true);
    expect(STORY.featureOpen(game([K1]), feature('stations'))).toBe(false);
    expect(STORY.featureOpen(game([K1, K2]), feature('stations'))).toBe(true);
  });
  it('🔁: the wall of 23, the rod of the last court (14 → 196), nine steps left, a chain of three from the wall of 29', () => {
    expect(ROUNDTRIP_NUMBERS.rod).toBe(rootOf(COURTS.last));
    expect(ROUNDTRIP_INQUIRY.rounds.map((r) => r.path.length)).toEqual([1, 2, 2, 3]);
    expect(ROUNDTRIP_INQUIRY.rounds[2].from).toEqual({ walk: '-9' });
    expect(chainOf(ROUNDTRIP_INQUIRY.rounds[1]).at(-2)).toEqual({ court: COURTS.last });
    expect(chainOf(ROUNDTRIP_INQUIRY.rounds[2]).slice(1)).toEqual([{ court: '81' }, { rod: { q: '9' } }]);
    // the stations are named as the story names them on its terrace
    const names = STORY.terraces.find((t) => t.feature?.kind === 'stations').feature.names;
    expect([BUILD, TAKE]).toEqual(names);
  });
  it('a sentence through MathText is worded; a plain string (a label in SVG, a button, the goal) holds no formula', () => {
    for (const x of [...calcLines(), ...roundtripLines()]) said(x);
    for (const k of CALC_PLAIN) plain(CALC_INQUIRY.text[k]);
    plain(CALC_INQUIRY.text.goal({ a: CALC_INQUIRY.a }));
    for (const x of roundtripPlain()) plain(x);
  });
  it('a miss is answered by what happened, opened by « توقّعك لم يصب هذه المرّة »', () => {
    const miss = calcStates(() => true).find((s) => s.stage === 'seen');
    const row = miss.rows.at(-1);
    expect(CALC_INQUIRY.text.fact({ ...row, wall: false, right: false, k: 0 })).toMatch(/^توقّعك لم يصب هذه المرّة/);
  });
  it('the calc screen renders whole in every state, and shows none of the rule’s words nor its sign', () => {
    const act = { say() {}, zoom() {}, next() {}, clamp() {} };
    for (const s of CALC_STATES) {
      const out = renderToString(createElement(CalcView, { spec: CALC_INQUIRY, state: s, act }));
      expect(out).not.toMatch(/undefined|NaN/);
      expect(seen(out)).not.toMatch(/√|جذر|قيمة|مضبوط|بالضبط|مقرّب|مقرب|تقريب|خطأ/);
    }
    expect(renderToString(createElement(Inquiry, { spec: CALC_INQUIRY, onDone: () => {} }))).toContain(
      'data-iq="calc"',
    );
  });
  it('the roundtrip screen renders whole at every station, whatever he typed, and shows no square nor root', () => {
    const act = { type() {}, form() {}, run() {}, next() {} };
    let s = initRoundtrip(ROUNDTRIP_INQUIRY);
    let k = 0;
    while (!s.done) {
      for (const input of [
        { text: '', form: 'number' },
        { text: '-9', form: 'number' },
        { text: '23', form: 'wall' },
      ]) {
        const out = renderToString(createElement(RoundtripView, { spec: ROUNDTRIP_INQUIRY, state: s, act, input }));
        expect(out).not.toMatch(/undefined|NaN/);
        expect(seen(out)).not.toMatch(/√|جذر|مربّع|مربع|خطأ/);
      }
      if (s.stage === 'ask') {
        const r = ROUNDTRIP_INQUIRY.rounds[s.ri];
        const [x] = answersAt(r.path[s.si], s.chain[s.si + 1]);
        s = roundtripReducer(ROUNDTRIP_INQUIRY, s, {
          type: 'say',
          said: k % 2 ? x : answersAt(r.path[s.si], s.chain[s.si + 1]).at(-1),
        });
        k += 1;
      } else s = roundtripReducer(ROUNDTRIP_INQUIRY, s, { type: s.stage === 'run' ? 'ran' : 'next' });
    }
    expect(renderToString(createElement(Inquiry, { spec: ROUNDTRIP_INQUIRY, onDone: () => {} }))).toContain(
      'data-iq="roundtrip"',
    );
  });
  it('a walk to the left is written in a formula (« -9 » in plain Arabic would be turned round)', () => {
    for (const x of roundtripLines()) expect(x, x).not.toMatch(/(?<!\$[^$]*)-\d/);
  });
});
