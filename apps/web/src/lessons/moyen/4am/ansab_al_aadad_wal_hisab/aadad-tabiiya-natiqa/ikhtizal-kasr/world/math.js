/**
 * The arithmetic of lesson `ikhtizal-kasr` — PURE. What every lesson of « أرخبيل القواسم » needs (the PGCD, Euclid, the
 * Arabic agreement, a list, an isolated equality) is the authoring kit's (`kit/authoring/numbers.js`), re-exported here;
 * what a MARKED STRETCH does (a plank holds when it fills the gap AND puts a joint on the mark; the sign of the bridge)
 * is the world's (`divisorIsles/mark.js`). This file keeps the lesson's NUMBERS — ONE place: the segments, the
 * sentences, the tablets, the forges and the tests read them — and the few words of a fraction.
 *
 * The story's NUMBERS live here (and `story.js` re-exports them): the benches of the workshops (`inquiries.js`) are parts
 * of the story's segments, so `story.js` imports `inquiries.js` — which must then read the numbers from a module that
 * imports neither (no import cycle).
 */
import { counted, gcd } from '../../../../../../common/gameworld/kit/authoring/numbers';

export {
  COINS,
  ROWS,
  ROWS_ACC,
  coinsLeft,
  commonDivisors,
  counted,
  divisorsOf,
  euclid,
  gcd,
  ltr,
  pgcdTex,
  planksFill,
  planksOf,
  range,
} from '../../../../../../common/gameworld/kit/authoring/numbers';
export { markVerdict, signChain, signTex } from '../../../../../../common/gameworld/divisorIsles/mark';

/**
 * The numbers of the story (`docs/reports/BATCH_2_DESIGN.md` §7 « Lesson 8 », the road; every pair checked with
 * `node scripts/lesson-bank-numbers.mjs ikhtizal-kasr --check …` — CLEAR). A bridge is a FRACTION: its `mark` lit cells
 * over its `gap` cells. A plank of b HOLDS when b divides the gap AND the mark; the sign then counts in planks.
 * `plank` = the plank the story expects (`holdsWith`): `story.test.js` computes that it is the only one.
 */
export const NUMBERS = {
  /**
   * A → B, key 🪜: 78 cells, 66 lit, planks 2, 4, 6 and 9 on island A. 2 holds (66/78 = 33/39); 4 and 9 do not fill 78;
   * 6 holds (= 11/13). He crosses to the mirror once the sign holds BOTH writings (he built with 2 AND with 6).
   */
  marahil: { gap: 78, mark: 66, moulds: [2, 4, 6, 9], holders: [2, 6], plank: 6 },
  /**
   * B → C, key 🔒: 48 cells, 35 lit, planks 3, 5, 7 and 1 on island B. 3 fills 48 and misses the mark
   * (35 = 3 × 11 + 2); 5 and 7 do not fill 48; only 1 holds, and the sign stays 35/48.
   */
  ghayr: { gap: 48, mark: 35, moulds: [3, 5, 7, 1], plank: 1 },
  /**
   * C → D, key 🎯 (first bridge): 99 cells, 66 lit, a workshop (its bench: the division notebook) and a purse of 3 coins:
   * only the longest plank that holds is paid — 33, three planks: 66/99 = 2/3 at once.
   */
  thuluth: { gap: 99, mark: 66, purse: 3, plank: 33 },
  /**
   * D → E, key 🎯 (second bridge): 243 cells, 189 lit, a workshop with the same notebook, a purse of 9 coins: only 27
   * (nine planks): 189/243 = 7/9. Cheaper planks (81, 243) fill the gap and miss the mark. (The design's 216 ; 168 was
   * replaced: 168 stands alone in the bank, `l1-003`.)
   */
  tusu: { gap: 243, mark: 189, purse: 9, plank: 27 },
  /**
   * E → F, key 🧾: 39 cells lit in two strokes, 5 then 8 (13), a workshop and a purse of 3: the sign opens on
   * 5/39 + 8/39 = 13/39; only 13 is paid — 1/3.
   */
  natija: { gap: 39, strokes: [5, 8], purse: 3, plank: 13 },
  /**
   * G → H, the last bridge — the store: 273 cells lit in two strokes, 88 then 107 (195), a purse of 7 coins. The store
   * offers 3 and 39: BOTH hold the mark (3 divides 273 and 195), but 3 writes 65/91 — a fraction that still reduces (by
   * 13, which no rule of divisibility shows) — and needs 91 planks: the purse stops it at the seventh. Only 39, the
   * PGCD, writes 195/273 = 5/7, the irreducible form, with the 7 coins. The price of a plank, in دج.
   */
  boss: { gap: 273, strokes: [88, 107], purse: 7, options: [3, 39], plank: 39, price: 6 },
};

/** A fraction as LaTeX (inside `$…$`): `\frac{66}{78}`. */
export const fracTex = (n, d) => `\\frac{${n}}{${d}}`;
/** The irreducible form of n/d: [p, q]. */
export const reduce = (n, d, g = gcd(n, d)) => [n / g, d / g];

/** The cells of a gap, agreed: « خانة واحدة », « خانتان », « 5 خانات », « 39 خانة ». */
export const CELLS = ['خانة واحدة', 'خانتان', 'خانات', 'خانة'];
export const cells = (n) => counted(n, CELLS);
/** « 2 و 4 و 6 و 9 » — the planks of an island, as the instruction says them. */
export const andAr = (xs) => xs.join(' و ');
