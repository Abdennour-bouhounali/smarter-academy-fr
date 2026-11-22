import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { init, mezianNumbers, measure } from '../../../../../../common/manipulations/logic/inscribedAngle';
import * as FIG from './figures';
import { EX } from './exercises';
import { PREP_ITEMS, LAB } from './textbook';

/**
 * Les figures du درس « الزاوية المحيطية والزاوية المركزية » disent VRAI : chaque angle que la leçon affirme (réponses,
 * corrections, distracteurs déclarés faux) est RECALCULÉ ici avec rotation.js sur les points dessinés.
 */
const pt = (fig, n) => ({ x: fig.points[n][0], y: fig.points[n][1] });
const ang = (fig, a, v, b) => Math.round(R.angleAt(pt(fig, a), pt(fig, v), pt(fig, b)) * 1000) / 1000;

describe('figures — données GeoFigure valides et lisibles', () => {
  it('chaque figure exportée passe validateGeoFigure', () => {
    for (const [name, fig] of Object.entries(FIG)) {
      if (!fig || !fig.points || !fig.ariaLabel) continue;
      expect(validateGeoFigure(fig), name).toEqual([]);
    }
  });
  it('figureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5 « Textbook figures »)', () => {
    for (const [name, fig] of Object.entries(FIG)) {
      if (!fig || !fig.points || !fig.ariaLabel) continue;
      expect(figureQuality(fig), name).toEqual([]);
    }
  });
  it('une figure de plus de six points s’affiche à 480 px au moins', () => {
    for (const [name, fig] of Object.entries(FIG)) {
      if (!fig || !fig.points) continue;
      const n = Object.keys(fig.points).length - (fig.hidden?.length ?? 0);
      if (n > 6) expect(fig.maxWidth, name).toBeGreaterThanOrEqual(480);
    }
  });
});

describe('أستعدّ', () => {
  it('4 : A, B, C, D sur (E) ; 5 : M, N, P sur (E), O au centre (pas dessus), MNP rectangle en M', () => {
    const F4 = FIG.FIG_PREP4;
    for (const n of ['A', 'B', 'C', 'D']) expect(R.circlePosition({ x: 0, y: 0 }, 2, pt(F4, n), { tol: 1e-3 }), n).toBe('on');
    const F5 = FIG.FIG_PREP5;
    for (const n of ['M', 'N', 'P']) expect(R.circlePosition({ x: 0, y: 0 }, 2, pt(F5, n), { tol: 1e-3 }), n).toBe('on');
    expect(R.circlePosition({ x: 0, y: 0 }, 2, pt(F5, 'O'))).toBe('inside');
    expect(ang(F5, 'P', 'M', 'N')).toBeCloseTo(90, 2);
    expect(ang(F5, 'M', 'O', 'N')).toBeCloseTo(90, 2);
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual([true, true, true, false, false, true, true, false]);
  });
});

describe('نشاط 4 — la figure redessinée et le lab disent la même chose', () => {
  it('AOB = 100°, ADB = 50° (D sur le grand arc) ; مزيان : BAD = 40°, 2·40 + 100 = 180, 50 + 40 = 90', () => {
    const F = FIG.FIG_ACT4;
    expect(ang(F, 'A', 'O', 'B')).toBeCloseTo(100, 2);
    expect(ang(F, 'A', 'D', 'B')).toBeCloseTo(50, 2);
    const Z = FIG.FIG_ACT4_MEZIAN;
    expect(ang(Z, 'A', 'O', 'D')).toBeCloseTo(180, 2);
    expect(ang(Z, 'B', 'A', 'D')).toBeCloseTo(40, 2);
    expect(ang(Z, 'A', 'D', 'B')).toBeCloseTo(50, 2);
    expect(ang(Z, 'A', 'B', 'D')).toBeCloseTo(90, 2);
  });
  it('les mêmes directions que le lab (levels.js › inscribed-angle advanced) et les mêmes nombres', () => {
    const s = init(LAB.advanced.numbers);
    expect([s.A, s.B]).toEqual([FIG.ACT4_DIR.A, FIG.ACT4_DIR.B]);
    expect(mezianNumbers(s)).toEqual({ BAD: 40, ADB: 50, AOB: 100, AOD: 180 });
    expect(measure(s, { t: FIG.ACT4_DIR.D, rho: 1 }).angle).toBe(50);
  });
});

