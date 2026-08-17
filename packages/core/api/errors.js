/**
 * A typed API error, so callers can branch on `error.type` instead of
 * string-matching messages. Pure — no `fetch`, no `import.meta`, so it's
 * identically usable by a future non-web API client.
 *
 * @property {string} type - One of NETWORK_ERROR, VALIDATION_ERROR,
 *   AUTHENTICATION_ERROR, AUTHORIZATION_ERROR, NOT_FOUND, SERVER_ERROR,
 *   UNEXPECTED_ERROR.
 * @property {number|null} status - The HTTP status code, if any (null for NETWORK_ERROR).
 */
export class ApiError extends Error {
  constructor(message, type, status = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
  }
}

/** Maps an HTTP status code to an ApiError type. */
export function classifyStatus(status) {
  if (status === 401) return 'AUTHENTICATION_ERROR';
  if (status === 403) return 'AUTHORIZATION_ERROR';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'VALIDATION_ERROR';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNEXPECTED_ERROR';
}
