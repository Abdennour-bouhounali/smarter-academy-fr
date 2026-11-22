import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MathText from '../../components/MathText';
import Inquiry from './Inquiry';
import { Calc } from './InquiryCombine';
import { INQUIRY_TEXT } from './strings';

/**
 * The investigation screens PLAYED past their first screen: a prediction answered, the world's fact shown, the next stage
 * reached — for the eight kinds groups, rebuild, estimate, bracket, common, ladder, nest, chart (and the guards of join
 * and letters). There is no DOM in these tests: React's three hooks the screens use (`useState`, `useRef`, `useEffect`)
 * are replaced by a tiny store, the screen is CALLED like a function and its element tree walked; a press calls the
 * button's own `onClick`, the world's timers run on fake time, and the screen is called again.
 */
const H = vi.hoisted(() => {
  const h = { slots: [], i: 0 };
  h.useState = (init) => {
    const i = h.i++;
    if (!(i in h.slots)) h.slots[i] = typeof init === 'function' ? init() : init;
    return [
      h.slots[i],
      (v) => {
        h.slots[i] = typeof v === 'function' ? v(h.slots[i]) : v;
      },
    ];
  };
  h.useRef = (init) => {
    const i = h.i++;
    if (!(i in h.slots)) h.slots[i] = { current: init };
    return h.slots[i];
  };
  h.useEffect = () => {
    h.i += 1;
  };
  return h;
});
vi.mock('react', async (importOriginal) => {
  const R = await importOriginal();
  return { ...R, default: R, useState: H.useState, useRef: H.useRef, useEffect: H.useEffect };
});

globalThis.window = globalThis.window ?? {};

/** The element tree of a screen, every function component called (MathText is a leaf: its formula is kept as text). */
function expand(node) {
  if (node == null || typeof node === 'boolean') return [];
  if (Array.isArray(node)) return node.flatMap(expand);
  if (typeof node === 'string' || typeof node === 'number') return [String(node)];
  const { type, props, key } = node;
  if (type === MathText) return [{ type: 'math', props, key, text: String(props.children ?? '') }];
  if (typeof type === 'function') return expand(type(props));
  if (typeof type === 'string') return [{ type, props, key, children: expand(props.children) }];
  return expand(props.children); // a fragment
}
const textOf = (nodes) =>
  nodes.map((n) => (typeof n === 'string' ? n : n.type === 'math' ? n.text : textOf(n.children))).join(' ');
function find(nodes, pred) {
  for (const n of nodes) {
    if (typeof n === 'string' || n.type === 'math') continue;
    if (pred(n.props)) return n;
    const inner = find(n.children, pred);
    if (inner) return inner;
  }
  return null;
}
const has = (name, value) => (p) => p[name] !== undefined && (value === undefined || String(p[name]) === String(value));

function mount(spec) {
  H.slots = [];
  const onDone = vi.fn();
  const s = {
    tree: [],
    onDone,
    render() {
      H.i = 0;
      s.tree = expand(Inquiry({ spec, onDone }));
      return s;
    },
    get: (name, value) => find(s.tree, has(name, value)),
    stage: () => s.get('data-iq').props['data-iq-stage'],
    fact: () => textOf(s.get('data-iq-fact').children),
    calc: () => textOf(s.get('data-iq-calc').children),
    all: () => textOf(s.tree),
    press(name, value) {
      const n = s.get(name, value);
      if (!n) throw new Error(`no [${name}${value === undefined ? '' : `=${value}`}] on the screen (${s.stage()})`);
      n.props.onClick();
      vi.runAllTimers();
      return s.render();
    },
    type(value, text) {
      s.get('data-iq-in', value).props.onChange({ target: { value: String(text) } });
      return s.render();
    },
  };
  return s.render();
}

const say =
  (tag) =>
  (...args) =>
    `${tag}(${args.length})`;
