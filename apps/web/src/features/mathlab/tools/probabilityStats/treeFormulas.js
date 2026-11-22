/**
 * LES FORMULES de l'arbre — du LaTeX pour MathText, jamais du texte brut
 * dans une phrase arabe (l'algorithme bidi en ferait des mathématiques
 * fausses). Logique pure : les pas (`{ kind, latex }`) sont assemblés ici,
 * le composant ne fait que traduire `kind` et afficher.
 *
 * LES PAS (exigence 2026-09-30) : chaque calcul est une SUITE d'états réels,
 * le résultat en DERNIER. À l'écran, un calcul calculable se construit au
 * tableau (treeFrames.js, plus fin : jetons, arcs, résultats) ; ces pas
 * restent la lecture « formule » (arbre faux : la règle seule) et la
 * référence testée. Chaque pas porte aussi ce que l'arbre
 * éclaire à cet instant :
 *   lit     les branches (clés de préfixe) allumées à ce pas — l'état, pas le delta ;
 *   soft    (option) les branches de la question, en retrait ;
 *   leaves  les feuilles dont CE pas calcule le produit (« P = … » au bout du chemin).
 * Chaque déroulé rend aussi `question` : les branches concernées, éclairées
 * en retrait avant le premier pas (l'élève voit ce qu'il a demandé, pas la réponse).
 *
 * Notation du manuel algérien (et français) : la probabilité de B sachant A
 * s'écrit P_A(B) ; P(B|A) est la même chose (rappelé dans le pli « القاعدة »).
 */

import { formatValue } from '../functionGrapher/grapherFormat.js';
import { toNumber } from '../algebra/rational.js';
import {
  ambiguousLabels, branchAt, conditionalProbability, eventProbability, labelLatex, normalizeLabel,
  pathKey, pathResult, rationalLatex,
} from './probabilityTree.js';

/** Un nombre décimal dans une formule : virgule entre accolades (sinon KaTeX l'espace comme une ponctuation). */
export function latexNumber(value, decimals = 4) {
  return formatValue(value, decimals).replace(',', '{,}').replace('−', '-');
}

/** Un événement « étiquette L à l'étape s » en LaTeX, indicé si l'étiquette revient à plusieurs étapes. */
export function eventTex(label, stage, ambiguous) {
  return labelLatex(label, ambiguous.has(normalizeLabel(label)) ? stage : null);
}

/** Les événements d'un chemin (étapes 1…k) → leur intersection. */
function chainTex(labels, ambiguous) {
  return labels.map((label, i) => eventTex(label, i + 1, ambiguous)).join(' \\cap ');
}

/** La règle du produit pour un chemin : P(A ∩ B ∩ C) = P(A) × P_A(B) × P_{A ∩ B}(C). */
export function productRuleTex(labels, ambiguous) {
  const events = labels.map((label, i) => eventTex(label, i + 1, ambiguous));
  const factors = events.map((event, i) => (i === 0 ? `P(${event})` : `P_{${events.slice(0, i).join(' \\cap ')}}(${event})`));

  return `P(${events.join(' \\cap ')}) = ${factors.join(' \\times ')}`;
}

/**
 * Un facteur tel que l'élève l'a ÉCRIT : une fraction saisie « 2/4 » reste
 * \frac{2}{4} (c'est sa lecture de l'urne), un décimal ou un pourcentage
 * s'écrit en décimal ; sinon la fraction réduite.
 */
export function factorTex(text, value) {
  const source = String(text ?? '').replace(/\s+/g, '');
  const fraction = source.match(/^(\d+)\/(\d+)$/);
  if (fraction) return `\\frac{${Number(fraction[1])}}{${Number(fraction[2])}}`;
  if (/[.,٫%٪]/.test(source)) return latexNumber(toNumber(value), 6);

  return rationalLatex(value);
}

/**
 * Le résultat en trois lectures : fraction exacte, décimal (4 chiffres,
 * « ≈ » s'il est arrondi), pourcentage.
 */
export function resultTex(r) {
  const value = toNumber(r);
  const rounded = Number(value.toFixed(4));
  const exactDecimal = Math.abs(rounded - value) < 1e-12;
  const percent = Number((value * 100).toFixed(2));
  const exactPercent = Math.abs(percent - value * 100) < 1e-10;
  const fraction = rationalLatex(r);
  const decimal = latexNumber(value, 4);
  const parts = [fraction];
  if (r.d !== 1) parts.push(`${exactDecimal ? '=' : '\\approx'} ${decimal}`);
  parts.push(`${exactPercent && exactDecimal ? '=' : '\\approx'} ${latexNumber(value * 100, 2)}\\,\\%`);

  return { latex: parts.join(' '), fraction, decimal, value };
}

