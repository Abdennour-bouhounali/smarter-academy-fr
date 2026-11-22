import { describe, it, expect } from 'vitest';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as L from './rampRatios';
import { LEVELS } from '../levels';

/**
 * ramp-ratios — نشاط 1 et نشاط 2 (p. 116) sur les rampes du skatepark : les niveaux de levels.js
 * (مبتدئ 30° / planche 4 ; متقدم 40°, planches 4, 6, 8), les refus de nommage et de composition, la hauteur qui ne
 * rattrape jamais la planche (balayée sur tout le domaine), l'invariance des rapports à angle fixe.
 */
const named = (s) => {
  let n = s;
  for (const side of L.SIDES) n = L.name(n, L.roleOfSide(n.at)[side], side);
  return n;
};
const composed = (s) => {
  let n = s;
  for (const k of L.KINDS) for (const sl of L.SLOTS) n = L.fill(n, k, sl, L.wantedSide(n.at, k, sl));
  return n;
};

describe('ramp-ratios — مبتدئ (name): the ramp of the skatepark', () => {
  const s0 = L.init(LEVELS['ramp-ratios'].beginner.numbers);

  it('starts on the platform ramp: 30°, board 4 m, ground 2√3 ≈ 3,46 m, rise 2 m', () => {
    expect(s0.b).toBe(30);
    const len = L.lengths(s0);
    expect(L.fmt(len.AB)).toBe('3,46');
    expect(L.fmt(len.AC)).toBe('2,00');
    expect(L.fmt(len.BC)).toBe('4,00');
    expect(s0.at).toBe(null);
  });

  it('A is the right angle: tapping it is refused, B and C choose the acute angle', () => {
    expect(L.pick(s0, 'A').last.kind).toBe('rightAngle');
    expect(L.pick(s0, 'A').at).toBe(null);
    expect(L.pick(s0, 'B').at).toBe('B');
    expect(L.pick(s0, 'C').at).toBe('C');
  });

  it('naming for B: the board is the hypotenuse; calling it « المقابل » is refused (and every other wrong label)', () => {
    const s = L.pick(s0, 'B');
    expect(L.canName(s, 'opposite', 'BC')).toBe('opposite_hypotenuse');
    expect(L.canName(s, 'adjacent', 'BC')).toBe('adjacent_hypotenuse');
    expect(L.canName(s, 'hypotenuse', 'AB')).toBe('hypotenuse_adjacent');
    expect(L.canName(s, 'opposite', 'AB')).toBe('opposite_adjacent');
    expect(L.canName(s, 'adjacent', 'AC')).toBe('adjacent_opposite');
    expect(L.canName(s, 'hypotenuse', 'BC')).toBe(true);
    expect(L.canName(s, 'opposite', 'AC')).toBe(true);
    expect(L.canName(s, 'adjacent', 'AB')).toBe(true);
    expect(L.namesDone(named(s))).toBe(true);
  });

  it('for C the two legs swap: AB becomes the opposite side, AC the adjacent one (same hypotenuse)', () => {
    const s = L.pick(s0, 'C');
    expect(L.roleOfSide('C')).toEqual({ BC: 'hypotenuse', AB: 'opposite', AC: 'adjacent' });
    expect(L.canName(s, 'opposite', 'AC')).toBe('opposite_adjacent');
    expect(L.canName(s, 'opposite', 'AB')).toBe(true);
  });

  it('composing needs the names; the hypotenuse on top of a sine is refused (> 1), an inverted tangent too', () => {
    const s = L.pick(s0, 'B');
    expect(L.canFill(s, 'cos', 'num', 'AB')).toBe('noNames');
    const n = named(s);
    expect(L.canFill(n, 'sin', 'num', 'BC')).toBe('hypOnTop');
    expect(L.wrongRatio(n, 'sin', 'num', 'BC').value).toBeGreaterThan(1);
    expect(L.canFill(n, 'cos', 'num', 'AC')).toBe('cosOpposite');
    expect(L.canFill(n, 'sin', 'num', 'AB')).toBe('sinAdjacent');
    expect(L.canFill(n, 'cos', 'den', 'AB')).toBe('legBelow');
    expect(L.canFill(n, 'tan', 'num', 'BC')).toBe('tanNoHyp');
    expect(L.canFill(n, 'tan', 'num', 'AB')).toBe('tanInverted');
    expect(L.canFill(n, 'tan', 'den', 'AC')).toBe('tanInverted');
    const c = composed(n);
    expect(c.compose.B).toEqual({ cos: { num: 'AB', den: 'BC' }, sin: { num: 'AC', den: 'BC' }, tan: { num: 'AC', den: 'AB' } });
    expect(L.composeDone(c)).toBe(true);
  });

  it('the readings at 30°: cos ≈ 0,87, sin = 0,5, tan ≈ 0,58 — and for Ĉ = 60° cos and sin swap', () => {
    expect(L.fmt(L.value(s0, 'cos', 'B'))).toBe('0,87');
    expect(L.fmt(L.value(s0, 'sin', 'B'))).toBe('0,50');
    expect(L.fmt(L.value(s0, 'tan', 'B'))).toBe('0,58');
    expect(L.fmt(L.value(s0, 'cos', 'C'))).toBe('0,50');
    expect(L.fmt(L.value(s0, 'tan', 'C'))).toBe('1,73');
  });

  it('نشاط 1 on the ramp: B̂ = 65° gives Ĉ = 25°, cos 25° ≈ 0,91; B̂ = 15° gives cos 75° ≈ 0,26', () => {
    const s = L.setB(s0, 65);
    expect(L.angleOf(s, 'C')).toBe(25);
    expect(L.fmt(L.value(s, 'cos', 'C'))).toBe('0,91');
    expect(L.fmt(L.value(L.setB(s0, 15), 'cos', 'C'))).toBe('0,26');
    // la valeur lue est celle des côtés : cos Ĉ = AC / BC
    const len = L.lengths(s);
    expect(L.fmt(len.AC / len.BC)).toBe('0,91');
  });

  it('the rise never catches the board: swept over the whole domain, 0 < sin < 1 and 0 < cos < 1', () => {
    for (let b = s0.range[0]; b <= s0.range[1]; b++) {
      const len = L.lengths(s0, b);
      expect(len.AC).toBeLessThan(len.BC);
      expect(len.AB).toBeLessThan(len.BC);
      for (const at of ['B', 'C']) {
        for (const k of ['sin', 'cos']) {
          const v = L.value(s0, k, at, b);
          expect(v).toBeGreaterThan(0);
          expect(v).toBeLessThan(1);
        }
        expect(L.value(s0, 'tan', at, b)).toBeGreaterThan(0);
      }
      // la valeur de la calculatrice EST le rapport des côtés
      expect(Math.abs(L.value(s0, 'sin', 'B', b) - len.AC / len.BC)).toBeLessThan(1e-12);
    }
    expect(L.commitB(s0, 99).last.kind).toBe('top');
  });

  it('a trial is a validated position after composing; the discovery needs 3 heights spanning 20°', () => {
    let s = composed(named(L.pick(s0, 'B')));
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commitB(s, 30);
    s = L.commitB(s, 30); // doublon : pas de second essai
    expect(s.trials).toHaveLength(1);
    s = L.commitB(s, 40);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commitB(s, 45);
    expect(L.discoveryReady(s)).toBe(false); // trois hauteurs, mais 15° seulement
    s = L.commitB(s, 62);
    expect(L.discoveryReady(s)).toBe(true);
    const w = L.witnesses(s);
    expect([w.low.b, w.high.b]).toEqual([30, 62]);
    expect(L.evidenceOf(s, s.trials[0])).toMatchObject({ mode: 'name', at: 'B', angle: 30, sin: '0,50' });
  });

  it('a position before composing moves the ramp but is not a trial', () => {
    const s = L.commitB(L.pick(s0, 'B'), 50);
    expect(s.b).toBe(50);
    expect(s.trials).toHaveLength(0);
  });

  it('the drawing: the box holds the steepest ramp and its ghosts, the rise handle reads the angle back', () => {
    const lay = L.layout(s0, { width: 320, maxHeight: 260 });
    expect(lay.H).toBeLessThanOrEqual(261);
    for (let b = s0.range[0]; b <= s0.range[1]; b++) {
      const v = L.vertices(s0, b);
      for (const p of Object.values(v)) {
        const [X, Y] = lay.px(p);
        expect(X).toBeGreaterThanOrEqual(0);
        expect(X).toBeLessThanOrEqual(lay.W);
        expect(Y).toBeGreaterThanOrEqual(0);
        expect(Y).toBeLessThanOrEqual(lay.H);
      }
      expect(L.bFromPoint(s0, v.C)).toBe(b);
    }
  });
});

