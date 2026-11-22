/**
 * LE TABLEAU D'UNE FACTORISATION — logique pure, sans React.
 *
 * factor.js trouve la factorisation (facteur commun, identité, somme et
 * produit, méthode ac) ; ce module la met en scène :
 *
 *   x² + [5x] + [6]               on cherche deux nombres : produit 6, somme 5
 *   1 × 6 … 2 × 3 …               les couples candidats (ceux qui échouent, barrés)
 *   [2] ⌒× [3] ↓ 6                le produit — le 6 du trinôme passe en vert
 *   [2] ⌒+ [3] ↓ 5                la somme — le 5x du trinôme passe en vert
 *   (x + 2)  puis  (x + 2)(x + 3) les facteurs se construisent
 *   x² + 5x + 6 = (x + 2)(x + 3)  le résultat — DERNIER frame
 *
 * Une chaîne d'égalités de factor.js (`A = B = C`) se déroule un membre à la
 * fois. La vérification par développement et la méthode du مميّز restent
 * APRÈS le dernier frame (l'outil ne les montre qu'une fois le résultat atteint).
 */

import { tok, stateFrame, binaryOperationFrames, makeTask } from '../../shared/mathBoard/frames.js';
import { splitEquality, splitTerms } from './boardTokens.js';

const math = (latex) => `$${latex}$`;
const K = 'tools.algebra.board';
const P = 'tools.algebra.practice';

function fmt(value) {
  return value < 0 ? `\\left(${value}\\right)` : String(value);
}

function ruleParams(step) {
  const out = {};
  for (const [key, value] of Object.entries(step.params ?? {})) out[key] = math(value);

  return out;
}

/** `A = B = C` : A désigné, puis B écrit, puis C — une ligne acquise. */
function chainFrames(step, index) {
  const parts = splitEquality(step.latex);
  const text = { textKey: `tools.algebra.rules.${step.rules[0]}`, textParams: ruleParams(step) };
  if (parts.length < 2) {
    return [stateFrame({ step: index, rows: [[tok('c0', step.latex, 'operation')]], ...text, settle: step.latex })];
  }
  const frames = [stateFrame({ step: index, rows: [[tok('c0', parts[0], 'selected')]], ...text })];
  for (let k = 1; k < parts.length; k += 1) {
    const row = [tok('c0', parts[0])];
    for (let j = 1; j <= k; j += 1) {
      row.push(tok(`e${j}`, '='), tok(`c${j}`, parts[j], j === k ? (k === parts.length - 1 ? 'result' : 'operation') : 'neutral'));
    }
    const last = k === parts.length - 1;
    frames.push(stateFrame({ step: index, rows: [row], ...text, operationKey: `${K}.chip.${step.kind === 'expand' ? 'distribute' : 'factor'}`, settle: last ? `${parts[0]} = ${parts[k]}` : null }));
  }

  return frames;
}

/** Le trinôme en jetons ; `b` = le terme en x, `c` = la constante. */
function trinomialRow(latex, variable) {
  const terms = splitTerms(latex);

  return terms.map((term, index) => {
    const hasVar = term.includes(variable);
    let id = `q${index}`;
    if (!hasVar) id = 'qc';
    else if (!term.includes('^')) id = 'qb';
    else id = 'qa';

    return tok(id, term);
  });
}

function candidateRows(step) {
  const { product, sum } = step.params;

  return step.candidates.map((candidate, index) => [
    tok(`k${index}p`, fmt(candidate.p)),
    tok(`k${index}t`, '\\times'),
    tok(`k${index}q`, fmt(candidate.q)),
    tok(`k${index}e`, `= ${product}`),
    tok(`k${index}s`, `\\qquad ${fmt(candidate.p)} + ${fmt(candidate.q)} = ${candidate.sum}`, candidate.ok ? 'result' : 'muted'),
    ...(candidate.ok ? [] : [tok(`k${index}x`, `\\neq ${sum}`, 'muted')]),
  ]);
}

