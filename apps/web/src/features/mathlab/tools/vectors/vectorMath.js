/**
 * LA MATHÉMATIQUE des vecteurs — logique PURE : pas de React, pas de DOM, pas de
 * pixels. Tout ce que le laboratoire affiche se calcule ICI et nulle part
 * ailleurs (règle §38 du cahier des charges, et celle de tout l'atelier :
 * rational.js / equation.js pour l'algèbre, geometryCalculations.js pour les
 * solides).
 *
 * Le vocabulaire est celui de l'école française : vecteur, coordonnées
 * d'un vecteur (les « composantes » du code), milieu, translation.
 *
 * Un vecteur est ici un COUPLE de coordonnées `{x, y}` — un déplacement, pas un
 * segment : c'est exactement la définition par la translation qui envoie A
 * sur B, et c'est ce qui rend le vecteur libre de §6 possible sans code en
 * plus. Une NOTATION (⃗AB) est une manière de désigner ce couple ; elle vit
 * dans l'état du document (vectorState.js), pas ici.
 *
 * Aucune fonction n'arrondit : l'arrondi est un fait d'AFFICHAGE, et il est
 * fait au dernier moment par grapherFormat.formatValue (§37).
 */

/** En deçà, deux nombres flottants issus d'un glissement sont « le même ». */
const EPSILON = 1e-9;

export const ZERO = Object.freeze({ x: 0, y: 0 });

const finite = Number.isFinite;

/** Un couple sûr, ou null — la frontière entre le JSON relu et le calcul. */
export function makeVector(x, y) {
  return finite(x) && finite(y) ? { x, y } : null;
}

export function isVector(v) {
  return Boolean(v) && finite(v.x) && finite(v.y);
}

// ── Les composantes (§8) ──────────────────────────────────────────────────

/**
 * Les composantes de ⃗AB : `B − A`. C'est LA définition — tout le reste en
 * découle, y compris la longueur et le milieu.
 *
 *     A(2,3)  B(6,5)  →  ⃗AB = (4, 2)
 */
export function fromPoints(a, b) {
  if (!isVector(a) || !isVector(b)) return null;

  return { x: b.x - a.x, y: b.y - a.y };
}

/** Le point d'arrivée d'un vecteur posé en `origin` : `origin + v` (§16, la translation). */
export function translatePoint(point, v) {
  if (!isVector(point) || !isVector(v)) return null;

  return { x: point.x + v.x, y: point.y + v.y };
}

// ── Les opérations (§11, §13, §14) ────────────────────────────────────────

export function add(u, v) {
  if (!isVector(u) || !isVector(v)) return null;

  return { x: u.x + v.x, y: u.y + v.y };
}

export function subtract(u, v) {
  if (!isVector(u) || !isVector(v)) return null;

  return { x: u.x - v.x, y: u.y - v.y };
}

/** L'opposé : `−v`, le vecteur du retour. Ce qui fait de `u − v` un `u + (−v)` (§13). */
export function negate(v) {
  return isVector(v) ? { x: -v.x, y: -v.y } : null;
}

/** `k·u` (§14). k = 0 rend le vecteur nul : ce n'est pas une erreur, c'est le sens. */
export function scale(v, k) {
  if (!isVector(v) || !finite(k)) return null;

  return { x: v.x * k, y: v.y * k };
}

// ── Les mesures (§9, §10, §19) ────────────────────────────────────────────

/** ‖u‖ = √(x² + y²). `Math.hypot` évite le dépassement de x² pour de grandes valeurs. */
export function norm(v) {
  return isVector(v) ? Math.hypot(v.x, v.y) : NaN;
}

/** La distance AB = ‖⃗AB‖ (§19). */
export function distance(a, b) {
  return norm(fromPoints(a, b));
}

/**
 * La direction en DEGRÉS, mesurée depuis l'axe des abscisses, dans [0, 360[
 * (§10 : « appropriate angle normalization »). Le vecteur nul n'a pas de
 * direction — NaN, et l'interface écrira « — », jamais 0°.
 */
export function direction(v) {
  if (!isVector(v) || isZero(v)) return NaN;
  const degrees = (Math.atan2(v.y, v.x) * 180) / Math.PI;

  return (degrees + 360) % 360;
}

export function isZero(v, epsilon = EPSILON) {
  return isVector(v) && Math.abs(v.x) <= epsilon && Math.abs(v.y) <= epsilon;
}

export function sameVector(u, v, epsilon = EPSILON) {
  if (!isVector(u) || !isVector(v)) return false;

  return Math.abs(u.x - v.x) <= epsilon && Math.abs(u.y - v.y) <= epsilon;
}

// ── Le milieu (§18) ───────────────────────────────────────────────────────

/** M, milieu de [AB] : ((xA+xB)/2, (yA+yB)/2). */
export function midpoint(a, b) {
  if (!isVector(a) || !isVector(b)) return null;

  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// ── La pente (§20) ────────────────────────────────────────────────────────

/**
 * Le coefficient directeur de (AB).
 *
 * Une droite VERTICALE n'a pas de pente : la fonction rend
 * `{ vertical: true, value: null }` et JAMAIS un nombre — c'est la demande
 * explicite du §20, et l'erreur que fait tout outil qui divise sans regarder.
 * Deux points confondus ne définissent aucune droite : `undefined: true`.
 *
 * @returns {{value: number|null, vertical: boolean, undefined: boolean}}
 */
export function slope(a, b) {
  if (!isVector(a) || !isVector(b)) return { value: null, vertical: false, undefined: true };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) <= EPSILON && Math.abs(dy) <= EPSILON) return { value: null, vertical: false, undefined: true };
  if (Math.abs(dx) <= EPSILON) return { value: null, vertical: true, undefined: false };

  return { value: dy / dx, vertical: false, undefined: false };
}

