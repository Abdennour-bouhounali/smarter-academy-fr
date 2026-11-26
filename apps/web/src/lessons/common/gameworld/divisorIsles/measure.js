/**
 * THE INVESTIGATION `measure` — PURE logic (screen: `InquiryMeasure.jsx`; contract: GAME_WORLD.md « Explore », « spec
 * shapes of `measure` and `part` »). Its rule is a CHANGE OF UNIT: two gaps one above the other are ONE fraction (the
 * upper strip the numerator, the lower the denominator); a plank that fills both is a unit in which both are counted
 * again, and the fraction written in that unit is the same fraction.
 *
 *   stages   he picks a plank (a length counted in the CURRENT unit); one that fills both re-counts both strips and the
 *            new fraction joins the chain with « = »; one that does not is laid, what is left shows, nothing changes.
 *            He ends a run by claiming that no plank but 1 fills both: the world tries the planks of the upper strip on
 *            the lower one. Before a second run by another road he predicts where it will end.
 *   direct   one stage only: a plank that fills both is counted, then the world tries the planks of the upper strip on
 *            the lower one; if one still fills both, one stage was not enough and he starts again from the fraction given.
 *
 * The screen is a pure view of this file's reducer, so the whole experiment is played and tested without a browser.
 */
import { gcd } from './inquiry';
import { plankOn } from './summit';

