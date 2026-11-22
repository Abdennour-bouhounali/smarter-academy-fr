import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Le battement du temps d'étude (docs/architecture/PARENT_SPACE.md §3).
 * `keepalive` : l'envoi part même quand l'onglet se ferme (pagehide).
 *
 * @param {string} token
 * @param {Array<{surface: string, active: number, idle: number, away: number, leaves: number}>} segments
 */
export async function sendStudyTime(token, segments) {
  const { ok, status, data } = await apiRequest('/student/study-time', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ segments }),
  });
  if (!ok) throw new ApiError('study-time', classifyStatus(status), status);
  return data;
}

/** Un jeton refusé (révoqué, expiré) : les secondes ne partiront jamais avec lui. */
export function isDeadTokenError(error) {
  return error?.type === 'AUTHENTICATION_ERROR' || error?.type === 'AUTHORIZATION_ERROR';
}

// Le tracker monté enregistre ici son envoi, pour que la déconnexion le vide
// AVANT de révoquer le jeton (sinon le dernier battement part avec un jeton mort → 401).
let flusher = null;

/** @param {(() => Promise<unknown>) | null} fn */
export function registerStudyTimeFlusher(fn) {
  flusher = fn;
}

/** Envoie les secondes en attente ; ne rejette jamais, ne bloque pas plus de 2 s. */
export function flushStudyTimeNow() {
  if (!flusher) return Promise.resolve();
  const sent = Promise.resolve().then(flusher).catch(() => {});
  return Promise.race([sent, new Promise((resolve) => setTimeout(resolve, 2_000))]);
}
