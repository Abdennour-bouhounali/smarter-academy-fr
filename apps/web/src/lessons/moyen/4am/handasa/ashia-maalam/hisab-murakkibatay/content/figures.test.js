import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure.js';
import * as FIG from './figures.js';

/**
 * Règle du propriétaire (2026-10-04) : chaque figure du درس — modules et banque de pratique — est lisible (un bloc
 * quasi carré, chaque nom de point libre), et ce qu'elle MONTRE est juste (recalculé par vectors.js).
 */
const P = (fig, n) => V.point(...fig.points[n]);

describe('hisab-murakkibatay — figures lisibles', () => {
  it.each(Object.entries(FIG).filter(([n]) => n.startsWith('FIG_')))('%s', (name, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
  });

  it('the figures say the mathematics of the lesson', () => {
    const a = FIG.FIG_ACT2_SOLVED;
    expect(V.coords(V.vec(P(a, 'C'), P(a, 'D')))).toEqual([-1, -6]);
    expect(V.coords(V.vec(P(a, 'D'), P(a, 'E')))).toEqual([3, 4]);
    expect(V.vecEq(V.vec(P(a, 'D'), P(a, 'E')), V.vec(P(a, 'C'), P(a, 'F')))).toBe(true);
    expect(V.isParallelogram(P(a, 'D'), P(a, 'E'), P(a, 'F'), P(a, 'C'))).toBe(true);
    const m = FIG.FIG_METHOD_EQUAL;
    expect(V.vecEq(V.vec(P(m, 'A'), P(m, 'B')), V.vec(P(m, 'D'), P(m, 'C')))).toBe(true);
    expect(V.isParallelogram(P(m, 'A'), P(m, 'B'), P(m, 'C'), P(m, 'D'))).toBe(true);
    const k = FIG.FIG_KNOW_EQUAL;
    expect(V.vecEq(V.vec(P(k, 'A'), P(k, 'B')), V.vec(P(k, 'C'), P(k, 'D')))).toBe(true);
    expect(V.isParallelogram(P(k, 'A'), P(k, 'B'), P(k, 'D'), P(k, 'C'))).toBe(true);
  });

  it('every statement.figure of the practice bank', () => {
    const root = new URL('../../../../../../../../../../content/practice/4am/hisab-murakkibatay/', import.meta.url);
    if (!existsSync(root)) return;
    const bad = [];
    for (const lvl of readdirSync(root)) {
      for (const f of readdirSync(new URL(`${lvl}/`, root))) {
        const ex = JSON.parse(readFileSync(new URL(`${lvl}/${f}`, root), 'utf8'));
        const fig = ex.statement.figure;
        if (!fig) continue;
        const issues = [...validateGeoFigure(fig), ...figureQuality(fig)];
        if (issues.length) bad.push(`${f}: ${issues.join(' ; ')}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
