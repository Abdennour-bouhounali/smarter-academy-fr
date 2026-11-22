import { describe, it, expect } from 'vitest';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import * as FIG from './figures';

/**
 * Chaque figure de la leçon (page d'unité, modules, إختبار أولي) est une donnée valide ET lisible (règle du propriétaire, guide
 * §5 « Textbook figures ») : pas de bande étroite, aucune étiquette sur une autre ni sur un point. Les figures de l'espace
 * passent spaceFigureQuality, les coupes axiales (planes) figureQuality.
 */
const SPACE = { CHALLENGE_FIGURE: FIG.CHALLENGE_FIGURE, TEST_FIGURE: FIG.TEST_FIGURE, TRAIN_1_FIGURE: FIG.TRAIN_1_FIGURE, TRAIN_2_FIGURE: FIG.TRAIN_2_FIGURE, TRAIN_3_FIGURE: FIG.TRAIN_3_FIGURE, TRAIN_4_FIGURE: FIG.TRAIN_4_FIGURE };
const PLANE = { AXIAL: FIG.AXIAL, TRAIN_5_FIGURE: FIG.TRAIN_5_FIGURE, TRAIN_6_FIGURE: FIG.TRAIN_6_FIGURE };

describe('wadiya-idmajiya-fada — figures', () => {
  it.each(Object.entries(SPACE))('%s : figure de l’espace valide et lisible', (_, fig) => {
    expect(validateSpaceFigure(fig)).toEqual([]);
    expect(spaceFigureQuality(fig)).toEqual([]);
  });
  it.each(Object.entries(PLANE))('%s : coupe axiale valide et lisible', (_, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
  });
  it('la figure du تحدّ ne porte que les cotes du manuel (aucune réponse)', () => {
    const labels = FIG.CHALLENGE_FIGURE.segments.map((s) => s.label);
    expect(labels).toEqual(['40 cm', '30 cm', '7 cm', '28 cm']);
    expect(JSON.stringify(FIG.CHALLENGE_FIGURE.segments)).not.toMatch(/19|105|24388/);
  });
});
