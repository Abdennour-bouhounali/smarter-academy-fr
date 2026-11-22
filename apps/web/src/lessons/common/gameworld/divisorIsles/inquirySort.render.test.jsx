import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import MathText from '../../components/MathText';
import Inquiry from './Inquiry';
import { SortView } from './InquirySort';
import { initSort, sortReducer, sortResult } from './sort';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the screen asks for (GAME_WORLD.md « spec shape of `sort` »), as plain tags. */
const SPEC = {
  kind: 'sort',
  as: 'pair',
  cards: [
    { a: 26, b: 39 },
    { a: 25, b: 27 },
    { a: 44, b: 45 },
    { a: 85, b: 119 },
    { a: 13, b: 39 },
    { a: 650, b: 13 },
  ],
  instruments: ['lists', 'summit', 'ladder'],
  text: {
    lead: (f) => `lead[${f.as}:${f.n}]`,
    goal: (f) => `goal[${f.as}]`,
    baskets: { one: 'basketOne', more: 'basketMore' },
    ask: (f) => `ask[${f.a}:${f.b}:${f.tool}]`,
    tools: { lists: 'toolLists', summit: 'toolSummit', ladder: 'toolLadder' },
    panel: {
      lists: (f) => `panelLists${f.a}`,
      summit: (f) => `panelSummit${f.short}`,
      ladder: (f) => `panelLadder${f.long}`,
    },
    seen: (f) => `seen[${f.tool}:${f.common ?? ''}:${f.stop ?? ''}:${f.rows ?? ''}]`,
    placed: (c) => `placed[${c.a}:${c.truth}:${c.firstTry}]`,
    answer: (f) => `answer[${f.kind}:${f.said}:${f.truth}:${f.d ?? f.short}]`,
    end: (f) => `end[${f.one}:${f.more}]`,
    next: 'next',
    done: 'done',
  },
};
const noop = () => {};
const ACT = { open: noop, drop: noop, pick: noop, next: noop, grab: {} };
const html = (state, spec = SPEC) => renderToString(<SortView spec={spec} state={state} act={ACT} />);
const play = (actions, from = initSort(SPEC), spec = SPEC) => actions.reduce((s, a) => sortReducer(spec, s, a), from);

/**
 * The view's element tree with every component of this world expanded (they are pure functions of their props; MathText
 * is left as it is): the controls a walk drives are found in it by their `data-iq-*` hook and pressed — no DOM needed.
 */
function expand(node) {
  if (Array.isArray(node)) return node.flatMap(expand);
  if (!node || typeof node !== 'object' || !node.props) return [];
  if (typeof node.type === 'function' && node.type !== MathText) return expand(node.type(node.props));
  return [node, ...expand(node.props.children)];
}
const find = (tree, hook, value) =>
  expand(tree).filter(
    (el) => el.props[hook] !== undefined && (value === undefined || String(el.props[hook]) === value),
  );

/** A hand played through the UI: every press goes through the view's own buttons; the world's ticks are the timers'. */
function hand(spec) {
  let state = initSort(spec);
  let result = null;
  const dispatch = (a) => {
    state = sortReducer(spec, state, a);
  };
  const act = {
    open: (tool) => dispatch({ type: 'open', tool }),
    drop: (basket) => dispatch({ type: 'drop', basket }),
    pick: (i) => dispatch({ type: 'pick', i }),
    next: () => {
      const after = sortReducer(spec, state, { type: 'next' });
      if (after.done) result = sortResult(after);
      else state = after;
    },
    grab: {},
  };
  const tree = () => SortView({ spec, state, act });
  const press = (hook, value) => {
    const [el] = find(tree(), hook, value);
    if (!el) throw new Error(`no ${hook}=${value} on stage ${state.stage}`);
    el.props.onClick();
  };
  /** the world finishes what it is showing */
  const wait = () => {
    while (state.stage === 'tool' || state.stage === 'answer') dispatch({ type: 'tick' });
  };
  return {
    press,
    wait,
    tree,
    get state() {
      return state;
    },
    get result() {
      return result;
    },
  };
}

