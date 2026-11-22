// Oracle du banc « zawiya-muhitiya » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة ») — chaque réponse construite RECALCULÉE
// ici à partir des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/rotation.js ni la logique du lab :
// arithmétique exacte (helpers.mjs : q) pour « la moitié / le double / la somme des angles », et, pour une réponse lue sur une
// figure, l'angle recalculé par Math.acos sur les coordonnées RECOPIÉES de la figure (points posés par direction sur un cercle
// de rayon 2), arrondi au dixième. Les sinus du BEM (ex-20 et sa transposition) par Math.asin. Fusionné dans
// scripts/practice-answer-oracle.test.mjs ; les QCM sont vérifiés par l'aller-retour du validateur. Écrit avec le générateur
// de l'auteur (scratch u13-zawiya-muhitiya/gen.py).
import { R, q } from './helpers.mjs';

/** L'angle géométrique \widehat{AVB} (degrés) de trois points nommés d'une figure. */
function angle(pts, a, v, b) {
  const [A, V, B] = [pts[a], pts[v], pts[b]];
  const u = [A[0] - V[0], A[1] - V[1]]; const w = [B[0] - V[0], B[1] - V[1]];
  const c = (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}
/** Un angle lu sur une figure (coordonnées arrondies au dix-millième) : au dixième de degré. */
const deg = (x) => Math.round(x * 10) / 10;

const KNOW4 = {"O": [0, 0], "A": [-1.0, -1.7321], "B": [1.5321, -1.2856], "M": [-1.8794, 0.684], "N": [-0.3473, 1.9696]};
const EX10 = {"O": [0, 0], "A": [1.0, 1.7321], "B": [-2.0, 0.0], "C": [1.0, -1.7321], "D": [-1.4142, 1.4142], "E": [1.4142, -1.4142]};
const EX11 = {"O": [0, 0], "A": [-1.9696, -0.3473], "C": [1.9696, 0.3473], "B": [0.684, -1.8794], "D": [-0.684, 1.8794]};
const EX12 = {"O": [0, 0], "B": [-2.0, 0.0], "D": [2.0, 0.0], "C": [-1.0, 1.7321], "A": [1.0, 1.7321], "M": [0.0, 1.1547]};
const EX16 = {"O": [0, 0], "E": [-0.3473, 1.9696], "C": [1.5321, -1.2856], "B": [-1.0, -1.7321], "D": [-1.8794, -0.684], "A": [-2.6528, -2.0235]};
const MEZ = {"O": [0, 0], "A": [-1.5321, 1.2856], "B": [1.5321, 1.2856], "D": [1.5321, -1.2856]};
const SAME = {"O": [0, 0], "A": [-1.3893, -1.4387], "B": [1.7321, -1.0], "C": [1.0, 1.7321], "D": [-1.7321, 1.0]};
const QUAD = {"O": [0, 0], "A": [-1.8794, -0.684], "B": [1.0, -1.7321], "C": [1.8794, 0.684], "D": [-0.684, 1.8794]};
const EQ = {"O": [0, 0], "A": [0.0, 2.0], "B": [-1.7321, -1.0], "C": [1.7321, -1.0], "M": [-1.7321, 1.0]};
const RECT = {"O": [0, 0], "A": [-0.8452, 1.8126], "B": [0.8452, 1.8126], "C": [0.8452, -1.8126], "D": [-0.8452, -1.8126]};

export const ORACLE = {
  'ex-4am-zawiya-muhitiya-l1-006:q1': R(q(100).div(2)),
  'ex-4am-zawiya-muhitiya-l1-007:q1': R(q(25).mul(2)),
  'ex-4am-zawiya-muhitiya-l1-008:q1': R(q(35)),
  'ex-4am-zawiya-muhitiya-l2-001:q1': R(q(80).div(2)),
  'ex-4am-zawiya-muhitiya-l2-001:q2': R(deg(angle(KNOW4, "A", "N", "B"))),
  'ex-4am-zawiya-muhitiya-l2-002:q1': R(deg(angle(EX10, "B", "O", "C"))),
  'ex-4am-zawiya-muhitiya-l2-002:q2': R(deg(angle(EX10, "B", "D", "C"))),
  'ex-4am-zawiya-muhitiya-l2-004:q1': R(q(136).div(2)),
  'ex-4am-zawiya-muhitiya-l2-005:q1': R(q(47).mul(2)),
  'ex-4am-zawiya-muhitiya-l2-006:q1': R(deg(angle(SAME, "A", "D", "B"))),
  'ex-4am-zawiya-muhitiya-l2-008:q1': R(q(180).div(2)),
  'ex-4am-zawiya-muhitiya-l2-010:q1': R(q(41)),
  'ex-4am-zawiya-muhitiya-l3-001:q1': R(deg(angle(EX11, "B", "A", "C"))),
  'ex-4am-zawiya-muhitiya-l3-001:q2': R(deg(angle(EX11, "A", "O", "D"))),
  'ex-4am-zawiya-muhitiya-l3-001:q3': R(deg(angle(EX11, "B", "O", "D"))),
  'ex-4am-zawiya-muhitiya-l3-002:q1': R(deg(angle(EX10, "D", "A", "B"))),
  'ex-4am-zawiya-muhitiya-l3-002:q2': R(deg(angle(EX10, "D", "B", "C"))),
  'ex-4am-zawiya-muhitiya-l3-003:q2': R(deg(angle(EX12, "C", "M", "B"))),
  'ex-4am-zawiya-muhitiya-l3-004:q1': R(deg(angle(MEZ, "B", "A", "D"))),
  'ex-4am-zawiya-muhitiya-l3-004:q2': R(deg(angle(MEZ, "A", "O", "B"))),
  'ex-4am-zawiya-muhitiya-l3-005:q1': R(q(70).mul(2)),
  'ex-4am-zawiya-muhitiya-l3-005:q2': R(q(180).sub(q(70).mul(2)).div(2)),
  'ex-4am-zawiya-muhitiya-l3-006:q1': R(deg(angle(QUAD, "A", "C", "D"))),
  'ex-4am-zawiya-muhitiya-l3-006:q2': R(deg(angle(QUAD, "B", "D", "C"))),
  'ex-4am-zawiya-muhitiya-l3-007:q1': R(q(90).sub(32)),
  'ex-4am-zawiya-muhitiya-l3-007:q2': R(q(32).mul(2)),
  'ex-4am-zawiya-muhitiya-l3-008:q1': R(q(28)),
  'ex-4am-zawiya-muhitiya-l3-008:q2': R(q(28).mul(2)),
  'ex-4am-zawiya-muhitiya-l3-010:q1': R(q(120).div(2)),
  'ex-4am-zawiya-muhitiya-l4-001:q1': R(deg(angle(EX16, "E", "B", "C"))),
  'ex-4am-zawiya-muhitiya-l4-001:q2': R(deg(angle(EX16, "B", "E", "C"))),
  'ex-4am-zawiya-muhitiya-l4-001:q3': R(deg(angle(EX16, "A", "E", "C"))),
  'ex-4am-zawiya-muhitiya-l4-001:q4': R(deg(angle(EX16, "E", "A", "C"))),
  'ex-4am-zawiya-muhitiya-l4-002:q1': R(Math.round(Math.asin(3 / 8) * 180 / Math.PI)),
  'ex-4am-zawiya-muhitiya-l4-002:q2': R(Math.round(2 * Math.asin(3 / 8) * 180 / Math.PI)),
  'ex-4am-zawiya-muhitiya-l4-003:q1': R(deg(angle(EQ, "A", "M", "C"))),
  'ex-4am-zawiya-muhitiya-l4-003:q2': R(deg(angle(EQ, "B", "M", "C"))),
  'ex-4am-zawiya-muhitiya-l4-005:q1': R(deg(angle(RECT, "A", "O", "B"))),
  'ex-4am-zawiya-muhitiya-l4-005:q2': R(deg(angle(RECT, "B", "O", "C"))),
  'ex-4am-zawiya-muhitiya-l4-007:q1': R(q(20)),
  'ex-4am-zawiya-muhitiya-l4-007:q2': R(q(20).add(10)),
  'ex-4am-zawiya-muhitiya-l4-008:q1': R(q(30).add(5)),
  'ex-4am-zawiya-muhitiya-l4-008:q2': R(q(35).add(30)),
  'ex-4am-zawiya-muhitiya-l4-009:q1': R(q(120).div(2)),
  'ex-4am-zawiya-muhitiya-l4-010:q1': R(q(30).mul(4).div(2)),
  'ex-4am-zawiya-muhitiya-l4-010:q2': R(q(30).mul(4).div(2)),
  'ex-4am-zawiya-muhitiya-l5-002:q2': R(q(70).add(50).div(2)),
  'ex-4am-zawiya-muhitiya-l5-003:q2': R(q(120).div(2)),
  'ex-4am-zawiya-muhitiya-l5-004:q1': R(q(70).div(2)),
  'ex-4am-zawiya-muhitiya-l5-004:q2': R(q(35).mul(2)),
  'ex-4am-zawiya-muhitiya-l5-005:q1': R(q(120).div(2)),
  'ex-4am-zawiya-muhitiya-l5-005:q2': R(q(35)),
  'ex-4am-zawiya-muhitiya-l5-005:q3': R(q(180).sub(60).sub(35)),
  'ex-4am-zawiya-muhitiya-l5-006:q2': R(q(32).mul(2)),
  'ex-4am-zawiya-muhitiya-l5-007:q1': R(Math.round(Math.asin(6 / 10) * 180 / Math.PI)),
  'ex-4am-zawiya-muhitiya-l5-007:q2': R(Math.round(2 * Math.asin(6 / 10) * 180 / Math.PI)),
  'ex-4am-zawiya-muhitiya-l5-010:q1': R(q(24).div(2)),
  'ex-4am-zawiya-muhitiya-l5-010:q2': R(q(12).mul(3).mul(2)),
};
