/**
 * The screen of `pair` rendered without a DOM: its hooks per stage, its words (all from `pairText.js` or the lesson's
 * `spec.text`), no quotient evaluated and no fraction « p/q » as text, one round per screen. The registration in
 * `Inquiry.jsx` is the main session's; this test mounts the player directly.
 */
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Pair, PairView, pairDrawing, sideLabelAt } from './InquiryPair';
import { cornersOf, initPair, pairReducer } from './pair';
import { PAIR_TEXT } from './pairText';

globalThis.window = globalThis.window ?? {};
const noop = () => {};
const act = new Proxy({}, { get: () => noop });
const plain = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, '’')
    .replace(/&amp;/g, '&');

const SPEC = {
  kind: 'pair',
  template: { names: 'ABC', sides: ['2', '3', '3,8'] },
  rounds: [
    { stone: { names: 'DEF', sides: ['4,5', '5,7', '3'], turn: 120 }, link: 'world-first' },
    { stone: { names: 'JKL', sides: ['3', '4,5', '5,1'], turn: 200 }, link: 'world-first' },
    { stone: { names: 'RST', sides: ['4,5', '5,7', '3'], turn: 250 }, link: 'given' },
  ],
};
const run = (spec, actions, s = initPair(spec)) => actions.reduce((acc, a) => pairReducer(spec, acc, a), s);
const link = (t, s) => [
  { type: 'pick', side: 't', i: t },
  { type: 'pick', side: 's', i: s },
];
const view = (s, spec = SPEC) => renderToString(<PairView spec={spec} state={s} act={act} />);

