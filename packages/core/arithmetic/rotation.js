/**
 * Le calcul commun de l'unité 13 « الدوران - الزوايا - المضلّعات المنتظمة » (manuel pp. 151–161,
 * docs/sources/4am/unit13/extraction.json) : le دوران (مركز، زاوية، اتجاه), les angles inscrits et au
 * centre (الزاوية المحيطية والزاوية المركزية) et les polygones réguliers (المضلّعات المنتظمة).
 *
 * Une seule source de vérité pour les labs, les tests et les oracles de l'unité, sur vectors.js (points
 * exacts { x, y }) et trigonometry.js (surds q·√r) :
 *   • un ANGLE est un nombre de degrés (entier ou fraction de linear.js) ; une orientation est
 *     'direct' (الاتجاه المباشر / الموجب : contre les aiguilles d'une montre) ou 'indirect' (غير المباشر /
 *     السالب : dans le sens des aiguilles). Repère mathématique : y vers le HAUT ;
 *   • `rotate` est EXACT quand l'angle est un multiple de 90° (les figures sur quadrillage du manuel) et
 *     rend des flottants sinon (`rotateApprox`, pour dessiner) ;
 *   • un VERDICT (« M′ est-il l'image de M ? ») se lit comme le manuel le définit — OM = OM′ ET
 *     \widehat{MOM′} = α ET le bon sens — et `imageCheck` dit LEQUEL des trois éléments manque
 *     (la résistance des labs, comme `vectors.relation` pour les vecteurs) ;
 *   • les longueurs d'un polygone régulier inscrit sont exactes quand elles le sont (n = 3, 4, 6 :
 *     r√3, r√2, r), approchées sinon (2r·sin(180°/n)).
 *
 *   rotate(M, O, 90, 'direct')            → M′ exact                                  (صورة نقطة بدوران)
 *   imageCheck(O, M, M2, 70, 'direct')    → { ok, length, angle, sense, measured }     (OM = OM′، الزاوية، الاتجاه)
 *   orientedAngle(O, M, M2)               → ]−180 ; 180], > 0 dans le sens direct
 *   inscribedFromCentral(120) → 60 ; centralFromInscribed(35) → 70           (الزاوية المحيطية = نصف المركزية)
 *   arcAngles(O, A, B, M)                 → { inscribed, central } (l'arc AB qui ne contient pas M)
 *   centralAngle(5) → 72 ; interiorAngle(6) → 120 ; angleSum(5) → 540         (المضلّع المنتظم)
 *   sideFromRadius(6, 4) → 4 ; sideFromRadius(4, 3) → 3√2 ; sideFromRadius(5, 8) → { exact: null, number }
 */
import { frac, parseNumber, add, sub, mul, div, eq, cmp, toNumber, isInteger } from './linear.js';
import { surd, surdMul, surdDiv, sinDeg, cosDeg } from './trigonometry.js';
import { point, vec, distanceSquared } from './vectors.js';

const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : Number.isInteger(v) ? frac(v) : parseFrac(v));
function parseFrac(v) {
  const s = String(v).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return div(parseNumber(a), parseNumber(b)); }
  return parseNumber(s);
}
const P = (p) => (p && 'x' in p && typeof p.x === 'object' ? p : point(p.x ?? p[0], p.y ?? p[1]));
const num = (v) => (typeof v === 'number' ? v : toNumber(F(v)));
const xy = (p) => (p && typeof p.x === 'number' ? p : { x: num(P(p).x), y: num(P(p).y) });

export const DIRECT = 'direct';
export const INDIRECT = 'indirect';
/** Le signe d'une orientation : +1 direct (contre les aiguilles), −1 indirect. */
export const signOf = (direction) => {
  if (direction !== DIRECT && direction !== INDIRECT) throw new Error(`orientation inconnue : ${direction}`);
  return direction === DIRECT ? 1 : -1;
};

