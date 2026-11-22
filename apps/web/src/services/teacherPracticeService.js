import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Les réponses des élèves de l'enseignant à un exercice de pratique —
 * lecture seule (API : TeacherPracticeResponseController). Le jeton est le
 * premier argument, comme partout ailleurs dans les services.
 */
async function get(token, path) {
  const { ok, status, data } = await apiRequest(path, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  if (!ok) throw new ApiError(apiMessage('generic', data, status), classifyStatus(status), status);
  return data;
}

const base = (lessonCode, exerciseId) => `/teacher/practice/${encodeURIComponent(lessonCode)}/exercises/${encodeURIComponent(exerciseId)}/students`;

/** @returns {Promise<{total: number, students: Array<{id, firstName, lastName, classrooms, questionsAnswered, questionsCorrect, lastAnsweredAt}>}>} */
export function fetchExerciseStudents(token, lessonCode, exerciseId) {
  return get(token, base(lessonCode, exerciseId));
}

/** @returns {Promise<{student, questions: Array<{questionId, attempts: Array<{attemptNumber, answer, normalized, outcome, hintsUsed, submittedAt}>}>}>} */
export function fetchStudentResponses(token, lessonCode, exerciseId, studentId) {
  return get(token, `${base(lessonCode, exerciseId)}/${encodeURIComponent(studentId)}`);
}
