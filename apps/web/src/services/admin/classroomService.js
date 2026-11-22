import { call, get, query } from './adminClient';

export function fetchClassrooms(token, filters = {}) {
  return call(`/admin/classrooms${query(filters)}`, get(token), 'Impossible de charger les classes.');
}

export function fetchClassroom(token, id) {
  return call(`/admin/classrooms/${encodeURIComponent(id)}`, get(token), 'Impossible de charger la classe.');
}
