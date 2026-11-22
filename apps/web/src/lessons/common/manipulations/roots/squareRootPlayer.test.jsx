import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { CHAINS, CHAINS_PLAYER, QUESTIONS, chainOfPlayer, chainKeyOf, truthKeyOf, exactBuild, squaresBuild, finestSide, halfText, frameReached, squareLine } from './SquareRootSide';
import * as L from '../logic/squareRootSide';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `square-root-side` dans le lecteur de mission (rollout 2026-11-09, conseil du 2026-11-09) : lire d'un toucher, BÂTIR
 * l'égalité (« aire = côté × côté ») ou l'encadrement des carrés (« 4 < 5 < 9 »), compter les décimales de c², puis la règle ; mode graduation :
 * l'échelle 1/g, l'égalité, la carte qui résiste, la règle. Les vérités sont celles de la logique du labo ; le guide (coachOf) mène au bout.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.squareRoot.${key}`, o);
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);
const sq = (x) => x.num / x.den;

/** Joue le mode refine comme un élève qui encadre par dichotomie, jusqu'à la découverte (ou la dernière graduation). */
function playRefine(num, den, maxScale) {
  let s = L.init({ mode: 'refine', areas: [{ num, den }], maxScale });
  for (let guard = 0; guard < 200 && !L.discoveryReady(s); guard += 1) {
    if (L.canRefine(s)) { s = L.refine(s); continue; }
    const r = L.range(s); const c = L.cellOf(s);
    const lo = c.below ?? r.min; const hi = c.above ?? r.max;
    s = L.test(s, Math.floor((lo + hi) / 2) === lo && c.below != null ? lo + 1 : Math.floor((lo + hi) / 2));
  }
  return s;
}

describe('square-root-side in the mission player', () => {
  it('the player chains read → build → (count) → rule; the page keeps its chains', () => {
    expect(CHAINS_PLAYER.exact).toEqual([['exSideFill', 'exBuild'], ['rule']]);
    expect(CHAINS_PLAYER.never).toEqual([['nBetweenFill', 'nSquaresBuild'], ['nDecimalsFill', 'rule']]);
    expect(CHAINS_PLAYER.grad).toEqual([['gGradFill', 'gBuild'], ['gResist', 'rule']]);
    expect(CHAINS.never).toEqual([['bSq', 'bRead'], ['zoom', 'rule']]);
  });

  it.each([[16, 1, 10], [4, 1, 10], [4, 100, 100], [225, 100, 100], [49, 100, 100]])('exact area %i/%i: the side read and the equality built are the TRUTH', (num, den, maxScale) => {
    const s = playRefine(num, den, maxScale);
    expect(chainKeyOf(s)).toBe('exact');
    expect(frameReached(s)).toBe(true);
    const f = L.foundSide(s, 0);
    expect((f.v / f.scale) ** 2).toBeCloseTo(num / den, 9);
    const fill = QUESTIONS.exSideFill(s, k);
    expect(fill.fields[0].options).toContain(fill.fields[0].expected);
    expect(isCorrect(fill, [L.sideText(f.v, f.scale)])).toBe(true);
    const bld = QUESTIONS.exBuild(s, k);
    expect(bld.kind).toBe('build');
    expect(isCorrect(bld, bld.expected)).toBe(true);
    bld.expected.forEach((x) => expect(bld.tiles).toContain(x));
    // the decoy is never the side, and is the HALF of the area unless the half is the side (area 4)
    const x = exactBuild(s, 0);
    expect(x.decoy).not.toBe(x.side);
    // the TeX of the equality keeps its backslash (a lost one becomes a TAB in a template string)
    expect(x.eq).toMatch(/ \\times /);
    expect(x.eq).not.toMatch(/\t/);
    if (halfText({ num, den }) !== x.side) expect(x.decoy).toBe(halfText({ num, den }));
    [fill, bld].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
    expect(chainOfPlayer(1, s)).toEqual(['rule']);
  });

  it('the player follows the TRUTH: 0,04 is « exact » from the start (it lands on 0,1), 5 and 16/9 (refine) are « never »', () => {
    expect(truthKeyOf(L.init({ mode: 'refine', areas: [{ num: 4, den: 100 }], maxScale: 100 }))).toBe('exact');
    expect(truthKeyOf(L.init({ mode: 'refine', areas: [{ num: 4, den: 100 }], maxScale: 1 }))).toBe('never');
    expect(truthKeyOf(L.init({ mode: 'refine', areas: [{ num: 5, den: 1 }], maxScale: 1000 }))).toBe('never');
    expect(truthKeyOf(L.init({ mode: 'refine', areas: [{ num: 16, den: 9 }], maxScale: 1000 }))).toBe('never');
    expect(truthKeyOf(L.init({ mode: 'graduation', areas: [{ num: 6, den: 1 }], maxScale: 12 }))).toBe('grad');
  });

  it('halfText writes the half like the area', () => {
    expect(halfText({ num: 4, den: 100 })).toBe('0,02');
    expect(halfText({ num: 16, den: 1 })).toBe('8');
    expect(halfText({ num: 16, den: 9 })).toBe('8/9');
    expect(halfText({ num: 225, den: 100 })).toBe('1,125');
  });

  it.each([[5, 1000], [2, 10], [20, 100], [7, 100]])('area %i (never exact, to 1/%i): bracket, squares, decimals — all true', (a, maxScale) => {
    const s = playRefine(a, 1, maxScale);
    expect(chainKeyOf(s)).toBe('never');
    expect(L.discoveryReady(s)).toBe(true);
    const fill = QUESTIONS.nBetweenFill(s, k);
    const [below, above] = fill.fields.map((x) => Number(x.expected));
    expect(below * below).toBeLessThan(a);
    expect(above * above).toBeGreaterThan(a);
    expect(above - below).toBe(1);
    fill.fields.forEach((x) => expect(x.options).toContain(x.expected));
    const bld = QUESTIONS.nSquaresBuild(s, k);
    expect(bld.ops).toEqual(['<', '<']);
    expect(bld.expected).toEqual([String(below * below), String(a), String(above * above)]);
    const x = squaresBuild(s);
    expect(bld.expected).not.toContain(x.decoy);
    bld.expected.forEach((e) => expect(bld.tiles).toContain(e));
    const dec = QUESTIONS.nDecimalsFill(s, k);
    const fin = finestSide(s);
    expect(fin.k).toBeGreaterThan(0);
    expect(fin.n).toBe(2 * fin.k);
    expect(fin.last).not.toBe('0');
    expect(dec.fields[0].expected).toBe(fin.n);
    expect(dec.fields[0].options).toContain(fin.n);
    [fill, bld, dec].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });

  it('20: the product decoy 4 × 5 = 20 IS the area, so the decoy becomes the sum', () => {
    const s = playRefine(20, 1, 10);
    expect(squaresBuild(s).decoy).toBe('9');
  });

  it('graduation mode: the ruler read and the equality built for 16/9 are true', () => {
    let s = L.init({ mode: 'graduation', areas: [{ num: 16, den: 9 }, { num: 6, den: 1 }], maxScale: 12 });
    s = L.setScale(s, 3); s = L.test(s, 4);
    expect(L.cardStatus(s, 0)).toBe('exact');
    const fill = QUESTIONS.gGradFill(s, k);
    expect(fill.fields[0].expected).toBe('1/3');
    expect(fill.fields[0].options).toContain('1/3');
    const bld = QUESTIONS.gBuild(s, k);
    expect(bld.expected).toEqual(['16/9', '4/3', '4/3']);
    expect(bld.tiles).toContain('8/9');
    expect(isCorrect(bld, bld.expected)).toBe(true);
    [fill, bld].forEach((q) => expect(text(q)).not.toMatch(RAW));
  });

  it('graduation in the player (lesson 2): a rational card never « resists », so « it will never land » is always true', () => {
    // 16/9 bracketed on 1/1, 1/2 and 1/4: on the page it resists (three rulers), in the player it stays open — it lands on 1/3
    let s = L.init({ mode: 'graduation', areas: [{ num: 16, den: 9 }, { num: 13, den: 1 }], maxScale: 6, truthful: true });
    const bracketAt = (st, g) => {
      let x = L.setScale(st, g); const f = Math.floor(Math.sqrt(sq(L.currentArea(x))) * g + 1e-9);
      x = L.test(x, f); return L.test(x, f + 1);
    };
    [1, 2, 4].forEach((g) => { s = bracketAt(s, g); });
    expect(L.cardStatus(s, 0)).toBe('open');
    expect(L.cardStatus({ ...s, truthful: false }, 0)).toBe('resisting');
    s = L.setCard(s, 1);
    [1, 2, 3].forEach((g) => { s = bracketAt(s, g); });
    expect(L.cardStatus(s, 1)).toBe('resisting');
    const res = QUESTIONS.gResist(s, k);
    expect(text(res)).not.toMatch(RAW);
    expect(L.landsSomewhere(s.cards[1], s.maxScale)).toBe(false);
  });

  it('the journal writes a fraction square plainly: (5/4)² = 25/16, never « \\dfrac » nor 5/4²', () => {
    expect(squareLine(5, 4)).toBe('(5/4)² = 25/16');
    expect(squareLine(3, 1)).toBe('3² = 9');
    expect(squareLine(22, 10)).toBe('2,2² = 4,84');
    expect(squareLine(5, 4)).not.toContain('dfrac');
  });

  it('landsAt / landsSomewhere tell the truth of a prediction', () => {
    expect(L.landsAt({ num: 5, den: 1 }, 1)).toBe(false);
    expect(L.landsAt({ num: 225, den: 100 }, 1)).toBe(false);
    expect(L.landsAt({ num: 225, den: 100 }, 10)).toBe(true);
    expect(L.landsAt({ num: 16, den: 1 }, 1)).toBe(true);
    expect(L.landsSomewhere({ num: 16, den: 9 }, 12)).toBe(true);
    expect(L.landsSomewhere({ num: 6, den: 1 }, 12)).toBe(false);
  });

  it('the guide, followed, ends both modes — and never names a value', () => {
    // refine 5: drag → again… → refine → … until the discovery
    let s = L.init({ mode: 'refine', areas: [{ num: 5, den: 1 }], maxScale: 1000 });
    const seen = new Set();
    for (let i = 0; i < 200; i += 1) {
      const step = L.coachOf(s);
      if (!step) break;
      seen.add(step.id);
      if (step.id === 'refine') { s = L.refine(s); continue; }
      const r = L.range(s); const c = L.cellOf(s);
      const lo = c.below ?? r.min; const hi = c.above ?? r.max;
      const mid = Math.floor((lo + hi) / 2);
      s = L.test(s, mid === lo && c.below != null ? lo + 1 : mid);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect([...seen].sort()).toEqual(['again', 'drag', 'refine']);
    // graduation 16/9 and 6: drag → grad → … → card → … → nothing
    let g = L.init({ mode: 'graduation', areas: [{ num: 16, den: 9 }, { num: 6, den: 1 }], maxScale: 12 });
    const gseen = new Set();
    for (let i = 0; i < 400; i += 1) {
      const step = L.coachOf(g);
      if (!step) break;
      gseen.add(step.id);
      if (step.id === 'grad') { g = L.setScale(g, g.scale + 1); continue; }
      if (step.id === 'card') { g = L.setCard(g, g.cards.findIndex((_, j) => L.cardStatus(g, j) === 'open')); continue; }
      const a = sq(L.currentArea(g)); const c = L.cellOf(g);
      const v = Math.floor(Math.sqrt(a) * g.scale + 1e-9);
      g = L.test(g, c.below == null ? v : v + 1);
    }
    expect(L.discoveryReady(g)).toBe(true);
    expect([...gseen].sort()).toEqual(['again', 'card', 'drag', 'grad']);
    ['drag', 'again', 'refine', 'grad', 'card'].forEach((id) => {
      const line = k(`coach.${id}`);
      expect(line).not.toMatch(RAW);
      expect(line).not.toMatch(/[0-9]/);
    });
  });

  it('the prediction strings are plain text (no $)', () => {
    ['predict.prompt', 'predict.promptCard', 'predict.yes', 'predict.no', 'journal', 'choicesLabel'].forEach((key) => {
      const s = k(key, { grad: '0,1', area: '5' });
      expect(s).not.toMatch(RAW);
      expect(s).not.toContain('$');
    });
  });
});
