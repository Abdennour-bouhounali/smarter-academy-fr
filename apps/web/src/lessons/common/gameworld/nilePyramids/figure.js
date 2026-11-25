/**
 * The pyramids world — A THALÈS FIGURE (PURE; PYRAMIDS_WORLD_PLAN §2.3): the one shape every case, mirror, experiment and
 * card of this world is about, and its ONE drawing — a spec for the shared `components/GeoFigure.jsx` (never a second
 * renderer). It names no lesson.
 *
 *   fig = {
 *     kind: 'nested' | 'butterfly',
 *     names: { V, M, B, N, C },            the letters: the vertex V, M on line (VB), N on line (VC)
 *     len: { VM, VB, VN, VC, MN, BC },     exact lengths as TEXT (« 42,5 », « 5/6 », a root « 8√2785 » — surd.js);
 *                                          MN and BC may be null (unknown); `withPieces` adds the pieces MB, NC of a
 *                                          nested figure, the lengths ACROSS the vertex VMB, VNC of a butterfly
 *     draw?: { VM, VB, VN, VC, MN, BC },   lengths for the DRAWING only, when the true shape cannot be read (the river:
 *                                          9 beside 416) — a schematic figure; every value written is still `len`'s;
 *                                          `draw.cos` (a float) the cosine of the angle at V, when BC and MN are unknown
 *   }
 * nested: M on [VB], N on [VC]; butterfly: M and N on the OTHER side of V. (MN) ∥ (BC) exactly when the three ratios
 * VM/VB, VN/VC, MN/BC are equal (`chain`). Floats are for DRAWING only.
 */
import { sheetFigure } from '../kit/sheetFigure';
import { runFigure } from '../kit/trainerFigure';
import { layoutGeoFigure } from '../../components/geoFigure';
import { lenApprox as approx, lenCompare as compare, lenOver, lenPlus, lenTimes, lenWrite as write } from './surd';
import { FIGURE_TEXT } from './strings';

const sq = (x) => approx(x) ** 2;

/** The three ratios of the chain, exact (null where a length is unknown). A length may be a root (`surd.js`). */
export function ratios(fig) {
  const { VM, VB, VN, VC, MN, BC } = fig.len;
  const r = (a, b) => (a != null && b != null ? lenOver(a, b) : null);
  return { VB: r(VM, VB), VC: r(VN, VC), BC: r(MN, BC) };
}

/** Do the three ratios hold one value? (exact — the parallel's condition, seen) */
export function chain(fig) {
  const { VB, VC, BC } = ratios(fig);
  return VB != null && VC != null && BC != null && compare(VB, VC) === 0 && compare(VB, BC) === 0;
}

/**
 * The ratio gauge (§2.3): three bars of one length, a mark on each; aligned = the three values are equal (and equal
 * to the target `to` when the case has one). By default the values are the three ratios from the vertex; a case TESTED
 * through other values carries them: `c.tested = { values: [a, b, c], to?, names? }` (exact texts; `to` the value
 * the three must reach, drawn as a dashed line; `names` the three LaTeX labels) — so the gauge always agrees with the
 * case's `held` (a 🔑 case run through a wrong chain, a 🔍 copy against its target). Positions are the values over
 * the largest of them (and of 1): a ratio below 1 stands where it is.
 */
export function gauge(fig) {
  const t = fig.tested;
  const r = ratios(fig);
  const values = t ? t.values : [r.VB, r.VC, r.BC];
  const known = values.filter((v) => v != null);
  const top = Math.max(1, ...known.map((v) => approx(v)), t?.to != null ? approx(t.to) : 0);
  const marks = ['VB', 'VC', 'BC'].map((k, i) => ({
    k,
    at: values[i] == null ? null : approx(values[i]) / top,
    name: t?.names?.[i] ?? null,
  }));
  const same = known.length === 3 && known.every((v) => compare(v, known[0]) === 0);
  const aligned = same && (t?.to == null || compare(known[0], t.to) === 0);
  return { marks, aligned, target: t?.to != null ? approx(t.to) / top : null };
}

/**
 * The points for DRAWING, y up: V at the origin, B along +x, C at the angle given by VB, VC and BC (al-Kashi). M and N
 * stand at VM and VN on the same rays (nested) or on the opposite rays (butterfly).
 */
