/**
 * THE FIGURES of lesson `triangles-semblables` — TWO TRIANGLES THAT SHARE NOTHING (PURE). The lesson's whole point is the
 * pair of triangles lying APART, turned or flipped: the help the 4e figures gave for free (a shared vertex) is gone.
 * One drawing serves « Entraîne-toi », the forges, the cards of the map and the mission (the felucca's buoys carry none: each
 * is a bare calculation, `run.js`): a spec for the
 * shared `components/GeoFigure.jsx` (never a second renderer) — points, segments with their written lengths, the arc of
 * a written angle, the square of a right angle.
 *
 *   triangle = { names: [P, Q, R], coords: [[x, y] × 3] }, from its three sides (`fromSides`: [PQ, QR, RP]) or from two
 *   of its angles and one side (`fromAngles`); the coordinates are exact to the float and serve the DRAWING only —
 *   every length written is the text the lesson gives (« 4,5 »), never a computed float.
 *
 *   sceneOf({ one, two?, layout, aria })   one / two = { ...triangle, labels: { PQ: '4,5', QR: '?' }, angles: { P: '27°' } (or { label, tone, radius }),
 *                                          right: 'Q', ticks: { PQ: 1 } }  → a GeoFigure spec; `layout`: 'side' (one beside
 *                                          the other), 'stack' (one above) or 'diag' (below, half a width to the right); `ask`: the segment keys written « ? ».
 *
 *   An angle's written measure stands INSIDE its own angle: GeoFigure writes it on the bisector, 14 units beyond its arc
 *   (`angleArc`, radius 20 by default); when that place crosses a side or another measure (a flat triangle: « 27° » and
 *   « 41° » under C, « 112° » under the base — the walk of 2026-11-27), `fitAngleLabels` tries other radii.
 */
import { angleArc, layoutGeoFigure } from '../../../../../../common/components/geoFigure';

/** A length as text → a float (the drawing only). */
const num = (t) => Number(String(t).replace(',', '.'));
const rad = (d) => (d * Math.PI) / 180;

/** The triangle PQR of three sides [PQ, QR, RP] (floats or texts): P at the origin, Q to its right, R above. */
export function fromSides([pq, qr, rp], names) {
  const [c, a, b] = [num(pq), num(qr), num(rp)];
  const x = (c * c + b * b - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return {
    names,
    coords: [
      [0, 0],
      [c, 0],
      [x, y],
    ],
  };
}
/** The triangle PQR of the angles at P and at Q (degrees) and the side PQ: the law of sines. */
export function fromAngles([alpha, beta], pq, names) {
  const gamma = 180 - alpha - beta;
  const k = num(pq) / Math.sin(rad(gamma));
  return fromSides([num(pq), k * Math.sin(rad(alpha)), k * Math.sin(rad(beta))], names);
}

/** The same triangle turned by `deg` degrees around its first vertex. */
export function turned(t, deg) {
  const [co, si] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  return { ...t, coords: t.coords.map(([x, y]) => [x * co - y * si, x * si + y * co]) };
}
/** The same triangle flipped left to right. */
export const flipped = (t) => ({ ...t, coords: t.coords.map(([x, y]) => [-x, y]) });

const box = (coords) => {
  const xs = coords.map((p) => p[0]);
  const ys = coords.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};
const round = (x) => Math.round(x * 1000) / 1000;

/** The sides of a drawn triangle: [PQ, QR, RP], each its two letters. */
export const sidesOf = (names) => [names[0] + names[1], names[1] + names[2], names[2] + names[0]];
/** The key of a segment whichever way it is written: « QP » → « PQ ». */
const keyIn = (names, key) => sidesOf(names).find((s) => s === key || s === key.split('').reverse().join('')) ?? null;

/** One triangle's pieces of the spec: its segments (with labels, ticks), its written angles, its right-angle square. */
function piecesOf(t, shift, { ask = [] } = {}) {
  const [P, Q, R] = t.names;
  const points = Object.fromEntries(
    t.names.map((n, i) => [n, [round(t.coords[i][0] + shift[0]), round(t.coords[i][1] + shift[1])]]),
  );
  const segments = sidesOf(t.names).map((side) => {
    const label = (t.labels ?? {})[side] ?? (t.labels ?? {})[side.split('').reverse().join('')];
    const asked = ask.some((a) => keyIn(t.names, a) === side);
    return {
      from: side[0],
      to: side[1],
      tone: asked ? 'rose' : 'indigo',
      ...(asked ? { bold: true, label: '?' } : label != null ? { label: String(label) } : {}),
      ...(t.ticks?.[side] ? { ticks: t.ticks[side] } : {}),
    };
  });
  const neighbours = { [P]: [Q, R], [Q]: [R, P], [R]: [P, Q] };
  // an angle: its written value (or none: an arc alone) and its tone — `{ label, tone }` when it is the asked one
  const angles = Object.entries(t.angles ?? {}).map(([at, a]) => {
    const { label = '', tone = t.angleTone ?? 'emerald', radius } = typeof a === 'object' ? a : { label: a };
    return {
      at,
      from: neighbours[at][0],
      to: neighbours[at][1],
      ...(label ? { label } : {}),
      tone,
      ...(radius ? { radius } : {}),
    };
  });
  const rightAngles = t.right ? [[neighbours[t.right][0], t.right, neighbours[t.right][1]]] : [];
  return { points, segments, angles, rightAngles };
}

/** The radii tried for an angle's arc (GeoFigure's default is 20). */
const RADII = [6, 9, 12, 16, 20, 24, 28, 32, 36, 42];
/**
 * The box of a measure GeoFigure writes (font 12, anchored at its middle, on its baseline): a digit ≈ 6.7 units, « ° »
 * and « , » ≈ 4.5, and 1.5 units of air all round.
 */
const labelBox = ([x, y], text) => {
  const w = [...String(text)].reduce((t, ch) => t + (/\d/.test(ch) ? 6.7 : 4.5), 0) + 3;
  return { x0: x - w / 2, x1: x + w / 2, y0: y - 10.5, y1: y + 2 };
};
const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
/** Does the segment pq cross the box (sampled: the drawing only)? */
const crosses = (b, p, q) => {
  for (let i = 0; i <= 200; i += 1) {
    const [x, y] = [p[0] + ((q[0] - p[0]) * i) / 200, p[1] + ((q[1] - p[1]) * i) / 200];
    if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1) return true;
  }
  return false;
};
/** Is the point inside the triangle abc? */
const inside = (pt, [a, b, c]) => {
  const side = (p, q) => (q[0] - p[0]) * (pt[1] - p[1]) - (q[1] - p[1]) * (pt[0] - p[0]);
  const [d1, d2, d3] = [side(a, b), side(b, c), side(c, a)];
  return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0);
};

