/**
 * LA DÉRIVATION PAS À PAS — logique pure, sur l'AST du grapheur.
 *
 * Exigence de la propriétaire (2026-09-30) : f′(x) ne s'affiche plus d'un
 * bloc. L'élève la voit se CONSTRUIRE comme au tableau : on reconnaît la
 * structure de f, on nomme la règle, on dérive chaque morceau, on assemble,
 * et SEULEMENT à la fin on lit la dérivée simplifiée — exactement celle que
 * l'inspecteur montrait jusqu'ici (`compileFunction(...).derivativeSource`).
 *
 * Aucune mathématique nouvelle : chaque état intermédiaire est calculé par
 * `differentiate` (symbolicDerivative.js) sur un SOUS-arbre, et imprimé par
 * `printLatex` (expressionPrinter.js). Le générateur ne fait que choisir QUELS
 * sous-arbres montrer, et dans quel ordre.
 *
 * ── La profondeur, volontairement bornée ─────────────────────────────────
 * On déplie la structure du HAUT de l'arbre, plus UN niveau de règle :
 *
 *   somme       f′ = (t₁)′ − (t₂)′ + …   →  un pas par terme (sa règle nommée)
 *               →  l'assemblage brut (`3x² − 3 + 0`)  →  le résultat simplifié
 *   produit / quotient / k·u / −u / uⁿ / aᵘ / g(u)
 *               →  on nomme u (et v)  →  u′ (et v′)  →  la règle, u et u′
 *                  substitués (non simplifiée)  →  le résultat simplifié
 *   élémentaire (xⁿ, sin x, eˣ, k, x)
 *               →  la règle appliquée  →  (xⁿ : n·xⁿ⁻¹)  →  le résultat
 *
 * Aller plus profond (dériver récursivement chaque u′ en pas) ferait d'une
 * dérivée de lycée une liste de vingt lignes : la règle se lit mieux quand
 * les sous-dérivées arrivent déjà simplifiées.
 *
 * ── Le contrat ───────────────────────────────────────────────────────────
 *   buildDerivativeSteps(source) → { ok: false, reason }                (pas de dérivée écrite)
 *                                → { ok: true, steps, derivativeSource } (le DERNIER pas est le résultat)
 *   un pas : { kind, textKey, params, latex, ruleKey?, formula?, tone?, source? }
 *
 * `textKey` et `ruleKey` sont des clés `tools.analysis.derivativeSteps.*` ;
 * le texte arabe ne contient JAMAIS de formule — la formule est dans `latex`
 * ou `formula`, que l'interface enferme dans un îlot LTR (KaTeX).
 */

import { parseExpression } from '../functionGrapher/expressionParser.js';
import { differentiate, dependsOn } from './symbolicDerivative.js';
import { printExpression, printLatex } from './expressionPrinter.js';

/** Les variables que compileFunction déclare : x, et les paramètres a, b, c. */
const VARIABLES = ['x', 'a', 'b', 'c'];

/**
 * Les règles, sous leur forme GÉNÉRALE — ce que l'élève a dans son cours.
 * C'est de la notation, pas une phrase : elle n'a pas à être traduite.
 */
export const RULE_FORMULAS = Object.freeze({
  constant: "(k)' = 0",
  identity: "(x)' = 1",
  sum: "(u + v)' = u' + v'",
  constantFactor: "(ku)' = k\\cdot u'",
  power: "(x^{n})' = n\\cdot x^{n-1}",
  product: "(uv)' = u'v + uv'",
  quotient: "\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^{2}}",
  opposite: "(-u)' = -u'",
  chainPower: "(u^{n})' = n\\cdot u^{n-1}\\cdot u'",
  exponential: "(a^{u})' = a^{u}\\ln a\\cdot u'",
  exponentialE: "(e^{u})' = e^{u}\\cdot u'",
  sin: "(\\sin u)' = u'\\cos u",
  cos: "(\\cos u)' = -u'\\sin u",
  tan: "(\\tan u)' = \\frac{u'}{\\cos^{2} u}",
  sqrt: "(\\sqrt{u})' = \\frac{u'}{2\\sqrt{u}}",
  exp: "(e^{u})' = e^{u}\\cdot u'",
  ln: "(\\ln u)' = \\frac{u'}{u}",
  log: "(\\log u)' = \\frac{u'}{u\\ln 10}",
  abs: "(|u|)' = u'\\cdot\\frac{u}{|u|}",
  root: "(\\sqrt[n]{u})' = \\frac{1}{n}u^{\\frac{1}{n}-1}\\cdot u'",
});

