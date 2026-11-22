/**
 * L'AFFICHAGE du مختبر المثلثات — la frontière entre le calcul exact et ce
 * que l'élève lit. Tout arrondi de l'instrument passe ici, et nulle part
 * ailleurs (la règle de vectorFormat.js, tenue une seconde fois).
 *
 * Le format des nombres est celui de tout le مختبر —
 * `grapherFormat.formatValue` : virgule décimale, vrai signe moins (−,
 * U+2212), chiffres LATINS, comme les manuels algériens (ARABIC_RTL_CONTRACT).
 *
 * ── Le sens de lecture (§36) ─────────────────────────────────────────────
 * `sin(θ) = √3/2` se lit de GAUCHE à DROITE même dans une page arabe. Le
 * bidi ne le ferait pas tout seul : une parenthèse est un caractère miroir,
 * une barre de fraction et une virgule sont neutres, et `(0,5 ; √3/2)`
 * deviendrait `(√3/2 ; 0,5)` à l'affichage — la MÊME chaîne, lue à l'envers.
 * Toutes les fonctions d'ici rendent donc des chaînes que l'interface pose
 * dans un conteneur `dir="ltr"`, et trigFormat.test.js le vérifie.
 */

import { formatValue } from '../functionGrapher/grapherFormat.js';
import { exactValue, radianFraction, numericOf } from './exactValues.js';

export { formatValue };

/** Le mot que l'interface traduit quand un rapport n'existe pas (§11). */
export const UNDEFINED_MARK = 'غير معرّف';

/**
 * Une forme exacte en TEXTE : `√3/2`, `1/2`, `−1`, `0`, `√3`.
 *
 * On n'écrit jamais `1√3/1` : le coefficient 1 et le dénominateur 1
 * disparaissent, comme sous la plume. Un `0` n'a pas de signe.
 */
export function exactToText(exact) {
  if (!exact) return null;
  if (exact.undefined) return UNDEFINED_MARK;
  const { sign, numerator, radicand, denominator } = exact;
  if (numerator === 0) return '0';

  const sgn = sign < 0 ? '−' : '';
  const root = radicand === 1 ? '' : `√${radicand}`;
  const head = numerator === 1 && root ? root : `${numerator}${root}`;

  return denominator === 1 ? `${sgn}${head}` : `${sgn}${head}/${denominator}`;
}

/** La même forme en LaTeX, pour KaTeX : `\frac{\sqrt{3}}{2}`. */
export function exactToLatex(exact) {
  if (!exact) return null;
  if (exact.undefined) return null;
  const { sign, numerator, radicand, denominator } = exact;
  if (numerator === 0) return '0';

  const sgn = sign < 0 ? '-' : '';
  const root = radicand === 1 ? '' : `\\sqrt{${radicand}}`;
  const head = numerator === 1 && root ? root : `${numerator}${root}`;

  return denominator === 1 ? `${sgn}${head}` : `${sgn}\\frac{${head}}{${denominator}}`;
}

/**
 * La lecture d'un rapport à un angle, dans le mode demandé (§19).
 *
 * En mode `exact`, un angle remarquable rend SA forme et la décimale à côté
 * — « √3/2 ≈ 0,87 » apprend plus que l'une des deux seule, exactement comme
 * « √5 ≈ 2,24 » pour les أشعة. Un angle quelconque n'a pas de forme exacte :
 * il rend la décimale, sans faire semblant.
 *
 * @returns {{text: string, approx: string|null, isExact: boolean, isUndefined: boolean, latex: string|null}}
 */
