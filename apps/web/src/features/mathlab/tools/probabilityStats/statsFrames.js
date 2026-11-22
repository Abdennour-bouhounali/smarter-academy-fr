/**
 * « كيف يُحسب؟ » AU TABLEAU — les FRAMES (shared/mathBoard/frames.js) de
 * chaque indicateur d'une série : la formule, puis les opérations VISIBLES
 * sur les nombres de LA série, le résultat en dernier.
 *
 *   mean       la formule → [12] + [15] + … ↓ 147 → [147] ⌒÷ [8] ↓ 18,375 → x̄
 *   median     la série ordonnée → le rang (n+1)/2 ↓ 4 → la valeur de rang 4
 *              désignée dans la série (pair : [a] ⌒+ [b], puis ⌒÷ 2) → Me
 *   quartiles  la série ordonnée → ⌈n/4⌉ ↓ 2 → Q1 désigné → ⌈3n/4⌉ → Q3 → [Q3] ⌒− [Q1] → Q3 − Q1
 *   range      la série ordonnée, min et max désignés → [max] ⌒− [min] → l'étendue
 *   variance   la formule → x̄ → chaque écart ↓ → chaque carré ↓ → leur somme ↓
 *              → ⌒÷ n → V (au-delà de 8 valeurs, la somme des carrés d'un bloc)
 *   sd         σ = √V → V → [√V] ↓ → σ
 *
 * Les nombres viennent de `describeDataset` (descriptiveStats.js), seule
 * source de vérité ; ce module ne fait que les mettre en scène.
 * « تدرّب بنفسك » : chaque opération posée porte l'exercice par défaut
 * (désigner les deux nombres, choisir l'opération) ; en plus, l'élève
 * désigne TOUS les termes d'une somme puis choisit + (`practice.sumAll`),
 * la valeur de rang r dans la série ordonnée (`practice.readRank(s)`), le
 * minimum et le maximum (`practice.extremes`).
 *
 * `statFrames(kind, values, stats)` → `{ frames, problem }` ou `null` (série vide).
 */

import {
  tok, binaryOperationFrames, makeTask, resultFrame, stateFrame,
} from '../../shared/mathBoard/frames.js';
import { sorted, sum } from '../../../../lessons/common/stats/statsUtils.js';
import { latexNumber } from './treeFormulas.js';
import { MAX_SUBSTITUTION_TERMS, sortedMarks } from './descriptiveStats.js';

export const STAT_KINDS = Object.freeze(['mean', 'median', 'quartiles', 'range', 'variance', 'sd']);
/** Au-delà, la série ordonnée ne s'écrit plus terme à terme : ses extrémités et les rangs lus. */
const MAX_SORTED_TOKENS = 12;

const K = 'tools.probabilityStats.explain.frames';
const num = (value, decimals = 4) => latexNumber(value, decimals);
const paren = (value) => (value < 0 ? `(${num(value)})` : num(value));
const approx = (value) => (Math.abs(Number(value.toFixed(4)) - value) < 1e-12 ? '=' : '\\approx');

const TEXTS = {
  '+': { select: { textKey: `${K}.selectTerms` }, operate: { operationKey: `${K}.add` }, result: { textKey: `${K}.sumDone` } },
  '-': { select: { textKey: `${K}.selectDifference` }, operate: { operationKey: `${K}.subtract` }, result: { textKey: `${K}.differenceDone` } },
  '\\div': { select: { textKey: `${K}.selectQuotient` }, operate: { operationKey: `${K}.divide` }, result: { textKey: `${K}.quotientDone` } },
};

function interleave(tokens, opLatex, prefix) {
  return tokens.flatMap((token, i) => (i === 0 ? [token] : [tok(`${prefix}${i}`, opLatex), token]));
}

/* ── Les briques ─────────────────────────────────────────────────────── */

/** La série ordonnée en jetons (`s0`, `s1`…) — ou ses extrémités si elle est longue. */
function sortedRow(s, tones = {}) {
  if (s.length <= MAX_SORTED_TOKENS) {
    return interleave(s.map((value, i) => tok(`s${i}`, num(value), tones[i] ?? 'neutral')), '\\le', 'le');
  }

  return [tok('s0', num(s[0]), tones[0] ?? 'neutral'), tok('le1', '\\le'), tok('dots', '\\cdots'), tok('le2', '\\le'), tok(`s${s.length - 1}`, num(s.at(-1)), tones[s.length - 1] ?? 'neutral')];
}