describe('ramp-ratios — متقدم (scale): نشاط 2, B̂ = 40°, three ramps', () => {
  const s0 = L.init(LEVELS['ramp-ratios'].advanced.numbers);

  it('starts at 40° on a 5 m board (not a textbook ramp), the marks 4, 6, 8 orient', () => {
    expect(s0.b).toBe(40);
    expect(L.lenOf(s0)).toBe(5);
    expect(s0.marks).toEqual([4, 6, 8]);
  });

  it('the textbook readings: AC/BC ≈ 0,64 and AC/AB ≈ 0,84 for every board length at 40°', () => {
    for (let i = L.LEN_RANGE[0]; i <= L.LEN_RANGE[1]; i++) {
      const len = L.lengths(s0, 40, i);
      expect(L.fmt(len.AC / len.BC)).toBe('0,64');
      expect(L.fmt(len.AC / len.AB)).toBe('0,84');
    }
    expect(L.fmt(TR.sinDeg(40))).toBe('0,64');
    expect(L.fmt(TR.tanDeg(40))).toBe('0,84');
  });

  it('first ramp is read at once; the next ones wait for the student’s judgement, decided by the angle', () => {
    let s = L.setLen(s0, 8);
    s = L.record(s);
    expect(s.ramps).toHaveLength(1);
    expect(s.last.kind).toBe('first');
    expect(L.record(s).last.kind).toBe('dup');
    s = L.record(L.setLen(s, 12));
    expect(s.pending).toEqual({ b: 40, i: 12 });
    const wrong = L.claim(s, 'changed');
    expect(wrong.last).toMatchObject({ kind: 'claimWrong', truth: 'same' });
    s = L.claim(s, 'same');
    expect(s.last.kind).toBe('claimOk');
    expect(s.ramps[1]).toMatchObject({ b: 40, len: 6, ok: true });
    // tourner l'angle change les rapports
    s = L.record(L.setAngle(s, 55));
    expect(L.claim(s, 'same').last).toMatchObject({ kind: 'claimWrong', truth: 'changed' });
    s = L.claim(s, 'changed');
    expect(L.fmt(s.ramps[2].sin)).toBe('0,82');
    expect(L.discoveryReady(s)).toBe(false); // deux tailles seulement à 40°
    s = L.record(L.setLen(L.setAngle(s, 40), 16));
    s = L.claim(s, 'changed'); // comparée à la rampe de 55°
    expect(s.last.kind).toBe('claimOk');
    expect(L.discoveryReady(s)).toBe(true);
    const w = L.witnesses(s);
    expect([w.small.len, w.big.len, w.other.b]).toEqual([4, 8, 55]);
  });

  it('the drawing holds the biggest board at every angle; the handles read back length and angle', () => {
    const lay = L.layout(s0, { width: 360, maxHeight: 300 });
    for (let b = s0.range[0]; b <= s0.range[1]; b++) {
      for (let i = L.LEN_RANGE[0]; i <= L.LEN_RANGE[1]; i++) {
        const v = L.vertices(s0, b, i);
        const [X, Y] = lay.px(v.C);
        expect(X).toBeLessThanOrEqual(lay.W);
        expect(Y).toBeGreaterThanOrEqual(0);
        expect(L.iFromPoint({ ...s0, b }, v.C)).toBe(i);
        expect(L.angleFromPoint(s0, v.C)).toBe(b);
      }
    }
  });
});

