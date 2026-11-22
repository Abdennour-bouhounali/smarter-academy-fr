import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as PR from '@smarter-academy/core/arithmetic/proportional.js';

/**
 * origin-line — LA DROITE ÉPINGLÉE À O (unité 6 « الدالة الخطية والتناسبية », leçon 3
 * « التمثيل البياني لدالة خطية وقراءته بيانيًا » ; réutilisée par les leçons 5 et 6).
 *
 * Toute la vérité vient de packages/core/arithmetic/proportional.js (sur les fractions EXACTES de
 * linear.js) : un point est sur la droite ⇔ `PR.onLine(a, x, y)` ; une image est `PR.image(a, x)`,
 * un antécédent `PR.antecedent(a, y)`, le sens `PR.direction(a)`. Aucun flottant ne décide rien :
 * les flottants ne servent qu'au DESSIN (pixels). Une position de la main est TOUJOURS ramenée à un
 * nœud d'une grille exacte (`snap`), de sorte que (1 ; 0,5), (−2/3 ; −3/2) ou 8,75 sont atteints
 * exactement, jamais « à peu près ».
 *
 * Quatre modes (le contrat de props est fixé par le brief de l'unité, §6 ; `pivot` est l'extension
 * de la leçon 3, le زالق de جيوجيبرا) :
 *   draw   O est épinglée ; l'élève pose des points (relâchement / Entrée / « ضع النقطة ») — un point
 *          hors de y = a·x est REFUSÉ avec son écart ; le premier point accepté trace la droite (OA) ;
 *          ensuite une sonde de lecture s'ouvre sur l'axe des abscisses (« … ثم اقرأ »).
 *   read   la droite est donnée ; une sonde glisse sur l'axe des abscisses (image) ou des ordonnées
 *          (antécédent) ; `reads` fixe des cibles (« x:4|y:3,5 ») ; `cap` une horizontale y = cap.
 *   fit    des points de données (`points`) ; l'élève fait pivoter la droite autour de O jusqu'à ce
 *          qu'elle passe par tous ; le lab écrit alors y = a·x (ou dit qu'aucune droite par O ne le peut).
 *   pivot  aucune cible : l'élève fait pivoter la droite ; le sens (monte / descend / horizontale)
 *          se lit sur le signe de a — la découverte demande a > 0 ET a < 0 (CONTRASTE).
 *
 * Un ESSAI est un geste VALIDÉ (relâchement, Entrée, bouton, pause du clavier) — pas une position
 * que le doigt traverse.
 */

const { frac, parseNumber, mul, div, sub, eq, isZero, cmp, toNumber, fracDecimal } = Lin;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

const MODES = Object.freeze(['draw', 'read', 'fit', 'pivot']);
export const THEMES = Object.freeze(['cablecar', 'spring', 'budget']);

/* ── lecture des props (chaînes écrites comme le manuel) ───────────────── */

/** « 0,5 », « -2 », « −3,2 », « 9/4 », « -2/3 » → fraction exacte. */
export function parseValue(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number') return Number.isInteger(raw) ? frac(raw) : parseNumber(String(raw));
  return parseNumber(String(raw).replace(/\s+/g, '').replace(/[−–]/g, '-'));
}

/** « 2:0,6|3:0,9 » → [{ x, y }] (fractions). */
export function parsePoints(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((p) => ({ x: F(p.x), y: F(p.y) }));
  return String(raw).split('|').filter(Boolean).map((s) => {
    const [x, y] = s.split(':');
    if (y == null) throw new Error(`origin-line : point illisible « ${s} »`);
    return { x: parseValue(x), y: parseValue(y) };
  });
}

/** « x:4|y:3,5 » → [{ axis: 'x' | 'y', v }]. */
export function parseReads(raw) {
  if (!raw) return [];
  return String(raw).split('|').filter(Boolean).map((s) => {
    const [axis, v] = s.split(':');
    if (axis !== 'x' && axis !== 'y') throw new Error(`origin-line : lecture illisible « ${s} »`);
    return { axis, v: parseValue(v) };
  });
}

/* ── petite arithmétique de grille (exacte) ────────────────────────────── */

