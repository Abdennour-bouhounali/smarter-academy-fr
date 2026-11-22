/**
 * LE TABLEAU D'UNE SIMPLIFICATION — logique pure, sans React.
 *
 * simplify.js écrit les lignes (produits posés, produits calculés, termes
 * regroupés, résultat) ; ce module les met en scène, terme par terme :
 *
 *     3x + [2](x + 4) − x          le produit à développer désigné
 *     3x + [2] ⌒× [(x + 4)] − x    l'arc « × » du facteur vers la parenthèse (التوزيع)
 *     3x + 2 × x + 2 × 4 − x       les produits posés (en orange)
 *        ↓ 2x    ↓ 8               chaque produit calculé sous lui-même
 *     3x + 2x + 8 − x
 *     [3x] [+ 2x] + 8 [− x]        les termes semblables désignés
 *     (3x + 2x − x) + 8            regroupés (تجميع الحدود المتشابهة)
 *        ↓ 4x                      la somme de la famille (التبسيط)
 *     4x + 8                       le résultat — DERNIER frame
 *
 * Une fraction algébrique : ses lignes, puis le résultat avec la condition
 * d'existence (le « بشرط ») dans le même dernier frame.
 */

import { tok, stateFrame, rowLatex, makeTask } from '../../shared/mathBoard/frames.js';
import { splitTerms, splitProduct, diffRows, unsigned } from './boardTokens.js';

const K = 'tools.algebra.board';
const P = 'tools.algebra.practice';
const math = (latex) => `$${latex}$`;

function ruleText(line) {
  const rule = line.rules?.[0];
  if (!rule) return { textKey: `${K}.simplify` };

  return { textKey: `tools.algebra.rules.${rule}`, textParams: line.params?.factor ? { factor: math(line.params.factor) } : undefined };
}

/** Une ligne en jetons, avec des ids stables d'une ligne à la suivante (`ids[i]`). */
function rowOf(terms, ids, tones = {}) {
  return terms.map((latex, index) => tok(ids[index], latex, tones[index]));
}

/** Développer : désigner, poser l'arc « × » (quand le produit a deux facteurs lisibles), écrire les produits. */
function expandFrames(prev, next, line, step) {
  const { kept, added, removed } = diffRows(prev.terms, next.terms);
  const frames = [];
  const text = ruleText(line);
  // Les produits à développer, coupés en facteurs visibles quand c'est possible
  // (le facteur, la parenthèse) : ce sont eux que l'élève désigne en « تدرّب بنفسك ».
  const split = [];
  const marks = [];
  const factors = [];
  prev.terms.forEach((latex, index) => {
    const parts = removed.includes(index) ? splitProduct(latex) : null;
    if (parts) {
      const a = `${prev.ids[index]}a`;
      const b = `${prev.ids[index]}b`;
      split.push(tok(a, parts[0], 'operation'), tok(b, parts[1], 'operation'));
      marks.push({ type: 'link', from: a, to: b, latex: '\\times' });
      factors.push(a, b);
    } else {
      split.push(tok(prev.ids[index], latex, removed.includes(index) ? 'operation' : 'neutral'));
    }
  });
  const selectedRow = split.map((token) => (token.tone === 'operation' ? { ...token, tone: 'selected' } : token));
  // L'exercice : désigner le facteur et la parenthèse, puis « × » (التوزيع) ;
  // sans produit lisible (« −( … ) », un carré), désigner ce qu'on développe.
  const task = marks.length
    ? makeTask({ targets: factors, operator: '\\times', kind: 'operation', promptKey: `${P}.distribute` })
    : makeTask({ targets: removed.map((index) => prev.ids[index]), kind: 'pick', promptKey: `${P}.expand` });

  // 1. Ce qu'on développe.
  frames.push(stateFrame({ step, rows: [selectedRow], ...text, task }));

  // 2. L'arc du facteur vers la parenthèse (un produit posé) — un geste par produit.
  if (marks.length) frames.push(stateFrame({ step, rows: [split], marks, ...text, operationKey: `${K}.chip.distribute` }));

  // 3. Les produits posés, les termes inchangés à leur place.
  const ids = next.terms.map((_, index) => (kept.has(index) ? prev.ids[kept.get(index)] : `s${step}n${index}`));
  const tones = Object.fromEntries(added.map((index) => [index, 'operation']));
  frames.push(stateFrame({ step, rows: [rowOf(next.terms, ids, tones)], ...text, operationKey: `${K}.chip.distribute`, settle: next.latex }));

  return { frames, ids };
}

