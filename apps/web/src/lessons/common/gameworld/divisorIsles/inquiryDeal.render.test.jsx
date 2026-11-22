import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { DealView } from './InquiryDeal';
import { initDeal, dealReducer } from './deal';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `deal` »), as plain tags. */
const SPEC = {
  kind: 'deal',
  a: { n: 40, item: 'rose' },
  b: { n: 56, item: 'lily' },
  lot: 'vase',
  text: {
    lead: (a, b) => `lead[${a.n}:${b.n}]`,
    goal: (a, b) => `goal[${a.item}:${b.item}]`,
    choose: (f) => `choose[${f.tried}]`,
    ask: (f) => `ask[${f.k}]`,
    dealt: (f) => `dealt[${f.k}:${f.qA}:${f.qB}:${f.restA}:${f.restB}:${f.guess}]`,
    again: (f) => `again[${f.k}]`,
    cols: { lots: 'lots', a: 'roses', b: 'lilies', left: 'left' },
    toAnswer: 'toAnswer',
    back: 'back',
    answerLead: () => 'answerLead',
    lotsUnit: 'vases',
    unitA: 'roses',
    unitB: 'lilies',
    check: 'check',
    miss: (f) => `miss[${f.kind}:${f.said.k}:${f.row ? f.row.k : '-'}]`,
    ok: (f) => `ok[${f.said.k}:${f.said.x}:${f.said.y}]`,
    bound: (f) => `bound[${f.max}]`,
    yes: 'yes',
    no: 'no',
    done: 'done',
  },
};
const act = { choose() {}, say() {}, toAnswer() {}, back() {}, type() {}, answer() {}, next() {} };
const html = (state, spec = SPEC) => renderToString(<DealView spec={spec} state={state} act={act} />);
const run = (actions, from = initDeal(), spec = SPEC) => actions.reduce((s, a) => dealReducer(spec, s, a), from);
const tryK = (k, v, s) => {
  let t = run(
    [
      { type: 'choose', k },
      { type: 'say', v },
    ],
    s,
  );
  while (t.stage === 'deal') t = dealReducer(SPEC, t, { type: 'tick' });
  return t;
};
const count = (out, re) => (out.match(re) ?? []).length;

describe('the investigation screen `deal`', () => {
  it('is mounted by Inquiry and opens on its question, the two collections drawn one by one, and the chips', () => {
    const out = renderToString(<Inquiry spec={SPEC} onDone={() => {}} />);
    expect(out).toContain('data-iq="deal"');
    expect(out).toContain('data-iq-stage="pick"');
    expect(out).toContain('lead[40:56]');
    expect(out).toContain('goal[rose:lily]');
    expect(out).toContain('data-iq-pile="a" data-iq-count="40"');
    expect(out).toContain('data-iq-pile="b" data-iq-count="56"');
    // every item is a drawn symbol, used once per item (no raster image, no emoji as the drawing)
    expect(count(out, /href="#iqd-rose"/g)).toBe(40);
    expect(count(out, /href="#iqd-lily"/g)).toBe(56);
    for (const kind of ['rose', 'lily', 'date', 'fig']) expect(out).toContain(`id="iqd-${kind}"`);
    expect(out).not.toMatch(/<img|\.png|\.jpg|\.webp/);
    for (let k = 2; k <= 12; k += 1) expect(out).toContain(`data-iq-choice="${k}"`);
    expect(out).toContain('choose[0]');
    expect(out).not.toContain('data-iq-table');
    expect(out).not.toContain('data-iq-to-answer');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('a deal: the empty lots, the prediction, the lots filled round by round, what is left set apart, the table', () => {
    let s = run([{ type: 'choose', k: 6 }]);
    let out = html(s);
    expect(out).toContain('ask[6]');
    expect(out).toContain('data-iq-say="yes"');
    expect(count(out, /data-iq-lot="/g)).toBe(6);
    expect(out).toContain('iqd-lot--vase');
    s = run([{ type: 'say', v: true }, { type: 'tick' }, { type: 'tick' }], s);
    out = html(s);
    expect(out).toContain('data-iq-stage="deal"');
    expect(out).toContain('data-iq-holds="2,2"');
    expect(out).toContain('data-iq-pile="a" data-iq-count="28"');
    expect(out).not.toContain('data-iq-calc><'); // nothing is written while the world deals…
    while (s.stage === 'deal') s = dealReducer(SPEC, s, { type: 'tick' });
    out = html(s);
    expect(out).toContain('data-iq-holds="6,9"');
    expect(out).toContain('data-iq-pile="a" data-iq-count="4"');
    expect(out).toContain('data-iq-pile="b" data-iq-count="2"');
    expect(count(out, /iqd-apart/g)).toBe(2);
    expect(out).toContain('40 = 6 \\times 6 + \\textcolor{#fbbf24}{4}');
    expect(out).toContain('56 = 6 \\times 9 + \\textcolor{#fbbf24}{2}');
    expect(out).toContain('dealt[6:6:9:4:2:true]');
    expect(out).toContain('data-iq-table');
    expect(out).toContain('data-iq-try="6" data-iq-ok="0"');
    // a k that shares everything: nothing is set apart, the rests are green
    s = tryK(4, true, s);
    out = html(s);
    expect(out).toContain('data-iq-try="4" data-iq-ok="1"');
    expect(out).not.toContain('iqd-apart');
    expect(out).toContain('40 = 4 \\times 10 + \\textcolor{#8dffb0}{0}');
  });

  it('after the tries, the three boxes with the units printed; the answer is met by facts, then the end', () => {
    let s = initDeal();
    for (const k of [2, 3, 4, 5]) s = tryK(k, true, s);
    let out = html(s);
    expect(out).toContain('data-iq-to-answer');
    s = dealReducer(SPEC, s, { type: 'toAnswer' });
    out = html(s);
    for (const box of ['k', 'x', 'y']) expect(out).toContain(`data-iq-in="${box}"`);
    expect(out).toContain('vases');
    expect(out).toContain('data-iq-check');
    expect(out).toContain('data-iq-back');
    out = html(dealReducer(SPEC, s, { type: 'answer', k: 4, x: 10, y: 14 }));
    expect(out).toContain('miss[open:4:-]');
    out = html(dealReducer(SPEC, s, { type: 'answer', k: 2, x: 20, y: 28 }));
    expect(out).toContain('miss[bigger:2:4]');
    s = dealReducer(SPEC, s, { type: 'answer', k: 8, x: 5, y: 7 });
    out = html(s);
    expect(out).toContain('ok[8:5:7]');
    expect(out).toContain('data-iq-holds="5,7"');
    expect(out).toContain('>done<');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('dates and figs in baskets: 12 lots fit, the glyphs and the lot shape follow the spec', () => {
    const spec = { ...SPEC, a: { n: 60, item: 'date' }, b: { n: 60, item: 'fig' }, lot: 'basket' };
    let s = run(
      [
        { type: 'choose', k: 12 },
        { type: 'say', v: true },
      ],
      initDeal(),
      spec,
    );
    while (s.stage === 'deal') s = dealReducer(spec, s, { type: 'tick' });
    const out = html(s, spec);
    expect(count(out, /data-iq-lot="/g)).toBe(12);
    expect(out).toContain('iqd-lot--basket');
    expect(count(out, /href="#iqd-date"/g)).toBe(60 + 2); // 60 in the lots; in the table, the row's label and the cell of what is left
    expect(out).toContain('data-iq-holds="5,5"');
  });
});