const absF = (p) => (cmp(p, 0) < 0 ? sub(0, p) : F(p));
/** p est-il un multiple entier de s (s ≠ 0) ? */
export const isMultiple = (p, s) => F(div(p, s)).d === 1;

/** Le pas « rond » (1, 2, 2,5, 5 × 10^k) qui découpe `span` en au plus `maxTicks` graduations (entier dès 3 unités). */
export function niceStep(span, maxTicks = 10) {
  const s = Math.max(1e-9, Math.abs(toNumber(span)));
  for (let k = -3; k <= 6; k++) {
    for (const m of [1, 2, 2.5, 5]) {
      const st = m * 10 ** k;
      // une fenêtre d'au moins 3 unités se gradue en entiers (comme les figures du manuel)
      if (s / st <= maxTicks + 1e-9 && (st >= 1 || s < 3)) return parseValue(String(+st.toFixed(6)));
    }
  }
  return frac(10 ** 6);
}

const SUBDIVISIONS = [1, 2, 4, 5, 10, 3, 6, 8, 12, 20, 25, 50, 100];
/** La plus grande subdivision step / m (m dans SUBDIVISIONS) dont chaque valeur est un multiple. */
export function subdivide(step, values = []) {
  for (const m of SUBDIVISIONS) {
    const d = div(step, m);
    if (values.every((v) => v == null || isMultiple(v, d))) return d;
  }
  return div(step, 100);
}

/* ── la fenêtre ─────────────────────────────────────────────────────────── */

/**
 * La fenêtre par défaut d'un mode (quand la leçon ne la fixe pas) — elle contient toujours O, les
 * points donnés, les cibles de lecture, le plafond et, pour une droite connue, un tronçon lisible.
 */
function defaultWindow({ a, mode, points = [], reads = [], cap = null }) {
  const xs = points.map((p) => toNumber(p.x));
  const ys = points.map((p) => toNumber(p.y));
  const A = a ? toNumber(a) : null;
  reads.forEach((r) => {
    if (r.axis === 'x') { xs.push(toNumber(r.v)); if (A != null) ys.push(A * toNumber(r.v)); }
    else { ys.push(toNumber(r.v)); if (A) xs.push(toNumber(r.v) / A); }
  });
  if (cap) { ys.push(toNumber(cap)); if (A) xs.push(toNumber(cap) / A); }
  let w;
  if (mode === 'pivot') w = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
  else if (mode === 'draw') {
    // une demi-droite de chaque côté de O : C de fenêtre négative (نشاط 3) tient toujours
    const half = A ? Math.max(2, Math.min(6, Math.floor(6 / Math.max(0.5, Math.abs(A))))) : 5;
    w = { xMin: -Math.min(4, half), xMax: half, yMin: 0, yMax: 0 };
    const yA = A != null ? [A * w.xMin, A * w.xMax] : [-5, 5];
    w.yMin = Math.min(-1, Math.floor(Math.min(...yA)));
    w.yMax = Math.max(1, Math.ceil(Math.max(...yA)));
  } else {
    // read / fit : le premier quadrant (ou celui de la droite), comme les figures du manuel
    const X = Math.max(1, ...xs.map(Math.abs));
    const xMax = Math.ceil(X * 1.15);
    w = { xMin: Math.min(0, ...xs.map((x) => Math.floor(x * 1.15))), xMax, yMin: 0, yMax: 0 };
    const yLine = A != null ? [A * w.xMin, A * w.xMax] : [];
    const Y = [...ys, ...yLine, 0];
    w.yMin = Math.min(0, Math.floor(Math.min(...Y) * 1.1));
    w.yMax = Math.max(1, Math.ceil(Math.max(...Y) * 1.1));
    if (w.yMax - w.yMin > 0 && w.yMin === 0 && w.yMax <= 0) w.yMax = 1;
  }
  xs.forEach((x) => { w.xMin = Math.min(w.xMin, Math.floor(x)); w.xMax = Math.max(w.xMax, Math.ceil(x)); });
  ys.forEach((y) => { w.yMin = Math.min(w.yMin, Math.floor(y)); w.yMax = Math.max(w.yMax, Math.ceil(y)); });
  return w;
}

