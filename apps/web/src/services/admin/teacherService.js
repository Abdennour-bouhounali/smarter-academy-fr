import { call, get, send, query } from './adminClient';

export function fetchTeachers(token, filters = {}) {
  return call(`/admin/teachers${query(filters)}`, get(token), 'Impossible de charger les enseignants.');
}

export function fetchTeacher(token, id) {
  return call(`/admin/teachers/${encodeURIComponent(id)}`, get(token), 'Impossible de charger l’enseignant.');
}

/** @param {'active'|'suspended'|'disabled'} status */
export function changeTeacherStatus(token, id, status) {
  return call(`/admin/teachers/${encodeURIComponent(id)}/status`, send('PATCH', token, { status }), 'Impossible de changer le statut du compte.')
    .then((data) => data.teacher);
}

export function grantTeacherOverride(token, id, { key, value, reason, endsAt }) {
  return call(`/admin/teachers/${encodeURIComponent(id)}/entitlements/overrides`, send('POST', token, { key, value, reason, endsAt }), 'Impossible d’accorder la dérogation.');
}

export function revokeTeacherOverride(token, id, overrideId, reason) {
  return call(`/admin/teachers/${encodeURIComponent(id)}/entitlements/overrides/${encodeURIComponent(overrideId)}`, send('DELETE', token, { reason }), 'Impossible de retirer la dérogation.');
}

/** Désigner (`true`) ou retirer (`false`) un ambassadeur (« سفير »). */
export function setTeacherAmbassador(token, id, ambassador) {
  return call(`/admin/teachers/${encodeURIComponent(id)}/ambassador`, send('PATCH', token, { ambassador: Boolean(ambassador) }), 'Impossible de changer le statut d’ambassadeur.')
    .then((data) => data.teacher);
}
