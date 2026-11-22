/**
 * LA RACINE QUI SE SIMPLIFIE AU TABLEAU — frames (shared/mathBoard/frames.js).
 * Le calcul vient de `powers.simplifySqrt` (entier, exact) ; ici sa mise en scène :
 *
 *   √72 :  [√72]  ↓ 72 = 36 × 2           le plus grand carré parfait qui divise 72
 *          √36 × √2                          √(a × b) = √a × √b
 *          [√36] × √2  ↓ 6                   on extrait la racine du carré
 *          √72 = 6√2                          le résultat
 *
 *   √49 :  [√49] ↓ 49 = 7²   →   √49 = 7
 *   √30 :  [30] ↓ 2 × 3 × 5 (aucun carré)   →   √30 ne se simplifie pas
 */

import { tok, stateFrame, resultFrame, makeTask } from '../../shared/mathBoard/frames.js';
import { primeFactorization, factorizationToLatex } from './numberTheory.js';

const K = 'tools.numberLab.steps.roots';

export const rootProblem = (n) => `\\sqrt{${n}} = \\ ?`;

/** @param {object} result  la sortie de `simplifySqrt` (sans erreur) */
export function rootFrames(result) {
  if (!result || result.error) return [];
  const { n, outer, inner } = result;
  const radical = `\\sqrt{${n}}`;

  if (n === 0 || n === 1) {
    return [resultFrame({ step: 0, row: [tok('rad', radical), tok('eq', '='), tok('value', n, 'result')], textKey: `${K}.trivial`, textParams: { n } })];
  }

  if (result.perfect) {
    return [
      stateFrame({
        step: 0,
        rows: [[tok('rad', radical, 'selected')]],
        marks: [{ type: 'under', target: 'rad', latex: `${n} = ${outer}^{2}`, tone: 'operation' }],
        settle: `${radical} = \\sqrt{${outer}^{2}}`,
        textKey: `${K}.perfect`,
        textParams: { n, outer },
      }),
      resultFrame({ step: 1, row: [tok('rad', radical), tok('eq', '='), tok('value', outer, 'result')], textKey: `${K}.perfectDone`, textParams: { outer } }),
    ];
  }

  if (!result.simplified) {
    const factored = factorizationToLatex(primeFactorization(n) ?? []) || String(n);

    return [
      stateFrame({
        step: 0,
        rows: [[tok('n', n, 'selected')]],
        marks: [{ type: 'under', target: 'n', latex: factored, tone: 'operation' }],
        settle: factored !== String(n) ? `${n} = ${factored}` : null,
        textKey: `${K}.noSquare`,
        textParams: { n },
      }),
      resultFrame({ step: 1, row: [tok('rad', radical, 'result')], textKey: `${K}.cannot`, textParams: { n } }),
    ];
  }

  const square = outer * outer;
  const sqrtSquare = `\\sqrt{${square}}`;
  const sqrtInner = `\\sqrt{${inner}}`;

  return [
    stateFrame({
      step: 0,
      rows: [[tok('rad', radical, 'selected')]],
      marks: [{ type: 'under', target: 'rad', latex: `${n} = ${square} \\times ${inner}`, tone: 'operation' }],
      settle: `${radical} = \\sqrt{${square} \\times ${inner}}`,
      textKey: `${K}.largestSquare`,
      textParams: { n, square, inner },
    }),
    stateFrame({
      step: 1,
      rows: [[tok('sa', sqrtSquare, 'operation'), tok('times', '\\times'), tok('sb', sqrtInner, 'operation')]],
      operationLatex: '\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}',
      settle: `= ${sqrtSquare} \\times ${sqrtInner}`,
      textKey: `${K}.split`,
    }),
    {
      ...stateFrame({
        step: 2,
        rows: [[tok('sa', sqrtSquare, 'selected'), tok('times', '\\times'), tok('sb', sqrtInner)]],
        marks: [{ type: 'under', target: 'sa', latex: String(outer), tone: 'result' }],
        textKey: `${K}.extract`,
        textParams: { square, outer },
      }),
      // « تدرّب بنفسك » : quelle racine sait-on calculer ? (celle du carré parfait)
      task: makeTask({ targets: ['sa'], kind: 'pick', promptKey: 'tools.numberLab.practice.board.rootExtract' }),
    },
    stateFrame({
      step: 2,
      rows: [[tok('outer', outer, 'result'), tok('sb', sqrtInner)]],
      settle: `= ${outer}${sqrtInner}`,
      textKey: `${K}.extracted`,
      textParams: { outer, inner },
    }),
    resultFrame({ step: 3, row: [tok('rad', radical), tok('eq', '='), tok('value', `${outer}${sqrtInner}`, 'result')], textKey: `${K}.simplifiedDone` }),
  ];
}
