/**
 * La SIMPLIFICATION d'une expression, PAS À PAS — logique pure, sans React.
 *
 * Une expression polynomiale (plusieurs lettres, coefficients rationnels
 * exacts) est ramenée à sa forme réduite comme au tableau :
 *
 *     original           (x + 2)(x - 3)
 *     produits posés     x × x + x × (−3) + 2 × x + 2 × (−3)     التوزيع المضاعف
 *     produits calculés  x² − 3x + 2x − 6                         نحسب كل جداء
 *     regroupement       x² + (−3x + 2x) − 6                      نجمع الحدود المتشابهة
 *     résultat           x² − x − 6
 *
 * Le moteur travaille sur l'AST de l'analyseur UNIQUE (expressionParser.js),
 * jamais sur la chaîne. Il développe par PASSES : chaque passe développe les
 * nœuds les plus internes (un produit dont les facteurs sont déjà plats, une
 * puissance, un « − ( … ) », une division par une constante) et écrit la
 * ligne ; on recommence jusqu'à ce que tout soit plat. `2(x + 1)^2` montre
 * donc d'abord l'identité remarquable, PUIS la distribution par 2.
 *
 * Un nœud développé devient `{ type: 'terms', terms }` : une somme de termes
 * `{ coef, mono, shown? }`, où `shown` garde l'écriture « produit posé »
 * (`2 × x`) le temps d'une ligne. astLatex.js sait l'écrire.
 *
 * Une fraction algébrique n'est acceptée qu'À LA RACINE et à une lettre :
 * `(x^2 - 1)/(x - 1)` se simplifie par le PGCD du numérateur et du
 * dénominateur, avec la condition `x ≠ 1`. Ailleurs, refus motivé.
 *
 * Résultat : { ok: true, kind: 'polynomial' | 'fraction', steps, … } ou
 * { ok: false, error: { code, symbol? } }. Des CODES, jamais d'exception.
 */

import * as R from './rational.js';
import { parseExpression } from '../functionGrapher/expressionParser.js';
import { astToLatex } from './astLatex.js';
import {
  AlgebraError, rangeCode, MAX_DEGREE, MAX_TERMS,
  makePoly, mergeMono, monoDegree, monoKey, compareMonos, termBody, joinPieces, termPiece, polyLatex,
  isConstantPoly, polyVariables, toCoefficients, fromCoefficients, divideCoefficients,
  gcdCoefficients, trimCoefficients, contentOf, coefficientsLatex, divisors, evaluateCoefficients,
} from './polynomial.js';

/** Les lettres qu'un élève emploie dans une expression de quatrième. `e` reste la constante. */
export const EXPRESSION_VARIABLES = Object.freeze(['a', 'b', 'c', 'k', 'm', 'n', 'p', 't', 'x', 'y', 'z']);

/** Une couleur par FAMILLE de termes semblables (vert, orange, bleu, violet…). */
const FAMILY_COLORS = Object.freeze(['#008443', '#F36D21', '#2563eb', '#7c3aed', '#be123c', '#0f766e', '#b45309']);

const MAX_SOURCE_LENGTH = 200;
const MAX_PASSES = 10;

// ── Lecture ───────────────────────────────────────────────────────────────

/** Une saisie → un AST, ou un refus motivé (codes de l'analyseur, plus les nôtres). */
export function parsePolynomialSource(source, variables = EXPRESSION_VARIABLES) {
  const text = String(source ?? '').trim();
  if (!text) return { ok: false, error: { code: 'empty' } };
  if (text.length > MAX_SOURCE_LENGTH) return { ok: false, error: { code: 'tooLong' } };
  if (/[=<>≤≥]|\\le|\\ge/.test(text)) return { ok: false, error: { code: 'hasRelation' } };
  const parsed = parseExpression(text, { variables });
  if (!parsed.ok) return { ok: false, error: { code: parsed.error.code, symbol: parsed.error.symbol } };

  return { ok: true, ast: parsed.ast };
}

// ── Termes ────────────────────────────────────────────────────────────────

function term(coef, mono = {}) { return { coef, mono }; }

function negateTerm(t) {
  return {
    coef: R.negate(t.coef),
    mono: t.mono,
    ...(t.shown ? { shown: { ...t.shown, negative: !t.shown.negative } } : {}),
  };
}

