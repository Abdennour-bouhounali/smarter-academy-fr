import { describe, it, expect } from 'vitest';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';

/**
 * Chaque figure de la leçon (modules, وضعية الاختبار النهائي) est une donnée GeoFigure valide ET lisible (règle du propriétaire,
 * guide §5 « Textbook figures ») : pas de bande étroite, aucune étiquette sur une autre ni sur un point.
 */
const ALL = { PLAN: FIG.PLAN, TEST_FIGURE: FIG.TEST_FIGURE,
  WADIYA_1: FIG.WADIYA_1, WADIYA_2: FIG.WADIYA_2, WADIYA_3: FIG.WADIYA_3, WADIYA_4: FIG.WADIYA_4, WADIYA_5: FIG.WADIYA_5, WADIYA_6: FIG.WADIYA_6 };

describe('wadiya-idmajiya-dawaran — figures', () => {
  it.each(Object.entries(ALL))('%s : valide et lisible', (_, fig) => {
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(figureQuality(fig)).toEqual([]);
    expect(Object.keys(fig.points)).not.toContain('undefined');
  });
});
