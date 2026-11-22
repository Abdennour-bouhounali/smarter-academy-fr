import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure.js';
import * as FIG from './figures.js';

/**
 * Règle du propriétaire (2026-10-04) : chaque figure du درس — modules, test final, banque de pratique — est lisible :
 * un bloc quasi carré, chaque nom de point libre. Les figures de points ALIGNÉS (أستعدّ 4, نشاط 2 ب) sont des bandes par
 * nature : `{ maxAspect: Infinity }`, seuls les noms sont mesurés.
 */
const COLLINEAR = new Set(['FIG_PREP4', 'FIG_ACT2B', 'FIG_KNOW3']);
const opts = (name) => (COLLINEAR.has(name) ? { maxAspect: Infinity } : {});

describe('shuaayn-mutasawiyayn — figures lisibles', () => {
  it.each(Object.entries(FIG).filter(([n]) => n.startsWith('FIG_')))('%s', (name, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig, opts(name))).toEqual([]);
  });

  it('every statement.figure of the practice bank', () => {
    const root = new URL('../../../../../../../../../../content/practice/4am/shuaayn-mutasawiyayn/', import.meta.url);
    const bad = [];
    for (const lvl of readdirSync(root)) {
      for (const f of readdirSync(new URL(`${lvl}/`, root))) {
        const ex = JSON.parse(readFileSync(new URL(`${lvl}/${f}`, root), 'utf8'));
        const fig = ex.statement.figure;
        if (!fig) continue;
        // une figure de points alignés (نشاط 2 ب, معارف 3) : bande par nature
        const aligned = Object.values(fig.points).every((p) => p[1] === fig.points[Object.keys(fig.points)[0]][1]);
        const issues = figureQuality(fig, aligned ? { maxAspect: Infinity } : {});
        if (issues.length) bad.push(`${f}: ${issues.join(' ; ')}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
