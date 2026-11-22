/**
 * L'ÉCRITURE des nombres et des notations du مختبر المتتاليات.
 *
 * Le FORMAT des nombres est celui de toute la plateforme — virgule décimale,
 * vrai signe moins, chiffres latins — et il n'est pas redéfini ici : on
 * importe `formatValue` du grapheur (MATH_LAB §3 : « le format partagé du
 * Lab »). Ce module n'ajoute que ce qui est propre aux متتاليات : les indices
 * (u₀, u₁, uₙ₊₁), les grands nombres, et les notations de règles.
 *
 * ── Les indices, et pourquoi ils ne sont pas du HTML ─────────────────────
 * Un indice s'écrit en caractères Unicode d'indice (`u₀`, `u₁₀`) plutôt qu'en
 * `<sub>`. Trois raisons : le texte reste copiable et lisible par un lecteur
 * d'écran comme « u zéro » ; il traverse un `aria-label`, un `<title>` SVG et
 * un attribut `data-` sans balise ; et il ne dépend d'aucun style, donc il
 * survit à une capture PNG du graphe.
 *
 * ── RTL ──────────────────────────────────────────────────────────────────
 * Tout ce que ce module rend est de la NOTATION : elle se pose dans un nœud
 * `dir="ltr"` (ARABIC_RTL_CONTRACT §4), avec `text-align: left` et
 * `unicode-bidi: isolate` du côté CSS. Le module ne contient aucune chaîne
 * traduisible — pas un mot d'arabe, pas un mot de français : uniquement des
 * symboles mathématiques, qui sont les mêmes dans toutes les langues.
 */

import { formatValue, formatAxisLabel } from '../functionGrapher/grapherFormat.js';

export { formatValue, formatAxisLabel };

const SUBSCRIPTS = Object.freeze(['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']);

/** Un entier en caractères d'indice : 12 → « ₁₂ ». Un négatif garde son signe. */
export function subscript(value) {
  if (!Number.isFinite(value)) return '';
  const negative = value < 0;
  const digits = String(Math.abs(Math.trunc(value)))
    .split('')
    .map((digit) => SUBSCRIPTS[Number(digit)] ?? '')
    .join('');

  return negative ? `₋${digits}` : digits;
}

/** Le nom d'un terme : `u₀`, `u₇`, `u₁₂`. */
export function termName(index, letter = 'u') {
  return `${letter}${subscript(index)}`;
}

/** Le nom symbolique du terme suivant : `uₙ₊₁`. */
export const NEXT_TERM_NAME = 'uₙ₊₁';
export const CURRENT_TERM_NAME = 'uₙ';
export const SECOND_NEXT_TERM_NAME = 'uₙ₊₂';

/**
 * Un terme écrit pour la lecture : `u₃ = 11`.
 *
 * `decimals` suit la valeur : un entier s'écrit sans décimale (11, pas
 * 11,00), un décimal en garde ce qu'il faut. Une suite de 2, 5, 8, 11 qui
 * s'afficherait « 2,00 · 5,00 » ferait croire à une précision inventée.
 */
export function formatTerm(value, decimals = 4) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return formatLargeInteger(value);

  return formatValue(value, decimals);
}

/**
 * Un grand entier avec des séparateurs de milliers fins : 1 048 576.
 *
 * L'espace insécable fine (U+202F) est le séparateur des manuels ; une
 * virgule serait lue comme une décimale, et un point aussi. Au-delà de
 * 10¹², on passe à la notation scientifique — un nombre de vingt chiffres
 * n'apprend plus rien et casse toutes les colonnes.
 */
