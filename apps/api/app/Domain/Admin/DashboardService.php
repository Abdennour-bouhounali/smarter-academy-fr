<?php

namespace App\Domain\Admin;

use App\Models\AdminActivityLog;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentLessonProgress;
use App\Models\StudentReport;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * « Que se passe-t-il sur la plateforme, là, maintenant ? »
 *
 * Trois blocs : les compteurs, les alertes, l'activité récente. Les alertes
 * ne sont pas décoratives — chacune correspond à quelque chose sur quoi un
 * administrateur peut agir le jour même.
 */
class DashboardService
{
    public function __construct(private ReportService $reports) {}

    public function overview(): array
    {
        $now = CarbonImmutable::now();
        $students = User::where('role', User::ROLE_STUDENT);

        return [
            'kpis' => [
                'totalStudents' => (clone $students)->count(),
                'activeStudents' => (clone $students)->where('account_status', User::STATUS_ACTIVE)->count(),
                'suspendedStudents' => (clone $students)->where('account_status', User::STATUS_SUSPENDED)->count(),
                'activeToday' => (clone $students)->where('last_activity_at', '>=', $now->startOfDay())->count(),
                'newRegistrations7d' => (clone $students)->where('created_at', '>=', $now->subDays(7))->count(),

                'publishedLessons' => Lesson::where('publication_status', Lesson::PUB_PUBLISHED)->count(),
                'hiddenLessons' => Lesson::where('publication_status', Lesson::PUB_HIDDEN)->count(),
                'draftLessons' => Lesson::where('publication_status', Lesson::PUB_DRAFT)->count(),
                'archivedLessons' => Lesson::where('publication_status', Lesson::PUB_ARCHIVED)->count(),
                'totalModules' => LessonModule::whereNull('retired_at')->count(),
                'totalExercises' => PracticeExercise::whereNull('retired_at')->count(),

                'exerciseAttempts' => DB::table('exercise_attempts')->count(),
                'questionsAnswered' => DB::table('question_attempts')->whereNotNull('submitted_at')->count(),

                'pendingReports' => StudentReport::whereIn('status', [
                    StudentReport::STATUS_NEW, StudentReport::STATUS_IN_REVIEW,
                ])->count(),
                'newReports' => StudentReport::where('status', StudentReport::STATUS_NEW)->count(),

                'activeSubscriptions' => Subscription::where('status', Subscription::STATUS_ACTIVE)->count(),
                'expiredSubscriptions' => Subscription::where('status', Subscription::STATUS_EXPIRED)->count(),
            ],
            'alerts' => $this->alerts(),
            'recent' => $this->recent(),
        ];
    }

    /**
     * Les anomalies qui méritent un regard. Chacune porte de quoi agir : un
     * intitulé, une gravité, et le lien vers ce qu'il faut ouvrir.
     */
    private function alerts(): array
    {
        $alerts = [];

        $critical = StudentReport::whereIn('priority', ['critical', 'high'])
            ->whereIn('status', [StudentReport::STATUS_NEW, StudentReport::STATUS_IN_REVIEW])
            ->count();

        if ($critical > 0) {
            $alerts[] = [
                'kind' => 'high_priority_reports',
                'severity' => 'critical',
                'label' => "{$critical} signalement(s) prioritaire(s) non traité(s)",
                'link' => '/admin/reports?priority=high&status=new',
            ];
        }

        // Un même problème signalé plusieurs fois : c'est le signal le plus
        // fiable qu'un contenu est réellement cassé.
        foreach ($this->reports->clusters(5) as $cluster) {
            if ($cluster->reports_count < 3) {
                continue;
            }
            $where = $cluster->exercise_code
                ? "exercice {$cluster->exercise_code}"
                : 'module '.($cluster->module_number ?? '?');

            $alerts[] = [
                'kind' => 'repeated_reports',
                'severity' => 'warning',
                'label' => "{$cluster->reports_count} signalements identiques — {$cluster->lesson_code}, {$where}",
                'link' => '/admin/reports?search='.urlencode((string) $cluster->lesson_code),
            ];
        }

        // Des exercices que presque personne ne réussit. Le seuil de 5
        // tentatives évite de crier au loup sur un échantillon d'une réponse.
        $weak = DB::table('question_attempts')
            ->join('exercise_attempts', 'exercise_attempts.id', '=', 'question_attempts.exercise_attempt_id')
            ->whereNotNull('question_attempts.submitted_at')
            ->select(
                'exercise_attempts.exercise_id',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN question_attempts.outcome = 'correct' THEN 1 ELSE 0 END) as correct")
            )
            ->groupBy('exercise_attempts.exercise_id')
            ->havingRaw('COUNT(*) >= 5')
            ->havingRaw("SUM(CASE WHEN question_attempts.outcome = 'correct' THEN 1 ELSE 0 END) / COUNT(*) < 0.3")
            ->limit(5)
            ->get();

        foreach ($weak as $row) {
            $rate = round($row->correct / $row->total * 100);
            $alerts[] = [
                'kind' => 'low_success_exercise',
                'severity' => 'warning',
                'label' => "Exercice {$row->exercise_id} : {$rate}% de réussite sur {$row->total} réponses",
                'link' => '/admin/content/exercises?search='.urlencode((string) $row->exercise_id),
            ];
        }

        return $alerts;
    }

    private function recent(): array
    {
        return [
            'reports' => StudentReport::with(['student:id,first_name,last_name,email', 'lesson:id,code,title'])
                ->latest()->limit(8)->get(),

            'registrations' => User::where('role', User::ROLE_STUDENT)
                ->latest()->limit(8)
                ->get(['id', 'first_name', 'last_name', 'email', 'grade', 'created_at']),

            'adminActions' => AdminActivityLog::with('admin:id,first_name,last_name,email')
                ->latest()->limit(8)->get(),

            'contentChanges' => AdminActivityLog::with('admin:id,first_name,last_name,email')
                ->whereIn('action', [
                    ActivityLogger::PUBLISH_LESSON,
                    ActivityLogger::PUBLISH_MODULE,
                    ActivityLogger::PUBLISH_EXERCISE,
                ])
                ->latest()->limit(8)->get(),

            'completions' => StudentLessonProgress::with(['lesson:id,code,title', 'user:id,first_name,last_name,email'])
                ->where('status', StudentLessonProgress::STATUS_COMPLETED)
                ->orderByDesc('completed_at')->limit(8)->get(),
        ];
    }
}
