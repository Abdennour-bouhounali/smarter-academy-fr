import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { ACT1 } from '../../../../../../common/manipulations/logic/translationGlide';
import * as FIG from './figures';
import { EXERCISES } from './exercises';
import { PREP_ITEMS } from './textbook';

/**
 * Les figures du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » disent VRAI : chaque égalité de vecteurs que la leçon
 * affirme (réponses, corrections, distracteurs déclarés faux) est vérifiée ici avec vectors.js sur les points dessinés.
 */
const pt = (fig, n) => V.point(...fig.points[n]);
const vv = (fig, a, b) => V.vec(pt(fig, a), pt(fig, b));
const named = (s) => s.match(/[A-Z]'?/g);
const eqN = (fig, x, y) => { const [a, b] = named(x); const [c, d] = named(y); return V.vecEq(vv(fig, a, b), vv(fig, c, d)); };

describe('figures — données GeoFigure valides', () => {
  it('chaque figure exportée passe validateGeoFigure', () => {
    for (const [name, fig] of Object.entries(FIG)) {
      if (!fig || !fig.points || !fig.ariaLabel) continue;
      expect(validateGeoFigure(fig), name).toEqual([]);
    }
  });
  it('figureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5 « Textbook figures »)', () => {
    for (const [name, fig] of Object.entries(FIG)) {
      if (!fig || !fig.points || !fig.ariaLabel) continue;
      // FIG_KNOW2_FLAT : la حالة خاصة de معارف 2 — des points ALIGNÉS par définition, la bande est le sujet
      const opts = name === 'FIG_KNOW2_FLAT' ? { maxAspect: Infinity } : {};
      expect(figureQuality(fig, opts), name).toEqual([]);
    }
  });
});

describe('نشاط 1 — la figure redessinée garde le concept du manuel', () => {
  const F = FIG.FIG_ACT1;
  it('A ↦ G donne GQE, C ↦ R donne SPR, A ↦ M donne MNT, A ↦ A′ donne A′C′D (et K ↦ H)', () => {
    expect(eqN(F, 'AG', 'BQ') && eqN(F, 'AG', 'CE')).toBe(true);
    expect(eqN(F, 'CR', 'AS') && eqN(F, 'CR', 'BP')).toBe(true);
    expect(eqN(F, 'AM', 'BN') && eqN(F, 'AM', 'CT')).toBe(true);
    expect(eqN(F, "AA'", "BC'") && eqN(F, "AA'", 'CD') && eqN(F, "AA'", 'KH')).toBe(true);
  });
  it('les quatre images ne se chevauchent pas (boîtes disjointes)', () => {
    const box = (ns) => { const xs = ns.map((n) => F.points[n][0]); const ys = ns.map((n) => F.points[n][1]); return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]; };
    const tris = [['A', 'B', 'C'], ['G', 'Q', 'E'], ['S', 'P', 'R'], ['M', 'N', 'T'], ["A'", "C'", 'D']].map(box);
    for (let i = 0; i < tris.length; i += 1) for (let j = i + 1; j < tris.length; j += 1) {
      const [a, b] = [tris[i], tris[j]];
      expect(a[1] < b[0] || b[1] < a[0] || a[3] < b[2] || b[3] < a[2], `${i}/${j}`).toBe(true);
    }
  });
  it('1 ب–د : même منحى ; [AM) de sens contraire ; AG = CE = 6, KH = 3', () => {
    const r = V.relation(vv(F, 'A', 'G'), vv(F, 'A', 'M'));
    expect(r.direction).toBe(true); expect(r.sense).toBe(false);
    expect(V.relation(vv(F, 'A', 'G'), vv(F, 'K', 'H'))).toMatchObject({ direction: true, sense: true });
    expect(V.relation(vv(F, 'A', 'G'), vv(F, 'C', 'E')).direction).toBe(true);
    expect(V.distanceText(pt(F, 'A'), pt(F, 'G'))).toBe('6');
    expect(V.distanceText(pt(F, 'C'), pt(F, 'E'))).toBe('6');
    expect(V.distanceText(pt(F, 'K'), pt(F, 'H'))).toBe('3');
  });
  it('2 د : GL ≠ EF (منحى, même طول), RP = −EF ; 2 هـ : BA, C′A′, QG, PS représentent NM ; AB, SP, CD non', () => {
    expect(V.relation(vv(F, 'G', 'L'), vv(F, 'E', 'F'))).toMatchObject({ direction: false, length: true });
    expect(V.relation(vv(F, 'R', 'P'), vv(F, 'E', 'F'))).toMatchObject({ opposite: true });
    for (const s of ['BA', "C'A'", 'QG', 'PS']) expect(eqN(F, s, 'NM'), s).toBe(true);
    for (const s of ['AB', 'SP', 'CD']) expect(eqN(F, s, 'NM'), s).toBe(false);
  });
  it('les mêmes points que le lab (logic/translationGlide.js › ACT1)', () => {
    for (const [n, p] of Object.entries(ACT1.drones)) expect(F.points[n], n).toEqual(p);
    for (const tb of ACT1.tableaux) {
      expect(F.points[tb.toName], tb.id).toEqual(tb.to);
      const u = [tb.to[0] - ACT1.drones[tb.from][0], tb.to[1] - ACT1.drones[tb.from][1]];
      for (const [f, n] of tb.place) expect(F.points[n], n).toEqual([ACT1.drones[f][0] + u[0], ACT1.drones[f][1] + u[1]]);
    }
  });
});

