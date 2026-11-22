import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import * as space from '@smarter-academy/core/arithmetic/space.js';
import * as trigonometry from '@smarter-academy/core/arithmetic/trigonometry.js';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import * as FIG from './figures';

/**
 * Les figures du درس « المقاطع المستوية للمجسمات المألوفة » disent VRAI : chaque longueur que la leçon affirme (réponses,
 * corrections) est recalculée ici par space.js (packages/core) sur les points DESSINÉS ; chaque figure passe
 * validateSpaceFigure et spaceFigureQuality (guide §5 « Textbook figures »).
 */
const all = Object.entries(FIG).filter(([, f]) => f && f.kind === 'space');
const d = (fig, a, b) => trigonometry.surdNumber(space.distance3(fig.points[a].map((x) => String(x).replace('.', ',')), fig.points[b].map((x) => String(x).replace('.', ','))));

describe('figures — données SpaceFigure valides et lisibles', () => {
  it('chaque figure exportée passe validateSpaceFigure', () => {
    expect(all.length).toBeGreaterThan(10);
    for (const [name, fig] of all) expect(validateSpaceFigure(fig), name).toEqual([]);
  });
  it('spaceFigureQuality : pas de bande étroite, aucune étiquette sur une autre (guide §5)', () => {
    for (const [name, fig] of all) expect(spaceFigureQuality(fig), name).toEqual([]);
  });
  it('une figure à plus de six points nommés s’affiche à 480 px au moins', () => {
    for (const [name, fig] of all) {
      const named = Object.keys(fig.points).filter((n) => !(fig.hidden ?? []).includes(n)).length;
      if (named > 6) expect(fig.maxWidth ?? 380, name).toBeGreaterThanOrEqual(480);
    }
  });
});

describe('les réponses de la leçon, recalculées sur les points dessinés', () => {
  it('نشاط 2 : OM = 3 (M sur la sphère) et IM = √5 pour x = 2 (IM² = 9 − x²)', () => {
    expect(d(FIG.FIG_ACT2, 'O', 'M')).toBeCloseTo(3, 2);
    expect(d(FIG.FIG_ACT2, 'I', 'M')).toBeCloseTo(Math.sqrt(5), 2);
  });
  it('نشاط 3 : IJKL a les dimensions de CBFG (20 × 6) ; CM = 4, CN = 3, MN = 5, MO = 6', () => {
    const F1 = FIG.FIG_ACT3_FACE_1;
    expect(d(F1, 'I', 'J')).toBeCloseTo(d(F1, 'C', 'B'), 9);
    expect(d(F1, 'I', 'L')).toBeCloseTo(d(F1, 'C', 'G'), 9);
    expect(d(F1, 'I', 'J') * d(F1, 'I', 'L')).toBeCloseTo(120, 9);
    const E2 = FIG.FIG_ACT3_EDGE_2;
    expect(d(E2, 'C', 'M')).toBeCloseTo(4, 9);
    expect(d(E2, 'C', 'N')).toBeCloseTo(3, 9);
    expect(d(E2, 'M', 'N')).toBeCloseTo(5, 9);
    expect(d(E2, 'M', 'O')).toBeCloseTo(6, 9);
    expect(d(E2, 'D', 'M')).toBeCloseTo(21, 9);
    expect(d(E2, 'B', 'N')).toBeCloseTo(17, 9);
  });
  it('نشاط 4 : K et I sur le cercle du haut (rayon 1,7), OH = 0,8, KI = 3, KJ = 6', () => {
    const F = FIG.FIG_ACT4_AXIS;
    expect(d(F, 'O', 'K')).toBeCloseTo(1.7, 9);
    expect(d(F, 'O', 'I')).toBeCloseTo(1.7, 9);
    expect(d(F, 'O', 'H')).toBeCloseTo(0.8, 9);
    expect(d(F, 'K', 'I')).toBeCloseTo(3, 9);
    expect(d(F, 'K', 'J')).toBeCloseTo(6, 9);
  });
  it('نشاط 5 : SE = 3/4 SA, EF = 3, EG = 3√2', () => {
    const F = FIG.FIG_ACT5;
    expect(d(F, 'S', 'E') / d(F, 'S', 'A')).toBeCloseTo(0.75, 9);
    expect(d(F, 'E', 'F')).toBeCloseTo(3, 9);
    expect(d(F, 'E', 'G')).toBeCloseTo(3 * Math.SQRT2, 9);
  });
  it('معارف 3 : AM = 1,6 sur la sphère de rayon 2 (h = 1,2) ; parallèle à l’arête, IL = AE ; cylindre AB = 2√3', () => {
    expect(d(FIG.FIG_KNOW3_IN, 'O', 'M')).toBeCloseTo(2, 2);
    expect(d(FIG.FIG_KNOW3_IN, 'A', 'M')).toBeCloseTo(1.6, 2);
    expect(d(FIG.FIG_KNOW3_CUBOID_EDGE, 'I', 'L')).toBeCloseTo(d(FIG.FIG_KNOW3_CUBOID_EDGE, 'A', 'E'), 9);
    expect(d(FIG.FIG_KNOW3_CYL_AXIS, 'A', 'B')).toBeCloseTo(2 * Math.sqrt(3), 2);
  });
  it('طرائق : O′M = 2 (OM = 2,5, OO′ = 1,5) ; دوري الآن : AB = 2√3, BC = 3, OH = 1', () => {
    expect(d(FIG.FIG_METHOD, 'O', 'M')).toBeCloseTo(2.5, 2);
    expect(d(FIG.FIG_METHOD, "O'", 'M')).toBeCloseTo(2, 2);
    expect(d(FIG.FIG_NOW169, 'A', 'B')).toBeCloseTo(2 * Math.sqrt(3), 2);
    expect(d(FIG.FIG_NOW169, 'B', 'C')).toBeCloseTo(3, 9);
    expect(d(FIG.FIG_NOW169, 'O', 'H')).toBeCloseTo(1, 9);
    expect(d(FIG.FIG_NOW169, 'O', 'B')).toBeCloseTo(2, 2);
  });
  it('le cône (ajout) : la section à SO′ = 2 sur SO = 6 a le rayon 1 = (1/3) × 3', () => {
    const F = FIG.FIG_KNOW_CONE;
    expect(d(F, 'S', "O'") / d(F, 'S', 'O')).toBeCloseTo(1 / 3, 9);
    expect(F.circles[0].radius).toBeCloseTo((1 / 3) * 3, 9);
  });
});

describe('la banque d’exercices : chaque `statement.figure` est une figure de l’espace valide et lisible', () => {
  it('validateSpaceFigure et spaceFigureQuality sur chaque figure du banc maqati-mustawiya', () => {
    const root = new URL('../../../../../../../../../../content/practice/4am/maqati-mustawiya/', import.meta.url);
    let n = 0;
    for (const lv of readdirSync(root)) {
      for (const f of readdirSync(new URL(`${lv}/`, root))) {
        const ex = JSON.parse(readFileSync(new URL(`${lv}/${f}`, root), 'utf8'));
        const fig = ex.statement.figure;
        if (!fig) continue;
        n += 1;
        expect(validateSpaceFigure(fig), f).toEqual([]);
        expect(spaceFigureQuality(fig), f).toEqual([]);
      }
    }
    expect(n).toBeGreaterThanOrEqual(6);
  });
});
