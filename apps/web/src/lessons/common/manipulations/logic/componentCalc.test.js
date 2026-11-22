import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { LEVELS } from '../levels';
import * as L from './componentCalc';

/**
 * component-calc — la logique de la carte de jeu sur les nombres de levels.js : مبتدئ (plateforme) A(1 ; 2), B(4 ; 3),
 * C(5 ; 5), le code de AB puis D tel que AB = DC ; متقدم (نشاط 2 p. 140) C(3 ; 1), D(2 ; −5), F(6 ; 5), le code de CD,
 * E tel que DE(3 ; 4), le code de CF et les portails jumeaux DE = CF. Les verdicts viennent de vectors.js : on balaie
 * TOUS les codes du pavé et TOUTES les positions de la carte.
 */
const { beginner, advanced } = LEVELS['component-calc'];
const ok = (s) => L.commitCalc([0, 1].reduce((t, c) => L.setEntry(t, c, L.xy(L.calcTarget(t))[c]), s));

describe('component-calc — init', () => {
  it('beginner: positive coordinates, two missions, D starts away from its target and its trap', () => {
    const s = L.init(beginner.numbers);
    expect(Object.values(s.points).flatMap(L.xy).every((v) => v > 0)).toBe(true);
    expect(s.missions.map((m) => m.kind)).toEqual(['calc', 'place']);
    expect(s.live).toBe(true);
    const m = s.missions[1];
    expect(L.xy(m.target)).toEqual(L.xy(V.fourthVertex(s.points.A, s.points.B, s.points.C)));
    expect(L.xy(m.target)).toEqual([2, 4]);
    expect(L.xy(m.trap)).toEqual([8, 6]);
    expect(V.vecEq(s.placed.D, m.target) || V.vecEq(s.placed.D, m.trap)).toBe(false);
    // le piège d'ordre est sur la carte (l'élève peut y poser D et voir le quadrilatère se croiser), O aussi
    for (const p of [m.target, m.trap, V.point(0, 0)]) {
      const [x, y] = L.xy(p);
      expect(x >= s.win.xMin && x <= s.win.xMax && y >= s.win.yMin && y <= s.win.yMax).toBe(true);
    }
  });

  it('advanced (نشاط 2): CD, E with DE(3 ; 4), CF compared with DE; the feedback waits for the commit', () => {
    const s = L.init(advanced.numbers);
    expect(s.missions.map((m) => m.kind)).toEqual(['calc', 'place', 'calc']);
    expect(s.live).toBe(false);
    expect(L.xy(L.calcTarget(s, 0))).toEqual([-1, -6]);
    expect(L.xy(s.missions[1].target)).toEqual([5, -1]);
    expect(L.xy(s.missions[1].trap)).toEqual([-1, -9]);
    const cols = s.win.xMax - s.win.xMin; const rows = s.win.yMax - s.win.yMin;
    expect(Math.max(cols, rows) / Math.min(cols, rows)).toBeLessThanOrEqual(1.6);
  });

  it('refuses a bad map', () => {
    expect(() => L.init({ points: { A: [0, 0], B: [0, 0] }, missions: [{ kind: 'calc', from: 'A', to: 'B' }] })).toThrow();
    expect(() => L.init({ points: { A: [0.5, 0], B: [1, 0] } })).toThrow();
    expect(() => L.init({ points: { A: [0, 0], B: [1, 0] }, missions: [{ kind: 'place', point: 'D', vec: ['A', 'B'], ref: [1, 0] }] })).toThrow();
  });
});

describe('component-calc — the portal code (calc)', () => {
  const s0 = L.init(beginner.numbers);

  it('sweep of the pad: only (x_B − x_A ; y_B − y_A) opens the portal', () => {
    const t = L.xy(L.calcTarget(s0));
    expect(t).toEqual([3, 1]);
    let oks = 0;
    for (let x = L.PAD_RANGE.min; x <= L.PAD_RANGE.max; x += 1) {
      for (let y = L.PAD_RANGE.min; y <= L.PAD_RANGE.max; y += 1) {
        const j = L.judgeCalc(s0, [x, y]);
        if (j.kind === 'ok') { oks += 1; expect([x, y]).toEqual(t); }
        expect(L.xy(j.landing)).toEqual([1 + x, 2 + y]);
      }
    }
    expect(oks).toBe(1);
  });

  it('names each error: reversed (TARH-MAQLUB), swapped, coordinates of B, one sign, one component', () => {
    const k = (u) => L.judgeCalc(s0, u).kind;
    expect(k([-3, -1])).toBe('reversed');
    expect(k([1, 3])).toBe('swapped');
    expect(k([4, 3])).toBe('coords');
    expect(k([3, -1])).toBe('signY');
    expect(k([-3, 1])).toBe('signX');
    expect(k([3, 5])).toBe('xOnly');
    expect(k([2, 1])).toBe('yOnly');
    expect(k([2, 2])).toBe('none');
    expect(k([0, 0])).toBe('zero');
    // le saut à l'envers atterrit sur le symétrique de B par rapport à A
    expect(L.xy(L.judgeCalc(s0, [-3, -1]).landing)).toEqual(L.xy(V.symmetric(s0.points.B, s0.points.A)));
  });

  it('the pad is clamped, signed, and a commit is a trial; only a right code solves', () => {
    let s = L.nudgeEntry(s0, 0, 99);
    expect(s.entry[0][0]).toBe(L.PAD_RANGE.max);
    s = L.toggleSign(s, 0);
    expect(s.entry[0][0]).toBe(-L.PAD_RANGE.max);
    s = L.setEntry(L.setEntry(s, 0, -3), 1, -1);
    s = L.commitCalc(s);
    expect(s.trials).toHaveLength(1);
    expect(s.last.trial.kind).toBe('reversed');
    expect(s.solved[0]).toBe(false);
    expect(L.nextMission(s).idx).toBe(0);
    s = ok(s);
    expect(s.solved[0]).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ type: 'calc', from: 'A', to: 'B', u: [3, 1], kind: 'ok' });
    // une fois résolue, le pavé ne bouge plus
    expect(L.nudgeEntry(s, 0, 1)).toBe(s);
  });
});

