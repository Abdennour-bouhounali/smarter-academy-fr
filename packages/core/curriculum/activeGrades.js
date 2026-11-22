// The single allowlist of grade `id`s active in the Algerian product.
//
// Les classes du produit algérien : à l'origine 4AM et la Terminale seules
// (ALGERIA_PLATFORM_MASTER_SPEC.md §3) ; depuis le 2026-10-14 (phase 2 du
// déploiement du cycle moyen, décision D2 du propriétaire) aussi 1AM, 2AM et
// 3AM, dont toutes les leçons sont encore `coming_soon`.
//
// ── Ce qu'« active » veut dire, et ce qu'il ne veut PAS dire ────────────
// Active = la classe EXISTE : un élève peut s'y inscrire, elle apparaît dans
// les sélecteurs, l'API la sert. Ce n'est PAS « du contenu est disponible » :
//
//   4am          → programme arrêté (4 domaines, 28 sujets) ; une seule unité
//                  écrite, « الأعداد الطبيعيّة والأعداد النّاطقة » (9 leçons,
//                  apps/web/src/lessons/moyen/4am/). Le catalogue ne montre
//                  que les ميادين qui ont des leçons.
//   1am/2am/3am  → programme (net/official_programme_moyen.json) et découpage
//                  du manuel arrêtés ; AUCUNE leçon publiée le 2026-10-14 : le
//                  catalogue montre leurs unités et leurs leçons en cartes non
//                  cliquables « قيد الإعداد », publiées une à une (LEARNING_NET.md).
//   terminale_dz → identité seule. Aucun programme n'a été fourni
//                  (rapport de reprise §19, B1).
//
// Confondre les deux est le défaut que l'invariant I2 de la phase 6F existe
// pour empêcher : chaque classe porte un `curriculumStatus` que l'interface
// DOIT lire pour dire à l'élève où en est sa classe, au lieu de lui servir
// un catalogue vide qu'il prendra pour une panne.
//
// ── L'héritage français ─────────────────────────────────────────────────
// Les 8 classes françaises, leurs leçons et leur catalogue de référence ont
// été SUPPRIMÉS le 2026-09-25 ; `check:dormant-isolation` échoue s'ils
// reviennent.
export const ACTIVE_GRADE_IDS = Object.freeze(['1am', '2am', '3am', '4am', 'terminale_dz']);

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
