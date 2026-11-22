/**
 * La géométrie d'une FIGURE DÉCLARATIVE — points nommés, segments, droites, demi-droites, angles —
 * dessinée par GeoFigure.jsx dans une leçon ET dans un énoncé de pratique (`statement.figure`).
 * Née avec l'unité 9 « خاصية طالس » (2026-10-02) : un exercice de géométrie qui dit « في الشكل
 * المقابل » doit MONTRER le shape, et la pratique n'avait que CoordPlane (un repère, des axes).
 *
 * La donnée est en unités libres, y vers le HAUT ; ce module calcule l'échelle, la viewBox, la place
 * des étiquettes (hors du polygone, loin du centre de gravité) — sans DOM, donc testable et réutilisé
 * par le validateur des exercices (`validateGeoFigure`).
 *
 *   {
 *     points: { A: [0, 4], B: [-2, 0], C: [3, 0], M: [-1, 2], N: [1.5, 2] },
 *     segments: [['A', 'B'], { from: 'B', to: 'C', label: '10' }, { from: 'M', to: 'N', label: 'x', arrows: 1 }],
 *     lines: [{ through: ['A', 'B'], name: '(d)' }],      rays: [{ from: 'A', through: 'x' }],
 *     polygons: [{ points: ['A', 'M', 'N'], tone: 'indigo' }],
 *     rightAngles: [['B', 'H', 'A']],                    angles: [{ at: 'P', from: 'N', to: 'O', label: '40°' }],
 *     labels: { A: 'n' },  hidden: ['x'],  ariaLabel: 'مثلث ABC و (MN) يوازي (BC)'
 *   }
 *
 * Unités 11–12 « الأشعة » (2026-10-04) : `vectors: [{ from: 'A', to: 'B', label: 'u', tone: 'rose' }]` — une flèche
 * (pointe en `to`), son nom surmonté d'une petite flèche (le \vec du manuel) ; `grid: true` (ou `{ step: 0.5 }`) — le
 * papier quadrillé du manuel, aligné sur les coordonnées entières (multiples de `step`) sous toute la figure.
 * Unité 12 « الأشعة في معلم » : `axes: true` (ou `{ every: 2 }`) — les deux axes du معلم passant par l'origine (le cadre
 * la contient), flèche au bout positif, graduations entières (sauf 0 ; omises sous un nom de point). Nommer O, I, J reste
 * l'affaire de la figure (des points ordinaires).
 * Unité 13 « الدوران - الزوايا - المضلّعات المنتظمة » : un arc CENTRÉ `arcs: [{ center: 'O', from: 'M', to: 'M2', sweep: 'ccw',
 * arrow: true, label: '70°' }]` (le chemin de M vers M′ autour de O, l'arc intercepté d'un angle inscrit) ; `angles[].arrow`
 * (une pointe au bout `to` : le sens du دوران) ; `circles: [{ center: 'O', radius: 3 }]` (un rayon en unités de la figure).
 */
export const GEO_FIGURE_KEYS = Object.freeze([
  'points', 'segments', 'lines', 'rays', 'polygons', 'rightAngles', 'angles', 'labels', 'hidden',
  'ariaLabel', 'maxWidth', 'caption', 'vectors', 'grid', 'axes', 'arcs', 'circles',
]);
export const GEO_TONES = Object.freeze(['slate', 'indigo', 'rose', 'emerald', 'amber', 'sky', 'violet']);
const DIRS = { n: [0, 1], s: [0, -1], e: [1, 0], w: [-1, 0], ne: [0.71, 0.71], nw: [-0.71, 0.71], se: [0.71, -0.71], sw: [-0.71, -0.71] };

const asSegment = (s) => (Array.isArray(s) ? { from: s[0], to: s[1] } : s);
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const len = (v) => Math.hypot(v[0], v[1]);
const unit = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };

/** Toutes les erreurs d'une figure (clés inconnues, point inconnu, ton inconnu, ariaLabel manquant). */
export function validateGeoFigure(fig) {
  const errors = [];
  if (!fig || typeof fig !== 'object') return ['figure absente'];
  for (const k of Object.keys(fig)) if (!GEO_FIGURE_KEYS.includes(k)) errors.push(`clé inconnue « ${k} »`);
  const pts = fig.points ?? {};
  const names = Object.keys(pts);
  if (names.length < 2) errors.push('au moins deux points');
  for (const [n, p] of Object.entries(pts)) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite)) errors.push(`point ${n} : [x, y] numériques`);
  }
  const need = (n, where) => { if (!names.includes(n)) errors.push(`${where} : point inconnu « ${n} »`); };
  const tone = (t, where) => { if (t != null && !GEO_TONES.includes(t)) errors.push(`${where} : ton inconnu « ${t} »`); };
  (fig.segments ?? []).forEach((s, i) => { const g = asSegment(s); need(g.from, `segments[${i}]`); need(g.to, `segments[${i}]`); tone(g.tone, `segments[${i}]`); });
  (fig.lines ?? []).forEach((l, i) => { (l.through ?? []).forEach((n) => need(n, `lines[${i}]`)); if ((l.through ?? []).length !== 2) errors.push(`lines[${i}] : through = deux points`); tone(l.tone, `lines[${i}]`); });
  (fig.rays ?? []).forEach((r, i) => { need(r.from, `rays[${i}]`); need(r.through, `rays[${i}]`); tone(r.tone, `rays[${i}]`); });
  (fig.polygons ?? []).forEach((p, i) => { (p.points ?? []).forEach((n) => need(n, `polygons[${i}]`)); tone(p.tone, `polygons[${i}]`); });
  (fig.vectors ?? []).forEach((v, i) => { need(v.from, `vectors[${i}]`); need(v.to, `vectors[${i}]`); tone(v.tone, `vectors[${i}]`); if (v.from === v.to) errors.push(`vectors[${i}] : from = to`); });
  if (fig.grid != null && fig.grid !== true && fig.grid !== false && !(fig.grid && Number(fig.grid.step) > 0)) errors.push('grid : true ou { step > 0 }');
  if (fig.axes != null && fig.axes !== true && fig.axes !== false && !(fig.axes && typeof fig.axes === 'object' && (fig.axes.every == null || Number(fig.axes.every) > 0))) errors.push('axes : true ou { every > 0 }');
  (fig.rightAngles ?? []).forEach((a, i) => { if (!Array.isArray(a) || a.length !== 3) errors.push(`rightAngles[${i}] : trois points`); else a.forEach((n) => need(n, `rightAngles[${i}]`)); });
  (fig.angles ?? []).forEach((a, i) => ['at', 'from', 'to'].forEach((k) => need(a[k], `angles[${i}].${k}`)));
  for (const n of Object.keys(fig.labels ?? {})) { need(n, 'labels'); if (!DIRS[fig.labels[n]]) errors.push(`labels.${n} : direction inconnue`); }
  (fig.arcs ?? []).forEach((a, i) => { if (a.center != null) need(a.center, `arcs[${i}].center`); need(a.from, `arcs[${i}]`); need(a.to, `arcs[${i}]`); tone(a.tone, `arcs[${i}]`); if (a.from === a.to) errors.push(`arcs[${i}] : from = to`); if (a.sweep != null && !['cw', 'ccw'].includes(a.sweep)) errors.push(`arcs[${i}] : sweep = cw ou ccw`); });
  (fig.circles ?? []).forEach((c, i) => {
    need(c.center, `circles[${i}]`); tone(c.tone, `circles[${i}]`);
    if (c.radius != null) { if (!(Number(c.radius) > 0)) errors.push(`circles[${i}] : radius > 0`); } else { need(c.through, `circles[${i}]`); if (c.center === c.through) errors.push(`circles[${i}] : center = through`); }
  });
  (fig.hidden ?? []).forEach((n) => need(n, 'hidden'));
  if (typeof fig.ariaLabel !== 'string' || !/[؀-ۿ]/.test(fig.ariaLabel)) errors.push('ariaLabel arabe obligatoire');
  return errors;
}