function sortedLatex(s) {
  if (s.length <= MAX_SORTED_TOKENS) return s.map((v) => num(v)).join(' \\le ');

  return `x_{1} = ${num(s[0])} \\le \\cdots \\le x_{${s.length}} = ${num(s.at(-1))}`;
}

function sortFrame(step, s) {
  return stateFrame({ step, rows: [sortedRow(s)], textKey: `${K}.sort`, settle: sortedLatex(s) });
}

/** La phrase de la lecture : « la valeur de rang r » / « les valeurs de rangs a et b » (accord arabe). */
function rankText(ranks) {
  return ranks.length === 1
    ? { textKey: `${K}.readRank`, textParams: { rank: `$${ranks[0]}$` } }
    : { textKey: `${K}.readRanks`, textParams: { a: `$${ranks[0]}$`, b: `$${ranks[1]}$` } };
}

/** Désigner la (les) valeur(s) de rang `ranks` dans la série ordonnée : ↓ x_r sous chacune. */
function readFrame({ step, s, ranks, settle }) {
  if (s.length <= MAX_SORTED_TOKENS) {
    const tones = Object.fromEntries(ranks.map((rank) => [rank - 1, 'selected']));
    const { textParams } = rankText(ranks);

    return stateFrame({
      step,
      rows: [sortedRow(s, tones)],
      marks: ranks.map((rank) => ({ type: 'under', target: `s${rank - 1}`, latex: `x_{${rank}}`, tone: 'operation' })),
      ...rankText(ranks),
      settle,
      task: makeTask({
        targets: ranks.map((rank) => `s${rank - 1}`),
        kind: 'pick',
        promptKey: `tools.probabilityStats.practice.${ranks.length === 1 ? 'readRank' : 'readRanks'}`,
        promptParams: textParams,
      }),
    });
  }
  // Une longue série : la valeur de rang r, lue — les jetons x_r et leur valeur.
  const row = interleave(ranks.map((rank) => tok(`x${rank}`, `x_{${rank}}`, 'selected')), ';', 'sep');

  return stateFrame({
    step,
    rows: [row],
    marks: ranks.map((rank) => ({ type: 'under', target: `x${rank}`, latex: `= ${num(s[rank - 1])}`, tone: 'result' })),
    ...rankText(ranks),
    settle,
  });
}

/** Un calcul de rang : [⌈n/4⌉] ↓ = 2. */
function rankFrame({ step, entries, settle }) {
  const row = interleave(entries.map((entry, i) => tok(`r${i}`, entry.latex, 'selected')), ';', 'rs');

  return stateFrame({
    step,
    rows: [row],
    marks: entries.map((entry, i) => ({ type: 'under', target: `r${i}`, latex: `= ${entry.value}`, tone: 'result' })),
    textKey: `${K}.rank`,
    settle,
  });
}

/** Tous les termes désignés, puis leur somme qui tombe sous eux. */
function sumAllFrames({ step, head, terms, total, settle, prefix = 't', practice = true }) {
  const ids = terms.map((_, i) => `${prefix}${i}`);
  const selected = [...head, ...interleave(terms.map((term, i) => tok(ids[i], term, 'selected')), '+', `${prefix}p`)];
  const operating = [...head, ...interleave(terms.map((term, i) => tok(ids[i], term, 'operation')), '+', `${prefix}p`)];

  return [
    stateFrame({
      step,
      rows: [selected],
      textKey: `${K}.selectAll`,
      // Des termes symboliques (x₁ + … + xₙ) : rien à désigner de vrai.
      ...(practice ? { task: makeTask({ targets: ids, operator: '+', kind: 'pick', promptKey: 'tools.probabilityStats.practice.sumAll' }) } : {}),
    }),
    stateFrame({
      step,
      rows: [operating],
      marks: [{ type: 'result', from: ids, latex: total }],
      operationKey: `${K}.add`,
      textKey: `${K}.sumDone`,
      settle,
    }),
  ];
}

function binary({ step, row, a, b, op, resultLatex, settle }) {
  const frames = binaryOperationFrames({ step, row, a, b, symbolLatex: op, resultLatex, texts: TEXTS[op] });
  frames[frames.length - 1].settle = settle;

  return frames;
}

