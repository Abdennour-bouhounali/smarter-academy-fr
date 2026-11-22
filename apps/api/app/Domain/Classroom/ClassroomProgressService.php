<?php

namespace App\Domain\Classroom;

use App\Domain\Classroom\Insights\ClassroomFacts;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Progress\StudentDossier;
use App\Domain\Progress\Support\Freshness;
use App\Domain\Progress\Support\OutcomeStats;
use App\Models\Classroom;
use App\Models\ClassroomLesson;
use App\Models\ClassroomMembership;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * La progression VUE PAR L'ENSEIGNANT — une agrégation, jamais un stockage.
 *
 * Tout vient des tables d'apprentissage de l'élève (student_lesson_progress,
 * question_attempts ⋈ practice_sessions, learning_evidence), cadrées sur les
 * leçons EFFECTIVES de la classe : publiées ET non masquées. Rien n'est
 * recopié dans une table de classe ; retirer un élève ne détruit rien.
 *
 * L'élève y est décrit par ClassroomAccess::identity — jamais son courriel.
 * « Dernière activité » est celle du PÉRIMÈTRE de la classe
 * (ClassroomFacts::lastActivity), pas users.last_activity_at, qui dirait à
 * l'enseignant quand l'élève a travaillé ailleurs.
 *
 * Le cahier de l'élève (كرّاسي) n'apparaît nulle part ici.
 */
class ClassroomProgressService
{
    /** L'ordre « le plus fragile d'abord » des statuts de maîtrise. */
    private const STATUS_ORDER = ['gap' => 0, 'reinforce' => 1, 'unassessed' => 2, 'mastered' => 3];

    /**
     * Les leçons effectives, par classe, pour la durée d'UNE requête : la
     * carte, les signaux, l'aperçu et les interventions les demandent chacun.
     * Vidé à la frontière de requête (AppServiceProvider) et dès qu'un
     * enseignant change la visibilité d'une leçon (ClassroomLessonService).
     *
     * @var array<int, int[]>
     */
    private array $lessonIds = [];

    public function __construct(private PlanEntitlementResolver $entitlements) {}

    public function forget(): void
    {
        $this->lessonIds = [];
    }

    /** @return array<int, array<string, mixed>> */
    public function studentList(Classroom $classroom): array
    {
        $lessonIds = $this->effectiveLessonIds($classroom);

        return $this->studentRows($this->members($classroom), $lessonIds)->values()->all();
    }

    /**
     * La liste des élèves telle que l'ENSEIGNANT la lit : les chiffres de
     * progression seulement si son offre comprend « progression de la
     * classe » ; sinon l'identité, la date d'arrivée et le mode d'entrée.
     *
     * @return array<int, array<string, mixed>>
     */
    public function rosterFor(Classroom $classroom): array
    {
        $teacher = $classroom->teacher;
        if ($teacher !== null && $this->entitlements->allows($teacher, EntitlementKeys::PROGRESS_CLASS)) {
            return $this->studentList($classroom);
        }

        return $this->members($classroom)->map(fn (ClassroomMembership $m) => ClassroomAccess::identity($m->student, (int) $m->student_id) + [
            'grade' => $m->student?->grade,
            'joinedAt' => optional($m->joined_at)->toIso8601String(),
            'joinedVia' => $m->joined_via,
        ])->values()->all();
    }

