/**
 * THE INVESTIGATION of a rule forge in this world (PURE) — what the student does BEFORE any tile is offered, so that the
 * rule he writes afterwards is the name of something he saw. Each rule has its own nature (owner, 2026-11-17: « each rule
 * has its own nature and way of discovery »), so each kind is its own experiment; the screen is `Inquiry.jsx`.
 *
 *   pairs   « where does the search stop? » — planks are tried IN ORDER on one gap; a plank and its partner (gap ÷ plank,
 *           whole or not) walk toward each other on the strip and CROSS: after the crossing every partner is a plank that
 *           was already tried.
 *   chart   « what to read instead of dividing? » — a chart of gaps (a row per tens digit, a column per units digit); the
 *           student tests gaps one after the other with ONE plank, then chooses a LENS (what he looks at in a number) and
 *           the values of that lens he claims hold: the chart answers (a lit cell left out, a dark cell taken in).
 *   turn, cut           see `InquiryMoves.jsx`.
 *   join, stack         gaps PUT TOGETHER — glued (a + b), cut (a − b), or k copies of one gap (`InquiryCombine.jsx`).
 *   peel, letters       the piece left when b is peeled off a, then a claim on the table; a proof assembled from cards
 *                       (`InquiryProof.jsx`).
 *   common, ladder, nest
 *                       the greatest common divisor (`InquiryGcd.jsx`): the planks that hold two gaps and the longest of
 *                       them; a pair replaced by a simpler pair with the same common planks; the common planks are the
 *                       planks of the longest one.
 *   groups, rebuild, estimate, bracket
 *                       the Euclidean division a = b × q + r, 0 ≤ r < b, as planks laid one after the other on a gap
 *                       (`InquiryDivision.jsx`): laid one by one, rebuilt from planks and a piece, estimated by tens of
 *                       planks then units, and a ÷ b bracketed between two marks.
 *
 * Nothing here says a rule. The verdict is always a fact of the chart or of the strip.
 */
// the long division drawn on paper (kit): `estimateSteps` reads its steps as tens of planks, then units
import { longDivision } from '../kit/longDivision';

// ───────────────────────── pairs ─────────────────────────
/** One plank tried on a gap: its partner (a real number), whether the bridge holds, and whether the partner is BEHIND it. */
export function tryPlank(a, d) {
  const whole = a % d === 0;
  return { d, whole, q: whole ? a / d : null, partner: a / d, square: d * d, crossed: d * d > a };
}
/** The last plank that HAS to be tried: the last one whose partner is not behind it. */
export const lastNeeded = (a) => {
  let d = 1;
  while ((d + 1) * (d + 1) <= a) d += 1;
  return d;
};
/** How many planks of a gap would be MISSED by stopping after plank d (with their partners): 0 from `lastNeeded` on. */
export function missedBy(a, d) {
  const found = new Set();
  for (let k = 1; k <= d; k += 1)
    if (a % k === 0) {
      found.add(k);
      found.add(a / k);
    }
  let all = 0;
  for (let k = 1; k <= a; k += 1) if (a % k === 0) all += 1;
  return all - found.size;
}

