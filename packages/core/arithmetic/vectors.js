/**
 * Les vecteurs exacts des unités 11 « الأشعة والانسحاب » et 12 « الأشعة في معلم »
 * (docs/sources/4am/unit11/extraction.json, docs/sources/4am/unit12/extraction.json).
 *
 * Une seule source de vérité pour les labs, les tests et les oracles des deux unités :
 *   • un point est { x, y } (fractions de linear.js), un vecteur aussi (ses « مركبتان ») ;
 *   • un vecteur NOMMÉ (« AB ») est une combinaison formelle de points (B − A) : la relation de
 *     Chasles, les vecteurs opposés et le vecteur nul en découlent sans cas particulier
 *     (`simplifyNamed(['AB', 'BC'])` → 'AC', `['AB', 'BA']` → '0') ;
 *   • une longueur est un surd exact de trigonometry.js (√13, 3√2) ; une égalité de longueurs se juge
 *     sur les CARRÉS (fractions), jamais sur des flottants.
 *
 *   vec(A, B)                       → { x: xB − xA, y: yB − yA }                      (الأشعة في معلم)
 *   relation(u, v)                  → { direction, sense, length, equal, opposite }    (المنحى، الاتجاه، الطول)
 *   translate(M, u)                 → M′ tel que MM′ = u                              (الانسحاب)
 *   fourthVertex(A, B, C)           → D tel que ABCD متوازي أضلاع (AB = DC)
 *   midpoint(A, B), distance(A, B)  → I((xA+xB)/2 ; (yA+yB)/2), √((xB−xA)² + (yB−yA)²)
 *   triangleNature, quadNature, onCircle — les preuves analytiques de l'unité 12.
 */
import { frac, parseNumber, add, sub, mul, div, eq, cmp, toNumber } from './linear.js';
import { sqrt, surd, surdMul, surdLatex, surdText, surdNumber, isRational, pythagoras, sinDeg, asinDeg } from './trigonometry.js';

const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : Number.isInteger(v) ? frac(v) : parseFrac(v));
function parseFrac(v) {
  const s = String(v).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return div(parseNumber(a), parseNumber(b)); }
  return parseNumber(s);
}
const ZERO = frac(0);

// ── Points et vecteurs en coordonnées ────────────────────────────────────────

/** Un point (ou un vecteur) { x, y } exact ; accepte 2, '-1,5', '7/2' ou une fraction. */
export const point = (x, y) => Object.freeze({ x: F(x), y: F(y) });
export const vector = point;
const P = (p) => (p && 'x' in p && typeof p.x === 'object' ? p : point(p.x ?? p[0], p.y ?? p[1]));

/** Les مركبتان de AB : (xB − xA ; yB − yA). */
export const vec = (A, B) => { A = P(A); B = P(B); return point(sub(B.x, A.x), sub(B.y, A.y)); };
export const vecAdd = (u, v) => { u = P(u); v = P(v); return point(add(u.x, v.x), add(u.y, v.y)); };
export const vecSub = (u, v) => { u = P(u); v = P(v); return point(sub(u.x, v.x), sub(u.y, v.y)); };
export const vecNeg = (u) => { u = P(u); return point(sub(ZERO, u.x), sub(ZERO, u.y)); };
export const vecScale = (u, k) => { u = P(u); return point(mul(u.x, F(k)), mul(u.y, F(k))); };
export const vecEq = (u, v) => { u = P(u); v = P(v); return eq(u.x, v.x) && eq(u.y, v.y); };
export const isZeroVec = (u) => { u = P(u); return eq(u.x, ZERO) && eq(u.y, ZERO); };
/** L'image de M par le انسحاب de vecteur u. */
export const translate = (M, u) => vecAdd(M, u);
/** Le déterminant (u, v) : nul ⇔ même منحى. */
export const det = (u, v) => { u = P(u); v = P(v); return sub(mul(u.x, v.y), mul(u.y, v.x)); };

/** Le carré de la طويلة (fraction exacte). */
export const normSquared = (u) => { u = P(u); return add(mul(u.x, u.x), mul(u.y, u.y)); };
/** La طويلة exacte (surd). */
export const norm = (u) => sqrt(normSquared(u));
export const distanceSquared = (A, B) => normSquared(vec(A, B));
/** AB = √((xB − xA)² + (yB − yA)²), exact. */
export const distance = (A, B) => norm(vec(A, B));