describe('pair on screen', () => {
  it('the player mounts; the prediction comes first, nothing to link yet', () => {
    const out = renderToString(<Pair spec={SPEC} play={noop} onDone={noop} />);
    expect(out).toContain('data-iq="pair"');
    expect(out).toContain('data-iq-stage="predict"');
    expect(out).toContain('data-iq-predict="shape"');
    expect(out).toContain('data-iq-predict="not"');
    expect(out).not.toContain('data-iq-side=');
    expect(out).not.toContain('data-iq-quotient');
    expect(plain(out)).toContain(PAIR_TEXT.say.shape);
    expect(plain(out)).toContain(PAIR_TEXT.template('ABC'));
    expect(plain(out)).toContain(PAIR_TEXT.length('3,8'));
  });

  it('world-first: the first link laid and locked, captioned « premier lien »; « attendu / mesuré » once three links', () => {
    let s = run(SPEC, [{ type: 'say', v: 'shape' }]);
    let out = view(s);
    expect(out).toContain('data-iq-link="world-first"');
    for (const h of ['t0', 't1', 't2', 's0', 's1', 's2']) expect(out).toContain(`data-iq-side="${h}"`);
    expect(out).toMatch(/data-iq-side="t0" data-iq-locked=""/);
    expect(out).toMatch(/data-iq-side="s2" data-iq-locked=""/);
    expect(out).toMatch(/data-iq-quotient="0"[^>]*data-iq-first=""/);
    expect(out).toContain('data-iq-curve="0"');
    expect(plain(out)).toContain(PAIR_TEXT.first);
    expect(plain(out)).toContain(PAIR_TEXT.quotient('3', '2'));
    expect(plain(out)).toContain(PAIR_TEXT.firstLink);
    expect(out).toMatch(/data-iq-lay=""[^>]*disabled|disabled=""[^>]*data-iq-lay/);
    expect(out).not.toContain('data-iq-expected');
    s = run(SPEC, [...link(1, 0), ...link(2, 1)], s);
    out = view(s);
    expect(out).toContain('data-iq-expected="4,5;5,7"');
    expect(out).toContain('data-iq-measured="4,5;5,7"');
    expect(out.match(/data-iq-mark="eq"/g)).toHaveLength(2);
    expect(out).toContain('data-iq-equal="yes"');
    expect(plain(out)).toContain(PAIR_TEXT.withLinks(['4,5', '5,7'], ['4,5', '5,7']));
    expect(plain(out)).toContain(PAIR_TEXT.quotient('5,7', '3,8'));
    // a quotient is never evaluated, no fraction written « p/q »
    expect(plain(out)).not.toMatch(/\d\s*\/\s*\d/);
    expect(plain(out)).not.toContain('1,5 ');
  });

  it('the verdict is the world’s: laid, covers, his prediction answered; the stone image drawn on the template', () => {
    const s = run(SPEC, [{ type: 'say', v: 'not' }, ...link(1, 0), ...link(2, 1), { type: 'lay' }]);
    const out = view(s);
    expect(out).toContain('data-iq-stage="laid"');
    expect(out).toContain('data-iq-laid="covers"');
    expect(out).toContain('data-iq-image="covers"');
    expect(out).toContain('data-iq-fact="miss"');
    expect(out).toContain('data-iq-next');
    expect(out).not.toContain('data-iq-lay');
    expect(plain(out)).toContain(PAIR_TEXT.laid.covers);
    expect(plain(out)).toContain(PAIR_TEXT.laidHow({ scale: 'down', turned: true, flipped: false }));
  });

  it('ONE: = then ≠ under his links by size, and the world does not cover', () => {
    const s = run(SPEC, [{ type: 'say', v: 'shape' }, ...link(1, 1), ...link(2, 2), { type: 'lay' }], {
      ...initPair(SPEC),
      i: 1,
    });
    const out = view(s);
    expect(out).toContain('data-iq-measured="4,5;5,1"');
    expect(out).toContain('data-iq-mark="eq"');
    expect(out).toContain('data-iq-mark="ne"');
    expect(out).toContain('data-iq-laid="apart"');
    expect(out).toContain('data-iq-image="apart"');
    expect(plain(out)).toContain(PAIR_TEXT.laid.apart);
    // one round per screen: nothing of the round before
    expect(plain(out)).not.toContain(PAIR_TEXT.stone('DEF'));
    expect(plain(out)).toContain(PAIR_TEXT.stone('JKL'));
  });

  it('given: the mason’s links stand (≠ ≠), no « attendu / mesuré », and he may relink after the verdict', () => {
    let s = run(SPEC, [{ type: 'say', v: 'not' }], { ...initPair(SPEC), i: 2 });
    let out = view(s);
    expect(out).toContain('data-iq-link="given"');
    expect(plain(out)).toContain(PAIR_TEXT.givenLinks);
    expect(out).not.toContain('data-iq-locked');
    expect(out).not.toContain('data-iq-first');
    expect(out.match(/data-iq-mark="ne"/g)).toHaveLength(2);
    expect(out).not.toContain('data-iq-expected');
    expect(plain(out)).not.toContain(PAIR_TEXT.first);
    s = run(SPEC, [{ type: 'lay' }, ...link(0, 2), ...link(2, 1), ...link(1, 0)], s);
    out = view(s);
    expect(out).toContain('data-iq-laid="covers"');
    expect(out.match(/data-iq-mark="eq"/g)).toHaveLength(2);
    expect(out).not.toContain('data-iq-expected');
  });

  it('every word on screen is the lesson’s or pairText’s: with every sentence replaced, no French is left', () => {
    const Z = () => 'Z';
    const text = Object.fromEntries(
      Object.entries(PAIR_TEXT).map(([k, v]) => [
        k,
        typeof v === 'function'
          ? Z
          : typeof v === 'object'
            ? Object.fromEntries(Object.keys(v).map((x) => [x, 'Z']))
            : 'Z',
      ]),
    );
    const spec = { ...SPEC, text };
    const states = [
      initPair(spec),
      run(spec, [{ type: 'say', v: 'shape' }]),
      run(spec, [{ type: 'say', v: 'shape' }, ...link(1, 0), ...link(2, 1)]),
      run(spec, [{ type: 'say', v: 'shape' }, ...link(1, 0), ...link(2, 1), { type: 'lay' }]),
      run(spec, [{ type: 'say', v: 'not' }, { type: 'lay' }], { ...initPair(spec), i: 2 }),
    ];
    for (const s of states) {
      const out = view(s, spec);
      const words = plain(out.replace(/aria-label="[^"]*"/g, ''))
        .replace(/\b[A-Z]\b/g, '')
        .replace(/[\s  ]+/g, ' ')
        .trim();
      expect(words).toMatch(/^[Z ]*$/);
      expect(out).toMatch(/aria-label="Z"/);
    }
  });

  it('the drawing: both triangles at one scale inside their halves, side lengths in proportion', () => {
    const D = pairDrawing(SPEC, SPEC.rounds[0], true);
    const d = (P, a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    expect(d(D.s, 0, 1) / d(D.t, 0, 1)).toBeCloseTo(4.5 / 2, 9);
    expect(d(D.s, 2, 0) / d(D.t, 1, 2)).toBeCloseTo(1, 9);
    for (const [x, y] of D.t) expect(x > 20 && x < 300 && y > 50 && y < 350).toBe(true);
    for (const [x, y] of D.s) expect(x > 340 && x < 620 && y > 50 && y < 350).toBe(true);
    for (const p of D.image) expect(D.t.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6)).toBe(true);
  });
});

describe('pair — a length stands OUTSIDE its triangle, clear of its side (gate B, 2026-11-27)', () => {
  it('every label box of every round lies on the far side of its side from the opposite corner, and off the side', () => {
    for (const r of SPEC.rounds)
      for (const [P, sides] of [
        [pairDrawing(SPEC, r, false).t, SPEC.template.sides],
        [pairDrawing(SPEC, r, false).s, r.stone.sides],
      ])
        for (const i of [0, 1, 2]) {
          const text = PAIR_TEXT.length(sides[i]);
          const [x, y] = sideLabelAt(P, i, text);
          const [a, b] = cornersOf(i);
          const o = [0, 1, 2].find((k) => k !== a && k !== b);
          const cross = (p) => (P[b][0] - P[a][0]) * (p[1] - P[a][1]) - (P[b][1] - P[a][1]) * (p[0] - P[a][0]);
          // the label's centre and the opposite corner on either side of the side's line
          expect(Math.sign(cross([x, y]))).toBe(-Math.sign(cross(P[o])));
          // its distance to the side's line clears the half box (0.6 em a character, 1 em high)
          const len = Math.hypot(P[b][0] - P[a][0], P[b][1] - P[a][1]);
          const n = [-(P[b][1] - P[a][1]) / len, (P[b][0] - P[a][0]) / len];
          const half = Math.abs(n[0]) * ((text.length * 18 * 0.6) / 2) + Math.abs(n[1]) * 9;
          expect(Math.abs(cross([x, y])) / len).toBeGreaterThan(half);
        }
  });
});
