import { describe, it, expect } from 'vitest';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';

/**
 * Chaque figure de la leçon (modules, وضعية الاختبار النهائي) est une donnée GeoFigure valide ET lisible (règle du propriétaire,
 * guide §5 « Textbook figures ») : pas de bande étroite, aucune étiquette sur une autre ni sur un point.
 */
const ALL = {
  MODEL: FIG.MODEL, TEST_FIGURE: FIG.TEST_FIGURE,
};

describe('wadiya-idmajiya-ashia — figures', () => {
  it.each(Object.entries(ALL))('%s : valide et lisible', (_, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
  });
});
