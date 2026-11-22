import { describe, it, expect } from 'vitest';
import * as E from './eliminationCards.js';
import * as P from './eliminationCardsPlayer.js';

/**
 * Le lecteur de `elimination-cards` (unité 5 leçon 2, verdict L2 + X11) : les essais, les chemins « plus », le leurre de la construction PAR CHEMIN,
 * les suites, les prédictions et le guide — calculés par le labo réel (`logic/eliminationCards.js`), jamais écrits à la main.
 */
const path = (src, from, v) => P.subPaths(src).find((p) => p.from === from && p.v === v);
const oneBySub = (src, from, v) => P.playSubstitution(src, path(src, from, v));
const line = (b) => `${b.expected[0]} = ${b.expected[1]}`;
const decoyLine = (b) => (b.decoySide === 'left' ? `${b.decoy} = ${b.right}` : `${b.left} = ${b.decoy}`);

describe('trials', () => {
  it('a substitution, a stack and a value carried back are trials; isolating, scaling and revealing are not', () => {
    const lab = E.init('x+y=8|x-y=2');
    const iso = E.isolateFrom(lab, 2, 'x');
    expect(P.trialOf(lab, iso)).toBeNull();
    expect(P.trialOf(lab, E.setScale(lab, 1, 2))).toBeNull();
    const one = E.substituteInto(iso, 1);
    expect(P.trialOf(iso, one).kind).toBe('substitute');
    const stepped = E.solveStep(one);
    expect(P.trialOf(one, stepped)).toBeNull();
    let back = one; while (back.stage === 'one') back = E.solveStep(back);
    expect(P.trialOf(back, E.backSubstitute(back, 1)).kind).toBe('back');
    expect(P.trialOf(lab, E.stack(lab, 1, 2)).kind).toBe('sum');
    // la même ligne par l'autre méthode est un autre essai
    expect(P.trialOf(lab, E.stack(lab, 1, 2)).sig).not.toBe(P.trialOf(iso, one).sig);
  });
  it('only the four idea refusals count', () => {
    ['sameCard', 'wrongUnknown', 'noCancel', 'both'].forEach((r) => expect(P.isRefusal(r)).toBe(true));
    ['zero', 'notNow', 'noUnknownHere', 'scaleRange', 'noOther', ''].forEach((r) => expect(P.isRefusal(r)).toBe(false));
  });
  it('the discovery: one method, or two methods giving the same pair', () => {
    let lab = P.finish(P.playStack('2x+y=11|3x-y=4'));
    expect(P.discoveredFor(lab, 1)).toBe(true);
    expect(P.discoveredFor(lab, 2)).toBe(false);
    lab = E.restart(lab);
    lab = P.finish(E.substituteInto(E.isolateFrom(lab, 2, 'y'), 1));
    expect(P.discoveredFor(lab, 2)).toBe(true);
    expect(P.methodsCount(lab)).toBe(2);
  });
});

describe('rule P — the plus paths and the BUILD decoys by path (verdict X11 › P2–P4)', () => {
  it('a plus path isolates in integers onto a POSITIVE coefficient', () => {
    expect(P.plusPaths('x+y=8|x-y=2').map((p) => `${p.from}${p.v}→${p.into}`)).toEqual(['1x→2', '2x→1', '2y→1']);
    expect(path('x+y=8|x-y=2', 1, 'y').plus).toBe(false); // y = 8 − x sur −y : le chemin « moins »
    expect(P.plusPaths('2x+3y=14|x-y=2').length).toBe(2);
  });
  it('r1 x + y = 8 | x − y = 2: plus 2y = 6 (decoy 2y = 10), stack 2x = 10 (decoy 2x = 6), minus 2x = 10 (decoy 2x = −6)', () => {
    const plus = P.buildSpec(oneBySub('x+y=8|x-y=2', 2, 'x'));
    expect([line(plus), decoyLine(plus), plus.kind]).toEqual(['2y = 6', '2y = 10', 'transposition']);
    const st = P.buildSpec(P.playStack('x+y=8|x-y=2'));
    expect([line(st), decoyLine(st), st.kind]).toEqual(['2x = 10', '2x = 6', 'signLost']);
    const minus = P.buildSpec(oneBySub('x+y=8|x-y=2', 1, 'y'));
    expect([line(minus), decoyLine(minus)]).toEqual(['2x = 10', '2x = -6']);
  });
  it('r2 2x + y = 11 | 3x − y = 4: plus 5x = 15 (decoy 5x = 7), stack decoy 5x = 7, minus decoy 5x = −7', () => {
    const plus = P.buildSpec(oneBySub('2x+y=11|3x-y=4', 2, 'y'));
    expect(oneBySub('2x+y=11|3x-y=4', 2, 'y').lines.at(-1).tex).toBe('2x + (3x - 4) = 11');
    expect([line(plus), decoyLine(plus)]).toEqual(['5x = 15', '5x = 7']);
    expect(decoyLine(P.buildSpec(P.playStack('2x+y=11|3x-y=4')))).toBe('5x = 7');
    expect(oneBySub('2x+y=11|3x-y=4', 1, 'y').lines.at(-1).tex).toBe('3x - (11 - 2x) = 4');
    expect(decoyLine(P.buildSpec(oneBySub('2x+y=11|3x-y=4', 1, 'y')))).toBe('5x = -7');
  });
  it('r3 2x + 3y = 14 | x − y = 2: 2(y + 2) + 3y = 14 → 5y = 10 decoy 5y = 12; 2x + 3(x − 2) → 5x = 20 decoy 5x = 16; ×3 on (2) decoy 5x = 16', () => {
    const a = oneBySub('2x+3y=14|x-y=2', 2, 'x');
    expect(a.lines.at(-1).tex).toBe('2(y + 2) + 3y = 14');
    expect([line(P.buildSpec(a)), decoyLine(P.buildSpec(a)), P.buildSpec(a).kind]).toEqual(['5y = 10', '5y = 12', 'noBracket']);
    const b = oneBySub('2x+3y=14|x-y=2', 2, 'y');
    expect(b.lines.at(-1).tex).toBe('2x + 3(x - 2) = 14');
    expect([line(P.buildSpec(b)), decoyLine(P.buildSpec(b))]).toEqual(['5x = 20', '5x = 16']);
    const st = P.buildSpec(P.playStack('2x+3y=14|x-y=2', { 1: 1, 2: 3 }));
    expect([line(st), decoyLine(st), st.kind]).toEqual(['5x = 20', '5x = 16', 'oneSide']);
    expect(P.playStack('2x+3y=14|x-y=2')).toBeNull(); // posées telles quelles : rien ne s'annule
  });
  it('a bundle printed « m − |k|u » on a factor ≥ 2: only m multiplied (the coefficient changes)', () => {
    // 3x + 2y = 12 | x + y = 5 : y = 5 − x porté sur 2y → 3x + 2(5 − x) = 12 → x = 2 ; leurre : 3x + 10 − x … → 2x = 2
    const b = P.buildSpec(oneBySub('3x+2y=12|x+y=5', 2, 'y'));
    expect(line(b)).toBe('x = 2');
    expect(b.kind).toBe('noBracket');
    expect(decoyLine(b)).toBe('2x = 2');
  });
  it('the decoy is never the right line', () => {
    ['x+y=8|x-y=2', '2x+y=11|3x-y=4', '2x+3y=14|x-y=2', 'x+y=4|x-y=2', 'x+y=5|2x-y=7', 'x+2y=4|x-y=1'].forEach((src) => {
      P.subPaths(src).forEach((p) => { const b = P.buildSpec(P.playSubstitution(src, p)); expect(b.decoy, src).not.toBe(b.expected[b.decoySide === 'left' ? 0 : 1]); });
    });
  });
});

