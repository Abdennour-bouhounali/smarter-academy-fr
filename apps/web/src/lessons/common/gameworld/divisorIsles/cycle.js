/**
 * THE INVESTIGATION `cycle` — PURE logic (screen: `InquiryCycle.jsx`; contract: GAME_WORLD.md « Explore », « spec shape
 * of `cycle` »). Its rule is a PATTERN: with a plank of b cells, what is left on a gap is one of 0, 1, …, b − 1 — never
 * b cells or more — and the longest piece left is b − 1.
 *
 * ONE plank, and a gap that GROWS one cell at a time: a, a + 1, a + 2 … The cells left climb by one at each step, and
 * the step where they would be b is the step where one more plank goes in: nothing is left. This file computes those
 * steps, what the world does with any number of cells left, and the STATE MACHINE of the screen — a reducer, so that the
 * whole experiment can be played and tested without a browser.
 *
 *   rounds  the student says, BEFORE each new cell, how many cells will be left (the first gap of a round is shown);
 *   probes  a plank he has not laid: he says the most cells it will ever leave, and whether b cells will be left once;
 *           then the world grows the gap alone, through one whole climb and the fall after it.
 */

/** The gaps of one round: `count` gaps from `from`, each one cell longer, all with the plank b. */
export function cycleOf(b, from, count) {
  const steps = [];
  for (let i = 0; i < count; i += 1) {
    const a = from + i;
    const r = a % b;
    // wraps: the cell just added was the b-th cell left — one more plank went in
    steps.push({ a, q: Math.floor(a / b), r, wraps: i > 0 && r === 0 });
  }
  return { b, from, steps };
}

/** The most cells a plank of b ever leaves. */
export const largestLeft = (b) => b - 1;

/** The gaps the world grows through for a probe: from a gap the plank fills, one whole climb, the fall, one more. */
export function probeOf(b, from) {
  const start = from - (from % b);
  return { ...cycleOf(b, start, b + 2), start };
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// part 'round': stage  guess → lay → guess … → seen        (i = the index of the last gap shown)
// part 'probe': stage  ask → run → seen                    (i = the index of the last gap the world has grown to)

const roundAt = (spec, ri) => {
  const r = spec.rounds[ri];
  return cycleOf(r.b, r.from, r.count);
};
const probeAt = (spec, pi) => {
  const p = spec.probes[pi];
  return probeOf(p.b, p.from);
};

export const initCycle = () => ({
  part: 'round',
  ri: 0,
  pi: 0,
  i: 0,
  stage: 'guess',
  /** his predictions of the round being played: [{ a, said }] — said for the gap a */
  guesses: [],
  /** the prediction waiting for the world (stage 'lay') */
  pending: null,
  /** the probe being asked: what he has said so far */
  max: null,
  same: null,
  /** what is over: the rounds and the probes, as the result gives them */
  rounds: [],
  probes: [],
  done: false,
});

/** The steps the screen is on (the round's or the probe's), and its plank. */
export function cycleNow(spec, s) {
  return s.part === 'round' ? roundAt(spec, s.ri) : probeAt(spec, s.pi);
}

/**
 * One move of the experiment.
 *   { type: 'say', n }     round: he says how many cells will be left on the next gap
 *   { type: 'shown' }      round: the world has grown the gap and laid what fits
 *   { type: 'next' }       the next round, the first probe, the next probe, or the end
 *   { type: 'max', n }     probe: the most cells this plank will leave (null clears it)
 *   { type: 'same', v }    probe: will b cells be left once? (true / false)
 *   { type: 'grow' }       probe: both are said — the world starts growing the gap
 *   { type: 'tick' }       probe: the world has added one cell
 * A move that does not belong to the stage changes nothing.
 */
export function cycleReducer(spec, s, action) {
  const now = cycleNow(spec, s);
  const last = now.steps.length - 1;
  switch (action.type) {
    case 'say': {
      if (s.part !== 'round' || s.stage !== 'guess' || !Number.isInteger(action.n) || action.n < 0) return s;
      return { ...s, stage: 'lay', pending: action.n };
    }
    case 'shown': {
      if (s.part !== 'round' || s.stage !== 'lay') return s;
      const i = s.i + 1;
      const guesses = [...s.guesses, { a: now.steps[i].a, said: s.pending }];
      if (i < last) return { ...s, i, stage: 'guess', guesses, pending: null };
      const round = {
        b: now.b,
        from: now.from,
        steps: now.steps.map((st, k) => ({ a: st.a, r: st.r, said: k === 0 ? null : guesses[k - 1].said })),
      };
      return { ...s, i, stage: 'seen', guesses, pending: null, rounds: [...s.rounds, round] };
    }
    case 'max': {
      if (s.part !== 'probe' || s.stage !== 'ask') return s;
      return { ...s, max: Number.isInteger(action.n) && action.n >= 0 ? action.n : null };
    }
    case 'same': {
      if (s.part !== 'probe' || s.stage !== 'ask' || typeof action.v !== 'boolean') return s;
      return { ...s, same: action.v };
    }
    case 'grow': {
      if (s.part !== 'probe' || s.stage !== 'ask' || s.max === null || s.same === null) return s;
      return { ...s, stage: 'run', i: 0 };
    }
    case 'tick': {
      if (s.part !== 'probe' || s.stage !== 'run') return s;
      const i = s.i + 1;
      if (i < last) return { ...s, i };
      const probe = { b: now.b, from: now.start, max: largestLeft(now.b), said: { max: s.max, same: s.same } };
      return { ...s, i, stage: 'seen', probes: [...s.probes, probe] };
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      const fresh = { i: 0, guesses: [], pending: null, max: null, same: null };
      if (s.part === 'round' && s.ri + 1 < spec.rounds.length) return { ...s, ...fresh, ri: s.ri + 1, stage: 'guess' };
      const pi = s.part === 'round' ? 0 : s.pi + 1;
      if (pi < (spec.probes ?? []).length) return { ...s, ...fresh, part: 'probe', pi, stage: 'ask' };
      return { ...s, done: true };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const cycleResult = (s) => ({ rounds: s.rounds, probes: s.probes });

/** Did he say the two facts of a probe as the world then showed them? (b cells are never left) */
export const probeSaid = (probe) => ({
  max: probe.said.max === probe.max,
  same: probe.said.same === false,
});