export function points(fig) {
  const { VM, VB, VN, VC, BC, MN } = fig.draw ?? fig.len;
  const vb = approx(VB);
  const vc = approx(VC);
  let cos;
  if (fig.draw?.cos != null) cos = fig.draw.cos;
  else if (BC != null) cos = (vb * vb + vc * vc - sq(BC)) / (2 * vb * vc);
  else {
    // BC unknown: the angle from the small triangle (MN known), or a fair default
    const vm = approx(VM);
    const vn = approx(VN);
    cos = MN != null ? (vm * vm + vn * vn - sq(MN)) / (2 * vm * vn) : 0.35;
    if (fig.kind === 'butterfly') cos = MN != null ? cos : 0.35;
  }
  cos = Math.max(-0.97, Math.min(0.97, cos));
  const sin = Math.sqrt(1 - cos * cos);
  const side = fig.kind === 'butterfly' ? -1 : 1;
  const { V, M, B, N, C } = fig.names;
  const vm = approx(VM) * side;
  const vn = approx(VN) * side;
  return {
    [V]: [0, 0],
    [B]: [vb, 0],
    [C]: [vc * cos, vc * sin],
    [M]: [vm, 0],
    [N]: [vn * cos, vn * sin],
  };
}

/** The points turned by `deg` degrees round the vertex (the origin). */
function turned(P, deg) {
  if (!deg) return P;
  const t = (deg * Math.PI) / 180;
  const [c, n] = [Math.cos(t), Math.sin(t)];
  return Object.fromEntries(Object.entries(P).map(([k, [x, y]]) => [k, [x * c - y * n, x * n + y * c]]));
}

const lab = (x) => (x == null ? '?' : write(x));

/**
 * The GeoFigure spec of a figure. `show`: which lengths are written ('all' | a list of keys of `len` — on a nested
 * figure a whole side VB or VC in the list is written « AB = 54 » on the inner side of its line; on a butterfly a length
 * ACROSS the vertex, VMB or VNC, is written « AE = 31,5 » the same way, along its line through the vertex);
 * `ask`: segments written « ? » (an unknown); `parallel`: draw the chevrons of (MN) ∥ (BC) (when the case says so);
 * `small`: a thumbnail (no length written); `turn`: the figure turned by that many degrees (a triangle « on its side »).
 */
export function figureSpec(fig, { show = 'all', ask = [], parallel = null, small = false, turn = 0, extra = {} } = {}) {
  const { V, M, B, N, C } = fig.names;
  const P = turned(points(fig), turn);
  const wants = (k) => !small && (show === 'all' || show.includes(k)) && fig.len[k] !== undefined;
  const seg = (a, b, k, more = {}) => ({
    from: a,
    to: b,
    ...(wants(k) ? { label: ask.includes(k) ? '?' : lab(fig.len[k]) } : {}),
    ...more,
  });
  const arrows = parallel ?? fig.parallel ?? chainSafe(fig);
  const butterfly = fig.kind === 'butterfly';
  // a WHOLE side given in a list (📐's « VB », « VC ») on a nested figure — or a length ACROSS the vertex (« VMB »,
  // « VNC ») on a butterfly — is no segment of its own: it is written on the inner side of its line, named
  // (« AB = 54 »), under the pieces' segments — never with `show: 'all'`
  const whole = (a, b, k, side) =>
    show !== 'all' && wants(k)
      ? [
          {
            from: a,
            to: b,
            label: ask.includes(k) ? `${a}${b} = ?` : `${a}${b} = ${lab(fig.len[k])}`,
            labelSide: side,
          },
        ]
      : [];
  return {
    points: P,
    segments: [
      ...(butterfly ? whole(M, B, 'VMB', -1) : whole(V, B, 'VB', -1)),
      ...(butterfly ? whole(N, C, 'VNC', 1) : whole(V, C, 'VC', 1)),
      seg(V, M, 'VM', { tone: 'indigo' }),
      butterfly ? seg(V, B, 'VB') : seg(M, B, 'MB', shortPiece(P, M, B, V) ? { labelSide: -1 } : {}),
      seg(V, N, 'VN', { tone: 'indigo' }),
      butterfly ? seg(V, C, 'VC') : seg(N, C, 'NC', shortPiece(P, N, C, V) ? { labelSide: 1 } : {}),
      seg(M, N, 'MN', { tone: 'rose', bold: true, ...(arrows ? { arrows: 1 } : {}) }),
      seg(B, C, 'BC', { tone: 'rose', bold: true, ...(arrows ? { arrows: 1 } : {}) }),
    ],
    polygons: [{ points: [V, M, N], tone: 'indigo' }],
    ariaLabel: butterfly ? FIGURE_TEXT.butterfly(V) : FIGURE_TEXT.nested(V, B, C, M, N),
    maxWidth: small ? 120 : 360,
    // a thumbnail (the evidence's lines) draws the shape only: its letters would be 3 px (the walk, 2026-11-24)
    ...(small ? { hidden: Object.keys(P) } : {}),
    ...extra,
  };
}
/**
 * A piece of a side short beside its side (under a quarter, as drawn): its length is written on the INNER side of its
 * line, as a whole side is — outside it met the point's letter (« 10 » over « M » on the workshop's course, the walk).
 */
