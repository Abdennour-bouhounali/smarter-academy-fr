/**
 * THE WALKWAY of this world — a segment kind (`kind: 'walkway'`), pure logic and the state machine of its panel
 * (panel: `Chantier.jsx`, drawing: `crewLanes.jsx`, the world's side: `walkwayGame.js`; contract: GAME_WORLD.md
 * « A segment `walkway` »).
 *
 * Two crews (or more: `crews` = their plank lengths) lay ONE walkway from the same shore, each on its own lane, a
 * plank after another. HE places the pillar FIRST — a distance d in cases from the shore — then the crews lay: each lane
 * lays every whole plank that does not pass the pillar. The pillar holds when d > 0 and EVERY lane ends exactly on it.
 * The purse is read only once the whole walkway is laid: a walkway that holds and that the purse pays stands; any
 * other one goes back — its planks return to the merchant and NO coin is spent (unlike a bridge's purse, which spends
 * as it lays).
 *
 * Nothing here states a rule: it computes what the crews do. The words are the story's (`story.text.walkway`).
 */

/** The width of the drawn water at 1366 × 768 (px): the ruler of the panel. */
export const RULER_PX = 1100;
/** Under this width (px) a plank is not drawn one by one: its lane is one band with its count printed. */
const MIN_PLANK_PX = 6;
/** Over this many planks a lane is one band too. */
const MAX_DRAWN_PLANKS = 120;
/** The most the box takes on a `fit` walkway (six digits). */
const FIT_MAX = 999999;

const isNat = (x) => Number.isInteger(x) && x >= 0;

/** One lane: the crew of planks b toward a pillar at d — its whole planks, the cases it stops short, whether it ends. */
export function laneOf(b, d) {
  if (!Number.isInteger(b) || b < 1) throw new RangeError(`walkway: the plank ${b}`);
  if (!isNat(d)) throw new RangeError(`walkway: the pillar ${d}`);
  const planks = Math.floor(d / b);
  const short = d - b * planks;
  return { b, planks, short, ends: short === 0 };
}

/**
 * The crews lay toward the pillar at d, with `purse` coins left (null: no purse — a walkway that holds is paid).
 *   { d, lanes, holds, cost, paid, verdict }   verdict: 'shore' (d = 0, nothing to build) · 'short' (a lane does not
 *   end on the pillar) · 'ruins' (it holds, the purse cannot pay it) · 'paid' (it holds and is paid).
 */
export function lay(crews, d, purse = null) {
  if (!Array.isArray(crews) || crews.length < 1) throw new RangeError('walkway: no crew');
  const lanes = crews.map((b) => laneOf(b, d));
  const holds = d > 0 && lanes.every((l) => l.ends);
  const cost = lanes.reduce((n, l) => n + l.planks, 0);
  const paid = holds && (purse == null || cost <= purse);
  const verdict = d === 0 ? 'shore' : !holds ? 'short' : paid ? 'paid' : 'ruins';
  return { d, lanes, holds, cost, paid, verdict };
}

/** What a refused walkway costs: nothing. What a paid one costs: its planks. */
export const spentBy = (t) => (t?.paid ? t.cost : 0);

// ───────────────────────────── the scale of the drawn water ─────────────────────────────

const ROUND = [1, 2, 2.5, 5];
/** The round steps (1, 2, 2,5, 5 × 10^k, whole numbers only) around x, increasing. */
function roundSteps(x) {
  const k = Math.floor(Math.log10(Math.max(x, 1)));
  const out = [];
  for (let e = Math.max(0, k - 1); e <= k + 1; e += 1)
    for (const m of ROUND) if (Number.isInteger(m * 10 ** e)) out.push(m * 10 ** e);
  return out;
}
/** The smallest round step (1, 2, 2,5 or 5 × 10^k, a whole number) that is at least x. */
export function roundStep(x) {
  if (!(x > 1)) return 1;
  return roundSteps(x).find((v) => v >= x - 1e-9) ?? 10 ** Math.ceil(Math.log10(x));
}
/** The largest round step that is at most x (at least 1). */
export function roundDown(x) {
  if (!(x > 1)) return 1;
  return [...roundSteps(x)].reverse().find((v) => v <= x + 1e-9) ?? 1;
}

/**
 * How the water is drawn for a try. `fixed`: 0 … `ruler`, the same for every try (labels about every eighth of it —
 * 50 for a ruler of 400, 100 for 700 — ticks five times as dense; `ticks: { minor, label }` overrides them). `fit`:
 * per try, the drawn water is 1,15 × the longest of the pillar and the longest plank, relabelled with 4 to 7 round
 * labels after 0 (the largest round step 1, 2, 2,5, 5 × 10^k that leaves at least four).
 *   { max, px (per case), labels: [cases], minor: [cases] }
 */
export function scaleOf({ scale = 'fixed', ruler = 400, crews = [], d = null, ticks = null, width = RULER_PX }) {
  if (scale === 'fit') {
    const longest = Math.max(...crews, d ?? 0, 1);
    const max = longest * 1.15;
    // the largest round step that leaves at least four labels after 0 (at most seven: two round steps are ≤ × 2 apart)
    const step = roundDown(max / 4);
    const labels = [];
    for (let v = 0; v <= max; v += step) labels.push(v);
    return { max, px: width / max, labels, minor: [] };
  }
  if (!Number.isInteger(ruler) || ruler < 1) throw new RangeError(`walkway: the ruler ${ruler}`);
  const label = ticks?.label ?? roundStep(ruler / 8);
  const minorStep = ticks?.minor ?? label / 5;
  const labels = [];
  for (let v = 0; v <= ruler; v += label) labels.push(v);
  const minor = [];
  if (minorStep >= 1) for (let v = 0; v <= ruler; v += minorStep) if (v % label) minor.push(v);
  return { max: ruler, px: width / ruler, labels, minor };
}

