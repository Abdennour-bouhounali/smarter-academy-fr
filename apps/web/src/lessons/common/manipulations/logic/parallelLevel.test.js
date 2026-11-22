import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './parallelLevel';

import { LEVELS } from '../levels';
const txt = LIN.fracText;
/** Valider une position (B′ à bp, C′ à cp) comme le ferait la main : un relâchement par extrémité. */
const place = (lab, bp, cp) => L.commit(L.commit(lab, 'B', L.slotOf(bp)), 'C', L.slotOf(cp));

describe('parallel-level — slots and abscissas', () => {
  it('a slot climbs the bar and never lands on A', () => {
    expect([-3, -2, -1, 0, 1, 2].map(L.abscissaOf)).toEqual([3, 2, 1, -1, -2, -3]);
    for (let a = -8; a <= 11; a += 1) if (a !== 0) expect(L.abscissaOf(L.slotOf(a))).toBe(a);
    expect(() => L.slotOf(0)).toThrow();
  });

  it('ranges: the ladder stops at A, the X-trestle goes on past A (⌈2n/3⌉ notches)', () => {
    expect(L.slotRange(6, 'ladder')).toEqual({ min: -5, max: -1 });
    expect(L.slotRange(9, 'crossing')).toEqual({ min: -8, max: 5 });
    expect(L.slotRange(12, 'crossing')).toEqual({ min: -11, max: 7 });
  });

  it('the finger is read to the nearest notch, A excluded, the range respected', () => {
    const r = L.slotRange(9, 'crossing');
    expect(L.abscissaOf(L.slotFromAbscissa(0.2, r))).toBe(1);
    expect(L.abscissaOf(L.slotFromAbscissa(-0.2, r))).toBe(-1);
    expect(L.abscissaOf(L.slotFromAbscissa(2.6, r))).toBe(3);
    expect(L.abscissaOf(L.slotFromAbscissa(-3.4, r))).toBe(-3);
    expect(L.abscissaOf(L.slotFromAbscissa(40, r))).toBe(8);
    expect(L.abscissaOf(L.slotFromAbscissa(-40, r))).toBe(-6);
    // le balayage : chaque encoche se retrouve sous le doigt
    for (let s = r.min; s <= r.max; s += 1) expect(L.slotFromAbscissa(L.abscissaOf(s), r)).toBe(s);
  });
});

