/**
 * « Entraîne-toi sur le Nil » — the CONTENT of the practice ladder of lesson `triangles-semblables` (PURE). The ladder is
 * the kit's (`gameworld/kit/ladder.js`); a level is a run of the kit's rail on the river (`nilePyramids/practice.js`). Its
 * waves are the felucca's (`run.js › GENERATORS`, `isRight`): one definition of a buoy, here and between the docks — the
 * first level of a key's node IS the leg sailed after its seal. Every buoy is ONE bare calculation (owner, 2026-11-27),
 * the computations of the key's exercises only: K1 a proportion to complete, a coefficient, a side times its coefficient;
 * K2 the third angle of a triangle. The second level of a node: faster, with harder numbers (`{ hard: true }`).
 */
import { createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import { GENERATORS, isRight, LEG_MIX } from './run';
import { K } from './math';

/** The map: one node per key in the order of the lesson, then the summary node; levels from the easiest. */
export const PRACTICE_NODES = [
  {
    id: K.cotes,
    levels: [
      { speed: 6.0, mix: LEG_MIX[1] },
      {
        speed: 6.6,
        mix: [
          ['cote', {}],
          ['quatrieme', { hard: true }],
          ['coefficient', { hard: true }],
          ['cote', { hard: true }],
        ],
      },
    ],
  },
  {
    id: K.angles,
    levels: [
      { speed: 6.0, mix: LEG_MIX[3] },
      {
        speed: 6.6,
        mix: [
          ['complement', { hard: true }],
          ['troisieme', { hard: true }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster and with the harder numbers
  {
    id: SUMMARY,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['quatrieme', {}],
          ['troisieme', {}],
          ['coefficient', {}],
          ['complement', {}],
          ['cote', {}],
        ],
      },
      {
        speed: 6.8,
        mix: [
          ['quatrieme', { hard: true }],
          ['complement', { hard: true }],
          ['coefficient', { hard: true }],
          ['troisieme', { hard: true }],
          ['cote', { hard: true }],
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
    [K.cotes]: [30, 30],
    [K.angles]: [70, 62],
    [SUMMARY]: [30, 84],
  },
  edges: [
    ['root', K.cotes, null],
    [K.cotes, K.angles, 'Le pyramidion'],
    [K.angles, SUMMARY, null],
  ],
};
