/**
 * THE MATHS of lesson `thales-configuration-papillon` — PURE. The exact numbers (`kit/exact.js`: a length is TEXT
 * « 22,5 », « 5/6 », read exactly; a float never decides), French typography (`frAll`) and agreement (`counted`,
 * `listFr`) are the kit's; the stages' numbers are the WORLD's (`nilePyramids/logic.js`: RIVER, CAPSTONE, PLATEAU,
 * CAMERA_BOX, FACE). All are RE-EXPORTED here, never copied (defects.md D8).
 *
 * What is this lesson's own: its two key ids, the numbers of the design (`docs/reports/UNIT_3E_THALES_DESIGN.md` § 2–§ 3,
 * ONE place — the story, the forges, the tablets, the tests read them; every group was run pair by pair against the bank
 * and the other French lessons' files) and the figures of « Entraîne-toi » and of the knowledge map (FIGURES, the
 * platform's own: no two of a figure's lengths stand on one line of the bank — `trainer.test.js` reads it).
 *
 * A figure is `{ VM, VB, VN, VC, MN, BC }` (V the vertex): in a BUTTERFLY M and B stand on both sides of V on one line,
 * N and C on the other, and (MN) ∥ (BC); in a NESTED figure M is on [VB] and N on [VC]. A figure of the forges also
 * carries `names` (its letters: { V, M, B, N, C }).
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
export { counted, frAll, listFr } from '../../../../../../common/gameworld/kit/authoring/numbers';
export {
  CAMERA_BOX,
  CAPSTONE,
  FACE,
  PLATEAU,
  RIVER,
  riverFigure,
} from '../../../../../../common/gameworld/nilePyramids/logic';

/**
 * The two keys, in the order of the docks (design § 2). `journey.js › KEYS` writes the same ids as single-quoted
 * literals (the status script reads that line); `journey.test.js` checks the two agree.
 *   K1 « De l’autre côté du sommet » (dock 3, P1 and P2) · K2 « Chaque longueur part du sommet » (dock 4, P2 and P3)
 */
export const K = { papillon: 'papillon', calcul: 'calcul-depuis-le-sommet' };

/**
 * THE DESIGN'S NUMBERS (§ 2, § 3), for the forges (`forges.js`, `inquiries.js`), the mission and the box. A length is
 * text. `names` are a figure's letters; a figure's `len` keys are those of `nilePyramids/figure.js` (VM, VB, VN, VC, MN,
 * BC; a butterfly's lengths ACROSS the vertex are VMB = VM + VB and VNC = VN + VC, never a term of a ratio).
 */
