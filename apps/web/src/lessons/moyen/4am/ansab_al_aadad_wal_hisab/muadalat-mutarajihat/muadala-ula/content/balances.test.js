import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS, PREDICT, FREE1, FREE2, EQ } from './balances.js';
import { violations } from './forbidden.js';
import * as B from '../../../../../../common/manipulations/logic/equationBalance.js';
import * as P from '../../../../../../common/manipulations/logic/equationBalancePlayer.js';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * La balance de muadala-ula (conseil du 2026-11-11, verdict L1). ÉCRIT AVANT les données des manches et lancé d'abord sur leurs nombres : pour
 * chaque manche, TOUT ce que son écran peut montrer (`logic › shownValues` : plateaux de départ, équations et membres des DEUX chemins efficaces, solution,
 * valeur des plateaux, pastilles, tuiles et leurre, options des prédictions) ne rencontre jamais la signature de la مسألة (content/forbidden.js). Puis
 * chaque manche est JOUÉE jusqu'à son but, comme le labo la joue : un essai = une équation NOUVELLE écrite ou un geste refusé ; le premier refus est gratuit.
 */
const ALL = [...M1_ROUNDS, ...M2_ROUNDS];
const SETS = [...M1_ROUNDS, ...M2_ROUNDS].flatMap((r) => [r, r.easier].filter(Boolean));

/** Joue une manche par l'un des deux chemins efficaces : le journal que le labo écrirait (lignes, découverte, suites finies, prédictions justes). */
function play(round, { order = 'bags', preds } = {}) {
  const p = round.props;
  const plan = P.efficientPlan(p.eq, order);
  let log = emptyLog();
  (p.predict ?? []).forEach((key, i) => { log = logEvent(log, 'trial', { tk: 'predict', ok: preds?.[i] ?? true }); });
  const lines = new Set([P.lineSig(B.init(p.eq).pans)]);
  const specs = P.chainsOf(p.chains);
  const done = new Set();
  // la suite d'une manche ne s'ouvre que lorsque la balance ATTEINT son moment (`reached`), comme dans le labo
  const ask = (lab) => specs.filter((sp) => !done.has(sp.id) && sp.reached(lab)).forEach((sp) => { done.add(sp.id); log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: sp.id }); });
  const stages = [];
  let st = { steps: [], k: 1 };
  plan.steps.forEach((s) => { st = { steps: [...st.steps, s], k: 1 }; stages.push(P.playPlan(p.eq, st).lab); });
  if (plan.k > 1) stages.push(P.playPlan(p.eq, plan).lab);
  stages.forEach((l) => {
    const sig = P.lineSig(l.pans);
    if (!lines.has(sig)) { lines.add(sig); log = logEvent(log, 'verdict', { groups: lines.size - 1, exact: true }); }
    ask(l);
  });
  const full = P.playPlan(p.eq, plan, { open: true });
  if (P.discoveryReached(full.lab)) log = logEvent(log, 'trial', { tk: 'discovered' });
  ask(full.lab);
  return { log, lab: full.lab, lines: lines.size - 1, reached: [...done] };
}

describe('the forbidden rule (content/forbidden.js) catches what it must, in its role', () => {
  it('flags the climax equations, pans, solution, check and price', () => {
    expect(violations(P.shownValues({ eq: '7x-4=2x+26', chains: 'none' })).length).toBeGreaterThan(5);
    expect(violations(P.shownValues({ eq: '5x+2=2x-13', chains: 'none' })).length).toBeGreaterThan(5);
    expect(violations([{ role: 'eq', v: '5x = 30' }, { role: 'decoy', v: '9x - 4 = 26' }, { role: 'solution', v: '6' }, { role: 'check', v: '38' }, { role: 'check', v: '−23' }, { role: 'pan', v: '2x + 26' }, { role: 'op', v: 'bags:2' }, { role: 'chip', v: '15' }, { role: 'x', v: '70\\,200' }])).toHaveLength(9);
    // another role: 5 as a count of bags, 6 as a coefficient, 26 as a plain number of bags
    expect(violations([{ role: 'bags', v: '5' }, { role: 'pan', v: '6x' }, { role: 'eq', v: '6x + 2 = 4' }, { role: 'predict', v: '5' }, { role: 'units', v: '9' }])).toEqual([]);
  });
});

describe('every round screen is clean (shownValues × forbidden), easier rounds and free choices included', () => {
  SETS.forEach((x) => {
    it(`${x.props.eq}${x.props.choices ? ' (free)' : ''}`, () => {
      expect(violations(P.shownValues(x.props), x.props.eq)).toEqual([]);
    });
  });
  it('the free choices one by one', () => {
    [...FREE1, ...FREE2].forEach((eq) => expect(violations(P.shownValues({ eq, chains: 'none' }), eq)).toEqual([]));
  });
});

