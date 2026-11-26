/**
 * The arithmetic of lesson `fraction-irreductible` — PURE. The PGCD, the divisors, Euclid's divisions, the French
 * agreement of a counted noun, the world's noun tables and French typography (`fr`, `frAll`) are the authoring kit's
 * (`kit/authoring/numbers.js`), RE-EXPORTED here, never copied (only those an app file imports: D52); what a MARKED
 * STRETCH does (a plank holds when it fills the gap AND puts a joint on the post) is the world's
 * (`divisorIsles/mark.js`); the prime factors of n are the world's (`divisorIsles/factorLadder.js`); the French
 * writing of a whole number is the core's (`formatFr` « 1 786 », `texFr` « 1\,786 »).
 *
 * What is this lesson's own: its NUMBERS (ONE place — the story, the tablets, the knowledge page, the trainer, the
 * forges and the tests read them), the writing of a fraction and of a decomposition as LaTeX (`fracTex`, `powTex` —
 * `powersOf` / `powTex` are lesson 1's and lesson 2's, a candidate for the kit, reported not moved) and the sign of a
 * marked bridge with French thousands (`signOf`: the world's `signTex` writes « 1786 » plain).
 *
 * The numbers are the design's (`docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 3, « Numbers »), each
 * proved by `fraction-irreductible-proof.mjs` and checked CLEAR against the five 3e banks and every French story.
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { markVerdict, signChain } from '../../../../../../common/gameworld/divisorIsles/mark';

// only what an app file of the lesson imports (defects.md D52): the forges agent adds what its forges need
export {
  CELLS,
  COINS,
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
} from '../../../../../../common/gameworld/kit/authoring/numbers';
export { markVerdict, signChain };

export const NUMBERS = {
  /**
   * K1 `simplifier-facteurs` — islands A → B: 246 cases, 138 lit (= 2 × 3 × 23 over 2 × 3 × 41), planks 2, 3, 5, 7 on A.
   * 2 holds (69/123) and 3 holds (46/82); 5 and 7 do not fill 246 (246 = 5 × 49 + 1 = 7 × 35 + 1). The mirror of B opens
   * only when the sign holds both writings; neither is the end (23/41: no plank of 6 on A). The mirror (`measure` /
   * `stages`, chips 2 3 5 7 11 13, NO typed box): round 1 = his sign, 69/123 (only 3 → 23/41), round 2 = 52/76
   * (2² × 13 over 2² × 19: 2 twice → 13/19). The last step: the RAW fraction 735/588 (735 = 3 × 5 × 7², 588 = 2² × 3 × 7²
   * → 5/4), then (2 × 53)/(2² × 7 × 53) given decomposed → 1/14.
   */
  strike: {
    gap: 246,
    mark: 138,
    moulds: [2, 3, 5, 7],
    holders: [2, 3],
    plank: 2,
    rounds: [
      [69, 123],
      [52, 76],
    ],
    chips: [2, 3, 5, 7, 11, 13],
    use: {
      raw: [735, 588],
      decomposed: {
        num: [
          { p: 2, e: 1 },
          { p: 53, e: 1 },
        ],
        den: [
          { p: 2, e: 2 },
          { p: 7, e: 1 },
          { p: 53, e: 1 },
        ],
      },
    },
  },
  /**
   * K2 `irreductible` — islands B → C: 96 cases, 65 lit, planks 2, 3, 5, 13 and 1 on B. 2 and 3 fill 96 and miss the post
   * (65 = 2 × 32 + 1 = 3 × 21 + 2); 5 and 13 do not fill 96 (96 = 5 × 19 + 1 = 13 × 7 + 5); only 1 holds, the sign stays
   * 65/96. The mirror of C opens only once 2, 3, 5 and 13 have each been fired. The forge's attack: 95/228 (= 5/12,
   * 19 hidden). The last step: PGCD(65 ; 96) (= 1, found on his own bridge), then 141/253 (stays), 238/287 (= 34/41,
   * 7 hidden), 204/289 (= 12/17, 17 hidden).
   */
  stays: {
    gap: 96,
    mark: 65,
    moulds: [2, 3, 5, 13, 1],
    tried: [2, 3, 5, 13],
    plank: 1,
    attack: [95, 228],
    use: {
      pgcd: [65, 96],
      fractions: [
        [141, 253],
        [238, 287],
        [204, 289],
      ],
    },
  },
  /**
   * K3 `diviser-par-le-pgcd` — islands C → D: a marked convoy of one, 1 786 cases, 722 lit (= 2 × 19² over 2 × 19 × 47), a
   * purse of 93, C's workshop (1 … 1 786, typed) whose bench is lesson 2's notebook (1 786 = 722 × 2 + 342 | 722 = 342 × 2
   * + 38 | 342 = 38 × 9 + 0). The planks that hold are 1, 2, 19, 38; only 38 is paid (47 planks, 46 coins left; 19 needs
   * 94, ONE coin short). The mirror (`measure` / `direct`, typed box only) is on 722/1 786 itself: 2 → 361/893, 19 →
   * 38/94, 38 → 19/47. The last step: 558/682 (682 = 558 × 1 + 124 | 558 = 124 × 4 + 62 | 124 = 62 × 2 + 0 → 62 → 9/11).
   */
  pgcd: { gap: 1786, mark: 722, purse: 93, plank: 38, use: [558, 682] },
  /**
   * K4 `resultat-irreductible` — islands D → E: 78 cases lit in two strokes, 65 then 4 (5/6 + 2/39 = 65/78 + 4/78 = 69/78 =
   * 23/26), planks 2, 3, 6, 13 on D. 2 and 6 fill 78 and miss the post; 13 puts a joint at the end of the first stroke
   * (65 = 13 × 5) and misses the post (69 = 13 × 5 + 4); only 3 holds. The mirror of E opens once 13 and 3 have both been
   * fired. The forge's attack: 2/3 × 9/26 = 18/78 (once by 2: 9/39, 3 still fills both). The last step: item 1 GUIDED,
   * 3²/23 × (2 × 23)/(3² × 7) = 2/7 (raw 414/1 449); item 2 raw, 23/52 × 44/69 = 1 012/3 588 = 11/39.
   */
  result: {
    gap: 78,
    strokes: [65, 4],
    moulds: [2, 3, 6, 13],
    tried: [13, 3],
    plank: 3,
    crews: [
      [5, 6],
      [2, 39],
    ],
    attack: { x: 2, y: 3, z: 9, w: 26 },
    use: {
      guided: {
        x: [{ p: 3, e: 2 }],
        y: [{ p: 23, e: 1 }],
        z: [
          { p: 2, e: 1 },
          { p: 23, e: 1 },
        ],
        w: [
          { p: 3, e: 2 },
          { p: 7, e: 1 },
        ],
      },
      raw: { x: 23, y: 52, z: 44, w: 69 },
    },
  },
  /**
   * THE FINAL MISSION — island F, the keeper's plaque: the share of the red lanterns, 3/34 × 85/87 = 255/2 958 = 5/58, two
   * blank plaques per run (then a walk back to the quay of E). The drawing is dark until the right plaque, then 174
   * lanterns, 170 lit, 15 red (= 5/58): no count is ever written. 85/986 is what the rules of 2, 3, 5 give.
   */
  mission: {
    calc: { op: '*', x: 3, y: 34, z: 85, w: 87 },
    product: [255, 2958],
    answer: [5, 58],
    plaques: 2,
    jetty: { lanterns: 174, lit: 170, red: 15 },
  },
};

