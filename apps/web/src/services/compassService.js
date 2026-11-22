import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * « بوصلتي » — la jauge de départ (docs/architecture/YEAR_COMPASS.md).
 *
 * Le serveur sert chaque question SANS clé de réponse, la corrige et ne
 * renvoie que ✓ / pas encore ; il recalcule lui-même les bandes à la fin.
 * Le code d'erreur clos (`compass_retake_too_early`…) voyage sur l'erreur.
 */
async function call(path, options) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    const error = new ApiError(apiMessage('compass', data, status), classifyStatus(status), status);
    error.code = data?.code ?? null;
    error.nextRetakeAt = data?.nextRetakeAt ?? null;
    throw error;
  }
  return data;
}

const send = (method, token, body) => ({
  method,
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});

export function fetchCompass(token) {
  return call('/compass', { headers: { Authorization: `Bearer ${token}` } }).then((d) => d.compass);
}

/** @param {{mode: 'lesson'|'not_following', lesson?: string}} pointer */
export function saveCompassPointer(token, pointer) {
  return call('/compass/pointer', send('PUT', token, pointer)).then((d) => d.compass);
}

/** @param {{targets: string[], pointerLesson: ?string, pointerSource: 'student'|'default', schoolYear: string}} scope */
export function startCompass(token, scope) {
  return call('/compass/sessions', send('POST', token, scope)).then((d) => d.compass);
}

export function fetchCompassQuestion(token, uuid, itemId, level) {
  return call(`/compass/sessions/${encodeURIComponent(uuid)}/questions`, send('POST', token, { itemId, level })).then((d) => d.question);
}

export function answerCompassQuestion(token, uuid, answerId, answer, unsure) {
  return call(`/compass/sessions/${encodeURIComponent(uuid)}/answers`, send('POST', token, { answerId, answer, unsure })).then((d) => d.result);
}

export function finishCompass(token, uuid) {
  return call(`/compass/sessions/${encodeURIComponent(uuid)}/finish`, send('POST', token)).then((d) => d.result);
}
