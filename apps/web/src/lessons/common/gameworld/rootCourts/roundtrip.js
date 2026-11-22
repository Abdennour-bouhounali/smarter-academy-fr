/**
 * THE INVESTIGATION `roundtrip` — PURE logic (screen: `InquiryRoundtrip.jsx`; contract: GAME_WORLD.md « Explore », spec
 * shape of `roundtrip`). Its rule is TWO OPERATIONS THAT UNDO EACH OTHER. Two stations stand side by side:
 *   « build »  a rod goes in, a court comes out with its plaque (the platform built on the rod: `logic.js › platform`);
 *   « take »   a court goes in, a rod comes out along its wall (its number when it has one, `rootOf`; else the wall itself).
 * A journey starts from a rod, a court, or a WALK of the robot from the post (« -9 »: nine steps to the left — the rod
 * between the post and his mark), and goes through the stations of its path. Before each station runs he TYPES what will
 * come out; the station runs and shows it. A miss is answered by what came out, never by « wrong ».
 *
 *   spec = { kind: 'roundtrip', rounds: [{ from: { rod: { root: '23' } }, path: ['build'] },
 *                                        { from: { rod: { q: '14' } }, path: ['build', 'take'] },
 *                                        { from: { walk: '-9' }, path: ['build', 'take'] }, …], text }
 *   a thing = { rod: { q } | { root } } | { court: '196' } | { walk: '-9' }  — every number is TEXT
 *
 * The screen is a pure view of this file's reducer: the whole experiment is played and tested without a browser.
 */
import { read, write, compare, equal, platform, rootOf, wall } from './logic';

/** What a station takes in: a rod (a walk is a rod) for « build », a court for « take ». */
const takes = { build: (t) => t.rod != null || t.walk != null, take: (t) => t.court != null };

/** The rod of a thing that is one: a rod, or the rod of a walk (its length is the walk's, whatever its side). */
export const rodIn = (t) => (t.rod != null ? t.rod : { q: write(t.walk) });

/** What a station gives for what it takes in — exact. A thing it cannot take is an error of the spec. */
export function runOp(op, t) {
  if (!takes[op]?.(t)) throw new Error(`roundtrip: the station « ${op} » cannot take ${JSON.stringify(t)}`);
  if (op === 'build') return { court: write(platform(rodIn(t))) };
  const side = rootOf(t.court);
  return { rod: side != null ? { q: side } : wall(t.court) };
}

/** The things of a journey: its start, then what each station gave — the spec is checked on the way. */
export function chainOf(round) {
  if (!round.path?.length) throw new Error('roundtrip: a journey has no station');
  const out = [round.from];
  for (const op of round.path) out.push(runOp(op, out.at(-1)));
  return out;
}

/** Is `x` a number he could have typed (« 23 », « 5,47 », « -9 », « 49/64 »)? */
const readable = (x) => {
  try {
    read(x);
    return true;
  } catch {
    return false;
  }
};

/**
 * His answer against what came out. A plaque: `{ area }` (typed). A rod: `{ q }` (a number) or `{ root }` (« the side of
 * the court of [ ] »). A rod is right when it is the SAME LENGTH: a number that is not negative and whose square is the
 * area of the court that rod builds (the side of the court of 196 is 14, whichever way it is written).
 */
export function judge(op, said, out) {
  if (op === 'build') return equal(said.area, out.court);
  if (said.root != null) return compare(said.root, 0) >= 0 && equal(said.root, platform(out.rod));
  return compare(said.q, 0) >= 0 && equal(platform({ q: said.q }), platform(out.rod));
}

/** An answer as the result keeps it: its number written as the world writes it. */
const clean = (said) =>
  said.area != null
    ? { area: write(said.area) }
    : said.root != null
      ? { root: write(said.root) }
      : { q: write(said.q) };

/** Is the answer in the shape the station gives (a plaque for « build », a rod for « take »), and readable? */
export function answerOk(op, said) {
  if (!said) return false;
  if (op === 'build') return said.area != null && readable(said.area);
  const v = said.root ?? said.q;
  return v != null && readable(v);
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// ask → run → seen → ask (next station) … → seen (last station of the last journey) → done

const roundState = (spec, ri) => ({
  ri,
  si: 0,
  chain: chainOf(spec.rounds[ri]),
  steps: [],
  stage: 'ask',
  notice: null,
});

export function initRoundtrip(spec) {
  if (!spec.rounds?.length) throw new Error('roundtrip: the spec holds no journey');
  spec.rounds.forEach(chainOf); // every journey is checked at once
  return { ...roundState(spec, 0), rows: [], pending: null, done: false };
}

/** The station under way: its op, what goes in, what will come out. */
export function stepNow(spec, s) {
  const r = spec.rounds[s.ri];
  return { op: r.path[s.si], in: s.chain[s.si], out: s.chain[s.si + 1], last: s.si + 1 >= r.path.length };
}

/**
 * One move of the experiment.
 *   { type: 'say', said }  ask: his answer — { area } before « build », { q } or { root } before « take »
 *   { type: 'ran' }        run: the station has run and shows what came out
 *   { type: 'next' }       seen: the next station, the next journey, or the end
 * An answer that cannot be read is a notice (nothing runs); a move that does not belong to the stage changes nothing.
 */
export function roundtripReducer(spec, s, action) {
  switch (action.type) {
    case 'say': {
      if (s.stage !== 'ask') return s;
      const { op } = stepNow(spec, s);
      if (!answerOk(op, action.said)) return { ...s, notice: 'unread' };
      return { ...s, stage: 'run', pending: clean(action.said), notice: null };
    }
    case 'ran': {
      if (s.stage !== 'run') return s;
      const now = stepNow(spec, s);
      const step = {
        op: now.op,
        in: now.in,
        out: now.out,
        predicted: s.pending,
        right: judge(now.op, s.pending, now.out),
      };
      const steps = [...s.steps, step];
      const r = spec.rounds[s.ri];
      const rows = now.last ? [...s.rows, { from: r.from, path: r.path, steps }] : s.rows;
      return { ...s, steps, rows, pending: null, stage: 'seen' };
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      const r = spec.rounds[s.ri];
      if (s.si + 1 < r.path.length) return { ...s, si: s.si + 1, stage: 'ask', notice: null };
      if (s.ri + 1 < spec.rounds.length) return { ...s, ...roundState(spec, s.ri + 1) };
      return { ...s, done: true };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const roundtripResult = (s) => ({ rows: s.rows });
