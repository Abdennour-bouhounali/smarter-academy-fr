// The mode `factor` of the ladder (InquiryFactor.jsx): mounted by `Inquiry` through `InquiryGcd.jsx › Ladder`, played
// stage by stage through its reducer (factorLadder.js) and drawn by its pure view. Server render.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { FactorView, LaidRow } from './InquiryFactor';
import { initFactor, factorReducer } from './factorLadder';

globalThis.window = globalThis.window ?? {};

const tag =
  (name) =>
  (...args) =>
    `${name}(${args.map((x) => (x && typeof x === 'object' ? Object.keys(x).length : x)).join(',')})`;
const SPEC = {
  kind: 'ladder',
  mode: 'factor',
  rack: [2, 3, 4, 5, 6, 7, 9, 11],
  rounds: [{ n: 72 }, { n: 495 }],
  text: {
    lead: tag('lead'),
    goal: tag('goal'),
    ask: (f) => `ask[${f.gap}:${f.laid.join('.')}]`,
    rackLabel: 'rack',
    held: (a) => `held[${a.plank}:${a.before}:${a.after}]`,
    fell: (a) => `fell[${a.plank}:${a.before}]`,
    folded: (k) => `folded[${k}]`,
    laidLabel: 'laid',
    end: (f) => `end[${f.n}:${f.planks.join('.')}:${f.attempts.length}]`,
    foundLine: (r) => `line[${r.n}:${r.fell}]`,
    next: 'next',
    done: 'done',
  },
};
const noop = () => {};
const play = (actions, from = initFactor(SPEC)) => actions.reduce((s, a) => factorReducer(SPEC, s, a), from);
const lay = (...ds) => ds.flatMap((d) => [{ type: 'take', d }, { type: 'shown' }]);
const view = (state) =>
  renderToString(<FactorView spec={SPEC} state={state} act={{ take: noop, next: noop }} />).replaceAll('<!-- -->', '');
/** The text a student reads (tags and KaTeX's hidden annotation out). */
const visible = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);

describe('ladder · factor — the screen', () => {
  it('is mounted by Inquiry on its mode and opens on its question and the whole rack, the gap empty', () => {
    const html = renderToString(<Inquiry spec={SPEC} onDone={noop} />);
    clean(html);
    expect(html).toContain('data-iq-mode="factor"');
    expect(html).toContain('data-iq-stage="pick"');
    expect(html).toContain('data-iq-gap="72"');
    expect(html).toContain('data-iq-rack="2,3,4,5,6,7,9,11"');
    for (const d of SPEC.rack) expect(html).toContain(`data-iq-plank="${d}"`);
    expect(html).toContain('ask[72:]');
    expect(html).toContain('lead(72)');
    expect(html).not.toContain('data-iq-row=');
  });

  it('a plank that holds writes a notebook line « 72 ÷ 2 = 36 » and the gap shrinks to the quotient', () => {
    const s = play(lay(2));
    const html = view(s);
    clean(html);
    expect(html).toContain('data-iq-gap="36"');
    expect(html).toContain('data-iq-line="72:2:36"');
    expect(html).toContain('72 \\div 2 = 36'); // KaTeX's annotation: the line is a division
    expect(html).toContain('held[2:72:36]');
    expect(html).toContain('ask[36:2]');
    // the gap is drawn at the round's scale: 36 cells are half the 72
    expect(html).toMatch(/data-iq-strip="gap" data-iq-gap="36"/);
  });

  it('a plank that does not hold falls from the end of the gap and the gap stays; its chip is marked on that gap only', () => {
    const lying = play([...lay(2, 2, 2), { type: 'take', d: 4 }]);
    const html = view(lying);
    expect(html).toContain('data-iq-stage="lay"');
    expect(html).toContain('data-iq-falls="4"'); // 9 cells, a plank of 4: two laid, one over the end
    for (const d of SPEC.rack)
      expect(html).toMatch(new RegExp(`data-iq-plank="${d}"[^>]*disabled|disabled[^>]*data-iq-plank="${d}"`));
    const after = view(play([{ type: 'shown' }], lying));
    expect(after).toContain('data-iq-gap="9"');
    expect(after).toContain('fell[4:9]');
    expect(after).toContain('data-iq-falls="4"'); // the fall stays as the fact until another plank is taken
    expect(after).toMatch(/data-iq-plank="4" data-iq-fell=""/);
    expect(after).not.toContain('data-iq-plank="9" data-iq-fell');
    expect(after.match(/data-iq-row=/g)).toHaveLength(3); // no line for a plank that fell
    const next = view(play([...lay(3)], play([{ type: 'shown' }], lying)));
    expect(next).not.toContain('data-iq-fell'); // a new gap: nothing has fallen on 3 yet
  });

  it('at 1 the planks that held stand in a row as PLANKS — no product, no power, no name', () => {
    const s = play(lay(2, 2, 2, 5, 3, 3));
    expect(s.stage).toBe('seen');
    const html = view(s);
    clean(html);
    expect(html).toContain('data-iq-laid="2,2,2,3,3"');
    expect(html).toContain('end[72:2.2.2.3.3:6]');
    const row = html.slice(html.indexOf('data-iq-laid='), html.indexOf('data-iq-next'));
    expect(row).not.toMatch(/×|\\times|<sup|\^|katex/);
    expect(row.match(/data-iq-laid-plank=/g)).toHaveLength(5);
    expect(html).toContain('>next<');
    expect(html).not.toContain('data-iq-rack');
    const single = renderToString(<LaidRow planks={[3, 3, 5, 11]} />);
    expect(single).toContain('data-iq-laid="3,3,5,11"');
    expect(single).not.toContain('<small>');
  });

  it('a notebook longer than five lines folds its middle behind « … »; the found lines keep every round', () => {
    const spec = { ...SPEC, rack: [2, 3], rounds: [{ n: 128 }] };
    const s = [{ type: 'take', d: 2 }, { type: 'shown' }];
    let st = initFactor(spec);
    for (let i = 0; i < 7; i += 1) st = s.reduce((x, a) => factorReducer(spec, x, a), st);
    const html = renderToString(<FactorView spec={spec} state={st} act={{ take: noop, next: noop }} />);
    expect(html).toContain('data-iq-fold="3"');
    expect(html).toContain('folded[3]');
    expect(html.match(/data-iq-row=/g)).toHaveLength(4);
    expect(html).toContain('data-iq-row="1"');
    expect(html).toContain('data-iq-row="7"');
    expect(html).toContain('line[128:0]');
  });

  it('the kit writes no sentence of its own: every word on screen is the lesson’s (`spec.text`)', () => {
    for (const st of [initFactor(SPEC), play(lay(2, 4)), play(lay(2, 2, 2, 3, 3))]) {
      const text = visible(view(st));
      expect(text).not.toMatch(/[àâçéèêëîïôûùüœ’«»]/u);
      for (const w of text.match(/[A-Za-zÀ-ÿ]{3,}/gu) ?? [])
        expect([
          'lead',
          'goal',
          'ask',
          'rack',
          'held',
          'fell',
          'folded',
          'laid',
          'end',
          'line',
          'next',
          'done',
          'div',
        ]).toContain(w);
    }
  });
});
