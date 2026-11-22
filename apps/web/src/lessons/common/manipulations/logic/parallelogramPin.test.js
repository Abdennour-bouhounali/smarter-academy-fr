import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { LEVELS } from '../levels';
import * as L from './parallelogramPin';

/**
 * parallelogram-pin — la logique du lab sur les nombres de levels.js : مبتدئ [AB] de (0 ; 0) à (4 ; 2) en 8 parts ;
 * متقدم le triangle de طرائق p. 131 (A, B, C ; D image de C par le انسحاب de vecteur AB ; E tel que EB = AC).
 * Les verdicts viennent de vectors.relation : on les balaie sur TOUTES les positions possibles.
 */
const { beginner, advanced } = LEVELS['parallelogram-pin'];

describe('parallelogram-pin — midpoint (مبتدئ)', () => {
  const s0 = L.init(beginner.numbers);

  it('starts away from the middle, on [AB] cut in 8 equal parts', () => {
    expect(s0.mode).toBe('midpoint');
    expect(s0.N).toBe(8);
    expect(L.midRange(s0)).toEqual({ min: 1, max: 7 });
    expect(s0.k).not.toBe(4);
  });

  it('sweep: AI = IB only at k = N/2 ; elsewhere same direction and sense, different length', () => {
    for (let k = 1; k <= 7; k += 1) {
      const r = L.midReading(s0, k, 'IB');
      expect(r.rel.direction, `k=${k}`).toBe(true);
      expect(r.rel.sense, `k=${k}`).toBe(true);
      expect(r.rel.length, `k=${k}`).toBe(k === 4);
      expect(r.kind, `k=${k}`).toBe(k === 4 ? 'equal' : 'length');
      expect(r.partsAI + r.partsW).toBe(8);
    }
    expect(V.vecEq(L.pointI(s0, 4), V.midpoint(s0.A, s0.B))).toBe(true);
  });

  it('AI and BI: opposite at the middle (MISC-SHUAA-MUNTASAF-IB-IA), only parallel elsewhere', () => {
    expect(L.midReading(s0, 4, 'BI').kind).toBe('sense');
    for (const k of [1, 2, 3, 5, 6, 7]) expect(L.midReading(s0, k, 'BI').kind).toBe('both');
  });

  it('a trial is a committed position; the discovery needs the middle AND an unequal-length trial', () => {
    let s = L.commitI(s0, 4);
    expect(s.trials).toHaveLength(1);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.flip(s);
    expect(s.second).toBe('BI');
    expect(s.last.trial.kind).toBe('sense');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commitI(L.flip(s), 3);
    expect(s.last.trial.kind).toBe('length');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ mode: 'midpoint', k: 3, N: 8, kind: 'length' });
  });

  it('moving is not a trial, and stays inside ]A ; B[', () => {
    const s = L.moveI(s0, 99);
    expect(s.k).toBe(7);
    expect(s.trials).toHaveLength(0);
    expect(L.moveI(s0, -3).k).toBe(1);
  });
});

