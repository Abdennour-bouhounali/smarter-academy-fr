import { ApiError, classifyStatus } from '@smarter-academy/core';

// Re-exported so existing `from './apiClient'` imports keep working —
// ApiError/classifyStatus themselves now live in @smarter-academy/core
// (zero fetch/import.meta coupling, directly reusable by a future non-web client).
export { ApiError, classifyStatus };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Thin fetch wrapper shared by every service. Resolves the API base URL,
 * converts a network failure (fetch throwing) into a typed ApiError, and
 * always attempts to parse a JSON body.
 *
 * Does NOT throw for non-2xx HTTP responses — each endpoint in this API has
 * its own error-message convention today (see authService/contactService),
 * so that decision is left to the caller rather than forced here.
 *
 * This function itself stays web-side: it depends on `import.meta.env`
 * (Vite-specific) for the base URL. A future React Native client would need
 * its own equivalent thin wrapper (same `fetch`, a different way to read the
 * base URL) — but it can reuse ApiError/classifyStatus unchanged.
 *
 * @param {string} path - e.g. '/auth/login' (appended to the API base URL).
 * @param {RequestInit} [options]
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError('Impossible de joindre le serveur.', 'NETWORK_ERROR');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // No JSON body — leave data as null; the caller decides if that's an error.
  }

  return { ok: response.ok, status: response.status, data };
}