/**
 * Each written angle measure inside its own angle, clear of every side and of the other measures: GeoFigure's own
 * placement when it holds, else a radius of `RADII` for each, the nearest to GeoFigure's 20 (a search with bounds — a
 * figure has at most six measures). When no placement holds them all, the figure is left as it was.
 */
function fitAngleLabels(spec) {
  if (!(spec.angles ?? []).some((g) => g.label)) return spec;
  const L = layoutGeoFigure(spec);
  const width = (g) => {
    const [v, a, b] = [L.P[g.at], L.P[g.from], L.P[g.to]];
    const d = Math.atan2(b[1] - v[1], b[0] - v[0]) - Math.atan2(a[1] - v[1], a[0] - v[0]);
    return Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
  };
  const order = spec.angles.map((g, i) => i).filter((i) => spec.angles[i].label);
  order.sort((i, j) => width(spec.angles[j]) - width(spec.angles[i]));
  // for each labelled angle, the radii whose box stands inside its angle and crosses no side (in the order tried)
  const options = order.map((i) => {
    const g = spec.angles[i];
    const tri = [L.P[g.at], L.P[g.from], L.P[g.to]];
    return RADII.map((r) => ({ r, b: labelBox(angleArc(L.P[g.from], L.P[g.at], L.P[g.to], r).label, g.label) }))
      .filter(({ b }) => inside([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2], tri))
      .filter(({ b }) => !spec.segments.some((s) => crosses(b, L.P[s.from], L.P[s.to])));
  });
  // GeoFigure's own placement when it holds (a figure that already fits does not change), else the one nearest it (the
  // least sum of |r − 20|), each measure clear of the others
  const asIs = order.map((i) => options[order.indexOf(i)].find((o) => o.r === (spec.angles[i].radius ?? 20)));
  if (asIs.every(Boolean) && asIs.every((o, k) => asIs.slice(0, k).every((c) => !overlaps(c.b, o.b)))) return spec;
  let best = null;
  const chosen = [];
  const search = (k, cost) => {
    if (best && cost >= best.cost) return;
    if (k === order.length) {
      best = { cost, picks: [...chosen] };
      return;
    }
    for (const o of options[k]) {
      if (chosen.some((c) => overlaps(c.b, o.b))) continue;
      chosen.push(o);
      search(k + 1, cost + Math.abs(o.r - 20));
      chosen.pop();
    }
  };
  search(0, 0);
  if (!best) return spec;
  const angles = [...spec.angles];
  order.forEach((i, k) => {
    const g = spec.angles[i];
    if (best.picks[k].r !== (g.radius ?? 20)) angles[i] = { ...g, radius: best.picks[k].r };
  });
  return { ...spec, angles };
}

/** The scene of two triangles apart, as a GeoFigure spec. */
export function sceneOf({ one, two = null, layout = 'side', gap = 0.45, ask = [], aria }) {
  const b1 = box(one.coords);
  const [w1, h1] = [b1.x1 - b1.x0, b1.y1 - b1.y0];
  const left = piecesOf(one, [-b1.x0, -b1.y0], { ask: ask.filter((a) => keyIn(one.names, a)) });
  let right = { points: {}, segments: [], angles: [], rightAngles: [] };
  if (two) {
    const b2 = box(two.coords);
    const [w2, h2] = [b2.x1 - b2.x0, b2.y1 - b2.y0];
    const space = gap * Math.max(w1, w2, h1, h2);
    // 'diag': the second below the first and half a width to its right — two flat triangles drawn larger than side by side
    const at2 =
      layout === 'stack'
        ? [-b2.x0, h1 + space - b2.y0]
        : layout === 'diag'
          ? [w1 / 2 - b2.x0, -space - b2.y1]
          : [w1 + space - b2.x0, -b2.y0];
    right = piecesOf(two, at2, { ask: ask.filter((a) => keyIn(two.names, a)) });
  }
  return fitAngleLabels({
    points: { ...left.points, ...right.points },
    segments: [...left.segments, ...right.segments],
    angles: [...left.angles, ...right.angles],
    rightAngles: [...left.rightAngles, ...right.rightAngles],
    ariaLabel: aria,
  });
}