describe('chains, predictions, coach', () => {
  it('build fires once per method in a two-method round; the rule / choice after both methods', () => {
    expect(P.chainIds('r2')).toEqual(['build-sub', 'build-add', 'pair', 'rule']);
    expect(P.chainIds('r3')).toEqual(['build-sub', 'build-add', 'pair', 'choose']);
    expect(P.chainIds('r1')).toEqual(['build', 'pair']);
    expect(P.buildIdFor('r2', 'add')).toBe('build-add');
    expect(P.buildIdFor('r1', 'sub')).toBe('build');
    expect(P.buildIdFor('none', 'sub')).toBeNull();
  });
  it('the see question of r1', () => {
    expect(P.seeSpec(P.playStack('x+y=8|x-y=2')).options).toEqual(['0', '2y', '-2y']);
    expect(P.seeSpec(oneBySub('x+y=8|x-y=2', 2, 'x')).bundle).toBe('(y + 2)');
  });
  it('predictions are computed: vanish y (r2), multiplier 3 · −3 · 2 (r3), same pair yes', () => {
    expect(P.predictTruth('2x+y=11|3x-y=4', 'vanish')).toBe('y');
    expect(P.predictOptions('2x+3y=14|x-y=2', 'multiplier').map((o) => o.n)).toEqual([3, -3, 2]);
    expect(P.predictTruth('2x+3y=14|x-y=2', 'multiplier')).toBe('3');
    expect(P.predictTruth('2x+y=11|3x-y=4', 'samePair')).toBe('yes');
    expect(P.predictOptions('2x+y=11|3x-y=4', 'samePair')).toHaveLength(2);
  });
  it('the coach names the gesture, never the answer', () => {
    const lab = E.init('x+y=8|x-y=2');
    expect(P.coachOf(lab, {}).id).toBe('start');
    expect(P.coachOf(E.isolateFrom(lab, 1, 'x'), { started: true }).id).toBe('carry');
    expect(P.coachOf(lab, { started: true, refusedStack: true, scaleCard: 1 }).target).toBe('[data-coach="scale-1"]');
    expect(P.coachOf(oneBySub('x+y=8|x-y=2', 2, 'x'), { buildDone: false })).toBeNull();
    expect(P.coachOf(oneBySub('x+y=8|x-y=2', 2, 'x'), { buildDone: true }).id).toBe('next');
    expect(P.coachOf(lab, { done: true })).toBeNull();
  });
  it('shownValues lists the cards, the lines, the values, the pairs and the build tiles', () => {
    const shown = P.shownValues({ system: '2x+y=11|3x-y=4', chains: 'r2', predict: ['vanish'] });
    const has = (role, v) => shown.some((s) => s.role === role && s.v === v);
    expect(has('eq', '2x+(3x-4)=11')).toBe(true);
    expect(has('eq', '6x+3y=33')).toBe(true);
    expect(has('value', '3')).toBe(true);
    expect(has('pair', '(3;5)')).toBe(true);
    expect(has('decoy', '7')).toBe(true);
    expect(has('iso', 'y=11-2x')).toBe(true);
  });
});
