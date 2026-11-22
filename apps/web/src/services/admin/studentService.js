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

/**
 * Un compte élève créé par l'administrateur. Les noms sont ARABES (le serveur valide, PersonName) ; sans `email`, le
 * serveur fabrique un identifiant (`login`). Le `password` n'existe QUE dans cette réponse : il se montre une fois.
 *
 * @param {{ firstName: string, lastName: string, email?: string, grade?: string }} body
 * @returns {Promise<{ student: object, login: string, password: string }>}
 */
export function createStudent(token, body) {
  return call('/admin/students', send('POST', token, body), 'Impossible de créer le compte.');
}