// ───────────────────────── chart ─────────────────────────
const digitsOf = (n) => String(n).split('').map(Number);
/** What a student may LOOK AT in a number. `values`: every value the lens can show on a chart that starts at `from`. */
export const LENSES = {
  units: { of: (n) => n % 10, values: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  tens: { of: (n) => Math.floor(n / 10) % 10, values: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  sum: {
    of: (n) => digitsOf(n).reduce((s, x) => s + x, 0),
    // 1 … the biggest sum on the chart: 18 on the first one (99), then the hundreds' own sum + 18 (19 for 199, 27 for 999)
    values: (from = 0) =>
      Array.from({ length: 18 + digitsOf(Math.floor(from / 100)).reduce((s, x) => s + x, 0) }, (_, i) => i + 1),
  },
  // the number written by the tens digit and the units digit: 16 for 316 (on the first chart it is the gap itself)
  last2: {
    of: (n) => n % 100,
    values: (from) => Array.from({ length: from ? 100 : 99 }, (_, i) => i + (from ? 0 : 1)),
  },
};
/** The hundred gaps of a chart: 1…99 on the first one (0 is no gap), then 100…199, 200…299. */
export const chartCells = (from = 0) => Array.from({ length: 100 }, (_, i) => from + i).filter((n) => n > 0);
export const holds = (n, b) => n % b === 0;
/** How many gaps from `lo` up to (not counting) `hi` the plank fills: what the chart lights, and rings, while it is filled. */
export const lightsIn = (b, lo, hi) => Math.max(0, Math.ceil(hi / b) - Math.ceil(Math.max(lo, 1) / b));

/**
 * A claim « the plank holds when this lens shows one of these values », put in front of the chart:
 *   intruders  dark cells the claim takes in (the lens does not separate, or a value is too many)
 *   orphans    lit cells the claim leaves out (a value is missing)
 */
export function judgeClaim(b, lens, values, from = 0) {
  const intruders = [];
  const orphans = [];
  for (const n of chartCells(from)) {
    const claimed = values.includes(LENSES[lens].of(n));
    if (claimed && !holds(n, b)) intruders.push(n);
    if (!claimed && holds(n, b)) orphans.push(n);
  }
  return { intruders, orphans, ok: values.length > 0 && intruders.length === 0 && orphans.length === 0 };
}
/**
 * What a claim takes in, as values of its lens. A plank says its claim in one of two ways (its `link`):
 *   equals   the lens shows one of the values he pressed              « رقم الآحاد · يساوي · 0 أو 5 »
 *   divides  the lens shows a number divisible by the one he pressed  « مجموع الأرقام · يقبل القسمة على · 9 »
 */
export const claimValues = (link, lens, picked, from = 0) =>
  link === 'divides' ? LENSES[lens].values(from).filter((v) => picked.some((k) => v % k === 0)) : picked;

// ───────────────────────── turn: the planks of a bridge, stacked into a wall and read the other way ─────────────────────────
/**
 * The cells of a bridge (gap a, planks of d) as a wall: one ROW per plank (`r`), `d` columns; the cells no plank covers
 * make a last, shorter row (`rest`). `heights[c]` = the cells of column c: the planks the wall gives when it is read the
 * other way — equal only when the bridge holds.
 */
export function wall(a, d) {
  const e = Math.floor(a / d);
  const rest = a % d;
  const cells = [];
  for (let r = 0; r < e; r += 1) for (let c = 0; c < d; c += 1) cells.push({ r, c, rest: false });
  for (let c = 0; c < rest; c += 1) cells.push({ r: e, c, rest: true });
  const heights = Array.from({ length: d }, (_, c) => e + (c < rest ? 1 : 0));
  return { a, d, e, rest, rows: e + (rest ? 1 : 0), cells, heights, even: rest === 0 };
}

// ───────────────────────── cut: how many planks — a whole number, or a piece to saw ─────────────────────────
/** Planks of b laid on a gap of a: the whole ones, and the cells of the piece that would have to be sawn from one more. */
export const pieceOf = (a, b) => ({ whole: Math.floor(a / b), piece: a % b, exact: a % b === 0 });
/**
 * The exact quotient a ÷ b (natural numbers, b > 0) as a formula: a natural number, a decimal that stops within two places
 * written exactly (23 ÷ 5 → 4,6), or the first two places followed by « … » when the decimal goes on (912 ÷ 25 → 36,48;
 * 10 ÷ 3 → 3,33…). Computed on integers only — a float floor reads 4,6 as 4,59….
 */
export function quotientTex(a, b) {
  if (a % b === 0) return String(a / b);
  const hundredths = Math.floor((a * 100) / b);
  const goesOn = (a * 100) % b !== 0;
  const whole = Math.floor(hundredths / 100);
  let places = String(hundredths % 100).padStart(2, '0');
  if (!goesOn) places = places.replace(/0+$/, '');
  return `${whole}{,}${places}${goesOn ? '\\dots' : ''}`;
}

// ───────────────────────── join: two gaps glued end to end, or the shorter cut off the longer ─────────────────────────
/**
 * Plank d on the gaps a and b, then on the gap they make together: glued (`sum`, a + b) or cut (`diff`, a − b, a ≥ b).
 * Every field is a FACT the world draws: the planks each gap takes, whether it is filled, and the piece the new gap leaves.
 */
export function joinOf(d, a, b, op) {
  if (op === 'diff' && b > a) throw new RangeError(`join: ${a} − ${b} is not a gap`);
  const value = op === 'sum' ? a + b : a - b;
  return {
    value,
    planksA: Math.floor(a / d),
    planksB: Math.floor(b / d),
    fillsA: a % d === 0,
    fillsB: b % d === 0,
    planks: Math.floor(value / d),
    rest: value % d,
    holds: value % d === 0,
  };
}

// ───────────────────────── stack: k copies of one gap, glued end to end ─────────────────────────
/** Plank d on k copies of the gap `base`: the whole gap, the planks it takes, the piece left. */
export function stackOf(d, base, k) {
  const total = k * base;
  return { total, planks: Math.floor(total / d), rest: total % d, holds: total % d === 0, fillsBase: base % d === 0 };
}

// ───────────────────────── peel: planks of b laid on a until a piece shorter than b is left ─────────────────────────
/** The gap a peeled by planks of b: every length left (a, a − b, a − 2b … r), how many planks (q) and the piece r < b. */
export function peelOf(a, b) {
  if (!(b > 0 && a >= b)) throw new RangeError(`peel: ${a} by ${b}`);
  const steps = [a];
  while (steps.at(-1) >= b) steps.push(steps.at(-1) - b);
  return { q: steps.length - 1, r: steps.at(-1), steps };
}
/** Does plank d fill the gap a, the gap b, the piece r left when b is peeled off a? (three facts of one row) */
export const fitsRow = (a, b, d) => ({ a: a % d === 0, b: b % d === 0, r: (a % b) % d === 0 });
/**
 * His claim « when a plank fills [the column(s) he chose], it fills the piece left », put in front of the table of every
 * round. `claim = { cols: ['a'] | ['b'] | ['a', 'b'], link: 'and' | 'or' }` (`link` counts only with two columns).
 *   taken      the rows his claim takes in (every row when no column is chosen)
 *   intruders  rows it takes in whose plank does NOT fill the piece — the only thing that refutes it
 *   orphans    rows whose plank fills the piece although the claim does not take them in (a fact; it refutes nothing)
 * `ok`: a column is chosen, at least one row is taken, and no row is an intruder.
 */
export function judgePeelClaim(rounds, claim) {
  const cols = claim?.cols ?? [];
  const takes = (f) => (cols.length > 1 && claim.link === 'or' ? cols.some((c) => f[c]) : cols.every((c) => f[c]));
  const rows = rounds.flatMap(({ a, b, candidates }) =>
    candidates.map((d) => ({ ...fitsRow(a, b, d), gap: a, bridge: b, d })),
  );
  const taken = rows.filter(takes);
  const intruders = taken.filter((f) => !f.r);
  const orphans = rows.filter((f) => f.r && !takes(f));
  return { taken, intruders, orphans, ok: cols.length > 0 && taken.length > 0 && intruders.length === 0 };
}

// ───────────────────────── letters: a proof assembled from cards ─────────────────────────
/**
 * Walks a proof in the order of `ids`: each card may use only what the statement (`given`) or a card ABOVE it introduced
 * (`card.needs` ⊆ what came before; `card.gives` is what it introduces). `{ ok, at, missing }`: `at` = the first card
 * that uses something not written yet, `missing` = what it uses (tokens of the lesson, e.g. « k′ »).
 */
export function checkProofOrder(cards, ids, given = []) {
  const byId = Object.fromEntries(cards.map((c) => [c.id, c]));
  const known = new Set(given);
  for (let i = 0; i < ids.length; i += 1) {
    const c = byId[ids[i]];
    const missing = (c.needs ?? []).filter((t) => !known.has(t));
    if (missing.length) return { ok: false, at: i, missing };
    for (const t of c.gives ?? []) known.add(t);
  }
  return { ok: true, at: -1, missing: [] };
}
/** The first sample of numbers on which a card's line is FALSE (`card.holdsOn(sample)`), or null: the world's answer to a line. */
export const refuteCard = (card, samples) => samples.find((s) => !card.holdsOn(s)) ?? null;

// ───────────────────────── the Euclidean division: planks of b laid one after the other on a gap of a ─────────────────────────
/**
 * groups — planks of b laid ONE AT A TIME on a gap of a (a ≥ 0, b > 0). `steps[k − 1]` is the k-th plank tried: whether it
 * fits (b × k ≤ a) and the cells left once it is laid (or, when it does not fit, the cells that stay). The last step is
 * always the plank that does not fit; `q` planks fit and `r` cells are left.
 */
export function groupsOf(a, b) {
  if (!(b > 0 && a >= 0)) throw new RangeError(`groups: ${a} by ${b}`);
  const q = Math.floor(a / b);
  const steps = Array.from({ length: q + 1 }, (_, i) => {
    const k = i + 1;
    const fits = b * k <= a;
    return { k, fits, left: fits ? a - b * k : a - b * (k - 1) };
  });
  return { q, r: a - b * q, steps };
}

/**
 * rebuild — q planks of b and a piece of r cells: the gap they make (a = b × q + r). The piece is a true leftover only when
 * it is shorter than a plank (`valid`); otherwise more planks fit in it, and `q2`, `r2` are what the world then lays.
 */
export function rebuildOf(b, q, r) {
  if (!(b > 0 && q >= 0 && r >= 0)) throw new RangeError(`rebuild: ${b}, ${q}, ${r}`);
  return { a: b * q + r, valid: r < b, more: Math.floor(r / b), q2: q + Math.floor(r / b), r2: r % b };
}

/**
 * estimate — a big gap and a long plank, by tens of planks then units (and hundreds of planks first when there are that
 * many): the steps of the kit's long division, read as planks. Each step: `place` (10^place planks at a time), `unit` =
 * b × 10^place (the length of that many planks), `q` (how many, 0…9 — the biggest that does not pass), `from` (what was
 * left before it) and `left` (what is left after it). Always `from < 10 × unit` and `left < unit`.
 */
export function estimateSteps(a, b) {
  const ld = longDivision(a, b);
  let left = a;
  return ld.steps.map((s) => {
    const place = ld.width - 1 - s.col;
    const unit = b * 10 ** place;
    const from = left;
    left -= s.digit * unit;
    return { place, unit, q: s.digit, from, left };
  });
}

/**
 * estimate — one mark pressed on a step's ruler: k marks of `step.unit` against what is left (`step.from`). `passes` = the
 * product is longer than what is left; `short` = there is room for one more mark; `ok` = the biggest that does not pass
 * (exactly `step.q`). `value` = k × unit, the product the world writes once he has pressed (on a blind ruler it is not
 * printed before).
 */
export function estimateMark(step, k) {
  const value = k * step.unit;
  const kind = value > step.from ? 'passes' : value + step.unit <= step.from ? 'short' : 'ok';
  return { k, value, kind, next: value + step.unit };
}

/**
 * bracket — a ÷ b between two consecutive natural numbers: b × lo ≤ a < b × hi, hi = lo + 1; `exact` when a falls ON the
 * mark b × lo (nothing is left). `bracketSays` puts the two numbers the student typed in front of the gap.
 */
export const bracketOf = (a, b) => {
  const lo = Math.floor(a / b);
  return { lo, hi: lo + 1, exact: a % b === 0, r: a % b };
};
export const bracketSays = (a, b, lo, hi) => {
  const loFits = b * lo <= a;
  const hiPasses = a < b * hi;
  const consecutive = hi === lo + 1;
  return { loFits, hiPasses, consecutive, ok: loFits && hiPasses && consecutive };
};

// ───────────────────────── the greatest common divisor: one plank for two gaps ─────────────────────────
/** The longest plank that holds both gaps a and b (a, b > 0): Euclid's algorithm, never shown — the screens use it as a fact. */
export function gcd(a, b) {
  if (!(a > 0 && b > 0)) throw new RangeError(`gcd: ${a}, ${b}`);
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return x;
}
/** Every plank (natural number) that holds the gap n: its divisors, shortest first. */
const divisorsOf = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
/** The planks that hold BOTH gaps, shortest first: the tick list the ladder writes beside every row. */
export const commonPlanks = (a, b) => divisorsOf(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);

/**
 * common — each candidate plank laid on the gap a and on the gap b: does it hold a, b, both? `common` = the candidates on
 * the shelf « both » (shortest first), `longest` = the longest of them (null when no candidate holds both).
 * ONE gap may be 0 cells (0 = d × 0: every plank « fills » it — a limit case a lesson shows); never both, never a plank 0.
 */
export function commonOf(a, b, candidates) {
  if (!(a >= 0 && b >= 0 && a + b > 0)) throw new RangeError(`common: ${a}, ${b}`);
  if (!candidates.every((d) => d > 0)) throw new RangeError(`common: a plank of 0`);
  const rows = candidates.map((d) => {
    const holdsA = a % d === 0;
    const holdsB = b % d === 0;
    return { d, holdsA, holdsB, both: holdsA && holdsB };
  });
  const common = rows
    .filter((r) => r.both)
    .map((r) => r.d)
    .sort((x, y) => x - y);
  return { rows, common, longest: common.length ? common.at(-1) : null };
}

/**
 * common — what « تحقّق » does with what he said: `said` = { longest, count } (longest = the plank he marked, null when
 * none; count = the number typed, null when the box is empty). `crown` false: the longest is not asked — the count alone
 * is judged and a mark is never missing. `needLong` / `needCount` = what is still missing before it can be judged.
 */
export function commonSays(c, said, crown = true) {
  const needLong = crown && c.longest != null && said.longest == null;
  const needCount = said.count == null;
  const ok = !needLong && !needCount && said.count === c.common.length && (!crown || said.longest === c.longest);
  return { needLong, needCount, ok };
}

/**
 * ladder — a pair of gaps replaced, row after row, by a simpler pair that keeps the same common planks:
 *   subtract  (a, b), a ≥ b → the two gaps b and a − b (the longer first); the last row is the one where a = b (a − b = 0)
 *   divide    (a, b) → (b, r), r the remainder of a ÷ b; the last row is the one where r = 0
 * Each row: its pair, the value it computes (`value` = a − b or r; `q` = the quotient when dividing) and the next pair
 * (null on the last row). `gcd` = the b of the last row (the last value that is not 0); `steps` = the number of rows.
 */
export function ladderOf(a0, b0, mode) {
  if (!(a0 > 0 && b0 > 0)) throw new RangeError(`ladder: ${a0}, ${b0}`);
  if (mode !== 'subtract' && mode !== 'divide') throw new RangeError(`ladder: mode ${mode}`);
  const rows = [];
  let a = Math.max(a0, b0);
  let b = Math.min(a0, b0);
  for (;;) {
    const q = mode === 'divide' ? Math.floor(a / b) : 1;
    const value = a - b * q;
    const next = value === 0 ? null : mode === 'divide' ? [b, value] : [Math.max(b, value), Math.min(b, value)];
    rows.push({ a, b, q, value, next });
    if (!next) break;
    [a, b] = next;
  }
  return { rows, gcd: rows.at(-1).b, steps: rows.length };
}

/** The rows of round `ri` whose next pair he predicts before the count (`manual`, default 2; capped at steps − 1). */
export const ladderAsk = (spec, ri) => {
  const r = spec.rounds[ri];
  return Math.min(spec.manual ?? 2, ladderOf(r.a, r.b, r.mode ?? spec.mode).steps - 1);
};
/** A round of the ladder (subtract | divide) as it opens; `found` = the rounds done before it. */
export const ladderRound = (spec, ri, found = []) => ({
  ri,
  written: 0,
  stage: ladderAsk(spec, ri) > 0 ? 'guess' : 'count',
  guesses: [],
  last: null,
  guessed: null,
  found,
});
/**
 * Where a ladder (subtract | divide) starts: empty, or — on a workshop's bench (`Workshop.jsx › Bench`) — the state it
 * kept (`spec.from`, as `spec.onState` heard it). A row the world was still writing when he left is written now; a
 * ladder the world was finishing is finished (its timers died with the screen).
 */
export function ladderStart(spec) {
  const s = spec.from;
  if (!s || !Number.isInteger(s.ri) || s.ri >= spec.rounds.length || !Array.isArray(s.found))
    return ladderRound(spec, 0);
  const r = spec.rounds[s.ri];
  const mode = r.mode ?? spec.mode;
  const L = ladderOf(r.a, r.b, mode);
  if (s.stage === 'write') {
    const open = L.rows[s.written];
    const g = s.guesses.at(-1);
    const written = s.written + 1;
    const last = {
      a: open.a,
      b: open.b,
      mode,
      value: open.value,
      q: open.q,
      next: open.next,
      said: g.said,
      hit: g.hit,
    };
    return { ...s, written, last, stage: written < ladderAsk(spec, s.ri) ? 'guess' : 'count' };
  }
  if (s.stage === 'finish') {
    const f = { a: r.a, b: r.b, mode, steps: L.steps, guessed: s.guessed, gcd: L.gcd, guesses: s.guesses };
    return { ...s, written: L.steps, stage: 'seen', found: [...s.found, f] };
  }
  return s;
}

/**
 * nest — g = the longest plank of both gaps, and probes put in front of it: `inG` = the probe holds g, `both` = it holds
 * a and b. `common` = every plank of both gaps, `divisorsOfG` = every plank of g; `equal` says the two lists are the same.
 */
export function nestOf(a, b, probes) {
  const g = gcd(a, b);
  const divisorsOfG = divisorsOf(g);
  const common = commonPlanks(a, b);
  const rows = probes.map((p) => ({ p, inG: g % p === 0, both: a % p === 0 && b % p === 0 }));
  const equal = common.length === divisorsOfG.length && common.every((d, i) => d === divisorsOfG[i]);
  return { g, divisorsOfG, common, rows, equal };
}
