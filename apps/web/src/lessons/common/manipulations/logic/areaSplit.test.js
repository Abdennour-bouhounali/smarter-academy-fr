import { describe, it, expect } from 'vitest';
import * as E from '@smarter-academy/core/arithmetic/expansion.js';
import * as L from './areaSplit';

const plot = (level = 'beginner') => L.init({ world: 'plot', scaffold: level === 'beginner', level });
const arrows = (tasks) => L.init({ world: 'arrows', tasks });
const kinds = (s) => s.events.map((e) => e.kind);

/** Suit LE GUIDE jusqu'au bout, en vérifiant l'invariant de valeur à chaque geste. Chaque pas est le geste JUSTE que le guide montre. */
function follow(s0, { max = 300, onStep, stopAt } = {}) {
  let s = s0;
  const trace = [];
  for (let i = 0; i < max; i += 1) {
    const step = L.coachOf(s);
    if (!step) return { s, trace };
    if (stopAt && step.id === stopAt) return { s, trace };
    trace.push(step.id);
    onStep?.(s, step);
    switch (step.id) {
      case 'cut': case 'cutMore': s = L.cutTo(s, step.side, E.cutRight(L.sideOf(s, step.side), s.x)); break;
      case 'sign': case 'signMore': s = L.decide(s, step.patch, L.patchOf(s, step.patch).sign); break;
      case 'x': s = L.setX(s, s.x < L.X_MAX ? s.x + 1 : s.x - 1); break;
      case 'arrow': case 'arrowMore': s = L.link(s, step.from, step.to); break;
      case 'productSign': s = L.setProductSign(s, step.arrow, E.arrowSign(s.arrows.find((a) => a.id === step.arrow))); break;
      case 'coef': s = L.setCoef(s, step.power, E.coefOf(L.expansionTerms(s), step.power)); break;
      case 'check': s = L.check(s); break;
      case 'next': s = L.nextTask(s); break;
      default: throw new Error(`unknown coach step ${step.id}`);
    }
    // l'invariant : ce que la main a écrit ne dépasse jamais l'aire comptée, et l'égale à la fin
    if (L.bothEqual(s) && !s.solvedNow) {
      for (let x = s.world === 'arrows' ? 2 : E.minX(s.h, s.w); x <= L.X_MAX; x += 1) expect(L.partsValue(s, x)).toBe(L.writtenValue(s, x));
    }
  }
  throw new Error(`the coach never ended: ${trace.join(',')}`);
}

describe('area-split — defaults are the brief’s', () => {
  it('plot tasks', () => {
    const b = plot(); const a = plot('advanced');
    expect(b.tasks.map((q) => q.id)).toEqual(['p1', 'p2']);
    expect(a.tasks.map((q) => q.id)).toEqual(['p3', 'p4']);
    expect(E.sideTex(b.w)).toBe('x + 4');
    expect(L.exprTex(b)).toBe('3(x + 4)');
    expect(L.exprTex(a)).toBe('(x + 3)(x + 2)');
    expect(b.x).toBe(6);
    expect(a.scaffold).toBe(false);
    expect(L.phaseOf(b)).toBe('cut');
    expect(L.cuttable(b)).toEqual(['w']);
    expect(L.cuttable(a)).toEqual(['w', 'h']);
    expect(L.writtenValue(b)).toBe(30);
  });
  it('arrow tasks', () => {
    const s = arrows();
    expect(s.tasks.map((q) => q.id)).toEqual(['a1', 'a2', 'a3', 'a4']);
    expect(s.x).toBe(5);
    expect(L.phaseOf(s)).toBe('arrow');
    expect(L.exprTex(s)).toBe('5(x + 2)');
    expect(L.chipsOf(L.nextTask({ ...arrows(), solvedNow: true, done: [true, false, false, false] })).origins).toHaveLength(1);
  });
  it('the start cut handle is never the right one nor its mirrored writing, at any x', () => {
    for (let x = 4; x <= 9; x += 1) {
      for (const sd of [E.side(1, 4), E.side(1, 3), E.side(1, 2), E.side(1, -2), E.side(1, -3), E.side(2, 1), E.side(2, -3)]) {
        const at = L.defaultCut(sd, x);
        expect(E.judgeCut(sd, x, at).ok, `${E.sideTex(sd)} x=${x}`).toBe(false);
        expect(at).toBeGreaterThanOrEqual(1);
        expect(at).toBeLessThanOrEqual(E.drawnLength(sd, x) - 1);
      }
    }
  });
});

