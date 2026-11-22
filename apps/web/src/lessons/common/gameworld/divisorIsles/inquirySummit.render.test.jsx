import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { SummitView } from './InquirySummit';
import { initSummit, summitReducer } from './summit';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `summit` »), as plain tags. */
const tag =
  (name) =>
  (...args) =>
    `${name}(${args.map((x) => (x && typeof x === 'object' ? Object.keys(x).length : x)).join(',')})`;
const SPEC = {
  kind: 'summit',
  rounds: [
    { a: 266, b: 322, start: 14 },
    { a: 90, b: 36, mode: 'first', free: 0 },
  ],
  text: {
    lead: tag('lead'),
    goal: tag('goal'),
    start: (f) => `start[${f.d}:${f.both}]`,
    freeAsk: (f) => `freeAsk[${f.best}:${f.left}]`,
    unit: 'cells',
    lay: 'lay',
    freeBound: (f) => `bound[${f.max}]`,
    tried: (f) => `tried[${f.d}:${f.kind}:${f.best}:${f.isBest}]`,
    line: 'lengths',
    outsideAsk: (f) => `outsideAsk[${f.short}]`,
    outsideSeen: (f) => `outsideSeen[${f.d}:${f.mine}:${f.guess}]`,
    go: 'go',
    countAsk: (f) => `countAsk[${f.short}]`,
    countUnit: 'planks',
    countGo: 'countGo',
    chipsLabel: (n) => `chips${n}`,
    descentAsk: (f) => `descentAsk[${f.d}]`,
    descentSeen: (f) => `descentSeen[${f.d}:${f.guess}:${f.both}]`,
    crowned: (f) => `crowned[${f.crown}:${f.tries}]`,
    restAsk: (f) => `restAsk[${f.crown}:${f.rest}]`,
    restSeen: (f) => `restSeen[${f.crown}:${f.rest.join('')}:${f.checked}]`,
    countSeen: (f) => `countSeen[${f.crown}:${f.tries}:${f.said}]`,
    foundLine: (r) => `line[${r.a}:${r.crown}]`,
    yes: 'yes',
    no: 'no',
    next: 'next',
    done: 'done',
  },
};
const act = { type() {}, lay() {}, say() {}, go() {}, count() {}, next() {} };
const html = (state, input) => renderToString(<SummitView spec={SPEC} state={state} act={act} input={input} />);
const play = (actions, from = initSummit(SPEC)) => actions.reduce((s, a) => summitReducer(SPEC, s, a), from);