// ── Angles en degrés ─────────────────────────────────────────────────────────

/** Ramène un angle (nombre) dans [0 ; 360[. */
export const normalize = (deg) => ((num(deg) % 360) + 360) % 360;
/** Ramène un angle dans ]−180 ; 180]. */
export const normalizeSigned = (deg) => { const a = normalize(deg); return a > 180 ? a - 360 : a; };
/** Angle géométrique \widehat{AOB} en degrés, dans [0 ; 180] (flottant). */
export function angleAt(A, O, B) {
  A = xy(A); O = xy(O); B = xy(B);
  const u = [A.x - O.x, A.y - O.y]; const v = [B.x - O.x, B.y - O.y];
  const nu = Math.hypot(...u); const nv = Math.hypot(...v);
  if (nu === 0 || nv === 0) return NaN;
  const c = Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (nu * nv)));
  return (Math.acos(c) * 180) / Math.PI;
}
/** Angle ORIENTÉ de OM vers OM′ en degrés, dans ]−180 ; 180] : > 0 dans le sens direct. */
export function orientedAngle(O, M, M2) {
  O = xy(O); M = xy(M); M2 = xy(M2);
  const a = Math.atan2(M.y - O.y, M.x - O.x); const b = Math.atan2(M2.y - O.y, M2.x - O.x);
  return normalizeSigned(((b - a) * 180) / Math.PI);
}
/** Direction (en degrés depuis l'axe des abscisses) du point M vu de O, dans [0 ; 360[. */
export const bearing = (O, M) => { O = xy(O); M = xy(M); return normalize((Math.atan2(M.y - O.y, M.x - O.x) * 180) / Math.PI); };

// ── Le دوران ─────────────────────────────────────────────────────────────────

/** L'angle signé effectif (degrés) : α dans le sens direct, −α dans le sens indirect. */
const signedAngle = (alpha, direction = DIRECT) => signOf(direction) * num(alpha);
/** α est-il un multiple de 90° (image exacte sur quadrillage) ? */
const isQuarterTurn = (alpha) => isInteger(div(F(alpha), frac(90)));

/**
 * L'image EXACTE de M par le دوران de centre O, d'angle α (multiple de 90°) et d'orientation donnée.
 * Pour un autre angle, utiliser `rotateApprox` (le dessin) — un verdict passe par `imageCheck`.
 */
export function rotate(M, O, alpha, direction = DIRECT) {
  if (!isQuarterTurn(alpha)) throw new Error(`rotate exact : ${alpha}° n'est pas un multiple de 90° (utiliser rotateApprox)`);
  M = P(M); O = P(O);
  const quarter = (((toNumber(div(F(alpha), frac(90))) * signOf(direction)) % 4) + 4) % 4;
  const u = vec(O, M);
  const r = [u, point(sub(frac(0), u.y), u.x), point(sub(frac(0), u.x), sub(frac(0), u.y)), point(u.y, sub(frac(0), u.x))][quarter];
  return point(add(O.x, r.x), add(O.y, r.y));
}
/** L'image approchée (flottants) — pour dessiner, jamais pour juger. */
export function rotateApprox(M, O, alpha, direction = DIRECT) {
  M = xy(M); O = xy(O);
  const t = signedAngle(alpha, direction);
  const c = cosDeg(t); const s = sinDeg(t);
  const dx = M.x - O.x; const dy = M.y - O.y;
  return { x: O.x + c * dx - s * dy, y: O.y + s * dx + c * dy };
}
/** L'image d'une liste de points (une figure), exacte si possible. */
export const rotateAll = (points, O, alpha, direction = DIRECT) =>
  points.map((M) => (isQuarterTurn(alpha) ? rotate(M, O, alpha, direction) : rotateApprox(M, O, alpha, direction)));

