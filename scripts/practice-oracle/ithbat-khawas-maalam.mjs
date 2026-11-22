// Oracle du banc « ithbat-khawas-maalam » (unité 12 « الأشعة في معلم ») — chaque réponse construite RECALCULÉE ici à partir des
// coordonnées de l'énoncé avec les fractions exactes de helpers.mjs (q, R, P), sans lire le contenu ni
// packages/core/arithmetic/vectors.js ni la logique du lab : carrés des distances, milieux, composantes, quatrième sommet,
// inconnue d'une condition LINÉAIRE (le y² s'en va) par deux évaluations, ou recherche entière bornée.
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par l'aller-retour du validateur.
// Écrit par le générateur de l'auteur (scratch u1x-ithbat-khawas-maalam/gen.mjs).
import { R, P, q } from './helpers.mjs';

const sq = (v) => q(v).mul(v);
/** Le carré de la distance AB (fraction exacte). */
const d2 = (A, B) => sq(q(B[0]).sub(A[0])).add(sq(q(B[1]).sub(A[1])));
const mid = (A, B) => P(q(A[0]).add(B[0]).div(2), q(A[1]).add(B[1]).div(2));
const vec = (A, B) => P(q(B[0]).sub(A[0]), q(B[1]).sub(A[1]));
const eqQ = (a, b) => q(a).sub(b).isZero();
/** La racine d'une fonction AFFINE de t (rationnelle exacte) : t = −f(0) / (f(1) − f(0)). */
const lin = (f) => { const f0 = q(f(0)); const f1 = q(f(1)); return f0.neg().div(f1.sub(f0)); };
/** Le premier entier de [−30 ; 30] qui vérifie la condition (une seule solution attendue). */
function search(pred) {
  const sols = [];
  for (let t = -30; t <= 30; t += 1) if (pred(t)) sols.push(t);
  if (sols.length !== 1) throw new Error(`search : ${sols.length} solutions`);
  return sols[0];
}

export const ORACLE = {
  'ex-4am-ithbat-khawas-maalam-l1-001:q1': R(d2([1,2], [4,6])),
  'ex-4am-ithbat-khawas-maalam-l1-008:q1': mid([-1,3], [5,1]),
  'ex-4am-ithbat-khawas-maalam-l1-009:q1': R(d2([0,0], [3,-4])),
  'ex-4am-ithbat-khawas-maalam-l2-001:q1': R(d2([6,-1], [2,3])),
  'ex-4am-ithbat-khawas-maalam-l2-002:q1': vec([2,2], [2,-2]),
  'ex-4am-ithbat-khawas-maalam-l2-003:q1': mid([-2,0], [0,-2]),
  'ex-4am-ithbat-khawas-maalam-l2-003:q2': R(d2([0, 0], [-1, -1])),
  'ex-4am-ithbat-khawas-maalam-l2-004:q1': R(d2([4,0], [0,3])),
  'ex-4am-ithbat-khawas-maalam-l2-006:q1': vec([2,3], [6,4]),
  'ex-4am-ithbat-khawas-maalam-l2-007:q1': R(d2([1,1], [4,5])),
  'ex-4am-ithbat-khawas-maalam-l2-009:q1': R(Math.sqrt(Number(d2([0, 0], [-6,8]).toString()))),
  'ex-4am-ithbat-khawas-maalam-l3-001:q1': mid([3,0], [2,5]),
  'ex-4am-ithbat-khawas-maalam-l3-001:q2': R(d2([3,0], [0,2])),
  'ex-4am-ithbat-khawas-maalam-l3-002:q1': vec([4,3], [6,-3]),
  'ex-4am-ithbat-khawas-maalam-l3-002:q2': R(d2([1,2], [6,-3])),
  'ex-4am-ithbat-khawas-maalam-l3-003:q2': P(q(-3).add(4).sub(1), q(1).add(0).sub(4)),
  'ex-4am-ithbat-khawas-maalam-l3-004:q1': R(d2([3,4], [8,4])),
  'ex-4am-ithbat-khawas-maalam-l3-006:q1': R(d2([0, 0], [0,3])),
  'ex-4am-ithbat-khawas-maalam-l3-007:q1': R(d2([-2,1], [3,0])),
  'ex-4am-ithbat-khawas-maalam-l3-008:q1': P(q(-1).add(5).sub(3), q(0).add(2).sub(-2)),
  'ex-4am-ithbat-khawas-maalam-l4-001:q1': mid([1,0], [3,4]),
  'ex-4am-ithbat-khawas-maalam-l4-001:q2': R(d2([2, 2], [0,3])),
  'ex-4am-ithbat-khawas-maalam-l4-003:q2': P(q(-3).add(2).sub(-4), q(3).add(-2).sub(-3)),
  'ex-4am-ithbat-khawas-maalam-l4-003:q3': R(q(Math.round(Math.sqrt(Number(d2([2,-2], [-3,3]).mul(d2([-4,-3], [3,4])).toString())))).div(2)),
  'ex-4am-ithbat-khawas-maalam-l4-004:q1': R(q('-3/2').mul('-3/2').add('3/4')),
  'ex-4am-ithbat-khawas-maalam-l4-004:q2': R(q('1/4').add('3/4')),
  'ex-4am-ithbat-khawas-maalam-l4-005:q1': R(d2([1,-3], [0,2])),
  'ex-4am-ithbat-khawas-maalam-l4-006:q1': R(d2([0,5], [-3,-1])),
  'ex-4am-ithbat-khawas-maalam-l4-008:q1': R(Math.sqrt(Number(d2([-1,2], [2,6]).toString()))),
  'ex-4am-ithbat-khawas-maalam-l4-009:q1': mid([-2,0], [4,3]),
  'ex-4am-ithbat-khawas-maalam-l4-010:q1': R(d2([2,5], [4,1])),
  'ex-4am-ithbat-khawas-maalam-l5-001:q1': R(lin((y) => d2([0, 2], [-4, 0]).add(d2([-4, 0], [-2, y])).sub(d2([0, 2], [-2, y])))),
  'ex-4am-ithbat-khawas-maalam-l5-002:q1': R(search((y) => y > 1 && eqQ(d2([3, y], [1,1]).add(d2([3, y], [5,1])), d2([1,1], [5,1])))),
  'ex-4am-ithbat-khawas-maalam-l5-003:q1': R(lin((x) => d2([1,3], [3,1]).add(d2([3,1], [x, -1])).sub(d2([1,3], [x, -1])))),
  'ex-4am-ithbat-khawas-maalam-l5-004:q1': P(q(0).add(5).sub(3), q(1).add(6).sub(0)),
  'ex-4am-ithbat-khawas-maalam-l5-005:q1': R(search((k) => k > 0 && eqQ(d2([0, 0], [k, 3]), 25))),
  'ex-4am-ithbat-khawas-maalam-l5-006:q1': R(lin((x) => q(9).sub(x).sub(q(4).sub(0)))),
  'ex-4am-ithbat-khawas-maalam-l5-007:q1': R(d2([-3,2], [4,1])),
  'ex-4am-ithbat-khawas-maalam-l5-008:q1': mid([-4,2], [2,-6]),
  'ex-4am-ithbat-khawas-maalam-l5-008:q2': R(Math.sqrt(Number(d2([-1, -2], [-4,2]).toString()))),
  'ex-4am-ithbat-khawas-maalam-l5-010:q1': R(lin((y) => d2([1,2], [5,4]).add(d2([1,2], [-1, y])).sub(d2([5,4], [-1, y])))),
};
