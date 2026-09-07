/**
 * signeUtils — le modèle mathématique de la leçon « Signe d'une fonction » (2nde).
 *
 * UNE FONCTION est `{ name, fn, zeros, forbidden, domain }` :
 *  - `fn(x)` calcule l'image ;
 *  - `zeros` sont les zéros EXACTS (déclarés, pas approchés : ce sont eux
 *    qui structurent le tableau de signes) ;
 *  - `forbidden` les valeurs interdites (dénominateur nul) — double barre ;
 *  - `domain` = [a, b] l'intervalle d'étude (null = ±∞).
 *
 * Tout ce qui est affiché — la couleur d'un point, l'axe peint, chaque case
 * d'un tableau de signes, la solution d'une inéquation — est DÉRIVÉ de ces
 * fonctions ; aucun tableau n'est écrit à la main dans un module.
 */
import { roundTo, formatDec } from '@smarter-academy/core';
import { sampleFunction } from '../../../../../common/utils/cartesian';

export { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export function makeFunction(name, fn, { zeros = [], forbidden = [], domain = [null, null], tex = '', factors = null } = {}) {
  return { name, fn, zeros: [...zeros].sort((a, b) => a - b), forbidden: [...forbidden].sort((a, b) => a - b), domain, tex, factors };
}
export const inDomain = (f, x) => (f.domain[0] === null || x >= f.domain[0]) && (f.domain[1] === null || x <= f.domain[1]) && !f.forbidden.includes(x);
export function imageOf(f, x) {
  if (!inDomain(f, x)) return null;
  const y = f.fn(x);
  return Number.isFinite(y) ? roundTo(y, 9) : null;
}
/** '+' | '−' | '0' | null (hors domaine / valeur interdite). */
export function signAt(f, x) {
  if (f.zeros.includes(x)) return '0';
  const y = imageOf(f, x);
  if (y === null) return null;
  if (Math.abs(y) < 1e-12) return '0';
  return y > 0 ? '+' : '−';
}

/* ── Tableau de signes ───────────────────────────────────────────────── */
/**
 * Les points critiques (zéros et valeurs interdites) dans l'intervalle
 * d'étude, puis le signe sur chaque intervalle ouvert entre deux critiques
 * (évalué au milieu, ou à distance 1 d'une borne infinie).
 * → { bounds: [x…] (avec −∞/+∞ = null), cells: [{ from, to, sign }], marks: [{ x, kind: 'zero'|'forbidden' }] }
 */
export function signTable(f) {
  const [lo, hi] = f.domain;
  const crit = [...new Set([...f.zeros, ...f.forbidden])].filter((x) => (lo === null || x > lo) && (hi === null || x < hi)).sort((a, b) => a - b);
  const bounds = [lo, ...crit, hi];
  const cells = [];
  for (let i = 0; i < bounds.length - 1; i += 1) {
    const a = bounds[i]; const b = bounds[i + 1];
    const probe = a === null && b === null ? 0 : a === null ? b - 1 : b === null ? a + 1 : (a + b) / 2;
    cells.push({ from: a, to: b, sign: signAt(f, probe) });
  }
  const marks = crit.map((x) => ({ x, kind: f.forbidden.includes(x) ? 'forbidden' : 'zero' }));
  return { bounds, cells, marks };
}
/** Le tableau de signes d'un facteur affine seul (pour les lignes intermédiaires). */
export const affine = (a, b, name = null) => makeFunction(name ?? affineText(a, b), (x) => a * x + b, { zeros: a === 0 ? [] : [roundTo(-b / a, 9)], tex: affineTex(a, b) });
/** Règle des signes : le signe d'un produit / quotient à partir des signes des facteurs. */
export function combineSigns(signs, { quotient = false } = {}) {
  if (signs.some((s) => s === null)) return null;
  if (quotient && signs[1] === '0') return null;
  if (signs.includes('0')) return '0';
  const neg = signs.filter((s) => s === '−').length;
  return neg % 2 === 0 ? '+' : '−';
}
/** Un produit ou quotient de deux facteurs affines, avec ses lignes. */
export function productOf(f1, f2, { quotient = false, name = 'f' } = {}) {
  const fn = quotient ? (x) => f1.fn(x) / f2.fn(x) : (x) => f1.fn(x) * f2.fn(x);
  const zeros = quotient ? f1.zeros.filter((z) => !f2.zeros.includes(z)) : [...new Set([...f1.zeros, ...f2.zeros])];
  return makeFunction(name, fn, { zeros, forbidden: quotient ? f2.zeros : [], factors: [f1, f2], tex: quotient ? `\\dfrac{${f1.tex}}{${f2.tex}}` : `(${f1.tex})(${f2.tex})` });
}

/* ── Résolution par le signe ─────────────────────────────────────────── */
const REL = { '>': ['+'], '<': ['−'], '>=': ['+', '0'], '<=': ['−', '0'], '=': ['0'] };
/**
 * Les solutions de f(x) ⋈ 0 comme réunion d'intervalles : [{ a, b, openA, openB }]
 * (zéros inclus pour ≥ / ≤, valeurs interdites TOUJOURS exclues).
 */
export function solveSign(f, rel) {
  const t = signTable(f);
  const wanted = REL[rel];
  if (rel === '=') return f.zeros.filter((z) => inDomain(f, z)).map((z) => ({ a: z, b: z, openA: false, openB: false }));
  const out = [];
  for (const c of t.cells) {
    if (!wanted.includes(c.sign)) continue;
    // Une borne est incluse si c'est un zéro demandé (≥, ≤) ou une borne FERMÉE
    // de l'intervalle d'étude ; une valeur interdite n'est jamais incluse.
    const incA = c.from !== null && !f.forbidden.includes(c.from) && ((wanted.includes('0') && f.zeros.includes(c.from)) || (c.from === f.domain[0] && !f.zeros.includes(c.from)));
    const incB = c.to !== null && !f.forbidden.includes(c.to) && ((wanted.includes('0') && f.zeros.includes(c.to)) || (c.to === f.domain[1] && !f.zeros.includes(c.to)));
    const last = out[out.length - 1];
    if (last && last.b === c.from && !last.openB && incA) { last.b = c.to; last.openB = !incB; }
    else out.push({ a: c.from, b: c.to, openA: !incA, openB: !incB });
  }
  return out;
}
export function intervalText(I) {
  if (I.a === I.b && I.a !== null) return `{${formatDec(I.a)}}`;
  const lo = I.a === null ? ']−∞' : `${I.openA ? ']' : '['}${formatDec(I.a)}`;
  const hi = I.b === null ? '+∞[' : `${formatDec(I.b)}${I.openB ? '[' : ']'}`;
  return `${lo} ; ${hi}`;
}
export const setText = (intervals) => (intervals.length === 0 ? '∅' : intervals.every((I) => I.a === I.b) ? `{${intervals.map((I) => formatDec(I.a)).join(' ; ')}}` : intervals.map(intervalText).join(' ∪ '));

/* ── Courbes ─────────────────────────────────────────────────────────── */
/** Morceaux de courbe dans `range`, coupés aux valeurs interdites et au cadre vertical. */
export function curvePieces(f, range, samples = 240) {
  const lo = f.domain[0] === null ? range.xMin : Math.max(range.xMin, f.domain[0]);
  const hi = f.domain[1] === null ? range.xMax : Math.min(range.xMax, f.domain[1]);
  const cuts = [lo, ...f.forbidden.filter((v) => v > lo && v < hi), hi];
  const out = [];
  for (let i = 0; i < cuts.length - 1; i += 1) {
    const eps = (cuts[i + 1] - cuts[i]) * 1e-4;
    const from = f.forbidden.includes(cuts[i]) ? cuts[i] + eps : cuts[i];
    const to = f.forbidden.includes(cuts[i + 1]) ? cuts[i + 1] - eps : cuts[i + 1];
    let cur = [];
    for (const p of sampleFunction(f.fn, { xMin: from, xMax: to }, samples)) {
      if (p.y >= range.yMin - 1e-9 && p.y <= range.yMax + 1e-9) cur.push({ x: roundTo(p.x, 6), y: roundTo(p.y, 6) });
      else { if (cur.length >= 2) out.push(cur); cur = []; }
    }
    if (cur.length >= 2) out.push(cur);
  }
  return out;
}

/* ── Écritures ───────────────────────────────────────────────────────── */
const fd = (v) => formatDec(v);
export function affineText(a, b) {
  const ax = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '−x' : `${fd(a)}x`;
  if (!ax) return fd(b);
  if (b === 0) return ax;
  return `${ax} ${b < 0 ? '−' : '+'} ${fd(Math.abs(b))}`;
}
export const affineTex = (a, b) => affineText(a, b).replace('−', '-').replace(/(\d),(\d)/g, '$1{,}$2');
export const SIGN_LABEL = { '+': 'positif', '−': 'négatif', 0: 'nul', '0': 'nul' };
export const boundText = (v) => (v === null ? '' : fd(v));

/* ── Les fonctions de la leçon (constantes littérales) ─────────────────── */
/** M1 — la température d'une journée d'hiver : T(t) = −0,1(t − 6)(t − 18), gel avant 6 h et après 18 h. */
export const TEMP = makeFunction('T', (t) => -0.1 * (t - 6) * (t - 18), { zeros: [6, 18], domain: [0, 24], tex: 'T(t) = -0{,}1(t-6)(t-18)' });
export const TEMP_RANGE = { xMin: 0, xMax: 24, yMin: -12, yMax: 6 };
/** M1–M2 — une courbe qui traverse trois fois : f(x) = 0,2(x + 3)(x − 1)(x − 4) sur [−4 ; 5]. */
export const CUBIC = makeFunction('f', (x) => 0.2 * (x + 3) * (x - 1) * (x - 4), { zeros: [-3, 1, 4], domain: [-4, 5], tex: 'f(x) = 0{,}2(x+3)(x-1)(x-4)' });
export const CUBIC_RANGE = { xMin: -4, xMax: 5, yMin: -8, yMax: 7 };
/** M2 — un tableau donné sans courbe : g avec zéros −1 et 2, négative entre les deux. */
export const G2 = makeFunction('g', (x) => (x + 1) * (x - 2), { zeros: [-1, 2], tex: 'g(x) = (x+1)(x-2)' });
/** M4–M5 — produit et quotient. */
export const P4 = productOf(affine(1, -1), affine(1, 3), { name: 'P' });          // (x − 1)(x + 3)
export const Q4 = productOf(affine(1, 2), affine(1, -1), { quotient: true, name: 'Q' }); // (x + 2)/(x − 1)
export const P4_RANGE = { xMin: -5, xMax: 3, yMin: -5, yMax: 6 };
export const Q4_RANGE = { xMin: -5, xMax: 5, yMin: -6, yMax: 6 };
/** M6 — bénéfice B(q) = (q − 20)(80 − q) (centaines d'euros, q en dizaines d'articles). */
export const BENEFICE = productOf(affine(1, -20), affine(-1, 80), { name: 'B' });
export const Q6 = productOf(affine(1, -3), affine(1, 1), { quotient: true, name: 'h' }); // (x − 3)/(x + 1)
export const AFFINE_RANGE = { xMin: -5, xMax: 5, yMin: -6, yMax: 6 };
