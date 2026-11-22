/**
 * L'AST → une expression LISIBLE, en notation du manuel.
 *
 * §2 du cahier des charges : la notation mathématique reste LTR et correcte,
 * même dans une interface RTL. Ce module ne produit donc que des caractères
 * mathématiques (chiffres latins, `x`, opérateurs), jamais un mot arabe :
 * c'est l'interface qui l'enferme dans un conteneur `dir="ltr"`.
 *
 * Deux sorties, une seule traversée :
 *   - `printExpression` : du texte simple (`2x`, `-x^2 + 3`) pour une
 *     étiquette, un `aria-label`, un résumé « أعمالي », un test ;
 *   - `printLatex`      : du LaTeX (`\frac{1}{x^{2}}`) pour MathLive, qui
 *     rend déjà les expressions partout ailleurs dans le مختبر.
 *
 * Les PARENTHÈSES sont posées par PRIORITÉ, jamais « au cas où » : on
 * n'écrit pas `(2)·(x)`. Un nœud est parenthésé quand sa priorité est plus
 * basse que celle attendue à sa place — et pour un opérateur non associatif
 * (`−`, `/`, `^`), quand il est à DROITE et de priorité égale : `a − (b − c)`
 * garde ses parenthèses, `a − b + c` n'en prend pas.
 */

const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
/** La négation unaire se lie plus fort qu'une somme, moins qu'un produit. */
const NEG_PRECEDENCE = 1.5;

const CONSTANT_TEXT = { pi: 'π', e: 'e' };
const CONSTANT_LATEX = { pi: '\\pi', e: 'e' };

/** Un nombre, virgule décimale comprise — jamais 0.30000000000000004. */
function numberText(value) {
  if (!Number.isFinite(value)) return 'NaN';
  const rounded = Number(value.toPrecision(12));

  return String(rounded);
}

function precedenceOf(node) {
  switch (node.type) {
    case 'bin': return PRECEDENCE[node.op] ?? 0;
    case 'neg': return NEG_PRECEDENCE;
    default: return 10;
  }
}

/**
 * @param {object} ast
 * @param {{latex?: boolean}} [options]
 * @returns {string}
 */
export function printExpression(ast, options = {}) {
  const latex = options.latex === true;

  return print(ast, 0, false, latex);
}

/** Le même arbre, en LaTeX — ce que MathLive et KaTeX attendent. */
export function printLatex(ast) {
  return print(ast, 0, false, true);
}

/**
 * @param {object} node
 * @param {number} parentPrecedence  la priorité attendue à cette place
 * @param {boolean} isRight          ce nœud est-il l'opérande DROIT ?
 * @param {boolean} latex
 */
function print(node, parentPrecedence, isRight, latex) {
  if (!node || typeof node !== 'object') return '';
  const text = render(node, latex);
  const precedence = precedenceOf(node);
  // `\frac{}{}` et `\sqrt{}` portent déjà leurs accolades : les parenthéser
  // écrirait `(\frac{1}{2})`, ce qu'aucun manuel n'écrit.
  const selfDelimited = latex && node.type === 'bin' && node.op === '/';
  const needs = !selfDelimited && (precedence < parentPrecedence
    || (isRight && precedence === parentPrecedence && node.type === 'bin' && node.op !== '+' && node.op !== '*'));

  if (!needs) return text;

  return latex ? `\\left(${text}\\right)` : `(${text})`;
}

function render(node, latex) {
  switch (node.type) {
    case 'num':
      return numberText(node.value);

    case 'var':
      return node.name;

    case 'const':
      return (latex ? CONSTANT_LATEX : CONSTANT_TEXT)[node.name] ?? node.name;

    case 'neg':
      return `-${print(node.arg, NEG_PRECEDENCE, false, latex)}`;

    case 'bin':
      return renderBinary(node, latex);

    case 'call':
      return renderCall(node, latex);

    default:
      return '';
  }
}

function renderBinary(node, latex) {
  const { op, left, right } = node;
  const precedence = PRECEDENCE[op] ?? 0;

  if (op === '/' && latex) {
    return `\\frac{${print(left, 0, false, true)}}{${print(right, 0, false, true)}}`;
  }

  const leftText = print(left, precedence, false, latex);
  const rightText = print(right, precedence, true, latex);

  if (op === '^') {
    return latex ? `${leftText}^{${print(right, 0, false, true)}}` : `${leftText}^${rightText}`;
  }

  if (op === '*') {
    /**
     * La multiplication IMPLICITE, comme au tableau : `2x`, `2\sin(x)`,
     * `x(x+1)`.
     *
     * Mais JAMAIS entre deux écritures dont la juxtaposition se relirait
     * comme un seul nombre. La QA l'a attrapé sur `(3x⁴)′`, imprimé `34x^3`
     * au lieu de `12x^3` — un élève y lit trente-quatre. Le vrai correctif
     * est en amont (`mul` replie les constantes), mais l'imprimeur garde sa
     * propre garde : dès que le texte de gauche FINIT par un chiffre et que
     * celui de droite COMMENCE par un chiffre, le point revient.
     */
    const endsWithDigit = /[0-9]$/.test(leftText);
    const startsWithDigit = /^[0-9]/.test(rightText);
    // Un COEFFICIENT au milieu se lit mal aussi : `x2x` (la dérivée de
    // cos(x²) par la chaîne) devient `x·2x`. Un nombre à droite d'autre
    // chose qu'un nombre garde donc son point.
    const numericRight = right.type === 'num' || (right.type === 'bin' && right.op === '*' && right.left.type === 'num');
    if ((!endsWithDigit || !startsWithDigit) && !numericRight) return `${leftText}${rightText}`;

    return latex ? `${leftText}\\cdot ${rightText}` : `${leftText}·${rightText}`;
  }

  return `${leftText} ${op === '-' ? '-' : op} ${rightText}`;
}

function renderCall(node, latex) {
  const [arg] = node.args;

  if (node.name === 'root') {
    const [degree, value] = node.args;

    return latex
      ? `\\sqrt[${print(degree, 0, false, true)}]{${print(value, 0, false, true)}}`
      : `root(${print(degree, 0, false, false)}, ${print(value, 0, false, false)})`;
  }

  if (node.name === 'abs') {
    const inner = print(arg, 0, false, latex);

    return latex ? `\\left|${inner}\\right|` : `|${inner}|`;
  }

  if (node.name === 'sqrt') {
    const inner = print(arg, 0, false, latex);

    return latex ? `\\sqrt{${inner}}` : `sqrt(${inner})`;
  }

  const inner = print(arg, 0, false, latex);
  const name = latex ? `\\${node.name}` : node.name;

  return latex ? `${name}\\left(${inner}\\right)` : `${name}(${inner})`;
}
