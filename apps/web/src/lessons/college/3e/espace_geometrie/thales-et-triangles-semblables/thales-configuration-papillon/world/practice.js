/**
 * « Entraîne-toi sur le Nil » — the CONTENT of the practice ladder of lesson `thales-configuration-papillon` (PURE). The
 * ladder is the kit's (`gameworld/kit/ladder.js`); a level is a run of the kit's rail on the river
 * (`nilePyramids/practice.js`). Its waves are the felucca's (`run.js › GENERATORS`, `isRight`): one definition of a
 * buoy, here and between the docks — the first level of a key's node IS the leg sailed after its seal.
 * Each key practises ITS rule only: K1 the partner on the other line and the fourth length from the vertex; K2 the
 * length across the vertex (cut, or asked) and the nested side in two pieces.
 */
import { createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { GENERATORS, isRight, LEG_MIX } from './run';
import { K } from './math';

/** The map: one node per key in the order of the lesson, then the summary node; levels from the easiest. */
export const PRACTICE_NODES = [
  {
    id: K.papillon,
    levels: [
      { speed: 6.0, mix: LEG_MIX[2] },
      {
        speed: 6.6,
        mix: [
          ['longueur', {}],
          ['rapport', {}],
          ['longueur', {}],
        ],
      },
    ],
  },
  {
    id: K.calcul,
    levels: [
      { speed: 6.0, mix: LEG_MIX[3] },
      {
        speed: 6.6,
        mix: [
          ['travers', {}],
          ['emboite', {}],
          ['traversInconnu', {}],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster
  {
    id: SUMMARY,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['longueur', {}],
          ['travers', {}],
          ['emboite', {}],
        ],
      },
      {
        speed: 6.8,
        mix: [
          ['rapport', {}],
          ['traversInconnu', {}],
          ['longueur', {}],
          ['travers', {}],
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and to the felucca's generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: GENERATORS, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map (percent of the map box; a node is its disc over its name
 * — `practice.test.js` measures it as lesson 1's). The root and the links say places of the river, never a key's name
 * (the hub shows before the first key).
 */
export const PRACTICE_MAP = {
  root: 'Les sorties sur le Nil',
  positions: {
    root: [50, 8],
    [K.papillon]: [30, 30],
    [K.calcul]: [70, 62],
    [SUMMARY]: [30, 84],
  },
  edges: [
    ['root', K.papillon, null],
    [K.papillon, K.calcul, 'Le pyramidion'],
    [K.calcul, SUMMARY, null],
  ],
};
