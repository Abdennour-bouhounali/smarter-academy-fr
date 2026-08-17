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
 * @param {(key: string) => boolean} isModuleCompleted
 * @param {number|string} moduleNumber  numéro 1-indexé du module
 */
export function isModuleUnlocked(isModuleCompleted, moduleNumber) {
  const n = Number(moduleNumber);
  if (!Number.isFinite(n) || n <= 1) return true;
  return getModuleMastery(isModuleCompleted, n - 1) >= MASTERY_UNLOCK_THRESHOLD;
}

/**
 * Statut d'affichage d'un module dans la feuille de route de la leçon.
 * @returns {'locked'|'mastered'|'in_progress'|'unlocked'}
 */
export function getModuleStatus({ isModuleCompleted, moduleNumber, currentModule }) {
  if (!isModuleUnlocked(isModuleCompleted, moduleNumber)) return 'locked';
  if (getModuleMastery(isModuleCompleted, moduleNumber) >= MASTERY_UNLOCK_THRESHOLD) return 'mastered';
  if (currentModule != null && Number(currentModule) === Number(moduleNumber)) return 'in_progress';
  return 'unlocked';
}

/** Message affiché sur un module verrouillé, pour que l'élève comprenne pourquoi. */
export function lockedReason(moduleNumber) {
  const prev = Number(moduleNumber) - 1;
  return `Termine le module ${String(prev).padStart(2, '0')} à ${MASTERY_UNLOCK_THRESHOLD} % pour débloquer ce module.`;
}
