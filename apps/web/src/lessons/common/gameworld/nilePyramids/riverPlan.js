/**
 * The pyramids world — THE GEOMETER'S PLAN of stage 3 (the river seen from above). Pure: the law of the string and the
 * places of the drawing; `RiverPlan.jsx` draws it, `Game.js › plantR` carries it out.
 *
 *   He places R on the line drawn inland from E. A string is stretched from R over the stake S and across the river:
 *   it reaches the far bank ON the post F, to its left or to its right — a thing he SEES (owner, 2026-11-27: the walk
 *   « until S hides F in Zero's eye » was refused — no step asks an alignment that is not drawn on the screen).
 *
 * The plan is drawn with two scales (one along the bank, one across the river): at one scale the river is a needle
 * (AF = 416 m beside SE = 9 m). Two scales keep what the step shows — points in line stay in line, parallels stay
 * parallel, and the ratios along each direction are the true ones.
 */
import { approx, riverWidth } from './logic';

/** How far inland of E the stake R may stand, in metres: whole metres, one at a time. */
export const PLAN_ER = Object.freeze({ min: 20, max: 70, start: 30 });

/**
 * Where the string from R (`er` metres inland of E) over S reaches the far bank, in metres along the bank from S
 * towards A: AF × SE / ER (the two triangles round S). It is AS exactly when R is in line with S and F.
 */
export const landing = (river, er) => (approx(riverWidth(river)) * approx(river.SE)) / er;

/** The string against the post: 'on' F · 'left' of it (R too near the river) · 'right' of it (R too far). */
export function stringFact(river, er) {
  const c = er - approx(river.ER);
  return c === 0 ? 'on' : c < 0 ? 'left' : 'right';
}

/** The drawing: 1000 × 500, the far bank on top, A on the left of S, the land below. */
export const PLAN_BOX = Object.freeze({ w: 1000, h: 500, far: 44, ax: 380 });

/** The places of the plan's points for a stake R at `er` metres, and of the string's end on the far bank. */
export function planPoints(river, er) {
  const { h, far, ax } = PLAN_BOX;
  const along = 6.2; // px per metre along the bank
  const across = (h - far - 100) / approx(riverWidth(river)); // px per metre across the river
  const bank = far + approx(riverWidth(river)) * across;
  const sx = ax + approx(river.AS) * along;
  const ex = sx + approx(river.SE) * along;
  return {
    bank,
    A: { x: ax, y: bank },
    F: { x: ax, y: far },
    S: { x: sx, y: bank },
    E: { x: ex, y: bank },
    R: { x: ex, y: bank + er * across },
    /** the end of the inland line from E, where R may go furthest */
    end: { x: ex, y: bank + PLAN_ER.max * across },
    /** where the string touches the far bank (it may leave the plan on the left: the drawing clips it) */
    T: { x: sx - landing(river, er) * along, y: far },
    across,
  };
}

/** The metres inland of E for a height on the drawing (a pointer dragging R), kept in the allowed whole metres. */
export function erAt(river, y) {
  const p = planPoints(river, PLAN_ER.min);
  const er = Math.round((y - p.bank) / p.across);
  return Math.min(PLAN_ER.max, Math.max(PLAN_ER.min, er));
}
