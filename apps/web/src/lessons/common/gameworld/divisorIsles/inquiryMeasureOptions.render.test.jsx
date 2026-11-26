// The two options of the investigation `measure` (2026-11-26, for 3e `fraction-irreductible`), both OFF by default:
// `typed: false` (chips only: no typed box, no « lay » button) and `long: true` (a strip of more than ~130 cells: a plank
// too thin to see is ONE band with its count). The design's numbers: K1 69/123 by prime chips; K3 722/1 786 typed —
// 2 → 361/893 (not enough), 19 → 38/94 (not enough), 38 → 19/47 (one stage was enough). Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MeasureView } from './InquiryMeasure';
import { initMeasure, measureNow, measureReducer } from './measure';

globalThis.window = globalThis.window ?? {};

const frac = (f) => (f ? f.join('_') : '-');
const TEXT = {
  lead: () => '§lead',
  goal: () => '§goal',
  pickAsk: () => '§pickAsk',
  unit: '§unit',
  lay: '§lay',
  end: '§end',
  bound: () => '§bound',
  sameRoad: () => '§same',
  refused: (f) => `§refused${f.d}`,
  counted: (f) => `§counted${f.d}`,
  checkLabel: () => '§checkLabel',
  checkSeen: () => '§checkSeen',
  runEnd: (f) => `§runEnd${frac(f.end)}`,
  notEnough: (f) => `§notEnough${f.d}_${frac(f.end)}_${f.found}`,
  predictAsk: () => '§predictAsk',
  predictGo: '§predictGo',
  again: '§again',
  runLine: () => '§runLine',
  foundLine: () => '§found',
  next: '§next',
  done: '§done',
};
const act = { type() {}, pick() {}, lay() {}, end() {}, predict() {}, again() {}, next() {} };
const view = (spec, s) => renderToString(<MeasureView spec={spec} state={s} act={act} />).replaceAll('<!-- -->', '');
const play = (spec, actions, from = initMeasure(spec)) => actions.reduce((s, a) => measureReducer(spec, s, a), from);
const checkDone = (spec, s) => {
  let at = s;
  while (at.stage === 'checkRun') at = measureReducer(spec, at, { type: 'tick' });
  return at;
};
const noWords = (html) =>
  expect(
    html
      .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/§\S+/g, ''),
  ).not.toMatch(/\p{L}{2,}/u);

describe('measure — the options are off by default', () => {
  it('a spec without them keeps the typed box and draws no band', () => {
    const spec = { kind: 'measure', rounds: [{ a: 722, b: 1786, mode: 'direct' }], text: TEXT };
    expect(measureNow(spec, initMeasure(spec))).toMatchObject({ typed: true, long: false });
    const s = play(spec, [{ type: 'try', d: 2 }, { type: 'shown' }]);
    const out = view(spec, initMeasure(spec));
    expect(out).toContain('data-iq-in="plank"');
    expect(out).toContain('data-iq-lay');
    expect(view(spec, s)).not.toContain('data-iq-band');
  });
});

describe('measure — `typed: false`, chips only (K1, 69/123 by the primes)', () => {
  const spec = { kind: 'measure', typed: false, chips: [2, 3, 5, 7], rounds: [{ a: 69, b: 123 }], text: TEXT };
  it('shows the chips, no typed box, no « lay »', () => {
    const out = view(spec, initMeasure(spec));
    noWords(out);
    for (const c of [2, 3, 5, 7]) expect(out).toContain(`data-iq-chip="${c}"`);
    expect(out).not.toContain('data-iq-in="plank"');
    expect(out).not.toContain('data-iq-lay');
    expect(out).toContain('data-iq-end');
  });
  it('a chip still plays: 2 is refused (a piece left), 3 counts both again — 23/41', () => {
    let s = play(spec, [{ type: 'try', d: 2 }, { type: 'shown' }]);
    expect(view(spec, s)).toContain('§refused2');
    s = play(spec, [{ type: 'try', d: 3 }, { type: 'shown' }], s);
    expect(view(spec, s)).toContain('data-iq-chain="69/123,23/41"');
  });
  it('refuses a chips-only spec with no chips (a story’s slip)', () => {
    const bad = { kind: 'measure', typed: false, rounds: [{ a: 69, b: 123 }], text: TEXT };
    expect(() => initMeasure(bad)).toThrow(/needs chips/);
    // a round's own chips are enough
    const own = { kind: 'measure', rounds: [{ a: 69, b: 123, typed: false, chips: [3] }], text: TEXT };
    expect(view(own, initMeasure(own))).not.toContain('data-iq-in="plank"');
  });
});

describe('measure — `long: true` (K3, 722/1 786, typed)', () => {
  const spec = { kind: 'measure', long: true, rounds: [{ a: 722, b: 1786, mode: 'direct' }], text: TEXT };
  it('draws both strips as one bar each, no cell by cell', () => {
    const out = view(spec, initMeasure(spec));
    expect((out.match(/class="iq-gapcell"/g) ?? []).length).toBe(2);
    expect(out).toContain('data-iq-strip="a" data-iq-count="722"');
    expect(out).toContain('data-iq-strip="b" data-iq-count="1786"');
  });
  it('writes 1 786 with its thousands — the strip’s count « 1 786 », the chain « \\dfrac{722}{1\\,786} » (2026-11-26)', () => {
    const out = view(spec, initMeasure(spec));
    expect(out).toMatch(/>1 786<\/text>/);
    expect(out).toContain('\\dfrac{722}{1\\,786}');
    // what a screen reads: no run of four digits outside the attributes and the TeX source of KaTeX
    const seen = out
      .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\\,/g, ' ');
    expect(seen).not.toMatch(/\d{4}/);
  });
  it('2: too thin to see (1 px) — one band and its count on each strip (361, 893); then « not enough », 19 still fills both', () => {
    let s = play(spec, [{ type: 'try', d: 2 }]);
    let out = view(spec, s);
    expect(out).toContain('data-iq-band="361"');
    expect(out).toContain('data-iq-band="893"');
    expect(out).toMatch(/>361<\/text>/);
    noWords(out);
    s = checkDone(spec, play(spec, [{ type: 'shown' }], s));
    out = view(spec, s);
    expect(out).toContain('data-iq-stage="again"');
    expect(out).toContain('§notEnough2_361_893_19');
  });
  it('19: 38 and 94 planks drawn plank by plank (10 px) — not enough, 2 still; 38: 19/47, one stage was enough', () => {
    let s = play(spec, [{ type: 'try', d: 19 }]);
    let out = view(spec, s);
    expect(out).not.toContain('data-iq-band');
    expect((out.match(/iq-plank iq-plank--drop/g) ?? []).length).toBe(38 + 94);
    s = checkDone(spec, play(spec, [{ type: 'shown' }], s));
    expect(view(spec, s)).toContain('§notEnough19_38_94_2');
    s = checkDone(spec, play(spec, [{ type: 'again' }, { type: 'try', d: 38 }, { type: 'shown' }], s));
    out = view(spec, s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-chain="722/1786,19/47"');
    // a typed 342 (the notebook's first rest) is laid and leaves a piece: nothing changes
    const t = play(spec, [{ type: 'try', d: 342 }, { type: 'shown' }]);
    expect(view(spec, t)).toContain('§refused342');
    expect(view(spec, t)).toContain('data-iq-chain="722/1786"');
  });
});