function readWindow(props, a, mode, points, reads, cap) {
  const d = defaultWindow({ a, mode, points, reads, cap });
  const pick = (k) => (props[k] != null && props[k] !== '' ? toNumber(parseValue(props[k])) : d[k]);
  const w = { xMin: pick('xMin'), xMax: pick('xMax'), yMin: pick('yMin'), yMax: pick('yMax') };
  // O est TOUJOURS dans la fenêtre : c'est le point fixe de l'instrument.
  w.xMin = Math.min(0, w.xMin); w.yMin = Math.min(0, w.yMin);
  w.xMax = Math.max(0, w.xMax); w.yMax = Math.max(0, w.yMax);
  if (w.xMax - w.xMin <= 0) w.xMax = w.xMin + 1;
  if (w.yMax - w.yMin <= 0) w.yMax = w.yMin + 1;
  return w;
}

/* ── l'état ─────────────────────────────────────────────────────────────── */

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'N', 'P'];

/**
 * @param props { a, mode, points, reads, cap, xMin, xMax, yMin, yMax }  (chaînes du contrat)
 */
export function init(props = {}) {
  const mode = MODES.includes(props.mode) ? props.mode : 'draw';
  const a = parseValue(props.a);
  if ((mode === 'draw' || mode === 'read') && a == null) throw new Error(`origin-line : « a » manque (mode ${mode})`);
  if (mode === 'read' && isZero(a)) throw new Error('origin-line : a = 0 ne permet aucune lecture d\'antécédent');
  const points = parsePoints(props.points);
  const reads = parseReads(props.reads);
  const cap = parseValue(props.cap);
  if (mode === 'fit' && points.length === 0) throw new Error('origin-line : le mode fit demande des points');
  const win = readWindow(props, a, mode, points, reads, cap);

  // graduations rondes, puis la grille de la MAIN, assez fine pour atteindre exactement chaque
  // valeur que le mode exige (aucune réponse inatteignable, aucune réponse approchée).
  const xStep = niceStep(win.xMax - win.xMin);
  const yStep = niceStep(win.yMax - win.yMin);
  const fitA = mode === 'fit' ? PR.commonRatio(points.map((p) => p.x), points.map((p) => p.y)) : null;
  const hx = mode === 'fit' || mode === 'pivot' ? pivotAbscissa(win, points) : null;

  let dx = subdivide(xStep, points.map((p) => p.x));
  let dy;
  if (mode === 'draw') {
    // le point d'abscisse dx (« une seule autre point suffit ») doit tomber sur la grille
    dy = subdivide(yStep, [...points.map((p) => p.y), mul(a, dx)]);
  } else if (mode === 'read') {
    // l'antécédent du plafond n'est visé par la sonde x que s'il a une écriture décimale finie
    const capX = cap ? PR.antecedent(a, cap) : null;
    dx = subdivide(xStep, [...reads.filter((r) => r.axis === 'x').map((r) => r.v), div(xStep, 2), capX && fracDecimal(capX, 3) != null ? capX : null]);
    dy = subdivide(yStep, [...reads.filter((r) => r.axis === 'y').map((r) => r.v), div(yStep, 2), cap]);
  } else {
    // pivot / fit : la poignée glisse sur la verticale x = hx ; a = (j·dy) / hx
    dy = subdivide(yStep, [div(yStep, 2), ...(fitA ? [mul(fitA, hx)] : []), ...points.filter((p) => !isZero(p.x)).map((p) => mul(div(p.y, p.x), hx))]);
  }

  return Object.freeze({
    mode, a, points, reads, cap, win, fitA, hx,
    grid: { xStep, yStep }, snap: { dx, dy },
    placed: [],        // draw : points acceptés { x, y, label }
    trials: [],        // tous les essais validés, dans l'ordre
    readsDone: [],     // lectures validées { axis, v, other }
    lines: [],         // pivot / fit : droites validées { a, dir, hits }
    lineA: mode === 'read' ? a : null,
    last: null,
  });
}

