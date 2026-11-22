/**
 * LE CALCUL DE L'ARBRE AU TABLEAU — les FRAMES (shared/mathBoard/frames.js)
 * d'un chemin, d'un événement, d'une probabilité conditionnelle.
 *
 * Exigence de la propriétaire (2026-09-30) : l'élève VOIT chaque opération
 * se faire — les deux facteurs désignés (sur l'arbre ET au tableau), l'arc
 * « × » qui les relie, le produit qui tombe dessous, puis la ligne acquise.
 * Jamais une formule qui en remplace une autre.
 *
 *   chemin      la règle du produit → chaque facteur LU sur sa branche (la
 *               branche s'allume) → [3/5] ⌒× [2/4] ↓ 6/20 → le résultat
 *               (fraction, décimal, %) ;
 *   événement   la formule des probabilités totales → le produit de chaque
 *               chemin (le chemin s'allume à son tour) → [3/10] ⌒+ [1/10] ↓ 2/5
 *               → le résultat ;
 *   Bayes       la définition → le numérateur → le dénominateur → [a] ⌒÷ [b]
 *               ↓ → le résultat.
 *
 * Chaque frame porte, en plus du schéma partagé, ce que le DESSIN éclaire :
 *   lit     les branches (clés de préfixe) allumées à ce frame ;
 *   soft    (option) les branches en retrait (par défaut : celles de la question) ;
 *   leaves  les feuilles dont ce frame calcule le produit (« P = … » au bout du chemin).
 * `treeHighlight(result, cursor)` (treeFormulas.js) les lit ; aucune de ces
 * fonctions ne calcule une probabilité : probabilityTree.js reste la seule
 * source de vérité, ici on ne fait que mettre SES nombres en scène.
 *
 * « تدرّب بنفسك » : chaque opération posée (chainFrames → binaryOperationFrames)
 * porte l'exercice par défaut — désigner les deux opérandes, choisir ×, + ou ÷ ;
 * la lecture d'un facteur demande de désigner le symbole de la branche qui
 * s'allume sur l'arbre (`practice.readBranch`).
 *
 * Rend `null` quand il n'y a rien à dérouler (arbre faux, P(G) = 0…) : la
 * section montre alors la formule seule et le message qui dit pourquoi.
 */

import {
  tok, binaryOperationFrames, makeTask, resultFrame, stateFrame,
} from '../../shared/mathBoard/frames.js';
import { add, divide, multiply, toNumber } from '../algebra/rational.js';
import {
  ambiguousLabels, branchAt, conditionalProbability, eventProbability, pathResult, rationalLatex,
} from './probabilityTree.js';
import {
  eventTex, factorTex, latexNumber, prefixKeys, resultTex,
} from './treeFormulas.js';

const K = 'tools.probabilityStats.tree.frames';
const STEP_TEXT = 'tools.probabilityStats.tree.steps';

const TEXTS = {
  '\\times': {
    select: { textKey: `${K}.selectFactors` },
    operate: { operationKey: `${K}.multiply` },
    result: { textKey: `${K}.productDone` },
  },
  '+': {
    select: { textKey: `${K}.selectTerms` },
    operate: { operationKey: `${K}.add` },
    result: { textKey: `${K}.sumDone` },
  },
  '\\div': {
    select: { textKey: `${K}.selectQuotient` },
    operate: { operationKey: `${K}.divide` },
    result: { textKey: `${K}.quotientDone` },
  },
};

/* ── Les opérandes : un nombre tel qu'écrit, et sa valeur exacte ────────── */

/**
 * Un facteur lu sur une branche, TEL QUE SAISI : « 2/4 » reste 2/4 (la
 * lecture de l'urne), un décimal reste décimal. `frac` garde numérateur et
 * dénominateur non simplifiés pour écrire le produit effectué (6/20 avant 3/10).
 */
export function operandOf(text, value) {
  const source = String(text ?? '').replace(/\s+/g, '');
  const fraction = source.match(/^(\d+)\/(\d+)$/);

  return {
    latex: factorTex(text, value),
    value,
    frac: fraction ? { n: Number(fraction[1]), d: Number(fraction[2]) } : null,
    decimal: !fraction && (/[.,٫%٪]/.test(source) || /^\d+$/.test(source)),
  };
}