const NX = { next: 'next', done: 'done', yes: 'yes', no: 'no' };

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('the investigation screens, played past their first screen', () => {
  it('groups: each prediction lays a plank (or shows it hanging); his count is answered by the strip, then the next round', () => {
    const s = mount({
      kind: 'groups',
      rounds: [
        { a: 17, b: 5 },
        { a: 4, b: 9 },
      ],
      text: {
        ...NX,
        ...Object.fromEntries(
          ['lead', 'goal', 'ask', 'laid', 'over', 'left', 'sayLead', 'sayMiss', 'sayOk'].map((k) => [k, say(k)]),
        ),
        foundLine: say('line'),
        finish: 'finish',
        sayPlanks: 'planks',
        sayLeft: 'left',
        check: 'check',
      },
    });
    expect(s.stage()).toBe('guess');
    s.press('data-iq-say', 'yes');
    expect(s.stage()).toBe('guess');
    expect(s.get('data-iq-k', 2)).not.toBe(null);
    expect(s.fact()).toContain('laid(');
    expect(s.calc()).toContain('17 - 5 \\times 1 = 12');
    s.press('data-iq-say', 'yes').press('data-iq-say', 'yes').press('data-iq-say', 'no');
    expect(s.stage()).toBe('say');
    expect(s.fact()).toContain('over(');
    s.type('q', 2).type('r', 7).press('data-iq-check');
    expect(s.stage()).toBe('say');
    expect(s.fact()).toContain('sayMiss(');
    s.type('q', 3).type('r', 2).press('data-iq-check');
    expect(s.stage()).toBe('seen');
    expect(s.fact()).toContain('sayOk(');
    expect(s.calc()).toContain('17 - 5 \\times 3 = 2');
    s.press('data-iq-next');
    expect(s.stage()).toBe('guess');
    expect(s.get('aria-label', '4 ÷ 9')).not.toBe(null); // the second round
  });

  it('rebuild: the cloth is lifted on his length; a piece as long as a plank takes one more plank', () => {
    const s = mount({
      kind: 'rebuild',
      rounds: [
        { b: 7, q: 4, r: 3 },
        { b: 6, q: 3, r: 8 },
      ],
      text: {
        ...NX,
        ...Object.fromEntries(['lead', 'goal', 'ask', 'label', 'seen', 'more'].map((k) => [k, say(k)])),
        foundLine: say('line'),
        lift: 'lift',
      },
    });
    s.type('a', 31).press('data-iq-lift');
    expect(s.stage()).toBe('seen');
    expect(s.get('data-iq-cloth', 'up')).not.toBe(null);
    expect(s.fact()).toContain('seen(');
    expect(s.calc()).toContain('7 \\times 4 + 3 = 31');
    s.press('data-iq-next').type('a', 26).press('data-iq-lift');
    expect(s.stage()).toBe('seen');
    expect(s.fact()).toContain('more(');
    expect(s.calc()).toContain('26 = 6 \\times 4 +');
  });

  it('estimate: a mark past the flag and a mark with room are answered by facts; the right one lays the block', () => {
    const s = mount({
      kind: 'estimate',
      rounds: [{ a: 943, b: 23 }],
      text: {
        ...NX,
        ...Object.fromEntries(
          ['lead', 'goal', 'ask', 'left', 'passes', 'short', 'laid', 'sum'].map((k) => [k, say(k)]),
        ),
        foundLine: say('line'),
      },
    });
    s.press('data-iq-mark', 50);
    expect(s.fact()).toContain('passes(');
    s.press('data-iq-mark', 30);
    expect(s.fact()).toContain('short(');
    s.press('data-iq-mark', 40);
    expect(s.stage()).toBe('guess');
    expect(s.get('data-iq-place', 0)).not.toBe(null); // now the units
    expect(s.fact()).toContain('laid(');
    expect(s.calc()).toContain('943 - 23 \\times 40 = 23');
    s.press('data-iq-mark', 1);
    expect(s.stage()).toBe('end');
    expect(s.fact()).toContain('sum(');
    expect(s.calc()).toContain('943 = 23 \\times 41 +');
  });

  it('estimate, blind: no product under the marks until he presses one; too big, too small, then the right one', () => {
    const marksShown = (s) => {
      const out = [];
      (function walk(nodes) {
        for (const n of nodes)
          if (typeof n !== 'string' && n.type !== 'math') {
            if (n.type === 'text' && String(n.props.className).includes('iq-mark__value'))
              out.push(Number(n.props.children));
            walk(n.children);
          }
      })(s.tree);
      return out;
    };
    const s = mount({
      kind: 'estimate',
      blind: true,
      rounds: [{ a: 4576, b: 208 }],
      text: {
        ...NX,
        ...Object.fromEntries(
          ['lead', 'goal', 'ask', 'left', 'passes', 'short', 'laid', 'sum'].map((k) => [k, say(k)]),
        ),
        foundLine: say('line'),
      },
    });
    expect(s.get('data-iq-blind', '1')).not.toBe(null);
    expect(marksShown(s)).toEqual([0]); // only 0: no multiple of 208 printed
    expect(s.get('data-iq-flag', 4576)).not.toBe(null); // what is left stays
    s.press('data-iq-mark', 30);
    expect(s.fact()).toContain('passes(');
    expect(s.calc()).toContain('208 \\times 30 = 6240');
    expect(s.calc()).toContain('6240 > 4576');
    expect(marksShown(s)).toEqual([0, 6240]);
    s.press('data-iq-mark', 10);
    expect(s.stage()).toBe('guess');
    expect(s.fact()).toContain('short(');
    expect(s.calc()).toContain('2080 + 2080 = 4160 \\le 4576');
    expect(marksShown(s).sort((x, y) => x - y)).toEqual([0, 2080, 6240]); // what he revealed stays under its mark
    s.press('data-iq-mark', 20);
    expect(s.get('data-iq-place', 0)).not.toBe(null); // the block is laid: now the units
    expect(s.calc()).toContain('4576 - 208 \\times 20 = 416');
    expect(marksShown(s)).toEqual([0]); // a new step: its products are hidden again
    s.press('data-iq-mark', 2);
    expect(s.stage()).toBe('end');
    s.press('data-iq-next');
    expect(s.onDone).toHaveBeenCalledWith({
      rounds: [
        expect.objectContaining({
          q: 22,
          guesses: [
            { place: 1, count: 30, ok: false },
            { place: 1, count: 10, ok: false },
            { place: 1, count: 20, ok: true },
            { place: 0, count: 2, ok: true },
          ],
        }),
      ],
    });
  });

  it('estimate without `blind` keeps its ruler: every product printed under its mark', () => {
    const s = mount({
      kind: 'estimate',
      rounds: [{ a: 943, b: 23 }],
      text: {
        ...NX,
        ...Object.fromEntries(
          ['lead', 'goal', 'ask', 'left', 'passes', 'short', 'laid', 'sum'].map((k) => [k, say(k)]),
        ),
        foundLine: say('line'),
      },
    });
    expect(s.get('data-iq-blind', '0')).not.toBe(null);
    expect(s.all()).toContain('2300');
  });

  const BRACKET = {
    ...NX,
    ...Object.fromEntries(['lead', 'goal', 'ask', 'miss', 'ok', 'where', 'seen'].map((k) => [k, say(k)])),
    foundLine: say('line'),
    check: 'check',
    between: 'between',
    onMark: 'onMark',
  };
  it('bracket: a wrong pair is answered by its two products; between two marks, then ON a mark (exact)', () => {
    const s = mount({
      kind: 'bracket',
      rounds: [
        { a: 38, b: 7 },
        { a: 438, b: 73 },
      ],
      text: BRACKET,
    });
    s.type('lo', 4).type('hi', 5).press('data-iq-check');
    expect(s.stage()).toBe('guess');
    expect(s.fact()).toContain('miss(');
    expect(s.calc()).toContain('7 \\times 4 = 28');
    s.type('lo', 5).type('hi', 6).press('data-iq-check');
    expect(s.stage()).toBe('where');
    s.press('data-iq-where', 'between');
    expect(s.stage()).toBe('seen');
    expect(s.calc()).toContain('38 \\div 7 = 5{,}42\\dots');
    expect(s.get('data-iq-onmark')).toBe(null);
    // 438 = 73 × 6: the flag stands ON the mark 438 — the pair (6, 7) is the only one the template accepts
    s.press('data-iq-next').type('lo', 5).type('hi', 6).press('data-iq-check');
    expect(s.stage()).toBe('guess');
    s.type('lo', 6).type('hi', 7).press('data-iq-check');
    expect(s.stage()).toBe('where');
    s.press('data-iq-where', 'on');
    expect(s.calc()).toContain('438 \\div 73 = 6');
    expect(s.calc()).toContain('438 = 73 \\times 6 +');
    expect(s.get('data-iq-onmark', 438)).not.toBe(null);
  });

  it('bracket: where the flag stands in the window changes with the round (never fixed for multiples of 3)', () => {
    const offsets = new Set();
    for (const [a, b] of [
      [438, 73],
      [912, 24],
      [300, 7],
      [600, 13],
      [903, 11],
      [111, 4],
    ]) {
      const s = mount({ kind: 'bracket', rounds: [{ a, b }], text: BRACKET });
      const marks = [];
      (function walk(nodes) {
        for (const n of nodes)
          if (typeof n !== 'string' && n.type !== 'math') {
            if (n.type === 'text' && String(n.props.className).includes('iq-mark__value'))
              marks.push(Number(n.props.children));
            walk(n.children);
          }
      })(s.tree);
      const ks = marks.filter((m) => m > 0).map((m) => m / b);
      const lo = Math.floor(a / b);
      expect(ks, `${a} by ${b}`).toContain(lo);
      expect(ks, `${a} by ${b}`).toContain(lo + 1);
      offsets.add(lo - Math.min(...ks));
    }
    expect(offsets.size).toBeGreaterThan(1);
  });

  const COMMON_TEXT = {
    ...NX,
    ...Object.fromEntries(
      ['lead', 'goal', 'take', 'ask', 'onA', 'onB', 'seen', 'sayLead', 'sayMiss', 'sayOk'].map((k) => [k, say(k)]),
    ),
    foundLine: say('line'),
    lay: 'lay',
    shelf: { a: say('shelfA'), b: say('shelfB'), both: say('shelfBoth'), none: say('shelfNone') },
    sayCount: 'count',
    check: 'check',
  };
  it('common: each plank goes to its shelf; « Vérifier » with nothing marked is answered, then his longest and count', () => {
    const cands = [1, 2, 3, 4, 5, 6, 9, 12];
    const s = mount({ kind: 'common', rounds: [{ a: 12, b: 18, candidates: cands }], text: COMMON_TEXT });
    for (const d of cands) {
      s.press('data-iq-plank', d);
      expect(s.stage()).toBe('guess');
      s.press('data-iq-say-a', 12 % d === 0 ? 'yes' : 'no').press('data-iq-say-b', 18 % d === 0 ? 'yes' : 'no');
      s.press('data-iq-lay');
      expect(s.fact()).toContain('seen(');
    }
    expect(s.stage()).toBe('say');
    expect(s.get('data-iq-shelf', 'none')).not.toBe(null); // 5 holds neither
    s.press('data-iq-check');
    expect(s.stage()).toBe('say');
    expect(s.fact()).toBe(INQUIRY_TEXT.sayFirst({ needLong: true, needCount: true }));
    s.type('count', 4).press('data-iq-check');
    expect(s.fact()).toBe(INQUIRY_TEXT.sayFirst({ needLong: true, needCount: false }));
    s.press('data-iq-long', 3).press('data-iq-check');
    expect(s.fact()).toContain('sayMiss(');
    s.press('data-iq-long', 6).press('data-iq-check');
    expect(s.stage()).toBe('seen');
    expect(s.fact()).toContain('sayOk(');
  });

  it('common: a lesson may give its own words for what is missing (`text.sayFirst`)', () => {
    const s = mount({
      kind: 'common',
      rounds: [{ a: 4, b: 6, candidates: [2] }],
      text: { ...COMMON_TEXT, sayFirst: (f) => `first(${f.needLong},${f.needCount})` },
    });
    s.press('data-iq-plank', 2).press('data-iq-say-a', 'yes').press('data-iq-say-b', 'yes').press('data-iq-lay');
    s.type('count', 1).press('data-iq-check');
    expect(s.fact()).toBe('first(true,false)');
  });

  it('ladder: his next pair is answered by the row the world writes; his count, then the world finishes the ladder', () => {
    const s = mount({
      kind: 'ladder',
      mode: 'subtract',
      rounds: [{ a: 84, b: 36 }],
      text: {
        ...NX,
        ...Object.fromEntries(['lead', 'goal', 'ask', 'seen', 'folded', 'countAsk', 'end'].map((k) => [k, say(k)])),
        foundLine: say('line'),
        write: 'write',
        planks: 'planks',
        countLabel: 'rows',
        finish: 'finish',
      },
    });
    s.type('x', 48).type('y', 36).press('data-iq-write');
    expect(s.stage()).toBe('guess');
    expect(s.fact()).toContain('seen(');
    expect(s.get('data-iq-row', 2)).not.toBe(null);
    s.type('x', 12).type('y', 36).press('data-iq-write'); // either order
    expect(s.stage()).toBe('count');
    s.type('count', 5).press('data-iq-count');
    expect(s.stage()).toBe('seen');
    expect(s.fact()).toContain('end(');
    expect(s.get('data-iq-row', 5)).not.toBe(null);
    s.press('data-iq-next');
    expect(s.onDone).toHaveBeenCalledWith({
      rounds: [expect.objectContaining({ a: 84, b: 36, steps: 5, guessed: 5, gcd: 12 })],
    });
  });

  it('nest: each probe is laid on the three strips after his answer; at the end the two lists stand side by side', () => {
    const probes = [5, 6, 8, 4, 24];
    const s = mount({
      kind: 'nest',
      rounds: [{ a: 24, b: 36, probes }],
      text: {
        ...NX,
        ...Object.fromEntries(
          ['lead', 'goal', 'given', 'divisorsLabel', 'ask', 'seen', 'compare', 'commonLabel'].map((k) => [k, say(k)]),
        ),
        foundLine: say('line'),
      },
    });
    for (const [i, p] of probes.entries()) {
      expect(s.get('data-iq-probe', p)).not.toBe(null);
      s.press('data-iq-say', 12 % p === 0 ? 'yes' : 'no');
      expect(s.stage()).toBe(i + 1 < probes.length ? 'guess' : 'compare');
    }
    expect(s.fact()).toContain('compare(');
    expect(s.get('data-iq-list', 'common')).not.toBe(null);
    expect(s.get('data-iq-list', 'g')).not.toBe(null);
  });

  it('chart: on the next hundred he tests the first gaps himself, one after the other, then the world finishes it', () => {
    const T = {
      ...Object.fromEntries(
        [
          'lead',
          'goal',
          'how',
          'rest',
          'valuesAsk',
          'lensAsk',
          'claim',
          'claimOk',
          'seal',
          'confirmed',
          'confirming',
        ].map((k) => [k, say(k)]),
      ),
      testBtn: say('testBtn'),
      board: say('board'),
      foundLine: say('line'),
      lens: { units: 'units', sum: 'sum' },
      link: { equals: 'equals', divides: 'divides' },
      fill: 'fill',
      look: 'look',
      next: 'next',
      last: 'last',
      done: 'done',
      sealed: 'sealed',
    };
    const s = mount({
      kind: 'chart',
      planks: [{ b: 5, manual: 3, lenses: ['units', 'sum'] }],
      divisors: [2, 3],
      text: T,
    });
    s.press('data-iq-test').press('data-iq-test').press('data-iq-test').press('data-iq-fill');
    s.press('data-iq-look').press('data-iq-lens', 'units').press('data-iq-value', 0).press('data-iq-value', 5);
    s.press('data-iq-seal');
    // the next hundred: nothing is tested before he acts
    expect(s.stage()).toBe('confirm');
    expect(s.get('data-iq-from', 100)).not.toBe(null);
    expect(s.get('data-iq-lit', '1')).toBe(null);
    expect(s.all()).toContain(INQUIRY_TEXT.confirmTest(5, 100, 3));
    expect(s.get('data-iq-next')).toBe(null);
    s.press('data-iq-test', 100);
    expect(s.get('data-iq-div', 100)).not.toBe(null); // his test writes its division, as on the first chart
    s.press('data-iq-test', 101);
    expect(s.get('data-iq-next')).toBe(null);
    s.press('data-iq-test', 102); // the third: the world finishes the hundred
    expect(s.get('data-iq-test')).toBe(null);
    expect(s.all()).toContain('confirmed(');
    expect(s.get('data-iq-cell', 195).props['data-iq-lit']).toBe('1');
    expect(s.get('data-iq-next')).not.toBe(null);
  });

  it('join: two equal gaps write two equal lines — each kept (keyed by place, never by its text)', () => {
    const s = mount({
      kind: 'join',
      d: 7,
      rounds: [{ op: 'sum', a: 21, b: 21 }],
      text: {
        ...NX,
        ...Object.fromEntries(['lead', 'goal', 'label', 'ask', 'seen'].map((k) => [k, say(k)])),
        foundLine: say('line'),
      },
    });
    const lines = s.get('data-iq-calc').children;
    expect(lines).toHaveLength(2);
    expect(lines[0].text).toBe(lines[1].text);
    expect(new Set(lines.map((l) => l.key)).size).toBe(2);
    s.press('data-iq-say', 'yes');
    expect(s.stage()).toBe('seen');
    expect(s.calc()).toContain('21 + 21 = 42');
    const keys = Calc({ items: ['2003 = 20 \\times 100 + 3', '2003 = 20 \\times 100 + 3'] }).props.children.map(
      (c) => c.key,
    );
    expect(new Set(keys).size).toBe(2);
  });

  it('letters: a quotient past `max` gets its chip; a sample with no natural □ moves on; a false card no sample refutes is answered', () => {
    const s = mount({
      kind: 'letters',
      statement: { given: ['$d \\mid a$'], goal: '$d \\mid a + b$', gives: ['d|a'] },
      numbers: { value: (v) => v.a + v.b, by: (v) => v.d, max: 5 },
      samples: [
        { d: 2, a: 10, b: 12 }, // 22 = 2 × 11: past max
        { d: 4, a: 6, b: 3 }, // 9 = 4 × □: no natural number
      ],
      cards: [
        { id: 'ok', tex: 'ok', ok: true, needs: ['d|a'], gives: [], holdsOn: () => true },
        { id: 'sly', tex: 'sly', ok: false, holdsOn: () => true }, // false, yet true on every sample
      ],
      order: ['ok'],
      text: {
        ...Object.fromEntries(
          ['numbersAsk', 'numbersOk', 'numbersMiss', 'carry', 'hidden', 'line', 'needs'].map((k) => [k, say(k)]),
        ),
        lead: 'lead',
        goal: 'goal',
        nextSample: 'nextSample',
        toCards: 'toCards',
        cardsLead: 'cardsLead',
        cardsAsk: 'cardsAsk',
        givenLabel: 'given',
        goalLabel: 'goalL',
        proved: 'proved',
        done: 'done',
      },
    });
    expect(s.get('data-iq-q', 11)).not.toBe(null);
    s.press('data-iq-q', 11);
    expect(s.fact()).toContain('numbersOk(');
    s.press('data-iq-next');
    expect(s.get('data-iq-q', 1)).toBe(null);
    expect(s.fact()).toBe(INQUIRY_TEXT.noWhole({ d: 4, a: 6, b: 3 }, 9, 4));
    s.press('data-iq-next');
    expect(s.stage()).toBe('cards');
    s.press('data-iq-card', 'sly');
    expect(s.fact()).toBe(INQUIRY_TEXT.unrefuted());
    s.press('data-iq-card', 'ok');
    expect(s.stage()).toBe('proved');
  });
});
