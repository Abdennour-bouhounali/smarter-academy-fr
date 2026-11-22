/**
 * THE INVESTIGATION `peel` — PURE logic (screen: `InquiryPeel.jsx`; contract: GAME_WORLD.md « Explore », spec shape of
 * `peel` of « Le palais des dalles »). Its rule is of the nature of a PROCEDURE HE UNDOES STEP BY STEP. A round shows a PLAQUE that
 * is not yet the area of ONE court: it was written for SEVERAL equal courts together (3 courts: 75 tiles), for a part of
 * a court (two thirds of a court: 1350), for a court with a pile of tiles ADDED or TAKEN (a court and 4 tiles more: 0),
 * or a short chain of these. He PEELS one operation at a time — share between the courts, multiply the courts, add
 * tiles, take tiles — choosing WHICH one and typing its number; the world does it on BOTH the courts and the plaque and
 * writes the new plaque as a fact. When ONE court and its area stand alone, the round asks how many rods ride it, and
 * which (one pulled to the right, one to the left); the world builds them and shows what rides.
 *
 * What a plaque IS (the world's state of a round), every number as TEXT (`logic.js`):
 *   { courts: m, pile: c, plaque: v }   —  m equal courts (a whole number, or p/q of a court with q ≤ 4) together with a
 *   pile of c tiles (c > 0: tiles added, c < 0: tiles taken, 0: none) hold v tiles.
 * The lone court's area is (v − c) / m; it may be a fraction, 0, or negative (then no court can be built).
 *
 *   spec = { kind: 'peel', rounds: [{ courts: '3', plaque: '75', tex? }, { courts: '1', pile: '-6', plaque: '0' }, …],
 *            ops?: ['share', 'grow', 'add', 'take'], text }
 *
 * What the world does with each peel — always on the courts, the pile and the plaque together, exactly:
 *   share k   the courts are split into k equal groups (k must divide the number of court PIECES — 3 courts, 2 thirds):
 *             m/k, c/k, v/k. Otherwise the share is not done and the FACT says so (reason 'split').
 *   grow k    k times as many courts: m·k, c·k, v·k (at most `PEEL_LAYOUT.maxCourts` courts drawn: reason 'room').
 *   add t     t tiles brought: c + t, v + t.            take t   t tiles taken: c − t, v − t.
 * A peel whose numbers would not fit the screen is not done (reason 'big'). Nothing is ever « wrong »: every peel is
 * answered by what the world did, and the plaque shows where he stands.
 *
 * The screen is a pure view of this file's reducer: the whole experiment is played and tested without a browser.
 */
import { read, write, compare, equal, platform, rootOf, isDecimal, tex } from './logic';

/**
 * THE LAYOUT of the screen at 1366 × 768 (the ONE size), in rem of the forge's frame (`.rf-fit`, designed 1280 × 720 and
 * zoomed 1.067: 1rem ≈ 17 px). The experiment's panel is 1205 × 587 px of the frame (measured for `calc`, the same panel).
 * Columns, left to right (`columns`): the main column (the scene, the question, the peels or the rods, the fact), then
 * the table of rounds. `inquiryPeel.render.test.jsx` adds the widths and the heights and checks that every text he reads is ≥ 18 px.
 */