export const NUMBERS = {
  /**
   * K1 `papillon` — dock 3. The river is the world's (`RIVER`: AS 72, SE 9, ER 52; `riverFigure` gives SR, SF as roots):
   * the ferry rope ties at AF = 416; the 4e habit (the length across the stake, EA = 81) gives 468 (slack), the inverted
   * ratio 6,5 (short). None of 81, 468, 6,5 is ever written in the world.
   */
  papillon: {
    river: { AS: '72', SE: '9', ER: '52', AF: '416', EA: '81', across: '468', inverted: '6,5' },
    /**
     * The rounds of the half-turn after his river: round 2 a parallel butterfly I K L / P Q (k = 4/7), round 3 the
     * crooked one on the SAME small triangle (IK/IP = 8/13, IL/IQ = 3/4, KL/PQ = 16/23; cos Î = −1/4).
     */
    rounds: [
      {
        names: { V: 'I', M: 'K', B: 'P', N: 'L', C: 'Q' },
        len: { VM: '4', VB: '7', VN: '6', VC: '10,5', MN: '8', BC: '14' },
        parallel: true,
      },
      {
        names: { V: 'I', M: 'K', B: 'P', N: 'L', C: 'Q' },
        len: { VM: '4', VB: '6,5', VN: '6', VC: '8', MN: '8', BC: '11,5' },
        parallel: false,
      },
    ],
    /**
     * The mirror's attacks on the right rule: O U V / W T (k = 2/3, equal), then crooked on the same big triangle:
     * OU 4, OV 3,9, UV 5,3 (cos Ô = 1/10: UV² = 16 + 15,21 − 3,12 = 28,09; ratios 8/15, 13/40, 53/135). RENUMBERED
     * 2026-11-24 (forges agent): the design's OV 2,5 / UV 4,5 put « 7,5 ; 2,5 » on one line of the bank (l3-007).
     */
    attacks: [
      {
        names: { V: 'O', M: 'U', B: 'W', N: 'V', C: 'T' },
        len: { VM: '5', VB: '7,5', VN: '8', VC: '12', MN: '9', BC: '13,5' },
        parallel: true,
      },
      {
        names: { V: 'O', M: 'U', B: 'W', N: 'V', C: 'T' },
        len: { VM: '4', VB: '7,5', VN: '3,9', VC: '12', MN: '5,3', BC: '13,5' },
        parallel: false,
      },
    ],
    /**
     * The last step: (AE) and (BF) secant at O, (AB) ∥ (EF); OA = 4,2 m, OE = 7 m, OB = 5,1 m, EF = 9 m → OF = 8,5 m
     * (k = 3/5; AB = 5,4 is not asked). The sentence's points: A, O, E aligned, B, O, F aligned.
     */
    use: {
      names: { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' },
      len: { VM: '4,2', VB: '7', VN: '5,1', VC: '8,5', MN: '5,4', BC: '9' },
      given: ['VM', 'VB', 'VN', 'BC'],
      asked: 'VC',
    },
  },
  /** K2 `calcul-depuis-le-sommet` — dock 4's table: the plan's rounds, the attacks, the last step (§ 2). */
  calcul: {
    rounds: [
      /** 1. his river (butterfly): AF = 416; the across EA = 81 gives 468 (too long), the inverted 6,5 (too short). */
      {
        kind: 'butterfly',
        names: { V: 'S', M: 'E', B: 'A', N: 'R', C: 'F' },
        len: { VM: '9', VB: '72', MN: '52', BC: '416' },
        across: { VMB: '81' },
        asked: 'BC',
        errors: { across: '468', inverted: '6,5' },
      },
      /**
       * 2. ONE nested round: AM 2, MB 4, BC 16,5 → AB = 6 (join), MN = 5,5; the piece gives 8,25, the inverted 49,5.
       * AN 4,5 and AC 13,5 (attack (b)'s figure) are never shown here: the drawing needs them.
       */
      {
        kind: 'nested',
        names: { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' },
        len: { VM: '2', VB: '6', VN: '4,5', VC: '13,5', MN: '5,5', BC: '16,5' },
        pieces: { MB: '4' },
        asked: 'MN',
        errors: { piece: '8,25', inverted: '49,5' },
      },
      /**
       * 3. a butterfly (k = 2/5): OA 9, AE 31,5 (ACROSS), AB 5 → OE = 22,5 (cut across), EF = 12,5. OB 11 and OF 27,5
       * (attack (a)'s figure) are never shown here: the drawing needs them.
       */
      {
        kind: 'butterfly',
        names: { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' },
        len: { VM: '9', VB: '22,5', VN: '11', VC: '27,5', MN: '5', BC: '12,5' },
        across: { VMB: '31,5' },
        asked: 'BC',
        errors: { across: '17,5', inverted: '2' },
      },
    ],
    attacks: [
      /** (a) the same butterfly, the unknown across: OA 9, OE 22,5, OB 11 → OF = 27,5, BF = 38,5 (27,5 falls short). */
      {
        kind: 'butterfly',
        names: { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' },
        len: { VM: '9', VB: '22,5', VN: '11', VC: '27,5' },
        across: { VNC: '38,5' },
        asked: 'VNC',
        short: '27,5',
      },
      /** (b) the nested figure, the unknown a piece: AB 6, AM 2, AC 13,5 → AN = 4,5, NC = 9 (4,5 falls short). */
      {
        kind: 'nested',
        names: { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' },
        len: { VM: '2', VB: '6', VN: '4,5', VC: '13,5' },
        pieces: { NC: '9' },
        asked: 'NC',
        short: '4,5',
      },
    ],
    /**
     * The last step (the exam's shape): (AB) ∥ (EF), (AE) and (BF) secant at O; OA = 4 cm, AE = 10 cm, OB = 5,8 cm,
     * EF = 6,9 cm. He CHOOSES the denominator of « OA / [ ] » among OE · AE · OF · EF, then OE = 10 − 4 = 6, OF = 8,7,
     * AB = 4,6 (k = 2/3). The across errors (AE taken for OE) give OF = 5,8 × 10 / 4 = 14,5 and AB = 6,9 × 4 / 10 = 2,76
     * — neither an answer of the lesson; no additive slip gives 8,7 or 4,6. RENUMBERED 2026-11-24 (forges agent): the
     * design's OB 5 / EF 4,5 gave the error 12,5 (round 3's answer, gate A F3) and « 4,5 ; 1,8 » stood on one line of the
     * bank (l2-008).
     */
    use: {
      names: { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' },
      len: { VM: '4', VB: '6', VN: '5,8', VC: '8,7', MN: '4,6', BC: '6,9' },
      across: { VMB: '10' },
      choices: ['OE', 'AE', 'OF', 'EF'],
      errors: { OF: '14,5', AB: '2,76' },
      unit: 'cm',
    },
  },
  /** The final mission, morning (dock 5): the stick 2 casts 3; the pyramid's shadow 104 from the base edge, base 230. */
  mission: { stick: '2', stickShadow: '3', shadow: '104', half: '115', AB: '219', h: '146' },
  /** Noon: the box 177 m from the base edge, its hole 0,5 m from the back; OH = 292; the sheet 0,25 m (§ 2). */
  box: { fromEdge: '177', depth: '0,5', OH: '292', image: '0,25', halfForgot: '73/177', wholeBase: '73/407' },
};

/**
 * THE FIGURES OF « ENTRAÎNE-TOI », OF THE FELUCCA'S LEGS' FACTS AND OF THE KNOWLEDGE MAP — the platform's own (none is a
 * figure of the story; every pair of a figure was checked pairwise against the bank and the other French lessons with
 * the kit's `bank.js › collisions`). In metres or centimetres, a few halves: the bank's small decimals (3,6 ; 4,8 …) are
 * avoided. `across` of a butterfly: VMB = VM + VB, VNC = VN + VC; `pieces` of a nested figure: MB = VB − VM, NC = VC − VN.
 */
export const FIGURES = {
  butterfly: [
    { VM: '26', VB: '45,5', VN: '32', VC: '56', MN: '24', BC: '42' }, // k = 4/7, across 71,5 and 88
    { VM: '30', VB: '40', VN: '21', VC: '28', MN: '19,5', BC: '26' }, // k = 3/4, across 70 and 49
    { VM: '17', VB: '42,5', VN: '19', VC: '47,5', MN: '15', BC: '37,5' }, // k = 2/5, across 59,5 and 66,5
    { VM: '23', VB: '34,5', VN: '29', VC: '43,5', MN: '24', BC: '36' }, // k = 2/3, across 57,5 and 72,5
  ],
  nested: [
    { VM: '19', VB: '47,5', VN: '24', VC: '60', MN: '23', BC: '57,5' }, // k = 2/5, pieces 28,5 and 36
    { VM: '31', VB: '46,5', VN: '29', VC: '43,5', MN: '18', BC: '27' }, // k = 2/3, pieces 15,5 and 14,5
    { VM: '13', VB: '32,5', VN: '16', VC: '40', MN: '21', BC: '52,5' }, // k = 2/5, pieces 19,5 and 24
  ],
};

/**
 * A number typed in a DECIMAL box (digits and at most one comma, « 22,5 »; a point typed is a comma) — exact text, or
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
 * `formatFr`), « 22,5 » (the decimal comma). Every number of a sentence goes through it (defects.md B31).
 */
export const nb = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? formatFr(Number(t)) : t;
};
/** The same inside a formula: « 6\,561 » (`texFr`), « 22{,}5 », « \dfrac{5}{6} ». */
export const tx = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? texFr(Number(t)) : tex(x);
};
/** « 22,5 m » — a length in a plain sentence: the decimal comma, a no-break space before the unit. */
export const metres = (x, unit = 'm') => `${nb(x)} ${unit}`;
