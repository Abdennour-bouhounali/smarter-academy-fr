/**
 * labelLayout — placement SANS COLLISION des étiquettes du plan à deux droites.
 *
 * Règle (INTERACTION_PEDAGOGY §17bis) : tout état valide a un affichage
 * valide. Les seuls textes SVG sont « (d₁) », « (d₂) », « A », « B », « I » —
 * tous les NOMBRES vivent dans le DOM, hors du dessin. Chaque étiquette
 * choisit, parmi des candidats ordonnés, la première boîte qui est dans le
 * cadre et libre de : les deux cordes, les flèches, les disques des poignées,
 * les bandes de graduations des deux axes, les noms d'axes, le « O », et les
 * étiquettes déjà posées. Faute de place, l'étiquette est ABANDONNÉE (le DOM
 * identifie toujours la droite) — jamais superposée.
 *
 * Tout est en pixels SVG (y vers le bas). Pur, testé par balayage.
 */
import { clipLine, fracValue } from './droitesUtils';

const GLYPH_W = { ',': 3, '−': 5.5, '-': 5.5, '.': 3, '(': 4, ')': 4, ' ': 3, ';': 3, '₁': 4.5, '₂': 4.5 };
/** Largeur estimée d'un texte en police mono/sans, mesurée par glyphe. */
export const estimateTextWidth = (str, size = 10) =>
  [...String(str)].reduce((n, c) => n + (GLYPH_W[c] ?? size * 0.62), 0);

export const labelSize = (text, size) => ({ width: estimateTextWidth(text, size) + 2, height: size * 1.15 });

/* ── Géométrie de boîtes ─────────────────────────────────────────────── */

