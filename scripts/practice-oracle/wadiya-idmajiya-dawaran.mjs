// Oracle du banc « wadiya-idmajiya-dawaran » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة », أدمج تعلّماتي) — chaque
// réponse construite RECALCULÉE ici à partir des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/rotation.js ni
// la logique du lab : Math.sin en degrés (D = π/180) pour les distances entre poteaux voisins (2r·sin(180°/n)), Math.asin pour les
// angles, Math.PI pour les arcs, la division de 360 pour les angles au centre, (x ; y) ↦ (−y ; x) pour un quart de tour direct ;
// `roundTo` (demi-supérieur) pour les valeurs arrondies. Les QCM sont vérifiés par l'aller-retour du validateur. Fusionné dans
// scripts/practice-answer-oracle.test.mjs. Généré avec le banc (gen_bank.py de l'auteur).
import { R, P } from './helpers.mjs';

const D = Math.PI / 180;
/** Arrondi décimal au demi-supérieur, en chaîne avec un point (sans zéros finaux). */
function roundTo(x, k) {
  const f = 10 ** k;
  const v = Math.round((x + Math.sign(x) * 1e-9) * f) / f;
  return String(Number(v.toFixed(k)));
}

export const ORACLE = {
  'ex-4am-wadiya-idmajiya-dawaran-l1-004:q1': R(360 / 12),
  'ex-4am-wadiya-idmajiya-dawaran-l1-005:q1': R(360 / 36),
  'ex-4am-wadiya-idmajiya-dawaran-l1-007:q1': R(2.5),
  'ex-4am-wadiya-idmajiya-dawaran-l2-003:q1': R(360 / 6),
  'ex-4am-wadiya-idmajiya-dawaran-l2-003:q2': R(roundTo(2 * 3 * Math.sin(Math.PI / 6), 6)),
  'ex-4am-wadiya-idmajiya-dawaran-l2-004:q1': P(-1, 4),
  'ex-4am-wadiya-idmajiya-dawaran-l2-005:q1': R(360 / 40),
  'ex-4am-wadiya-idmajiya-dawaran-l2-008:q1': R(140 / 2),
  'ex-4am-wadiya-idmajiya-dawaran-l3-001:q2': R(roundTo(8 * Math.sin(36 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-002:q1': R(roundTo(Math.asin(3 / 8) / D, 0)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-002:q2': R(roundTo(2 * Math.asin(3 / 8) / D, 0)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-003:q1': R(360 / 10),
  'ex-4am-wadiya-idmajiya-dawaran-l3-003:q2': R(roundTo(8 * Math.sin(18 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-004:q1': R(roundTo(20 * Math.sin(15 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-005:q1': P(2 * 1 - 2, 2 * 1 - (-3)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-006:q1': R(roundTo(2 * Math.PI * 4 / 6 - 4, 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-007:q1': R(roundTo(360 / (2 * Math.asin(2 / (2 * 2)) / D), 6)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-008:q1': R(roundTo(360 / (2 * Math.asin(3 * Math.SQRT2 / (2 * 3)) / D), 6)),
  'ex-4am-wadiya-idmajiya-dawaran-l3-010:q1': R(2.3),
  'ex-4am-wadiya-idmajiya-dawaran-l4-002:q1': R(3 * (8 + 4) / 8),
  'ex-4am-wadiya-idmajiya-dawaran-l4-003:q2': R(roundTo(6 * Math.sin(20 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l4-004:q1': R(roundTo(12 * 12 * Math.sin(15 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l4-005:q1': R(roundTo(1.5 / (2 * Math.sin(30 * D)), 6)),
  'ex-4am-wadiya-idmajiya-dawaran-l4-007:q1': R(4 * 360 / 12),
  'ex-4am-wadiya-idmajiya-dawaran-l4-007:q2': R(4 * 360 / 12 / 2),
  'ex-4am-wadiya-idmajiya-dawaran-l4-008:q1': R(360 / 5),
  'ex-4am-wadiya-idmajiya-dawaran-l4-008:q2': R(roundTo(20 * Math.sin(36 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l4-009:q1': P(1 + 3, 0 - (-3)),
  'ex-4am-wadiya-idmajiya-dawaran-l4-010:q1': R(roundTo(12 * Math.sin(18 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-001:q2': R(360 / 6),
  'ex-4am-wadiya-idmajiya-dawaran-l5-001:q3': R(roundTo(2 * 3 * Math.sin(30 * D), 6)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-002:q2': R(roundTo(80 * Math.sin(60 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-003:q1': R(360 / 5),
  'ex-4am-wadiya-idmajiya-dawaran-l5-003:q2': R(roundTo(1.2 * Math.sin(36 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-004:q1': R(roundTo(3 / (2 * Math.sin(30 * D)), 6)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-004:q2': R(roundTo(3 / (2 * Math.sin(45 * D)), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-005:q1': R(360 / 24),
  'ex-4am-wadiya-idmajiya-dawaran-l5-005:q2': R(roundTo(240 * Math.sin(7.5 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-006:q1': P(-0, 3),
  'ex-4am-wadiya-idmajiya-dawaran-l5-007:q1': R(360 / 6 / 2),
  'ex-4am-wadiya-idmajiya-dawaran-l5-008:q1': R(360 / 16),
  'ex-4am-wadiya-idmajiya-dawaran-l5-008:q2': R(roundTo(40 * Math.sin(11.25 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-008:q3': R(4 * 360 / 16),
  'ex-4am-wadiya-idmajiya-dawaran-l5-009:q2': R(roundTo(8 * Math.sin(180 / 7 * D), 2)),
  'ex-4am-wadiya-idmajiya-dawaran-l5-010:q1': R(8 / 2),
  'ex-4am-wadiya-idmajiya-dawaran-l5-010:q2': R(roundTo(2 * 8 * Math.sin(30 * D), 6)),
};
