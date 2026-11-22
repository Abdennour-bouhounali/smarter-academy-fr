/**
 * THE INVESTIGATION `part` — PURE logic (screen: `InquiryPart.jsx`; contract: GAME_WORLD.md « استكشف », « spec shapes of
 * `measure` and `part` »). ONE strip, the whole, with a part painted in strokes the world paints one after the other: he
 * writes the fraction painted (cells over cells); then he picks a plank that fills the painted part AND the whole — the
 * strip is RE-CUT in that unit: the painted length does not move, the cuts and the writing do.
 *
 *   paint   the world paints the strokes one after the other (a fact).
 *   write   he writes the fraction painted in its template (two boxes over a bar); a miss is answered by the count.
 *   pick    he lays a plank: one that does not fill the part and the whole is laid and what is left shows; one that
 *           does re-cuts the strip. He may instead claim that no plank but 1 fills both: the world tries the planks of
 *           the painted part on the whole.
 *
 * The screen is a pure view of this file's reducer, so the whole experiment is played and tested without a browser.
 */
import { plankOn } from './summit';
import { checkOf, countAgain } from './measure';

/** The numbers of a round: the whole, the strokes, the painted part. Throws on a round that cannot be drawn. */
export function partOf(round) {
  const { whole, strokes } = round;
  const painted = (strokes ?? []).reduce((t, k) => t + k, 0);
  if (
    !(Number.isInteger(whole) && whole > 1) ||
    !strokes?.length ||
    !strokes.every((k) => Number.isInteger(k) && k > 0)
  )
    throw new RangeError(`part: ${whole} ${strokes}`);
  if (painted >= whole) throw new RangeError(`part: painted ${painted} of ${whole}`);
  return { whole, strokes, painted };
}

/**
 * The strip re-cut in the unit d (cells per new cut): where the cuts stand (in cells, from the start, the end included)
 * and where the painted part ends — the same cell as before (it never moves); null when d does not fill both.
 */
export function recutOf(painted, whole, d) {
  const to = countAgain(painted, whole, d);
  if (!to) return null;
  return { to, cuts: Array.from({ length: to[1] }, (_, k) => (k + 1) * d), paintedEnd: to[0] * d };
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// paint → (tick per stroke) → write → pick → lay → seen (a plank that fills both) | pick (one that does not)
//                                          pick →(none) checkRun → pick (a plank fills both) | seen (none does)

export function partNow(spec, s) {
  const r = spec.rounds[s.ri];
  return { ...partOf(r), chips: r.chips ?? spec.chips ?? null };
}

function roundState(spec, ri) {
  partNow(spec, { ri }); // throws early on a round that cannot be drawn
  return {
    ri,
    stage: 'paint',
    /** the strokes painted so far */
    shown: 0,
    /** what he wrote: [{ p, q, ok }] */
    writes: [],
    /** every plank laid: [{ d, fills }] */
    tried: [],
    /** the plank lying on the strip now ({ d, ...plankOn }) or null */
    last: null,
    /** the unit of the cuts (1 = cells) and the writing: [painted, whole] then [p, q] */
    cut: 1,
    writing: null,
    notice: null,
    pending: null,
    check: null,
    /** his claims « no plank but 1 fills both », each with the plank the world found (null: none) */
    claims: [],
  };
}

export const initPart = (spec) => ({ ...roundState(spec, 0), rounds: [], done: false });

function seen(now, s) {
  const round = {
    whole: now.whole,
    strokes: now.strokes,
    writes: s.writes,
    tried: s.tried.map((t) => t.d),
    claims: s.claims,
    cut: s.cut,
    final: s.writing ?? [now.painted, now.whole],
  };
  return { ...s, stage: 'seen', rounds: [...s.rounds, round] };
}

/**
 * One move of the experiment.
 *   { type: 'tick' }           paint: the next stroke is painted · checkRun: the world tries its next plank
 *   { type: 'write', p, q }    write: the fraction painted (exactly the cells: painted over whole)
 *   { type: 'try', d }         pick: he lays a plank of d cells (2 … the whole; another length is a notice)
 *   { type: 'shown' }          lay: the world has laid it
 *   { type: 'none' }           pick: his claim « no plank but 1 fills both » — the world checks
 *   { type: 'next' }           seen: the next round, or the end
 * A move that does not belong to the stage changes nothing.
 */
export function partReducer(spec, s, action) {
  const now = partNow(spec, s);
  switch (action.type) {
    case 'tick': {
      if (s.stage === 'paint') {
        const shown = s.shown + 1;
        return shown < now.strokes.length ? { ...s, shown } : { ...s, shown, stage: 'write' };
      }
      if (s.stage === 'checkRun') {
        const check = { ...s.check, shown: Math.min(s.check.shown + 1, s.check.tried.length) };
        if (check.shown < check.tried.length) return { ...s, check };
        const claims = [...s.claims, { found: check.found }];
        if (check.found !== null) return { ...s, check, claims, stage: 'pick' };
        return seen(now, { ...s, check, claims });
      }
      return s;
    }
    case 'write': {
      if (s.stage !== 'write') return s;
      const { p, q } = action;
      if (![p, q].every((x) => Number.isInteger(x) && x > 0)) return s;
      const ok = p === now.painted && q === now.whole;
      const writes = [...s.writes, { p, q, ok }];
      if (!ok) return { ...s, writes };
      return { ...s, writes, stage: 'pick', writing: [now.painted, now.whole] };
    }
    case 'try': {
      if (s.stage !== 'pick') return s;
      const { d } = action;
      if (!Number.isInteger(d) || d < 2 || d > now.whole)
        return { ...s, notice: { kind: 'bound', d: Number.isInteger(d) ? d : 0 } };
      return { ...s, stage: 'lay', pending: d, notice: null, check: null };
    }
    case 'shown': {
      if (s.stage !== 'lay') return s;
      const d = s.pending;
      const last = plankOn(now.painted, now.whole, d);
      const tried = [...s.tried, { d, fills: last.both }];
      if (!last.both) return { ...s, stage: 'pick', pending: null, last, tried };
      return seen(now, { ...s, pending: null, last, tried, cut: d, writing: recutOf(now.painted, now.whole, d).to });
    }
    case 'none': {
      if (s.stage !== 'pick') return s;
      return {
        ...s,
        stage: 'checkRun',
        notice: null,
        check: { ...checkOf(now.painted, now.whole), shown: 0 },
      };
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
export const partResult = (s) => ({ rounds: s.rounds });