/** Un résultat déjà calculé (une probabilité réduite) comme opérande. */
function exactOperand(value) {
  return { latex: rationalLatex(value), value, frac: null, decimal: false };
}

function fracLatex(n, d) {
  return d === 1 ? String(n) : `\\frac{${n}}{${d}}`;
}

/** Le produit EFFECTUÉ de deux facteurs, écrit comme on le pose au tableau. */
export function multiplyOperands(a, b) {
  const value = multiply(a.value, b.value);
  if (a.frac && b.frac) {
    const n = a.frac.n * b.frac.n;
    const d = a.frac.d * b.frac.d;

    return { latex: fracLatex(n, d), value, frac: { n, d }, decimal: false };
  }
  if (a.decimal && b.decimal) return { latex: latexNumber(toNumber(value), 8), value, frac: null, decimal: true };

  return exactOperand(value);
}

function addOperands(a, b) {
  return exactOperand(add(a.value, b.value));
}

function divideOperands(a, b) {
  return exactOperand(divide(a.value, b.value));
}

const COMBINE = { '\\times': multiplyOperands, '+': addOperands, '\\div': divideOperands };

/* ── Les briques du tableau ─────────────────────────────────────────────── */

/**
 * Une chaîne d'opérations binaires « a ∘ b ∘ c » posée paire par paire :
 * [a] ⌒∘ [b] ↓ ab, puis [ab] ⌒∘ [c] ↓ abc. `head` : les jetons avant
 * l'expression (« P(A ∩ B) = »). Rend les frames et l'opérande final.
 */
function chainFrames({ step, head, operands, opLatex, prefix }) {
  let current = operands.map((operand, i) => ({ ...operand, id: `${prefix}${i}` }));
  const frames = [];
  let round = 0;
  while (current.length > 1) {
    const [a, b, ...rest] = current;
    const row = [
      ...head,
      tok(a.id, a.latex),
      tok(`${prefix}op${round}`, opLatex),
      tok(b.id, b.latex),
      ...rest.flatMap((r) => [tok(`${r.id}op`, opLatex), tok(r.id, r.latex)]),
    ];
    const combined = { ...COMBINE[opLatex](a, b), id: `${prefix}r${round}` };
    frames.push(...binaryOperationFrames({
      step, row, a: a.id, b: b.id, symbolLatex: opLatex, resultLatex: combined.latex, texts: TEXTS[opLatex],
    }));
    current = [combined, ...rest];
    round += 1;
  }

  return { frames, final: current[0] };
}

/** Ajoute à des frames ce que le dessin éclaire. */
function light(frames, lit, extra = {}) {
  return frames.map((frame) => ({ ...frame, lit, ...extra }));
}

/**
 * Le produit d'UN chemin, posé : « P(R₁ ∩ B₂) = [3/5] ⌒× [2/4] ↓ 6/20 », puis,
 * si le produit se simplifie, « 6/20 ↓ = 3/10 ». La dernière frame acquiert
 * la ligne et écrit la feuille. Rend `{ frames, operand }` (l'opérande exact, réduit).
 */
function pathProductFrames({ tree, step, path, labels, factors, ambiguous, lit, prefix }) {
  const nameTex = `P(${labels.map((label, i) => eventTex(label, i + 1, ambiguous)).join(' \\cap ')})`;
  const head = [tok(`${prefix}n`, nameTex), tok(`${prefix}eq`, '=')];
  const operands = factors.map((factor, i) => operandOf(branchAt(tree, path.slice(0, i + 1)).p, factor));
  const typed = operands.map((operand) => operand.latex).join(' \\times ');
  const leaves = path.length === tree.stages ? [prefixKeys(path).at(-1)] : [];
  const product = operands.reduce((acc, operand) => multiply(acc, operand.value), { n: 1, d: 1 });
  const reduced = rationalLatex(product);

  if (operands.length === 1) {
    const frame = stateFrame({
      step,
      rows: [[...head, tok(`${prefix}v`, operands[0].latex, 'result')]],
      textKey: `${K}.readBranch`,
      settle: `${nameTex} = ${operands[0].latex}`,
    });

    return { frames: light([frame], lit, { leaves }), operand: exactOperand(product), nameTex };
  }

  const { frames, final } = chainFrames({ step, head, operands, opLatex: '\\times', prefix });
  let settle = `${nameTex} = ${typed} = ${final.latex}`;
  if (final.latex !== reduced) {
    frames.push(stateFrame({
      step,
      rows: [[...head, tok(`${prefix}p`, final.latex, 'selected')]],
      marks: [{ type: 'under', target: `${prefix}p`, latex: `= ${reduced}`, tone: 'result' }],
      textKey: `${K}.simplify`,
    }));
    settle = `${settle} = ${reduced}`;
  }
  frames[frames.length - 1].settle = settle;
  const lit_ = light(frames, lit);
  lit_[lit_.length - 1].leaves = leaves;

  return { frames: lit_, operand: exactOperand(product), nameTex };
}