    /**
     * Le dossier d'UN élève de la classe, cadré sur les leçons effectives.
     *
     * @return array<string, mixed>
     */
    public function studentDetail(Classroom $classroom, User $student): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_STUDENT);

        $lessonIds = $this->effectiveLessonIds($classroom);
        $profile = StudentDossier::profile($student, $lessonIds);
        $membership = ClassroomMembership::where('classroom_id', $classroom->id)->where('student_id', $student->id)->first();

        return [
            'student' => ClassroomAccess::identity($student) + [
                'grade' => $student->grade,
                'lastActivityAt' => ClassroomFacts::lastActivity([$student->id], $lessonIds)[$student->id] ?? null,
                'joinedAt' => optional($membership?->joined_at)->toIso8601String(),
                'membershipStatus' => $membership?->status,
            ],
            'scope' => ['lessonsInScope' => count($lessonIds)],
            'learning' => [
                'lessonsStarted' => $profile['lessonsStarted'],
                'lessonsCompleted' => $profile['lessonsCompleted'],
                'modulesCompleted' => $profile['modulesCompleted'],
                'exerciseAttempts' => $profile['exerciseAttempts'],
                'questionsAnswered' => $profile['questionsAnswered'],
                'correctAnswers' => $profile['correctAnswers'],
                'successRate' => $profile['successRate'],
                'hintsUsed' => $profile['hintsUsed'],
                'evidenceCount' => $profile['evidenceCount'],
                'masteryCounts' => $profile['masteryCounts'],
                'progressPercent' => count($lessonIds) > 0 ? round($profile['lessonsCompleted'] / count($lessonIds) * 100) : null,
            ],
            'progress' => $profile['progress']->map(fn ($p) => [
                'lessonCode' => $p->lesson?->code,
                'lessonTitle' => $p->lesson?->title,
                'status' => $p->status,
                'currentModule' => $p->current_module,
                'completedModules' => $p->completed_modules,
                'lastActivityAt' => optional($p->last_activity_at)->toIso8601String(),
                'completedAt' => optional($p->completed_at)->toIso8601String(),
            ])->values()->all(),
            // Les plus fragiles d'abord : gap, puis reinforce, puis mastered ;
            // à statut égal, la confiance la plus basse en tête. Jamais tronqué.
            'mastery' => $profile['mastery']
                ->sortBy([
                    fn ($a, $b) => (self::STATUS_ORDER[$a->status] ?? 9) <=> (self::STATUS_ORDER[$b->status] ?? 9),
                    fn ($a, $b) => (float) $a->confidence <=> (float) $b->confidence,
                ])
                ->map(fn ($m) => [
                    'code' => $m->learningPoint?->code,
                    'title' => $m->learningPoint?->title,
                    'lessonCode' => $m->learningPoint?->lesson?->code,
                    'lessonTitle' => $m->learningPoint?->lesson?->title,
                    'status' => $m->status,
                    'statusReason' => $m->status_reason,
                    'confidence' => (float) $m->confidence,
                    'attempts' => $m->attempts,
                    'correctCount' => $m->correct_count,
                    'partialCount' => (int) $m->partial_count,
                    'failureCount' => (int) $m->failure_count,
                    'distinctItemsSuccess' => (int) $m->distinct_items_success,
                    'assessmentSuccessCount' => (int) $m->assessment_success_count,
                    'maxDifficultySuccess' => (int) $m->max_difficulty_success,
                    'lastEvidenceAt' => optional($m->last_evidence_at)->toIso8601String(),
                    'freshness' => Freshness::of($m->last_evidence_at),
                ])->values()->all(),
            'timeline' => StudentDossier::timeline($student, 30, $lessonIds),
        ];
    }

    /**
     * Les leçons que les élèves de cette classe voient VRAIMENT : celles de
     * la classe scolaire, publiées, non masquées par l'enseignant.
     *
     * @return int[]
     */
    public function effectiveLessonIds(Classroom $classroom): array
    {
        return $this->lessonIds[$classroom->id] ??= $this->computeEffectiveLessonIds($classroom);
    }

    /** @return int[] */
    private function computeEffectiveLessonIds(Classroom $classroom): array
    {
        $gradeId = Grade::where('code', $classroom->grade)->value('id');
        if ($gradeId === null) {
            return [];
        }

        $hidden = ClassroomLesson::where('classroom_id', $classroom->id)
            ->where('status', ClassroomLesson::STATUS_HIDDEN)
            ->pluck('lesson_id');

        return Lesson::whereHas('chapter', fn ($q) => $q->where('grade_id', $gradeId))
            ->visibleToStudents()
            ->whereNotIn('id', $hidden)
            ->pluck('id')
            ->all();
    }

    /** @return Collection<int, ClassroomMembership> */
    private function members(Classroom $classroom): Collection
    {
        return ClassroomMembership::where('classroom_id', $classroom->id)
            ->active()
            ->with('student:'.ClassroomAccess::IDENTITY_COLUMNS.',grade')
            ->orderBy('joined_at')
            ->get();
    }

    /**
     * Une ligne par élève, calculée en DEUX requêtes groupées (progression,
     * réponses) et non une par élève.
     *
     * @param  Collection<int, ClassroomMembership>  $members
     * @param  int[]  $lessonIds
     * @return Collection<int, array<string, mixed>>
     */
    private function studentRows(Collection $members, array $lessonIds): Collection
    {
        $studentIds = $members->pluck('student_id')->all();
        $total = count($lessonIds);

        $progressByStudent = collect();
        $answersByStudent = collect();
        $lastActivity = $studentIds === [] ? [] : ClassroomFacts::lastActivity($studentIds, $lessonIds);

        if ($studentIds !== [] && $lessonIds !== []) {
            $progressByStudent = StudentLessonProgress::whereIn('user_id', $studentIds)
                ->whereIn('lesson_id', $lessonIds)
                ->get(['user_id', 'lesson_id', 'status', 'completed_modules', 'last_activity_at'])
                ->groupBy('user_id');

            // La MÊME définition du taux de réussite que le dossier et
            // l'administration (OutcomeStats) : réussites / (réussites +
            // partiels + échecs), les issues inertes hors dénominateur.
            $answersByStudent = OutcomeStats::selectInto(
                DB::table('question_attempts')
                    ->join('exercise_attempts', 'exercise_attempts.id', '=', 'question_attempts.exercise_attempt_id')
                    ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
                    ->whereIn('question_attempts.user_id', $studentIds)
                    ->whereIn('practice_sessions.lesson_id', $lessonIds)
                    ->groupBy('question_attempts.user_id')
                    ->select('question_attempts.user_id')
            )
                ->get()
                ->keyBy('user_id');
        }

        return $members->map(function (ClassroomMembership $m) use ($progressByStudent, $answersByStudent, $total, $lastActivity) {
            $student = $m->student;
            $progress = $progressByStudent->get($m->student_id, collect());
            $completed = $progress->where('status', StudentLessonProgress::STATUS_COMPLETED)->count();
            $answers = OutcomeStats::fromRow($answersByStudent->get($m->student_id));
            $answered = $answers['answered'];

            return ClassroomAccess::identity($student, (int) $m->student_id) + [
                'grade' => $student?->grade,
                'joinedAt' => optional($m->joined_at)->toIso8601String(),
                'joinedVia' => $m->joined_via,
                'lastActivityAt' => $lastActivity[$m->student_id] ?? null,
                'lessonsStarted' => $progress->count(),
                'lessonsCompleted' => $completed,
                'modulesCompleted' => $progress->sum(fn ($row) => count($row->completed_modules ?? [])),
                'progressPercent' => $total > 0 ? round($completed / $total * 100) : null,
                'questionsAnswered' => $answered,
                'successRate' => $answers['successRate'],
            ];
        });
    }

    private function assertFeature(?User $teacher, string $key): void
    {
        if ($teacher === null || ! $this->entitlements->allows($teacher, $key)) {
            throw new ClassroomException(ClassroomException::FEATURE_UNAVAILABLE, 'Votre offre ne comprend pas cette fonctionnalité.');
        }
    }
}
