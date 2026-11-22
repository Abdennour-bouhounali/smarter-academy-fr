import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Thin transport for the learning profile — same shape as
 * diagnosticService.js. Mastery V2 : the SERVER is the judge of mastery.
 */

/**
 * The student's learning profile: initialKnowledge (diagnostic baselines,
 * frozen) + currentMastery (live learning-point rollup). Each learning-point
 * row carries `status, statusReason, confidence, freshness` and the evidence
 * counters (Mastery V2).
 *
 * @param {string} token
 * @param {{lesson?: string, unit?: string, grade?: string}} [filters]
 *        narrows `currentMastery` server-side — a lesson page asks for its
 *        own lesson, a unit page for its unit; dashboards take the whole.
 * @returns {Promise<{initialKnowledge: object[], currentMastery: object[]}>}
 * @throws {ApiError}
 */
export async function fetchLearningProfile(token, filters = {}) {
  const params = new URLSearchParams();
  for (const key of ['lesson', 'unit', 'grade']) {
    if (filters?.[key]) params.set(key, String(filters[key]));
  }
  const query = params.toString();

  const { ok, status, data } = await apiRequest(`/students/me/learning-profile${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(apiMessage('profileLoad', data, status), classifyStatus(status), status);
  }

  return data.profile;
}

/**
 * « Pourquoi cet état ? » — the explainable-mastery payload of ONE learning
 * point : status, reason, the evidence facts and the last attempts.
 *
 * @param {string} token
 * @param {string} code - the learning point's code, e.g. '4am_fractions_P1'
 * @returns {Promise<{learningPoint: {code: string, title: string}, status: string, statusReason: string|null,
 *   confidence: number|null, engineVersion: number, freshness: string|null,
 *   evidence: object|null, recent: object[]}>}
 * @throws {ApiError}
 */
export async function fetchLearningPointExplanation(token, code) {
  const { ok, status, data } = await apiRequest(`/students/me/learning-points/${encodeURIComponent(code)}/explanation`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(apiMessage('profileLoad', data, status), classifyStatus(status), status);
  }

  return data.explanation;
}
