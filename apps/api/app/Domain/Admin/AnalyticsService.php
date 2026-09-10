<?php

namespace App\Domain\Admin;

use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\StudentReport;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Les statistiques — à partir de ce qui est RÉELLEMENT enregistré.
 *
 * La règle de cette classe : ne jamais inventer un nombre. Certaines mesures
 * demandées par la spec (§6) n'ont aujourd'hui aucune trace en base — il n'y
 * a pas de table d'événements, donc personne n'a jamais enregistré une « vue »
 * de leçon, une durée de session ou un abandon. Pour celles-là, on renvoie
 * explicitement `unavailable()` plutôt qu'un zéro : un zéro se lit comme « ça
 * ne marche pas », alors que la vérité est « ce n'est pas encore mesuré ».
 *
 * Ce qui EST mesurable vient de : users, student_lesson_progress,
 * learning_evidence, student_learning_point_progress, practice_sessions,
 * exercise_attempts, question_attempts, hint_events, diagnostic_*,
 * lesson_final_test_attempts, student_reports, subscriptions.
 */
class AnalyticsService
{
    /** Une mesure qu'aucune donnée existante ne permet de calculer. */
    private function unavailable(string $reason = 'no_tracking'): array
    {
        return ['available' => false, 'reason' => $reason];
    }

    private function value(mixed $value): array
    {
        return ['available' => true, 'value' => $value];
    }

    /**
     * @return array{from: CarbonImmutable, to: CarbonImmutable}
     */
    public function range(?string $from, ?string $to): array
    {
        $end = $to ? CarbonImmutable::parse($to)->endOfDay() : CarbonImmutable::now()->endOfDay();
        $start = $from ? CarbonImmutable::parse($from)->startOfDay() : $end->subDays(29)->startOfDay();

        return ['from' => $start, 'to' => $end];
    }

    /** Statistiques de plateforme. */
    public function platform(?string $from = null, ?string $to = null): array
    {
        ['from' => $start, 'to' => $end] = $this->range($from, $to);
        $now = CarbonImmutable::now();

        $students = User::where('role', User::ROLE_STUDENT);

        return [
            'range' => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
            'metrics' => [
                'registrations' => $this->value((clone $students)->whereBetween('created_at', [$start, $end])->count()),
                'totalStudents' => $this->value((clone $students)->count()),

                // Actifs = dernière activité connue. `last_activity_at` est
                // posé à la connexion ; c'est donc une mesure de connexion,
                // honnête mais plus grossière qu'une vraie session.
                'activeToday' => $this->value((clone $students)->where('last_activity_at', '>=', $now->startOfDay())->count()),
                'dau' => $this->value((clone $students)->where('last_activity_at', '>=', $now->subDay())->count()),
                'wau' => $this->value((clone $students)->where('last_activity_at', '>=', $now->subDays(7))->count()),
                'mau' => $this->value((clone $students)->where('last_activity_at', '>=', $now->subDays(30))->count()),

                'lessonStarts' => $this->value(StudentLessonProgress::whereBetween('created_at', [$start, $end])->count()),
                'lessonCompletions' => $this->value(
                    StudentLessonProgress::where('status', StudentLessonProgress::STATUS_COMPLETED)
                        ->whereBetween('completed_at', [$start, $end])->count()
                ),
                'moduleCompletions' => $this->value($this->countCompletedModules($start, $end)),

                'practiceSessions' => $this->value(
                    DB::table('practice_sessions')->whereBetween('started_at', [$start, $end])->count()
                ),
                'exerciseAttempts' => $this->value(
                    DB::table('exercise_attempts')->whereBetween('started_at', [$start, $end])->count()
                ),
                'questionsAnswered' => $this->value(
                    DB::table('question_attempts')->whereBetween('submitted_at', [$start, $end])->count()
                ),
                'reports' => $this->value(StudentReport::whereBetween('created_at', [$start, $end])->count()),
                'activeSubscriptions' => $this->value(Subscription::where('status', Subscription::STATUS_ACTIVE)->count()),
                'expiredSubscriptions' => $this->value(Subscription::where('status', Subscription::STATUS_EXPIRED)->count()),

                // Rien n'enregistre l'ouverture d'une page ni la durée d'une
                // visite : il n'y a pas de table d'événements.
                'sessions' => $this->unavailable(),
                'pageViews' => $this->unavailable(),
                'averageSessionDuration' => $this->unavailable(),
            ],
            'series' => [
                'registrations' => $this->dailySeries(
                    (clone $students)->whereBetween('created_at', [$start, $end]),
                    'created_at', $start, $end
                ),
                'lessonCompletions' => $this->dailySeries(
                    StudentLessonProgress::where('status', StudentLessonProgress::STATUS_COMPLETED)
                        ->whereBetween('completed_at', [$start, $end]),
                    'completed_at', $start, $end
                ),
                'reports' => $this->dailySeries(
                    StudentReport::whereBetween('created_at', [$start, $end]),
                    'created_at', $start, $end
                ),
            ],
        ];
    }

