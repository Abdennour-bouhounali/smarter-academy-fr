/**
 * Les RACCOURCIS et la lecture d'une valeur d'opération — logique pure.
 *
 * Deux choses que l'interface ne doit pas porter :
 *
 *  — lire « 3 », « 1/2 », « 2,5 », « −4 » comme un rationnel exact ;
 *  — proposer les opérations qui FONT AVANCER l'équation courante.
 *
 * Les raccourcis sont ceux qu'un professeur écrirait au tableau : d'abord
 * ramener les x d'un seul côté, puis retrancher la constante, puis diviser
 * par le coefficient. Jamais plus de trois : un panneau qui propose tout ne
 * propose rien.
 */

import * as R from './rational.js';
import { parseExpression } from '../functionGrapher/expressionParser.js';
import { toLinearForm, isConstant } from './linearForm.js';
import { isSolvedForm } from './equation.js';

/**
 * Une saisie d'élève → un rationnel, ou un refus motivé. Accepte « 3 »,
 * « −3 », « 1/2 », « 2,5 », « \frac{1}{2} » — la même grammaire que partout.
 */
export function parseOperationValue(text) {
  const parsed = parseExpression(text, { variables: [] });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const linear = toLinearForm(parsed.ast, 'x');
  if (!linear.ok) return { ok: false, error: linear.error };
  if (!isConstant(linear.form)) return { ok: false, error: { code: 'notANumber' } };

  return { ok: true, value: linear.form.b };
}

/** L'écriture courte d'un rationnel dans un bouton : `3`, `−2`, `1/2`. */
function shortText(value) {
  return value.d === 1 ? String(value.n).replace('-', '−') : `${String(value.n).replace('-', '−')}/${value.d}`;
}

const SYMBOL = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

function hint(kind, value, term = null) {
  const x = term === 'x' ? (R.equals(value, R.ONE) ? 'x' : `${shortText(value)}x`) : null;

  return {
    kind,
    value,
    ...(term ? { term } : {}),
    text: value.d === 1 ? String(value.n) : `${value.n}/${value.d}`,
    label: `${SYMBOL[kind]} ${x ?? shortText(value)}`,
  };
}

/**
 * Les prochaines opérations utiles, dans l'ordre où on les ferait.
 *
 * @returns {Array<{kind: string, value: object, text: string, label: string}>}
 */
export function suggestOperations(equation) {
  if (isSolvedForm(equation)) return [];
  const hints = [];

  // 1. L'inconnue des deux côtés : la ramener à gauche.
  if (!R.isZero(equation.right.a)) {
    const kind = R.isNegative(equation.right.a) ? 'add' : 'subtract';
    // C'est un TERME en x qu'on déplace (`− 2x`), pas le nombre 2.
    hints.push(hint(kind, R.isNegative(equation.right.a) ? R.negate(equation.right.a) : equation.right.a, 'x'));
  }

  // 2. La constante à gauche : la faire disparaître.
  if (!R.isZero(equation.left.b)) {
    const kind = R.isNegative(equation.left.b) ? 'add' : 'subtract';
    hints.push(hint(kind, R.isNegative(equation.left.b) ? R.negate(equation.left.b) : equation.left.b));
  }

  // 3. Le coefficient : diviser (ou multiplier, s'il est fractionnaire).
  const a = R.subtract(equation.left.a, equation.right.a);
  if (!R.isZero(a) && !R.equals(a, R.ONE)) {
    if (a.d === 1) hints.push(hint('divide', a));
    else hints.push(hint('multiply', R.divide(R.ONE, a)));
  }

  return hints.slice(0, 3);
}
