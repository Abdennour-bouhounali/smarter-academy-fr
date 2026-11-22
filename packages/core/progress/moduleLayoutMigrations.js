/**
 * MIGRATIONS DE DISPOSITION DES MODULES — quand une leçon insère des modules
 * avant un module existant, les numéros stockés changent de sens.
 *
 * La progression stocke les modules terminés PAR NUMÉRO (`completedModules:
 * ['0', '1', '4']`, ModuleLayout → markModuleCompleted(String(n))). Insérer
 * les trois modules « مسائل » (4, 5, 6) avant le إختبار أولي le fait passer de
 * 4 à 7 : un élève qui avait fini l'ancien test (« 4 ») verrait sinon la
 * première مسألة comme faite.
 *
 * LA MIGRATION EST UNIQUE, jamais appliquée à chaque lecture : après le
 * changement, « 4 » désigne légitimement la مسألة 1, et la remapper à
 * nouveau effacerait une vraie complétion. Les données portent donc leur
 * `layoutVersion` :
 *   - absente (données écrites avant le changement) → version 1, migrée ;
 *   - un stockage VIDE naît à la dernière version (rien à migrer).
 *
 * Côté serveur, la même table est appliquée une fois par une migration de
 * données Laravel (apps/api/database/migrations/*_remap_problem_modules_*),
 * de sorte que l'union client ∪ serveur (progressQueue.mergeServerRowIntoStorage)
 * ne réintroduit jamais un « 4 » de l'ancienne disposition.
 *
 * Voir docs/architecture/PROGRESS_MODEL.md § Renumérotation des modules.
 */

/**
 * lessonId → étapes ordonnées { version, map: { ancienNuméro: nouveauNuméro } }.
 * Vide depuis le 2026-11-22 : toutes ses entrées nommaient des leçons supprimées (FRANCE_REBUILD_PLAN.md §4bis).
 */
export const MODULE_LAYOUT_MIGRATIONS = {};

/** La version de disposition courante d'une leçon (1 si jamais renumérotée). */
export function currentModuleLayoutVersion(lessonId, migrations = MODULE_LAYOUT_MIGRATIONS) {
  const steps = migrations[lessonId];
  return steps?.length ? steps[steps.length - 1].version : 1;
}

/**
 * Applique, une seule fois, les renumérotations en attente à des données de
 * progression stockées. Pure : renvoie le même objet quand rien ne change.
 *
 * @param {string} lessonId
 * @param {object|null} data  { completedModules, currentModule, layoutVersion, … }
 *                            null/undefined = aucun stockage pour cette leçon.
 * @param {object} [migrations]  la table (MODULE_LAYOUT_MIGRATIONS par défaut ; les tests passent la leur)
 * @returns {object|null} les données migrées (ou `data` inchangé)
 */
export function migrateLessonProgress(lessonId, data, migrations = MODULE_LAYOUT_MIGRATIONS) {
  const steps = migrations[lessonId];
  if (!steps?.length) return data;
  const latest = steps[steps.length - 1].version;
  // Rien de stocké : la progression naît dans la disposition courante.
  if (data == null) return data;
  const from = data.layoutVersion ?? 1;
  if (from >= latest) return data;

  let completed = Array.isArray(data.completedModules) ? data.completedModules.map(String) : [];
  let current = data.currentModule;
  for (const { version, map } of steps) {
    if (version <= from) continue;
    // Un remplacement SIMULTANÉ : { 4: 7, 7: 8 } ne doit pas chaîner 4 → 8.
    completed = completed.map((m) => (map[m] != null ? String(map[m]) : m));
    if (current != null && map[String(current)] != null) current = Number(map[String(current)]);
  }
  const next = { ...data, completedModules: [...new Set(completed)], layoutVersion: latest };
  if (data.currentModule !== undefined) next.currentModule = current;
  return next;
}

/** Le stockage vide d'une leçon, estampillé à la disposition courante. */
export function emptyLessonProgress(lessonId, migrations = MODULE_LAYOUT_MIGRATIONS) {
  const base = { completedModules: [], completedExercises: [] };
  return migrations[lessonId] ? { ...base, layoutVersion: currentModuleLayoutVersion(lessonId, migrations) } : base;
}
