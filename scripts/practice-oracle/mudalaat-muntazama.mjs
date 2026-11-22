// Oracle du banc « mudalaat-muntazama » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة ») — chaque réponse construite
// RECALCULÉE ici à partir des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/rotation.js ni la logique
// du lab : les angles en rationnels exacts (helpers.mjs, q), les longueurs avec Math.sin / cos en DEGRÉS et l'arrondi de
// l'oracle (au demi supérieur, `rnd`), un quart de tour par sa propre formule (`rot90`). Les QCM sont vérifiés par
// l'aller-retour du validateur. Écrit par le générateur de l'auteur (scratch u13-mudalaat-muntazama/gen.py) ; fusionné
// dans scripts/practice-answer-oracle.test.mjs.
import { R, P, q } from './helpers.mjs';

const D = Math.PI / 180;
const sin = (d) => Math.sin(d * D);
const cos = (d) => Math.cos(d * D);
/** L'arrondi de l'oracle : au demi supérieur, à `d` décimales, écrit avec un point. */
const rnd = (x, d) => (Math.round(x * 10 ** d + 1e-9) / 10 ** d).toFixed(d);
/** L'image de (x ; y) par le quart de tour de centre O : sens = 1 (direct) ou −1 (indirect). */
const rot90 = (x, y, sense) => (sense === 1 ? [-y, x] : [y, -x]);

export const ORACLE = {
  'ex-4am-mudalaat-muntazama-l1-003:q1': R(q(360).div(3)),
  'ex-4am-mudalaat-muntazama-l1-003:q2': R(q(360).div(4)),
  'ex-4am-mudalaat-muntazama-l1-003:q3': R(q(360).div(6)),
  'ex-4am-mudalaat-muntazama-l1-006:q1': R(q(360).div(5)),
  'ex-4am-mudalaat-muntazama-l1-007:q1': R(q(360).div(36)),
  'ex-4am-mudalaat-muntazama-l1-009:q1': R(q(360).div(12)),
  'ex-4am-mudalaat-muntazama-l1-010:q1': R(q(360).div(6)),
  'ex-4am-mudalaat-muntazama-l2-001:q1': R(q(60).mul(2)),
  'ex-4am-mudalaat-muntazama-l2-003:q1': R(q(360).div(10)),
  'ex-4am-mudalaat-muntazama-l2-004:q1': R(q(360).div(7)),
  'ex-4am-mudalaat-muntazama-l2-004:q2': R(rnd(360 / 7, 0)),
  'ex-4am-mudalaat-muntazama-l2-005:q1': R(q(360).div(3)),
  'ex-4am-mudalaat-muntazama-l2-006:q1': R(q(360).div(40)),
  'ex-4am-mudalaat-muntazama-l2-008:q1': P(...rot90(3, 1, 1)),
  'ex-4am-mudalaat-muntazama-l2-009:q1': P(...rot90(3, 1, -1)),
  'ex-4am-mudalaat-muntazama-l3-001:q1': R(q(180).sub(q(360).div(5))),
  'ex-4am-mudalaat-muntazama-l3-002:q1': R(q(10).sub(2).mul(180).div(10)),
  'ex-4am-mudalaat-muntazama-l3-003:q1': R(rnd(900 / 7, 0)),
  'ex-4am-mudalaat-muntazama-l3-004:q1': R(q(8).sub(2).mul(180).div(8)),
  'ex-4am-mudalaat-muntazama-l3-006:q1': R(q(12).sub(2).mul(180).div(12)),
  'ex-4am-mudalaat-muntazama-l3-007:q1': R(q(360).div(q(180).sub(140))),
  'ex-4am-mudalaat-muntazama-l3-009:q1': R(q(180).sub(45).div(2)),
  'ex-4am-mudalaat-muntazama-l3-010:q1': R(q(6).sub(2).mul(180)),
  'ex-4am-mudalaat-muntazama-l4-001:q1': R(rnd(2 * Math.sqrt(3) * cos(30), 6)),
  'ex-4am-mudalaat-muntazama-l4-002:q1': R(rnd(Math.sqrt(8) * cos(45), 6)),
  'ex-4am-mudalaat-muntazama-l4-003:q1': R(q(96).div(6)),
  'ex-4am-mudalaat-muntazama-l4-005:q1': R(rnd(2 * 4 * sin(36), 2)),
  'ex-4am-mudalaat-muntazama-l4-006:q1': R(rnd(2 * 5 * sin(30), 6)),
  'ex-4am-mudalaat-muntazama-l4-009:q1': R(rnd(2 * 6 * sin(36), 2)),
  'ex-4am-mudalaat-muntazama-l4-010:q1': R(rnd(2 * 60 * sin(22.5), 2)),
  'ex-4am-mudalaat-muntazama-l5-001:q1': R(rnd(5 / sin(36), 2)),
  'ex-4am-mudalaat-muntazama-l5-002:q1': R(rnd(384 * Math.sqrt(3) / (256 * Math.PI), 2)),
  'ex-4am-mudalaat-muntazama-l5-003:q1': R(rnd(16 * Math.PI, 2)),
  'ex-4am-mudalaat-muntazama-l5-006:q1': R(rnd(2 * 8 * sin(18), 2)),
  'ex-4am-mudalaat-muntazama-l5-007:q1': R(q(6).mul(q("2.7"))),
  'ex-4am-mudalaat-muntazama-l5-008:q1': R(rnd(3 / sin(36), 2)),
  'ex-4am-mudalaat-muntazama-l5-009:q1': R(rnd(2 * 40 * sin(22.5), 2)),
};