/**
 * « M2 est-il l'image de M par le دوران (O, α, orientation) ? » — les TROIS conditions du manuel :
 *   length : OM = OM2 (exact sur les carrés si les points sont exacts, sinon à `tol` près),
 *   angle  : \widehat{MOM2} = α (à `tolDeg` près),
 *   sense  : M2 est atteint en tournant dans la bonne orientation (null quand α = 180°, les deux sens se valent).
 * `measured` rend la mesure lue (pour que le lab DISE ce qui manque : « نفس البعد، لكن الزاوية 50° »).
 */
export function imageCheck(O, M, M2, alpha, direction = DIRECT, { tol = 1e-6, tolDeg = 0.5 } = {}) {
  const exact = [O, M, M2].every((p) => p && typeof p.x === 'object');
  let length;
  if (exact) length = eq(distanceSquared(O, M), distanceSquared(O, M2));
  else {
    const o = xy(O); const m = xy(M); const m2 = xy(M2);
    length = Math.abs(Math.hypot(m.x - o.x, m.y - o.y) - Math.hypot(m2.x - o.x, m2.y - o.y)) <= tol * Math.max(1, Math.hypot(m.x - o.x, m.y - o.y));
  }
  const a = normalize(alpha);
  const oriented = orientedAngle(O, M, M2);
  const geometric = Math.abs(oriented);
  const target = a > 180 ? 360 - a : a;
  const angle = Math.abs(geometric - target) <= tolDeg;
  let sense = null;
  if (Math.abs(target - 180) > tolDeg && target > tolDeg) {
    const wanted = signOf(direction) * (a > 180 ? -1 : 1);
    sense = Math.sign(oriented) === wanted;
  }
  const ok = length && angle && sense !== false;
  return Object.freeze({
    ok, length, angle, sense,
    measured: Object.freeze({ angle: geometric, direction: oriented > 0 ? DIRECT : oriented < 0 ? INDIRECT : null }),
  });
}

/**
 * Le دوران qui envoie M sur M2 autour de O, quand il existe (OM = OM2) : { alpha, direction } avec
 * α ∈ ]0 ; 180] (le manuel donne des angles ≤ 180°), sinon null.
 */
export function findRotation(O, M, M2, { tol = 1e-6 } = {}) {
  const o = xy(O); const m = xy(M); const m2 = xy(M2);
  const r1 = Math.hypot(m.x - o.x, m.y - o.y); const r2 = Math.hypot(m2.x - o.x, m2.y - o.y);
  if (r1 === 0 || Math.abs(r1 - r2) > tol * Math.max(1, r1)) return null;
  const t = orientedAngle(o, m, m2);
  if (Math.abs(t) < 1e-9) return Object.freeze({ alpha: 0, direction: null });
  return Object.freeze({ alpha: Math.abs(t), direction: t === 180 ? null : t > 0 ? DIRECT : INDIRECT });
}

// ── Angles inscrits et au centre ─────────────────────────────────────────────

/** الزاوية المحيطية = نصف الزاوية المركزية التي تحصر معها نفس القوس. Exact (fraction) si l'entrée l'est. */
export const inscribedFromCentral = (central) => (typeof central === 'number' && !Number.isInteger(central) ? central / 2 : div(F(central), frac(2)));
export const centralFromInscribed = (inscribed) => (typeof inscribed === 'number' && !Number.isInteger(inscribed) ? inscribed * 2 : mul(F(inscribed), frac(2)));

/**
 * Pour A, B, M sur le cercle de centre O : l'angle inscrit \widehat{AMB} et l'angle au centre qui intercepte
 * le MÊME arc AB (celui qui ne contient pas M) — éventuellement rentrant (> 180°) quand M est sur le petit arc.
 * Flottants (degrés). `sameCircle` vérifie OA = OB = OM.
 */
