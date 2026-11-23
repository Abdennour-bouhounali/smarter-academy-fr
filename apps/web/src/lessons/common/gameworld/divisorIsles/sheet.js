/**
 * THE INVESTIGATION `sheet` of this world — pure logic and the state machine of its screen (screen: `InquirySheet.jsx`,
 * mounted by `Inquiry.jsx`; contract: GAME_WORLD.md « Explore », spec shape of `sheet`).
 *
 * A number too large to try by hand, and a SPREADSHEET: column A holds the primes 2, 3, 5, 7, 11… — as far as the
 * lesson's stop says (by default, every prime p with p² ⩽ the number now on the sheet) —, column B the remainder of the
 * number by A (the formula « =MOD(n;A2) » filled down; the world fills it). He clicks the line he reads as dividing:
 *   - a line whose remainder is 0 divides: the number becomes the quotient, a notebook line « 2431 ÷ 11 = 221 » is
 *     written and the sheet is filled again for the quotient (with the default stop, it is SHORTER);
 *   - a line whose remainder is not 0: that remainder is what happened (the line is marked), nothing changes.
 * When he reads no 0 he SAYS the number is prime: accepted when no line of the sheet has the remainder 0 (the number
 * joins the factors and the round ends), refused when one has (those lines are shown — the fact, never a word « faux »).
 * A quotient of 1 also ends the round.
 *
 * Every move is kept in order, with the sheet it was made on — the evidence a forge refutes a wrong rule with.
 * A move that does not belong to the stage changes nothing. Nothing here states a rule.
 */
import { isPrime } from './factorLadder';

/** The most lines a sheet may hold: two blocks of 12 lines fit the forge's screen at 1366 × 768. */
export const MAX_LINES = 24;

/** The primes up to `max`, increasing. */
export function primesUpTo(max) {
  const out = [];
  for (let p = 2; p <= max; p += 1) if (isPrime(p)) out.push(p);
  return out;
}

/**
 * How far column A goes for the number n: `stop` is 'square' (default — every prime p with p² ⩽ n), a number (every
 * prime up to it, whatever n), or a function n → that number (the lesson's own stop).
 */
export function stopOf(n, stop = 'square') {
  if (stop === 'square') return Math.floor(Math.sqrt(n));
  if (typeof stop === 'function') return stop(n);
  if (Number.isInteger(stop) && stop >= 2) return stop;
  throw new RangeError(`sheet: the stop ${stop}`);
}

/** The lines of the sheet for n: [{ p, r }] — column A the prime, column B the remainder of n by it. */
export function sheetOf(n, stop) {
  if (!Number.isInteger(n) || n < 2) throw new RangeError(`sheet: the number ${n}`);
  const lines = primesUpTo(stopOf(n, stop)).map((p) => ({ p, r: n % p }));
  if (lines.length > MAX_LINES) throw new RangeError(`sheet: ${lines.length} lines for ${n} (at most ${MAX_LINES})`);
  return lines;
}

/** The primes of the sheet whose remainder is 0. */
export const zerosOf = (lines) => lines.filter((l) => l.r === 0).map((l) => l.p);

// stage  fill (the world fills column B, line by line) → pick (he clicks a line, or says « prime ») → fill … → seen
const sheetRound = (ri, n) => ({ ri, n, stage: 'fill', filled: 0, last: null, attempts: [], factors: [] });
export const initSheet = (spec) => ({ ...sheetRound(0, spec.rounds[0].n), rounds: [], done: false });

/** The round on screen: its first number, the number now on the sheet, its lines, the stop. */
export function sheetNow(spec, s) {
  const r = spec.rounds[s.ri];
  const stop = r.stop ?? spec.stop ?? 'square';
  // a round that ended on the quotient 1 has no sheet left to show
  return { n0: r.n, n: s.n, lines: s.n === 1 ? [] : sheetOf(s.n, stop), stop };
}

const ended = (now, s) => ({
  ...s,
  stage: 'seen',
  rounds: [...s.rounds, { n: now.n0, factors: s.factors, attempts: s.attempts }],
});

