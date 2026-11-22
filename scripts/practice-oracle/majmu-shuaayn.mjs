// Oracle du banc « majmu-shuaayn » (unité 11 « الأشعة والانسحاب », درس 3) — chaque réponse construite RECALCULÉE ici à
// partir des nombres de l'énoncé (helpers.mjs : R, q ; Math.hypot / asin en degrés et un arrondi écrit ici), sans lire le
// contenu ni packages/core/arithmetic/vectors.js ni la logique du lab. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les QCM sont vérifiés par l'aller-retour du validateur. Écrit par le générateur de l'auteur (scratch u1x-majmu-shuaayn/gen.py).
import { R, q } from './helpers.mjs';

const asin = (v) => (Math.asin(v) * 180) / Math.PI;
/** L'arrondi « au plus près », n décimales, écrit avec un point. */
const rnd = (x, n) => { const k = 10 ** n; return (Math.floor(x * k + 0.5 + 1e-9) / k).toFixed(n); };

export const ORACLE = {
  'ex-4am-majmu-shuaayn-l2-006:q1': R(q(3).add(5)),
  'ex-4am-majmu-shuaayn-l2-007:q1': R(q(4).add(2).sub(2)),
  'ex-4am-majmu-shuaayn-l4-001:q1': R(Math.hypot(4, 3)),
  'ex-4am-majmu-shuaayn-l4-002:q1': R(Math.hypot(6, 8)),
  'ex-4am-majmu-shuaayn-l4-004:q1': R(rnd(asin(2 / 4), 0)),
  'ex-4am-majmu-shuaayn-l4-005:q1': R(Math.sqrt(5 ** 2 - 3 ** 2)),
  'ex-4am-majmu-shuaayn-l4-005:q2': R(rnd(asin(3 / 5), 0)),
  'ex-4am-majmu-shuaayn-l4-006:q1': R(Math.hypot(4, 3)),
  'ex-4am-majmu-shuaayn-l4-006:q2': R(q(80).mul(3).div(4)),
  'ex-4am-majmu-shuaayn-l5-002:q1': R(Math.hypot(4, 3)),
  'ex-4am-majmu-shuaayn-l5-002:q2': R(q(4).add(3).sub(Math.hypot(4, 3))),
  'ex-4am-majmu-shuaayn-l5-003:q1': R(q(120).mul(3).div(5)),
  'ex-4am-majmu-shuaayn-l5-004:q1': R(rnd(asin(3 / 6), 0)),
  'ex-4am-majmu-shuaayn-l5-007:q1': R(q('1.2').add('0.8')),
  'ex-4am-majmu-shuaayn-l5-007:q2': R(q(2).sub('0.8')),
  'ex-4am-majmu-shuaayn-l5-010:q1': R(Math.hypot(8, 6)),
  'ex-4am-majmu-shuaayn-l5-010:q2': R(q(400).mul(6).div(8)),
};