describe('parallel-level — مبتدئ: the ladder (AB = 6, AC = 9)', () => {
  const lab0 = L.init({ AB: 6, AC: 9, mode: 'ladder' });

  it('starts tilted on the last notch before each foot, with no trial', () => {
    expect(L.positions(lab0)).toEqual({ bp: 5, cp: 8 });
    expect(L.reading(lab0).parallel).toBe(false);
    expect(lab0.trials).toEqual([]);
  });

  it('the plank is level exactly at (2 ; 3) and (4 ; 6): 1/3 and 2/3, never the midpoints', () => {
    const levels = [];
    for (let bp = 1; bp <= 5; bp += 1) for (let cp = 1; cp <= 8; cp += 1) {
      if (L.reading(lab0, { bp, cp }).parallel) levels.push([bp, cp]);
    }
    expect(levels).toEqual([[2, 3], [4, 6]]);
  });

  it('equal rung numbers and equal distances to the feet tilt (the two additive misconceptions)', () => {
    expect(L.reading(lab0, { bp: 2, cp: 2 })).toMatchObject({ parallel: false, reason: 'ratios' });
    expect(L.reading(lab0, { bp: 4, cp: 7 })).toMatchObject({ parallel: false, reason: 'ratios' });
    const r = L.reading(lab0, { bp: 2, cp: 3 });
    expect([txt(r.ratioB), txt(r.ratioC)]).toEqual(['1/3', '1/3']);
  });

  it('discovery needs two DIFFERENT level planks and one tilted plank', () => {
    let s = place(lab0, 2, 3);
    expect(s.trials.map((t) => t.kind)).toEqual(['tilted', 'level']); // B′ à 2 avec C′ encore à 8, puis (2 ; 3)
    expect(L.discoveryReady(s)).toBe(false);
    s = L.commit(s, 'C', L.slotOf(3)); // la même position : pas un nouvel essai
    expect(s.trials).toHaveLength(2);
    s = place(s, 4, 6);
    expect(L.levelRatios(s)).toEqual(['1/3', '2/3']);
    expect(L.discoveryReady(s)).toBe(true);
    // deux fois la même planche de niveau ne suffit pas
    const twice = L.commit(L.commit(place(lab0, 2, 3), 'B', L.slotOf(1)), 'B', L.slotOf(2));
    expect(L.levelRatios(twice)).toEqual(['1/3']);
    expect(L.discoveryReady(twice)).toBe(false);
  });

  it('move is live and records nothing; evidence carries numbers', () => {
    const m = L.move(lab0, 'B', L.slotOf(4));
    expect(L.positions(m).bp).toBe(4);
    expect(m.trials).toHaveLength(0);
    const s = place(lab0, 4, 6);
    expect(L.evidenceOf(s)).toMatchObject({ mode: 'ladder', bp: 4, cp: 6, ratioB: '2/3', ratioC: '2/3', parallel: true, kind: 'level' });
  });

  it('the ratio line is the student\'s own numbers, reduced when it reduces', () => {
    expect(L.ratioTex(2, 6)).toBe('\\dfrac{2}{6} = \\dfrac{1}{3}');
    expect(L.ratioTex(1, 6)).toBe('\\dfrac{1}{6}');
    expect(L.ratioTex(-3, 9)).toBe('\\dfrac{3}{9} = \\dfrac{1}{3}');
    expect(L.ratiosLine(lab0, { bp: 4, cp: 6 })).toEqual(["$\\dfrac{AB'}{AB} = \\dfrac{4}{6} = \\dfrac{2}{3}$", "$\\dfrac{AC'}{AC} = \\dfrac{6}{9} = \\dfrac{2}{3}$"]);
  });
});

