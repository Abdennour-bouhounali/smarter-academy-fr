import { call, get, query, send } from './teacherClient';

/**
 * Les classes (« Les classes ») d'un enseignant. Aucun identifiant d'enseignant
 * ne part jamais : le serveur résout tout depuis le jeton, et refuse en 403
 * la classe d'un autre.
 */
export function fetchTeacherDashboard(token) {
  return call('/teacher/dashboard', get(token), 'classroomLoad').then((d) => d.dashboard);
}

export function fetchTeacherEntitlements(token) {
  return call('/teacher/entitlements', get(token), 'classroomLoad').then((d) => d.entitlements);
}

export function fetchClassGroups(token) {
  return call('/teacher/classrooms', get(token), 'classroomLoad');
}

export function createClassGroup(token, { name, grade, description, academicYear }) {
  return call('/teacher/classrooms', send('POST', token, { name, grade, description, academicYear }), 'classroomSave');
}

export function fetchClassGroup(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}`, get(token), 'classroomLoad').then((d) => d.classroom);
}

export function updateClassGroup(token, id, patch) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}`, send('PATCH', token, patch), 'classroomSave').then((d) => d.classroom);
}

export function archiveClassGroup(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/archive`, send('POST', token), 'classroomSave');
}

export function restoreClassGroup(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/restore`, send('POST', token), 'classroomSave');
}

export function rotateJoinCode(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/join-code/rotate`, send('POST', token), 'classroomSave').then((d) => d.classroom);
}

/** Un nouveau lien de classe : l'ancien n'ouvre plus rien, les membres restent. */
export function rotateJoinLink(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/join-link/rotate`, send('POST', token), 'classroomSave').then((d) => d.classroom);
}

export function fetchClassStudents(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students`, get(token), 'progressLoadClass').then((d) => d.students);
}

export function fetchClassStudentProgress(token, id, studentId) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}/progress`, get(token), 'progressLoadClass');
}

/**
 * Le CAHIER d'un élève de la classe — en lecture seule, borné aux leçons du
 * classe par le serveur. Aucune fonction d'écriture ne l'accompagne : il n'y a
 * pas de route pour cela (TeacherClassroomNotebookController).
 */
export function fetchClassStudentNotebook(token, id, studentId, params = null) {
  const suffix = params ? query(params) : '';

  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}/notebook${suffix}`, get(token), 'notebookLoad');
}

/** Les réglages d'UN élève, décidés par l'enseignant (niveaux ouverts…), 2026-10-06. */
export function fetchClassStudentSettings(token, id, studentId) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}/settings`, get(token), 'classroomSave').then((d) => d.settings);
}

/** @param {{practiceLevelsOpen?: boolean}} patch */
export function updateClassStudentSettings(token, id, studentId, patch) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}/settings`, send('PATCH', token, patch), 'classroomSave').then((d) => d.settings);
}

export function removeClassStudent(token, id, studentId) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}`, send('DELETE', token), 'classroomSave');
}

export function fetchClassLessons(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/lessons`, get(token), 'classroomLoad').then((d) => d.curriculum);
}

/** @param {'visible'|'hidden'} status */
export function setClassLessonStatus(token, id, lessonId, status) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/lessons/${encodeURIComponent(lessonId)}`, send('PATCH', token, { status }), 'lessonVisibility');
}

/** Le lot : `{ applied, unchanged, failed }` — trois issues, jamais un simple « succès ». */
export function bulkSetClassLessonStatus(token, id, lessonIds, status) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/lessons/bulk`, send('POST', token, { lessonIds, status }), 'lessonVisibility');
}

/**
 * La MAÎTRISE par point d'apprentissage (Mastery V2) — trois lectures, du
 * plus large au plus fin : la classe × les points d'une leçon, un point ×
 * les élèves (déjà triés du plus faible au plus fort), puis l'EXPLICATION
 * d'un statut pour un élève. Rien n'est recalculé côté client.
 */
export function fetchClassLearningPoints(token, id, lessonCode) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/learning-points${query({ lesson: lessonCode })}`, get(token), 'progressLoadClass');
}

/** La CARTE d'apprentissage : tous les points du périmètre de la classe, groupés par leçon. */
export function fetchClassLearningMap(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/learning-points`, get(token), 'progressLoadClass');
}

export function fetchClassLearningPoint(token, id, code) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/learning-points/${encodeURIComponent(code)}`, get(token), 'progressLoadClass');
}

/**
 * La PREUVE d'un point pour un élève : l'explication du moteur, l'histoire
 * de son état, ses notes de cahier sur ce point, et les interventions qui
 * l'ont visé sur ce point.
 */
export function fetchStudentLearningPointEvidence(token, id, studentId, code) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/${encodeURIComponent(studentId)}/learning-points/${encodeURIComponent(code)}/explanation`, get(token), 'progressLoadClass');
}

/**
 * DÉTECTER — « À regarder » et « Ce qui a changé ». Les signaux sont
 * calculés par le serveur à chaque lecture ; l'écran les FORMATE, il ne les
 * recalcule pas.
 */
export function fetchClassAttention(token, id) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/attention`, get(token), 'progressLoadClass');
}

/** INTERVENIR puis MESURER — les gestes de l'enseignant et ce qui a suivi. */
export function fetchClassInterventions(token, id, params = {}) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/interventions${query(params)}`, get(token), 'progressLoadClass');
}

export function fetchClassIntervention(token, id, interventionId) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/interventions/${encodeURIComponent(interventionId)}`, get(token), 'progressLoadClass').then((d) => d.intervention);
}

/**
 * @param {{kind: string, studentIds: number[], learningPointCode?: string, lessonCode?: string,
 *   note?: string, studentMessage?: string, reviewAfter?: string, sourceSignal?: string}} payload
 */
export function createClassIntervention(token, id, payload) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/interventions`, send('POST', token, payload), 'classroomSave').then((d) => d.intervention);
}

/** @param {{status?: 'open'|'closed', note?: string|null, reviewAfter?: string|null}} patch */
export function updateClassIntervention(token, id, interventionId, patch) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/interventions/${encodeURIComponent(interventionId)}`, send('PATCH', token, patch), 'classroomSave').then((d) => d.intervention);
}

/**
 * « Cartes de connexion » : un NOUVEAU mot de passe pour chaque élève choisi, rendu
 * une seule fois avec son courriel — à imprimer, jamais à garder.
 */
export function issueStudentCredentials(token, id, studentIds) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/credentials`, send('POST', token, { studentIds }), 'classroomSave').then((d) => d.credentials);
}

/**
 * « Cartes des parents » : le « lien parent » de chaque élève choisi, pour l'imprimer
 * en QR (PARENT_SPACE.md §2bis). Le lien existant est réutilisé.
 */
export function issueParentCards(token, id, studentIds) {
  return call(`/teacher/classrooms/${encodeURIComponent(id)}/students/parent-cards`, send('POST', token, { studentIds }), 'classroomSave').then((d) => d.cards);
}
