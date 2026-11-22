import { apiRequest, ApiError, classifyStatus } from '../apiClient';
import { apiMessage } from '../apiMessage';

/**
 * Socle des services de l'espace ENSEIGNANT — même convention que
 * services/admin/adminClient.js (le jeton est toujours le premier argument),
 * avec une différence qui compte : le message d'erreur est ARABE, résolu par
 * apiMessage depuis une clé du catalogue, jamais la phrase du serveur
 * (ARABIC_RTL_CONTRACT.md : « the API speaks codes, the client speaks
 * Arabic »). Le MOTIF clos (`reason`) voyage sur l'erreur pour que la page
 * choisisse sa phrase.
 *
 * @param {string} path
 * @param {RequestInit} options
 * @param {string} messageKey  clé sous `apiErrors` de `common`
 */
export async function call(path, options, messageKey) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    const error = new ApiError(apiMessage(messageKey, data, status), classifyStatus(status), status);
    error.reason = data?.reason ?? null;
    throw error;
  }
  return data;
}

export const get = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const send = (method, token, body) => ({
  method,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

export function query(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const string = search.toString();
  return string ? `?${string}` : '';
}