export const PEEL_LAYOUT = {
  zoom: 1.067,
  panel: { w: 1205, h: 587 },
  /** the rounds a spec may hold (one row of the table each) */
  maxRounds: 4,
  /** the most courts drawn side by side (whole ones, a part counts as one) */
  maxCourts: 6,
  /** the largest denominator of a part of a court (2: halves … 4: quarters) */
  maxPart: 4,
  /** the longest number written (a plaque, a pile, the lone area, a rod), in characters: sign, digits, comma; a
   *  fraction: its numerator and its denominator each */
  maxChars: 8,
  /** the largest number he may type for a share or a multiplication */
  maxK: 12,
  /** the table shows at most this many peels of a round (the first, « … », the last ones) — all are in the result */
  maxTags: 5,
  /** the columns, left to right: the first one is on the LEFT (the screen's DOM order, pinned by the render test) */
  columns: ['main', 'table'],
  gap: 1, // rem between the two columns
  rowGap: 0.55, // rem (`.rq-iq` gap)
  head: 3.52, // rem: the lead (1.2rem × 1.5) and the goal (1.08rem × 1.45), one line each
  /** the scene: the plaque's plate (`plate` rem), the courts (`court` rem a side at most, `small` when 4 or more), the
   *  plaque's sentence (`say` rem font, two lines) */
  scene: { plate: 2.9, court: 7.2, small: 5, say: 1.12, h: 14 },
  /** the four peels: two rows of two cards (`card` rem high), the restart button on the second row */
  ops: { card: 3.3, font: 1.12, w: 22.5 },
  /** the rods' answer: the taps and the build button (`taps` rem), a rod's block (its label and its form buttons on
   *  one line, then its box), `w` rem wide — the two blocks side by side, the right one on the right */
  rods: { taps: 3.3, block: 6.6, w: 23.1 },
  /** the fact under them: three lines of 1.12rem at most */
  fact: { font: 1.12, lines: 3 },
  /** the table: its width and its four cells (rem), its font, a row (two lines of stacked fractions), its header */
  table: { w: 25, font: 1.08, plaque: 8.2, peels: 7.6, lone: 4.4, rods: 4.8, row: 5.4, header: 3.4 },
};

/** The four peels, in the order the screen offers them. */
export const OPS = ['share', 'grow', 'add', 'take'];

const zero = '0';
const isWhole = (x) => read(x).d === 1n;
const sign = (x) => compare(x, zero);
/** An exact n / d (BigInt) as text, reduced (`logic.js › read` reduces « n/d »). */
const q = (n, d) => write(`${n}/${d}`);
const div = (a, b) => {
  const [x, y] = [read(a), read(b)];
  return q(x.n * y.d, x.d * y.n);
};
const mulT = (a, b) => {
  const [x, y] = [read(a), read(b)];
  return q(x.n * y.n, x.d * y.d);
};
const addT = (a, b) => {
  const [x, y] = [read(a), read(b)];
  return q(x.n * y.d + y.n * x.d, x.d * y.d);
};
const neg = (x) => q(-read(x).n, read(x).d);
const subT = (a, b) => addT(a, neg(b));
/** |x| as text. */
export const absText = (x) => (sign(x) < 0 ? neg(x) : write(x));

/** Does a number fit the screen (`PEEL_LAYOUT.maxChars`)? A fraction: each of its two parts. */
export function fits(x) {
  const t = write(x);
  return t.split('/').every((part) => part.replace('-', '').length <= PEEL_LAYOUT.maxChars);
}

/** The courts of a plaque, read: p pieces of 1/q court (reduced: 3 → 3 pieces of 1, 2/3 → 2 pieces of a third). */
export function piecesOf(courts) {
  const { n, d } = read(courts);
  return { p: Number(n), q: Number(d) };
}

/** Can the screen draw these courts? m > 0, at most `maxCourts` drawn, a part in halves … quarters. */
function courtsOk(courts) {
  const { p, q } = piecesOf(courts);
  return p > 0 && q <= PEEL_LAYOUT.maxPart && Math.ceil(p / q) <= PEEL_LAYOUT.maxCourts;
}

/** A plaque, written the world's way: { courts, pile, plaque } — every number as text, reduced. */
export const plaqueOf = (o) => ({ courts: write(o.courts), pile: write(o.pile ?? zero), plaque: write(o.plaque) });

/** ONE court and nothing else: its plaque is its area. */
export const isAlone = (pl) => equal(pl.courts, '1') && equal(pl.pile, zero);

/** The area of the lone court this plaque is about: (v − c) / m — exact. */
export const loneOf = (pl) => div(subT(pl.plaque, pl.pile), pl.courts);

