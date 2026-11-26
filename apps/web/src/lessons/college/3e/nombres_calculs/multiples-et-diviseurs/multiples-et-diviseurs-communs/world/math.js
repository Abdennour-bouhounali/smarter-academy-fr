/**
 * The arithmetic of lesson `multiples-et-diviseurs-communs` — PURE. The PGCD, the divisors, the French agreement of a counted
 * noun, the noun tables of the world and French typography (`fr`, `frAll`) are the authoring kit's
 * (`kit/authoring/numbers.js`), RE-EXPORTED here, never copied (only those an app file imports: D52); the French writing
 * of a whole number is the core's (`formatFr` « 13 248 », `texFr` « 13\,248 »).
 *
 * What is this lesson's own: the smallest common multiple (`lcm`, `lcmOf`), its NUMBERS (ONE place — the story, the
 * tablets, the knowledge page, the trainer, the forges and the tests read them: design page
 * `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 4, every value computed by its proof script) and the
 * writing of a decomposition with its powers as LaTeX (`powersOf`, `powTex`: the same as lessons 1 and 2 — a candidate for
 * the kit, reported, not moved: not this brief's).
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { gcd } from '../../../../../../common/gameworld/kit/authoring/numbers';

// only what an app file of the lesson imports (defects.md D52): the forges agent adds what its forges need
export {
  CELLS,
  COINS,
  PLANKS,
  ROWS,
  counted,
  fr,
  frAll,
  gcd,
  listFr,
  range,
} from '../../../../../../common/gameworld/kit/authoring/numbers';

/** The smallest common multiple of two whole numbers ≥ 1. */
export const lcm = (a, b) => (a / gcd(a, b)) * b;
/** The smallest common multiple of a list of whole numbers ≥ 1. */
export const lcmOf = (xs) => xs.reduce(lcm, 1);

/**
 * THE NUMBERS of the lesson, each checked against the five 3e banks and every French story by the design's collision
 * check. No purse is exact: each pays the first pillar that holds and not the next one.
 */
export const NUMBERS = {
  /**
   * K1 `pilier-commun` — islands A → B, the walkway of the quay: planks of 16 and 20 cases, a ruler 0 … 400, 14 coins.
   * 80 holds (5 + 4 = 9 planks); 160, 240, 320, 400 hold too, but 160 costs 18 planks and 320 (the product) 36.
   * The last step: planks of 14 and 49 → 98 (7 and 2 planks).
   */
  pillar: { crews: [16, 20], ruler: 400, purse: 14, use: [14, 49] },
  /**
   * K2 `ppcm-facteurs` — islands C → D, the second walkway: planks of 414 = 2 × 3² × 23 and 192 = 2⁶ × 3, 120 coins, the
   * spreadsheet of lesson 1 at the workshop. 13 248 costs 32 + 69 = 101 planks; 26 496 holds but costs 202. The mirror's
   * second pair, where the six tile rules give six numbers: 1 156 = 2² × 17² and 952 = 2³ × 7 × 17. The last step:
   * 2³ × 7 × 11 and 2² × 11² (their values are never written), then the coprime pair 2⁵ and 3³.
   */
  factors: {
    crews: [414, 192],
    purse: 120,
    mirror: [1156, 952],
    use: [
      [
        { p: 2, e: 3 },
        { p: 7, e: 1 },
        { p: 11, e: 1 },
      ],
      [
        { p: 2, e: 2 },
        { p: 11, e: 2 },
      ],
    ],
    coprime: [[{ p: 2, e: 5 }], [{ p: 3, e: 3 }]],
  },
  /**
   * K3 `traduire-rendez-vous` — island E, the mirror (`crews`, mode `story`), its own ruler 0 … 700. Round 1: two wheels of
   * 32 and 20 teeth; round 2: a line every 10 min and a shuttle every 46 min, together at 6 h 10. The last step: the
   * same pair 32 and 20 for rods cut into equal pieces (cm) and for the wheels (teeth).
   */
  story: { ruler: 700, gears: [32, 20], bus: { every: [10, 46], start: [6, 10] }, rods: [32, 20] },
  /**
   * K4 `cinq-equipes` — island F, the mirror (`crews`, mode `days`): team x works 1 day then sleeps x days (x = 1 … 5),
   * all at work on day 1; 62 columns. The last step: three teams that sleep 3, 13 and 18 days.
   */
  days: { sleeps: [1, 2, 3, 4, 5], span: 62, trio: [3, 13, 18] },
  /**
   * THE FINAL MISSION — island G, the harbour: three ferries cross 1 day then rest 7, 16 and 19 days; 3 posters a run.
   */
  mission: { rests: [7, 16, 19], posters: 3, names: ['nord', 'ouest', 'sud'] },
};

// ───────────────────────── writing numbers and decompositions ─────────────────────────

/** A whole number as French prose writes it: « 13 248 » (a narrow no-break space between the thousands). */
export const nb = (n) => formatFr(n);
/** A whole number inside LaTeX: « 13\,248 ». */
export const tx = (n) => texFr(n);

/** The decomposition of n with its powers: [{ p, e }], primes increasing — 414 → [{ p: 2, e: 1 }, { p: 3, e: 2 }, { p: 23, e: 1 }]. */
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
/** [{ p, e }] as LaTeX: « 2^{6} \times 3^{2} \times 23 » (an exponent 1 is not written). */
export const powTex = (fs) => fs.map(({ p, e }) => (e === 1 ? tx(p) : `${tx(p)}^{${e}}`)).join(' \\times ');

/**
 * The smallest common multiple of decompositions read the way K2's rule reads them: EVERY prime seen, each with its
 * LARGER exponent. [{ p, e }], primes increasing.
 */
export function lcmPowers(...lists) {
  const best = new Map();
  for (const fs of lists) for (const { p, e } of fs) best.set(p, Math.max(best.get(p) ?? 0, e));
  return [...best.entries()].sort((x, y) => x[0] - y[0]).map(([p, e]) => ({ p, e }));
}
/** The PGCD of two decompositions as lesson 2 reads it — the common primes, the SMALLER exponent: the wrong tile of K2. */
export const commonPowers = (xs, ys) =>
  xs
    .filter((x) => ys.some((y) => y.p === x.p))
    .map((x) => ({ p: x.p, e: Math.min(x.e, ys.find((y) => y.p === x.p).e) }));

/** « 4e » — the ordinal of a plank in the facts of a walkway (« la 4e dépasserait »). */
export const ordinal = (n) => (n === 1 ? '1re' : `${n}e`);

/** The first day after day 1 when teams of these cycles all work: 1 + the smallest common multiple. */
export const togetherDay = (cycles) => 1 + lcmOf(cycles);
