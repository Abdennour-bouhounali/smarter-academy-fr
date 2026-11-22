import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import * as FIG from './figures';
import { LAB, PREP_ITEMS } from './textbook';
import { EXERCISES } from './exercises';

/**
 * Les figures du درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم » disent VRAI : chaque milieu, chaque
 * distance et chaque composante que la leçon affirme est recalculé ici avec vectors.js sur les points dessinés.
 */
const pt = (fig, n) => V.point(...fig.points[n]);
const figures = Object.entries(FIG).filter(([, f]) => f && f.points && f.ariaLabel);

describe('figures — données GeoFigure valides et lisibles', () => {
  it('chaque figure passe validateGeoFigure', () => {
    for (const [name, fig] of figures) expect(validateGeoFigure(fig), name).toEqual([]);
  });
  it('figureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5 « Textbook figures »)', () => {
    for (const [name, fig] of figures) expect(figureQuality(fig), name).toEqual([]);
  });
  it('les grandes figures quadrillées s’affichent en grand (≥ 440 px)', () => {
    for (const [name, fig] of figures) if (fig.grid) expect(fig.maxWidth ?? 540, name).toBeGreaterThanOrEqual(440);
  });
});

describe('les réponses de la leçon, recalculées sur les figures', () => {
  it('تحدّ : AB = √365 / 3', () => {
    const F = FIG.FIG_CHALLENGE;
    expect(V.distanceLatex(V.point('2/3', -2), V.point(-4, '7/3'))).toBe('\\dfrac{\\sqrt{365}}{3}');
    expect(F.points.A[0]).toBeCloseTo(2 / 3);
  });
  it('نشاط 3 : J(1 ; 2) milieu de [KL], KJ = JL = (−4 ; −1)', () => {
    const F = FIG.FIG_ACT3;
    expect(V.vecEq(V.midpoint(pt(F, 'K'), pt(F, 'L')), pt(F, 'J'))).toBe(true);
    expect(V.coords(V.vec(pt(F, 'K'), pt(F, 'J')))).toEqual([-4, -1]);
    expect(V.vecEq(V.vec(pt(F, 'K'), pt(F, 'J')), V.vec(pt(F, 'J'), pt(F, 'L')))).toBe(true);
  });
  it('نشاط 4 : KM = 3, LM = 4, KL = 5, KLM rectangle en M', () => {
    const F = FIG.FIG_ACT4_TRI;
    expect(V.distanceText(pt(F, 'K'), pt(F, 'M'))).toBe('3');
    expect(V.distanceText(pt(F, 'L'), pt(F, 'M'))).toBe('4');
    expect(V.distanceText(pt(F, 'K'), pt(F, 'L'))).toBe('5');
    expect(V.triangleNature(pt(F, 'K'), pt(F, 'L'), pt(F, 'M')).right).toBeTruthy();
  });
  it('QCM 4 : AB = √72 = 6√2 ; معارف هـ : AB = 5', () => {
    expect(V.distanceLatex(pt(FIG.FIG_QCM4, 'A'), pt(FIG.FIG_QCM4, 'B'))).toBe('6\\sqrt{2}');
    expect(V.distanceText(pt(FIG.FIG_KNOW_DIST, 'A'), pt(FIG.FIG_KNOW_DIST, 'B'))).toBe('5');
  });
  it('تمرين 20 : M = sym(C, A), N = sym(C, B), K = B + CA, K milieu de [MN]', () => {
    const F = FIG.FIG_EX20;
    expect(V.vecEq(V.symmetric(pt(F, 'C'), pt(F, 'A')), pt(F, 'M'))).toBe(true);
    expect(V.vecEq(V.symmetric(pt(F, 'C'), pt(F, 'B')), pt(F, 'N'))).toBe(true);
    expect(V.vecEq(V.translate(pt(F, 'B'), V.vec(pt(F, 'C'), pt(F, 'A'))), pt(F, 'K'))).toBe(true);
    expect(V.vecEq(V.midpoint(pt(F, 'M'), pt(F, 'N')), pt(F, 'K'))).toBe(true);
  });
});

describe('le lab et les exercices de la leçon', () => {
  it('les nombres du lab sont ceux de levels.js (et ceux du نشاط 3 et du نشاط 4)', () => {
    expect(LAB.beginner.numbers).toEqual(LEVELS['midpoint-distance'].beginner.numbers);
    expect(LAB.advanced.numbers).toEqual(LEVELS['midpoint-distance'].advanced.numbers);
    expect(LAB.advanced.numbers.A).toEqual(FIG.FIG_ACT3.points.K);
    expect(LAB.advanced.numbers.dist.B).toEqual(FIG.FIG_ACT4.points.K);
  });
  it('les clés « pair » des exercices sont les milieux / points recalculés', () => {
    const key = (id) => EXERCISES.find((e) => e.id === id).question.expected;
    const P = (x, y) => V.point(x, y);
    const asPt = (e) => V.point(e.x, e.y);
    expect(V.vecEq(asPt(key('ex-10-a')), V.midpoint(P(-5, 2), P(-6, -3)))).toBe(true);
    expect(V.vecEq(asPt(key('ex-10-b')), V.midpoint(P(0, 0), P(-6, -3)))).toBe(true);
    expect(V.vecEq(asPt(key('ex-11')), V.midpoint(P(5, 9), P(1, -3)))).toBe(true);
    expect(V.vecEq(asPt(key('ex-20-a')), V.symmetric(P(-1, 1), P(2, 1)))).toBe(true);
    expect(V.vecEq(asPt(key('ex-20-b')), V.symmetric(P(-1, 1), P(3, -1)))).toBe(true);
    expect(V.vecEq(asPt(key('ex-20-c')), V.translate(P(3, -1), V.vec(P(-1, 1), P(2, 1))))).toBe(true);
    expect(key('ex-17')).toBe(Number(V.distanceText(P(2, 1), P(-1, 1))));
  });
  it('ex-15 et ex-16 : √13, 1, 2√2 ; A sur (𝒞), B non', () => {
    const P = (x, y) => V.point(x, y);
    expect([V.distanceLatex(P(0, 2), P(3, 4)), V.distanceLatex(P(0, 2), P(1, 2)), V.distanceLatex(P(1, 2), P(3, 4))]).toEqual(['\\sqrt{13}', '1', '2\\sqrt{2}']);
    expect(V.normSquared(P(0, 0)).n).toBe(0);
  });
  it('أستعدّ : six affirmations, les deux réponses', () => {
    expect(PREP_ITEMS).toHaveLength(6);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
  });
});

describe('banc d’exercices — chaque statement.figure est lisible (figureQuality)', () => {
  it('50 exercices, figures sans bande ni collision', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const root = new URL('../../../../../../../../../../content/practice/4am/muntasaf-masafa/', import.meta.url);
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