/**
 * One move:  { type: 'tick' }      the world fills one more cell of column B
 *            { type: 'line', p }   he clicks the line of the prime p
 *            { type: 'prime' }     he says the number is prime
 *            { type: 'next' }      the next round, or the end
 * An attempt: { type: 'line', before, p, r, held, after, lines, zeros } | { type: 'prime', before, held, lines, zeros }
 *   (lines = how many lines the sheet held then; zeros = its primes with the remainder 0 then).
 */
export function sheetReducer(spec, s, action) {
  const now = sheetNow(spec, s);
  switch (action.type) {
    case 'tick': {
      if (s.stage !== 'fill') return s;
      const filled = s.filled + 1;
      return { ...s, filled, stage: filled >= now.lines.length ? 'pick' : 'fill' };
    }
    case 'line': {
      if (s.stage !== 'pick') return s;
      const line = now.lines.find((l) => l.p === action.p);
      if (!line) return s;
      const held = line.r === 0;
      const after = held ? s.n / line.p : s.n;
      const a = { type: 'line', before: s.n, p: line.p, r: line.r, held, after, lines: now.lines.length };
      const kept = { ...a, zeros: zerosOf(now.lines) };
      const next = { ...s, last: kept, attempts: [...s.attempts, kept] };
      if (!held) return next;
      const factors = [...s.factors, line.p];
      if (after === 1) return ended(now, { ...next, n: after, factors });
      return { ...next, n: after, factors, stage: 'fill', filled: 0 };
    }
    case 'prime': {
      if (s.stage !== 'pick') return s;
      const zeros = zerosOf(now.lines);
      const a = { type: 'prime', before: s.n, held: zeros.length === 0, lines: now.lines.length, zeros };
      const next = { ...s, last: a, attempts: [...s.attempts, a] };
      if (!a.held) return next;
      return ended(now, { ...next, factors: [...s.factors, s.n] });
    }
    case 'next':
      if (s.stage !== 'seen') return s;
      if (s.ri + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...sheetRound(s.ri + 1, spec.rounds[s.ri + 1].n) };
    default:
      return s;
  }
}
export const sheetResult = (s) => ({ rounds: s.rounds });

const isInt = (x) => Number.isInteger(x);
const productOf = (xs) => xs.reduce((p, x) => p * x, 1);
const isFactors = (xs) => Array.isArray(xs) && xs.every((x) => isInt(x) && x >= 2);

/**
 * A kept state (the workshop's bench, `spec.from`) read back for THIS spec: the state to start from, or null when it is
 * not one of this spec's states (other numbers, another kind, a broken save) — it is then ignored, never trusted.
 * Its finished rounds are this spec's rounds with their factors; the number on the sheet is what is left of the round's
 * number; a sheet the world was still filling when he left is filled now; a finished game shows its last round again.
 */
export function sheetFrom(spec, from) {
  const s = from;
  const rounds = spec?.rounds;
  if (!s || typeof s !== 'object' || !Array.isArray(rounds)) return null;
  if (!isInt(s.ri) || s.ri < 0 || s.ri >= rounds.length) return null;
  if (!['fill', 'pick', 'seen'].includes(s.stage)) return null;
  if (!Array.isArray(s.attempts) || !isFactors(s.factors) || !Array.isArray(s.rounds)) return null;
  const seen = s.stage === 'seen';
  if (s.rounds.length !== s.ri + (seen ? 1 : 0)) return null;
  const roundsOk = s.rounds.every(
    (r, i) => r && r.n === rounds[i].n && isFactors(r.factors) && productOf(r.factors) === r.n,
  );
  if (!roundsOk) return null;
  const n0 = rounds[s.ri].n;
  if (!isInt(s.n) || s.n < 1 || n0 % s.n !== 0) return null;
  if (productOf(s.factors) * (seen ? 1 : s.n) !== n0) return null;
  if (!seen && s.n === 1) return null;
  const back = { ...s, done: false, filled: isInt(s.filled) && s.filled >= 0 ? s.filled : 0 };
  let now;
  try {
    now = sheetNow(spec, back);
  } catch {
    return null; // a sheet this spec cannot draw (its stop, its size)
  }
  return back.stage === 'fill' ? { ...back, stage: 'pick', filled: now.lines.length } : back;
}

/** Where the sheet starts: the bench's kept state when it is one of this spec's (`sheetFrom`), else a fresh sheet. */
export const startSheet = (spec) => sheetFrom(spec, spec.from) ?? initSheet(spec);
