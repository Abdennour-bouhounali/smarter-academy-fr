/**
 * The arithmetic of lesson `awwaliyan-fima-baynahuma` — PURE. The PGCD, Euclid's divisions, the divisors, a convoy's road
 * and the Arabic agreement of the counted words are the authoring kit's (`kit/authoring/numbers.js`), re-exported here for
 * the story, the practice ladder, the trainer, the knowledge page and their tests; the lesson keeps its own numbers, the
 * planks of the divisibility rules and « و » between them: no number of the lesson is typed where it can be computed.
 *
 * The story's NUMBERS live here too (and `story.js` re-exports them): the benches of the workshops (`inquiries.js`) are
 * parts of the story's segments, so `story.js` imports `inquiries.js` — which must then read the numbers from a module
 * that imports neither (no import cycle).
 */

/**
 * The numbers of the story — ONE place: the segments, the sentences, the tablets, the forges and the tests read them.
 * A convoy (GAME_WORLD.md §2ter-1): two consecutive bridges built with the planks of ITS FIRST island; with a purse, a
 * coin per plank laid whatever its length. `plank` = the one length that builds both bridges of the convoy with what the
 * island offers and the coins of the purse (`story.test.js` computes it). Every pair was checked against the lesson's
 * exercise bank (none is a pair it names, none stands on one line of it) and against the stories already built.
 */
export const NUMBERS = {
  /**
   * Islands A–C, key 🤝: 25 then 27, planks 3, 5, 9 and 1 on island A, 52 coins. 5 fills 25 only, 3 and 9 fill 27 only;
   * only the plank 1 builds both — and it takes every coin: 25 + 27 = 52.
   */
  only: { gaps: [25, 27], moulds: [3, 5, 9, 1], purse: 52, plank: 1 },
  /**
   * Islands C–E: 39 then 52, planks 2, 3, 13 and 1 on island C, 40 coins. 3 fills 39 only, 2 fills 52 only, 1 fills
   * both but costs 91 coins (it fills 39, then the coins run out); 13 builds both with 3 + 4 = 7 coins. The purse is big
   * enough for every other plank to show its REAL remainder (3: 13 + 17 = 30 coins): only the plank 1 is stopped by the
   * coins. (The design's 26 ; 39 stands on a line of the bank — « 39 = 26 × 1 + 13 »: replaced.) E: the mirror of 🤝.
   */
  common: { gaps: [39, 52], moulds: [2, 3, 13, 1], purse: 40, plank: 13 },
  /**
   * Islands E–G, key ✅: 35 then 26, a workshop whose bench is the division notebook (35 = 26 × 1 + 9, 26 = 9 × 2 + 8,
   * 9 = 8 × 1 + 1, 8 = 1 × 8 + 0), 61 coins = 35 + 26 planks of 1: the only plank. G: the mirror of ✅. (35 ; 24 was
   * a pair of planks on one line of lesson `qisma-iqlidiya-hasr`'s story: replaced.)
   */
  proof: { gaps: [35, 26], purse: 61, plank: 1 },
  /**
   * Islands G–I, key ❌: 645 then 410, the planks of the divisibility rules on island G (2, 3, 5, 9, 10), no purse.
   * 2 and 10 fill 410 only, 3 fills 645 only, 9 neither; 5 builds both (129 + 82 planks).
   */
  witness: { gaps: [645, 410], moulds: [2, 3, 5, 9, 10], plank: 5 },
  /**
   * Islands I–K: 85 then 119, the same five planks on island I — none builds both (5 fills 85 only) — and a workshop
   * that opens once the first bridge has fallen twice; its bench is the division notebook (119 = 85 × 1 + 34,
   * 85 = 34 × 2 + 17, 34 = 17 × 2 + 0). 50 coins: 17 builds both with 5 + 7 = 12; the plank 1 would cost 204 (85 alone
   * empties the purse). Every plank of the rules shows its REAL remainder before the coins run out (2 lays 42 planks on
   * 85; 5 lays 17 on 85, then 23 on 119). K: the mirror of ❌.
   */
  hidden: { gaps: [85, 119], moulds: [2, 3, 5, 9, 10], purse: 50, plank: 17 },
  /**
   * The last bridge: the harbour's two lanes laid end to end (105 cells, then 74), ONE kind of plank that fills each lane
   * exactly, the longest. 105 and 74 are coprime: the longest is 1. The store offers 35 (it fills the first lane alone:
   * 74 = 35 × 2 + 4) and 1; the price of one plank (دج).
   */
  boss: { lanes: [105, 74], options: [35, 1], plank: 1, price: 5 },
};

/** The planks of the divisibility rules a 4AM student tests without dividing (the planks of islands G and I). */
export const RULES = [2, 3, 5, 9, 10];

/** « 2 و 3 و 5 و 9 و 10 » — the planks of an island, as the instruction says them. */
export const andAr = (xs) => xs.join(' و ');

export {
  COINS,
  DIVISIONS,
  ROWS,
  ROWS_ACC,
  coinsLeft,
  counted,
  divTex,
  divisorsOf,
  emptyCells,
  euclid,
  gcd,
  listAr,
  ltr,
  pgcdTex,
  planksFill,
  planksOf,
  roadOf,
} from '../../../../../../common/gameworld/kit/authoring/numbers';
