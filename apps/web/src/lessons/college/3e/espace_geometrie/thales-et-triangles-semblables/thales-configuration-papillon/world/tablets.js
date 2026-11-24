/**
 * THE TABLETS of lesson `thales-configuration-papillon` — where each rule gets its NAME, after the student forged it
 * (`forges.js`; the screen `kit/Tablet.jsx`: `lines` through MathText, `math` as formulas, `notes` as plain text). Only
 * here do the names appear first: « théorème de Thalès », « papillon », « demi-tour » (K1), « depuis le sommet » (K2) —
 * the board's recall words, in the words of the lines (never inside a formula). A tablet is at most two lines, two
 * formulas and one note (defects.md B17); every number is the story's (the river; K2's round 3), computed in
 * `story.test.js`. K1 states the DIRECT theorem only: the converse is lesson 3's (design § 2, gate A N6).
 */
import { frAll, K } from './math';

export const TABLETS = frAll({
  [K.papillon]: {
    icon: '🦋',
    title: 'Le théorème de Thalès dans le papillon',
    lines: [
      'Si les droites $(AE)$ et $(BF)$ sont sécantes en $O$ et si $(AB) \\parallel (EF)$, alors $\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}$ : chaque longueur va avec celle de la même droite, de l’autre côté de $O$.',
      'Un demi-tour autour du point d’intersection ramène le papillon aux triangles emboîtés.',
    ],
    math: ['\\dfrac{SE}{SA} = \\dfrac{SR}{SF} = \\dfrac{ER}{AF}', '\\dfrac{9}{72} = \\dfrac{52}{416}'],
    notes: [
      'Au brevet : « Les points A, O, E sont alignés, ainsi que les points B, O, F ; les droites (AB) et (EF) sont parallèles. D’après le théorème de Thalès… »',
    ],
  },
  [K.calcul]: {
    icon: '📏',
    title: 'Calculer une longueur dans le papillon',
    lines: [
      'Chaque longueur part du sommet : je recolle les morceaux ou j’enlève celui d’en face, puis je garde deux rapports avec l’inconnue.',
      'Une longueur depuis le sommet, jamais celle qui le traverse : $SA = EA - SE$ sur la rive, $AB = AM + MB$ dans les triangles emboîtés.',
    ],
    math: ['81 - 9 = 72', '\\dfrac{72 \\times 52}{9} = 416'],
    notes: [],
  },
});
