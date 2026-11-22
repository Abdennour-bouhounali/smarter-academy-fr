/**
 * THE EXPERIMENT of lesson `natiqa-ghayr-natiqa`: ♾️ `chase` (keys 🧩 and 🎯 have none — they are met on the courts).
 * The shared checks (`describeExperiments`: no two keys share a (kind, mode); no sentence names a key or states its
 * rule; Arabic agreement), then the lesson's own: every sentence the screen can say, in every state its reducer can
 * reach, whatever he predicts, is a FACT; the numbers are the story's; the screen renders whole; the plain strings carry
 * no formula and fit the screen's budget (`chase.js › CHASE_LAYOUT`).
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Inquiry from '../../../../../../common/gameworld/rootCourts/Inquiry';
import { ChaseView } from '../../../../../../common/gameworld/rootCourts/InquiryChase';
import {
  CHASE_LAYOUT,
  KINDS,
  chaseFact,
  chaseReducer,
  initChase,
} from '../../../../../../common/gameworld/rootCourts/chase';
import { rootOf } from '../../../../../../common/gameworld/rootCourts/logic';
import { describeExperiments, plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { FORGES } from './forges';
import { CHASE_FRACS, CHASE_INQUIRY, smallWord } from './inquiries';
import { COURTS } from './story';
import { KEYS } from './journey';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

const [K1, K2, K3] = KEYS;
const T = CHASE_INQUIRY.text;

/** Every state of the chase, for one way of predicting and one tap at the end. */
function chaseStates(sayOf, tap) {
  const out = [];
  let s = initChase(CHASE_INQUIRY);
  out.push(s);
  while (!s.done) {
    const a =
      s.stage === 'say'
        ? { type: 'say', v: sayOf(s) }
        : s.stage === 'build'
          ? { type: 'built' }
          : s.stage === 'count'
            ? { type: 'count', v: tap }
            : { type: 'next' };
    s = chaseReducer(CHASE_INQUIRY, s, a);
    if (!s.done) out.push(s);
  }
  return out;
}
/** He predicts each of the three things every time, and taps each of the three counts: every sentence the screen says. */
const STATES = KINDS.flatMap((k, i) => chaseStates(() => k, ['0', '1', 'all'][i]));
/** What every text function receives (InquiryChase.jsx › argsOf). */
const argsOf = (s) => {
  const [p, q] = CHASE_FRACS[Math.min(s.i, CHASE_FRACS.length - 1)].split('/');
  return {
    a: COURTS.two,
    i: s.i,
    n: CHASE_FRACS.length,
    p,
    q,
    rodTex: `\\dfrac{${p}}{${q}}`,
    perTile: String(BigInt(q) * BigInt(q)),
  };
};
/** Every sentence the chase screen can say (through MathText). */
function chaseLines() {
  const lines = [];
  for (const s of STATES) {
    const args = argsOf(s);
    lines.push(T.lead(args), T.goal(args), T.smallTile(args));
    if (s.stage === 'say' || s.stage === 'build') lines.push(T.ask(args));
    if (s.stage === 'count' || s.stage === 'counted') lines.push(T.countAsk(args));
    if (s.stage === 'seen') lines.push(T.fact({ ...args, ...s.rows.at(-1) }));
    if (s.stage === 'counted') lines.push(T.countFact({ ...args, ...s.count }));
  }
  return [...new Set(lines)];
}
/** The plain strings of the screen: buttons, the card's labels, the table's headers and chips, the units. */
const PLAIN = [
  'sayBand',
  'sayJam',
  'sayRide',
  'rodName',
  'platformName',
  'courtName',
  'unknown',
  'colRod',
  'colPlatform',
  'colCourt',
  'colFact',
  'band',
  'jam',
  'rides',
  'next',
  'countNone',
  'countOne',
  'countAll',
  'done',
];

/**
 * Never in the experiment: the words of key ♾️ (its name, « never », « impossible », « exact », an approximate value,
 * a root or its sign) and, as in every experiment of the lesson, the names of 🧩 and 🎯 and « wrong ».
 */
const NEVER = /خطأ|خاطئ|غلط|ناطق|مدوَّر|مدوّر|مدور/;
const OWN = {
  [K2]: /√|\\sqrt|جذر|أبدًا|أبدا|مستحيل|لا يمكن|بالضبط|مضبوط|قيمة|مقرّب|مقرب|تقريب|لا نهاية|لا ينتهي/,
};

describeExperiments({
  ofKey: { [K2]: CHASE_INQUIRY },
  linesOf: () => chaseLines(),
  never: NEVER,
  own: OWN,
});

/** What the student SEES on a rendered screen: the text, without tags nor KaTeX's hidden TeX source. */
const seen = (html) =>
  html
    .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
const len = (s) => [...String(s)].length;

