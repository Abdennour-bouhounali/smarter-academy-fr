import { call, get, send, query } from './teacherClient';

/**
 * « حصّة القسم » — the teacher's class session (docs/architecture/CLASS_SESSION.md): the seating map of a class, the test
 * of a lesson (the default kept by the server + the teacher's own copy), the finished sessions.
 * A session that could not be sent (the school's connection dropped) waits in an outbox and is sent at the next visit:
 * the server ignores a session it already has (same uuid).
 */
const cls = (id) => `/teacher/classrooms/${encodeURIComponent(id)}`;
const test = (lessonCode) => `/teacher/class-tests/${encodeURIComponent(lessonCode)}`;

export const fetchSeating = (token, classId) => call(`${cls(classId)}/seating`, get(token), 'classroomLoad').then((d) => d.seating);
export const saveSeating = (token, classId, layout) => call(`${cls(classId)}/seating`, send('PUT', token, layout), 'classroomSave').then((d) => d.seating);
export const fetchClassTest = (token, lessonCode) => call(test(lessonCode), get(token), 'classroomLoad');
export const saveClassTest = (token, lessonCode, { start, end }) => call(test(lessonCode), send('PUT', token, { start, end }), 'classroomSave');
export const resetClassTest = (token, lessonCode) => call(test(lessonCode), send('DELETE', token), 'classroomSave');
export const fetchClassSessions = (token, classId, lessonCode = null) => call(`${cls(classId)}/class-sessions${query({ lessonCode })}`, get(token), 'classroomLoad');
/** « متابعة القسم »: each active student of the class on ONE lesson — his state per الكفاءة, his exercises. Read-only. */
export const fetchLessonTracking = (token, classId, lessonCode) => call(`${cls(classId)}/lesson-tracking/${encodeURIComponent(lessonCode)}`, get(token), 'progressLoadClass');
/** « ملفّ الدرس »: the lesson → the teacher's whiteboard document of the Math Lab (`documentId`, null until first opened). */
export const fetchLessonFile = (token, lessonCode) => call(`/teacher/lesson-files/${encodeURIComponent(lessonCode)}`, get(token), 'classroomLoad').then((d) => d.file);
export const saveLessonFile = (token, lessonCode, body) => call(`/teacher/lesson-files/${encodeURIComponent(lessonCode)}`, send('PUT', token, body), 'classroomSave').then((d) => d.file);
const storeClassSession = (token, classId, record) => call(`${cls(classId)}/class-sessions`, send('POST', token, record), 'classroomSave').then((d) => d.session);

const OUTBOX = 'smarter_class_session_outbox';
const readOutbox = () => { try { return JSON.parse(localStorage.getItem(OUTBOX) ?? '[]'); } catch { return []; } };
const writeOutbox = (list) => { try { localStorage.setItem(OUTBOX, JSON.stringify(list.slice(-20))); } catch { /* storage closed: the session stays on screen */ } };

/** Sends a finished session; when the network fails it is kept and `{ queued: true }` comes back — never an error on the board. */
export async function sendSession(token, classId, record) {
  try { return { session: await storeClassSession(token, classId, record), queued: false }; } catch (error) {
    if (error?.status && error.status < 500 && error.status !== 0 && error.status !== 408) throw error; // refused by the server: not a network matter
    writeOutbox([...readOutbox().filter((x) => x.record.uuid !== record.uuid), { classId, record }]);
    return { session: null, queued: true };
  }
}

/** Sends what waited. Returns how many sessions are still waiting. */
export async function flushOutbox(token) {
  let left = readOutbox();
  for (const entry of [...left]) {
    try { await storeClassSession(token, entry.classId, entry.record); left = left.filter((x) => x !== entry); } catch (error) { if (error?.status && error.status >= 400 && error.status < 500 && error.status !== 408) left = left.filter((x) => x !== entry); else break; }
  }
  writeOutbox(left);
  return left.length;
}