describe('parallel-level — متقدم: نشاط 2 on the X-trestle (AB = 9, AC = 12, ratio 1/3)', () => {
  const lab0 = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });

  it('the three students\' figures: 1 and 2 parallel, 3 refused by the ORDER', () => {
    const f2 = L.reading(lab0, { bp: 3, cp: 4 });
    const f1 = L.reading(lab0, { bp: -3, cp: -4 });
    const f3 = L.reading(lab0, { bp: 3, cp: -4 });
    const f3m = L.reading(lab0, { bp: -3, cp: 4 });
    expect([f2.figure, f1.figure, f3.figure, f3m.figure]).toEqual(['2', '1', '3', '3m']);
    for (const r of [f1, f2, f3, f3m]) { expect(r.condition).toBe(true); expect(r.ratiosEqual).toBe(true); }
    expect([f2.parallel, f1.parallel]).toEqual([true, true]);
    expect(f3).toMatchObject({ parallel: false, sameOrder: false, reason: 'order' });
    expect(f3m).toMatchObject({ parallel: false, reason: 'order' });
  });

  it('the teacher\'s condition refuses any other ratio — even a parallel plank (6 ; 8 is 2/3)', () => {
    const r = L.reading(lab0, { bp: 6, cp: 8 });
    expect(r.parallel).toBe(true);
    expect(r.condition).toBe(false);
    const s = place(lab0, 6, 8);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'condition', figure: null });
  });

  it('discovery opens only once figures 1, 2 and 3 (or its mirror) are made', () => {
    let s = place(lab0, -3, -4);              // (−3 ; 11) ne respecte pas le rapport, puis la figure 1
    expect(s.trials.map((t) => t.kind)).toEqual(['condition', 'figure']);
    expect(L.figuresMade(s)).toEqual(['1']);
    s = L.commit(s, 'B', L.slotOf(3));        // (3 ; −4) : la figure 3, refusée par l'ordre
    expect(s.trials.at(-1)).toMatchObject({ kind: 'order', figure: '3', parallel: false });
    expect(L.discoveryReady(s)).toBe(false);  // il manque la figure 2
    s = L.commit(s, 'C', L.slotOf(4));
    expect(L.figuresMade(s)).toEqual(['1', '3', '2']);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.figureTrial(s, '3')).toMatchObject({ bp: 3, cp: -4 });
    // passer de la figure 2 à la figure 1 en déplaçant une extrémité traverse forcément la figure 3 ou son miroir
    const via = place(place(lab0, 3, 4), -3, -4);
    expect(L.figuresMade(via)).toEqual(['2', '3m', '1']);
    expect(L.discoveryReady(via)).toBe(true);
  });

  it('every placement of every notch pair: the drawing agrees with converse (bubble 0 ⇔ parallel ⇔ flat plank)', () => {
    for (const lab of [lab0, L.init({ AB: 6, AC: 9, mode: 'ladder' })]) {
      for (let sb = lab.rangeB.min; sb <= lab.rangeB.max; sb += 1) {
        for (let sc = lab.rangeC.min; sc <= lab.rangeC.max; sc += 1) {
          const at = { bp: L.abscissaOf(sb), cp: L.abscissaOf(sc) };
          const g = L.geometry(lab, { width: 300, height: 240, at });
          const flat = Math.abs(g.deg) < 1e-6;
          expect(flat, `${lab.mode} ${at.bp};${at.cp}`).toBe(g.parallel);
          if (g.parallel) expect(g.bubble).toBe(0);
          else expect(Math.abs(g.bubble)).toBeGreaterThanOrEqual(L.MIN_BUBBLE);
          // tout le dessin reste dans le cadre
          for (const p of [g.A, g.B, g.C, g.topB, g.topC, g.Bp, g.Cp]) {
            expect(p[0]).toBeGreaterThanOrEqual(0); expect(p[0]).toBeLessThanOrEqual(300);
            expect(p[1]).toBeGreaterThanOrEqual(0); expect(p[1]).toBeLessThanOrEqual(240);
          }
        }
      }
    }
  });

  it('the bubble climbs toward the higher end; the finger projects back to its notch', () => {
    const g = L.geometry(lab0, { width: 400, height: 320, at: { bp: 3, cp: 6 } });
    // C′ plus bas que le parallèle : l'extrémité droite (C′) est plus basse ⇒ bulle vers la gauche
    expect(g.Cp[1]).toBeGreaterThan(g.Bp[1]);
    expect(g.bubble).toBeLessThan(0);
    for (const n of [...g.notchesB, ...g.notchesC.slice(0, 3)]) {
      const end = g.notchesB.includes(n) ? 'B' : 'C';
      const t = g.abscissaAt(end, n.xy[0], n.xy[1]);
      expect(Math.abs(t - n.a)).toBeLessThan(1e-6);
    }
    expect(g.upward('B')).toBe(1);   // B est en bas à gauche : monter vers A va vers la droite
    expect(g.upward('C')).toBe(-1);
  });

  it('refuses impossible configurations', () => {
    expect(() => L.init({ AB: 9, AC: 12, mode: 'side' })).toThrow();
    expect(() => L.init({ AB: 1, AC: 12 })).toThrow();   // le minimum est 2 (conseil L2.6 : l'échelle 2 / 4)
    expect(() => L.init({ AB: 9, AC: 12, ratio: '3/2', mode: 'crossing' })).toThrow();
  });
});

describe('parallel-level — the drawing budget', () => {
  it('naturalHeight fills the width: a wide ladder, a near-square X', () => {
    const ladder = L.init({ AB: 6, AC: 9, mode: 'ladder' });
    const x = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });
    expect(L.naturalHeight(ladder, 600)).toBeLessThan(400);
    expect(L.naturalHeight(x, 600)).toBeGreaterThan(400);
    const g = L.geometry(x, { width: 600, height: L.naturalHeight(x, 600) });
    expect(Math.abs(Math.min(g.topB[1], g.topC[1]) - 26)).toBeLessThan(1);
  });
});

