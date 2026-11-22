import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { figureQuality } from '../../../../../../common/components/geoFigure.js';
import * as FIGS from './figures.js';

/**
 * Chaque figure du درس 4 se LIT (règle du propriétaire, LESSON_DEVELOPMENT_GUIDE §5 « Textbook figures ») : ni bande
 * étroite, ni étiquette sur une autre — et les égalités que les questions demandent sont VRAIES sur les coordonnées
 * dessinées (recalculées avec packages/core/arithmetic/vectors.js).
 */
const P = (fig, n) => V.point(...fig.points[n]);
const vec = (fig, a, b) => V.vec(P(fig, a), P(fig, b));

describe('barahin-ashia — les figures', () => {
  it.each(Object.entries(FIGS))('%s se lit (figureQuality vide)', (name, fig) => {
    expect(figureQuality(fig)).toEqual([]);
  });

  it('les égalités des énoncés sont vraies sur les figures dessinées', () => {
    const m = FIGS.FIG_METHOD;
    expect(V.vecEq(vec(m, 'A', 'B'), vec(m, 'C', 'D'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(m, 'A'), P(m, 'D')), P(m, 'I'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(m, 'B'), P(m, 'C')), P(m, 'I'))).toBe(true);
    const n = FIGS.FIG_NOW133;
    expect(V.isParallelogram(P(n, 'A'), P(n, 'B'), P(n, 'D'), P(n, 'C'))).toBe(true);
    expect(V.vecEq(vec(n, 'B', 'C'), vec(n, 'D', 'E'))).toBe(true);
    const e18 = FIGS.FIG_EX18_DONE;
    expect(V.vecEq(vec(e18, 'H', 'K'), vec(e18, 'A', 'C'))).toBe(true);
    expect(V.vecEq(vec(e18, 'O', 'L'), vec(e18, 'A', 'C'))).toBe(true);
    const e20 = FIGS.FIG_EX20;
    expect(V.vecEq(V.vecAdd(vec(e20, 'C', 'E'), vec(e20, 'F', 'E')), vec(e20, 'A', 'D'))).toBe(true);
    const e21 = FIGS.FIG_EX21;
    expect(V.vecEq(V.midpoint(P(e21, 'E'), P(e21, 'D')), P(e21, 'K'))).toBe(true);   // corrigé : K, pas L
    const e23 = FIGS.FIG_EX23_DONE;
    expect(V.vecEq(V.midpoint(P(e23, 'K'), P(e23, 'L')), P(e23, 'A'))).toBe(true);
    const e24 = FIGS.FIG_EX24;
    expect(V.vecEq(V.vecAdd(vec(e24, 'K', 'M'), vec(e24, 'K', 'J′')), vec(e24, 'K', 'L'))).toBe(true);
    const e17 = FIGS.FIG_EX17_DONE;
    expect(V.vecEq(V.midpoint(P(e17, 'O'), P(e17, 'M')), P(e17, 'J'))).toBe(true);
  });
});
