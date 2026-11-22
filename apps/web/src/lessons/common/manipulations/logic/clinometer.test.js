import { describe, it, expect } from 'vitest';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as L from './clinometer';
import { LEVELS } from '../levels';

/**
 * clinometer — la logique du clinomètre sur les nombres du manuel : le تحدّ (1,60 m, 59° → 1,9 m), la وضعية
 * « مقام الشهيد » (poteau 2,30 m à 95,65 m, observateur à 2,45 m → H ≈ 92,09 m, x ≈ 43°) et le projecteur du
 * stade (24 m) — chaque essai refusé, chaque rapport refusé avec le côté qu'il demanderait.
 */
const beginner = LEVELS.clinometer.beginner.numbers;
const advanced = LEVELS.clinometer.advanced.numbers;
const ALIGN = { mode: 'align', pole: 2.3, poleAt: 95.65, total: 98.1 };

describe('clinometer — the plan comes from trigonometry.lengthPlan', () => {
  it('height: adjacent known, opposite wanted → tan, ×; ladder: opposite known, hypotenuse wanted → sin, ÷; align: tan', () => {
    expect(L.planFor('height')).toMatchObject({ ratio: 'tan', op: 'mul' });
    expect(L.planFor('ladder')).toMatchObject({ ratio: 'sin', op: 'div' });
    expect(L.planFor('align')).toMatchObject({ ratio: 'tan', op: 'inv' });
  });
  it('a wrong ratio names the side it would need', () => {
    expect(L.ratioVerdict('height', 'sin')).toMatchObject({ ok: false, needs: 'hypotenuse', lacks: 'adjacent' });
    expect(L.ratioVerdict('height', 'cos')).toMatchObject({ ok: false, needs: 'hypotenuse', lacks: 'opposite' });
    expect(L.ratioVerdict('ladder', 'cos')).toMatchObject({ ok: false, needs: 'adjacent', lacks: 'opposite' });
    expect(L.ratioVerdict('ladder', 'tan')).toMatchObject({ ok: false, needs: 'adjacent', lacks: 'hypotenuse' });
    expect(L.ratioVerdict('align', 'sin')).toMatchObject({ ok: false, needs: 'hypotenuse' });
    expect(L.ratioVerdict('align', 'cos')).toMatchObject({ ok: false, needs: 'hypotenuse' });
  });
});