/** Somme et produit (et méthode ac) : chercher, essayer, trouver, construire. */
function pairFrames(step, index, { trinomial, variable, final }) {
  const frames = [];
  const { product, sum } = step.params;
  const ac = step.kind === 'acPairs';
  const row = trinomialRow(trinomial, variable);
  const select = (tones) => row.map((token) => (token.id in tones ? { ...token, tone: tones[token.id] } : token));
  const text = { textKey: `tools.algebra.rules.${step.rules[0]}`, textParams: ruleParams(step) };

  const first = select(ac ? { qa: 'selected', qc: 'selected' } : { qb: 'selected', qc: 'selected' });
  // L'exercice : désigner les deux coefficients qui guident la recherche (b et c ; a et c pour la méthode ac).
  const guides = first.filter((token) => token.tone === 'selected').map((token) => token.id);
  frames.push(stateFrame({
    step: index, rows: [first], ...text,
    ...(guides.length === 2 ? { task: makeTask({ targets: guides, kind: 'pick', promptKey: `${P}.${ac ? 'pickAC' : 'pickBC'}` }) } : {}),
  }));

  const found = step.candidates.find((candidate) => candidate.ok);
  const foundIndex = step.candidates.indexOf(found);
  frames.push(stateFrame({
    step: index,
    rows: [select({ qb: 'selected', qc: 'selected' }), ...candidateRows(step)],
    textKey: `${K}.factor.candidates`,
    textParams: { product: math(product) },
    // L'exercice : dans la liste, toucher les deux nombres du couple qui convient.
    ...(found ? { task: makeTask({ targets: [`k${foundIndex}p`, `k${foundIndex}q`], kind: 'pick', promptKey: `${P}.pickPair`, promptParams: { sum: math(sum) } }) } : {}),
  }));

  if (!found) return frames;
  const p = ac ? step.params.m : step.params.p;
  const q = ac ? step.params.n : step.params.q;
  const pairRow = (tones) => [...select(tones), tok('sep', '\\qquad'), tok('P', fmt(p)), tok('Q', fmt(q))];

  const times = binaryOperationFrames({
    step: index + 1,
    row: pairRow({}),
    a: 'P',
    b: 'Q',
    symbolLatex: '\\times',
    resultLatex: String(product),
    task: makeTask({ targets: ['P', 'Q'], operator: '\\times', kind: 'operation', promptKey: `${P}.productCheck` }),
    texts: {
      select: { textKey: `${K}.factor.pair`, textParams: { p: math(p), q: math(q) } },
      operate: { textKey: `${K}.factor.product`, textParams: { product: math(product) }, operationKey: `${K}.chip.product` },
      result: { textKey: `${K}.factor.product`, textParams: { product: math(product) }, operationKey: `${K}.chip.product` },
    },
  });
  times[2].rows = [times[2].rows[0].map((token) => (token.id === (ac ? 'qa' : 'qc') || (ac && token.id === 'qc') ? { ...token, tone: 'result' } : token))];
  frames.push(...times);

  const plus = binaryOperationFrames({
    step: index + 1,
    row: pairRow(ac ? { qa: 'result', qc: 'result' } : { qc: 'result' }),
    a: 'P',
    b: 'Q',
    symbolLatex: '+',
    resultLatex: String(sum),
    settle: `${fmt(p)} \\times ${fmt(q)} = ${product} \\qquad ${fmt(p)} + ${fmt(q)} = ${sum}`,
    texts: {
      select: { textKey: `${K}.factor.pair`, textParams: { p: math(p), q: math(q) } },
      operate: { textKey: `${K}.factor.sum`, textParams: { sum: math(sum) }, operationKey: `${K}.chip.sum` },
      result: { textKey: `${K}.factor.sum`, textParams: { sum: math(sum) }, operationKey: `${K}.chip.sum` },
    },
    task: makeTask({ targets: ['P', 'Q'], operator: '+', kind: 'operation', promptKey: `${P}.sumCheck` }),
  });
  plus[2].rows = [plus[1].rows[0].map((token) => (token.id === 'qb' ? { ...token, tone: 'result' } : token))];
  frames.push(...plus);

  if (!ac && final) {
    // Les facteurs se construisent : (x + 2), puis (x + 2)(x + 3).
    const factor = (value, id, tone) => [
      tok(`${id}o`, `(${variable} ${value < 0 ? '-' : '+'}`), tok(id, String(Math.abs(value)), tone), tok(`${id}c`, ')'),
    ];
    const head = [...row, tok('eq', '=')];
    frames.push(stateFrame({ step: index + 2, rows: [[...head, ...factor(p, 'F1', 'result')]], textKey: `${K}.factor.build`, operationKey: `${K}.chip.factor` }));
    frames.push(stateFrame({ step: index + 2, rows: [[...head, ...factor(p, 'F1', 'neutral'), ...factor(q, 'F2', 'result')]], textKey: `${K}.factor.build`, operationKey: `${K}.chip.factor` }));
  }

  return frames;
}

/**
 * @param {object} result factorExpression() réussi
 * @returns {object[]} frames (le résultat — ou le constat — est le dernier)
 */
export function factorFrames(result) {
  const frames = [];
  let index = 0;
  let trinomial = result.expanded;

  for (const step of result.steps) {
    if (step.kind === 'result') break;
    if (step.kind === 'sumProduct' || step.kind === 'acPairs') {
      const built = pairFrames(step, index, { trinomial, variable: result.variable, final: step.kind === 'sumProduct' });
      frames.push(...built);
      index = built[built.length - 1].step + 1;
    } else if (step.latex && step.kind.startsWith('irreducible')) {
      frames.push(stateFrame({ step: index, rows: [[tok('c0', step.latex, 'warning')]], textKey: `tools.algebra.rules.${step.rules[0]}`, settle: step.latex }));
      index += 1;
    } else if (step.latex) {
      frames.push(...chainFrames(step, index));
      // Le trinôme restant, si un facteur commun a été sorti : ce qui est entre les dernières parenthèses.
      const parts = splitEquality(step.latex);
      const tail = parts[parts.length - 1];
      const inner = /\\left\((.*)\\right\)$/.exec(tail);
      if (step.kind === 'commonFactor' && inner) trinomial = inner[1];
      index += 1;
    } else {
      frames.push(stateFrame({ step: index, rows: [[tok('c0', trinomial, 'selected')]], textKey: `tools.algebra.rules.${step.rules[0]}`, textParams: ruleParams(step) }));
      index += 1;
    }
  }

  if (result.status === 'factored') {
    const row = [tok('lhs', result.expanded), tok('eq', '='), tok('rhs', result.resultLatex, 'result')];

    frames.push({ step: index, rows: [row], marks: [], tone: 'result', settle: `${result.expanded} = ${result.resultLatex}`, textKey: 'tools.algebra.rules.factorResult' });
  } else {
    frames.push({ step: index, rows: [[tok('lhs', result.expanded, 'result')]], marks: [], tone: 'result', settle: result.expanded, textKey: `tools.algebra.factor.status.${result.status}` });
  }

  return frames;
}