describe('parallelogram-pin — parallelogram (متقدم, طرائق p. 131)', () => {
  const s0 = L.init(advanced.numbers);

  it('targets: CD = AB, the crossed trap DC = AB, E with EB = AC', () => {
    expect(V.vecEq(V.vec(s0.C, s0.target), V.vec(s0.A, s0.B))).toBe(true);
    expect(V.vecEq(V.vec(s0.crossed, s0.C), V.vec(s0.A, s0.B))).toBe(true);
    expect(V.vecEq(V.vec(s0.targetE, s0.B), V.vec(s0.A, s0.C))).toBe(true);
    // the textbook: D is the symmetric of A about the midpoint of [BC]; B is the midpoint of [DE]
    expect(V.vecEq(s0.target, V.symmetric(s0.A, V.midpoint(s0.B, s0.C)))).toBe(true);
    expect(V.vecEq(V.midpoint(s0.target, s0.targetE), s0.B)).toBe(true);
  });

  it('starts on a free node, neither the answer nor the trap, inside the window', () => {
    for (const p of [s0.D, s0.E]) {
      const [x, y] = L.xy(p);
      expect(x >= s0.win.xMin && x <= s0.win.xMax && y >= s0.win.yMin && y <= s0.win.yMax).toBe(true);
    }
    expect(L.same(s0.D, s0.target)).toBe(false);
    expect(L.same(s0.D, s0.crossed)).toBe(false);
    for (const p of [s0.target, s0.crossed, s0.targetE]) {
      const [x, y] = L.xy(p);
      expect(x >= s0.win.xMin && x <= s0.win.xMax && y >= s0.win.yMin && y <= s0.win.yMax).toBe(true);
    }
  });

  it('sweep over every node: the banner is taut ⇔ CD = AB ⇔ the two midpoints merge; crossed ⇔ DC = AB', () => {
    let taut = 0; let crossed = 0;
    for (let x = s0.win.xMin; x <= s0.win.xMax; x += 1) {
      for (let y = s0.win.yMin; y <= s0.win.yMax; y += 1) {
        const D = V.point(x, y);
        const j = L.judge(s0, 'D', D);
        const ok = j.kind === 'ok';
        expect(L.midpoints(s0, D).merged, `${x};${y}`).toBe(ok);
        expect(L.bannerShape(s0, D) === 'taut', `${x};${y}`).toBe(ok);
        if (L.bannerShape(s0, D) === 'crossed') { crossed += 1; expect(j.kind).toBe('order'); }
        if (ok) taut += 1;
      }
    }
    expect(taut).toBe(1);
    expect(crossed).toBe(1);
  });

  it('the verdicts name WHICH element differs (vectors.relation)', () => {
    const AB = V.vec(s0.A, s0.B);
    expect(L.judge(s0, 'D', s0.C).kind).toBe('zero');
    expect(L.judge(s0, 'D', V.translate(s0.C, V.vecScale(AB, 2))).kind).toBe('length');
    expect(L.judge(s0, 'D', V.translate(s0.C, V.vecScale(AB, 2))).longer).toBe(true);
    expect(L.judge(s0, 'D', V.translate(s0.C, V.vecScale(AB, -2))).kind).toBe('senseLen');
    // AB = (1 ; −3): (3 ; 1) has the same length and another direction
    const j = L.judge(s0, 'D', V.translate(s0.C, V.point(3, 1)));
    expect(j.kind).toBe('direction');
    expect(j.sameLength).toBe(true);
  });

  it('D then E: E is opened by the student; E on D (BE = AC) is refused; the discovery needs both', () => {
    let s = L.commitPoint(s0, 'D', s0.crossed);
    expect(s.last.trial.kind).toBe('order');
    expect(s.dDone).toBe(false);
    expect(L.openE(s).stage).toBe('D');
    s = L.commitPoint(s, 'D', s0.target);
    expect(s.dDone).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    expect(L.commitPoint(s, 'E', s0.targetE)).toBe(s); // E is not open yet
    s = L.openE(s);
    expect(s.stage).toBe('E');
    s = L.commitPoint(s, 'E', s0.target);
    expect(s.last.trial.kind).toBe('isD');
    s = L.commitPoint(s, 'E', s0.targetE);
    expect(s.eDone).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.backToD(s).stage).toBe('D');
    expect(L.evidenceOf(s)).toMatchObject({ mode: 'parallelogram', which: 'E', kind: 'ok' });
  });

  it('nodeAt rounds to the nearest node and clamps to the window', () => {
    expect(L.xy(L.nodeAt(s0, 2.4, 1.6))).toEqual([2, 2]);
    expect(L.xy(L.nodeAt(s0, 99, -99))).toEqual([s0.win.xMax, s0.win.yMin]);
  });

  it('frame: same unit on both axes, the scene fits the box', () => {
    const f = L.frame(s0, { width: 320, height: 260 });
    expect(f.cols * f.u).toBeLessThanOrEqual(320);
    expect(f.rows * f.u).toBeLessThanOrEqual(260);
    const [X, Y] = f.P(s0.A);
    const [x, y] = f.fromPx(X, Y);
    expect(Math.round(x)).toBe(L.xy(s0.A)[0]);
    expect(Math.round(y)).toBe(L.xy(s0.A)[1]);
  });

  it('refuses aligned or non-integer corners', () => {
    expect(() => L.init({ mode: 'parallelogram', A: [0, 0], B: [1, 1], C: [2, 2] })).toThrow();
    expect(() => L.init({ mode: 'parallelogram', A: [0, 0.5], B: [1, 1], C: [2, 0] })).toThrow();
  });
});

describe('parallelogram-pin — défaut et « جرّب كل الإمكانيات »', () => {
  it('le départ n\'est jamais une réponse et n\'est pas un essai', () => {
    for (const lv of [beginner, advanced]) {
      const s = L.init(lv.numbers);
      expect(L.defaultIsSolution(s)).toBe(false);
      expect(s.trials).toHaveLength(0);
    }
  });
  it('la balade des encoches de I = la main, et ouvre le contraste', () => {
    let s = L.init(beginner.numbers);
    expect(L.untriedNotches(s)).toHaveLength(s.N - 1);
    let hand = L.init(beginner.numbers);
    for (let k = 1; k < s.N; k += 1) hand = L.commitI(hand, k);
    while (L.untriedNotches(s).length) s = L.commitI(s, L.untriedNotches(s)[0]);
    expect(s.trials).toEqual(hand.trials);
    expect(L.midDiscoveryReady(s)).toBe(true);
  });
  it('mode parallelogram : aucune balade', () => {
    expect(L.untriedNotches(L.init(advanced.numbers))).toEqual([]);
  });
});