describe('every round is played to its goal; ★★★ within maxTrials (both efficient paths)', () => {
  ALL.filter((r) => !r.free).forEach((r) => ['bags', 'units'].forEach((order) => {
    it(`${r.props.eq} (${order} first): won and ★★★`, () => {
      const { log, lines, reached } = play(r, { order });
      expect(reached.sort(), `${r.props.eq} chains reached`).toEqual(P.chainsOf(r.props.chains).map((sp) => sp.id).sort());
      expect(roundWon(r, log), r.id).toBe(true);
      expect(lines).toBeGreaterThanOrEqual(1);
      expect(countedTrials(log)).toBeLessThanOrEqual(r.stars.maxTrials);
      expect(starsFor(r, log)).toBe(3);
    });
  }));
  it('a wrong prediction costs the second star but never the win', () => {
    const r = M1_ROUNDS[1];
    const { log } = play(r, { preds: [false, true] });
    expect(roundWon(r, log)).toBe(true);
    expect(starsFor(r, log)).toBe(2);
  });
  it('the goal needs the discovery AND every question (no win card over an open question)', () => {
    ALL.filter((r) => !r.free).forEach((r) => {
      expect(r.goal, r.id).toContainEqual({ discovered: true });
      P.chainsOf(r.props.chains).forEach((sp) => expect(r.goal, `${r.props.eq} ${sp.id}`).toContainEqual({ checkpoint: sp.id }));
    });
    const r = M1_ROUNDS[0];
    let log = emptyLog();
    log = logEvent(log, 'trial', { tk: 'discovered' });
    expect(roundWon(r, log)).toBe(false);
  });
  it('« جرّب أصغر » opens after 3 refusals (first free), never on a repeated one', () => {
    const r = M1_ROUNDS[0];
    let log = emptyLog();
    log = logEvent(log, 'verdict', { groups: 0, exact: false, free: true });
    expect(countedTrials(log)).toBe(0);
    log = logEvent(log, 'verdict', { groups: 0, exact: false });
    expect(needsHelp(r, log)).toBe(false);
    log = logEvent(log, 'verdict', { groups: 0, exact: false });
    expect(needsHelp(r, log)).toBe(true);
  });
  it('the easier rounds are smaller and won by doing', () => {
    ALL.filter((r) => r.easier).forEach((r) => {
      const small = B.init(r.easier.props.eq);
      const big = B.init(r.props.eq);
      expect(Math.abs(B.toNumber(small.x))).toBeLessThanOrEqual(Math.abs(B.toNumber(big.x)) + 1);
      const plan = P.efficientPlan(r.easier.props.eq);
      expect(plan.steps.length + (plan.k > 1 ? 1 : 0)).toBeLessThanOrEqual(P.efficientPlan(r.props.eq).steps.length + 1);
      const { log } = play({ props: r.easier.props, goal: r.easier.goal, stars: r.easier.stars });
      expect(roundWon(r.easier, log), r.props.eq).toBe(true);
    });
  });
  it('the numbers: the climax shape is never played; no decoy equals the solution; bag counts differ from the bag content', () => {
    ALL.filter((r) => !r.free).forEach((r) => {
      const lab = B.init(r.props.eq);
      const sol = B.fracText(lab.x);
      const plan = P.efficientPlan(r.props.eq, 'bags');
      P.chainsOf(r.props.chains).forEach((sp) => {
        if (!sp.build) return;
        const stage = P.playPlan(r.props.eq, { steps: sp.build.when === 'first' ? plan.steps.slice(0, 1) : plan.steps, k: 1 }).lab;
        const b = P.lineBuild(stage, sp.build);
        expect(b.tiles.map(String).filter((t) => t === sol), r.props.eq).toEqual([]);
        expect(new Set(b.tiles).size, r.props.eq).toBe(3);
      });
      [lab.pans.L.a, lab.pans.R.a].filter((a) => a !== 0).forEach((a) => expect(Math.abs(a), `${r.props.eq} bags = content`).not.toBe(Math.abs(B.toNumber(lab.x))));
    });
  });
  it('predictions: ≤ 2 per round, right answers differ within a round, the right position varies', () => {
    const pos = [];
    Object.entries(PREDICT).forEach(([id, keys]) => {
      expect(keys.length).toBeLessThanOrEqual(2);
      const eq = { r2: EQ.r2, r3: EQ.r3, m2r1: EQ.m2r1, m2r2: EQ.m2r2 }[id];
      const truths = keys.map((key) => String(P.predictTruth(eq, key)));
      expect(new Set(truths).size).toBe(truths.length);
      keys.forEach((key) => pos.push(P.predictOptions(eq, key).findIndex((o) => o.says === String(P.predictTruth(eq, key)))));
    });
    expect(pos.every((i) => i >= 0)).toBe(true);
    expect(new Set(pos).size).toBeGreaterThanOrEqual(3);
  });
  it('the free rounds have no goal and every free choice is a real balance', () => {
    expect(M1_ROUNDS.at(-1).free && M2_ROUNDS.at(-1).free).toBe(true);
    [...FREE1, ...FREE2].forEach((eq) => expect(() => B.init(eq)).not.toThrow());
    expect(M1_ROUNDS.at(-1).props.choices).toEqual(FREE1);
    expect(M2_ROUNDS.at(-1).props.choices).toEqual(FREE2);
  });
});