describe('معارف 4', () => {
  it('AOB = 80°, AMB = ANB = 40°, MAN = 30° (extraction › know-4 › measures)', () => {
    const F = FIG.FIG_KNOW4_EX1;
    expect(ang(F, 'A', 'O', 'B')).toBeCloseTo(80, 2);
    expect(ang(F, 'M', 'A', 'N')).toBeCloseTo(30, 2);
    expect(ang(FIG.FIG_KNOW4_EX2, 'A', 'M', 'B')).toBeCloseTo(40, 2);
    expect(ang(FIG.FIG_KNOW4_EX3, 'A', 'N', 'B')).toBeCloseTo(40, 2);
  });
});

describe('طريقة', () => {
  it('la roue : POQ = 130°, PCQ = PKQ = 65° ; le diamètre : BAC = 90°', () => {
    const F = FIG.FIG_TARIQA;
    expect(ang(F, 'P', 'O', 'Q')).toBeCloseTo(130, 2);
    expect(ang(F, 'P', 'C', 'Q')).toBeCloseTo(65, 2);
    expect(ang(F, 'P', 'K', 'Q')).toBeCloseTo(65, 2);
    expect(ang(FIG.FIG_QUTR, 'B', 'A', 'C')).toBeCloseTo(90, 2);
  });
});

describe('أوظّف — les réponses des exercices, recalculées sur les figures', () => {
  it('ex-10 : BOC = 120°, BDC = 60°, et avec BOD = 45° : DAB = 22,5°, DBC = 97,5° (DAB + DBC = 120°)', () => {
    const F = FIG.FIG_EX10;
    expect(ang(F, 'B', 'O', 'D')).toBeCloseTo(45, 2);
    expect(ang(F, 'B', 'O', 'C')).toBeCloseTo(120, 2);
    expect(ang(F, 'B', 'D', 'C')).toBeCloseTo(60, 2);
    expect(ang(F, 'D', 'A', 'B')).toBeCloseTo(22.5, 2);
    expect(ang(F, 'D', 'B', 'C')).toBeCloseTo(97.5, 2);
    expect(ang(F, 'D', 'B', 'A')).toBeCloseTo(37.5, 2);
    expect(EX['ex-10-a'].question.rows.map((r) => r.options[r.correct])).toEqual(['$120^\\circ$', '$60^\\circ$']);
  });
  it('ex-11 : BOC = 80°, BAC = ACD = 40°, AOD = 80°, B, O, D alignés', () => {
    const F = FIG.FIG_EX11;
    expect(ang(F, 'B', 'O', 'C')).toBeCloseTo(80, 2);
    expect(ang(F, 'B', 'A', 'C')).toBeCloseTo(40, 2);
    expect(ang(F, 'A', 'C', 'D')).toBeCloseTo(40, 2);
    expect(ang(F, 'A', 'O', 'D')).toBeCloseTo(80, 2);
    expect(ang(F, 'B', 'O', 'D')).toBeCloseTo(180, 2);
  });
  it('ex-12 : M = (AB) ∩ (CD) intérieur ; AMD = CDB + ABD ; CMB = (COB + AOD)/2 = 60°', () => {
    const F = FIG.FIG_EX12;
    const O = { x: 0, y: 0 };
    expect(R.circlePosition(O, 2, pt(F, 'M'))).toBe('inside');
    expect(ang(F, 'A', 'M', 'D')).toBeCloseTo(ang(F, 'C', 'D', 'B') + ang(F, 'A', 'B', 'D'), 2);
    expect(ang(F, 'C', 'M', 'B')).toBeCloseTo((ang(F, 'C', 'O', 'B') + ang(F, 'A', 'O', 'D')) / 2, 2);
    expect(ang(F, 'C', 'M', 'B')).toBeCloseTo(60, 2);
    const v = R.vertexAngle(O, pt(F, 'C'), pt(F, 'B'), pt(F, 'M'));
    expect(v.rule).toBe('half-sum');
  });
  it('ex-16 : EBC = 70°, BEC = 40°, ACE = 70° ; avec DOB = 40° : AEC = 60°, EAC = 50°', () => {
    const F = FIG.FIG_EX16;
    expect(ang(F, 'E', 'O', 'C')).toBeCloseTo(140, 2);
    expect(ang(F, 'B', 'D', 'C')).toBeCloseTo(40, 2);
    expect(ang(F, 'D', 'O', 'B')).toBeCloseTo(40, 2);
    expect(ang(F, 'E', 'B', 'C')).toBeCloseTo(70, 2);
    expect(ang(F, 'B', 'E', 'C')).toBeCloseTo(40, 2);
    expect(ang(F, 'A', 'C', 'E')).toBeCloseTo(70, 2);
    expect(ang(F, 'A', 'E', 'C')).toBeCloseTo(60, 2);
    expect(ang(F, 'E', 'A', 'C')).toBeCloseTo(50, 2);
    expect(R.circlePosition({ x: 0, y: 0 }, 2, pt(F, 'A'))).toBe('outside');
  });
  it('ex-20 : BAC ≈ 22° (sin = 3/8), BOC = 2·BAC ≈ 44°', () => {
    const F = FIG.FIG_EX20;
    expect(Math.hypot(F.points.B[0] - F.points.C[0], F.points.B[1] - F.points.C[1])).toBeCloseTo(3, 3);
    expect(Math.round(ang(F, 'B', 'A', 'C'))).toBe(EX['ex-20-a'].question.expected);
    expect(Math.round(ang(F, 'B', 'O', 'C'))).toBe(EX['ex-20-b'].question.expected);
  });
});

