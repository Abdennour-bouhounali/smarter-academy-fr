/**
 * THE INVESTIGATION `crews` of this world — pure logic and the state machines of its screen (screen: `InquiryCrews.jsx`,
 * mounted by `Inquiry.jsx`; drawing: `crewLanes.jsx`; contract: GAME_WORLD.md « Explore », spec shape of `crews`).
 *
 *   mode `story`  a story that is not a walkway (words only): he TRANSLATES it into crews (what a case is, the planks of
 *                 each crew — chips; a wrong chip gets the story's fact and goes back), places the pillar and lets the
 *                 crews lay on the story's own ruler (the walkway's gestures and facts, `walkway.js`), then goes BACK to
 *                 the story: he types what it asked (integers, or a clock time « □ h □ min »); a wrong value gets the
 *                 story's fact and he tries again.
 *   mode `days`   teams that work one day then rest some days, all at work on day 1: before each run he TYPES the next
 *                 day the asked teams work together; the world runs the days (« Jour suivant » one by one, or « Avance »
 *                 four a second) and stops on that day — and, with `stopOn: 'all-but-one'`, on each day where every team
 *                 but one works, naming the one at rest. A first stage may ask how many days have passed on day 1.
 *
 * Also here, for the final mission's `window` (`Mission.jsx`): `daysFact` — what a typed day IS for a set of cycles,
 * written from who works that day, never the answer. Every move is kept — the evidence a forge refutes a wrong rule
 * with. A move that does not belong to the stage changes nothing. Nothing here states a rule.
 */
import { initWalkway, walkwayReducer } from './walkway';

// ───────────────────────────── days, cycles ─────────────────────────────

/** A team's cycle: its days of work (1) and its days of rest together. */
export const cycleOf = (team) => (team.work ?? 1) + team.sleep;
/** Does a team of this cycle work on day d (day 1 = the start, every team at work)? — d − 1 is a multiple of the cycle. */
export const worksOn = (cycle, d) => Number.isInteger(d) && d >= 1 && (d - 1) % cycle === 0;

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
/** The smallest common multiple of the cycles (each ≥ 1). */
export const lcmOf = (xs) => xs.reduce((m, x) => (m / gcd(m, x)) * x, 1);
/** The first day after day 1 when every cycle of `cycles` works. */
export const nextTogether = (cycles) => 1 + lcmOf(cycles);

/**
 * What the day d IS for teams of these cycles — from who works that day, never the answer:
 *   { day, working: [indexes], idle: [indexes], kind }
 *   kind 'start' (day 1: the start, 0 days since it) · 'first' (all work, and it is the first time since day 1) ·
 *        'again' (all work, but not for the first time since day 1) · 'some' (some work, some rest) · 'none' (all rest)
 * A day that is not a whole number ≥ 1 is { day, kind: 'nan' }.
 */
export function daysFact(cycles, day) {
  if (!Number.isInteger(day) || day < 1) return { day, kind: 'nan', working: [], idle: [] };
  const working = [];
  const idle = [];
  cycles.forEach((c, i) => (worksOn(c, day) ? working : idle).push(i));
  let kind = 'some';
  if (day === 1) kind = 'start';
  else if (!idle.length) kind = day === nextTogether(cycles) ? 'first' : 'again';
  else if (!working.length) kind = 'none';
  return { day, working, idle, kind };
}

/** The 31-day window around a typed day for the mission: days from … from + size − 1, starting at day 1 at the least. */
export function windowOf(day, size = 31) {
  const half = Math.floor(size / 2);
  const from = Math.max(1, (Number.isInteger(day) ? day : 1) - half);
  return { from, cols: size };
}

// ───────────────────────────── mode `days` ─────────────────────────────

/** The days a stage's run stops on: every day where all of `cycles` but one work (with the one at rest), before `to`. */
export function allButOne(cycles, to) {
  const out = [];
  for (let d = 2; d < to; d += 1) {
    const idle = cycles.map((c, i) => (worksOn(c, d) ? -1 : i)).filter((i) => i >= 0);
    if (idle.length === 1) out.push({ day: d, team: idle[0] + 1 });
  }
  return out;
}

