/**
 * Combien d'exercices par niveau — SANS l'index complet ni la table des exercices.
 *
 * Les nombres sont calculés au build depuis content/practice/index.generated.json
 * (plugin `virtual:practice-level-counts`, vite.config.js) : ≈ 2 Ko, là où
 * practiceContent.js en coûte 80 (index + glob de chaque exercice). La carte du
 * sommaire d'une leçon et la banque de l'enseignant n'ont besoin que de ceci.
 * Voir docs/architecture/BUNDLE_BOUNDARIES.md.
 */
import COUNTS from 'virtual:practice-level-counts';

/** niveau → nombre d'exercices, sans ouvrir un seul fichier. */
export function levelCounts(lessonCode) {
  const levels = COUNTS[lessonCode] ?? {};

  return Object.fromEntries(Object.entries(levels).map(([level, count]) => [Number(level), count]));
}
