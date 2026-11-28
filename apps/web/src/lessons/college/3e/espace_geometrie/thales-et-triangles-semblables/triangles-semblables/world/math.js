/**
 * THE MATHS of lesson `triangles-semblables` — PURE. The exact numbers (`kit/exact.js`: a length is TEXT « 21 »,
 * « 3/2 », read exactly; a float never decides) and French typography (`frAll`) are the kit's; the stages' numbers are the
 * WORLD's (`nilePyramids/logic.js`: FACE, …). They are RE-EXPORTED here, never copied (defects.md D8).
 *
 * What is this lesson's own: its two key ids, the numbers of the design (`docs/reports/UNIT_3E_THALES_DESIGN.md` §
 * « Lesson 1 », v4 — ONE place: the story, the forges, the tablets and the tests read them; every screen was run pair by
 * pair by the design's `ts-pairs.py`) and the figures of « Entraîne-toi » and of the knowledge map
 * (FIGURES, the platform's own: none of them is a figure of the story, and no two numbers of ten and more or with a
 * comma, of one figure, stand together on a sheet of a bank, an item of a class test or a line of another lesson —
 * `trainer.test.js` re-reads the rule).
 *
 * A length is text in metres (the story) or centimetres (the platform's figures). A triangle is the list of its three
 * sides, ASCENDING; its homologous triangle is the list of the sides it is paired with, ascending too.
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { tex, tryRead, write } from '../../../../../../common/gameworld/kit/exact';

export {
  compare,
  equal,
  isInteger,
  minus,
  over,
  plus,
  read,
  tex,
  times,
  write,
} from '../../../../../../common/gameworld/kit/exact';
export { frAll } from '../../../../../../common/gameworld/kit/authoring/numbers';
export { FACE } from '../../../../../../common/gameworld/nilePyramids/logic';

/**
 * The two keys, in the order of the docks (design). `journey.js › KEYS` writes the same ids as single-quoted literals
 * (the status script reads that line); `journey.test.js` checks the two agree.
 *   K1 `cotes-proportionnels` (dock 2, « Le chantier des bâtisseurs », P1 and P3) · K2 `angles-egaux` (dock 4,
 *   « Le pyramidion », P2 and P3)
 */
export const K = { cotes: 'cotes-proportionnels', angles: 'angles-egaux' };

/**
 * THE DESIGN'S NUMBERS — K1's masons' table, K2's, the mission. A length is text.
 */
export const NUMBERS = {
  /**
   * K1 `cotes-proportionnels` — the masons trace triangles on the yard's sand (metres). The TEMPLATE T: 2 ; 3 ; 3,8.
   * Rounds (design): `sides` the traced triangle's sides IN THE ORDER OF THEIR NAMES; `k` the quotient to the template
   * (the world's own superposition: it covers T exactly or it does not); `shape` its verdict; `moved` how it lies (turned,
   * flipped). `attendu` / `mesure` (ONE, DIFF): the lengths one would expect from the first link (2 ↔ 3, the two shortest
   * sides, the quotient 3 ÷ 2) against the lengths measured. `links` (TURN): the links a mason made by the names.
   */
  cotes: {
    template: ['2', '3', '3,8'],
    /** The first link, laid by the world: the two shortest sides, 3 ÷ 2. */
    first: { from: '2', to: '3' },
    rounds: [
      { id: 'sim', sides: ['4,5', '5,7', '3'], k: '3/2', shape: true, moved: 'turned' },
      { id: 'red', sides: ['1,5', '1', '1,9'], k: '1/2', shape: true, moved: 'flipped' },
      { id: 'one', sides: ['3', '4,5', '5,1'], shape: false, attendu: ['4,5', '5,7'], mesure: ['4,5', '5,1'] },
      { id: 'diff', sides: ['3', '4', '4,8'], shape: false, attendu: ['4,5', '5,7'], mesure: ['4', '4,8'] },
      {
        id: 'turn',
        sides: ['4,5', '5,7', '3'],
        k: '3/2',
        shape: true,
        moved: 'turned',
        /** By the names, T's 2 → 4,5, 3 → 5,7, 3,8 → 3: « 4,5 ÷ 2 ≠ 5,7 ÷ 3 ≠ 3 ÷ 3,8 ». */
        byNames: [
          ['4,5', '2'],
          ['5,7', '3'],
          ['3', '3,8'],
        ],
      },
    ],
    /**
     * The last step: a traced triangle MNP, turned, its sides marked « court · moyen · long » by the world, only
     * [MN] = 12 written, marked « moyen » → paired with T's 3: k = 12 ÷ 3 = 4, the two others 8 and 15,2.
     */
    use: { given: '12', marked: 'moyen', pairedWith: '3', k: '4', short: '8', long: '15,2' },
  },
  /**
   * K2 `angles-egaux` — two triangles apart, a protractor. Angles in whole degrees; 180 is a constant of the world.
   * R1 the face and a block: 27° ; 41° both, 112° the third of both; the sides opposite 112°: 6 and 8, k = 4/3 — it
   * covers (the same shape, not the same size). R2 27° ; 41° against 27° ; 55°: 98° (one equal angle, another shape).
   * R3 a block whose angles are the face's × 1,25, DRAWN by the world: 33,75° ; 51,25° ; 140°, the sum 225°, the world
   * cannot close it. R4 two sides proportional (4 ; 6 against 6 ; 9) with the angle between them 27° against 41°: no
   * protractor, the slide fails, no third side is written.
   */
  angles: {
    face: ['27', '41', '112'],
    r1: { block: ['27', '41', '112'], opposite: ['6', '8'], k: '4/3' },
    r2: { block: ['27', '55', '98'] },
    r3: { factor: '1,25', block: ['33,75', '51,25', '140'], sum: '225' },
    r4: {
      sides: [
        ['4', '6'],
        ['6', '9'],
      ],
      between: ['27', '41'],
    },
    /** The last step: equal angles, apart and flipped; the sides are named by letters only. */
    use: { angles: ['27', '41', '112'] },
  },
  /**
   * The mission — the plateau, a date palm (`story.plateau`: tan 4/5, h 16,8, stick 1,6): the stick 1,6 casts 2, the palm's
   * shadow measures 21; k = 21 ÷ 2 = 10,5 (K1's quotient), h = 1,6 × 10,5 = 16,8. The inverted pairing: 21 × 2 ÷ 1,6.
   */
  mission: { stick: '1,6', stickShadow: '2', palmShadow: '21', k: '10,5', h: '16,8', inverted: '26,25' },
};