function multiplyTerms(a, b) {
  const mono = mergeMono(a.mono, b.mono);
  if (monoDegree(mono) > MAX_DEGREE) throw new AlgebraError('degreeTooHigh');

  return term(R.multiply(a.coef, b.coef), mono);
}

function powerTerm(t, exponent) {
  let acc = term(R.ONE);
  for (let i = 0; i < exponent; i += 1) acc = multiplyTerms(acc, t);

  return acc;
}

function isConstantTerm(t) { return monoDegree(t.mono) === 0; }

/** La valeur d'une somme de termes TOUS constants (`3 - 1`), ou null. */
function constantOf(terms) {
  if (!terms.every(isConstantTerm)) return null;

  return terms.reduce((acc, t) => R.add(acc, t.coef), R.ZERO);
}

/** Un exposant valable : un entier naturel ≤ MAX_DEGREE écrit en toutes lettres. */
function readExponent(node) {
  const terms = flatTerms(node);
  const value = terms ? constantOf(terms) : null;
  if (!value) throw new AlgebraError('badExponent');
  if (!R.isInteger(value) || value.n < 0) throw new AlgebraError('badExponent');
  if (value.n > MAX_DEGREE) throw new AlgebraError('degreeTooHigh');

  return value.n;
}

/**
 * Les termes d'un nœud DÉJÀ PLAT (aucun développement en attente), ou null.
 * Un monôme `3x·2x`, `x/3`, `(2x)^2` est plat ; `2(x + 1)` ne l'est pas.
 */
function flatTerms(node) {
  if (!node || typeof node !== 'object') throw new AlgebraError('unsupported');
  switch (node.type) {
    case 'num': return R.isZero(R.fromNumber(node.value)) ? [term(R.ZERO)] : [term(R.fromNumber(node.value))];
    case 'var': return [term(R.ONE, { [node.name]: 1 })];
    case 'terms': return node.terms;
    case 'const': throw new AlgebraError('irrational', node.name === 'pi' ? 'π' : 'e');
    case 'call': throw new AlgebraError('function', node.name);
    case 'neg': {
      const inner = flatTerms(node.arg);
      if (!inner || inner.length > 1) return null;

      return inner.map(negateTerm);
    }
    case 'bin': {
      const { op } = node;
      if (op === '+' || op === '-') {
        const left = flatTerms(node.left);
        const right = flatTerms(node.right);
        if (!left || !right) return null;
        if (op === '+') return [...left, ...right];
        if (right.length > 1) return null;

        return [...left, ...right.map(negateTerm)];
      }
      if (op === '*') {
        const left = flatTerms(node.left);
        const right = flatTerms(node.right);
        if (!left || !right || left.length !== 1 || right.length !== 1) return null;

        return [multiplyTerms(left[0], right[0])];
      }
      if (op === '/') {
        const denominator = flatTerms(node.right);
        const numerator = flatTerms(node.left);
        const k = denominator ? constantOf(denominator) : null;
        if (!k) return null;
        if (R.isZero(k)) throw new AlgebraError('divideByZero');
        if (!numerator || numerator.length !== 1) return null;

        return [term(R.divide(numerator[0].coef, k), numerator[0].mono)];
      }
      if (op === '^') {
        const exponent = readExponent(node.right);
        const base = flatTerms(node.left);
        if (!base || base.length !== 1) return null;

        return [powerTerm(base[0], exponent)];
      }
      throw new AlgebraError('unsupported');
    }
    default:
      throw new AlgebraError('unsupported');
  }
}

// ── L'écriture « produit posé » ───────────────────────────────────────────

function pieceBody(t) { return termBody(t.coef, t.mono); }

/** Un facteur en position ≥ 2 d'un produit posé : `(-3)` entre parenthèses. */
function laterFactor(t) {
  const body = pieceBody(t);

  return R.isNegative(t.coef) ? `\\left(-${body}\\right)` : body;
}

/** `a × b` écrit comme le manuel ; le signe du produit posé est celui du premier facteur. */
function productShown(a, b) {
  return { negative: R.isNegative(a.coef), body: `${pieceBody(a)} \\times ${laterFactor(b)}` };
}

/** Un corps qu'on élève au carré : `x^{2}`, `3^{2}`, mais `(2x)^{2}`, `(\frac{1}{2})^{2}`. */
function squared(t) {
  const body = pieceBody(t);
  const exponents = Object.values(t.mono);
  const atom = (R.equals(R.isNegative(t.coef) ? R.negate(t.coef) : t.coef, R.ONE) && exponents.length === 1 && exponents[0] === 1)
    || (exponents.length === 0 && R.isInteger(t.coef));

  return atom ? `${body}^{2}` : `\\left(${body}\\right)^{2}`;
}

