import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Les questions PENDANT les labos (LabCheckpoint, 2026-10-28) — pour le compte de l'ENSEIGNANT seulement : il les coupe ou les rallume
 * pour lui-même (préparation, présentation). Pour les élèves elles sont toujours obligatoires ; aucun élève n'appelle ce service.
 * Une clé de labo est « <module>:<type> » (`nashat:gear-crank`).
 */

const auth = (token) => ({ Authorization: `Bearer ${token}`, Accept: 'application/json' });

/** @returns {Promise<string[]>} les clés coupées pour cet enseignant dans la leçon @throws {ApiError} */
export async function fetchTeacherLabs(token, lessonCode) {
  const { ok, status, data } = await apiRequest(`/teacher/labs/${encodeURIComponent(lessonCode)}`, { headers: auth(token) });
  if (!ok) throw new ApiError(apiMessage('classroomLoad', data, status), classifyStatus(status), status);
  return data.checkpointsOff ?? [];
}

/** @returns {Promise<string[]>} les clés coupées après le changement @throws {ApiError} */
export async function setTeacherLabCheckpoints(token, lessonCode, lab, enabled) {
  const { ok, status, data } = await apiRequest(`/teacher/labs/${encodeURIComponent(lessonCode)}`, {
    method: 'PATCH',
    headers: { ...auth(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab, checkpoints: enabled }),
  });
  if (!ok) throw new ApiError(apiMessage('classroomSave', data, status), classifyStatus(status), status);
  return data.checkpointsOff ?? [];
}
