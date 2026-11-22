import { describe, it, expect } from 'vitest';
import * as L from '../../../../../../common/manipulations/logic/storyModeller.js';
import * as P from '../../../../../../common/manipulations/logic/storyModellerPlayer.js';
import { emptyLog, logEvent, roundWon, starsFor, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';
import { M1_ROUNDS, M2_ROUNDS, R1, R1_EASY, R2, R2_EASY, STAR, BALLS, GROCER, P1, P1_EASY, FRACTION, M1_FREE, M2_FREE } from './stories.js';
import { violations } from './forbidden.js';

/**
 * Les manches de mushkilat-jumla (verdict §4 « THE NUMBERS », L3.4–L3.14). Les nombres sont RECALCULÉS (jamais recopiés) ; chaque manche est
 * JOUÉE par la logique jusqu'à ★★★ dans `maxTrials` ; tout ce qu'un écran peut montrer (`shownValues`) est balayé contre la signature de la مسألة.
 */
const modelOf = (p) => L.parseModel({ system: p.system, unknowns: p.unknowns, facts: p.facts, chips: p.chips });
const sol = (p) => { const m = modelOf(p); return [L.fracText(m.sol.x), L.fracText(m.sol.y)]; };
const ALL = [...M1_ROUNDS, ...M2_ROUNDS].flatMap((r) => [{ id: r.id, round: r, props: r.props }, ...(r.easier ? [{ id: `${r.id}-easy`, round: r.easier, props: easierProps(r) }] : [])]);

describe('the stories: numbers of the verdict, recomputed', () => {
  it('each story has the solution the verdict states', () => {
    expect(sol(R1)).toEqual(['4', '8']);
    expect(sol(R1_EASY)).toEqual(['1', '5']);
    expect(sol(R2)).toEqual(['90', '50']);
    expect(sol(R2_EASY)).toEqual(['45', '20']);
    expect(sol(STAR)).toEqual(['12', '14']);
    expect(sol(BALLS)).toEqual(['9', '7']);
    expect(sol(GROCER)).toEqual(['130', '85']);
    expect(sol(P1)).toEqual(['18', '-3']);
    expect(sol(P1_EASY)).toEqual(['7', '-1']);
    expect(sol(FRACTION)).toEqual(['29/4', '11/4']);
  });

  it('the friendly lines: r1 50x = 200 (substitution), r2 3x = 270 (addition), p1 400x = 7200', () => {
    const lines = (p, m) => L.solvePlan(modelOf(p).target, ['x', 'y'], m).lines.map((l) => l.tex);
    expect(lines(R1, 'sub')).toContain('50x = 200');
    expect(lines(R2, 'add')).toContain('3x = 270');
    expect(lines(P1, 'sub')).toContain('400x = 7200');
  });

  it('every number of a story is a chip (the silent « 8 أيام » included), and the silent chip is in no equation', () => {
    [R1, R1_EASY, R2, R2_EASY, STAR, BALLS, GROCER, P1, P1_EASY, FRACTION].forEach((p) => {
      const chips = p.chips.map((c) => c.value);
      (p.story.match(/\d+/g) ?? []).forEach((n) => expect(chips, `${p.system} story ${n}`).toContain(n));
    });
    const m = modelOf(R2);
    const useless = P.uselessKeys(R2.chips);
    expect(useless).toEqual(['c3']);
    m.target.forEach((e) => ['a', 'b', 'c'].forEach((s) => expect(L.toNumber(e[s])).not.toBe(8)));
  });

  it('the swapped replay: r1 keeps 12 pencils but pays 640 دج; r2 fails both facts; p1 the facts hold, the story refuses y = −3', () => {
    const m1 = modelOf(R1);
    const sw = L.replayStory(m1, { x: 'y', y: 'x' }, { x: m1.sol.x, y: m1.sol.y });
    expect(sw.facts.map((f) => f.ok)).toEqual([true, false]);
    expect(L.fracText(sw.facts[1].lhs)).toBe('640');
    const m2 = modelOf(R2);
    expect(L.replayStory(m2, { x: 'y', y: 'x' }, { x: m2.sol.x, y: m2.sol.y }).facts.map((f) => f.ok)).toEqual([false, false]);
    const mp = modelOf(P1);
    const r = L.replayStory(mp, { x: 'x', y: 'y' }, { x: mp.sol.x, y: mp.sol.y });
    expect(r.facts.every((f) => f.ok)).toBe(true);
    expect(r.natural.bad).toEqual(['y']);
    // « لو كانت كلّها من الأغلى » : 15 × 1100 = 16500 < 17700
    expect(15 * 1100).toBeLessThan(17700);
  });

  it('the easier rounds are smaller than their round (head count and money)', () => {
    const tot = (p) => modelOf(p).target.map((e) => L.toNumber(e.c));
    [[R1, R1_EASY], [R2, R2_EASY], [P1, P1_EASY]].forEach(([a, b]) => tot(b).forEach((v, i) => expect(v).toBeLessThan(tot(a)[i])));
  });

  it('the check build (r1): four distinct tiles, the decoy is the head count used as the money', () => {
    [R1, R1_EASY].forEach((p) => {
      const m = modelOf(p);
      const b = P.checkBuild(m, { x: m.sol.x, y: m.sol.y });
      expect(b.distinct).toBe(true);
      expect(b.decoy).toBe(L.numberText(m.target[0].c));
    });
    expect(P.checkBuild(modelOf(R1), { x: modelOf(R1).sol.x, y: modelOf(R1).sol.y }).expected).toEqual(['4', '8', '440']);
  });

  it('the predictions: one per round at most, truth computed, the right option at a different place in r2 and p1', () => {
    const m2 = modelOf(R2); const mp = modelOf(P1);
    expect(P.predictTruth(m2, 'dearer')).toBe('x');
    expect(P.predictTruth(mp, 'which')).toBe('y');
    const pos = (m, key, p) => P.predictOptions(m, key, p).indexOf(P.predictTruth(m, key));
    const [pr2] = R2 && M1_ROUNDS[1].props.predict; const [pp1] = M2_ROUNDS[0].props.predict;
    expect(pos(m2, pr2.key, pr2.pos)).not.toBe(pos(mp, pp1.key, pp1.pos));
    ALL.forEach(({ props }) => expect((props.predict ?? []).length).toBeLessThanOrEqual(1));
  });

  it('every question a round asks is in its goal, and every checkpoint of a goal is asked', () => {
    ALL.forEach(({ id, round, props }) => {
      const ids = P.chainsOf(props.chains).specs.map((s) => s.id);
      const goalCps = (round.goal ?? []).filter((c) => c.checkpoint).map((c) => c.checkpoint);
      expect([...ids].sort(), id).toEqual([...goalCps].sort());
    });
  });

  it('the free rounds offer the lesson\'s stories (and the fractional one only in module 2)', () => {
    expect(M1_FREE.map((c) => c.id)).toEqual(['r1', 'r2', 'star', 'balls', 'grocer']);
    expect(M2_FREE.map((c) => c.id)).toEqual(['p1', 'fraction', 'r2']);
  });
});

describe('the role scan: no screen of a round shows the climax', () => {
  it('every round, easier round and free choice is clean', () => {
    ALL.forEach(({ id, props }) => expect(violations(P.shownValues(props), id), id).toEqual([]));
  });
  it('negative control: the climax\'s own museum is caught (count, money, 150x, solution, price, structure)', () => {
    const museum = {
      system: 'x+y=180|250x+100y=33000', named: true, people: true,
      unknowns: [{ id: 'x', noun: 'عدد البالغين' }, { id: 'y', noun: 'عدد الصغار' }],
      facts: [{ quote: '180 زائرًا', kind: 'count' }, { quote: '33000 دج', kind: 'money' }],
      chips: [{ value: '180' }, { value: '250' }, { value: '100' }, { value: '33000' }],
      story: 'استقبل المتحف 180 زائرًا والمداخيل 33000 دج',
    };
    const bad = violations(P.shownValues(museum), 'museum').join('\n');
    ['180 (story)', '33000 (chip)', '« 150x »', '100 (solution)', '250 (price)', '150 (priceDiff)', 'tickets (structure)', '30000 (check)'].forEach((w) => expect(bad).toContain(w));
  });
});

/* ── jouer une manche jusqu'à son but avec la logique seule ── */
function play(round, props, method = 'sub') {
  const model = modelOf(props);
  const mode = props.chains;
  let lab = P.playerInit(model, { named: props.named, onesPlaced: props.onesPlaced });
  let log = emptyLog();
  const done = [];
  (props.predict ?? []).forEach(() => { log = logEvent(log, 'trial', { tk: 'predict', ok: true }); });
  if (lab.stage === 'name') { model.ids.forEach((id) => { lab = L.name(lab, id, id); }); lab = L.openModel(lab); }
  const T = L.targetSlots(model, lab.naming);
  [1, 2].forEach((r) => ['a', 'b', 'c'].forEach((s) => { lab = L.fill(lab, T[r][s], L.slotId(r, s)); }));
  lab = P.checkPlayerModel(lab, model, P.uselessKeys(props.chips));
  log = logEvent(log, 'trial', { tk: 'model', ok: lab.verdict.ok, key: P.modelKey(lab) });
  lab = L.openSolve(lab);
  lab = L.chooseMethod(lab, method);
  const plan = L.solvePlan(L.studentSystem(lab, model), model.ids, method);
  const ask = () => {
    let sp;
    // eslint-disable-next-line no-cond-assign
    while ((sp = P.pendingSpec(mode, lab, { plan }, done))) { done.push(sp.id); log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: sp.id }); }
  };
  for (let guard = 0; guard < 20 && !L.solved(lab, plan); guard += 1) {
    ask();
    if (lab.revealed === plan.halfAt + 1 && lab.half !== 'more') lab = L.claimHalf(lab, 'more');
    lab = L.reveal(lab, plan);
  }
  lab = L.openVerify(lab, plan);
  model.ids.forEach((id) => { lab = L.gate(lab, lab.naming[id], L.gateId(id)); });
  lab = L.replay(lab, model, plan.values);
  log = logEvent(log, 'verdict', { groups: 0, exact: P.trialExact(lab.replay) });
  ask();
  if (lab.replay.ok) {
    lab = L.openAnswer(lab);
    ask();
    lab = L.chooseAnswer(lab, props.answer.correct, props.answer.correct);
    ask();
  }
  if (P.discovered(lab)) log = logEvent(log, 'trial', { tk: 'discovered' });
  return { lab, log, won: roundWon(round, log), stars: starsFor(round, log) };
}

describe('every round is played to its goal with three stars, by both methods', () => {
  ALL.filter(({ round }) => !round.free).forEach(({ id, round, props }) => {
    ['sub', 'add'].forEach((m) => it(`${id} (${m})`, () => {
      const r = play(round, props, m);
      expect(r.won, `${id} won`).toBe(true);
      expect(r.stars, `${id} stars`).toBe(3);
    }));
  });
  it('p1 never opens the answer: the story refuses, the round is won on the refusal', () => {
    const r = play(M2_ROUNDS[0], M2_ROUNDS[0].props);
    expect(P.refused(r.lab)).toBe(true);
    expect(r.lab.stage).toBe('verify');
  });
  it('r1 asks the typed line before 50x = 200 is solved', () => {
    const model = modelOf(R1);
    const plan = L.solvePlan(model.target, ['x', 'y'], 'sub');
    expect(plan.lines[plan.halfAt - 1].tex).toBe('50x = 200');
    expect(L.fracText(plan.first.value)).toBe('4');
  });
});
