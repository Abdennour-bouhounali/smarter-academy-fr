/**
 * The pyramids world — THE LAW OF THE WORLD (pure; it names no lesson). Design: `docs/reports/PYRAMIDS_WORLD_PLAN.md` §1–§2.
 *
 * One unit is ONE METRE, everywhere (§1.5). Zero's hand holds a KNOTTED ROPE, a knot every metre: the rope lies on the
 * ground or on what is BUILT — never across the river, never in the air. What it reaches, he measures; what it cannot
 * reach, he COMPUTES and TYPES, and the world builds his number: the thing built is the verdict, one of three FACTS
 * (never « wrong »; no size of a gap is written in the world — gate P1).
 *
 * Every length that decides what the world does is EXACT (the kit's `kit/exact.js`: « 77,5 », « 5/6 »; never a float).
 * Floats exist here for DRAWING only (positions, the camera, the size of a label).
 */
import { read, write, compare, times, over, minus, plus, fourth, tryRead, approx } from '../kit/exact';
import { lenRoot } from './surd';

export { write, approx };

// ───────────────────────────── the five stages' numbers (§1.1, §3.3–§3.7) ─────────────────────────────

/**
 * The field: a triangular field ABC (cos A = 2/7, so every rope reads a whole knot) and its two canals from side
 * [AB] to side [AC]. The new canal is dug parallel to (BC); the old crooked one is not.
 */
/** The five docks, downstream — a stage's id is its place in the world, whatever the lesson plays. */
export const STAGE_IDS = Object.freeze(['field', 'workshop', 'river', 'summit', 'plateau']);
/**
 * The docks a story plays (`story.stages`, ids; none given: the five), as dock indexes in the order the felucca sails
 * them — always downstream, whatever order the story wrote. An unknown id is refused: a story never plays a dock the
 * world does not have. A dock off the route keeps its scenery and has no jetty, no step and no table.
 */
export function stageRoute(ids) {
  if (ids == null) return STAGE_IDS.map((_, i) => i);
  const route = [...new Set(ids)].map((id) => {
    const i = STAGE_IDS.indexOf(id);
    if (i < 0) throw new Error(`nilePyramids: the world has no stage « ${id} »`);
    return i;
  });
  if (!route.length) throw new Error('nilePyramids: a story plays one stage at least');
  return route.sort((a, b) => a - b);
}

export const FIELD = Object.freeze({
  AB: '63',
  AC: '72',
  BC: '81',
  cosA: '2/7',
  canals: Object.freeze([
    Object.freeze({ id: 'new', ends: ['M', 'N'], AM: '14', AN: '16', parallel: true }),
    Object.freeze({ id: 'old', ends: ['P', 'Q'], AM: '39', AN: '28', parallel: false }),
  ]),
});

/** The workshop: the unfinished pyramid, square base 99, lateral edge 90; its face SBC; course 1 at BM = 10. */
export const FACE = Object.freeze({ base: '99', edge: '90', courses: Object.freeze(['10', '20']), row: '55' });

/** The river: the stake S at 72 along the bank, E 9 further, R 52 inland — the far post F across the water (416). */
export const RIVER = Object.freeze({ AS: '72', SE: '9', ER: '52' });

/** The summit: the capstone of the same shape as the pyramid of the workshop, k = 1/36 (base 2,75, edges 2,5). */
export const CAPSTONE = Object.freeze({ k: '1/36' });

/** Ibn al-Haytham's box at noon: the box 177 m from the base edge, its wall 0,5 m behind the hole, the image 0,25 m. */
export const CAMERA_BOX = Object.freeze({ fromEdge: '177', depth: '0,5', image: '0,25' });

/** The plateau: the Great Pyramid (h 146, base 230), the 2 m stick, the morning sun of tan = 2/3. */
export const PLATEAU = Object.freeze({ h: '146', base: '230', stick: '2', tan: '2/3' });

/**
 * HOW ZERO TURNS (owner, 2026-11-24): ← → turn him by `step` degrees a press (`TURN_STEP_DEG`), held past `delay`
 * seconds at `rate` degrees a second; ↑ ↓ walk along his facing (`kit/steer.js › turnStep`, `Game.js › turnKeys`).
 */
const TURN_STEP_DEG = 5;
export const TURN = Object.freeze({ step: TURN_STEP_DEG, rate: 90, delay: 0.3 });