/** Une somme de probabilités déjà calculées : [a] ⌒+ [b] ↓ … (rien à poser s'il n'y a qu'un terme). */
function sumFrames({ step, nameTex, operands, lit, prefix, soft }) {
  const head = [tok(`${prefix}n`, nameTex), tok(`${prefix}eq`, '=')];
  if (operands.length === 1) {
    const frame = stateFrame({
      step,
      rows: [[...head, tok(`${prefix}v`, operands[0].latex, 'result')]],
      settle: `${nameTex} = ${operands[0].latex}`,
      textKey: `${K}.single`,
    });

    return { frames: light([frame], lit, soft ? { soft } : {}), final: operands[0] };
  }
  const { frames, final } = chainFrames({ step, head, operands, opLatex: '+', prefix });
  frames[frames.length - 1].settle = `${nameTex} = ${operands.map((o) => o.latex).join(' + ')} = ${final.latex}`;

  return { frames: light(frames, lit, soft ? { soft } : {}), final };
}

/** Le frame final : la probabilité en trois lectures, et rien d'autre. */
function finalFrame({ step, nameTex, value, lit, soft, leaves = [], before = null }) {
  const row = [tok('fn', nameTex), tok('feq', '=')];
  if (before) row.push(tok('fb', before), tok('feq2', '='));
  row.push(tok('fr', resultTex(value).latex, 'result'));

  return {
    ...resultFrame({ step, row, textKey: `${STEP_TEXT}.result`, settle: `${nameTex} = ${resultTex(value).latex}` }),
    lit,
    ...(soft ? { soft } : {}),
    leaves,
  };
}

function interleave(tokens, opLatex, prefix) {
  return tokens.flatMap((token, i) => (i === 0 ? [token] : [tok(`${prefix}${i}`, opLatex), token]));
}

/* ── Les trois calculs ──────────────────────────────────────────────────── */

/**
 * Le chemin (préfixe) `path` : la règle du produit, puis chaque facteur lu sur
 * sa branche, puis le produit posé, puis le résultat.
 * `{ frames, question }` — ou `null` si le chemin n'est pas calculable.
 */
