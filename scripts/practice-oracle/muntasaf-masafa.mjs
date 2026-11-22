// Oracle du banc « muntasaf-masafa » (unité 12 « الأشعة في معلم ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé (helpers.mjs : R, C, P, q), sans lire le contenu ni packages/core/arithmetic/vectors.js ni la logique du lab.
// La mathématique du درس, réécrite ici : le milieu ((xA + xB)/2 ; (yA + yB)/2), l'autre extrémité 2·xI − xA, le carré de la
// distance (xB − xA)² + (yB − yA)², sa racine EXACTE quand c'est un carré parfait (sinon l'oracle échoue), l'arrondi au dixième,
// et pour les QCM à racine : le choix dont le CARRÉ déclaré égale le carré recalculé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM conceptuels sont vérifiés par l'aller-retour du validateur.
import { R, C, P, q } from './helpers.mjs';

/** Le milieu d'une coordonnée. */
const mid = (a, b) => q(a).add(b).div(2).toString();
/** L'autre extrémité connaissant le milieu i et une extrémité a : 2i − a. */
const other = (i, a) => q(i).mul(2).sub(a).toString();
/** Le carré de la distance entre (x1 ; y1) et (x2 ; y2). */
const d2 = (x1, y1, x2, y2) => { const dx = q(x2).sub(x1); const dy = q(y2).sub(y1); return dx.mul(dx).add(dy.mul(dy)).toString(); };
/** La racine d'un carré parfait rationnel (sinon : erreur — la clé ne serait pas exacte). */
function root(sq) {
  const s = q(sq); const n = Number(s.n); const d = Number(s.d);
  const rn = Math.round(Math.sqrt(n)); const rd = Math.round(Math.sqrt(d));
  if (rn * rn !== n || rd * rd !== d) throw new Error(`racine non rationnelle : ${sq}`);
  return q(rn).div(rd).toString();
}
/** √(carré) arrondi au dixième, écrit avec un point. */
const round1 = (sq) => { const s = q(sq); return (Math.round(Math.sqrt(Number(s.n) / Number(s.d)) * 10) / 10).toFixed(1); };
const eqQ = (a, b) => q(a).sub(b).isZero();
const sameP = ([x, y], [a, b]) => eqQ(x, a) && eqQ(y, b);
/** Le choix d'un QCM dont le couple déclaré est le milieu recalculé. */
const pickPt = (pt, map) => Object.keys(map).find((k) => sameP(pt, map[k]));
/** Le choix d'un QCM de longueur dont le CARRÉ déclaré égale le carré recalculé. */
const pickSq = (sq, map) => Object.keys(map).find((k) => eqQ(map[k], sq));
/** (𝒞) de centre O, r² donné : (x ; y) donné par x², y² (les coordonnées √2 du manuel). */
const onCircleSq = (x2, y2, r2) => eqQ(q(x2).add(y2), r2);
/** M(x ; 0) tel que MA = MB : (xA − x)² + yA² = (xB − x)² + yB² ⇔ 2x(xB − xA) = xB² + yB² − xA² − yA². */
const solveEquidistant = (xa, ya, xb, yb) => {
  const sq = (v) => q(v).mul(v);
  return q(sq(xb)).add(sq(yb)).sub(sq(xa)).sub(sq(ya)).div(q(xb).sub(xa).mul(2)).toString();
};