describe('natiqa-ghayr-natiqa — the experiment', () => {
  it('keys 🧩 and 🎯 have none (they are met on the courts); ♾️ opens on the chase', () => {
    expect(FORGES[K1].inquiry).toBeUndefined();
    expect(FORGES[K3].inquiry).toBeUndefined();
    expect(FORGES[K2].inquiry).toBe(CHASE_INQUIRY);
    expect(CHASE_INQUIRY.kind).toBe('chase');
  });
  it('the court is the story’s court of two, never retyped; the fractions are the design’s, each one small tile off', () => {
    expect(CHASE_INQUIRY.a).toBe(COURTS.two);
    expect(rootOf(CHASE_INQUIRY.a)).toBeNull();
    expect(CHASE_FRACS).toEqual(['3/2', '7/5', '17/12', '41/29', '99/70']);
    const facts = CHASE_FRACS.map((f) => chaseFact(CHASE_INQUIRY.a, f));
    expect(facts.map((f) => f.gap)).toEqual(['1', '1', '1', '1', '1']);
    expect(facts.map((f) => f.kind)).toEqual(['jam', 'band', 'jam', 'band', 'jam']);
    // each nearer the end of the wall than the one before (the lead says so): |p/q − √2| falls
    const off = CHASE_FRACS.map((f) => {
      const [p, q] = f.split('/').map(Number);
      return Math.abs(p / q - Math.SQRT2);
    });
    for (let i = 1; i < off.length; i += 1) expect(off[i]).toBeLessThan(off[i - 1]);
  });
  it('a sentence through MathText is worded; a plain string holds no formula; no fraction is written with a slash', () => {
    for (const x of chaseLines()) {
      said(x);
      expect(x.replace(/\$[^$]*\$/g, ''), x).not.toMatch(/\d\s*\/\s*\d/);
    }
    for (const k of PLAIN) plain(T[k]);
    for (const n of ['1', '2', '9', '50', '9801']) plain(T.unit(n));
  });
  it('the words fit the screen’s budget: the card’s labels ≤ 8 characters, a unit ≤ 12, a chip ≤ 5', () => {
    for (const k of ['rodName', 'platformName', 'courtName'])
      expect(len(T[k]), T[k]).toBeLessThanOrEqual(CHASE_LAYOUT.card.name);
    for (const r of STATES.flatMap((s) => s.rows))
      for (const x of [r.platform, r.court, r.gap]) expect(len(T.unit(x)), T.unit(x)).toBeLessThanOrEqual(12);
    for (const k of ['band', 'jam', 'rides']) expect(len(T[k]), T[k]).toBeLessThanOrEqual(CHASE_LAYOUT.table.word);
  });
  it('small tiles agree with their number', () => {
    expect(['1', '2', '9', '11', '50', '9801'].map(smallWord)).toEqual([
      'بلاطة صغيرة',
      'بلاطتان صغيرتان',
      'بلاطات صغيرة',
      'بلاطة صغيرة',
      'بلاطة صغيرة',
      'بلاطة صغيرة',
    ]);
    expect(T.fact({ ...argsOf(STATES[0]), kind: 'band', platform: '49', court: '50', gap: '1', right: true })).toBe(
      'المنصّة $49$ بلاطة صغيرة، والساحة $50$ بلاطة صغيرة: تنقص المنصّةَ بلاطة صغيرة واحدة، فيبقى شريط.',
    );
  });
  it('a miss is answered by what happened, opened by « توقّعك لم يصب هذه المرّة »; a right one by the fact alone', () => {
    const row = STATES.find((s) => s.stage === 'seen' && !s.rows.at(-1).right).rows.at(-1);
    expect(T.fact({ ...argsOf(STATES[0]), ...row })).toMatch(/^توقّعك لم يصب هذه المرّة/);
    const hit = STATES.find((s) => s.stage === 'seen' && s.rows.at(-1).right).rows.at(-1);
    expect(T.fact({ ...argsOf(STATES[0]), ...hit })).toMatch(/^المنصّة/);
  });
  it('the count says what the table shows: no platform rode', () => {
    const last = STATES.filter((s) => s.stage === 'counted');
    expect(last.map((s) => s.count.rides)).toEqual([0, 0, 0]);
    expect(last.map((s) => s.count.right)).toEqual([true, false, false]);
    for (const s of last) expect(T.countFact({ ...argsOf(s), ...s.count })).toContain('لم تركب المصعدَ أيّ منصّة');
  });
  it('the screen renders whole in every state, the fact never before his prediction, none of the rule’s words', () => {
    const act = { say() {}, next() {}, count() {} };
    for (const s of STATES) {
      const out = renderToString(createElement(ChaseView, { spec: CHASE_INQUIRY, state: s, act }));
      expect(out).not.toMatch(/undefined|NaN/);
      const text = seen(out);
      expect(text).not.toMatch(NEVER);
      expect(text).not.toMatch(OWN[K2]);
      if (s.stage === 'say') expect(out).toContain('data-iq-platform=""');
    }
    expect(renderToString(createElement(Inquiry, { spec: CHASE_INQUIRY, onDone: () => {} }))).toContain(
      'data-iq="chase"',
    );
  });
});
