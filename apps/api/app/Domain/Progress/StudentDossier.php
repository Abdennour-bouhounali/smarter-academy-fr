<?php

namespace App\Domain\Progress;

use App\Domain\Progress\Support\OutcomeStats;
use App\Models\ExerciseAttempt;
use App\Models\LearningEvidence;
use App\Models\QuestionAttempt;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Le DOSSIER d'apprentissage d'un élève — dérivé, jamais stocké en double.
 *
 * Extrait d'App\Domain\Admin\StudentService pour que l'administration ET
 * l'enseignant lisent la même chose : une seule façon de calculer « leçons
 * terminées », « taux de réussite », « maîtrise ». Le cahier (كرّاسي) n'est
 * PAS ici : c'est l'écriture de l'élève ; l'enseignant la lit par sa propre
 * porte, bornée (NOTEBOOK.md), jamais mélangée à ce dossier.
 *
 * `$lessonIds` restreint le dossier à un périmètre — les leçons effectives
 * d'une classe, pour l'enseignant. Nul = tout.
 */
class StudentDossier
{
    /**
     * @param  int[]|null  $lessonIds
     * @return array<string, mixed>
     */
    public static function profile(User $student, ?array $lessonIds = null): array
    {
        $progress = StudentLessonProgress::with('lesson:id,code,title')
            ->where('user_id', $student->id)
            ->when($lessonIds !== null, fn ($q) => $q->whereIn('lesson_id', $lessonIds))
            ->orderByDesc('last_activity_at')
            ->get();

        $mastery = StudentLearningPointProgress::with('learningPoint:id,code,title,lesson_id', 'learningPoint.lesson:id,code,title')
            ->where('user_id', $student->id)
            ->when($lessonIds !== null, fn ($q) => $q->whereHas('learningPoint', fn ($lp) => $lp->whereIn('lesson_id', $lessonIds)))
            ->get();

        // question_attempts → exercise_attempts → practice_sessions : la
        // leçon d'une réponse se lit deux tables plus haut. Les agrégats
        // d'issue viennent d'OutcomeStats — LA définition du taux de
        // réussite, la même que la classe, l'administration et le bilan.
        $questionStats = OutcomeStats::selectInto(
            QuestionAttempt::where('question_attempts.user_id', $student->id)
                ->when($lessonIds !== null, fn ($q) => $q
                    ->join('exercise_attempts', 'exercise_attempts.id', '=', 'question_attempts.exercise_attempt_id')
                    ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
                    ->whereIn('practice_sessions.lesson_id', $lessonIds))
        )
            ->selectRaw('SUM(question_attempts.hints_used) as hints')
            ->first();

        $stats = OutcomeStats::fromRow($questionStats);
        $answered = $stats['answered'];
        $correct = $stats['successes'];

        return [
            'progress' => $progress,
            'lessonsStarted' => $progress->count(),
            'lessonsCompleted' => $progress->where('status', StudentLessonProgress::STATUS_COMPLETED)->count(),
            'modulesCompleted' => $progress->sum(fn ($row) => count($row->completed_modules ?? [])),
            // Une jointure depuis les séances DE L'ÉLÈVE (index user_id,
            // lesson_id), et non un EXISTS sur toute la table des tentatives.
            'exerciseAttempts' => ExerciseAttempt::query()
                ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
                ->where('practice_sessions.user_id', $student->id)
                ->when($lessonIds !== null, fn ($q) => $q->whereIn('practice_sessions.lesson_id', $lessonIds))
                ->count(),
            'questionsAnswered' => $answered,
            'correctAnswers' => $correct,
            'partialAnswers' => $stats['partials'],
            'incorrectAnswers' => $stats['failures'],
            'inertAnswers' => $stats['inert'],
            // null, et non 0, quand rien n'a été répondu : « aucune donnée »
            // et « 0 % de réussite » ne disent pas la même chose.
            'successRate' => $stats['successRate'],
            'hintsUsed' => (int) ($questionStats->hints ?? 0),
            'mastery' => $mastery,
            'masteryCounts' => $mastery->groupBy('status')->map->count(),
            'evidenceCount' => LearningEvidence::where('user_id', $student->id)
                ->when($lessonIds !== null, fn ($q) => $q->whereIn('lesson_id', $lessonIds))
                ->count(),
        ];
    }