/** L'abscisse de la poignée de pivot : le bord de la fenêtre du côté des données (sinon la droite). */
function pivotAbscissa(win, points = []) {
  const neg = points.length > 0 && points.every((p) => cmp(p.x, 0) < 0);
  const x = neg ? win.xMin : win.xMax;
  return parseValue(String(x === 0 ? (neg ? -1 : 1) : x));
}

/* ── la main sur la grille ──────────────────────────────────────────────── */

/** Un flottant (lu sous le doigt) → l'indice du nœud le plus proche (entier). */
export const indexOf = (v, d) => Math.round(v / toNumber(d));
/** L'indice → la valeur EXACTE. */
export const valueAt = (i, d) => mul(F(d), frac(i));

/** Les bornes d'indices d'une fenêtre pour un pas. */
export function indexRange(min, max, d) {
  const D = toNumber(d);
  return { min: Math.ceil(min / D - 1e-9), max: Math.floor(max / D + 1e-9) };
}

/* ── draw ───────────────────────────────────────────────────────────────── */

export const hasLine = (s) => s.lineA != null;

/** Poser un point (x ; y) exacts. */
export function place(s, x, y) {
  if (s.mode !== 'draw') return s;
  x = F(x); y = F(y);
  if (isZero(x) && isZero(y)) return { ...s, last: { kind: 'origin' } };
  if (s.placed.some((p) => eq(p.x, x) && eq(p.y, y))) return { ...s, last: { kind: 'same', x, y } };
  const ok = PR.onLine(s.a, x, y);
  const fx = PR.image(s.a, x);
  const trial = { kind: 'point', x, y, ok, fx, gap: sub(y, fx) };
  if (!ok) return { ...s, trials: [...s.trials, trial], last: { ...trial, kind: 'refused' } };
  const label = LETTERS.find((l) => !s.placed.some((p) => p.label === l)) ?? `P${s.placed.length + 1}`;
  const point = { x, y, label };
  return {
    ...s,
    placed: [...s.placed, point],
    lineA: s.lineA ?? s.a,
    trials: [...s.trials, { ...trial, label }],
    last: { ...trial, kind: 'accepted', label, first: s.placed.length === 0 },
  };
}

/** L'élève tente de déplacer O : il résiste (tous les modes). */
export const touchOrigin = (s) => ({ ...s, last: { kind: 'origin' } });

/* ── read ───────────────────────────────────────────────────────────────── */

/** Les lectures sont possibles quand une droite existe (read : d'emblée ; draw : après (OA)). */
export const canRead = (s, axis) => hasLine(s) && (s.mode === 'read' || (s.mode === 'draw' && axis === 'x') || s.mode === 'fit');

/** Lire l'image de x (sonde sur l'axe des abscisses). */
export function readX(s, x) {
  if (!canRead(s, 'x')) return s;
  x = F(x);
  const y = PR.image(s.lineA, x);
  return recordRead(s, { axis: 'x', v: x, other: y });
}

/** Lire le nombre dont l'image est y (sonde sur l'axe des ordonnées). */
export function readY(s, y) {
  if (!canRead(s, 'y') || isZero(s.lineA)) return s;
  y = F(y);
  const x = PR.antecedent(s.lineA, y);
  return recordRead(s, { axis: 'y', v: y, other: x });
}

function recordRead(s, r) {
  const target = s.reads.findIndex((t) => t.axis === r.axis && eq(t.v, r.v));
  const capHit = r.axis === 'y' && s.cap != null && eq(r.v, s.cap);
  const read = { ...r, target: target >= 0 ? target : null, capHit };
  const dup = s.readsDone.some((d) => d.axis === r.axis && eq(d.v, r.v));
  return {
    ...s,
    readsDone: dup ? s.readsDone : [...s.readsDone, read],
    trials: dup ? s.trials : [...s.trials, { kind: `read-${r.axis}`, ...read }],
    last: { kind: `read-${r.axis}`, ...read },
  };
}

/** Les cibles de lecture atteintes. */
export const targetsDone = (s) => s.reads.map((t) => s.readsDone.some((d) => d.axis === t.axis && eq(d.v, t.v)));