const X = { type: 'var', name: 'x' };
const NUM = (value) => ({ type: 'num', value });

/** Quelle règle gouverne ce nœud ? `null` quand l'instrument ne sait pas l'écrire. */
export function ruleOf(node) {
  if (!dependsOn(node)) return 'constant';
  switch (node.type) {
    case 'var': return 'identity';
    case 'neg': return 'opposite';
    case 'bin':
      if (node.op === '+' || node.op === '-') return 'sum';
      if (node.op === '*') return !dependsOn(node.left) || !dependsOn(node.right) ? 'constantFactor' : 'product';
      if (node.op === '/') return 'quotient';
      if (node.op === '^') {
        if (!dependsOn(node.right)) return isX(node.left) ? 'power' : 'chainPower';
        if (!dependsOn(node.left)) return node.left.type === 'const' && node.left.name === 'e' ? 'exponentialE' : 'exponential';
      }

      return null;
    case 'call':
      return RULE_FORMULAS[node.name] ? node.name : null;
    default:
      return null;
  }
}

const isX = (node) => node?.type === 'var' && node.name === 'x';

/** L'argument « intérieur » d'un nœud : x pour une fonction de référence, u sinon. */
function innerOf(node, rule) {
  if (rule === 'chainPower' || rule === 'power') return node.left;
  if (rule === 'exponential' || rule === 'exponentialE') return node.right;
  if (node.type === 'call') return node.name === 'root' ? node.args[1] : node.args[0];

  return null;
}

/* ── L'impression des états intermédiaires ─────────────────────────────── */

const L = (node) => printLatex(node);
const prime = (node) => `\\left(${L(node)}\\right)'`;

/** Faut-il des parenthèses pour ce facteur dans un produit ? (somme, opposé, nombre négatif) */
function needsParens(node) {
  return (node.type === 'bin' && (node.op === '+' || node.op === '-'))
    || node.type === 'neg'
    || (node.type === 'num' && node.value < 0);
}

/** Un facteur d'un produit écrit en toutes lettres. */
const P = (node) => (needsParens(node) ? `\\left(${L(node)}\\right)` : L(node));

/** Une base de puissance : seule une écriture atomique s'en passe. */
function B(node) {
  const atomic = node.type === 'var' || node.type === 'const' || node.type === 'call'
    || (node.type === 'num' && node.value >= 0);

  return atomic ? L(node) : `\\left(${L(node)}\\right)`;
}

/** L'exposant diminué de 1 : un nombre quand on peut, sinon `n-1` écrit tel quel. */
function exponentMinusOne(exponent) {
  if (exponent.type === 'num') return printLatex(NUM(exponent.value - 1));

  return `${L(exponent)}-1`;
}

/** Remplace x par `replacement` : la dérivée de la fonction extérieure, évaluée en u. */
function substituteX(node, replacement) {
  if (!node || typeof node !== 'object') return node;
  switch (node.type) {
    case 'var': return node.name === 'x' ? replacement : node;
    case 'neg': return { ...node, arg: substituteX(node.arg, replacement) };
    case 'bin': return { ...node, left: substituteX(node.left, replacement), right: substituteX(node.right, replacement) };
    case 'call': return { ...node, args: node.args.map((arg) => substituteX(arg, replacement)) };
    default: return node;
  }
}

/* ── Les pas ───────────────────────────────────────────────────────────── */

