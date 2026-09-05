/**
 * Modèle mathématique de « Vecteurs » (2nde).
 *
 * ─── L'IDÉE QUE TOUT LE FICHIER SERT ───────────────────────────────────
 * Un vecteur est un DÉPLACEMENT : une direction, un sens, une longueur —
 * et rien d'autre. Deux nombres (ses coordonnées dans une base
 * orthonormée) le décrivent entièrement, si bien qu'enchaîner, inverser et
 * étirer des déplacements deviennent des additions et des multiplications,
 * et qu'un parallélogramme, un milieu ou un alignement deviennent des
 * calculs. `equal` dit tout : deux flèches sont le même vecteur dès que
 * leurs coordonnées coïncident, où qu'on les ait posées.
 *
 * ─── REPRÉSENTATION ────────────────────────────────────────────────────
 * Points ET vecteurs sont des `{ x, y }` en coordonnées d'ÉLÈVE (y vers le
 * HAUT), comme dans `common/utils/geometry2d.js` dont ce fichier réexporte
 * l'algèbre. La conversion vers le repère SVG est faite par CoordPlane et
 * nulle part ailleurs.
 *
 * ─── PÉRIMÈTRE (teachingScope) ─────────────────────────────────────────
 * Le déterminant et la caractérisation « det = 0 » de la colinéarité sont
 * la leçon suivante (« Colinéarité et alignement ») : ici, deux vecteurs
 * sont colinéaires quand l'un est un MULTIPLE de l'autre (`colinearFactor`),
 * ce que l'élève constate sur la figure. Le produit scalaire n'apparaît pas.
 */
import {
  vec, add, scale, norm, dist, midpoint, cross, dot,
} from '../../../../../common/utils/geometry2d';

export { vec, add, scale, norm, dist, midpoint, cross, dot };

/* ── Vecteurs ─────────────────────────────────────────────────────────── */

export const ZERO = Object.freeze({ x: 0, y: 0 });

export function sub(u, v) {
  return { x: u.x - v.x, y: u.y - v.y };
}

export function isZero(v, eps = 1e-9) {
  return Math.abs(v.x) < eps && Math.abs(v.y) < eps;
}

/**
 * Deux vecteurs sont ÉGAUX quand leurs coordonnées coïncident — peu importe
 * où on les a dessinés. C'est la définition, et tout l'enjeu de la leçon.
 */
export function equal(u, v, eps = 1e-9) {
  return Math.abs(u.x - v.x) < eps && Math.abs(u.y - v.y) < eps;
}

/** Le vecteur opposé : même direction, même longueur, sens contraire. */
export function opposite(v) {
  return { x: -v.x, y: -v.y };
}

/* ── Le cadre de la leçon ─────────────────────────────────────────────── */

/** Un seul cadre pour toute la leçon : 13 graduations, toutes étiquetées. */
export const RANGE = Object.freeze({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });

export function inRange(p, range = RANGE) {
  return p.x >= range.xMin - 1e-9 && p.x <= range.xMax + 1e-9
    && p.y >= range.yMin - 1e-9 && p.y <= range.yMax + 1e-9;
}

export function clampToRange(p, range = RANGE) {
  return {
    x: Math.max(range.xMin, Math.min(range.xMax, p.x)),
    y: Math.max(range.yMin, Math.min(range.yMax, p.y)),
  };
}

/* ── Direction, sens, longueur ────────────────────────────────────────── */

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 1e-9) { const t = x % y; x = y; y = t; }
  return x || 1;
}

/**
 * La direction, ramenée à une forme canonique. Deux vecteurs opposés
 * partagent la MÊME direction : c'est la subtilité à faire comprendre
 * (« direction » = la droite suivie, « sens » = de quel côté on la parcourt).
 */
export function directionKey(v) {
  if (isZero(v)) return 'nulle';
  const g = gcd(v.x * 2, v.y * 2); // ×2 : les demi-graduations restent exactes
  let dx = (v.x * 2) / g;
  let dy = (v.y * 2) / g;
  if (dx < 0 || (dx === 0 && dy < 0)) { dx = -dx; dy = -dy; }
  return `${dx}:${dy}`;
}

export function sameDirection(u, v) {
  return directionKey(u) === directionKey(v);
}

export function sameSense(u, v) {
  return sameDirection(u, v) && dot(u, v) > 0;
}