const shortPiece = (P, a, b, v) => {
  const d = (p, q) => Math.hypot(P[p][0] - P[q][0], P[p][1] - P[q][1]);
  return d(a, b) < 0.25 * d(v, b);
};
const chainSafe = (fig) => {
  try {
    return chain(fig);
  } catch {
    return false;
  }
};

/**
 * THE LAST STEP'S FIGURE (forgeParts.jsx › UseFigure, beside the step's lines): the case's figure — `c.show` the
 * lengths written, `c.ask` those written « ? », `c.parallel`, `c.turn` — drawn never narrower than the width at which
 * its smallest label is 12 px (`kit/sheetFigure.js › k`; the forge is designed at 1280 × 720 and only zoomed UP at
 * 1366 × 768). `fits`: that drawing stands in LAST_STEP_FIGURE.room beside the lines and the buttons, nothing scrolls.
 * Without `c.turn` it is drawn as it is when it fits, else turned (by 15°) to lie lowest.
 * → { spec, width, height, turn, fits }, or null for a case with no figure (no `names` and `len`).
 */
const LAST_STEP_FIGURE = { label: 12, room: { width: 380, height: 250 } };
const drawnAt = (c, turn) => {
  const spec = figureSpec(c, { show: c.show ?? 'all', ask: c.ask ?? [], parallel: c.parallel ?? null, turn });
  const [, , vw, vh] = layoutGeoFigure(spec).viewBox;
  const width = Math.ceil(sheetFigure(spec).k * LAST_STEP_FIGURE.label);
  const height = Math.ceil((width * vh) / vw);
  const { room } = LAST_STEP_FIGURE;
  return { spec, width, height, turn, fits: width <= room.width && height <= room.height };
};
export function lastStepFigure(c) {
  if (!c?.names || !c?.len) return null;
  if (c.turn != null) return drawnAt(c, c.turn);
  // no turn asked: as it is when it fits, else the turn (by 15°) that lays it lowest
  const flat = drawnAt(c, 0);
  if (flat.fits) return flat;
  const all = Array.from({ length: 24 }, (_, i) => drawnAt(c, i * 15));
  return all.filter((f) => f.width <= LAST_STEP_FIGURE.room.width).sort((x, y) => x.height - y.height)[0] ?? flat;
}

/**
 * THE MIRROR'S FIGURE turned to lie low (forgeParts.jsx › Mirror): a tall case (a right triangle standing on its short
 * side, a long butterfly) pushed the attack's question and its button out of the window at 1366 × 768 (the walk,
 * 2026-11-24). Drawn as it is when its height is at most MIRROR.ratio × its width; else the turn (by 15°) that lays it
 * lowest, drawn at the width its smallest label needs to stay 12 px (`kit/sheetFigure.js › k`; at most MIRROR.widest,
 * which a figure lying flat leaves room for). → { turn, width } (width null: the mirror's own).
 */
const MIRROR = { width: 300, widest: 360, ratio: 1.05 };
export function mirrorFigure(c) {
  if (!c?.names || !c?.len) return { turn: 0, width: null };
  const at = (turn) => {
    const spec = figureSpec(c, { show: c.show ?? 'all', parallel: c.parallel ?? null, turn });
    const [, , vw, vh] = layoutGeoFigure(spec).viewBox;
    const width = Math.max(MIRROR.width, Math.ceil(sheetFigure(spec).k * LAST_STEP_FIGURE.label));
    return { turn, width, ratio: vh / vw, height: (width * vh) / vw };
  };
  const flat = at(0);
  if (flat.ratio <= MIRROR.ratio) return { turn: 0, width: null };
  const best = Array.from({ length: 24 }, (_, i) => at(i * 15))
    .filter((f) => f.width <= MIRROR.widest)
    .sort((x, y) => x.height - y.height)[0];
  return best && best.height < flat.height ? { turn: best.turn, width: best.width } : { turn: 0, width: null };
}

