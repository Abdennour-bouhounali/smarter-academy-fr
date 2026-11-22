import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import * as F from './figures';

/**
 * Chaque figure du درس 3 est LISIBLE (guide §5 « Textbook figures ») : figureQuality vide (pas de bande, aucune étiquette
 * sur une autre ou sur un point), données GeoFigure valides ; et les égalités que les questions lisent sur les figures
 * sont VRAIES sur leurs coordonnées (vectors.js).
 */
const P = (fig, n) => V.point(fig.points[n][0], fig.points[n][1]);
const eqv = (fig, a, b, c, d) => V.vecEq(V.vec(P(fig, a), P(fig, b)), V.vec(P(fig, c), P(fig, d)));
const add = (fig, a, b, c, d) => V.vecAdd(V.vec(P(fig, a), P(fig, b)), V.vec(P(fig, c), P(fig, d)));

describe('majmu-shuaayn — figures', () => {
  it.each(Object.entries(F).filter(([k]) => k.startsWith('FIG_')))('%s : valide et lisible', (_, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
  });

  it('نشاط 3 : MM′ = AB, M′M″ = BC, MM″ = AC', () => {
    const f = F.FIG_ACT3_SOL;
    expect(eqv(f, 'M', 'M′', 'A', 'B')).toBe(true);
    expect(eqv(f, 'M′', 'M″', 'B', 'C')).toBe(true);
    expect(eqv(f, 'M', 'M″', 'A', 'C')).toBe(true);
  });
  it('نشاط 4 : ABCD parallélogramme, AB + AD = AC', () => {
    const f = F.FIG_ACT4_SOL;
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'C'), P(f, 'D'))).toBe(true);
    expect(V.vecEq(add(f, 'A', 'B', 'A', 'D'), V.vec(P(f, 'A'), P(f, 'C')))).toBe(true);
  });
  it('معارف 6 et طرائق : AB + AC = AD ; CM = AB, AB + AD = AE', () => {
    expect(V.vecEq(add(F.FIG_KNOW6, 'A', 'B', 'A', 'C'), V.vec(P(F.FIG_KNOW6, 'A'), P(F.FIG_KNOW6, 'D')))).toBe(true);
    const m = F.FIG_METHOD_SOL;
    expect(eqv(m, 'C', 'M', 'A', 'B')).toBe(true);
    expect(V.vecEq(add(m, 'A', 'B', 'A', 'D'), V.vec(P(m, 'A'), P(m, 'E')))).toBe(true);
  });
  it('دوري الآن : AB + BD = AD, DA + DB = DE, AC + BC = AF', () => {
    const f = F.FIG_NOW_SOL;
    expect(V.vecEq(add(f, 'A', 'B', 'B', 'D'), V.vec(P(f, 'A'), P(f, 'D')))).toBe(true);
    expect(V.vecEq(add(f, 'D', 'A', 'D', 'B'), V.vec(P(f, 'D'), P(f, 'E')))).toBe(true);
    expect(V.vecEq(add(f, 'A', 'C', 'B', 'C'), V.vec(P(f, 'A'), P(f, 'F')))).toBe(true);
  });
  it('تمرين 11 : B ↦ M par CD puis AM ; N ↦ C par MA puis BC', () => {
    const f = F.FIG_EX11;
    expect(V.vecEq(V.translate(P(f, 'B'), add(f, 'C', 'D', 'A', 'M')), P(f, 'M'))).toBe(true);
    expect(V.vecEq(V.translate(P(f, 'N'), add(f, 'M', 'A', 'B', 'C')), P(f, 'C'))).toBe(true);
  });
  it('تمرين 13 : AC′ + AB′ = AA′, GA + GC = BG, BG + CG = GA', () => {
    const f = F.FIG_EX13;
    expect(V.vecEq(add(f, 'A', 'C′', 'A', 'B′'), V.vec(P(f, 'A'), P(f, 'A′')))).toBe(true);
    expect(V.vecEq(add(f, 'G', 'A', 'G', 'C'), V.vec(P(f, 'B'), P(f, 'G')))).toBe(true);
    expect(V.vecEq(add(f, 'B', 'G', 'C', 'G'), V.vec(P(f, 'G'), P(f, 'A')))).toBe(true);
  });
});
