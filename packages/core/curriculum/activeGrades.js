// The single allowlist of grade `id`s active in the product: the four years of
// the collège, in order.
//
// ── Ce qu'« active » veut dire, et ce qu'il ne veut PAS dire ────────────
// Active = la classe EXISTE : un élève peut s'y inscrire, elle apparaît dans
// les sélecteurs, l'API la sert. Ce n'est PAS « du contenu est disponible » :
// depuis le 2026-11-22 (FRANCE_REBUILD_PLAN.md §4bis) les quatre classes ont
// leurs thèmes et AUCUNE leçon.
//
// Confondre les deux est le défaut que l'invariant I2 existe pour empêcher :
// chaque classe porte un `curriculumStatus` que l'interface DOIT lire pour
// dire à l'élève où en est sa classe, au lieu de lui servir un catalogue vide
// qu'il prendra pour une panne.
export const ACTIVE_GRADE_IDS = Object.freeze(['6e', '5e', '4e', '3e']);

export function isGradeActive(gradeId) {
  return ACTIVE_GRADE_IDS.includes(gradeId);
}

/**
 * Filters a courseLevels-shaped tree (level -> grades[]) down to only active
 * grades, dropping levels left with zero grades. Structure-preserving: every
 * other field on a level/grade passes through untouched.
 */
export function filterActiveCourseLevels(courseLevels) {
  return courseLevels
    .map((level) => ({
      ...level,
      grades: level.grades.filter((grade) => isGradeActive(grade.id)),
    }))
    .filter((level) => level.grades.length > 0);
}