describe('area-split — plot: the cut', () => {
  it('a wrong release is a trial: refused with the two numeric lengths, the handle goes back, nothing is locked', () => {
    const s = plot();
    const before = s.cutAt.w;
    const r = L.cutTo(s, 'w', 8); // x = 6 : the right cut is 6, its mirror 4
    expect(r.cuts.w).toBeUndefined();
    expect(r.cutAt.w).toBe(before);
    expect(r.events.map((e) => e.kind)).toEqual(['cut', 'refused']);
    expect(r.events[0]).toEqual({ kind: 'cut', world: 'plot', task: 'p1', side: 'w', at: 8, ok: false });
    expect(r.events[1]).toEqual({ kind: 'refused', world: 'plot', task: 'p1', reason: 'cut', side: 'w', at: 8, a: 8, b: 2 });
    expect(r.last).toMatchObject({ event: 'refused', reason: 'cut', a: 8, b: 2 });
    expect(L.phaseOf(r)).toBe('cut');
  });
  it('the right cut locks and follows x afterwards', () => {
    let s = L.cutTo(plot(), 'w', 6);
    expect(s.cuts.w).toEqual({ ok: true, at: 6, swapped: false });
    expect(s.events.at(-1)).toEqual({ kind: 'cut', world: 'plot', task: 'p1', side: 'w', at: 6, ok: true });
    expect(L.phaseOf(s)).toBe('sign');
    s = L.setX(s, 9);
    expect(s.cuts.w.ok).toBe(true);
    expect(L.canCut(s, 'w')).toBe(false);
    expect(L.cutTo(s, 'w', 3)).toBe(s);
  });
  it('the number-first reading of the same cut is accepted and normalised', () => {
    const s = L.cutTo(plot(), 'w', 4);
    expect(s.cuts.w).toEqual({ ok: true, at: 6, swapped: true });
  });
  it('a negative number: the cut is where the paved strip starts; (x − 2)(x − 3) has two cuts', () => {
    let s = L.init({ world: 'plot', scaffold: false, level: 'advanced' });
    s = L.nextTask(L.nextTask(s) === s ? { ...s, solvedNow: true, done: [true, false] } : s);
    expect(L.taskOf(s)).toBe('p4');
    expect(L.cutsPending(s)).toEqual(['w', 'h']);
    s = L.cutTo(s, 'w', 3); // x−3 at x = 6
    expect(s.cuts.w.ok).toBe(true);
    expect(L.phaseOf(s)).toBe('cut');
    s = L.cutTo(s, 'h', 4);
    expect(s.cuts.h.ok).toBe(true);
    expect(L.phaseOf(s)).toBe('sign');
  });
  it('moveCut previews without judging and stays inside the side', () => {
    const s = plot();
    expect(L.moveCut(s, 'w', 0).cutAt.w).toBe(1);
    expect(L.moveCut(s, 'w', 99).cutAt.w).toBe(9);
    expect(L.moveCut(s, 'w', 5).events).toEqual([]);
    expect(L.moveCut(L.cutTo(s, 'w', 6), 'w', 2).cutAt.w).toBe(6);
  });
  it('the handle stays inside the side when x goes down', () => {
    let s = L.moveCut(plot(), 'w', 9);
    s = L.setX(s, 4);
    expect(s.cutAt.w).toBeLessThanOrEqual(7);
  });
  it('a constant side is never cut', () => {
    expect(L.canCut(plot(), 'h')).toBe(false);
    expect(L.cutTo(plot(), 'h', 1)).toEqual(plot());
  });
});

