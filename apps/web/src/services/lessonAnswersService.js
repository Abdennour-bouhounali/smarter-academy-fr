import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Les réponses de l'élève pendant une leçon (pilote 2026-11-07) — à LUI seul, jamais une preuve. Le serveur fusionne clé par clé
 * (la plus récente gagne, `at`) et renvoie le tout. Voir StudentLessonAnswersController.
 */
export async function fetchLessonAnswers(token, lessonCode) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/answers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!ok) throw new ApiError(apiMessage('progressSave', data, status), classifyStatus(status), status);
  return data.answers ?? {};
}

export async function putLessonAnswers(token, lessonCode, answers) {
  const { ok, status, data } = await apiRequest(`/lessons/${encodeURIComponent(lessonCode)}/answers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers }),
  });
  if (!ok) throw new ApiError(apiMessage('progressSave', data, status), classifyStatus(status), status);
  return data.answers ?? {};
}