/**
 * La mise en page : échelle (la plus grande dimension ≈ `size` px), viewBox, coordonnées SVG
 * (y vers le bas) de chaque point, position de chaque étiquette de point et de longueur.
 */
export function layoutGeoFigure(fig, { size = 300, pad = 34 } = {}) {
  const pts = fig.points ?? {};
  const names = Object.keys(pts);
  const xs = names.map((n) => pts[n][0]);
  const ys = names.map((n) => pts[n][1]);
  // Les droites et demi-droites dépassent leurs points : on les inclut dans le cadre.
  const extra = [];
  for (const l of fig.lines ?? []) {
    const [p, q] = l.through.map((n) => pts[n]);
    const [a, b] = Array.isArray(l.extend) ? l.extend : [l.extend ?? 0.3, l.extend ?? 0.3];
    const d = sub(q, p);
    extra.push([p[0] - a * d[0], p[1] - a * d[1]], [q[0] + b * d[0], q[1] + b * d[1]]);
  }
  for (const r of fig.rays ?? []) {
    const p = pts[r.from]; const q = pts[r.through]; const d = sub(q, p); const e = r.extend ?? 0.25;
    extra.push([q[0] + e * d[0], q[1] + e * d[1]]);
  }
  const step = fig.grid && fig.grid !== true ? Number(fig.grid.step) : 1;
  // Les axes (unité 12 « الأشعة في معلم ») passent par l'origine : le cadre la contient toujours.
  if (fig.axes) extra.push([0, 0]);
  // Les demi-cercles et cercles (unité 12, أدمج تعلّماتي) dépassent leurs points : leur tracé entre dans le cadre.
  for (const a of fig.arcs ?? []) {
    extra.push(...(a.center != null ? centeredArcPoints(pts[a.center], pts[a.from], pts[a.to], a.sweep ?? 'ccw', 12) : semicirclePoints(pts[a.from], pts[a.to], a.sweep ?? 'cw', 8)));
  }
  for (const c of fig.circles ?? []) {
    const o = pts[c.center]; const r = circleRadius(c, pts);
    extra.push([o[0] - r, o[1]], [o[0] + r, o[1]], [o[0], o[1] - r], [o[0], o[1] + r]);
  }
  const allX = [...xs, ...extra.map((p) => p[0])];
  const allY = [...ys, ...extra.map((p) => p[1])];
  let minX = Math.min(...allX); let maxX = Math.max(...allX);
  let minY = Math.min(...allY); let maxY = Math.max(...allY);
  // Le quadrillage : le cadre s'élargit d'une demi-maille et s'aligne sur la maille.
  if (fig.grid) {
    minX = Math.floor(minX / step - 0.5) * step; maxX = Math.ceil(maxX / step + 0.5) * step;
    minY = Math.floor(minY / step - 0.5) * step; maxY = Math.ceil(maxY / step + 0.5) * step;
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const s = size / span;
  const to = ([x, y]) => [pad + (x - minX) * s, pad + (maxY - y) * s];
  const P = Object.fromEntries(names.map((n) => [n, to(pts[n])]));
  const width = (maxX - minX) * s + 2 * pad;
  const height = (maxY - minY) * s + 2 * pad;

  // Étiquettes de points : à l'opposé du centre de gravité (ou direction imposée).
  const cx = names.reduce((t, n) => t + P[n][0], 0) / names.length;
  const cy = names.reduce((t, n) => t + P[n][1], 0) / names.length;
  const pointLabels = Object.fromEntries(names.map((n) => {
    const forced = fig.labels?.[n];
    let dir;
    if (forced) dir = [DIRS[forced][0], -DIRS[forced][1]];
    else { const v = sub(P[n], [cx, cy]); dir = len(v) < 1e-6 ? [0, -1] : unit(v); }
    return [n, [P[n][0] + dir[0] * 15, P[n][1] + dir[1] * 15 + 5]];
  }));

  // Étiquettes de longueur : au milieu, décalées du côté opposé au centre de gravité. Le décalage tient compte de la
  // TAILLE du texte (2026-10-08) : centré à 13 px d'un segment vertical, « 3,06 m » (≈ 40 px de large) retombait à
  // moitié sur le trait. On écarte le CENTRE du texte de sa demi-largeur (ou demi-hauteur) projetée sur la normale.
  const segmentLabel = (from, to2, side, text = '') => {
    const a = P[from]; const b = P[to2];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let nrm = unit([-(b[1] - a[1]), b[0] - a[0]]);
    if (side == null) { const toC = sub([cx, cy], m); if (nrm[0] * toC[0] + nrm[1] * toC[1] > 0) nrm = [-nrm[0], -nrm[1]]; } else if (side < 0) nrm = [-nrm[0], -nrm[1]];
    const halfW = (String(text).length * 7.4) / 2; // police 13, chiffres et lettres latines ≈ 0,57 em
    const halfH = 7;
    // Jamais moins que l'ancien 13 px : les étiquettes courtes (« x », « 3 ») ne bougent pas.
    const off = Math.max(13, 7 + Math.abs(nrm[0]) * halfW + Math.abs(nrm[1]) * halfH);
    // (x, y) = centre du texte ; +4,5 : la ligne de base sous le centre (text-anchor="middle").
    return [m[0] + nrm[0] * off, m[1] + nrm[1] * off + 4.5];
  };
  const lineEnds = (l) => {
    const [p, q] = l.through.map((n) => P[n]);
    const [a, b] = Array.isArray(l.extend) ? l.extend : [l.extend ?? 0.3, l.extend ?? 0.3];
    const d = sub(q, p);
    return [[p[0] - a * d[0], p[1] - a * d[1]], [q[0] + b * d[0], q[1] + b * d[1]]];
  };
  const rayEnd = (r) => { const p = P[r.from]; const q = P[r.through]; const d = sub(q, p); const e = r.extend ?? 0.25; return [q[0] + e * d[0], q[1] + e * d[1]]; };
  const gridLines = [];
  if (fig.grid) {
    for (let x = minX; x <= maxX + 1e-9; x += step) gridLines.push([to([x, minY]), to([x, maxY])]);
    for (let y = minY; y <= maxY + 1e-9; y += step) gridLines.push([to([minX, y]), to([maxX, y])]);
  }
  // Les AXES du repère (unité 12, 2026-10-04) : `axes: true` ou `{ every: 2 }` — l'axe des abscisses (y = 0) et l'axe des
  // ordonnées (x = 0) sur tout le cadre, une flèche au bout positif, un trait à chaque unité et une graduation tous les
  // `every` (sauf 0). Une graduation qui tomberait sur un nom de point ou sur un point est omise : les noms restent libres.
  let axes = null;
  if (fig.axes) {
    const every = fig.axes === true ? 1 : Number(fig.axes.every ?? 1);
    const ticks = [];
    const helpers = new Set(fig.hidden ?? []);
    const free = (q) => names.every((n) => helpers.has(n) || Math.hypot(q[0] - pointLabels[n][0], q[1] - 4 - pointLabels[n][1]) >= 12
      && Math.hypot(q[0] - P[n][0], q[1] - 4 - P[n][1]) >= 12);
    const fmt = (v) => String(v).replace('-', '−');
    const first = Math.ceil(minX); const last = Math.floor(maxX);
    for (let x = first; x <= last; x += 1) {
      if (x === 0 || x >= maxX - 1e-9) continue;
      const at = to([x, 0]);
      const label = x % every === 0 ? [at[0], at[1] + 14] : null;
      ticks.push({ axis: 'x', at, label: label && free(label) ? label : null, text: fmt(x) });
    }
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y += 1) {
      if (y === 0 || y >= maxY - 1e-9) continue;
      const at = to([0, y]);
      const label = y % every === 0 ? [at[0] - 6, at[1] + 4] : null;
      ticks.push({ axis: 'y', at, label: label && free(label) ? label : null, text: fmt(y) });
    }
    axes = { x: [to([minX, 0]), to([maxX, 0])], y: [to([0, minY]), to([0, maxY])], ticks };
  }
  // Le CADRE tient aussi les étiquettes de longueur (2026-10-08) : écartée d'un segment vertical posé au bord,
  // « 3,06 m » sortait du dessin et perdait son « m ». La viewBox s'élargit jusqu'à couvrir chaque boîte de texte.
  let [vx0, vy0, vx1, vy1] = [0, 0, width, height];
  for (const s0 of fig.segments ?? []) {
    const sg = asSegment(s0);
    if (sg.label == null || !P[sg.from] || !P[sg.to]) continue;
    const [lx, ly] = segmentLabel(sg.from, sg.to, sg.labelSide, sg.label);
    const halfW = (String(sg.label).length * 7.4) / 2;
    vx0 = Math.min(vx0, lx - halfW - 4); vx1 = Math.max(vx1, lx + halfW + 4);
    vy0 = Math.min(vy0, ly - 4.5 - 9); vy1 = Math.max(vy1, ly - 4.5 + 9);
  }
  const viewBox = [vx0, vy0, vx1 - vx0, vy1 - vy0];
  return { P, width, height, viewBox, scale: s, pointLabels, segmentLabel, lineEnds, rayEnd, center: [cx, cy], gridLines, axes };
}