/**
 * The rods that ride a court of area a — what the world builds at the end of a round:
 *   a > 0: TWO, `right` (pulled to the right: its number when the area has one, else the court's wall) and `left` (the
 *          same length pulled to the left: `neg: true`);   a = 0: ONE, the rod of length 0;   a < 0: NONE.
 */
export function rodsOf(area) {
  const s = sign(area);
  if (s < 0) return { n: 0, end: 'none', right: null, left: null };
  if (s === 0) return { n: 1, end: 'one', right: { q: zero }, left: null };
  const side = rootOf(area);
  const right = side != null ? { q: side } : { root: write(area) };
  return { n: 2, end: 'two', right, left: { ...right, neg: true } };
}

/** The fewest peels from a plaque to its lone court: the pile (one), the courts (a share, a multiplication, or both). */
export function fewestOf(pl) {
  const { p, q } = piecesOf(pl.courts);
  return (equal(pl.pile, zero) ? 0 : 1) + (p !== 1 ? 1 : 0) + (q !== 1 ? 1 : 0);
}

/**
 * One peel on a plaque — what the world does: { done: true, after } or { done: false, reason } ('split' | 'room' |
 * 'big'). `n` is the number he typed (text): a whole k ≥ 2 for 'share' and 'grow', a positive number for 'add', 'take'.
 */
export function peelOnce(pl, op, n) {
  let after;
  if (op === 'share') {
    const { p } = piecesOf(pl.courts);
    if (p % Number(n) !== 0) return { done: false, reason: 'split', pieces: String(p) };
    after = { courts: div(pl.courts, n), pile: div(pl.pile, n), plaque: div(pl.plaque, n) };
  } else if (op === 'grow') {
    const courts = mulT(pl.courts, n);
    if (!courtsOk(courts)) return { done: false, reason: 'room' };
    after = { courts, pile: mulT(pl.pile, n), plaque: mulT(pl.plaque, n) };
  } else if (op === 'add') after = { courts: pl.courts, pile: addT(pl.pile, n), plaque: addT(pl.plaque, n) };
  else if (op === 'take') after = { courts: pl.courts, pile: subT(pl.pile, n), plaque: subT(pl.plaque, n) };
  else throw new Error(`peel: no operation « ${op} »`);
  if (![after.pile, after.plaque, loneOf(after)].every(fits)) return { done: false, reason: 'big' };
  return { done: true, after };
}

/** Reads what he typed for an operation; null when it cannot be one (then nothing is done: a notice). */
export function readAmount(op, typed) {
  let x;
  try {
    x = read(String(typed ?? '').trim());
  } catch {
    return null;
  }
  if (op === 'share' || op === 'grow') {
    if (!isWhole(x) || compare(x, '2') < 0 || compare(x, String(PEEL_LAYOUT.maxK)) > 0) return null;
    return write(x);
  }
  if (sign(x) <= 0 || !fits(x)) return null;
  return write(x);
}

/** Checks a round of the spec and returns its plaque as the world writes it. */
export function roundPlaque(round, k = 0) {
  let pl;
  try {
    pl = plaqueOf(round);
  } catch {
    throw new Error(`peel: round ${k + 1} — « ${JSON.stringify(round)} » does not hold three numbers`);
  }
  // as given, a plaque counts at most `maxCourts` PIECES (6 courts, 5 quarters…): every one can then be peeled with
  // the screen's numbers (a share of 2 … 12, a multiplication that draws at most 6 courts)
  if (!courtsOk(pl.courts) || piecesOf(pl.courts).p > PEEL_LAYOUT.maxCourts)
    throw new Error(
      `peel: round ${k + 1} — « ${pl.courts} » courts: more than 0, at most ${PEEL_LAYOUT.maxCourts} pieces, a part in halves … quarters`,
    );
  for (const x of [pl.pile, pl.plaque, loneOf(pl)])
    if (!fits(x)) throw new Error(`peel: round ${k + 1} — « ${x} » is longer than ${PEEL_LAYOUT.maxChars} characters`);
  const end = rodsOf(loneOf(pl)).end;
  if (round.end != null && round.end !== end)
    throw new Error(`peel: round ${k + 1} — the spec says « ${round.end} », the world ends it « ${end} »`);
  return pl;
}

