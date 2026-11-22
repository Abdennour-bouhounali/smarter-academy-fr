// Oracle du banc « maqati-mustawiya » (unité 14 « الهندسة في الفضاء ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/space.js ni la logique du lab : les longueurs par
// Math.sqrt / Math.hypot (Pythagore), les décimaux du manuel par le calculateur rationnel de helpers.mjs (q), l'arrondi de
// l'oracle (au demi supérieur, `rnd`). Les QCM numériques (racines exactes) ont aussi leur entrée : l'oracle recalcule la
// valeur et désigne l'option qui la porte (`pick`, sur les valeurs des options dans l'ordre affiché). Écrit par le générateur de
// l'auteur (scratch u14-maqati-mustawiya/gen.py) ; fusionné dans scripts/practice-answer-oracle.test.mjs.
import { R, C, q } from './helpers.mjs';

/** Une fraction de helpers.mjs en nombre (pour Math.sqrt). */
const num = (x) => Number(x.n) / Number(x.d);
/** L'arrondi de l'oracle : au demi supérieur, à `d` décimales, écrit avec un point. */
const rnd = (x, d) => (Math.round(x * 10 ** d + 1e-9) / 10 ** d).toFixed(d);
/** L'option (A, B, C…) dont la valeur numérique est la valeur recalculée. */
const pick = (values, target) => {
  const i = values.findIndex((v) => Math.abs(v - target) < 1e-9);
  if (i < 0) throw new Error(`aucune option ne vaut ${target}`);
  return C('ABCD'[i]);
};

export const ORACLE = {
  'ex-4am-maqati-mustawiya-l2-001:q1': R(Math.sqrt(10 ** 2 - 6 ** 2)),
  'ex-4am-maqati-mustawiya-l2-002:q1': R(Math.sqrt(num(q('2.5').mul(q('2.5')).sub(q('1.5').mul(q('1.5')))))),
  'ex-4am-maqati-mustawiya-l2-003:q1': R(Math.sqrt(13 ** 2 - 12 ** 2)),
  'ex-4am-maqati-mustawiya-l2-004:q1': R(20 * 6),
  'ex-4am-maqati-mustawiya-l2-005:q1': R(8 * 5),
  'ex-4am-maqati-mustawiya-l2-006:q1': R(2 * Math.sqrt(num(q('1.7').mul(q('1.7')).sub(q('0.8').mul(q('0.8')))))),
  'ex-4am-maqati-mustawiya-l2-007:q1': R(2 * Math.sqrt(5 ** 2 - 4 ** 2)),
  'ex-4am-maqati-mustawiya-l2-008:q1': R(q(3).div(4).mul(4)),
  'ex-4am-maqati-mustawiya-l2-009:q1': R(q(1).div(4).mul(12)),
  'ex-4am-maqati-mustawiya-l2-010:q1': R(q(3).div(4).mul(8)),
  'ex-4am-maqati-mustawiya-l3-001:q1': pick([1.75, 3.25, Math.sqrt(119) / 4], Math.sqrt(3 ** 2 - 1.25 ** 2)),
  'ex-4am-maqati-mustawiya-l3-002:q1': R(rnd(Math.sqrt(3 ** 2 - 2.8 ** 2), 2)),
  'ex-4am-maqati-mustawiya-l3-004:q1': R(Math.hypot(25 - 21, 20 - 17)),
  'ex-4am-maqati-mustawiya-l3-005:q1': R(Math.hypot(4, 3) * 6),
  'ex-4am-maqati-mustawiya-l3-006:q1': pick([2 * Math.sqrt(3), 2, Math.sqrt(3)], 2 * Math.sqrt(2 ** 2 - 1 ** 2)),
  'ex-4am-maqati-mustawiya-l3-007:q1': pick([6, 3 * Math.sqrt(3), 6 * Math.sqrt(3)], 2 * Math.sqrt(3) * 3),
  'ex-4am-maqati-mustawiya-l3-008:q1': pick([Math.sqrt(2), 3 * Math.sqrt(2), 4 * Math.sqrt(2)], 0.75 * Math.hypot(4, 4)),
  'ex-4am-maqati-mustawiya-l3-010:q1': pick([4, 2 * Math.sqrt(10), 4 * Math.sqrt(2)], Math.sqrt(6 ** 2 - 2 ** 2)),
  'ex-4am-maqati-mustawiya-l4-001:q1': R(Math.sqrt(17 ** 2 - 8 ** 2)),
  'ex-4am-maqati-mustawiya-l4-002:q1': R(Math.hypot(5, 12)),
  'ex-4am-maqati-mustawiya-l4-003:q1': pick([4, 2, Math.sqrt(34)], Math.sqrt(5 ** 2 - 3 ** 2)),
  'ex-4am-maqati-mustawiya-l4-004:q1': R(Math.hypot(8, 6) * 5),
  'ex-4am-maqati-mustawiya-l4-005:q1': R([[9, 7, 6], [9, 6, 7], [7, 6, 9]].find(([a, b]) => a * b === 54)[2]),
  'ex-4am-maqati-mustawiya-l4-006:q1': R(Math.sqrt(10 ** 2 - (12 / 2) ** 2)),
  'ex-4am-maqati-mustawiya-l4-007:q1': R(2 * Math.sqrt(num(q('6.5').mul(q('6.5')).sub(q('2.5').mul(q('2.5'))))) * 4),
  'ex-4am-maqati-mustawiya-l4-008:q1': R(q(6).div(9)),
  'ex-4am-maqati-mustawiya-l4-009:q1': R(q(3).div(5).mul(10).mul(q(3).div(5).mul(10))),
  'ex-4am-maqati-mustawiya-l4-010:q1': R(q(1).div(2).mul(6).mul(q(1).div(2).mul(6))),
  'ex-4am-maqati-mustawiya-l5-001:q1': R(rnd(Math.sqrt(12 ** 2 - 4 ** 2), 1)),
  'ex-4am-maqati-mustawiya-l5-002:q1': R(Math.sqrt(25 ** 2 - 7 ** 2)),
  'ex-4am-maqati-mustawiya-l5-003:q1': R(5 ** 2 - 3 ** 2),
  'ex-4am-maqati-mustawiya-l5-004:q1': R(Math.hypot(18, 24) * 6),
  'ex-4am-maqati-mustawiya-l5-006:q1': R(rnd(2 * Math.sqrt(num(q('1.3').mul(q('1.3')).sub(q('0.5').mul(q('0.5'))))) * 2, 6)),
  'ex-4am-maqati-mustawiya-l5-007:q1': pick([4, 2 * Math.sqrt(3), 4 * Math.sqrt(3)], 2 * Math.sqrt(4 ** 2 - 2 ** 2)),
  'ex-4am-maqati-mustawiya-l5-008:q1': R(q(5).div(6).mul(12).mul(q(5).div(6).mul(12))),
  'ex-4am-maqati-mustawiya-l5-009:q1': R(q(2).div(3).mul(3).mul(q(2).div(3).mul(3))),
  'ex-4am-maqati-mustawiya-l5-010:q1': R(rnd(Math.sqrt(11 ** 2 - 9 ** 2), 2)),
};