function sameMono(a, b) { return monoKey(a.mono) === monoKey(b.mono); }

// ── Une passe de développement ────────────────────────────────────────────

function termsNode(terms) { return { type: 'terms', terms }; }

/**
 * Développe les nœuds les plus internes. Rend `{ node, changed }` ;
 * `flags` recueille ce qui s'est passé (les règles à citer sur la ligne).
 */
function rewrite(node, flags, isRoot = false) {
  if (flatTerms(node)) return { node, changed: false };

  switch (node.type) {
    case 'neg': {
      const inner = flatTerms(node.arg);
      if (inner) {
        flags.add('minusBracket');

        return { node: termsNode(inner.map(negateTerm)), changed: true };
      }
      const sub = rewrite(node.arg, flags);

      return { node: { ...node, arg: sub.node }, changed: sub.changed };
    }

    case 'bin': {
      const { op } = node;

      if (op === '-') {
        const right = flatTerms(node.right);
        if (right && right.length > 1) {
          flags.add('minusBracket');
          const flatLeft = flatTerms(node.left);
          // `2a − b − (a + 3b)` devient `2a − b − a − 3b` : une seule somme, sans parenthèses.
          if (flatLeft) return { node: termsNode([...flatLeft, ...right.map(negateTerm)]), changed: true };
          const left = rewrite(node.left, flags);

          return { node: { type: 'bin', op: '+', left: left.node, right: termsNode(right.map(negateTerm)) }, changed: true };
        }
      }

      if (op === '*') {
        const left = flatTerms(node.left);
        const right = flatTerms(node.right);
        if (left && right) {
          const double = left.length > 1 && right.length > 1;
          flags.add(double ? 'doubleDistributive' : 'distributive');
          if (double && left.length === 2 && right.length === 2 && sameMono(left[0], right[0]) && sameMono(left[1], right[1])) {
            if (R.equals(left[0].coef, right[0].coef) && R.equals(left[1].coef, R.negate(right[1].coef))) flags.add('diffSquares');
          }
          if (left.length * right.length > MAX_TERMS) throw new AlgebraError('tooManyTerms');
          const terms = [];
          for (const a of left) {
            for (const b of right) terms.push({ ...multiplyTerms(a, b), shown: productShown(a, b) });
          }

          return { node: termsNode(terms), changed: true };
        }
      }

      if (op === '/') {
        const denominator = flatTerms(node.right);
        if (denominator) {
          const k = constantOf(denominator);
          if (!k) {
            // Une fraction algébrique ailleurs qu'à la racine : hors du V2.
            throw new AlgebraError(isRoot ? 'algebraicFraction' : 'fractionNested');
          }
          if (R.isZero(k)) throw new AlgebraError('divideByZero');
          const numerator = flatTerms(node.left);
          if (numerator) {
            flags.add('divideConstant');
            const kLatex = R.toLatex(k);

            return {
              node: termsNode(numerator.map((t) => ({
                coef: R.divide(t.coef, k),
                mono: t.mono,
                shown: { negative: R.isNegative(t.coef), body: `\\frac{${pieceBody(t)}}{${kLatex}}` },
              }))),
              changed: true,
            };
          }
        }
      }

      if (op === '^') {
        const exponent = readExponent(node.right);
        const base = flatTerms(node.left);
        if (base) {
          if (exponent === 0) return { node: termsNode([term(R.ONE)]), changed: true };
          if (exponent === 1) return { node: termsNode(base), changed: true };
          if (exponent === 2 && base.length === 2) {
            const [a, b] = base;
            const minus = R.sign(a.coef) * R.sign(b.coef) < 0;
            flags.add(minus ? 'squareDiff' : 'squareSum');
            const abs = (t) => ({ ...t, coef: R.isNegative(t.coef) ? R.negate(t.coef) : t.coef });
            const middle = multiplyTerms(multiplyTerms(term(R.makeRational(2)), a), b);

            return {
              node: termsNode([
                { ...multiplyTerms(a, a), shown: { negative: false, body: squared(a) } },
                { ...middle, shown: { negative: minus, body: `2 \\times ${pieceBody(abs(a))} \\times ${pieceBody(abs(b))}` } },
                { ...multiplyTerms(b, b), shown: { negative: false, body: squared(abs(b)) } },
              ]),
              changed: true,
            };
          }
          // (a + b)^3, (a + b + c)^2 … : la puissance s'écrit comme un produit, puis on distribue.
          flags.add('power');
          let product = termsNode(base);
          for (let i = 1; i < exponent; i += 1) product = { type: 'bin', op: '*', left: product, right: termsNode(base) };

          return { node: product, changed: true };
        }
      }

      const left = rewrite(node.left, flags);
      const right = op === '^' ? { node: node.right, changed: false } : rewrite(node.right, flags);

      return { node: { ...node, left: left.node, right: right.node }, changed: left.changed || right.changed };
    }

    default:
      return { node, changed: false };
  }
}