/* ── pivot / fit ────────────────────────────────────────────────────────── */

/** Le coefficient d'une droite dont la poignée (x = hx) est au nœud j. */
export const aAt = (s, j) => div(valueAt(j, s.snap.dy), s.hx);
/** Le nœud de la poignée pour un coefficient (le plus proche). */
export const handleIndex = (s, a) => indexOf(toNumber(mul(F(a), s.hx)), s.snap.dy);
/** Le nœud de la poignée pour une position (x ; y) sous le doigt : la droite passe par ce point. */
export function handleIndexFor(s, x, y) {
  if (Math.abs(x) < 1e-9) return null;
  return indexOf((y / x) * toNumber(s.hx), s.snap.dy);
}

/** Les bornes du nœud de la poignée (la droite sort par le bord gauche/droit, dans la fenêtre en y). */
export function handleRange(s) {
  return indexRange(s.win.yMin, s.win.yMax, s.snap.dy);
}

/** Les points de données par lesquels passe la droite y = a·x. */
export const hitsOf = (s, a) => s.points.map((p) => PR.onLine(a, p.x, p.y));

/** Valider une droite de coefficient a (pivot / fit). */
export function pivot(s, a) {
  if (s.mode !== 'pivot' && s.mode !== 'fit') return s;
  a = F(a);
  const hits = hitsOf(s, a);
  const line = { a, dir: PR.direction(a), hits };
  const dup = s.lines.length > 0 && eq(s.lines[s.lines.length - 1].a, a);
  const all = hits.length > 0 && hits.every(Boolean);
  return {
    ...s,
    lineA: a,
    lines: dup ? s.lines : [...s.lines, line],
    trials: dup ? s.trials : [...s.trials, { kind: 'line', ...line }],
    last: { kind: s.mode === 'fit' ? (all ? 'fitAll' : 'fitSome') : 'line', ...line, nHits: hits.filter(Boolean).length },
  };
}

/** Les données sont-elles alignées avec O (un tableau de proportionnalité) ? */
export const fitPossible = (s) => s.fitA != null;

/* ── la découverte (contraste) ──────────────────────────────────────────── */

export function discoveryReady(s) {
  if (s.mode === 'draw') {
    // deux points acceptés d'abscisses différentes (A et B du نشاط 3) : l'alignement avec O se VOIT
    const xs = new Set(s.placed.map((p) => Lin.fracText(p.x)));
    return xs.size >= 2;
  }
  if (s.mode === 'read') {
    if (s.reads.length > 0) return targetsDone(s).every(Boolean);
    return s.readsDone.some((r) => r.axis === 'x') && s.readsDone.some((r) => r.axis === 'y');
  }
  if (s.mode === 'pivot') {
    return s.lines.some((l) => l.dir === 'rising') && s.lines.some((l) => l.dir === 'falling');
  }
  // fit
  if (fitPossible(s)) return s.lines.some((l) => l.hits.every(Boolean));
  // aucune droite par O ne passe par toutes : chaque point atteint par une droite de l'élève
  return s.points.every((_, i) => s.lines.some((l) => l.hits[i]));
}

/* ── les questions pendant le labo (2026-10-28, lot 5) : deux étapes par scène ───────────── */

/**
 * L'étape i est-elle atteinte ? 0 : le premier objectif (un point posé · une lecture · une droite validée) ; 1 : la découverte est prête
 * (deux points · les deux lectures · une droite qui monte ET une qui descend · une droite par toutes les données).
 */
export function stageReached(s, i) {
  if (i === 1) return discoveryReady(s);
  if (s.mode === 'draw') return s.placed.length >= 1;
  if (s.mode === 'read') return s.readsDone.length >= 1;
  return s.lines.length >= 1;
}

/* ── écritures (affichage) ──────────────────────────────────────────────── */

