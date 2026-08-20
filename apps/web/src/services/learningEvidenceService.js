import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Thin transport for learning-evidence submission and the learning profile —
 * same shape as diagnosticService.js. Correctness is computed by the lesson's
 * own validator (see EXERCISE_CONTRACT.md) BEFORE this layer; the server
 * validates the student/lesson/learning-point relationship, never trusts ids
 * it can't resolve, and is idempotent by attemptId (safe to retry).
 */

/**
 * @param {string} token
 * @param {string} lessonCode - the lesson's coursesData.js id, e.g. 'resolution-problemes-1'
 * @param {{questionCode: string, attemptId: string, isCorrect: boolean, learningPointCodes: string[], answer?: object|null}} evidence
 * @returns {Promise<{duplicate: boolean, evidenceId: number}>}
 * @throws {ApiError}
 */
export async function submitLearningEvidence(token, lessonCode, evidence) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(evidence),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’enregistrer la preuve d’apprentissage.', classifyStatus(status), status);
  }

  return data;
}

/**
 * The student's full learning profile: initialKnowledge (diagnostic
 * baselines, frozen) + currentMastery (live learning-point rollup).
 * @returns {Promise<{initialKnowledge: object[], currentMastery: object[]}>}
 * @throws {ApiError}
 */
export async function fetchLearningProfile(token) {
  const { ok, status, data } = await apiRequest('/students/me/learning-profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de récupérer le profil d’apprentissage.', classifyStatus(status), status);
  }

  return data.profile;
}