/**
 * How one lane is drawn at `px` per case: plank by plank (`planks`: their starts in px), or ONE band (`band: true`)
 * when a plank is under 6 px or the lane has more than 120 planks; the shortfall (amber) and whether its label goes
 * UNDER the lane (with a leader) because it is narrower than `labelPx`.
 */
export function laneDrawing(lane, px, labelPx = 64) {
  const plankPx = lane.b * px;
  const band = lane.planks > 0 && (plankPx < MIN_PLANK_PX || lane.planks > MAX_DRAWN_PLANKS);
  const planks = band ? [] : Array.from({ length: lane.planks }, (_, k) => k * plankPx);
  const laid = lane.planks * plankPx;
  const shortPx = lane.short * px;
  return { plankPx, band, planks, laid, shortAt: laid, shortPx, labelBelow: lane.short > 0 && shortPx < labelPx };
}

// ───────────────────────────── the panel's state machine ─────────────────────────────

/** The integers the box takes: 0 … `ruler` on a `fixed` walkway, 0 … 999 999 on a `fit` one. */
export const boxMax = (seg) => (seg.scale === 'fit' ? FIT_MAX : seg.ruler);

/** What the box holds, read: { d } or { error: 'empty' | 'nan' | 'range' }. */
export function readPillar(text, max) {
  const t = String(text ?? '')
    .replace(/[\s  ]/g, '')
    .trim();
  if (t === '') return { error: 'empty' };
  if (!/^\d+$/.test(t)) return { error: 'nan' };
  const d = Number(t);
  if (d > max) return { error: 'range' };
  return { d };
}

/**
 * The panel: stage `place` (he types the distance) → `planted` (the pillar stands, drawn at once) → `laying` (the
 * crews lay, lane after lane; `shown` = planks drawn so far) → `laid` (the facts, the verdict). « Reprendre le pilier »
 * goes back to `place` at any moment, without a try. `cfg` = { crews, max (the box's), purse (coins left, or null) }.
 */
export const initWalkway = (from = null) => ({
  stage: 'place',
  text: '',
  d: null,
  error: null,
  now: null,
  shown: 0,
  tries: Array.isArray(from?.tries) ? from.tries : [],
});

/** How many planks the crews lay in all on this try — the laying runs in at most 40 steps (≤ 2 s). */
const totalOf = (t) => t.lanes.reduce((n, l) => n + l.planks, 0);
export const layStep = (t) => Math.max(1, Math.ceil(totalOf(t) / 40));

/**
 * One move:  { type: 'type', text }   he types in the box
 *            { type: 'nudge', by }    ←/→ ±1, Shift ±10 (from what the box holds, or 0)
 *            { type: 'plant' }        the pillar stands where the box says (or the box's error)
 *            { type: 'lay' }          « Les équipes posent »
 *            { type: 'tick' }         the crews lay a few more planks
 *            { type: 'take' }         « Reprendre le pilier »
 */
export function walkwayReducer(cfg, s, a) {
  switch (a.type) {
    case 'type':
      if (s.stage === 'laying') return s;
      return { ...s, text: String(a.text ?? ''), error: null };
    case 'nudge': {
      if (s.stage !== 'place') return s;
      const read = readPillar(s.text, cfg.max);
      const from = read.d ?? 0;
      const d = Math.max(0, Math.min(cfg.max, from + a.by));
      return { ...s, text: String(d), error: null };
    }
    case 'plant': {
      if (s.stage !== 'place') return s;
      const read = readPillar(s.text, cfg.max);
      if (read.error) return { ...s, error: read.error };
      return { ...s, stage: 'planted', d: read.d, error: null, now: null, shown: 0 };
    }
    case 'lay': {
      if (s.stage !== 'planted') return s;
      const now = lay(cfg.crews, s.d, cfg.purse);
      const total = totalOf(now);
      if (total === 0) return { ...s, stage: 'laid', now, shown: 0, tries: [...s.tries, now] };
      return { ...s, stage: 'laying', now, shown: 0 };
    }
    case 'tick': {
      if (s.stage !== 'laying') return s;
      const shown = Math.min(totalOf(s.now), s.shown + layStep(s.now));
      if (shown < totalOf(s.now)) return { ...s, shown };
      return { ...s, stage: 'laid', shown, tries: [...s.tries, s.now] };
    }
    case 'take':
      if (s.stage === 'laying') return s;
      return { ...s, stage: 'place', d: null, now: null, shown: 0, error: null };
    default:
      return s;
  }
}

/** The planks drawn in each lane after `shown` planks in all: lane A first, then lane B… */
export function shownPerLane(t, shown) {
  let left = shown;
  return t.lanes.map((l) => {
    const k = Math.min(l.planks, left);
    left -= k;
    return k;
  });
}

/** A kept try read back (a save): only a try these crews make at that pillar, else nothing — never trusted. */
export function triesFrom(crews, saved) {
  if (!Array.isArray(saved)) return [];
  return saved.filter((t) => {
    if (!t || !isNat(t.d)) return false;
    const again = lay(crews, t.d, null);
    return again.holds === t.holds && again.cost === t.cost && (t.paid !== true || t.holds);
  });
}
