/**
 * variationsUtils — le modèle mathématique de « Variations et extremums » (2nde).
 *
 * UNE FONCTION est `{ name, fn, domain: [a, b], turns: [x…] }` : `fn` calcule
 * l'image, `domain` est l'intervalle d'étude, `turns` les abscisses EXACTES
 * où le sens de variation change (déclarées, comme les zéros dans « Signe »).
 * Tout — flèches du tableau, extremums, comparaison de f(a) et f(b), bandes
 * de monotonie — est DÉRIVÉ ; aucun tableau n'est écrit à la main.
 *
 * Vocabulaire du programme : f est croissante sur I si a < b ⟹ f(a) ≤ f(b) ;
 * décroissante si a < b ⟹ f(a) ≥ f(b) ; monotone si l'un des deux.
 * Maximum de f sur I : la plus grande valeur PRISE par f sur I (atteinte).
 */
import { roundTo, formatDec } from '@smarter-academy/core';
import { sampleFunction } from '../../../../../common/utils/cartesian';

export { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export function makeFunction(name, fn, { domain, turns = [], tex = '', unit = '', xUnit = '' } = {}) {
  return { name, fn, domain, turns: [...turns].sort((a, b) => a - b), tex, unit, xUnit };
}
export const inDomain = (f, x) => x >= f.domain[0] - 1e-9 && x <= f.domain[1] + 1e-9;
export function imageOf(f, x) {
  if (!inDomain(f, x)) return null;
  const y = f.fn(x);
  return Number.isFinite(y) ? roundTo(y, 9) : null;
}

/* ── Variations ──────────────────────────────────────────────────────── */
/** Sens sur [a ; b] ⊂ domaine, par échantillonnage : 'croissante' | 'decroissante' | 'constante' | null (ni l'un ni l'autre). */
export function variationOn(f, a, b, n = 60) {
  let up = true; let down = true; let prev = null;
  for (let i = 0; i <= n; i += 1) {
    const x = a + (b - a) * i / n; const y = imageOf(f, x);
    if (y === null) return null;
    if (prev !== null) { if (y < prev - 1e-9) up = false; if (y > prev + 1e-9) down = false; }
    prev = y;
  }
  if (up && down) return 'constante';
  return up ? 'croissante' : down ? 'decroissante' : null;
}
/**
 * Le tableau de variations : bornes = [domaine[0], …turns, domaine[1]] ;
 * une flèche par intervalle ; la valeur de f à chaque borne.
 * → { bounds: [{ x, y }], arrows: ['croissante'|'decroissante'|'constante'] }
 */
export function variationTable(f) {
  const xs = [f.domain[0], ...f.turns.filter((t) => t > f.domain[0] && t < f.domain[1]), f.domain[1]];
  const bounds = xs.map((x) => ({ x, y: imageOf(f, x) }));
  const arrows = [];
  for (let i = 0; i < xs.length - 1; i += 1) arrows.push(variationOn(f, xs[i], xs[i + 1]));
  return { bounds, arrows };
}
/** Les intervalles de monotonie, avec leur sens : [{ from, to, direction }]. */
export const monotonyIntervals = (f) => { const t = variationTable(f); return t.arrows.map((d, i) => ({ from: t.bounds[i].x, to: t.bounds[i + 1].x, direction: d })); };

/* ── Extremums ───────────────────────────────────────────────────────── */
/** Le maximum (ou minimum) de f sur [a ; b] : { value, at: [x…] } — parmi les bornes et les points de retournement. */
export function extremumOn(f, a, b, kind = 'max') {
  const cands = [a, b, ...f.turns.filter((t) => t > a && t < b)];
  let best = null;
  for (const x of cands) {
    const y = imageOf(f, x);
    if (y === null) continue;
    if (best === null || (kind === 'max' ? y > best.value + 1e-9 : y < best.value - 1e-9)) best = { value: y, at: [x] };
    else if (Math.abs(y - best.value) < 1e-9) best.at.push(x);
  }
  if (best) best.at.sort((u, v) => u - v);
  return best;
}
/** Comparaison directe de deux images : '<' | '=' | '>' (ou null). */
export function compareImages(f, a, b) {
  const ya = imageOf(f, a); const yb = imageOf(f, b);
  if (ya === null || yb === null) return null;
  return ya < yb ? '<' : ya > yb ? '>' : '=';
}
export const maxOn = (f, a = f.domain[0], b = f.domain[1]) => extremumOn(f, a, b, 'max');
export const minOn = (f, a = f.domain[0], b = f.domain[1]) => extremumOn(f, a, b, 'min');

/* ── Comparer f(a) et f(b) avec le seul tableau ──────────────────────── */
/**
 * Que peut-on dire de f(a) et f(b) (a < b) avec le tableau seul ?
 * → '<' | '>' | '=' | 'indetermine' (a et b ne sont pas dans un même intervalle de monotonie).
 */
export function compareByTable(f, a, b) {
  if (a === b) return '=';
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const iv = monotonyIntervals(f).find((I) => lo >= I.from - 1e-9 && hi <= I.to + 1e-9);
  if (!iv) return 'indetermine';
  if (iv.direction === 'constante') return '=';
  const r = iv.direction === 'croissante' ? '<' : '>';
  return a < b ? r : (r === '<' ? '>' : '<');
}

/* ── Courbes ─────────────────────────────────────────────────────────── */
export function curvePieces(f, range, samples = 240) {
  const lo = Math.max(range.xMin, f.domain[0]); const hi = Math.min(range.xMax, f.domain[1]);
  if (hi <= lo) return [];
  const out = []; let cur = [];
  for (const p of sampleFunction(f.fn, { xMin: lo, xMax: hi }, samples)) {
    if (p.y >= range.yMin - 1e-9 && p.y <= range.yMax + 1e-9) cur.push({ x: roundTo(p.x, 6), y: roundTo(p.y, 6) });
    else { if (cur.length >= 2) out.push(cur); cur = []; }
  }
  if (cur.length >= 2) out.push(cur);
  return out;
}

/* ── Écritures ───────────────────────────────────────────────────────── */
export const DIR_LABEL = { croissante: 'croissante', decroissante: 'décroissante', constante: 'constante' };
export const DIR_ARROW = { croissante: '↗', decroissante: '↘', constante: '→' };
export const intervalText = (a, b) => `[${formatDec(a)} ; ${formatDec(b)}]`;
export const coupleText = (x, y) => `(${formatDec(x)} ; ${formatDec(y)})`;

/* ── Les fonctions de la leçon (constantes littérales) ─────────────────── */
/**
 * M1 — le profil du sentier : altitude (m) selon la distance parcourue (km),
 * sur [0 ; 10]. Une cubique lissée : montée jusqu'à 3 km (620 m), descente
 * jusqu'à 6 km (380 m), remontée jusqu'à 8,5 km (560 m), descente finale.
 * Les points de retournement sont des abscisses de la grille (pas 0,5).
 */
function smoothProfile(x) {
  // Polynôme par morceaux : demi-cosinus entre deux sommets consécutifs (C¹, monotone par morceau).
  const nodes = [[0, 300], [3, 620], [6, 380], [8.5, 560], [10, 420]];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const [x0, y0] = nodes[i]; const [x1, y1] = nodes[i + 1];
    if (x >= x0 && x <= x1) { const t = (x - x0) / (x1 - x0); const s = (1 - Math.cos(Math.PI * t)) / 2; return y0 + (y1 - y0) * s; }
  }
  return NaN;
}
export const TRAIL = makeFunction('h', smoothProfile, { domain: [0, 10], turns: [3, 6, 8.5], unit: ' m', xUnit: ' km' });
export const TRAIL_RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 700 };

