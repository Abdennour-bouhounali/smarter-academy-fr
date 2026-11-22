// Oracle du banc « shuaayn-mutasawiyayn » (unité 11 « الأشعة والانسحاب ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé (helpers.mjs : R, q), sans lire le contenu ni packages/core/arithmetic/vectors.js ni la logique du lab.
// La seule mathématique en jeu est celle du درس : AI = IB (vecteurs) ⇔ I milieu de [AB], donc AI = AB / 2 ; deux segments de
// même milieu sur une droite ⇒ AB = CD ; un انسحاب conserve les longueurs (CD = AB). Les longueurs sont additionnées le
// long d'une droite, dans l'ordre des points de l'énoncé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par l'aller-retour du validateur.
import { R, q } from './helpers.mjs';

/** La moitié d'une longueur (le milieu). */
const half = (len) => q(len).div(2);

export const ORACLE = {
  // ── المستوى 1 ──
  'ex-4am-shuaayn-mutasawiyayn-l1-003:q1': R(half(12)),                          // EM = EF / 2
  // ── المستوى 2 ──
  'ex-4am-shuaayn-mutasawiyayn-l2-004:q1': R(half('7.4')),                       // B milieu de [AC]
  'ex-4am-shuaayn-mutasawiyayn-l2-005:q1': R(q('2.5').mul(2)),                   // MN = 2 MI
  // ── المستوى 3 ──
  'ex-4am-shuaayn-mutasawiyayn-l3-004:q1': R(half('7.32')),                      // le drapeau au milieu du filet
  'ex-4am-shuaayn-mutasawiyayn-l3-010:q1': R(q(3).add(4).add(3)),                // AD = AB + BC + CD, CD = AB
  // ── المستوى 4 ──
  'ex-4am-shuaayn-mutasawiyayn-l4-005:q1': R(half(half(16)).add(half(16))),      // BN = NM + MB
  'ex-4am-shuaayn-mutasawiyayn-l4-009:q1': R(half('7.5').add('7.5')),            // MN = MB + BN, BN = AB
  // ── المستوى 5 ──
  'ex-4am-shuaayn-mutasawiyayn-l5-002:q1': R(half('2.4')),                       // AM
  'ex-4am-shuaayn-mutasawiyayn-l5-002:q2': R(half('2.4').add(half(half('2.4')))), // AN = AM + MN
  'ex-4am-shuaayn-mutasawiyayn-l5-004:q2': R(q('1.35').mul(2)),                  // RC = 2 RM
  'ex-4am-shuaayn-mutasawiyayn-l5-007:q1': R(q(35)),                             // CD = AB (انسحاب)
  'ex-4am-shuaayn-mutasawiyayn-l5-010:q1': R(half(84).add(half(half(84)))),      // AJ = AI + IJ
};