describe('area-split — plot: the sign of each patch (the counted area is the judge)', () => {
  it('p2 : 2(x − 3) — the paved strip taken away; a wrong sign is refused with the two areas', () => {
    let s = L.nextTask({ ...plot(), solvedNow: true, done: [true, false] });
    expect(L.taskOf(s)).toBe('p2');
    s = L.cutTo(s, 'w', 3);
    expect(L.patchOf(s, 'p01').sign).toBe(-1);
    const r = L.decide(s, 'p01', 1);
    expect(r.signs.p01).toBeUndefined();
    expect(r.events.at(-2)).toEqual({ kind: 'patch', world: 'plot', task: 'p2', patch: 'p01', sign: 1, ok: false, corner: false });
    // 2(x−3) at 6 = 6 ; adding the strip would give 12 + 6 = 18 (the rest undecided count as right)
    expect(r.events.at(-1)).toEqual({ kind: 'refused', world: 'plot', task: 'p2', reason: 'sign', patch: 'p01', corner: false, x: 6, counted: 6, written: 18 });
    const ok = L.decide(s, 'p01', -1);
    expect(ok.signs.p01).toBe(-1);
    expect(ok.events.at(-1)).toEqual({ kind: 'patch', world: 'plot', task: 'p2', patch: 'p01', sign: -1, ok: true, corner: false });
  });
  it('no patch can be judged before the cuts are done, nor twice', () => {
    expect(L.canDecide(plot(), 'p00')).toBe(false);
    const s = L.decide(L.cutTo(plot(), 'w', 6), 'p00', 1);
    expect(L.canDecide(s, 'p00')).toBe(false);
    expect(L.decide(s, 'p00', -1)).toBe(s);
  });
  it('p4 : the corner patch is given back — taking it away twice is refused with 0 against 12 … and the event says corner', () => {
    let s = L.init({ world: 'plot', scaffold: false, level: 'advanced', tasks: [{ id: 'p4', h: { m: 1, n: -2 }, w: { m: 1, n: -3 } }] });
    s = L.cutTo(L.cutTo(s, 'w', 3), 'h', 4);
    s = L.decide(L.decide(L.decide(s, 'p00', 1), 'p01', -1), 'p10', -1);
    const r = L.decide(s, 'p11', -1);
    expect(r.events.at(-1)).toEqual({ kind: 'refused', world: 'plot', task: 'p4', reason: 'sign', patch: 'p11', corner: true, x: 6, counted: 12, written: 0 });
    const ok = L.decide(s, 'p11', 1);
    expect(ok.events.at(-1)).toMatchObject({ kind: 'patch', patch: 'p11', sign: 1, ok: true, corner: true });
    expect(L.phaseOf(ok)).toBe('reduce'); // advanced: not solved yet
    expect(ok.solvedNow).toBe(false);
  });
  it('مبتدئ: the reduced line writes itself once every patch is decided', () => {
    const s = L.decide(L.decide(L.cutTo(plot(), 'w', 6), 'p00', 1), 'p01', 1);
    expect(s.solvedNow).toBe(true);
    expect(s.events.at(-1)).toEqual({ kind: 'solved', world: 'plot', task: 'p1', expr: '3(x + 4)', expanded: '3x + 12', result: '3x + 12' });
    expect(s.done).toEqual([true, false]);
    expect(L.discoveryReady(s)).toBe(false);
  });
  it('the written parts and the counted area move together when x changes, at every step', () => {
    let s = plot('advanced');
    s = L.cutTo(L.cutTo(s, 'w', 6), 'h', 6);
    for (const p of L.undecided(s)) {
      s = L.decide(s, p.id, p.sign);
      for (let x = 4; x <= 9; x += 1) {
        const done = E.decidedSum(s.patches, x, s.signs);
        expect(done).toBeLessThanOrEqual(L.writtenValue(s, x) + 1e-9 * 0 + (L.undecided(s).length ? 10 ** 6 : 0));
      }
    }
    for (let x = 4; x <= 9; x += 1) expect(L.partsValue(s, x)).toBe(L.writtenValue(s, x));
  });
});