/** Les termes d'une somme, avec leur signe : −x² + 3 → [(−, x²), (+, 3)]. */
function flattenSum(node, sign = 1, out = []) {
  if (node.type === 'bin' && (node.op === '+' || node.op === '-')) {
    flattenSum(node.left, sign, out);
    flattenSum(node.right, node.op === '-' ? -sign : sign, out);
  } else if (node.type === 'neg') {
    flattenSum(node.arg, -sign, out);
  } else {
    out.push({ sign, node });
  }

  return out;
}

/** Une somme signée de morceaux LaTeX, sans « + − » : `a - b + c`. */
function signedSum(parts) {
  return parts.map(({ sign, latex, wrap }, index) => {
    const body = wrap ? `\\left(${latex}\\right)` : latex;
    if (index === 0) return sign < 0 ? `-${body}` : body;

    return `${sign < 0 ? ' - ' : ' + '}${body}`;
  }).join('');
}

function sumSteps(terms) {
  const steps = [{
    kind: 'split',
    textKey: 'split',
    params: { count: terms.length },
    ruleKey: 'sum',
    formula: RULE_FORMULAS.sum,
    latex: `f'(x) = ${signedSum(terms.map(({ sign, node }) => ({ sign, latex: prime(node) })))}`,
  }];

  const derived = terms.map(({ sign, node }, index) => {
    const derivative = differentiate(node);
    const rule = ruleOf(node);
    steps.push({
      kind: 'term',
      textKey: 'term',
      params: { index: index + 1 },
      ruleKey: rule,
      formula: RULE_FORMULAS[rule] ?? null,
      latex: `${prime(node)} = ${L(derivative)}`,
    });

    return { sign, derivative };
  });

  steps.push({
    kind: 'assemble',
    textKey: 'assemble',
    params: {},
    latex: `f'(x) = ${signedSum(derived.map(({ sign, derivative }, index) => ({
      sign,
      latex: L(derivative),
      wrap: (index > 0 || sign < 0) && needsParens(derivative),
    })))}`,
  });

  return steps;
}

/** Les morceaux d'une règle structurée : u (et v), leurs dérivées, la formule remplie. */
function structuredSteps(ast, rule) {
  let identify;
  let parts;
  let substituted;

  if (rule === 'product' || rule === 'quotient') {
    const u = ast.left;
    const v = ast.right;
    const du = differentiate(u);
    const dv = differentiate(v);
    identify = `u = ${L(u)},\\quad v = ${L(v)}`;
    parts = `u' = ${L(du)},\\quad v' = ${L(dv)}`;
    substituted = rule === 'product'
      ? `${P(du)}\\cdot ${P(v)} + ${P(u)}\\cdot ${P(dv)}`
      : `\\frac{${P(du)}\\cdot ${P(v)} - ${P(u)}\\cdot ${P(dv)}}{${B(v)}^{2}}`;
  } else if (rule === 'constantFactor') {
    const constantOnLeft = !dependsOn(ast.left);
    const k = constantOnLeft ? ast.left : ast.right;
    const u = constantOnLeft ? ast.right : ast.left;
    const du = differentiate(u);
    identify = `k = ${L(k)},\\quad u = ${L(u)}`;
    parts = `u' = ${L(du)}`;
    substituted = `${P(k)}\\cdot ${P(du)}`;
  } else if (rule === 'opposite') {
    const u = ast.arg;
    const du = differentiate(u);
    identify = `u = ${L(u)}`;
    parts = `u' = ${L(du)}`;
    substituted = `-${P(du)}`;
  } else if (rule === 'chainPower') {
    const u = ast.left;
    const n = ast.right;
    const du = differentiate(u);
    identify = `u = ${L(u)},\\quad n = ${L(n)}`;
    parts = `u' = ${L(du)}`;
    substituted = `${P(n)}\\cdot ${B(u)}^{${exponentMinusOne(n)}}\\cdot ${P(du)}`;
  } else if (rule === 'exponential' || rule === 'exponentialE') {
    const u = ast.right;
    const du = differentiate(u);
    identify = rule === 'exponentialE' ? `u = ${L(u)}` : `a = ${L(ast.left)},\\quad u = ${L(u)}`;
    parts = `u' = ${L(du)}`;
    substituted = rule === 'exponentialE'
      ? `e^{${L(u)}}\\cdot ${P(du)}`
      : `${B(ast.left)}^{${L(u)}}\\cdot \\ln ${B(ast.left)}\\cdot ${P(du)}`;
  } else {
    // Une fonction de référence composée : g(u)′ = g′(u)·u′.
    const u = innerOf(ast, rule);
    const du = differentiate(u);
    const outer = ast.name === 'root'
      ? differentiate({ ...ast, args: [ast.args[0], X] })
      : differentiate({ ...ast, args: [X] });
    if (!outer) return null;
    identify = `u = ${L(u)}`;
    parts = `u' = ${L(du)}`;
    substituted = `${P(substituteX(outer, u))}\\cdot ${P(du)}`;
  }

  return [
    { kind: 'identify', textKey: identifyKey(rule), params: {}, ruleKey: rule, formula: RULE_FORMULAS[rule] ?? null, latex: identify },
    { kind: 'parts', textKey: rule === 'product' || rule === 'quotient' ? 'partsTwo' : 'partsOne', params: {}, latex: parts },
    { kind: 'substitute', textKey: 'substitute', params: {}, latex: `f'(x) = ${substituted}` },
  ];
}