/**
 * A buoy's figure is a SCHEMA, not a drawing to scale (owner, 2026-11-25: AM = 14, AB = 16, AN = 49 drew a sliver where
 * M and B touched and « AC = ? » sat on two lines): its written lengths are the question's, its SHAPE is evened out —
 * the two sides from the vertex within 0,7 and 1,45 of each other, the small triangle 35 % to 70 % of the big one (a
 * butterfly's two triangles within ½ and 2 of each other), the angle at the vertex between 53° and 84°. The parallel
 * stays a parallel (one ratio on both lines).
 */
function schema(fig) {
  const shape = fig.draw ?? fig.len;
  const [vb, vc, vm, vn] = ['VB', 'VC', 'VM', 'VN'].map((k) => (shape[k] == null ? null : approx(shape[k])));
  if (!(vb > 0 && vc > 0 && vm > 0 && vn > 0)) return fig;
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const fly = fig.kind === 'butterfly';
  const sides = clamp(vc / vb, 0.7, 1.45);
  const k = fly ? clamp(vm / vb, 0.5, 2) : clamp(vm / vb, 0.35, 0.7);
  const P = points(fig);
  const [cx, cy] = P[fig.names.C];
  const cos = clamp(cx / Math.hypot(cx, cy), 0.1, 0.6);
  const s = (x) => x.toFixed(4);
  return { ...fig, draw: { VB: '1', VC: s(sides), VM: s(k), VN: s(k * sides), cos } };
}

/**
 * A BUOY'S FIGURE (a buoy of the felucca's legs or of the practice ladder that names points — the lessons' `run.js`):
 * the figure with the lengths `show` written, `ask` written « ? » and the chevrons of the parallel, drawn in the run's
 * panel (`kit/trainerFigure.js › runFigure`, at its 12 px floor). As it is when it fits the panel's room, else the
 * smallest turn (by 15°, either way) that fits — the figure stays as near as it can to the way it was made. A figure
 * that fits at no turn (a fat butterfly: two long lines crossing at 70°, as wide as high whichever way) and whose angle
 * is free (BC and MN unknown, the default angle) is drawn with a narrower angle at V (`draw.cos`), then turned.
 * → the GeoFigure spec (`round.figure`).
 */
export function buoyFigure(raw, { show, ask = [] }) {
  const fig = schema(raw);
  const at = (f, turn) => {
    const spec = figureSpec(f, { show, ask, parallel: true, turn });
    return { spec, t: runFigure(spec), turn };
  };
  const away = (x) => Math.min(x.turn, 360 - x.turn);
  const best = (f) => {
    const flat = at(f, 0);
    if (flat.t.fits) return flat;
    return Array.from({ length: 24 }, (_, i) => at(f, i * 15))
      .filter((x) => x.t.fits)
      .sort((a, b) => away(a) - away(b) || a.t.height - b.t.height)[0];
  };
  const shape = fig.draw ?? fig.len;
  const free = shape.BC == null && shape.MN == null;
  for (const cos of free ? [null, 0.55, 0.7, 0.8] : [null]) {
    const got = best(cos == null ? fig : { ...fig, draw: { ...shape, cos } });
    if (got) return got.spec;
  }
  return at(fig, 0).spec;
}

/**
 * The lengths of a figure with its pieces added. Nested: the pieces MB = VB − VM, NC = VC − VN. Butterfly: the lengths
 * ACROSS the vertex, under their OWN keys — VMB = VM + VB (from M through V to B), VNC = VN + VC — never `MB`, which on
 * a nested figure is a piece. A length already given is kept; one that cannot be written as one length (a rational
 * plus a root) is null.
 */
export function withPieces(fig) {
  const { VM, VB, VN, VC } = fig.len;
  const add = (a, b) => {
    if (a == null || b == null) return null;
    try {
      return lenPlus(a, b);
    } catch {
      return null;
    }
  };
  if (fig.kind === 'nested') {
    const piece = (a, b) => (a != null && b != null ? lenPlus(b, lenTimes(a, '-1')) : null);
    return { ...fig, len: { ...fig.len, MB: fig.len.MB ?? piece(VM, VB), NC: fig.len.NC ?? piece(VN, VC) } };
  }
  if (fig.kind === 'butterfly')
    return { ...fig, len: { ...fig.len, VMB: fig.len.VMB ?? add(VM, VB), VNC: fig.len.VNC ?? add(VN, VC) } };
  return fig;
}
