/**
 * THE PLAQUE — a final mission (`story.mission`) whose answer is a FRACTION written in irreducible form
 * (`mission.write = { calc: { x, y, op, z, w }, p, q }`; screen `Mission.jsx`, world `walkwayGame.js`; contract:
 * GAME_WORLD.md « THE FINAL MISSION »). Pure: what the calculation gives, and what a written fraction IS against it —
 * the story writes the sentence (a refusal names no number). Nothing here states a rule.
 */

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const nat = (x) => Number.isInteger(x) && x >= 0;
const OPS = {
  '*': (x, y, z, w) => [x * z, y * w],
  '+': (x, y, z, w) => [x * w + z * y, y * w],
  '-': (x, y, z, w) => [x * w - z * y, y * w],
};

/** The calculation x/y op z/w, unreduced: [A, B] (the same as `kit/claims.js` computes it for a `fraction` claim). */
export function resultOf(calc) {
  const { x, y, op, z, w } = calc ?? {};
  if (!Object.hasOwn(OPS, op) || ![x, y, z, w].every(nat) || y === 0 || w === 0)
    throw new RangeError(`plaque: the calculation ${JSON.stringify(calc)}`);
  const [A, B] = OPS[op](x, y, z, w);
  if (A < 0) throw new RangeError('plaque: a negative result');
  return [A, B];
}

/** The result in irreducible form. */
export function reducedOf(calc) {
  const [A, B] = resultOf(calc);
  const g = gcd(A, B);
  return [A / g, B / g];
}

/** A `write` the kit can play: its p/q is the calculation's result, irreducible — else it throws (a story's slip). */
export function checkWrite(write) {
  const [p, q] = reducedOf(write.calc);
  if (write.p !== p || write.q !== q) throw new RangeError(`plaque: ${write.p}/${write.q} is not ${p}/${q}`);
  return write;
}

const read = (v) => {
  const t = String(v ?? '')
    .replace(/[\s  ]/g, '')
    .trim();
  if (t === '') return { empty: true };
  return /^\d{1,9}$/.test(t) ? { n: Number(t) } : { nan: true };
};

/**
 * What the fraction typed IS (boxes `slots.p` over `slots.q`, default 'p' and 'q'):
 *   { kind: 'empty' }           a box is empty
 *   { kind: 'nan' }             not a whole number, or a denominator 0
 *   { kind: 'other', P, Q }     not the calculation's result (P × B ≠ A × Q)
 *   { kind: 'notReduced', P, Q } the result, but it can still be written with smaller numbers (PGCD(P ; Q) > 1)
 *   { kind: 'ok', P, Q }        the result, irreducible
 */
export function writingOf(write, values, slots = { p: 'p', q: 'q' }) {
  const a = read(values?.[slots.p]);
  const b = read(values?.[slots.q]);
  if (a.empty || b.empty) return { kind: 'empty' };
  if (a.nan || b.nan || b.n === 0) return { kind: 'nan' };
  const [A, B] = resultOf(write.calc);
  const P = a.n;
  const Q = b.n;
  if (P * B !== A * Q) return { kind: 'other', P, Q };
  return { kind: gcd(P, Q) === 1 ? 'ok' : 'notReduced', P, Q };
}

/** The plaque's one line: a fraction box, two boxes over a bar (the kit's `UseLines` token). */
export const plaqueLines = (w = 4) => [{ tokens: [{ frac: { n: { slot: 'p', w }, d: { slot: 'q', w } } }] }];
