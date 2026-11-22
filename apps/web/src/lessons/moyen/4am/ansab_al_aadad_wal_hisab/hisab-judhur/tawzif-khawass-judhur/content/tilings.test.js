import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, FREE, PRACTICE } from './tilings.js';
import { violations, AVOID, NEVER } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/squareTiling.js';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Le carré dallé de tawzif-khawass-judhur (conseil du 2026-11-10, option C). ÉCRIT AVANT les données des manches, et lancé d'abord sur la liste
 * des cartes du conseil : pour chaque carte, ce que son écran PEUT montrer (n, k de 1 à ⌊√n⌋, k², n ÷ k², les formes k√m, les choix, les leurres,
 * les k des prédictions — `simplestShown`, avec un RÔLE par valeur) ne rencontre jamais l'ensemble interdit de la مسألة (content/forbidden.js).
 */
const playable = M1_ROUNDS.filter((r) => !r.free);
const shownOf = (n, p = {}) => L.simplestShown(n, { chains: p.chains ?? 'none', predictKs: p.predictKs ?? [], predictAlso: p.predictAlso ?? [], avoid: AVOID });

/** Rejoue une manche : chaque pavage nouveau de k > 1 est un verdict (le premier refus gratuit), la découverte annoncée quand le labo l'atteint. */
function play(props, ks, { preds = [], checkpoints = [] } = {}) {
  let s = L.init({ n: props.n, mode: props.mode });
  let log = emptyLog();
  let refused = 0; let told = false;
  preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
  ks.forEach((v) => {
    const t = L.tiling(s.n, v);
    if (!s.tried.some((x) => x.k === v) && v > 1) {
      log = logEvent(log, 'verdict', { groups: v, exact: t.valid, ...(t.valid || refused++ ? {} : { free: true }) });
    }
    s = L.tile(s, v);
    if (L.discoveryReady(s) && !told) { told = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
  });
  checkpoints.forEach((id) => { log = logEvent(log, 'trial', { tk: 'checkpoint-done', id }); });
  return { s, log };
}

describe('the forbidden rule (content/forbidden.js) catches what it must', () => {
  it('flags the dropped and the climax cards', () => {
    expect(violations(128, shownOf(128)).some((x) => x.includes('100'))).toBe(true);   // k = 10 → « 128 ÷ 100 »
    expect(violations(200, shownOf(200)).length).toBeGreaterThan(0);
    expect(violations(50, shownOf(50)).length).toBeGreaterThan(0);
    expect(violations(98, shownOf(98)).some((x) => x.includes('√2'))).toBe(true);    // 2 / √2 only on 32 and 72
    expect(violations(75, [{ role: 'decoy', v: '25' }])).toHaveLength(1);              // 25 only as k²
    expect(violations(75, [{ role: 'kk', v: '25' }])).toHaveLength(0);
  });
});

describe('the tiling rounds of tawzif-khawass-judhur', () => {
  it('the council\'s cards, their accepted k > 1 and their simplest form (recomputed)', () => {
    const acc = (n) => L.validBig(L.init({ n }));
    expect(acc(75)).toEqual([5]);
    expect(acc(32)).toEqual([2, 4]);
    expect(acc(80)).toEqual([2, 4]);
    expect(acc(72)).toEqual([2, 3, 6]);
    expect(acc(27)).toEqual([3]);
    expect(M1_ROUNDS.map((r) => r.props.n)).toEqual([75, 32, 80, 72, 27]);
    expect(PRACTICE).toBe(27);
    expect(FREE).toEqual([27, 32, 54, 63, 75, 80, 96]);
    expect(['5√3', '4√2', '4√5', '6√2', '3√3']).toEqual([75, 32, 80, 72, 27].map((n) => L.simplestText(n).replace(/\s/g, '')));
  });

  it('no screen of any round, of the practice round or of a free chip meets the forbidden set', () => {
    playable.forEach((r) => expect(violations(r.props.n, shownOf(r.props.n, r.props)), r.id).toEqual([]));
    expect(violations(PRACTICE, shownOf(PRACTICE)), 'practice').toEqual([]);
    FREE.forEach((n) => expect(violations(n, shownOf(n)), `free ${n}`).toEqual([]));
    // aucune puce, consigne ni titre ne propose une aire interdite
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const words = `${x.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`.match(/\d+/g) ?? [];
      words.forEach((w) => expect(NEVER.includes(w), `${r.id}: ${w}`).toBe(false));
    }));
  });

  it('128, 45 and 98 are dropped; 72 only as the challenge', () => {
    const all = [...M1_ROUNDS.map((r) => r.props.n), ...FREE, PRACTICE];
    [128, 288, 45, 98, 200, 50].forEach((n) => expect(all).not.toContain(n));
    expect(M1_ROUNDS.filter((r) => r.props.n === 72).map((r) => r.id)).toEqual(['challenge']);
  });

  it('predictions: « smallest that works » with a refused k above the largest valid one, the right k moving; a yes/no whose truth alternates', () => {
    const right = playable.map((r) => r.props.predictKs.indexOf(L.kmax(L.init({ n: r.props.n }))));
    expect(right).toEqual([2, 0, 2, 0]);   // last, first, last, first
    playable.forEach((r) => {
      const km = L.kmax(L.init({ n: r.props.n }));
      expect(r.props.predictKind, r.id).toBe('smallest');
      expect(r.props.predictKs.some((v) => v > km && !L.tilesWhole(r.props.n, v)), r.id).toBe(true);
    });
    expect(playable.map((r) => L.tilesWhole(r.props.n, r.props.predictAlso[0]))).toEqual([false, true, false, true]);
    // the yes/no is never on the largest k (its result would be judged as « smallest »)
    playable.forEach((r) => expect(r.props.predictAlso, r.id).not.toContain(L.kmax(L.init({ n: r.props.n }))));
  });

  it('every goal is reachable by a student who tiles, with three stars inside maxTrials, and the first refusal is free', () => {
    const plays = {
      r1: play(M1_ROUNDS[0].props, [5, 6], { preds: [true, true], checkpoints: ['rule'] }),
      r2: play(M1_ROUNDS[1].props, [4, 2], { preds: [true, true], checkpoints: ['tile'] }),
      r3: play(M1_ROUNDS[2].props, [4, 2], { preds: [true, true], checkpoints: ['tile'] }),
      challenge: play(M1_ROUNDS[3].props, [6, 3], { preds: [true, true], checkpoints: ['tile'] }),
    };
    playable.forEach((r) => {
      const { log } = plays[r.id];
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
    expect(countedTrials(plays.r1.log)).toBe(1);
    const p = play(M1_ROUNDS[0].easier.props, [3, 4]);
    expect(roundWon({ id: 'p', goal: M1_ROUNDS[0].easier.goal }, p.log)).toBe(true);
  });

  it('a round is never won while its question is open: the goal waits for its chain', () => {
    expect(roundWon(M1_ROUNDS[0], play(M1_ROUNDS[0].props, [5, 6]).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[1], play(M1_ROUNDS[1].props, [4, 2]).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[2], play(M1_ROUNDS[2].props, [4, 2]).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[3], play(M1_ROUNDS[3].props, [6, 3]).log)).toBe(false);
    playable.forEach((r) => {
      const id = r.props.chains === 'fullS' ? 'rule' : 'tile';
      expect(r.goal.some((c) => c.checkpoint === id), r.id).toBe(true);
    });
  });

  it('three refusals offer « جرّب أصغر »; the challenge and the free round never do', () => {
    const { log } = play(M1_ROUNDS[2].props, [3, 5, 6]);
    expect(needsHelp(M1_ROUNDS[2], log)).toBe(true);
    expect(needsHelp(M1_ROUNDS[3], log)).toBe(false);
    expect(needsHelp(M1_ROUNDS[4], log)).toBe(false);
  });

  it('round 1 asks the full chain, then one question per round', () => {
    expect(M1_ROUNDS.map((r) => r.props.chains)).toEqual(['fullS', 'buildS', 'bestS', 'buildS', 'none']);
    expect(M1_ROUNDS[4].props.choices).toEqual(FREE);
  });
});
