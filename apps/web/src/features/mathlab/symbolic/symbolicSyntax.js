/**
 * La TRADUCTION : notre écriture → celle de Nerdamer.
 *
 * L'élève écrit (ou MathLive produit) du LaTeX : `\frac{1}{x}`, `x^{2}`,
 * `\sin\left(x\right)`, `\left|x\right|`. Nerdamer, lui, lit une syntaxe
 * proche de l'ASCII : `1/x`, `x^2`, `sin(x)`, `abs(x)`.
 *
 * ── Pourquoi on ne bricole pas des `replace` ─────────────────────────────
 * On pourrait remplacer `\frac{a}{b}` par `(a)/(b)` avec une expression
 * régulière. Elle marcherait sur les cas simples et casserait sur les
 * fractions imbriquées — `\frac{\frac{1}{2}}{x}` — en produisant une
 * expression FAUSSE mais analysable, c'est-à-dire un résultat faux affiché
 * avec aplomb. C'est exactement ce que §35 interdit.
 *
 * On passe donc par l'ANALYSEUR déjà écrit et déjà testé
 * (`functionGrapher/expressionParser.js`) : il rend un AST, et on imprime cet
 * AST dans la syntaxe de Nerdamer. Une expression que notre analyseur refuse
 * n'atteint jamais le moteur symbolique — et une expression qu'il accepte est
 * traduite par construction, sans cas particulier.
 *
 * C'est la même discipline que `expressionPrinter.js`, qui imprime le même
 * AST pour l'élève : un seul arbre, trois sorties (texte, LaTeX, Nerdamer).
 */

import { parseExpression } from '../tools/functionGrapher/expressionParser.js';

/** Les variables que le moteur symbolique accepte de voir. */
const VARIABLES = ['x', 'a', 'b', 'c', 'n', 't'];

/**
 * Notre écriture → celle de Nerdamer, ou `null` si l'expression n'est pas
 * analysable (le moteur ne reçoit alors rien du tout).
 *
 * @param {string} source
 * @returns {string|null}
 */
export function toSymbolicSource(source) {
  const text = String(source ?? '').trim();
  if (!text) return null;

  const parsed = parseExpression(text, { variables: VARIABLES });
  if (!parsed.ok) return null;

  try {
    return printNerdamer(parsed.ast);
  } catch {
    return null;
  }
}

/**
 * L'AST → la syntaxe de Nerdamer.
 *
 * Tout est PARENTHÉSÉ sauf les feuilles : on n'essaie pas d'être élégant, on
 * essaie d'être juste. `(2)*((x)^(2))` et `2x^2` désignent la même chose, et
 * seule la première ne peut pas être mal lue.
 */
function printNerdamer(node) {
  switch (node.type) {
    case 'num':
      // Nerdamer lit le point décimal, jamais la virgule.
      return formatNumber(node.value);

    case 'var':
      return node.name;

    case 'const':
      // `e` est la constante d'Euler pour Nerdamer, `pi` aussi.
      return node.name === 'pi' ? 'pi' : 'e';

    case 'neg':
      return `(-(${printNerdamer(node.arg)}))`;

    case 'bin': {
      const left = printNerdamer(node.left);
      const right = printNerdamer(node.right);

      return `((${left})${node.op}(${right}))`;
    }

    case 'call':
      return printCall(node);

    default:
      throw new Error(`[symbolic] nœud inconnu « ${node.type} »`);
  }
}

function printCall(node) {
  const [first] = node.args;

  if (node.name === 'root') {
    const [degree, value] = node.args;

    // La racine n-ième : u^(1/n). Nerdamer n'a pas de `root(n, u)`.
    return `((${printNerdamer(value)})^(1/(${printNerdamer(degree)})))`;
  }

  const argument = printNerdamer(first);
  switch (node.name) {
    case 'ln':
      // Le logarithme NÉPÉRIEN de Nerdamer s'écrit `log`.
      return `log(${argument})`;
    case 'log':
      // Le logarithme DÉCIMAL : Nerdamer n'en a pas de primitive, on le pose.
      return `(log(${argument})/log(10))`;
    case 'abs':
      return `abs(${argument})`;
    case 'sqrt':
      return `sqrt(${argument})`;
    case 'exp':
      return `(e^(${argument}))`;
    case 'sin':
    case 'cos':
    case 'tan':
      return `${node.name}(${argument})`;
    default:
      throw new Error(`[symbolic] fonction inconnue « ${node.name} »`);
  }
}

/** Un nombre, sans notation exponentielle ni virgule — Nerdamer lit l'un mal, l'autre pas. */
function formatNumber(value) {
  if (!Number.isFinite(value)) throw new Error('[symbolic] nombre non fini');
  const rounded = Number(value.toPrecision(15));
  if (Number.isInteger(rounded)) return String(rounded);

  return rounded.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
}