export function formatLargeInteger(value) {
  if (!Number.isFinite(value)) return '—';
  const absolute = Math.abs(value);
  if (absolute >= 1e12) return formatScientific(value);
  const text = String(Math.trunc(absolute)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return value < 0 ? `−${text}` : text;
}

/** La notation scientifique, pour ce qui ne tient pas : 1,05 × 10¹². */
export function formatScientific(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;

  return `${formatValue(mantissa, decimals)} × 10${superscript(exponent)}`;
}

const SUPERSCRIPTS = Object.freeze(['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']);

/** Un exposant en caractères d'exposant : 12 → « ¹² », −3 → « ⁻³ ». */
export function superscript(value) {
  if (!Number.isFinite(value)) return '';
  const negative = value < 0;
  const digits = String(Math.abs(Math.trunc(value)))
    .split('')
    .map((digit) => SUPERSCRIPTS[Number(digit)] ?? '')
    .join('');

  return negative ? `⁻${digits}` : digits;
}

/**
 * Un coefficient devant une variable : `2u`, `−u`, `u`, `0,5u`.
 *
 * Écrire « 1u » ou « 1×u » là où on écrit « u » est la marque d'une formule
 * engendrée par une machine. Celle-ci doit se lire comme le cahier de l'élève.
 */
export function formatCoefficient(value, variable) {
  if (!Number.isFinite(value)) return '';
  if (value === 1) return variable;
  if (value === -1) return `−${variable}`;
  if (value === 0) return '0';

  return `${formatValue(value, 4)}${variable}`;
}

/** Un terme additif : `+ 3`, `− 2`, et rien du tout si zéro. */
export function formatAddend(value, decimals = 4) {
  if (!Number.isFinite(value) || value === 0) return '';
  const sign = value < 0 ? '−' : '+';

  return ` ${sign} ${formatValue(Math.abs(value), decimals)}`;
}

/**
 * LA RÈGLE d'une متتالية, écrite comme au tableau (§8, §16).
 *
 *   arithmétique   uₙ₊₁ = uₙ + 3
 *   géométrique    uₙ₊₁ = 1,5 uₙ
 *   affine         uₙ₊₁ = 0,5 uₙ + 2
 *   explicite      uₙ = 2n + 1
 *   récurrence     uₙ₊₁ = u² − 1        (la source de l'élève, `u` → `uₙ`)
 *   second ordre   uₙ₊₂ = uₙ₊₁ + uₙ
 */
export function formatRule(spec) {
  if (!spec) return '';
  switch (spec.kind) {
    case 'arithmetic':
      return `${NEXT_TERM_NAME} = ${CURRENT_TERM_NAME}${formatAddend(spec.difference)}`;
    case 'geometric':
      return `${NEXT_TERM_NAME} = ${formatCoefficient(spec.ratio, ` ${CURRENT_TERM_NAME}`).trim()}`;
    case 'affine':
      return `${NEXT_TERM_NAME} = ${formatCoefficient(spec.a, ` ${CURRENT_TERM_NAME}`).trim()}${formatAddend(spec.b)}`;
    case 'explicit':
      return `${CURRENT_TERM_NAME} = ${prettySource(spec.explicitSource)}`;
    case 'recurrence':
      return `${NEXT_TERM_NAME} = ${prettySource(spec.ruleSource, true)}`;
    case 'secondOrder':
      return `${SECOND_NEXT_TERM_NAME} = ${formatCoefficient(spec.a, ` ${NEXT_TERM_NAME}`).trim()}${
        spec.b === 0 ? '' : ` ${spec.b < 0 ? '−' : '+'} ${formatCoefficient(Math.abs(spec.b), ` ${CURRENT_TERM_NAME}`).trim()}`}`;
    default:
      return '';
  }
}

/**
 * La source de l'élève, rendue lisible : `u^2 - 1` → `uₙ² − 1`.
 *
 * On ne réanalyse pas l'expression — ce serait un second analyseur, ce que
 * §1 interdit. On embellit seulement : les signes moins, les exposants
 * simples, et `u` qui devient `uₙ` pour que la règle se lise comme la
 * définition qu'elle est.
 */
export function prettySource(source, isRecurrence = false) {
  let text = String(source ?? '').trim();
  if (!text) return '';

  text = text
    .replace(/\*/g, '·')
    // TOUT signe moins devient le vrai signe typographique : unaire comme
    // binaire, espacé comme collé. Distinguer les deux ne servirait à rien —
    // « − » est le bon caractère dans les deux cas (ARABIC_RTL_CONTRACT §4).
    .replace(/-/g, '−')
    // Les exposants : les chiffres (`u^2` → `u²`) ET la variable (`(−1)^n` →
    // `(−1)ⁿ`), parce que `(−1)^n` est LA suite alternée de §20 et §24 : la
    // laisser écrite avec un accent circonflexe serait la laisser illisible.
    .replace(/\^\{?(\d+)\}?/g, (_, digits) => superscript(Number(digits)))
    .replace(/\^\{?n\}?/g, 'ⁿ')
    // Le point décimal de la saisie devient la virgule de la plateforme :
    // `3.2u` s'affiche « 3,2uₙ ». Seul un point ENTRE CHIFFRES est décimal.
    .replace(/(\d)\.(\d)/g, '$1,$2');

  if (isRecurrence) {
    // `u` devient `uₙ`, `v` devient `uₙ₋₁` (le terme d'avant, au second ordre).
    // Les frontières de mot ne suffisent pas : dans `2u`, `\bu\b` échoue parce
    // que le chiffre et la lettre sont tous deux des caractères de mot. On
    // regarde donc de part et d'autre qu'il n'y ait pas de LETTRE — ce qui
    // laisse `2u` remplacé et protège un éventuel `sqrt`, `exp`, `ln`.
    text = text
      .replace(/(?<![a-zA-Z])u(?![a-zA-Z])/g, CURRENT_TERM_NAME)
      .replace(/(?<![a-zA-Z])v(?![a-zA-Z])/g, 'uₙ₋₁');
  }

  return text;
}

/**
 * La FORME EXPLICITE d'une famille, quand le cours la donne (§16).
 *
 *   arithmétique   uₙ = 2 + 3n
 *   géométrique    uₙ = 2 × 1,5ⁿ
 *   affine         uₙ = 4 + (0 − 4) × 0,5ⁿ
 *
 * L'indice de départ décale l'exposant : parti de u₁, c'est `(n − 1)`. On
 * l'écrit tel quel plutôt que de le cacher, parce que c'est exactement la
 * chose que l'élève doit voir pour comprendre la formule.
 */
export function formatClosedForm(closed) {
  if (!closed) return '';
  const { kind, params } = closed;
  const shift = params.startIndex === 0 ? 'n' : '(n − 1)';

  switch (kind) {
    case 'arithmetic': {
      if (params.r === 0) return `${CURRENT_TERM_NAME} = ${formatValue(params.u0, 4)}`;

      return `${CURRENT_TERM_NAME} = ${formatValue(params.u0, 4)} + ${formatValue(params.r, 4)} × ${shift}`;
    }
    case 'geometric':
      return `${CURRENT_TERM_NAME} = ${formatValue(params.u0, 4)} × ${formatValue(params.q, 4)}${params.startIndex === 0 ? 'ⁿ' : `^${shift}`}`;
    case 'affine': {
      const gap = params.u0 - params.limit;

      return `${CURRENT_TERM_NAME} = ${formatValue(params.limit, 4)} ${gap < 0 ? '−' : '+'} ${
        formatValue(Math.abs(gap), 4)} × ${formatValue(params.a, 4)}${params.startIndex === 0 ? 'ⁿ' : `^${shift}`}`;
    }
    default:
      return '';
  }
}

/** Le point fixe d'une affine, écrit comme la formule qu'il est : `L = b / (1 − a)`. */
export function formatFixedPointFormula(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 1) return '';

  return `L = ${formatValue(b, 4)} / (1 − ${formatValue(a, 4)}) = ${formatValue(b / (1 - a), 4)}`;
}