describe('component-calc — the unknown point (place)', () => {
  const s1 = L.nextMission(ok(L.init(beginner.numbers)));

  it('sweep of the map: only D = A + C − B makes AB = DC; CD = AB is the order trap and crosses ABCD', () => {
    const m = L.mission(s1);
    let oks = 0;
    for (let x = s1.win.xMin; x <= s1.win.xMax; x += 1) {
      for (let y = s1.win.yMin; y <= s1.win.yMax; y += 1) {
        const j = L.judgePlace(s1, [x, y]);
        const eqX = 5 - x === 3; const eqY = 5 - y === 1;
        expect(j.okX, `${x};${y}`).toBe(eqX);
        expect(j.okY, `${x};${y}`).toBe(eqY);
        if (j.kind === 'ok') { oks += 1; expect([x, y]).toEqual(L.xy(m.target)); }
        const q = L.quadOf(s1, [x, y]);
        if (j.kind === 'ok') expect(q.shape).toBe('para');
        if (j.kind === 'order') { expect([x, y]).toEqual([8, 6]); expect(q.shape).toBe('crossed'); }
      }
    }
    expect(oks).toBe(1);
    expect(L.judgePlace(s1, [5, 5]).kind).toBe('zero');
    expect(L.judgePlace(s1, [1, 2]).kind).toBe('onPoint');
  });

  it('the coordinate counters move the point; a commit is a trial; the right place solves and the discovery opens', () => {
    let s = L.setPlaceCoord(s1, 0, 8);
    s = L.setPlaceCoord(s, 1, 6);
    expect(L.xy(s.placed.D)).toEqual([8, 6]);
    s = L.commitPlace(s);
    expect(s.last.trial.kind).toBe('order');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commitPlace(s, [2, 4]);
    expect(s.solved[1]).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ type: 'place', point: 'D', at: [2, 4], vec: 'DC', components: [3, 1] });
    expect(L.movePlace(s, [0, 0])).toBe(s);
  });

  it('a move is not a trial and stays on the map', () => {
    const s = L.movePlace(s1, [99, -99]);
    expect(s.trials).toHaveLength(s1.trials.length);
    expect(L.xy(s.placed.D)).toEqual([s1.win.xMax, s1.win.yMin]);
  });
});

describe('component-calc — نشاط 2 played to the end', () => {
  it('CD(−1 ; −6), E(5 ; −1) with ED as the order trap, CF(3 ; 4) = DE: twin portals', () => {
    let s = L.init(advanced.numbers);
    s = ok(s);
    expect(s.solved[0]).toBe(true);
    s = L.nextMission(s);
    expect(L.judgePlace(s, [-1, -9]).kind).toBe('order'); // ED = (3 ; 4) : E = D − u
    expect(L.quadOf(s)).toBeNull();
    s = L.commitPlace(s, [5, -1]);
    expect(s.solved[1]).toBe(true);
    s = L.nextMission(s);
    expect(L.knownPoints(s).E).toBeDefined();
    expect(L.twin(s)).toBeNull();
    s = ok(s);
    expect(L.xy(L.calcTarget(s))).toEqual([3, 4]);
    const tw = L.twin(s);
    expect(tw.equal).toBe(true);
    expect(L.xy(tw.other)).toEqual([3, 4]);
    expect(V.isParallelogram(L.knownPoints(s).D, L.knownPoints(s).E, L.knownPoints(s).F, L.knownPoints(s).C)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.nextMission(s)).toBe(s);
  });

  it('goMission revisits a solved mission, never jumps ahead', () => {
    const s = L.init(advanced.numbers);
    expect(L.goMission(s, 2)).toBe(s);
    const t = L.nextMission(ok(s));
    expect(L.goMission(t, 0).idx).toBe(0);
  });

  it('frame: square cells, the whole map inside the box, y up', () => {
    const s = L.init(advanced.numbers);
    for (const [w, h] of [[300, 420], [360, 300], [720, 520]]) {
      const f = L.frame(s, { width: w, height: h });
      expect(f.px(s.win.xMin)).toBeGreaterThanOrEqual(0);
      expect(f.px(s.win.xMax)).toBeLessThanOrEqual(w);
      expect(f.py(s.win.yMin)).toBeLessThanOrEqual(h);
      expect(f.py(s.win.yMax)).toBeGreaterThanOrEqual(0);
      expect(f.py(1)).toBeLessThan(f.py(0));
      const [x, y] = f.fromPx(f.px(3), f.py(-2));
      expect([Math.round(x), Math.round(y)]).toEqual([3, -2]);
    }
  });
});
