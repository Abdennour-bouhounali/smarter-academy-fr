/**
 * L'ÉVALUATEUR : un AST (expressionParser.js) → une fonction JavaScript
 * `x ↦ f(x)`, compilée une fois, appelée des milliers de fois par tracé.
 *
 * Toute valeur hors du domaine est un nombre NON FINI (NaN ou ±Infinity),
 * jamais une exception : `sqrt(-1)`, `ln(0)`, `1/0`. C'est l'échantillonneur
 * (functionSampler.js) qui en fait une coupure de la courbe.
 *
 * `scope` est réservé aux paramètres de demain (`ax + b` avec un curseur
 * pour a) : la fonction compilée les lit dans `scope` à chaque appel, sans
 * recompilation. Aucun paramètre n'est encore exposé dans l'interface.
 */

import { parseExpression } from './expressionParser.js';

const CONSTANT_VALUES = { pi: Math.PI, e: Math.E };

/** La racine n-ième, prolongée aux négatifs quand n est impair (∛−8 = −2). */
function nthRoot(degree, value) {
  if (!Number.isFinite(degree) || degree === 0) return NaN;
  if (value < 0) {
    return Number.isInteger(degree) && Math.abs(degree) % 2 === 1 ? -Math.pow(-value, 1 / degree) : NaN;
  }

  return Math.pow(value, 1 / degree);
}

const FUNCTION_IMPLEMENTATIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
};

/**
 * @param {object} ast
 * @returns {(x: number, scope?: Record<string, number>) => number}
 */
export function compileExpression(ast) {
  switch (ast.type) {
    case 'num': {
      const { value } = ast;

      return () => value;
    }
    case 'var': {
      const { name } = ast;
      if (name === 'x') return (x) => x;

      return (_x, scope) => {
        const value = scope?.[name];

        return typeof value === 'number' ? value : NaN;
      };
    }
    case 'const': {
      const value = CONSTANT_VALUES[ast.name];

      return () => value;
    }
    case 'neg': {
      const arg = compileExpression(ast.arg);

      return (x, scope) => -arg(x, scope);
    }
    case 'bin': {
      const left = compileExpression(ast.left);
      const right = compileExpression(ast.right);
      switch (ast.op) {
        case '+': return (x, scope) => left(x, scope) + right(x, scope);
        case '-': return (x, scope) => left(x, scope) - right(x, scope);
        case '*': return (x, scope) => left(x, scope) * right(x, scope);
        case '/': return (x, scope) => {
          const denominator = right(x, scope);

          return denominator === 0 ? NaN : left(x, scope) / denominator;
        };
        case '^': return (x, scope) => Math.pow(left(x, scope), right(x, scope));
        default: throw new Error(`[grapher] opérateur inconnu « ${ast.op} »`);
      }
    }
    case 'call': {
      if (ast.name === 'root') {
        const degree = compileExpression(ast.args[0]);
        const arg = compileExpression(ast.args[1]);

        return (x, scope) => nthRoot(degree(x, scope), arg(x, scope));
      }
      const implementation = FUNCTION_IMPLEMENTATIONS[ast.name];
      if (!implementation) throw new Error(`[grapher] fonction inconnue « ${ast.name} »`);
      const arg = compileExpression(ast.args[0]);

      return (x, scope) => implementation(arg(x, scope));
    }
    default:
      throw new Error(`[grapher] nœud inconnu « ${ast.type} »`);
  }
}

/**
 * Analyse + compilation en un geste. Le résultat garde l'erreur d'analyse
 * pour l'interface ; `fn` n'existe que si l'expression est valide.
 *
 * @returns {{ok: true, fn: (x: number) => number} | {ok: false, error: object}}
 */
export function compileSource(source, options) {
  const parsed = parseExpression(source, options);
  if (!parsed.ok) return parsed;

  return { ok: true, ast: parsed.ast, fn: compileExpression(parsed.ast) };
}
