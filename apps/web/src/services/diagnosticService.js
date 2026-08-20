import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * The diagnostic's algorithm and every assessment decision live entirely
 * server-side (see apps/api/app/Domain/Diagnostic) — this file is a thin
 * transport layer, never a place to compute correctness or mastery.
 */

/**
 * Mirrors the backend's DiagnosticEngine::PROVIDERS keys — the one place on
 * the frontend that knows which grades have a diagnostic, so entry points
 * (onboarding, the student home banner) don't each hardcode '6e'. The
 * backend still enforces this independently (§2 of the brief: no 5e/4e/3e
 * diagnostic yet) — this constant only controls whether the UI offers it.
 */
export const DIAGNOSTIC_AVAILABLE_GRADES = ['6e'];

export function isDiagnosticAvailableForGrade(grade) {
  return DIAGNOSTIC_AVAILABLE_GRADES.includes(grade);
}

/**
 * Starts a new diagnostic session for a grade, or resumes the student's
 * existing in-progress one — safe to call again after a refresh.
 * @returns {Promise<{session: object, question: object|null}>}
 * @throws {ApiError}
 */
export async function startDiagnostic(token, grade) {
  const { ok, status, data } = await apiRequest('/diagnostic/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ grade }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de démarrer le diagnostic.', classifyStatus(status), status);
  }

  return data;
}

/**
 * The student's most recent diagnostic for a grade — read-only, never
 * creates a session. Used on page load to decide whether to resume, show a
 * result, or offer to start.
 * @returns {Promise<{session: object|null, question: object|null}>}
 * @throws {ApiError}
 */
export async function fetchCurrentDiagnostic(token, grade) {
  const { ok, status, data } = await apiRequest(`/diagnostic/sessions/current?grade=${encodeURIComponent(grade)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible de récupérer le diagnostic.', classifyStatus(status), status);
  }

  return data;
}

/**
 * Submits one answer. Idempotent by questionId on the server — safe to
 * retry after a network failure without double-counting evidence.
 * @returns {Promise<{isCorrect: boolean, completed: boolean, nextQuestion: object|null, profile: object|null}>}
 * @throws {ApiError}
 */
export async function submitDiagnosticResponse(token, sessionId, { questionId, answer, responseTimeMs }) {
  const { ok, status, data } = await apiRequest(`/diagnostic/sessions/${sessionId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ questionId, answer, responseTimeMs }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Impossible d’enregistrer la réponse.', classifyStatus(status), status);
  }

  return data;
}