/** Every plank of n longer than 1, the SHORTEST first. */
export function planksUp(n) {
  if (!(Number.isInteger(n) && n > 0)) throw new RangeError(`planksUp: ${n}`);
  const out = [];
  for (let d = 2; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
}

/** The planks longer than 1 that fill both p and q (their common planks), shortest first. */
export const bothPlanks = (p, q) => planksUp(Math.min(p, q)).filter((d) => p % d === 0 && q % d === 0);

/**
 * The world's check of « no plank but 1 fills both »: the planks of the upper strip p (longer than 1, shortest first)
 * tried on the lower strip q until one fills it. `tried` = [{ d, r, fills }] (r = what q leaves), `found` = the plank that
 * fills both (null: none does — the fraction can no longer be counted again).
 */
export function checkOf(p, q) {
  const tried = [];
  for (const d of planksUp(p)) {
    const r = q % d;
    tried.push({ d, r, fills: r === 0 });
    if (r === 0) return { tried, found: d };
  }
  return { tried, found: null };
}

/** The fraction p/q counted again in the unit d: [p/d, q/d] when d fills both, else null. */
export function countAgain(p, q, d) {
  if (!(Number.isInteger(d) && d > 0) || p % d || q % d) return null;
  return [p / d, q / d];
}

/** The fraction where every road ends: a/g over b/g, g = gcd(a, b). */
export const lastOf = (a, b) => [a / gcd(a, b), b / gcd(a, b)];

// ───────────────────────── the state machine of the screen ─────────────────────────
// stages:  pick → lay → pick … ; pick →(end) checkRun → pick (a plank still fills) | [predict → pick …] | seen
// direct:  pick → lay → (fills both) checkRun → again (a plank still fills) → pick … | seen

/** The round the screen is on, with everything it derives from its numbers. */
export function measureNow(spec, s) {
  const r = spec.rounds[s.ri];
  if ((r.typed ?? spec.typed) === false && !(r.chips ?? spec.chips)?.length)
    throw new RangeError('measure: `typed: false` needs chips');
  const mode = r.mode ?? 'stages';
  const g = gcd(r.a, r.b);
  const firsts = bothPlanks(r.a, r.b); // every plank that can open a road
  const wanted = mode === 'direct' ? 1 : (r.runs ?? 2);
  return {
    a: r.a,
    b: r.b,
    mode,
    g,
    last: lastOf(r.a, r.b),
    // a second road needs a second first plank: never more runs than first planks (at least one run)
    runs: mode === 'direct' ? 1 : Math.max(1, Math.min(wanted, firsts.length)),
    chips: r.chips ?? spec.chips ?? null,
    // options, off by default (2026-11-26): `typed: false` hides the typed box (chips only); `long: true` draws a strip
    // of more than ~130 cells as one bar, a plank too thin to see (under 3 px) as ONE band with its count
    typed: r.typed ?? spec.typed ?? true,
    long: r.long ?? spec.long ?? false,
  };
}

const freshRun = (now) => ({
  cur: [now.a, now.b],
  chain: [[now.a, now.b]],
  stages: [],
  checks: [],
});

function roundState(spec, ri) {
  const now = measureNow(spec, { ri });
  return {
    ri,
    stage: 'pick',
    ...freshRun(now),
    /** the runs finished in this round (stages: the roads; direct: the attempts) */
    runs: [],
    /** his prediction of where the run under way will end (stages, from the second run) */
    predicted: null,
    /** every plank laid that did not fill both: [{ d, at: [p, q] }] */
    refused: [],
    /** the plank lying on the strips now: { d, at: [p, q], ...plankOn } (null: none) */
    last: null,
    /** a typed length the world did not lay: { kind: 'bound' | 'same', d } */
    notice: null,
    pending: null,
    /** the world's check under way or just done: { at, tried, found, shown, said: 'end' | 'auto' } */
    check: null,
  };
}

export const initMeasure = (spec) => ({ ...roundState(spec, 0), rounds: [], done: false });

const runOf = (s) => ({
  stages: s.stages,
  end: s.cur,
  predicted: s.predicted,
  checks: s.checks,
});

function roundResult(now, s) {
  return {
    a: now.a,
    b: now.b,
    mode: now.mode,
    runs: s.runs,
    refused: s.refused,
    final: s.runs.at(-1)?.end ?? [now.a, now.b],
  };
}

/** The check is over: where the run goes. */
function afterCheck(now, s) {
  const { found } = s.check;
  const checks = [...s.checks, { at: s.check.at, found }];
  if (now.mode === 'direct') {
    const runs = [...s.runs, runOf({ ...s, checks })];
    if (found !== null) return { ...s, checks, runs, stage: 'again' };
    const ended = { ...s, checks, runs, stage: 'seen' };
    return { ...ended, rounds: [...s.rounds, roundResult(now, ended)] };
  }
  if (found !== null) return { ...s, checks, stage: 'pick' };
  const runs = [...s.runs, runOf({ ...s, checks })];
  if (runs.length < now.runs) return { ...s, checks, runs, stage: 'predict' };
  const ended = { ...s, checks, runs, stage: 'seen' };
  return { ...ended, rounds: [...s.rounds, roundResult(now, ended)] };
}

/** The planks that opened the earlier runs of the round. */
export const firstsUsed = (s) => s.runs.map((r) => r.stages[0]?.d).filter((d) => d != null);

/**
 * One move of the experiment.
 *   { type: 'try', d }          pick: he lays a plank of d units (2 … the longer strip; another length is a notice)
 *   { type: 'shown' }           lay: the world has laid it
 *   { type: 'end' }             pick (stages): his claim « no plank but 1 fills both » — the world checks
 *   { type: 'tick' }            checkRun: the world tries its next plank
 *   { type: 'predict', p, q }   predict: where the next road will end
 *   { type: 'again' }           again (direct): back to the fraction given
 *   { type: 'next' }            seen: the next round, or the end
 * A move that does not belong to the stage changes nothing.
 */
export function measureReducer(spec, s, action) {
  const now = measureNow(spec, s);
  switch (action.type) {
    case 'try': {
      if (s.stage !== 'pick') return s;
      const { d } = action;
      const [p, q] = s.cur;
      if (!Number.isInteger(d) || d < 2 || d > Math.max(p, q))
        return { ...s, notice: { kind: 'bound', d: Number.isInteger(d) ? d : 0 } };
      // a second road opens with another plank (while another one exists)
      if (now.mode === 'stages' && s.stages.length === 0 && s.runs.length > 0) {
        const used = firstsUsed(s);
        const open = planksUp(now.g).filter((x) => !used.includes(x));
        if (used.includes(d) && open.length > 0) return { ...s, notice: { kind: 'same', d } };
      }
      return { ...s, stage: 'lay', pending: d, notice: null, check: null };
    }
    case 'shown': {
      if (s.stage !== 'lay') return s;
      const d = s.pending;
      const [p, q] = s.cur;
      const last = { ...plankOn(p, q, d), at: s.cur };
      const to = countAgain(p, q, d);
      if (!to) return { ...s, stage: 'pick', pending: null, last, refused: [...s.refused, { d, at: s.cur }] };
      const counted = {
        ...s,
        pending: null,
        last,
        cur: to,
        chain: [...s.chain, to],
        stages: [...s.stages, { d, from: s.cur, to }],
      };
      if (now.mode === 'direct')
        return { ...counted, stage: 'checkRun', check: { at: to, ...checkOf(to[0], to[1]), shown: 0, said: 'auto' } };
      return { ...counted, stage: 'pick' };
    }
    case 'end': {
      if (s.stage !== 'pick' || now.mode !== 'stages') return s;
      const [p, q] = s.cur;
      return { ...s, stage: 'checkRun', notice: null, check: { at: s.cur, ...checkOf(p, q), shown: 0, said: 'end' } };
    }
    case 'tick': {
      if (s.stage !== 'checkRun') return s;
      const check = { ...s.check, shown: Math.min(s.check.shown + 1, s.check.tried.length) };
      const at = { ...s, check };
      return check.shown < check.tried.length ? at : afterCheck(now, at);
    }
    case 'predict': {
      if (s.stage !== 'predict') return s;
      const { p, q } = action;
      if (![p, q].every((x) => Number.isInteger(x) && x > 0)) return s;
      return { ...s, ...freshRun(now), stage: 'pick', predicted: [p, q], last: null, check: null, notice: null };
    }
    case 'again': {
      if (s.stage !== 'again') return s;
      return { ...s, ...freshRun(now), stage: 'pick', last: null, check: null, notice: null };
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
export const measureResult = (s) => ({ rounds: s.rounds });