    /** Statistiques d'apprentissage. */
    public function learning(?string $from = null, ?string $to = null): array
    {
        ['from' => $start, 'to' => $end] = $this->range($from, $to);

        $outcomes = DB::table('question_attempts')
            ->whereBetween('submitted_at', [$start, $end])
            ->select('outcome', DB::raw('COUNT(*) as c'))
            ->groupBy('outcome')
            ->pluck('c', 'outcome');

        $answered = (int) $outcomes->sum();
        $correct = (int) ($outcomes['correct'] ?? 0);

        $masteryCounts = StudentLearningPointProgress::select('status', DB::raw('COUNT(*) as c'))
            ->groupBy('status')->pluck('c', 'status');

        return [
            'range' => ['from' => $start->toDateString(), 'to' => $end->toDateString()],
            'metrics' => [
                'lessonsStarted' => $this->value(StudentLessonProgress::whereBetween('created_at', [$start, $end])->count()),
                'lessonsCompleted' => $this->value(
                    StudentLessonProgress::where('status', StudentLessonProgress::STATUS_COMPLETED)
                        ->whereBetween('completed_at', [$start, $end])->count()
                ),
                'modulesCompleted' => $this->value($this->countCompletedModules($start, $end)),
                'exercisesStarted' => $this->value(DB::table('exercise_attempts')->whereBetween('started_at', [$start, $end])->count()),
                'exercisesCompleted' => $this->value(
                    DB::table('exercise_attempts')->where('status', 'completed')->whereBetween('completed_at', [$start, $end])->count()
                ),
                'questionsAnswered' => $this->value($answered),
                'correctAnswers' => $this->value($correct),
                'incorrectAnswers' => $this->value($answered - $correct),
                'successRate' => $answered > 0
                    ? $this->value(round($correct / $answered * 100, 1))
                    : $this->unavailable('no_data'),
                'hints' => $this->value(DB::table('hint_events')->whereBetween('requested_at', [$start, $end])->count()),
                'diagnosticsCompleted' => $this->value(
                    DB::table('diagnostic_sessions')->whereNotNull('completed_at')
                        ->whereBetween('completed_at', [$start, $end])->count()
                ),
                'finalAssessments' => $this->value(
                    DB::table('lesson_final_test_attempts')->whereBetween('submitted_at', [$start, $end])->count()
                ),
                'evidenceRecorded' => $this->value(
                    DB::table('learning_evidence')->whereBetween('submitted_at', [$start, $end])->count()
                ),

                // Aucune horloge ne tourne côté élève, et rien ne distingue
                // « quitté » de « pas encore revenu ».
                'timeSpent' => $this->unavailable(),
                'skips' => $this->unavailable(),
                'abandonment' => $this->unavailable(),
            ],
            'outcomes' => $outcomes,
            'mastery' => $masteryCounts,
        ];
    }