/**
 * Compare deux vecteurs comme le manuel (معارف 1) : même منحى (direction), même اتجاه (sense, null si les
 * منحى diffèrent ou si l'un est nul), même طول (length). equal ⇔ les trois ; opposite ⇔ même منحى, sens contraire, même طول.
 */
export function relation(u, v) {
  u = P(u); v = P(v);
  const direction = eq(det(u, v), ZERO) && !isZeroVec(u) && !isZeroVec(v);
  const dot = add(mul(u.x, v.x), mul(u.y, v.y));
  const sense = direction ? cmp(dot, ZERO) > 0 : null;
  const length = eq(normSquared(u), normSquared(v));
  return Object.freeze({
    direction, sense, length,
    equal: vecEq(u, v),
    opposite: vecEq(u, vecNeg(v)) && !isZeroVec(u),
  });
}

// ── Points remarquables ──────────────────────────────────────────────────────

/** I milieu de [AB] : ((xA + xB)/2 ; (yA + yB)/2). */
export const midpoint = (A, B) => { A = P(A); B = P(B); return point(div(add(A.x, B.x), frac(2)), div(add(A.y, B.y), frac(2))); };
/** Le symétrique de A par rapport à I (I milieu de [AA′]). */
export const symmetric = (A, I) => { A = P(A); I = P(I); return point(sub(mul(frac(2), I.x), A.x), sub(mul(frac(2), I.y), A.y)); };
/** D tel que ABCD soit un parallélogramme : AB = DC ⇔ D = A + C − B. */
export const fourthVertex = (A, B, C) => vecAdd(P(A), vec(P(B), P(C)));
/** Règle du parallélogramme : AB + AD = AC ⇔ C = B + D − A. */
export const parallelogramSum = (A, B, D) => vecAdd(P(B), vec(P(A), P(D)));
/** Trois points alignés ⇔ det(AB, AC) = 0. */
export const collinear = (A, B, C) => eq(det(vec(A, B), vec(A, C)), ZERO);

/** ABCD (dans cet ordre) est-il un متوازي أضلاع non aplati ? AB = DC et A, B, C non alignés. */
export function isParallelogram(A, B, C, D) {
  return vecEq(vec(A, B), vec(D, C)) && !collinear(A, B, C);
}

/**
 * La nature d'un triangle par les CARRÉS des distances (عكس فيثاغورس) :
 * { sides: { AB, BC, CA } (carrés), right: sommet de l'angle droit | null, isosceles: sommet principal | null, equilateral }.
 */
export function triangleNature(A, B, C, names = ['A', 'B', 'C']) {
  const [a, b, c] = names;
  const sq = { [a + b]: distanceSquared(A, B), [b + c]: distanceSquared(B, C), [c + a]: distanceSquared(C, A) };
  const ab = sq[a + b]; const bc = sq[b + c]; const ca = sq[c + a];
  let right = null;
  if (eq(add(ab, ca), bc)) right = a;
  else if (eq(add(ab, bc), ca)) right = b;
  else if (eq(add(bc, ca), ab)) right = c;
  const equilateral = eq(ab, bc) && eq(bc, ca);
  let isosceles = null;
  if (!equilateral) {
    if (eq(ab, ca)) isosceles = a; else if (eq(ab, bc)) isosceles = b; else if (eq(bc, ca)) isosceles = c;
  }
  return Object.freeze({ sides: Object.freeze(sq), right, isosceles, equilateral });
}

/**
 * La nature d'un quadrilatère ABCD : 'square' | 'rectangle' | 'rhombus' | 'parallelogram' | 'none',
 * par les critères du manuel (AB = DC ; diagonales de même longueur ; deux côtés consécutifs égaux).
 */
export function quadNature(A, B, C, D) {
  if (!isParallelogram(A, B, C, D)) return 'none';
  const rect = eq(distanceSquared(A, C), distanceSquared(B, D));
  const rhombus = eq(distanceSquared(A, B), distanceSquared(B, C));
  return rect && rhombus ? 'square' : rect ? 'rectangle' : rhombus ? 'rhombus' : 'parallelogram';
}

/** M appartient-il au cercle de centre O de rayon r (nombre ou surd via r²) ? Compare OM² et r². */
export function onCircle(O, r, M) {
  const r2 = typeof r === 'object' && r !== null && 'r' in r ? mul(mul(r.q, r.q), frac(r.r)) : mul(F(r), F(r));
  return eq(distanceSquared(O, M), r2);
}

