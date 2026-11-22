/**
 * The arithmetic of lesson `bahth-pgcd` — PURE. The PGCD, the two algorithms (the subtractions and Euclid's divisions),
 * a convoy's road and the Arabic agreement of the counted words are the authoring kit's (`kit/authoring/numbers.js`),
 * re-exported here for the story, the practice ladder, the trainer, the knowledge page and their tests: no number of the
 * lesson is typed where it can be computed.
 *
 * The story's NUMBERS live here too (and `story.js` re-exports them): the benches of the workshops (`inquiries.js`) are
 * parts of the story's segments, so `story.js` imports `inquiries.js` — which must then read the numbers from a module
 * that imports neither (no import cycle).
 */

/**
 * The numbers of the story — ONE place: the segments, the sentences, the tablets, the forges and the tests read them.
 * A convoy (GAME_WORLD.md §2ter-1): consecutive bridges built with the planks of ITS FIRST island; with a purse, a coin
 * per plank laid whatever its length, and `plank` = the one length in 1 … the longest gap that builds every bridge of
 * the convoy with its coins (`story.test.js` computes it). Every pair was checked against the lesson's exercise bank
 * (none is a pair it names, none stands on one line of it) and against the stories of the lessons already built.
 */
export const NUMBERS = {
  /**
   * Islands A–D, key ➖: THREE gaps, the third the first minus the second; island A offers four planks and no workshop —
   * 19 fills the three, 8 fills 152 only, 5 fills 95 only, 3 fills 57 only. No purse.
   */
  diff: { gaps: [152, 95, 57], moulds: [8, 19, 5, 3], plank: 19 },
  /**
   * Islands D–F, key 🪜: a workshop (its bench: the subtraction ladder), a purse of 12 coins = 7 + 5 planks of 37.
   * (The design's 119 ; 85 is lesson 7's trap pair; 161 ; 115 stands on a line of this lesson's bank: replaced.)
   */
  tarh: { gaps: [259, 185], purse: 12, plank: 37 },
  /** Forge 🧮 keeps its experiment in the mirror (`ladder`, mode `fold`): three subtractions of 296, one division. */
  fold: { gaps: [962, 296] },
  /** Islands F–H, key 🔁: long gaps, a workshop (its bench: the division ladder), 61 coins = 47 + 14 planks of 39. */
  iqlidis: { gaps: [1833, 546], purse: 61, plank: 39 },
  /** Islands H–J, key ⏱️: a workshop (its bench: both ladders side by side), 61 coins = 59 + 2 planks of 17. */
  sibaq: { gaps: [1003, 34], purse: 61, plank: 17 },
  /**
   * The last bridge: the landing's two lanes laid end to end (1176 cells, then 868), ONE kind of plank for both, the
   * longest; the store offers 56 (it fills the first lane only — and it is the remainder just before the last one that is
   * not 0 in Euclid's ladder of the two lanes) and 28; the price of one plank (دج).
   */
  boss: { lanes: [1176, 868], options: [56, 28], plank: 28, price: 85 },
};

export {
  COINS,
  DIVISIONS,
  DIVISIONS_GEN,
  PLANKS_ACC,
  ROWS,
  ROWS_ACC,
  SUBTRACTIONS,
  SUBTRACTIONS_GEN,
  coinsLeft,
  counted,
  differences,
  divTex,
  divisionTex,
  emptyCells,
  euclid,
  gcd,
  listAr,
  ltr,
  pgcdTex,
  planksFill,
  planksOf,
  range,
  roadOf,
  subTex,
} from '../../../../../../common/gameworld/kit/authoring/numbers';
