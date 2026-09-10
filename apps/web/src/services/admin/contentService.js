import { call, get, send, query } from './adminClient';

export function fetchLessons(token, filters = {}) {
  return call(`/admin/content/lessons${query(filters)}`, get(token), 'Impossible de charger les leçons.')
    .then((data) => data.lessons);
}

export function fetchLesson(token, code) {
  return call(
    `/admin/content/lessons/${encodeURIComponent(code)}`,
    get(token),
    'Impossible de charger la leçon.',
  ).then((data) => data.lesson);
}

/** Tous les modules, toutes leçons confondues. */
export function fetchModules(token, filters = {}) {
  return call(`/admin/content/modules${query(filters)}`, get(token), 'Impossible de charger les modules.')
    .then((data) => data.modules);
}

/** Tous les exercices, toutes leçons confondues. */
export function fetchExercises(token, filters = {}) {
  return call(`/admin/content/exercises${query(filters)}`, get(token), 'Impossible de charger les exercices.')
    .then((data) => data.exercises);
}

/**
 * Publier / masquer / archiver.
 * @param {'lesson'|'module'|'exercise'} type
 */
export function changeContentStatus(token, type, id, status) {
  return call(
    `/admin/content/${encodeURIComponent(type)}/${encodeURIComponent(id)}/status`,
    send('PATCH', token, { status }),
    'Impossible de changer l’état de publication.',
  );
}
