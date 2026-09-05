import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Thin transport for the student's latest final-test (evaluation-module)
 * attempt — score + full per-question review, one row per (user, lesson),
 * overwritten on each submit. See LessonFinalTestAttemptController.
 */

/**
 * @param {string} token
 * @param {string} lessonCode - the lesson's coursesData.js id
 * @returns {Promise<{score: number, totalQuestions: number, answers: object[], submittedAt: string}|null>}
 * @throws {ApiError}
 */
export async function fetchFinalTestAttempt(token, lessonCode) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/final-test-attempt`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de récupérer le résultat du test.', classifyStatus(status), status);
  }

  return data.attempt;
}

/**
 * @param {string} token
 * @param {string} lessonCode
 * @param {{score: number, totalQuestions: number, answers: object[], submittedAt: string}} attempt
 * @returns {Promise<{score: number, totalQuestions: number, answers: object[], submittedAt: string}>}
 * @throws {ApiError}
 */
export async function putFinalTestAttempt(token, lessonCode, attempt) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/final-test-attempt`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(attempt),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’enregistrer le résultat du test.', classifyStatus(status), status);
  }

  return data.attempt;
}

/**
 * Clears the student's saved attempt — the "Redo" action.
 * @param {string} token
 * @param {string} lessonCode
 * @throws {ApiError}
 */
export async function deleteFinalTestAttempt(token, lessonCode) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/final-test-attempt`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de réinitialiser le test.', classifyStatus(status), status);
  }
}
