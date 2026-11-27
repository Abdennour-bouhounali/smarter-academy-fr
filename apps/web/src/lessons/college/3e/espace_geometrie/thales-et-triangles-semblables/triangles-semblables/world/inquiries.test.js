/**
 * THE EXPERIMENTS of lesson `triangles-semblables`: `pair` (cotes-proportionnels) and `angles` (angles-egaux). The shared
 * checks (`describeExperiments`: no two keys share a (kind, mode); no sentence names a key or states its rule; French
 * agreement), then the lesson's own: each experiment played through its world's reducer on the design's numbers — the
 * world's verdict per round, the « attendu / mesuré » lengths, the TURN story, the third angles — and each screen renders
 * one round, never a recap of the rounds before it (gate A 4th, note 3).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describeExperiments } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import Inquiry from '../../../../../../common/gameworld/nilePyramids/Inquiry';
import { withStory } from '../../../../../../common/gameworld/nilePyramids/strings';
import {
  initPair,
  pairReducer,
  pairResult,
  ranks,
  expectedMeasured,
} from '../../../../../../common/gameworld/nilePyramids/pair';
import { PairView, pairTextOf } from '../../../../../../common/gameworld/nilePyramids/InquiryPair';
import {
  initAngles,
  anglesReducer,
  anglesResult,
  slideOf,
  toMeasure,
  triOf,
} from '../../../../../../common/gameworld/nilePyramids/angles';
import { AnglesView } from '../../../../../../common/gameworld/nilePyramids/InquiryAngles';
import { ANGLES_TEXT } from '../../../../../../common/gameworld/nilePyramids/anglesText';
import { ANGLES_INQUIRY, PAIR_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { K, NUMBERS } from './math';

// the screens expose their state to the walks on `window` (dev only)
globalThis.window = globalThis.window ?? {};

const K1 = K.cotes;
const K2 = K.angles;
const INQUIRIES = { [K1]: PAIR_INQUIRY, [K2]: ANGLES_INQUIRY };

/** Sample arguments for the kinds' sentence functions, by key (the shapes they take). */
const SAMPLE = {
  template: ['ABC'],
  stone: ['DEF'],
  figure: ['ABC', 'DEF'],
  length: ['3,8'],
  sideAria: ['AB', '3,8'],
  quotient: ['4,5', '2'],
  withLinks: [
    ['4,5', '5,7'],
    ['4,5', '5,1'],
  ],
  laidHow: [{ scale: 'up', turned: true, flipped: true }],
  leadDrawn: ['ABC'],
  pick: ['ABC'],
  slideOf: ['ABC', 'DEF', '8', '6'],
  aria: ['ABC', 'DEF'],
};
const stringsOf = (v, key) => {
  if (typeof v === 'string') return [v];
  if (typeof v === 'function') return stringsOf(v(...(SAMPLE[key] ?? [])), key);
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => stringsOf(x, k));
  return [];
};
const textOfKind = (spec) => (spec.kind === 'pair' ? pairTextOf(spec) : withStory(ANGLES_TEXT, spec.text));

describeExperiments({
  ofKey: INQUIRIES,
  linesOf: (key, spec) => stringsOf(textOfKind(spec)),
  // no key's name, no word of a tablet
  never: /semblabl|proportionn|homologu|réduction|agrandiss|Thalès/i,
  own: {
    [K1]: /plus petit au plus grand|rang[ée]|par taille|quotients? (?:sont )?égaux|trois quotients/i,
    [K2]: /angles égaux|deux angles (?:de l’un )?(?:sont )?égaux|égaux à deux angles|somme des angles/i,
  },
});

// ───────── pair ─────────
const runP = (s, actions) => actions.reduce((acc, a) => pairReducer(PAIR_INQUIRY, acc, a), s);
const link = (t, s) => [
  { type: 'pick', side: 't', i: t },
  { type: 'pick', side: 's', i: s },
];
const bySize = (r, skip) => {
  const rt = ranks(PAIR_INQUIRY.template.sides);
  const rs = ranks(r.stone.sides);
  return rt.flatMap((t, n) => (t === skip ? [] : link(t, rs[n])));
};

