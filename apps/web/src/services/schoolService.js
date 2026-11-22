import { call, get, send } from './teacher/teacherClient';

/**
 * Transport de « فضاء الإدارة » (docs/architecture/SCHOOL_ADMIN_SPACE.md). Même
 * convention que les services enseignant et famille : jeton en premier
 * argument, erreur arabe (`common.apiErrors.idara`) et motif clos `reason`
 * (`no_school`), traduit par la page sous `idara:errors.*`.
 */
const KEY = 'idara';

export const fetchSchoolOverview = (token) => call('/school/overview', get(token), KEY);

// Côté DIRECTEUR — la structure (phase 3).
export const fetchTerms = (token) => call('/school/terms', get(token), KEY);
export const saveTerms = (token, academicYear, terms) => call('/school/terms', send('PUT', token, { academicYear, terms }), KEY);
export const fetchSchoolTeachers = (token) => call('/school/teachers', get(token), KEY);
export const rotateTeacherLink = (token) => call('/school/teachers/join-link/rotate', send('POST', token), KEY);
export const detachTeacher = (token, teacherId) => call(`/school/teachers/${encodeURIComponent(teacherId)}`, send('DELETE', token), KEY);
export const fetchSchoolClassrooms = (token) => call('/school/classrooms', get(token), KEY);
export const createSchoolClassroom = (token, body) => call('/school/classrooms', send('POST', token, body), KEY);
export const reassignClassroom = (token, id, teacherId) => call(`/school/classrooms/${encodeURIComponent(id)}/teacher`, send('PATCH', token, { teacherId }), KEY);
export const fetchSchoolStudents = (token, classroomId) =>
  call(`/school/students${classroomId ? `?classroom=${encodeURIComponent(classroomId)}` : ''}`, get(token), KEY);
export const previewRoster = (token, classroomId, rows) => call('/school/roster/preview', send('POST', token, { classroomId, rows }), KEY);
export const commitRoster = (token, classroomId, rows) => call('/school/roster', send('POST', token, { classroomId, rows }), KEY);
export const transferStudent = (token, studentId, classroomId) =>
  call(`/school/students/${encodeURIComponent(studentId)}/classroom`, send('PATCH', token, { classroomId }), KEY);
export const reissueCards = (token, studentIds) => call('/school/students/credentials', send('POST', token, { studentIds }), KEY);

// Côté DIRECTEUR — le suivi (phase 4).
export const fetchLearningMap = (token, grade) =>
  call(`/school/learning-map${grade ? `?grade=${encodeURIComponent(grade)}` : ''}`, get(token), KEY);
export const fetchStudentFile = (token, studentId) => call(`/school/students/${encodeURIComponent(studentId)}/progress`, get(token), KEY);

// Côté DIRECTEUR — les rapports figés (phase 5).
export const fetchReports = (token) => call('/school/reports', get(token), KEY);
export const generateReport = (token, body) => call('/school/reports', send('POST', token, body), KEY);
export const fetchReport = (token, id) => call(`/school/reports/${encodeURIComponent(id)}`, get(token), KEY);
export const deleteReport = (token, id) => call(`/school/reports/${encodeURIComponent(id)}`, send('DELETE', token), KEY);

// Côté ENSEIGNANT — « مؤسستي » (même transport, même catalogue d'erreurs).
export const fetchMySchool = (token) => call('/teacher/school', get(token), KEY);
export const previewSchoolLink = (token, linkToken) => call(`/teacher/school-links/${encodeURIComponent(linkToken)}`, get(token), KEY);
export const joinSchool = (token, linkToken) => call('/teacher/school/join', send('POST', token, { token: linkToken, consent: true }), KEY);
export const leaveSchool = (token) => call('/teacher/school/leave', send('POST', token), KEY);
export const setClassroomAttached = (token, classroomId, attached) =>
  call(`/teacher/classrooms/${encodeURIComponent(classroomId)}/school`, send('PUT', token, { attached }), KEY);