describe('نشاط 2 أ et معارف', () => {
  it('D = fourthVertex(A, B, C) ; AB = DC, AD = BC ; AD ≠ CB ; AC ≠ BD', () => {
    const F = FIG.FIG_ACT2_D;
    const D = V.fourthVertex(pt(F, 'A'), pt(F, 'B'), pt(F, 'C'));
    expect(V.vecEq(D, pt(F, 'D'))).toBe(true);
    expect(eqN(F, 'AB', 'DC') && eqN(F, 'AD', 'BC')).toBe(true);
    expect(eqN(F, 'AD', 'CB') || eqN(F, 'AC', 'BD')).toBe(false);
    // le distracteur « image de C par A ↦ B » donne ABDC, pas ABCD
    const D2 = V.translate(pt(F, 'C'), vv(F, 'A', 'B'));
    expect(V.isParallelogram(pt(F, 'A'), pt(F, 'B'), pt(F, 'C'), D2)).toBe(false);
    expect(V.isParallelogram(pt(F, 'A'), pt(F, 'B'), D2, pt(F, 'C'))).toBe(true);
  });
  it('les quatre représentants de u (معارف 1) sont égaux ; AB = CD dans l’exemple', () => {
    const F = FIG.FIG_KNOW1;
    expect(eqN(F, 'AB', 'EF') && eqN(F, 'AB', 'CD') && eqN(F, 'AB', 'MN')).toBe(true);
    expect(eqN(FIG.FIG_KNOW1_EQ, 'AB', 'CD')).toBe(true);
  });
  it('le quadrillage de la plateforme : CD = AB, EF opposé, GH même sens double', () => {
    const F = FIG.FIG_EQ_PICK;
    expect(eqN(F, 'CD', 'AB')).toBe(true);
    expect(V.relation(vv(F, 'A', 'B'), vv(F, 'E', 'F')).opposite).toBe(true);
    expect(V.relation(vv(F, 'A', 'B'), vv(F, 'G', 'H'))).toMatchObject({ direction: true, sense: true, length: false });
  });
  it('معارف 2 : ABCD parallélogramme ; cas aligné : AB = DC, même milieu E de [AC] et [BD]', () => {
    const P = FIG.FIG_KNOW2;
    expect(V.isParallelogram(pt(P, 'A'), pt(P, 'B'), pt(P, 'C'), pt(P, 'D'))).toBe(true);
    const F = FIG.FIG_KNOW2_FLAT;
    expect(eqN(F, 'AB', 'DC')).toBe(true);
    expect(V.vecEq(V.midpoint(pt(F, 'A'), pt(F, 'C')), pt(F, 'E'))).toBe(true);
    expect(V.vecEq(V.midpoint(pt(F, 'B'), pt(F, 'D')), pt(F, 'E'))).toBe(true);
  });
});

