import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Thin transport for cross-device lesson progression — same shape as
 * learningEvidenceService.js. The server merges (union of completed modules,
 * latest-wins position, monotonic status) and returns the merged row; the
 * client adopts that response as truth, since the server may know about other
 * devices' progress.
 */

/**
 * @param {string} token
 * @param {string} lessonCode - the lesson's coursesData.js id, e.g. 'fractions-1'
 * @param {{completedModules: string[], currentModule: ?number, status: string, lastActivityAt: string}} snapshot
 * @returns {Promise<{status: string, currentModule: ?number, completedModules: string[], lastActivityAt: string, completedAt: ?string}>}
 * @throws {ApiError}
 */
export async function putLessonProgress(token, lessonCode, snapshot) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(snapshot),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’enregistrer la progression.', classifyStatus(status), status);
  }

  return data.progress;
}

/**
 * Every lesson-progress row for the student, keyed by lesson code.
 * @param {string} token
 * @returns {Promise<Record<string, object>>}
 * @throws {ApiError}
 */
export async function fetchAllLessonProgress(token) {
  const { ok, status, data } = await apiRequest('/students/me/lesson-progress', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de récupérer la progression.', classifyStatus(status), status);
  }

  return data.progress;
}