describe('parallel-level — the opening board is never already level, never a trial', () => {
  it('on every authored level the starting board is tilted and nothing is recorded', () => {
    for (const lv of Object.values(LEVELS['parallel-level'])) {
      const s = L.init(lv.numbers);
      const r = L.reading(s);
      expect(r.parallel).toBe(false);
      expect(s.trials).toHaveLength(0);
    }
  });
});

describe('parallel-level — the minimum is 2 (council L2.6: the practice ladder 2 / 4)', () => {
  it('a 2 / 4 ladder: one notch on AB, a single level plank (1 ; 2) = 1/2, the start tilted', () => {
    expect(L.MIN_BAR).toBe(2);
    const s = L.init({ AB: 2, AC: 4, mode: 'ladder' });
    expect(L.slotRange(2, 'ladder')).toEqual({ min: -1, max: -1 });
    expect(L.positions(s)).toEqual({ bp: 1, cp: 3 });
    expect(L.reading(s).parallel).toBe(false);
    const levels = [];
    for (let cp = 1; cp <= 3; cp += 1) if (L.reading(s, { bp: 1, cp }).parallel) levels.push(cp);
    expect(levels).toEqual([2]);
    const g = L.geometry(s, { width: 300, height: 220 });
    for (const p of [g.A, g.B, g.C, g.Bp, g.Cp]) { expect(p[0]).toBeGreaterThanOrEqual(0); expect(p[1]).toBeLessThanOrEqual(220); }
    // the crossing 3 / 6 of the practice rounds: past A up to ⌈2n/3⌉
    expect(L.slotRange(3, 'crossing')).toEqual({ min: -2, max: 1 });
  });
  it('nothing else assumes 3: every bar from 2 to 30 initialises, its start is tilted, its notches are distinct', () => {
    for (let n = 2; n <= 30; n += 1) {
      for (const mode of ['ladder', 'crossing']) {
        const s = L.init({ AB: n, AC: n + 2 > 30 ? 30 : n + 2, mode });
        expect(s.trials).toHaveLength(0);
        const g = L.geometry(s, { width: 320, height: 260 });
        expect(new Set(g.notchesB.map((x) => x.a)).size).toBe(g.notchesB.length);
      }
    }
  });
});

describe('parallel-level — the X-trestle WITHOUT an imposed ratio (mission player rounds)', () => {
  const free = L.init({ AB: 8, AC: 12, mode: 'crossing' });
  it('a trial is never « condition » (bug fixed): level → figure, equal ratios on opposite sides → order, else tilted', () => {
    expect(L.commit(L.move(free, 'B', L.slotOf(2)), 'C', L.slotOf(3)).trials.at(-1)).toMatchObject({ kind: 'figure', figure: '2', parallel: true });
    expect(L.commit(L.move(free, 'B', L.slotOf(-2)), 'C', L.slotOf(-3)).trials.at(-1)).toMatchObject({ kind: 'figure', figure: '1' });
    expect(L.commit(L.move(free, 'B', L.slotOf(2)), 'C', L.slotOf(-3)).trials.at(-1)).toMatchObject({ kind: 'order', figure: '3', parallel: false });
    expect(L.commit(L.move(free, 'B', L.slotOf(2)), 'C', L.slotOf(5)).trials.at(-1)).toMatchObject({ kind: 'tilted', figure: null });
    for (let sb = free.rangeB.min; sb <= free.rangeB.max; sb += 1) {
      for (let sc = free.rangeC.min; sc <= free.rangeC.max; sc += 1) {
        expect(L.commit(L.move(free, 'B', sb), 'C', sc).trials.at(-1).kind).not.toBe('condition');
      }
    }
  });
  it('with the teacher\'s ratio nothing changes (the page\'s نشاط 2)', () => {
    const t = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });
    expect(L.commit(L.move(t, 'B', L.slotOf(2)), 'C', L.slotOf(5)).trials.at(-1).kind).toBe('condition');
  });
});