describe('ramp-ratios — contenu', () => {
  it('refuses an unknown mode or an angle outside the domain', () => {
    expect(() => L.init({ mode: 'x' })).toThrow();
    expect(() => L.init({ angle: 80, hyp: 4, mode: 'name' })).toThrow();
    expect(() => L.init({ angle: 40, hyps: [11], mode: 'scale' })).toThrow();
  });
});

describe('ramp-ratios — جرّب كل الإمكانيات (مبتدئ, explore)', () => {
  const s0 = L.init(LEVELS['ramp-ratios'].beginner.numbers);

  it('opens on a ramp (not empty) without any recorded trial; nothing to sweep before the ratios are composed', () => {
    expect(s0.b).toBe(30);
    expect(s0.trials).toHaveLength(0);
    expect(L.tryAllPlan(s0)).toEqual([]);
    expect(L.tryAllPlan(L.pick(s0, 'B'))).toEqual([]);
  });

  it('every degree of the range becomes the same trial as the hand (commitB), with the discovery unlocked', () => {
    for (const at of ['B', 'C']) {
      const c = composed(named(L.pick(s0, at)));
      const plan = L.tryAllPlan(c);
      expect(plan).toHaveLength(c.range[1] - c.range[0] + 1);
      let cur = c;
      for (const b of plan) cur = L.commitB(cur, b);
      expect(L.tryAllPlan(cur)).toEqual([]);
      expect(cur.trials).toHaveLength(plan.length);
      expect(L.discoveryReady(cur)).toBe(true);
      expect(L.commitB(c, 40)).toEqual(L.commitB(c, 40));
      // un degré déjà essayé à la main n'est pas rejoué
      expect(L.tryAllPlan(L.commitB(c, 40))).not.toContain(40);
    }
  });

  it('scale (متقدم) is never swept: each ramp is a judgement', () => {
    const a = L.init(LEVELS['ramp-ratios'].advanced.numbers);
    expect(L.tryAllPlan(a)).toEqual([]);
    expect(a.ramps).toHaveLength(0);
  });
});