describe('the investigation screen `summit`', () => {
  it('is mounted by Inquiry and opens on its question, the plank he used lying on both strips, and the box of a try', () => {
    const out = renderToString(<Inquiry spec={SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="summit"');
    expect(out).toContain('data-iq-stage="free"');
    expect(out).toContain('lead(266,322,search)');
    expect(out).toContain('data-iq-goal');
    expect(out).toContain('data-iq-strip="a"');
    expect(out).toContain('data-iq-strip="b"');
    // 14 fills both: a fact, with its two divisions written (rest green)
    expect(out).toContain('start[14:true]');
    expect(out).toContain('266 = 14 \\times 19 + \\textcolor{#8dffb0}{0}');
    expect(out).toContain('322 = 14 \\times 23 + \\textcolor{#8dffb0}{0}');
    expect(out).toContain('data-iq-lengths="14:both"');
    expect(out).toContain('data-iq-best="14"');
    expect(out).toContain('freeAsk[14:2]');
    expect(out).toContain('data-iq-in="free"');
    expect(out).toContain('data-iq-lay');
    expect(out).not.toContain('data-iq-chip='); // the planks of the shorter gap come with the descent
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('a try is laid on both strips, kept as a mark coloured by what it did; a refused length is answered', () => {
    let s = play([{ type: 'try', d: 999 }]);
    expect(html(s)).toContain('bound[322]');
    s = play([{ type: 'try', d: 28 }, { type: 'shown' }], s);
    let out = html(s);
    expect(out).toContain('tried[28:none:14:false]');
    expect(out).toContain('266 = 28 \\times 9 + \\textcolor{#fbbf24}{14}');
    expect(out).toMatch(/data-iq-mark="28" data-iq-kind="none"/);
    // 23 fills only the gap b (322 = 23 × 14)
    s = play([{ type: 'try', d: 23 }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toMatch(/data-iq-mark="23" data-iq-kind="b"/);
    expect(out).toContain('data-iq-stage="outside"');
    expect(out).toContain('outsideAsk[266]');
    expect(out).toContain('data-iq-say="yes"');
  });

  it('the outside answer, the descent with its chips, the gold crown, then the shorter planks laid by the world', () => {
    let s = play([
      { type: 'try', d: 28 },
      { type: 'shown' },
      { type: 'try', d: 7 },
      { type: 'shown' },
      { type: 'say', v: true },
      { type: 'shown' },
    ]);
    let out = html(s);
    expect(out).toContain('outsideSeen[28:true:true]');
    expect(out).toContain('data-iq-go');
    s = summitReducer(SPEC, s, { type: 'go' });
    out = html(s);
    expect(out).toContain('data-iq-planks="266,133,38,19,14,7,2,1"');
    expect(out).toContain('chips266');
    expect(out).toContain('data-iq-chip="266" data-iq-chip-state="now"');
    expect(out).toContain('descentAsk[266]');
    for (let k = 0; k < 4; k += 1) s = play([{ type: 'say', v: false }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('descentSeen[19:false:false]');
    expect(out).toContain('data-iq-chip="133" data-iq-chip-state="no"');
    expect(out).toContain('data-iq-chip="14" data-iq-chip-state="now"');
    s = play([{ type: 'say', v: true }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="rest"');
    expect(out).toContain('data-iq-crown="14"');
    expect(out).toContain('data-iq-chip="14" data-iq-chip-state="crown"');
    expect(out).toMatch(/class="iq-sum-mark is-crown" data-iq-mark="14"/);
    expect(out).toContain('crowned[14:5]');
    expect(out).toContain('restAsk[14:3]');
    expect(out).toContain('data-iq-rest="yes"');
    s = play([{ type: 'say', v: true }, { type: 'tick' }, { type: 'tick' }, { type: 'tick' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="seen"');
    expect(out).toContain('restSeen[14:721:true]');
    expect(out).toContain('data-iq-chip="1" data-iq-chip-state="shorter"');
    expect(out).toContain('line[266:14]');
    expect(out).toContain('>next<');
    expect(out).not.toMatch(/undefined|NaN/);
    // the line of lengths (2026-11-19, seen in the walk): no empty label is drawn — a label placed in the row of the ends
    // used to join the ends —, and a mark standing on an end (1, 266) is not labelled twice: the end writes its number
    const lengths = out.slice(out.indexOf('data-iq-lengths'), out.indexOf('</svg>'));
    expect(lengths).not.toMatch(/<text[^>]*><\/text>/);
    expect(lengths.match(/>266</g)).toHaveLength(1);
    expect(lengths.match(/>1</g)).toHaveLength(1);
    // the chips are read after their label « from the longest to the shortest »: right to left
    expect(out).toMatch(/data-iq-planks="[^"]*"><small>chips266<\/small><div class="iq-chips" dir="rtl">/);
  });

  it('mode first: the count box before the descent, then the count shown against what he typed', () => {
    let s = play([{ type: 'next' }], { ...initSummit(SPEC), stage: 'seen' });
    let out = html(s, { free: '', count: '' });
    expect(out).toContain('data-iq-mode="first"');
    expect(out).toContain('data-iq-stage="count"');
    expect(out).toContain('countAsk[36]');
    expect(out).toContain('data-iq-in="count"');
    expect(out).not.toContain('data-iq-in="free"');
    s = play([{ type: 'count', n: 1 }, { type: 'say', v: false }, { type: 'shown' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="run"');
    expect(out).not.toContain('data-iq-say=');
    s = summitReducer(SPEC, s, { type: 'tick' });
    out = html(s);
    expect(out).toContain('countSeen[18:2:1]');
    expect(out).toContain('>done<');
  });
});