describe('the investigation screen `sort`', () => {
  it('is mounted by Inquiry and opens on its question, the first card between the two baskets, its gaps as strips', () => {
    const out = renderToString(<Inquiry spec={SPEC} onDone={noop} />);
    expect(out).toContain('data-iq="sort"');
    expect(out).toContain('data-iq-stage="card"');
    expect(out).toContain('lead[pair:6]');
    expect(out).toContain('goal[pair]');
    expect(out).toContain('data-iq-pair="26:39"');
    expect(out).toContain('data-iq-card="0"');
    expect(out).toContain('(26\u00a0;\u00a039)');
    expect(out).toContain('data-iq-basket="one"');
    expect(out).toContain('data-iq-basket="more"');
    expect(out).toContain('basketOne');
    expect(out).toContain('data-iq-strip="a"');
    expect(out).toContain('data-iq-strip="b"');
    expect(out).toContain('data-iq-left="5"');
    expect(out).toContain('data-iq-open="lists"');
    expect(out).toContain('data-iq-open="summit"');
    expect(out).toContain('data-iq-open="ladder"');
    expect(out).toContain('ask[26:39:null]');
    expect(out).not.toContain('data-iq-panel');
    expect(out).not.toMatch(/undefined|NaN/);
    // the kit writes no word of its own: every word on screen is the lesson's
    expect(out).not.toMatch(/[\u0600-\u06ff]/);
  });

  it('the three instruments show their facts: the lists with the common planks, the summit, the ladder', () => {
    let out = html(
      play([{ type: 'open', tool: 'lists' }, { type: 'tick' }, { type: 'tick' }], {
        ...initSort(SPEC),
        ci: 3,
        hand: [0, 1, 2, 4, 5],
      }),
    );
    expect(out).toContain('data-iq-panel="lists" data-iq-common="1,17"');
    expect(out).toContain('panelLists85');
    expect(out).toMatch(/data-iq-plank="17" data-iq-both="1"/);
    expect(out).toMatch(/data-iq-plank="5" data-iq-both="0"/);
    // read left to right (the French screen, 2026-11-22): the label and the tag on the LEFT, then the chips, smallest first
    const xOf = (html, plank) => Number(html.match(new RegExp(`data-iq-plank="${plank}"[^>]*><rect x="([\\d.]+)"`))[1]);
    expect(out).toMatch(/<text class="iqs-label" x="40"/);
    expect(out).toMatch(/<rect class="iqs-tag" x="40"/);
    expect(xOf(out, 1)).toBeLessThan(xOf(out, 5));
    expect(xOf(out, 5)).toBeLessThan(xOf(out, 17));
    expect(out).toContain('seen[lists:1,17::]');
    expect(out).not.toContain('data-iq-open='); // one instrument per card
    expect(out).toContain('ask[85:119:lists]');

    out = html(play([{ type: 'open', tool: 'summit' }, { type: 'tick' }], { ...initSort(SPEC), ci: 3, hand: [] }));
    expect(out).toContain('data-iq-stage="tool"');
    expect(out).toContain('data-iq-laid="85"');
    expect(out).toMatch(/data-iq-plank="85" data-iq-rest="34"/);
    expect(out).toContain('85 = 85 \\times 1 + \\textcolor{#8dffb0}{0}');
    expect(out).toContain('119 = 85 \\times 1 + \\textcolor{#fbbf24}{34}');
    // the descent reads left to right: the longest plank first, on the LEFT
    expect(out).toMatch(/<text class="iqs-label" x="40"/);
    expect(xOf(out, 85)).toBeLessThan(xOf(out, 17));
    expect(xOf(out, 17)).toBeLessThan(xOf(out, 5));

    out = html(
      play([{ type: 'open', tool: 'ladder' }, { type: 'tick' }, { type: 'tick' }], {
        ...initSort(SPEC),
        ci: 2,
        hand: [],
      }),
    );
    expect(out).toContain('data-iq-panel="ladder" data-iq-rows="2"');
    // the ladder's first column is the LEFT one
    expect(Number(out.match(/x="([\d.]+)"[^>]*data-iq-row="0"/)[1])).toBeLessThan(500);
    expect(out).toMatch(/data-iq-row="0"[^>]*>45 = 44 × 1 \+ <tspan class="is-rest">1<\/tspan>/);
    expect(out).toMatch(/data-iq-row="1"[^>]*>44 = 1 × 44 \+ <tspan class="is-zero">0<\/tspan>/);
    expect(out).toContain('seen[ladder:::2]');
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('a long gap (650 cells) and a short one are drawn on one scale, the plank laid as a bar', () => {
    const s = play([{ type: 'open', tool: 'summit' }, { type: 'tick' }], { ...initSort(SPEC), ci: 5, hand: [] });
    const out = html(s);
    expect(out).toContain('data-iq-pair="650:13"');
    expect(out).toContain('650 = 13 \\times 50 + \\textcolor{#8dffb0}{0}');
    // no cell drawn one by one at this scale: one rect per gap, the planks of 13 drawn (13 × 920 / 650 ≥ 3)
    expect((out.match(/class="iq-gapcell"/g) ?? []).length).toBe(2);
    expect(out).not.toMatch(/undefined|NaN/);
  });

  it('a hand played through its buttons: right drops, both answers of the world, the end with both baskets', () => {
    const h = hand(SPEC);
    // 26 ; 39 — the summit, then the right basket
    h.press('data-iq-open', 'summit');
    expect(h.state.stage).toBe('tool');
    h.wait();
    h.press('data-iq-basket', 'more');
    expect(h.state.ci).toBe(1);
    expect(renderToString(h.tree())).toContain('placed[26:more:true]');
    // 25 ; 27 in « more »: the world lays 25, 5, 1 on 27 — only 1 leaves no rest
    h.press('data-iq-basket', 'more');
    expect(h.state.stage).toBe('answer');
    expect(find(h.tree(), 'data-iq-next')).toHaveLength(0);
    h.wait();
    let out = renderToString(h.tree());
    expect(out).toContain('data-iq-stage="answered"');
    expect(out).toContain('data-iq-panel="none" data-iq-laid="25,5,1"');
    expect(out).toMatch(/data-iq-plank="5" data-iq-rest="2"/);
    expect(out).toContain('answer[none:more:one:25]');
    expect(out).toMatch(/class="iqs-basket[^"]*is-said[^"]*"[^>]*data-iq-basket="more"/);
    h.press('data-iq-next');
    out = renderToString(h.tree());
    expect(out).toMatch(/data-iq-placed="25:27" data-iq-moved="1"/);
    expect(out).toContain('placed[25:one:false]');
    // he picks 85 ; 119 from his hand, says « one »: the world lays 17 on both
    h.press('data-iq-hand', '3');
    expect(h.state.ci).toBe(3);
    h.press('data-iq-basket', 'one');
    h.wait();
    out = renderToString(h.tree());
    expect(out).toContain('data-iq-panel="common" data-iq-witness="17"');
    expect(out).toContain('85 = 17 \\times 5 + \\textcolor{#8dffb0}{0}');
    expect(out).toContain('119 = 17 \\times 7 + \\textcolor{#8dffb0}{0}');
    expect(out).toContain('answer[common:one:more:17]');
    h.press('data-iq-next');
    // the rest of the hand, right first time
    h.press('data-iq-basket', 'one'); // 44 ; 45
    h.press('data-iq-open', 'lists'); // 13 ; 39
    h.wait();
    h.press('data-iq-basket', 'more');
    h.press('data-iq-basket', 'more'); // 650 ; 13
    out = renderToString(h.tree());
    expect(h.state.stage).toBe('end');
    expect(out).toContain('end[2:4]');
    expect(out).toContain('data-iq-basket="one" data-iq-count="2"');
    expect(out).toContain('data-iq-basket="more" data-iq-count="4"');
    expect(out).not.toContain('data-iq-card=');
    expect(out).toContain('>done<');
    expect(out).not.toMatch(/undefined|NaN/);
    // a basket pressed at the end drops nothing
    h.press('data-iq-basket', 'one');
    expect(h.state.stage).toBe('end');
    h.press('data-iq-next');
    expect(h.result.cards.map((c) => [c.a, c.said, c.instrument, c.firstTry])).toEqual([
      [26, 'more', 'summit', true],
      [25, 'more', null, false],
      [85, 'one', null, false],
      [44, 'one', null, true],
      [13, 'more', 'lists', true],
      [650, 'more', null, true],
    ]);
  });

  it('fraction cards are drawn with a real fraction bar, on the table and in the baskets', () => {
    const spec = {
      ...SPEC,
      as: 'fraction',
      cards: [
        { a: 25, b: 27 },
        { a: 11, b: 13 },
        { a: 22, b: 26 },
        { a: 13, b: 39 },
        { a: 15, b: 22 },
      ],
    };
    const s = play([{ type: 'drop', basket: 'one' }], initSort(spec), spec);
    const out = html(s, spec);
    expect(out).toContain('data-iq-as="fraction"');
    // KaTeX draws \dfrac with its bar (frac-line), never « 11/13 » in a line
    expect(out).toContain('frac-line');
    expect(out).not.toMatch(/\d+\/\d+/);
    expect(out).toContain('data-iq-placed="25:27"');
  });
});
