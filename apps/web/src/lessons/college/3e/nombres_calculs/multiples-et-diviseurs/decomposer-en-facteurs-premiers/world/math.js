/**
 * The arithmetic of lesson `decomposer-en-facteurs-premiers` — PURE. The divisors, the agreement of a counted noun and
 * the world's noun tables are the authoring kit's (`kit/authoring/numbers.js`); « is p prime » and the prime factors of
 * n are the world's (`divisorIsles/factorLadder.js`, the logic of the ladder's mode `factor`); the French writing of a
 * whole number is the core's (`formatFr` « 2 431 », `texFr` « 2\,431 »). All are RE-EXPORTED here, never copied.
 *
 * What is this lesson's own: its NUMBERS (ONE place — the story, the tablets, the knowledge page, the trainer and the
 * tests read them), the writing of a decomposition (with its powers, as LaTeX or as plain text with superscripts), and
 * `fr` — French typography laid on a sentence written with plain spaces.
 */
import { formatFr, texFr } from '@smarter-academy/core';
import { isPrime, primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';

export { CELLS, PLANKS, counted, listFr, planksOf } from '../../../../../../common/gameworld/kit/authoring/numbers';
export { isPrime, primeFactors };

/**
 * THE NUMBERS of the lesson (`docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 1 « Numbers »). Every one
 * was checked with `node scripts/lesson-bank-numbers.mjs decomposer-en-facteurs-premiers --check …` (CLEAR) and none
 * stands alone in the bank (`story.test.js`).
 */
export const NUMBERS = {
  /**
   * THE ROAD — one gap per bridge, in the order of the islands. `moulds`: the planks the island offers; `workshop`: the
   * island's workshop (he TYPES the length, 1 … `max`); `plank`: the plank the story names (`holdsWith`).
   *   60 and 72 — the first two bridges, with planks of his choice (composite planks hold too): key 1 opens after them.
   *   1 400 — only 8 holds of the three planks, and 8 is 2 × 2 × 2: key 2 opens after it.
   *   91 — the workshop makes planks up to 90 cases: 7, 13 and 1 hold — the number « that looks prime »: key 3 opens.
   *   97 — the workshop makes planks up to 96 cases: only planks of 1 hold, 97 is prime (key 3's use on the islands).
   *   2 431 — too long to try by hand: key 4 opens BEFORE it; 11, 13, 17 (and their products) hold.
   */
  road: [
    { a: 60, moulds: [9, 4, 2], plank: 2 },
    { a: 72, moulds: [5, 9, 3], plank: 3 },
    { a: 1400, moulds: [3, 6, 8], plank: 8 },
    { a: 91, workshop: 90, plank: 7 },
    { a: 97, workshop: 96, plank: 1 },
    { a: 2431, workshop: 2430, plank: 11 },
  ],
  /** Key 1 `plus-petit-premier` — the ladder's rounds (mode `factor`), its rack, and its last step (the ladder of 126). */
  ladder: { rounds: [60, 72, 495], rack: [2, 3, 4, 5, 6, 7, 9, 11], use: 126 },
  /** Key 2 `puissances` — his own ladder of 72, and the last step 1 400 = 2³ × 5² × 7. */
  powers: { from: 72, use: 1400 },
  /** Key 3 `arret` — the gaps of the experiment `pairs`, and the last step « 143 est-il premier ? ». */
  stop: { rounds: [91, 97, 221], use: 143 },
  /** Key 4 `tableur` — the sheets of the experiment `sheet`, and the last step: the decomposition of 4 641. */
  tool: { rounds: [2431, 4641, 3127], use: 4641 },
  /**
   * THE LAST BRIDGE (the store): a gap announced ONLY by its decomposition 2³ × 3² × 7 (= 504), two kinds of plank, 36 and
   * 48. 36 = 2² × 3² divides it (14 planks); 48 = 2⁴ × 3 does not — « the same primes are there, so it divides » is the
   * error the lesson fights (504 = 48 × 10 + 24). A plank costs 3 € (14 planks: 42 €).
   */
  boss: { factors: [2, 2, 2, 3, 3, 7], options: [36, 48], plank: 36, price: 3 },
};

/** The gap of the last bridge: the product of its factors (504). */
export const BOSS_A = NUMBERS.boss.factors.reduce((p, x) => p * x, 1);

// ───────────────────────── writing numbers and decompositions ─────────────────────────

/** A whole number as French prose writes it: « 2 431 » (a narrow no-break space between the thousands). */
export const nb = (n) => formatFr(n);
/** A whole number inside LaTeX: « 2\,431 ». */
export const tx = (n) => texFr(n);

/** The decomposition of n with its powers: [{ p, e }], primes increasing — 72 → [{ p: 2, e: 3 }, { p: 3, e: 2 }]. */
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
/** [{ p, e }] as LaTeX: « 2^{3} \times 3^{2} \times 7 » (an exponent 1 is not written). */
export const powTex = (fs) => fs.map(({ p, e }) => (e === 1 ? tx(p) : `${tx(p)}^{${e}}`)).join(' \\times ');
/** A product of factors written out as LaTeX: « 2 \times 2 \times 3 ». */
export const productTex = (xs) => xs.map(tx).join(' \\times ');

const SUPERSCRIPT = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** An exponent as superscript digits, for a PLAIN string (a screen that does not render LaTeX): 12 → « ¹² ». */
export const sup = (e) => [...String(e)].map((d) => SUPERSCRIPT[d]).join('');
/** [{ p, e }] as plain text: « 2³ × 3² × 7 ». */
export const powText = (fs) => fs.map(({ p, e }) => (e === 1 ? nb(p) : `${nb(p)}${sup(e)}`)).join(' × ');

/** The largest number whose square does not pass n: where the trial divisions may stop (97 → 9). */
export const stopOf = (n) => Math.floor(Math.sqrt(n + 0.5));
/** The primes p with p × p ⩽ n, increasing: the divisions to try before saying n is prime (97 → 2, 3, 5, 7). */
export const triedPrimes = (n) => {
  const out = [];
  for (let p = 2; p * p <= n; p += 1) if (isPrime(p)) out.push(p);
  return out;
};
/** The smallest prime that divides n ≥ 2. */
export const smallestPrime = (n) => primeFactors(n)[0];

// ───────────────────────── French typography ─────────────────────────

/**
 * French typography laid on a sentence written with plain spaces (`FRENCH_LANGUAGE_CONTRACT.md` §4): « : » takes a
 * no-break space (U+00A0), « ; ! ? » a narrow one (U+202F), the quotation marks « … » no-break spaces inside, an
 * apostrophe between two letters becomes « ’ ». A formula (`$…$`) is left as it is: LaTeX writes its own punctuation.
 */
export function fr(s) {
  return String(s)
    .split(/(\$[^$]*\$)/)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/ :/g, ' :')
            .replace(/ ([;!?])/g, ' $1')
            .replace(/« /g, '« ')
            .replace(/ »/g, ' »')
            .replace(/(\p{L})'(\p{L})/gu, '$1’$2'),
    )
    .join('');
}
/** `fr` over every sentence of a text object: strings, arrays, objects, and the sentences its functions return. */
export function frAll(x) {
  if (typeof x === 'string') return fr(x);
  if (typeof x === 'function') return (...args) => frAll(x(...args));
  if (Array.isArray(x)) return x.map(frAll);
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, frAll(v)]));
  return x;
}
