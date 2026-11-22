import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Thin transport for learning-evidence submission and the learning profile —
 * same shape as diagnosticService.js. Mastery V2 : the SERVER is the judge of
 * correctness, learning points and difficulty (it reads them from the item
 * registry) — the client only reports what the student picked. The server
 * is idempotent by attemptId (safe to retry).
 */

/**
 * @param {string} token
 * @param {string} lessonCode - the lesson's coursesData.js id, e.g. 'resolution-problemes-1'
 * @param {{questionCode: string, attemptId: string, answer: {picked: number|null}}} evidence
 * @returns {Promise<{success: boolean, duplicate: boolean, evidenceId: number, outcome: 'correct'|'incorrect'|'abandoned'}>}
 * @throws {ApiError}
 */
export async function submitLearningEvidence(token, lessonCode, evidence) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(evidence),
  });

  if (!ok) {
    throw new ApiError(apiMessage('evidenceSave', data, status), classifyStatus(status), status);
  }

  return data;
}

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
 * « Pourquoi cette حالة ? » — the explainable-mastery payload of ONE learning
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

/**
 * « ما التالي؟ » — the server's next-step recommendations for ONE lesson
 * (Mastery V2, phase 8a), most urgent first. Never blocking: the UI shows
 * them as suggestions only.
 *
 * @param {string} token
 * @param {string} lessonCode - the lesson's coursesData.js id
 * @returns {Promise<Array<{learningPoint: {code: string, title: string}, status: string,
 *   statusReason: string|null, freshness: string|null,
 *   kind: 'prerequisite'|'reteach'|'practice'|'assessment'|'refresh'|'start',
 *   modules: Array<{number: number, title: string}>, prerequisites: Array<{code: string, title: string}>,
 *   priority: number}>>}
 * @throws {ApiError}
 */
export async function fetchLessonRecommendations(token, lessonCode) {
  const { ok, status, data } = await apiRequest(`/students/me/lessons/${encodeURIComponent(lessonCode)}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(apiMessage('profileLoad', data, status), classifyStatus(status), status);
  }

  return Array.isArray(data?.recommendations) ? data.recommendations : [];
}