    /**
     * Les événements d'apprentissage, dans l'ordre — assemblés à partir de ce
     * qui est déjà enregistré.
     *
     * @param  int[]|null  $lessonIds
     * @return array<int, array<string, mixed>>
     */
    public static function timeline(User $student, int $limit = 50, ?array $lessonIds = null): array
    {
        $events = [];

        // Chaque source est BORNÉE en SQL à `$limit` lignes, les plus récentes :
        // la fusion des trois ne peut pas en garder davantage.
        $rows = StudentLessonProgress::with('lesson:id,code,title')
            ->where('user_id', $student->id)
            ->when($lessonIds !== null, fn ($q) => $q->whereIn('lesson_id', $lessonIds))
            ->orderByRaw('COALESCE(completed_at, last_activity_at) DESC')
            ->limit($limit)
            ->get();
        foreach ($rows as $row) {
            $events[] = [
                'type' => $row->status === StudentLessonProgress::STATUS_COMPLETED ? 'lesson_completed' : 'lesson_progress',
                'at' => $row->completed_at ?? $row->last_activity_at,
                'lesson' => $row->lesson?->title,
                'lessonCode' => $row->lesson?->code,
                'detail' => count($row->completed_modules ?? []).' module(s) terminé(s)',
                'modulesCompleted' => count($row->completed_modules ?? []),
            ];
        }

        foreach (DB::table('practice_sessions')
            ->join('lessons', 'lessons.id', '=', 'practice_sessions.lesson_id')
            ->where('practice_sessions.user_id', $student->id)
            ->when($lessonIds !== null, fn ($q) => $q->whereIn('practice_sessions.lesson_id', $lessonIds))
            ->select('practice_sessions.level', 'practice_sessions.correct_count', 'practice_sessions.questions_answered',
                'practice_sessions.started_at', 'practice_sessions.completed_at',
                'lessons.title as lesson_title', 'lessons.code as lesson_code')
            ->orderByRaw('COALESCE(practice_sessions.completed_at, practice_sessions.started_at) DESC')
            ->limit($limit)
            ->get() as $session) {
            $events[] = [
                'type' => 'practice_session',
                'at' => $session->completed_at ?? $session->started_at,
                'lesson' => $session->lesson_title,
                'lessonCode' => $session->lesson_code,
                'detail' => "Niveau {$session->level} — {$session->correct_count}/{$session->questions_answered} réussies",
                'level' => (int) $session->level,
                'correct' => (int) $session->correct_count,
                'answered' => (int) $session->questions_answered,
            ];
        }

        foreach (DB::table('lesson_final_test_attempts')
            ->join('lessons', 'lessons.id', '=', 'lesson_final_test_attempts.lesson_id')
            ->where('lesson_final_test_attempts.user_id', $student->id)
            ->when($lessonIds !== null, fn ($q) => $q->whereIn('lesson_final_test_attempts.lesson_id', $lessonIds))
            ->select('lesson_final_test_attempts.score', 'lesson_final_test_attempts.total_questions', 'lesson_final_test_attempts.submitted_at',
                'lessons.title as lesson_title', 'lessons.code as lesson_code')
            ->orderByDesc('lesson_final_test_attempts.submitted_at')
            ->limit($limit)
            ->get() as $attempt) {
            $events[] = [
                'type' => 'final_test',
                'at' => $attempt->submitted_at,
                'lesson' => $attempt->lesson_title,
                'lessonCode' => $attempt->lesson_code,
                'detail' => "Test final — {$attempt->score}/{$attempt->total_questions}",
                'score' => (int) $attempt->score,
                'total' => (int) $attempt->total_questions,
            ];
        }

        usort($events, fn ($a, $b) => strcmp((string) $b['at'], (string) $a['at']));

        return array_slice($events, 0, $limit);
    }
}