function finalFrame(step, nameTex, valueLatex) {
  return resultFrame({
    step,
    row: [tok('fn', nameTex), tok('fv', valueLatex, 'result')],
    textKey: `${K}.result`,
    settle: `${nameTex} ${valueLatex}`,
  });
}

/* ── Les indicateurs ─────────────────────────────────────────────────── */

function meanFrames(values, stats) {
  const total = sum(values);
  const head = [tok('xb', '\\bar{x}'), tok('eq', '=')];
  const frames = [stateFrame({
    step: 0,
    rows: [[...head, tok('rule', '\\frac{x_1 + x_2 + \\dots + x_n}{n}')]],
    textKey: `${K}.meanRule`,
    settle: '\\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n}',
  })];
  if (values.length <= MAX_SUBSTITUTION_TERMS) {
    frames.push(...sumAllFrames({
      step: 1,
      head: [],
      terms: values.map(paren),
      total: num(total),
      settle: `${values.map(paren).join(' + ')} = ${num(total)}`,
    }));
  } else {
    frames.push(...sumAllFrames({
      step: 1,
      head: [],
      terms: ['x_1', 'x_2', '\\dots', `x_{${stats.n}}`],
      practice: false,
      total: num(total),
      settle: `x_1 + x_2 + \\dots + x_{${stats.n}} = ${num(total)}`,
    }));
  }
  frames.push(...binary({
    step: 2,
    row: [...head, tok('sum', num(total)), tok('div', '\\div'), tok('n', String(stats.n))],
    a: 'sum',
    b: 'n',
    op: '\\div',
    resultLatex: `${approx(stats.mean)} ${num(stats.mean)}`,
    settle: `\\bar{x} = \\frac{${num(total)}}{${stats.n}} ${approx(stats.mean)} ${num(stats.mean)}`,
  }));
  frames.push(finalFrame(3, '\\bar{x}', `${approx(stats.mean)} ${num(stats.mean)}`));

  return { frames, problem: '\\bar{x} = \\,?' };
}

function medianFrames(values, stats) {
  const s = sorted(values);
  const { median } = sortedMarks(stats.n);
  const frames = [sortFrame(0, s)];
  if (median.length === 1) {
    const [r] = median;
    frames.push(rankFrame({ step: 1, entries: [{ latex: `\\frac{${stats.n} + 1}{2}`, value: r }], settle: `\\frac{${stats.n} + 1}{2} = ${r}` }));
    frames.push(readFrame({ step: 2, s, ranks: [r], settle: `Me = x_{${r}} = ${num(stats.median)}` }));
    frames.push(finalFrame(3, 'Me', `= ${num(stats.median)}`));

    return { frames, problem: 'Me = \\,?' };
  }
  const [a, b] = median;
  frames.push(rankFrame({
    step: 1,
    entries: [{ latex: `\\frac{${stats.n}}{2}`, value: a }, { latex: `\\frac{${stats.n}}{2} + 1`, value: b }],
    settle: `\\frac{${stats.n}}{2} = ${a} \\qquad \\frac{${stats.n}}{2} + 1 = ${b}`,
  }));
  frames.push(readFrame({ step: 2, s, ranks: [a, b], settle: `x_{${a}} = ${num(s[a - 1])} \\qquad x_{${b}} = ${num(s[b - 1])}` }));
  const head = [tok('me', 'Me'), tok('eq', '=')];
  const pairSum = s[a - 1] + s[b - 1];
  frames.push(...binary({
    step: 3,
    row: [...head, tok('lp', '('), tok('va', num(s[a - 1])), tok('plus', '+'), tok('vb', paren(s[b - 1])), tok('rp', ')'), tok('div', '\\div'), tok('two', '2')],
    a: 'va',
    b: 'vb',
    op: '+',
    resultLatex: num(pairSum),
    settle: `x_{${a}} + x_{${b}} = ${num(s[a - 1])} + ${paren(s[b - 1])} = ${num(pairSum)}`,
  }));
  frames.push(...binary({
    step: 3,
    row: [...head, tok('ps', num(pairSum)), tok('div', '\\div'), tok('two', '2')],
    a: 'ps',
    b: 'two',
    op: '\\div',
    resultLatex: `= ${num(stats.median)}`,
    settle: `Me = \\frac{${num(pairSum)}}{2} = ${num(stats.median)}`,
  }));
  frames.push(finalFrame(4, 'Me', `= ${num(stats.median)}`));

  return { frames, problem: 'Me = \\,?' };
}

