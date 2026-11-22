/**
 * Deterministic random numbers for everything a lesson GENERATES (waves, sessions, exam subjects, cases) — PURE.
 * A generator takes `rand` (a function returning a number in [0, 1)); the tests pass `rng(seed)` and replay the same content.
 */

/** mulberry32: the same seed gives the same sequence on every machine. */
export function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** A whole number between lo and hi, both included. */
export const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

export const pick = (rand, list) => list[Math.floor(rand() * list.length)];

/** A shuffled COPY of the list (Fisher–Yates). */
export function shuffle(rand, list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