/** Oublie l'écriture « produit posé » : la ligne suivante montre les produits CALCULÉS. */
function computeShown(node) {
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'terms') return termsNode(node.terms.map(({ coef, mono }) => ({ coef, mono })));
  if (node.type === 'neg') return { ...node, arg: computeShown(node.arg) };
  if (node.type === 'bin') return { ...node, left: computeShown(node.left), right: computeShown(node.right) };

  return node;
}

function hasShown(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'terms') return node.terms.some((t) => t.shown);
  if (node.type === 'neg') return hasShown(node.arg);
  if (node.type === 'bin') return hasShown(node.left) || hasShown(node.right);

  return false;
}

const RULE_ORDER = ['squareSum', 'squareDiff', 'diffSquares', 'doubleDistributive', 'distributive', 'power', 'divideConstant', 'minusBracket'];

/**
 * Développe complètement un AST, en rendant les lignes intermédiaires.
 * @returns {{lines: Array<{kind: string, latex: string, rules: string[]}>, terms: Array, flags: Set<string>}}
 */
export function expandWithSteps(ast) {
  const lines = [];
  const allFlags = new Set();
  let node = ast;

  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const flags = new Set();
    const result = rewrite(node, flags, true);
    if (!result.changed) break;
    flags.forEach((flag) => allFlags.add(flag));
    const rules = RULE_ORDER.filter((rule) => flags.has(rule));
    node = result.node;
    if (hasShown(node)) {
      lines.push({ kind: 'expand', latex: astToLatex(node), rules });
      node = computeShown(node);
      lines.push({ kind: 'compute', latex: astToLatex(node), rules: ['computeProducts'] });
    } else {
      lines.push({ kind: 'expand', latex: astToLatex(node), rules });
    }
  }

  const terms = flatTerms(node);
  if (!terms) throw new AlgebraError('tooComplex');

  return { lines, terms: terms.map(({ coef, mono }) => ({ coef, mono })), flags: allFlags };
}

/** Le polynôme d'un AST, sans les lignes. */
export function astToPoly(ast) {
  const { terms } = expandWithSteps(ast);

  return makePoly(terms);
}

// ── Regroupement et résultat ──────────────────────────────────────────────

/**
 * Le regroupement des termes semblables, famille par famille, dans l'ordre
 * du résultat. Rend null quand aucune famille n'a deux membres.
 */
function groupLine(terms, colorOf) {
  const families = new Map();
  for (const t of terms) {
    const key = monoKey(t.mono);
    if (!families.has(key)) families.set(key, []);
    families.get(key).push(t);
  }
  if (![...families.values()].some((members) => members.length > 1)) return null;

  // L'ordre du manuel (celui du résultat), les familles qui s'annulent comprises.
  const monos = new Map(terms.map((t) => [monoKey(t.mono), t.mono]));
  const order = [...families.keys()].sort((a, b) => compareMonos(monos.get(a), monos.get(b)));

  const pieces = order.filter((key) => families.has(key)).map((key) => {
    const members = families.get(key);
    const color = colorOf(key);
    if (members.length === 1) return termPiece(members[0], color);

    return { negative: false, body: `\\left(${joinPieces(members.map((m) => termPiece(m)))}\\right)`, color };
  });

  return joinPieces(pieces);
}

/**
 * Le regroupement en DONNÉES (pour le tableau pas à pas) : les termes plats
 * dans l'ordre de la ligne, et chaque famille — ses membres, sa couleur, sa
 * somme. `termLatex` est signé hors tête (`+ 2x`, `- x`).
 */
