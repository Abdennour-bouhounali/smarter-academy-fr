/**
 * FOUR MODES of the investigations of the greatest common divisor — PURE logic and the state machine of each screen
 * (screens: `InquiryGcdModes.jsx`, mounted by `InquiryGcd.jsx › Common | Ladder | Nest` when `spec.mode` names them;
 * contract: GAME_WORLD.md « استكشف », spec shapes of `common`, `ladder`, `nest`). A gap of a cells is filled by planks of
 * d when d divides a.
 *
 *   common · witness  the tray is the planks the divisibility rules give; he takes a plank, says BEFORE whether it fills
 *                     the gap a and the gap b; the round ENDS on the first plank that fills both (« is one enough? »), or
 *                     when the tray is empty and none did — nothing more is said then.
 *   nest   · pair     the planks that fill both gaps of (a ; b) against those that fill both gaps of a SECOND pair (the
 *                     spec gives it: (b ; a − b) or (b ; r)); for each probe he says whether it fills both of each pair.
 *   ladder · fold     a subtraction ladder; the rows that take away the SAME gap are folded by him into one line
 *                     a = b × q + r; the world then finishes the ladder in folded lines.
 *   ladder · both     the subtraction and the division ladders of the same pair, side by side: BEFORE they run he says
 *                     which will be shorter and by how many rows; the world runs both in step.
 *
 * Each screen is a pure VIEW of its reducer, so every experiment is played and tested without a browser. A move that does
 * not belong to the stage changes nothing. Nothing here states a rule.
 */
import { commonPlanks, ladderOf } from './inquiry';

const isCount = (n) => Number.isInteger(n) && n >= 0;
const positive = (n) => Number.isInteger(n) && n > 0;

// ───────────────────────── common · witness ─────────────────────────
/** One plank laid on the two gaps: whether it fills a, b, both. */
const plankOnPair = (a, b, d) => {
  const holdsA = a % d === 0;
  const holdsB = b % d === 0;
  return { d, holdsA, holdsB, both: holdsA && holdsB };
};

// The planks of the tray are tried in the ORDER he takes them: the round stops on the first that fills both gaps (the
// witness), or runs through the whole tray (no witness) — `gcdModes.test.js` plays every order through the reducer.
// stage  take → guess → lay → take … → (a plank fills both) enough → seen      or (tray empty, none did) → seen
const witnessRound = (ri) => ({
  ri,
  stage: 'take',
  hand: null,
  guessA: null,
  guessB: null,
  /** the planks laid, in order: [{ d, holdsA, holdsB, both, guessA, guessB }] */
  placed: [],
  /** the first plank that filled both gaps (null while none has) */
  witness: null,
  /** his answer to « is one enough? » */
  enough: null,
});
export const initWitness = () => ({ ...witnessRound(0), rounds: [], done: false });

/** The round the screen is on: its two gaps, its tray, the planks still in the tray. */
export function witnessNow(spec, s) {
  const { a, b, candidates } = spec.rounds[s.ri];
  return { a, b, candidates, tray: candidates.filter((d) => !s.placed.some((p) => p.d === d)) };
}
const witnessSeen = (now, s) => ({
  ...s,
  stage: 'seen',
  rounds: [
    ...s.rounds,
    {
      a: now.a,
      b: now.b,
      tried: s.placed.map(({ d, guessA, guessB, holdsA, holdsB, both }) => ({
        d,
        guessA,
        guessB,
        holdsA,
        holdsB,
        both,
      })),
      witness: s.witness,
      enough: s.enough,
    },
  ],
});

/**
 * One move:  { type: 'take', d }  a plank of the tray in his hand        { type: 'say', side: 'a'|'b', v }  his yes / no
 *            { type: 'lay' }      both said: the world lays it            { type: 'shown' }  the plank is on both strips
 *            { type: 'enough', v }  his answer to « is one enough? »       { type: 'next' }   the next round, or the end
 */
export function witnessReducer(spec, s, action) {
  const now = witnessNow(spec, s);
  switch (action.type) {
    case 'take':
      if (s.stage !== 'take' || !now.tray.includes(action.d)) return s;
      return { ...s, stage: 'guess', hand: action.d, guessA: null, guessB: null };
    case 'say':
      if (s.stage !== 'guess' || typeof action.v !== 'boolean') return s;
      if (action.side === 'a') return { ...s, guessA: action.v };
      if (action.side === 'b') return { ...s, guessB: action.v };
      return s;
    case 'lay':
      if (s.stage !== 'guess' || s.guessA == null || s.guessB == null) return s;
      return { ...s, stage: 'lay' };
    case 'shown': {
      if (s.stage !== 'lay') return s;
      const row = { ...plankOnPair(now.a, now.b, s.hand), guessA: s.guessA, guessB: s.guessB };
      const next = { ...s, placed: [...s.placed, row], hand: null };
      if (row.both) return { ...next, stage: 'enough', witness: row.d };
      if (now.tray.length <= 1) return witnessSeen(now, next);
      return { ...next, stage: 'take' };
    }
    case 'enough':
      if (s.stage !== 'enough' || typeof action.v !== 'boolean') return s;
      return witnessSeen(now, { ...s, enough: action.v });
    case 'next':
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...witnessRound(s.ri + 1) };
    default:
      return s;
  }
}
export const witnessResult = (s) => ({ rounds: s.rounds });

