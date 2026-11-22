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
export function isModuleUnlocked(isModuleCompleted, moduleNumber, { stage, firstModuleNumber, previousStage } = {}) {
  if (stage === 'evaluation') return true;
  // UN DIAGNOSTIC NE BARRE PAS LA LEÇON. `prerequisite_check` est une
  // vérification d'acquis ANTÉRIEURS, « client-side only, never persisted as
  // evidence » (lessonStages.js) : la sauter est un droit. Tant qu'il servait
  // de prédécesseur, le premier vrai module restait fermé et l'élève lisait
  // « أتمِم المحور 00 » — un mur devant la leçon, posé par un module qui ne
  // prétend rien enseigner.
  if (previousStage === 'prerequisite_check') return true;
  const n = Number(moduleNumber);
  if (!Number.isFinite(n)) return true;
  // LE PREMIER MODULE EST CELUI DE LA LEÇON, pas le numéro 1.
  //
  // 137 leçons commencent par un module 0 (le diagnostic « أستعدّ » /
  // « Je me teste »). Avec un premier fixé à 1, ce module 0 n'était pas
  // reconnu comme premier : il exigeait la maîtrise d'un module « -1 », qui
  // ne peut pas exister. La leçon entière restait donc scellée, et l'écran
  // annonçait « أتمِم المحور -1 ». Le premier module se lit maintenant de la
  // leçon (`firstModuleNumber`) ; à défaut, tout numéro ≤ 1 ouvre, ce qui
  // préserve le comportement des appelants qui ne le passent pas.
  const first = Number.isFinite(Number(firstModuleNumber)) ? Number(firstModuleNumber) : 1;
  if (n <= first) return true;
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
export function getModuleStatus({ isModuleCompleted, moduleNumber, currentModule, module, masteryStatusById, firstModuleNumber, previousStage }) {
  // CE QUI EST FAIT EST FAIT — un module déjà maîtrisé ne se referme jamais.
  //
  // Le verrou se calcule à partir du module PRÉCÉDENT ; il répondait donc
  // « verrouillé » pour un module que l'élève venait pourtant de terminer,
  // dès que le précédent, lui, ne l'était pas (arrivée par un lien direct,
  // module d'évaluation joué d'abord, progression importée d'un autre
  // appareil). L'élève voyait « أتمِم المحور 00 » sur un module qu'il avait
  // fini, et ne pouvait plus y revenir. La maîtrise passe donc AVANT le
  // verrou : le déverrouillage séquentiel guide vers la suite, il ne
  // reprend pas ce qui est acquis.
  if (getModuleMastery(isModuleCompleted, moduleNumber) >= MASTERY_UNLOCK_THRESHOLD) return 'mastered';

  const unlocked = isModuleUnlocked(isModuleCompleted, moduleNumber, { ...module, firstModuleNumber, previousStage })
    && isMasteryGateSatisfied(module?.requiresLearningPointIds, masteryStatusById);
  if (!unlocked) return 'locked';
  if (currentModule != null && Number(currentModule) === Number(moduleNumber)) return 'in_progress';
  return 'unlocked';
}

/**
 * Les DONNÉES du verrouillage : quel module précède, et à quel seuil.
 *
 * `packages/core` ne formate pas de phrase destinée à l'élève — il n'a pas à
 * connaître la langue de l'interface. C'est la couche UI qui traduit
 * (apps/web : i18n, namespace `lesson`), à partir de ces deux nombres. Sans
 * cela, un écran arabe affichait « Termine le module 02 à 80 % ».
 */
export function lockedReasonData(moduleNumber) {
  // Jamais un numéro négatif : un module « -1 » n'existe pas, et l'afficher
  // laissait l'élève devant une consigne impossible à satisfaire.
  const prev = Math.max(0, Number(moduleNumber) - 1);
  return {
    previousModule: String(prev).padStart(2, '0'),
    threshold: MASTERY_UNLOCK_THRESHOLD,
  };
}

/**
 * @deprecated Utiliser `lockedReasonData` + i18n côté UI. Conservé pour les
 * appelants hors application (outillage, tests hérités) ; aucune surface
 * élève ne doit l'afficher, sa phrase est en français.
 */
export function lockedReason(moduleNumber) {
  const { previousModule, threshold } = lockedReasonData(moduleNumber);
  return `Termine le module ${previousModule} à ${threshold} % pour débloquer ce module.`;
}
