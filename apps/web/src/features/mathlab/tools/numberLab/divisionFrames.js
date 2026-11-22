/**
 * LA DIVISION EUCLIDIENNE QUI SE CONSTRUIT — frames (shared/mathBoard/frames.js),
 * logique pure. Le calcul vient de `euclideanDivision` ; ici, sa mise en scène :
 *
 *   0. [38] = [7] × ? + ?            on désigne a et b : on cherche q et r
 *   1. 38 = 7 × [?] + ?   ↓ 7 × 5 = 35       combien de rzam de 7 tiennent dans 38 ?
 *      38 = 7 × [5] + ?                    q acquis (les cubes se groupent)
 *   2. [38] ⌒− [35] ↓ 3                     ce qui reste est r (les cubes orange)
 *   3. 38 = 7 × 5 + 3                       l'égalité, pièce par pièce
 *   4. 0 ≤ 3 < 7                            la condition — le DERNIER pas, le résultat
 *
 * `meta.draw` dit ce que le dessin montre : 0 = les a cubes, en vrac ;
 * 1 = groupés par b ; 2 = le reste en orange.
 */

import { tok, binaryOperationFrames, stateFrame, resultFrame, makeTask } from '../../shared/mathBoard/frames.js';
import { euclideanDivision } from './euclideanDivision.js';

const K = 'tools.numberLab.steps.division';
const PRACTICE = 'tools.numberLab.practice.board';

/** L'énoncé : `38 = 7 \times q + r`. */
export const divisionProblem = (a, b) => `${a} = ${b} \\times q + r \\quad (0 \\le r < ${b})`;

/** @returns {null | { division, frames }} */
export function divisionFrames(a, b) {
  const division = euclideanDivision(a, b);
  if (!division) return null;
  const { q, r } = division;
  const bq = b * q;
  const equality = (qToken, rToken, tones = {}) => [
    tok('a', a, tones.a), tok('eq', '='), tok('b', b, tones.b), tok('times', '\\times'), qToken, tok('plus', '+'), rToken,
  ];
  const frames = [];

  frames.push({
    ...stateFrame({
      step: 0,
      rows: [equality(tok('q', '?', 'muted'), tok('r', '?', 'muted'), { a: 'selected', b: 'selected' })],
      textKey: `${K}.question`,
      textParams: { a, b },
    }),
    // « تدرّب بنفسك » : désigner le dividende et le diviseur, puis « ÷ ».
    task: makeTask({ targets: ['a', 'b'], operator: '\\div', promptKey: `${PRACTICE}.division` }),
    meta: { draw: 0 },
  });

  frames.push({
    ...stateFrame({
      step: 1,
      rows: [equality(tok('q', '?', 'operation'), tok('r', '?', 'muted'))],
      marks: [{ type: 'under', target: 'q', latex: `${b} \\times ${q} = ${bq}`, tone: 'operation' }],
      textKey: `${K}.groups`,
      textParams: { a, b, next: b * (q + 1) },
    }),
    meta: { draw: 1 },
  });
  frames.push({
    ...stateFrame({
      step: 1,
      rows: [equality(tok('q', q, 'result'), tok('r', '?', 'muted'))],
      settle: `q = ${q}`,
      textKey: `${K}.quotient`,
      textParams: { q, b },
    }),
    meta: { draw: 1 },
  });

  binaryOperationFrames({
    step: 2,
    row: [tok('a', a), tok('minus', '-'), tok('bq', bq)],
    a: 'a',
    b: 'bq',
    symbolLatex: '-',
    resultLatex: String(r),
    task: makeTask({ targets: ['a', 'bq'], operator: '-', promptKey: `${PRACTICE}.remainder` }),
    settle: `r = ${a} - ${bq} = ${r}`,
    texts: {
      select: { textKey: `${K}.remainderSelect`, textParams: { a, bq } },
      operate: { textKey: `${K}.remainderOperate`, textParams: { a, bq } },
      result: { textKey: r === 0 ? `${K}.remainderZero` : `${K}.remainderResult`, textParams: { r } },
    },
  }).forEach((frame) => frames.push({ ...frame, meta: { draw: 2 } }));

  frames.push({
    ...stateFrame({
      step: 3,
      rows: [equality(tok('q', q, 'result'), tok('r', r, 'result'))],
      settle: `${a} = ${b} \\times ${q} + ${r}`,
      textKey: `${K}.equality`,
    }),
    meta: { draw: 2 },
  });

  frames.push({
    ...resultFrame({
      step: 4,
      row: [tok('zero', '0'), tok('le', '\\le'), tok('r', r, 'result'), tok('lt', '<'), tok('b', b)],
      textKey: r === 0 ? `${K}.conditionExact` : `${K}.condition`,
      textParams: { r, b },
    }),
    meta: { draw: 2 },
  });

  return { division, frames };
}

/** Ce que le dessin montre au frame `cursor` (0, 1, 2 — voir l'en-tête). */
export function divisionDrawStage(frames, cursor) {
  if (!frames || cursor <= 0) return 0;

  return frames[Math.min(cursor, frames.length) - 1]?.meta?.draw ?? 0;
}
