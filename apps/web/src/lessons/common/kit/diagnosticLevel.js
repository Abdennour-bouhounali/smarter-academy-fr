/**
 * Le palier de conseil d'un diagnostic « أستعدّ » : fragile / progres / pret.
 *
 * Calculé sur la PROPORTION du score, pas sur des seuils absolus : les seuils
 * « < 5 / ≤ 7 / > 7 » supposaient un diagnostic sur 10, alors que ceux de
 * l'unité 1 comptent 9 et 8 points — 3 réponses justes sur 4 y tombaient dans
 * « progres », et seul un sans-faute atteignait « pret » (audit 2026-09-29).
 * Sur 10 points, les paliers sont exactement les anciens.
 *
 * @param {number} score
 * @param {number} maxScore
 * @returns {'fragile'|'progres'|'pret'}
 */
export function diagnosticAdviceLevel(score, maxScore) {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio < 0.5) return 'fragile';
  if (ratio <= 0.7) return 'progres';
  return 'pret';
}