export function sameLength(u, v, eps = 1e-9) {
  return Math.abs(norm(u) - norm(v)) < eps;
}

export function attributesOf(u, v) {
  return {
    direction: sameDirection(u, v),
    sens: sameSense(u, v),
    longueur: sameLength(u, v),
    egaux: equal(u, v),
  };
}

/** Pourquoi ces deux déplacements ne sont-ils pas le même ? Jamais un « faux » sec. */
export function diagnose(model, v) {
  if (equal(model, v)) return null;
  if (isZero(v)) return 'nul';
  const a = attributesOf(model, v);
  if (!a.direction) return 'direction';
  if (!a.sens) return 'sens';
  if (!a.longueur) return 'longueur';
  return 'autre';
}

export const DIAGNOSIS_TEXT = {
  nul: 'Le robot n’a pas encore bougé.',
  direction: 'La direction n’est pas la même : les deux trajets ne suivent pas des droites parallèles.',
  sens: 'Même direction et même longueur, mais le sens est inversé : ton trajet part dans l’autre sens.',
  longueur: 'Même direction et même sens, mais la longueur diffère.',
  autre: 'Les deux déplacements ne coïncident pas.',
};

/* ── Colinéarité (sans déterminant) ───────────────────────────────────── */

/**
 * v est un multiple de u ? Renvoie k tel que v = k·u, ou null.
 * Convention : le vecteur nul est colinéaire à tout vecteur (k = 0 si u ≠ 0).
 * Si u est nul et v non nul, aucun k n'existe : null.
 */
export function colinearFactor(u, v, eps = 1e-9) {
  if (isZero(u)) return isZero(v) ? 0 : null;
  if (Math.abs(cross(u, v)) > eps) return null;
  const k = Math.abs(u.x) > Math.abs(u.y) ? v.x / u.x : v.y / u.y;
  return Math.round(k * 1e6) / 1e6;
}

export function areColinear(u, v, eps = 1e-9) {
  return isZero(u) || isZero(v) || Math.abs(cross(u, v)) < eps;
}

/* ── Parallélogramme, milieu ──────────────────────────────────────────── */

/**
 * ABCD (sommets dans l'ordre du contour) est un parallélogramme ⟺ AB = DC.
 * L'ordre des sommets est LA source d'erreur classique : la fonction prend
 * les quatre points dans l'ordre du contour, et c'est tout.
 */
export function isParallelogram(A, B, C, D, eps = 1e-9) {
  return equal(vec(A, B), vec(D, C), eps) && !isZero(vec(A, B), eps) && !isZero(vec(B, C), eps);
}

/** Le quatrième sommet D tel que ABCD soit un parallélogramme (AB = DC). */
export function fourthVertex(A, B, C) {
  return { x: A.x + C.x - B.x, y: A.y + C.y - B.y };
}

/* ── Norme ────────────────────────────────────────────────────────────── */

/** √n sous forme exacte simplifiée : { coef, radicand } avec √n = coef·√radicand. */
export function simplifySqrt(n) {
  const m = Math.round(n);
  if (m !== n || m < 0) return { coef: 1, radicand: n };
  let coef = 1;
  let rad = m;
  for (let f = 2; f * f <= rad; f += 1) {
    while (rad % (f * f) === 0) { rad /= f * f; coef *= f; }
  }
  if (rad === 1) return { coef, radicand: 1 };
  return { coef, radicand: rad };
}

/**
 * La norme, écrite comme on l'écrit au lycée : « 5 », « √13 ≈ 3,61 »,
 * « 2√5 ≈ 4,47 ». `squares` est le calcul intermédiaire à afficher.
 */
export function normText(v) {
  const n2 = v.x * v.x + v.y * v.y;
  const value = Math.sqrt(n2);
  const squares = `${formatNum(v.x)}² + ${formatNum(v.y)}² = ${formatNum(n2)}`;
  if (n2 === 0) return { exact: '0', approx: null, value: 0, squares };
  if (Number.isInteger(n2)) {
    const { coef, radicand } = simplifySqrt(n2);
    if (radicand === 1) return { exact: formatNum(coef), approx: null, value, squares };
    const exact = `${coef === 1 ? '' : coef}√${radicand}`;
    return { exact, approx: formatNum(value, 2), value, squares };
  }
  return { exact: `√${formatNum(n2)}`, approx: formatNum(value, 2), value, squares };
}