// ───────────────────────── nest · pair ─────────────────────────
/**
 * Two pairs of gaps and probes: `first` = every plank of both gaps of (a ; b), `second` = every plank of both gaps of
 * (x ; y), shortest first; each probe row says what it fills. `equal`: the two lists are the same.
 */
export function pairOf(a, b, [x, y], probes) {
  if (![a, b, x, y].every(positive)) throw new RangeError(`pair: (${a} ; ${b}) (${x} ; ${y})`);
  const first = commonPlanks(a, b);
  const second = commonPlanks(x, y);
  const rows = probes.map((p) => {
    const holdsA = a % p === 0;
    const holdsB = b % p === 0;
    const holdsX = x % p === 0;
    const holdsY = y % p === 0;
    return { p, holdsA, holdsB, holdsX, holdsY, inFirst: holdsA && holdsB, inSecond: holdsX && holdsY };
  });
  const equal = first.length === second.length && first.every((d, i) => d === second[i]);
  return { first, second, rows, equal };
}

// stage  guess → lay → guess … → compare
const pairRound = (ri) => ({ ri, pi: 0, stage: 'guess', guessFirst: null, guessSecond: null, rows: [] });
export const initPair = () => ({ ...pairRound(0), rounds: [], done: false });

export function pairNow(spec, s) {
  const { a, b, pair, probes } = spec.rounds[s.ri];
  const [x, y] = pair;
  return { a, b, x, y, probes, p: probes[Math.min(s.pi, probes.length - 1)], ...pairOf(a, b, pair, probes) };
}

/**
 * One move:  { type: 'say', side: 'first'|'second', v }   { type: 'lay' }   { type: 'shown' }   { type: 'next' }
 */
export function pairReducer(spec, s, action) {
  const now = pairNow(spec, s);
  switch (action.type) {
    case 'say':
      if (s.stage !== 'guess' || typeof action.v !== 'boolean') return s;
      if (action.side === 'first') return { ...s, guessFirst: action.v };
      if (action.side === 'second') return { ...s, guessSecond: action.v };
      return s;
    case 'lay':
      if (s.stage !== 'guess' || s.guessFirst == null || s.guessSecond == null) return s;
      return { ...s, stage: 'lay' };
    case 'shown': {
      if (s.stage !== 'lay') return s;
      const row = { ...now.rows[s.pi], guessFirst: s.guessFirst, guessSecond: s.guessSecond };
      const rows = [...s.rows, row];
      const next = { ...s, rows, pi: s.pi + 1, guessFirst: null, guessSecond: null };
      if (s.pi + 1 < now.probes.length) return { ...next, stage: 'guess' };
      return {
        ...next,
        stage: 'compare',
        rounds: [
          ...s.rounds,
          {
            a: now.a,
            b: now.b,
            pair: [now.x, now.y],
            rows: rows.map(({ p, guessFirst, guessSecond, inFirst, inSecond }) => ({
              p,
              guessFirst,
              guessSecond,
              inFirst,
              inSecond,
            })),
            first: now.first,
            second: now.second,
          },
        ],
      };
    }
    case 'next':
      if (s.stage !== 'compare') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...pairRound(s.ri + 1) };
    default:
      return s;
  }
}
export const pairResult = (s) => ({ rounds: s.rounds });

// ───────────────────────── ladder · fold ─────────────────────────
/**
 * The subtraction ladder of (a ; b) cut into RUNS: the consecutive rows that take away the same gap b. A run of q rows
 * from the gap a down to the value r is ONE division a = b × q + r, 0 ≤ r < b. `rows` = the subtraction rows (ladderOf),
 * `runs` = [{ from, to (row indices), a, b, q, r }], `gcd`, `steps` = the rows of the subtraction ladder.
 */
export function foldRuns(a0, b0) {
  const L = ladderOf(a0, b0, 'subtract');
  const runs = [];
  L.rows.forEach((row, i) => {
    const cur = runs.at(-1);
    if (cur && cur.b === row.b) Object.assign(cur, { to: i, q: cur.q + 1, r: row.value });
    else runs.push({ from: i, to: i, a: row.a, b: row.b, q: 1, r: row.value });
  });
  return { rows: L.rows, runs, gcd: L.gcd, steps: L.steps };
}

/** How many runs he folds himself (round, then spec, default 1 — never more than the runs). */
const foldsAsked = (spec, r, runs) => Math.max(1, Math.min(r.folds ?? spec.folds ?? 1, runs.length));

// stage  write (the world writes the rows of the run) → fold (he types q and r) → write … → finish (the world writes the
//        other runs as folded lines) → seen
const foldRound = (ri) => ({ ri, stage: 'write', run: 0, written: 0, lines: 0, said: null, miss: null, folds: [] });
export const initFold = () => ({ ...foldRound(0), rounds: [], done: false });

