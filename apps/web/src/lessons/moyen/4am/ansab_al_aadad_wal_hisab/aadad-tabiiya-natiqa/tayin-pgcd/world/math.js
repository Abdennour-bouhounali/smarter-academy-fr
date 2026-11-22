/**
 * The arithmetic of lesson `tayin-pgcd` — PURE. A divisor list, the common divisors, the PGCD (used to JUDGE, never shown
 * as a method), a convoy's road and the Arabic agreement are the authoring kit's (`kit/authoring/numbers.js`),
 * re-exported here for the story, the practice ladder, the trainer, the knowledge page and their tests: no number of the
 * lesson is typed where it can be computed.
 *
 * The story's NUMBERS live here too (and `story.js` re-exports them): the bench of the first workshop (`inquiries.js ›
 * LISTS_BENCH`) is a part of the story's first segment, so `story.js` imports `inquiries.js` — which must then read the
 * numbers from a module that imports neither (no import cycle).
 */

/**
 * The numbers of the story — ONE place: the segments, the sentences, the tablets, the forges and the tests read them.
 * A convoy (GAME_WORLD.md §2ter-1): consecutive bridges built with the plank made in the workshop of its FIRST island,
 * a coin of the purse per plank laid whatever its length; `plank` = the one length in 1 … the longest gap that builds
 * every bridge of the convoy with its coins (`story.test.js` computes it).
 */
export const NUMBERS = {
  /** Islands A–C, key 📋: no plank is offered; 19 coins = 8 + 11 planks of 4 (with 2: 16 + 22; with 1: 76). */
  lists: { gaps: [32, 44], purse: 19, plank: 4 },
  /** The last step of forge 📋: a new pair, its lists typed (39 ; 65 was a pair of the exercise bank: replaced). */
  use: { gaps: [58, 87], plank: 29 },
  /** Islands C–E, key ⚡: two gaps of the same length; 2 coins — one plank of 27 for each. */
  same: { gaps: [27, 27], purse: 2, plank: 27 },
  /** Islands E–G, key ⚡: the second gap has 0 cells (its bridge stands from the start); 1 coin. */
  full: { gaps: [27, 0], purse: 1, plank: 27 },
  /** Islands G–I, key 🎯: the shorter gap's own length builds both; 5 coins = 1 + 4. */
  nest: { gaps: [19, 76], purse: 5, plank: 19 },
  /** For forge 🎯 (its agent decides): a pair where the shorter gap does NOT build the longer; 7 coins = 5 + 2 planks of 18. */
  against: { gaps: [90, 36], purse: 7, plank: 18 },
  /**
   * The last bridge: the harbour's two piers laid end to end (154 cells, then 238), ONE kind of plank for both, the
   * longest; the store offers 22 (it fills the first pier only) and 14; the price of one plank (دج).
   */
  boss: { piers: [154, 238], options: [22, 14], plank: 14, price: 90 },
};

export {
  COINS,
  coinsLeft,
  commonDivisors,
  counted,
  divisorsOf,
  emptyCells,
  gcd,
  listAr,
  pgcdTex,
  planksFill,
  planksOf,
  roadOf,
} from '../../../../../../common/gameworld/kit/authoring/numbers';
