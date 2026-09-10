import { call, get, send, query } from './adminClient';

export function fetchStudents(token, filters = {}) {
  return call(`/admin/students${query(filters)}`, get(token), 'Impossible de charger les élèves.');
}

export function fetchStudent(token, id) {
  return call(`/admin/students/${encodeURIComponent(id)}`, get(token), 'Impossible de charger l’élève.')
    .then((data) => data.student);
}

/** @param {'active'|'suspended'|'disabled'} status */
export function changeStudentStatus(token, id, status) {
  return call(
    `/admin/students/${encodeURIComponent(id)}/status`,
    send('PATCH', token, { status }),
    'Impossible de changer le statut du compte.',
  ).then((data) => data.student);
}