function quartileFrames(values, stats) {
  const s = sorted(values);
  const { q1, q3 } = sortedMarks(stats.n);
  const frames = [sortFrame(0, s)];
  frames.push(rankFrame({
    step: 1,
    entries: [{ latex: `\\left\\lceil \\frac{${stats.n}}{4} \\right\\rceil`, value: q1 }],
    settle: `\\left\\lceil \\frac{${stats.n}}{4} \\right\\rceil = ${q1}`,
  }));
  frames.push(readFrame({ step: 2, s, ranks: [q1], settle: `Q_1 = x_{${q1}} = ${num(stats.q1)}` }));
  frames.push(rankFrame({
    step: 3,
    entries: [{ latex: `\\left\\lceil \\frac{3 \\times ${stats.n}}{4} \\right\\rceil`, value: q3 }],
    settle: `\\left\\lceil \\frac{3 \\times ${stats.n}}{4} \\right\\rceil = ${q3}`,
  }));
  frames.push(readFrame({ step: 4, s, ranks: [q3], settle: `Q_3 = x_{${q3}} = ${num(stats.q3)}` }));
  frames.push(...binary({
    step: 5,
    row: [tok('name', 'Q_3 - Q_1'), tok('eq', '='), tok('a', num(stats.q3)), tok('minus', '-'), tok('b', paren(stats.q1))],
    a: 'a',
    b: 'b',
    op: '-',
    resultLatex: num(stats.iqr),
    settle: `Q_3 - Q_1 = ${num(stats.q3)} - ${paren(stats.q1)} = ${num(stats.iqr)}`,
  }));
  frames.push(finalFrame(6, 'Q_3 - Q_1', `= ${num(stats.iqr)}`));

  return { frames, problem: 'Q_1 ,\\ Q_3 ,\\ Q_3 - Q_1 = \\,?' };
}

function rangeFrames(values, stats) {
  const s = sorted(values);
  const last = s.length - 1;
  const frames = [stateFrame({
    step: 0,
    rows: [sortedRow(s, { 0: 'selected', [last]: 'selected' })],
    marks: last === 0
      ? [{ type: 'under', target: 's0', latex: '\\min = \\max', tone: 'operation' }]
      : [{ type: 'under', target: 's0', latex: '\\min', tone: 'operation' }, { type: 'under', target: `s${last}`, latex: '\\max', tone: 'operation' }],
    textKey: `${K}.extremes`,
    settle: `\\min = ${num(stats.min)} \\qquad \\max = ${num(stats.max)}`,
    task: makeTask({ targets: last === 0 ? ['s0'] : ['s0', `s${last}`], kind: 'pick', promptKey: 'tools.probabilityStats.practice.extremes' }),
  })];
  frames.push(...binary({
    step: 1,
    row: [tok('name', '\\max - \\min'), tok('eq', '='), tok('a', num(stats.max)), tok('minus', '-'), tok('b', paren(stats.min))],
    a: 'a',
    b: 'b',
    op: '-',
    resultLatex: num(stats.range),
    settle: `\\max - \\min = ${num(stats.max)} - ${paren(stats.min)} = ${num(stats.range)}`,
  }));
  frames.push(finalFrame(2, '\\max - \\min', `= ${num(stats.range)}`));

  return { frames, problem: '\\max - \\min = \\,?' };
}

