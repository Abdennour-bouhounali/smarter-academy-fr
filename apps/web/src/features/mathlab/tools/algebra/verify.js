/**
 * La VÉRIFICATION du مختبر الجبر — logique pure, sans React.
 *
 * « التحقق » substitue la valeur trouvée dans l'équation de DÉPART et montre
 * le calcul des deux membres :
 *
 *     2x + 3 = 11   avec x = 4
 *     2 × 4 + 3 = 11
 *     11 = 11        ✓
 *
 * C'est l'idée que la V1 doit faire passer : une solution n'est pas le
 * résultat d'une recette, c'est la valeur qui rend la relation VRAIE. Le
 * calcul reste rationnel exact — vérifier 1/3 ne doit pas buter sur
 * 0,33333 × 3 ≠ 1.
 */

import * as R from './rational.js';
import { RELATION_LATEX, isInequality } from './equation.js';
import { formToLatex } from './linearForm.js';

/** La valeur d'une forme `a·x + b` en un point. */
export function evaluateForm(form, value) {
  return R.add(R.multiply(form.a, value), form.b);
}

/** La relation est-elle vraie pour ces deux nombres ? */
function relationHolds(left, right, relation) {
  const diff = R.sign(R.subtract(left, right));
  switch (relation) {
    case '=': return diff === 0;
    case '<': return diff < 0;
    case '>': return diff > 0;
    case '<=': return diff <= 0;
    case '>=': return diff >= 0;
    default: return false;
  }
}

/**
 * Le membre avec la valeur SUBSTITUÉE, pas encore calculée : `2 × 4 + 3`.
 * C'est la ligne qui fait comprendre la vérification ; l'écrire à partir de
 * la forme (et non de la saisie) garantit qu'elle correspond à ce que
 * l'équation dit vraiment.
 */
export function substitutedLatex(form, value) {
  if (R.isZero(form.a)) return R.toLatex(form.b);
  const v = R.isNegative(value) || !R.isInteger(value) ? `\\left(${R.toLatex(value)}\\right)` : R.toLatex(value);

  let head;
  if (R.equals(form.a, R.ONE)) head = v;
  else if (R.equals(form.a, { n: -1, d: 1 })) head = `-${v}`;
  else head = `${R.toLatex(form.a)} \\times ${v}`;

  if (R.isZero(form.b)) return head;
  const sign = R.isNegative(form.b) ? '-' : '+';

  return `${head} ${sign} ${R.toLatex(R.isNegative(form.b) ? R.negate(form.b) : form.b)}`;
}

/**
 * Vérifie une valeur dans une équation.
 *
 * @returns {{holds: boolean, left: object, right: object, lines: {original: string, substituted: string, evaluated: string}}}
 */
export function verifySolution(equation, value, variable = 'x') {
  const left = evaluateForm(equation.left, value);
  const right = evaluateForm(equation.right, value);
  const symbol = RELATION_LATEX[equation.relation];

  return {
    holds: relationHolds(left, right, equation.relation),
    left,
    right,
    lines: {
      original: `${formToLatex(equation.left, variable)} ${symbol} ${formToLatex(equation.right, variable)}`,
      substituted: `${substitutedLatex(equation.left, value, variable)} ${symbol} ${substitutedLatex(equation.right, value, variable)}`,
      evaluated: `${R.toLatex(left)} ${symbol} ${R.toLatex(right)}`,
    },
  };
}

/**
 * La vérification d'une RÉSOLUTION : la solution trouvée, `x RELATION s`,
 * confrontée à la relation de DÉPART.
 *
 * Pour une équation, c'est `verifySolution` en s.
 *
 * Pour une INÉQUATION (متراجحة), substituer la borne s ne vérifie rien :
 * elle rend les deux membres ÉGAUX, donc `<` et `>` y sont fausses — « التحقق »
 * déclarait alors faux un résultat juste (x − 7 < −7 → x < 0 → « −7 < −7 ✗ »),
 * et pour `≤`/`≥` il présentait la borne comme « la » solution. On vérifie
 * donc DEUX choses, qui suffisent pour une relation affine :
 *
 *   1. une valeur PRISE DANS l'ensemble des solutions (un entier quand il y
 *      en a un avant la borne) vérifie la relation de départ ;
 *   2. en la borne, les deux membres sont ÉGAUX — c'est là que la relation
 *      bascule. La borne n'est solution que si le symbole DE DÉPART accepte
 *      l'égalité (≤, ≥) ; la solution annoncée doit dire la même chose
 *      (`x ≤ s` et non `x < s`), sinon elle est fausse.
 *
 * Membres affines, différence nulle en s et du bon signe en un point de
 * l'ensemble : la différence a ce signe sur TOUTE la demi-droite. Les deux
 * constats ensemble prouvent donc l'ensemble entier, pas un seul point.
 *
 * @param {object} start       la relation de départ
 * @param {object} solution    la borne s (rationnel)
 * @param {string} relation    le sens de la solution : `x RELATION s`
 */
export function verifyResolution(start, solution, relation, variable = 'x') {
  if (!isInequality(relation)) {
    const check = verifySolution(start, solution, variable);

    return { kind: 'equation', holds: check.holds, value: solution, check };
  }

  const sample = sampleInside(solution, relation);
  const inside = verifySolution(start, sample, variable);
  const boundary = verifySolution({ ...start, relation: '=' }, solution, variable);
  // Les membres étant égaux en s, s est solution ssi la relation de départ accepte l'égalité.
  const included = boundary.holds && verifySolution(start, solution, variable).holds;
  const claimedIncluded = relation === '<=' || relation === '>=';

  return {
    kind: 'inequality',
    holds: inside.holds && boundary.holds && included === claimedIncluded,
    relation,
    startRelation: start.relation,
    sample,
    inside,
    boundary: { value: solution, equal: boundary.holds, included, claimedIncluded, check: boundary },
  };
}

/**
 * Une valeur STRICTEMENT dans l'ensemble `x RELATION s` : l'entier le plus
 * proche du bon côté de s (s − 1 ou s + 1 quand s est entier).
 */
export function sampleInside(solution, relation) {
  const below = relation === '<' || relation === '<=';
  const floor = R.makeRational(floorDivide(solution.n, solution.d));
  if (below) return R.isInteger(solution) ? R.subtract(solution, R.ONE) : floor;

  return R.isInteger(solution) ? R.add(solution, R.ONE) : R.add(floor, R.ONE);
}

/** ⌊n / d⌋ exact, pour d > 0 (le rationnel porte son signe au numérateur). */
function floorDivide(n, d) {
  const remainder = ((n % d) + d) % d;

  return (n - remainder) / d;
}
