// The DECIMAL box and the CHOICE token (PYRAMIDS_WORLD_PLAN K-c, gate A B3), on the two screens that answer in a written
// shape: the forge's last step (`RuleForge.jsx › UseLines`) and the trainer's exam form (`Trainer.jsx › FormLines`).
// A decimal box keeps digits and ONE comma (« 77,5 »; a point typed becomes a comma); a choice is a radio group of
// buttons (ChoiceToken.jsx), driven by click and by the arrows in reading order. Every box that existed draws and types
// as before. Server render, and the handlers called on the element tree (no DOM in this repo's tests).
import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { renderToString } from 'react-dom/server';
import { UseLines } from './RuleForge';
import { FormLines } from './Trainer';
import ChoiceToken, { choiceStep } from './ChoiceToken';
import { boxesOf, choiceBox, decimalBox, line, ratioChoice } from './authoring/forgeBlocks';
import { boxName, slot, typedDecimal } from './forge';

globalThis.window = globalThis.window ?? {};

const drawUse = (lines, vals = {}) =>
  renderToString(<UseLines lines={lines} vals={vals} onType={() => {}} />).replaceAll('<!-- -->', '');
const drawForm = (lines, v = {}) =>
  renderToString(<FormLines lines={lines} v={v} set={() => () => {}} locked={false} />).replaceAll('<!-- -->', '');

/** Every element of a tree (function components WITHOUT hooks are expanded: `Num`; ChoiceToken is kept as it is). */
function elements(node, out = []) {
  if (Array.isArray(node)) {
    node.forEach((n) => elements(n, out));
    return out;
  }
  if (!isValidElement(node)) return out;
  out.push(node);
  if (typeof node.type === 'function' && node.type !== ChoiceToken) elements(node.type(node.props), out);
  elements(node.props.children, out);
  return out;
}

const KIND = choiceBox('kind', 'la transformation', [
  { id: 'big', text: 'agrandissement' },
  { id: 'small', text: 'réduction' },
]);

describe('a DECIMAL box — « 77,5 » typed as a French student writes it', () => {
  it('keeps digits and the FIRST separator, written as a comma; w characters at most', () => {
    expect(typedDecimal('77.5')).toBe('77,5');
    expect(typedDecimal('77,5')).toBe('77,5');
    expect(typedDecimal('7,7,5')).toBe('7,75');
    expect(typedDecimal('a1b2 c')).toBe('12');
    expect(typedDecimal('123456789', 5)).toBe('12345');
    expect(typedDecimal('-3,5')).toBe('3,5');
  });

  it('in the forge: `decimalBox` is a box with `decimal`, drawn inputMode="decimal" with its hooks; a digit box is unchanged', () => {
    expect(decimalBox('mn', 'MN')).toEqual({ slot: 'mn', label: 'MN', w: 5, decimal: true });
    expect(slot('g', 'PGCD', 2)).toEqual({ slot: 'g', label: 'PGCD', w: 2 });
    const html = drawUse([line(['MN', '=', decimalBox('mn', 'MN')]), line(['k', '=', slot('g', 'k', 2)])], {
      mn: '57,5',
    });
    const [mn, g] = html.match(/<input[^>]*>/g);
    for (const a of ['inputMode="decimal"', 'data-rf-use="mn"', 'data-rf-decimal=""', 'value="57,5"'])
      expect(mn).toContain(a);
    expect(g).toContain('inputMode="numeric"');
    expect(g).toContain('data-rf-use="g"');
    expect(g).not.toContain('data-rf-decimal');
  });

  it('in the forge: typing « 57.5 » gives « 57,5 »; a digit box still strips the comma', () => {
    const typed = [];
    const tree = UseLines({
      lines: [line([decimalBox('mn', 'MN'), slot('g', 'k', 2)])],
      vals: {},
      onType: (name, value) => typed.push([name, value]),
    });
    const inputs = elements(tree).filter((e) => e.type === 'input');
    inputs[0].props.onChange({ target: { value: '57.5' } });
    inputs[1].props.onChange({ target: { value: '5,7' } });
    expect(typed).toEqual([
      ['mn', '57,5'],
      ['g', '57'],
    ]);
  });

  it('in the trainer: `{ num, decimal: true }` types « 77,5 »; a box without it keeps its digits and its width', () => {
    const got = {};
    const set = (k) => (x) => (got[k] = x);
    const lines = [
      { ltr: true, tokens: ['MN', '=', { num: 'mn', label: 'MN', decimal: true }, { num: 'q', label: 'q' }] },
    ];
    const html = drawForm(lines, { mn: '77,5' });
    const [mn, q] = html.match(/<input[^>]*>/g);
    for (const a of ['inputMode="decimal"', 'value="77,5"', 'width:6.4ch', 'data-di-tr-decimal=""', 'data-di-tr="mn"'])
      expect(mn).toContain(a);
    for (const a of ['inputMode="numeric"', 'pattern="[0-9]*"', 'width:4.4ch', 'data-di-tr="q"'])
      expect(q).toContain(a);
    expect(q).not.toContain('decimal');
    const inputs = elements(FormLines({ lines, v: {}, set, locked: false })).filter((e) => e.type === 'input');
    inputs[0].props.onChange({ target: { value: '77.5' } });
    inputs[1].props.onChange({ target: { value: '7.5' } });
    expect(got).toEqual({ mn: '77,5', q: '75' });
  });
});

