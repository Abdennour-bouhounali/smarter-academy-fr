/**
 * The door of the TEACHER's practice (`/enseignant/pratique/:lessonCode[/:level/:exerciseId]`).
 *
 * A lesson that has its board or its game world (features/classSession/boardLessons.js › hasTeacherBank) has the teacher's own bank — read, show on the board,
 * print a sheet (TeacherExerciseBank) — and an exercise is shown on the board of « Séance en classe », not in the old player.
 * Every other lesson keeps the hub and the player it had. One place decides, so the routes do not have to.
 */
import { lazy, Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { hasTeacherBank } from '../../../features/classSession/boardLessons';
import { exerciseBoardPath } from '../../../features/classSession/exerciseBank';

const PracticeHub = lazy(() => import('../../student/practice/PracticeHub'));
const TeacherPracticePlayer = lazy(() => import('./TeacherPracticePlayer'));
const TeacherExerciseBank = lazy(() => import('./TeacherExerciseBank'));

export default function TeacherBankGate({ player = false }) {
  const { lessonCode, level, exerciseId } = useParams();
  if (hasTeacherBank(lessonCode))
    return player ? (
      <Navigate to={exerciseBoardPath(lessonCode, level, exerciseId)} replace />
    ) : (
      <Suspense fallback={null}>
        <TeacherExerciseBank lessonCode={lessonCode} />
      </Suspense>
    );
  return <Suspense fallback={null}>{player ? <TeacherPracticePlayer /> : <PracticeHub />}</Suspense>;
}
