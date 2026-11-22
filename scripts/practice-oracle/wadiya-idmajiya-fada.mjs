// Oracle du banc « wadiya-idmajiya-fada » (unité 14 « الهندسة في الفضاء », أدمج تعلّماتي) — chaque réponse construite
// RECALCULÉE ici à partir des nombres de l’énoncé, sans lire le contenu ni packages/core/arithmetic/space.js ni la logique du
// lab : Thalès écrit comme SO = r·H/(R − r), le rayon de la surface r + (R − r)·d/H, le volume d’un cône r²h/3 (coefficient de
// π), un tronc comme différence de deux cônes, la boule 4R³/3, Math.cbrt pour un rapport de volumes, Math.PI et `roundTo`
// (demi-supérieur) pour les valeurs arrondies, `fracStr` (pgcd) pour un coefficient fractionnaire. Les QCM sont vérifiés par
// l’aller-retour du validateur. Fusionné dans scripts/practice-answer-oracle.test.mjs. Généré avec le banc (gen_bank.py de
// l’auteur, qui vérifie chaque valeur avec fractions.Fraction avant de l’écrire).
import { R } from './helpers.mjs';

/** Arrondi décimal au demi-supérieur, en chaîne avec un point (sans zéros finaux). */
function roundTo(x, k) {
  const f = 10 ** k;
  const v = Math.round((x + Math.sign(x) * 1e-9) * f) / f;
  return String(Number(v.toFixed(k)));
}
/** Une fraction n/d réduite, en chaîne (« 24388/3 », « 56 »). */
function fracStr(n, d) {
  const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
  const k = g(n, d);
  return d / k === 1 ? String(n / k) : `${n / k}/${d / k}`;
}

export const ORACLE = {
  'ex-4am-wadiya-idmajiya-fada-l1-004:q1': R(36 * 10 / 3),
  'ex-4am-wadiya-idmajiya-fada-l1-005:q1': R(4500 / 1000),
  'ex-4am-wadiya-idmajiya-fada-l1-008:q1': R(6 * 20 / (10 - 6)),
  'ex-4am-wadiya-idmajiya-fada-l1-010:q1': R(7 + 28),
  'ex-4am-wadiya-idmajiya-fada-l2-001:q1': R(15 * 35 / (20 - 15)),
  'ex-4am-wadiya-idmajiya-fada-l2-002:q1': R(15 * (105 + 28) / 105),
  'ex-4am-wadiya-idmajiya-fada-l2-003:q1': R(25 * 12 / 3),
  'ex-4am-wadiya-idmajiya-fada-l2-004:q1': R(2 + (4 - 2) * 4.5 / 6),
  'ex-4am-wadiya-idmajiya-fada-l2-007:q1': R(4 * 9 ** 3 / 3),
  'ex-4am-wadiya-idmajiya-fada-l2-008:q1': R(roundTo(1200 * Math.PI / 1000, 2)),
  'ex-4am-wadiya-idmajiya-fada-l3-002:q1': R(6 * 9 / (9 - 6)),
  'ex-4am-wadiya-idmajiya-fada-l3-002:q2': R(9 * 9 * (18 + 9) / 3 - 6 * 6 * 18 / 3),
  'ex-4am-wadiya-idmajiya-fada-l3-003:q1': R(Math.sqrt(15 ** 2 - 9 ** 2)),
  'ex-4am-wadiya-idmajiya-fada-l3-006:q1': R('16/3'),
  'ex-4am-wadiya-idmajiya-fada-l3-007:q1': R(roundTo(513 * Math.PI, 1)),
  'ex-4am-wadiya-idmajiya-fada-l3-009:q1': R(18 * Math.cbrt(1 / 27)),
  'ex-4am-wadiya-idmajiya-fada-l4-001:q1': R(fracStr(19 * 19 * 133 - 15 * 15 * 105, 3)),
  'ex-4am-wadiya-idmajiya-fada-l4-002:q1': R(roundTo(24388 / 3 * Math.PI / 1000, 2)),
  'ex-4am-wadiya-idmajiya-fada-l4-003:q1': R(16 * Math.cbrt((4 / 3 * 27) / (256 / 3))),
  'ex-4am-wadiya-idmajiya-fada-l4-004:q1': R(2 * 6 / (4 - 2)),
  'ex-4am-wadiya-idmajiya-fada-l4-004:q2': R((4 * 4 * 12 - 2 * 2 * 6) / 3),
  'ex-4am-wadiya-idmajiya-fada-l4-007:q1': R(6 * (30 + 10) / 30),
  'ex-4am-wadiya-idmajiya-fada-l4-007:q2': R(fracStr(8 * 8 * 40 - 6 * 6 * 30, 3)),
  'ex-4am-wadiya-idmajiya-fada-l4-009:q1': R(4 * 100 / 2),
  'ex-4am-wadiya-idmajiya-fada-l5-001:q1': R(36 * 10 + 36 * 8 / 3),
  'ex-4am-wadiya-idmajiya-fada-l5-002:q1': R(10 + (15 - 10) * 18 / 30),
  'ex-4am-wadiya-idmajiya-fada-l5-002:q2': R(roundTo((13 * 13 * 78 - 10 * 10 * 60) / 3 * Math.PI / 1000, 2)),
  'ex-4am-wadiya-idmajiya-fada-l5-003:q1': R(50000 / 50 ** 3),
  'ex-4am-wadiya-idmajiya-fada-l5-004:q1': R(9 * 9 / 3 + 2 * 27 / 3),
  'ex-4am-wadiya-idmajiya-fada-l5-006:q1': R(roundTo((20 * 20 * 140 - 15 * 15 * 105) / 3 * Math.PI / 1000, 1)),
  'ex-4am-wadiya-idmajiya-fada-l5-007:q1': R(Math.sqrt(13 ** 2 - 5 ** 2)),
  'ex-4am-wadiya-idmajiya-fada-l5-007:q2': R((13 ** 2 - 5 ** 2) * 5 / 3),
  'ex-4am-wadiya-idmajiya-fada-l5-009:q1': R(4 * 4 * 24 / 3 * (1 - (18 / 24) ** 3)),
};
