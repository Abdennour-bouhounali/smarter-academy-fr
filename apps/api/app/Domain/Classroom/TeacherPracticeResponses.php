<?php

namespace App\Domain\Classroom;

use App\Domain\Practice\Support\AnswerEvaluator;
use App\Models\AnswerImage;
use App\Models\AnswerReview;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Les RÉPONSES des élèves d'un enseignant à un exercice de pratique — ce que
 * le « بنك التمارين » de l'enseignant affiche sous chaque exercice.
 *
 * Périmètre : les membres ACTIFS des classes NON archivées de CET enseignant,
 * et eux seuls (même règle que ClassroomAccess::activeStudent, étendue à
 * toutes ses classes). Identité = ClassroomAccess::identity — jamais l'email.
 * Lecture seule : rien n'est écrit.
 */
class TeacherPracticeResponses
{
    /**
     * Élève → ses classes chez cet enseignant.
     *
     * @return Collection<int, array<int, array{id: int, name: string}>>
     */
    public function rosterOf(User $teacher): Collection
    {
        $classrooms = Classroom::ownedBy($teacher)->countingTowardsLimit()->get(['id', 'name'])->keyBy('id');
        if ($classrooms->isEmpty()) {
            return collect();
        }

        return ClassroomMembership::active()
            ->whereIn('classroom_id', $classrooms->keys())
            ->get(['classroom_id', 'student_id'])
            ->groupBy('student_id')
            ->map(fn ($rows) => $rows->map(fn ($m) => [
                'id' => (int) $m->classroom_id,
                'name' => (string) $classrooms[$m->classroom_id]->name,
            ])->values()->all());
    }

    /** Les tentatives soumises de ces élèves sur cet exercice de cette leçon. */
    private function attempts(string $lessonCode, string $exerciseId, array $studentIds)
    {
        return DB::table('question_attempts as qa')
            ->join('exercise_attempts as ea', 'ea.id', '=', 'qa.exercise_attempt_id')
            ->join('practice_sessions as ps', 'ps.id', '=', 'ea.practice_session_id')
            ->join('lessons as l', 'l.id', '=', 'ps.lesson_id')
            ->where('l.code', $lessonCode)
            ->where('ea.exercise_id', $exerciseId)
            ->whereIn('qa.user_id', $studentIds)
            ->whereNotNull('qa.submitted_at');
    }

    /**
     * Les élèves qui ont fait cet exercice, avec un résumé : questions
     * répondues, réussies, dernière activité.
     *
     * @return array{total: int, students: array<int, array<string, mixed>>}
     */
    public function exerciseStudents(User $teacher, string $lessonCode, string $exerciseId): array
    {
        $roster = $this->rosterOf($teacher);
        if ($roster->isEmpty()) {
            return ['total' => 0, 'students' => []];
        }

        $rows = $this->attempts($lessonCode, $exerciseId, $roster->keys()->all())
            ->select('qa.user_id', 'qa.question_id', 'qa.outcome', 'qa.submitted_at', 'qa.attempt_number')
            ->get()
            ->groupBy('user_id');

        $users = User::whereIn('id', $rows->keys())->get(explode(',', ClassroomAccess::IDENTITY_COLUMNS))->keyBy('id');

        $students = $rows->map(function ($attempts, $userId) use ($users, $roster) {
            // La DERNIÈRE réponse de chaque question fait foi pour le résumé.
            $latest = $attempts->sortBy('attempt_number')->groupBy('question_id')->map->last();

            return ClassroomAccess::identity($users[$userId] ?? null, (int) $userId) + [
                'classrooms' => $roster[$userId] ?? [],
                'questionsAnswered' => $latest->count(),
                'questionsCorrect' => $latest->filter(fn ($a) => $a->outcome && AnswerEvaluator::isSuccessOutcome($a->outcome))->count(),
                'lastAnsweredAt' => (string) $attempts->max('submitted_at'),
            ];
        })->sortByDesc('lastAnsweredAt')->values()->all();

        return ['total' => count($students), 'students' => $students];
    }

    /**
     * Les réponses d'UN élève à cet exercice, question par question, chaque
     * tentative dans l'ordre.
     *
     * @throws DomainException si l'élève n'est pas un membre actif d'une classe de l'enseignant
     */
    public function studentResponses(User $teacher, string $lessonCode, string $exerciseId, int $studentId): array
    {
        $roster = $this->rosterOf($teacher);
        if (! $roster->has($studentId)) {
            throw new DomainException('Élève introuvable dans vos classes.');
        }

        $attempts = $this->attempts($lessonCode, $exerciseId, [$studentId])
            ->orderBy('qa.question_id')->orderBy('qa.attempt_number')->orderBy('qa.submitted_at')
            ->get(['qa.id', 'qa.question_id', 'qa.attempt_number', 'qa.submitted_answer', 'qa.normalized_answer', 'qa.outcome', 'qa.evaluated_by', 'qa.hints_used', 'qa.submitted_at']);
        // Photos de copie et correction (« تصحيح الأستاذ ») de chaque tentative.
        $images = AnswerImage::whereIn('question_attempt_id', $attempts->pluck('id'))->orderBy('id')->get()
            ->reject->isExpired()->groupBy('question_attempt_id');
        $reviews = AnswerReview::whereIn('question_attempt_id', $attempts->pluck('id'))->get()->keyBy('question_attempt_id');

        $student = User::find($studentId, explode(',', ClassroomAccess::IDENTITY_COLUMNS));

        return [
            'student' => ClassroomAccess::identity($student, $studentId) + ['classrooms' => $roster[$studentId]],
            'questions' => $attempts->groupBy('question_id')->map(fn ($rows, $questionId) => [
                'questionId' => (string) $questionId,
                'attempts' => $rows->map(fn ($a) => [
                    'attemptNumber' => (int) $a->attempt_number,
                    'answer' => is_string($a->submitted_answer) ? json_decode($a->submitted_answer, true) : $a->submitted_answer,
                    'normalized' => $a->normalized_answer,
                    'outcome' => $a->outcome,
                    'evaluatedBy' => $a->evaluated_by,
                    'hintsUsed' => (int) $a->hints_used,
                    'submittedAt' => (string) $a->submitted_at,
                    'images' => ($images[$a->id] ?? collect())->map->toClient()->values()->all(),
                    'review' => isset($reviews[$a->id]) ? $reviews[$a->id]->toClient() : null,
                ])->values()->all(),
            ])->values()->all(),
        ];
    }
}
