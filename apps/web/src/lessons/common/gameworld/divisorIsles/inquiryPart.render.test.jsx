import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { PartView } from './InquiryPart';
import { initPart, partReducer } from './part';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

const frac = (f) => (f ? f.join('_') : '-'); // a fraction written « a_b » in the fixture's words, never « a/b »
/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `part` »), as plain tags. */
const SPEC = {
  kind: 'part',
  rounds: [
    { whole: 39, strokes: [5, 8], chips: [2, 3, 13] },
    { whole: 22, strokes: [6, 9] },
  ],
  text: {
    lead: (whole, strokes) => `lead(${whole},${strokes.join('.')})`,
    goal: (whole) => `goal(${whole})`,
    painted: (f) => `painted[${f.k}:${f.stroke}:${f.so.join('.')}]`,
    writeAsk: (f) => `writeAsk[${f.whole}]`,
    write: 'write',
    writeMiss: (f) => `writeMiss[${frac([f.said.p, f.said.q])}:${f.okP}:${f.okQ}]`,
    written: (f) => `written[${f.p}_${f.q}]`,
    pickAsk: (f) => `pickAsk[${f.painted}_${f.whole}]`,
    unit: 'cells',
    lay: 'lay',
    none: 'none',
    bound: (f) => `bound[${f.max}]`,
    refused: (f) => `refused[${f.d}:${f.ra}:${f.rb}]`,
    checkLabel: (f) => `checkLabel[${f.painted}]`,
    checkSeen: (f) => `checkSeen[${f.found}]`,
    recut: (f) => `recut[${f.d}:${frac(f.from)}~${frac(f.to)}]`,
    unchanged: (f) => `unchanged[${f.painted}_${f.whole}:${f.laid.join('')}:${f.found}]`,
    foundLine: (r) => `line[${r.whole}:${frac(r.final)}]`,
    next: 'next',
    done: 'done',
  },
};
const act = { type() {}, write() {}, pick() {}, lay() {}, none() {}, next() {} };
const html = (state, input) => renderToString(<PartView spec={SPEC} state={state} act={act} input={input} />);
const play = (actions, from = initPart(SPEC)) => actions.reduce((s, a) => partReducer(SPEC, s, a), from);
const ticks = (s, stage) => {
  let at = s;
  while (at.stage === stage) at = partReducer(SPEC, at, { type: 'tick' });
  return at;
};

describe('the investigation screen `part`', () => {
  it('is mounted by Inquiry and opens on its question and the whole, nothing painted yet', () => {
    const out = renderToString(<Inquiry spec={SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="part"');
    expect(out).toContain('data-iq-stage="paint"');
    expect(out).toContain('lead(39,5.8)');
    expect(out).toContain('data-iq-goal');
    expect(out).toContain('data-iq-whole="39"');
    expect(out).toContain('data-iq-painted="0"');
    expect((out.match(/class="iq-gapcell"/g) ?? []).length).toBe(39);
    expect(out).not.toContain('data-iq-stroke');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('the strokes are painted one after the other, then he writes the fraction in its template', () => {
    let s = play([{ type: 'tick' }]);
    let out = html(s);
    expect(out).toContain('data-iq-painted="5"');
    expect(out).toContain('painted[1:5:5]');
    expect(out).toContain('data-iq-stroke="5"');
    s = play([{ type: 'tick' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="write"');
    expect(out).toContain('data-iq-painted="13"');
    expect(out).toContain('painted[2:8:5.8]');
    expect(out).toContain('writeAsk[39]');
    expect(out).toContain('data-iq-in="num"');
    expect(out).toContain('data-iq-in="den"');
    expect(out).toContain('class="iq-fracin__bar"');
    expect(out).toContain('data-iq-write');
    expect(out).toContain('class="iq-part-end"');
    s = play([{ type: 'write', p: 8, q: 39 }], s);
    expect(html(s)).toContain('writeMiss[8_39:false:true]');
    s = play([{ type: 'write', p: 13, q: 39 }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="pick"');
    expect(out).toContain('written[13_39]');
    expect(out).toContain('data-iq-chain="13/39"');
    expect(out).toContain('class="mfrac"');
    expect(out).toContain('pickAsk[13_39]');
    expect(out).toContain('data-iq-chip="13"');
    expect(out).toContain('data-iq-none');
  });

  it('a plank that does not fill both is laid; one that does re-cuts the strip: 13/39 = 1/3, the paint unmoved', () => {
    let s = play([{ type: 'tick' }, { type: 'tick' }, { type: 'write', p: 13, q: 39 }]);
    s = play([{ type: 'try', d: 3 }, { type: 'shown' }], s);
    let out = html(s);
    expect(out).toContain('refused[3:1:0]');
    expect(out).toContain('13 = 3 \\times 4 + \\textcolor{#fbbf24}{1}');
    expect(out).toContain('data-iq-laid="3"');
    expect(out).toContain('data-iq-chip="3" data-iq-chip-state="no"');
    const paintBefore = out.match(/class="iq-part-paint[^"]*"[^>]*>/g);
    s = play([{ type: 'try', d: 13 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-cut="13"');
    expect(out).toContain('data-iq-writing="13/39,1/3"');
    expect(out).toContain('recut[13:13_39~1_3]');
    expect((out.match(/class="iq-part-cut/g) ?? []).length).toBe(3);
    expect(out).toContain('39 = 13 \\times 3 + \\textcolor{#8dffb0}{0}');
    // the painted strokes are drawn exactly where they were
    expect(out.match(/class="iq-part-paint[^"]*"[^>]*>/g)).toEqual(paintBefore);
    expect(out).toContain('line[39:1_3]');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('a round where only the plank 1 is common: his claim is checked by the world, the writing unchanged', () => {
    let s = play([{ type: 'next' }], { ...initPart(SPEC), stage: 'seen' });
    s = ticks(s, 'paint');
    s = play([{ type: 'write', p: 15, q: 22 }, { type: 'none' }], s);
    let out = html(s);
    expect(out).toContain('data-iq-stage="checkRun"');
    expect(out).toContain('checkLabel[15]');
    s = ticks(s, 'checkRun');
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('data-iq-check="3:0,5:0,15:0"');
    expect(out).toContain('unchanged[15_22::null]');
    expect(out).toContain('data-iq-writing="15/22"');
    expect(out).toContain('>done<');
    expect(out).not.toMatch(/undefined|NaN/);
    // the kit writes no word of its own: every sentence is the lesson's
    expect(out).not.toMatch(/[\u0600-\u06FF]/);
  });
});
