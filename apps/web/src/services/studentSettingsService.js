import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * « الإعدادات » de l'élève (2026-10-06) — GET/PATCH /me/settings.
 * Un élève de classe lit ses réglages sans pouvoir les changer
 * (`managedByTeacher`) : son enseignant les règle (classGroupService).
 */
async function call(path, options) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    const error = new ApiError(apiMessage('settings', data, status), classifyStatus(status), status);
    error.reason = typeof data?.reason === 'string' ? data.reason : null;
    throw error;
  }
  return data;
}

export function fetchStudentSettings(token) {
  return call('/me/settings', { headers: { Authorization: `Bearer ${token}` } });
}

export function updateStudentSettings(token, patch) {
  return call('/me/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(patch),
  });
}
