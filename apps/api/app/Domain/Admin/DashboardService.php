<?php

namespace App\Domain\Admin;

use App\Domain\Progress\Support\OutcomeStats;
use App\Models\AdminActivityLog;
use App\Models\Classroom;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentLessonProgress;
use App\Models\StudentReport;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
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
                'activeTeacherSubscriptions' => Subscription::where('status', Subscription::STATUS_ACTIVE)
                    ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_TEACHER))->count(),
                'teachers' => User::where('role', User::ROLE_TEACHER)->count(),
                'classrooms' => Classroom::where('status', Classroom::STATUS_ACTIVE)->count(),
                'pendingSubscriptionRequests' => SubscriptionRequest::where('status', SubscriptionRequest::STATUS_PENDING)->count(),
                'expiredSubscriptions' => Subscription::where('status', Subscription::STATUS_EXPIRED)->count(),
            ],
            'alerts' => $this->alerts(),
            'recent' => $this->recent(),
        ];
    }

    /**
     * Les anomalies qui méritent un regard. Chacune porte de quoi agir : un
     * intitulé, une gravité, et le lien vers ce qu'il faut ouvrir.
     *
     * ATTENTION — ces `link` sont des chemins de l'interface React, produits
     * ici, côté serveur. C'est le seul endroit du backend qui en fabrique, et
     * rien ne les vérifie à la compilation : un chemin faux ne casse pas, il
     * retombe sur la route attrape-tout et affiche la page d'accueil. Les
     * routes d'administration sont EN FRANÇAIS (/admin/signalements,
     * /admin/contenu/exercices) — voir apps/web/src/App.jsx.
     *
     * Le test AdminAlertLinksTest compare ces chemins aux routes réellement
     * déclarées.
     *
     * CHAQUE ALERTE PORTE UN `kind` ET DES `params`, ET C'EST LE CLIENT QUI
     * ÉCRIT LA PHRASE. Le panneau est arabe : une phrase française composée
     * ici s'afficherait telle quelle au milieu de l'écran — c'est exactement
     * ce qui se passait, et c'est la règle « l'API parle en codes, le client
     * parle arabe » (ARABIC_RTL_CONTRACT §2) qui l'interdit.
     *
     * `label` reste renvoyé comme FILET : un client qui ne connaîtrait pas un
     * `kind` affiche la phrase du serveur plutôt que rien. Il n'est pas
     * destiné à l'affichage normal.
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
                'params' => ['count' => $critical],
                'label' => "{$critical} signalement(s) prioritaire(s) non traité(s)",
                'link' => '/admin/signalements?priority=high&status=new',
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
                // Le CLIENT compose la phrase : « exercice X » et « module N »
                // sont deux cas distincts, et il faut les dire en arabe.
                'params' => [
                    'count' => $cluster->reports_count,
                    'lessonCode' => $cluster->lesson_code,
                    'exerciseCode' => $cluster->exercise_code,
                    'moduleNumber' => $cluster->module_number,
                ],
                'label' => "{$cluster->reports_count} signalements identiques — {$cluster->lesson_code}, {$where}",
                'link' => '/admin/signalements?search='.urlencode((string) $cluster->lesson_code),
            ];
        }

        // Des exercices que presque personne ne réussit. Le seuil de 5
        // tentatives évite de crier au loup sur un échantillon d'une réponse.
        // Le taux est celui d'OutcomeStats : réussites (correct + équivalent)
        // sur les réponses qui disent quelque chose (réussites + partiels +
        // échecs) — une erreur de syntaxe n'est pas un exercice raté.
        $weak = OutcomeStats::selectInto(
            DB::table('question_attempts')
                ->join('exercise_attempts', 'exercise_attempts.id', '=', 'question_attempts.exercise_attempt_id')
                ->whereNotNull('question_attempts.submitted_at')
                ->select('exercise_attempts.exercise_id')
                ->groupBy('exercise_attempts.exercise_id')
        )
            ->get()
            ->map(fn ($row) => ['exercise_id' => $row->exercise_id] + OutcomeStats::fromRow($row))
            ->filter(fn ($r) => ($r['successes'] + $r['partials'] + $r['failures']) >= 5 && $r['successRate'] !== null && $r['successRate'] < 30)
            ->sortBy('successRate')
            ->take(5);

        foreach ($weak as $row) {
            $row = (object) $row;
            $row->exercise_id = $row->exercise_id;
            $row->total = $row->successes + $row->partials + $row->failures;
            $rate = round($row->successRate);
            $alerts[] = [
                'kind' => 'low_success_exercise',
                'severity' => 'warning',
                'params' => ['exercise' => $row->exercise_id, 'rate' => $rate, 'total' => $row->total],
                'label' => "Exercice {$row->exercise_id} : {$rate}% de réussite sur {$row->total} réponses",
                'link' => '/admin/contenu/exercices?search='.urlencode((string) $row->exercise_id),
            ];
        }

        // Des demandes d'offre attendent une décision humaine — la seule
        // façon dont un accès payant s'ouvre sur ce produit.
        $pendingRequests = SubscriptionRequest::where('status', SubscriptionRequest::STATUS_PENDING)->count();
        if ($pendingRequests > 0) {
            $alerts[] = [
                'kind' => 'pending_subscription_requests',
                'severity' => 'warning',
                'params' => ['count' => $pendingRequests],
                'label' => "{$pendingRequests} demande(s) d'offre en attente d'activation",
                'link' => '/admin/offres/demandes',
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
