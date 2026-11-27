/**
 * THE TABLETS of lesson `triangles-semblables` — where each rule gets its NAME, after the student forged it (`forges.js`;
 * the screen `kit/Tablet.jsx`: `lines` through MathText, `math` as formulas, `notes` as plain text). Only here do the
 * names appear first: « semblables », « homologues », « réduction » (K1), « deux angles », « 180° » (K2) — the board's
 * recall words, in the words of the lines (never inside a formula). The rules are the design's, word for word. A tablet is
 * at most two lines, two formulas and one note (defects.md B17); every number is the story's (K1's template and its
 * rounds; K2's first round), computed in `story.test.js`.
 */
import { frAll, K } from './math';

export const TABLETS = frAll({
  [K.cotes]: {
    icon: '📏',
    title: 'Des triangles semblables : leurs côtés',
    lines: [
      'Deux triangles sont semblables quand leurs côtés, rangés du plus petit au plus grand, ont trois quotients égaux : leurs longueurs sont proportionnelles.',
      'Les côtés associés sont homologues ; leur quotient est le coefficient $k$ (une réduction si $k < 1$).',
    ],
    // ONE formula: with two, the naming card ran out of its frame at 1366 × 768 (the board's walk)
    math: ['\\dfrac{3}{2} = \\dfrac{4{,}5}{3} = \\dfrac{5{,}7}{3{,}8}'],
    notes: [],
  },
  [K.angles]: {
    icon: '📐',
    title: 'Des triangles semblables : leurs angles',
    lines: [
      'Si deux angles d’un triangle sont égaux à deux angles d’un autre triangle, alors ces deux triangles sont semblables.',
      'Le troisième angle est égal aussi : la somme des angles d’un triangle vaut $180^\\circ$.',
    ],
    math: ['180^\\circ - 27^\\circ - 41^\\circ = 112^\\circ', '\\dfrac{8}{6} = \\dfrac{4}{3}'],
    notes: [],
  },
});
