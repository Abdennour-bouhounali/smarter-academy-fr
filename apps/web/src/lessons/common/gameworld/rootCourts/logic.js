/**
 * « Le palais des dalles » — THE LAW OF THE WORLD (pure; it names no lesson).
 *
 * A COURT is a square whose area is known, in tiles. A ROD is a length: a number (`rod('5,47')`), or the wall of a
 * court — the length whose square is that court's area, which may have no number (`wall(30)`). The world builds a
 * square platform on the rod and lowers it into the court:
 *   it RIDES the court's lift when it covers the court exactly;
 *   it leaves a BAND when it is smaller (the band's area is what the court holds more);
 *   it JAMS on the rim when it is larger (what sticks out is what it holds more).
 * Everything is EXACT (fractions of BigInt): 29,99999 is never taken for 30. A number is written as text everywhere
 * outside this file — « 30 », « 5,47 », « 49/64 » — so that a save, a log and a forge's case stay plain data.
 */
import { read, write, tex, compare, equal, square, times, minus, magnitude, approx, isDecimal, of } from '../kit/exact';

// The exact numbers are the kit's (`kit/exact.js`, PYRAMIDS_WORLD_PLAN K-e): re-exported so that this world's readers
// keep importing them from here.
export { read, write, tex, compare, equal, square, times, minus, magnitude, approx, isDecimal };
const big = (x) => BigInt(x);

// ───────────────────────────── rods ─────────────────────────────
/** A rod whose length is a number. */
export const rod = (length) => ({ q: write(length) });
/** The wall of a court of area `area`: the length whose square is that area. It may have no number. */
export const wall = (area) => ({ root: write(area) });
export const isWall = (r) => r.root != null;
/** The area of the square platform built on a rod — exact. */
export const platform = (r) => (isWall(r) ? read(r.root) : square(r.q));
/** The rod's length for DRAWING only. */
export const lengthOf = (r) => (isWall(r) ? Math.sqrt(approx(r.root)) : Math.abs(approx(r.q)));
/** A rod as it is written: its number, or the sign over its court's area. */
export const rodText = (r) => (isWall(r) ? `√${r.root}` : r.q);
export const rodTex = (r) => (isWall(r) ? `\\sqrt{${tex(r.root)}}` : tex(r.q));
/** The exact root of a number when it HAS one among the numbers (36 → « 6 », 49/64 → « 7/8 », 0,25 → « 0,5 »), else null. */
export function rootOf(area) {
  const { n, d } = read(area);
  if (n < 0n) return null;
  const isqrt = (v) => {
    if (v < 2n) return v;
    let x = big(Math.floor(Math.sqrt(Number(v))));
    while (x * x > v) x -= 1n;
    while ((x + 1n) * (x + 1n) <= v) x += 1n;
    return x;
  };
  const [p, q] = [isqrt(n), isqrt(d)];
  return p * p === n && q * q === d ? write(of(p, q)) : null;
}

/**
 * What the world does with a rod over a court of area `area`:
 *   { kind: 'ride' | 'band' | 'jam', covers, diff } — `covers` = the tiles the platform holds, `diff` = the band's area
 *   or what sticks out, both written as text.
 */
export function outcome(r, area) {
  const covers = platform(r);
  const c = compare(covers, area);
  return {
    kind: c === 0 ? 'ride' : c < 0 ? 'band' : 'jam',
    covers: write(covers),
    diff: write(magnitude(minus(area, covers))),
  };
}

/** The rod of a dial stopped at `steps` marks of `step` (« 0,1 », « 0,01 »…): no rounding, whatever the step. */
export const dialRod = (steps, step) => rod(times(String(steps), step));
