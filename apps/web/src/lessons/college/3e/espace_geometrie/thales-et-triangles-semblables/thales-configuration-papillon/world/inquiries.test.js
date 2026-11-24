/**
 * THE EXPERIMENTS of lesson `thales-configuration-papillon`: `halfturn` (papillon) and `plan` (calcul-depuis-le-sommet,
 * it writes the rule). The shared checks (`describeExperiments`: no two keys share a (kind, mode); no sentence names a
 * key or states its rule; French agreement), then the lesson's own: each experiment played through its world's reducer
 * on the lesson's numbers — the turned side lands straight or crooked, and the screen never prints a chain of ratios; the
 * false procedures are laid where he makes them (the plan writes the rule, so they never reach a tile) — and each screen
 * renders whole. Ported from the Algerian lesson `talis-hisab-atwal`.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describeExperiments } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import Inquiry from '../../../../../../common/gameworld/nilePyramids/Inquiry';
import { textOf } from '../../../../../../common/gameworld/nilePyramids/inquiryParts';
import {
  initPlan,
  planReducer,
  planResult,
  toolsOf,
  unknownsOf,
  CARDS,
  roundFig,
} from '../../../../../../common/gameworld/nilePyramids/plan';
import {
  initHalfturn,
  halfturnReducer,
  halfturnResult,
} from '../../../../../../common/gameworld/nilePyramids/halfturn';
import { chain } from '../../../../../../common/gameworld/nilePyramids/figure';
import { HalfturnView } from '../../../../../../common/gameworld/nilePyramids/InquiryHalfturn';
import { PlanView } from '../../../../../../common/gameworld/nilePyramids/InquiryPlan';
import { HALFTURN_INQUIRY, INQUIRIES, PLAN_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { K, over, plus, times, write } from './math';

// the screens expose their state to the walks on `window` (dev only)
globalThis.window = globalThis.window ?? {};

const K1 = K.papillon;
const K2 = K.calcul;

/** Every string of a value: a string, a function called with sample letters, an object's values. */
const stringsOf = (v) => {
  if (typeof v === 'string') return [v];
  if (typeof v === 'function') return stringsOf(v('M', 'A', 'B'));
  if (v && typeof v === 'object') return Object.values(v).flatMap(stringsOf);
  return [];
};

describeExperiments({
  ofKey: INQUIRIES,
  linesOf: (key, spec) => stringsOf(textOf(spec.kind, spec)),
  // no key's name, no word that names a theorem or a method of the lesson
  never: /Thalès|papillon|proportionn|produit en croix|quatrième/i,
  own: {
    [K1]: /égaux|égal|parallèle|rapports? (?:sont|est)/i,
    [K2]: /part du sommet|chaque longueur|recoll|d’en face|deux rapports avec/i,
  },
});

const run = (reducer, spec, s, actions) => actions.reduce((acc, a) => reducer(spec, acc, a), s);
const lay = (text) => [{ type: 'type', text }, { type: 'lay' }];
const picks = (...cards) => cards.map((card) => ({ type: 'pick', card }));

describe('halfturn — the turned side lands straight on the parallel pair, crooked on the other', () => {
  it('round 1 is HIS river, whole: SE 9, SA 72, ER 52, AF 416 — SR = √2785, SF = 8√2785; only the measured lengths drawn', () => {
    const river = HALFTURN_INQUIRY.rounds[0].fig;
    expect(river.names).toEqual({ V: 'S', M: 'E', B: 'A', N: 'R', C: 'F' });
    expect(river.len).toEqual({ VM: '9', VB: '72', VN: '√2785', VC: '8√2785', MN: '52', BC: '416' });
    expect(river.show).toEqual(['VM', 'VB', 'MN', 'BC']);
  });
  it('no chain is printed by default: the inquiry never asks for `chainOwn`', () => {
    expect('chainOwn' in HALFTURN_INQUIRY).toBe(false);
  });
  it('the parallel pair (k = 4/7) holds its chain, the crooked one does not; the point always lands on its own line', () => {
    expect(HALFTURN_INQUIRY.rounds.map((r) => chain(r.fig))).toEqual([true, true, false]);
    let s = initHalfturn(HALFTURN_INQUIRY);
    for (const guess of ['B', 'C', 'B']) {
      s = halfturnReducer(HALFTURN_INQUIRY, s, { type: 'predict', line: guess });
      for (let i = 0; i < 6; i += 1) s = halfturnReducer(HALFTURN_INQUIRY, s, { type: 'turn', d: 1 });
      expect(s.rows.at(-1)).toMatchObject({ landed: 'B', right: guess === 'B' });
      s = halfturnReducer(HALFTURN_INQUIRY, s, { type: 'next' });
    }
    expect(s.done).toBe(true);
    const rows = FORGES[K1].fromInquiry(halfturnResult(s)).rows;
    // the forge reads the turned pairs first, then the river (no refutation writes a length he did not measure)
    expect(rows.map((c) => c.held)).toEqual([true, false, true]);
    expect(rows.at(-1).head).toBe('Le Nil');
  });
});