/**
 * Les DEMI-CERCLES et CERCLES (unité 12, « أدمج تعلّماتي » : la وضعية des deux coureurs, 2026-10-04) —
 *   `arcs: [{ from: 'A', to: 'O', sweep: 'cw', tone, dashed, bold }]` : le demi-cercle de DIAMÈTRE [from, to] (son centre est le
 *   milieu), parcouru de `from` vers `to` dans le sens des aiguilles d'une montre (`cw`) ou dans l'autre (`ccw`), tel qu'on le
 *   VOIT sur la figure (y vers le haut) : de (−2 ; 0) à (0 ; 0), `cw` passe par le haut (−1 ; 1) ;
 *   `circles: [{ center: 'I', through: 'A', tone, dashed }]` : un cercle entier (le rayon est IA).
 * Leurs points entrent dans le cadre de la figure. Données en unités libres (y vers le haut), comme les points.
 */
export function semicirclePoints(a, b, sweep = 'cw', n = 16) {
  const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = sub(a, c);
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (Math.PI * i) / n; const co = Math.cos(t); const si = Math.sin(t);
    return sweep === 'cw' ? [c[0] + d[0] * co + d[1] * si, c[1] - d[0] * si + d[1] * co] : [c[0] + d[0] * co - d[1] * si, c[1] + d[0] * si + d[1] * co];
  });
}
/** Le chemin SVG d'un demi-cercle de `a` vers `b` (coordonnées SVG, y vers le bas) : `cw` = sens des aiguilles d'une montre à l'écran. */
export function semicirclePath(a, b, sweep = 'cw') {
  const r = len(sub(b, a)) / 2;
  return `M ${a[0]} ${a[1]} A ${r} ${r} 0 0 ${sweep === 'cw' ? 1 : 0} ${b[0]} ${b[1]}`;
}

