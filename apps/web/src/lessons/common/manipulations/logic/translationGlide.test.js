import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as L from './translationGlide';
import { LEVELS } from '../levels';

/**
 * translation-glide — la logique du spectacle de drones, sur les nombres du نشاط 1 (p. 128) et de la balise (3 ; 1).
 * Chaque verdict vient de vectors.relation ; ici on vérifie ce que l'élève RENCONTRE : ce qui est refusé, avec
 * quelle raison, ce qui suit le meneur, et quand la découverte s'ouvre.
 */
const show = () => L.init(LEVELS['translation-glide'].beginner.numbers);
const act1 = () => L.init(LEVELS['translation-glide'].advanced.numbers);

describe('compare — ce qui diffère (المنحى، الاتجاه، الطول)', () => {
  it('nomme l’élément qui diffère', () => {
    expect(L.compare([3, 1], [3, 1]).kind).toBe('equal');
    expect(L.compare([3, 1], [-3, -1]).kind).toBe('sense');
    expect(L.compare([3, 1], [6, 2]).kind).toBe('length');
    expect(L.compare([3, 1], [-6, -2]).kind).toBe('senseLength');
    expect(L.compare([3, 1], [1, 3]).kind).toBe('direction');
    expect(L.compare([3, 1], [0, 0]).kind).toBe('zero');
  });
  it('la figure redessinée : GL et EF (منحى), RP et EF (اتجاه), AG et KH (طول)', () => {
    const P = L.ACT1;
    const G = [2, 4]; const Lp = [0, 4]; const E = [4, 3]; const F = [4, 5]; const R = [12, 7]; const Pp = [12, 5];
    const v = (a, b) => [b[0] - a[0], b[1] - a[1]];
    expect(L.compare(v(E, F), v(G, Lp)).kind).toBe('direction');
    expect(L.compare(v(E, F), v(R, Pp)).kind).toBe('sense');
    expect(L.compare(v(P.drones.A, G), v(P.drones.K, [4, 7])).kind).toBe('length');
  });
  it('les longueurs exactes en carreaux', () => {
    expect(L.lengthOf([3, 1]).text).toBe('√10');
    expect(L.lengthOf([0, 5]).text).toBe('5');
    expect(L.lengthOf([2, 2]).text).toBe('2√2');
    expect(L.approx(Math.sqrt(10))).toBe('3,16');
  });
});

