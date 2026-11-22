import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { CHAINS, CHAINS_PLAYER, QUESTIONS } from './FactorPairs';
import * as L from '../logic/factorPairs';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `factor-pairs` dans le lecteur de mission (rollout 2026-11-08) : prédire → observer d'un toucher (`fill`) →
 * BÂTIR l'égalité n = d × e + r (`build`) ; la suite de la règle d'arrêt ; la cellule du rectangle plus grande dans l'écran de jeu.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.factorPairs.${key}`, o);
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);

describe('factor-pairs in the mission player', () => {
  it('the player chains observe → build, then turned → rule; the page keeps its own chains', () => {
    expect(CHAINS_PLAYER).toEqual({ first: ['observe', 'build'], rule: ['turned', 'rule'] });
    expect(CHAINS.first).toEqual(['rows', 'rest', 'verdict']);
  });
  it.each([[24, 6], [60, 7], [48, 8], [105, 20], [17, 1]])('n=%i, d=%i: observe and build tell the SAME truth as the division', (n, d) => {
    const e = Math.floor(n / d); const r = n % d;
    const first = { d };
    const obs = QUESTIONS.observe({ n, first }, k);
    expect(obs.kind).toBe('fill');
    expect(obs.fields.map((f) => f.expected)).toEqual([e, r]);
    obs.fields.forEach((f) => expect(f.options).toContain(f.expected));
    expect(isCorrect(obs, [e, r])).toBe(true);
    expect(isCorrect(obs, [e + 1, r])).toBe(false);
    const bld = QUESTIONS.build({ n, first }, k);
    expect(bld.kind).toBe('build');
    expect(bld.expected).toEqual([n, d, e, r]);
    expect([...bld.tiles].sort((a, b) => a - b)).toEqual([...bld.expected].sort((a, b) => a - b));
    expect(n).toBe(d * e + r);
    expect(isCorrect(bld, [n, d, e, r])).toBe(true);
    expect(isCorrect(bld, [n, e, d, r])).toBe(false); // d and e swapped: the slots have meanings
    [obs, bld].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });
  it('a larger rectangle cell is allowed for the player screen, never beyond what fits', () => {
    const page = L.rectangleLayout({ n: 24, d: 6, boxW: 600, boxH: 300 });
    const player = L.rectangleLayout({ n: 24, d: 6, boxW: 600, boxH: 300, maxCell: 72 });
    expect(page.cell).toBe(44);
    expect(player.cell).toBe(72);
    const tight = L.rectangleLayout({ n: 60, d: 7, boxW: 300, boxH: 200, maxCell: 72 });
    expect(tight.width).toBeLessThanOrEqual(300);
    expect(tight.height).toBeLessThanOrEqual(200);
  });
});
