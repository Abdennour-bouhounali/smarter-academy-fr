/**
 * referenceUtils — le modèle des trois fonctions de référence (2nde).
 *
 * (Copié-adapté de fonctions-2nde/fonctionsUtils.js le 2026-09-06 —
 * INTERACTION_PEDAGOGY §6ter.6 : on copie, on n'importe pas entre leçons.)
 *
 * SQUARE  x ↦ x²      sur ℝ
 * INVERSE x ↦ 1/x     sur ℝ* = ]−∞ ; 0[ ∪ ]0 ; +∞[   (0 n'a pas d'image)
 * ABS     x ↦ |x|     sur ℝ
 *
 * Tout ce que la leçon affirme (symétrie, signe, variations, comparaison de
 * courbes) est CALCULÉ ici, jamais écrit à la main dans un module.
 */
import { roundTo, formatDec } from '@smarter-academy/core';
import { sampleFunction, antecedentsOf as antecedentsOnCurve } from '../../../../../common/utils/cartesian';

export { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/* ── Intervalles ─────────────────────────────────────────────────────── */
export const interval = (a, b, { openA = false, openB = false } = {}) => ({ a, b, openA, openB });
export const R = [interval(null, null)];
export const R_STAR = [interval(null, 0, { openB: true }), interval(0, null, { openA: true })];
export function inInterval(I, x) {
  if (I.a !== null && (I.openA ? x <= I.a : x < I.a)) return false;
  if (I.b !== null && (I.openB ? x >= I.b : x > I.b)) return false;
  return true;
}
export const inDomain = (domain, x) => domain.some((I) => inInterval(I, x));
export function intervalText(I) {
  const lo = I.a === null ? ']−∞' : `${I.openA ? ']' : '['}${formatDec(I.a)}`;
  const hi = I.b === null ? '+∞[' : `${formatDec(I.b)}${I.openB ? '[' : ']'}`;
  return `${lo} ; ${hi}`;
}
export const domainText = (domain) => (domain === R ? 'ℝ' : domain === R_STAR ? 'ℝ* = ]−∞ ; 0[ ∪ ]0 ; +∞[' : domain.map(intervalText).join(' ∪ '));

/* ── Fonctions ───────────────────────────────────────────────────────── */
export function makeFunction(id, name, fn, domain, extra = {}) { return { id, name, fn, domain, ...extra }; }
export function imageOf(f, x) {
  if (!inDomain(f.domain, x)) return null;
  const y = f.fn(x);
  return Number.isFinite(y) ? roundTo(y, 9) : null;
}
/** Un morceau de courbe par intervalle du domaine, coupé au cadre ; les valeurs hors cadre sont retirées. */
export function curvePieces(f, range, samples = 200) {
  const out = [];
  for (const I of f.domain) {
    const lo = I.a === null ? range.xMin : Math.max(range.xMin, I.a);
    const hi = I.b === null ? range.xMax : Math.min(range.xMax, I.b);
    if (hi <= lo) continue;
    const eps = (hi - lo) * 1e-4;
    const from = I.openA && I.a !== null && lo === I.a ? lo + eps : lo;
    const to = I.openB && I.b !== null && hi === I.b ? hi - eps : hi;
    let cur = [];
    for (const p of sampleFunction(f.fn, { xMin: from, xMax: to }, samples)) {
      if (p.y >= range.yMin - 1e-9 && p.y <= range.yMax + 1e-9) cur.push({ x: roundTo(p.x, 6), y: roundTo(p.y, 6) });
      else { if (cur.length >= 2) out.push(cur); cur = []; }
    }
    if (cur.length >= 2) out.push(cur);
  }
  return out;
}
/** TOUS les antécédents de y dans le cadre (exacts pour les trois références, sinon dichotomie). */
export function antecedentsOf(f, y, range) {
  if (f.id === 'square') return y < 0 ? [] : y === 0 ? [0] : [-Math.sqrt(y), Math.sqrt(y)].filter((x) => x >= range.xMin && x <= range.xMax).map((v) => roundTo(v, 6));
  if (f.id === 'inverse') return y === 0 ? [] : [1 / y].filter((x) => x >= range.xMin && x <= range.xMax).map((v) => roundTo(v, 6));
  if (f.id === 'abs') return y < 0 ? [] : y === 0 ? [0] : [-y, y].filter((x) => x >= range.xMin && x <= range.xMax).map((v) => roundTo(v, 6));
  const out = [];
  for (const pc of curvePieces(f, { ...range, yMin: -Infinity, yMax: Infinity }, 400)) for (const x0 of antecedentsOnCurve(pc, y)) out.push(roundTo(x0, 4));
  return [...new Set(out)].sort((a, b) => a - b);
}
export const tableOf = (f, xs) => xs.map((x) => ({ x, y: imageOf(f, x) }));

/* ── Les trois références ────────────────────────────────────────────── */
export const SQUARE = makeFunction('square', 'f', (x) => x * x, R, { label: 'x²', tex: 'f(x) = x^2', tone: 'indigo', color: '#4f46e5' });
export const INVERSE = makeFunction('inverse', 'g', (x) => 1 / x, R_STAR, { label: '1/x', tex: 'g(x) = \\dfrac{1}{x}', tone: 'rose', color: '#e11d48' });
export const ABS = makeFunction('abs', 'h', (x) => Math.abs(x), R, { label: '|x|', tex: 'h(x) = |x|', tone: 'emerald', color: '#059669' });
export const REFERENCES = [SQUARE, INVERSE, ABS];

/* ── Propriétés calculées ────────────────────────────────────────────── */
/** Symétrie : 'axe' si f(−x) = f(x), 'centre' si f(−x) = −f(x), sinon null — testée sur une grille. */
export function symmetryOf(f, xs = [0.5, 1, 1.5, 2, 3, 4]) {
  const pairs = xs.map((x) => [imageOf(f, x), imageOf(f, -x)]).filter(([a, b]) => a !== null && b !== null);
  if (pairs.every(([a, b]) => Math.abs(a - b) < 1e-9)) return 'axe';
  if (pairs.every(([a, b]) => Math.abs(a + b) < 1e-9)) return 'centre';
  return null;
}
/** Sens de variation de f sur [a ; b] (échantillonné) : 'croissante' | 'decroissante' | null. */
export function variationOn(f, a, b, n = 50) {
  let up = true; let down = true; let prev = null;
  for (let i = 0; i <= n; i += 1) {
    const x = a + (b - a) * i / n;
    const y = imageOf(f, x);
    if (y === null) return null;
    if (prev !== null) { if (y < prev - 1e-12) up = false; if (y > prev + 1e-12) down = false; }
    prev = y;
  }
  return up ? 'croissante' : down ? 'decroissante' : null;
}
/** Comparaison de deux images : '<' | '=' | '>' (ou null si l'une manque). */
export function compareImages(f, a, b) {
  const ya = imageOf(f, a); const yb = imageOf(f, b);
  if (ya === null || yb === null) return null;
  return ya < yb ? '<' : ya > yb ? '>' : '=';
}
/** Ordre des trois références en x > 0 : les labels du plus petit au plus grand. */
export function orderAt(x) {
  const vals = REFERENCES.map((f) => ({ label: f.label, y: imageOf(f, x) })).filter((v) => v.y !== null);
  return vals.sort((u, v) => u.y - v.y).map((v) => v.label);
}
/** x² ≤ |x| ⟺ −1 ≤ x ≤ 1. */
export const squareBelowAbs = (x) => x * x <= Math.abs(x);
export const squareBelowAbsInterval = interval(-1, 1);
/** Signe d'une image : '+' | '−' | '0' | null. */
export function signOf(f, x) { const y = imageOf(f, x); return y === null ? null : y > 0 ? '+' : y < 0 ? '−' : '0'; }

/* ── Cadres ──────────────────────────────────────────────────────────── */
export const LAB_RANGE = { xMin: -4, xMax: 4, yMin: -4, yMax: 8 };
export const SQUARE_RANGE = { xMin: -4, xMax: 4, yMin: -1, yMax: 10 };
export const INVERSE_RANGE = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 };
export const ABS_RANGE = { xMin: -4, xMax: 4, yMin: -1, yMax: 5 };
export const inRange = (range, x, y) => x >= range.xMin && x <= range.xMax && y >= range.yMin && y <= range.yMax;

export const coupleText = (x, y) => `(${formatDec(x)} ; ${formatDec(y)})`;
/** « f(3) = 9 » / « g(0) n'existe pas ». */
export function imageText(f, x) {
  const y = imageOf(f, x);
  return y === null ? `${f.name}(${formatDec(x)}) n’existe pas` : `${f.name}(${formatDec(x)}) = ${formatDec(y)}`;
}
