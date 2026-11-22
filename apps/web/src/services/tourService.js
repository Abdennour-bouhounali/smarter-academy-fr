import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * « جولة تعريفية » (2026-10-07) — GET /me/tours (les visites closes par ce
 * compte) et POST /me/tours/{key} (clore une visite : `completed` ou
 * `skipped`). Voir docs/architecture/PAGE_TOURS.md.
 */
async function call(path, options) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) throw new ApiError(apiMessage('generic', data, status), classifyStatus(status), status);
  return data;
}

const headers = (token) => ({ Authorization: `Bearer ${token}`, Accept: 'application/json' });

/** @returns {Promise<{eligible: boolean, tours: Record<string, {status: string, step: number|null, at: string}>}>} */
export function fetchPageTours(token) {
  return call('/me/tours', { headers: headers(token) });
}

export function closePageTour(token, key, status, step) {
  return call(`/me/tours/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, step }),
  });
}
