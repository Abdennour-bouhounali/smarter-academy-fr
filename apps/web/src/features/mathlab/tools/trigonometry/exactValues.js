/**
 * LES VALEURS EXACTES (§19) — ce qui sépare un instrument d'une calculatrice.
 *
 * Une calculatrice répond `0.7071067811865476`. Le manuel écrit `√2/2`. Ce
 * ne sont pas deux écritures du même savoir : la première est un nombre, la
 * seconde est une RAISON — on y lit la diagonale du carré. §19 est
 * catégorique : « Do not display approximate floating-point noise when an
 * exact representation is available. »
 *
 * ── Pourquoi une table, et non un algorithme ─────────────────────────────
 * On pourrait tenter de reconnaître √3/2 dans 0,866… par recherche de
 * relation entière. Ce serait fragile (0,866 est aussi près d'autres formes)
 * et surtout inutile : les angles remarquables du programme sont en nombre
 * FINI et connus. La table dit la vérité pour eux, et `null` pour tous les
 * autres — un angle quelconque n'a pas de forme exacte simple, et prétendre
 * le contraire serait mentir aussi.
 *
 * ── La tangente indéfinie ────────────────────────────────────────────────
 * À 90° et 270°, `tan` n'est pas une valeur exacte « compliquée » : elle
 * n'existe pas. La table porte `undefined: true`, jamais un symbole ∞ (§11).
 */

import { normalizeDegrees, EPSILON } from './trigMath.js';

/**
 * Une valeur exacte est décrite, pas écrite : `{sign, numerator, radicand,
 * denominator}` représente `sign · numerator·√radicand / denominator`.
 * L'écriture — texte ou LaTeX — est le travail de trigFormat.js ; ici on ne
 * garde que la STRUCTURE, ce qui permet de la rendre en `√3/2` comme en
 * `\frac{\sqrt{3}}{2}` sans deux tables.
 */
const value = (sign, numerator, radicand, denominator) => Object.freeze({
  sign, numerator, radicand, denominator,
});

/** `0`, `1`, `−1`, `1/2` : les cas sans radical (radicand = 1). */
const rational = (sign, numerator, denominator) => value(sign, numerator, 1, denominator);

const ZERO = rational(1, 0, 1);
const ONE = rational(1, 1, 1);
const MINUS_ONE = rational(-1, 1, 1);
const UNDEFINED = Object.freeze({ undefined: true });

/**
 * Les dix-sept angles remarquables (§6), en degrés, avec leur écriture en
 * radians et les trois rapports sous forme exacte.
 *
 * L'ordre est celui du tour : c'est aussi celui des puces de l'interface et
 * des lignes de la table (§18).
 */
export const SPECIAL_ANGLES = Object.freeze([
  { degrees: 0, radians: { numerator: 0, denominator: 1 }, sin: ZERO, cos: ONE, tan: ZERO },
  { degrees: 30, radians: { numerator: 1, denominator: 6 }, sin: rational(1, 1, 2), cos: value(1, 1, 3, 2), tan: value(1, 1, 3, 3) },
  { degrees: 45, radians: { numerator: 1, denominator: 4 }, sin: value(1, 1, 2, 2), cos: value(1, 1, 2, 2), tan: ONE },
  { degrees: 60, radians: { numerator: 1, denominator: 3 }, sin: value(1, 1, 3, 2), cos: rational(1, 1, 2), tan: value(1, 1, 3, 1) },
  { degrees: 90, radians: { numerator: 1, denominator: 2 }, sin: ONE, cos: ZERO, tan: UNDEFINED },
  { degrees: 120, radians: { numerator: 2, denominator: 3 }, sin: value(1, 1, 3, 2), cos: rational(-1, 1, 2), tan: value(-1, 1, 3, 1) },
  { degrees: 135, radians: { numerator: 3, denominator: 4 }, sin: value(1, 1, 2, 2), cos: value(-1, 1, 2, 2), tan: MINUS_ONE },
  { degrees: 150, radians: { numerator: 5, denominator: 6 }, sin: rational(1, 1, 2), cos: value(-1, 1, 3, 2), tan: value(-1, 1, 3, 3) },
  { degrees: 180, radians: { numerator: 1, denominator: 1 }, sin: ZERO, cos: MINUS_ONE, tan: ZERO },
  { degrees: 210, radians: { numerator: 7, denominator: 6 }, sin: rational(-1, 1, 2), cos: value(-1, 1, 3, 2), tan: value(1, 1, 3, 3) },
  { degrees: 225, radians: { numerator: 5, denominator: 4 }, sin: value(-1, 1, 2, 2), cos: value(-1, 1, 2, 2), tan: ONE },
  { degrees: 240, radians: { numerator: 4, denominator: 3 }, sin: value(-1, 1, 3, 2), cos: rational(-1, 1, 2), tan: value(1, 1, 3, 1) },
  { degrees: 270, radians: { numerator: 3, denominator: 2 }, sin: MINUS_ONE, cos: ZERO, tan: UNDEFINED },
  { degrees: 300, radians: { numerator: 5, denominator: 3 }, sin: value(-1, 1, 3, 2), cos: rational(1, 1, 2), tan: value(-1, 1, 3, 1) },
  { degrees: 315, radians: { numerator: 7, denominator: 4 }, sin: value(-1, 1, 2, 2), cos: value(1, 1, 2, 2), tan: MINUS_ONE },
  { degrees: 330, radians: { numerator: 11, denominator: 6 }, sin: rational(-1, 1, 2), cos: value(1, 1, 3, 2), tan: value(-1, 1, 3, 3) },
]);

