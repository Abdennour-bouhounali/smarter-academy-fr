/**
 * L'AST de l'analyseur unique → le LaTeX de ce que l'élève a ÉCRIT —
 * logique pure, sans React.
 *
 * La première ligne d'un pas à pas doit être la saisie elle-même, pas une
 * forme déjà transformée : `2(x+3) - 4x` s'écrit `2\left(x + 3\right) - 4x`,
 * pas `2x + 6 - 4x`. On l'écrit donc depuis l'ARBRE (jamais en retouchant la
 * chaîne) : les parenthèses reviennent là où la structure les exige.
 */

import { joinPieces, termPiece } from './polynomial.js';

function isSum(node) {
  if (node?.type === 'terms') return node.terms.length > 1;

  return node?.type === 'bin' && (node.op === '+' || node.op === '-');
}

function numberLatex(value) {
  // La virgule décimale des manuels algériens : `2{,}5`.
  return String(value).replace('.', '{,}');
}

function paren(inner) {
  return `\\left(${inner}\\right)`;
}

/** Aplatit une chaîne de produits `a·b·c` en ses facteurs. */
function productFactors(node) {
  if (node?.type === 'bin' && node.op === '*') return [...productFactors(node.left), ...productFactors(node.right)];

  return [node];
}

function printFactor(node, index) {
  const latex = print(node);
  if (isSum(node)) return paren(latex);
  if (index > 0 && latex.startsWith('-')) return paren(latex);

  return latex;
}

function startsWithDigit(latex) {
  return /^[0-9]/.test(latex);
}

function print(node) {
  if (!node || typeof node !== 'object') return '';
  switch (node.type) {
    case 'num': return numberLatex(node.value);
    case 'var': return node.name;
    // Un morceau DÉJÀ développé par simplify.js : ses termes, écrits tels
    // quels (produits posés, `shown`) ou calculés.
    case 'terms': return joinPieces(node.terms.map((term) => term.shown ?? termPiece(term)));
    case 'const': return node.name === 'pi' ? '\\pi' : 'e';
    case 'neg': {
      const arg = node.arg;
      if (isSum(arg) || arg?.type === 'neg') return `-${paren(print(arg))}`;

      return `-${print(arg)}`;
    }
    case 'call': {
      const inner = print(node.args?.[node.args.length - 1]);
      if (node.name === 'sqrt') return `\\sqrt{${inner}}`;
      if (node.name === 'abs') return `\\left|${inner}\\right|`;
      if (node.name === 'root') return `\\sqrt[${print(node.args[0])}]{${inner}}`;

      return `\\${node.name}${paren(inner)}`;
    }
    case 'bin': {
      const { op, left, right } = node;
      if (op === '+') {
        // Une somme déjà développée CONTINUE la ligne : `3x − 6 − 2x − 2`, pas `3x − 6 + (−2x − 2)`.
        if (right.type === 'terms' && right.terms.length > 0) {
          const pieces = right.terms.map((term) => term.shown ?? termPiece(term));

          return `${print(left)}${joinPieces([{ negative: false, body: '' }, ...pieces])}`;
        }
        const printed = print(right);
        const r = printed.startsWith('-') ? paren(printed) : printed;

        return `${print(left)} + ${r}`;
      }
      if (op === '-') {
        const printed = print(right);
        const r = isSum(right) || printed.startsWith('-') ? paren(printed) : printed;

        return `${print(left)} - ${r}`;
      }
      if (op === '*') {
        const factors = productFactors(node).map((factor, index) => ({ node: factor, latex: printFactor(factor, index), raw: print(factor) }));

        return factors.reduce((acc, factor, index) => {
          if (index === 0) return factor.latex;
          const previous = factors[index - 1];
          // Un nombre qui suit, ou une fraction (sinon `2\frac{x}{3}` se lirait
          // comme un nombre fractionnaire) : un vrai signe ×.
          const explicit = startsWithDigit(factor.latex)
            || factor.node.type === 'num'
            || (factor.node.type === 'bin' && factor.node.op === '/')
            || factor.raw.startsWith('-')
            || (previous.node.type === 'bin' && previous.node.op === '/' && previous.node.left?.type !== 'num');

          return `${acc}${explicit ? ' \\times ' : ''}${factor.latex}`;
        }, '');
      }
      if (op === '/') return `\\frac{${print(left)}}{${print(right)}}`;
      if (op === '^') {
        const atom = (left.type === 'num' && left.value >= 0) || left.type === 'var' || left.type === 'const'
          || (left.type === 'terms' && left.terms.length === 1 && /^[a-z0-9]+$/.test(print(left)));
        const base = atom ? print(left) : paren(print(left));

        return `${base}^{${print(right)}}`;
      }

      return '';
    }
    default:
      return '';
  }
}

/** Le LaTeX d'un AST, parenthèses rétablies là où la structure les exige. */
export function astToLatex(ast) {
  return print(ast);
}
