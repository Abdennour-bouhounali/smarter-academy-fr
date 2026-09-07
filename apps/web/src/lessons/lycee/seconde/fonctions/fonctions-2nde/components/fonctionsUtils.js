/**
 * fonctionsUtils — le modèle mathématique de la leçon « Fonctions » (2nde).
 *
 * UNE FONCTION est ici un objet `{ name, fn, domain, tex? }` :
 *  - `fn(x)` calcule l'image (nombre) ;
 *  - `domain` est une RÉUNION d'intervalles `[{ a, b, openA?, openB? }]`
 *    (a ≤ b ; `null` pour ±∞) — l'ensemble de définition. Hors du domaine,
 *    `imageOf` renvoie `null` : « pas d'image », jamais un nombre inventé.
 *
 * L'objet porté par la leçon est LA BOÎTE SANS COUVERCLE : dans une feuille
 * carrée de côté `side` on découpe aux quatre coins un carré de côté x, puis
 * on plie — V(x) = x·(side − 2x)², définie sur ]0 ; side/2[. La formule reste
 * cachée à l'élève jusqu'au module 3 : le module 1 ne montre que la machine.
 *
 * LA DISSYMÉTRIE image / antécédent est encodée dans les types :
 * `imageOf` → UN nombre ou null ; `antecedentsOf` → UNE LISTE (vide, 1, 2…).
 *
 * Tout est pur ; les pixels appartiennent à CoordPlane.
 */
import { roundTo, formatDec } from '@smarter-academy/core';
import { sampleFunction, antecedentsOf as antecedentsOnCurve, imageAt } from '../../../../../common/utils/cartesian';

export { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/* ── Intervalles et réunions ─────────────────────────────────────────── */

export const interval = (a, b, { openA = false, openB = false } = {}) => ({ a, b, openA, openB });
export const R = [interval(null, null)];

export function inInterval(I, x) {
  if (I.a !== null && (I.openA ? x <= I.a : x < I.a)) return false;
  if (I.b !== null && (I.openB ? x >= I.b : x > I.b)) return false;
  return true;
}
export const inDomain = (domain, x) => domain.some((I) => inInterval(I, x));

/** « [8 ; 12] », « ]0 ; 10[ », « ]−∞ ; 3] » — l'écriture française des intervalles. */
export function intervalText(I) {
  const lo = I.a === null ? ']−∞' : `${I.openA ? ']' : '['}${formatDec(I.a)}`;
  const hi = I.b === null ? '+∞[' : `${formatDec(I.b)}${I.openB ? '[' : ']'}`;
  return `${lo} ; ${hi}`;
}
export const domainText = (domain) => (domain.length === 1 && domain[0].a === null && domain[0].b === null ? 'ℝ' : domain.map(intervalText).join(' ∪ '));

/* ── Fonctions ───────────────────────────────────────────────────────── */

export function makeFunction(name, fn, domain = R, extra = {}) {
  return { name, fn, domain, ...extra };
}

/** L'image de x : un nombre, ou null si x n'est pas dans l'ensemble de définition. */
export function imageOf(f, x) {
  if (!inDomain(f.domain, x)) return null;
  const y = f.fn(x);
  return Number.isFinite(y) ? roundTo(y, 9) : null;
}

/** Les morceaux de courbe (un par intervalle du domaine), coupés à `range`. */
export function curvePieces(f, range, samples = 160) {
  return f.domain.map((I) => {
    const lo = I.a === null ? range.xMin : Math.max(range.xMin, I.a);
    const hi = I.b === null ? range.xMax : Math.min(range.xMax, I.b);
    if (hi <= lo) return [];
    const eps = (hi - lo) * 1e-6;
    const from = I.openA && I.a !== null && lo === I.a ? lo + eps : lo;
    const to = I.openB && I.b !== null && hi === I.b ? hi - eps : hi;
    return sampleFunction(f.fn, { xMin: from, xMax: to }, samples).map((p) => ({ x: roundTo(p.x, 6), y: roundTo(p.y, 6) }));
  }).filter((pc) => pc.length >= 2);
}

/** TOUS les antécédents de y dans `range` — sur tous les morceaux, affinés par dichotomie. */
export function antecedentsOf(f, y, range, samples = 400) {
  const out = [];
  for (const pc of curvePieces(f, range, samples)) {
    for (const x0 of antecedentsOnCurve(pc, y)) {
      // Affinage : la polyligne donne x à un échantillon près ; la fonction
      // permet de retrouver la traversée exacte entre deux échantillons.
      const step = (pc[1].x - pc[0].x) || 1e-6;
      let lo = x0 - step; let hi = x0 + step;
      const g = (x) => (inDomain(f.domain, x) ? f.fn(x) - y : NaN);
      if (Number.isFinite(g(lo)) && Number.isFinite(g(hi)) && g(lo) * g(hi) < 0) {
        for (let i = 0; i < 40; i += 1) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
        out.push(roundTo((lo + hi) / 2, 6));
      } else out.push(roundTo(x0, 6));
    }
  }
  return [...new Set(out.map((v) => roundTo(v, 4)))].sort((a, b) => a - b);
}

/** Tableau de valeurs : [{ x, y }] (y null hors domaine). */
export const tableOf = (f, xs) => xs.map((x) => ({ x, y: imageOf(f, x) }));

/* ── La boîte sans couvercle ─────────────────────────────────────────── */

export const SHEET = 20; // cm

/** V(x) = x·(side − 2x)² — le volume de la boîte, en cm³. */
export const boxVolume = (x, side = SHEET) => x * (side - 2 * x) ** 2;
export const boxBase = (x, side = SHEET) => side - 2 * x;
/** La boîte existe ⟺ 0 < x < side/2 (ni fond nul, ni hauteur nulle). */
export const boxDomain = (side = SHEET) => [interval(0, side / 2, { openA: true, openB: true })];
export const BOX = makeFunction('V', (x) => boxVolume(x), boxDomain(), { tex: 'V(x) = x(20 - 2x)^2', unit: 'cm³', xUnit: 'cm' });
export const boxExists = (x, side = SHEET) => inDomain(boxDomain(side), x);

/** Le x qui maximise V sur la grille de pas `step` (pour le message « la plus grande boîte »). */
export function bestBoxOnGrid(step = 0.5, side = SHEET) {
  let best = null;
  for (let x = step; x < side / 2; x = roundTo(x + step, 6)) {
    const v = boxVolume(x, side);
    if (!best || v > best.v) best = { x, v };
  }
  return best;
}

/* ── Les autres fonctions de la leçon (constantes littérales) ──────────── */

export const G = makeFunction('g', (x) => 3 * x * x - 5, R, { tex: 'g(x) = 3x^2 - 5' });
export const H_TABLE = { xs: [-2, -1, 0, 1, 2, 3], ys: [5, 2, 1, 2, 5, 10] }; // h(x) = x² + 1, donnée par un tableau seulement
export const F4 = makeFunction('f', (x) => x * x - 3, R, { tex: 'f(x) = x^2 - 3' });
export const F4_XS = [-2, -1, 0, 1, 2, 3];
export const PERIMETRE = makeFunction('P', (x) => 2 * x + 10, [interval(0, null, { openA: true })], { tex: 'P(x) = 2x + 10' });

/** M6 — la piscine : nageurs présents selon l'heure, ouverte [8 ; 12] ∪ [14 ; 20]. */
export const POOL_POINTS = [
  [[8, 0], [9, 20], [10, 45], [11, 60], [12, 40]],
  [[14, 30], [15, 55], [16, 80], [17, 70], [18, 50], [19, 25], [20, 0]],
];
const poolPiece = (pc) => (x) => imageAt(pc.map(([px, py]) => ({ x: px, y: py })), x);
export const POOL = makeFunction('n', (x) => {
  for (const pc of POOL_POINTS) { const y = poolPiece(pc)(x); if (y !== null) return y; }
  return NaN;
}, [interval(8, 12), interval(14, 20)], { xUnit: 'h', unit: 'nageurs' });
export const POOL_RANGE = { xMin: 0, xMax: 22, yMin: 0, yMax: 100 };
/** Tarif de la piscine : 3 € le matin, 5 € l'après-midi — une fonction constante par morceaux. */
export const TARIF = makeFunction('T', (x) => (x <= 12 ? 3 : 5), [interval(8, 12), interval(14, 20)], { unit: '€', xUnit: 'h' });

/** M7 — le forfait : 10 € jusqu'à 2 Go inclus, puis 4 € par Go, jusqu'à 10 Go. */
export const FORFAIT = makeFunction('f', (x) => (x <= 2 ? 10 : 10 + 4 * (x - 2)), [interval(0, 10)], { unit: '€', xUnit: 'Go' });
export const H7 = makeFunction('h', (x) => -x * x + 4, [interval(-3, 3)], { tex: 'h(x) = -x^2 + 4' });

/* ── Écritures ───────────────────────────────────────────────────────── */

export const coupleText = (x, y) => `(${formatDec(x)} ; ${formatDec(y)})`;
/** « V(3) = 588 » / « V(12) n’existe pas ». */
export function imageText(f, x) {
  const y = imageOf(f, x);
  return y === null ? `${f.name}(${formatDec(x)}) n’existe pas` : `${f.name}(${formatDec(x)}) = ${formatDec(y)}`;
}