/* ── Écriture ─────────────────────────────────────────────────────────── */

/** Un nombre à la française : virgule, moins typographique, jamais « −0 ». */
export function formatNum(n, maxDecimals = 2) {
  if (!Number.isFinite(n)) return '?';
  let r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals;
  if (Object.is(r, -0) || r === 0) r = 0;
  const s = String(r).replace('.', ',');
  return s.replace('-', '−');
}

/** Les coordonnées d'un vecteur ou d'un point : (3 ; −2). */
export function formatVec(v) {
  return `(${formatNum(v.x)} ; ${formatNum(v.y)})`;
}

/** Le déplacement en toutes lettres : la « recette » donnée au robot. */
export function describeMove(v) {
  if (isZero(v)) return 'aucun déplacement';
  const parts = [];
  if (Math.abs(v.x) > 1e-9) parts.push(`${formatNum(Math.abs(v.x))} vers la ${v.x > 0 ? 'droite' : 'gauche'}`);
  if (Math.abs(v.y) > 1e-9) parts.push(`${formatNum(Math.abs(v.y))} vers le ${v.y > 0 ? 'haut' : 'bas'}`);
  return parts.join(' et ');
}

/** « 3 » ou « −2 » avec le signe toujours écrit : +3, −2, 0. */
export function signed(n) {
  if (Math.abs(n) < 1e-9) return '0';
  return n > 0 ? `+${formatNum(n)}` : formatNum(n);
}

/* ── Les scènes de la leçon (constantes littérales, jamais partagées à l'exécution) ── */

export const SCENES = Object.freeze({
  /** Le dépôt : le robot, la station, un second robot ailleurs. */
  depot: {
    start: { x: -4, y: -2 },
    station: { x: -1, y: 0 },     // recette (3 ; 2)
    start2: { x: 1, y: 2 },        // le second robot part d'ailleurs
    chain: [{ x: 2, y: 1 }, { x: -3, y: 2 }], // deux ordres à enchaîner
  },
  /** Le vecteur de référence des modules 2 et 3. */
  u: { x: 3, y: 2 },
  /** Deux points pour lire puis calculer les coordonnées. */
  AB: { A: { x: -4, y: -1 }, B: { x: -1, y: 1 } },
  /** Les deux vecteurs de la somme. */
  somme: { u: { x: 3, y: 1 }, v: { x: -1, y: 3 }, origin: { x: -3, y: -3 } },
  /** Relation de Chasles : trois points. */
  chasles: { A: { x: -4, y: -2 }, B: { x: 0, y: 3 }, C: { x: 4, y: -1 } },
  /** Le vecteur à étirer. */
  etirer: { u: { x: 2, y: 1 }, origin: { x: 0, y: 1 } },
  /** Norme : 3-4-5, puis un cas non entier. */
  norme: { u: { x: 3, y: 4 }, origin: { x: -4, y: -3 } },
  /** Milieu. */
  milieu: { A: { x: -5, y: -2 }, B: { x: 3, y: 4 } },
  /** Problèmes : parallélogramme, déplacement manquant, alignement. */
  problemes: {
    para: { A: { x: -4, y: -2 }, B: { x: -1, y: 0 }, C: { x: 2, y: -3 } },   // D = (−1 ; −5)
    manquant: { depart: { x: -3, y: 1 }, u: { x: 4, y: 3 }, arrivee: { x: 3, y: 1 } }, // v = (2 ; −3)
    alignes: { A: { x: -4, y: -3 }, B: { x: -1, y: -1 }, C: { x: 5, y: 3 } },  // AB (3;2), AC (9;6) → k = 3
  },
});

/**
 * Lecture d'une réponse numérique tapée : virgule ou point, moins
 * typographique ou tiret, espaces. Renvoie NaN si ce n'est pas un nombre.
 */
export function parseDecSigned(str) {
  const s = String(str ?? '').trim().replace(/\s+/g, '').replace('−', '-').replace(',', '.');
  if (s === '' || !/^[-+]?\d*(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

/** « 3·i + 2·j », « 1·i − 1·j », « 0·i + 2·j » : la combinaison dans la base. */
export function comboText(v, i = 'i', j = 'j') {
  const sgn = v.y < 0 ? '−' : '+';
  return `${formatNum(v.x)}·${i} ${sgn} ${formatNum(Math.abs(v.y))}·${j}`;
}