export function arcAngles(O, A, B, M, { tol = 1e-6 } = {}) {
  const o = xy(O); const a = xy(A); const b = xy(B); const m = xy(M);
  const r = Math.hypot(a.x - o.x, a.y - o.y);
  const sameCircle = [b, m].every((p) => Math.abs(Math.hypot(p.x - o.x, p.y - o.y) - r) <= tol * Math.max(1, r));
  const inscribed = angleAt(a, m, b);
  const small = angleAt(a, o, b);
  // M sur le grand arc ⇔ M et O du même côté de (AB) ou O sur (AB) ; l'arc intercepté est alors le petit.
  const side = (p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  const onMajor = Math.sign(side(m)) === Math.sign(side(o)) || Math.abs(side(o)) < 1e-12;
  const central = onMajor ? small : 360 - small;
  return Object.freeze({ inscribed, central, sameCircle, reflex: central > 180 });
}
/** Deux angles inscrits interceptent-ils le même arc AB (M et N du même côté de la corde (AB)) ? */
export function sameArc(A, B, M, N) {
  const a = xy(A); const b = xy(B); const m = xy(M); const n = xy(N);
  const side = (p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  return Math.sign(side(m)) === Math.sign(side(n)) && side(m) !== 0;
}
/** Le point du cercle (O, r) à l'angle `deg` (degrés, depuis l'axe des abscisses, sens direct). */
export const pointOnCircle = (O, r, deg) => { O = xy(O); return { x: O.x + num(r) * cosDeg(num(deg)), y: O.y + num(r) * sinDeg(num(deg)) }; };

// ── Un sommet HORS du cercle (zawiya-muhitiya, lab inscribed-angle et exercice 12) ──
// Ajouté par l'auteur de « zawiya-muhitiya » (2026-10-05) : le lab REFUSE un tireur qui n'est pas sur le cercle
// (« ليست زاوية محيطية ») et doit dire ce que vaut alors l'angle — l'exercice 12 (M intérieur : la demi-somme des deux
// arcs) ; à l'extérieur, la demi-différence.

/** La position de M par rapport au cercle (O, r) : 'inside' | 'on' | 'outside' (`tol` relatif au rayon). */
export function circlePosition(O, r, M, { tol = 1e-6 } = {}) {
  const o = xy(O); const m = xy(M); const R = num(r);
  const d = Math.hypot(m.x - o.x, m.y - o.y);
  if (Math.abs(d - R) <= tol * Math.max(1, R)) return 'on';
  return d < R ? 'inside' : 'outside';
}
/** La SECONDE intersection de la droite (PM) avec le cercle de centre O passant par P (P sur le cercle, M ≠ P). */
export function secondIntersection(O, P, M) {
  const o = xy(O); const p = xy(P); const m = xy(M);
  const d = [m.x - p.x, m.y - p.y]; const dd = d[0] * d[0] + d[1] * d[1];
  if (dd === 0) return null;
  const s = (-2 * ((p.x - o.x) * d[0] + (p.y - o.y) * d[1])) / dd;
  return { x: p.x + s * d[0], y: p.y + s * d[1] };
}
/** L'arc (degrés, angle au centre) de P à Q qui NE contient PAS X — sur le cercle de centre O. */
function arcAvoiding(O, P, Q, X) {
  const a = bearing(O, P); const b = bearing(O, Q); const x = bearing(O, X);
  const span = normalize(b - a);
  const inside = normalize(x - a) < span;
  return inside ? 360 - span : span;
}
/**
 * L'angle \widehat{AMB} (A, B sur le cercle de centre O, M ≠ A, B) selon la place de son sommet :
 *   'on'      → c'est une زاوية محيطية : { inscribed, central } de `arcAngles` (la moitié de l'angle au centre) ;
 *   'inside'  → A′, B′ les secondes intersections de (AM) et (BM) ; angle = (arc AB + arc A′B′) / 2 (exercice 12 :
 *               \widehat{CMB} = (\widehat{COB} + \widehat{AOD}) / 2) — PLUS GRAND que l'angle inscrit sur l'arc AB ;
 *   'outside' → sur chaque sécante, le point proche N et le point lointain F ; angle = (arc F₁F₂ − arc N₁N₂) / 2 — PLUS PETIT.
 * Rend { position, angle (mesuré), A2, B2, far, near, rule: 'inscribed' | 'half-sum' | 'half-difference' } ; flottants.
 */
export function vertexAngle(O, A, B, M, { tol = 1e-6 } = {}) {
  const o = xy(O); const a = xy(A); const b = xy(B); const m = xy(M);
  const r = Math.hypot(a.x - o.x, a.y - o.y);
  const position = circlePosition(o, r, m, { tol });
  const angle = angleAt(a, m, b);
  if (position === 'on') {
    const arc = arcAngles(o, a, b, m, { tol });
    return Object.freeze({ position, angle, inscribed: arc.inscribed, central: arc.central, far: arc.central, near: 0, A2: a, B2: b, rule: 'inscribed' });
  }
  const A2 = secondIntersection(o, a, m); const B2 = secondIntersection(o, b, m);
  if (position === 'inside') {
    const far = arcAvoiding(o, a, b, A2);
    const near = arcAvoiding(o, A2, B2, a);
    return Object.freeze({ position, angle, A2, B2, far, near, rule: 'half-sum' });
  }
  const d = (p) => Math.hypot(p.x - m.x, p.y - m.y);
  const [N1, F1] = d(a) <= d(A2) ? [a, A2] : [A2, a];
  const [N2, F2] = d(b) <= d(B2) ? [b, B2] : [B2, b];
  const far = arcAvoiding(o, F1, F2, N1);
  const near = arcAvoiding(o, N1, N2, F1);
  return Object.freeze({ position, angle, A2, B2, far, near, rule: 'half-difference' });
}

// ── Polygones réguliers ──────────────────────────────────────────────────────

const N = (n) => { if (!Number.isInteger(n) || n < 3) throw new Error('un polygone a au moins 3 côtés'); return n; };
/** La زاوية مركزية qui intercepte un côté : 360°/n (fraction exacte : 360/7). */
export const centralAngle = (n) => div(frac(360), frac(N(n)));
/** La زاوية du polygone (intérieure) : (n − 2)·180°/n. */
export const interiorAngle = (n) => div(mul(frac(N(n) - 2), frac(180)), frac(n));
/** La somme des angles intérieurs : (n − 2)·180°. */
export const angleSum = (n) => mul(frac(N(n) - 2), frac(180));
/** L'angle inscrit qui intercepte un côté (depuis un autre sommet) : 180°/n. */
export const inscribedSideAngle = (n) => div(frac(180), frac(N(n)));
/**
 * n à partir de l'angle au centre (« كم ضلعا ؟ ») : 360/α s'il est entier ≥ 3, sinon null
 * (un angle au centre de 50° ne donne AUCUN polygone régulier — la résistance du lab).
 */
export function sidesFromCentral(alpha) {
  const q = div(frac(360), F(alpha));
  return isInteger(q) && toNumber(q) >= 3 ? toNumber(q) : null;
}
/** n à partir de l'angle intérieur : 360 / (180 − β) s'il est entier ≥ 3, sinon null. */
export function sidesFromInterior(beta) {
  const ext = sub(frac(180), F(beta));
  if (cmp(ext, frac(0)) <= 0) return null;
  const q = div(frac(360), ext);
  return isInteger(q) && toNumber(q) >= 3 ? toNumber(q) : null;
}

const EXACT_SIDE = { 3: [1, 3], 4: [1, 2], 6: [1, 1] }; // côté = q·r·√k
const EXACT_APOTHEM = { 3: [frac(1, 2), 1], 4: [frac(1, 2), 2], 6: [frac(1, 2), 3] };
/**
 * Le côté d'un polygone régulier à n côtés inscrit dans un cercle de rayon r : c = 2r·sin(180°/n).
 * Rend { exact: surd | null, number } : exact pour n = 3 (r√3), 4 (r√2), 6 (r).
 */
export function sideFromRadius(n, r) {
  N(n);
  const number = 2 * num(r) * sinDeg(180 / n);
  const e = EXACT_SIDE[n];
  const exact = e ? surd(mul(F(r), frac(e[0])), e[1]) : null;
  return Object.freeze({ exact, number });
}
/** Le rayon du cercle circonscrit à partir du côté : r = c / (2·sin(180°/n)). Exact pour n = 3, 4, 6. */
export function radiusFromSide(n, c) {
  N(n);
  const number = num(c) / (2 * sinDeg(180 / n));
  const e = EXACT_SIDE[n];
  const exact = e ? surdDiv(surd(F(c)), surd(frac(e[0]), e[1])) : null;
  return Object.freeze({ exact, number });
}
/** L'apothème (distance du centre à un côté) : r·cos(180°/n). Exact pour n = 3 (r/2), 4 (r√2/2), 6 (r√3/2). */
export function apothem(n, r) {
  N(n);
  const number = num(r) * cosDeg(180 / n);
  const e = EXACT_APOTHEM[n];
  const exact = e ? surdMul(surd(F(r)), surd(e[0], e[1])) : null;
  return Object.freeze({ exact, number });
}
/** Le périmètre n·c (exact si c l'est). */
export function perimeter(n, r) {
  const s = sideFromRadius(n, r);
  return Object.freeze({ exact: s.exact ? surdMul(s.exact, surd(frac(n))) : null, number: n * s.number });
}
/** L'aire n · (c · apothème / 2) — flottant (exacte en surd pour n = 3, 4, 6). */
export function area(n, r) {
  const s = sideFromRadius(n, r); const a = apothem(n, r);
  const exact = s.exact && a.exact ? surdMul(surdMul(s.exact, a.exact), surd(frac(n, 2))) : null;
  return Object.freeze({ exact, number: (n * s.number * a.number) / 2 });
}
/**
 * Les sommets (flottants) du polygone régulier de centre O, rayon r, n côtés, le premier à l'angle `start`
 * (degrés) puis dans l'orientation donnée — chaque sommet est l'image du précédent par le دوران (O, 360°/n).
 */
export function regularVertices(O, r, n, start = 90, direction = DIRECT) {
  N(n);
  const step = signOf(direction) * (360 / n);
  return Array.from({ length: n }, (_, k) => pointOnCircle(O, r, start + k * step));
}
/** La distance entre les sommets k et k + j d'un polygone régulier (rayon r) : 2r·sin(180°·j/n). */
export const chord = (n, r, j = 1) => 2 * num(r) * sinDeg((180 * j) / N(n));
/**
 * L'étoile régulière {n/j} (la نجمة الخماسية de l'emblème : n = 5, j = 2) inscrite dans un cercle de rayon r :
 * ses pointes sont les sommets du polygone régulier ; `tip` = distance entre deux pointes CONSÉCUTIVES sur le
 * cercle (le côté du polygone), `stroke` = la corde tracée (j sommets plus loin).
 */
export function star(n, r, j = 2) {
  return Object.freeze({ tip: chord(n, r, 1), stroke: chord(n, r, j), tipAngle: 180 - (360 * j) / n });
}
/** Le rayon du cercle dont deux pointes consécutives sont à la distance d : r = d / (2·sin(180°/n)). */
export const radiusForChord = (n, d, j = 1) => num(d) / (2 * sinDeg((180 * j) / N(n)));

// ── Les propriétés du دوران (leçon khawas-dawaran, lab shape-turn) ──────────

/**
 * L'angle (degrés, dans [0 ; 90]) entre les DROITES (AB) et (CD) — l'angle « non orienté » de deux droites. Une droite et
 * son image par un دوران d'angle α font l'angle α replié dans [0 ; 90] (`lineAngleOfTurn`) : 90° ⇒ perpendiculaires,
 * 180° ⇒ parallèles (0°). Flottant (pour lire), NaN si A = B ou C = D.
 */
export function lineAngle(A, B, C, D) {
  const a = xy(A); const b = xy(B); const c = xy(C); const d = xy(D);
  const t = angleAt({ x: b.x - a.x, y: b.y - a.y }, { x: 0, y: 0 }, { x: d.x - c.x, y: d.y - c.y });
  return Number.isNaN(t) ? NaN : Math.min(t, 180 - t);
}
/** L'angle entre une droite et son image par un دوران d'angle α (degrés, dans [0 ; 90]) : 90 ↦ 90, 180 ↦ 0, 60 ↦ 60, 120 ↦ 60. */
export const lineAngleOfTurn = (alpha) => { const a = normalize(alpha) % 180; return Math.min(a, 180 - a); };
/**
 * L'AIRE d'un polygone (formule du lacet) : EXACTE (fraction de linear.js) si tous les sommets sont exacts, flottante
 * sinon. Le دوران la conserve (معارف 3 : « يحافظ على المساحات »).
 */
export function polygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) throw new Error('un polygone a au moins 3 sommets');
  if (points.every((p) => p && typeof p.x === 'object')) {
    let s = frac(0);
    points.forEach((p, i) => { const q = points[(i + 1) % points.length]; s = add(s, sub(mul(p.x, q.y), mul(q.x, p.y))); });
    const h = div(s, frac(2));
    return cmp(h, frac(0)) < 0 ? sub(frac(0), h) : h;
  }
  const f = points.map(xy);
  let s = 0;
  f.forEach((p, i) => { const q = f[(i + 1) % f.length]; s += p.x * q.y - q.x * p.y; });
  return Math.abs(s) / 2;
}
/** P est-il sur la médiatrice (محور) de [MM2], c'est-à-dire PM = PM2 ? Exact sur des points exacts. */
export const onBisector = (M, M2, Pt) => eq(distanceSquared(P(Pt), P(M)), distanceSquared(P(Pt), P(M2)));
/**
 * Le CENTRE d'un دوران qui envoie A sur A2 et B sur B2 : l'intersection des médiatrices de [AA2] et [BB2] (le centre est
 * à égale distance d'un point et de son image) — EXACT sur des points exacts. Un point fixe (A = A2) est le centre ; null
 * quand les deux médiatrices sont parallèles ou confondues (aucun centre n'est déterminé ainsi). Vérifier ensuite le
 * دوران lui-même avec `findRotation` / `imageCheck`.
 */