describe('a CHOICE token — pick one of a few written options, by click or keyboard', () => {
  it('draws a radio group of buttons with the hooks a walk drives; the picked one is checked, the only one in Tab order', () => {
    const html = renderToString(
      <ChoiceToken name="kind" label="la transformation" options={KIND.options} value="small" onPick={() => {}} />,
    );
    expect(html).toMatch(/^<span class="kit-choice" role="radiogroup" aria-label="la transformation" dir="ltr"/);
    expect(html).toContain('data-kit-choice="kind"');
    expect(html).toContain('data-kit-chosen="small"');
    expect(html).toMatch(/role="radio" aria-checked="false" tabindex="-1"[^>]*data-kit-option="big">agrandissement</);
    expect(html).toMatch(
      /role="radio" aria-checked="true" tabindex="0" class="is-on"[^>]*data-kit-option="small">réduction</,
    );
    // none picked yet: the first one takes the Tab
    const none = renderToString(<ChoiceToken name="kind" options={KIND.options} value={null} onPick={() => {}} />);
    expect(none).toContain('data-kit-chosen=""');
    expect(none).toMatch(/tabindex="0"[^>]*data-kit-option="big"/);
  });

  it('the keyboard: arrows in reading order (→ forward on a left-to-right line, the default), round the ends, Home and End', () => {
    expect(choiceStep('ArrowRight', 0, 3)).toBe(1);
    expect(choiceStep('ArrowLeft', 0, 3)).toBe(2);
    expect(choiceStep('ArrowRight', 0, 3, 'ltr')).toBe(1);
    expect(choiceStep('ArrowLeft', 0, 3, 'rtl')).toBe(1);
    expect(choiceStep('ArrowRight', 0, 3, 'rtl')).toBe(2);
    expect(choiceStep('ArrowDown', 2, 3)).toBe(0);
    expect(choiceStep('ArrowUp', 0, 3)).toBe(2);
    expect(choiceStep('End', 0, 3)).toBe(2);
    expect(choiceStep('Home', 2, 3)).toBe(0);
    expect(choiceStep('Enter', 1, 3)).toBe(null);
  });

  it('in the forge: a line « (2) est un [agrandissement / réduction] de (1) », answered under its name, never inside a <label>', () => {
    const lines = [line(['(2) est un', KIND, 'de (1)'])];
    expect(boxesOf(lines[0].tokens).map(boxName)).toEqual(['kind']);
    const html = drawUse(lines, { kind: 'big' });
    expect(html).toMatch(
      /<span class="rf-use__choice"><span class="kit-choice" role="radiogroup" aria-label="la transformation"/,
    );
    expect(html).toContain('<small>la transformation</small>');
    expect(html).toContain('data-kit-chosen="big"');
    expect(html).not.toMatch(/<label>[^]*kit-choice/);
    const typed = [];
    const tree = UseLines({ lines, vals: {}, onType: (n, v) => typed.push([n, v]) });
    elements(tree)
      .find((e) => e.type === ChoiceToken)
      .props.onPick('small');
    expect(typed).toEqual([['kind', 'small']]);
  });

  it('in the forge: a ratio of segment names — two choices stacked over a real bar, numerator first', () => {
    const r = ratioChoice('rn', 'rd', ['AM', 'AB', 'MB']);
    expect(boxesOf([r]).map(boxName)).toEqual(['rn', 'rd']);
    expect(r.frac.n.options).toEqual([
      { id: 'AM', text: 'AM' },
      { id: 'AB', text: 'AB' },
      { id: 'MB', text: 'MB' },
    ]);
    const html = drawUse([line([r, '=', ratioChoice('sn', 'sd', ['AN', 'AC'])])], { rn: 'AM' });
    expect(html).toContain('data-rf-frac="rn/rd"');
    expect(html).toContain('di-frac--typed');
    const n = html.indexOf('data-kit-choice="rn"');
    const bar = html.indexOf('di-frac__bar');
    const d = html.indexOf('data-kit-choice="rd"');
    expect(n).toBeGreaterThan(-1);
    expect(n).toBeLessThan(bar);
    expect(bar).toBeLessThan(d);
    expect(html).toMatch(/aria-label="le numérateur" dir="ltr"/);
    expect(html).not.toContain('<small>le numérateur</small>');
  });

  it('in the trainer: `buttons: true` draws the choice as buttons (inside a fraction too); without it the list stays', () => {
    const got = {};
    const set = (k) => (x) => (got[k] = x);
    const opts = [
      { value: true, text: 'agrandissement', id: 'big' },
      { value: false, text: 'réduction', id: 'small' },
    ];
    const lines = [
      {
        tokens: [
          'Le triangle (2) est un',
          { choice: 'kind', options: opts, buttons: true, label: 'la transformation' },
        ],
      },
      {
        ltr: true,
        tokens: [{ frac: { n: { choice: 'n', options: [{ value: 'AM', text: 'AM' }], buttons: true }, d: 'AB' } }],
      },
      { tokens: [{ choice: 'old', options: opts }] },
    ];
    const html = drawForm(lines, { kind: false });
    expect(html).toContain('data-kit-choice="kind"');
    expect(html).toContain('data-kit-chosen="small"');
    expect(html).toMatch(
      /data-di-frac="true"><span class="kit-choice" role="radiogroup" dir="ltr" data-kit-choice="n"/,
    );
    expect(html).toMatch(/<select[^>]*data-di-tr="old"/);
    expect(html.match(/<select/g)).toHaveLength(1);
    // a pick sets the option's VALUE, as the list always did
    elements(FormLines({ lines, v: {}, set, locked: false }))
      .find((e) => e.type === ChoiceToken)
      .props.onPick('big');
    expect(got).toEqual({ kind: true });
  });
});
