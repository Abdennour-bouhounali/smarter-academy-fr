/**
 * La barre EMPILÉE d'un point d'apprentissage et le tri de la liste — logique
 * pure, sans React (même idiome que classGroupLessons/lessonSelection.js).
 *
 * Les quatre statuts sont ceux du moteur de maîtrise ; leur ordre ici est
 * l'ordre des segments dans la barre, du plus rassurant au plus muet.
 */
export const LP_STATUSES = Object.freeze(['mastered', 'reinforce', 'gap', 'unassessed']);

/** Les couleurs sont des FAITS partagés : la pastille, la barre et la fiche élève lisent la même carte. */
export const LP_STATUS_BAR = Object.freeze({
  mastered: 'bg-emerald-500',
  reinforce: 'bg-amber-400',
  gap: 'bg-rose-500',
  unassessed: 'bg-slate-300',
});

/**
 * Les segments de la barre, en pourcentages ENTIERS dont la somme fait
 * exactement 100 (méthode du plus fort reste) — sinon une barre de 33/33/33
 * laisse un vide d'un pixel à droite… c'est-à-dire à gauche, en RTL.
 *
 * @returns {Array<{key: string, count: number, percent: number}>}
 */
export function barSegments(counts) {
  const rows = LP_STATUSES.map((key) => ({ key, count: Math.max(0, Number(counts?.[key]) || 0) }));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) return rows.map((row) => ({ ...row, percent: 0 }));

  const exact = rows.map((row) => (row.count * 100) / total);
  const percent = exact.map(Math.floor);
  let rest = 100 - percent.reduce((sum, value) => sum + value, 0);
  const byRemainder = rows.map((_, index) => index).sort((a, b) => (exact[b] - percent[b]) - (exact[a] - percent[a]));
  for (const index of byRemainder) {
    if (rest <= 0) break;
    if (rows[index].count === 0) continue;
    percent[index] += 1;
    rest -= 1;
  }
  return rows.map((row, index) => ({ ...row, percent: percent[index] }));
}

/**
 * Tri de la liste des points : `gap` (défaut) met en tête ce qui bloque le
 * plus d'élèves — à égalité, ce qui demande le plus de renforcement, puis
 * l'ordre du cours ; `order` suit simplement la leçon.
 *
 * @param {Array<{order?: number, counts?: object}>} points
 * @param {'gap'|'order'} by
 */
export function sortLearningPoints(points, by = 'gap') {
  const list = [...(points ?? [])];
  const order = (p) => Number(p.order) || 0;
  if (by === 'order') return list.sort((a, b) => order(a) - order(b));
  const count = (p, key) => Number(p.counts?.[key]) || 0;
  return list.sort((a, b) => count(b, 'gap') - count(a, 'gap')
    || count(b, 'reinforce') - count(a, 'reinforce')
    || order(a) - order(b));
}

/** La confiance vient en [0, 1] ; une valeur déjà en pourcentage est tolérée. */
export function confidencePercent(confidence) {
  if (confidence === null || confidence === undefined || Number.isNaN(Number(confidence))) return null;
  const value = Number(confidence);
  return Math.max(0, Math.min(100, Math.round(value > 1 ? value : value * 100)));
}
