import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './coneCylinder';

import { LEVELS } from '../levels';
const txt = LIN.fracText;

/**
 * cone-cylinder — « أدمج تعلّماتي » (p. 112) : cône H = 18, R = 6 ; le cylindre inscrit de hauteur h = r a
 * r = 4,5 et V = 91,125π ≈ 286,28 cm³ ; et le niveau مبتدئ de levels.js (H = 12, R = 4 → r = 3).
 */
describe('cone-cylinder — the cone refuses, the generatrix decides', () => {
  it('the situation: 24 graduations (h by 0,75, r by 0,25), h = r = 4,5 on the ruler', () => {
    const s = L.init({ H: 18, R: 6 });
    expect(s.n).toBe(24);
    expect([L.dec(s.hStep), L.dec(s.rStep)]).toEqual(['0,75', '0,25']);
    // la génératrice : au cran i de h, le bord permis est au cran n − i de r
    for (let i = 1; i < s.n; i += 1) expect(L.touchIndex(s, i)).toBe(s.n - i);
    const square = [];
    for (let i = 1; i < s.n; i += 1) if (L.probe(s, i, s.n - i).square) square.push(L.dec(L.hOf(s, i)));
    expect(square).toEqual(['4,5']);
    const st = L.probe(s, 6, 18);
    expect(txt(st.vop)).toBe('729/8');
    expect(L.dec(st.vop)).toBe('91,125');
    expect(L.volumeApprox(st.vop)).toBe('286,28');
  });

  it('starts inside, not touching (no answer on screen)', () => {
    const s = L.init({ H: 18, R: 6 });
    const st = L.status(s);
    expect(st.inscribed || st.pierce).toBe(false);
    expect(LIN.cmp(st.gap, LIN.frac(0))).toBeGreaterThan(0);
  });

  it('the cone refuses a rim that would pierce it — both handles', () => {
    let s = L.init({ H: 18, R: 6 }); // h = 9 (cran 12), r = 1 (cran 4) ; permis : r ≤ 3 (cran 12)
    s = L.setR(s, 13);
    expect(s.last.kind).toBe('pierceR');
    expect(s.rIdx).toBe(4);
    expect(L.dec(s.last.state.rMax)).toBe('3');
    s = L.setR(s, 12);
    expect(s.last.kind).toBe('r');
    expect(L.status(s).inscribed).toBe(true);
    // allonger un cylindre déjà au bord : il percerait
    s = L.setH(s, 14);
    expect(s.last.kind).toBe('pierceH');
    expect(s.hIdx).toBe(12);
    expect(s.refusals).toBe(2);
    // le raccourcir : il reste dedans, un jeu apparaît
    s = L.setH(s, 8);
    expect(L.status(s).inscribed).toBe(false);
    expect(L.dec(L.status(s).gap)).toBe('1');
  });

  it('every inscribed cylinder satisfies r ÷ R = (H − h) ÷ H; r + h and r × h are not constant', () => {
    const s = L.init({ H: 18, R: 6 });
    const sums = new Set(); const prods = new Set();
    for (let i = 1; i < s.n; i += 1) {
      const st = L.probe(s, i, s.n - i);
      expect(st.inscribed).toBe(true);
      const { left, right } = L.ratios(s, st.h, st.r);
      expect(LIN.eq(left, right)).toBe(true);
      sums.add(txt(LIN.add(st.h, st.r))); prods.add(txt(LIN.mul(st.h, st.r)));
    }
    expect(sums.size).toBeGreaterThan(1);
    expect(prods.size).toBeGreaterThan(1);
  });

  it('discovery: two inscribed lengths and a contrast; the goal is the square half-section', () => {
    let s = L.init({ H: 18, R: 6 });
    s = L.setR(s, 12); // h = 9, r = 3 inscrit
    expect(L.discoveryReady(s)).toBe(false);
    s = L.setH(s, 8); // h = 6, r = 3 : un jeu (contraste)
    s = L.setR(s, 16); // h = 6, r = 4 inscrit
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.goalFound(s)).toBe(false);
    s = L.setH(s, 6); // h = 4,5 (r = 4 laisse un jeu)
    s = L.setR(s, 18); // r = 4,5
    expect(L.goalFound(s)).toBe(true);
    expect(L.evidenceOf(s)).toMatchObject({ kind: 'r', h: '4,5', r: '4,5', inscribed: true, square: true, vop: '91,125', approx: '286,28' });
  });

  it('beginner (levels.js): H = 12, R = 4 → 20 graduations, h = r = 3, V = 27π', () => {
    const s = L.init({ H: 12, R: 4 });
    expect(s.n).toBe(20);
    expect([L.dec(s.hStep), L.dec(s.rStep)]).toEqual(['0,6', '0,2']);
    const st = L.probe(s, 5, 15);
    expect(st.square).toBe(true);
    expect(L.dec(st.h)).toBe('3');
    expect(txt(st.vop)).toBe('27');
  });

  it('layout: the section fits the width and the height given, at five widths', () => {
    for (const [H, R] of [[18, 6], [12, 4]]) {
      const s = L.init({ H, R });
      for (const width of [280, 320, 390, 700, 1100]) {
        for (const height of [160, 240, 400]) {
          const g = L.layout(s, { width, height });
          expect(g.width).toBeLessThanOrEqual(width + 0.5);
          expect(g.height).toBeLessThanOrEqual(Math.max(height, 2 * 22 + 2 * R * 3) + 0.5);
          expect(g.X(H)).toBeLessThanOrEqual(width);
          expect(g.Y(R)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe('cone-cylinder — the opening state is a real cylinder, never an answer, never a trial', () => {
  it('on every authored cone: inside the cone, leaving a gap, not inscribed, no trial recorded', () => {
    for (const lv of Object.values(LEVELS['cone-cylinder'])) {
      const s = L.init(lv.numbers);
      const v = L.probe(s);
      expect(v.pierce).toBe(false);
      expect(v.inscribed).toBe(false);
      expect(v.square).toBe(false);
      expect(s.trials).toHaveLength(0);
      expect(s.refusals).toBe(0);
    }
  });
  it('the cylinder has no try-all: each h needs the student to find its r (the relation is the discovery)', () => {
    // documentation test : aucune API tryAll exportée
    expect(L.tryAllPlan).toBeUndefined();
  });
});

/* ── le LECTEUR DE MISSION (la synthèse de l'unité 9, 2026-11-10 ; conseil C) : chaque nombre recalculé en fractions exactes ── */
describe('cone-cylinder — the mission player', () => {
  const dec = (p) => L.dec(p);
  /** Le rayon inscrit au cran i : R (H − h) ÷ H, recalculé ici. */
  const rAt = (H, R, n, i) => LIN.div(LIN.mul(LIN.frac(R), LIN.sub(LIN.frac(H), LIN.mul(LIN.div(LIN.frac(H), LIN.frac(n)), LIN.frac(i)))), LIN.frac(H));

  it('an explicit n; the verdict cones of the rounds keep h = r OFF the grid and every inscribed cylinder ON it', () => {
    [[25, 15, 5], [25, 10, 5], [21, 14, 7]].forEach(([H, R, n]) => {
      const lab = L.initPlayer({ H, R, n });
      expect(lab.n).toBe(n);
      for (let i = 1; i < n; i += 1) {
        const r = rAt(H, R, n, i);
        expect(LIN.eq(L.rMaxAt(lab, i), r)).toBe(true);
        expect(LIN.isInteger(LIN.div(r, lab.rStep)), `${H}/${R} at ${i}`).toBe(true);            // on the r grid: findable by hand
        expect(LIN.eq(L.hOf(lab, i), r), `${H}/${R}: no square at ${i}`).toBe(false);           // h = r is never on the grid
      }
    });
    expect(() => L.initPlayer({ H: 25, R: 15 })).toThrow();
    expect(() => L.initPlayer({ H: 25, R: 15, n: 5, lockH: 7 })).toThrow();
  });

  it('moving never judges; one press = one trial; the same (h ; r) twice is not a trial; the first refusal can be free', () => {
    let lab = L.initPlayer({ H: 25, R: 15, n: 5, freeFirstRefusal: true });
    lab = L.moveTo(lab, { hIdx: 2, rIdx: 4 });
    expect(lab.trials).toHaveLength(0);
    expect(L.verdictKind(lab)).toBe('pierce');                       // h = 10: the wall allows r = 9, not 12
    lab = L.press(lab);
    expect(L.verdictOfPress(lab)).toEqual({ groups: 2, exact: false, free: true });
    lab = L.press(lab);                                               // the same cylinder again
    expect(lab.last.repeat).toBe(true);
    expect(L.verdictOfPress(lab)).toBe(null);
    expect(lab.trials).toHaveLength(1);
    lab = L.press(L.moveTo(lab, { rIdx: 2 }));                        // r = 6 at h = 10: a gap
    expect(L.verdictOfPress(lab)).toEqual({ groups: 2, exact: false });
    lab = L.press(L.moveTo(lab, { rIdx: 4, hIdx: 1 }));               // (5 ; 12): touches
    expect(L.verdictOfPress(lab)).toEqual({ groups: 1, exact: true });
    lab = L.press(L.moveTo(lab, { rIdx: 9 }));                         // clamped to n − 1
    expect(lab.rIdx).toBe(4);
    lab = L.press(L.moveTo(lab, { hIdx: 3, rIdx: 2 }));               // (15 ; 6): touches
    expect(L.discoveredPlayer(lab)).toBe(true);
    // a second refusal is not free
    const two = L.press(L.moveTo(L.press(L.moveTo(L.initPlayer({ H: 25, R: 15, n: 5, freeFirstRefusal: true }), { hIdx: 4, rIdx: 4 })), { hIdx: 3, rIdx: 4 }));
    expect(L.verdictOfPress(two)).toEqual({ groups: 3, exact: false });
  });

  it('locks: h fixed (find r), r fixed as a list (find h, the reverse task) — r moves to the next value once the first touches', () => {
    const lh = L.initPlayer({ H: 25, R: 10, n: 5, lockH: 15 });
    expect(L.hOf(lh, lh.hIdx)).toEqual(LIN.frac(15));
    expect(L.moveTo(lh, { hIdx: 1 }).hIdx).toBe(3);
    expect(L.verdictKind(L.moveTo(lh, { rIdx: 2 }))).toBe('inscribed');      // r = 4 at h = 15
    let lr = L.initPlayer({ H: 21, R: 14, n: 7, lockR: [10, 4] });
    expect(dec(L.rOf(lr))).toBe('10');
    lr = L.press(L.moveTo(lr, { hIdx: 2 }));                                  // h = 6 touches
    expect(L.verdictOfPress(lr)).toEqual({ groups: 2, exact: true });
    expect(dec(L.rOf(lr))).toBe('10');                                         // the verdict stays on screen…
    expect(L.isDirty(lr)).toBe(false);
    expect(dec(L.rOf(L.moveTo(lr, { hIdx: 3 })))).toBe('4');                   // …r takes the next value at the next move
    expect(L.moveTo(lr, { rIdx: 6 }).rIdx).toBe(L.moveTo(lr, { hIdx: 3 }).rIdx);
    lr = L.press(L.moveTo(lr, { hIdx: 5 }));                                  // h = 15 touches
    expect(L.verdictOfPress(lr)).toEqual({ groups: 5, exact: true });
    expect(LIN.eq(LIN.frac(15), LIN.div(LIN.mul(LIN.frac(21), LIN.sub(LIN.frac(14), LIN.frac(4))), LIN.frac(14)))).toBe(true);
  });

  it('the sec chips, the build tiles and the predictions tell the truth of the cone', () => {
    let lab = L.press(L.moveTo(L.initPlayer({ H: 25, R: 15, n: 5 }), { hIdx: 2, rIdx: 3 }));   // (10 ; 9)
    const s = L.secOptions(lab, L.firstInscribed(lab));
    expect([s.rr, s.hh, s.decoy]).toEqual(['9/15', '15/25', '10/25']);
    expect(LIN.eq(LIN.div(9, 15), LIN.div(15, 25))).toBe(true);
    expect([...s.options].sort()).toEqual(['10/25', '15/25', '9/15']);
    const b = L.buildOf(L.initPlayer({ H: 25, R: 10, n: 5 }), 4);
    expect([b.r, b.R, b.OT, b.H, b.h]).toEqual(['2', '10', '5', '25', '20']);
    expect(LIN.eq(LIN.div(2, 10), LIN.div(5, 25))).toBe(true);
    lab = L.initPlayer({ H: 25, R: 10, n: 5 });
    expect(L.predictTruthPlayer(lab, 'part')).toBe('no');        // h = 5 (a fifth of 25) → r = 8, not 2
    expect(L.predictTruthPlayer(lab, 'double')).toBe('more');    // 8 → 6, more than 4
    expect(L.predictJudgedPlayer(lab, 'part')).toBe(false);
    lab = L.press(L.moveTo(lab, { hIdx: 1, rIdx: 4 }));
    expect(L.predictJudgedPlayer(lab, 'part')).toBe(true);
    expect(L.predictJudgedPlayer(lab, 'double')).toBe(false);
  });

  it('the journal, the coach (h → r → the press button, never a notch) and what a screen can show', () => {
    let lab = L.initPlayer({ H: 25, R: 15, n: 5 });
    expect(L.coachOfPlayer(lab)).toMatchObject({ id: 'h' });
    lab = L.moveTo(lab, { hIdx: 2 });
    expect(L.coachOfPlayer(lab)).toMatchObject({ id: 'r' });
    lab = L.moveTo(lab, { rIdx: 3 });
    expect(L.coachOfPlayer(lab)).toMatchObject({ id: 'press', target: '[data-cc-press]' });
    lab = L.press(lab);
    expect(L.coachOfPlayer(lab)).toBe(null);
    expect(L.coachOfPlayer(L.initPlayer({ H: 25, R: 15, n: 5, lockH: 20 }))).toMatchObject({ id: 'r' });
    expect(JSON.stringify(L.coachOfPlayer(L.initPlayer({ H: 25, R: 15, n: 5 })))).not.toMatch(/\d/);
    expect(L.journalPlayer(lab)).toEqual([{ i: 1, h: '10', r: '9', verdict: 'inscribed', rr: null, hh: null }]);
    expect(L.journalPlayer(lab, { ratios: true })[0]).toMatchObject({ rr: '9/15', hh: '15/25' });
    const v = L.shownValuesPlayer({ H: 25, R: 10, n: 5, build: 20 });
    const of = (role) => [...new Set(v.filter((x) => x.role === role).map((x) => x.v))].sort();
    expect(of('cone-H')).toEqual(['25']);
    expect(of('h')).toEqual(['10', '15', '20', '5']);
    expect(of('OT')).toEqual(['10', '15', '20', '5']);
    expect(of('value')).toEqual(['10', '2', '20', '25', '5']);
    expect(v.some((x) => x.role === 'square')).toBe(false);
    expect(L.shownValuesPlayer({ H: 18, R: 6, n: 24 }).some((x) => x.role === 'square')).toBe(true);   // the page cone: h = r on its grid
  });

  it('a cylinder pressed again after another one is « already tried », shown and not dirty', () => {
    let lab = L.initPlayer({ H: 25, R: 15, n: 5 });
    lab = L.press(L.moveTo(lab, { hIdx: 2, rIdx: 2 }));
    lab = L.press(L.moveTo(lab, { hIdx: 3, rIdx: 2 }));
    lab = L.press(L.moveTo(lab, { hIdx: 2, rIdx: 2 }));
    expect(lab.last.repeat).toBe(true);
    expect(L.isDirty(lab)).toBe(false);
    expect(L.isDirty(L.moveTo(lab, { rIdx: 3 }))).toBe(true);
  });
});
