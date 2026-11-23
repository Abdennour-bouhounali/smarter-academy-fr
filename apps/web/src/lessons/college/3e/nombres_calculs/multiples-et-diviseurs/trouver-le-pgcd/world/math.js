/**
 * The arithmetic of lesson `trouver-le-pgcd` — PURE. The PGCD, the divisors, Euclid's divisions, a convoy's road, the
 * French agreement of a counted noun, the world's noun tables and French typography (`fr`, `frAll`) are the authoring
 * kit's (`kit/authoring/numbers.js`), RE-EXPORTED here, never copied (only those an app file imports: D52); the prime
 * factors of n are the world's (`divisorIsles/factorLadder.js`); the longest prime the spreadsheet of the islands
 * reaches is the world's too (`divisorIsles/sheet.js`); the French writing of a whole number is the core's (`formatFr`
 * « 52 015 », `texFr` « 52\,015 »).
 *
 * What is this lesson's own: its NUMBERS (ONE place — the story, the tablets, the knowledge page, the trainer, the forges
 * and the tests read them) and the writing of a decomposition with its powers as LaTeX (`powersOf`, `powTex`: the same
 * as lesson 1's math.js — a candidate for the kit, reported, not moved: not this brief's).
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { MAX_LINES, primesUpTo } from '../../../../../../common/gameworld/divisorIsles/sheet';

// only what an app file of the lesson imports (defects.md D52): the forges agent adds what its forges need
export {
  CELLS,
  COINS,
  DIVISIONS,
  PLANKS,
  ROWS,
  coinsLeft,
  commonDivisors,
  counted,
  divisorsOf,
  euclid,
  fr,
  frAll,
  gcd,
  listFr,
  pgcdTex,
  planksOf,
  range,
  roadOf,
} from '../../../../../../common/gameworld/kit/authoring/numbers';

/**
 * THE NUMBERS of the lesson (`docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 2 « Numbers »), each checked
 * against lesson 1's bank and every French story by the design's collision check (`check.mjs`, all CLEAR — the script
 * `lesson-bank-numbers.mjs` refuses a lesson with no bank yet). Four convoys: two gaps, ONE plank length made at the head
 * island's workshop (typed), a coin per plank laid. No purse is exact: each pays the PGCD and not the next common plank.
 */
export const NUMBERS = {
  /**
   * K1 `diviseurs-communs` — islands A → B → C, the convoy « jumeaux »: 90 then 54 cases, A's workshop makes 1 … 90, NO
   * bench, 15 coins. 18 builds (5 + 3 planks); 9 runs out of coins (10 + 6); 27, 45, 30, 15 are refused by a gap.
   * The last step: (75 ; 45) — its difference 30 is not its PGCD 15.
   */
  twins: { gaps: [90, 54], purse: 15, plank: 18, use: [75, 45] },
  /**
   * K2 `lots-identiques` — the stall of island C, the experiment `deal`: 30 apples and 42 pears into identical baskets,
   * chips 2 … 12. The last step: 35 apples and 56 pears (7 baskets of 5 apples and 8 pears).
   */
  deal: { apples: 30, pears: 42, chips: [2, 12], use: [35, 56] },
  /**
   * K3 `pgcd-facteurs` — islands C → D → E, the convoy « grands fossés »: 1 736 = 2³ × 7 × 31 then 980 = 2² × 5 × 7², 193
   * coins, C's workshop (1 … 1 736) whose bench is lesson 1's spreadsheet (two rounds; it writes 868, 434, 217, 31 and
   * 490, 245, 49, 7). 28 = 2² × 7 builds (62 + 35 planks); 14 runs out of coins (124 + 70).
   * The last step: 2⁴ × 3³ × 5 (= 2 160) and 2² × 3⁴ × 7 (= 2 268), given decomposed → 2² × 3³ = 108.
   */
  factors: {
    gaps: [1736, 980],
    purse: 193,
    plank: 28,
    use: [
      [
        { p: 2, e: 4 },
        { p: 3, e: 3 },
        { p: 5, e: 1 },
      ],
      [
        { p: 2, e: 2 },
        { p: 3, e: 4 },
        { p: 7, e: 1 },
      ],
    ],
  },
  /**
   * K4 `euclide` — islands E → F → G, the convoy « Euclide »: 52 015 = 5 × 101 × 103 then 31 209 = 3 × 101 × 103, 807
   * coins, E's workshop (1 … 52 015) whose bench is the division notebook (`ladder` / `divide`, plain); 10 403 builds
   * (5 + 3 planks), 103 runs out of coins (505 + 303). The spreadsheet stops at 89 (`SHEET_LAST`): 10 403 = 101 × 103 is
   * out of its reach. The mirror's experiment (`nest` / `pair`): the contrast (88 ; 33) against (88 ; 22), then the
   * notebook's last two pairs. The last step: (1 073 ; 957) — three divisions, PGCD 29.
   */
  euclide: { gaps: [52015, 31209], purse: 807, plank: 10403, contrast: [88, 33, 22], use: [1073, 957] },
  /**
   * THE FINAL MISSION — islands H → I → J, the jetty of the lighthouse: 1 462 = 2 × 17 × 43 then 946 = 2 × 11 × 43, 55
   * coins, H's workshop (1 … 1 462) with NO bench. Only 86 builds (17 + 11 planks); 43 runs out of coins (34 + 22);
   * 516, 430, 5 and 946 are refused by the gap of 1 462.
   */
  mission: { gaps: [1462, 946], purse: 55, plank: 86 },
};

/** The longest prime the spreadsheet of the islands writes a line for (its 24 lines: 2 … 89). */
export const SHEET_LAST = primesUpTo(1000)[MAX_LINES - 1];

// ───────────────────────── writing numbers and decompositions ─────────────────────────

/** A whole number as French prose writes it: « 52 015 » (a narrow no-break space between the thousands). */
export const nb = (n) => formatFr(n);
/** A whole number inside LaTeX: « 52\,015 ». */
export const tx = (n) => texFr(n);

/** The decomposition of n with its powers: [{ p, e }], primes increasing — 980 → [{ p: 2, e: 2 }, { p: 5, e: 1 }, { p: 7, e: 2 }]. */
export function powersOf(n) {
  const out = [];
  for (const p of primeFactors(n)) {
    const last = out.at(-1);
    if (last?.p === p) last.e += 1;
    else out.push({ p, e: 1 });
  }
  return out;
}
/** The value of a decomposition [{ p, e }]. */
export const valueOfPowers = (fs) => fs.reduce((v, { p, e }) => v * p ** e, 1);
/** [{ p, e }] as LaTeX: « 2^{3} \times 7 \times 31 » (an exponent 1 is not written). */
export const powTex = (fs) => fs.map(({ p, e }) => (e === 1 ? tx(p) : `${tx(p)}^{${e}}`)).join(' \\times ');

/**
 * The PGCD of two decompositions read the way K3's rule reads it: every prime COMMON to both, with the SMALLER exponent
 * seen. [{ p, e }] — [] when they share no prime (the PGCD is then 1).
 */
export const commonPowers = (xs, ys) =>
  xs
    .filter((x) => ys.some((y) => y.p === x.p))
    .map((x) => ({ p: x.p, e: Math.min(x.e, ys.find((y) => y.p === x.p).e) }));
