/**
 * THE INVESTIGATION `summit` — PURE logic (screen: `InquirySummit.jsx`; contract: GAME_WORLD.md « استكشف », « spec shape
 * of `summit` »). Its rule is a search for a MAXIMUM with the reason to stop: the longest plank that fills two gaps is
 * among the planks of the SHORTER gap; tried from the longest down, the first one that fills the other gap is it, and
 * the shorter ones need not be tried.
 *
 *   free      he TYPES any plank length; the world lays it on both gaps and writes the two divisions (a fact). A plank
 *             that fills both and is longer than the best so far becomes the best.
 *   outside   ONE prediction: can a plank that does not fill the shorter gap fill both? Answered by a plank laid.
 *   count     (mode `first`) how many planks will be tried before one fills the other gap?
 *   descent   the planks of the shorter gap from the longest down; before each he says whether it fills the other gap;
 *             the first that does is crowned. In mode `first` he says it for the first plank only; the world goes on.
 *   rest      « must the shorter planks still be tried? » — on yes the world lays them all, each shorter than the crown.
 *
 * The screen is a pure view of this file's reducer, so the whole experiment is played and tested without a browser.
 */
/** Every plank that fills the gap n (its divisors), the LONGEST first. */
export function divisorsDown(n) {
  if (!(Number.isInteger(n) && n > 0)) throw new RangeError(`divisorsDown: ${n}`);
  const out = [];
  for (let d = n; d >= 1; d -= 1) if (n % d === 0) out.push(d);
  return out;
}

/**
 * What a plank of d cells does on the pair of gaps (a, b): the two divisions (q, r) and which gaps it fills.
 * kind: 'both' | 'a' (fills a only) | 'b' (fills b only) | 'none'.
 */
export function plankOn(a, b, d) {
  const fillsA = a % d === 0;
  const fillsB = b % d === 0;
  return {
    d,
    qa: Math.floor(a / d),
    ra: a % d,
    qb: Math.floor(b / d),
    rb: b % d,
    fillsA,
    fillsB,
    both: fillsA && fillsB,
    kind: fillsA && fillsB ? 'both' : fillsA ? 'a' : fillsB ? 'b' : 'none',
  };
}

/**
 * The descent of a pair: the planks of the shorter gap tried from the longest down until the first that fills the
 * longer gap. `planks` = the planks tried (the crown last), `crown` = that plank (it IS gcd(a, b)), `tries` = how many,
 * `rest` = the planks of the shorter gap shorter than the crown (longest first).
 */
export function descentOf(a, b) {
  const short = Math.min(a, b);
  const long = Math.max(a, b);
  const all = divisorsDown(short);
  const at = all.findIndex((d) => long % d === 0);
  return { short, long, all, planks: all.slice(0, at + 1), crown: all[at], tries: at + 1, rest: all.slice(at + 1) };
}

/**
 * The plank that answers « can a plank that does not fill the shorter gap fill both? »: one of HIS tries when one does
 * not fill the shorter gap (`mine`), else the world's: a plank no longer than the longer gap that fills the longer gap but
 * not the shorter (the most telling), else the shortest plank that does not fill the shorter gap. null when there is none
 * (both gaps 1 or 2 cells long).
 */