export function formatRatio(degrees, ratio, numeric, mode = 'exact', decimals = 4) {
  if (numeric === null) {
    return { text: UNDEFINED_MARK, approx: null, isExact: false, isUndefined: true, latex: null };
  }

  if (mode === 'exact') {
    const exact = exactValue(degrees, ratio);
    if (exact?.undefined) {
      return { text: UNDEFINED_MARK, approx: null, isExact: false, isUndefined: true, latex: null };
    }
    if (exact) {
      const text = exactToText(exact);
      const value = numericOf(exact);
      // Une forme entière (0, 1, −1) n'a pas besoin de son approximation.
      const approx = exact.radicand === 1 && exact.denominator === 1
        ? null
        : formatValue(value, 2);

      return { text, approx, isExact: true, isUndefined: false, latex: exactToLatex(exact) };
    }
  }

  return {
    text: formatValue(numeric, decimals),
    approx: null,
    isExact: false,
    isUndefined: false,
    latex: null,
  };
}

/** Un angle en degrés : `45°`, `−90°`, `450°`. */
export function formatDegrees(degrees, decimals = 1) {
  if (!Number.isFinite(degrees)) return '—';

  return `${formatValue(degrees, decimals)}°`;
}

/**
 * Un angle en RADIANS, sous sa plus belle forme (§4) : `π/4`, `2π/3`, `π`,
 * `−π/2`, ou la décimale quand la fraction n'est pas du manuel.
 *
 * `rad` n'est pas ajouté : sur un cercle, la mesure sans unité EST le
 * radian, et le manuel l'écrit ainsi.
 */
export function formatRadians(degrees, decimals = 3) {
  if (!Number.isFinite(degrees)) return '—';
  const fraction = radianFraction(degrees);
  if (!fraction) return formatValue((degrees * Math.PI) / 180, decimals);
  const { numerator, denominator } = fraction;
  if (numerator === 0) return '0';

  const sign = numerator < 0 ? '−' : '';
  const absolute = Math.abs(numerator);
  const head = absolute === 1 ? 'π' : `${absolute}π`;

  return denominator === 1 ? `${sign}${head}` : `${sign}${head}/${denominator}`;
}

/** Le même en LaTeX : `\frac{\pi}{4}`. */
export function radiansToLatex(degrees) {
  const fraction = radianFraction(degrees);
  if (!fraction) return null;
  const { numerator, denominator } = fraction;
  if (numerator === 0) return '0';
  const sign = numerator < 0 ? '-' : '';
  const absolute = Math.abs(numerator);
  const head = absolute === 1 ? '\\pi' : `${absolute}\\pi`;

  return denominator === 1 ? `${sign}${head}` : `${sign}\\frac{${head}}{${denominator}}`;
}

/**
 * Le couple `(cos θ ; sin θ)` — l'écriture du manuel pour un point.
 *
 * En mode exact, les deux coordonnées portent leur forme : `(1/2 ; √3/2)`
 * est ce que §31 demande de montrer dans l'inspecteur, pas
 * `(0,5 ; 0,8660254)`.
 */
export function formatPoint(degrees, point, mode = 'exact', decimals = 3) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return '—';
  const x = formatRatio(degrees, 'cos', point.x, mode, decimals);
  const y = formatRatio(degrees, 'sin', point.y, mode, decimals);

  return `(${x.text} ; ${y.text})`;
}

/** Un signe, pour la table des quadrants (§20) : `+`, `−`, `0`, ou le mot. */
export function formatSign(sign) {
  if (sign === null) return UNDEFINED_MARK;
  if (sign === 0) return '0';

  return sign > 0 ? '+' : '−';
}

/** Une longueur d'arc ou un côté : deux décimales, jamais de bruit flottant. */
export function formatLength(value, decimals = 2) {
  return formatValue(value, decimals);
}

/**
 * Le nom d'un quadrant ou d'un axe — la clé i18n, pas le mot : la traduction
 * appartient au composant, ce module ne décide que de ce qu'il FAUT dire.
 */
export function quadrantKey({ quadrant, axis }) {
  if (quadrant >= 1) return `tools.trigonometry.quadrants.q${quadrant}`;
  if (axis) return `tools.trigonometry.axes.${axis === 'x+' ? 'xPositive' : axis === 'x-' ? 'xNegative' : axis === 'y+' ? 'yPositive' : 'yNegative'}`;

  return 'tools.trigonometry.quadrants.none';
}
