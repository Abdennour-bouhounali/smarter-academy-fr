/**
 * La FORME LINÉAIRE du مختبر الجبر — logique pure, sans React.
 *
 * Tout ce que ce laboratoire sait manipuler s'écrit `a·x + b` avec a et b
 * rationnels. Ce module réduit l'AST de l'analyseur du grapheur
 * (functionGrapher/expressionParser.js — une seule grammaire pour toute la
 * plateforme, jamais deux) à ce couple, et REFUSE tout le reste :
 *
 *     2x + 3        → { a: 2,   b: 3 }
 *     5 − 2x        → { a: −2,  b: 5 }
 *     x/3           → { a: 1/3, b: 0 }
 *     3(x + 1)      → { a: 3,   b: 3 }
 *     x²            → refusé  (nonLinear)   — V1 ne résout pas le second degré
 *     x·x           → refusé  (nonLinear)
 *     1/x           → refusé  (nonLinear)   — x au dénominateur
 *     sin(x)        → refusé  (nonLinear)
 *
 * Un produit n'est linéaire que si l'un des facteurs est constant ; une
 * division que si le DIVISEUR l'est. C'est ce qui rend `3(x+1)` et `x/3`
 * acceptables et `x·x` et `3/x` impossibles, sans aucun calcul formel.
 *
 * Résultat : { ok: true, form } · { ok: false, error: { code, symbol? } }
 * avec code ∈ 'nonLinear' | 'divideByZero' | 'overflow' | 'unsupported'.
 * Des CODES, jamais des exceptions — comme l'analyseur du grapheur.
 */

import * as R from './rational.js';

/** `a·x + b`, a et b rationnels. a = 0 : l'expression est constante. */
export function makeLinear(a, b) {
  return { a, b };
}

export function isConstant(form) { return R.isZero(form.a); }

export function addForms(f, g) { return makeLinear(R.add(f.a, g.a), R.add(f.b, g.b)); }
export function subtractForms(f, g) { return makeLinear(R.subtract(f.a, g.a), R.subtract(f.b, g.b)); }
function negateForm(f) { return makeLinear(R.negate(f.a), R.negate(f.b)); }
export function scaleForm(f, k) { return makeLinear(R.multiply(f.a, k), R.multiply(f.b, k)); }

class LinearError extends Error {
  constructor(code, symbol) {
    super(code);
    this.code = code;
    this.symbol = symbol;
  }
}

const CONSTANTS = { pi: Math.PI, e: Math.E };

function reduce(node, variable) {
  if (!node || typeof node !== 'object') throw new LinearError('unsupported');

  switch (node.type) {
    case 'num':
      return makeLinear(R.ZERO, R.fromNumber(node.value));

    case 'var':
      // Une AUTRE lettre que l'inconnue (`a`, `y`) : la V1 ne sait pas la traiter.
      if (node.name !== variable) throw new LinearError('nonLinear', node.name);

      return makeLinear(R.ONE, R.ZERO);

    case 'const':
      // π et e sont des nombres, mais irrationnels : les garder exacts est
      // hors sujet ici, et les approcher fausserait « x = 1/3 ». Refusés.
      if (node.name in CONSTANTS) throw new LinearError('nonLinear', node.name);
      throw new LinearError('unsupported');

    case 'neg':
      return negateForm(reduce(node.arg, variable));

    case 'bin': {
      const left = reduce(node.left, variable);
      const right = reduce(node.right, variable);
      switch (node.op) {
        case '+': return addForms(left, right);
        case '-': return subtractForms(left, right);
        case '*': {
          if (isConstant(left)) return scaleForm(right, left.b);
          if (isConstant(right)) return scaleForm(left, right.b);
          // x·x : le degré monte, ce n'est plus une équation du premier degré.
          throw new LinearError('nonLinear', '·');
        }
        case '/': {
          // x au dénominateur : `3/x` n'est pas affine.
          if (!isConstant(right)) throw new LinearError('nonLinear', '/');
          if (R.isZero(right.b)) throw new LinearError('divideByZero');

          return scaleForm(left, R.divide(R.ONE, right.b));
        }
        case '^': {
          // Seules les puissances CONSTANTES d'un nombre restent linéaires
          // (2³ = 8) ; x² ne l'est pas.
          if (!isConstant(left) || !isConstant(right)) throw new LinearError('nonLinear', '^');
          if (!R.isInteger(right.b) || Math.abs(right.b.n) > 8) throw new LinearError('nonLinear', '^');
          const exponent = right.b.n;
          if (exponent < 0 && R.isZero(left.b)) throw new LinearError('divideByZero');
          let acc = R.ONE;
          for (let i = 0; i < Math.abs(exponent); i += 1) acc = R.multiply(acc, left.b);

          return makeLinear(R.ZERO, exponent < 0 ? R.divide(R.ONE, acc) : acc);
        }
        default:
          throw new LinearError('unsupported');
      }
    }

    case 'call':
      // sin, sqrt, abs… : hors du premier degré.
      throw new LinearError('nonLinear', node.name);

    default:
      throw new LinearError('unsupported');
  }
}

/**
 * Un AST (expressionParser) → `a·x + b`, ou un refus motivé.
 *
 * @param {object} ast
 * @param {string} [variable] l'inconnue, `x` par défaut
 * @returns {{ok: true, form: {a: object, b: object}} | {ok: false, error: {code: string, symbol?: string}}}
 */
export function toLinearForm(ast, variable = 'x') {
  try {
    return { ok: true, form: reduce(ast, variable) };
  } catch (error) {
    if (error instanceof LinearError) return { ok: false, error: { code: error.code, symbol: error.symbol } };
    if (error instanceof RangeError) return { ok: false, error: { code: error.message === 'divideByZero' ? 'divideByZero' : 'overflow' } };
    throw error;
  }
}

/**
 * Le LaTeX d'une forme, tel qu'un manuel l'écrit : `2x + 3`, `−x + 5`,
 * `\frac{1}{3}x`, `8` quand il ne reste qu'une constante. Jamais `1x`,
 * jamais `+ −3`, jamais `0x +`.
 */
export function formToLatex(form, variable = 'x') {
  const { a, b } = form;
  if (R.isZero(a)) return R.toLatex(b);

  let head;
  if (R.equals(a, R.ONE)) head = variable;
  else if (R.equals(a, { n: -1, d: 1 })) head = `-${variable}`;
  else if (a.d === 1) head = `${a.n}${variable}`;
  else head = `${R.toLatex(a)}${variable}`;

  if (R.isZero(b)) return head;
  const sign = R.isNegative(b) ? '-' : '+';

  return `${head} ${sign} ${R.toLatex(R.isNegative(b) ? R.negate(b) : b)}`;
}