describe('clinometer — height (the stadium floodlight, 24 m)', () => {
  it('the shutter refuses a wrong aim and writes the gap', () => {
    let s = L.init(beginner);
    s = L.moveTo(s, 10);
    s = L.tiltTo(s, 60);
    s = L.shoot(s);
    expect(s.trials.at(-1).kind).toBe('miss');
    expect(s.last.gap).toBeGreaterThan(7); // atan(2,4) ≈ 67,38° : le sommet est 7,4° au-dessus du réticule
    expect(L.readAngle(s)).toBe(67);
    expect(L.evidenceOf(s)).toMatchObject({ stage: 'miss', above: true, gap: '7,4' });
  });

  it('aim, choose tan and ×, then every distance gives ≈ 24 m (the rounded angle makes it wobble)', () => {
    let s = L.init(beginner);
    s = L.moveTo(s, 10);
    s = L.tiltTo(s, L.readAngle(s));
    expect(L.aimed(s)).toBe(true);
    s = L.shoot(s);
    expect(L.planOpen(s)).toBe(true);
    s = L.chooseRatio(s, 'sin');
    expect(s.last.kind).toBe('refuseRatio');
    expect(s.ratio).toBe(null);
    s = L.chooseRatio(s, 'tan');
    s = L.chooseOp(s, 'div');
    expect(s.last.kind).toBe('refuseOp');
    expect(L.r1(s.last.value)).toBe('4,2'); // 10 ÷ tan 67° ≈ 4,24 m : le rayon ne passe pas si bas
    s = L.chooseOp(s, 'mul');
    expect(L.r1(L.measures(s).at(-1).h)).toBe('23,6'); // 10 × tan 67°
    expect(L.discoveryReady(s)).toBe(false);
    // une seconde mesure : le plan reste, il suffit de viser
    s = L.moveTo(s, 30);
    s = L.tiltTo(s, L.readAngle(s));
    expect(L.readAngle(s)).toBe(39);
    s = L.shoot(s);
    expect(L.r1(L.measures(s).at(-1).h)).toBe('24,3'); // 30 × tan 39°
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('swept: from every distance of the ruler the computed height stays within 0,5 m of 24 m', () => {
    const s = L.init(beginner);
    for (let i = s.iMin; i <= s.iMax; i += 1) {
      const h = L.heightAt(s, i, L.readAngle(s, i));
      expect(Math.abs(h - 24)).toBeLessThan(0.5);
      // et la visée n'est juste qu'à UN degré
      expect(L.aimed(s, i, L.readAngle(s, i) + 1)).toBe(false);
    }
  });
});

describe('clinometer — ladder (the تحدّ: 1,60 m, 59°)', () => {
  it('the ladder starts as long as the mark (1,6 m) and does not reach it', () => {
    const s = L.init(advanced);
    expect(L.dec(L.valueAt(s))).toBe('1,6');
    expect(L.topKind(s)).toBe('below');
    expect(L.r2(L.topAt(s))).toBe('1,37');
  });

  it('the hand brackets L between 1,8 and 1,9, then sin and ÷ give L ≈ 1,9 m', () => {
    let s = L.init(advanced);
    s = L.moveTo(s, 18);
    expect(s.trials.at(-1).kind).toBe('below');
    expect(L.planOpen(s)).toBe(false);
    s = L.moveTo(s, 19);
    expect(s.trials.at(-1).kind).toBe('above');
    expect(L.bracket(s)).toMatchObject({ lo: 18, hi: 19 });
    expect(L.planOpen(s)).toBe(true);
    s = L.chooseRatio(s, 'cos');
    expect(s.last).toMatchObject({ kind: 'refuseRatio', needs: 'adjacent' });
    s = L.chooseRatio(s, 'sin');
    s = L.chooseOp(s, 'mul');
    expect(L.r2(s.last.value)).toBe('1,37'); // 1,6 × sin 59° : plus court que le mur
    s = L.chooseOp(s, 'div');
    expect(L.result(s)).toMatchObject({ L10: '1,9', L100: '1,87' });
    expect(TR.roundTo(1.6 / TR.sinDeg(59), 1)).toBe('1,9');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ stage: 'result', L: '1,9' });
  });

  it('swept: no tenth of a metre puts the top exactly on 1,60 m — below up to 1,8, above from 1,9', () => {
    const s = L.init(advanced);
    for (let i = s.iMin; i <= s.iMax; i += 1) expect(L.topKind(s, i)).toBe(i <= 18 ? 'below' : 'above');
  });
});

describe('clinometer — align (the synthesis: مقام الشهيد, textbook numbers)', () => {
  it('H by Thalès is 92,09 m and the alignment place is 2,45 m behind the pole', () => {
    const s = L.init(ALIGN);
    expect(L.dec(s.dStar)).toBe('2,45');
    expect(TR.roundTo(Number(s.H.n) / Number(s.H.d), 2)).toBe('92,09');
    expect(L.dec(L.valueAt(s, s.iStar))).toBe('2,45');
    expect(L.alignKind(s, s.iStar)).toBe('aligned');
    expect(L.alignKind(s, s.iStar - 1)).toBe('over');
    expect(L.alignKind(s, s.iStar + 1)).toBe('under');
    // the first screen is never aligned
    expect(L.alignKind(s)).not.toBe('aligned');
  });

  it('a miss, then the alignment, then tan (sin refused) → x ≈ 43°', () => {
    let s = L.init(ALIGN);
    s = L.moveTo(s, s.iStar + 6);
    expect(s.trials.at(-1).kind).toBe('under');
    s = L.moveTo(s, s.iStar);
    expect(L.planOpen(s)).toBe(true);
    s = L.chooseRatio(s, 'sin');
    expect(s.last).toMatchObject({ kind: 'refuseRatio', needs: 'hypotenuse' });
    s = L.chooseRatio(s, 'tan');
    expect(L.result(s)).toMatchObject({ x: '43', H100: '92,09', H1: '92' });
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ stage: 'angle', x: '43', H: '92,09' });
  });

  it('with `height` instead of `total`, the nearest graduation aligns (a 265 m minaret, pole 2 m at 120 m)', () => {
    const s = L.init({ mode: 'align', pole: 2, poleAt: 120, height: 265 });
    expect(L.alignKind(s, s.iStar)).toBe('aligned');
    expect(L.alignKind(s, s.iStar + 1)).toBe('under');
    // the poles' angles agree within the graduation
    expect(Math.abs(L.poleAngle(s, s.iStar) - L.monumentAngle(s, s.iStar))).toBeLessThan(0.1);
  });

  it('the scenes fit the width given, at five widths', () => {
    for (const w of [260, 320, 390, 700, 1100]) {
      for (const n of [beginner, advanced, ALIGN]) {
        const s = L.init(n);
        const g = L.layout(s, { width: w, height: 260 });
        expect(g.width).toBeLessThanOrEqual(w);
        expect(g.X(0)).toBeGreaterThan(0);
      }
      const z = L.zoomLayout(L.init(ALIGN), { width: w, height: 120 });
      expect(z.width).toBeLessThanOrEqual(Math.max(w, 0));
    }
  });
});

