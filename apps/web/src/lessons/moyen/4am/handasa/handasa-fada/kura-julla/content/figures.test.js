import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import { validateSpaceFigure, spaceFigureQuality, layoutSpaceFigure } from '../../../../../../common/components/spaceFigure';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';

/**
 * Les figures du درس « الكرة والجلة » disent VRAI : chaque position que la leçon affirme (M sur la كرة, P dedans, Q dehors ;
 * A sur la كرة, B dans la جلّة ; les أقطار de milieu O et de longueur 2R ; le دوري الآن) est re-vérifiée par space.js sur les
 * points DESSINÉS ; chaque figure passe validate…Figure et la qualité (guide §5 : pas de bande, aucune étiquette sur une autre).
 */
const all = Object.entries(FIG).filter(([, f]) => f && f.points && f.ariaLabel);
const p = (fig, n) => fig.points[n];
const where = (fig, n, R, O = 'O') => SP.ballPosition(fig.points[O], R, fig.points[n]).where;
const near = (a, b, eps = 1e-5) => Math.abs(a - b) < eps;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('figures — données valides et lisibles', () => {
  it('chaque figure de l’espace passe validateSpaceFigure et spaceFigureQuality', () => {
    for (const [name, fig] of all.filter(([, f]) => f.kind === 'space')) {
      expect(validateSpaceFigure(fig), name).toEqual([]);
      expect(spaceFigureQuality(fig), name).toEqual([]);
    }
  });
  it('la figure plane (طريقة p. 167) passe validateGeoFigure et figureQuality', () => {
    expect(validateGeoFigure(FIG.FIG_POINT_GIVEN)).toEqual([]);
    expect(figureQuality(FIG.FIG_POINT_GIVEN)).toEqual([]);
  });
  it('une figure à plus de six points nommés s’affiche à 480 px au moins', () => {
    for (const [name, fig] of all) {
      const named = Object.keys(fig.points).filter((n) => !(fig.hidden ?? []).includes(n)).length;
      if (named > 6) expect(fig.maxWidth ?? 380, name).toBeGreaterThanOrEqual(480);
    }
  });
});

describe('les affirmations de la leçon, recalculées sur les points dessinés', () => {
  it('معارف 1 : M sur la كرة, P dans la جلّة sans être sur la كرة, Q hors des deux (R = 2)', () => {
    const F = FIG.FIG_KNOW1_MPQ;
    expect(where(F, 'M', 2)).toBe('surface');
    expect(where(F, 'P', 2)).toBe('inside');
    expect(where(F, 'Q', 2)).toBe('outside');
  });
  it('معارف 1 : [NS], [N′S′], [N₁S₁] ont le milieu O et la longueur 2R = 4', () => {
    const F = FIG.FIG_KNOW1_DIAMETERS;
    for (const [a, b] of [['N', 'S'], ['N′', 'S′'], ['N₁', 'S₁']]) {
      [0, 1, 2].forEach((i) => expect(near((p(F, a)[i] + p(F, b)[i]) / 2, 0), `${a}${b}`).toBe(true));
      expect(near(dist(p(F, a), p(F, b)), 4), `${a}${b}`).toBe(true);
    }
  });
  it('معارف 1 figure 2 : la petite دائرة (centre O₁ ≠ O) est une section de rayon √(R² − OO₁²) < R', () => {
    const F = FIG.FIG_KNOW1_CIRCLES;
    const small = F.circles.find((c) => c.center === 'O₁');
    const sec = SP.sphereSection(2, '1,5');
    expect(sec.kind).toBe('circle');
    expect(near(small.radius, SP.lengthNumber(sec.radius))).toBe(true);
    expect(where(F, 'M', 2)).toBe('surface');
  });
  it('طريقة : A est sur la كرة (R = 2), B au milieu de [OM] dans la جلّة', () => {
    const F = FIG.FIG_POINT_SOLUTION;
    expect(near(dist(p(F, 'O'), p(F, 'A')), 2)).toBe(true);
    expect(near(dist(p(F, 'O'), p(F, 'M')), 2)).toBe(true);
    expect(near(dist(p(F, 'O'), p(F, 'B')), 1)).toBe(true);
    // le méridien rose passe par M (sa normale est orthogonale à OM)
    const n = F.circles[0].normal;
    expect(near(n[0] * p(F, 'M')[0] + n[1] * p(F, 'M')[1] + n[2] * p(F, 'M')[2], 0)).toBe(true);
  });
  it('دوري الآن : OA = OB = AB = 2 (AOB équilatéral), I milieu de [AB], OI = √3', () => {
    const F = FIG.FIG_NOW167;
    expect(near(dist(p(F, 'O'), p(F, 'A')), 2, 1e-5)).toBe(true);
    expect(near(dist(p(F, 'O'), p(F, 'B')), 2, 1e-5)).toBe(true);
    expect(near(dist(p(F, 'A'), p(F, 'B')), 2)).toBe(true);
    expect(near(dist(p(F, 'O'), p(F, 'I')), Math.sqrt(3), 1e-5)).toBe(true);
    expect(SP.lengthLatex(SP.sectionDistance(2, 1))).toBe('\\sqrt{3}');
  });
  it('طرائق, الشكل 2 : le « نطاق ملوّن » est fait de deux droites HORIZONTALES de l’écran, de part et d’autre de O', () => {
    const L = layoutSpaceFigure(FIG.FIG_DRAW_2);
    expect(near(L.P.b1[1], L.P.b2[1], 1e-6)).toBe(true);
    expect(near(L.P.b3[1], L.P.b4[1], 1e-6)).toBe(true);
    expect(L.P.b1[1] < L.P.O[1] && L.P.b3[1] > L.P.O[1]).toBe(true);
  });
});

describe('la banque de pratique : chaque statement.figure de l’espace est valide et lisible', () => {
  const root = new URL('../../../../../../../../../../content/practice/4am/kura-julla/', import.meta.url);
  const files = [1, 2, 3, 4, 5].flatMap((l) => readdirSync(new URL(`level-${l}/`, root)).map((f) => new URL(`level-${l}/${f}`, root)));
  it('50 exercices, et les figures passent validateSpaceFigure / spaceFigureQuality', () => {
    expect(files).toHaveLength(50);
    const figs = files.map((f) => JSON.parse(readFileSync(f, 'utf8'))).filter((d) => d.statement.figure);
    expect(figs.length).toBeGreaterThan(0);
    for (const d of figs) {
      expect(validateSpaceFigure(d.statement.figure), d.id).toEqual([]);
      expect(spaceFigureQuality(d.statement.figure), d.id).toEqual([]);
    }
  });
});