export const ORACLE = {
  'ex-4am-muntasaf-masafa-l1-001:q1': C(pickPt([mid('-2', '-1'), mid('-1', '1')], { A: ['-3/2', '0'], B: ['3/2', '0'], C: ['0', '-3/2'] })),
  'ex-4am-muntasaf-masafa-l1-002:q1': C(pickSq(d2('0', '0', '4', '3'), { A: '25', B: '49/4', C: '49' })),
  'ex-4am-muntasaf-masafa-l1-003:q1': P(mid('3', '-4'), mid('-4', '3')),
  'ex-4am-muntasaf-masafa-l1-004:q1': R(root(d2('2', '5', '-1', '1'))),
  'ex-4am-muntasaf-masafa-l1-005:q1': P(mid('2', '8'), mid('6', '4')),
  'ex-4am-muntasaf-masafa-l1-006:q1': R(root(d2('1', '2', '7', '10'))),
  'ex-4am-muntasaf-masafa-l1-009:q1': P(mid('-3', '1'), mid('2', '-2')),
  'ex-4am-muntasaf-masafa-l1-010:q1': R(root(d2('-2', '-1', '2', '2'))),
  'ex-4am-muntasaf-masafa-l2-001:q1': P(mid('5', '1'), mid('9', '-3')),
  'ex-4am-muntasaf-masafa-l2-002:q1': R(root(d2('2', '1', '-1', '1'))),
  'ex-4am-muntasaf-masafa-l2-003:q1': P(mid('-5', '-6'), mid('2', '-3')),
  'ex-4am-muntasaf-masafa-l2-004:q1': P(mid('5', '-3'), mid('3', '1')),
  'ex-4am-muntasaf-masafa-l2-005:q1': R(root(d2('5', '1', '1', '-2'))),
  'ex-4am-muntasaf-masafa-l2-006:q1': C(pickSq(d2('2', '3', '4', '1'), { A: '8', B: '16', C: '64' })),
  'ex-4am-muntasaf-masafa-l2-007:q1': P(mid('1/2', '-5/2'), mid('3', '-1')),
  'ex-4am-muntasaf-masafa-l2-008:q1': R(root(d2('-3', '-2', '3', '6'))),
  'ex-4am-muntasaf-masafa-l2-009:q1': R(d2('-1', '4', '4', '2')),
  'ex-4am-muntasaf-masafa-l2-010:q1': P(mid('-4', '6'), mid('7', '-1')),
  'ex-4am-muntasaf-masafa-l3-001:q1': C(pickSq(d2('0', '2', '3', '4'), { A: '13', B: '25', C: '169' })),
  'ex-4am-muntasaf-masafa-l3-001:q2': R(root(d2('0', '2', '1', '2'))),
  'ex-4am-muntasaf-masafa-l3-001:q3': C(pickSq(d2('1', '2', '3', '4'), { A: '8', B: '16', C: '64' })),
  'ex-4am-muntasaf-masafa-l3-002:q1': C(pickSq(d2('3', '3', '-3', '-3'), { A: '72', B: '144', C: '5184' })),
  'ex-4am-muntasaf-masafa-l3-003:q1': C(onCircleSq('2', '0', '2') ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l3-003:q2': C(onCircleSq('2', '2', '2') ? 'B' : 'A'),
  'ex-4am-muntasaf-masafa-l3-004:q1': P(other('2', '-1'), other('-1', '3')),
  'ex-4am-muntasaf-masafa-l3-005:q1': C(pickSq(d2('-2', '-1', '4', '3'), { A: '52', B: '100', C: '2704' })),
  'ex-4am-muntasaf-masafa-l3-006:q1': C(pickSq(d2('1', '-2', '4', '1'), { A: '18', B: '36', C: '324' })),
  'ex-4am-muntasaf-masafa-l3-007:q1': P(other('1', '3'), other('1', '-2')),
  'ex-4am-muntasaf-masafa-l3-008:q1': R(round1(d2('0', '-3', '5', '1'))),
  'ex-4am-muntasaf-masafa-l3-009:q1': P(mid('-2', '4'), mid('1', '-7')),
  'ex-4am-muntasaf-masafa-l3-009:q2': R(q(root(d2('-2', '1', '4', '-7'))).div(2)),
  'ex-4am-muntasaf-masafa-l3-010:q1': C(sameP([mid('-1', '5'), mid('1', '5')], ['2', '3']) ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l4-001:q1': P(mid('0', '-6'), mid('0', '-3')),
  'ex-4am-muntasaf-masafa-l4-002:q1': P(mid('-4', '2'), mid('3', '-5')),
  'ex-4am-muntasaf-masafa-l4-002:q2': R(q(root(d2('-4', '3', '2', '-5'))).mul(100)),
  'ex-4am-muntasaf-masafa-l4-003:q1': R(q(root(d2('-3', '2', '5', '-4'))).mul(10)),
  'ex-4am-muntasaf-masafa-l4-004:q1': P(mid('-2', '4'), mid('1', '9')),
  'ex-4am-muntasaf-masafa-l4-004:q2': R(root(d2('-2', '1', '4', '9'))),
  'ex-4am-muntasaf-masafa-l4-005:q1': R(q(6).add(8).sub(root(d2('1', '1', '7', '9'))).mul(100)),
  'ex-4am-muntasaf-masafa-l4-006:q1': C(eqQ(d2('2', '-1', '5', '3'), '25') ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l4-007:q1': R(q(root(d2('-6', '-2', '6', '3'))).mul(5)),
  'ex-4am-muntasaf-masafa-l4-008:q1': R(round1(d2('-2', '1', '3', '4'))),
  'ex-4am-muntasaf-masafa-l4-009:q1': P(mid('-1', '5'), mid('2', '-2')),
  'ex-4am-muntasaf-masafa-l4-010:q1': P(other('3', '-1'), other('1', '4')),
  'ex-4am-muntasaf-masafa-l5-001:q1': P(other('2', '-1'), other('1', '1')),
  'ex-4am-muntasaf-masafa-l5-001:q2': P(other('3', '-1'), other('-1', '1')),
  'ex-4am-muntasaf-masafa-l5-001:q3': P(q('3').add(q('2').sub('-1')), q('-1').add(q('1').sub('1'))),
  'ex-4am-muntasaf-masafa-l5-001:q4': C(sameP([mid('5', '7'), mid('1', '-3')], [q('3').add(3), '-1']) ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l5-002:q1': C(pickSq(d2('2/3', '-2', '-4', '7/3'), { A: '365/9', B: '81', C: '133225/81' })),
  'ex-4am-muntasaf-masafa-l5-003:q1': R(q(root(d2('1', '1', '4', '5'))).add(root(d2('4', '5', '1', '5'))).add(root(d2('1', '5', '1', '1')))),
  'ex-4am-muntasaf-masafa-l5-004:q1': R(solveEquidistant('1', '3', '5', '1')),
  'ex-4am-muntasaf-masafa-l5-005:q1': P(q(mid('-2', '4')).mul(2).sub('3'), q(mid('1', '-2')).mul(2).sub('2')),
  'ex-4am-muntasaf-masafa-l5-006:q1': P(mid('-4', '4'), mid('-1', '5')),
  'ex-4am-muntasaf-masafa-l5-006:q2': R(q(root(d2('-4', '-1', mid('-4', '4'), mid('-1', '5')))).mul(10)),
  'ex-4am-muntasaf-masafa-l5-007:q1': C(eqQ(d2('1', '1', '-2', '5'), d2('1', '1', '5', '-2')) ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l5-008:q1': P(mid('-3', '5'), mid('-2', '4')),
  'ex-4am-muntasaf-masafa-l5-008:q2': R(q(root(d2('-3', '-2', '5', '4'))).div(2)),
  'ex-4am-muntasaf-masafa-l5-008:q3': C(eqQ(d2(mid('-3', '5'), mid('-2', '4'), '4', '5'), q(d2('-3', '-2', '5', '4')).div(4)) ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l5-009:q1': C(eqQ(d2('-1', '5', '3', '2'), '25') ? 'A' : 'B'),
  'ex-4am-muntasaf-masafa-l5-010:q1': P(mid('-5', '3'), mid('2', '-4')),
  'ex-4am-muntasaf-masafa-l5-010:q2': R(q(root(d2('-5', '2', '3', '-4'))).div(2).mul(50)),
};