function groupData(terms, poly, colorOf) {
  const order = [];
  const members = new Map();
  terms.forEach((t, index) => {
    const key = monoKey(t.mono);
    if (!members.has(key)) { members.set(key, []); order.push(key); }
    members.get(key).push(index);
  });
  const monos = new Map(terms.map((t) => [monoKey(t.mono), t.mono]));
  order.sort((a, b) => compareMonos(monos.get(a), monos.get(b)));
  const signed = (t, first) => (first ? joinPieces([termPiece(t)]) : `${R.isNegative(t.coef) ? '-' : '+'} ${termBody(t.coef, t.mono)}`);
  const familyOf = new Map(order.map((key, index) => [key, index]));

  return {
    terms: terms.map((t, index) => ({ latex: signed(t, index === 0), family: familyOf.get(monoKey(t.mono)) })),
    families: order.map((key) => {
      const list = members.get(key);
      const sum = poly.find((t) => monoKey(t.mono) === key);

      return {
        key,
        color: colorOf(key),
        members: list,
        latex: list.length > 1 ? `\\left(${joinPieces(list.map((i) => termPiece(terms[i])))}\\right)` : joinPieces([termPiece(terms[list[0]])]),
        sum: sum ? joinPieces([termPiece(sum)]) : '0',
        negative: list.length === 1 && R.isNegative(terms[list[0]].coef),
      };
    }),
  };
}

/**
 * La simplification complète d'une saisie.
 *
 * @param {string} source
 * @param {{variables?: string[]}} [options]
 */
export function simplifyExpression(source, options = {}) {
  const parsed = parsePolynomialSource(source, options.variables ?? EXPRESSION_VARIABLES);
  if (!parsed.ok) return parsed;

  try {
    const { ast } = parsed;
    if (ast.type === 'bin' && ast.op === '/') {
      const denominator = expandWithSteps(ast.right);
      if (!isConstantPoly(makePoly(denominator.terms))) return simplifyFraction(ast);
    }

    const original = astToLatex(ast);
    const { lines, terms, flags } = expandWithSteps(ast);
    const poly = makePoly(terms);
    const keys = [...new Set([...poly.map((t) => monoKey(t.mono)), ...terms.map((t) => monoKey(t.mono))])];
    const colorOf = (key) => FAMILY_COLORS[keys.indexOf(key) % FAMILY_COLORS.length];

    const steps = [{ kind: 'original', latex: original, rules: [] }, ...lines];
    const grouped = groupLine(terms, colorOf);
    if (grouped) steps.push({ kind: 'group', latex: grouped, rules: ['groupLikeTerms'], data: groupData(terms, poly, colorOf) });

    const resultLatex = polyLatex(poly);
    const last = steps[steps.length - 1].latex;
    if (grouped) {
      steps.push({ kind: 'result', latex: polyLatex(poly, colorOf), rules: [poly.length === 0 ? 'allCancel' : 'result'] });
    } else if (last !== resultLatex) {
      // Rien à regrouper : seul l'ordre (ou l'écriture d'un monôme) change.
      steps.push({ kind: 'result', latex: resultLatex, rules: ['order'] });
    }

    return {
      ok: true,
      kind: 'polynomial',
      steps,
      poly,
      resultLatex,
      flags: [...flags],
      grouped: Boolean(grouped),
      changed: steps.length > 1,
    };
  } catch (error) {
    const code = rangeCode(error);
    if (code) return { ok: false, error: { code, symbol: error.detail } };
    throw error;
  }
}

// ── Fractions algébriques (à la racine, une lettre) ───────────────────────

