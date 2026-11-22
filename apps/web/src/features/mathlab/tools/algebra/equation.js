/**
 * L'ÉQUATION du مختبر الجبر — logique pure, sans React.
 *
 * Une équation, ici, est une RELATION entre deux formes linéaires :
 *
 *     { left: {a, b}, right: {a, b}, relation: '=' | '<' | '>' | '<=' | '>=' }
 *
 * L'inégalité n'est pas un mode à part : c'est le même objet avec une autre
 * relation, et les mêmes opérations. Une seule règle l'en distingue, et
 * c'est LA règle du chapitre — multiplier ou diviser par un négatif
 * RETOURNE le sens :
 *
 *     −2x > 6   ÷(−2)   →   x < −3
 *
 * `applyOperation` la tient au même endroit pour les quatre opérations ;
 * aucun composant n'a à s'en souvenir.
 *
 * Ce module ne résout rien tout seul : `classify` dit ce que l'état COURANT
 * signifie (une solution, aucune, une infinité), et l'élève y arrive par ses
 * opérations. `solve` existe pour « إظهار الحل » et pour les tests, pas pour
 * l'écran d'ouverture — voir docs/architecture/MATH_LAB.md §5e.
 */

import { parseExpression } from '../functionGrapher/expressionParser.js';
import * as R from './rational.js';
import { toLinearForm, formToLatex, addForms, subtractForms, scaleForm, isConstant } from './linearForm.js';

const RELATIONS = Object.freeze(['=', '<', '>', '<=', '>=']);

/** Le symbole tel qu'il s'écrit en LaTeX et se lit à l'écran. */
export const RELATION_LATEX = Object.freeze({ '=': '=', '<': '<', '>': '>', '<=': '\\leq', '>=': '\\geq' });
export const RELATION_TEXT = Object.freeze({ '=': '=', '<': '<', '>': '>', '<=': '≤', '>=': '≥' });

export function isRelation(value) { return RELATIONS.includes(value); }
export function isInequality(relation) { return relation !== '='; }

/** Le sens inverse — ce que produit une multiplication par un négatif. */
export function flipRelation(relation) {
  switch (relation) {
    case '<': return '>';
    case '>': return '<';
    case '<=': return '>=';
    case '>=': return '<=';
    default: return '=';
  }
}

/** Les relations écrites à la main ou par MathLive, de la plus longue à la plus courte. */
const RELATION_TOKENS = [
  { text: '\\leqslant', relation: '<=' },
  { text: '\\geqslant', relation: '>=' },
  { text: '\\leq', relation: '<=' },
  { text: '\\geq', relation: '>=' },
  { text: '\\le', relation: '<=' },
  { text: '\\ge', relation: '>=' },
  { text: '<=', relation: '<=' },
  { text: '>=', relation: '>=' },
  { text: '≤', relation: '<=' },
  { text: '≥', relation: '>=' },
  { text: '=', relation: '=' },
  { text: '<', relation: '<' },
  { text: '>', relation: '>' },
];

/**
 * Coupe une saisie en `gauche RELATION droite`, en ignorant ce qui est entre
 * accolades LaTeX (`\frac{1}{2}` ne contient pas de relation) — et refuse
 * une saisie qui en porte deux (`1 < x < 5` n'est pas la V1).
 */
export function splitRelation(source) {
  const text = String(source ?? '');
  const found = [];
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '{') { depth += 1; continue; }
    if (ch === '}') { depth = Math.max(0, depth - 1); continue; }
    if (depth > 0) continue;
    // `\leq` ne doit pas se lire comme `\le` + `q`.
    const token = RELATION_TOKENS.find((candidate) => text.startsWith(candidate.text, i)
      && !(candidate.text.startsWith('\\') && /[a-zA-Z]/.test(text[i + candidate.text.length] ?? '')));
    if (token) {
      found.push({ index: i, ...token });
      i += token.text.length - 1;
    }
  }
  if (found.length === 0) return { ok: false, error: { code: 'noRelation' } };
  if (found.length > 1) return { ok: false, error: { code: 'manyRelations' } };
  const cut = found[0];

  return {
    ok: true,
    left: text.slice(0, cut.index),
    right: text.slice(cut.index + cut.text.length),
    relation: cut.relation,
  };
}

/**
 * Une saisie (`2x + 3 = 11`, LaTeX ou ASCII) → une équation, ou un refus
 * motivé. Les codes d'erreur sont ceux de l'analyseur (`empty`, `syntax`,
 * `unknownSymbol`, `incomplete`), plus ceux d'ici (`noRelation`,
 * `manyRelations`, `emptySide`) et de la réduction (`nonLinear`,
 * `divideByZero`, `overflow`). `side` dit lequel des deux membres refuse.
 */
export function parseEquation(source, variable = 'x') {
  const split = splitRelation(source);
  if (!split.ok) return { ok: false, error: split.error };

  const sides = {};
  for (const side of ['left', 'right']) {
    const raw = split[side];
    if (!String(raw ?? '').trim()) return { ok: false, error: { code: 'emptySide', side } };
    const parsed = parseExpression(raw, { variables: [variable] });
    if (!parsed.ok) return { ok: false, error: { ...parsed.error, side } };
    const linear = toLinearForm(parsed.ast, variable);
    if (!linear.ok) return { ok: false, error: { ...linear.error, side } };
    sides[side] = linear.form;
  }

  return { ok: true, equation: { left: sides.left, right: sides.right, relation: split.relation } };
}