/** « 0,5 », « -1,6 », « 9/4 » (texte simple, ARIA, data-*). */
export function numText(p) {
  p = F(p);
  return fracDecimal(p, 4) ?? Lin.fracText(p);
}
/** LaTeX à la façon du manuel : « 0{,}5 », « -\dfrac{2}{3} ». */
export function numTex(p) {
  p = F(p);
  const d = fracDecimal(p, 4);
  return d != null ? d.replace(',', '{,}') : Lin.fracLatex(p);
}
/** Une valeur sans écriture décimale finie est écrite exacte, suivie de sa valeur approchée. */
export function approxTex(p) {
  p = F(p);
  if (fracDecimal(p, 4) != null) return numTex(p);
  return `${Lin.fracLatex(p)} \\approx ${toNumber(p).toFixed(2).replace('.', '{,}')}`;
}
/** « (1 ; 0{,}5) ». */
export const pointTex = (x, y) => `(${numTex(x)} ; ${numTex(y)})`;
export const pointText = (x, y) => `(${numText(x)} ; ${numText(y)})`;
/** « y = 0{,}5x », « y = -x », « y = x », « y = 0 ». */
export function lineTex(a) {
  a = F(a);
  if (isZero(a)) return 'y = 0';
  if (eq(a, 1)) return 'y = x';
  if (eq(a, -1)) return 'y = -x';
  return `y = ${numTex(a)}x`;
}
/** « f(x) = 0{,}5x » / « 0{,}5 \times 4 = 2 ». */
export const productTex = (a, x) => `${numTex(a)} \\times ${cmp(x, 0) < 0 ? `(${numTex(x)})` : numTex(x)} = ${numTex(PR.image(a, x))}`;
/** « 3{,}5 \div 0{,}4 = 8{,}75 ». */
export const quotientTex = (y, a) => `${numTex(y)} \\div ${cmp(a, 0) < 0 ? `(${numTex(a)})` : numTex(a)} = ${numTex(PR.antecedent(a, y))}`;
export const absTex = (p) => numTex(absF(p));

/* ── géométrie du dessin (pixels — ne décide RIEN) ──────────────────────── */

/**
 * Le plan en pixels. `orthonormal` : la même unité sur les deux axes (معلم متعامد ومتجانس) ; sinon
 * chaque axe a sa propre unité (les grandeurs physiques de la leçon 5 / 6). Le plan est contenu dans
 * width × height et aligné en haut à gauche (marges `pad`).
 */
export function planeGeometry({ win, width, height, orthonormal = true, pad = 14 }) {
  const xSpan = win.xMax - win.xMin;
  const ySpan = win.yMax - win.yMin;
  const W0 = Math.max(60, width - 2 * pad);
  const H0 = Math.max(60, height - 2 * pad);
  let ux = W0 / xSpan;
  let uy = H0 / ySpan;
  if (orthonormal) { const u = Math.min(ux, uy); ux = u; uy = u; }
  const W = xSpan * ux + 2 * pad;
  const H = ySpan * uy + 2 * pad;
  const px = (x) => pad + (x - win.xMin) * ux;
  const py = (y) => pad + (win.yMax - y) * uy;
  const fromPx = (X, Y) => ({ x: win.xMin + (X - pad) / ux, y: win.yMax - (Y - pad) / uy });
  return { W, H, ux, uy, pad, px, py, fromPx };
}

/** Le tronçon de y = a·x visible dans la fenêtre : [[x1, y1], [x2, y2]] (flottants) ou null. */
export function lineSegment(a, win) {
  const A = toNumber(a);
  let lo = win.xMin; let hi = win.xMax;
  if (A !== 0) {
    const b1 = win.yMin / A; const b2 = win.yMax / A;
    lo = Math.max(lo, Math.min(b1, b2)); hi = Math.min(hi, Math.max(b1, b2));
  } else if (win.yMin > 0 || win.yMax < 0) return null;
  if (hi - lo < 1e-9) return null;
  return [[lo, A * lo], [hi, A * hi]];
}

/** Les graduations d'un axe : valeurs exactes multiples du pas dans [min ; max]. */
export function ticks(min, max, step) {
  const r = indexRange(min, max, step);
  const out = [];
  for (let i = r.min; i <= r.max; i++) out.push(valueAt(i, step));
  return out;
}