/** Calculer les produits posés : chaque résultat tombe sous son produit, puis la ligne calculée. */
function computeFrames(prev, next, line, step) {
  const frames = [];
  const aligned = prev.terms.length === next.terms.length;
  const ids = aligned ? prev.ids : next.terms.map((_, index) => `s${step}c${index}`);
  if (aligned) {
    const changed = prev.terms.map((latex, index) => latex !== next.terms[index]);
    const marks = changed.flatMap((isChanged, index) => (isChanged ? [{ type: 'under', target: ids[index], latex: unsigned(next.terms[index]), tone: 'result' }] : []));
    frames.push(stateFrame({
      step,
      rows: [rowOf(prev.terms, ids, Object.fromEntries(changed.flatMap((c, i) => (c ? [[i, 'operation']] : []))))],
      marks,
      ...ruleText(line),
      operationKey: `${K}.chip.compute`,
    }));
    frames.push(stateFrame({ step, rows: [rowOf(next.terms, ids, Object.fromEntries(changed.flatMap((c, i) => (c ? [[i, 'result']] : []))))], ...ruleText(line), settle: next.latex }));
  } else {
    frames.push(stateFrame({ step, rows: [rowOf(next.terms, ids, Object.fromEntries(next.terms.map((_, i) => [i, 'result'])))], ...ruleText(line), operationKey: `${K}.chip.compute`, settle: next.latex }));
  }

  return { frames, ids };
}

/** Regrouper les termes semblables, puis réduire chaque famille. */
function groupFrames(line, step) {
  const { terms, families } = line.data;
  const multi = (family) => families[family].members.length > 1;
  const termRow = terms.map((term, index) => tok(`t${index}`, term.latex, multi(term.family) ? 'selected' : 'neutral'));
  const familyRow = (tone) => families.map((family, index) => {
    const head = index === 0 ? family.latex : (family.negative ? `- ${family.latex.replace(/^-/, '')}` : `+ ${family.latex}`);

    return tok(`f${index}`, head, family.members.length > 1 ? tone : 'neutral');
  });
  const grouped = familyRow('operation');
  // L'exercice : désigner les termes semblables (toutes les familles à plusieurs membres), puis « + ».
  const likeTerms = terms.flatMap((term, index) => (multi(term.family) ? [`t${index}`] : []));

  return [
    stateFrame({
      step, rows: [termRow], textKey: 'tools.algebra.rules.groupLikeTerms', operationKey: `${K}.chip.group`,
      task: makeTask({ targets: likeTerms, operator: '+', kind: 'pick', promptKey: `${P}.likeTerms` }),
    }),
    stateFrame({ step, rows: [grouped], textKey: 'tools.algebra.rules.groupLikeTerms', operationKey: `${K}.chip.group`, settle: rowLatex(grouped) }),
    stateFrame({
      step,
      rows: [grouped],
      marks: families.flatMap((family, index) => (family.members.length > 1 ? [{ type: 'under', target: `f${index}`, latex: family.sum, tone: 'result' }] : [])),
      textKey: `${K}.combine`,
      operationKey: `${K}.chip.simplify`,
    }),
  ];
}

/**
 * @param {object} result  simplifyExpression() réussi
 * @returns {object[]} frames (le résultat est le dernier)
 */
export function simplifyFrames(result) {
  const { steps } = result;
  const frames = [];
  let prev = { terms: splitTerms(steps[0].latex), latex: steps[0].latex };
  prev.ids = prev.terms.map((_, index) => `o${index}`);
  let step = 0;

  for (const line of steps.slice(1)) {
    const next = { terms: splitTerms(line.latex), latex: line.latex };
    if (line.kind === 'result') break;
    if (line.kind === 'group' && line.data) {
      frames.push(...groupFrames(line, step));
      prev = { ...next, ids: next.terms.map((_, index) => `g${index}`) };
    } else if (line.kind === 'compute') {
      const out = computeFrames(prev, next, line, step);
      frames.push(...out.frames);
      prev = { ...next, ids: out.ids };
    } else if (line.kind === 'expand' && result.kind === 'polynomial') {
      const out = expandFrames(prev, next, line, step);
      frames.push(...out.frames);
      prev = { ...next, ids: out.ids };
    } else {
      // Fraction : la ligne entière (numérateur et dénominateur) est UN jeton.
      frames.push(stateFrame({ step, rows: [[tok(`l${step}`, line.latex, 'operation')]], ...ruleText(line), settle: line.latex }));
      prev = { ...next, ids: next.terms.map((_, index) => `l${step}t${index}`) };
    }
    step += 1;
  }

  frames.push(finalSimplifyFrame(result, step));

  return frames;
}

function finalSimplifyFrame(result, step) {
  const last = result.steps[result.steps.length - 1];
  if (result.kind === 'fraction') {
    const rows = [[tok('res', result.resultLatex, 'result')]];
    if (result.restriction?.latex) rows.push([tok('cond', result.restriction.latex, 'warning')]);
    const textKey = result.irreducible
      ? 'tools.algebra.simplify.irreducible'
      : (result.restriction?.latex
        ? (result.restriction.complete ? 'tools.algebra.simplify.restriction' : 'tools.algebra.simplify.restrictionPartial')
        : 'tools.algebra.simplify.restrictionGeneric');

    return {
      step, rows, marks: [], tone: 'result', settle: result.resultLatex,
      textKey, textParams: result.restriction?.latex ? { condition: math(result.restriction.latex) } : undefined,
    };
  }
  const row = splitTerms(result.resultLatex).map((latex, index) => tok(`r${index}`, latex, 'result'));
  const rule = last.kind === 'result' ? last.rules[0] : 'result';

  return { step, rows: [row], marks: [], tone: 'result', settle: result.resultLatex, textKey: `tools.algebra.rules.${rule}` };
}
