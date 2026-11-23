/**
 * THE AUTHORING KIT — the arithmetic and the French counting a lesson's `world/math.js` would re-derive each time (PURE;
 * it names no lesson). A lesson's `math.js` keeps ITS numbers (`NUMBERS`) and imports or re-exports what it needs:
 *
 *   import { gcd, euclid, differences, listFr, counted, COINS } from '<kit>/authoring/numbers';
 *   export { gcd, euclid, differences, listFr, counted, COINS };
 *   export const NUMBERS = { tarh: { gaps: [259, 185], purse: 12, plank: 37 }, … };
 *
 * Four parts: the numbers (divisors, the PGCD, the two algorithms), the formulas (LaTeX inside `$…$`), the sentence (a
 * list « a, b et c »), and the French agreement of a number and its noun. The words of the world « L’archipel des
 * diviseurs » (coins, planks, cells, rows) are at the end: a lesson on another world adds its own tables in the same
 * shape `[singular, plural]` and passes them to `counted`.
 * Tested: `authoring/numbers.test.js`.
 */
import { formatFr } from '@smarter-academy/core/numberFormat.js';

// ───────────────────────── the numbers ─────────────────────────

/** PGCD(x ; y) by Euclid's remainders (x, y natural numbers, not both 0). PGCD(x ; 0) = x. */
export const gcd = (x, y) => (y ? gcd(y, x % y) : x);

/** The whole numbers from … to, both included (empty when to < from). */
export const range = (from, to) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/** Every divisor of n (n ≥ 1), smallest first. */
export const divisorsOf = (n) => range(1, n).filter((d) => n % d === 0);

/** The divisors that x and y share, smallest first (x, y ≥ 1). */
export const commonDivisors = (x, y) => divisorsOf(Math.min(x, y)).filter((d) => x % d === 0 && y % d === 0);

/** Euclid's algorithm on (a ; b), both ≥ 1: every division x = y × q + r, the larger first, down to the remainder 0. */
export function euclid(a, b) {
  const steps = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    steps.push({ a: x, b: y, q: Math.floor(x / y), r: x % y });
    [x, y] = [y, x % y];
  }
  return steps;
}

/** The subtraction algorithm on (a ; b), both ≥ 1: every subtraction x − y = d (larger minus smaller), down to 0. */
export function differences(a, b) {
  const steps = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y > 0) {
    const d = x - y;
    steps.push({ x, y, d });
    [x, y] = [Math.max(y, d), Math.min(y, d)];
  }
  return steps;
}

// ───────────────────────── a convoy of the islands: which planks build its road ─────────────────────────

/**
 * What a plank b does on the road of a convoy, gap after gap, as the world plays it: the coins run out first (a coin per
 * plank laid), else a piece is left, else it fills and the next gap is tried. `laid(a)` says whether he really laid b on
 * the gap a (from the world's log): the road stops at the first gap he did not try. → [{ a, did: 'fills'|'open'|'coins' }]
 */
export function roadOf(gaps, purse, b, laid = () => true) {
  const on = [];
  let left = purse;
  for (const a of gaps) {
    if (!laid(a)) break;
    const q = Math.floor(a / b);
    if (q > left) {
      on.push({ a, did: 'coins' });
      break;
    }
    if (a % b) {
      on.push({ a, did: 'open' });
      break;
    }
    on.push({ a, did: 'fills' });
    left -= q;
  }
  return on;
}

// ───────────────────────── the formulas (LaTeX, inside `$…$`; two backslashes in a JS string) ─────────────────────────

/** « PGCD(a ; b) » as LaTeX. */
export const pgcdTex = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** « a = b × q + r » as LaTeX, from a step of `euclid` (or any { a, b, q, r }). */
export const divTex = (s) => `${s.a} = ${s.b} \\times ${s.q} + ${s.r}`;
/** « n = d × q + r » as LaTeX: n divided by d. */
export const divisionTex = (n, d) => divTex({ a: n, b: d, q: Math.floor(n / d), r: n % d });
/** « x − y = d » as LaTeX, from a step of `differences`. */
export const subTex = (s) => `${s.x} - ${s.y} = ${s.d}`;

// ───────────────────────── the sentence ─────────────────────────

/**
 * « 1, 2, 4 et 8 » — a list as a French sentence writes it: commas, and « et » before the last item. A list of one item
 * is that item; an empty list is the empty string. A line may break after a comma (French puts no space before it).
 */
export function listFr(xs) {
  const items = [...xs].map(String);
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`;
}

// ───────────────────────── the French agreement of a number and its noun ─────────────────────────

/**
 * n and its noun, agreed: forms = [singular, plural]. French takes the singular for 0 and 1 (« 0 dalle », « 1 dalle »)
 * and the plural from 2 on (« 2 dalles », « 1003 dalles »). The number and the noun are joined by a no-break space, so a
 * count never splits across two lines (`FRENCH_LANGUAGE_CONTRACT.md` §4). A whole number of four digits or more takes
 * the French thousands separator, a narrow no-break space (the core's `formatFr`, imported: « 1 400 cases »,
 * « 2 431 planches »; the « 1003 » above is written « 1 003 »); anything else is written as given. A noun that
 * never changes (« 3 fois ») gives the same word twice.
 */
export function counted(n, [one, many]) {
  const written = Number.isInteger(n) && n >= 0 ? formatFr(n) : n;
  return `${written}\u00a0${Math.abs(n) < 2 ? one : many}`;
}

// ───────────────────────── the words of the world « L’archipel des diviseurs » ─────────────────────────

/** The coins of a purse (one per plank laid, whatever its length). */
export const COINS = ['pièce', 'pièces'];
/** The planks of a bridge: « 1 planche », « 21 planches ». */
export const PLANKS = ['planche', 'planches'];
/** Euclid's divisions: « 1 division », « 4 divisions ». */
export const DIVISIONS = ['division', 'divisions'];
/** The subtractions: « 1 soustraction », « 31 soustractions ». */
export const SUBTRACTIONS = ['soustraction', 'soustractions'];
/** The rows of a notebook: « 1 ligne », « 31 lignes ». */
export const ROWS = ['ligne', 'lignes'];
/** The cells of a gap: « 1 case », « 28 cases ». */
export const CELLS = ['case', 'cases'];

/** « 12 planches » — the planks two bridges take (the tag of a case in the mirror's log). */
export const planks = (q) => counted(q, PLANKS);
/** What is left in the purse: « et il reste 11 pièces dans la bourse », « et la bourse est vide ». */
export const coinsLeft = (n) => (n > 0 ? `et il reste ${counted(n, COINS)} dans la bourse` : 'et la bourse est vide');

/** The empty cells a plank leaves, with the agreement of the adjective: « il reste 1 case vide », « il reste 2 cases vides ». */
export const emptyCells = (r) => `il reste ${counted(r, ['case vide', 'cases vides'])}`;

/** q planks of length b, with the verb that agrees: « 1 planche de 27 remplit », « 4 planches de 19 remplissent ». */
export const planksFill = (q, b) => `${planksOf(q, b)} ${q < 2 ? 'remplit' : 'remplissent'}`;
/** q planks of length b, without a verb: « 1 planche de 14 », « 73 planches de 28 ». */
export const planksOf = (q, b) => `${planks(q)} de ${b}`;
