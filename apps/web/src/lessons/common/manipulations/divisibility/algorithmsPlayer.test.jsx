import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import * as Diff from './DifferenceAlgorithm';
import * as Euclid from './EuclidAlgorithm';
import * as L from '../logic/algorithms';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 des labos `pgcd-differences` et `euclidean-algorithm` dans le lecteur de mission (rollout 2026-11-08) : compter d'un toucher,
 * BÂTIR la première étape (« grand = petit + reste », « a = b × q + r »), puis l'invariant et la règle ; les vérités sont celles du cœur.
 */
const kOf = (ns) => (key, o) => i18n.t(`lesson:manipulation.${ns}.${key}`, o);
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);

describe('pgcd-differences in the mission player', () => {
  it('the player chains count → build → invariant, then stop → rule; the page keeps its own chains', () => {
    expect(Diff.CHAINS_PLAYER.cuts).toEqual(['countFill', 'build', 'invariant']);
    expect(Diff.CHAINS_PLAYER.pgcd).toEqual(['stop', 'rule']);
    expect(Diff.CHAINS.cuts).toEqual(['count', 'invariant']);
  });
  it.each([[21, 14], [252, 140], [378, 315], [91, 65]])('a=%i, b=%i: the count and the first cut tell the truth', (a, b) => {
    const lab = L.initDifferences({ a, b });
    const k = kOf('diff');
    const c = Diff.QUESTIONS.countFill({ a, b, lab }, k);
    expect(c.fields[0].expected).toBe(lab.steps.length);
    expect(c.fields[0].options).toContain(lab.steps.length);
    const bld = Diff.QUESTIONS.build({ a, b, lab }, k);
    const s0 = lab.steps[0];
    expect(bld.ops).toEqual(['=', '+']);
    expect(bld.expected).toEqual([s0.big, s0.small, s0.diff]);
    expect(s0.small + s0.diff).toBe(s0.big);
    expect(isCorrect(bld, [s0.big, s0.small, s0.diff])).toBe(true);
    expect(bld.tiles).toEqual(expect.arrayContaining(bld.expected));
    [c, bld].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });
});

describe('euclidean-algorithm in the mission player', () => {
  it('the player chains count → build → invariant, then stop → rule; the page keeps its own chains', () => {
    expect(Euclid.CHAINS_PLAYER.divs).toEqual(['countFill', 'build', 'invariant']);
    expect(Euclid.CHAINS.divs).toEqual(['count', 'next', 'invariant']);
  });
  it.each([[45, 18], [765, 135], [3356, 1528], [1938, 836]])('a=%i, b=%i: the count and the first division tell the truth', (a, b) => {
    const lab = L.initEuclid({ a, b });
    const k = kOf('euclid');
    const c = Euclid.QUESTIONS.countFill({ a, b, lab }, k);
    expect(c.fields[0].expected).toBe(lab.steps.length);
    const bld = Euclid.QUESTIONS.build({ a, b, lab }, k);
    const s0 = lab.steps[0];
    expect(bld.expected).toEqual([s0.a, s0.b, s0.q, s0.r]);
    expect(s0.b * s0.q + s0.r).toBe(s0.a);
    expect(s0.r).toBeLessThan(s0.b);
    expect(isCorrect(bld, [s0.a, s0.b, s0.q, s0.r])).toBe(true);
    // the copy's length and the number of copies are not interchangeable
    if (s0.b !== s0.q) expect(isCorrect(bld, [s0.a, s0.q, s0.b, s0.r])).toBe(false);
    [c, bld].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });
});
