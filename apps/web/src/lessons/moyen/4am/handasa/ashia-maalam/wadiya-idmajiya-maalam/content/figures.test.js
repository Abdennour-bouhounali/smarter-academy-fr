import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';

/**
 * Chaque figure de la leçon (modules, إختبار أولي) ET chaque `statement.figure` du banc de pratique est une donnée
 * GeoFigure valide ET lisible (règle du propriétaire, guide §5 « Textbook figures ») : pas de bande étroite, aucune
 * étiquette sur une autre ni sur un point.
 */
const here = dirname(fileURLToPath(import.meta.url));
const BANK = join(here, '../../../../../../../../../../content/practice/4am/wadiya-idmajiya-maalam');
const bankFigures = () => {
  const out = [];
  for (const lv of readdirSync(BANK).filter((d) => d.startsWith('level-'))) {
    for (const f of readdirSync(join(BANK, lv)).filter((x) => x.endsWith('.json'))) {
      const ex = JSON.parse(readFileSync(join(BANK, lv, f), 'utf8'));
      if (ex.statement?.figure) out.push([f, ex.statement.figure]);
    }
  }
  return out;
};

describe('wadiya-idmajiya-maalam — figures', () => {
  it.each(Object.entries(FIG))('%s : valide et lisible', (_, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
  });
  it('le banc : chaque statement.figure est valide et lisible', () => {
    const figs = bankFigures();
    expect(figs.length).toBeGreaterThan(10);
    for (const [f, fig] of figs) {
      expect(validateGeoFigure(fig), f).toEqual([]);
      expect(figureQuality(fig), f).toEqual([]);
    }
  });
});
