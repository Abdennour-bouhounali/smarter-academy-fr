/**
 * THE EXPERIMENTS « Explore » of lesson `triangles-semblables` — the first phase of its two forges (`forges.js ›
 * inquiry`; the screens are the world's: `nilePyramids/Inquiry.jsx` → `InquiryPair.jsx`, `InquiryAngles.jsx`; their logic
 * `pair.js`, `angles.js`; their words `pairText.js`, `anglesText.js`). No two keys share a (kind, mode) —
 * `inquiries.test.js`. Design: docs/reports/UNIT_3E_THALES_DESIGN.md, « Lesson 1 » v4 (K1, K2) and gate A's fourth notes.
 * ONE round per screen: nothing of an earlier round stays beside the current one (note 3).
 *
 *   cotes-proportionnels  `pair` — the masons' TEMPLATE ABC 2 ; 3 ; 3,8 m and a traced triangle drawn APART. SIM, RED,
 *                         ONE, DIFF: the world lays the first link (« premier lien ») and he links the two others; TURN:
 *                         a mason's links by the names, as given, then he relinks. The world lays the tracé on the
 *                         template itself — it covers it or not —, whatever his links.
 *                           SIM  DEF 4,5 ; 5,7 ; 3 turned (k = 3/2)          the shape
 *                           RED  GHI 1,5 ; 1 ; 1,9 flipped (k = 1/2)         the shape (a reduction)
 *                           ONE  JKL 3 ; 4,5 ; 5,1                           not (attendu 4,5 ; 5,7 — mesuré 4,5 ; 5,1)
 *                           DIFF QRS 3 ; 4 ; 4,8 (every side 1 m longer)     not (attendu 4,5 ; 5,7 — mesuré 4 ; 4,8)
 *                           TURN TUV 4,5 ; 5,7 ; 3, linked by the names       the shape: « 4,5 ÷ 2 ≠ 5,7 ÷ 3 ≠ 3 ÷ 3,8 »
 *   angles-egaux          `angles` — two triangles apart, a protractor (whole degrees); the world writes the third angle
 *                         « 180° − 27° − 41° = 112° » (never a partial sum) and slides one onto the other.
 *                           R1  27° ; 41° both (112°), sides opposite 112°: 6 and 8      it covers (k = 4/3)
 *                           R2  27° ; 41° against 27° ; 55° (98°)                         it does not
 *                           R3  the face's angles × 1,25, DRAWN by the world (225°)       it cannot close
 *                           R4  4 ; 6 at 27° against 6 ; 9 at 41° — no protractor         it does not; no third side
 * Every sentence is a FACT about what he did — never a rule, never a key's name (`inquiries.test.js`).
 */
import { NUMBERS } from './math';

const C = NUMBERS.cotes;
const A = NUMBERS.angles;
const round = (id) => C.rounds.find((r) => r.id === id);

/** How each tracé lies on the sand (drawing only: `turn` in degrees, `flip` a mirror image). */
const LIE = {
  sim: { names: 'DEF', turn: 120, flip: false },
  red: { names: 'GHI', turn: 30, flip: true },
  one: { names: 'JKL', turn: 200, flip: false },
  diff: { names: 'QRS', turn: 80, flip: false },
  turn: { names: 'TUV', turn: 250, flip: false },
};
/** A round of K1: its tracé, its sides in the order of its names, how it lies, who lays the links. */
const pairRound = (id, link) => {
  const { names, turn, flip } = LIE[id];
  return { id, stone: { names, sides: [...round(id).sides], turn, flip }, link };
};

/** K1 — the masons' table: the template and five tracés, one per screen. */
export const PAIR_INQUIRY = {
  kind: 'pair',
  template: { names: 'ABC', sides: [...C.template] },
  rounds: [
    pairRound('sim', 'world-first'),
    pairRound('red', 'world-first'),
    pairRound('one', 'world-first'),
    pairRound('diff', 'world-first'),
    // the mason's links in the order of the names (`given` left out: side i ↔ side i)
    pairRound('turn', 'given'),
  ],
};

/** The face's triangle ABC: 27° at A, 41° at B (112° at C, the world's). */
const FACE = { names: 'ABC', angles: [A.face[0], A.face[1]] };

/** K2 — the masons' protractor: four rounds, one per screen (the shape of `angles.js`). */
export const ANGLES_INQUIRY = {
  kind: 'angles',
  rounds: [
    // R1: a block 41° ; 27° turned and flipped — the sides opposite 112° (the third angle of both): 6 and 8
    {
      id: 'r1',
      a: { ...FACE, side: A.r1.opposite[0] },
      b: { names: 'DEF', angles: [A.r1.block[1], A.r1.block[0]], side: A.r1.opposite[1], turn: 140, flip: true },
      measure: true,
    },
    // R2: 27° ; 55° (98°) — ONE equal angle, 27°: the sides opposite it, 6 and 8
    {
      id: 'r2',
      a: { ...FACE, side: A.r1.opposite[0], opp: 0 },
      b: { names: 'GHI', angles: [A.r2.block[0], A.r2.block[1]], side: A.r1.opposite[1], opp: 0, turn: 200 },
      measure: true,
    },
    // R3: a block whose angles are the face's × 1,25, drawn by the world (33,75° ; 51,25° ; 140°: 225°)
    { id: 'r3', a: { ...FACE }, b: { names: 'JKL', times: A.r3.factor }, measure: true, drawn: true },
    // R4: two sides and the angle between them, written by the world — no protractor, no third side
    {
      id: 'r4',
      a: { names: 'MNP', between: { sides: [...A.r4.sides[0]], angle: A.r4.between[0] } },
      b: { names: 'RST', between: { sides: [...A.r4.sides[1]], angle: A.r4.between[1] }, turn: 90, flip: true },
      measure: false,
    },
  ],
};
