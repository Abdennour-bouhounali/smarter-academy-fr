import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure.js';
import * as FIGS from './figures.js';

/**
 * Chaque figure du درس 4 se LIT (règle du propriétaire, LESSON_DEVELOPMENT_GUIDE §5 « Textbook figures ») : ni bande
 * étroite, ni étiquette sur une autre — et les natures que les questions demandent sont VRAIES sur les coordonnées
 * dessinées (recalculées avec packages/core/arithmetic/vectors.js).
 */
const P = (fig, n) => V.point(...fig.points[n]);

describe('ithbat-khawas-maalam — les figures', () => {
  it.each(Object.entries(FIGS))('%s se lit (figureQuality vide) et est valide', (name, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
  });

  it('les natures demandées sont vraies sur les figures dessinées', () => {
    const m = FIGS.FIG_METHOD_PROOF;
    const nm = V.triangleNature(P(m, 'A'), P(m, 'B'), P(m, 'C'));
    expect(nm.right).toBe('A');
    expect(nm.isosceles).toBe('A');
    const u = FIGS.FIG_METHOD_UNKNOWN_DONE;
    expect(V.triangleNature(P(u, 'A'), P(u, 'B'), P(u, 'C')).right).toBe('B');
    expect(V.coords(P(u, 'C'))[0]).toBe(u.points.d1[0]);
    const n1 = FIGS.FIG_NOW145_1;
    expect(V.quadNature(P(n1, 'A'), P(n1, 'B'), P(n1, 'C'), P(n1, 'D'))).toBe('square');
    const n2 = FIGS.FIG_NOW145_2_DONE;
    expect(V.vecEq(V.midpoint(P(n2, 'A'), P(n2, 'B')), P(n2, 'I'))).toBe(true);
    expect(V.onCircle(P(n2, 'I'), V.distance(P(n2, 'I'), P(n2, 'A')), P(n2, 'O'))).toBe(true);
    const e13 = FIGS.FIG_EX13;
    expect(V.quadNature(P(e13, 'A'), P(e13, 'B'), P(e13, 'C'), P(e13, 'D'))).toBe('square');
    const e18 = FIGS.FIG_EX18_DONE;
    expect(V.onCircle(P(e18, 'I'), V.distance(P(e18, 'I'), P(e18, 'A')), P(e18, 'B'))).toBe(true);
    expect(V.triangleNature(P(e18, 'A'), P(e18, 'B'), P(e18, 'C')).right).toBe('B');
    const e21 = FIGS.FIG_EX21;
    expect(V.triangleNature(P(e21, 'A'), P(e21, 'B'), P(e21, 'C'))).toMatchObject({ right: 'B', isosceles: null });
    const e24 = FIGS.FIG_EX24;
    expect(V.quadNature(P(e24, 'A'), P(e24, 'B'), P(e24, 'C'), P(e24, 'D'))).toBe('square');
    const e26 = FIGS.FIG_EX26_DONE;
    expect(V.triangleNature(P(e26, 'A'), P(e26, 'B'), P(e26, 'C'))).toMatchObject({ right: null, isosceles: 'C' });
    expect(V.vecEq(V.vec(P(e26, 'C'), P(e26, 'A')), V.vec(P(e26, 'B'), P(e26, 'D')))).toBe(true);
    // ACBD (corrigé) est un losange ; ABCD dans l'ordre imprimé est croisé (pas un parallélogramme)
    expect(V.quadNature(P(e26, 'A'), P(e26, 'C'), P(e26, 'B'), P(e26, 'D'))).toBe('rhombus');
    expect(V.quadNature(P(e26, 'A'), P(e26, 'B'), P(e26, 'C'), P(e26, 'D'))).toBe('none');
    const e27 = FIGS.FIG_EX27_DONE;
    expect(V.quadNature(P(e27, 'A'), P(e27, 'B'), P(e27, 'C'), P(e27, 'D'))).toBe('square');
    expect(V.vecEq(V.vec(P(e27, 'A'), P(e27, 'D')), V.vec(P(e27, 'B'), P(e27, 'C')))).toBe(true);
  });

  it('aucune figure « avant » ne montre le point à calculer', () => {
    expect(FIGS.FIG_METHOD_UNKNOWN.points.C).toBeUndefined();
    expect(FIGS.FIG_NOW145_2.points.I).toBeUndefined();
    expect(FIGS.FIG_EX26.points.D).toBeUndefined();
    expect(FIGS.FIG_EX27.points.D).toBeUndefined();
    expect(FIGS.FIG_EX18.points.I).toBeUndefined();
  });
});
