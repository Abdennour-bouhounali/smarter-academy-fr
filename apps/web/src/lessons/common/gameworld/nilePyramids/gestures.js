/**
 * The pyramids world — THE ONE GESTURE (PYRAMIDS_WORLD_PLAN §2.1, gate cut 1): a SLIDE of the knotted rope along a line marked
 * with knots — along the ground from a stake, up a pyramid's edge on the built steps, inland from the bank, the stick
 * along the shadow's axis. He takes the end with E at a stake; ← → move the knot: a tap is one knot, a key held goes
 * faster and faster (`logic.js › knotRate`). His slide IS the length (`play.md` §4).
 *
 * Pure: a slide is plain data, `slideStep` / `slideTap` return a new one. The rope TIES to the stake it was taken
 * towards when he lets the keys go on that stake's knot (`tied`). He may put the rope down whenever he wants.
 */
import { knotRate } from './logic';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * A rope taken at `from` (x, y, z) along the unit direction `dir`, `max` knots long at most (what is built or lies on
 * the ground stops it), towards the stake at `target` knots (null: no stake on this line). `top`: the stage's top speed.
 */
export function slide({ id, from, dir, max, target = null, top }) {
  const l = Math.hypot(dir.x, dir.y ?? 0, dir.z) || 1;
  return {
    id,
    from: { x: from.x, y: from.y ?? 0, z: from.z },
    dir: { x: dir.x / l, y: (dir.y ?? 0) / l, z: dir.z / l },
    max,
    target,
    top,
    pos: 0,
    held: 0,
    way: 0,
  };
}

/** The knot he stands on now (a whole number of metres). */
export const knotsOf = (s) => Math.round(s.pos);

/** One step of time with the keys as they are: `way` -1 (←), 0 or 1 (→). Released, the rope settles on its knot. */
export function slideStep(s, way, dt) {
  if (!way) return s.held || s.way ? { ...s, held: 0, way: 0, pos: knotsOf(s) } : s;
  const held = s.way === way ? s.held + dt : 0;
  const pos = clamp(s.pos + way * knotRate(held, s.top) * dt, 0, s.max);
  return { ...s, held, way, pos };
}

/** A tap: one knot, at once. */
export const slideTap = (s, way) => ({ ...s, pos: clamp(knotsOf(s) + way, 0, s.max) });

/** The point of the line at `knots` (default: where the knot is now) — for drawing. */
export function slidePoint(s, knots = s.pos) {
  return { x: s.from.x + s.dir.x * knots, y: s.from.y + s.dir.y * knots, z: s.from.z + s.dir.z * knots };
}

/** The keys are let go on the stake's knot: the rope ties there. */
export const tied = (s) => s.target != null && !s.way && knotsOf(s) === s.target;
