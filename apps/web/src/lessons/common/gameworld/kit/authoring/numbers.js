/**
 * THE AUTHORING KIT — the arithmetic and the Arabic counting a lesson's `world/math.js` re-derived each time (PURE; it
 * names no lesson). A lesson's `math.js` keeps ITS numbers (`NUMBERS`) and imports or re-exports what it needs from here:
 *
 *   import { gcd, euclid, differences, listAr, counted, COINS } from '<kit>/authoring/numbers';
 *   export { gcd, euclid, differences, listAr, counted, COINS };
 *   export const NUMBERS = { tarh: { gaps: [259, 185], purse: 12, plank: 37 }, … };
 *
 * Four parts: the numbers (divisors, the PGCD, the two algorithms), the formulas (LaTeX inside `$…$`), the sentence (a
 * list, an equality isolated from the bidi algorithm), and the Arabic agreement of a number and its noun. The words of
 * the world « أرخبيل القواسم » (coins, planks, cells, rows) are at the end: a lesson on another world adds its own tables
 * in the same shape `[one, two, three to ten, eleven and more]` and passes them to `counted`.
 * Tested: `authoring/numbers.test.js`; the proofs compare it with the three lessons' own `math.js`.
 */

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
 * « 1 ، 2 ، 4 » — a list as an Arabic sentence writes it. A no-break space BEFORE each comma: a list that wraps breaks
 * only after a comma, never starts a line with « ، » (defects.md B6).
 */
export const listAr = (xs) => xs.join('\u00a0، ');

/**
 * An equality inside a plain Arabic sentence, isolated left to right (LRI … PDI): without it the bidi algorithm draws
 * « 7 + 5 = 12 » as « 12 = 5 + 7 » (defects.md B7, B16). A formula drawn by `MathText` (`$…$`) needs none.
 */
export const ltr = (s) => `\u2066${s}\u2069`;

// ───────────────────────── the Arabic agreement of a number and its noun ─────────────────────────

/**
 * n and its noun, agreed: forms = [one, two, three to ten, eleven and more]. « قطعة واحدة », « قطعتان », « 5 قطع »,
 * « 38 قطعة ». Past 100 the last two digits decide (« 103 ألواح », « 144 لوحًا »); a round hundred, 101 or 102 takes the
 * optional fifth form (the genitive singular, « 100 سطر »), else the fourth.
 */
export function counted(n, [one, two, few, many, hundred = many]) {
  if (n === 1) return one;
  if (n === 2) return two;
  const r = n >= 100 ? n % 100 : n;
  if (r >= 3 && r <= 10) return `${n} ${few}`;
  if (n >= 100 && r <= 2) return `${n} ${hundred}`;
  return `${n} ${many}`;
}

// ───────────────────────── the words of the world « أرخبيل القواسم » ─────────────────────────

/** The coins of a purse (one per plank laid, whatever its length). */
export const COINS = ['قطعة واحدة', 'قطعتان', 'قطع', 'قطعة'];
/** Planks, as a subject: « لوح واحد », « لوحان », « 5 ألواح », « 21 لوحًا ». */
export const PLANKS = ['لوح واحد', 'لوحان', 'ألواح', 'لوحًا', 'لوح'];
/** Planks, as the object of a verb: « يحتاج لوحين », « 10 ألواح », « 38 لوحًا ». */
export const PLANKS_ACC = ['لوحًا واحدًا', 'لوحين', 'ألواح', 'لوحًا', 'لوح'];
/** Euclid's divisions: « قسمة واحدة », « قسمتان », « 4 قسمات », « 12 قسمة ». */
export const DIVISIONS = ['قسمة واحدة', 'قسمتان', 'قسمات', 'قسمة'];
/** …after a preposition or « مقابل » (genitive): « بعد قسمتين ». */
export const DIVISIONS_GEN = ['قسمة واحدة', 'قسمتين', 'قسمات', 'قسمة'];
/** The subtractions: « عملية طرح واحدة », « عمليتا طرح », « 5 عمليات طرح », « 31 عملية طرح ». */
export const SUBTRACTIONS = ['عملية طرح واحدة', 'عمليتا طرح', 'عمليات طرح', 'عملية طرح'];
/** …after a preposition (genitive): « بعد عمليتي طرح ». */
export const SUBTRACTIONS_GEN = ['عملية طرح واحدة', 'عمليتي طرح', 'عمليات طرح', 'عملية طرح'];
/** The rows of a notebook, as a subject: « سطر واحد », « سطران », « 5 أسطر », « 31 سطرًا ». */
export const ROWS = ['سطر واحد', 'سطران', 'أسطر', 'سطرًا', 'سطر'];
/** …as an object: « كتب سطرًا واحدًا », « كتب سطرين », « كتب 5 أسطر », « كتب 31 سطرًا ». */
export const ROWS_ACC = ['سطرًا واحدًا', 'سطرين', 'أسطر', 'سطرًا', 'سطر'];

/** « 12 لوحًا » — the planks two bridges take (the tag of a case in the mirror's log). */
export const planks = (q) => counted(q, PLANKS);
/** What is left in the purse: « وبقيت في الكيس 11 قطعة », « ولم يبقَ في الكيس شيء ». */
export const coinsLeft = (n) => (n > 0 ? `وبقيت في الكيس ${counted(n, COINS)}` : 'ولم يبقَ في الكيس شيء');

/** The empty cells a plank leaves, with the agreement of the verb and the adjective: « بقيت خانتان فارغتان ». */
export const emptyCells = (r) =>
  r === 1
    ? 'بقيت خانة واحدة فارغة'
    : r === 2
      ? 'بقيت خانتان فارغتان'
      : `بقيت ${counted(r, ['', '', 'خانات فارغة', 'خانة فارغة'])}`;

/** q planks of length b, with the verb that agrees: « لوح واحد طوله 27 يملأ », « 4 ألواح طولها 19 تملأ ». */
export function planksFill(q, b) {
  if (q === 1) return `لوح واحد طوله ${b} يملأ`;
  if (q === 2) return `لوحان طولهما ${b} يملآن`;
  return `${planks(q)} طولها ${b} تملأ`;
}
/** q planks of length b, without a verb: « لوح واحد طوله 14 », « لوحان طولهما 14 », « 73 لوحًا طولها 28 ». */
export function planksOf(q, b) {
  if (q === 1) return `لوح واحد طوله ${b}`;
  if (q === 2) return `لوحان طولهما ${b}`;
  return `${planks(q)} طولها ${b}`;
}
