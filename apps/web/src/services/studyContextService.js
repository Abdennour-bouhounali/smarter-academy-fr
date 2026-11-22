import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * L'élève et sa classe (« قسمي ») : où il étudie, rejoindre, quitter.
 *
 * Le serveur reste l'autorité : rejoindre ne prend qu'un code ou le jeton
 * du lien de classe (jamais un identifiant de classe), et ce que l'élève voit ensuite —
 * dont les leçons que l'enseignant a masquées — revient par
 * GET /content/availability. Le MOTIF clos voyage sur l'erreur.
 */
async function call(path, options, messageKey) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    const error = new ApiError(apiMessage(messageKey, data, status), classifyStatus(status), status);
    error.reason = data?.reason ?? null;
    throw error;
  }
  return data;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

export function fetchStudyContext(token) {
  return call('/student/study-context', { headers: auth(token) }, 'studyContext').then((d) => d.studyContext);
}

/**
 * Rejoindre = CONSENTIR au partage : le serveur refuse (422
 * `consent_required`) tout corps sans `consent: true`. Le drapeau ne part
 * que si l'appelant le passe explicitement — il doit venir d'un geste de
 * l'élève (« أوافق وأنضمّ »), jamais d'un défaut du service.
 *
 * Par le LIEN, la réponse est idempotente : un membre reçoit
 * `alreadyMember: true` (200) au lieu d'une erreur.
 *
 * @param {{code?: string, link?: string, consent?: boolean}} by
 */
export function joinClassGroup(token, by) {
  const body = by.link ? { link: by.link } : { code: by.code };
  if (by.consent === true) body.consent = true;
  return call('/student/classrooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth(token) },
    body: JSON.stringify(body),
  }, 'classroomJoin');
}

/**
 * Confirmer le texte de partage ACTUEL pour une adhésion déjà active
 * (`consentRequired` : adhésion antérieure au texte, ou texte modifié).
 */
export function confirmClassConsent(token, classroomId) {
  return call(`/student/classrooms/${encodeURIComponent(classroomId)}/consent`, {
    method: 'POST',
    headers: auth(token),
  }, 'classroomJoin').then((d) => d.studyContext);
}

/**
 * Accepter que l'ÉTABLISSEMENT de la classe lise l'apprentissage
 * (`schoolConsentRequired`, SCHOOL_ADMIN_SPACE.md §4).
 */
export function confirmSchoolConsent(token, classroomId) {
  return call(`/student/classrooms/${encodeURIComponent(classroomId)}/school-consent`, {
    method: 'POST',
    headers: auth(token),
  }, 'classroomJoin').then((d) => d.studyContext);
}

/** Les suggestions des enseignants de l'élève — jamais un verrou. */
export function fetchTeacherRecommendations(token) {
  return call('/student/teacher-recommendations', { headers: auth(token) }, 'studyContext')
    .then((d) => (Array.isArray(d.recommendations) ? d.recommendations : []));
}

export function leaveClassGroup(token, classroomId) {
  return call(`/student/classrooms/${encodeURIComponent(classroomId)}/leave`, {
    method: 'POST',
    headers: auth(token),
  }, 'classroomLeave');
}

/**
 * Publique : ce qu'un lien de classe révèle avant tout compte (nom du قسم,
 * classe scolaire, enseignant, adhésions ouvertes). Avec le jeton d'un élève
 * connecté, dit aussi s'il est déjà membre (`alreadyMember`).
 */
export function previewJoinLink(linkToken, authToken = null) {
  return call(`/join-links/${encodeURIComponent(linkToken)}`, authToken ? { headers: auth(authToken) } : {}, 'joinLinkLoad')
    .then((d) => d.joinLink);
}