    /**
     * Statistiques par contenu. Une ligne par leçon : combien d'élèves l'ont
     * commencée, terminée, et comment ils s'en sortent.
     */
    public function content(array $filters = []): array
    {
        $lessons = Lesson::query()
            ->with('chapter.grade')
            ->withCount([
                'studentProgress as starts_count',
                'studentProgress as completions_count' => fn ($q) => $q->where('status', StudentLessonProgress::STATUS_COMPLETED),
                'reports as reports_count',
                'modules as modules_count' => fn ($q) => $q->whereNull('retired_at'),
            ]);

        if ($grade = ($filters['grade'] ?? null)) {
            $lessons->whereHas('chapter.grade', fn ($q) => $q->where('code', $grade));
        }

        $rows = $lessons->get()->map(function (Lesson $lesson) {
            $starts = (int) $lesson->starts_count;
            $completions = (int) $lesson->completions_count;

            return [
                'id' => $lesson->id,
                'code' => $lesson->code,
                'title' => $lesson->title,
                'grade' => $lesson->chapter?->grade?->code,
                'chapter' => $lesson->chapter?->code,
                'publicationStatus' => $lesson->publication_status,
                'tier' => $lesson->tier,
                'modules' => (int) $lesson->modules_count,
                'starts' => $starts,
                'completions' => $completions,
                // null quand personne n'a commencé : un taux de 0 % sur zéro
                // élève est une affirmation qu'on ne peut pas soutenir.
                'completionRate' => $starts > 0 ? round($completions / $starts * 100, 1) : null,
                'reports' => (int) $lesson->reports_count,
                // Mesures sans source : pas de vues, pas de chronomètre.
                'views' => null,
                'averageTime' => null,
                'abandonment' => null,
            ];
        })->sortByDesc('starts')->values()->all();

        return [
            'lessons' => $rows,
            'unavailableMetrics' => ['views', 'averageTime', 'abandonment'],
        ];
    }

    /**
     * Statistiques par learning point — la vue qui répond à « sur quoi les
     * élèves butent-ils ? ».
     *
     * La réussite au premier essai est calculée à partir de
     * question_attempts.attempt_number = 1, joint aux learning points par le
     * pivot des preuves.
     */
    public function learningPoints(array $filters = []): array
    {
        $query = LearningPoint::query()
            ->with('lesson:id,code,title')
            ->whereNull('retired_at')
            ->withCount([
                'progress as students_exposed' => fn ($q) => $q->where('attempts', '>', 0),
                'progress as mastered_count' => fn ($q) => $q->where('status', 'mastered'),
                'progress as reinforce_count' => fn ($q) => $q->where('status', 'reinforce'),
                'progress as gap_count' => fn ($q) => $q->where('status', 'gap'),
            ]);

        if ($lesson = ($filters['lesson'] ?? null)) {
            $query->whereHas('lesson', fn ($q) => $q->where('code', $lesson));
        }

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%"));
        }

        $rows = $query->get()->map(function (LearningPoint $lp) {
            $exposed = (int) $lp->students_exposed;
            $mastered = (int) $lp->mastered_count;

            return [
                'id' => $lp->id,
                'code' => $lp->code,
                'title' => $lp->title,
                'lesson' => $lp->lesson?->title,
                'lessonCode' => $lp->lesson?->code,
                'studentsExposed' => $exposed,
                'mastered' => $mastered,
                'reinforce' => (int) $lp->reinforce_count,
                'struggling' => (int) $lp->gap_count,
                'masteryRate' => $exposed > 0 ? round($mastered / $exposed * 100, 1) : null,
            ];
        })
            ->filter(fn ($row) => ($filters['onlyExposed'] ?? false) ? $row['studentsExposed'] > 0 : true)
            ->sortByDesc('studentsExposed')
            ->values()
            ->all();

        return ['learningPoints' => $rows];
    }

    /**
     * Modules terminés sur une période.
     *
     * completed_modules est un tableau JSON, pas une table de faits : on ne
     * peut pas dater chaque module individuellement. On compte donc la taille
     * du tableau des progressions ACTIVES sur la période — c'est une
     * approximation, et elle est signalée comme telle à l'appelant.
     */
    private function countCompletedModules(CarbonImmutable $start, CarbonImmutable $end): int
    {
        return (int) StudentLessonProgress::whereBetween('last_activity_at', [$start, $end])
            ->get()
            ->sum(fn ($row) => count($row->completed_modules ?? []));
    }

    /**
     * Série journalière pour un graphique, avec les jours vides à zéro : une
     * courbe qui saute les jours sans donnée ment sur sa propre forme.
     */
    private function dailySeries($query, string $column, CarbonImmutable $start, CarbonImmutable $end): array
    {
        $counts = $query
            ->select(DB::raw("DATE({$column}) as day"), DB::raw('COUNT(*) as c'))
            ->groupBy('day')
            ->pluck('c', 'day');

        $series = [];
        for ($day = $start; $day->lessThanOrEqualTo($end); $day = $day->addDay()) {
            $key = $day->toDateString();
            $series[] = ['date' => $key, 'value' => (int) ($counts[$key] ?? 0)];
        }

        return $series;
    }
}