export function rotationCenter(A, A2, B, B2) {
  A = P(A); A2 = P(A2); B = P(B); B2 = P(B2);
  const u = vec(A, A2); const v = vec(B, B2);
  const zero = (w) => eq(w.x, frac(0)) && eq(w.y, frac(0));
  if (zero(u)) return A;
  if (zero(v)) return B;
  const half = (p, q) => div(sub(add(mul(q.x, q.x), mul(q.y, q.y)), add(mul(p.x, p.x), mul(p.y, p.y))), frac(2));
  const c1 = half(A, A2); const c2 = half(B, B2);
  const d = sub(mul(u.x, v.y), mul(u.y, v.x));
  if (eq(d, frac(0))) return null;
  return point(div(sub(mul(c1, v.y), mul(c2, u.y)), d), div(sub(mul(u.x, c2), mul(v.x, c1)), d));
}

// ── Des points répartis sur un cercle (أدمج تعلّماتي : les lampadaires du massif, wadiya-idmajiya-dawaran) ──

/** La corde qui sous-tend un arc d'angle au centre `deg` (degrés) d'un cercle de rayon r : 2r·sin(deg/2) (flottant). */
export const chordOfArc = (r, deg) => 2 * num(r) * sinDeg(num(deg) / 2);
/** La longueur d'un arc d'angle au centre `deg` (degrés) d'un cercle de rayon r : π·r·deg/180 (flottant). */
export const arcLength = (r, deg) => (Math.PI * num(r) * num(deg)) / 180;
const mod360 = (a) => {
  let q = F(a);
  while (cmp(q, frac(0)) < 0) q = add(q, frac(360));
  while (cmp(q, frac(360)) >= 0) q = sub(q, frac(360));
  return q;
};
/**
 * n points d'un cercle de rayon r donnés par leurs DIRECTIONS (degrés, entiers ou fractions) : rangés dans le sens
 * direct, les arcs entre voisins consécutifs (le dernier referme le tour) avec leur corde, et `equal` — TOUS les arcs
 * valent 360°/n, exactement (« متباعدة بنفس المسافة »). Deux points confondus donnent un arc nul (jamais égaux).
 *   { order: [indices], arcs: [{ from, to, exact, deg, chord }], equal, min, max }   (min / max : les cordes extrêmes)
 */