describe('أوظّف — les réponses des exercices (et les deux coquilles)', () => {
  it('ex-2 : AC = BD et AE = CF', () => {
    expect(eqN(FIG.FIG_EX2, 'AC', 'BD') && eqN(FIG.FIG_EX2, 'AE', 'CF')).toBe(true);
  });
  it('ex-4 : R ↦ N par EM ; SP a CINQ égaux (on en demande 3) ; CM n’en a que CINQ (le manuel en demande 6)', () => {
    const F = FIG.FIG_EX4;
    expect(V.vecEq(V.translate(pt(F, 'R'), vv(F, 'E', 'M')), pt(F, 'N'))).toBe(true);
    const names = Object.keys(F.points);
    const equalTo = (a, b) => {
      const out = [];
      for (const x of names) for (const y of names) if (x !== y && !(x === a && y === b) && V.vecEq(vv(F, x, y), vv(F, a, b))) out.push(`${x}${y}`);
      return out.sort();
    };
    expect(equalTo('S', 'P')).toEqual(['DN', 'FQ', 'PA', 'QM', 'RC']);
    expect(equalTo('C', 'M')).toEqual(['EP', 'PN', 'QB', 'RQ', 'SD']);
    const exB = EXERCISES.find((e) => e.id === 'ex-4-b');
    expect(exB.question.options[0]).toContain('DN');
    for (const s of ['QR', 'BM', 'PS', 'ND', 'AP']) expect(equalTo('S', 'P')).not.toContain(s);
    expect(EXERCISES.find((e) => e.id === 'ex-4-c').question.expected).toBe(equalTo('C', 'M').length);
  });
  it('ex-5 : M et N, BMND rectangle, NC = CB = DA', () => {
    const F = FIG.FIG_EX5_SOL;
    expect(eqN(F, 'CM', 'AB') && eqN(F, 'CN', 'BC')).toBe(true);
    expect(V.quadNature(pt(F, 'B'), pt(F, 'M'), pt(F, 'N'), pt(F, 'D'))).toBe('rectangle');
    expect(eqN(F, 'NC', 'CB') && eqN(F, 'NC', 'DA')).toBe(true);
    expect(eqN(F, 'NC', 'BC') || eqN(F, 'NC', 'AD')).toBe(false);
  });
  it('ex-8 : GE n’a que TROIS égaux (le manuel en demande 4) ; GF = OC', () => {
    const F = FIG.FIG_EX8;
    const names = Object.keys(F.points);
    const eq = [];
    for (const x of names) for (const y of names) if (x !== y && `${x}${y}` !== 'GE' && V.vecEq(vv(F, x, y), vv(F, 'G', 'E'))) eq.push(`${x}${y}`);
    expect(eq.sort()).toEqual(['BO', 'FH', 'OD']);
    expect(eqN(F, 'GF', 'OC')).toBe(true);
    expect(eqN(F, 'GF', 'CO')).toBe(false);
  });
});

describe('أؤكّد تعلّماتي — items 1 et 3', () => {
  it('item 1 : AC = GH = EF, MN opposé', () => {
    const F = FIG.FIG_QCM1;
    expect(eqN(F, 'AC', 'GH') && eqN(F, 'GH', 'EF')).toBe(true);
    expect(eqN(F, 'MN', 'GH')).toBe(false);
    expect(V.relation(vv(F, 'M', 'N'), vv(F, 'G', 'H')).opposite).toBe(true);
  });
  it('item 3 : AB et CD opposés ; AB, GH longueurs différentes ; GH, EH منحى différent', () => {
    const F = FIG.FIG_QCM3;
    expect(V.relation(vv(F, 'A', 'B'), vv(F, 'C', 'D')).opposite).toBe(true);
    expect(V.relation(vv(F, 'A', 'B'), vv(F, 'G', 'H')).length).toBe(false);
    expect(V.relation(vv(F, 'G', 'H'), vv(F, 'E', 'H')).direction).toBe(false);
  });
});

describe('أستعدّ', () => {
  it('six affirmations, les deux réponses présentes', () => {
    expect(PREP_ITEMS).toHaveLength(6);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
  });
});

describe('banc d’exercices — chaque statement.figure est lisible (figureQuality)', () => {
  it('50 exercices, figures sans bande ni collision (le cas aligné de معارف 2 excepté)', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const root = new URL('../../../../../../../../../../content/practice/4am/insihab-shuaa/', import.meta.url);
    let n = 0;
    for (const lv of readdirSync(root)) {
      for (const f of readdirSync(new URL(`${lv}/`, root))) {
        const ex = JSON.parse(readFileSync(new URL(`${lv}/${f}`, root), 'utf8'));
        n += 1;
        const fig = ex.statement.figure;
        if (!fig) continue;
        expect(validateGeoFigure(fig), ex.id).toEqual([]);
        const flat = Object.values(fig.points).every((p) => p[1] === Object.values(fig.points)[0][1]);
        expect(figureQuality(fig, flat ? { maxAspect: Infinity } : {}), ex.id).toEqual([]);
      }
    }
    expect(n).toBe(50);
  });
});
