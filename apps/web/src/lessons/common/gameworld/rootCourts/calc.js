/**
 * THE INVESTIGATION `calc` — PURE logic (screen: `InquiryCalc.jsx`; contract: GAME_WORLD.md « Explore », spec shape of
 * `calc`). Its rule is a COMPARISON of several candidates for ONE length, none of which is that length: the court of
 * area `a` is in front of him and rods lie ready — a whole number, a decimal, the number a drawn calculator shows. For
 * each rod he says BEFORE whether its platform will ride; the world lowers it (exact: `logic.js › outcome`) and writes
 * what is left or what sticks out. A gap too thin to see is magnified by HIS hand, ten times at each press, until it is
 * seen. Last (`spec.wall`), he clamps the rod on the court's own wall, corner to corner: that rod rides, and it has no
 * number.
 *
 *   spec = { kind: 'calc', a: '30', rods: [{ q: '5' }, { q: '5,5' }, { calc: '5,477225575' }], wall: true, text }
 *
 * The screen is a pure view of this file's reducer: the whole experiment is played and tested without a browser.
 */
import { outcome, read, write, approx, lengthOf, wall as wallOf } from './logic';

/** A rod as the world lowers it: `{ q }` (a number — also the calculator's), or `{ root }` (a court's wall). */
export const rodOf = (r) =>
  r.calc != null ? { q: write(r.calc) } : r.root != null ? { root: write(r.root) } : { q: write(r.q) };

/** Under the magnifier, a band (or an overhang) is SEEN when it is this part of the court's side. */
const SEEN = 0.025; // ≈ 4.2 units of the court's 168-unit drawing: where `Court` stops calling a gap too thin
/** The magnifier stops there (10^14): no rod of a spec needs more (a test proves it for ten-digit calculators). */
export const MAX_ZOOM = 14;
/** The screen holds four rods and the wall. */
export const MAX_RODS = 4;
/**
 * The longest number a cell of the table may hold — what the platform covers, what is left or sticks out — in
 * characters, its comma included. A calculator of ten digits on a court of one or two digits gives 21 (« 29,999999999
 * 434080625 » for 30); the table is laid out for it (`CALC_LAYOUT.table`), and a spec that would write a longer one is
 * refused (`check`) rather than drawn past its column.
 */
export const MAX_CELL = 21;

/**
 * THE LAYOUT of the screen at 1366 × 768 (the ONE size), in rem of the forge's frame (`.rf-fit`, designed 1280 × 720 and
 * zoomed 1.067: 1rem ≈ 17 px). Inside the experiment's panel there are 1205 × 587 px of the frame (measured on the walk's
 * screenshots, 2026-11-21: the panel 1327 × 657 px on screen, less its padding and border).
 *   row 1  the lead and the goal (two lines)
 *   row 2  the court (the subject: as high as the rows below leave), then the rack of rods and the calculator — left to right
 *   row 3  the question, its buttons and the fact (left, under the court), then the table (right)
 * `inquiryCalc.render.test.jsx` adds the widths and the heights and checks every text he reads is ≥ 18 px on screen.
 * The CSS (`inquiry.css`) reads the court's height and the talk's width from the custom properties the screen sets.
 */
export const CALC_LAYOUT = {
  zoom: 1.067,
  panel: { w: 1205, h: 587 }, // px of the frame inside `.rq-iq`
  gap: 1, // rem between two pieces of a row
  rowGap: 0.55, // rem between two rows (`.rq-iq` gap)
  head: 3.52, // rem: the lead (1.2rem × 1.5) and the goal (1.08rem × 1.45), one line each, and their gap
  court: 15.5, // rem: the court's drawing (640 × 240) is drawn this high
  rack: { w: 424, wall: 220, scale: 0.82, font: 22 }, // the rack's viewBox width, its wall, its scale, its label size
  calculator: 9, // rem: the drawn calculator (200 × 250)
  talk: 26, // rem: the column of the question, its buttons and the fact
  /** the table: its three cells at most this wide (rem) at its font (1.08rem); a row ≈ 1.95rem, the header 2.2, the note 3.2 */
  table: { font: 1.08, rod: 9.2, covers: 14.2, diff: 23.2, row: 1.95, header: 2.2, note: 3.2 },
};

/**
 * How many presses of « Agrandis » (each × 10) the gap left by a rod needs before it is seen — 0 when it is seen at once, or
 * when the platform rides. Drawing only: what the world DOES is `outcome`, exact. The thickness of the band is
 * |S − s| = |S² − s²| / (S + s), with S² − s² the exact difference — no cancellation of two close floats.
 */
export function zoomNeed(r, area) {
  const o = outcome(r, area);
  if (o.kind === 'ride') return 0;
  const side = Math.sqrt(approx(area));
  const part = approx(o.diff) / (side + lengthOf(r)) / side;
  let k = 0;
  while (part * 10 ** k < SEEN && k < MAX_ZOOM) k += 1;
  return k;
}

