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

/** lessonId → étapes ordonnées { version, map: { ancienNuméro: nouveauNuméro } }. */
export const MODULE_LAYOUT_MIGRATIONS = {
  // 2026-10-05 — pilote « مسائل » : 3 modules insérés avant le test (4 → 7).
  'qasim-adad-tabii': [{ version: 2, map: { 4: 7 } }],
  // 2026-10-06 — déploiement « مسائل » à toutes les leçons (docs/sources/4am/masail-rollout/).
  'qawasim-adad-tabii': [{ version: 2, map: { 4: 7 } }],
  'awwaliyan-fima-baynahuma': [{ version: 2, map: { 4: 7 } }],
  'tayin-pgcd': [{ version: 2, map: { 4: 7 } }],
  'qasim-mushtarak-akbar': [{ version: 2, map: { 4: 7 } }],
  'bahth-pgcd': [{ version: 2, map: { 5: 8 } }],
  'khawass-qawasim': [{ version: 2, map: { 5: 8 } }],
  'ikhtizal-kasr': [{ version: 2, map: { 5: 8 } }],
  'jidhr-tarbii': [{ version: 2, map: { 4: 7 } }],
  'amaliyat-judhur': [{ version: 2, map: { 5: 8 } }],
  'muadalat-x-murabba': [{ version: 2, map: { 4: 7 } }],
  'tawzif-khawass-judhur': [{ version: 2, map: { 6: 9 } }],
  'natiqa-ghayr-natiqa': [{ version: 2, map: { 4: 7 } }],
  'mutatabiqat-shahira': [{ version: 2, map: { 5: 8 } }],
  'muadala-ula': [{ version: 2, map: { 5: 8 } }],
  'nashr-tabsit': [{ version: 2, map: { 4: 7 } }],
  'mushkilat-jumla': [{ version: 2, map: { 4: 7 } }],
  'hall-jabri': [{ version: 2, map: { 4: 7 } }],
  'mutarajiha-ula': [{ version: 2, map: { 6: 9 } }],
  'mafhum-jumla': [{ version: 2, map: { 4: 7 } }],
  'tahlil-ibara': [{ version: 2, map: { 5: 8 } }],
  'jidaa-maadum': [{ version: 2, map: { 5: 8 } }],
  'tarrid-mushkila': [{ version: 2, map: { 4: 7 } }],
  'tanasub-muamil': [{ version: 2, map: { 4: 7 } }],
  'tarrid-khatti': [{ version: 2, map: { 4: 7 } }],
  'dala-khattiya': [{ version: 2, map: { 4: 7 } }],
  'takrar-mujamma': [{ version: 2, map: { 5: 8 } }],
  'tatbiqat-tanasub': [{ version: 2, map: { 5: 8 } }],
  'majdulat-ihsaiya': [{ version: 2, map: { 5: 8 } }],
  'mada-wasit-mutawassit': [{ version: 2, map: { 5: 8 } }],
  'tafsir-bayani-jumla': [{ version: 2, map: { 4: 7 } }],
  'mafhum-taalufiya': [{ version: 2, map: { 5: 8 } }],
  'tamthil-bayani-khatti': [{ version: 2, map: { 4: 7 } }],
  'tanasub-taghayyurat': [{ version: 2, map: { 4: 7 } }],
  'qiraat-wadiyat-ihsaiya': [{ version: 2, map: { 5: 8 } }],
  'tamthil-bayani-taalufi': [{ version: 2, map: { 5: 8 } }],
  'tarrid-taalufi': [{ version: 2, map: { 5: 8 } }],
  'nisab-muthallathiya': [{ version: 2, map: { 5: 8 } }],
  'alaqat-muthallathiya': [{ version: 2, map: { 5: 8 } }],
  'insihab-shuaa': [{ version: 2, map: { 5: 8 } }],
  'murakkibata-shuaa': [{ version: 2, map: { 5: 8 } }],
  'shuaayn-mutasawiyayn': [{ version: 2, map: { 5: 8 } }],
  'muntasaf-masafa': [{ version: 2, map: { 5: 8 } }],
  'inshaat-talis': [{ version: 2, map: { 4: 7 } }],
  'zawiya-muhitiya': [{ version: 2, map: { 5: 8 } }],
  'majmu-shuaayn': [{ version: 2, map: { 5: 8 } }],
  'talis-hisab-atwal': [{ version: 2, map: { 5: 8 } }],
  'barahin-ashia': [{ version: 2, map: { 5: 8 } }],
  'aksiya-talis': [{ version: 2, map: { 5: 8 } }],
  'ithbat-khawas-maalam': [{ version: 2, map: { 5: 8 } }],
  'hisab-murakkibatay': [{ version: 2, map: { 5: 8 } }],
  'hasiba-muthallathiya': [{ version: 2, map: { 4: 7 } }],
  'mafhum-dawaran': [{ version: 2, map: { 5: 8 } }],
  'khawas-dawaran': [{ version: 2, map: { 5: 8 } }],
  'mudalaat-muntazama': [{ version: 2, map: { 5: 8 } }],
  'tarrid-muthallathiya': [{ version: 2, map: { 4: 7 } }],
  'kura-julla': [{ version: 2, map: { 5: 8 } }],
  'misaha-hajm-kura': [{ version: 2, map: { 5: 8 } }],
  'takbir-tasghir': [{ version: 2, map: { 5: 8 } }],
  'maqati-mustawiya': [{ version: 2, map: { 5: 8 } }],
  // 2026-10-13 — synthèse « أدمج تعلّماتي » : six وضعيات d'entraînement (1–6) insérées, l'ancienne analyse (1) passe
  // au module 7, le test de 3 à 8 ; « أؤكّد تعلّماتي » (2) est supprimé : son « 2 » est ramené à « 0 » (module déjà terminé, sans effet).
  'wadiya-idmajiya-aadad': [{ version: 2, map: { 1: 7, 2: 0, 3: 8 } }],
  // 2026-10-13 — synthèses « أدمج تعلّماتي » des unités 2–14, au format de l'unité 1 : six « وضعيات تدريبية » (1–6) insérées
  // après أستعدّ, l'ancienne situation → 7 (analyse), le test final → 8 ; « أؤكّد تعلّماتي » et « أتعمّق » supprimés (→ 0, sans effet).
  'wadiya-idmajiya-ashia': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-dawaran': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-fada': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-harfi': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-ihsa': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-judhur': [{ version: 2, map: { 1: 7, 2: 0, 3: 8 } }],
  'wadiya-idmajiya-jumal': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-khattiya': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-maalam': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-muadalat': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-muthallathat': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-taalufiya': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  'wadiya-idmajiya-talis': [{ version: 2, map: { 1: 7, 2: 0, 3: 0, 4: 8 } }],
  // <<masail-rollout: one line per lesson, inserted above this anchor>>
};

/** La version de disposition courante d'une leçon (1 si jamais renumérotée). */
export function currentModuleLayoutVersion(lessonId) {
  const steps = MODULE_LAYOUT_MIGRATIONS[lessonId];
  return steps?.length ? steps[steps.length - 1].version : 1;
}

/**
 * Applique, une seule fois, les renumérotations en attente à des données de
 * progression stockées. Pure : renvoie le même objet quand rien ne change.
 *
 * @param {string} lessonId
 * @param {object|null} data  { completedModules, currentModule, layoutVersion, … }
 *                            null/undefined = aucun stockage pour cette leçon.
 * @returns {object|null} les données migrées (ou `data` inchangé)
 */
export function migrateLessonProgress(lessonId, data) {
  const steps = MODULE_LAYOUT_MIGRATIONS[lessonId];
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
export function emptyLessonProgress(lessonId) {
  const base = { completedModules: [], completedExercises: [] };
  return MODULE_LAYOUT_MIGRATIONS[lessonId] ? { ...base, layoutVersion: currentModuleLayoutVersion(lessonId) } : base;
}
