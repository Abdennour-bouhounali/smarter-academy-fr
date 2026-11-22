// Oracle du banc « wadiya-idmajiya-ashia » (unité 11 « الأشعة والانسحاب ») — chaque réponse construite RECALCULÉE ici à partir
// des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/vectors.js ni la logique du lab : Math.hypot pour
// Pythagore (le plus court passage AB′ = √(H² + (a + b)²) avec a, b les distances de A et B aux bords, puis + la largeur),
// les rationnels exacts de helpers.mjs (q) pour les distances, Thalès (HM = H·a ÷ (a + b)) et les aires ; `roundTo` (demi-supérieur)
// pour les valeurs arrondies. Les QCM sont vérifiés par l'aller-retour du validateur. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Généré avec le banc (gen_bank.py de l'auteur).
import { R, q } from './helpers.mjs';

/** Arrondi décimal au demi-supérieur, en chaîne avec un point (sans zéros finaux). */
function roundTo(x, k) {
  const f = 10 ** k;
  const v = Math.round((x + Math.sign(x) * 1e-9) * f) / f;
  return String(Number(v.toFixed(k)));
}

export const ORACLE = {
  'ex-4am-wadiya-idmajiya-ashia-l1-007:q1': R(q(14).toString()), // MN = المسافة بين الحافتين
  'ex-4am-wadiya-idmajiya-ashia-l1-010:q1': R(q(9).sub(4).toString()), // MB′ = AB′ − AM
  'ex-4am-wadiya-idmajiya-ashia-l2-004:q1': R(q(4).sub(3).toString()), // b − w
  'ex-4am-wadiya-idmajiya-ashia-l2-006:q1': R(String(Math.hypot(8, 6))), // Pythagore
  'ex-4am-wadiya-idmajiya-ashia-l2-007:q1': R(String(Math.hypot(12, 5))), // Pythagore
  'ex-4am-wadiya-idmajiya-ashia-l2-008:q1': R(q(34).add(15).toString()), // AB′ + MN
  'ex-4am-wadiya-idmajiya-ashia-l3-002:q1': R(q(10).add(10).add(q(20).sub(10)).toString()), // a + w + (b − w) = a + b
  'ex-4am-wadiya-idmajiya-ashia-l3-002:q2': R(String(Math.hypot(40, 10 + 20))), // AB′
  'ex-4am-wadiya-idmajiya-ashia-l3-002:q3': R(String(Math.hypot(40, 10 + 20) + 10)), // AB′ + MN
  'ex-4am-wadiya-idmajiya-ashia-l3-003:q1': R(String(Math.hypot(160, 40 + 80) + 60)), // AB′ + MN
  'ex-4am-wadiya-idmajiya-ashia-l3-004:q1': R(String(Math.hypot(60, 15 + 30))), // AB′
  'ex-4am-wadiya-idmajiya-ashia-l3-004:q2': R(q(60).mul(15).div(15 + 30).toString()), // HM = H·a/(a+b)
  'ex-4am-wadiya-idmajiya-ashia-l3-004:q3': R(String(Math.hypot(60, 45) + 10)), // AB′ + MN
  'ex-4am-wadiya-idmajiya-ashia-l3-005:q1': R(String(Math.hypot(12, 12 + 4) + 8)), // AB′ + MN
  'ex-4am-wadiya-idmajiya-ashia-l3-010:q1': R(q(10).div(2).mul(2).add(q(14).div(2).mul(2)).toString()), // 2·AC/2 + 2·BD/2
  'ex-4am-wadiya-idmajiya-ashia-l4-001:q1': R(q(2 * 4).mul(2 * 4).div(2).toString()), // ED²/2
  'ex-4am-wadiya-idmajiya-ashia-l4-004:q2': R(roundTo(Math.hypot(5, 1 + 3) + 3, 1)), // AB′ + MN arrondi
  'ex-4am-wadiya-idmajiya-ashia-l4-006:q1': R(q(24).mul(6).div(6 + 10).toString()), // HM = H·a/(a + b)
  'ex-4am-wadiya-idmajiya-ashia-l4-009:q1': R(roundTo(10 + 10 + Math.hypot(40, 20) - (Math.hypot(40, 30) + 10), 1)), // L(front of A) − L_min
  'ex-4am-wadiya-idmajiya-ashia-l5-001:q2': R(String(Math.hypot(80, 10 + 10 + 20 + 30 + 30 - 40) + 40)), // AB″ + MN + PQ
  'ex-4am-wadiya-idmajiya-ashia-l5-002:q1': R(roundTo(Math.hypot(11, 7 + 6) + 5, 0)), // AB′ + MN arrondi
  'ex-4am-wadiya-idmajiya-ashia-l5-003:q1': R(String(Math.sqrt((75 - 15) ** 2 - (20 + 28) ** 2))), // H = √((L − w)² − (a + b)²)
  'ex-4am-wadiya-idmajiya-ashia-l5-005:q1': R(q(12).div(2).mul(q(12).div(2)).toString()), // (AC/2)²
  'ex-4am-wadiya-idmajiya-ashia-l5-006:q1': R(q(12).mul(12).div(2).toString()), // ED²/2
  'ex-4am-wadiya-idmajiya-ashia-l5-010:q1': R(q(70).mul(15).div(15 + 35).toString()), // HM
  'ex-4am-wadiya-idmajiya-ashia-l5-010:q2': R(roundTo(Math.hypot(70, 15 + 35) + 20, 0)), // AB′ + MN
};
