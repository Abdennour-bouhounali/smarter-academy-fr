<?php

namespace App\Domain\Admin;

use App\Models\ExerciseAttempt;
use App\Models\LearningEvidence;
use App\Models\QuestionAttempt;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Les élèves vus par l'administration.
 *
 * Tout ce qui est affiché ici est DÉRIVÉ des tables d'apprentissage
 * existantes — progression, preuves, maîtrise, tentatives. Aucune colonne
 * « points faibles » n'est maintenue en double : la maîtrise a déjà un
 * propriétaire (ProgressEngine / student_learning_point_progress), et en
 * tenir une seconde copie garantirait qu'elles divergent.
 */
class StudentService
{
    public function __construct(private ActivityLogger $log) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->where('role', User::ROLE_STUDENT)
            ->withCount([
                'lessonProgress as lessons_started_count',
                'lessonProgress as lessons_completed_count' => fn ($q) => $q->where('status', StudentLessonProgress::STATUS_COMPLETED),
                'reports as reports_count',
            ])
            ->with(['subscriptions' => fn ($q) => $q->orderByDesc('started_at')->limit(1)]);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('email', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('id', $search));
        }

        if ($grade = ($filters['grade'] ?? null)) {
            $query->where('grade', $grade);
        }

        if ($status = ($filters['status'] ?? null)) {
            $query->where('account_status', $status);
        }

        if ($subscription = ($filters['subscription'] ?? null)) {
            $query->whereHas('subscriptions', fn ($q) => $q->where('status', $subscription));
        }

        // « Actif depuis » : une date, pas un booléen — le seuil appartient à
        // celui qui regarde, pas à ce service.
        if ($since = ($filters['activeSince'] ?? null)) {
            $query->where('last_activity_at', '>=', $since);
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $sortable = ['created_at', 'last_activity_at', 'email', 'grade', 'account_status', 'lessons_completed_count'];
        $query->orderBy(in_array($sort, $sortable, true) ? $sort : 'created_at', $direction);

        return $query->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    public function find(int $id): User
    {
        $student = User::where('role', User::ROLE_STUDENT)->find($id);

        if (! $student) {
            throw new DomainException('Élève introuvable.');
        }

        return $student;
    }

    /**
     * Le dossier d'apprentissage complet d'un élève.
     *
     * @return array<string, mixed>
     */
    public function profile(User $student): array
    {
        $progress = StudentLessonProgress::with('lesson:id,code,title')
            ->where('user_id', $student->id)
            ->orderByDesc('last_activity_at')
            ->get();

        $mastery = StudentLearningPointProgress::with('learningPoint:id,code,title,lesson_id')
            ->where('user_id', $student->id)
            ->get();

        $questionStats = QuestionAttempt::where('user_id', $student->id)
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN outcome = ? THEN 1 ELSE 0 END) as correct', ['correct'])
            ->selectRaw('SUM(hints_used) as hints')
            ->first();

        $answered = (int) ($questionStats->total ?? 0);
        $correct = (int) ($questionStats->correct ?? 0);

        return [
            'progress' => $progress,
            'lessonsStarted' => $progress->count(),
            'lessonsCompleted' => $progress->where('status', StudentLessonProgress::STATUS_COMPLETED)->count(),
            'modulesCompleted' => $progress->sum(fn ($row) => count($row->completed_modules ?? [])),
            'exerciseAttempts' => ExerciseAttempt::whereHas(
                'practiceSession',
                fn ($q) => $q->where('user_id', $student->id)
            )->count(),
            'questionsAnswered' => $answered,
            'correctAnswers' => $correct,
            // null, et non 0, quand rien n'a été répondu : « aucune donnée »
            // et « 0 % de réussite » ne disent pas la même chose.
            'successRate' => $answered > 0 ? round($correct / $answered * 100, 1) : null,
            'hintsUsed' => (int) ($questionStats->hints ?? 0),
            'mastery' => $mastery,
            'masteryCounts' => $mastery->groupBy('status')->map->count(),
            'evidenceCount' => LearningEvidence::where('user_id', $student->id)->count(),
        ];
    }

    /**
     * Les événements d'apprentissage, dans l'ordre. Assemblé à partir de ce
     * qui est déjà enregistré — pas d'une table d'événements dédiée, qui
     * n'existe pas.
     *
     * @return array<int, array<string, mixed>>
     */
    public function timeline(User $student, int $limit = 50): array
    {
        $events = [];

        foreach (StudentLessonProgress::with('lesson:id,code,title')->where('user_id', $student->id)->get() as $row) {
            $events[] = [
                'type' => $row->status === StudentLessonProgress::STATUS_COMPLETED ? 'lesson_completed' : 'lesson_progress',
                'at' => $row->completed_at ?? $row->last_activity_at,
                'lesson' => $row->lesson?->title,
                'lessonCode' => $row->lesson?->code,
                'detail' => count($row->completed_modules ?? []).' module(s) terminé(s)',
            ];
        }

        foreach (DB::table('practice_sessions')
            ->join('lessons', 'lessons.id', '=', 'practice_sessions.lesson_id')
            ->where('practice_sessions.user_id', $student->id)
            ->select('practice_sessions.*', 'lessons.title as lesson_title', 'lessons.code as lesson_code')
            ->get() as $session) {
            $events[] = [
                'type' => 'practice_session',
                'at' => $session->completed_at ?? $session->started_at,
                'lesson' => $session->lesson_title,
                'lessonCode' => $session->lesson_code,
                'detail' => "Niveau {$session->level} — {$session->correct_count}/{$session->questions_answered} réussies",
            ];
        }

        foreach (DB::table('lesson_final_test_attempts')
            ->join('lessons', 'lessons.id', '=', 'lesson_final_test_attempts.lesson_id')
            ->where('lesson_final_test_attempts.user_id', $student->id)
            ->select('lesson_final_test_attempts.*', 'lessons.title as lesson_title')
            ->get() as $attempt) {
            $events[] = [
                'type' => 'final_test',
                'at' => $attempt->submitted_at,
                'lesson' => $attempt->lesson_title,
                'detail' => "Test final — {$attempt->score}/{$attempt->total_questions}",
            ];
        }

        usort($events, fn ($a, $b) => strcmp((string) $b['at'], (string) $a['at']));

        return array_slice($events, 0, $limit);
    }

    /**
     * Change le statut d'un compte.
     *
     * Ne touche JAMAIS aux données d'apprentissage : suspendre ou désactiver
     * est une décision de cycle de vie du compte, la conservation de
     * l'historique en est une autre (spec §2.4).
     */
    public function changeStatus(User $admin, int $studentId, string $status): User
    {
        if (! in_array($status, User::ACCOUNT_STATUSES, true)) {
            throw new DomainException('Statut de compte inconnu.');
        }

        $student = $this->find($studentId);
        $before = $student->account_status;

        $student->account_status = $status;
        $student->suspended_at = $status === User::STATUS_ACTIVE ? null : now();
        $student->save();

        // Un compte fermé ne garde pas de jeton valide en poche. Le compte
        // suspendu les garde : la suspension est temporaire, et la lever ne
        // doit pas obliger l'élève à se reconnecter partout.
        if ($status === User::STATUS_DISABLED) {
            $student->tokens()->delete();
        }

        $this->log->log(
            $admin,
            ActivityLogger::STUDENT_STATUS,
            'student',
            $student->id,
            ['account_status' => $before],
            ['account_status' => $status],
        );

        return $student;
    }
}
