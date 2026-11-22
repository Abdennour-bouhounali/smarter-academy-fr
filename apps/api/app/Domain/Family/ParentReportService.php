<?php

namespace App\Domain\Family;

use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Outcome;
use App\Models\LearningPointStateTransition;
use App\Models\QuestionAttempt;
use App\Models\StudentLessonProgress;
use App\Models\StudyTimeDay;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * Le RAPPORT DE LA SEMAINE d'un élève (PARENT_SPACE.md §4) — une seule forme,
 * servie au parent (/parent/children/{id}/report), à l'élève lui-même
 * (« ما يراه وليّك », /student/parents/report) et au courriel du dimanche.
 * Ce que l'élève voit est exactement ce que son وليّ voit.
 *
 * Il dit ce qui a été FAIT, pas ce qui a été ouvert : temps actif mesuré,
 * réponses justes sur réponses données, leçons travaillées et terminées,
 * الكفاءات passées à « متقنة » dans la semaine. Jamais une adresse, jamais
 * une note du cahier, jamais une photo de copie.
 */
class ParentReportService
{
    private const LESSONS_LIMIT = 12;

    private const MASTERED_LIMIT = 20;

    /** @return array<string, mixed> */
    public function week(User $student, int $weeksBack = 0): array
    {
        $weeksBack = max(0, min((int) config('family.report_weeks_back', 8), $weeksBack));
        $start = FamilyClock::weekStart($weeksBack);
        $end = $start->addDays(7);
        [$fromUtc, $toUtc] = [$start->utc(), $end->utc()];

        return [
            'weekStart' => $start->toDateString(),
            'weekEnd' => $end->subDay()->toDateString(),
            'weeksBack' => $weeksBack,
            'time' => $this->time($student, $start),
            'practice' => $this->practice($student, $fromUtc, $toUtc),
            'lessons' => $this->lessons($student, $fromUtc, $toUtc),
            'mastered' => $this->mastered($student, $fromUtc, $toUtc),
            'lastSeenAt' => $this->lastSeen($student),
        ];
    }

    /** Le résumé d'une ligne de la liste « أبنائي » : aujourd'hui et la semaine en cours. */
    public function glance(User $student): array
    {
        $today = FamilyClock::today();
        $weekStart = FamilyClock::weekStart()->toDateString();
        $rows = StudyTimeDay::where('user_id', $student->id)->where('day', '>=', $weekStart)->get();
        $study = fn ($r) => in_array($r->surface, StudyTimeDay::STUDY_SURFACES, true) ? $r->active_seconds : 0;

        return [
            'todayStudySeconds' => (int) $rows->where('day', $today)->sum($study),
            'weekStudySeconds' => (int) $rows->sum($study),
            'lastSeenAt' => $this->lastSeen($student),
        ];
    }

    private function lastSeen(User $student): ?string
    {
        $at = StudyTimeDay::where('user_id', $student->id)->max('updated_at');

        return $at === null ? null : CarbonImmutable::parse($at, 'UTC')->toIso8601String();
    }

    /** @return array<string, mixed> */
    private function time(User $student, CarbonImmutable $start): array
    {
        $rows = StudyTimeDay::where('user_id', $student->id)
            ->where('day', '>=', $start->toDateString())
            ->where('day', '<=', $start->addDays(6)->toDateString())
            ->get();

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $start->addDays($i)->toDateString();
            $dayRows = $rows->where('day', $date);
            $days[] = [
                'date' => $date,
                'studySeconds' => (int) $dayRows->whereIn('surface', StudyTimeDay::STUDY_SURFACES)->sum('active_seconds'),
                'gameSeconds' => (int) $dayRows->where('surface', 'game')->sum('active_seconds'),
                'otherSeconds' => (int) $dayRows->where('surface', 'other')->sum('active_seconds'),
                'idleSeconds' => (int) $dayRows->sum('idle_seconds'),
                'awaySeconds' => (int) $dayRows->sum('away_seconds'),
                'leaves' => (int) $dayRows->sum('leave_count'),
            ];
        }

        $bySurface = [];
        foreach (StudyTimeDay::SURFACES as $surface) {
            $bySurface[$surface] = (int) $rows->where('surface', $surface)->sum('active_seconds');
        }

        $total = fn (string $k) => array_sum(array_column($days, $k));

        return [
            'days' => $days,
            'bySurface' => $bySurface,
            'studySeconds' => $total('studySeconds'),
            'gameSeconds' => $total('gameSeconds'),
            'otherSeconds' => $total('otherSeconds'),
            'idleSeconds' => $total('idleSeconds'),
            'awaySeconds' => $total('awaySeconds'),
            'leaves' => $total('leaves'),
            'activeDays' => count(array_filter($days, fn ($d) => $d['studySeconds'] >= 60)),
        ];
    }

    /** @return array{answered: int, correct: int, partial: int} */
    private function practice(User $student, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $counts = QuestionAttempt::where('user_id', $student->id)
            ->whereBetween('submitted_at', [$from, $to])
            ->whereNotNull('outcome')
            ->where('outcome', '!=', Outcome::Abandoned->value)
            ->selectRaw('outcome, COUNT(*) as n')
            ->groupBy('outcome')
            ->pluck('n', 'outcome');

        $n = fn (Outcome ...$o) => (int) collect($o)->sum(fn ($x) => (int) ($counts[$x->value] ?? 0));

        return [
            'answered' => (int) $counts->sum(),
            'correct' => $n(Outcome::Correct, Outcome::EquivalentCorrect),
            'partial' => $n(Outcome::PartiallyCorrect),
        ];
    }

    /** @return array{worked: int, completed: int, items: array<int, array<string, mixed>>} */
    private function lessons(User $student, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = StudentLessonProgress::with('lesson:id,code,title')
            ->where('user_id', $student->id)
            ->whereBetween('last_activity_at', [$from, $to])
            ->orderByDesc('last_activity_at')
            ->get();

        $completedInWeek = fn ($p) => $p->completed_at !== null && $p->completed_at->between($from, $to);

        return [
            'worked' => $rows->count(),
            'completed' => $rows->filter($completedInWeek)->count(),
            'items' => $rows->take(self::LESSONS_LIMIT)->map(fn ($p) => [
                'code' => $p->lesson?->code,
                'title' => $p->lesson?->title,
                'completedThisWeek' => $completedInWeek($p),
                'completed' => $p->status === StudentLessonProgress::STATUS_COMPLETED,
            ])->values()->all(),
        ];
    }

    /** @return array{count: int, items: array<int, array<string, mixed>>} */
    private function mastered(User $student, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $rows = LearningPointStateTransition::with('learningPoint:id,code,title,lesson_id', 'learningPoint.lesson:id,title')
            ->where('user_id', $student->id)
            ->where('status_after', MasteryState::STATUS_MASTERED)
            ->where(fn ($q) => $q->whereNull('status_before')->orWhere('status_before', '!=', MasteryState::STATUS_MASTERED))
            ->whereBetween('occurred_at', [$from, $to])
            ->orderByDesc('occurred_at')
            ->get()
            ->unique('learning_point_id');

        return [
            'count' => $rows->count(),
            'items' => $rows->take(self::MASTERED_LIMIT)->map(fn ($t) => [
                'code' => $t->learningPoint?->code,
                'title' => $t->learningPoint?->title,
                'lessonTitle' => $t->learningPoint?->lesson?->title,
            ])->values()->all(),
        ];
    }
}