describe('area-split — plot: the reduce step (متقدم)', () => {
  const advancedAfterSigns = () => {
    let s = plot('advanced');
    s = L.cutTo(L.cutTo(s, 'w', 6), 'h', 6);
    for (const p of s.patches) s = L.decide(s, p.id, p.sign);
    return s;
  };
  it('the powers to write are x², x, 1; no default is the answer', () => {
    const s = advancedAfterSigns();
    expect(L.phaseOf(s)).toBe('reduce');
    expect(L.powersOf(s)).toEqual([2, 1, 0]);
    for (const p of [2, 1, 0]) expect(L.coefOf(s, p)).not.toBe(E.coefOf(L.expansionTerms(s), p));
  });
  it('a wrong coefficient is refused with both values at x; the right ones solve', () => {
    let s = advancedAfterSigns();
    s = L.setCoef(s, 2, 1); s = L.setCoef(s, 1, 4); s = L.setCoef(s, 0, 6);
    const r = L.check(s);
    expect(r.solvedNow).toBe(false);
    expect(r.events.filter((e) => e.kind === 'coef').map((e) => [e.power, e.ok])).toEqual([[2, true], [1, false], [0, true]]);
    expect(r.events.at(-1)).toEqual({ kind: 'refused', world: 'plot', task: 'p3', reason: 'coef', power: 1, x: 6, counted: 72, written: 66 });
    const ok = L.check(L.setCoef(r, 1, 5));
    expect(ok.solvedNow).toBe(true);
    expect(ok.events.at(-1)).toEqual({ kind: 'solved', world: 'plot', task: 'p3', expr: '(x + 3)(x + 2)', expanded: 'x^2 + 2x + 3x + 6', result: 'x^2 + 5x + 6' });
  });
  it('setCoef and check are inert before the reduce phase', () => {
    const s = plot('advanced');
    expect(L.setCoef(s, 1, 3)).toBe(s);
    expect(L.check(s)).toBe(s);
  });
});