/** The stage on screen: the asked teams (numbers from 1), their cycles, the day they meet, the stops on the way. */
export function daysNow(spec, s) {
  const st = spec.stages[s.si];
  const all = spec.teams.map(cycleOf);
  if (st.ask === 'zero') return { st, all, zero: true };
  const cycles = st.teams.map((t) => all[t - 1]);
  const meet = nextTogether(cycles);
  if (meet > spec.days) throw new RangeError(`crews: day ${meet} is past the ${spec.days} days drawn`);
  const stops = st.stopOn === 'all-but-one' ? allButOne(all, meet) : [];
  return { st, all, cycles, meet, stops, zero: false };
}

// stage of a run   say (he types the day) → run (the world runs, by step or fast) → stop (a day where all but one
//                  work, named) → run … → met (the asked teams work together: his day beside it) — then the next stage
const daysStage = (si) => ({ si, phase: 'say', said: null, day: 1, paused: false, stopsSeen: [] });
export const initDays = () => ({ ...daysStage(0), zero: null, zeroTries: [], stages: [], done: false });

const readDay = (text) => {
  const t = String(text ?? '').trim();
  return /^\d{1,6}$/.test(t) ? Number(t) : null;
};

/**
 * One move:  { type: 'zero', value }   the first stage: how many days have passed on day 1 (a chip)
 *            { type: 'say', text }     he types the day the asked teams next work together (a whole number ≥ 2)
 *            { type: 'step' }          the world runs one more day (« Jour suivant », or one beat of « Avance »)
 *            { type: 'pause' } · { type: 'resume' }   « Pause » / « Avance » on a fast run
 *            { type: 'next' }          the next stage, or the end
 */
export function daysReducer(spec, s, a) {
  const now = daysNow(spec, s);
  switch (a.type) {
    case 'zero': {
      if (!now.zero || s.phase !== 'say') return s;
      const tries = [...s.zeroTries, a.value];
      if (a.value !== 0) return { ...s, zeroTries: tries };
      return { ...s, zero: 0, zeroTries: tries, phase: 'met' };
    }
    case 'say': {
      if (now.zero || s.phase !== 'say') return s;
      const said = readDay(a.text);
      if (said == null || said < 2) return s;
      return { ...s, said, phase: 'run', paused: false };
    }
    case 'step': {
      if (s.phase !== 'run' || now.zero) return s;
      const day = s.day + 1;
      if (day === now.meet) return { ...s, day, phase: 'met' };
      const stop = now.stops.find((x) => x.day === day);
      if (stop) return { ...s, day, phase: 'stop', stopsSeen: [...s.stopsSeen, stop] };
      return { ...s, day };
    }
    case 'pause':
      return s.phase === 'run' ? { ...s, paused: true } : s;
    case 'resume':
      if (s.phase === 'stop') return { ...s, phase: 'run', paused: false };
      return s.phase === 'run' ? { ...s, paused: false } : s;
    case 'next': {
      if (s.phase !== 'met') return s;
      const done = now.zero
        ? { kind: 'zero', said: s.zeroTries }
        : { teams: now.st.teams, said: s.said, day: now.meet, sleepers: s.stopsSeen };
      const stages = [...s.stages, done];
      if (s.si + 1 >= spec.stages.length) return { ...s, stages, done: true };
      return { ...s, ...daysStage(s.si + 1), stages };
    }
    default:
      return s;
  }
}

/** What the run gives the forge: his answer on day 1, then per stage the teams, HIS day, the day, the stops named. */
export const daysResult = (s) => ({
  zero: s.zero,
  zeroTries: s.zeroTries,
  stages: s.stages.filter((x) => x.kind !== 'zero'),
});

// ───────────────────────────── mode `story` ─────────────────────────────

const SLOTS = ['unit', 'A', 'B'];
const storyRound = (ri) => ({
  ri,
  stage: 'read',
  map: { unit: null, A: null, B: null },
  mapTries: [],
  pillar: initWalkway(),
  backVals: {},
  backTries: [],
  backOk: {},
  last: null,
});
export const initStory = () => ({ ...storyRound(0), rounds: [], done: false });

