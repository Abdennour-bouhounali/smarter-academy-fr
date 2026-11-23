/**
 * THE MODE `factor` OF THE INVESTIGATION `ladder` — pure logic and the state machine of its screen (screen:
 * `InquiryFactor.jsx`, mounted by `InquiryGcd.jsx › Ladder` when `spec.mode === 'factor'`; contract: GAME_WORLD.md
 * « Explore », spec shape of `ladder · factor`). A gap of n cells is filled by planks of d when d divides n.
 *
 * ONE gap (not a pair). He takes a plank from a RACK (the lesson's planks: 2, 3, 4, 5, 6, 7, 9, 11…, each ≥ 2) and the
 * world lays it on the gap:
 *   - it HOLDS (d divides the gap): the gap becomes the quotient — the count of planks laid — and a notebook line
 *     « 72 ÷ 2 = 36 » is written;
 *   - it FALLS (d does not divide the gap): the gap stays as it was; the attempt is kept.
 * A plank stays on the rack after it held: he may (must) take it again. The round ends when the gap is 1; the planks that
 * held stand in a row, in the order he laid them. Every attempt, held or fell, is kept in order with the gap before and
 * after it — the evidence a forge refutes a wrong rule with (his own rows).
 *
 * A move that does not belong to the stage changes nothing. Nothing here states a rule.
 */

const plank = (d) => Number.isInteger(d) && d >= 2;

/** Is p a prime number? (trial division — the numbers of a lesson are small) */
export function isPrime(p) {
  if (!Number.isInteger(p) || p < 2) return false;
  for (let d = 2; d * d <= p; d += 1) if (p % d === 0) return false;
  return true;
}

/** The prime factors of n ≥ 2, increasing, each as often as it divides: 72 → [2, 2, 2, 3, 3]; 1 → []. */
export function primeFactors(n) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError(`primeFactors: ${n}`);
  const out = [];
  let m = n;
  for (let d = 2; d * d <= m; d += 1)
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  if (m > 1) out.push(m);
  return out;
}

/** One plank laid on the gap: { plank, held, before, after } — `after` is the quotient when it held, else the gap. */
export function layPlank(gap, d) {
  if (!Number.isInteger(gap) || gap < 2 || !plank(d)) throw new RangeError(`layPlank: ${gap} ${d}`);
  const held = gap % d === 0;
  return { plank: d, held, before: gap, after: held ? gap / d : gap };
}

/**
 * A factor ladder as a CASE of a forge (forgeParts.jsx › `c.factor`): the number n and the planks laid on it in order,
 * each dividing what the ones before left. → { rungs: [{ plank, before, after }], left } (left = what is left, 1 when the
 * ladder went to the end). A plank that does not divide what is left is refused: a ladder only lays planks that held.
 */
export function factorRungs(n, planks) {
  if (!Number.isInteger(n) || n < 2 || !Array.isArray(planks)) throw new RangeError(`factor: ${n} ${planks}`);
  let gap = n;
  const rungs = planks.map((d) => {
    const a = layPlank(gap, d);
    if (!a.held) throw new RangeError(`factor: the plank ${d} does not hold on ${gap} (in the ladder of ${n})`);
    gap = a.after;
    return { plank: d, before: a.before, after: a.after };
  });
  return { rungs, left: gap };
}

/**
 * The round the screen is on: its number n, its rack (the round's own, or the spec's). A round whose prime factors are
 * not all on its rack could never reach 1: refused (the lesson's test meets it, not a student).
 */
export function factorNow(spec, s) {
  const r = spec.rounds[s.ri];
  const rack = r.rack ?? spec.rack;
  if (!Number.isInteger(r.n) || r.n < 2) throw new RangeError(`ladder · factor: the gap ${r.n}`);
  if (!Array.isArray(rack) || !rack.length || !rack.every(plank) || new Set(rack).size !== rack.length)
    throw new RangeError(`ladder · factor: the rack ${rack}`);
  const missing = primeFactors(r.n).filter((p) => !rack.includes(p));
  if (missing.length) throw new RangeError(`ladder · factor: ${r.n} needs the planks ${[...new Set(missing)]}`);
  return { n: r.n, rack, gap: s.gap ?? r.n };
}

// stage  pick (he takes a plank) → lay (the world lays it) → pick … → (the gap is 1) seen
const factorRound = (ri, n) => ({ ri, stage: 'pick', gap: n, hand: null, attempts: [] });
export const initFactor = (spec) => ({ ...factorRound(0, spec.rounds[0].n), rounds: [], done: false });

/** The planks that held, in the order he laid them (the attempts that held). */
export const laidOf = (attempts) => attempts.filter((a) => a.held).map((a) => a.plank);

/** The planks of the rack that already FELL on the gap now on screen (a fact of his tries on that gap, nothing more). */
export const fellHere = (s) => [
  ...new Set(s.attempts.filter((a) => !a.held && a.before === s.gap).map((a) => a.plank)),
];

/**
 * One move:  { type: 'take', d }  a plank of the rack: the world starts laying it
 *            { type: 'shown' }    the plank is on the gap: it held (the gap is the quotient) or it fell
 *            { type: 'next' }     the next round, or the end
 */
export function factorReducer(spec, s, action) {
  const now = factorNow(spec, s);
  switch (action.type) {
    case 'take':
      if (s.stage !== 'pick' || !now.rack.includes(action.d)) return s;
      return { ...s, stage: 'lay', hand: action.d };
    case 'shown': {
      if (s.stage !== 'lay') return s;
      const a = layPlank(s.gap, s.hand);
      const attempts = [...s.attempts, a];
      const next = { ...s, attempts, gap: a.after, hand: null };
      if (a.after > 1) return { ...next, stage: 'pick' };
      return {
        ...next,
        stage: 'seen',
        rounds: [
          ...s.rounds,
          { n: now.n, planks: laidOf(attempts), attempts, fell: attempts.length - laidOf(attempts).length },
        ],
      };
    }
    case 'next':
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...factorRound(s.ri + 1, spec.rounds[s.ri + 1].n) };
    default:
      return s;
  }
}
export const factorResult = (s) => ({ rounds: s.rounds });
