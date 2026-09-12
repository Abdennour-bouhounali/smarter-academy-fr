import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * L'adresse de l'API, telle que le navigateur doit l'employer pour QUITTER
 * l'application — la connexion Google est une navigation, pas un appel fetch.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Registers a new student account from email + password alone and returns
 * an authenticated session, exactly like login() does. Self-registration
 * always produces a student — the backend ignores any role sent by the
 * client. Grade and any other profile data are collected afterwards
 * (see updateGrade()), not at registration.
 *
 * `acceptLegal` est un BOOLÉEN, et c'est tout ce que le client transmet du
 * consentement : les versions acceptées sont écrites par le SERVEUR, d'après
 * sa propre configuration. Envoyer une version depuis ici n'aurait aucun
 * effet — et c'est voulu (voir apps/api/config/legal.php).
 *
 * @returns {Promise<{success: boolean, token: string, user: object}>}
 * @throws {ApiError} On network failure or a non-2xx response (e.g. a
 *   duplicate email or a weak password come back as 422).
 */
export async function register({ email, password, acceptLegal }) {
  const { ok, status, data } = await apiRequest('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, accept_legal: acceptLegal }),
  });

  if (!ok) {
    throw new ApiError(
      data?.errors?.accept_legal?.[0] || data?.message || 'Erreur lors de l’inscription',
      classifyStatus(status),
      status,
    );
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


/**
 * Redemande l'e-mail de vérification pour l'élève CONNECTÉ.
 *
 * L'adresse n'est pas transmise : le serveur la prend sur le compte
 * authentifié. Ce point d'entrée ne peut donc pas servir à arroser la boîte
 * de quelqu'un d'autre.
 *
 * @throws {ApiError} 429 lorsque la limite de débit est atteinte.
 */
export async function resendVerificationEmail(token) {
  const { ok, status, data } = await apiRequest('/auth/email/resend', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(
      status === 429
        ? 'Trop de demandes. Patientez quelques minutes avant de réessayer.'
        : data?.message || 'Impossible d’envoyer l’e-mail.',
      classifyStatus(status),
      status,
    );
  }

  return data;
}

/**
 * Les versions des documents légaux qui ont cours, d'après le SERVEUR.
 * Affichage seulement — le client ne décide jamais d'une version.
 */
export async function fetchLegalVersions() {
  const { ok, status, data } = await apiRequest('/legal/versions');

  if (!ok) {
    throw new ApiError(data?.message || 'Versions indisponibles.', classifyStatus(status), status);
  }

  return data.versions;
}

/**
 * L'URL de départ vers Google.
 *
 * Une NAVIGATION (window.location), et non un fetch : l'authentification se
 * déroule sur le domaine de Google, qui refuse d'être chargé dans une requête
 * de second plan. Le frontend ne connaît ni l'identifiant client, ni le
 * secret — il ne connaît que cette adresse.
 */
export function googleRedirectUrl() {
  return `${API_URL}/auth/google/redirect`;
}

/**
 * Termine une inscription Google : crée le compte APRÈS consentement.
 *
 * `handoff` est le jeton d'attente opaque rendu par le serveur au retour de
 * Google. Il est chiffré : ni lisible ni falsifiable ici.
 */
export async function completeGoogleSignup({ handoff, acceptLegal }) {
  const { ok, status, data } = await apiRequest('/auth/google/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handoff, accept_legal: acceptLegal }),
  });

  if (!ok) {
    throw new ApiError(
      data?.errors?.accept_legal?.[0] || data?.message || 'La connexion avec Google n’a pas abouti.',
      classifyStatus(status),
      status,
    );
  }

  return data;
}