describe('halfturn shows FACTS, never the chain (gate A, ledger A1): every landed round rendered', () => {
  // a ratio of two segment names on that screen would be the right tiles of the forge, shown before the tiles
  const RATIO_OF_SEGMENTS = /\\dfrac\{[A-Z]'?[A-Z]'?\}\{[A-Z]'?[A-Z]'?\}/;
  it.each(HALFTURN_INQUIRY.rounds.map((r, i) => [i, r.fig.head ?? `${r.fig.names.V}`]))(
    'round %s (%s), landed',
    (i) => {
      let s = initHalfturn(HALFTURN_INQUIRY);
      for (let k = 0; k <= i; k += 1) {
        if (k > 0) s = halfturnReducer(HALFTURN_INQUIRY, s, { type: 'next' });
        s = halfturnReducer(HALFTURN_INQUIRY, s, { type: 'predict', line: 'B' });
        for (let t = 0; t < 6; t += 1) s = halfturnReducer(HALFTURN_INQUIRY, s, { type: 'turn', d: 1 });
      }
      expect(s.stage).toBe('landed');
      const html = renderToString(createElement(HalfturnView, { spec: HALFTURN_INQUIRY, state: s, act: {} }));
      expect(html).toContain('data-iq-landed="B"');
      expect(html).not.toContain('data-iq-chain-own');
      expect(html).not.toMatch(RATIO_OF_SEGMENTS);
      expect(html).not.toMatch(/undefined|NaN/);
    },
  );
});