// ───────────────────────────── exact helpers of the world ─────────────────────────────

/** The exact square root of a rational, or null when it has none among the rationals. */
export function exactRoot(x) {
  const { n, d } = read(x);
  if (n < 0n) return null;
  const isqrt = (v) => {
    if (v < 2n) return v;
    let r = BigInt(Math.floor(Math.sqrt(Number(v))));
    while (r * r > v) r -= 1n;
    while ((r + 1n) * (r + 1n) <= v) r += 1n;
    return r;
  };
  const [p, q] = [isqrt(n), isqrt(d)];
  return p * p === n && q * q === d ? write(over(String(p), String(q))) : null;
}

/** The third side of a triangle from two sides and the cosine of their angle (al-Kashi), squared — exact. */
export const thirdSideSquared = (b, c, cos) =>
  minus(plus(times(b, b), times(c, c)), times(times('2', times(b, c)), cos));

// ───────────────────────────── stage 1: the field and its canals ─────────────────────────────

/** What the rope READS along a canal from M to N: its length, exact (a whole knot on this field). */
export function canalReading(field, canal) {
  const sq = thirdSideSquared(canal.AM, canal.AN, field.cosA);
  const root = exactRoot(sq);
  if (root == null) throw new Error(`nilePyramids: the canal ${canal.id} has no exact length`);
  return root;
}

/** The positions of the field's points for DRAWING, in the field's own plane: A at 0, [AB] along +u, C at angle A. */
export function fieldPoints(field) {
  const cos = approx(field.cosA);
  const sin = Math.sqrt(1 - cos * cos);
  const ab = approx(field.AB);
  const ac = approx(field.AC);
  const out = { A: { u: 0, v: 0 }, B: { u: ab, v: 0 }, C: { u: ac * cos, v: ac * sin } };
  for (const c of field.canals) {
    const am = approx(c.AM);
    const an = approx(c.AN);
    out[c.ends[0]] = { u: am, v: 0 };
    out[c.ends[1]] = { u: an * cos, v: an * sin };
  }
  return out;
}

// ───────────────────────────── stage 2: the face of the unfinished pyramid ─────────────────────────────

/** The course at a mark BM up the edge from the corner B: SM = SB − BM and its length MN = BC × SM / SB — exact. */
export function courseAt(face, BM) {
  const SM = minus(face.edge, BM);
  return { SM: write(SM), MN: write(over(times(face.base, SM), face.edge)) };
}

/** For drawing: the pyramid's height from its square base and its lateral edge (h² = edge² − base² / 2). */
export const pyramidHeight = (base, edge) => Math.sqrt(approx(edge) ** 2 - approx(base) ** 2 / 2);

// ───────────────────────────── stage 3: the river ─────────────────────────────

/** The width of the river AF: SE / SA = ER / AF, so AF is the fourth proportional — exact. */
export const riverWidth = (river) => write(fourth(river.SE, river.AS, river.ER));

/**
 * The river as a Thalès figure, ALL its lengths exact: a butterfly round the stake S (V = S, M = E, B = A, N = R,
 * C = F). Both lines stand square to the bank (the 3-4-5 rope), so the crooked sides are hypotenuses:
 * SR² = SE² + ER² = 2785 and SF² = SA² + AF² = 178240 = 64 × 2785 — SR = √2785, SF = 8√2785 (`surd.js`), and
 * SR / SF = 1/8 = SE / SA = ER / AF. Only what he MEASURED (and the width) is written on its drawing (`show`); the
 * drawing is schematic (`draw`: the same right angles, k = 1/3, legs 72 and 120) — at scale it is a needle.
 */
export function riverFigure(river) {
  const AF = riverWidth(river);
  const hyp = (a, b) => lenRoot(plus(times(a, a), times(b, b)));
  return {
    kind: 'butterfly',
    names: { V: 'S', M: 'E', B: 'A', N: 'R', C: 'F' },
    len: { VM: river.SE, VB: river.AS, VN: hyp(river.SE, river.ER), VC: hyp(river.AS, AF), MN: river.ER, BC: AF },
    show: ['VM', 'VB', 'MN', 'BC'],
    // drawn SCHEMATIC (figure.js › draw): at scale, S and E (9 m apart) would print on one another beside a 416 m width
    draw: { VM: '24', VB: '72', VN: hyp('24', '40'), VC: hyp('72', '120'), MN: '40', BC: '120' },
  };
}

