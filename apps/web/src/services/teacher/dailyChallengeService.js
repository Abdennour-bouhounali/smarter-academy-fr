import { call, get, send, query } from './teacherClient';

/** « التحدّي اليومي » d'un قسم : réglages, résultats d'un jour, affichage. */
const base = (id) => `/teacher/classrooms/${encodeURIComponent(id)}/daily-challenge`;

export function fetchClassChallengeSettings(token, classroomId) {
  return call(`${base(classroomId)}/settings`, get(token), 'dailyChallenge');
}

export function updateClassChallengeSettings(token, classroomId, body) {
  return call(`${base(classroomId)}/settings`, send('PATCH', token, body), 'dailyChallenge');
}

export function fetchClassChallengeResults(token, classroomId, date) {
  return call(`${base(classroomId)}/results${query({ date })}`, get(token), 'dailyChallenge');
}

export function fetchClassChallengeDisplay(token, classroomId, date) {
  return call(`${base(classroomId)}/display${query({ date })}`, get(token), 'dailyChallenge');
}
