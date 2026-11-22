/**
 * LA PORTE d'une étape (une PARTIE d'un module), en un seul endroit — le
 * pendant de `moduleGate.js` un cran plus bas.
 *
 * Le verrou séquentiel des StepCard est un guide de progression de l'ÉLÈVE :
 * l'étape N s'ouvre en répondant à l'étape N-1. Trois situations le
 * suspendent, sans jamais le modifier :
 *   — le module a DÉJÀ été terminé (`alreadyCompleted`) : il devient un
 *     espace de révision libre, comportement historique ;
 *   — la NAVIGATION LIBRE du lecteur (`learningViewer.freeNavigation`) : un
 *     enseignant ouvre n'importe quelle partie, dans n'importe quel ordre —
 *     il PRÉPARE, il n'apprend pas ;
 *   — présenter (وضع القسم), pour la même raison qu'au niveau module : on
 *     projette la partie 4 sans avoir « fait » les parties 1 à 3.
 *
 * Le moteur ne teste jamais un rôle : il reçoit `freeNavigation`, décidé une
 * seule fois par `features/learning/learningViewer.js`.
 *
 * @param {boolean} alreadyCompleted  isModuleCompleted(moduleNumber.toString())
 * @param {boolean} sequentialLocked  le `!prevStepDone` du module lui-même
 * @param {{freeNavigation?: boolean, presenting?: boolean}} [viewer]
 * @returns {boolean}
 */
export function isStepLocked(alreadyCompleted, sequentialLocked, { freeNavigation = false, presenting = false } = {}) {
  if (freeNavigation || presenting || alreadyCompleted) return false;
  return sequentialLocked;
}

/**
 * Le geste « partie suivante » / « module suivant » est-il ouvert ?
 *
 * Pour l'élève il l'est quand le module est terminé (`allDone`) — le bouton
 * gris et son rappel « il reste… » sont sa boussole. Pour un lecteur en
 * navigation libre, avancer est toujours STRUCTUREL : l'enseignant passe au
 * module suivant sans avoir complété celui-ci, comme il passe d'une partie à
 * l'autre. Même règle, même endroit que `isStepLocked`.
 *
 * @param {boolean} allDone
 * @param {{freeNavigation?: boolean}} [viewer]
 */
export function canAdvance(allDone, { freeNavigation = false } = {}) {
  return freeNavigation || allDone;
}
