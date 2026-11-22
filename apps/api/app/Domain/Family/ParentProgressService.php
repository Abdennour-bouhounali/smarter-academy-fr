<?php

namespace App\Domain\Family;

use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\StudentDossier;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;

/**
 * Le PROGRÈS EN DÉTAIL d'un élève (PARENT_SPACE.md §4bis) — l'onglet
 * « التقدّم بالتفصيل » du parent et, à l'identique, de l'élève.
 *
 * Il ne recalcule rien : les totaux et le fil d'activité viennent de
 * StudentDossier (le même dossier que lit l'enseignant, sans périmètre de
 * classe), les états de الكفاءات de Mastery V2. Il ajoute ce qu'un parent
 * demande en premier : « où en est-il dans son année ? » et « où a-t-il
 * besoin d'aide ? ».
 */
class ParentProgressService
{
    private const SUPPORT_LIMIT = 12;

    private const TIMELINE_LIMIT = 20;

    private const STATUS_ORDER = [
        MasteryState::STATUS_GAP => 0,
        MasteryState::STATUS_REINFORCE => 1,
        MasteryState::STATUS_MASTERED => 2,
        MasteryState::STATUS_UNASSESSED => 3,
    ];

    private static function iso(mixed $at): ?string
    {
        if ($at === null || $at === '') {
            return null;
        }

        return ($at instanceof DateTimeInterface ? CarbonImmutable::instance($at) : CarbonImmutable::parse((string) $at, 'UTC'))
            ->toIso8601String();
    }

    /** @return array<string, mixed> */
    public function forStudent(User $student): array
    {
        $profile = StudentDossier::profile($student);
        $gradeLessonIds = $student->grade
            ? Lesson::visibleToStudents()->whereHas('chapter.grade', fn ($g) => $g->where('code', $student->grade))->pluck('id')->all()
            : [];

        $progressByLesson = $profile['progress']->keyBy('lesson_id');
        $practiceByLesson = DB::table('practice_sessions')
            ->where('user_id', $student->id)
            ->groupBy('lesson_id')
            ->selectRaw('lesson_id, SUM(questions_answered) as answered, SUM(correct_count) as correct, COUNT(*) as sessions')
            ->selectRaw("MAX(CASE WHEN status = 'completed' THEN level ELSE NULL END) as best_level")
            ->get()->keyBy('lesson_id');
        $testByLesson = DB::table('lesson_final_test_attempts')
            ->where('user_id', $student->id)
            ->groupBy('lesson_id')
            ->selectRaw('lesson_id, MAX(score) as best, MAX(total_questions) as total')
            ->get()->keyBy('lesson_id');
        $masteryRows = StudentLearningPointProgress::where('user_id', $student->id)->get()->keyBy('learning_point_id');

        // Les leçons où l'élève a fait QUELQUE CHOSE : progression, pratique ou maîtrise.
        $touched = collect($progressByLesson->keys())
            ->merge($practiceByLesson->keys())
            ->merge(LearningPoint::whereIn('id', $masteryRows->keys())->pluck('lesson_id'))
            ->unique()->values();

        $lessons = Lesson::with('unit:id,title,order', 'chapter.grade:id,code')
            ->whereIn('id', $touched)
            ->get()
            ->sortBy(fn ($l) => sprintf('%06d-%06d', $l->unit?->order ?? 999999, $l->order ?? 999999));

        $modulesTotal = LessonModule::active()->visibleToStudents()
            ->whereIn('lesson_id', $touched)
            ->groupBy('lesson_id')->selectRaw('lesson_id, COUNT(*) as n')->pluck('n', 'lesson_id');
        $points = LearningPoint::whereIn('lesson_id', $touched)->whereNull('retired_at')
            ->orderBy('order')->get(['id', 'code', 'title', 'lesson_id'])->groupBy('lesson_id');

        $items = $lessons->map(function (Lesson $lesson) use ($progressByLesson, $practiceByLesson, $testByLesson, $modulesTotal, $points, $masteryRows) {
            $p = $progressByLesson->get($lesson->id);
            $practice = $practiceByLesson->get($lesson->id);
            $test = $testByLesson->get($lesson->id);
            $lps = ($points->get($lesson->id) ?? collect())->map(fn ($lp) => [
                'code' => $lp->code,
                'title' => $lp->title,
                'status' => $masteryRows->get($lp->id)?->status ?? MasteryState::STATUS_UNASSESSED,
            ])->values();

            return [
                'code' => $lesson->code,
                'title' => $lesson->title,
                'unitTitle' => $lesson->unit?->title,
                'grade' => $lesson->chapter?->grade?->code,
                'status' => $p?->status ?? 'not_started',
                'modulesCompleted' => count($p?->completed_modules ?? []),
                'modulesTotal' => (int) ($modulesTotal[$lesson->id] ?? 0),
                'lastActivityAt' => $p?->last_activity_at?->toIso8601String(),
                'completedAt' => $p?->completed_at?->toIso8601String(),
                'practice' => $practice ? [
                    'sessions' => (int) $practice->sessions,
                    'answered' => (int) $practice->answered,
                    'correct' => (int) $practice->correct,
                    'bestLevel' => $practice->best_level !== null ? (int) $practice->best_level : null,
                ] : null,
                'finalTest' => $test ? ['score' => (int) $test->best, 'total' => (int) $test->total] : null,
                'masteryCounts' => $lps->countBy('status')->all(),
                'learningPoints' => $lps->all(),
            ];
        })->values();

        $completedInGrade = $profile['progress']
            ->where('status', StudentLessonProgress::STATUS_COMPLETED)
            ->whereIn('lesson_id', $gradeLessonIds)->count();

        return [
            'summary' => [
                'gradeLessons' => count($gradeLessonIds),
                'gradeLessonsCompleted' => $completedInGrade,
                'progressPercent' => count($gradeLessonIds) > 0 ? (int) round($completedInGrade / count($gradeLessonIds) * 100) : null,
                'lessonsStarted' => $profile['lessonsStarted'],
                'lessonsCompleted' => $profile['lessonsCompleted'],
                'modulesCompleted' => $profile['modulesCompleted'],
                'questionsAnswered' => $profile['questionsAnswered'],
                'correctAnswers' => $profile['correctAnswers'],
                'successRate' => $profile['successRate'],
                'masteryCounts' => $profile['masteryCounts']->all(),
            ],
            'needsSupport' => $profile['mastery']
                ->whereIn('status', [MasteryState::STATUS_GAP, MasteryState::STATUS_REINFORCE])
                ->sortBy([
                    fn ($a, $b) => self::STATUS_ORDER[$a->status] <=> self::STATUS_ORDER[$b->status],
                    fn ($a, $b) => (float) $a->confidence <=> (float) $b->confidence,
                ])
                ->take(self::SUPPORT_LIMIT)
                ->map(fn ($m) => [
                    'code' => $m->learningPoint?->code,
                    'title' => $m->learningPoint?->title,
                    'lessonTitle' => $m->learningPoint?->lesson?->title,
                    'status' => $m->status,
                ])->values()->all(),
            'lessons' => $items->all(),
            // Le fil d'activité du dossier, sans son champ `detail` (phrase
            // française destinée à l'administration) : le client compose l'arabe.
            'timeline' => array_map(
                fn ($e) => ['at' => self::iso($e['at'] ?? null)] + array_diff_key($e, ['detail' => true, 'at' => true]),
                StudentDossier::timeline($student, self::TIMELINE_LIMIT)
            ),
        ];
    }
}
