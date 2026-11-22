import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';
import { EXERCISES } from './exercises';
import { PREP_ITEMS, LAB } from './textbook';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/**
 * Les figures du درس « خواص الدوران وتوظيفها في الأشكال الهندسية » disent VRAI : chaque réponse que la leçon affirme
 * (réponses, corrections, distracteurs déclarés faux) est recalculée ici avec rotation.js sur les points dessinés.
 */
const f = (p) => ({ x: p[0], y: p[1] });
const P = (p) => V.point(p[0], p[1]);
const txt = (p) => `${Lin.fracText(p.x)};${Lin.fracText(p.y)}`;
const near = (a, b, eps = 1e-3) => Math.hypot(a.x - b[0], a.y - b[1]) < eps;

describe('figures — données GeoFigure valides et lisibles (guide §5 « Textbook figures »)', () => {
  const figs = Object.entries(FIG).filter(([, v]) => v && v.points && v.ariaLabel);
  it('il y a des figures', () => expect(figs.length).toBeGreaterThan(12));
  it.each(figs)('%s : validateGeoFigure et figureQuality vides', (name, fig) => {
    expect(validateGeoFigure(fig), name).toEqual([]);
    expect(figureQuality(fig), name).toEqual([]);
  });
});

describe('معارف 3 — l’exemple redessiné : 20° direct, AB = 2, alignement conservé', () => {
  const F = FIG.FIG_KNOW3.points;
  it('chaque prime est l’image par (O, 20°, direct) ; A′B′ = AB = 2 ; A′, B′, C′ alignés', () => {
    for (const n of ['A', 'B', 'C']) expect(R.imageCheck(f(F.O), f(F[n]), f(F[`${n}'`]), 20, 'direct', { tol: 1e-3, tolDeg: 0.1 }).ok, n).toBe(true);
    expect(Math.hypot(F["B'"][0] - F["A'"][0], F["B'"][1] - F["A'"][1])).toBeCloseTo(2, 2);
    const d = (F["B'"][0] - F["A'"][0]) * (F["C'"][1] - F["A'"][1]) - (F["B'"][1] - F["A'"][1]) * (F["C'"][0] - F["A'"][0]);
    expect(Math.abs(d)).toBeLessThan(0.01);
    // la redisposition sépare les deux droites : aucune image à moins d'une unité de son point
    for (const n of ['A', 'B', 'C']) expect(Math.hypot(F[n][0] - F[`${n}'`][0], F[n][1] - F[`${n}'`][1])).toBeGreaterThan(1);
  });
});

describe('ajout — une droite et son image par 90° sont perpendiculaires', () => {
  const F = FIG.FIG_PERP.points;
  it('(E′F′) ⊥ (EF)', () => expect(R.lineAngle(f(F.E), f(F.F), f(F["E'"]), f(F["F'"]))).toBeCloseTo(90, 6));
});

describe('طرائق p. 155 — [BD] image de [AC] par (O, 90°, direct)', () => {
  const F = FIG.METHOD_PTS;
  it('B = rot(A), D = rot(C) exactement ; AC = BD = √41 ; (AC) ⊥ (BD) ; le sens indirect ne marche pas', () => {
    expect(txt(R.rotate(P(F.A), P(F.O), 90, 'direct'))).toBe('2;4');
    expect(txt(R.rotate(P(F.C), P(F.O), 90, 'direct'))).toBe('-2;-1');
    expect(V.distanceText(P(F.A), P(F.C))).toBe('√41');
    expect(V.distanceText(P(F.B), P(F.D))).toBe('√41');
    expect(R.lineAngle(f(F.A), f(F.C), f(F.B), f(F.D))).toBeCloseTo(90, 6);
    expect(txt(R.rotate(P(F.A), P(F.O), 90, 'indirect'))).not.toBe('2;4');
    // OAB, OCD rectangles isocèles EN O
    expect(R.angleAt(f(F.A), f(F.O), f(F.B))).toBeCloseTo(90, 9);
    expect(V.distanceText(P(F.O), P(F.A))).toBe(V.distanceText(P(F.O), P(F.B)));
    expect(V.distanceText(P(F.O), P(F.C))).toBe(V.distanceText(P(F.O), P(F.D)));
  });
  it('le niveau متقدم du lab porte exactement ces points (levels.js = content/textbook.js › LAB)', () => {
    expect(LEVELS['shape-turn'].advanced.numbers).toEqual(LAB.advanced.numbers);
    expect(LEVELS['shape-turn'].beginner.numbers).toEqual(LAB.beginner.numbers);
    const { O, ...rest } = F;
    expect(LAB.advanced.numbers.points).toEqual(rest);
    expect(LAB.advanced.numbers.center).toEqual(O);
  });
});