export function pathFrames(tree, path, validation, { name = null } = {}) {
  const result = pathResult(tree, path, validation);
  if (!result?.product) return null;
  const ambiguous = ambiguousLabels(tree);
  const events = result.labels.map((label, i) => eventTex(label, i + 1, ambiguous));
  const nameTex = name ?? `P(${events.join(' \\cap ')})`;
  const symbols = events.map((event, i) => (i === 0 ? `P(${event})` : `P_{${events.slice(0, i).join(' \\cap ')}}(${event})`));
  const operands = result.factors.map((factor, i) => operandOf(branchAt(tree, path.slice(0, i + 1)).p, factor));
  const all = prefixKeys(path);
  const head = [tok('n', nameTex), tok('eq', '=')];
  const frames = [];
  let step = 0;

  if (symbols.length > 1) {
    frames.push({
      ...stateFrame({
        step,
        rows: [[...head, ...interleave(symbols.map((symbol, i) => tok(`s${i}`, symbol)), '\\times', 'x')]],
        textKey: `${STEP_TEXT}.productRule`,
        settle: `${nameTex} = ${symbols.join(' \\times ')}`,
      }),
      lit: [],
    });
    step += 1;
  }

  // Chaque facteur est LU sur sa branche : la branche s'allume, la valeur descend sur le symbole.
  symbols.forEach((symbol, i) => {
    const row = [...head, ...interleave(symbols.map((s, j) => {
      if (j < i) return tok(`s${j}`, operands[j].latex, 'result');
      if (j === i) return tok(`s${j}`, s, 'selected');

      return tok(`s${j}`, s);
    }), '\\times', 'x')];
    frames.push({
      ...stateFrame({
        step,
        rows: [row],
        marks: [{ type: 'under', target: `s${i}`, latex: operands[i].latex, tone: 'operation' }],
        textKey: `${K}.readBranch`,
        operationLatex: `${symbol} = ${operands[i].latex}`,
        task: makeTask({ targets: [`s${i}`], kind: 'term', promptKey: 'tools.probabilityStats.practice.readBranch' }),
      }),
      lit: all.slice(0, i + 1),
    });
  });
  const substituted = operands.map((operand) => operand.latex).join(' \\times ');
  frames.push({
    ...stateFrame({
      step,
      rows: [[...head, ...interleave(operands.map((operand, i) => tok(`s${i}`, operand.latex, 'result')), '\\times', 'x')]],
      textKey: `${STEP_TEXT}.substitution`,
      settle: `${nameTex} = ${substituted}`,
    }),
    lit: all,
  });
  step += 1;

  let before = null;
  if (operands.length > 1) {
    const chain = chainFrames({ step, head, operands, opLatex: '\\times', prefix: 'f' });
    chain.frames[chain.frames.length - 1].settle = `${nameTex} = ${substituted} = ${chain.final.latex}`;
    frames.push(...light(chain.frames, all));
    step += 1;
    if (chain.final.latex !== rationalLatex(result.product)) before = chain.final.latex;
  }

  frames.push(finalFrame({
    step, nameTex, value: result.product, lit: all, before, leaves: path.length === tree.stages ? [result.key] : [],
  }));

  return { frames, question: all, problem: `${nameTex} = \\,?` };
}

/**
 * Un événement (étape, étiquette) par la formule des probabilités totales.
 * À la première étape, c'est une branche : le déroulé d'un chemin.
 */
export function eventFrames(tree, event, validation) {
  const { paths, probability } = eventProbability(tree, event, validation);
  if (paths.length === 0 || !probability) return null;
  const ambiguous = ambiguousLabels(tree);
  const nameTex = `P(${eventTex(event.label, event.stage, ambiguous)})`;
  if (event.stage === 1) return pathFrames(tree, paths[0].path, validation, { name: nameTex });

  const question = [...new Set(paths.flatMap((p) => prefixKeys(p.path)))];
  const pathNames = paths.map((p) => `P(${p.labels.map((label, i) => eventTex(label, i + 1, ambiguous)).join(' \\cap ')})`);
  const frames = [{
    ...stateFrame({
      step: 0,
      rows: [[tok('n', nameTex), tok('eq', '='), ...interleave(pathNames.map((pn, i) => tok(`t${i}`, pn)), '+', 'plus')]],
      textKey: `${STEP_TEXT}.totalRule`,
      settle: `${nameTex} = ${pathNames.join(' + ')}`,
    }),
    lit: [],
  }];

  let step = 1;
  const products = [];
  paths.forEach((p, i) => {
    const lit = [...new Set(paths.slice(0, i + 1).flatMap((q) => prefixKeys(q.path)))];
    const built = pathProductFrames({ tree, step, path: p.path, labels: p.labels, factors: p.factors, ambiguous, lit, prefix: `p${i}_` });
    frames.push(...built.frames);
    products.push(built.operand);
    step += 1;
  });

  let before = null;
  if (products.length > 1) {
    const summed = sumFrames({ step, nameTex, operands: products, lit: question, prefix: 'sum' });
    frames.push(...summed.frames);
    step += 1;
  }
  if (products.length === 1 && products[0].latex !== rationalLatex(probability)) before = products[0].latex;
  frames.push(finalFrame({ step, nameTex, value: probability, lit: question, before }));

  return { frames, question, problem: `${nameTex} = \\,?` };
}

/**
 * P_G(T) = P(T ∩ G) / P(G) — « inverse » (Bayes) quand T précède G :
 * la définition, le numérateur (ses chemins), le dénominateur (ses chemins,
 * en réutilisant ceux déjà calculés), le quotient posé, le résultat.
 */