// ───────────────────────── writing numbers, fractions and decompositions ─────────────────────────

/** A whole number as French prose writes it: « 1 786 » (a narrow no-break space between the thousands). */
export const nb = (n) => formatFr(n);
/** A whole number inside LaTeX: « 1\,786 » (a string is left as it is: a decomposition, a box). */
export const tx = (n) => (typeof n === 'number' ? texFr(n) : n);
/** A fraction as LaTeX (inside `$…$`): `\dfrac{722}{1\,786}`. */
export const fracTex = (n, d) => `\\dfrac{${tx(n)}}{${tx(d)}}`;
/** The irreducible form of n/d: [p, q]. */
export const reduce = (n, d, g = gcd(n, d)) => [n / g, d / g];

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/** The decomposition of n with its powers: [{ p, e }], primes increasing — 588 → [{ p: 2, e: 2 }, { p: 3, e: 1 }, { p: 7, e: 2 }]. */
export function powersOf(n) {
  const out = [];
  for (const p of primeFactors(n)) {
    const last = out.at(-1);
    if (last?.p === p) last.e += 1;
    else out.push({ p, e: 1 });
  }
  return out;
}
/** [{ p, e }] as LaTeX: « 2^{2} \times 3 \times 7^{2} » (an exponent 1 is not written). */
export const powTex = (fs) => fs.map(({ p, e }) => (e === 1 ? tx(p) : `${tx(p)}^{${e}}`)).join(' \\times ');

/**
 * The sign of a marked bridge, with French thousands: `\dfrac{138}{246} = \dfrac{69}{123}` — from the planks that held, in
 * his order; a stretch lit in two strokes opens on its sum, `\dfrac{65}{78} + \dfrac{4}{78} = \dfrac{69}{78} = …`.
 */
export function signOf(seg, held = []) {
  const chain = signChain(seg.a, seg.mark, held);
  const head = seg.strokes?.length > 1 ? [seg.strokes.map((s) => fracTex(s, seg.a)).join(' + ')] : [];
  return [...head, ...chain.map(([n, d]) => fracTex(n, d))].join(' = ');
}
