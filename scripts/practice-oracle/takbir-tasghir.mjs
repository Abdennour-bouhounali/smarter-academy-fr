// Oracle du banc « takbir-tasghir » (unité 14 « الهندسة في الفضاء ») — chaque réponse construite RECALCULÉE ici à partir
// des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/space.js ni la logique du lab : les rapports,
// aires et volumes en rationnels exacts (helpers.mjs, q — un pavé recalculé par ses dimensions, un rapport k³ par trois
// produits), les volumes de boules avec Math.PI et l'arrondi de l'oracle (au demi supérieur, `rnd`). Les QCM sont vérifiés
// par l'aller-retour du validateur. Écrit par le générateur de l'auteur (scratch u14-takbir-tasghir/gen.py) ; fusionné dans
// scripts/practice-answer-oracle.test.mjs.
import { R, q } from './helpers.mjs';

/** L'arrondi de l'oracle : au demi supérieur, à `d` décimales, écrit avec un point. */
const rnd = (x, d) => (Math.round(x * 10 ** d + 1e-9) / 10 ** d).toFixed(d);

export const ORACLE = {
  'ex-4am-takbir-tasghir-l1-006:q1': R(q(6).div(12)),
  'ex-4am-takbir-tasghir-l1-007:q1': R(q(4).mul(3)),
  'ex-4am-takbir-tasghir-l1-010:q1': R(q(92).mul(100).div(100)),
  'ex-4am-takbir-tasghir-l2-001:q1': R(q('3/5').mul(4)),
  'ex-4am-takbir-tasghir-l2-002:q1': R(q('3/5').mul(3)),
  'ex-4am-takbir-tasghir-l2-003:q1': R(q(3).mul('2.4').mul('1.8')),
  'ex-4am-takbir-tasghir-l2-004:q1': R(q(2).mul(q(3).mul('2.4').add(q('2.4').mul('1.8')).add(q(3).mul('1.8')))),
  'ex-4am-takbir-tasghir-l2-005:q1': R(q(4).mul(q(6).mul(6))),
  'ex-4am-takbir-tasghir-l2-006:q1': R(q(5).mul(5)),
  'ex-4am-takbir-tasghir-l2-007:q1': R(q('1/2').mul('1/2').mul('1/2')),
  'ex-4am-takbir-tasghir-l2-008:q1': R(q('2/5').mul('2/5').mul('2/5').mul(250)),
  'ex-4am-takbir-tasghir-l3-001:q1': R(q(4).div(6)),
  'ex-4am-takbir-tasghir-l3-002:q1': R(q(3).div(4)),
  'ex-4am-takbir-tasghir-l3-003:q1': R(q(3).div(2)),
  'ex-4am-takbir-tasghir-l3-004:q1': R(q(270).div(27)),
  'ex-4am-takbir-tasghir-l3-005:q1': R(q('3/4').mul(4).mul(q('3/4').mul(4))),
  'ex-4am-takbir-tasghir-l3-006:q1': R(q(45).div(1000).mul(1000)),
  'ex-4am-takbir-tasghir-l3-009:q1': R(q(2).mul(q(3).mul('4.5').add(q('4.5').mul(9)).add(q(3).mul(9)))),
  'ex-4am-takbir-tasghir-l3-010:q1': R(q(81).div(27)),
  'ex-4am-takbir-tasghir-l4-001:q1': R(q(20).mul(64000).div(1000)),
  'ex-4am-takbir-tasghir-l4-002:q1': R(q(9200).div(200)),
  'ex-4am-takbir-tasghir-l4-004:q1': R(q(15).div(10).mul(q(15).div(10)).mul(q(15).div(10))),
  'ex-4am-takbir-tasghir-l4-005:q1': R(rnd(4 / 3 * Math.PI * (11 / 4) ** 3, 2)),
  'ex-4am-takbir-tasghir-l4-007:q1': R(q(8).mul(8)),
  'ex-4am-takbir-tasghir-l4-008:q1': R(q(20).mul(15).mul(10).div(1000)),
  'ex-4am-takbir-tasghir-l4-010:q1': R(q(600).div(100)),
  'ex-4am-takbir-tasghir-l5-001:q1': R(q(6).mul('4.8').mul('3.6')),
  'ex-4am-takbir-tasghir-l5-002:q1': R(q(2).mul(2)),
  'ex-4am-takbir-tasghir-l5-003:q1': R(q(270).sub(q(270).div(27))),
  'ex-4am-takbir-tasghir-l5-004:q1': R(rnd(4 / 3 * Math.PI * 3 ** 3, 2)),
  'ex-4am-takbir-tasghir-l5-006:q1': R(q(4).mul(216).div(3)),
  'ex-4am-takbir-tasghir-l5-007:q1': R(q(5).div(7)),
  'ex-4am-takbir-tasghir-l5-008:q1': R(q('1.2').mul(1000000).div(1000)),
};