// ───────────────────────── the state machine of the screen ─────────────────────────
// say → build → (zoom …) → seen → say (next rod) … → [wall → clamping → say → build → seen] → done

function check(spec) {
  read(spec.a); // throws on a court that is not a number
  if (!Array.isArray(spec.rods) || (!spec.rods.length && !spec.wall))
    throw new Error('calc: the spec holds no rod and no wall');
  // the rack and the table are laid out for four rods and the wall at 1366 × 768 (the longest content)
  if (spec.rods.length > MAX_RODS) throw new Error(`calc: at most ${MAX_RODS} rods lie ready, not ${spec.rods.length}`);
  // every number its rows will write fits its column (the wall's row writes the area and no difference)
  for (const r of spec.rods) {
    const o = outcome(rodOf(r), write(spec.a));
    for (const x of [rodOf(r).q, o.covers, o.diff])
      if (String(x).length > MAX_CELL)
        throw new Error(`calc: « ${x} » is longer than the table's ${MAX_CELL} characters (court ${spec.a})`);
  }
}

const atRod = (spec, i) => {
  const r = spec.rods[i];
  return { i, rod: rodOf(r), calc: r.calc != null ? write(r.calc) : null, predicted: null, zk: 0, need: 0 };
};

export function initCalc(spec) {
  check(spec);
  const base = { rows: [], wall: false, zooms: 0, done: false };
  if (!spec.rods.length)
    return { ...base, i: 0, rod: null, calc: null, predicted: null, zk: 0, need: 0, stage: 'wall' };
  return { ...base, ...atRod(spec, 0), stage: 'say' };
}

/** The row of the rod under way (null before it is lowered). */
export const rowNow = (s) => (['zoom', 'seen'].includes(s.stage) ? s.rows.at(-1) : null);

/**
 * One move of the experiment.
 *   { type: 'say', v }   say: his prediction — will the platform ride? (true / false)
 *   { type: 'built' }    build: the world has lowered the platform
 *   { type: 'zoom' }     zoom: he presses « Agrandis » (× 10)
 *   { type: 'next' }     seen: the next rod, the wall, or the end
 *   { type: 'clamp' }    wall: he clamps the rod on the wall
 *   { type: 'clamped' }  clamping: the rod reaches the far corner
 * A move that does not belong to the stage changes nothing.
 */
export function calcReducer(spec, s, action) {
  const a = write(spec.a);
  switch (action.type) {
    case 'say': {
      if (s.stage !== 'say' || typeof action.v !== 'boolean') return s;
      return { ...s, stage: 'build', predicted: action.v };
    }
    case 'built': {
      if (s.stage !== 'build') return s;
      const o = outcome(s.rod, a);
      const need = zoomNeed(s.rod, a);
      const row = {
        a,
        s: s.rod,
        kind: o.kind,
        covers: o.covers,
        diff: o.diff,
        predicted: s.predicted,
        ...(s.calc != null ? { calc: s.calc } : {}),
        zoom: 0,
      };
      return { ...s, rows: [...s.rows, row], need, zk: 0, stage: need > 0 ? 'zoom' : 'seen' };
    }
    case 'zoom': {
      if (s.stage !== 'zoom') return s;
      const zk = s.zk + 1;
      const rows = [...s.rows.slice(0, -1), { ...s.rows.at(-1), zoom: zk }];
      return { ...s, zk, rows, zooms: s.zooms + 1, stage: zk >= s.need ? 'seen' : 'zoom' };
    }
    case 'next': {
      if (s.stage !== 'seen') return s;
      if (!s.wall && s.i + 1 < spec.rods.length) return { ...s, ...atRod(spec, s.i + 1), stage: 'say' };
      if (spec.wall && !s.wall)
        return { ...s, i: spec.rods.length, rod: null, calc: null, predicted: null, zk: 0, need: 0, stage: 'wall' };
      return { ...s, done: true };
    }
    case 'clamp': {
      if (s.stage !== 'wall') return s;
      return { ...s, stage: 'clamping' };
    }
    case 'clamped': {
      if (s.stage !== 'clamping') return s;
      return { ...s, stage: 'say', rod: wallOf(a), wall: true };
    }
    default:
      return s;
  }
}

/** What the investigation hands back to the forge (`forge.fromInquiry`). */
export const calcResult = (s) => ({ rows: s.rows, wall: s.wall, zooms: s.zooms });

/** The zoom of k presses, as a formula: « \\times 100 », then « \\times 10^{5} » from 10 000 on (as the court's lens). */
export const zoomTex = (k) => (k <= 4 ? `\\times ${10 ** k}` : `\\times 10^{${k}}`);
