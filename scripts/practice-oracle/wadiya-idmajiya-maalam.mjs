// Oracle du banc « wadiya-idmajiya-maalam » (unité 12 « الأشعة في معلم ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/vectors.js ni la logique du lab : Math.hypot pour les
// distances (√((Δx)² + (Δy)²)), Math.PI pour les demi-cercles (π r), les rationnels exacts de helpers.mjs (q) pour les milieux,
// les extrémités (symétriques) et les composantes ; `roundTo` (demi-supérieur) pour les valeurs arrondies. Les QCM sont vérifiés
// par l'aller-retour du validateur. Fusionné dans scripts/practice-answer-oracle.test.mjs. Généré avec le banc (gen_bank.py de
// l'auteur).
import { R, P, q } from './helpers.mjs';

/** Arrondi décimal au demi-supérieur, en chaîne avec un point (sans zéros finaux). */
function roundTo(x, k) {
  const f = 10 ** k;
  const v = Math.round((x + Math.sign(x) * 1e-9) * f) / f;
  return String(Number(v.toFixed(k)));
}

export const ORACLE = {
  'ex-4am-wadiya-idmajiya-maalam-l1-004:q1': P(-3, 2),
  'ex-4am-wadiya-idmajiya-maalam-l1-006:q1': P(...[[-5, 1], [0, 0]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l1-007:q1': R(Math.hypot(7 - 1, 10 - 2)),
  'ex-4am-wadiya-idmajiya-maalam-l1-008:q1': P(-3 - 2, 3 - (-1)),
  'ex-4am-wadiya-idmajiya-maalam-l1-010:q1': R(roundTo(5 * Math.PI, 2)),
  'ex-4am-wadiya-idmajiya-maalam-l2-004:q1': R(roundTo(Math.hypot(4 - (-2), 5 - 1), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l2-005:q1': P(...[[-1, 5], [0, 0]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l2-005:q2': R(q(5 - (-1)).div(2).toString()),
  'ex-4am-wadiya-idmajiya-maalam-l2-006:q1': R(Math.hypot(1 - (-2), 5 - 1) + Math.hypot(0, -1 - 5)),
  'ex-4am-wadiya-idmajiya-maalam-l2-007:q1': P(...[[-3, 5], [4, -2]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l2-008:q1': P(3 - (-1), 1 - 3),
  'ex-4am-wadiya-idmajiya-maalam-l3-001:q3': R(roundTo(Math.hypot(1 - (-2), 1 - 3) + Math.hypot(3 - 1, 2 - 1) + Math.hypot(4 - 3, -2 - 2), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l3-003:q1': P(...[[-4, 0], [0, 0]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l3-003:q2': P(...[[0, 6], [0, 0]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l3-004:q1': R(Math.hypot(-1 - (-4), 2 - (-2)) + Math.hypot(5 - (-1), -6 - 2)),
  'ex-4am-wadiya-idmajiya-maalam-l3-005:q1': P(2 * -1 - (-3), 2 * 0 - 0),
  'ex-4am-wadiya-idmajiya-maalam-l3-006:q1': P(2, 2),
  'ex-4am-wadiya-idmajiya-maalam-l3-008:q1': R(roundTo(Math.hypot(2, 2) + Math.hypot(3 - 2, 4 - 2), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l3-009:q1': R(roundTo(3 * Math.PI * 0.5, 2)),
  'ex-4am-wadiya-idmajiya-maalam-l3-010:q1': P(2 * 2 - (-1), 2 * 0 - 0),
  'ex-4am-wadiya-idmajiya-maalam-l4-001:q2': P(3 + (-3 - 3) + (5 - 3), 5 + (1 - 5) + (2 - 5)),
  'ex-4am-wadiya-idmajiya-maalam-l4-001:q4': R(roundTo(Math.hypot(6, 4) * Math.hypot(2, -3), 6)),
  'ex-4am-wadiya-idmajiya-maalam-l4-001:q5': P(-1 + 2, -2 + 0),
  'ex-4am-wadiya-idmajiya-maalam-l4-002:q3': P(-2 + (2 - 4), -3 + (4 - 1)),
  'ex-4am-wadiya-idmajiya-maalam-l4-003:q3': R(roundTo(3.5 * Math.PI - (Math.hypot(3, 4) + Math.hypot(4, -4)), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l4-004:q1': R(Math.sqrt(5 ** 2 - (4 - 1) ** 2)),
  'ex-4am-wadiya-idmajiya-maalam-l4-005:q1': R(q(26 - 10).div(12).toString()),
  'ex-4am-wadiya-idmajiya-maalam-l4-008:q1': R(roundTo(Math.PI * (1 - (-3)) / 2 + Math.hypot(4 - 1, 4 - 0), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l4-009:q1': R(q("1.5").mul(2).toString()),
  'ex-4am-wadiya-idmajiya-maalam-l5-001:q2': P(...[[1, 5], [3, 1]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l5-001:q4': R(roundTo(Math.atan(1 / 3) * 180 / Math.PI, 1)),
  'ex-4am-wadiya-idmajiya-maalam-l5-002:q1': R(roundTo(Math.PI * 1 + Math.PI * 2 + Math.hypot(4 - 2, 2 - 0), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l5-002:q2': R(roundTo(Math.hypot(0 - (-4), 4 - 3) + Math.hypot(3 - 0, 5 - 4) + Math.hypot(4 - 3, 2 - 5), 2)),
  'ex-4am-wadiya-idmajiya-maalam-l5-004:q1': R(roundTo(4 * Math.PI / Math.PI, 6)),
  'ex-4am-wadiya-idmajiya-maalam-l5-004:q2': P(-5 + 2 * 4, 0),
  'ex-4am-wadiya-idmajiya-maalam-l5-005:q1': R(Math.hypot(4, 3) + Math.hypot(4, -3) + Math.hypot(8, 0)),
  'ex-4am-wadiya-idmajiya-maalam-l5-006:q1': P(...[[6, 0], [0, 8]].map(([a, b]) => q(a).add(b).div(2).toString())),
  'ex-4am-wadiya-idmajiya-maalam-l5-006:q2': R(Math.hypot(6, 8) / 2),
  'ex-4am-wadiya-idmajiya-maalam-l5-007:q1': R(roundTo(((2 * Math.PI + 1) - (Math.sqrt(13) + Math.sqrt(10))) * 1000, 0)),
  'ex-4am-wadiya-idmajiya-maalam-l5-008:q1': P(-2 + 5 - 2, -1 + (-2) - 2),
  'ex-4am-wadiya-idmajiya-maalam-l5-008:q2': R(2 * (Math.hypot(4, 3) + Math.hypot(3, -4))),
  'ex-4am-wadiya-idmajiya-maalam-l5-009:q1': R((Math.hypot(3, 4) + Math.hypot(6, 8)) * 0.5),
};
