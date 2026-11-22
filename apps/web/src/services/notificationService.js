import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * La CLOCHE (2026-10-06) — GET /me/notifications, dans l'application
 * seulement (aucun courriel). Premier type : `answer_reviewed`
 * (« صحّح أستاذك إجابتك »), `data.reviewId` ouvre la correction.
 */
async function call(path, options) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) throw new ApiError(apiMessage('generic', data, status), classifyStatus(status), status);
  return data;
}

const headers = (token) => ({ Authorization: `Bearer ${token}`, Accept: 'application/json' });

/** @returns {Promise<{unread: number, notifications: Array<{id: string, type: string, data: object, read: boolean, createdAt: string}>}>} */
export function fetchNotifications(token) {
  return call('/me/notifications', { headers: headers(token) });
}

export function markNotificationRead(token, id) {
  return call(`/me/notifications/${encodeURIComponent(id)}/read`, { method: 'POST', headers: headers(token) });
}

export function markAllNotificationsRead(token) {
  return call('/me/notifications/read-all', { method: 'POST', headers: headers(token) });
}