/**
 * Applique la même opération AUX DEUX MEMBRES — c'est toute la leçon.
 *
 * @param {object} equation
 * @param {{kind: 'add'|'subtract'|'multiply'|'divide', value: object, term?: 'x'}} operation  value : un rationnel ;
 *   `term: 'x'` (add/subtract seulement) : l'opération porte sur `value·x`, pas sur une constante
 * @returns {{ok: true, equation: object, flipped: boolean} | {ok: false, error: {code: string}}}
 */
export function applyOperation(equation, operation) {
  const { kind, value } = operation;
  try {
    if (kind === 'add' || kind === 'subtract') {
      // `term: 'x'` : on ajoute / retranche `value·x` (ramener les x d'un seul côté).
      const term = operation.term === 'x' ? { a: value, b: R.ZERO } : { a: R.ZERO, b: value };
      const apply = kind === 'add' ? addForms : subtractForms;

      return {
        ok: true,
        flipped: false,
        equation: { ...equation, left: apply(equation.left, term), right: apply(equation.right, term) },
      };
    }

    if (kind === 'multiply' || kind === 'divide') {
      // Multiplier les deux membres par zéro efface l'inconnue et rend
      // « 0 = 0 » : vrai, et sans rapport avec l'équation de départ. Diviser
      // par zéro n'a pas de sens. Les deux sont refusés.
      if (R.isZero(value)) return { ok: false, error: { code: kind === 'divide' ? 'divideByZero' : 'multiplyByZero' } };
      const factor = kind === 'multiply' ? value : R.divide(R.ONE, value);
      const flipped = isInequality(equation.relation) && R.isNegative(value);

      return {
        ok: true,
        flipped,
        equation: {
          left: scaleForm(equation.left, factor),
          right: scaleForm(equation.right, factor),
          relation: flipped ? flipRelation(equation.relation) : equation.relation,
        },
      };
    }

    return { ok: false, error: { code: 'unsupported' } };
  } catch (error) {
    if (error instanceof RangeError) {
      return { ok: false, error: { code: error.message === 'divideByZero' ? 'divideByZero' : 'overflow' } };
    }
    throw error;
  }
}

/**
 * Ce que l'état courant SIGNIFIE, sans le transformer :
 *
 *   'solved'    l'inconnue est isolée — `x = 4`, `x < −3`
 *   'unique'    une solution existe, pas encore isolée — `2x = 8`
 *   'none'      aucune solution — `2x + 3 = 2x + 5` devient `0 = 2`
 *   'infinite'  toujours vraie — `2x + 3 = 2x + 3`
 *
 * `solution` porte la valeur quand elle existe (un rationnel), `null` sinon.
 */
export function classify(equation) {
  const a = R.subtract(equation.left.a, equation.right.a);
  const b = R.subtract(equation.right.b, equation.left.b);

  if (R.isZero(a)) {
    // Plus d'inconnue : la relation est vraie ou fausse, indépendamment de x.
    const holds = relationHolds(R.ZERO, b, equation.relation);

    return { kind: holds ? 'infinite' : 'none', solution: null, solved: false };
  }

  const solution = R.divide(b, a);
  // Diviser par a retourne le sens si a est négatif.
  const relation = R.isNegative(a) ? flipRelation(equation.relation) : equation.relation;
  const solved = isSolvedForm(equation);

  return { kind: solved ? 'solved' : 'unique', solution, relation, solved };
}

/** `0 RELATION b` est-elle vraie ? (le membre de gauche a perdu son inconnue) */
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
 * L'équation est-elle déjà sous la forme `x RELATION valeur` — ou sous la
 * forme miroir `valeur RELATION x` ?
 *
 * `3 > x` dit exactement `x < 3` : l'inconnue est isolée, il n'y a plus
 * d'opération à faire. `classify` lit déjà le bon sens (le coefficient de x
 * passe du côté gauche avec un signe −, donc la relation est retournée) ; la
 * forme résolue affichée est toujours réécrite `x RELATION valeur`.
 */
export function isSolvedForm(equation) {
  const isolated = (form) => R.equals(form.a, R.ONE) && R.isZero(form.b);

  return (isolated(equation.left) && isConstant(equation.right))
    || (isolated(equation.right) && isConstant(equation.left));
}

/**
 * La forme résolue — ce que « إظهار الحل » montre, et ce que les tests
 * attendent. Rend l'équation `x RELATION valeur` en plus du verdict, pour
 * que l'affichage n'ait pas à la reconstruire.
 */
export function solve(equation) {
  const verdict = classify(equation);
  if (verdict.kind === 'none' || verdict.kind === 'infinite') return verdict;

  return {
    ...verdict,
    kind: 'solved',
    equation: {
      left: { a: R.ONE, b: R.ZERO },
      right: { a: R.ZERO, b: verdict.solution },
      relation: verdict.relation,
    },
  };
}

/** L'équation en LaTeX, prête pour MathText : `2x + 3 = 11`. */
export function equationToLatex(equation, variable = 'x') {
  return `${formToLatex(equation.left, variable)} ${RELATION_LATEX[equation.relation]} ${formToLatex(equation.right, variable)}`;
}

/** L'équation en texte simple — lecteur d'écran, titre de document, tests. */
export function equationToText(equation, variable = 'x') {
  const side = (form) => formToLatex(form, variable)
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
    .replace(/-/g, '−');

  return `${side(equation.left)} ${RELATION_TEXT[equation.relation]} ${side(equation.right)}`;
}

/** Deux équations décrivent-elles le même état ? (pour ne pas empiler un pas qui ne change rien) */
export function sameEquation(a, b) {
  if (!a || !b) return false;

  return a.relation === b.relation
    && R.equals(a.left.a, b.left.a) && R.equals(a.left.b, b.left.b)
    && R.equals(a.right.a, b.right.a) && R.equals(a.right.b, b.right.b);
}
