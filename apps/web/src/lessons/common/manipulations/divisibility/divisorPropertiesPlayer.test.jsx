import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { CHAINS, CHAINS_PLAYER, QUESTIONS } from './DivisorProperties';
import * as L from '../logic/divisorProperties';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `divisor-properties` dans le lecteur de mission (rollout 2026-11-08) : observer d'un toucher (`fill`) ce que chaque
 * mur montre, BÂTIR a = b × k + r pour le reste, puis la règle ; les vérités sont celles de la division et de la logique du labo.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.props.${key}`, o);
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);
const CASES = [[3, 18, 12], [5, 35, 15], [7, 56, 21], [9, 900, 90], [12, 480, 84]];

describe('divisor-properties in the mission player', () => {
  it('the player chains observe → whole, observe → whole, observe → build → rule; the page keeps its own chains', () => {
    expect(CHAINS_PLAYER.sum).toEqual(['sumObserve', 'sumWhole']);
    expect(CHAINS_PLAYER.diff).toEqual(['diffObserve', 'diffWhole']);
    expect(CHAINS_PLAYER.rem).toEqual(['remObserve', 'remBuild', 'rule']);
    expect(CHAINS.rem).toEqual(['remPanels', 'remBricks', 'rule']);
  });
  it.each(CASES)('n=%i, a=%i, b=%i: the questions tell the SAME truth as the walls', (n, a, b) => {
    const lab = L.init({ n, a, b });
    const ctx = { n, a, b, lab };
    const sum = QUESTIONS.sumObserve(ctx, k);
    expect(sum.kind).toBe('fill');
    expect(sum.fields.map((f) => f.expected)).toEqual([a / n, b / n]);
    sum.fields.forEach((f) => expect(f.options).toContain(f.expected));
    expect(isCorrect(sum, [a / n, b / n])).toBe(true);
    const diff = QUESTIONS.diffObserve(ctx, k);
    expect(diff.fields.map((f) => f.expected)).toEqual([(a - b) / n]);
    const rem = QUESTIONS.remObserve(ctx, k);
    expect(rem.fields.map((f) => f.expected)).toEqual([Math.floor(a / b), (a % b) / n]);
    const bld = QUESTIONS.remBuild(ctx, k);
    expect(bld.kind).toBe('build');
    expect(bld.expected).toEqual([a, b, Math.floor(a / b), a % b]);
    expect(b * Math.floor(a / b) + (a % b)).toBe(a);
    expect(isCorrect(bld, [a, b, Math.floor(a / b), a % b])).toBe(true);
    expect(isCorrect(bld, [a, Math.floor(a / b), b, a % b])).toBe(false); // the panel length and the number of panels are not interchangeable
    [sum, diff, rem, bld].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });
  it('the prediction is always « whole bricks » : n divides a, b, a + b, a − b and the remainder', () => {
    CASES.forEach(([n, a, b]) => {
      const lab = L.init({ n, a, b });
      L.TARGETS.forEach((t) => expect(L.outcome(lab, t)).toBe('whole'));
    });
  });
});