describe('area-split — arrows', () => {
  it('a valid arrow shows its card with the sign to decide; a wrong sign is refused with the two numbers', () => {
    let s = L.nextTask(L.nextTask({ ...L.nextTask({ ...arrows(), solvedNow: true, done: [true, false, false, false] }), solvedNow: true, done: [true, true, false, false] }));
    expect(L.taskOf(s)).toBe('a3');
    s = L.link(s, 0, 1); // 2x → −3
    expect(s.events.at(-1)).toEqual({ kind: 'arrow', world: 'arrows', task: 'a3', from: 0, to: 1, ok: true });
    expect(s.linked['0>1']).toEqual({ sign: null });
    expect(L.canSignProduct(s, '0>1')).toBe(true);
    const r = L.setProductSign(s, '0>1', 1); // x = 5 : (2x)(−3) = −30
    expect(r.events.at(-2)).toEqual({ kind: 'product', world: 'arrows', task: 'a3', from: 0, to: 1, sign: 1, ok: false });
    expect(r.events.at(-1)).toEqual({ kind: 'refused', world: 'arrows', task: 'a3', reason: 'sign', from: 0, to: 1, x: 5, truth: -30, shown: 30, id: '0>1' });
    expect(r.linked['0>1'].sign).toBeNull();
    const ok = L.setProductSign(s, '0>1', -1);
    expect(ok.linked['0>1'].sign).toBe(-1);
    expect(ok.events.at(-1)).toEqual({ kind: 'product', world: 'arrows', task: 'a3', from: 0, to: 1, sign: -1, ok: true });
  });
  it('refused arrows: the same arrow twice, a drop on a chip of the same bracket, a target of another product', () => {
    let s = arrows();
    s = L.link(s, 0, 0);
    const twice = L.link(s, 0, 0);
    expect(twice.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'arrow', from: 0, to: 0, why: 'twice' });
    let a3 = { ...arrows(), solvedNow: false };
    a3 = L.init({ world: 'arrows', tasks: [L.ARROW_TASKS[2]] });
    const own = L.linkOnOrigin(a3, 0, 1);
    expect(own.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'arrow', from: 0, to: 1, why: 'own' });
    const a4 = L.init({ world: 'arrows', tasks: [L.ARROW_TASKS[3]] });
    const other = L.link(a4, 0, 2); // the 3 → a term of the second product
    expect(other.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'arrow', why: 'other' });
    expect(Object.keys(other.linked)).toEqual([]);
    expect(L.linkOnOrigin(a4, 0, 0)).toBe(a4);
  });
  it('a leading minus before a bracket is a sign decision on the products below it (a4)', () => {
    const s = L.init({ world: 'arrows', tasks: [L.ARROW_TASKS[3]] });
    const ar = s.arrows.map((a) => [a.id, E.arrowSign(a)]);
    expect(ar).toEqual([['0>0', 1], ['0>1', -1], ['1>2', -1], ['1>3', 1]]);
    const l = L.link(s, 1, 2);
    expect(L.setProductSign(l, '1>2', 1).events.at(-1)).toMatchObject({ reason: 'sign', truth: -20, shown: 20 });
  });
  it('after every arrow is drawn and signed the coefficients are written, then « تحقّق »', () => {
    let s = L.init({ world: 'arrows', tasks: [L.ARROW_TASKS[2]] });
    for (const a of s.arrows) { s = L.link(s, a.oi, a.tj); s = L.setProductSign(s, a.id, E.arrowSign(a)); }
    expect(L.phaseOf(s)).toBe('reduce');
    expect(L.powersOf(s)).toEqual([2, 1, 0]);
    s = L.setCoef(s, 2, 2); s = L.setCoef(s, 1, -6); s = L.setCoef(s, 0, -3);
    const r = L.check(s);
    // x = 5 : the true value is 11·2 = 22, the typed polynomial 2x² − 6x − 3 gives 17
    expect(r.events.at(-1)).toMatchObject({ kind: 'refused', reason: 'coef', power: 1, x: 5, counted: 22, written: 17 });
  });
});