export function outsideWitness(a, b, tries = []) {
  const short = Math.min(a, b);
  const long = Math.max(a, b);
  const his = tries.find((t) => short % t.d !== 0);
  if (his) return { d: his.d, mine: true };
  for (let d = 2; d <= long; d += 1) if (long % d === 0 && short % d !== 0) return { d, mine: false };
  for (let d = 2; d <= long; d += 1) if (short % d !== 0) return { d, mine: false };
  return null;
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// stage  free → freeLay → free … → outside → outsideLay → outsideSeen → [count] → descent → descentLay → descent …
//        → (crowned) rest → restRun → seen            mode 'first': … descentLay → run → … → seen

/** The round the screen is on, with everything it derives from its numbers. */
export function summitNow(spec, s) {
  const r = spec.rounds[s.ri];
  const mode = r.mode ?? 'search';
  return {
    a: r.a,
    b: r.b,
    mode,
    free: r.free ?? 2,
    asksOutside: r.outside ?? mode !== 'first',
    start: r.start ?? null,
    ...descentOf(r.a, r.b),
  };
}

/** The stage after the free tries: the outside prediction, the count (mode `first`) or the descent. */
const afterFree = (now) => {
  if (now.asksOutside && outsideWitness(now.a, now.b, []) !== null) return 'outside';
  return now.mode === 'first' ? 'count' : 'descent';
};

function roundState(spec, ri) {
  const now = summitNow(spec, { ri });
  const start = now.start ? plankOn(now.a, now.b, now.start) : null;
  return {
    ri,
    stage: now.free > 0 ? 'free' : afterFree(now),
    /** the plank lying on the strips now (null: the gaps are empty) */
    last: start,
    /** the longest plank seen to fill both gaps so far (the start when it does) */
    best: start?.both ? start.d : null,
    /** the free tries: [plankOn…] */
    tries: [],
    /** a typed length the world refused (out of 1 … the longer gap): shown as a fact, the box stays */
    refused: null,
    /** what waits for the world: a typed length (freeLay) or a yes / no (outsideLay, descentLay) */
    pending: null,
    outside: null,
    /** the planks of the descent laid so far: [{ d, guess, holds }] — guess null for the world's own */
    descent: [],
    crown: null,
    checkedRest: null,
    restShown: 0,
    guessCount: null,
  };
}

export const initSummit = (spec) => ({ ...roundState(spec, 0), rounds: [], done: false });

/** The round as the result keeps it. */
function roundResult(now, s) {
  return {
    a: now.a,
    b: now.b,
    mode: now.mode,
    tries: s.tries.map((t) => ({ d: t.d, fillsA: t.fillsA, fillsB: t.fillsB })),
    outside: s.outside && { d: s.outside.d, guess: s.outside.guess, mine: s.outside.mine },
    descent: s.descent,
    crown: s.crown,
    checkedRest: s.checkedRest,
    ...(now.mode === 'first' ? { guessCount: s.guessCount } : {}),
  };
}
const seen = (now, s) => ({ ...s, stage: 'seen', rounds: [...s.rounds, roundResult(now, s)] });

/** The descent plank number k laid (guess null: the world's), and where the round goes after it. */
function layDescent(now, s, guess) {
  const d = now.planks[s.descent.length];
  const holds = now.long % d === 0;
  const descent = [...s.descent, { d, guess, holds }];
  const next = { ...s, descent, pending: null, last: plankOn(now.a, now.b, d) };
  if (!holds) return { ...next, stage: now.mode === 'first' ? 'run' : 'descent' };
  const crowned = { ...next, crown: d };
  if (now.mode === 'first' || now.rest.length === 0) return seen(now, crowned);
  return { ...crowned, stage: 'rest' };
}

/**
 * One move of the experiment.
 *   { type: 'try', d }     free: he lays a plank of d cells (refused, as a fact, outside 1 … the longer gap)
 *   { type: 'say', v }     outside / descent / rest: his yes (true) or no (false)
 *   { type: 'shown' }      the world has laid what was pending
 *   { type: 'go' }         outsideSeen: on to the count or the descent
 *   { type: 'count', n }   count (mode `first`): how many planks will be tried
 *   { type: 'tick' }       run / restRun: the world lays its next plank
 *   { type: 'next' }       seen: the next round, or the end
 * A move that does not belong to the stage changes nothing.
 */
export function summitReducer(spec, s, action) {
  const now = summitNow(spec, s);
  switch (action.type) {
    case 'try': {
      if (s.stage !== 'free') return s;
      const d = action.d;
      if (!Number.isInteger(d) || d < 1 || d > now.long) return { ...s, refused: Number.isInteger(d) ? d : 0 };
      return { ...s, stage: 'freeLay', pending: d, refused: null };
    }
    case 'say': {
      if (typeof action.v !== 'boolean') return s;
      if (s.stage === 'outside') return { ...s, stage: 'outsideLay', pending: action.v };
      if (s.stage === 'descent') return { ...s, stage: 'descentLay', pending: action.v };
      if (s.stage === 'rest')
        return action.v ? { ...s, stage: 'restRun', checkedRest: true } : seen(now, { ...s, checkedRest: false });
      return s;
    }
    case 'shown': {
      if (s.stage === 'freeLay') {
        const t = plankOn(now.a, now.b, s.pending);
        const tries = [...s.tries, t];
        const best = t.both && (s.best == null || t.d > s.best) ? t.d : s.best;
        const stage = tries.length < now.free ? 'free' : afterFree(now);
        return { ...s, stage, tries, best, last: t, pending: null };
      }
      if (s.stage === 'outsideLay') {
        const w = outsideWitness(now.a, now.b, s.tries);
        const outside = { ...plankOn(now.a, now.b, w.d), mine: w.mine, guess: s.pending };
        return { ...s, stage: 'outsideSeen', outside, last: outside, pending: null };
      }
      if (s.stage === 'descentLay') return layDescent(now, s, s.pending);
      return s;
    }
    case 'go': {
      if (s.stage !== 'outsideSeen') return s;
      return { ...s, stage: now.mode === 'first' ? 'count' : 'descent' };
    }
    case 'count': {
      if (s.stage !== 'count' || !Number.isInteger(action.n) || action.n < 1) return s;
      return { ...s, stage: 'descent', guessCount: action.n };
    }
    case 'tick': {
      if (s.stage === 'run') return layDescent(now, s, null);
      if (s.stage === 'restRun') {
        const restShown = s.restShown + 1;
        const at = { ...s, restShown, last: plankOn(now.a, now.b, now.rest[restShown - 1]) };
        return restShown < now.rest.length ? at : seen(now, at);
      }
      return s;
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...roundState(spec, s.ri + 1) };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const summitResult = (s) => ({ rounds: s.rounds });