// ───────────────────────────── stage 5: the shadows (drawn meshes, never the shadow map — B2, B5) ─────────────────────────────

/** A shadow's length on flat ground: height / tan(elevation) — exact. */
export const shadowLength = (height, tan) => write(over(height, tan));

/**
 * The tip of the shadow of a vertical thing of `height` standing at `foot` (its horizontal point under the top), for a
 * sun of elevation `tan` and of AZIMUTH `azimuth` (radians; the horizontal direction TOWARDS the sun is
 * (sin azimuth, cos azimuth) in x, z). `length` is exact; `x`, `z` are for drawing.
 */
export function shadowTip({ tan, azimuth, height, foot }) {
  const length = shadowLength(height, tan);
  const l = approx(length);
  return { length, x: foot.x - Math.sin(azimuth) * l, z: foot.z - Math.cos(azimuth) * l };
}

/** The unit vector towards a sun of elevation `tan` and azimuth `azimuth` (for the runtime's `sunDir`). */
export function sunVector(tan, azimuth) {
  const t = approx(tan);
  const k = 1 / Math.sqrt(1 + t * t);
  return { x: Math.sin(azimuth) * k, y: t * k, z: Math.cos(azimuth) * k };
}

// ───────────────────────────── THE ONE ORDER's three facts (§2.1) ─────────────────────────────

/** A number typed in a box: digits and at most one comma (« 77,5 »); null when it is not a positive length. */
export function typedLength(text) {
  const t = String(text ?? '').trim();
  if (!/^\d+(,\d+)?$/.test(t)) return null;
  const v = tryRead(t);
  return v && v.n > 0n ? write(v) : null;
}

/** A number of the capstone's card: a fraction « 1/36 » or a decimal « 0,5 » — positive; null otherwise. */
export function typedRatio(text) {
  const t = String(text ?? '').trim();
  if (!/^\d+(,\d+)?(\/\d+)?$/.test(t)) return null;
  const v = tryRead(t);
  return v && v.n > 0n ? write(v) : null;
}

/** A thing built at `typed` against what the world holds `truth`: -1 shorter, 0 the same, 1 longer — exact. */
export const against = (typed, truth) => compare(typed, truth);

// ───────────────────────────── the scale rule (§1.5, gate B6) ─────────────────────────────

/** The rope: a tap is one knot; held, it waits `DELAY`, then rises from `MIN` to the stage's top speed in `RAMP` s. */
export const ROPE = Object.freeze({ MIN: 3, MAX: 30, DELAY: 0.15, RAMP: 0.35, LIMIT: 8 });

/** Knots a second after holding the key `held` seconds, on a stage whose top speed is `top`. */
export function knotRate(held, top) {
  if (held < ROPE.DELAY) return 0;
  return ROPE.MIN + (top - ROPE.MIN) * Math.min(1, (held - ROPE.DELAY) / ROPE.RAMP);
}

/** The slowest top speed (3 to 30 knots a second) that carries the stage's LONGEST rope in 8 s at most. */
export function topRate(longest) {
  const s = ROPE.LIMIT - ROPE.DELAY;
  const r = ROPE.RAMP;
  // 1 + MIN·r + (top − MIN)·r/2 + top·(s − r) = longest
  const top = (approx(longest) - 1 - ROPE.MIN * r + (ROPE.MIN * r) / 2) / (s - r + r / 2);
  return Math.max(ROPE.MIN, Math.min(ROPE.MAX, top));
}

/** The camera's distance that fits a box `w` wide and `h` tall in a view of `fov` degrees (vertical) and `aspect`. */
export function frameDistance(w, h, fov = 50, aspect = 1366 / 768, margin = 1.12) {
  const t = Math.tan(((fov / 2) * Math.PI) / 180);
  return Math.max(h / 2 / t, w / 2 / (t * aspect)) * margin;
}

/**
 * The scale of a label sprite that keeps a fixed size on screen (`sizeAttenuation: false`) so that its glyphs are
 * `px` tall in a view `viewH` pixels high at `fov` degrees. The label's canvas is 96 px high with a 64 px font.
 */
export const labelScale = (px, fov = 60, viewH = 768) =>
  (px * (96 / 64)) / ((viewH / 2) * (1 / Math.tan(((fov / 2) * Math.PI) / 180)));