// ── Vecteurs NOMMÉS : Chasles, opposés, nul ──────────────────────────────────

/**
 * Simplifie une somme de vecteurs nommés, chaque terme « AB » ou « -AB » (« BA » = « -AB »).
 * Rend 'XY' si la somme est un seul vecteur, '0' si elle est nulle, null sinon.
 *   ['AB', 'BC']        → 'AC'   (علاقة شال)
 *   ['AB', 'BA']        → '0'    (شعاعان متعاكسان)
 *   ['AB', 'CD']        → null   (pas un seul vecteur sans autre donnée)
 *   ['AB', 'BC', 'CD']  → 'AD'
 */
export function simplifyNamed(terms) {
  const coef = new Map();
  const bump = (p, k) => coef.set(p, (coef.get(p) ?? 0) + k);
  for (const raw of terms) {
    const t = String(raw).trim();
    const neg = t.startsWith('-');
    const name = neg ? t.slice(1) : t.replace(/^\+/, '');
    const pts = name.match(/[A-Z][′'0-9]*/g);
    if (!pts || pts.length !== 2) throw new Error(`vecteur illisible : « ${raw} »`);
    const s = neg ? -1 : 1;
    bump(pts[0], -s); bump(pts[1], s);
  }
  const live = [...coef.entries()].filter(([, k]) => k !== 0);
  if (live.length === 0) return '0';
  if (live.length === 2) {
    const start = live.find(([, k]) => k === -1); const end = live.find(([, k]) => k === 1);
    if (start && end) return `${start[0]}${end[0]}`;
  }
  return null;
}

/** Une chaîne de Chasles est-elle bien raccordée ? ['AB', 'BC', 'CD'] → true ; ['AB', 'CD'] → false. */
export function isChain(names) {
  for (let i = 1; i < names.length; i += 1) {
    const prevEnd = names[i - 1].match(/[A-Z][′'0-9]*/g)[1];
    const start = names[i].match(/[A-Z][′'0-9]*/g)[0];
    if (prevEnd !== start) return false;
  }
  return true;
}

// ── Traverser un courant : la somme de deux vitesses (تحدّ p. 127, قاعدة متوازي الأضلاع) ──────────────
// Ajouté par l'auteur de « majmu-shuaayn » (lab `vector-sum`, niveau متقدم).

/**
 * Un nageur de vitesse propre `swim` (km/h) traverse un courant `current` PERPENDICULAIRE à la traversée [AB]. Il vise
 * à θ° de (AB) vers l'AMONT ; sa vitesse réelle est la SOMME vitesse propre + courant (قاعدة متوازي الأضلاع). Elle suit
 * (AB) ⇔ swim · sin θ = current. Rend :
 *   possible     current < swim (sinon le courant l'emporte toujours) ;
 *   sin          la fraction EXACTE current ÷ swim (2 ÷ 4 = 1/2) ;
 *   angle        le degré ENTIER exact quand il existe — d'après le théorème de Niven, le seul sinus rationnel d'un angle
 *                entier de ]0° ; 90°[ est 1/2 : angle = 30 ⇔ sin = 1/2, sinon null ;
 *   approxAngle  l'angle approché (calculatrice) ;
 *   speed        la vitesse réelle EXACTE √(swim² − current²) (un surd : √12 = 2√3).
 */
export function crossing({ swim, current }) {
  const s = F(swim); const c = F(current);
  if (cmp(c, ZERO) <= 0 || cmp(c, s) >= 0) return Object.freeze({ possible: false, sin: null, angle: null, approxAngle: null, speed: null });
  const sin = div(c, s);
  return Object.freeze({
    possible: true, sin,
    angle: eq(sin, frac(1, 2)) ? 30 : null,
    approxAngle: asinDeg(toNumber(sin)),
    speed: pythagoras({ hypotenuse: s, a: c }),
  });
}

/**
 * Où arrive le nageur qui vise à θ° ENTIER de (AB) vers l'amont (θ ≤ 0 : droit sur B ou vers l'aval) :
 * 'target' (sur B), 'downstream' (emporté vers l'aval : swim·sin θ < current) ou 'upstream' (au-delà, vers l'amont).
 * 'target' est décidé EXACTEMENT (θ = crossing().angle) ; ailleurs l'égalité est impossible (Niven), la comparaison des
 * flottants ne peut donc pas se tromper de côté.
 */
export function crossingSide({ swim, current }, theta) {
  const k = crossing({ swim, current });
  if (k.angle != null && theta === k.angle) return 'target';
  if (!k.possible || theta <= 0) return 'downstream';
  return toNumber(F(swim)) * sinDeg(theta) < toNumber(F(current)) ? 'downstream' : 'upstream';
}

// ── Le plus court passage d'une bande (« أدمج تعلّماتي », وضعية « ممر الراجلين ») ───────────────────────────

/**
 * Une bande entre deux droites parallèles HORIZONTALES : le bord bas y = 0, le bord haut y = w (la route, l'oued).
 * A est au-dessus (yA ≥ w), B au-dessous (yB ≤ 0) ; le passage [MN] est PERPENDICULAIRE aux bords : M(x ; w) sur le
 * bord haut, N(x ; 0) sur le bord bas, donc NM = (0 ; w) quel que soit x (le vecteur du passage ne dépend pas de sa place).
 *
 *   crossingAt({ A, B, width }, x)  → { M, N, AM, NB (surds), MN (fraction) } — les trois morceaux du trajet A → M → N → B
 *   shortestCrossing({ A, B, width }) → { Bp, M, N, x, ABp (surd), MN } :
 *        B′ = translate(B, NM) ; MB′BN متوازي أضلاع donc NB = MB′ et AM + MN + NB = (AM + MB′) + MN ≥ AB′ + MN,
 *        égalité ⇔ M ∈ [AB′] : M = [AB′] ∩ (y = w) (x exact, fraction), N = translate(M, MN).
 * Le minimum AB′ + MN est un surd plus un rationnel : on rend les deux morceaux (`ABp`, `MN`), jamais un flottant.
 */
function crossingCheck(A, B, w) {
  if (cmp(w, ZERO) <= 0) throw new Error('crossing: width > 0');
  if (cmp(A.y, w) < 0 || cmp(B.y, ZERO) > 0) throw new Error('crossing: A au-dessus du bord haut, B au-dessous du bord bas');
}
export function crossingAt({ A, B, width }, x) {
  A = P(A); B = P(B); const w = F(width); const X = F(x);
  crossingCheck(A, B, w);
  const M = point(X, w); const N = point(X, ZERO);
  return Object.freeze({ M, N, AM: distance(A, M), NB: distance(N, B), MN: w });
}
export function shortestCrossing({ A, B, width }) {
  A = P(A); B = P(B); const w = F(width);
  crossingCheck(A, B, w);
  const nm = point(ZERO, w);
  const Bp = translate(B, nm);
  // M sur [AB′] et sur y = w : M = A + t·AB′ avec t = (yA − w) ÷ (yA − yB′) (yB′ = yB + w ≤ w ≤ yA).
  const dy = sub(A.y, Bp.y);
  const t = eq(dy, ZERO) ? ZERO : div(sub(A.y, w), dy);
  const x = add(A.x, mul(t, sub(Bp.x, A.x)));
  const M = point(x, w);
  return Object.freeze({ Bp, nm, x, M, N: point(x, ZERO), ABp: distance(A, Bp), MN: w });
}

// ── Comparer deux parcours (« أدمج تعلّماتي » de l'unité 12, وضعية « عدّاءان » p. 148) ─────────────────────────────
// Ajouté par l'auteur de « wadiya-idmajiya-maalam » (lab `route-compare`).

/**
 * Le demi-cercle de DIAMÈTRE [PQ] : son centre est le milieu de [PQ] et son rayon PQ ÷ 2 (surd exact) ; sa longueur est
 * π × rayon — on rend le rayon, c'est-à-dire le coefficient de π (3 demi-cercles de rayon 1 : 3π).
 */
export function semicircle(P, Q) {
  P = P_(P); Q = P_(Q);
  return Object.freeze({ centre: midpoint(P, Q), radius: surdMul(distance(P, Q), surd(frac(1, 2))) });
}
const P_ = (p) => (p && 'x' in p && typeof p.x === 'object' ? p : point(p.x ?? p[0], p.y ?? p[1]));

/** Où se referme le demi-cercle qui part de P autour du centre C : le symétrique de P par rapport à C (2C − P). */
export const arcEnd = (P, C) => symmetric(P_(P), P_(C));

/** Une somme de surds regroupés par radicande (3√2 + 2√2 = 5√2), dans l'ordre d'apparition, sans terme nul. */
export function surdSum(list) {
  const out = [];
  for (const raw of list) {
    const x = typeof raw === 'object' && raw !== null && 'r' in raw ? raw : surd(F(raw), 1);
    const k = out.findIndex((y) => y.r === x.r);
    if (k < 0) out.push(x); else out[k] = surd(add(out[k].q, x.q), x.r);
  }
  return Object.freeze(out.filter((x) => x.q.n !== 0));
}
/** « \sqrt{13} + \sqrt{5} + \sqrt{17} », « 5 + 5\sqrt{2} » ; la liste vide vaut « 0 ». */
export const surdSumLatex = (terms) => (terms.length ? terms.map((x) => surdLatex(x)).join(' + ') : '0');

/**
 * La longueur d'un PARCOURS { start: [x, y], pieces: [{ to: [x, y], arc?: 'cw' | 'ccw' }] } dans un معلم متعامد ومتجانس :
 * un morceau droit vaut la distance de ses extrémités (√(Δx² + Δy²)), un demi-cercle (arc, diamètre [from, to]) vaut π × r
 * avec le centre au milieu du diamètre. Rend :
 *   pieces    [{ from, to, kind: 'seg' | 'arc', length (surd ; pour un arc : le coefficient de π), centre?, radius? }]
 *   straight  la somme des morceaux droits, regroupée (surds) ;   piCoef  la somme des rayons, regroupée (coefficient de π)
 *   latex     « 3\pi », « \sqrt{13} + \sqrt{5} + \sqrt{17} », « 2\pi + 2 » ;   number  la longueur approchée (π de Math)
 * Deux parcours se comparent sur `number` : un écart réel entre deux sommes de racines et de π ne s'écrit pas exactement en 4AM.
 */
export function routeLength({ start, pieces }) {
  let from = P_(start);
  const out = [];
  for (const piece of pieces) {
    const to = P_(piece.to);
    if (piece.arc) {
      const s = semicircle(from, to);
      out.push(Object.freeze({ from, to, kind: 'arc', sweep: piece.arc, length: s.radius, centre: s.centre, radius: s.radius }));
    } else {
      out.push(Object.freeze({ from, to, kind: 'seg', length: distance(from, to) }));
    }
    from = to;
  }
  const straight = surdSum(out.filter((p) => p.kind === 'seg').map((p) => p.length));
  const piCoef = surdSum(out.filter((p) => p.kind === 'arc').map((p) => p.length));
  const piTex = piCoef.map((x) => (x.r === 1 && x.q.n === x.q.d ? '\\pi' : `${surdLatex(x)}\\pi`));
  const latex = [...piTex, ...straight.map((x) => surdLatex(x))].join(' + ') || '0';
  const number = straight.reduce((t, x) => t + surdNumber(x), 0) + Math.PI * piCoef.reduce((t, x) => t + surdNumber(x), 0);
  return Object.freeze({ pieces: Object.freeze(out), straight, piCoef, latex, number });
}

// ── Écritures ────────────────────────────────────────────────────────────────

function fracLatexSigned(p) { return `${p.n < 0 ? '-' : ''}\\dfrac{${Math.abs(p.n)}}{${p.d}}`; }
/** Nombre en écriture du manuel : entier, décimal à virgule, sinon fraction. */
export function numLatex(p) {
  const Q = F(p);
  let d = Q.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
  if (Q.d === 1) return String(Q.n);
  if (d === 1) return String(+(Q.n / Q.d).toFixed(6)).replace('.', '{,}');
  return fracLatexSigned(Q);
}
/** « \begin{pmatrix} 3 \\ -2 \end{pmatrix} » */
export const vecLatex = (u) => { u = P(u); return `\\begin{pmatrix} ${numLatex(u.x)} \\\\ ${numLatex(u.y)} \\end{pmatrix}`; };
/** « A(2\,;\,-1) » */
export const pointLatex = (name, A) => { A = P(A); return `${name}(${numLatex(A.x)}\\,;\\,${numLatex(A.y)})`; };
/** Une longueur exacte : « \sqrt{13} », « 3\sqrt{2} », « 5 ». */
export const distanceLatex = (A, B) => surdLatex(distance(A, B));
export const distanceText = (A, B) => surdText(distance(A, B));
export const distanceNumber = (A, B) => surdNumber(distance(A, B));
export const isRationalDistance = (A, B) => isRational(distance(A, B));
export const coords = (A) => { A = P(A); return [toNumber(A.x), toNumber(A.y)]; };