function identifyKey(rule) {
  if (rule === 'product' || rule === 'quotient') return 'identifyTwo';
  if (rule === 'constantFactor') return 'identifyFactor';
  if (rule === 'chainPower') return 'identifyPower';

  return 'identifyInner';
}

/** Une fonction de référence appliquée directement à x (xⁿ, sin x, eˣ, k, x). */
function elementarySteps(ast, rule) {
  const steps = [{
    kind: 'apply', textKey: 'apply', params: {}, ruleKey: rule, formula: RULE_FORMULAS[rule] ?? null,
    latex: `f'(x) = ${prime(ast)}`,
  }];
  if (rule === 'power') {
    steps.push({
      kind: 'powerDown', textKey: 'powerDown', params: {},
      latex: `f'(x) = ${P(ast.right)}\\cdot x^{${exponentMinusOne(ast.right)}}`,
    });
  }

  return steps;
}

/**
 * La dérivation de `source`, pas à pas.
 *
 * @param {string} source  l'expression telle que saisie (LaTeX MathLive ou ASCII)
 * @returns {{ok: true, steps: Array, derivativeSource: string} | {ok: false, reason: string}}
 */
export function buildDerivativeSteps(source) {
  const trimmed = String(source ?? '').trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  const parsed = parseExpression(trimmed, { variables: VARIABLES });
  if (!parsed.ok) return { ok: false, reason: 'parse' };

  let derivative;
  try {
    derivative = differentiate(parsed.ast);
  } catch {
    derivative = null;
  }
  if (!derivative) return { ok: false, reason: 'unavailable' };

  const ast = parsed.ast;
  const terms = flattenSum(ast);
  const rule = ruleOf(ast);
  const elementary = rule === 'constant' || rule === 'identity' || rule === 'power'
    || ((rule === 'exponential' || rule === 'exponentialE') && isX(ast.right))
    || (ast.type === 'call' && isX(innerOf(ast, rule)));

  let steps;
  if (terms.length >= 2) steps = sumSteps(terms);
  else if (elementary) steps = elementarySteps(ast, rule);
  else steps = structuredSteps(ast, rule);
  if (!steps) return { ok: false, reason: 'unavailable' };

  const resultLatex = `f'(x) = ${L(derivative)}`;
  // Un état intermédiaire identique au résultat n'apprend rien : on ne le montre pas deux fois.
  const kept = steps.filter((step, index) => index === 0 || step.latex !== resultLatex);
  const derivativeSource = printExpression(derivative);
  kept.push({
    kind: 'result', textKey: 'result', params: {}, tone: 'result',
    latex: resultLatex, source: derivativeSource,
  });

  return { ok: true, steps: kept, derivativeSource };
}