/** His crews: the plank lengths he put on A and B (the walkway's lanes). */
const crewsOf = (s) => [s.map.A, s.map.B];
/** The walkway config of the pillar stage: his crews, the story's own ruler, no purse. */
const storyWalk = (spec, s) => ({ crews: crewsOf(s), max: spec.ruler, purse: null });

/** Is this chip right on this slot? The unit is the story's; a crew takes a plank of the story, not the other crew's. */
export function mapJudge(round, map, slot, value) {
  if (slot === 'unit') return value === round.unit.right;
  const other = map[slot === 'A' ? 'B' : 'A'];
  return round.crews.includes(value) && value !== other;
}

/** A value typed back: an integer box, or a clock time { h, min } — judged against the ask's value. */
export function backJudge(ask, typed) {
  if (ask.clock) {
    const [h, m] = ask.value;
    return typed && Number(typed.h) === h && Number(typed.min) === m;
  }
  return Number(typed) === ask.value;
}

/**
 * One move:  { type: 'read' }                 « Traduis »: from the story card to the chips
 *            { type: 'chip', slot, value }    a chip on « une case, c’est » (`unit`) or on crew A / B
 *            { type: 'walk', action }         a move of the pillar's panel (`walkway.js › walkwayReducer`)
 *            { type: 'back' }                 to the story's questions — once a pillar held
 *            { type: 'type', id, value }      what he types in a box of the questions ({ h, min } for a clock)
 *            { type: 'check' }                the world reads his boxes
 *            { type: 'next' }                 the next round, or the end
 * A refused chip, a value read back wrong: kept with the fact the screen writes (`last`), the state otherwise unchanged.
 */
export function storyReducer(spec, s, a) {
  const round = spec.rounds[s.ri];
  switch (a.type) {
    case 'read':
      return s.stage === 'read' ? { ...s, stage: 'map' } : s;
    case 'chip': {
      if (s.stage !== 'map' || !SLOTS.includes(a.slot) || s.map[a.slot] != null) return s;
      const right = mapJudge(round, s.map, a.slot, a.value);
      const tr = { slot: a.slot, value: a.value, right };
      const next = { ...s, mapTries: [...s.mapTries, tr], last: { type: 'chip', ...tr } };
      if (!right) return next;
      const map = { ...s.map, [a.slot]: a.value };
      const full = SLOTS.every((k) => map[k] != null);
      return { ...next, map, stage: full ? 'pillar' : 'map' };
    }
    case 'walk': {
      if (s.stage !== 'pillar') return s;
      const pillar = walkwayReducer(storyWalk(spec, s), s.pillar, a.action);
      return pillar === s.pillar ? s : { ...s, pillar, last: null };
    }
    case 'back': {
      if (s.stage !== 'pillar' || !s.pillar.tries.some((t) => t.holds)) return s;
      return { ...s, stage: 'back', last: null };
    }
    case 'type':
      if (s.stage !== 'back' || s.backOk[a.id]) return s;
      return { ...s, backVals: { ...s.backVals, [a.id]: a.value } };
    case 'check': {
      if (s.stage !== 'back') return s;
      const open = round.ask.filter((q) => !s.backOk[q.id]);
      const judged = open.map((q) => ({
        id: q.id,
        said: s.backVals[q.id] ?? null,
        right: backJudge(q, s.backVals[q.id]),
      }));
      const backOk = { ...s.backOk };
      judged.forEach((j) => {
        if (j.right) backOk[j.id] = true;
      });
      const wrong = judged.find((j) => !j.right) ?? null;
      const next = {
        ...s,
        backOk,
        backTries: [...s.backTries, ...judged],
        last: wrong ? { type: 'back', ...wrong } : null,
      };
      if (wrong) return next;
      const held = s.pillar.tries.filter((t) => t.holds);
      const done = {
        mapping: { ...s.map },
        mapTries: s.mapTries,
        pillars: s.pillar.tries.map((t) => ({ d: t.d, holds: t.holds, verdict: t.verdict })),
        d: held.length ? held[held.length - 1].d : null,
        said: s.backTries.concat(judged),
      };
      return { ...next, stage: 'seen', rounds: [...s.rounds, done] };
    }
    case 'next':
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...storyRound(s.ri + 1) };
    default:
      return s;
  }
}
export const storyResult = (s) => ({ rounds: s.rounds });