/** Une différence lue : `u₄ − u₃ = 3`. */
export function formatDifference(index, value) {
  return `${termName(index + 1)} − ${termName(index)} = ${formatTerm(value)}`;
}

/** Un rapport lu : `u₄ / u₃ = 1,5` — ou son absence. */
export function formatRatio(index, value, defined = true) {
  const right = defined && Number.isFinite(value) ? formatTerm(value) : '—';

  return `${termName(index + 1)} / ${termName(index)} = ${right}`;
}

/** Une somme partielle : `S₃ = 15`. */
export function formatSum(index, value) {
  return `${termName(index, 'S')} = ${formatTerm(value)}`;
}

/**
 * Le pas de la récurrence, montré en trois temps (§8) : la valeur courante,
 * la règle appliquée, la valeur suivante. On rend les TROIS morceaux
 * séparément pour que l'interface puisse les mettre en scène — une flèche
 * entre eux, une couleur sur celui qui change — au lieu d'une phrase figée.
 */
export function formatStepBreakdown(spec, index, current, next) {
  if (!spec) return null;
  const applied = (() => {
    switch (spec.kind) {
      case 'arithmetic':
        return `${substituted(current)}${formatAddend(spec.difference)}`;
      case 'geometric':
        return `${formatValue(spec.ratio, 4)} × ${substituted(current)}`;
      case 'affine':
        return `${formatValue(spec.a, 4)} × ${substituted(current)}${formatAddend(spec.b)}`;
      case 'recurrence':
        // La règle avec le nombre À LA PLACE de uₙ : c'est le « f(uₙ) = … »
        // de §8, le moment où la règle devient un calcul. `split`/`join`
        // plutôt qu'une expression régulière construite à la volée : `uₙ`
        // est du texte, et une valeur négative substituée n'a pas à être
        // relue comme un motif.
        //
        // Une valeur NÉGATIVE est parenthésée : substituer −2 dans `u² − 1`
        // donnerait « −2² − 1 », qui se lit −(2²) − 1 = −5 alors que le
        // calcul est (−2)² − 1 = 3. La parenthèse n'est pas une coquetterie
        // typographique : sans elle, la ligne enseigne une erreur de signe.
        return substituteCurrent(prettySource(spec.ruleSource, true), current);
      default:
        return formatTerm(next);
    }
  })();

  return {
    from: `${termName(index)} = ${formatTerm(current)}`,
    applied,
    to: `${termName(index + 1)} = ${formatTerm(next)}`,
  };
}