describe('parallel-level — the player helpers (verdict, chips, predictions, coach, shown values)', () => {
  it('verdictOf: ladder → the rung of B′; crossing → the figure (0 for a ratio the teacher refuses)', () => {
    const lad = L.init({ AB: 3, AC: 6 });
    const a = L.commit(L.move(lad, 'B', L.slotOf(1)), 'C', L.slotOf(2));
    expect(L.verdictOf(a, a.trials.at(-1))).toEqual({ groups: 1, exact: true });
    const t = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });
    const f1 = L.commit(L.move(t, 'B', L.slotOf(-3)), 'C', L.slotOf(-4));
    expect(L.verdictOf(f1, f1.trials.at(-1))).toEqual({ groups: 1, exact: true });
    const bad = L.commit(L.move(t, 'B', L.slotOf(6)), 'C', L.slotOf(8));
    expect(L.verdictOf(bad, bad.trials.at(-1))).toEqual({ groups: 0, exact: false });
    const f3 = L.commit(L.move(t, 'B', L.slotOf(-3)), 'C', L.slotOf(4));
    expect(L.verdictOf(f3, f3.trials.at(-1))).toEqual({ groups: 3, exact: false });
  });
  it('chipOptions: three distinct exact values, one right; the ladder offers AB′/BB′, the X-trestle never does', () => {
    const lad = L.init({ AB: 3, AC: 6 });
    const b = L.chipOptions(lad, 'B', { bp: 1, cp: 2 });
    expect(b.map((o) => o.text).sort()).toEqual(['1/2', '1/3', '3']);
    expect(b.filter((o) => o.right).map((o) => o.text)).toEqual(['1/3']);
    const x = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });
    for (let a = -6; a <= 8; a += 1) {
      if (a === 0) continue;
      const o = L.chipOptions(x, 'B', { bp: a, cp: 4 });
      expect(new Set(o.map((y) => y.text)).size).toBe(3);
      expect(o.filter((y) => y.right)).toHaveLength(1);
      expect(o.some((y) => y.why === 'rest')).toBe(false);
    }
  });
  it('predictions are judged by a trial of the same configuration, or all at the end', () => {
    const t = L.init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' });
    const preds = [{ key: 'p1', at: [3, 6] }, { key: 'p2', at: [-3, -4] }];
    expect(L.predictTruth(t, [3, 6])).toBe('no');
    expect(L.predictTruth(t, [-3, -4])).toBe('yes');
    const s = L.commit(L.move(t, 'B', L.slotOf(-3)), 'C', L.slotOf(-4));
    expect(L.judgedPredictions(s, preds)).toEqual(['p2']);
    expect(L.judgedPredictions(s, preds, true)).toEqual(['p1', 'p2']);
  });
  it('coachOf points at the gesture, never at a notch', () => {
    const s = L.init({ AB: 3, AC: 6 });
    expect(L.coachOf(s, {}).id).toBe('dragB');
    expect(L.coachOf(s, { moved: { B: true } }).id).toBe('dragC');
    expect(L.coachOf(s, { moved: { B: true, C: true }, picking: true, picksDone: false }).id).toBe('pick');
    expect(L.coachOf(s, { moved: { B: true, C: true } }).id).toBe('press');
    expect(L.coachOf(s, { done: true })).toBeNull();
    const two = L.commit(L.commit(s, 'B', L.slotOf(2)), 'C', L.slotOf(3));
    expect(L.coachOf(two, { moved: { B: true, C: true } }).target).toBe('[data-pl-journal]');
    for (const ctx of [{}, { moved: { B: true } }, { moved: { B: true, C: true } }]) expect(L.coachOf(s, ctx).target).not.toMatch(/notch/);
  });
  it('shownValues lists the bars, every notch, every reachable ratio and every chip with its role', () => {
    const v = L.shownValues({ AB: 3, AC: 6, mode: 'ladder' });
    expect(v).toContainEqual({ role: 'bar', v: '6' });
    expect(v).toContainEqual({ role: 'ratio', v: '1/3' });
    expect(v).toContainEqual({ role: 'decoy', v: '3' });
    const w = L.shownValues({ AB: 6, AC: 9, mode: 'crossing', choices: [[14, 21]] });
    expect(w).toContainEqual({ role: 'bar', v: '21' });
  });
});
