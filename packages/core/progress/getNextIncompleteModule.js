/**
 * Determines the first module number that has not been completed.
 *
 * @param {Set<number>} uniqueModules - Set of completed module numbers.
 * @param {number} totalModules - Total number of modules in the lesson.
 *        Required: callers supply the real count (apps/web reads it from the
 *        lesson registry) — this package never fabricates a default.
 * @param {number} [firstModuleNumber=1] - Le numéro du PREMIER module de la
 *        leçon. Il n'est pas toujours 1 : une leçon qui ouvre sur « أستعدّ »
 *        (stage `prerequisite_check`) commence à 0, et balayer 1..total
 *        proposait alors de « continuer » au module 1 en sautant le module 0
 *        que l'élève n'a pas encore fait. Le défaut reste 1, si bien que les
 *        appelants qui l'ignorent gardent exactement leur comportement.
 * @returns {number} The module number to resume at.
 */
export function getNextIncompleteModule(uniqueModules, totalModules, firstModuleNumber = 1) {
  const first = Number.isInteger(firstModuleNumber) && firstModuleNumber >= 0
    ? firstModuleNumber
    : 1;
  // `totalModules` est un NOMBRE de modules, pas un dernier numéro : une leçon
  // de 5 modules numérotés 0–4 se balaie de 0 à 4, pas de 0 à 5.
  const last = first + totalModules - 1;
  let resumeModule = first;
  for (let m = first; m <= last; m++) {
    if (!uniqueModules.has(m)) {
      resumeModule = m;
      break;
    }
  }
  return resumeModule;
}
