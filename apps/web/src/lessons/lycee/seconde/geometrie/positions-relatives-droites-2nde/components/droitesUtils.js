/**
 * droitesUtils — la mathématique EXACTE de deux droites du plan (2nde).
 *
 * ─── MODÈLE ─────────────────────────────────────────────────────────────
 * Une droite est canoniquement `{ a, b, c }` : ax + by + c = 0, coefficients
 * ENTIERS réduits par leur pgcd et de signe normalisé (a > 0, ou a = 0 et
 * b > 0). Deux objets canoniques égaux ⟺ la même droite. Tout le reste —
 * vecteur directeur, pente, équation réduite, point d'intersection — est
 * DÉRIVÉ, jamais stocké : le dessin ne peut pas contredire le calcul.
 *
 * Les prédicats (parallèles, confondues, sécantes) sont des égalités
 * d'ENTIERS : aucun eps. Le déterminant réutilise `geometry2d.cross`. Les
 * coordonnées du point d'intersection sont des rationnels exacts `{n, d}` ;
 * seule l'affichage arrondit (0,5 quand la fraction termine, 7/3 sinon).
 *
 * REPÈRE : coordonnées d'élève, y vers le HAUT. La conversion vers le SVG
 * appartient à CoordPlane. `clipToBox` de geometry2d est purement « boîte »
 * et ne dépend pas de l'orientation.
 */
import { cross, vec, clipToBox } from '../../../../../common/utils/geometry2d';
import { formatDec, texDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/* ── Entiers et rationnels ───────────────────────────────────────────── */

export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) { [x, y] = [y, x % y]; }
  return x;
}

/** Rationnel réduit `{ n, d }`, d > 0. */
export function frac(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d)) throw new Error(`frac: entiers attendus (${n}/${d})`);
  if (d === 0) throw new Error('frac: dénominateur nul');
  let N = n;
  let D = d;
  if (D < 0) { N = -N; D = -D; }
  const g = gcd(N, D) || 1;
  return { n: N / g + 0, d: D / g };
}
export const fracValue = (f) => f.n / f.d;
export const fracEquals = (f, g) => f.n * g.d === g.n * f.d;
export const fracIsInt = (f) => f.d === 1;
/** La fraction s'écrit avec au plus deux décimales (1/2, 3/4, 1/25…). */
const terminates = (d) => 100 % d === 0;