/** Une valeur posée dans une règle : parenthésée si elle est négative. */
export function substituted(value) {
  const text = formatTerm(value);

  return typeof value === 'number' && value < 0 ? `(${text})` : text;
}

/**
 * Remplace `uₙ` par sa valeur dans une règle EMBELLIE, en gardant la ligne
 * lisible (§8 : « the student should visually see current term → rule → next
 * term », donc la ligne du milieu doit se lire).
 *
 * ── Pourquoi on ne répare pas le texte après coup ────────────────────────
 * Un premier essai substituait puis rattrapait les produits implicites à
 * l'expression régulière. C'est intenable : `3,2uₙ(1−uₙ)` avec uₙ = 0,3 donne
 * « 3,20,3(1−0,3) », où plus rien ne dit où finissait le coefficient — une
 * règle qui relit ce texte coupe « 3,20 × ,3 ». L'information perdue ne peut
 * pas être retrouvée en aval.
 *
 * On l'insère donc AU MOMENT où on la possède : ici, on sait exactement où
 * était la variable, donc on sait quand son voisin de gauche (ou de droite)
 * était un facteur implicite. Un « × » est posé là, et nulle part ailleurs.
 */
export function substituteCurrent(pretty, value) {
  const text = String(pretty ?? '');
  const pieces = text.split(CURRENT_TERM_NAME);
  if (pieces.length === 1) return text;

  const shown = substituted(value);
  let out = pieces[0];
  for (let i = 1; i < pieces.length; i += 1) {
    const before = out.slice(-1);
    const after = pieces[i].slice(0, 1);
    // Un facteur implicite à gauche : « 3,2uₙ » → « 3,2 × 0,3 ».
    if (/[\d,)]/.test(before)) out += ' × ';
    out += shown;
    // Un facteur implicite à droite : « uₙ(… » → « 0,3 × (… ».
    if (after === '(' || /\d/.test(after)) out += ' × ';
    out += pieces[i];
  }

  return out;
}