/** Le rayon d'un cercle de la figure : `radius` (unités de la figure) ou la distance centre → `through`. */
export const circleRadius = (c, pts) => (c.radius != null ? Number(c.radius) : len(sub(pts[c.through], pts[c.center])));

/**
 * Un arc CENTRÉ (unité 13) en unités de la figure (y vers le HAUT) : de `a` autour du centre `o`, rayon |oa|, jusqu'à la
 * direction de `b`, dans le sens `sweep` tel qu'on le VOIT (`ccw` = le sens direct du manuel, `cw` = indirect).
 */
export function centeredArcPoints(o, a, b, sweep = 'ccw', n = 16) {
  const r = len(sub(a, o));
  const t0 = Math.atan2(a[1] - o[1], a[0] - o[0]);
  const t1 = Math.atan2(b[1] - o[1], b[0] - o[0]);
  let d = sweep === 'ccw' ? t1 - t0 : t0 - t1;
  while (d <= 0) d += 2 * Math.PI;
  while (d > 2 * Math.PI) d -= 2 * Math.PI;
  const sg = sweep === 'ccw' ? 1 : -1;
  return Array.from({ length: n + 1 }, (_, i) => { const t = t0 + (sg * d * i) / n; return [o[0] + r * Math.cos(t), o[1] + r * Math.sin(t)]; });
}
/**
 * Le même arc en coordonnées SVG (y vers le BAS) : chemin, pointe de flèche à l'arrivée (si demandée) et place d'une
 * étiquette au milieu de l'arc, à l'extérieur. `cw` à l'écran = angle SVG croissant.
 */
