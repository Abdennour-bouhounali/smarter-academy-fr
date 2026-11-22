import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './shadowStick';

const txt = LIN.fracText;

/**
 * shadow-stick — le تحدّ (p. 103) : bâton de 1 m, ombres qui finissent ensemble à 11,6 m du pied de la minaret
 * quand le bâton est à 10 m ⇒ h = 7,25 m ; et le niveau مبتدئ de levels.js (bâton à 4 m, ombres à 5 m ⇒ 5 m).
 */
describe('shadow-stick — the stick, the sun and the minaret', () => {
  it('the تحدّ numbers: h = 29/4 (7,25 m), the stick shadow is 1,6 m wherever it stands', () => {
    const s = L.init({ stick: 1, stickAt: 10, tip: 11.6 });
    expect(txt(s.h)).toBe('29/4');
    expect(L.dec(s.h)).toBe('7,25');
    expect(L.dec(s.shadow)).toBe('1,6');
    expect(txt(s.step)).toBe('1/5');
    expect([s.iMin, s.iStar, s.iMax]).toEqual([5, 50, 58]);
    // la perche : ℓ ÷ 4 = 0,4 m, du bâton (j = 4) au pied de la minaret (j = 29)
    expect(L.dec(s.poleStep)).toBe('0,4');
    expect([s.jMin, s.jA]).toEqual([4, 29]);
    // l'ombre du bâton a la même longueur à 3 m et à 10 m
    for (const i of [15, 50, 58]) expect(txt(LIN.sub(L.stickTipAt(s, i), L.stickAtIndex(s, i)))).toBe('8/5');
  });

  it('the start never gives the answer, and only 10 m makes the shadows end together', () => {
    const s = L.init({ stick: 1, stickAt: 10, tip: 11.6 });
    expect(L.meets(s)).toBe(false);
    const meeting = [];
    for (let i = s.iMin; i <= s.iMax; i += 1) if (L.meets(s, i)) meeting.push(L.dec(L.stickAtIndex(s, i)));
    expect(meeting).toEqual(['10']);
  });

  it('a stick placed too near ends its shadow before O, too far after; the trial says which', () => {
    let s = L.init({ stick: 1, stickAt: 10, tip: 11.6 });
    s = L.placeStick(s, 40); // 8 m → ombre jusqu'à 9,6 m
    expect(s.trials.at(-1)).toMatchObject({ kind: 'before' });
    expect(L.dec(s.trials.at(-1).tipAt)).toBe('9,6');
    s = L.placeStick(s, 55); // 11 m → 12,6 m
    expect(s.trials.at(-1).kind).toBe('after');
    expect(L.dec(L.tipGap(s))).toBe('1');
    s = L.placeStick(s, 50);
    expect(s.trials.at(-1).kind).toBe('meet');
    // la même place deux fois n'est qu'un essai
    expect(L.placeStick(s, 50).trials).toHaveLength(3);
  });

  it('the pole is refused while the shadows do not end together; its top always rides the ray', () => {
    let s = L.init({ stick: 1, stickAt: 10, tip: 11.6 });
    s = L.placePole(s, 10);
    expect(s.last.kind).toBe('poleFirst');
    expect(s.j).toBeNull();
    s = L.placeStick(s, 50);
    expect(L.poleIndex(s)).toBe(4);
    // la perche à la place du bâton EST le bâton
    expect(L.dec(L.poleAt(s, 4).height)).toBe('1');
    // tout le long : hauteur ÷ distance à O = 1 ÷ 1,6 (Thalès de sommet O)
    for (let j = s.jMin; j <= s.jA; j += 1) {
      const p = L.poleAt(s, j);
      expect(LIN.eq(LIN.div(p.height, p.dist), LIN.div(s.stick, s.shadow))).toBe(true);
    }
    s = L.placePole(s, 15); // 6 m de O → 3,75 m
    expect(L.dec(s.poleTrials.at(-1).height)).toBe('3,75');
    s = L.placePole(s, 29);
    const atA = s.poleTrials.at(-1);
    expect(atA.atMinaret).toBe(true);
    expect(L.dec(atA.height)).toBe('7,25');
    expect(L.dec(atA.k)).toBe('7,25');
    // le bâton bouge : la perche disparaît
    expect(L.placeStick(s, 45).j).toBeNull();
  });

  it('discovery needs a missed shadow, the meeting, and the pole stopped on the way AND at the minaret', () => {
    let s = L.init({ stick: 1, stickAt: 10, tip: 11.6 });
    s = L.placeStick(s, 50);
    s = L.placePole(s, 29);
    expect(L.discoveryReady(s)).toBe(false); // ni contraste, ni arrêt en chemin
    s = L.placeStick(s, 30);
    s = L.placeStick(s, 50);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.placePole(s, 12);
    s = L.placePole(s, 29);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('beginner (levels.js): stick at 4 m, shadows at 5 m → 5 m, pole by 0,25 m', () => {
    const s = L.init({ stick: 1, stickAt: 4, tip: 5 });
    expect(L.dec(s.h)).toBe('5');
    expect([s.iMin, s.iStar, s.iMax, s.jMin, s.jA]).toEqual([5, 20, 25, 4, 20]);
    expect(L.dec(L.poleAt(s, s.jA).height)).toBe('5');
  });

  it('evidence and layout: every drawn point inside the scene at five widths', () => {
    let s = L.init({ stick: 1, stickAt: 10, tip: 11.6 });
    s = L.placeStick(s, 40);
    expect(L.evidenceOf(s)).toEqual({ stage: 'stick', d: '8', tipAt: '9,6', kind: 'before' });
    s = L.placePole(L.placeStick(s, 50), 20);
    expect(L.evidenceOf(s)).toEqual({ stage: 'pole', dist: '8', height: '5', k: '5', atMinaret: false });
    for (const width of [280, 320, 390, 700, 1100]) {
      for (const height of [180, 260, 360]) {
        const g = L.layout(s, { width, height });
        expect(g.X(s.tip.n / s.tip.d + 1.6)).toBeLessThanOrEqual(width);
        expect(g.X(-0.6)).toBeGreaterThanOrEqual(0);
        expect(g.Y(s.h)).toBeGreaterThanOrEqual(0);
        expect(g.yGround).toBeLessThanOrEqual(height);
      }
    }
  });
});

describe('shadow-stick — جرّب كل الإمكانيات', () => {
  const NUMS = [{ stick: 1, stickAt: 4, tip: 5 }, { stick: 1, stickAt: 10, tip: 11.6 }];
  const run = (s) => { let c = s; for (let g = 0; g < 2000 && L.tryAllPlan(c).length; g += 1) c = L.tryAllApply(c, L.tryAllPlan(c)[0]); return c; };

  it('the default is not an answer and not a trial (every authored number set)', () => {
    for (const n of NUMS) {
      const s = L.init(n);
      expect(L.meets(s)).toBe(false);
      expect(s.trials).toHaveLength(0);
      expect(s.poleTrials).toHaveLength(0);
    }
  });

  it('step by step reaches every stick place, ends on the good place and every pole notch', () => {
    for (const n of NUMS) {
      const s0 = L.init(n);
      const end = run(s0);
      expect(L.tryAllPlan(end)).toHaveLength(0);
      expect(new Set(end.trials.map((t) => t.i)).size).toBe(s0.iMax - s0.iMin + 1);
      expect(end.i).toBe(s0.iStar);
      expect(L.meets(end)).toBe(true);
      expect(end.poleTrials).toHaveLength(s0.jA - s0.jMin + 1);
      expect(end.poleTrials.some((p) => p.atMinaret)).toBe(true);
      expect(L.discoveryReady(end)).toBe(true);
    }
  });

  it('is the same state as the hand (placeStick / placePole) and does not duplicate a place already tried', () => {
    const s0 = L.init(NUMS[1]);
    const hand = L.placeStick(L.placeStick(s0, s0.iStar), 20);
    expect(L.tryAllPlan(hand)[0]).toEqual({ kind: 'stick', v: 5 });
    const end = run(hand);
    expect(end.trials.filter((t) => t.i === s0.iStar)).toHaveLength(1);
    expect(end.i).toBe(s0.iStar);
    // un pas = le geste de la main
    expect(L.tryAllApply(s0, { kind: 'stick', v: 7 })).toEqual(L.placeStick(s0, 7));
  });
});