describe('plan on the lesson’s numbers — the false procedures are laid where he makes them', () => {
  it('round 1 is HIS river: SE 9, SA 72, ER 52 given — no join is needed, 416 touches; the across 468 goes over, 6,5 falls short', () => {
    const s = initPlan(PLAN_INQUIRY);
    expect(toolsOf(s).map((t) => t.id)).toEqual(['VM+VB']);
    expect(roundFig(PLAN_INQUIRY, 0).fig.len.VMB).toBe('81');
    const base = run(planReducer, PLAN_INQUIRY, s, picks('VB', 'BC'));
    for (const [typed, fact] of [
      ['416', 'fits'],
      [write(over(times('52', '81'), '9')), 'overhang'],
      [write(over(times('52', '9'), '72')), 'gap'],
    ])
      expect(run(planReducer, PLAN_INQUIRY, base, lay(typed)).laid.fact, typed).toBe(fact);
  });

  it('a card with two unknowns refuses itself: SR and SF are neither given', () => {
    expect(unknownsOf(initPlan(PLAN_INQUIRY), CARDS[1])).toBe(2);
    expect(planReducer(PLAN_INQUIRY, initPlan(PLAN_INQUIRY), { type: 'pick', card: 'VC' }).refused).toBe('VC');
  });

  it('the nested round: the join AM + MB = 6, MN = 5,5; the piece (8,25) and the inverted ratio (49,5) go over', () => {
    const s = run(planReducer, PLAN_INQUIRY, initPlan(PLAN_INQUIRY), [
      ...picks('VB', 'BC'),
      ...lay('416'),
      { type: 'next' },
    ]);
    expect(s.i).toBe(1);
    expect(toolsOf(s).map((t) => t.id)).toEqual(['VM+MB']);
    const joined = run(planReducer, PLAN_INQUIRY, s, [{ type: 'tool', id: 'VM+MB' }, ...picks('VB', 'BC')]);
    for (const [typed, fact] of [
      ['5,5', 'fits'],
      ['8,25', 'overhang'],
      ['49,5', 'overhang'],
    ])
      expect(run(planReducer, PLAN_INQUIRY, joined, lay(typed)).laid.fact, typed).toBe(fact);
  });

  it('the butterfly round: AE is given ACROSS O — the cut AE − OA = 22,5, EF = 12,5; the across (17,5) goes over, the inverted (2) falls short', () => {
    expect(roundFig(PLAN_INQUIRY, 2).fig.len.VMB).toBe(write(plus('9', '22,5')));
    let s = run(planReducer, PLAN_INQUIRY, initPlan(PLAN_INQUIRY), [
      ...picks('VB', 'BC'),
      ...lay('416'),
      { type: 'next' },
    ]);
    s = run(planReducer, PLAN_INQUIRY, s, [
      { type: 'tool', id: 'VM+MB' },
      ...picks('VB', 'BC'),
      ...lay('5,5'),
      { type: 'next' },
    ]);
    expect(s.i).toBe(2);
    expect(toolsOf(s).map((t) => t.id)).toEqual(['VMB-VM']);
    const cut = run(planReducer, PLAN_INQUIRY, s, [{ type: 'tool', id: 'VMB-VM' }, ...picks('VB', 'BC')]);
    for (const [typed, fact] of [
      ['12,5', 'fits'],
      ['17,5', 'overhang'],
      ['2', 'gap'],
    ])
      expect(run(planReducer, PLAN_INQUIRY, cut, lay(typed)).laid.fact, typed).toBe(fact);
  });

  it('the whole experiment: the result writes his rule, the forge takes it', () => {
    const s = run(planReducer, PLAN_INQUIRY, initPlan(PLAN_INQUIRY), [
      ...picks('VB', 'BC'),
      ...lay('468'),
      { type: 'next' },
      ...lay('416'),
      { type: 'next' },
      { type: 'tool', id: 'VM+MB' },
      ...picks('VB', 'BC'),
      ...lay('5,5'),
      { type: 'next' },
      { type: 'tool', id: 'VMB-VM' },
      ...picks('VB', 'BC'),
      ...lay('12,5'),
      { type: 'next' },
    ]);
    expect(s.done).toBe(true);
    const result = planResult(s);
    expect(result.rows.map((r) => r.fact)).toEqual(['overhang', 'fits', 'fits', 'fits']);
    expect(result.plan).toEqual({ cards: ['VB', 'BC'], joins: ['VMB-VM'] });
    const out = FORGES[K2].fromInquiry(result);
    expect(FORGES[K2].isTheRule(out.rule)).toBe(true);
    expect(out.rows.map((c) => c.held)).toEqual([false, true, true, true]);
  });

  it('every round renders laid, its length written beside it, never a chain of ratios with segment names', () => {
    let s = initPlan(PLAN_INQUIRY);
    const steps = [[], [{ type: 'tool', id: 'VM+MB' }], [{ type: 'tool', id: 'VMB-VM' }]];
    const right = ['416', '5,5', '12,5'];
    for (let i = 0; i < 3; i += 1) {
      s = run(planReducer, PLAN_INQUIRY, s, [...steps[i], ...picks('VB', 'BC'), ...lay(right[i])]);
      const html = renderToString(createElement(PlanView, { spec: PLAN_INQUIRY, state: s, act: {} }));
      expect(html, `round ${i}`).toContain('data-iq-laid="fits"');
      expect(html).not.toMatch(/undefined|NaN|√/);
      s = planReducer(PLAN_INQUIRY, s, { type: 'next' });
    }
  });
});

describe('each experiment renders whole on its lesson’s spec', () => {
  it.each(Object.entries(INQUIRIES))('%s', (_, spec) => {
    const html = renderToString(createElement(Inquiry, { spec, game: { audio: { play() {} } }, onDone() {} }));
    expect(html).toContain(`data-iq="${spec.kind}"`);
    expect(html).not.toMatch(/undefined|NaN/);
  });
});