export function centeredArc(o, a, b, sweep = 'ccw', { head = 9, labelOffset = 14 } = {}) {
  const r = len(sub(a, o));
  const t0 = Math.atan2(a[1] - o[1], a[0] - o[0]);
  const t1 = Math.atan2(b[1] - o[1], b[0] - o[0]);
  const sg = sweep === 'cw' ? 1 : -1; // SVG : y vers le bas
  let d = sg > 0 ? t1 - t0 : t0 - t1;
  while (d <= 0) d += 2 * Math.PI;
  while (d > 2 * Math.PI) d -= 2 * Math.PI;
  const te = t0 + sg * d;
  const end = [o[0] + r * Math.cos(te), o[1] + r * Math.sin(te)];
  const path = `M ${a[0]} ${a[1]} A ${r} ${r} 0 ${d > Math.PI ? 1 : 0} ${sg > 0 ? 1 : 0} ${end[0]} ${end[1]}`;
  const tan = [-Math.sin(te) * sg, Math.cos(te) * sg];
  const nrm = [-tan[1], tan[0]];
  const foot = [end[0] - tan[0] * head, end[1] - tan[1] * head];
  const w = head * 0.45;
  const arrow = [end, [foot[0] + nrm[0] * w, foot[1] + nrm[1] * w], [foot[0] - nrm[0] * w, foot[1] - nrm[1] * w]];
  const tm = t0 + (sg * d) / 2;
  const label = [o[0] + (r + labelOffset) * Math.cos(tm), o[1] + (r + labelOffset) * Math.sin(tm) + 4];
  return { path, arrow, label, end };
}

/** Les petits traits d'égalité (1 à 3) au milieu d'un segment, en coordonnées SVG. */
export function tickMarks(a, b, count = 1) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const t = unit(sub(b, a)); const n = [-t[1], t[0]];
  return Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * 5;
    const c = [m[0] + t[0] * off, m[1] + t[1] * off];
    return [[c[0] - n[0] * 6, c[1] - n[1] * 6], [c[0] + n[0] * 6, c[1] + n[1] * 6]];
  });
}

/** Les chevrons de parallélisme (1 ou 2) au milieu d'un segment ou d'une droite. */
export function parallelArrows(a, b, count = 1) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const t = unit(sub(b, a)); const n = [-t[1], t[0]];
  return Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * 7;
    const tip = [m[0] + t[0] * (off + 4), m[1] + t[1] * (off + 4)];
    return [[tip[0] - t[0] * 7 + n[0] * 5, tip[1] - t[1] * 7 + n[1] * 5], tip, [tip[0] - t[0] * 7 - n[0] * 5, tip[1] - t[1] * 7 - n[1] * 5]];
  });
}

/** Le carré d'angle droit au sommet `v` entre les directions vers `a` et `b`. */
export function rightAngleSquare(a, v, b, size = 10) {
  const u1 = unit(sub(a, v)); const u2 = unit(sub(b, v));
  const p1 = [v[0] + u1[0] * size, v[1] + u1[1] * size];
  const p3 = [v[0] + u2[0] * size, v[1] + u2[1] * size];
  const p2 = [p1[0] + u2[0] * size, p1[1] + u2[1] * size];
  return [p1, p2, p3];
}

