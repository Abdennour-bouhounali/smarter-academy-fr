import { apiRequest, ApiError, classifyStatus } from '../apiClient';

/**
 * Socle commun des services d'administration.
 *
 * Même convention que practiceService : le jeton est TOUJOURS le premier
 * argument, jamais lu depuis un contexte à l'intérieur du service — c'est ce
 * qui garde ces modules testables sans monter React.
 */
export async function call(path, options, fallbackMessage) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    throw new ApiError(data?.message || fallbackMessage, classifyStatus(status), status);
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

/**
 * Construit une query string en ignorant les filtres vides — sinon une liste
 * sans filtre partirait avec `?grade=&status=` et le backend recevrait des
 * chaînes vides à interpréter.
 */
export function query(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const string = search.toString();
  return string ? `?${string}` : '';
}