/** Tous les préfixes d'un chemin : [0, 1, 1] → '0', '0.1', '0.1.1' — les branches à éclairer. */
export function prefixKeys(path) {
  return path.map((_, i) => pathKey(path.slice(0, i + 1)));
}

function unionKeys(paths) {
  return [...new Set(paths.flatMap((p) => prefixKeys(p.path)))];
}

/** Les feuilles (chemins COMPLETS) parmi `paths`. */
function leavesOf(tree, paths) {
  return paths.filter((p) => p.path.length === tree.stages).map((p) => pathKey(p.path));
}

/** Les facteurs symboliques de la règle du produit : P(A), P_A(B), P_{A ∩ B}(C). */
function factorSymbols(events) {
  return events.map((event, i) => (i === 0 ? `P(${event})` : `P_{${events.slice(0, i).join(' \\cap ')}}(${event})`));
}

/** Les facteurs tels que saisis sur les branches du chemin. */
function typedFactors(tree, path, factors) {
  return factors.map((factor, i) => factorTex(branchAt(tree, path.slice(0, i + 1)).p, factor));
}

function termTex(tree, path, factors) {
  return typedFactors(tree, path, factors).join(' \\times ');
}

/**
 * Le produit EFFECTUÉ, avant simplification : des fractions saisies
 * « 3/5 × 2/4 » → \frac{3 \times 2}{5 \times 4} = \frac{6}{20} ; des décimaux
 * → leur produit décimal ; un mélange → la fraction exacte.
 */
function productTex(tree, path, factors, product) {
  const sources = factors.map((_, i) => String(branchAt(tree, path.slice(0, i + 1)).p ?? '').replace(/\s+/g, ''));
  const fractions = sources.map((source) => source.match(/^(\d+)\/(\d+)$/));
  if (fractions.every(Boolean)) {
    const nums = fractions.map((m) => Number(m[1]));
    const dens = fractions.map((m) => Number(m[2]));
    const n = nums.reduce((a, b) => a * b, 1);
    const d = dens.reduce((a, b) => a * b, 1);

    return `\\frac{${nums.join(' \\times ')}}{${dens.join(' \\times ')}} = ${d === 1 ? n : `\\frac{${n}}{${d}}`}`;
  }
  if (sources.every((source) => /[.,٫%٪]/.test(source) || /^\d+$/.test(source))) return latexNumber(toNumber(product), 8);

  return rationalLatex(product);
}

/**
 * La probabilité d'un chemin (préfixe), pas à pas :
 *   la règle du produit → chaque facteur LU sur sa branche (la branche s'allume)
 *   → le produit effectué → le résultat (fraction, décimal, %).
 * `null` si le chemin n'existe pas ; `computed: false` (la règle seule) si l'arbre est faux.
 */
export function pathSteps(tree, path, validation, { name: givenName = null } = {}) {
  const result = pathResult(tree, path, validation);
  if (!result) return null;
  const ambiguous = ambiguousLabels(tree);
  const events = result.labels.map((label, i) => eventTex(label, i + 1, ambiguous));
  const name = givenName ?? `P(${events.join(' \\cap ')})`;
  const symbols = factorSymbols(events);
  const all = prefixKeys(path);
  const single = events.length === 1;
  const steps = single ? [] : [{ kind: 'productRule', latex: `${name} = ${symbols.join(' \\times ')}`, lit: [] }];
  if (!result.product) {
    return { result, steps: single ? [{ kind: 'branchValue', latex: name, lit: [] }] : steps, computed: false, question: all };
  }
  const typed = typedFactors(tree, path, result.factors);
  typed.forEach((factor, i) => {
    steps.push({
      kind: single ? 'branchValue' : 'readFactor',
      latex: `${name} = ${[...typed.slice(0, i + 1), ...symbols.slice(i + 1)].join(' \\times ')}`,
      operationLatex: `${symbols[i]} = ${factor}`,
      lit: all.slice(0, i + 1),
    });
  });
  if (!single) steps.push({ kind: 'product', latex: `${name} = ${productTex(tree, path, result.factors, result.product)}`, lit: all });
  steps.push({
    kind: 'result',
    latex: `${name} = ${resultTex(result.product).latex}`,
    tone: 'result',
    lit: all,
    leaves: path.length === tree.stages ? [result.key] : [],
  });

  return { result, steps, computed: true, value: result.product, question: all };
}

/**
 * La probabilité d'un événement par la formule des probabilités totales :
 *   la formule → un pas par chemin contributif (son produit, le chemin
 *   s'allume à son tour) → la somme des produits → le résultat.
 * À la première étape, un événement est une branche : c'est le déroulé d'un chemin.
 */
