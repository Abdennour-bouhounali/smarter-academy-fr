import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';
import { EXERCISES, EX } from './exercises';
import { PREP_ITEMS, LAB } from './textbook';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import * as LAB_LOGIC from '../../../../../../common/manipulations/logic/componentSteps';

/**
 * Les figures du درس « قراءة مركبتي شعاع وتمثيلهما في معلم » disent VRAI : chaque composante que la leçon affirme
 * (réponses, corrections, distracteurs déclarés faux) est recalculée ici avec vectors.js sur les points dessinés.
 */
const pt = (fig, n) => V.point(...fig.points[n]);
const comps = (fig, a, b) => V.coords(V.vec(pt(fig, a), pt(fig, b)));
const ALL = () => {
  const out = [];
  for (const [name, fig] of Object.entries(FIG)) {
    if (fig && fig.points && fig.ariaLabel) out.push([name, fig]);
    else if (fig && typeof fig === 'object') for (const [k, f] of Object.entries(fig)) if (f && f.points) out.push([`${name}.${k}`, f]);
  }
  return out;
};

describe('figures — données GeoFigure valides et lisibles', () => {
  it('chaque figure exportée passe validateGeoFigure', () => {
    const figs = ALL();
    expect(figs.length).toBeGreaterThan(14);
    for (const [name, fig] of figs) expect(validateGeoFigure(fig), name).toEqual([]);
  });
  it('figureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5 « Textbook figures »)', () => {
    for (const [name, fig] of ALL()) expect(figureQuality(fig), name).toEqual([]);
  });
  it('les figures quadrillées sont GRANDES (≥ 420 px) et les quatre معالم côte à côte', () => {
    for (const [name, fig] of ALL()) if (fig.grid) expect(fig.maxWidth ?? 540, name).toBeGreaterThanOrEqual(420);
    expect(Object.keys(FIG.FIG_KNOW2)).toHaveLength(4);
  });
});

describe('نشاط 1 — A, B, C du manuel et D', () => {
  const F = FIG.FIG_ACT1;
  it('AC = (8 ; 0), CB = (0 ; −2), AB = (8 ; −2) — les étiquettes « 8 » et « −2 » du manuel', () => {
    expect(comps(F, 'A', 'C')).toEqual([8, 0]);
    expect(comps(F, 'C', 'B')).toEqual([0, -2]);
    expect(comps(F, 'A', 'B')).toEqual([8, -2]);
    expect(F.segments.map((s) => s.label)).toEqual(['8', '−2']);
  });
  it('BD = (−3 ; −4) ; OA … OD sont les coordonnées ; les mêmes points que le lab متقدم', () => {
    const D = FIG.FIG_ACT1_D;
    expect(comps(D, 'B', 'D')).toEqual([-3, -4]);
    expect(comps(D, 'B', 'K')).toEqual([-3, 0]);
    for (const n of ['A', 'B', 'C', 'D']) expect(comps(D, 'O', n)).toEqual(D.points[n]);
    const lab = LEVELS['component-steps'].advanced.numbers;
    for (const n of ['A', 'B', 'C', 'D']) expect(lab.points[n], n).toEqual(D.points[n]);
    expect(LAB.advanced.numbers).toEqual(lab);
    expect(LAB.beginner.numbers).toEqual(LEVELS['component-steps'].beginner.numbers);
  });
  it('les distracteurs de la question 3 sont faux : (8 ; 2), (−2 ; 8), (6 ; 2)', () => {
    for (const w of [[8, 2], [-2, 8], [6, 2]]) expect(V.vecEq(V.point(...w), V.vec(pt(F, 'A'), pt(F, 'B')))).toBe(false);
    expect(comps(F, 'O', 'B')).toEqual([6, 2]); // c'est l'adresse de B
  });
});

describe('معارف', () => {
  it('معارف 3 أ : AB = (7 ; 3) « +7 puis +3 », CD = (−5 ; 1) « −5 puis +1 »', () => {
    const F = FIG.FIG_KNOW3;
    expect(comps(F, 'A', 'B')).toEqual([7, 3]);
    expect(comps(F, 'C', 'D')).toEqual([-5, 1]);
    expect(comps(F, 'A', 'K')).toEqual([7, 0]);
    expect(comps(F, 'C', 'L')).toEqual([-5, 0]);
  });
  it('معارف 1 : OB = (−3 ; 4) ; la plateforme : EF = (4 ; 3), GH = (−2 ; −4) ; distracteurs faux', () => {
    expect(comps(FIG.FIG_KNOW1, 'O', 'B')).toEqual([-3, 4]);
    expect(comps(FIG.FIG_READ, 'E', 'F')).toEqual([4, 3]);
    expect(comps(FIG.FIG_READ, 'G', 'H')).toEqual([-2, -4]);
    expect(FIG.FIG_READ.points.F).toEqual([0, 1]);
    expect(FIG.FIG_READ.points.H).toEqual([2, -1]);
  });
  it('معارف 2 : dans chaque معلم, A = 3·OI + 2·OJ', () => {
    for (const fig of Object.values(FIG.FIG_KNOW2)) {
      const { I, J, A } = fig.points;
      expect(A[0]).toBeCloseTo(3 * I[0] + 2 * J[0]);
      expect(A[1]).toBeCloseTo(3 * I[1] + 2 * J[1]);
    }
  });
});