function varianceFrames(values, stats) {
  const m = stats.mean;
  const deviations = values.map((value) => value - m);
  const squares = deviations.map((d) => d ** 2);
  const total = sum(squares);
  const frames = [
    stateFrame({
      step: 0,
      rows: [[tok('v', 'V'), tok('eq', '='), tok('rule', '\\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2')]],
      textKey: `${K}.varianceRule`,
      settle: 'V = \\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2',
    }),
    stateFrame({
      step: 1,
      rows: [[tok('xb', '\\bar{x}'), tok('eq', approx(m)), tok('m', num(m), 'result')]],
      textKey: `${K}.meanKnown`,
      settle: `\\bar{x} ${approx(m)} ${num(m)}`,
    }),
  ];
  let step = 2;
  if (values.length <= MAX_SUBSTITUTION_TERMS) {
    const valueRow = interleave(values.map((value, i) => tok(`x${i}`, num(value), 'selected')), ';', 'sx');
    frames.push(stateFrame({
      step,
      rows: [valueRow],
      marks: deviations.map((d, i) => ({ type: 'under', target: `x${i}`, latex: num(d), tone: 'operation' })),
      textKey: `${K}.deviations`,
      operationLatex: `x_i - ${num(m)}`,
      settle: `x_i - \\bar{x} : \\ ${deviations.map((v) => num(v)).join(' ;\\ ')}`,
    }));
    step += 1;
    const deviationRow = interleave(deviations.map((d, i) => tok(`d${i}`, paren(d), 'selected')), ';', 'sd');
    frames.push(stateFrame({
      step,
      rows: [deviationRow],
      marks: squares.map((q, i) => ({ type: 'under', target: `d${i}`, latex: num(q), tone: 'operation' })),
      textKey: `${K}.squares`,
      operationLatex: '(\\ldots)^2',
      settle: `(x_i - \\bar{x})^2 : \\ ${squares.map((v) => num(v)).join(' ;\\ ')}`,
    }));
    step += 1;
    frames.push(...sumAllFrames({
      step,
      head: [],
      terms: squares.map((v) => num(v)),
      total: num(total),
      settle: `\\sum (x_i - \\bar{x})^2 = ${squares.map((v) => num(v)).join(' + ')} ${approx(total)} ${num(total)}`,
      prefix: 'q',
    }));
  } else {
    frames.push(stateFrame({
      step,
      rows: [[tok('sq', `\\sum_{i=1}^{${stats.n}} (x_i - \\bar{x})^2`, 'selected')]],
      marks: [{ type: 'under', target: 'sq', latex: `${approx(total)} ${num(total)}`, tone: 'result' }],
      textKey: `${K}.squaresLong`,
      settle: `\\sum_{i=1}^{${stats.n}} (x_i - \\bar{x})^2 ${approx(total)} ${num(total)}`,
    }));
  }
  step += 1;
  frames.push(...binary({
    step,
    row: [tok('v', 'V'), tok('eq', '='), tok('sum', num(total)), tok('div', '\\div'), tok('n', String(stats.n))],
    a: 'sum',
    b: 'n',
    op: '\\div',
    resultLatex: `${approx(stats.variance)} ${num(stats.variance)}`,
    settle: `V = \\frac{${num(total)}}{${stats.n}} ${approx(stats.variance)} ${num(stats.variance)}`,
  }));
  frames.push(finalFrame(step + 1, 'V', `${approx(stats.variance)} ${num(stats.variance)}`));

  return { frames, problem: 'V = \\,?' };
}

function sdFrames(values, stats) {
  const frames = [
    stateFrame({
      step: 0,
      rows: [[tok('s', '\\sigma'), tok('eq', '='), tok('rule', '\\sqrt{V}')]],
      textKey: `${K}.sdRule`,
      settle: '\\sigma = \\sqrt{V}',
    }),
    stateFrame({
      step: 1,
      rows: [[tok('v', 'V'), tok('eq', approx(stats.variance)), tok('vv', num(stats.variance), 'result')]],
      textKey: `${K}.varianceKnown`,
      settle: `V ${approx(stats.variance)} ${num(stats.variance)}`,
    }),
    stateFrame({
      step: 2,
      rows: [[tok('s', '\\sigma'), tok('eq', '='), tok('root', `\\sqrt{${num(stats.variance)}}`, 'selected')]],
      marks: [{ type: 'under', target: 'root', latex: `${approx(stats.sd)} ${num(stats.sd)}`, tone: 'result' }],
      operationLatex: '\\sqrt{\\;}',
      textKey: `${K}.root`,
      settle: `\\sigma = \\sqrt{${num(stats.variance)}} ${approx(stats.sd)} ${num(stats.sd)}`,
    }),
    finalFrame(3, '\\sigma', `${approx(stats.sd)} ${num(stats.sd)}`),
  ];

  return { frames, problem: '\\sigma = \\,?' };
}

const BUILDERS = {
  mean: meanFrames, median: medianFrames, quartiles: quartileFrames, range: rangeFrames, variance: varianceFrames, sd: sdFrames,
};

/** Les frames d'un indicateur de la série, ou `null` (série vide, indicateur inconnu). */
export function statFrames(kind, values, stats) {
  if (!stats || stats.n === 0 || !BUILDERS[kind]) return null;

  return BUILDERS[kind](values, stats);
}