export function circleGaps(degs, r) {
  const n = degs.length;
  if (n < 2) throw new Error('au moins deux points');
  const pts = degs.map((d, i) => ({ i, a: mod360(d) })).sort((p, q) => cmp(p.a, q.a) || p.i - q.i);
  const target = div(frac(360), frac(n));
  const arcs = pts.map((p, k) => {
    const q = pts[(k + 1) % n];
    const exact = k === n - 1 ? sub(add(q.a, frac(360)), p.a) : sub(q.a, p.a);
    const deg = toNumber(exact);
    return Object.freeze({ from: p.i, to: q.i, exact, deg, chord: chordOfArc(r, deg) });
  });
  const chords = arcs.map((a) => a.chord);
  return Object.freeze({
    order: pts.map((p) => p.i), arcs: Object.freeze(arcs),
    equal: arcs.every((a) => eq(a.exact, target)),
    min: Math.min(...chords), max: Math.max(...chords),
  });
}
/**
 * n poteaux posés par le دوران (O, α) à partir du premier : le k-ième à k·α du premier (k = 0 … n − 1). Le tour se
 * REFERME (le dernier arc, du n-ième au premier, vaut aussi α) seulement si n·α = 360° ; sinon `closing` (degrés) est
 * l'arc qui reste, et `overshoot` le premier k où k·α atteint ou dépasse 360° (un poteau retombe sur le premier ou le
 * dépasse). α ∈ ]0 ; 360[ (degrés, exact).
 *   { closes, offsets: [0, α, 2α, …] (jusqu'au dépassement exclu), overshoot: k | null, closing: number | null }
 */
export function ringByRotation(n, alpha) {
  N(n);
  const a = F(alpha);
  if (cmp(a, frac(0)) <= 0 || cmp(a, frac(360)) >= 0) throw new Error('α ∈ ]0 ; 360[');
  const offsets = [];
  let overshoot = null;
  for (let k = 0; k < n; k += 1) {
    const o = mul(a, frac(k));
    if (k > 0 && cmp(o, frac(360)) >= 0) { overshoot = k; break; }
    offsets.push(o);
  }
  const closingExact = overshoot == null ? sub(frac(360), mul(a, frac(n - 1))) : null;
  return Object.freeze({
    closes: overshoot == null && eq(closingExact, a),
    offsets: Object.freeze(offsets.map(toNumber)),
    overshoot,
    closing: closingExact == null ? null : toNumber(closingExact),
  });
}

/** Un angle écrit en degrés pour KaTeX : « 72^\circ », « \dfrac{360}{7}^\circ ». */
export function degLatex(a) {
  const q = F(a);
  if (q.d === 1) return `${q.n}^\\circ`;
  return `\\dfrac{${q.n}}{${q.d}}^\\circ`;
}
