/**
 * Les MATHÉMATIQUES du bureau de géométrie — pures, sans DOM ni Excalidraw.
 *
 * Tout est en coordonnées de SCÈNE (celles d'Excalidraw : x vers la droite,
 * y vers le BAS). Un angle est donc mesuré dans le sens des aiguilles d'une
 * montre à l'écran ; les instruments convertissent eux-mêmes vers le sens
 * « scolaire » (trigonométrique) quand ils affichent un degré.
 *
 * ── L'échelle ────────────────────────────────────────────────────────────
 * `UNITS_PER_CM` unités de scène font un « cm » du bureau. Ce n'est PAS un
 * centimètre physique : rien n'étalonne l'écran, un projecteur l'agrandit,
 * un zoom le change. C'est une unité mathématique cohérente — la règle, le
 * compas, la منقلة et les mesures parlent tous la même — et l'interface ne
 * prétend jamais le contraire (docs/architecture/MATH_LAB.md §5.8).
 */

export const UNITS_PER_CM = 40;
export const UNITS_PER_MM = UNITS_PER_CM / 10;

const EPS = 1e-9;

export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a, k) => ({ x: a.x * k, y: a.y * k });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
const cross = (a, b) => a.x * b.y - a.y * b.x;
export const len = (a) => Math.hypot(a.x, a.y);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const unit = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle) });
export const angleOf = (a) => Math.atan2(a.y, a.x);
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const isPoint = (p) => Boolean(p) && Number.isFinite(p.x) && Number.isFinite(p.y);

/** La normale « au-dessus » d'une direction u : u tournée de −90° à l'écran (vers le haut quand u pointe à droite). */
export const upNormal = (u) => ({ x: u.y, y: -u.x });

/** Tourne p autour de c d'un angle (radians, sens de l'écran). */
export function rotateAround(p, c, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = p.x - c.x;
  const dy = p.y - c.y;

  return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
}

/** Ramène un angle dans ]−π, π]. */
export function normalizeAngle(a) {
  let r = a % (2 * Math.PI);
  if (r <= -Math.PI) r += 2 * Math.PI;
  if (r > Math.PI) r -= 2 * Math.PI;

  return r;
}

/** Le plus petit écart entre deux DIRECTIONS non orientées (une droite n'a pas de sens) — dans [0, π/2]. */
export function lineAngleGap(a, b) {
  const d = Math.abs(normalizeAngle(a - b)) % Math.PI;

  return Math.min(d, Math.PI - d);
}

export const toDegrees = (rad) => (rad * 180) / Math.PI;
export const toRadians = (deg) => (deg * Math.PI) / 180;

/** La projection de p sur la DROITE (a, b), et le paramètre t (0 en a, 1 en b). */
export function projectOnLine(p, a, b) {
  const d = sub(b, a);
  const l2 = dot(d, d);
  if (l2 < EPS) return { point: { ...a }, t: 0 };
  const t = dot(sub(p, a), d) / l2;

  return { point: add(a, scale(d, t)), t };
}

/** La distance de p au SEGMENT [a, b]. */
export function distanceToSegment(p, a, b) {
  const { t } = projectOnLine(p, a, b);
  const clamped = Math.max(0, Math.min(1, t));

  return dist(p, lerp(a, b, clamped));
}

/**
 * L'intersection de deux droites (a1, b1) et (a2, b2), avec les paramètres
 * t (sur la première) et s (sur la seconde) — ou null si elles sont parallèles.
 */
export function intersectLines(a1, b1, a2, b2) {
  const d1 = sub(b1, a1);
  const d2 = sub(b2, a2);
  const den = cross(d1, d2);
  if (Math.abs(den) < EPS * Math.max(1, len(d1) * len(d2))) return null;
  const w = sub(a2, a1);
  const t = cross(w, d2) / den;
  const s = cross(w, d1) / den;

  return { point: add(a1, scale(d1, t)), t, s };
}

/** Les points communs d'une droite (a, b) et d'un cercle (c, r), avec leur paramètre t. */
export function intersectLineCircle(a, b, c, r) {
  const d = sub(b, a);
  const f = sub(a, c);
  const A = dot(d, d);
  if (A < EPS) return [];
  const B = 2 * dot(f, d);
  const C = dot(f, f) - r * r;
  const disc = B * B - 4 * A * C;
  if (disc < -EPS) return [];
  if (Math.abs(disc) <= EPS) {
    const t = -B / (2 * A);

    return [{ point: add(a, scale(d, t)), t }];
  }
  const root = Math.sqrt(disc);

  return [(-B - root) / (2 * A), (-B + root) / (2 * A)].map((t) => ({ point: add(a, scale(d, t)), t }));
}

/** Les points communs de deux cercles. Cercles confondus ou disjoints : aucun. */
export function intersectCircles(c1, r1, c2, r2) {
  const d = dist(c1, c2);
  if (d < EPS || d > r1 + r2 + EPS || d < Math.abs(r1 - r2) - EPS) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h2 = r1 * r1 - a * a;
  const h = h2 > 0 ? Math.sqrt(h2) : 0;
  const u = scale(sub(c2, c1), 1 / d);
  const m = add(c1, scale(u, a));
  if (h < 1e-6) return [m];
  const n = { x: -u.y, y: u.x };

  return [add(m, scale(n, h)), sub(m, scale(n, h))];
}

/**
 * Un angle est-il dans l'arc qui part de `start` et balaie `sweep` (signé,
 * sens de l'écran) ? Un arc de 2π ou plus contient tout.
 */
export function angleInSweep(angle, start, sweep) {
  if (Math.abs(sweep) >= 2 * Math.PI - 1e-6) return true;
  let d = normalizeAngle(angle - start);
  if (sweep >= 0) {
    if (d < -1e-9) d += 2 * Math.PI;

    return d <= sweep + 1e-9;
  }
  if (d > 1e-9) d -= 2 * Math.PI;

  return d >= sweep - 1e-9;
}

/** Les points d'un arc de cercle, échantillonnés assez finement pour paraître lisses (au plus `maxPoints`). */
export function arcPoints(center, r, start, sweep, maxPoints = 180) {
  const steps = Math.max(2, Math.min(maxPoints, Math.ceil(Math.abs(toDegrees(sweep)) / 2)));
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = start + (sweep * i) / steps;
    out.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
  }

  return out;
}

/** Des unités de scène vers des « cm » du bureau. */
export const unitsToCm = (units) => units / UNITS_PER_CM;

/**
 * Un nombre à l'arabe-algérienne : virgule décimale, signe moins typographique,
 * `digits` décimales au plus, sans zéros inutiles (« 5 », « 5,2 »).
 */
export function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  const k = 10 ** digits;
  const rounded = Math.round(value * k) / k;
  const clean = Math.abs(rounded) < 1 / (2 * k) ? 0 : rounded;

  return String(clean).replace('.', ',').replace('-', '−');
}

/** Une longueur de scène lue en cm du bureau, au dixième. */
export const formatLength = (units) => formatNumber(unitsToCm(units), 1);