/** Les racines RATIONNELLES d'un polynôme à une lettre (théorème des racines rationnelles). */
export function rationalRoots(coefs) {
  const trimmed = trimCoefficients(coefs);
  if (trimmed.length <= 1) return [];
  const content = contentOf(trimmed);
  const integers = trimmed.map((c) => R.divide(c, content));
  // Une racine nulle se lit sur le coefficient constant.
  const roots = [];
  let work = integers;
  if (R.isZero(work[0])) {
    roots.push(R.ZERO);
    while (work.length > 1 && R.isZero(work[0])) work = work.slice(1);
  }
  if (work.length <= 1) return roots;
  const lastN = work[0].n;
  const leadN = work[work.length - 1].n;
  const ps = divisors(lastN);
  const qs = divisors(leadN);
  if (ps.length === 0 || qs.length === 0 || ps.length * qs.length > 4000) return roots;
  const seen = new Set();
  for (const p of ps) {
    for (const q of qs) {
      for (const candidate of [R.makeRational(p, q), R.makeRational(-p, q)]) {
        const key = `${candidate.n}/${candidate.d}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (R.isZero(evaluateCoefficients(work, candidate))) roots.push(candidate);
      }
    }
  }

  return roots.sort((a, b) => R.toNumber(a) - R.toNumber(b));
}

/** Un facteur à coefficients ENTIERS premiers entre eux, dominant positif. */
function primitive(coefs) {
  const content = contentOf(coefs);

  return { content, coefs: coefs.map((c) => R.divide(c, content)) };
}

function factorLatex(coefs, variable) {
  const latex = coefficientsLatex(coefs, variable);

  return trimCoefficients(coefs).length > 1 && /[+-]/.test(latex.slice(1)) ? `\\left(${latex}\\right)` : latex;
}

function simplifyFraction(ast) {
  const original = astToLatex(ast);
  const numerator = makePoly(expandWithSteps(ast.left).terms);
  const denominator = makePoly(expandWithSteps(ast.right).terms);
  const variables = [...new Set([...polyVariables(numerator), ...polyVariables(denominator)])];
  if (variables.length !== 1) return { ok: false, error: { code: 'fractionMultivariate' } };
  const [variable] = variables;
  const n = toCoefficients(numerator, variable) ?? [R.ZERO];
  const d = toCoefficients(denominator, variable);

  const steps = [{ kind: 'original', latex: original, rules: [] }];
  const expanded = `\\frac{${polyLatex(numerator)}}{${polyLatex(denominator)}}`;
  if (expanded !== original) steps.push({ kind: 'expand', latex: expanded, rules: ['expandParts'] });

  const restriction = restrictionOf(d, variable);
  const gcd = trimCoefficients(gcdCoefficients(n, d));

  if (gcd.length <= 1) {
    return {
      ok: true, kind: 'fraction', irreducible: true, steps, restriction, resultLatex: expanded, variable,
    };
  }

  const common = primitive(gcd).coefs;
  const nq = divideCoefficients(n, common).quotient;
  const dq = divideCoefficients(d, common).quotient;
  const commonLatex = `\\textcolor{#F36D21}{\\left(${coefficientsLatex(common, variable)}\\right)}`;
  const withFactor = (rest) => {
    const r = trimCoefficients(rest);
    if (r.length === 1 && R.equals(r[0], R.ONE)) return commonLatex;
    if (r.length === 1) return `${R.toLatex(r[0])}${commonLatex}`;

    return `${commonLatex}${factorLatex(r, variable)}`;
  };
  steps.push({ kind: 'factor', latex: `\\frac{${withFactor(nq)}}{${withFactor(dq)}}`, rules: ['commonFactorFraction'], params: { factor: coefficientsLatex(common, variable) } });

  const dTrim = trimCoefficients(dq);
  let resultLatex;
  if (dTrim.length === 1) {
    const poly = fromCoefficients(nq.map((c) => R.divide(c, dTrim[0])), variable);
    resultLatex = polyLatex(poly);
  } else {
    resultLatex = `\\frac{${coefficientsLatex(nq, variable)}}{${coefficientsLatex(dq, variable)}}`;
  }
  steps.push({ kind: 'result', latex: resultLatex, rules: ['cancel'] });

  return {
    ok: true, kind: 'fraction', irreducible: false, steps, restriction, resultLatex, variable,
  };
}

/** Les valeurs interdites : les racines du dénominateur d'origine. */
function restrictionOf(denominator, variable) {
  const roots = rationalRoots(denominator);
  const degree = trimCoefficients(denominator).length - 1;
  const latex = roots.map((root) => `${variable} \\neq ${R.toLatex(root)}`).join(' \\;;\\; ');
  // Toutes les racines sont rationnelles quand leur nombre atteint le degré
  // (sans multiplicité, un reste peut subsister : on le dit alors en général).
  let rest = trimCoefficients(denominator);
  for (const root of roots) {
    for (let guard = 0; guard < MAX_DEGREE; guard += 1) {
      const { quotient, remainder } = divideCoefficients(rest, [R.negate(root), R.ONE]);
      if (!remainder.every((c) => R.isZero(c))) break;
      rest = quotient;
    }
  }

  return { latex: latex || null, complete: trimCoefficients(rest).length === 1, degree };
}