describe('pair on the lesson’s numbers — the template 2 ; 3 ; 3,8 and five tracés (design v4)', () => {
  const R = PAIR_INQUIRY.rounds;
  it('the rounds are the design’s: SIM, RED, ONE, DIFF linked from the world’s first link, TURN by the names', () => {
    expect(PAIR_INQUIRY.template.sides).toEqual(NUMBERS.cotes.template);
    expect(R.map((r) => r.id)).toEqual(['sim', 'red', 'one', 'diff', 'turn']);
    expect(R.map((r) => r.stone.sides)).toEqual(NUMBERS.cotes.rounds.map((r) => r.sides));
    expect(R.map((r) => r.link)).toEqual(['world-first', 'world-first', 'world-first', 'world-first', 'given']);
    expect(R.find((r) => r.id === 'red').stone.flip).toBe(true);
  });

  it('linked by size: attendu 4,5 ; 5,7 — mesuré 4,5 ; 5,1 (ONE) and 4 ; 4,8 (DIFF); attendu 1,5 ; 1,9 for RED', () => {
    const em = (i) => {
      let s = { ...initPair(PAIR_INQUIRY), i };
      s = runP(s, [{ type: 'say', v: 'shape' }]);
      s = runP(s, bySize(R[i], s.locked));
      return expectedMeasured(PAIR_INQUIRY, R[i], s.links, s.locked);
    };
    expect(em(0)).toEqual({ expected: ['4,5', '5,7'], measured: ['4,5', '5,7'] });
    expect(em(1)).toEqual({ expected: ['1,5', '1,9'], measured: ['1,5', '1,9'] });
    expect(em(2)).toEqual({ expected: ['4,5', '5,7'], measured: ['4,5', '5,1'] });
    expect(em(3)).toEqual({ expected: ['4,5', '5,7'], measured: ['4', '4,8'] });
  });

  it('the whole experiment: the world’s verdict SIM, RED, TURN the shape; TURN unequal by the names, equal by size', () => {
    let s = initPair(PAIR_INQUIRY);
    const said = ['shape', 'shape', 'not', 'not', 'shape'];
    R.forEach((r, i) => {
      s = runP(s, [{ type: 'say', v: said[i] }]);
      s =
        r.link === 'world-first'
          ? runP(s, [...bySize(r, s.locked), { type: 'lay' }])
          : runP(s, [{ type: 'lay' }, ...bySize(r, null)]);
      const html = renderToString(createElement(PairView, { spec: PAIR_INQUIRY, state: s, act: {} }));
      expect(html).toContain(`data-iq-round="${i}"`);
      expect(html).not.toMatch(/undefined|NaN/);
      // ONE round per screen: no other tracé's name is written
      for (const other of R.filter((x) => x !== r))
        expect(html, other.stone.names).not.toContain(`${other.stone.names}`);
      s = runP(s, [{ type: 'next' }]);
    });
    const rows = pairResult(s).rows;
    expect(rows.map((r) => r.shape)).toEqual([true, true, false, false, true]);
    expect(rows[4].sets.map((x) => x.equal)).toEqual([false, true]);
    expect(FORGES[K1].fromInquiry({ rows }).rows.map((c) => c.held)).toEqual([true, true, false, false, true]);
  });
});

// ───────── angles ─────────
const runA = (s, actions) => actions.reduce((acc, a) => anglesReducer(ANGLES_INQUIRY, acc, a), s);
const measureAll = (s, r) => {
  for (const t of toMeasure(r))
    for (const v of [0, 1])
      s = runA(s, [{ type: 'place', t, v }, { type: 'needle', deg: Number(triOf(r, t).angles[v]) }, { type: 'read' }]);
  return s;
};

describe('angles on the lesson’s numbers — four rounds (design v4)', () => {
  const R = ANGLES_INQUIRY.rounds;
  it('R1 112° both, sides 6 and 8 facing it; R2 98°; R3 × 1,25 drawn (33,75 ; 51,25 ; 140: 225); R4 4 ; 6 at 27° against 6 ; 9 at 41°', () => {
    expect(triOf(R[0], 'a').angles).toEqual(NUMBERS.angles.face);
    expect(triOf(R[0], 'b').angles).toEqual(['41', '27', '112']);
    expect([triOf(R[0], 'a').side, triOf(R[0], 'b').side]).toEqual(NUMBERS.angles.r1.opposite);
    expect(triOf(R[1], 'b').angles).toEqual(NUMBERS.angles.r2.block);
    expect(triOf(R[2], 'b').angles).toEqual(NUMBERS.angles.r3.block);
    expect(triOf(R[2], 'b').sum).toBe(NUMBERS.angles.r3.sum);
    expect(R.map((r) => slideOf(r).fact)).toEqual(['covers', 'apart', 'open', 'apart']);
    expect(slideOf(R[0])).toMatchObject({ top: '8', bottom: '6' });
    expect(toMeasure(R[3])).toEqual([]);
  });

  it('the whole experiment: each round rendered alone, the third angle in its three terms, R4 without a third side', () => {
    let s = initAngles(ANGLES_INQUIRY);
    R.forEach((r, i) => {
      s = measureAll(s, r);
      s = runA(s, [{ type: 'say', v: i === 0 ? 'same' : 'other' }, { type: 'slide' }]);
      const html = renderToString(createElement(AnglesView, { spec: ANGLES_INQUIRY, state: s, act: {} }));
      expect(html).not.toMatch(/undefined|NaN/);
      if (i === 0) expect(html).toContain('180^\\circ - 27^\\circ - 41^\\circ = 112^\\circ');
      if (i === 3) expect(html).not.toMatch(/180\^\\circ/);
      for (const other of R.filter((x) => x !== r))
        if (other.b.names !== r.b.names) expect(html, other.b.names).not.toContain(`${other.b.names}`);
      s = runA(s, [{ type: 'next' }]);
    });
    expect(s.done).toBe(true);
    const rows = anglesResult(s).rows;
    expect(rows.map((r) => r.fact)).toEqual(['covers', 'apart', 'open', 'apart']);
    expect(FORGES[K2].fromInquiry({ rows }).rows.map((c) => c.held)).toEqual([true, false, false, false]);
  });
});

describe('each experiment renders whole on its lesson’s spec', () => {
  it.each(Object.entries(INQUIRIES))('%s', (_, spec) => {
    const html = renderToString(createElement(Inquiry, { spec, game: { audio: { play() {} } }, onDone() {} }));
    expect(html).toContain(`data-iq="${spec.kind}"`);
    expect(html).not.toMatch(/undefined|NaN/);
  });
});
