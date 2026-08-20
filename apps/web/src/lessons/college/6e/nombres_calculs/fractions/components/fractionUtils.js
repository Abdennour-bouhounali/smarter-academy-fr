// Geometry and formatting helpers shared by every Fraction Lab component.
// The pizza is a mathematical object first: for N equal slices, each slice
// spans exactly 360/N degrees, and every visual (cuts, selection, labels,
// hit-testing) is derived from the same angle math — nothing is eyeballed.

export const PIZZA_CX = 100;
export const PIZZA_CY = 100;
export const PIZZA_R = 88;

/** Angle 0 = 12 o'clock, increasing clockwise (matches how a clock face is read). */
export function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Full pie-wedge path (center → arc → back to center) for one slice. */
export function slicePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** Just the rim arc (no straight edges) — used to draw the crust ring per slice. */
export function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function bisector(startAngle, endAngle) {
  return (startAngle + endAngle) / 2;
}

/** Inverse of polarToCartesian: a point offset (dx,dy) from the pizza center → its angle in [0,360). */
export function angleFromPoint(dx, dy) {
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return deg;
}

/** N equal boundaries starting at 0°, e.g. equalAngles(4) → [{start:0,end:90}, ...]. */
export function equalAngles(n) {
  const step = 360 / n;
  return Array.from({ length: n }, (_, i) => ({ start: i * step, end: (i + 1) * step }));
}

/** Deterministic pseudo-random in [0,1) — stable topping layout across re-renders. */
export function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function normalizeAngle(a) {
  return ((a % 360) + 360) % 360;
}

/** The representation of `angle` (mod 360) nearest to `ref` — for smooth incremental dragging. */
export function unwrapNear(angle, ref) {
  let a = angle;
  while (a - ref > 180) a -= 360;
  while (a - ref < -180) a += 360;
  return a;
}

/** The representation of `angle` (mod 360) in [ref - 360, ref) — "just before ref". */
export function unwrapBelow(angle, ref) {
  const a = normalizeAngle(angle - ref);
  return ref + (a - 360);
}

/** The representation of `angle` (mod 360) in [ref, ref + 360) — "just after ref". */
export function unwrapAbove(angle, ref) {
  const a = normalizeAngle(angle - ref);
  return ref + a;
}

export function angleSpan(a) {
  return a.end - a.start;
}

export function isPartitionEqual(angles, toleranceDeg = 0.5) {
  if (angles.length < 2) return true;
  const spans = angles.map(angleSpan);
  const ref = spans[0];
  return spans.every((s) => Math.abs(s - ref) <= toleranceDeg);
}

const FRACTION_WORDS = {
  2: 'demi', 3: 'tiers', 4: 'quart', 5: 'cinquième',
  6: 'sixième', 7: 'septième', 8: 'huitième', 9: 'neuvième',
  10: 'dixième', 12: 'douzième',
};

export function partName(n, plural = false) {
  const word = FRACTION_WORDS[n] || `${n}-ième`;
  if (!plural) return word;
  return word === 'demi' || word.endsWith('s') ? `${word}s` : `${word}s`;
}

/** LaTeX fraction, e.g. texFrac(3,4) → "$\\dfrac{3}{4}$" for <MathText>. */
export function texFrac(n, d) {
  return `$\\dfrac{${n}}{${d}}$`;
}

export function formatFraction(n, d) {
  return `${n}/${d}`;
}

/**
 * Tick-label formatter for <NumberLine format={...}>: a graduation at value
 * v on a line divided into `den`-ths reads as a whole number when it lands
 * exactly on one ("1" not "4/4"), else as "n/den".
 */
export function fracLineFormat(den) {
  return (v) => {
    const n = Math.round(v * den);
    return n % den === 0 ? String(n / den) : `${n}/${den}`;
  };
}
