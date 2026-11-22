/**
 * Le SEUL endroit où un nombre du labo d’analyse est arrondi pour l'écran.
 *
 * Le reste du laboratoire calcule en double précision et ne tronque rien ;
 * ici on décide ce que l'élève LIT. C'est la règle déjà tenue par
 * `trigFormat.js` et `sequenceFormat.js`, et elle a une raison : un arrondi
 * dispersé dans les composants finit par arrondir deux fois, et par afficher
 * deux valeurs différentes du même nombre sur le même écran.
 *
 * Le format est celui des manuels français : virgule décimale, vrai signe
 * moins (−, U+2212), chiffres latins. On réutilise `formatValue` du grapheur
 * plutôt que d'en réécrire un troisième.
 *
 * ── §35 : l'approché ne se déguise jamais en exact ────────────────────────
 * `formatApproximate` préfixe « ≈ » et rien d'autre ne le fait. Une pente
 * issue de la règle de dérivation s'écrit « = 4 » ; la même pente MESURÉE
 * s'écrit « ≈ 4 ». C'est une exigence du cahier des charges, et c'est aussi
 * la seule façon honnête d'afficher une limite lue sur une table.
 */

import { formatValue } from '../functionGrapher/grapherFormat.js';

export { formatValue };

/** Le signe moins typographique, pour un nombre déjà mis en forme. */
const MINUS = '−';

/** « ≈ 1,41 » — une valeur que l'on a MESURÉE, jamais démontrée (§35). */
export function formatApproximate(value, decimals = 3) {
  const text = formatValue(value, decimals);

  return text === '—' ? text : `≈ ${text}`;
}

/**
 * Une valeur selon qu'elle est exacte ou approchée.
 *
 * @param {number} value
 * @param {boolean} exact  vraie si elle vient d'une RÈGLE, fausse si d'une mesure
 */
export function formatMaybeExact(value, exact, decimals = 3) {
  if (!Number.isFinite(value)) return '—';

  return exact ? formatValue(value, decimals) : formatApproximate(value, decimals);
}

/** Un couple (x ; y) à la française : point-virgule séparateur, virgule décimale. */
export function formatPoint(x, y, decimals = 2) {
  return `(${formatValue(x, decimals)} ; ${formatValue(y, decimals)})`;
}

/** L'infini signé : +∞ / −∞. */
function formatInfinity(sign) {
  return sign < 0 ? `${MINUS}∞` : '+∞';
}

/**
 * Une LIMITE telle qu'elle doit s'écrire — et jamais autrement.
 *
 * Rend une clé i18n et ses paramètres plutôt qu'une phrase : le texte vit
 * dans `mathlab.json`, pas dans un module de calcul.
 *
 * @param {{kind: string, value?: number, sign?: number, uncertain?: boolean}} limit
 * @returns {{text: string, tone: 'finite'|'infinite'|'none'|'undefined'}}
 */
export function formatLimit(limit) {
  if (!limit) return { text: '—', tone: 'undefined' };
  switch (limit.kind) {
    case 'finite':
      // Une limite lue sur une table est TOUJOURS approchée (§35).
      return { text: formatApproximate(limit.value), tone: 'finite' };
    case 'infinite':
      return { text: formatInfinity(limit.sign), tone: 'infinite' };
    case 'none':
      return { text: '—', tone: 'none' };
    default:
      return { text: '—', tone: 'undefined' };
  }
}

/**
 * Un INTERVALLE en notation mathématique : ]−2 ; 3[ — crochets sortants,
 * comme au manuel français, pas les parenthèses anglo-saxonnes.
 */
export function formatInterval(from, to, options = {}) {
  const left = options.closedLeft ? '[' : ']';
  const right = options.closedRight ? ']' : '[';
  const low = from === -Infinity ? `${MINUS}∞` : formatValue(from, options.decimals ?? 2);
  const high = to === Infinity ? '+∞' : formatValue(to, options.decimals ?? 2);

  return `${left}${low} ; ${high}${right}`;
}

/**
 * L'équation d'une droite, telle qu'on l'écrit au tableau : y = 2x + 3,
 * y = −x, y = 4 (pente nulle), x = 2 (verticale).
 */
export function formatLine(slope, intercept, decimals = 2) {
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return '—';
  const roundedSlope = Number(slope.toFixed(decimals));
  const roundedIntercept = Number(intercept.toFixed(decimals));
  if (roundedSlope === 0) return `y = ${formatValue(roundedIntercept, decimals)}`;

  const slopeText = roundedSlope === 1 ? 'x' : roundedSlope === -1 ? `${MINUS}x` : `${formatValue(roundedSlope, decimals)}x`;
  if (roundedIntercept === 0) return `y = ${slopeText}`;
  const sign = roundedIntercept > 0 ? '+' : MINUS;

  return `y = ${slopeText} ${sign} ${formatValue(Math.abs(roundedIntercept), decimals)}`;
}

/**
 * Le nom d'une borne d'approche : `x → 2⁻` ou `x → 2⁺` (§11).
 * Les exposants sont des caractères Unicode, pas du balisage : ils survivent
 * à un copier-coller et se lisent par un lecteur d'écran.
 */
export function formatApproach(a, side, decimals = 2) {
  return `x → ${formatValue(a, decimals)}${side === 'left' ? '⁻' : '⁺'}`;
}