/** L'arc d'un angle (rayon r) au sommet `v` de `a` vers `b` (le petit arc), et la place de son étiquette. */
export function angleArc(a, v, b, r = 20) {
  const a1 = Math.atan2(a[1] - v[1], a[0] - v[0]);
  const a2 = Math.atan2(b[1] - v[1], b[0] - v[0]);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const start = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)];
  const end = [v[0] + r * Math.cos(a1 + d), v[1] + r * Math.sin(a1 + d)];
  const mid = a1 + d / 2;
  // La pointe (unité 13, `angles[].arrow`) : au bout `b`, tangente à l'arc dans le sens du parcours.
  const sg = d > 0 ? 1 : -1; const te = a1 + d;
  const tan = [-Math.sin(te) * sg, Math.cos(te) * sg]; const nrm = [-tan[1], tan[0]];
  const foot = [end[0] - tan[0] * 8, end[1] - tan[1] * 8];
  return {
    path: `M ${start[0]} ${start[1]} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${end[0]} ${end[1]}`,
    label: [v[0] + (r + 14) * Math.cos(mid), v[1] + (r + 14) * Math.sin(mid) + 4],
    arrow: [end, [foot[0] + nrm[0] * 3.6, foot[1] + nrm[1] * 3.6], [foot[0] - nrm[0] * 3.6, foot[1] - nrm[1] * 3.6]],
  };
}

/**
 * Une flèche de vecteur de `a` vers `b` (coordonnées SVG) : le trait s'arrête au pied de la pointe,
 * la pointe est un triangle plein de longueur `head`.
 */
export function vectorArrow(a, b, head = 10) {
  const t = unit(sub(b, a)); const n = [-t[1], t[0]];
  const l = Math.max(0, len(sub(b, a)) - head);
  const foot = [a[0] + t[0] * l, a[1] + t[1] * l];
  const w = head * 0.45;
  return { shaft: [a, foot], head: [b, [foot[0] + n[0] * w, foot[1] + n[1] * w], [foot[0] - n[0] * w, foot[1] - n[1] * w]] };
}

/**
 * La QUALITÉ d'une figure (règle du propriétaire, 2026-10-04 : « analyser le shape du manuel ; s'il est mal dessiné,
 * le redessiner avec le même concept ») rendue mesurable. Rend la liste des défauts, vide si la figure est lisible :
 *   - `aspect`  : une bande étroite (rapport des côtés > maxAspect, 2 par défaut) au lieu d'un bloc quasi carré — une figure
 *               de points ALIGNÉS est une bande par nature : l'appelant passe alors `{ maxAspect: Infinity }` et dit pourquoi ;
 *   - `label`   : deux noms de points qui se chevauchent, ou un nom posé sur un autre point (< minGap px à l'échelle `size`).
 * La mesure se fait sur la mise en page réelle (`layoutGeoFigure`, size 300).
 */
export function figureQuality(fig, { maxAspect = 2.0, minGap = 14, size = 300 } = {}) {
  const issues = [];
  const L = layoutGeoFigure(fig, { size });
  const ratio = Math.max(L.width, L.height) / Math.max(1, Math.min(L.width, L.height));
  if (ratio > maxAspect) issues.push(`aspect : ${ratio.toFixed(2)} > ${maxAspect} (bande étroite)`);
  const hidden = new Set(fig.hidden ?? []);
  const names = Object.keys(L.P).filter((n) => !hidden.has(n));
  for (let i = 0; i < names.length; i += 1) {
    for (let j = i + 1; j < names.length; j += 1) {
      const a = L.pointLabels[names[i]]; const b = L.pointLabels[names[j]];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < minGap) issues.push(`label : ${names[i]} / ${names[j]} se chevauchent`);
    }
    for (const n of names) {
      if (n === names[i]) continue;
      const a = L.pointLabels[names[i]]; const p = L.P[n];
      if (Math.hypot(a[0] - p[0], a[1] - 5 - p[1]) < minGap * 0.7) issues.push(`label : ${names[i]} posé sur le point ${n}`);
    }
  }
  return issues;
}
