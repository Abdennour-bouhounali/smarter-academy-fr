import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * L'adresse de l'API, telle que le navigateur doit l'employer pour QUITTER
 * l'application — la connexion Google est une navigation, pas un appel fetch.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Registers a new account from « prénom et nom » + email + password and
 * returns an authenticated session, exactly like login() does. The role comes
 * from a server whitelist (student by default, or teacher). Grade is collected
 * afterwards (see updateGrade()), not at registration.
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
export async function register({
  firstName,
  lastName,
  email,
  password,
  acceptLegal,
  accountType = 'student',
  classJoinLink,
  classJoinConsent,
}) {
  // `accountType` : 'student' (défaut) ou 'teacher'. Le serveur tient la
  // liste blanche ; le client ne fait que transmettre le choix.
  // `classJoinLink` + `classJoinConsent` : l'élève vient du lien d'une classe
  // et y a consenti ; le serveur revalide le jeton et rejoint à la
  // vérification de l'adresse (PendingClassJoin).
  const body = { firstName, lastName, email, password, accept_legal: acceptLegal, accountType };
  if (classJoinLink && classJoinConsent === true) {
    body.classJoinLink = classJoinLink;
    body.classJoinConsent = true;
  }
  const { ok, status, data } = await apiRequest('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!ok) {
    throw new ApiError(apiMessage('register', data, status), classifyStatus(status), status);
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
    throw new ApiError(apiMessage('login', data, status), classifyStatus(status), status);
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
    throw new ApiError(apiMessage('session', data, status), classifyStatus(status), status);
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
    throw new ApiError(apiMessage('logout', data, status), classifyStatus(status), status);
  }
}

/**
 * Changes the current user's « prénom et nom » — students and teachers alike
 * (profile page, and the onboarding step for accounts that have none yet).
 * @returns {Promise<object>} The updated user.
 * @throws {ApiError} On network failure or a non-2xx response.
 */
export async function updateProfile(token, { firstName, lastName }) {
  const { ok, status, data } = await apiRequest('/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ firstName, lastName }),
  });

  if (!ok) {
    throw new ApiError(apiMessage('profileUpdate', data, status), classifyStatus(status), status);
  }

  return data.user;
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
    throw new ApiError(apiMessage('gradeUpdate', data, status), classifyStatus(status), status);
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
    // apiMessage() traite lui-même le 429 (voir apiMessage.js) : la branche
    // explicite n'avait plus de raison d'être, et elle était française.
    throw new ApiError(apiMessage('sendEmail', data, status), classifyStatus(status), status);
  }

  return data;
}

/**
 * « Mot de passe oublié » — demande le lien par courriel.
 *
 * Le serveur répond pareil que l'adresse existe ou non : ne jamais en
 * déduire (ni afficher) qu'un compte existe.
 */
export async function requestPasswordReset(email) {
  const { ok, status, data } = await apiRequest('/auth/password/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!ok) {
    throw new ApiError(apiMessage('sendEmail', data, status), classifyStatus(status), status);
  }

  return data;
}

/**
 * Choisit un nouveau mot de passe avec le jeton reçu par courriel.
 * Une réponse `reason: 'invalid_token'` (422) veut dire lien invalide ou
 * expiré ; les autres 422 sont des règles de mot de passe.
 */
export async function resetPassword({ token, email, password, passwordConfirmation }) {
  const { ok, status, data } = await apiRequest('/auth/password/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, password, password_confirmation: passwordConfirmation }),
  });

  if (!ok) {
    const invalidLink = data?.reason === 'invalid_token';
    const error = new ApiError(
      apiMessage(invalidLink ? 'resetLinkInvalid' : 'resetPassword', data, status),
      classifyStatus(status),
      status,
    );
    error.invalidLink = invalidLink;
    throw error;
  }

  return data;
}

/**
 * L'URL de départ vers Google.
 *
 * Une NAVIGATION (window.location), et non un fetch : l'authentification se
 * déroule sur le domaine de Google, qui refuse d'être chargé dans une requête
 * de second plan. Le frontend ne connaît ni l'identifiant client, ni le
 * secret — il ne connaît que cette adresse.
 */
export function googleRedirectUrl(accountType = 'student') {
  // Le type de compte (élève par défaut, ou enseignant) part avec la
  // navigation ; le serveur le tient dans une liste blanche et ne s'en sert
  // que pour un compte NEUF.
  const suffix = accountType === 'teacher' ? '?accountType=teacher' : '';
  return `${API_URL}/auth/google/redirect${suffix}`;
}

/**
 * Termine une inscription Google : crée le compte APRÈS consentement.
 *
 * `handoff` est le jeton d'attente opaque rendu par le serveur au retour de
 * Google. Il est chiffré : ni lisible ni falsifiable ici.
 */
export async function completeGoogleSignup({
  handoff,
  firstName,
  lastName,
  password,
  acceptLegal,
  accountType = 'student',
}) {
  const { ok, status, data } = await apiRequest('/auth/google/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handoff, firstName, lastName, password, accept_legal: acceptLegal, accountType }),
  });

  if (!ok) {
    throw new ApiError(apiMessage('google', data, status), classifyStatus(status), status);
  }

  return data;
}

/** Are registrations open? (apps/api › config/registration.php) — `{ open, classLinks }`; unreachable = open (the server decides anyway). */
export async function registrationStatus() {
  try {
    const { ok, data } = await apiRequest('/registration', { method: 'GET' });
    return ok ? { open: Boolean(data.open), classLinks: Boolean(data.classLinks) } : { open: true, classLinks: true };
  } catch {
    return { open: true, classLinks: true };
  }
}

/**
 * The waiting list while registrations are closed (`POST /waitlist`, apps/api › WaitlistController, the authority):
 * `email` required; `name` (≤ 100), `role` (student / teacher / parent) and a French `phone` sent only when given.
 * The validation sentences are written in French for the person by the server; anything else follows apiMessage.
 */
export async function joinWaitlist({ email, name, role, phone }) {
  const body = {
    email: String(email ?? '').trim(),
    ...(name?.trim() ? { name: name.trim() } : {}),
    ...(role ? { role } : {}),
    ...(phone?.trim() ? { phone: phone.trim() } : {}),
  };
  const { ok, status, data } = await apiRequest('/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!ok) throw new Error(data?.errors?.email?.[0] ?? data?.errors?.phone?.[0] ?? apiMessage('waitlist', data, status));
  return data;
}
