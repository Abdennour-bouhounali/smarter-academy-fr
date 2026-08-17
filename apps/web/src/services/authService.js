import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * Registers a new student account and returns an authenticated session,
 * exactly like login() does. Self-registration always produces a student —
 * the backend ignores any role sent by the client.
 * @returns {Promise<{success: boolean, token: string, user: object}>}
 * @throws {ApiError} On network failure or a non-2xx response (e.g. a
 *   duplicate email or a weak password come back as 422).
 */
export async function register({ firstName, lastName, email, password, passwordConfirmation, grade }) {
  const { ok, status, data } = await apiRequest('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirmation: passwordConfirmation,
      grade,
    }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Erreur lors de l’inscription', classifyStatus(status), status);
  }

  return data;
}

/**
 * Logs an admin or a student in.
 * @returns {Promise<{success: boolean, token: string, user: object}>}
 * @throws {ApiError} On network failure or a non-2xx response.
 */
export async function login(email, password) {
  const { ok, status, data } = await apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Erreur de connexion', classifyStatus(status), status);
  }

  return data;
}

/**
 * Fetches the currently-authenticated user for a given token.
 * @returns {Promise<object>} The user object.
 * @throws {ApiError} On network failure, an invalid/expired token, or a non-2xx response.
 */
export async function fetchCurrentUser(token) {
  const { ok, status, data } = await apiRequest('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok || !data?.success) {
    throw new ApiError(data?.message || 'Session invalide.', classifyStatus(status), status);
  }

  return data.user;
}

/**
 * Revokes the given token server-side. Best-effort from the caller's point
 * of view — see AuthContext, which always clears local session state
 * regardless of whether this call succeeds.
 * @throws {ApiError} On network failure or a non-2xx response.
 */
export async function logout(token) {
  const { ok, status, data } = await apiRequest('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Erreur de déconnexion', classifyStatus(status), status);
  }
}

/**
 * Changes the current user's grade — the one way a student's default
 * learning context changes after registration. Does not touch progress.
 * @returns {Promise<object>} The updated user.
 * @throws {ApiError} On network failure or a non-2xx response.
 */
export async function updateGrade(token, grade) {
  const { ok, status, data } = await apiRequest('/auth/grade', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ grade }),
  });

  if (!ok) {
    throw new ApiError(data?.message || 'Erreur lors du changement de classe.', classifyStatus(status), status);
  }

  return data.user;
}