describe('دوري الآن — l’image d’un angle de 45° par (K, 60°, direct), redessinée', () => {
  const F = FIG.FIG_NOW155_SOL.points;
  it('∠AOB = ∠A′O′B′ = 45° ; chaque prime est l’image par (K, 60°) ; avec le K du manuel, B′ tombait sur A', () => {
    expect(R.angleAt(f(F.A), f(F.O), f(F.B))).toBeCloseTo(45, 1);
    expect(R.angleAt(f(F["A'"]), f(F["O'"]), f(F["B'"]))).toBeCloseTo(45, 1);
    for (const n of ['O', 'A', 'B']) expect(R.imageCheck(f(F.K), f(F[n]), f(F[`${n}'`]), 60, 'direct', { tol: 1e-3, tolDeg: 0.1 }).ok, n).toBe(true);
    const old = R.rotateApprox(f(F.B), { x: 1.5, y: -0.7 }, 60);
    expect(Math.hypot(old.x - F.A[0], old.y - F.A[1])).toBeLessThan(0.35);
  });
});

describe('تمرين 4 — le carré ABA′C, puis (C, 45°)', () => {
  const F = FIG.EX4_PTS;
  it('A′ = (3 ; 3) par (B, 90°, indirect) ; ABA′C carré ; le sens direct donne (3 ; −3)', () => {
    expect(txt(R.rotate(P(F.A), P(F.B), 90, 'indirect'))).toBe('3;3');
    expect(FIG.EX4_AP).toEqual([3, 3]);
    expect(txt(R.rotate(P(F.A), P(F.B), 90, 'direct'))).toBe('3;-3');
    expect(V.quadNature(P(F.A), P(F.B), P([3, 3]), P(F.C))).toBe('square');
  });
  it('A1, B1 par (C, 45°, direct) : CA1 = CA, B1 sur (CA′) (y = 3), CA1B1 rectangle isocèle en A1', () => {
    const [a1, b1] = [FIG.EX4_A1, FIG.EX4_B1];
    expect(Math.hypot(a1[0] - F.C[0], a1[1] - F.C[1])).toBeCloseTo(3, 2);
    expect(R.angleAt(f(F.A), f(F.C), f(a1))).toBeCloseTo(45, 1);
    expect(b1[1]).toBeCloseTo(3, 3);
    expect(R.angleAt(f(F.C), f(a1), f(b1))).toBeCloseTo(90, 1);
    expect(R.angleAt(f(F.A), f(F.C), { x: a1[0], y: a1[1] })).not.toBeCloseTo(90, 0); // distracteur « 90° »
  });
});

describe('تمرين 8 — les cinq دورانات de la figure', () => {
  const F = FIG.EX8_PTS;
  const ok = (O, a, b, alpha, dir) => R.imageCheck(f(F[O]), f(F[a]), f(F[b]), alpha, dir, { tol: 1e-3, tolDeg: 0.2 }).ok;
  it('les réponses', () => {
    expect(ok('A', 'B', 'C', 60, 'direct')).toBe(true);
    expect(ok('O', 'B', 'C', 90, 'indirect')).toBe(true); // la seconde réponse juste, jamais un distracteur
    expect(ok('O', 'B', 'E', 90, 'direct')).toBe(true);
    expect(ok('O', 'E', 'D', 90, 'direct')).toBe(true);
    expect(ok('E', 'D', 'M', 180, 'direct')).toBe(true);
    expect(ok('E', 'B', 'M', 90, 'direct')).toBe(true);
  });
  it('les distracteurs sont faux', () => {
    expect(ok('A', 'B', 'C', 60, 'indirect')).toBe(false);
    expect(ok('O', 'B', 'C', 90, 'direct')).toBe(false);
    expect(ok('O', 'B', 'E', 90, 'indirect')).toBe(false);
    expect(ok('O', 'B', 'E', 180, 'direct')).toBe(false);
    expect(ok('O', 'E', 'D', 90, 'indirect')).toBe(false);
    expect(ok('E', 'E', 'D', 90, 'direct')).toBe(false);
    expect(ok('E', 'D', 'M', 90, 'direct')).toBe(false);
    expect(ok('O', 'D', 'M', 180, 'direct')).toBe(false);
    expect(ok('E', 'B', 'M', 90, 'indirect')).toBe(false);
    expect(ok('O', 'B', 'M', 90, 'direct')).toBe(false);
    // A à sa vraie hauteur : ABC équilatéral
    expect(Math.hypot(F.A[0] - F.B[0], F.A[1] - F.B[1])).toBeCloseTo(2, 3);
  });
});