describe('scène show (مبتدئ) — le meneur porte la flèche', () => {
  it('rien ne se pose avant le vecteur', () => {
    const s = L.place(show(), 'B', [6, 2]);
    expect(s.last.kind).toBe('noVector');
    expect(s.trials).toHaveLength(0);
  });
  it('la balise du plan (3 ; 1) est une orientation, pas une contrainte', () => {
    const s0 = show();
    expect(s0.beacon).toEqual([4, 2]);
    const s = L.setVector(s0, [3, 3]);
    expect(L.vectorOf(s)).toEqual([2, 2]);
    expect(s.trials[0]).toMatchObject({ kind: 'leader', ok: true });
  });
  it('refuse un meneur immobile ou une formation qui sortirait du ciel', () => {
    expect(L.setVector(show(), [1, 1]).last.kind).toBe('zero');
    const out = L.setVector(show(), [9, 1]);
    expect(out.last).toMatchObject({ kind: 'outside', name: 'B' });
    expect(L.vectorOf(out)).toBeNull();
  });
  it('B′ refusé en nommant ce qui diffère, accepté seulement à B + u', () => {
    let s = L.setVector(show(), [4, 2]);
    s = L.place(s, 'B', [0, 0]); // B(3;1) → (0;0) : (−3 ; −1) = −u
    expect(s.last).toMatchObject({ kind: 'sense', ok: false });
    s = L.place(s, 'B', [9, 3]); // (6 ; 2) = 2u
    expect(s.last.kind).toBe('length');
    s = L.place(s, 'B', [4, 4]); // (1 ; 3)
    expect(s.last.kind).toBe('direction');
    expect(L.imagesDone(s)).toBe(false);
    s = L.place(s, 'B', [6, 2]);
    expect(s.last).toMatchObject({ kind: 'equal', ok: true, name: "B'" });
    expect(L.imageOf(s, 'B')).toEqual([6, 2]);
  });
  it('déplacer A′ fait glisser toute la formation posée (P′ = P + u)', () => {
    let s = L.setVector(show(), [4, 2]);
    s = L.place(s, 'B', [6, 2]);
    s = L.setVector(s, [2, 3]);
    expect(L.imageOf(s, 'B')).toEqual([4, 3]);
    expect(V.vecEq(V.vec(V.point(3, 1), V.point(4, 3)), V.vec(V.point(1, 1), V.point(2, 3)))).toBe(true);
  });
  it('le drone égaré arrive avec −u, refuse tout sauf u, et ouvre la découverte une fois réparé', () => {
    let s = L.setVector(show(), [4, 2]);
    s = L.place(L.place(s, 'B', [6, 2]), 'C', [5, 4]);
    expect(L.imagesDone(s)).toBe(true);
    const r = L.rogueArrow(s);
    expect(r).not.toBeNull();
    expect(L.compare([3, 1], [r.tip[0] - r.at[0], r.tip[1] - r.at[1]]).kind).toBe('sense');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.fixRogue(s, r.tip); // laisser la flèche −u : refusé
    expect(s.last).toMatchObject({ rogue: true, kind: 'sense', ok: false });
    s = L.fixRogue(s, [r.at[0] + 3, r.at[1] + 1]);
    expect(s.last.ok).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('le parallélogramme ABB′A′ (pont vers معارف 2), plat si u // (AB)', () => {
    let s = L.place(L.setVector(show(), [4, 2]), 'B', [6, 2]);
    const pg = L.parallelogram(s);
    expect(pg.names).toEqual(['A', 'B', "B'", "A'"]);
    expect(pg.flat).toBe(false);
    expect(V.isParallelogram(...pg.points.map((p) => V.point(...p)))).toBe(true);
    s = L.place(L.setVector(show(), [3, 1]), 'B', [5, 1]); // u = (2 ; 0) // (AB)
    expect(L.parallelogram(s).flat).toBe(true);
  });
  it('balayage : pour chaque meneur admissible, le drone égaré trouve une place valable', () => {
    const s0 = show();
    let admissible = 0;
    for (let x = 0; x <= s0.grid[0]; x += 1) {
      for (let y = 0; y <= s0.grid[1]; y += 1) {
        let s = L.setVector(s0, [x, y]);
        if (!L.vectorOf(s)) continue;
        const u = L.vectorOf(s);
        s = L.place(s, 'B', [s.drones.B[0] + u[0], s.drones.B[1] + u[1]]);
        s = L.place(s, 'C', [s.drones.C[0] + u[0], s.drones.C[1] + u[1]]);
        if (!L.imagesDone(s)) continue;
        admissible += 1;
        const r = L.rogueArrow(s);
        expect(r, `u = ${u}`).not.toBeNull();
        for (const p of [r.at, r.tip, [r.at[0] + u[0], r.at[1] + u[1]]]) {
          expect(p[0] >= 0 && p[0] <= s.grid[0] && p[1] >= 0 && p[1] <= s.grid[1], `u = ${u}`).toBe(true);
        }
      }
    }
    expect(admissible).toBeGreaterThan(15);
  });
});

describe('scène act1 (متقدم) — le نشاط 1 du manuel', () => {
  it('les quatre translations et leurs images sont les points de la figure (content/figures.js › ACT1_POINTS)', () => {
    const s = act1();
    const fig = { Q: [4, 1], E: [4, 3], S: [10, 8], P: [12, 5], N: [13, 1], T: [13, 3], "C'": [7, 1], D: [7, 3], H: [4, 7] };
    for (const [t, tb] of s.tableaux.entries()) {
      for (const [from, name] of tb.place) {
        const img = [s.drones[from][0] + tb.u[0], s.drones[from][1] + tb.u[1]];
        expect(img, `${tb.id} ${from}`).toEqual(fig[name]);
        const next = L.place(L.goTo(s, t), from, img);
        expect(next.last.ok).toBe(true);
      }
    }
    expect(s.tableaux.map((tb) => tb.u)).toEqual([[-6, 0], [2, 4], [3, 0], [-3, 0]]);
  });
  it('A ↦ G et A ↦ M : même منحى, اتجاه et طول différents ; K ↦ H est la translation A ↦ A′', () => {
    const s = act1();
    expect(L.compare(s.tableaux[0].u, s.tableaux[2].u).kind).toBe('senseLength');
    expect(L.compare(s.tableaux[3].u, [4 - 7, 0]).kind).toBe('equal');
  });
  it('découverte après les quatre tableaux seulement', () => {
    let s = act1();
    for (let t = 0; t < s.tableaux.length; t += 1) {
      expect(L.discoveryReady(s)).toBe(false);
      s = L.goTo(s, t);
      for (const [from] of s.tableaux[t].place) s = L.place(s, from, [s.drones[from][0] + s.tableaux[t].u[0], s.drones[from][1] + s.tableaux[t].u[1]]);
      expect(L.tableauDone(s, t)).toBe(true);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.summaryOf(s).tableaux.every((t) => t.done)).toBe(true);
  });
  it('une image du tableau C ↦ R posée comme pour A ↦ G est refusée par la direction', () => {
    const s = L.place(L.goTo(act1(), 1), 'A', [2, 4]);
    expect(s.last).toMatchObject({ kind: 'direction', ok: false });
  });
});

describe('layout — la grille tient la scène, carreaux carrés', () => {
  it('balayage des largeurs et hauteurs', () => {
    for (const lab of [show(), act1()]) {
      for (const width of [200, 280, 360, 520, 760]) {
        for (const height of [220, 360, 560]) {
          const g = L.layout(lab, { width, height, sea: 30 });
          const [x0, y0] = g.toPx([0, lab.grid[1]]); const [x1, y1] = g.toPx([lab.grid[0], 0]);
          expect(x0).toBeGreaterThanOrEqual(0); expect(x1).toBeLessThanOrEqual(width + 1e-6);
          expect(y0).toBeGreaterThanOrEqual(0); expect(y1).toBeLessThanOrEqual(height + 1e-6);
          const back = g.fromPx(...g.toPx([2, 3]));
          expect(back[0]).toBeCloseTo(2); expect(back[1]).toBeCloseTo(3);
        }
      }
    }
  });
  it('nodeNear borne à la grille', () => {
    expect(L.nodeNear(show(), -3.2, 7.6)).toEqual([0, 6]);
    expect(L.nudge(show(), [9, 6], 1, 1)).toEqual([9, 6]);
  });
});