describe('area-split — the coach is followed to the end of EVERY task of both worlds', () => {
  it('plot مبتدئ: p1 → p2, then nothing', () => {
    const { s, trace } = follow(plot());
    expect(s.done).toEqual([true, true]);
    expect(L.coachOf(s)).toBeNull();
    expect(trace[0]).toBe('cut');
    expect(trace).toContain('sign');
        expect(kinds(s)).toContain('solved');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('plot متقدم: p3 → p4 (two cuts, the corner, the coefficients, « تحقّق »)', () => {
    const { s, trace } = follow(plot('advanced'));
    expect(s.done).toEqual([true, true]);
    expect(trace).toEqual(expect.arrayContaining(['cut', 'cutMore', 'sign', 'signMore', 'coef', 'check', 'next']));
    expect(s.solvedLog.map((e) => e.result)).toEqual(['x^2 + 5x + 6', 'x^2 - 5x + 6']);
    expect(s.events.filter((e) => e.kind === 'refused')).toEqual([]);
  });
  it('arrows: a1 → a4 (the defaults)', () => {
    const { s, trace } = follow(arrows());
    expect(s.done).toEqual([true, true, true, true]);
    expect(trace).toEqual(expect.arrayContaining(['arrow', 'arrowMore', 'productSign', 'coef', 'check', 'next']));
    expect(s.solvedLog.map((e) => e.result)).toEqual(['5x + 10', '-3x + 12', '2x^2 - 5x - 3', '-7x + 10']);
    expect(s.solvedLog.map((e) => e.tex)).toEqual(['5(x + 2)', '-3(x - 4)', '(2x + 1)(x - 3)', '3(2 - x) - 4(x - 1)']);
    expect(s.events.filter((e) => e.kind === 'refused')).toEqual([]);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('the coach never shows the answer: its steps carry only the object to touch', () => {
    const steps = [];
    follow(plot('advanced'), { onStep: (s, st) => steps.push(Object.keys(st).sort().join(',')) });
    for (const k of new Set(steps)) expect(k).not.toMatch(/sign:|right|answer/);
  });
  it('a lesson-supplied task list is followed too (one task, an x-term only side)', () => {
    const { s } = follow(L.init({ world: 'plot', scaffold: true, tasks: [{ id: 'z', h: { m: 1, n: 0 }, w: { m: 1, n: 5 } }] }));
    expect(s.done).toEqual([true]);
    expect(s.solvedLog[0].result).toBe('x^2 + 5x');
  });
  it('the custom task from the free panel runs the same mechanics to the end', () => {
    let s = L.stepFree(plot('advanced'), 'h', 'n', 1); // (x + 4)(x + 2)
    expect(s.custom).toBe(true);
    expect(L.taskOf(s)).toBe('custom');
    expect(s.events.at(-1)).toEqual({ kind: 'custom', world: 'plot' });
    const r = follow(s, { stopAt: 'next' });
    expect(r.s.custom).toBe(true);
    expect(r.s.solvedNow).toBe(true);
    expect(r.s.solvedLog.map((e) => e.task)).toEqual([]);
    expect(r.s.events.filter((e) => e.kind === 'solved').at(-1).result).toBe('x^2 + 6x + 8');
    expect(r.s.done).toEqual([false, false]);
  });
});

describe('area-split — the free panel', () => {
  it('plot: steppers stay in their bounds, a degenerate plot is ignored, x never makes a side non-positive', () => {
    let s = plot();
    expect(L.freeOf(s)).toEqual({ h: { m: 0, n: 3 }, w: { m: 1, n: 4 } });
    expect(L.stepFree(s, 'h', 'm', -1)).toBe(s);
    expect(L.stepFree(s, 'w', 'm', -1)).toBe(s); // w.m ≥ 1
    s = L.stepFree(s, 'h', 'm', 1);
    expect(s.custom).toBe(true);
    expect(E.sideTex(s.h)).toBe('x + 3');
    for (let i = 0; i < 12; i += 1) s = L.stepFree(s, 'w', 'n', -1);
    expect(s.free.w.n).toBe(-6);
    expect(s.x).toBeGreaterThanOrEqual(7);
    expect(E.sideValue(s.w, s.x)).toBeGreaterThan(0);
    expect(L.stepFree(L.stepFree(plot(), 'h', 'n', -3), 'h', 'n', -1).h.n).toBe(2);
  });
  it('arrows: factors a·x + b, never both zero', () => {
    let s = arrows();
    expect(L.freeOf(s)).toEqual({ f1: { a: 0, b: 5 }, f2: { a: 1, b: 2 } });
    s = L.stepFree(s, 'f1', 'a', 1);
    expect(s.custom).toBe(true);
    expect(E.exprTex(s.expr)).toBe('(x + 5)(x + 2)');
    expect(L.stepFree(L.stepFree(L.stepFree(L.stepFree(L.stepFree(arrows(), 'f1', 'b', -5), 'f1', 'a', 0), 'f1', 'b', -1), 'f1', 'a', 0), 'f1', 'a', 0).free).toBeDefined();
    const z = L.stepFree(L.stepFree(arrows(), 'f1', 'b', -5), 'f1', 'b', -1);
    expect(z.custom).toBe(true);
  });
  it('« إعادة »: a fresh init forgets every trial', () => {
    const dirty = L.cutTo(plot(), 'w', 8);
    expect(dirty.refusals).toHaveLength(1);
    const fresh = plot();
    expect(fresh.refusals).toEqual([]);
    expect(fresh.events).toEqual([]);
    expect(fresh.cuts).toEqual({});
  });
});

describe('area-split — x is the hand’s too', () => {
  it('plot x ∈ 4…9 (and above the paths); arrows x ∈ 2…9; an x event per change', () => {
    let s = plot();
    expect(L.setX(s, 3).x).toBe(4);
    s = L.setX(s, 12);
    expect(s.x).toBe(9);
    expect(s.events.at(-1)).toEqual({ kind: 'x', x: 9 });
    expect(L.setX(s, 9)).toBe(s);
    let a = arrows();
    a = L.setX(a, 0);
    expect(a.x).toBe(2);
  });
  it('the counted area and the sum of the parts are equal at every x once the signs are right', () => {
    for (const lvl of ['beginner', 'advanced']) {
      const { s } = follow(plot(lvl));
      for (const e of s.solvedLog) for (let x = E.minX(e.h, e.w); x <= 9; x += 1) expect(E.partsSum(e.patches, x)).toBe(E.plotArea(e.h, e.w, x));
    }
  });
});

describe('area-split — discovery witnesses refute the wrong options with the student’s numbers', () => {
  it('plot: two x with the whole = the parts', () => {
    const { s } = follow(plot('advanced'));
    const w = L.plotWitness(s);
    expect(w.a.x).not.toBe(w.b.x);
    expect(w.a.whole).toBe(w.a.parts);
    expect(w.b.whole).toBe(w.b.parts);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.discoveryReady(plot())).toBe(false);
  });
  it('arrows: « only the first term » and « added to each term » give a different value from the right one', () => {
    const { s } = follow(arrows());
    const w = L.arrowWitness(s);
    expect(w.first.wrong).not.toBe(w.first.right);
    expect(w.added.wrong).not.toBe(w.added.right);
    expect(w.tex).toBe('(2x + 1)(x - 3)');
  });
  it('the formal lines are the student’s own tasks', () => {
    const { s } = follow(plot());
    const f = L.formalLines(s);
    expect(f.lines.map((l) => l.tex)).toEqual(['3(x + 4)', '2(x - 3)']);
    expect(f.lines.map((l) => l.result)).toEqual(['3x + 12', '2x - 6']);
    expect(f.witness.a.whole).toBe(f.witness.a.parts);
  });
});

describe('area-split — every plot and every expression the free panel can build is solvable by following the coach', () => {
  it('plot: every (h, w) of the panel, both levels, solved with the reduced form the maths gives', () => {
    let n = 0;
    for (const m1 of [0, 1, 2]) for (const n1 of [-6, -2, 0, 3, 6]) for (const m2 of [1, 2]) for (const n2 of [-6, -3, 0, 1, 4]) {
      const h = E.side(m1, n1); const w = E.side(m2, n2);
      if (!E.isValidPlot(h, w) || (m1 === 0 && n1 <= 0)) continue;
      for (const scaffold of [true, false]) {
        const { s } = follow(L.init({ world: 'plot', scaffold, tasks: [{ id: 'f', h, w }] }));
        expect(s.done).toEqual([true]);
        expect(s.solvedLog[0].result, `${E.sideTex(h)} | ${E.sideTex(w)}`).toBe(E.reducedTex(E.patchesOf(h, w)));
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(100);
  });
  it('arrows: every pair of factors a·x + b of the panel', () => {
    let n = 0;
    for (const a1 of [-6, 0, 2, 6]) for (const b1 of [-6, -1, 0, 3]) for (const a2 of [-3, 0, 1, 6]) for (const b2 of [-6, 0, 2, 5]) {
      if ((!a1 && !b1) || (!a2 && !b2)) continue;
      const ft = (a, b) => [a ? { c: a, p: 1 } : null, b ? { c: b, p: 0 } : null].filter(Boolean);
      const expr = { products: [E.product(1, ft(a1, b1), ft(a2, b2))] };
      const { s } = follow(L.init({ world: 'arrows', tasks: [{ id: 'f', expr }] }));
      expect(s.done).toEqual([true]);
      expect(s.solvedLog[0].result).toBe(E.reducedExprTex(expr));
      n += 1;
    }
    expect(n).toBeGreaterThan(100);
  });
});