describe('طرائق — u(3 ; −4)', () => {
  const F = FIG.FIG_METHOD;
  it('A(−2 ; 1) → A₁(1 ; 1) → B(1 ; −3) ; EF = AB ; EABF متوازي أضلاع, EAFB et EBAF non', () => {
    expect(comps(F, 'A', 'A₁')).toEqual([3, 0]);
    expect(comps(F, 'A₁', 'B')).toEqual([0, -4]);
    expect(comps(F, 'A', 'B')).toEqual([3, -4]);
    expect(comps(F, 'E', 'F')).toEqual([3, -4]);
    const P = (n) => pt(F, n);
    expect(V.isParallelogram(P('E'), P('A'), P('B'), P('F'))).toBe(true);
    expect(V.isParallelogram(P('E'), P('A'), P('F'), P('B'))).toBe(false);
    expect(V.isParallelogram(P('E'), P('B'), P('A'), P('F'))).toBe(false);
  });
  it('دوري الآن (lab posé seul) : u depuis R et O, v depuis S, mènent à U, W, V', () => {
    const lab = LAB_LOGIC.init(LAB.draw.numbers);
    for (const o of lab.orders) expect(LAB_LOGIC.targetOf(lab, o), o.id).toEqual(lab.points[o.to]);
    // la question du module : w(−4 ; −1) depuis K(2 ; 3) → (−2 ; 2)
    expect(V.coords(V.translate(V.point(2, 3), V.point(-4, -1)))).toEqual([-2, 2]);
  });
});

describe('أوظّف — les réponses des exercices', () => {
  it('ex-1 : AB = (4 ; −5), DC = (3 ; 1), ABCD n’est pas un parallélogramme', () => {
    const F = FIG.FIG_EX1;
    expect(comps(F, 'A', 'B')).toEqual([4, -5]);
    expect(comps(F, 'D', 'C')).toEqual([3, 1]);
    expect(V.isParallelogram(pt(F, 'A'), pt(F, 'B'), pt(F, 'C'), pt(F, 'D'))).toBe(false);
  });
  it('ex-2 : OD = (7 ; −2), OF = (0 ; −2)', () => {
    expect(comps(FIG.FIG_EX2, 'O', 'D')).toEqual([7, -2]);
    expect(comps(FIG.FIG_EX2, 'O', 'F')).toEqual([0, -2]);
  });
  it('ex-3 : C, D, E symétriques ; F tel que FB = (1 ; 0) est (−3 ; −3)', () => {
    const A = [1, 3]; const B = [-2, -3];
    expect([-A[0], -A[1]]).toEqual([-1, -3]);
    const D = [-B[0], B[1]]; expect(D).toEqual([2, -3]);
    expect([D[0], -D[1]]).toEqual([2, 3]);
    const F = V.coords(V.translate(V.point(...B), V.point(-1, 0)));
    expect(F).toEqual([-3, -3]);
    expect(EX['ex-3-b'].question.expected).toEqual({ x: String(F[0]), y: String(F[1]) });
  });
  it('ex-4 : (O ; U) et (E ; F) représentent u(−2 ; 3), (G ; H) et (K ; L) non', () => {
    const u = V.point(-2, 3);
    const is = (a, b) => V.vecEq(V.vec(V.point(...a), V.point(...b)), u);
    expect(is([0, 0], [-2, 3]) && is([3, -1], [1, 2])).toBe(true);
    expect(is([1, 1], [3, -2]) || is([0, -1], [3, -3])).toBe(false);
    expect(comps(FIG.FIG_EX4, 'E', 'F')).toEqual([-2, 3]);
    const rows = EX['ex-4'].question.rows.map((r) => r.answer);
    expect(rows).toEqual([true, true, false, false]);
  });
  it('ex-5 : AB = (1 ; −6), BC = (7 ; 0), I(5 ; 4), AICB parallélogramme quelconque', () => {
    const F = FIG.FIG_EX5_SOL;
    expect(comps(F, 'A', 'B')).toEqual([1, -6]);
    expect(comps(F, 'B', 'C')).toEqual([7, 0]);
    expect(comps(F, 'A', 'I')).toEqual([7, 0]);
    expect(V.quadNature(pt(F, 'A'), pt(F, 'I'), pt(F, 'C'), pt(F, 'B'))).toBe('parallelogram');
    expect(EX['ex-5-b'].question.expected).toEqual({ x: '5', y: '4' });
  });
});

describe('أؤكّد تعلّماتي 1 et l’épreuve KL', () => {
  it('QCM 1 : AB = (−5 ; −4) ; KL = (−5 ; −2)', () => {
    expect(comps(FIG.FIG_QCM1, 'A', 'B')).toEqual([-5, -4]);
    expect(comps(FIG.FIG_TEST_KL, 'K', 'L')).toEqual([-5, -2]);
  });
});

describe('أستعدّ et exercices', () => {
  it('sept affirmations, les deux réponses ; les points de la figure de l’item 1', () => {
    expect(PREP_ITEMS).toHaveLength(7);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
    const F = FIG.FIG_PREP1.points;
    expect(F.A).toEqual([2, 3]); expect(F.B).toEqual([-3, 3]);
    expect(V.coords(V.midpoint(V.point(...F.D), V.point(...F.C)))).toEqual([0, 0]);
    expect(V.distanceText(V.point(...F.C), V.point(...F.D))).toBe('6');
  });
  it('chaque exercice a une source du manuel et un point d’apprentissage de la leçon', () => {
    for (const ex of EXERCISES) {
      expect(ex.source.type).toBe('textbook');
      expect(ex.learningPointId).toMatch(/^4am_murakkibata-shuaa_P[123]$/);
    }
  });
});

describe('banc d’exercices — chaque statement.figure est lisible (figureQuality)', () => {
  it('50 exercices, figures sans bande ni collision', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const root = new URL('../../../../../../../../../../content/practice/4am/murakkibata-shuaa/', import.meta.url);
    let n = 0;
    for (const lv of readdirSync(root)) {
      for (const f of readdirSync(new URL(`${lv}/`, root))) {
        const ex = JSON.parse(readFileSync(new URL(`${lv}/${f}`, root), 'utf8'));
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
