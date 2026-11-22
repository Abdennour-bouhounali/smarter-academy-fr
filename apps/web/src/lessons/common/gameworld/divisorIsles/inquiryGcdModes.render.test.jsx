import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Inquiry from './Inquiry';
import { Strip } from './InquiryGcd';
import { WitnessView, PairView, FoldView, BothView } from './InquiryGcdModes';
import {
  initWitness,
  witnessReducer,
  initPair,
  pairReducer,
  initFold,
  foldReducer,
  initBoth,
  bothStart,
  bothReducer,
} from './gcdModes';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

/** A toy lesson: every sentence the four modes ask for (GAME_WORLD.md), as plain tags. */
const tag =
  (name) =>
  (...args) =>
    `${name}(${args.map((x) => (x && typeof x === 'object' ? Object.keys(x).length : x)).join(',')})`;
const NX = { next: 'next', done: 'done', yes: 'yes', no: 'no' };
const play = (reducer, spec, actions, from) => actions.reduce((s, a) => reducer(spec, s, a), from);
const noop = () => {};
const clean = (html) => expect(html).not.toMatch(/undefined|NaN|\[object/);

const WITNESS = {
  kind: 'common',
  mode: 'witness',
  rounds: [
    { a: 645, b: 410, candidates: [2, 3, 5, 9, 10] },
    { a: 85, b: 119, candidates: [2, 3] },
  ],
  text: {
    ...NX,
    lead: tag('lead'),
    goal: tag('goal'),
    take: tag('take'),
    ask: (f) => `ask[${f.d}]`,
    onA: tag('onA'),
    onB: tag('onB'),
    lay: 'lay',
    seen: (f, g) => `seen[${f.d}:${f.both}:${g.a}]`,
    shelf: { a: tag('shelfA'), b: tag('shelfB'), both: tag('shelfBoth'), none: tag('shelfNone') },
    enoughAsk: (f) => `enoughAsk[${f.d}]`,
    enoughSeen: (f) => `enoughSeen[${f.d}:${f.said}:${f.tried}:${f.left}]`,
    foundLine: (r) => `line[${r.a}:${r.witness}]`,
  },
};
const PAIR = {
  kind: 'nest',
  mode: 'pair',
  rounds: [{ a: 152, b: 95, pair: [95, 57], probes: [19, 5] }],
  text: {
    ...NX,
    lead: tag('lead'),
    goal: tag('goal'),
    ask: (f) => `ask[${f.p}]`,
    onFirst: (f) => `onFirst[${f.a}]`,
    onSecond: (f) => `onSecond[${f.x}]`,
    lay: 'lay',
    seen: (f, g) => `seen[${f.p}:${f.inFirst}:${f.inSecond}:${g.first}]`,
    foundLine: (f) => `line[${f.p}]`,
    compare: (f) => `compare[${f.first.join('')}|${f.second.join('')}:${f.equal}]`,
    firstLabel: tag('firstLabel'),
    secondLabel: tag('secondLabel'),
  },
};
const FOLD = {
  kind: 'ladder',
  mode: 'fold',
  rounds: [{ a: 962, b: 296 }],
  text: {
    ...NX,
    lead: tag('lead'),
    goal: tag('goal'),
    planks: 'planks',
    folded: (k) => `folded[${k}]`,
    foldAsk: (f) => `foldAsk[${f.a}:${f.b}:${f.rows}]`,
    fold: 'fold',
    foldMiss: (f) => `foldMiss[${f.q}:${f.r}:${f.said.q}]`,
    foldSeen: (f) => `foldSeen[${f.q}:${f.r}]`,
    end: (f) => `end[${f.gcd}:${f.lines}]`,
    foundLine: (r) => `line[${r.a}:${r.gcd}]`,
  },
};
const BOTH = {
  kind: 'ladder',
  mode: 'both',
  rounds: [{ a: 1003, b: 34 }],
  text: {
    ...NX,
    lead: tag('lead'),
    goal: tag('goal'),
    ladderLabel: (m) => `label-${m}`,
    countLine: (m, n) => `count-${m}-${n}`,
    ask: tag('ask'),
    shorter: { subtract: 'S', divide: 'D', same: 'same' },
    byLabel: 'by',
    byUnit: 'rows',
    run: 'run',
    end: (f) => `end[${f.steps.subtract}:${f.steps.divide}:${f.said.shorter}]`,
    foundLine: (r) => `line[${r.a}]`,
  },
};

describe('the four modes are mounted by Inquiry and open on their question, their goal and their first act', () => {
  const cases = [
    [WITNESS, 'common', 'witness', 'data-iq-plank="2"'],
    [PAIR, 'nest', 'pair', 'data-iq-say-first="yes"'],
    [FOLD, 'ladder', 'fold', 'data-iq-ladder'],
    [BOTH, 'ladder', 'both', 'data-iq-shorter="same"'],
  ];
  for (const [spec, kind, mode, first] of cases)
    it(`${kind} · ${mode}`, () => {
      const html = renderToString(<Inquiry spec={spec} onDone={noop} />);
      expect(html).toContain(`data-iq="${kind}"`);
      expect(html).toContain(`data-iq-mode="${mode}"`);
      expect(html).toContain('lead(');
      expect(html).toContain('data-iq-goal');
      expect(html).toContain(first);
      clean(html);
    });
});

describe('common · witness — played stage by stage', () => {
  const view = (s) => renderToString(<WitnessView spec={WITNESS} state={s} act={{}} />);
  const lay = (d, ga, gb) => [
    { type: 'take', d },
    { type: 'say', side: 'a', v: ga },
    { type: 'say', side: 'b', v: gb },
    { type: 'lay' },
    { type: 'shown' },
  ];

  it('one plank on the shelf « both » ends the round: the question « is one enough? », the planks left stay in the tray', () => {
    let s = play(witnessReducer, WITNESS, [...lay(2, true, true), ...lay(5, true, true)], initWitness());
    let html = view(s);
    expect(html).toContain('data-iq-stage="enough"');
    expect(html).toContain('data-iq-witness="5"');
    expect(html).toContain('enoughAsk[5]');
    expect(html).toContain('data-iq-enough="yes"');
    expect(html).toMatch(/data-iq-shelf="both"[\s\S]*>5</);
    for (const d of [3, 9, 10]) expect(html).toMatch(new RegExp(`disabled=""[^>]*data-iq-plank="${d}"`));
    expect(html).not.toContain('data-iq-long'); // the longest is never asked
    s = witnessReducer(WITNESS, s, { type: 'enough', v: true });
    html = view(s);
    expect(html).toContain('enoughSeen[5:true:2:3]');
    expect(html).toContain('data-iq-next');
    clean(html);
  });

  it('a tray where no plank fills both ends on that fact alone (the kit’s sentence when the lesson gives none)', () => {
    let s = play(
      witnessReducer,
      WITNESS,
      [...lay(2, true, true), ...lay(5, true, true), { type: 'enough', v: true }],
      initWitness(),
    );
    s = witnessReducer(WITNESS, s, { type: 'next' });
    s = play(witnessReducer, WITNESS, [...lay(3, false, false), ...lay(2, false, false)], s);
    const html = view(s);
    expect(html).toContain('data-iq-stage="seen"');
    expect(html).toContain('Aucune planche de ce tas ne remplit les deux fossés à la fois.');
    expect(html).not.toContain('data-iq-witness');
    expect(html).not.toContain('enoughAsk');
    // the hidden common plank 17 is never revealed: no chip, no word of the fact names it
    expect(html).not.toMatch(/>17</);
    expect(html.match(/data-iq-fact[^>]*>([\s\S]*?)<\/p>/)[1]).not.toContain('17');
    clean(html);
  });
});

describe('nest · pair — four strips, two predictions, the two lists side by side', () => {
  const view = (s) => renderToString(<PairView spec={PAIR} state={s} act={{}} />);
  it('opens on the four strips; the two lists stand side by side at the end', () => {
    let html = view(initPair());
    for (const t of ['a', 'b', 'x', 'y']) expect(html).toContain(`data-iq-strip="${t}"`);
    expect(html).toContain('data-iq-pairs="152:95|95:57"');
    expect(html).toContain('ask[19]');
    expect(html).not.toContain('data-iq-lists');
    const say = (f, g) => [
      { type: 'say', side: 'first', v: f },
      { type: 'say', side: 'second', v: g },
      { type: 'lay' },
    ];
    let s = play(pairReducer, PAIR, say(true, true), initPair());
    html = view(s);
    expect(html).toContain('data-iq-calc');
    expect(html).toContain('57 = 19'); // the plank laid on the four strips, its four divisions written
    s = play(pairReducer, PAIR, [{ type: 'shown' }, ...say(false, true), { type: 'shown' }], s);
    html = view(s);
    expect(html).toContain('data-iq-stage="compare"');
    expect(html).toContain('data-iq-list="first" data-iq-planks="1,19"');
    expect(html).toContain('data-iq-list="second" data-iq-planks="1,19"');
    expect(html).toContain('compare[119|119:true]');
    expect(html).toMatch(/class="is-fell"[^>]*>[\s\S]*line\[5\]/);
    clean(html);
  });
});

describe('ladder · fold — the run written, folded by him, the ladder finished in folded lines', () => {
  const view = (s, input) => renderToString(<FoldView spec={FOLD} state={s} act={{}} input={input} />);
  const ticks = (n) => Array.from({ length: n }, () => ({ type: 'tick' }));
  it('asks the fold in its template once the run is written; a miss counts the rows and lights what is left', () => {
    let s = play(foldReducer, FOLD, ticks(3), initFold());
    let html = view(s);
    expect(html).toContain('data-iq-stage="fold"');
    for (const r of [1, 2, 3]) expect(html).toContain(`data-iq-row="${r}"`);
    expect(html).toContain('foldAsk[962:296:3]');
    expect(html).toContain('data-iq-in="q"');
    expect(html).toContain('data-iq-in="r"');
    expect(html).toContain('data-iq-fold-go');
    expect(html).toContain('data-iq-ticks="1,2,37,74"');
    s = foldReducer(FOLD, s, { type: 'fold', q: 2, r: 370 });
    html = view(s);
    expect(html).toContain('foldMiss[3:74:2]');
    for (const k of [1, 2, 3]) expect(html).toContain(`data-iq-counted="${k}"`);
    s = play(foldReducer, FOLD, [{ type: 'fold', q: 3, r: 74 }, { type: 'tick' }], s);
    html = view(s);
    expect(html).toContain('data-iq-stage="seen"');
    expect(html).toContain('data-iq-line="1" data-iq-rows="1-3"');
    expect(html).toContain('data-iq-line="2" data-iq-rows="4-7"');
    expect(html).not.toContain('data-iq-row=');
    expect(html).toContain('end[74:2]');
    clean(html);
  });

  it('a long run is folded on screen behind one line (never scrolled): 1003 and 34', () => {
    const long = { ...FOLD, rounds: [{ a: 1003, b: 34 }] };
    const s = play(foldReducer, long, ticks(29), initFold());
    const html = renderToString(<FoldView spec={long} state={s} act={{}} />);
    expect(s.stage).toBe('fold');
    expect((html.match(/data-iq-row=/g) ?? []).length).toBeLessThanOrEqual(6);
    expect(html).toContain('data-iq-row="1"');
    expect(html).toContain('data-iq-row="29"');
    expect(html).toMatch(/data-iq-fold="\d+"/);
    clean(html);
  });
});

describe('ladder · both — the prediction, the two ladders in step, the counts under them', () => {
  const view = (s, input) => renderToString(<BothView spec={BOTH} state={s} act={{}} input={input} />);
  it('the box « by how many » shows once a ladder is chosen, not for « the same »', () => {
    expect(view(initBoth(), { shorter: 'divide', by: '' })).toContain('data-iq-in="by"');
    expect(view(initBoth(), { shorter: 'same', by: '' })).not.toContain('data-iq-in="by"');
    expect(view(initBoth(), { shorter: null, by: '' })).toMatch(/disabled=""[^>]*data-iq-run/);
  });
  it('31 rows against 2 on one drawing each, the counts standing under them', () => {
    let s = bothReducer(BOTH, initBoth(), { type: 'say', shorter: 'divide', by: 20 });
    s = play(bothReducer, BOTH, [{ type: 'tick' }, { type: 'tick' }], s);
    let html = view(s);
    expect(html).toContain('data-iq-col="subtract" data-iq-rows="2"');
    expect(html).toContain('data-iq-col="divide" data-iq-rows="2" data-iq-steps="2"');
    s = play(
      bothReducer,
      BOTH,
      Array.from({ length: 29 }, () => ({ type: 'tick' })),
      s,
    );
    html = view(s);
    expect(html).toContain('data-iq-stage="seen"');
    expect(html).toContain('data-iq-steps="31"');
    expect((html.match(/data-iq-bar=/g) ?? []).length).toBe(33);
    expect(html).toContain('count-subtract-31');
    expect(html).toContain('count-divide-2');
    expect(html).toContain('end[31:2:divide]');
    clean(html);
  });
});

describe('ladder · both on a workshop’s bench — it starts where he left it (`spec.from`)', () => {
  it('empty without a kept state; a kept state is given back, a run goes on from its row', () => {
    expect(bothStart(BOTH)).toEqual(initBoth());
    expect(bothStart({ ...BOTH, from: { ri: 4, rounds: [] } })).toEqual(initBoth());
    const s = bothReducer(BOTH, initBoth(), { type: 'say', shorter: 'divide', by: 29 });
    const kept = bothStart({ ...BOTH, from: s });
    expect(kept).toBe(s);
    expect(bothReducer(BOTH, kept, { type: 'tick' }).shown).toBe(1);
  });
});

describe('common — a gap of 0 cells, twins, the gap 1 (lesson 5)', () => {
  const COMMON = {
    kind: 'common',
    rounds: [
      { a: 27, b: 0, candidates: [1, 3, 9, 27, 2] },
      { a: 27, b: 27, candidates: [1, 3, 9, 27] },
      { a: 27, b: 1, candidates: [1, 3, 27] },
    ],
    text: {
      ...WITNESS.text,
      sayLead: tag('sayLead'),
      sayCount: 'count',
      check: 'check',
      sayMiss: tag('m'),
      sayOk: tag('o'),
    },
  };
  it('the screen opens on a gap of 0 without breaking', () => {
    const html = renderToString(<Inquiry spec={COMMON} onDone={noop} />);
    expect(html).toContain('data-iq-zero');
    clean(html);
    for (const r of COMMON.rounds.slice(1)) {
      const out = renderToString(<Inquiry spec={{ ...COMMON, rounds: [r] }} onDone={noop} />);
      expect(out).not.toContain('data-iq-zero');
      clean(out);
    }
  });
  it('a gap of 0 is an empty mark with « 0 »; a plank laid on it lays no plank', () => {
    const html = renderToString(
      <svg>
        <Strip n={0} d={3} u={30} y={40} tag="b" />
      </svg>,
    );
    expect(html).toContain('data-iq-zero');
    expect(html).toMatch(/>0<\/text>/);
    expect(html).not.toContain('iq-plank');
    expect(html).not.toContain('iq-rest');
  });
});