describe('clinometer — default start and جرّب كل الإمكانيات', () => {
  const SETS = [beginner, advanced, ALIGN, { mode: 'align', pole: 2.3, poleAt: 95.65, height: 92 }, { mode: 'height', height: 12, eye: 1.5, minDistance: 4, maxDistance: 30 }];
  const run = (s) => { let c = s; for (let g = 0; g < 2000 && L.tryAllPlan(c).length; g += 1) c = L.tryAllApply(c, L.tryAllPlan(c)[0]); return c; };

  it('the opening state is never an answer and never a recorded trial', () => {
    for (const n of SETS) {
      const s = L.init(n);
      expect(s.trials).toHaveLength(0);
      expect(s.refusals).toHaveLength(0);
      if (s.mode === 'height') expect(L.aimed(s)).toBe(false);
      if (s.mode === 'ladder') expect(L.topKind(s)).not.toBe('exact');
      if (s.mode === 'align') expect(L.alignKind(s)).not.toBe('aligned');
    }
  });

  it('height has no sweep (the hand is an aim, not a list)', () => {
    expect(L.tryAllPlan(L.init(beginner))).toEqual([]);
  });

  it('ladder: every length is tried, the bracket appears, the plan opens, nothing is chosen for the student', () => {
    const s0 = L.init(advanced);
    const end = run(s0);
    expect(end.trials.map((t) => t.i).sort((a, b) => a - b)).toEqual(Array.from({ length: s0.iMax - s0.iMin + 1 }, (_, k) => s0.iMin + k));
    expect(L.bracket(end)).toEqual({ lo: 18, hi: 19 });
    expect(L.planOpen(end)).toBe(true);
    expect(end.ratio).toBeNull();
    expect(L.tryAllApply(s0, 12)).toEqual(L.moveTo(s0, 12));
  });

  it('align: every place is tried, the observer ends on the alignment without a duplicate, the plan opens', () => {
    for (const n of [ALIGN, SETS[3]]) {
      const s0 = L.init(n);
      const end = run(s0);
      expect(new Set(end.trials.map((t) => t.i)).size).toBe(s0.iMax - s0.iMin + 1);
      expect(end.trials).toHaveLength(s0.iMax - s0.iMin + 1);
      expect(end.i).toBe(s0.iStar);
      expect(L.planOpen(end)).toBe(true);
      expect(end.ratio).toBeNull();
    }
    // la bonne place déjà essayée à la main : on y revient sans nouvel essai
    const s0 = L.init(ALIGN);
    const hand = L.moveTo(L.moveTo(s0, s0.iStar), s0.iMin);
    const end = run(hand);
    expect(end.trials.filter((t) => t.i === s0.iStar)).toHaveLength(1);
    expect(end.i).toBe(s0.iStar);
    expect(L.planOpen(end)).toBe(true);
  });
});