// ───────────────────────── his answer at the end of a round ─────────────────────────
/** A rod he typed is readable and not negative (the left rod's sign is printed: he types its length). */
const rodOk = (r) => {
  const v = r?.root ?? r?.q;
  if (v == null || String(v).trim() === '') return false;
  try {
    return sign(v) >= 0;
  } catch {
    return false;
  }
};
const cleanRod = (r) => (r.root != null ? { root: write(r.root) } : { q: write(r.q) });

/** Is the answer complete — how many rods (2 | 1 | 0) and that many readable rods? */
export function answerOk(said) {
  if (!said || ![0, 1, 2].includes(said.n)) return false;
  if (said.n >= 1 && !rodOk(said.right)) return false;
  if (said.n === 2 && !rodOk(said.left)) return false;
  return true;
}

/** Is the rod he typed the same LENGTH as the world's (the side of the court of `area`)? */
const sameRod = (said, area) => said != null && equal(platform(said), area);

/**
 * His answer against the world: { countRight, rods: [{ side, said, ok }], right } — `right` when he said as many rods as
 * ride AND each of his rods rides.
 */
export function judgeRods(said, area) {
  const world = rodsOf(area);
  const rods = [];
  if (said.n >= 1) rods.push({ side: said.n === 1 ? 'one' : 'right', said: said.right, ok: sameRod(said.right, area) });
  if (said.n === 2) rods.push({ side: 'left', said: said.left, ok: sameRod(said.left, area) });
  const countRight = said.n === world.n;
  return { countRight, rods, right: countRight && rods.every((r) => r.ok) };
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// peel ⇄ run (one peel after another) → alone → build → seen → peel (next round) … → seen (the last) → done
// A round whose plaque is already one court starts at « alone ».

const roundStart = (spec, ri) => {
  const given = roundPlaque(spec.rounds[ri], ri);
  return {
    ri,
    given,
    now: given,
    peels: [],
    last: null,
    pending: null,
    said: null,
    notice: null,
    stage: isAlone(given) ? 'alone' : 'peel',
  };
};

function check(spec) {
  if (!Array.isArray(spec.rounds) || !spec.rounds.length) throw new Error('peel: the spec holds no round');
  if (spec.rounds.length > PEEL_LAYOUT.maxRounds)
    throw new Error(`peel: the table holds ${PEEL_LAYOUT.maxRounds} rounds at most, not ${spec.rounds.length}`);
  spec.rounds.forEach(roundPlaque);
  const ops = spec.ops ?? OPS;
  if (!ops.length || ops.some((o) => !OPS.includes(o))) throw new Error(`peel: unknown operations « ${ops} »`);
}

/** The operations this spec offers (all four unless `spec.ops` names fewer). */
export const opsOf = (spec) => OPS.filter((o) => (spec.ops ?? OPS).includes(o));

export function initPeel(spec) {
  check(spec);
  return { ...roundStart(spec, 0), rows: [], done: false };
}

/**
 * One move of the experiment.
 *   { type: 'peel', op, n }   peel: he chose an operation and typed its number — done (→ run), not done (a fact), or
 *                             unreadable (a notice, nothing logged)
 *   { type: 'ran' }           run: the world has done it — the new plaque (→ alone when one court stands alone)
 *   { type: 'restart' }       peel: the plaque as it was given (logged)
 *   { type: 'answer', said }  alone: said = { n: 2|1|0, right?: { q }|{ root }, left?: { q }|{ root } } (→ build)
 *   { type: 'built' }         build: the world has built the rods (→ seen; the round's row is kept)
 *   { type: 'next' }          seen: the next round, or the end
 * A move that does not belong to the stage changes nothing.
 */
export function peelReducer(spec, s, action) {
  switch (action.type) {
    case 'peel': {
      if (s.stage !== 'peel' || !opsOf(spec).includes(action.op)) return s;
      const n = readAmount(action.op, action.n);
      if (n == null) return { ...s, notice: 'unread' };
      const out = peelOnce(s.now, action.op, n);
      if (!out.done) {
        const entry = { op: action.op, n, done: false, reason: out.reason, before: s.now, after: null };
        return { ...s, peels: [...s.peels, entry], last: { ...entry, pieces: out.pieces ?? null }, notice: null };
      }
      return { ...s, stage: 'run', pending: { op: action.op, n, before: s.now, after: out.after }, notice: null };
    }
    case 'ran': {
      if (s.stage !== 'run') return s;
      const entry = { ...s.pending, done: true, reason: null };
      const now = entry.after;
      return {
        ...s,
        now,
        peels: [...s.peels, entry],
        last: { ...entry, pieces: null },
        pending: null,
        stage: isAlone(now) ? 'alone' : 'peel',
      };
    }
    case 'restart': {
      if (s.stage !== 'peel' || (equal(s.now.courts, s.given.courts) && equal(s.now.pile, s.given.pile))) return s;
      const entry = { op: 'restart', n: null, done: true, reason: null, before: s.now, after: s.given };
      return { ...s, now: s.given, peels: [...s.peels, entry], last: { ...entry, pieces: null }, notice: null };
    }
    case 'answer': {
      if (s.stage !== 'alone') return s;
      if (!answerOk(action.said)) return { ...s, notice: 'unread' };
      const { n, right, left } = action.said;
      const said = { n, right: n >= 1 ? cleanRod(right) : null, left: n === 2 ? cleanRod(left) : null };
      return { ...s, stage: 'build', said, notice: null };
    }
    case 'built': {
      if (s.stage !== 'build') return s;
      const lone = s.now.plaque;
      const world = rodsOf(lone);
      const judged = judgeRods(s.said, lone);
      const row = {
        i: s.ri,
        given: s.given,
        peels: s.peels,
        done: s.peels.filter((p) => p.done && p.op !== 'restart').length,
        fewest: fewestOf(s.given),
        lone,
        end: world.end,
        world,
        said: s.said,
        countRight: judged.countRight,
        rods: judged.rods,
        right: judged.right,
      };
      return { ...s, rows: [...s.rows, row], stage: 'seen' };
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 < spec.rounds.length) return { ...s, ...roundStart(spec, s.ri + 1) };
      return { ...s, done: true };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const peelResult = (s) => ({ rows: s.rows });

// ───────────────────────── what the screen reads ─────────────────────────
/** Does a number need a real fraction bar on screen (no finite decimal writing)? */
export const needsBar = (x) => !isDecimal(x);

/**
 * What every text function receives about a plaque: its three numbers, their signs and sizes, ready for a sentence.
 *   { courts, whole: m is a whole number, num, den (m = num/den), pile, pileSign: -1|0|1, pileAbs, plaque, alone,
 *     courtsTex, pileTex, pileAbsTex, plaqueTex }  — `…Tex` are LaTeX numbers (a fraction with its bar), to put in $…$.
 */
export function plaqueArgs(pl) {
  const { p, q } = piecesOf(pl.courts);
  return {
    courts: pl.courts,
    whole: q === 1,
    num: String(p),
    den: String(q),
    pile: pl.pile,
    pileSign: sign(pl.pile),
    pileAbs: absText(pl.pile),
    plaque: pl.plaque,
    alone: isAlone(pl),
    courtsTex: tex(pl.courts),
    pileTex: tex(pl.pile),
    pileAbsTex: tex(absText(pl.pile)),
    plaqueTex: tex(pl.plaque),
  };
}
