/**
 * LES PRIORITÉS AU TABLEAU — chaque réduction de `evaluateStepByStep` devient
 * une transformation VISIBLE (shared/mathBoard/frames.js). Logique pure.
 *
 *   2 × (3 + 4)^2 − 10
 *     2 × ([3] + [4])^2 − 10       on désigne l'opération prioritaire
 *     2 × (3 ⌒+ 4)^2 − 10          l'arc porte l'opérateur
 *     2 × (3 + 4)^2 − 10  ↓ 7       le résultat tombe
 *     2 × [7]^2 − 10               il prend sa place — ligne acquise « = 2 × 7^2 − 10 »
 *   … jusqu'au dernier frame : 2 × (3 + 4)^2 − 10 = 88.
 *
 * L'expression est découpée AUTOUR de la cible (le nœud que le moteur a
 * coloré) : `avant`, la cible, `après`. Les `\left( … \right)` deviennent des
 * parenthèses simples — un morceau peut n'en contenir qu'une moitié. Si la
 * découpe n'est pas sûre (cible dans un exposant ou une fraction), l'étape se
 * montre d'un seul tenant, cible colorée : jamais un LaTeX cassé.
 */

import { tok, binaryOperationFrames, stateFrame, resultFrame, makeTask } from '../../shared/mathBoard/frames.js';
import { HIGHLIGHT_COLOR } from './orderOfOperations.js';

const PRACTICE = 'tools.numberLab.practice.board';
const MARKER = `\\textcolor{${HIGHLIGHT_COLOR}}{`;

const unwrapBrackets = (latex) => latex
  .replace(/\\left\(/g, '(').replace(/\\right\)/g, ')')
  .replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');

function bracesBalanced(latex) {
  let depth = 0;
  for (let i = 0; i < latex.length; i += 1) {
    if (latex[i] === '\\') { i += 1; continue; }
    if (latex[i] === '{') depth += 1;
    if (latex[i] === '}') { depth -= 1; if (depth < 0) return false; }
  }

  return depth === 0;
}

/**
 * Découper un LaTeX coloré par le moteur autour de sa cible.
 * @returns {null | { prefix, target, suffix }}
 */
export function splitAtHighlight(latex) {
  const start = String(latex ?? '').indexOf(MARKER);
  if (start < 0) return null;
  let depth = 1;
  let i = start + MARKER.length;
  for (; i < latex.length && depth > 0; i += 1) {
    if (latex[i] === '\\') { i += 1; continue; }
    if (latex[i] === '{') depth += 1;
    if (latex[i] === '}') depth -= 1;
  }
  if (depth !== 0) return null;
  const prefix = unwrapBrackets(latex.slice(0, start)).trim();
  const target = latex.slice(start + MARKER.length, i - 1).trim();
  const suffix = unwrapBrackets(latex.slice(i)).trim();
  if (!bracesBalanced(prefix) || !bracesBalanced(suffix)) return null;

  return { prefix, target, suffix };
}

/** Retirer la couleur : le LaTeX d'une ligne acquise. */
function stripHighlight(latex) {
  const split = splitAtHighlight(latex);
  if (!split) return latex;

  return String(latex).replace(/\\textcolor\{[^}]*\}\{/, '{');
}

const around = (split, middle) => [
  ...(split.prefix ? [tok('pre', split.prefix)] : []),
  ...middle,
  ...(split.suffix ? [tok('post', split.suffix)] : []),
];

/** La clé de la phrase d'un pas : la règle, « dans les parenthèses » ou non. */
const orderRuleKey = (step) => (step.inGroup
  ? `tools.numberLab.steps.order.inGroup.${step.rule}`
  : `tools.numberLab.order.rules.${step.rule}`);

/**
 * @param {object} run  la sortie de `evaluateStepByStep`
 * @returns {object[]} les frames ; le dernier est le résultat si le calcul aboutit
 */
export function orderFrames(run) {
  if (!run?.initialLatex) return [];
  const frames = [];
  (run.steps ?? []).forEach((step, index) => {
    const textKey = orderRuleKey(step);
    const before = step.beforeLatex ? splitAtHighlight(step.beforeLatex) : null;
    const after = splitAtHighlight(step.latex);
    const settle = `= ${step.plainLatex ?? stripHighlight(step.latex)}`;
    const integrate = after
      ? stateFrame({ step: index, rows: [around(after, [tok('value', after.target, 'result')])], settle, textKey: 'tools.numberLab.steps.order.integrate', textParams: {} })
      : stateFrame({ step: index, rows: [[tok('expr', step.latex, 'result')]], settle, textKey: 'tools.numberLab.steps.order.integrate' });

    if (before && step.target?.type === 'bin') {
      const row = around(before, [tok('l', step.target.leftLatex), tok('op', step.target.symbolLatex), tok('r', step.target.rightLatex)]);
      frames.push(...binaryOperationFrames({
        step: index,
        row,
        a: 'l',
        b: 'r',
        symbolLatex: step.target.symbolLatex,
        resultLatex: step.resultLatex,
        // « Entraîne-toi » : les deux opérandes de l'opération PRIORITAIRE, puis son opérateur.
        task: makeTask({ targets: ['l', 'r'], operator: step.target.symbolLatex, promptKey: `${PRACTICE}.order` }),
        texts: { select: { textKey }, operate: { textKey }, result: { textKey, operationLatex: step.operationLatex } },
      }));
      frames.push(integrate);

      return;
    }
    if (before) {
      const selected = around(before, [tok('target', before.target, 'selected')]);
      frames.push({
        ...stateFrame({ step: index, rows: [selected], textKey }),
        // Une puissance (ou un autre nœud) : on la désigne d'un seul tenant.
        task: makeTask({ targets: ['target'], kind: 'pick', promptKey: `${PRACTICE}.orderTarget` }),
      });
      frames.push(stateFrame({
        step: index,
        rows: [around(before, [tok('target', before.target, 'operation')])],
        marks: [{ type: 'under', target: 'target', latex: step.resultLatex, tone: 'result' }],
        textKey,
        operationLatex: step.operationLatex ?? undefined,
      }));
      frames.push(integrate);

      return;
    }
    // Ôter des parenthèses, ou une cible qu'on ne sait pas découper : d'un seul tenant.
    frames.push({ ...integrate, textKey });
  });

  if (run.ok) {
    frames.push(resultFrame({
      step: run.steps?.length ?? 0,
      row: [tok('expr', run.initialLatex), tok('eq', '='), tok('value', run.result.latex, 'result')],
      textKey: 'tools.numberLab.steps.order.final',
    }));
  }

  return frames;
}
