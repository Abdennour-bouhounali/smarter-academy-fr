/**
 * Helpers the lessons' TESTS need and no screen does (defects.md D8: they live here, beside the suites).
 */
import { equal, read, times } from '../../exact';

/** a / b = c / d, by the cross products (no division, no float): a × d = b × c. Every denominator must be ≠ 0. */
export function sameRatio([a, b], [c, d]) {
  if (read(b).n === 0n || read(d).n === 0n) throw new Error('exact: a ratio has a denominator 0');
  return equal(times(a, d), times(b, c));
}

/** Are all these ratios equal? `chainHolds([AM, AB], [AN, AC], [MN, BC])` — Thalès's three ratios, exactly. */
export const chainHolds = (first, ...rest) => rest.every((r) => sameRatio(first, r));