describe('تمرين 17 (BEM) — E milieu, D par (E, 180°), ABDC rectangle (ABCD croisé)', () => {
  const A = P([0, 4]); const B = P([-3, 1]); const C = P([5, -1]);
  it('E(1 ; 0), D(2 ; −4), AB² = 18, AC² = 50, AD² = BC² = 68', () => {
    const E = V.midpoint(B, C);
    expect(txt(E)).toBe('1;0');
    const D = R.rotate(A, E, 180);
    expect(txt(D)).toBe('2;-4');
    expect(Lin.fracText(V.distanceSquared(A, B))).toBe('18');
    expect(Lin.fracText(V.distanceSquared(A, C))).toBe('50');
    expect(Lin.fracText(V.distanceSquared(A, D))).toBe('68');
    expect(Lin.fracText(V.distanceSquared(B, C))).toBe('68');
    expect(V.quadNature(A, B, D, C)).toBe('rectangle');
    expect(V.isParallelogram(A, B, C, D)).toBe(false);
    expect(FIG.FIG_EX17_SOL.points.D).toEqual([2, -4]);
  });
  it('les clés de l’exercice', () => {
    const ex = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
    expect(ex['ex-17-a'].question.expected).toEqual({ x: '1', y: '0' });
    expect(ex['ex-17-b'].question.expected).toEqual({ x: '2', y: '-4' });
  });
});

describe('تمرين 18 — les centres O et W (figure complétée)', () => {
  const F = FIG.EX18_PTS;
  it('O(3/2 ; 3/2) et W(2 ; 4), 90° direct ; [MM′] et [NN′] ont la même médiatrice', () => {
    expect(txt(R.rotationCenter(P(F.A), P(F["A'"]), P(F.B), P(F["B'"])))).toBe('3/2;3/2');
    expect(txt(R.rotationCenter(P(F.M), P(F["M'"]), P(F.P), P(F["P'"])))).toBe('2;4');
    expect(R.rotationCenter(P(F.M), P(F["M'"]), P(F.N), P(F["N'"]))).toBeNull();
    for (const n of ['M', 'N', 'P']) expect(txt(R.rotate(P(F[n]), P([2, 4]), 90, 'direct'))).toBe(`${F[`${n}'`][0]};${F[`${n}'`][1]}`);
    for (const n of ['A', 'B']) expect(near(R.rotateApprox(f(F[n]), { x: 1.5, y: 1.5 }, 90), F[`${n}'`])).toBe(true);
    // les distracteurs de ex-18-a : le milieu de [AA′] et l'intersection de (AA′) et (BB′) ne sont pas O
    expect(R.onBisector(P(F.B), P(F["B'"]), V.midpoint(P(F.A), P(F["A'"])))).toBe(false);
    expect(R.onBisector(P(F.A), P(F["A'"]), P(['3/2', '1/4']))).toBe(false);
    expect(R.lineAngle(f(F.A), f(F["A'"]), f(F.B), f(F["B'"]))).toBeGreaterThan(1); // les droites se coupent
  });
  it('les clés', () => {
    const ex = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
    expect(ex['ex-18-b'].question.expected).toEqual({ x: '3/2', y: '3/2' });
    expect(ex['ex-18-c'].question.expected).toEqual({ x: '2', y: '4' });
  });
});

describe('إختبار أولي — E4 : (O, 90°, indirect) envoie B sur K ; L et N sont les autres sens', () => {
  const F = FIG.FIG_E4.points;
  it('K, L, N', () => {
    expect(txt(R.rotate(P(F.B), P(F.O), 90, 'indirect'))).toBe(`${F.K[0]};${F.K[1]}`);
    expect(txt(R.rotate(P(F.B), P(F.O), 90, 'direct'))).toBe(`${F.L[0]};${F.L[1]}`);
    expect(txt(R.rotate(P(F.B), P(F.O), 180))).toBe(`${F.N[0]};${F.N[1]}`);
  });
});

describe('أستعدّ', () => {
  it('sept affirmations, les deux réponses présentes, l’item du manuel faux (BC = AB√2)', () => {
    expect(PREP_ITEMS).toHaveLength(7);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
    const F = FIG.FIG_PREP2.points;
    expect(Math.hypot(F.B[0] - F.C[0], F.B[1] - F.C[1])).not.toBeCloseTo(Math.hypot(F.A[0] - F.B[0], F.A[1] - F.B[1]), 2);
  });
});

describe('banc d’exercices — 50 exercices, chaque statement.figure lisible (figureQuality)', () => {
  it('10 par niveau', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const root = new URL('../../../../../../../../../../content/practice/4am/khawas-dawaran/', import.meta.url);
    let n = 0;
    for (const lv of readdirSync(root)) {
      const files = readdirSync(new URL(`${lv}/`, root));
      expect(files, lv).toHaveLength(10);
      for (const file of files) {
        const ex = JSON.parse(readFileSync(new URL(`${lv}/${file}`, root), 'utf8'));
        n += 1;
        const fig = ex.statement.figure;
        if (!fig) continue;
        expect(validateGeoFigure(fig), ex.id).toEqual([]);
        expect(figureQuality(fig), ex.id).toEqual([]);
      }
    }
    expect(n).toBe(50);
  });
});
