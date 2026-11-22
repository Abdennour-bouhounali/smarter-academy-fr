import { call, get, send } from './teacher/teacherClient';

/**
 * Transport de « Espace parent » (docs/architecture/PARENT_SPACE.md). Même
 * convention que les services enseignant : jeton en premier argument, erreur
 * du catalogue (`common.apiErrors.family`, services/apiMessage.js) et motif clos `reason` sur l'erreur
 * (`invalid_code`, `expired_code`, `already_linked`…), traduit par la page
 * sous `family:errors.*`.
 */
const KEY = 'family';

// Côté PARENT.
export const fetchChildren = (token) => call('/parent/children', get(token), KEY);
export const linkChild = (token, code) => call('/parent/children/link', send('POST', token, { code }), KEY);
export const fetchChildReport = (token, studentId, week = 0) =>
  call(`/parent/children/${encodeURIComponent(studentId)}/report?week=${week}`, get(token), KEY);
export const updateChild = (token, studentId, weeklyEmail) =>
  call(`/parent/children/${encodeURIComponent(studentId)}`, send('PATCH', token, { weeklyEmail }), KEY);
export const unlinkChild = (token, studentId) => call(`/parent/children/${encodeURIComponent(studentId)}`, send('DELETE', token), KEY);

export const fetchMyReport = (token, week = 0) => call(`/student/parents/report?week=${week}`, get(token), KEY);

// « La progression en détail » — la même forme pour le parent et pour l'élève.
export const fetchChildProgress = (token, studentId) =>
  call(`/parent/children/${encodeURIComponent(studentId)}/progress`, get(token), KEY);
export const fetchMyProgress = (token) => call('/student/parents/progress', get(token), KEY);

// « lien parent » — côté ÉLÈVE : le lien sans compte (PARENT_SPACE.md §2).
export const fetchMyParentLink = (token) => call('/student/parent-link', get(token), KEY);
export const createParentLink = (token) => call('/student/parent-link', send('POST', token, { consent: true }), KEY);
export const revokeParentLink = (token) => call('/student/parent-link', send('DELETE', token), KEY);

// « lien parent » — côté PARENT, SANS compte : le jeton du lien est la porte ;
// `pass` est le laissez-passer rendu par le code à 4 chiffres, s'il en a un.
const withPass = (pass) => ({ headers: { Accept: 'application/json', ...(pass ? { 'X-Parent-Pass': pass } : {}) } });
const linkPath = (linkToken) => `/parent-link/${encodeURIComponent(linkToken)}`;
export const openParentLink = (linkToken, pass) => call(linkPath(linkToken), withPass(pass), KEY);
export const fetchLinkReport = (linkToken, pass, week = 0) => call(`${linkPath(linkToken)}/report?week=${week}`, withPass(pass), KEY);
export const fetchLinkProgress = (linkToken, pass) => call(`${linkPath(linkToken)}/progress`, withPass(pass), KEY);
const postPin = (linkToken, action, pin) => call(`${linkPath(linkToken)}/${action}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ pin }),
}, KEY);
export const setLinkPin = (linkToken, pin) => postPin(linkToken, 'pin', pin);
export const unlockLink = (linkToken, pin) => postPin(linkToken, 'unlock', pin);
