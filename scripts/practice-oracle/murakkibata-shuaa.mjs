// Oracle du banc « murakkibata-shuaa » (unité 12 « الأشعة في معلم ») — chaque réponse construite (`point`) RECALCULÉE ici à
// partir des nombres de l'énoncé, en fractions exactes (helpers.mjs : P, q), sans lire le contenu ni
// packages/core/arithmetic/vectors.js ni la logique du lab :
//   comp(A, B)  = les مركبتان de AB : (xB − xA ; yB − yA)
//   end(A, u)   = la fin du représentant de u d'origine A : (xA + a ; yA + b)
//   start(B, u) = l'origine du représentant de u qui finit en B : (xB − a ; yB − b)
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par l'aller-retour du validateur.
// Écrit avec le générateur de l'auteur (scratchpad u1x-murakkibata-shuaa/gen.py).
import { P, q } from './helpers.mjs';

const comp = (A, B) => P(q(B[0]).sub(A[0]), q(B[1]).sub(A[1]));
const end = (A, u) => P(q(A[0]).add(u[0]), q(A[1]).add(u[1]));
const start = (B, u) => P(q(B[0]).sub(u[0]), q(B[1]).sub(u[1]));

export const ORACLE = {
  'ex-4am-murakkibata-shuaa-l1-002:q1': comp([-4, 2], [3, 5]),
  'ex-4am-murakkibata-shuaa-l1-002:q2': comp([2, -3], [-3, -2]),
  'ex-4am-murakkibata-shuaa-l1-003:q1': comp([0, 0], [-3, 4]),
  'ex-4am-murakkibata-shuaa-l1-004:q1': comp([0, 0], [-3, 3]),
  'ex-4am-murakkibata-shuaa-l1-004:q2': comp([0, 0], [7, -2]),
  'ex-4am-murakkibata-shuaa-l1-005:q1': comp([-1, -1], [1, 2]),
  'ex-4am-murakkibata-shuaa-l1-006:q1': comp([0, 0], [4, -1]),
  'ex-4am-murakkibata-shuaa-l1-008:q1': end([0, 0], [2, 5]),
  'ex-4am-murakkibata-shuaa-l1-009:q1': comp([3, 1], [-1, 1]),
  'ex-4am-murakkibata-shuaa-l1-010:q1': end([1, 2], [3, 1]),
  'ex-4am-murakkibata-shuaa-l2-001:q1': comp([-2, 4], [6, 2]),
  'ex-4am-murakkibata-shuaa-l2-001:q2': comp([6, 2], [3, -2]),
  'ex-4am-murakkibata-shuaa-l2-002:q1': comp([0, 0], [-3, '5/2']),
  'ex-4am-murakkibata-shuaa-l2-003:q1': end([0, 0], [2, 4]),
  'ex-4am-murakkibata-shuaa-l2-003:q2': end([1, -1], [-3, 2]),
  'ex-4am-murakkibata-shuaa-l2-004:q1': comp([3, 3], [1, -1]),
  'ex-4am-murakkibata-shuaa-l2-006:q1': end([0, 0], [-2, 0]),
  'ex-4am-murakkibata-shuaa-l2-007:q1': comp([0, 0], [0, '-7/2']),
  'ex-4am-murakkibata-shuaa-l2-008:q1': comp([-2, 1], [-6, 4]),
  'ex-4am-murakkibata-shuaa-l2-009:q1': end([2, -2], [-1, 3]),
  'ex-4am-murakkibata-shuaa-l3-001:q1': comp([-2, 4], [-1, -2]),
  'ex-4am-murakkibata-shuaa-l3-001:q2': end([-2, 4], [7, 0]),
  'ex-4am-murakkibata-shuaa-l3-003:q1': end([-2, 1], [3, 0]),
  'ex-4am-murakkibata-shuaa-l3-003:q2': end([-2, 1], [3, -4]),
  'ex-4am-murakkibata-shuaa-l3-005:q1': comp([-1, 4], [4, -2]),
  'ex-4am-murakkibata-shuaa-l3-005:q2': end([-1, 4], [5, -6]),
  'ex-4am-murakkibata-shuaa-l3-006:q1': comp([-3, -1], [2, 3]),
  'ex-4am-murakkibata-shuaa-l3-008:q1': comp([0, 0], [-6, '1/2']),
  'ex-4am-murakkibata-shuaa-l3-009:q1': end([-2, 1], [4, -3]),
  'ex-4am-murakkibata-shuaa-l4-001:q1': comp([0, 0], [-1, -3]),
  'ex-4am-murakkibata-shuaa-l4-001:q2': start([-2, -3], [1, 0]),
  'ex-4am-murakkibata-shuaa-l4-002:q1': start([1, 4], [3, -2]),
  'ex-4am-murakkibata-shuaa-l4-003:q1': start([0, 0], [-2, 5]),
  'ex-4am-murakkibata-shuaa-l4-005:q1': comp([-2, 2], [2, 3]),
  'ex-4am-murakkibata-shuaa-l4-006:q1': start([1, 1], [-2, 3]),
  'ex-4am-murakkibata-shuaa-l4-007:q1': end([3, 1], [-5, 2]),
  'ex-4am-murakkibata-shuaa-l4-008:q1': comp([2, -1], [0, 0]),
  'ex-4am-murakkibata-shuaa-l4-010:q1': comp([-2, 3], [1, -2]),
  'ex-4am-murakkibata-shuaa-l4-010:q2': end([0, 4], [3, -5]),
  'ex-4am-murakkibata-shuaa-l5-001:q1': comp([-3, 2], [2, -1]),
  'ex-4am-murakkibata-shuaa-l5-001:q2': end([0, 4], [5, -3]),
  'ex-4am-murakkibata-shuaa-l5-002:q1': comp([0, 0], [-4, 1]),
  'ex-4am-murakkibata-shuaa-l5-002:q2': comp([-4, 1], [2, 3]),
  'ex-4am-murakkibata-shuaa-l5-003:q1': end([1, -2], [-3, 4]),
  'ex-4am-murakkibata-shuaa-l5-003:q2': comp([0, 0], [-2, 2]),
  'ex-4am-murakkibata-shuaa-l5-004:q1': comp([-2, -1], [3, -1]),
  'ex-4am-murakkibata-shuaa-l5-005:q1': end([2, 2], [-4, -3]),
  'ex-4am-murakkibata-shuaa-l5-005:q2': comp([-2, -1], [2, 2]),
  'ex-4am-murakkibata-shuaa-l5-006:q1': end([-1, 2], [3 + -2, -1 + 4]),
  'ex-4am-murakkibata-shuaa-l5-006:q2': comp([-1, 2], [0, 5]),
  'ex-4am-murakkibata-shuaa-l5-007:q1': comp([-3, -2], [1, 1]),
  'ex-4am-murakkibata-shuaa-l5-007:q2': comp([0, 0], [1, 1]),
  'ex-4am-murakkibata-shuaa-l5-008:q1': end([0, -3], [2, 5]),
  'ex-4am-murakkibata-shuaa-l5-008:q2': comp([0, 0], [2, 2]),
  'ex-4am-murakkibata-shuaa-l5-009:q1': end([-2, 0], [3, 2]),
  'ex-4am-murakkibata-shuaa-l5-010:q1': end([1, 1], [2, 3]),
  'ex-4am-murakkibata-shuaa-l5-010:q2': end([1, 1], [-2, 3]),
};
