import { describe, it, expect } from 'vitest';
import * as T from '@smarter-academy/core/arithmetic/trigonometry.js';
import * as L from './angleCompass';

/**
 * angle-compass — la logique sur les nombres du manuel : sin x = 2/5 (طرائق ص 121 : OA = 2, cercle de rayon 5,
 * B ≈ 23,6°), tan x = 7/3 (MN = 7, NP = 3, P ≈ 66,8°), cos x = 3/4 (دوري الآن 2 : ≈ 41,4°), et la plateforme
 * sin x = 3/5 (le triangle 3-4-5, cos = 4/5 lu, 9/25 + 16/25 = 1).
 */
const build = (s, steps) => steps.reduce((acc, [fn, ...args]) => L[fn](acc, ...args), s);
const compass = (target, { leg = 'v', a, r }) => build(L.init({ targets: [target] }), [['placeSquare'], ['setLeg', leg, a], ['setOpening', r], ['sweep']]);
const ruler = (target, { h, v }) => build(L.init({ targets: [target] }), [['placeSquare'], ['setLeg', 'v', v], ['setLeg', 'h', h], ['join']]);

describe('angle-compass — logique', () => {
  it('nothing is carried before the set square is placed', () => {
    const s = L.setLeg(L.init(), 'v', 3);
    expect(s.legs.v).toBe(null);
    expect(s.last.kind).toBe('noSquare');
    expect(L.stepOf(s)).toBe('square');
  });

  it('beginner sin 3/5: height 3, string 5 → the arc cuts the sand at exactly 4', () => {
    const s = compass({ ratio: 'sin', value: '3/5' }, { a: 3, r: 5 });
    expect(s.closed).toBe(true);
    expect(s.last.kind).toBe('cut');
    const Ls = L.lengths(s);
    expect(T.surdText(Ls.h)).toBe('4');
    expect(L.stepOf(s)).toBe('pick');
    const t = L.pick(s, 'h');
    expect(t.last.trial.kind).toBe('ok');
    const r = t.last.trial.ratios;
    expect(L.tex(r.cos)).toBe('\\dfrac{4}{5}');
    expect(L.tex(r.tan)).toBe('\\dfrac{3}{4}');
    const sq = L.squaresOf(r);
    expect(sq.one).toBe(true);
    expect([sq.c2, sq.s2].map((f) => `${f.n}/${f.d}`)).toEqual(['16/25', '9/25']);
  });

  it('the kite instead of the child: the other acute angle (its sine is cos x) is refused as « vertex »', () => {
    const s = L.pick(compass({ ratio: 'sin', value: '3/5' }, { a: 3, r: 5 }), 'v');
    expect(s.last.trial.kind).toBe('vertex');
    expect(L.tex(s.last.trial.ratios.sin)).toBe('\\dfrac{4}{5}');
  });

  it('textbook sin 2/5: OA = 2, radius 5 → √21 on the other side, angle ≈ 23,6°, protractor 24°', () => {
    const s = L.pick(compass({ ratio: 'sin', value: '2/5' }, { a: 2, r: 5 }), 'h');
    const tr = s.last.trial;
    expect(tr.kind).toBe('ok');
    expect(T.surdText(tr.lengths.h)).toBe('√21');
    const ev = L.evidenceOf(tr);
    expect(ev.deg).toBe('23,6');
    expect(ev.protractor).toBe('24');
    expect(ev.cos).toBe('√21/5');
  });

  it('RESISTANCE: a string no longer than the height never reaches the sand (short / touch)', () => {
    const short = compass({ ratio: 'sin', value: '2/5' }, { a: 5, r: 2 });
    expect(short.closed).toBe(false);
    expect(short.last.kind).toBe('short');
    const touch = compass({ ratio: 'sin', value: '2/5' }, { a: 4, r: 4 });
    expect(touch.last.kind).toBe('touch');
    expect(L.cutAngle(touch)).toBe(null);
  });

  it('the pencil is lowered by the hand from 90° and cuts only when it reaches the other side (r cos θ = a)', () => {
    let s = build(L.init({ targets: [{ ratio: 'sin', value: '2/5' }] }), [['placeSquare'], ['setLeg', 'v', 2], ['setOpening', 5]]);
    const star = L.cutAngle(s);
    expect(star).toBeCloseTo((Math.acos(2 / 5) * 180) / Math.PI, 9);
    expect(s.swing).toBe(90);
    s = L.setSwing(s, star + 5);
    expect(s.closed).toBe(false);
    s = L.setSwing(s, star - 0.2);
    expect(s.closed).toBe(true);
  });

  it('RESISTANCE: sin 2/5 with 2 and 5 on the two legs is a TANGENT (≈ 21,8°), refused as « legs »', () => {
    const s = L.pick(ruler({ ratio: 'sin', value: '2/5' }, { v: 2, h: 5 }), 'h');
    const tr = s.last.trial;
    expect(tr.kind).toBe('legs');
    expect(L.tex(tr.ratios.tan)).toBe('\\dfrac{2}{5}');
    expect(T.roundTo(tr.deg, 1)).toBe('21,8');
    expect(T.roundTo(tr.targetDeg, 1)).toBe('23,6');
  });

  it('textbook tan 7/3: 7 on the vertical, 3 on the sand, the angle at the child ≈ 66,8° (protractor 67°)', () => {
    const s = L.pick(ruler({ ratio: 'tan', value: '7/3' }, { v: 7, h: 3 }), 'h');
    expect(s.last.trial.kind).toBe('ok');
    expect(L.evidenceOf(s.last.trial).deg).toBe('66,8');
    expect(L.evidenceOf(s.last.trial).protractor).toBe('67');
    expect(L.squaresOf(s.last.trial.ratios).one).toBe(true);
  });

  it('tan built with the compass is refused as « hypTan »', () => {
    const s = L.pick(compass({ ratio: 'tan', value: '3/5' }, { a: 3, r: 5 }), 'h');
    expect(s.last.trial.kind).toBe('hypTan');
  });

  it('دوري الآن 2 — cos 3/4: 3 on the sand, the compass at the child with radius 4: x at the child ≈ 41,4°', () => {
    const s = L.pick(compass({ ratio: 'cos', value: '3/4' }, { leg: 'h', a: 3, r: 4 }), 'h');
    expect(s.last.trial.kind).toBe('ok');
    expect(T.surdText(s.last.trial.lengths.v)).toBe('√7');
    expect(L.evidenceOf(s.last.trial).deg).toBe('41,4');
  });

  it('the compass mode refuses a second carried leg; the ruler mode refuses the compass', () => {
    let s = build(L.init(), [['placeSquare'], ['setLeg', 'v', 3], ['setOpening', 5]]);
    expect(L.setLeg(s, 'h', 4).last.kind).toBe('compassMode');
    s = build(L.init(), [['placeSquare'], ['setLeg', 'v', 3], ['setLeg', 'h', 4]]);
    expect(L.setOpening(s, 5).last.kind).toBe('rulerMode');
    expect(L.stepOf(s)).toBe('join');
  });

  it('invariant swept: every closed triangle of the lab satisfies cos² + sin² = 1 at both acute angles', () => {
    for (let a = 1; a <= L.MAX_LEG; a++) {
      for (let r = a + 1; r <= L.MAX_OPEN; r++) {
        const s = compass({ ratio: 'sin', value: '1/2' }, { a, r });
        for (const v of L.LEGS) expect(L.squaresOf(L.ratiosAt(L.lengths(s), v)).one).toBe(true);
      }
      for (let b = 1; b <= L.MAX_LEG; b++) {
        const s = ruler({ ratio: 'tan', value: '1' }, { v: a, h: b });
        for (const v of L.LEGS) {
          const r = L.ratiosAt(L.lengths(s), v);
          expect(L.squaresOf(r).one).toBe(true);
          expect(T.surdEq(T.surdDiv(r.sin, r.cos), r.tan)).toBe(true);
        }
      }
    }
  });

  it('discovery needs every target AND a contrast (a refusal, or the same angle at another scale)', () => {
    let s = compass({ ratio: 'sin', value: '3/5' }, { a: 3, r: 5 });
    s = L.pick(s, 'h');
    expect(L.discoveryReady(s)).toBe(false);
    s = build(L.fresh(s), [['placeSquare'], ['setLeg', 'v', 6], ['setOpening', 10], ['sweep'], ['pick', 'h']]);
    expect(s.trials.map((t) => t.scale)).toEqual([1, 2]);
    expect(L.discoveryReady(s)).toBe(true);
    const w = L.pick(L.pick(compass({ ratio: 'sin', value: '3/5' }, { a: 3, r: 5 }), 'v'), 'h');
    expect(L.discoveryReady(w)).toBe(true);
  });

  it('advanced: two targets, the next one opened by the student after the first is reached', () => {
    let s = L.init({ targets: [{ ratio: 'sin', value: '2/5' }, { ratio: 'tan', value: '7/3' }] });
    expect(L.canNext(s)).toBe(false);
    s = build(s, [['placeSquare'], ['setLeg', 'v', 2], ['setOpening', 5], ['sweep'], ['pick', 'h']]);
    expect(L.canNext(s)).toBe(true);
    s = L.next(s);
    expect(L.currentTarget(s).ratio).toBe('tan');
    expect(s.square).toBe(false);
    s = build(s, [['placeSquare'], ['setLeg', 'v', 7], ['setLeg', 'h', 3], ['join'], ['pick', 'v'], ['pick', 'h']]);
    expect(s.trials.map((t) => t.kind)).toEqual(['ok', 'vertex', 'ok']);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('re-picking the same vertex of the same triangle is not a second trial', () => {
    const s = L.pick(L.pick(compass({ ratio: 'sin', value: '3/5' }, { a: 3, r: 5 }), 'h'), 'h');
    expect(s.trials).toHaveLength(1);
  });
});