export function eventSteps(tree, event, validation) {
  const { paths, probability } = eventProbability(tree, event, validation);
  const ambiguous = ambiguousLabels(tree);
  const name = `P(${eventTex(event.label, event.stage, ambiguous)})`;
  if (paths.length === 0) return { paths, steps: [], computed: false, question: [] };
  if (event.stage === 1) {
    const journey = pathSteps(tree, paths[0].path, validation, { name });

    return { paths, steps: journey.steps, computed: journey.computed, value: journey.value, question: journey.question };
  }
  const question = unionKeys(paths);
  const steps = [{
    kind: 'totalRule',
    latex: `${name} = ${paths.map((p) => `P(${chainTex(p.labels, ambiguous)})`).join(' + ')}`,
    lit: [],
  }];
  if (!probability) return { paths, steps, computed: false, question };
  paths.forEach((p, i) => {
    steps.push({
      kind: 'pathTerm',
      latex: `P(${chainTex(p.labels, ambiguous)}) = ${termTex(tree, p.path, p.factors)} = ${rationalLatex(p.product)}`,
      lit: unionKeys(paths.slice(0, i + 1)),
      leaves: leavesOf(tree, [p]),
    });
  });
  if (paths.length > 1) {
    steps.push({ kind: 'sum', latex: `${name} = ${paths.map((p) => rationalLatex(p.product)).join(' + ')}`, lit: question });
  }
  steps.push({ kind: 'result', latex: `${name} = ${resultTex(probability).latex}`, tone: 'result', lit: question });

  return { paths, steps, computed: true, value: probability, question };
}

/**
 * La probabilité conditionnelle P_G(T) = P(T ∩ G) / P(G) — « inverse »
 * (Bayes) quand T précède G dans l'arbre :
 *   la définition → le numérateur P(T ∩ G) → le dénominateur P(G)
 *   → le quotient écrit → le résultat.
 */
export function conditionalSteps(tree, target, given, validation) {
  const result = conditionalProbability(tree, target, given, validation);
  const ambiguous = ambiguousLabels(tree);
  const t = eventTex(target.label, target.stage, ambiguous);
  const g = eventTex(given.label, given.stage, ambiguous);
  const inter = target.stage <= given.stage ? `${t} \\cap ${g}` : `${g} \\cap ${t}`;
  const name = `P_{${g}}(${t})`;
  const interKeys = unionKeys(result.intersectionPaths);
  const givenKeys = unionKeys(result.givenPaths);
  const question = givenKeys;
  const steps = [{
    kind: target.stage < given.stage ? 'bayesRule' : 'conditionalRule',
    latex: `${name} = \\frac{P(${inter})}{P(${g})}`,
    lit: [],
  }];
  if (result.pGiven === null || result.pIntersection === null) return { ...result, steps, computed: false, question };
  const sum = (paths) => (paths.length === 0 ? '0' : paths.map((p) => termTex(tree, p.path, p.factors)).join(' + '));
  steps.push({
    kind: 'intersection',
    latex: `P(${inter}) = ${sum(result.intersectionPaths)} = ${rationalLatex(result.pIntersection)}`,
    lit: interKeys,
    leaves: leavesOf(tree, result.intersectionPaths),
  });
  steps.push({
    kind: 'given',
    latex: `P(${g}) = ${sum(result.givenPaths)} = ${rationalLatex(result.pGiven)}`,
    lit: givenKeys,
    leaves: leavesOf(tree, result.givenPaths),
  });
  if (result.zeroGiven || !result.value) return { ...result, steps, computed: false, question };
  steps.push({
    kind: 'quotient',
    latex: `${name} = \\frac{${rationalLatex(result.pIntersection)}}{${rationalLatex(result.pGiven)}}`,
    lit: interKeys,
    soft: givenKeys,
  });
  steps.push({ kind: 'result', latex: `${name} = ${resultTex(result.value).latex}`, tone: 'result', lit: interKeys, soft: givenKeys });

  return { ...result, steps, computed: true, question };
}

/**
 * Ce que l'arbre éclaire après `cursor` pas (ou frames, treeFrames.js) révélés (0 = la question seule) :
 * `{ primary, secondary, leaves }` — des ensembles de clés. Pur : le
 * composant ne fait que le passer au dessin.
 */
export function treeHighlight(calculation, cursor) {
  const question = calculation?.question ?? [];
  const items = calculation?.frames ?? calculation?.steps ?? [];
  const shown = items.slice(0, Math.max(0, cursor));
  const current = shown.at(-1);
  const primary = new Set(current?.lit ?? []);
  const soft = current?.soft ?? question;
  const secondary = new Set(soft.filter((key) => !primary.has(key)));
  const leaves = new Set(shown.flatMap((step) => step.leaves ?? []));

  return { primary, secondary, leaves };
}
