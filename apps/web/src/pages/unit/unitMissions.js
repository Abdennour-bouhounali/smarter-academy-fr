/**
 * LA PAGE DE VALEUR D'UNE UNITÉ, regard élève (propriétaire, 2026-11-09 : maquette docs/experiments/unit-home-mockup-2026-11-09.html
 * validée, puis la fenêtre centrée décidée par le conseil). Une unité passe à cette vue quand ses leçons sont converties au prototype de
 * mission ET que son contenu ci-dessous est écrit ; la règle du propriétaire : « chaque fois qu'on complète les leçons d'une unité, on met
 * sa page à jour ». L'enseignant garde la page d'avant (UnitPage), intacte.
 *
 * Tout ce qui est ici est ÉCRIT PAR LA PLATEFORME (indépendance du manuel, CLAUDE.md) : le défi de l'unité est reformulé (le texte du
 * manuel reste dans le catalogue, jamais montré à l'élève par cette vue), l'aparté historique aussi. Contrat :
 *   icons   — { lessonId: emoji } : la station de chaque leçon (le même objet que sa scène de mission) ;
 *   short   — { lessonId: libellé court } : le nom de la station sur le chemin (2 lignes au plus) ;
 *   challenge — { lead, full, question, numbers: [n…], solvedAfter: lessonId } : `lead` tient en 3 lignes sur la carte, `full` dans la
 *              fenêtre ; chaque nombre de `numbers` est mis en valeur ; `solvedAfter` : la leçon après laquelle l'élève a de quoi le résoudre ;
 *   keys    — [{ icon, label, after: lessonId }] : les « مفاتيح الحلّ », une par grande كفاءة de l'unité, gagnée quand `after` est terminée ;
 *   history — { title, text } : l'aparté historique, en une ou deux phrases.
 * unitMissions.test.js vérifie que chaque leçon a son icône et son libellé, que chaque `after` est une leçon de l'unité, que les nombres
 * sont dans le texte, et qu'aucune ligne ne renvoie au manuel.
 */
// Keyed by unit code. EMPTY until the French units exist (2026-11-22): every unit page shows its ordinary view. The
// Algerian entries are in git, `git show 049380e:apps/web/src/pages/unit/unitMissions.js`.
export const UNIT_MISSIONS = Object.freeze({});

export const unitMissionOf = (unitId) => UNIT_MISSIONS[unitId] ?? null;

/**
 * L'état de l'unité pour CET élève, à partir de la progression de chaque leçon (pure, testée) :
 *   lessons : [{ id, done, available }] dans l'ordre (leçons puis synthèse) → { done, current, keysEarned, finished }
 *   `current` : la première leçon ouverte non terminée (sinon null : l'unité est finie).
 */
export function unitState(lessons, mission) {
  const doneIds = new Set(lessons.filter((l) => l.done).map((l) => l.id));
  const current = lessons.find((l) => l.available && !l.done) ?? null;
  const keysEarned = (mission?.keys ?? []).filter((k) => doneIds.has(k.after)).length;
  return { done: doneIds.size, current: current?.id ?? null, keysEarned, finished: lessons.length > 0 && lessons.every((l) => l.done) };
}

/** Les prérequis d'une leçon DANS l'unité que l'élève n'a pas encore terminés (seuls ceux-là se montrent d'emblée — conseil). */
export function unmetPrerequisites(lesson, doneIds, unitLessonIds) {
  return (lesson.prerequisiteLessonCodes ?? []).filter((code) => unitLessonIds.has(code) && !doneIds.has(code));
}