/** M2 — une parabole sur [−3 ; 4] : f(x) = 0,5(x − 1)² − 2, minimum −2 en 1. */
export const PARAB = makeFunction('f', (x) => 0.5 * (x - 1) ** 2 - 2, { domain: [-3, 4], turns: [1], tex: 'f(x) = 0{,}5(x-1)^2 - 2' });
export const PARAB_RANGE = { xMin: -3, xMax: 4, yMin: -3, yMax: 7 };
/** M3–M5 — une courbe « à bosse » sur [−4 ; 4] : g(x) = −0,25x³ + 3x/2... ajustée pour des sommets à −2 et 2 : g(x) = 0,25x³ − 3x. */
export const BOSSE = makeFunction('g', (x) => 0.25 * x ** 3 - 3 * x, { domain: [-4, 4], turns: [-2, 2], tex: 'g(x) = 0{,}25x^3 - 3x' });
export const BOSSE_RANGE = { xMin: -4, xMax: 4, yMin: -5, yMax: 5 };
/** M6 — l'enclos : rectangle de périmètre 40 m, largeur x, aire A(x) = x(20 − x) sur [0 ; 20]. */
export const ENCLOS = makeFunction('A', (x) => x * (20 - x), { domain: [0, 20], turns: [10], tex: 'A(x) = x(20-x)', unit: ' m²', xUnit: ' m' });
export const ENCLOS_RANGE = { xMin: 0, xMax: 20, yMin: 0, yMax: 110 };