// ── Le produit scalaire (§23) ─────────────────────────────────────────────

/**
 * u · v. HORS PROGRAMME du collège (le produit scalaire est du lycée) : le
 * laboratoire le calcule mais ne le met jamais en avant — §23 le dit, et
 * l'interface le range dans une analyse facultative.
 */
export function dot(u, v) {
  if (!isVector(u) || !isVector(v)) return NaN;

  return u.x * v.x + u.y * v.y;
}

/**
 * Le DÉTERMINANT (produit vectoriel scalaire) : xu·yv − yu·xv. C'est LUI qui
 * décide du parallélisme et de l'alignement — pas une comparaison de pentes,
 * qui exploserait sur une droite verticale.
 */
function cross(u, v) {
  if (!isVector(u) || !isVector(v)) return NaN;

  return u.x * v.y - u.y * v.x;
}

// ── Les relations (§21, §22, §24) ─────────────────────────────────────────

/**
 * La tolérance d'une relation, RELATIVE à la taille des vecteurs comparés.
 *
 * Un test absolu (`|det| < 1e-9`) ment deux fois : il déclare non parallèles
 * des vecteurs énormes que le flottant a écartés d'un cheveu, et parallèles des
 * vecteurs minuscules qui ne le sont pas. On compare donc le déterminant au
 * produit des normes — c'est |sin θ| que l'on borne, une vraie mesure
 * d'angle, et l'élève qui glisse un point voit la relation apparaître
 * exactement quand elle est vraie à l'œil.
 */
const RELATIVE_TOLERANCE = 1e-9;

function relativeScale(u, v) {
  const product = norm(u) * norm(v);

  return product > 0 ? product : 1;
}

/**
 * u ∥ v (§21) : leur déterminant est nul. Le vecteur nul est colinéaire à tout
 * — vrai mathématiquement, mais inutile à montrer : `strict` l'exclut.
 */
export function areParallel(u, v, { strict = true, tolerance = RELATIVE_TOLERANCE } = {}) {
  if (!isVector(u) || !isVector(v)) return false;
  if (strict && (isZero(u) || isZero(v))) return false;

  return Math.abs(cross(u, v)) <= tolerance * relativeScale(u, v);
}

/**
 * u ⟂ v (§24) : leur produit scalaire est nul. Même prudence relative.
 */
export function arePerpendicular(u, v, { tolerance = RELATIVE_TOLERANCE } = {}) {
  if (!isVector(u) || !isVector(v) || isZero(u) || isZero(v)) return false;

  return Math.abs(dot(u, v)) <= tolerance * relativeScale(u, v);
}

/**
 * Le coefficient k tel que `v = k·u` — le « v = ½ u » que §21 demande de
 * MONTRER. Null si les vecteurs ne sont pas colinéaires, ou si u est nul (aucun
 * k ne fabrique un vecteur non nul à partir de rien).
 */
export function collinearFactor(u, v) {
  if (!areParallel(u, v, { strict: false }) || isZero(u)) return null;
  // On divise par la composante la PLUS GRANDE : diviser par la petite
  // amplifierait l'erreur du flottant (u = (1e-8, 5) est un cas réel après
  // un glissement).
  return Math.abs(u.x) >= Math.abs(u.y) ? v.x / u.x : v.y / u.y;
}

/**
 * A, B, C alignés (§22) : ⃗AB et ⃗AC sont colinéaires. Deux points confondus
 * rendent l'alignement vrai mais sans intérêt — `degenerate` le dit, pour
 * que l'interface ne proclame pas un théorème sur trois points superposés.
 *
 * @returns {{collinear: boolean, degenerate: boolean}}
 */
export function areCollinear(a, b, c) {
  const ab = fromPoints(a, b);
  const ac = fromPoints(a, c);
  if (!ab || !ac) return { collinear: false, degenerate: true };
  // B = C compte aussi : ⃗AB = ⃗AC « colinéaires » ne dit rien de trois points.
  const bc = fromPoints(b, c);
  if (isZero(ab) || isZero(ac) || (bc && isZero(bc))) return { collinear: true, degenerate: true };

  return { collinear: areParallel(ab, ac, { strict: false }), degenerate: false };
}

// ── Les formes exactes (§9, §37 : « use exact values … round only for display ») ──

/**
 * ‖u‖ sous forme EXACTE quand elle en a une lisible : √20 s'écrit 2√5, et
 * ‖(3,4)‖ s'écrit 5 — pas « 5,00 ». C'est ce qui distingue un laboratoire de
 * mathématiques d'une calculatrice : l'élève de §25 doit pouvoir lire « √5 ».
 *
 * Ne s'applique qu'aux composantes ENTIÈRES — hors de là, seule la valeur
 * décimale a un sens, et la fonction rend `{ exact: false }`.
 *
 * @returns {{exact: boolean, integer: number|null, radicand: number|null, coefficient: number|null, value: number}}
 */
export function exactNorm(v) {
  const value = norm(v);
  if (!isVector(v) || !Number.isInteger(v.x) || !Number.isInteger(v.y)) {
    return { exact: false, integer: null, radicand: null, coefficient: null, value };
  }
  const squared = v.x * v.x + v.y * v.y;
  const root = Math.round(Math.sqrt(squared));
  if (root * root === squared) {
    return { exact: true, integer: root, radicand: null, coefficient: null, value };
  }
  // squared = coefficient² · radicand, avec radicand sans facteur carré.
  let coefficient = 1;
  let radicand = squared;
  for (let factor = 2; factor * factor <= radicand; factor += 1) {
    const square = factor * factor;
    while (radicand % square === 0) {
      radicand /= square;
      coefficient *= factor;
    }
  }

  return { exact: true, integer: null, radicand, coefficient, value };
}
