// Oracle du banc « khawas-dawaran » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة ») — chaque réponse construite RECALCULÉE ici à
// partir des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/rotation.js ni la logique du lab : sa propre rotation
// (Math.cos / Math.sin, arrondie au millième — exacte pour les quarts de tour), son propre centre (intersection de deux médiatrices
// par Cramer en rationnels exacts de helpers.mjs), et l'arithmétique des longueurs, angles et aires. Fusionné dans
// scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par l'aller-retour du validateur.
// Écrit par le générateur de l'auteur (scratch u13-khawas-dawaran/gen.mjs).
import { R, P, q, solve2 } from './helpers.mjs';

/** L'image de p par la rotation de centre c et d'angle deg (degrés, > 0 sens direct) — arrondie au millième, en fraction. */
function rot(p, c, deg) {
  const t = (deg * Math.PI) / 180; const dx = p[0] - c[0]; const dy = p[1] - c[1];
  const r = (v) => { const x = Math.round(v * 1000) / 1000; return Object.is(x, -0) ? 0 : x; };
  return [r(c[0] + dx * Math.cos(t) - dy * Math.sin(t)), r(c[1] + dx * Math.sin(t) + dy * Math.cos(t))];
}
/** Le centre d'une rotation A ↦ A2, B ↦ B2 : l'intersection des médiatrices (u·X = (|A2|² − |A|²)/2), exacte. */
function center(A, A2, B, B2) {
  const u = [A2[0] - A[0], A2[1] - A[1]]; const v = [B2[0] - B[0], B2[1] - B[1]];
  const c1 = q(A2[0] * A2[0] + A2[1] * A2[1] - A[0] * A[0] - A[1] * A[1]).div(2);
  const c2 = q(B2[0] * B2[0] + B2[1] * B2[1] - B[0] * B[0] - B[1] * B[1]).div(2);
  return solve2(u[0], u[1], c1, v[0], v[1], c2);
}

export const ORACLE = {
  'ex-4am-khawas-dawaran-l1-001:q1': R(2),
  'ex-4am-khawas-dawaran-l1-002:q1': R(60),
  'ex-4am-khawas-dawaran-l1-003:q1': R(64),
  'ex-4am-khawas-dawaran-l1-004:q1': R(18),
  'ex-4am-khawas-dawaran-l1-007:q1': R(120),
  'ex-4am-khawas-dawaran-l1-008:q1': R('1.2'),
  'ex-4am-khawas-dawaran-l2-001:q1': P(...rot([0, 0], [3, 0], -90)),
  'ex-4am-khawas-dawaran-l2-004:q1': P(...rot([3, 1], [0, 0], 90)),
  'ex-4am-khawas-dawaran-l2-005:q1': P(...rot([4, 2], [1, 1], -90)),
  'ex-4am-khawas-dawaran-l2-006:q1': P(...rot([5, 3], [2, -1], 180)),
  'ex-4am-khawas-dawaran-l2-008:q1': R(180 - 130),
  'ex-4am-khawas-dawaran-l2-009:q1': R(5 * 5),
  'ex-4am-khawas-dawaran-l3-002:q1': R(45),
  'ex-4am-khawas-dawaran-l3-004:q1': R(60),
  'ex-4am-khawas-dawaran-l3-005:q1': P(...rot([5, 3], [2, 1], 90)),
  'ex-4am-khawas-dawaran-l3-006:q1': P(...rot([4, 0], [1, -2], 180)),
  'ex-4am-khawas-dawaran-l3-008:q1': R(35),
  'ex-4am-khawas-dawaran-l3-009:q1': P(...center([1, 0], [0, 1], [0, 2], [-2, 0])),
  'ex-4am-khawas-dawaran-l4-001:q1': P(q(-3).add(5).div(2), q(1).add(-1).div(2)),
  'ex-4am-khawas-dawaran-l4-001:q2': P(...rot([0, 4], [1, 0], 180)),
  'ex-4am-khawas-dawaran-l4-002:q1': P(...center([0, 1], [2, 0], [1, 0], [3, 1])),
  'ex-4am-khawas-dawaran-l4-002:q2': P(...center([1, 3], [3, 3], [2, 2], [4, 4])),
  'ex-4am-khawas-dawaran-l4-003:q2': R(360 - 240),
  'ex-4am-khawas-dawaran-l4-004:q1': P(...rot([4, 1], [0, 0], 90)),
  'ex-4am-khawas-dawaran-l4-004:q2': P(...rot([1, 3], [0, 0], 90)),
  'ex-4am-khawas-dawaran-l4-005:q1': R(6),
  'ex-4am-khawas-dawaran-l4-005:q2': R(90),
  'ex-4am-khawas-dawaran-l4-006:q1': R(10),
  'ex-4am-khawas-dawaran-l4-007:q1': R(Math.round(0.6 * Math.SQRT2 * 100) / 100),
  'ex-4am-khawas-dawaran-l4-008:q1': P(...center([5, 1], [3, 3], [3, 4], [0, 1])),
  'ex-4am-khawas-dawaran-l4-009:q1': R(6 * 6 / 2),
  'ex-4am-khawas-dawaran-l5-001:q1': R(45 * 2),
  'ex-4am-khawas-dawaran-l5-002:q1': P(...rot([0, 1.5], [0, 0], -90)),
  'ex-4am-khawas-dawaran-l5-003:q2': R(90),
  'ex-4am-khawas-dawaran-l5-004:q1': P(...rot([4, 1], [1, 1], -90)),
  'ex-4am-khawas-dawaran-l5-004:q2': R(2 * 3 / 2),
  'ex-4am-khawas-dawaran-l5-005:q2': R(60),
  'ex-4am-khawas-dawaran-l5-007:q1': P(...center([3, 3], [0, 2], [5, 1], [2, 4])),
  'ex-4am-khawas-dawaran-l5-008:q1': P(...rot(rot([3, -2], [0, 0], 90), [0, 0], 90)),
  'ex-4am-khawas-dawaran-l5-009:q1': P(...center([0, 0], [3, 0], [1, 2], [2, -2])),
  'ex-4am-khawas-dawaran-l5-010:q1': R(Math.round(0.35 * 0.35 / 2 * 1000) / 1000),
};
