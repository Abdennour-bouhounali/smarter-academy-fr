import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import strings from '../../../../i18n/locales/ar/lesson.manipulation.json';
import { CHAINS, CHAINS_PLAYER, QUESTIONS, chainOfPlayer, eqBuildOf } from './SquareFold';
import * as L from '../logic/squareFold';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `square-fold` dans le lecteur de mission (rollout 2026-11-10, conseil du 2026-11-10) : la graduation VOISINE de √3
 * n'est jamais acceptée (la marque exacte se révèle et l'élève l'épingle), les suites d'un toucher, l'équivalence BÂTIE, le guide qui ne
 * montre jamais la réponse. Les vérités sont celles de la logique du labo.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const k = (key, o) => t(`manipulation.squareFold.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}{q.ops}</div>);
const at = (s, v) => L.move(s, v);
const sq = (txt) => { const n = Number(String(txt).replace('−', '-').replace(',', '.')); return n * n; };

/** Résout une carte comme un élève : les deux graduations exactes, ou la graduation voisine puis la marque exacte, ou « لا حل ». */
function solveCard(s, i) {
  s = L.setCard(s, i);
  const { r } = L.current(s);
  if (r.num < 0) return L.declareNone(s);
  if (r.num === 0) return L.pin(at(s, 0));
  const t0 = L.tickRoot(r, s.scale);
  [1, -1].forEach((sign) => {
    if (t0 != null) s = L.pin(at(s, sign * t0));
    else { s = L.pin(at(s, sign * Math.round(Math.sqrt(r.num / r.den) * s.scale))); s = L.pinExact(s, sign); }
  });
  return s;
}

describe('square-fold in the mission player', () => {
  it('the nearest tick of √3 is NEVER accepted in the player: the exact mark is revealed, the first try is free, then √3 is pinned', () => {
    let s = L.init({ targets: [3], scale: 10, exactOnly: true });
    s = L.pin(at(s, 17));
    expect(s.last).toMatchObject({ kind: 'nearTick', v: 17, sign: 1, free: true });
    expect(s.pins[0] ?? []).toEqual([]);
    expect(L.exactToPin(s)).toEqual([1]);
    // the computed line « 1,7² = 2,89 ≠ 3 »
    expect(L.xText(17, 10)).toBe('1,7');
    expect(L.squareText(17, 10)).toBe('2,89');
    // a second nearest-tick try on the same side is no longer the free beat
    expect(L.pin(at(s, 17)).last.free).toBe(false);
    s = L.pinExact(s, 1);
    expect(s.pins[0]).toEqual([1]);
    expect(L.solutionText(L.current(s), 1)).toBe('√3');
    // the other side: its own beat, its own mark
    s = L.pin(at(s, -17));
    expect(s.last).toMatchObject({ kind: 'nearTick', sign: -1, free: true });
    s = L.pinExact(s, -1);
    expect(L.cardSolved(s, 0)).toBe(true);
  });

  it('the page keeps its behaviour: the nearest tick of √3 pins √3 directly', () => {
    const s = L.pin(at(L.init({ targets: [3], scale: 10 }), 17));
    expect(s.last.kind).toBe('pinned');
    expect(s.pins[0]).toEqual([1]);
  });

  it('a root ON a tick must be hit exactly in the player (2,25 → 1,5), a neighbour is refused', () => {
    let s = L.init({ targets: [2.25], scale: 10, exactOnly: true });
    expect(L.tickRoot(s.targets[0].r, 10)).toBe(15);
    expect(L.pin(at(s, 14)).last.kind).toBe('notSolution');
    s = L.pin(at(s, -15));
    expect(s.last.kind).toBe('pinned');
  });

  it('landsOnTick is the truth of the « tick » prediction', () => {
    expect(L.landsOnTick({ r: { num: 3, den: 1 } }, 10)).toBe(false);
    expect(L.landsOnTick({ r: { num: 9, den: 4 } }, 10)).toBe(true);
    expect(L.landsOnTick({ r: { num: 1, den: 9 } }, 10)).toBe(false); // √(1/9) = 1/3 is rational, but off the tenths
    expect(L.landsOnTick({ r: { num: 0, den: 1 } }, 2)).toBe(true);
  });

  it('the player chains: full per sign + build + rule at the third sign; predicted = one question on predicted cards; build after √a off the ticks', () => {
    expect(CHAINS_PLAYER).toEqual({ pos: ['posSqFill', 'posMirror'], zero: ['zeroCountFill'], neg: ['negCountFill'] });
    expect(CHAINS.pos).toEqual(['posSq', 'posMirror']);
    let s = L.init({ targets: [4, 0, -4], scale: 2, exactOnly: true });
    s = solveCard(s, 0);
    expect(chainOfPlayer(s, 'full')).toEqual(['posSqFill', 'posMirror']);
    s = solveCard(s, 1);
    expect(chainOfPlayer(s, 'full')).toEqual(['zeroCountFill']);
    s = solveCard(s, 2);
    expect(chainOfPlayer(s, 'full')).toEqual(['negCountFill', 'eqBuild', 'rule']);
    expect(chainOfPlayer(s, 'predicted', [0, 1])).toEqual([]);
    expect(chainOfPlayer(L.setCard(s, 0), 'predicted', [0, 1])).toEqual(['posSqFill']);
    let r3 = L.init({ targets: [3, 2.25], scale: 10, exactOnly: true });
    r3 = solveCard(r3, 0);
    expect(chainOfPlayer(r3, 'build')).toEqual(['eqBuild']);
    r3 = solveCard(r3, 1);
    expect(chainOfPlayer(r3, 'build')).toEqual([]);
  });

  it.each([[[4, 0, -4], 2, 0], [[3, 2.25], 10, 0], [[9, 5, -1], 10, 1]])('the built equivalence of %j is the TRUTH and its decoy is not a solution', (targets, scale, card) => {
    let s = L.init({ targets, scale, exactOnly: true });
    targets.forEach((_, i) => { s = solveCard(s, i); });
    s = L.setCard(s, card);
    const x = eqBuildOf(s, card);
    expect(x.expected).toEqual([x.a, x.pos, x.neg]);
    x.expected.forEach((v) => expect(x.tiles).toContain(v));
    expect(x.tiles).toContain(x.decoy);
    expect(new Set(x.tiles).size).toBe(4);
    const a = targets[card];
    if (!x.pos.includes('√')) { expect(sq(x.pos)).toBeCloseTo(a, 9); expect(sq(x.neg)).toBeCloseTo(a, 9); }
    expect(sq(x.decoy)).not.toBeCloseTo(a, 6);
    const q = QUESTIONS.eqBuild(s, k);
    expect(q.kind).toBe('build');
    expect(isCorrect(q, q.expected)).toBe(true);
    expect(isCorrect(q, [x.a, x.neg, x.pos])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('the decoy of √3 is the nearest tick 1,7 — the approximate value is not the solution', () => {
    let s = L.init({ targets: [3], scale: 10, exactOnly: true });
    s = solveCard(s, 0);
    expect(eqBuildOf(s, 0)).toMatchObject({ a: '3', pos: '√3', neg: '−√3', decoy: '1,7' });
  });

  it('the one-tap questions are true and their chips hold the answer', () => {
    let s = L.init({ targets: [0.04, 0, -9], scale: 10, exactOnly: true });
    [0, 1, 2].forEach((i) => { s = solveCard(s, i); });
    const pos = QUESTIONS.posSqFill(L.setCard(s, 0), k);
    expect(pos.fields[0].expected).toBe('0,04');
    expect(pos.fields[0].options).toContain('0,04');
    expect(new Set(pos.fields[0].options).size).toBe(pos.fields[0].options.length);
    expect(isCorrect(pos, ['0,04'])).toBe(true);
    const zero = QUESTIONS.zeroCountFill(L.setCard(s, 1), k);
    expect(isCorrect(zero, ['1'])).toBe(true);
    const neg = QUESTIONS.negCountFill(L.setCard(s, 2), k);
    expect(isCorrect(neg, ['0'])).toBe(true);
    [pos, zero, neg].forEach((q) => { expect(text(q)).not.toMatch(rawKey); expect(q.hints).toHaveLength(2); });
  });

  it('the guide shows the gesture needed now — never « لا حل », never the exact mark', () => {
    let s = L.init({ targets: [3, -1], scale: 10, exactOnly: true });
    expect(L.coachOf(s).target).toBe('[data-fold-handle]');
    s = at(s, 5);
    expect(L.coachOf(s).target).toBe('[data-fold-pin-button]');
    s = L.pin(s);
    expect(L.coachOf(s).target).toBe('[data-fold-handle]');
    s = solveCard(s, 0);
    expect(L.coachOf(s).target).toBe('[data-fold-cards]');
    s = L.declareNone(L.setCard(s, 1));
    expect(L.coachOf(s)).toBeNull();
    // over a whole play, the guide never points at the answer buttons
    const seen = new Set();
    let p = L.init({ targets: [3, 0, -4], scale: 10, exactOnly: true });
    seen.add(L.coachOf(p)?.target);
    [0, 1, 2].forEach((i) => { p = solveCard(p, i); seen.add(L.coachOf(p)?.target); });
    expect([...seen].some((x) => /fold-none|fold-exact/.test(String(x)))).toBe(false);
  });

  it('no string interpolates `ns` — i18next reads it as the NAMESPACE and the browser shows the raw key (found in the 2026-11-10 walk)', () => {
    const all = JSON.stringify(strings.squareFold);
    expect(all).not.toContain('{{ns}}');
    let s = L.init({ targets: [4, 0, -9], scale: 2, exactOnly: true });
    [0, 1, 2].forEach((i) => { s = solveCard(s, i); });
    ['posMirror', 'posSqFill', 'eqBuild'].forEach((id) => expect(text(QUESTIONS[id](L.setCard(s, 0), k))).not.toMatch(rawKey));
    expect(text(QUESTIONS.negWhy(L.setCard(s, 2), k))).not.toMatch(rawKey);
  });

  it('every new string exists in Arabic (no raw key, no placeholder left)', () => {
    ['coach.drag', 'coach.pin', 'coach.again', 'coach.card', 'predict.two', 'predict.one', 'predict.zero', 'predict.yes', 'predict.no', 'pinExact', 'journal', 'cardSolvedSr', 'cp.countField']
      .forEach((key) => expect(k(key)).not.toMatch(rawKey));
    expect(k('predict.promptCount', { eq: 'x' })).not.toMatch(rawKey);
    expect(k('vNearTick', { xsq: '1{,}7', x2: '2{,}89', a: '3', aText: '3' })).toContain('2{,}89');
  });
});