/**
 * THE FIGURES OF « ENTRAÎNE-TOI » AND OF THE KNOWLEDGE MAP (the felucca's legs are bare calculations: `run.js`) — the platform's own (none is a figure
 * of the story). Checked pairwise against every bank, class test and French lesson file with the design's
 * `ts-pairs.py` and, in `trainer.test.js`, with the kit's `bank.js › collisions`.
 *   `sides`   two similar triangles: `a`, `b` their sides (cm) in the order of their sizes, `k` = b ÷ a;
 *   `unlike`  two triangles that do not have the same shape, every side an integer under ten (no number to collide);
 *   `angles`  the angle triples (whole degrees, sum 180, ascending) of similar triangles, and `other` pairs of triples
 *             sharing ONE angle (the same angle, another shape).
 */
export const FIGURES = {
  sides: [
    { a: ['4', '5', '6'], b: ['6', '7,5', '9'], k: '3/2' },
    { a: ['4', '6', '7'], b: ['6', '9', '10,5'], k: '3/2' },
    { a: ['4', '7', '9'], b: ['6', '10,5', '13,5'], k: '3/2' },
    { a: ['3', '5', '7'], b: ['3,75', '6,25', '8,75'], k: '5/4' },
    { a: ['4', '7', '8'], b: ['3', '5,25', '6'], k: '3/4' },
    { a: ['4', '5', '8'], b: ['3', '3,75', '6'], k: '3/4' },
  ],
  unlike: [
    { a: ['4', '5', '6'], b: ['6', '7', '8'], why: 'plus' },
    { a: ['5', '6', '7'], b: ['7', '8', '9'], why: 'plus' },
    { a: ['4', '6', '7'], b: ['6', '9', '9'], why: 'deux' },
  ],
  angles: {
    similar: [
      ['49', '58', '73'],
      ['50', '57', '73'],
      ['46', '64', '70'],
      ['42', '64', '74'],
      ['38', '61', '81'],
      ['52', '62', '66'],
    ],
    other: [
      [
        ['25', '53', '102'],
        ['25', '74', '81'],
      ],
      [
        ['32', '62', '86'],
        ['32', '71', '77'],
      ],
      [
        ['28', '71', '81'],
        ['28', '74', '78'],
      ],
      [
        ['34', '53', '93'],
        ['34', '62', '84'],
      ],
    ],
  },
};

/**
 * A number typed in a DECIMAL box (digits and at most one comma, « 21 »; a point typed is a comma) — exact text, or
 * null (an empty box, a word, a sign, NaN).
 */
export function typedNumber(x) {
  if (typeof x === 'number') return Number.isFinite(x) && x >= 0 ? typedNumber(String(x)) : null;
  const t = String(x ?? '').trim();
  if (!/^\d+([,.]\d+)?$/.test(t)) return null;
  const v = tryRead(t.replace('.', ','));
  return v ? write(v) : null;
}
/** A whole number typed in one box, or null. */
export function typedWhole(x) {
  if (typeof x === 'number') return Number.isInteger(x) && x >= 0 ? x : null;
  const t = String(x ?? '').trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}
/** A fraction typed over a bar, as text « p/q » — or null (an empty box, a denominator 0). */
export function typedFrac(n, d) {
  const [p, q] = [typedWhole(n), typedWhole(d)];
  return p == null || !q ? null : `${p}/${q}`;
}
/**
 * A number in a PLAIN sentence: « 6 561 » (a whole number of four digits or more grouped by U+202F, the core's
 * `formatFr`), « 21 » (the decimal comma). Every number of a sentence goes through it (defects.md B31).
 */
const nb = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? formatFr(Number(t)) : t;
};
/** The same inside a formula: « 6\,561 » (`texFr`), « 22{,}5 », « \dfrac{5}{6} ». */
export const tx = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? texFr(Number(t)) : tex(x);
};
/** « 21 m » — a length in a plain sentence: the decimal comma, a no-break space before the unit. */
export const metres = (x, unit = 'm') => `${nb(x)} ${unit}`;
