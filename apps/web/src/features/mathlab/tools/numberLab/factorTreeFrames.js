/**
 * L'ARBRE QUI SE CONSTRUIT TOUT SEUL — une fente par étape, au tableau
 * (shared/mathBoard/frames.js). Logique pure.
 *
 *   60 :  [60] ⌒÷ [2] ↓ 30      ligne acquise « 60 = 2 × 30 »
 *         [30] ⌒÷ [2] ↓ 15      « 60 = 2 × 2 × 15 »
 *         [15] ⌒÷ [3] ↓ 5       « 60 = 2 × 2 × 3 × 5 »
 *         60 = 2^{2} × 3 × 5    le résultat, puissances regroupées
 *
 * Les fentes viennent de `factorTree.autoSplitStages` (le plus petit facteur
 * premier de la première feuille composée) ; `meta.splits` dit combien de
 * fentes l'ARBRE dessiné montre à ce frame — il pousse quand le quotient tombe.
 */

import { tok, binaryOperationFrames, resultFrame, makeTask } from '../../shared/mathBoard/frames.js';
import { autoSplitStages } from './factorTree.js';
import { primeFactorization, factorizationToLatex } from './numberTheory.js';

const K = 'tools.numberLab.steps.tree';
const PRACTICE = 'tools.numberLab.practice.board';
const PHASES = Object.freeze(['select', 'operate', 'result']);

/** @returns {{ stages, frames }} — `frames` vide si rien n'est à fendre. */
export function factorTreeFrames(tree) {
  if (!tree) return { stages: [], frames: [] };
  const stages = autoSplitStages(tree);
  if (stages.length === 0) return { stages, frames: [] };
  const root = tree.n;
  const frames = [];
  stages.forEach((stage, index) => {
    const { n, p, q } = stage.split;
    binaryOperationFrames({
      step: index,
      row: [tok('n', n), tok('div', '\\div'), tok('p', p)],
      a: 'n',
      b: 'p',
      symbolLatex: '\\div',
      resultLatex: String(q),
      // « تدرّب بنفسك » : le nombre à fendre et son plus petit facteur premier, puis « ÷ ».
      task: makeTask({ targets: ['n', 'p'], operator: '\\div', promptKey: `${PRACTICE}.tree`, promptParams: { n } }),
      settle: `${root} = ${stage.leaves.join(' \\times ')}`,
      texts: {
        select: { textKey: `${K}.select`, textParams: { n, p } },
        operate: { textKey: `${K}.operate`, textParams: { n, p } },
        result: { textKey: `${K}.result`, textParams: { n, p, q } },
      },
    }).forEach((frame, phase) => frames.push({ ...frame, meta: { splits: index + (phase === 2 ? 1 : 0), phase: PHASES[phase] } }));
  });
  const factors = primeFactorization(root) ?? [];
  frames.push({
    ...resultFrame({
      step: stages.length,
      row: [tok('n', root), tok('eq', '='), tok('product', factorizationToLatex(factors), 'result')],
      textKey: `${K}.final`,
    }),
    meta: { splits: stages.length, phase: 'result' },
  });

  return { stages, frames };
}

/** L'arbre à DESSINER au frame `cursor` : celui de départ, puis une fente de plus à chaque quotient tombé. */
export function treeAtCursor(start, stages, frames, cursor) {
  if (!frames?.length || cursor <= 0) return start;
  const splits = frames[Math.min(cursor, frames.length) - 1]?.meta?.splits ?? 0;

  return splits > 0 ? stages[Math.min(splits, stages.length) - 1].tree : start;
}
