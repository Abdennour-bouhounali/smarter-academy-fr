import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, FREE, PRACTICE } from './tilings.js';
import * as L from '../../../../../../common/manipulations/logic/squareTiling.js';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Le carré dallé de amaliyat-judhur (conseil du 2026-11-10). ÉCRIT AVANT les données des manches : pour chaque carte, les k > 1 acceptés ;
 * chaque but atteignable par un élève qui pave ; chaque valeur que le labo AFFICHE (aire de la dalle, côté k√b, quotient refusé, choix et
 * tuiles des questions, k des prédictions) balayée contre les nombres interdits de la مسألة de la leçon (et de celle de la leçon 5). Il aurait
 * attrapé 72 → 18 et 288 → 12.
 */
/** Les nombres de la مسألة (lوحة الزليج 180 dm², بلاطات 5 و 12, 6√5, 2√3, 192, 8√3, 108, 45, 3√5, « 18 », √90, 150 دج) et de la leçon 5 (200, 10√2). */
const FORBIDDEN = ['180', '√180', '6√5', '12', '√12', '2√3', '192', '8√3', '108', '45', '3√5', '18', '90', '150', '200', '10√2'];
/** Les jetons d'un texte : « 9 × √3 » se lit aussi « 9√3 » ; « √(98 ÷ 36) » donne 98 et 36. */
const tokens = (s) => {
  const raw = String(s);
  const joined = raw.replace(/\s*×\s*/g, '');
  return new Set([...(raw.match(/\d*√?\d+/g) ?? []), ...(joined.match(/\d*√?\d+/g) ?? [])]);
};
const hits = (values) => [...values].flatMap((v) => [...tokens(v)].filter((x) => FORBIDDEN.includes(x)).map((x) => `${v} → ${x}`));
/** Rejoue une manche : chaque pavage est un verdict (le premier refus gratuit), la découverte annoncée quand le labo l'atteint. */
function play(round, ks, { preds = [], checkpoints = [] } = {}) {
  let s = L.init({ n: round.props.n, mode: round.props.mode });
  let log = emptyLog();
  let refused = 0; let told = false;
  preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
  ks.forEach((v) => {
    const t = L.tiling(s.n, v);
    if (!s.tried.some((x) => x.k === v)) {
      log = logEvent(log, 'verdict', { groups: v, exact: t.valid, ...(t.valid || refused++ ? {} : { free: true }) });
    }
    s = L.tile(s, v);
    if (L.discoveryReady(s) && !told) { told = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
  });
  checkpoints.forEach((id) => { log = logEvent(log, 'trial', { tk: 'checkpoint-done', id }); });
  return { s, log };
}
const playable = M1_ROUNDS.filter((r) => !r.free);

describe('the tiling rounds of amaliyat-judhur', () => {
  it('each card lists its accepted k > 1 (the council\'s arithmetic, recomputed)', () => {
    const accepted = (n) => L.validBig(L.init({ n }));
    expect(accepted(27)).toEqual([3]);
    expect(accepted(32)).toEqual([2, 4]);
    expect(accepted(98)).toEqual([7]);
    expect(accepted(96)).toEqual([2, 4]);
    expect(accepted(8)).toEqual([2]);
    expect(accepted(50)).toEqual([5]);
    expect(accepted(75)).toEqual([5]);
  });

  it('every value the lab SHOWS avoids the climax numbers (and lesson 5\'s), and 5 is never a tile area', () => {
    const cards = [...new Set([...playable.map((r) => r.props.n), ...FREE, PRACTICE])];
    cards.forEach((n) => {
      const round = M1_ROUNDS.find((r) => r.props.n === n);
      expect(hits(L.shownValues(n, { predictKs: round?.props.predictKs ?? [] })), `n = ${n}`).toEqual([]);
      L.validBig(L.init({ n })).forEach((v) => expect(n / (v * v), `${n}: tile area`).not.toBe(5));
    });
    M1_ROUNDS.forEach((r) => {
      [r, r.easier].filter(Boolean).forEach((x) => expect(hits([x.title ?? '', x.props.lead, x.props.mission, x.helpLine ?? '']), r.id).toEqual([]));
    });
  });

  it('dropped cards stay dropped: no 72, 36, 48, 288 anywhere', () => {
    const all = [...playable.map((r) => r.props.n), ...FREE, PRACTICE];
    [72, 36, 48, 288].forEach((n) => expect(all).not.toContain(n));
  });

  it('each round\'s predictions ask about one accepted and one refused k — their truths differ', () => {
    playable.forEach((r) => {
      const truths = r.props.predictKs.map((v) => L.tilesWhole(r.props.n, v));
      expect(truths, r.id).toHaveLength(2);
      expect(new Set(truths).size, r.id).toBe(2);
    });
  });

  it('every goal is reachable by a student who tiles, with three stars inside maxTrials', () => {
    const plays = {
      r1: play(M1_ROUNDS[0], [2, 3], { preds: [true, true], checkpoints: ['rule'] }),
      r2: play(M1_ROUNDS[1], [2, 3, 4], { preds: [true, true], checkpoints: ['tile'] }),
      r3: play(M1_ROUNDS[2], [4, 7], { preds: [true, true], checkpoints: ['tile'] }),
      challenge: play(M1_ROUNDS[3], [4, 3, 2], { preds: [true, true], checkpoints: ['tile'] }),
    };
    playable.forEach((r) => {
      const { log } = plays[r.id];
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
    // the first refusal is free
    expect(countedTrials(plays.r2.log)).toBe(2);
    // the practice round
    const p = play({ props: M1_ROUNDS[0].easier.props }, [2]);
    expect(roundWon({ id: 'p', goal: M1_ROUNDS[0].easier.goal }, p.log)).toBe(true);
  });

  it('a round is never won while its question is open: the goal waits for the chain (r1 « rule », the others « tile »)', () => {
    expect(roundWon(M1_ROUNDS[1], play(M1_ROUNDS[1], [2, 3, 4]).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[2], play(M1_ROUNDS[2], [4, 7]).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[3], play(M1_ROUNDS[3], [4, 3, 2]).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[0], play(M1_ROUNDS[0], [2, 3]).log)).toBe(false);
    playable.filter((r) => r.props.chains !== 'none').forEach((r) => {
      const id = r.props.chains === 'full' ? 'rule' : 'tile';
      expect(r.goal.some((c) => c.checkpoint === id), r.id).toBe(true);
    });
  });

  it('three refusals offer « جرّب أصغر »; the challenge and the free round never do', () => {
    const { log } = play(M1_ROUNDS[2], [2, 3, 4]);
    expect(needsHelp(M1_ROUNDS[2], log)).toBe(true);
    expect(needsHelp(M1_ROUNDS[3], log)).toBe(false);
    expect(needsHelp(M1_ROUNDS[4], log)).toBe(false);
  });

  it('round 1 asks the full chain, then one question per round', () => {
    expect(M1_ROUNDS.map((r) => r.props.chains)).toEqual(['full', 'bridge', 'quotient', 'area', 'none']);
    expect(M1_ROUNDS[4].props.choices).toEqual(FREE);
  });
});