/**
 * Les angles AIGUS du programme de 4AM : 30°, 45°, 60° — ceux dont le manuel
 * demande les rapports par cœur, et les seuls que l'instrument met en avant
 * dans le mode triangle. Le reste du tour appartient au cercle (lycée).
 */
export const CURRICULUM_ANGLES = Object.freeze([30, 45, 60]);

/** La liste des degrés remarquables, 360 compris — l'élève doit pouvoir y aller (§6). */
export const SPECIAL_DEGREES = Object.freeze([...SPECIAL_ANGLES.map((a) => a.degrees), 360]);

/**
 * L'entrée exacte d'un angle, s'il en a une.
 *
 * L'angle est NORMALISÉ d'abord : 405° est remarquable parce que 45° l'est,
 * et c'est précisément ce que §14 veut faire découvrir. −30° l'est aussi,
 * par 330°.
 */
export function exactAt(degrees) {
  if (!Number.isFinite(degrees)) return null;
  const theta = normalizeDegrees(degrees);

  return SPECIAL_ANGLES.find((entry) => Math.abs(entry.degrees - theta) < 1e-6) ?? null;
}

/** Cet angle a-t-il une écriture exacte ? (§7 : ce qui déclenche le mode découverte.) */
export function isSpecialAngle(degrees) {
  return exactAt(degrees) !== null;
}

/**
 * La valeur exacte d'un rapport, ou `null` si l'angle n'est pas remarquable.
 *
 * @returns {{sign, numerator, radicand, denominator} | {undefined: true} | null}
 */
export function exactValue(degrees, ratio) {
  const entry = exactAt(degrees);
  if (!entry) return null;

  return entry[ratio] ?? null;
}

/**
 * La valeur NUMÉRIQUE d'une forme exacte — de quoi vérifier que la table ne
 * ment pas. `exactValues.test.js` s'en sert pour comparer chaque entrée à
 * `Math.sin` : une table écrite à la main doit être prouvée, pas crue.
 */
export function numericOf(exact) {
  if (!exact || exact.undefined) return null;
  const { sign, numerator, radicand, denominator } = exact;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;

  return (sign * numerator * Math.sqrt(radicand)) / denominator;
}

/**
 * L'angle remarquable le plus proche, à `tolerance` degrés — ce qui permet à
 * un GLISSEMENT de s'accrocher aux angles du manuel (§6) sans jamais empêcher
 * d'atteindre 37°. L'aimantation est une aide, pas une contrainte : au-delà
 * de la tolérance, la fonction rend `null` et l'angle reste celui du doigt.
 */
export function snapToSpecial(degrees, tolerance = 3) {
  if (!Number.isFinite(degrees)) return null;
  const theta = normalizeDegrees(degrees);
  let best = null;
  let bestGap = Infinity;

  for (const entry of SPECIAL_ANGLES) {
    // La distance ANGULAIRE : 359° est à 1° de 0°, pas à 359°.
    const raw = Math.abs(entry.degrees - theta);
    const gap = Math.min(raw, 360 - raw);
    if (gap < bestGap) {
      bestGap = gap;
      best = entry.degrees;
    }
  }

  if (bestGap > tolerance + EPSILON) return null;

  // On rend l'angle dans le TOUR de l'élève : à 725°, on s'accroche à 720°.
  const turns = Math.round((degrees - best) / 360);

  return best + turns * 360;
}

/**
 * L'écriture d'un angle en radians sous forme `kπ/n` (§4).
 *
 * Toujours définie — tout angle a une mesure en radians — mais la forme est
 * BELLE seulement pour les dénominateurs du manuel. On réduit la fraction
 * pour écrire `π/2` et non `2π/4`, et `2π` plutôt que `4π/2`.
 *
 * @returns {{numerator: number, denominator: number} | null}
 */
export function radianFraction(degrees, maxDenominator = 12) {
  if (!Number.isFinite(degrees)) return null;
  // θ° = (θ/180)·π : la fraction cherchée est θ/180, réduite.
  const numerator = degrees;
  const denominator = 180;
  if (!Number.isInteger(numerator)) return null;
  const divisor = gcd(Math.abs(numerator), denominator);
  const reduced = { numerator: numerator / divisor, denominator: denominator / divisor };

  return reduced.denominator <= maxDenominator ? reduced : null;
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x || 1;
}
