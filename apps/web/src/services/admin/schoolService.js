import { call, get, query, send } from './adminClient';

/** « المؤسسات » — les établissements et leur directeur (SCHOOL_ADMIN_SPACE.md §5). */
export function fetchSchools(token, filters = {}) {
  return call(`/admin/schools${query(filters)}`, get(token), 'Impossible de charger les établissements.');
}

export function fetchSchool(token, id) {
  return call(`/admin/schools/${encodeURIComponent(id)}`, get(token), 'Impossible de charger l\'établissement.');
}

export function createSchool(token, body) {
  return call('/admin/schools', send('POST', token, body), 'Impossible de créer l\'établissement.');
}

export function setSchoolStatus(token, id, status) {
  return call(`/admin/schools/${encodeURIComponent(id)}/status`, send('PATCH', token, { status }), 'Impossible de changer le statut.');
}

/** Rend `{director, password}` — le mot de passe n'est lisible qu'ICI, une fois. */
export function appointDirector(token, id, person) {
  return call(`/admin/schools/${encodeURIComponent(id)}/director`, send('POST', token, person), 'Impossible de nommer le directeur.');
}

/** La licence d'établissement (D1) : sièges, fin éventuelle, note — une nouvelle annule la précédente. */
export function grantLicence(token, id, body) {
  return call(`/admin/schools/${encodeURIComponent(id)}/licence`, send('POST', token, body), 'Impossible d\'activer la licence.');
}

export function setLicenceStatus(token, id, status) {
  return call(`/admin/schools/${encodeURIComponent(id)}/licence/status`, send('PATCH', token, { status }), 'Impossible de changer la licence.');
}

export function revokeDirector(token, id) {
  return call(`/admin/schools/${encodeURIComponent(id)}/director`, send('DELETE', token), 'Impossible de retirer le directeur.');
}
