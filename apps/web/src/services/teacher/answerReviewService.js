import { apiBlob } from '../apiClient';
import { call, get, query, send } from './teacherClient';

/**
 * « تصحيح الإجابات » — la file de correction de l'enseignant (API :
 * TeacherAnswerReviewController, 2026-10-06). Périmètre tenu par le serveur :
 * les élèves actifs de SES classes.
 */

/** @returns {Promise<{total: number, items: Array<object>, classrooms: Array<{id: number, name: string}>}>} */
export function fetchReviewQueue(token, { classroom = null } = {}) {
  return call(`/teacher/reviews${query({ classroom })}`, get(token), 'generic');
}

/** Le compteur du menu. */
export function fetchReviewCount(token) {
  return call('/teacher/reviews/count', get(token), 'generic').then((d) => d.pending ?? 0);
}

/** @param {'correct'|'incorrect'} verdict */
export function decideReview(token, reviewId, verdict, comment) {
  return call(`/teacher/reviews/${encodeURIComponent(reviewId)}`, send('POST', token, { verdict, comment: comment || null }), 'generic');
}

/** Une photo de copie d'un élève de l'enseignant. */
export function fetchTeacherAnswerImage(token, imageId, annotated = false) {
  return apiBlob(
    `/teacher/answer-images/${encodeURIComponent(imageId)}${annotated ? '?annotated=1' : ''}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

/** La copie annotée au stylo rouge (photo + traits, composée dans le navigateur). */
export function uploadAnnotation(token, imageId, blob) {
  const body = new FormData();
  body.append('image', blob, 'annotation.jpg');
  return call(
    `/teacher/answer-images/${encodeURIComponent(imageId)}/annotation`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, body },
    'generic',
  );
}