/** 2 · 0,5 · −1/3 (moins typographique, virgule française). */
export function fracText(f) {
  if (f.d === 1) return formatDec(f.n);
  if (terminates(f.d)) return formatDec(f.n / f.d);
  return `${f.n < 0 ? '−' : ''}${Math.abs(f.n)}/${f.d}`;
}
/** Même chose en LaTeX pour <MathText>. */
export function fracTex(f) {
  if (f.d === 1) return texDec(f.n);
  if (terminates(f.d)) return texDec(f.n / f.d);
  return `${f.n < 0 ? '−' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}
/** 0,25 → 1/4 ; −1,5 → −3/2 (au plus 6 décimales). */
export function fracFromDecimal(x) {
  const r = roundTo(x, 6);
  const s = Math.abs(r).toString();
  const dp = s.includes('.') ? s.split('.')[1].length : 0;
  const d = 10 ** dp;
  return frac(Math.round(r * d), d);
}
const asFrac = (v) => (typeof v === 'number' ? fracFromDecimal(v) : v);

/* ── Droites canoniques ──────────────────────────────────────────────── */

export function normalizeLine({ a, b, c }) {
  if (a === 0 && b === 0) throw new Error('normalizeLine: a et b nuls — ce n’est pas une droite');
  const g = gcd(gcd(a, b), c) || 1;
  let A = a / g;
  let B = b / g;
  let C = c / g;
  if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
  return { a: A + 0, b: B + 0, c: C + 0 };
}
export const sameLine = (L1, L2) => L1.a === L2.a && L1.b === L2.b && L1.c === L2.c;

export function isValidVector(u) {
  return !!u && Number.isInteger(u.x) && Number.isInteger(u.y) && (u.x !== 0 || u.y !== 0);
}

/** La droite passant par A (entier) de vecteur directeur u (entier non nul). */
export function lineFromPointVector(A, u) {
  if (!isValidVector(u)) throw new Error('lineFromPointVector: vecteur directeur nul ou non entier');
  // Un vecteur normal est (u.y ; −u.x) : u.y·x − u.x·y + c = 0, avec A dessus.
  return normalizeLine({ a: u.y, b: -u.x, c: u.x * A.y - u.y * A.x });
}
export function lineFromTwoPoints(P, Q) {
  return lineFromPointVector(P, vec(P, Q));
}
/** y = mx + p, m et p décimaux (≤ 6 décimales) ou rationnels. */
export function lineFromSlopeIntercept(m, p) {
  const M = asFrac(m);
  const P = asFrac(p);
  // y = (Mn/Md)x + Pn/Pd  ⟺  Mn·Pd·x − Md·Pd·y + Pn·Md = 0
  return normalizeLine({ a: M.n * P.d, b: -(M.d * P.d), c: P.n * M.d });
}
/** x = c (droite verticale). */
export function verticalLine(c) {
  const C = asFrac(c);
  return normalizeLine({ a: C.d, b: 0, c: -C.n });
}

/** Vecteur directeur entier réduit (x > 0, ou x = 0 et y > 0). */
export function directionOf(L) {
  let x = -L.b;
  let y = L.a;
  const g = gcd(x, y) || 1;
  x /= g; y /= g;
  if (x < 0 || (x === 0 && y < 0)) { x = -x; y = -y; }
  // `+ 0` neutralise le −0 des flottants : { x: −0 } ≠ { x: 0 } en égalité stricte.
  return { x: x + 0, y: y + 0 };
}

/** Déterminant de deux vecteurs — nul ⟺ colinéaires. */
export const det = (u, v) => cross(u, v);

/* ── Les trois positions — l'objet même de la leçon ──────────────────── */

/** 'secantes' | 'paralleles' (strictement) | 'confondues'. Entiers, exact. */
export function relativePosition(L1, L2) {
  const D = L1.a * L2.b - L2.a * L1.b; // = det des vecteurs directeurs
  if (D !== 0) return 'secantes';
  return sameLine(L1, L2) ? 'confondues' : 'paralleles';
}
export function commonPointsCount(pos) {
  if (pos === 'secantes') return 1;
  if (pos === 'paralleles') return 0;
  return Infinity;
}
export const POSITION_LABEL = {
  secantes: 'sécantes',
  paralleles: 'strictement parallèles',
  confondues: 'confondues',
};
export const COMMON_POINTS_TEXT = {
  secantes: '1 point commun',
  paralleles: 'aucun point commun',
  confondues: 'une infinité de points communs',
};

/**
 * Point d'intersection EXACT (formules de Cramer), ou null.
 * Invariant testé : null ⟺ relativePosition(L1, L2) ≠ 'secantes'.
 */
export function intersection(L1, L2) {
  const D = L1.a * L2.b - L2.a * L1.b;
  if (D === 0) return null;
  return {
    x: frac(L2.c * L1.b - L1.c * L2.b, D),
    y: frac(L2.a * L1.c - L1.a * L2.c, D),
  };
}

/* ── Pente, équations ────────────────────────────────────────────────── */

/** Coefficient directeur, ou null pour une droite verticale. */
export function slopeOf(L) {
  if (L.b === 0) return null;
  return frac(-L.a, L.b);
}
export function interceptOf(L) {
  if (L.b === 0) return null;
  return frac(-L.c, L.b);
}
export function reducedEquation(L) {
  if (L.b === 0) return { kind: 'vertical', c: frac(-L.c, L.a) };
  return { kind: 'reduced', m: slopeOf(L), p: interceptOf(L) };
}
/** Le point ENTIER P est-il sur la droite ? */
export function isOn(L, P) {
  return L.a * P.x + L.b * P.y + L.c === 0;
}
export function parallelThrough(L, P) {
  return normalizeLine({ a: L.a, b: L.b, c: -(L.a * P.x + L.b * P.y) });
}
/** Ordonnée du point d'abscisse entière x (rationnel), null si verticale. */
export function yAt(L, x) {
  if (L.b === 0) return null;
  return frac(-(L.a * x + L.c), L.b);
}
export function xAt(L, y) {
  if (L.a === 0) return null;
  return frac(-(L.b * y + L.c), L.a);
}

const coefX = (m, tex) => {
  if (m.n === 0) return '';
  if (m.n === m.d) return 'x';
  if (m.n === -m.d) return '−x';
  return `${tex ? fracTex(m) : fracText(m)}x`;
};
function reducedString(L, tex) {
  const eq = reducedEquation(L);
  const minus = '−'; // KaTeX rend U+2212 ; texDec l'émet déjà
  const F = tex ? fracTex : fracText;
  if (eq.kind === 'vertical') return `x = ${F(eq.c)}`;
  const mx = coefX(eq.m, tex);
  if (!mx) return `y = ${F(eq.p)}`;
  if (eq.p.n === 0) return `y = ${mx}`;
  const abs = { n: Math.abs(eq.p.n), d: eq.p.d };
  return `y = ${mx} ${eq.p.n > 0 ? '+' : minus} ${F(abs)}`;
}
/** « y = 0,5x + 1 », « y = −x », « x = 3 » — texte DOM / aria. */
export const lineText = (L) => reducedString(L, false);
/** La même équation en LaTeX. */
export const lineTex = (L) => reducedString(L, true);

function cartesianString(L) {
  const minus = '−';
  const term = (k, v, first) => {
    if (k === 0) return '';
    const abs = Math.abs(k);
    const body = v ? (abs === 1 ? v : `${abs}${v}`) : `${abs}`;
    if (first) return `${k < 0 ? minus : ''}${body}`;
    return ` ${k < 0 ? minus : '+'} ${body}`;
  };
  let s = term(L.a, 'x', true);
  s += term(L.b, 'y', s === '');
  s += term(L.c, '', s === '');
  return `${s} = 0`;
}
/** « x − 2y + 2 = 0 » — l'équation cartésienne canonique. */
export const cartesianText = (L) => cartesianString(L);
export const cartesianTex = cartesianText;

/* ── Écritures de couples ────────────────────────────────────────────── */

export const coupleText = (x, y) => `(${formatDec(x)} ; ${formatDec(y)})`;
export const fracCoupleText = (P) => `(${fracText(P.x)} ; ${fracText(P.y)})`;
export const fracCoupleTex = (P) => `\\left(${fracTex(P.x)}\\,;\\,${fracTex(P.y)}\\right)`;

/* ── Cadres ──────────────────────────────────────────────────────────── */

/**
 * Un cadre carré ±h : graduation et pixels par unité bornés pour que le
 * nombre de graduations reste lisible (±6 → 13, ±15 → 15, ±40 → 17).
 */
export function frameFor(halfSpan, { widthPx = 408 } = {}) {
  const h = halfSpan;
  const step = h <= 8 ? 1 : h <= 16 ? 2 : h <= 40 ? 5 : 10;
  const unit = Math.max(4, Math.floor(widthPx / (2 * h)));
  return { range: { xMin: -h, xMax: h, yMin: -h, yMax: h }, step, unit };
}

/** La corde visible de la droite dans le cadre : [P, Q] ou null. */
export function clipLine(L, range) {
  const u = directionOf(L);
  const P = L.b !== 0 ? { x: 0, y: -L.c / L.b } : { x: -L.c / L.a, y: 0 };
  const seg = clipToBox({ kind: 'droite', a: P, b: { x: P.x + u.x, y: P.y + u.y } }, range);
  return seg ? [seg.from, seg.to] : null;
}

export function inRange(range, P) {
  return P.x >= range.xMin - 1e-9 && P.x <= range.xMax + 1e-9 && P.y >= range.yMin - 1e-9 && P.y <= range.yMax + 1e-9;
}
/** Le point d'intersection (rationnel) est-il dans le cadre ? */
export function intersectionInFrame(I, range) {
  if (!I) return false;
  return inRange(range, { x: fracValue(I.x), y: fracValue(I.y) });
}
export const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));
