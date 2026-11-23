// The store of the last bridge (`DivisorIsles.jsx › Boss`, `Game.js › bossDivision / bossCount / forge`): a story that
// gives no label keeps the division template « a = b × [ ] + [ ] » exactly as before; a story that announces the gap by a
// LABEL (`boss.label`, « 2³ × 3² × 7 ») never prints its count — not in the store, not in the world's equation (the sign
// over the gap: logic.test.js › gapSign) — and asks only the number of planks. Server render.
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Boss, Equation } from './DivisorIsles';
import { DivisorIslesGame } from './Game';
import { T } from './strings';

// the paper gate (« take your paper ») opens on a click: here it is open, so the template itself is drawn
vi.mock('../kit/Paper', async (importOriginal) => ({
  ...(await importOriginal()),
  PaperGate: ({ children }) => children,
}));
globalThis.window = globalThis.window ?? {};

const P = DivisorIslesGame.prototype;
const LABEL = { text: '2³ × 3² × 7', tex: '2^{3} \\times 3^{2} \\times 7' };
const PILOT = { a: 756, boss: { options: [32, 36], price: 1850 } };
const LABELLED = { a: 504, boss: { options: [36, 48], price: 3, label: LABEL } };
/** The story's words as the lesson gives them (the world's defaults name the pilot's 756). */
const STORE = {
  ...T,
  boss: {
    ...T.boss,
    divide: (b) => `Planches de ${b} : combien en faut-il pour remplir exactement le pont ?`,
    mission: 'Ta mission : le dernier pont mesure 2³ × 3² × 7 cases.',
    choose: 'Lesquelles remplissent exactement les 2³ × 3² × 7 cases ?',
    price: 'Prix d’une planche : 3 €',
    costAsk: (b, q) => `Le pont tient : ${q} planches de ${b}.`,
  },
};
const draw = (seg, o, words = T) =>
  renderToString(<Boss o={o} game={{ T: words, bossSeg: seg }} />).replaceAll('<!-- -->', '');

describe('the store of the last bridge', () => {
  it('WITHOUT a label: the division of the gap, two boxes, the gap printed — as the pilot plays it', () => {
    const html = draw(PILOT, { type: 'boss', view: 'divide', b: 32, tried: {} });
    expect(html).toContain('data-di-boss-a="true">756<');
    expect(html).toContain('data-di-q');
    expect(html).toContain('data-di-r');
    expect(html).toContain(T.boss.rLabel);
    expect(html).not.toContain('data-di-boss-label');
    expect(html).not.toContain('data-di-boss-count');
  });

  it('WITH a label: the label stands for the gap, ONE box (the number of planks), the count never printed', () => {
    const html = draw(LABELLED, { type: 'boss', view: 'divide', b: 36, tried: {} }, STORE);
    expect(html).toContain('data-di-boss-count');
    expect(html).toContain('data-di-boss-label');
    expect(html).toContain('data-di-q');
    expect(html).not.toContain('data-di-r');
    expect(html).not.toContain('data-di-boss-a');
    expect(html).not.toContain(T.boss.rLabel);
    expect(html).toContain(T.boss.qLabel);
    expect(html).toContain('Planches de 36');
    expect(html).not.toMatch(/(?<![\d^{])504(?!\d)/);
    // the choose and the cost views print nothing of 504 either
    for (const o of [
      { type: 'boss', view: 'choose', tried: { 48: 24 } },
      { type: 'boss', view: 'cost', b: 36, q: 14, tried: {} },
    ])
      expect(draw(LABELLED, o, STORE)).not.toMatch(/(?<!\d)504(?!\d)/);
  });

  it('the count is judged without the gap: 14 builds, 15 and 13 are refused, 48 is built whatever is typed', () => {
    const calls = [];
    const game = {
      bossSeg: LABELLED,
      flags: {},
      audio: { play: (x) => calls.push(x) },
      forge: (seg, b, predicted) => calls.push(['forge', seg.a, b, predicted]),
    };
    expect(P.bossCount.call(game, 36, 15)).toBe('long');
    expect(P.bossCount.call(game, 36, 13)).toBe('short');
    expect(P.bossCount.call(game, 36, Number.NaN)).toBe('nan');
    expect(game.flags.bossWrong).toBe(3);
    expect(calls.filter((c) => Array.isArray(c))).toEqual([]);
    expect(P.bossCount.call(game, 36, 14)).toBe('ok');
    expect(P.bossCount.call(game, 48, 10)).toBe('open');
    expect(calls.filter((c) => Array.isArray(c))).toEqual([
      ['forge', 504, 36, null],
      ['forge', 504, 48, null],
    ]);
    // the right count and a plank that does not fill are no wrong try of the store
    expect(game.flags.bossWrong).toBe(3);
  });

  it('the division of a story without a label is judged as before', () => {
    const calls = [];
    const game = { bossSeg: PILOT, flags: {}, audio: { play() {} }, forge: (seg, b) => calls.push([seg.a, b]) };
    expect(P.bossDivision.call(game, 32, 23, 21)).toBe('sum');
    expect(P.bossDivision.call(game, 36, 21, 0)).toBe('ok');
    expect(calls).toEqual([[756, 36]]);
  });
});

describe('the world’s equation and verdict on a labelled last bridge', () => {
  const html = (eq) => renderToString(<Equation eq={eq} />).replaceAll('<!-- -->', '');

  it('without a label: a = b × q + r and the remainder, as before', () => {
    const out = html({ a: 756, b: 36, q: 3, r: 648, live: true });
    expect(out).toContain('756');
    expect(out).toContain('648');
    expect(out).not.toContain('data-di-eq-label');
  });

  it('with a label: the label in place of a; the remainder hidden while the planks are laid (r + b × q would give a)', () => {
    const live = html({ a: 504, b: 36, q: 0, r: 504, live: true, aTex: LABEL.tex, aText: LABEL.text });
    expect(live).toContain('data-di-eq-label');
    expect(live).not.toMatch(/(?<!\d)504(?!\d)/);
    const mid = html({ a: 504, b: 36, q: 3, r: 396, live: true, aTex: LABEL.tex });
    expect(mid).not.toContain('396');
    // once laid, what is left is a fact again: 0 for 36, 24 for 48
    expect(html({ a: 504, b: 48, q: 10, r: 24, live: false, aTex: LABEL.tex })).toContain('24');
    expect(html({ a: 504, b: 48, q: 10, r: 24, live: false, aTex: LABEL.tex })).not.toMatch(/(?<!\d)504(?!\d)/);
  });
});