export function rectsOverlap(a, b, gap = 0) {
  return a.x < b.x + b.width + gap && b.x < a.x + a.width + gap
    && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;
}
export function boxInside(box, frame, margin = 2) {
  return box.x >= margin && box.y >= margin
    && box.x + box.width <= frame.width - margin && box.y + box.height <= frame.height - margin;
}
/** Le segment [p, q] touche-t-il le rectangle r gonflé de `margin` ? (Liang–Barsky) */
export function segmentHitsRect(p, q, r, margin = 0) {
  const xMin = r.x - margin; const xMax = r.x + r.width + margin;
  const yMin = r.y - margin; const yMax = r.y + r.height + margin;
  const dx = q.x - p.x; const dy = q.y - p.y;
  let t0 = 0; let t1 = 1;
  const edge = (num, den) => {
    if (Math.abs(den) < 1e-12) return num <= 0;
    const t = num / den;
    if (den > 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    return true;
  };
  return edge(xMin - p.x, dx) && edge(p.x - xMax, -dx) && edge(yMin - p.y, dy) && edge(p.y - yMax, -dy);
}
export function circleHitsRect(c, r, box, gap = 0) {
  const cx = Math.max(box.x, Math.min(c.x, box.x + box.width));
  const cy = Math.max(box.y, Math.min(c.y, box.y + box.height));
  return Math.hypot(c.x - cx, c.y - cy) < r + gap;
}

/** Une boîte est libre si elle n'intersecte aucun obstacle. */
export function isFree(box, obstacles) {
  for (const r of obstacles.rects) if (rectsOverlap(box, r, 1.5)) return false;
  for (const s of obstacles.segments) if (segmentHitsRect(s.p, s.q, box, s.margin ?? 3)) return false;
  for (const d of obstacles.discs) if (circleHitsRect(d.c, d.r, box, 2)) return false;
  return true;
}

/* ── Placement ───────────────────────────────────────────────────────── */

const T_ALONG = [0.07, 0.93, 0.13, 0.87, 0.2, 0.8, 0.3, 0.7, 0.4, 0.6, 0.5];

/** Étiquette d'une corde [p, q] : de préférence près d'une extrémité, d'un côté. */
export function placeAlongLine(p, q, size, obstacles, frame, offset = 9) {
  const dx = q.x - p.x; const dy = q.y - p.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return null;
  const n = { x: -dy / len, y: dx / len };
  const reach = offset + Math.abs(n.x) * size.width / 2 + Math.abs(n.y) * size.height / 2;
  for (const t of T_ALONG) {
    const P = { x: p.x + t * dx, y: p.y + t * dy };
    for (const side of [1, -1]) {
      const cx = P.x + side * n.x * reach;
      const cy = P.y + side * n.y * reach;
      const box = { x: cx - size.width / 2, y: cy - size.height / 2, ...size };
      if (boxInside(box, frame) && isFree(box, obstacles)) return box;
    }
  }
  return null;
}

const DIRS = [[1, -1], [-1, -1], [1, 1], [-1, 1], [1, 0], [-1, 0], [0, -1], [0, 1]];

/**
 * Étiquette d'un point : huit directions autour du centre, à distance
 * croissante.
 *
 * L'anneau le plus proche est essayé d'abord, dans les huit directions ; on
 * ne s'éloigne que si aucune n'est libre. L'étiquette reste donc au plus près
 * de son point, mais elle n'est plus ABANDONNÉE parce qu'un seul rayon a été
 * tenté : le point d'intersection, cerné par deux cordes et quatre poignées,
 * échouait ainsi dans 7 699 scènes du balayage alors que 7 697 d'entre elles
 * offraient une place à peine plus loin.
 */
export function placeAroundPoint(c, size, obstacles, frame, gap = 9) {
  for (const ring of [1, 1.6, 2.4, 3.4]) {
    for (const [dx, dy] of DIRS) {
      const g = (dx && dy ? gap * 0.8 : gap) * ring;
      const cx = c.x + dx * (g + size.width / 2);
      const cy = c.y + dy * (g + size.height / 2);
      const box = { x: cx - size.width / 2, y: cy - size.height / 2, ...size };
      if (boxInside(box, frame) && isFree(box, obstacles)) return box;
    }
  }
  return null;
}

/* ── La scène : ce que CoordPlane dessine réellement ─────────────────── */

const fmtTick = (v) => String(v).replace('-', '−');

/**
 * Obstacles fixes du repère, reproduits d'après CoordPlane (graduations à
 * 10 px, noms d'axes à 13 px, « O » à 12 px). `every` = 2 quand le repère
 * est dense — passer la même valeur à CoordPlane (`labelEvery`).
 */
export function axisObstacles(geo, range, step, every, { axisNames = { x: 'x', y: 'y' }, showO = true } = {}) {
  const { toSvg } = geo;
  const O = toSvg(0, 0);
  const xEnd = toSvg(range.xMax, 0);
  const yEnd = toSvg(0, range.yMax);
  const rects = [];
  const ticks = (lo, hi) => { const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(v); return out; };
  ticks(range.xMin, range.xMax).forEach((v, i) => {
    if (v === 0 || i % every !== 0) return;
    const w = estimateTextWidth(fmtTick(v), 10);
    const p = toSvg(v, 0);
    rects.push({ x: p.x - w / 2, y: O.y + 7, width: w, height: 12, tag: `tick ${v}` });
  });
  ticks(range.yMin, range.yMax).forEach((v, i) => {
    if (v === 0 || i % every !== 0) return;
    const w = estimateTextWidth(fmtTick(v), 10);
    const p = toSvg(0, v);
    rects.push({ x: O.x - 8 - w, y: p.y - 5, width: w, height: 11, tag: `tick ${v}` });
  });
  const wx = estimateTextWidth(axisNames.x, 13);
  rects.push({ x: xEnd.x + 14 - wx / 2, y: O.y - 6, width: wx, height: 14, tag: 'nom x' });
  const wy = estimateTextWidth(axisNames.y, 13);
  rects.push({ x: O.x - wy / 2, y: yEnd.y - 23, width: wy, height: 14, tag: 'nom y' });
  // Pointes de flèches des axes.
  rects.push({ x: xEnd.x - 2, y: O.y - 5, width: 8, height: 10, tag: 'flèche x' });
  rects.push({ x: O.x - 5, y: yEnd.y - 6, width: 10, height: 8, tag: 'flèche y' });
  if (showO) rects.push({ x: O.x - 8 - 8, y: O.y + 6, width: 8, height: 12, tag: 'O' });
  return rects;
}

/**
 * Construit et place toute la scène.
 *
 * @param {object} geo       planeGeometry(range, unit, pad)
 * @param {object} range
 * @param {number} step      graduation
 * @param {object[]} lines   [{ id, name, line, tone, anchor?: {x,y}, vector?: {x,y} }] (coordonnées d'élève)
 * @param {object[]} handles [{ id, x, y }]  disques des poignées
 * @param {object[]} points  [{ id, name, x, y }] points nommés (A, B, I) — coordonnées d'élève (nombres)
 */
export function layoutScene({ geo, range, step, lines, handles = [], points = [], axisNames, showO = true }) {
  const { toSvg, width, height } = geo;
  const frame = { width, height };
  const every = Math.floor((range.xMax - range.xMin) / step) + 1 > 13 ? 2 : 1;
  const obstacles = { rects: axisObstacles(geo, range, step, every, { axisNames, showO }), segments: [], discs: [] };

  const chords = lines.map((l) => {
    const seg = clipLine(l.line, range);
    if (!seg) return { ...l, p: null, q: null };
    const p = toSvg(seg[0].x, seg[0].y);
    const q = toSvg(seg[1].x, seg[1].y);
    obstacles.segments.push({ p, q, margin: 3 });
    let arrow = null;
    if (l.anchor && l.vector) {
      const from = toSvg(l.anchor.x, l.anchor.y);
      const to = toSvg(l.anchor.x + l.vector.x, l.anchor.y + l.vector.y);
      arrow = { from, to };
      obstacles.segments.push({ p: from, q: to, margin: 5 });
    }
    return { ...l, p, q, arrow };
  });
  const discs = handles.map((h) => { const c = toSvg(h.x, h.y); obstacles.discs.push({ c, r: 8 }); return { id: h.id, c }; });

  // Tous les disques sont des obstacles AVANT la première étiquette : un nom
  // posé tôt ne doit pas recouvrir un point ajouté après lui.
  const named = points.map((pt) => ({ ...pt, c: toSvg(pt.x, pt.y) }));
  for (const pt of named) obstacles.discs.push({ c: pt.c, r: 7 });
  // ORDRE DE POSE — le premier servi est le plus contraint, pas le premier
  // déclaré. Le point d'intersection est cerné par DEUX cordes et par les
  // poignées des deux droites : c'est la position la plus encombrée du plan,
  // et c'est aussi le point que la leçon veut nommer. Posé en dernier, son
  // étiquette cédait la place dans 92 % des cas perdus. On sert donc d'abord
  // les points les plus contraints, l'ordre de rendu restant celui déclaré.
  const crowding = (pt) => obstacles.segments.reduce(
    (k, sg) => k + (segmentHitsRect(sg.p, sg.q, { x: pt.c.x - 26, y: pt.c.y - 13, width: 52, height: 26 }) ? 1 : 0),
    0,
  );
  const order = named
    .map((pt, i) => ({ pt, i, k: crowding(pt) }))
    .sort((a, b) => b.k - a.k || a.i - b.i);
  const boxes = new Map();
  for (const { pt } of order) {
    const size = labelSize(pt.name, 14);
    const box = placeAroundPoint(pt.c, size, obstacles, frame, 12);
    if (box) obstacles.rects.push({ ...box, tag: pt.name });
    boxes.set(pt.id, box ?? null);
  }
  const pointLabels = named.map((pt) => ({ id: pt.id, name: pt.name, c: pt.c, box: boxes.get(pt.id) }));
  const lineLabels = [];
  for (const l of chords) {
    if (!l.p) { lineLabels.push({ id: l.id, name: l.name, box: null }); continue; }
    const size = labelSize(l.name, 12);
    const box = placeAlongLine(l.p, l.q, size, obstacles, frame, 8);
    if (box) obstacles.rects.push({ ...box, tag: l.name });
    lineLabels.push({ id: l.id, name: l.name, tone: l.tone, box });
  }
  return { chords, discs, pointLabels, lineLabels, obstacles, every, frame };
}

export const pointOfFrac = (P) => ({ x: fracValue(P.x), y: fracValue(P.y) });
