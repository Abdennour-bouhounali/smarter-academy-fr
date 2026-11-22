import { describe, it, expect } from 'vitest';
import * as L from './storyModeller.js';
import * as P from './storyModellerPlayer.js';

/** La logique pure du lecteur de story-modeller (rollout 2026-11-12, unité 5 leçon 3) : départ, raisons, essais, moments, prédictions, guide. */
const COUNT = {
  system: 'x+y=12|70x+20y=440', unknowns: [{ id: 'x' }, { id: 'y' }],
  facts: [{ kind: 'count' }, { kind: 'money' }], chips: [{ value: '12' }, { value: '70' }, { value: '20' }, { value: '440' }],
};
const SHIRTS = { system: 'x+y=15|1100x+700y=17700', unknowns: [{ id: 'x' }, { id: 'y' }], facts: [{ kind: 'count' }, { kind: 'money' }], chips: [{ value: '15' }, { value: '1100' }, { value: '700' }, { value: '17700' }] };
const MONEY = { system: '2x+y=230|x+2y=190', unknowns: [{ id: 'x' }, { id: 'y' }], facts: [{ kind: 'money' }, { kind: 'money' }], chips: [{ value: '2' }, { value: '230' }, { value: '190' }, { value: '8', useless: true }] };
const fillAll = (lab, model) => { const T = L.targetSlots(model, lab.naming); let l = lab; [1, 2].forEach((r) => ['a', 'b', 'c'].forEach((s) => { l = L.fill(l, T[r][s], L.slotId(r, s)); })); return l; };

describe('storyModellerPlayer — the start and the translation', () => {
  it('onesPlaced puts the two « 1 » in the counting row only; a money+money story has none', () => {
    const m = L.parseModel(COUNT);
    const lab = P.playerInit(m, { named: true, onesPlaced: true });
    expect(lab.slots[1]).toEqual({ a: L.ONE, b: L.ONE, c: null });
    expect(lab.slots[2]).toEqual({ a: null, b: null, c: null });
    expect(P.playerInit(L.parseModel(MONEY), { named: true, onesPlaced: true }).slots[1].a).toBeNull();
  });
  it('the retry of the translation puts the « 1 » back', () => {
    const m = L.parseModel(COUNT);
    let lab = fillAll(P.playerInit(m, { named: true, onesPlaced: true }), m);
    lab = P.retryPlayerStage(lab, m, { onesPlaced: true });
    expect(lab.slots[1].a).toBe(L.ONE);
    expect(lab.slots[1].c).toBeNull();
  });
  it('the same translation checked twice has the same key; another one another key', () => {
    const m = L.parseModel(COUNT);
    const lab = fillAll(P.playerInit(m, { named: true }), m);
    expect(P.modelKey(lab)).toBe(P.modelKey({ ...lab }));
    expect(P.modelKey(L.fill(lab, 'c0', L.slotId(2, 'c')))).not.toBe(P.modelKey(lab));
  });
  it('a silent chip makes the reason « unused », before the page\'s reasons', () => {
    const m = L.parseModel(MONEY);
    const lab = L.fill(fillAll(P.playerInit(m, { named: true }), m), 'c3', L.slotId(2, 'a'));
    const v = P.checkPlayerModel(lab, m, P.uselessKeys(MONEY.chips));
    expect(v.verdict.rows[1]).toMatchObject({ ok: false, reason: 'unused', chip: 'c3' });
    expect(v.refusals).toBe(1);
  });
});