describe('أؤكّد تعلّماتي 2 et 3, épreuve E4', () => {
  it('item 2 : A sur le cercle, D dehors, E dedans (pas le centre)', () => {
    const F = FIG.FIG_QCM2; const O = { x: 0, y: 0 };
    expect(R.circlePosition(O, 2, pt(F, 'A'))).toBe('on');
    expect(R.circlePosition(O, 2, pt(F, 'D'))).toBe('outside');
    expect(R.circlePosition(O, 2, pt(F, 'E'))).toBe('inside');
    expect(ang(F, 'B', 'A', 'C')).toBeCloseTo(ang(F, 'B', 'O', 'C') / 2, 2);
  });
  it('item 3 : BOC plat, BAC = 90°, AB ≠ AC', () => {
    const F = FIG.FIG_QCM3;
    expect(ang(F, 'B', 'O', 'C')).toBeCloseTo(180, 2);
    expect(ang(F, 'B', 'A', 'C')).toBeCloseTo(90, 2);
    expect(ang(F, 'A', 'B', 'C')).not.toBeCloseTo(ang(F, 'A', 'C', 'B'), 1);
  });
  it('E4 : ACB = ADB = 48°, AOB = 96°', () => {
    const F = FIG.FIG_TEST_SAME;
    expect(ang(F, 'A', 'C', 'B')).toBeCloseTo(48, 2);
    expect(ang(F, 'A', 'D', 'B')).toBeCloseTo(48, 2);
    expect(ang(F, 'A', 'O', 'B')).toBeCloseTo(96, 2);
  });
});

describe('banc d’exercices — chaque statement.figure est lisible (figureQuality)', () => {
  it('50 exercices, 10 par niveau, figures sans bande ni collision', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const root = new URL('../../../../../../../../../../content/practice/4am/zawiya-muhitiya/', import.meta.url);
    let n = 0;
    for (const lv of readdirSync(root)) {
      const files = readdirSync(new URL(`${lv}/`, root));
      expect(files.length, lv).toBe(10);
      for (const f of files) {
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