/** Un nœud de départ pour l'épingle (draw) qui n'est PAS déjà sur la droite (rien n'est offert). */
export function startPin(s) {
  const rx = indexRange(s.win.xMin, s.win.xMax, s.snap.dx);
  const ry = indexRange(s.win.yMin, s.win.yMax, s.snap.dy);
  const i = Math.max(rx.min, Math.min(rx.max, Math.max(1, Math.round(rx.max / 2))));
  let j = Math.max(ry.min, Math.min(ry.max, Math.round(ry.max / 2)));
  const on = (jj) => PR.onLine(s.a, valueAt(i, s.snap.dx), valueAt(jj, s.snap.dy));
  if (on(j) || (i === 0 && j === 0)) j = j + 1 <= ry.max ? j + 1 : j - 1;
  return { i, j };
}

/* ── accès exacts pour la vue (la vue ne calcule rien elle-même) ── */
export const imageOf = (a, x) => PR.image(F(a), F(x));
export const antecedentOf = (a, y) => PR.antecedent(F(a), F(y));
/** Le coefficient de la droite qui passe par O et (x ; y), x ≠ 0. */
export const slopeThrough = (x, y) => div(F(y), F(x));
export const same = (p, q) => eq(F(p), F(q));
export const toNum = (p) => toNumber(F(p));
export const dirOf = (a) => PR.direction(F(a));
/** « y = 0,5x » en texte simple (ARIA). */
export function lineText(a) {
  a = F(a);
  if (isZero(a)) return 'y = 0';
  if (eq(a, 1)) return 'y = x';
  if (eq(a, -1)) return 'y = -x';
  return `y = ${numText(a)}x`;
}
/** « 8,75 » ou « 10000/19 ≈ 526,32 » (texte simple). */
export function approxText(p) {
  p = F(p);
  const d = fracDecimal(p, 4);
  return d != null ? d : `≈ ${toNumber(p).toFixed(2).replace('.', ',')}`;
}
/** La lecture d'un antécédent écrite comme le manuel : « f(8{,}75) = 3{,}5 ». */
export const readYTex = (y, x) => `f(${fracDecimal(F(x), 4) != null ? numTex(x) : `${Lin.fracLatex(F(x))}`}) = ${numTex(y)}`;

/* ── Valeurs PAR DÉFAUT (2026-10-09) : jamais une réponse, jamais un essai ───────────────── */

/**
 * Le nœud de départ de la poignée (pivot / fit) : a = 1/2 en pivot, a = 0 en fit — mais jamais une
 * droite qui passe par TOUTES les données (ce serait la réponse du fit) : alors le nœud suivant.
 */
export function defaultHandleIndex(s) {
  const hr = handleRange(s);
  const clampJ = (j) => Math.max(hr.min, Math.min(hr.max, j));
  const solves = (j) => s.mode === 'fit' && s.points.length > 0 && hitsOf(s, aAt(s, j)).every(Boolean);
  let j = clampJ(s.mode === 'pivot' ? handleIndex(s, parseValue('1/2')) : 0);
  for (let n = 0; solves(j) && n < hr.max - hr.min + 1; n += 1) j = j + 1 <= hr.max ? j + 1 : hr.min;
  return j;
}

/**
 * Le nœud de départ d'une sonde de lecture (read) : vers le milieu de la fenêtre, jamais O, jamais
 * une valeur-cible, jamais le plafond — la lecture n'est pas écrite, l'élève n'a encore rien lu.
 */
export function defaultProbeIndex(s, axis) {
  const d = axis === 'x' ? s.snap.dx : s.snap.dy;
  const r = axis === 'x' ? indexRange(s.win.xMin, s.win.xMax, d) : indexRange(s.win.yMin, s.win.yMax, d);
  const bad = (i) => i === 0
    || s.reads.some((t) => t.axis === axis && eq(t.v, valueAt(i, d)))
    || (axis === 'y' && s.cap != null && eq(valueAt(i, d), s.cap));
  let i = Math.max(r.min, Math.min(r.max, Math.max(1, Math.round(r.max / 2))));
  for (let n = 0; bad(i) && n < r.max - r.min + 1; n += 1) i = i + 1 <= r.max ? i + 1 : r.min;
  return i;
}