export function conditionalFrames(tree, target, given, validation) {
  const result = conditionalProbability(tree, target, given, validation);
  if (!result.value || result.zeroGiven || result.pGiven === null || result.pIntersection === null) return null;
  const ambiguous = ambiguousLabels(tree);
  const tTex = eventTex(target.label, target.stage, ambiguous);
  const gTex = eventTex(given.label, given.stage, ambiguous);
  const interTex = target.stage <= given.stage ? `${tTex} \\cap ${gTex}` : `${gTex} \\cap ${tTex}`;
  const nameTex = `P_{${gTex}}(${tTex})`;
  const keysOf = (paths) => [...new Set(paths.flatMap((p) => prefixKeys(p.path)))];
  const interKeys = keysOf(result.intersectionPaths);
  const givenKeys = keysOf(result.givenPaths);

  const frames = [{
    ...stateFrame({
      step: 0,
      rows: [[tok('n', nameTex), tok('eq', '='), tok('q', `\\frac{P(${interTex})}{P(${gTex})}`)]],
      textKey: `${STEP_TEXT}.${target.stage < given.stage ? 'bayesRule' : 'conditionalRule'}`,
      settle: `${nameTex} = \\frac{P(${interTex})}{P(${gTex})}`,
    }),
    lit: [],
  }];

  // Le numérateur : les chemins qui passent par les deux événements.
  const known = new Map();
  const numerator = [];
  result.intersectionPaths.forEach((p, i) => {
    const built = pathProductFrames({ tree, step: 1, path: p.path, labels: p.labels, factors: p.factors, ambiguous, lit: interKeys, prefix: `i${i}_` });
    frames.push(...built.frames);
    known.set(p.key, built.operand);
    numerator.push(built.operand);
  });
  // Un seul chemin : son produit EST le numérateur, rien à additionner.
  if (numerator.length !== 1) {
    const numeratorOperands = numerator.length ? numerator : [exactOperand(result.pIntersection)];
    frames.push(...sumFrames({ step: 1, nameTex: `P(${interTex})`, operands: numeratorOperands, lit: interKeys, prefix: 'num' }).frames);
  }

  // Le dénominateur : tous les chemins de G — ceux du numérateur sont déjà connus.
  const denominator = [];
  result.givenPaths.forEach((p, i) => {
    if (known.has(p.key)) { denominator.push(known.get(p.key)); return; }
    const built = pathProductFrames({ tree, step: 2, path: p.path, labels: p.labels, factors: p.factors, ambiguous, lit: givenKeys, prefix: `g${i}_` });
    frames.push(...built.frames);
    denominator.push(built.operand);
  });
  frames.push(...sumFrames({ step: 2, nameTex: `P(${gTex})`, operands: denominator, lit: givenKeys, prefix: 'den' }).frames);

  // Le quotient, posé : [P(T ∩ G)] ⌒÷ [P(G)] ↓ la valeur.
  const quotient = chainFrames({
    step: 3,
    head: [tok('qn', nameTex), tok('qeq', '=')],
    operands: [exactOperand(result.pIntersection), exactOperand(result.pGiven)],
    opLatex: '\\div',
    prefix: 'd',
  });
  quotient.frames[quotient.frames.length - 1].settle = `${nameTex} = \\frac{${rationalLatex(result.pIntersection)}}{${rationalLatex(result.pGiven)}} = ${quotient.final.latex}`;
  frames.push(...light(quotient.frames, interKeys, { soft: givenKeys }));

  frames.push(finalFrame({ step: 4, nameTex, value: result.value, lit: interKeys, soft: givenKeys }));

  return { frames, question: givenKeys, problem: `${nameTex} = \\,?` };
}

/** Les frames de la requête enregistrée avec l'arbre (`tree.query`), ou `null`. */
export function queryFrames(tree, validation) {
  const query = tree.query;
  if (query?.kind === 'path') return pathFrames(tree, query.path, validation);
  if (query?.kind === 'event') return eventFrames(tree, query.event, validation);
  if (query?.kind === 'conditional') return conditionalFrames(tree, query.target, query.given, validation);

  return null;
}
