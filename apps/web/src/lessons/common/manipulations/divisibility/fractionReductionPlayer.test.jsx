import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import { CHAINS, CHAINS_PLAYER, QUESTIONS } from './FractionReduction';
import * as L from '../logic/fraction';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `fraction-reduction` dans le lecteur de mission (rollout 2026-11-09) : compter d'un toucher, BÂTIR la première division
 * « n = k × n′ », pourquoi s'arrêter, puis une seule division et la règle ; les vérités sont celles de la logique du labo.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.reduce.${key}`, o);
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f) => f.label)}{q.slots}</div>);
/** Le chemin أ joué jusqu'au bout avec le plus petit diviseur commun à chaque fois, puis déclaré fini. */
const played = (n, d) => {
  let s = L.init({ n, d });
  for (let g = 0; g < 20 && L.candidatesA(s).length; g += 1) s = L.reduceA(s, L.candidatesA(s)[0]);
  return L.claimIrreducible(s);
};

describe('fraction-reduction in the mission player', () => {
  it('the player chains count → build → why, then one step → rule; the page keeps its own chains', () => {
    expect(CHAINS_PLAYER.steps).toEqual(['countFill', 'build', 'why']);
    expect(CHAINS_PLAYER.pgcd).toEqual(['oneStep', 'rule']);
    expect(CHAINS.steps).toEqual(['count', 'same', 'why']);
  });
  it.each([[12, 18], [84, 48], [60, 36], [126, 90]])('%i/%i: the count and the first division tell the truth', (n, d) => {
    const lab = played(n, d);
    expect(L.pathAFinished(lab)).toBe(true);
    const c = QUESTIONS.countFill({ n, d, lab }, k);
    expect(c.fields[0].expected).toBe(lab.pathA.length);
    expect(c.fields[0].options).toContain(lab.pathA.length);
    const bld = QUESTIONS.build({ n, d, lab }, k);
    const k1 = lab.pathA[0];
    expect(bld.ops).toEqual(['=', '×']);
    expect(bld.expected).toEqual([n, k1, n / k1]);
    expect(k1 * (n / k1)).toBe(n);
    expect(isCorrect(bld, [n, k1, n / k1])).toBe(true);
    expect(bld.tiles).toEqual(expect.arrayContaining(bld.expected));
    [c, bld].forEach((q) => { expect(text(q)).not.toMatch(RAW); expect(q.hints).toHaveLength(2); });
  });
});
