/**
 * Les deux portes du flux enseignant « trouver → préparer → projeter » —
 * en un seul endroit, pour que la carte, la fiche du professeur et la coquille de leçon
 * parlent le même langage.
 */

import { hasClassBoard, classSessionPath, boardLessonOfPath } from '../../classSession/boardLessons';

/** Le catalogue de l'enseignant : le retour par défaut de la fiche du professeur. */
export const TEACHER_COURSES_PATH = '/enseignant/cours';

/** La fiche du professeur d'une leçon (route sous ProtectedRoute(teacher)). */
export function lessonMemoPath(lessonId) {
  return `${TEACHER_COURSES_PATH}/${encodeURIComponent(lessonId)}/memoire`;
}

/**
 * L'état de navigation qui demande à LessonClassroomShell d'ouvrir la
 * séance « mode classe » dès l'arrivée sur la leçon. Un état de navigation et
 * non un paramètre d'URL : un lien partagé ou un rafraîchissement n'ouvre
 * jamais une présentation tout seul.
 */
export const CLASSROOM_START_STATE = Object.freeze({ startClassroom: 'lesson' });

/**
 * La porte « en classe » d'une leçon. Une leçon qui a SON tableau (« séance en classe » avec son script —
 * features/classSession/boardLessons.js) n'a plus de « mode classe » : sa porte ouvre la séance de classe.
 * Les autres leçons gardent l'ancienne porte. `session` dit laquelle, pour le libellé.
 */
export function classDoor(lessonId, lessonPath) {
  return hasClassBoard(lessonId)
    ? { to: classSessionPath(lessonId), state: undefined, session: true }
    : { to: lessonPath, state: CLASSROOM_START_STATE, session: false };
}

/** Une étape se « présente » seule, seulement là où le « mode classe » existe encore. */
export const canPresentPath = (path) => Boolean(path) && !boardLessonOfPath(path);