export function foldNow(spec, s) {
  const r = spec.rounds[s.ri];
  const f = foldRuns(r.a, r.b);
  return { a: r.a, b: r.b, ...f, his: foldsAsked(spec, r, f.runs) };
}
const foldSeen = (now, s) => ({
  ...s,
  stage: 'seen',
  rounds: [...s.rounds, { a: now.a, b: now.b, gcd: now.gcd, steps: now.steps, lines: now.runs.length, folds: s.folds }],
});

/**
 * One move:  { type: 'tick' }        the world writes one more row (write) or one more folded line (finish)
 *            { type: 'fold', q, r }  his fold of the run on screen (a miss is kept; he folds again)
 *            { type: 'next' }
 */
export function foldReducer(spec, s, action) {
  const now = foldNow(spec, s);
  const run = now.runs[s.run];
  switch (action.type) {
    case 'tick':
      if (s.stage === 'write') {
        const written = s.written + 1;
        return { ...s, written, stage: written >= run.q ? 'fold' : 'write' };
      }
      if (s.stage === 'finish') {
        const lines = s.lines + 1;
        const next = { ...s, lines };
        return lines >= now.runs.length ? foldSeen(now, next) : next;
      }
      return s;
    case 'fold': {
      if (s.stage !== 'fold' || !isCount(action.q) || !isCount(action.r)) return s;
      const said = s.said ?? { q: action.q, r: action.r };
      if (action.q !== run.q || action.r !== run.r) return { ...s, said, miss: { q: action.q, r: action.r } };
      const fold = { rows: [run.from + 1, run.to + 1], a: run.a, b: run.b, said, q: run.q, r: run.r };
      const next = { ...s, folds: [...s.folds, fold], lines: s.run + 1, said: null, miss: null };
      if (s.run + 1 < now.his) return { ...next, stage: 'write', run: s.run + 1, written: 0 };
      if (s.run + 1 < now.runs.length) return { ...next, stage: 'finish' };
      return foldSeen(now, next);
    }
    case 'next':
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...foldRound(s.ri + 1) };
    default:
      return s;
  }
}
export const foldResult = (s) => ({ rounds: s.rounds });

// ───────────────────────── ladder · both ─────────────────────────
/**
 * The two ladders of the same pair: their rows and how many. `shorter` = 'divide' | 'subtract' | 'same'; `by` = how many
 * rows fewer (0 when the same).
 */
export function bothOf(a, b) {
  const subtract = ladderOf(a, b, 'subtract');
  const divide = ladderOf(a, b, 'divide');
  const by = Math.abs(subtract.steps - divide.steps);
  const shorter = by === 0 ? 'same' : divide.steps < subtract.steps ? 'divide' : 'subtract';
  return { subtract, divide, steps: { subtract: subtract.steps, divide: divide.steps }, shorter, by, gcd: divide.gcd };
}
const SHORTER = ['subtract', 'divide', 'same'];

// stage  say → run → seen
const bothRound = (ri) => ({ ri, stage: 'say', said: null, shown: 0 });
export const initBoth = () => ({ ...bothRound(0), rounds: [], done: false });
/** Where it starts: empty, or — on a workshop's bench — the state it kept (`spec.from`); a run goes on from its row. */
export const bothStart = (spec) => {
  const s = spec.from;
  return s && Number.isInteger(s.ri) && s.ri < spec.rounds.length && Array.isArray(s.rounds) ? s : initBoth();
};

export function bothNow(spec, s) {
  const { a, b } = spec.rounds[s.ri];
  return { a, b, ...bothOf(a, b) };
}

/**
 * One move:  { type: 'say', shorter, by }  his prediction (by is ignored — 0 — with 'same'; else a natural number ≥ 1)
 *            { type: 'tick' }              both ladders write one more row (a ladder that is done stays as it is)
 *            { type: 'next' }
 */
export function bothReducer(spec, s, action) {
  const now = bothNow(spec, s);
  switch (action.type) {
    case 'say': {
      if (s.stage !== 'say' || !SHORTER.includes(action.shorter)) return s;
      const same = action.shorter === 'same';
      if (!same && !positive(action.by)) return s;
      return { ...s, stage: 'run', said: { shorter: action.shorter, by: same ? 0 : action.by } };
    }
    case 'tick': {
      if (s.stage !== 'run') return s;
      const shown = s.shown + 1;
      if (shown < Math.max(now.steps.subtract, now.steps.divide)) return { ...s, shown };
      return {
        ...s,
        shown,
        stage: 'seen',
        rounds: [
          ...s.rounds,
          { a: now.a, b: now.b, said: s.said, steps: now.steps, shorter: now.shorter, by: now.by, gcd: now.gcd },
        ],
      };
    }
    case 'next':
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...bothRound(s.ri + 1) };
    default:
      return s;
  }
}
export const bothResult = (s) => ({ rounds: s.rounds });