describe('storyModellerPlayer — trials, the refusal, the moments', () => {
  const solveTo = (p, method = 'sub') => {
    const m = L.parseModel(p);
    let lab = L.openSolve(L.checkModel(fillAll(P.playerInit(m, { named: true }), m), m));
    lab = L.chooseMethod(lab, method);
    const plan = L.solvePlan(L.studentSystem(lab, m), m.ids, method);
    return { m, lab, plan };
  };
  it('typed is the moment when the line of the first unknown is the next one', () => {
    let { lab, plan } = solveTo(COUNT);
    while (lab.revealed < plan.halfAt) { expect(P.MOMENTS.typed(lab, { plan })).toBe(false); lab = L.reveal(lab, plan); }
    expect(P.MOMENTS.typed(lab, { plan })).toBe(true);
    expect(P.pendingSpec('first', lab, { plan }, [])?.id).toBe('solveTyped');
    expect(P.pendingSpec('first', lab, { plan }, ['solveTyped'])).toBeNull();
    expect(P.typesFirst('first')).toBe(true);
    expect(P.typesFirst('none')).toBe(false);
  });
  it('a replay: the trial key follows the gates; exact = the two facts hold; p1 refuses with the right gates, swapped gates are not exact', () => {
    let { m, lab, plan } = solveTo(SHIRTS);
    while (!L.solved(lab, plan)) { if (lab.revealed === plan.halfAt + 1) lab = L.claimHalf(lab, 'more'); lab = L.reveal(lab, plan); }
    lab = L.openVerify(lab, plan);
    const right = L.replay(L.gate(L.gate(lab, 'x', 'gate:x'), 'y', 'gate:y'), m, plan.values);
    const swapped = L.replay(L.gate(L.gate(lab, 'y', 'gate:x'), 'x', 'gate:y'), m, plan.values);
    expect(P.trialKey(right)).not.toBe(P.trialKey(swapped));
    // the same gates with other values (a new translation) are another trial
    expect(P.trialKey(right, plan.values)).not.toBe(P.trialKey(right, { x: plan.values.y, y: plan.values.x }));
    expect(P.trialExact(right.replay)).toBe(true);
    expect(P.refused(right)).toBe(true);
    expect(P.discovered(right)).toBe(true);
    expect(P.trialExact(swapped.replay)).toBe(false);
    expect(P.refused(swapped)).toBe(false);
    expect(P.naturalChoice(right).right).toBe('y');
    expect(P.chainsOf('impossible').specs.map((s) => s.id)).toEqual(['naturalTap', 'refuseTap', 'ruleNatural']);
  });
  it('checkBuild: the money fact with the story values, four distinct tiles, the decoy is the head count', () => {
    const m = L.parseModel(COUNT);
    const b = P.checkBuild(m, { x: m.sol.x, y: m.sol.y });
    expect(b).toMatchObject({ a: '70', b: '20', expected: ['4', '8', '440'], decoy: '12', distinct: true });
    expect(P.checkBuild(L.parseModel(MONEY), { x: 1, y: 1 })).toBeNull();
  });
});

describe('storyModellerPlayer — predictions and the guide', () => {
  it('dearer: the notebook (90 > 50), judged when solved; which: the short sleeves (y = −3), judged at the right replay', () => {
    expect(P.predictTruth(L.parseModel(MONEY), 'dearer')).toBe('x');
    expect(P.predictTruth(L.parseModel(SHIRTS), 'which')).toBe('y');
    expect(P.predictTruth(L.parseModel(COUNT), 'which')).toBe('both');
    expect(P.predictOptions(L.parseModel(MONEY), 'dearer', 1)).toEqual(['y', 'same', 'x']);
  });
  it('the guide never points at a chip, a slot or an option that is right: only groups and buttons', () => {
    const m = L.parseModel(COUNT);
    const lab = P.playerInit(m, {});
    expect(P.coachOf(lab)).toMatchObject({ id: 'letter', target: '[data-coach="letters"]' });
    const named = L.openModel(L.name(L.name(lab, 'x', 'x'), 'y', 'y'));
    expect(P.coachOf(named).target).toBe('[data-coach="chips"]');
    expect(P.coachOf(fillAll(named, m)).id).toBe('check');
    expect(P.coachOf(named, { blocking: true })).toBeNull();
  });
  it('shownValues lists the story, the chips, both methods and both namings, the swapped replay', () => {
    const shown = P.shownValues({ ...COUNT, story: 'اشترى 12 قلمًا ودفع 440 دج' });
    const vals = (role) => shown.filter((s) => s.role === role).map((s) => s.v);
    expect(vals('story')).toEqual(['12', '440']);
    expect(vals('check')).toContain('640');
    expect(vals('line')).toContain('50x=200');
    expect(vals('line')).toContain('-50x=-400');
    expect(vals('priceDiff')).toEqual(['50']);
  });
});
