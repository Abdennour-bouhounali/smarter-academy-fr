/**
 * lessonAccess — déverrouillage séquentiel des modules d'une leçon.
 *
 * Règle : le module 1 est toujours accessible. Le module N+1 se débloque
 * dès que le module N est maîtrisé à au moins MASTERY_UNLOCK_THRESHOLD %.
 * Un module déjà débloqué le reste pour toujours (pas de re-verrouillage).
 *
 * Source de vérité unique : `useProgress(lessonId).isModuleCompleted`, déjà
 * utilisé partout dans l'application et persisté dans
 * `localStorage['smarter_lesson_' + lessonId]`. Ce module n'introduit AUCUNE
 * nouvelle clé de stockage — il ne fait que dériver un état de verrouillage
 * de la donnée déjà existante.
 *
 * Le système de progression actuel ne connaît la maîtrise d'un module que de
 * façon BINAIRE (`ModuleLayout` n'appelle `markModuleCompleted` que lorsque
 * TOUTES les étapes internes du module sont validées). Sous ce modèle, la
 * maîtrise d'un module vaut donc naturellement 100 (terminé) ou 0 (pas
 * terminé) : cela satisfait le seuil de 80 % sans qu'il soit nécessaire
 * d'inventer un pourcentage fictif à partir de données qui n'existent pas.
 * Si un futur module expose une vraie progression fractionnaire (par
 * exemple un compteur d'exercices réussis / total), `getModuleMastery` est
 * le seul endroit à faire évoluer : le reste de l'algorithme (générique,
 * basé sur l'index) n'a pas besoin de changer.
 */

export const MASTERY_UNLOCK_THRESHOLD = 80;

/**
 * Maîtrise d'un module, en pourcentage.
 * @param {(key: string) => boolean} isModuleCompleted  fourni par useProgress(lessonId)
 * @param {number|string} moduleNumber
 * @returns {number} 0 ou 100 avec le système de progression actuel (binaire)
 */
export function getModuleMastery(isModuleCompleted, moduleNumber) {
  return isModuleCompleted(String(moduleNumber)) ? 100 : 0;
}

/**
 * Un module est déverrouillé si c'est le premier de la leçon, ou si le
 * module précédent est maîtrisé à au moins MASTERY_UNLOCK_THRESHOLD %.
 * Algorithme générique par INDEX : fonctionne pour 5, 10, 11 ou 12 modules
 * sans qu'il soit nécessaire de coder une règle par module.
 *
 * Exception voulue : un module d'étape `evaluation` est TOUJOURS accessible,
 * dès le début de la leçon. Le défi final est un chemin alternatif ("Je pense
 * déjà maîtriser") — un élève qui connaît déjà le contenu doit pouvoir le
 * démontrer sans traverser chaque module (voir LESSON_CONTRACT.md).
 *
 * @param {(key: string) => boolean} isModuleCompleted
 * @param {number|string} moduleNumber  numéro 1-indexé du module
 * @param {{stage?: string}} [module]   le module du lesson.config (optionnel,
 *        rétro-compatible) — seul `stage` est lu ici.
 */
export function isModuleUnlocked(isModuleCompleted, moduleNumber, { stage } = {}) {
  if (stage === 'evaluation') return true;
  const n = Number(moduleNumber);
  if (!Number.isFinite(n) || n <= 1) return true;
  return getModuleMastery(isModuleCompleted, n - 1) >= MASTERY_UNLOCK_THRESHOLD;
}

/**
 * Porte de maîtrise (mastery gate) : certains modules déclarent
 * `requiresLearningPointIds` — des identifiants de Learning Points (jamais
 * des scores) dont l'élève doit avoir démontré la maîtrise. La donnée de
 * maîtrise vient du profil serveur (GET /students/me/learning-profile,
 * `currentMastery`), passée ici en paramètre : ce module reste pur et ne lit
 * aucun stockage.
 *
 * Politique d'ouverture : sans donnée de maîtrise (élève anonyme, profil pas
 * encore chargé, aucune évidence), la porte NE bloque PAS — un gate ne doit
 * jamais enfermer l'élève hors de son propre parcours ; il complète le
 * déverrouillage séquentiel, il ne le remplace pas.
 *
 * @param {string[]|undefined} requiresLearningPointIds
 * @param {Record<string, string>|undefined} masteryStatusById  lpId → statut
 *        ('mastered' | 'reinforce' | 'gap' | 'unassessed')
 * @returns {boolean}
 */
export function isMasteryGateSatisfied(requiresLearningPointIds, masteryStatusById) {
  if (!requiresLearningPointIds?.length) return true;
  if (!masteryStatusById) return true;

  return requiresLearningPointIds.every((lpId) => {
    const status = masteryStatusById[lpId];
    return status === undefined || status !== 'gap';
  });
}

/**
 * Statut d'affichage d'un module dans la feuille de route de la leçon.
 * `module` (optionnel) est l'objet du lesson.config — `stage` ouvre les
 * modules d'évaluation, `requiresLearningPointIds` + `masteryStatusById`
 * appliquent les portes de maîtrise.
 * @returns {'locked'|'mastered'|'in_progress'|'unlocked'}
 */
export function getModuleStatus({ isModuleCompleted, moduleNumber, currentModule, module, masteryStatusById }) {
  const unlocked = isModuleUnlocked(isModuleCompleted, moduleNumber, module)
    && isMasteryGateSatisfied(module?.requiresLearningPointIds, masteryStatusById);
  if (!unlocked) return 'locked';
  if (getModuleMastery(isModuleCompleted, moduleNumber) >= MASTERY_UNLOCK_THRESHOLD) return 'mastered';
  if (currentModule != null && Number(currentModule) === Number(moduleNumber)) return 'in_progress';
  return 'unlocked';
}

/** Message affiché sur un module verrouillé, pour que l'élève comprenne pourquoi. */
export function lockedReason(moduleNumber) {
  const prev = Number(moduleNumber) - 1;
  return `Termine le module ${String(prev).padStart(2, '0')} à ${MASTERY_UNLOCK_THRESHOLD} % pour débloquer ce module.`;
}

/**
 * Content-tier gate — distinct from the sequential module-unlock above.
 * A lesson tagged `tier: 'free'` in coursesData.js is open to anyone
 * (visitor or free account). A `tier: 'premium'` lesson is not, today,
 * because there is no subscription/entitlement system yet — `isPremiumUser`
 * always resolves false until one exists. The parameter is kept so callers
 * don't need to change once real entitlements are added; only this function
 * does.
 *
 * @param {{ tier?: 'free' | 'premium' }} lesson
 * @param {{ isPremiumUser?: boolean }} [ctx]
 */
export function isLessonUnlocked(lesson, { isPremiumUser = false } = {}) {
  return lesson?.tier !== 'premium' || isPremiumUser;
}
