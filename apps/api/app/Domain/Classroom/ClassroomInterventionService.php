<?php

namespace App\Domain\Classroom;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\Insights\LearningTrend;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Support\OutcomeStats;
use App\Models\Classroom;
use App\Models\ClassroomIntervention;
use App\Models\ClassroomMembership;
use App\Models\LearningPointStateTransition;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * INTERVENIR puis MESURER — le geste de l'enseignant et ce qui a suivi.
 *
 * Créer une intervention FIGE l'état canonique de chaque élève visé sur le
 * point concerné (`baseline`). La mesure compare, à la lecture, cette
 * photographie à l'état d'aujourd'hui et compte la preuve arrivée depuis.
 * Elle DÉCRIT (« 4 élèves sur 7 sont passés de ثغرة à تدعيم ; 2 n'ont pas
 * répondu depuis ») ; elle ne conclut jamais que le geste « a marché » :
 * d'autres causes (devoirs, manuel, autre classe) ne peuvent pas être
 * exclues.
 *
 * L'intervention appartient à l'enseignant : sa note est privée. Seules les
 * recommandations (réviser un prérequis, une leçon, un exercice) sont vues
 * de l'élève, comme une suggestion qui ne bloque rien (D8). Le cahier de
 * l'élève n'est jamais touché.
 *
 * Un élève qui quitte la classe sort de la mesure : on ne lit plus rien de
 * lui (ClassroomAccess).
 */
class ClassroomInterventionService
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private ClassroomProgressService $progress,
        private ClassroomLearningPointService $points,
        private ActivityLogger $log,
    ) {}

    /**
     * @param  array{kind: string, studentIds: int[], learningPointCode?: ?string, lessonCode?: ?string,
     *   note?: ?string, studentMessage?: ?string, reviewAfter?: ?string, sourceSignal?: ?string}  $data
     *
     * @throws ClassroomException|\DomainException
     */
    public function create(User $teacher, Classroom $classroom, array $data): ClassroomIntervention
    {
        $this->assertFeature($teacher);
        if (! $classroom->isActive()) {
            throw new ClassroomException(ClassroomException::CLASS_INACTIVE, 'Cette classe n\'est pas active.');
        }

        $kind = $data['kind'];
        $studentIds = ClassroomAccess::activeStudentIds($classroom, $data['studentIds']);

        $point = ! empty($data['learningPointCode']) ? $this->points->scopedPoint($classroom, $data['learningPointCode']) : null;
        if ($point === null && in_array($kind, ClassroomIntervention::LEARNING_POINT_KINDS, true)) {
            throw new ClassroomException(ClassroomException::INVALID, 'Ce geste porte sur un point d\'apprentissage.');
        }

        $lesson = $point?->lesson;
        if (! empty($data['lessonCode'])) {
            $lesson = Lesson::where('code', $data['lessonCode'])->whereIn('id', $this->progress->effectiveLessonIds($classroom))->first();
            if ($lesson === null) {
                throw new ClassroomException(ClassroomException::LESSON_OUT_OF_SCOPE, 'Cette leçon n\'est pas dans le périmètre de la classe.');
            }
        }
        if ($lesson === null && $kind === ClassroomIntervention::KIND_RECOMMEND_LESSON) {
            throw new ClassroomException(ClassroomException::INVALID, 'Recommander une leçon demande une leçon.');
        }

        $visible = in_array($kind, ClassroomIntervention::STUDENT_VISIBLE_KINDS, true);

        return DB::transaction(function () use ($teacher, $classroom, $data, $kind, $studentIds, $point, $lesson, $visible) {
            $intervention = new ClassroomIntervention([
                'kind' => $kind,
                'note' => $data['note'] ?? null,
                // Le message à l'élève n'existe que pour ce que l'élève voit.
                'student_message' => $visible ? ($data['studentMessage'] ?? null) : null,
                'status' => ClassroomIntervention::STATUS_OPEN,
                'opened_at' => Carbon::now(),
                'review_after' => $data['reviewAfter'] ?? null,
                'source_signal' => $data['sourceSignal'] ?? null,
            ]);
            $intervention->classroom_id = $classroom->id;
            $intervention->teacher_id = $teacher->id;
            $intervention->learning_point_id = $point?->id;
            $intervention->lesson_id = $lesson?->id;
            $intervention->baseline = $point === null ? null : $this->baselineOf($studentIds, $point->id);
            $intervention->engine_version = $point === null ? null : (int) config('mastery.engine_version');
            $intervention->save();
            $intervention->students()->attach($studentIds);

            $this->log->log($teacher, ActivityLogger::CLASSROOM_INTERVENTION_CREATED, 'classroom', $classroom->id, null, [
                'intervention_id' => $intervention->id, 'kind' => $kind, 'students' => count($studentIds),
                'learning_point' => $point?->code,
            ]);

            return $intervention;
        });
    }

    /**
     * Clore, rouvrir, compléter la note ou la date de revue. Rien d'autre :
     * les élèves visés, le point et la photographie de départ ne bougent pas.
     *
     * @param  array{status?: string, note?: ?string, reviewAfter?: ?string}  $data
     */
    public function update(User $teacher, ClassroomIntervention $intervention, array $data): ClassroomIntervention
    {
        $before = ['status' => $intervention->status];
        if (array_key_exists('note', $data)) {
            $intervention->note = $data['note'];
        }
        if (array_key_exists('reviewAfter', $data)) {
            $intervention->review_after = $data['reviewAfter'];
        }
        if (isset($data['status']) && $data['status'] !== $intervention->status) {
            $intervention->status = $data['status'];
            $intervention->closed_at = $data['status'] === ClassroomIntervention::STATUS_CLOSED ? Carbon::now() : null;
        }
        $intervention->save();

        $this->log->log($teacher, ActivityLogger::CLASSROOM_INTERVENTION_UPDATED, 'classroom', $intervention->classroom_id, $before, [
            'intervention_id' => $intervention->id, 'status' => $intervention->status,
        ]);

        return $intervention;
    }

    /**
     * L'intervention de CETTE classe, et de cet enseignant ; sinon 404.
     */
    public function findFor(Classroom $classroom, User $teacher, int $interventionId): ClassroomIntervention
    {
        $intervention = ClassroomIntervention::where('id', $interventionId)
            ->where('classroom_id', $classroom->id)
            ->where('teacher_id', $teacher->id)
            ->first();
        if ($intervention === null) {
            abort(404);
        }

        return $intervention;
    }

    /**
     * Les interventions d'une classe, les plus récentes d'abord, chacune avec
     * sa mesure résumée — en un nombre constant de requêtes pour la page.
     *
     * @param  array{status?: ?string, studentId?: ?int, learningPointCode?: ?string, page?: ?int, perPage?: ?int}  $filters
     * @return array{interventions: array, meta: array}
     */
    public function list(Classroom $classroom, User $teacher, array $filters = []): array
    {
        $this->assertFeature($teacher);
        $perPage = min(50, max(1, (int) ($filters['perPage'] ?? 20)));

        $page = ClassroomIntervention::where('classroom_id', $classroom->id)
            ->where('teacher_id', $teacher->id)
            ->when(! empty($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->when(! empty($filters['studentId']), fn ($q) => $q->whereHas('students', fn ($s) => $s->where('users.id', (int) $filters['studentId'])))
            ->when(! empty($filters['learningPointCode']), fn ($q) => $q->whereHas('learningPoint', fn ($lp) => $lp->where('code', $filters['learningPointCode'])))
            ->with(['learningPoint:id,code,title,lesson_id', 'learningPoint.lesson:id,code,title', 'lesson:id,code,title', 'students:'.$this->identityColumns()])
            ->orderByRaw("status = 'open' DESC")
            ->orderByDesc('opened_at')->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', (int) ($filters['page'] ?? 1));

        $outcomes = $this->outcomes($classroom, collect($page->items()), detailed: false);

        return [
            'interventions' => collect($page->items())->map(fn ($i) => $this->present($i, $outcomes[$i->id] ?? null))->all(),
            'meta' => ['total' => $page->total(), 'page' => $page->currentPage(), 'perPage' => $page->perPage(), 'hasMore' => $page->hasMorePages()],
        ];
    }

    /** Une intervention, avec sa mesure détaillée (le chemin de chaque élève). */
    public function show(Classroom $classroom, ClassroomIntervention $intervention): array
    {
        $intervention->load(['learningPoint:id,code,title,lesson_id', 'learningPoint.lesson:id,code,title', 'lesson:id,code,title', 'students:'.$this->identityColumns()]);
        $outcomes = $this->outcomes($classroom, collect([$intervention]), detailed: true);

        return $this->present($intervention, $outcomes[$intervention->id] ?? null);
    }

    /**
     * Les interventions qui visent un élève — pour son aperçu.
     *
     * @return array<int, array<string, mixed>>
     */
    public function forStudent(Classroom $classroom, User $teacher, User $student): array
    {
        $items = ClassroomIntervention::where('classroom_id', $classroom->id)
            ->where('teacher_id', $teacher->id)
            ->whereHas('students', fn ($s) => $s->where('users.id', $student->id))
            ->with(['learningPoint:id,code,title,lesson_id', 'learningPoint.lesson:id,code,title', 'lesson:id,code,title', 'students:'.$this->identityColumns()])
            ->orderByDesc('opened_at')->limit(20)->get();
        $outcomes = $this->outcomes($classroom, $items, detailed: false);

        return $items->map(function ($i) use ($outcomes, $student) {
            $row = $this->present($i, $outcomes[$i->id] ?? null);
            // Dans l'aperçu d'un élève, la mesure est la SIENNE.
            if (isset($row['outcome']['students'])) {
                $row['outcome']['student'] = collect($row['outcome']['students'])->firstWhere('id', $student->id);
            }

            return $row;
        })->all();
    }

    /**
     * Ce que l'ÉLÈVE voit : les recommandations ouvertes de ses enseignants,
     * dans les classes dont il est membre actif. Jamais la note privée.
     *
     * @return array<int, array<string, mixed>>
     */
    public function recommendationsFor(User $student): array
    {
        $classroomIds = ClassroomMembership::where('student_id', $student->id)->active()->pluck('classroom_id');

        return ClassroomIntervention::whereIn('classroom_id', $classroomIds)
            ->where('status', ClassroomIntervention::STATUS_OPEN)
            ->whereIn('kind', ClassroomIntervention::STUDENT_VISIBLE_KINDS)
            ->whereHas('students', fn ($s) => $s->where('users.id', $student->id))
            ->whereHas('classroom', fn ($c) => $c->where('status', Classroom::STATUS_ACTIVE))
            ->with(['classroom:id,name,teacher_id', 'classroom.teacher:id,first_name,last_name', 'learningPoint:id,code,title,lesson_id', 'learningPoint.lesson:id,code,title', 'lesson:id,code,title'])
            ->orderByDesc('opened_at')->limit(20)->get()
            ->map(fn (ClassroomIntervention $i) => [
                'id' => $i->id,
                'kind' => $i->kind,
                'classroomName' => $i->classroom?->name,
                'teacherName' => trim(($i->classroom?->teacher?->first_name ?? '').' '.($i->classroom?->teacher?->last_name ?? '')),
                'learningPoint' => $i->learningPoint ? ['code' => $i->learningPoint->code, 'title' => $i->learningPoint->title] : null,
                'lesson' => ($i->lesson ?? $i->learningPoint?->lesson) ? ['code' => ($i->lesson ?? $i->learningPoint->lesson)->code, 'title' => ($i->lesson ?? $i->learningPoint->lesson)->title] : null,
                'message' => $i->student_message,
                'openedAt' => $i->opened_at?->toIso8601String(),
            ])->all();
    }

    // ── La mesure ─────────────────────────────────────────────────────────

    /**
     * Pour chaque intervention portant sur un point : élève par élève, l'état
     * figé, l'état d'aujourd'hui, la preuve arrivée depuis, et le mouvement.
     *
     * Requêtes : membres actifs (1), états actuels (1), preuve depuis la plus
     * ancienne ouverture (1), et en détail les transitions (1) — quel que
     * soit le nombre d'interventions de la page.
     *
     * @param  Collection<int, ClassroomIntervention>  $interventions
     * @return array<int, array<string, mixed>>
     */
    private function outcomes(Classroom $classroom, Collection $interventions, bool $detailed): array
    {
        $withPoint = $interventions->filter(fn ($i) => $i->learning_point_id !== null);
        if ($withPoint->isEmpty()) {
            return [];
        }

        $active = ClassroomMembership::where('classroom_id', $classroom->id)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->flip();
        $userIds = $withPoint->flatMap(fn ($i) => $i->students->pluck('id'))->unique()->filter(fn ($id) => $active->has((int) $id))->values()->all();
        $pointIds = $withPoint->pluck('learning_point_id')->unique()->values()->all();
        if ($userIds === []) {
            return $withPoint->mapWithKeys(fn ($i) => [$i->id => $this->summary([])])->all();
        }
        $since = $withPoint->min('opened_at');

        $states = StudentLearningPointProgress::whereIn('user_id', $userIds)->whereIn('learning_point_id', $pointIds)->get()
            ->keyBy(fn ($s) => $s->user_id.':'.$s->learning_point_id);

        $outcome = "COALESCE(e.outcome, CASE WHEN e.is_correct = 1 THEN 'correct' ELSE 'incorrect' END)";
        $evidence = DB::table('learning_evidence as e')
            ->join('learning_evidence_learning_point as p', 'p.learning_evidence_id', '=', 'e.id')
            ->whereIn('e.user_id', $userIds)
            ->whereIn('p.learning_point_id', $pointIds)
            ->where('e.submitted_at', '>=', $since)
            ->get(['e.user_id', 'p.learning_point_id', 'e.submitted_at', DB::raw("{$outcome} as outcome")])
            ->groupBy(fn ($r) => $r->user_id.':'.$r->learning_point_id);

        $trails = $detailed ? LearningPointStateTransition::whereIn('user_id', $userIds)->whereIn('learning_point_id', $pointIds)
            ->where('occurred_at', '>=', $since)->orderBy('occurred_at')->orderBy('id')->get()
            ->groupBy(fn ($t) => $t->user_id.':'.$t->learning_point_id) : collect();

        $out = [];
        foreach ($withPoint as $i) {
            $rows = [];
            foreach ($i->students as $student) {
                if (! $active->has((int) $student->id)) {
                    continue;
                }
                $key = $student->id.':'.$i->learning_point_id;
                $before = $i->baseline['students'][(string) $student->id] ?? null;
                $current = $states->get($key);
                $after = $current ? self::stateRow($current) : self::unassessed();

                $newEvidence = collect($evidence->get($key, []))->filter(fn ($e) => Carbon::parse($e->submitted_at, 'UTC')->greaterThanOrEqualTo($i->opened_at));
                $counts = OutcomeStats::fromCounts($newEvidence->countBy('outcome')->all());
                $answered = $counts['successes'] + $counts['partials'] + $counts['failures'];

                $row = ClassroomAccess::identity($student) + [
                    'before' => $before,
                    'now' => $after,
                    'since' => [
                        'answered' => $answered,
                        'successes' => $counts['successes'],
                        'partials' => $counts['partials'],
                        'failures' => $counts['failures'],
                        'successRate' => $counts['successRate'],
                        'lastAt' => $newEvidence->isEmpty() ? null : Carbon::parse($newEvidence->max('submitted_at'), 'UTC')->toIso8601String(),
                    ],
                    'direction' => LearningTrend::direction($before['status'] ?? null, $after['status']),
                    // Sans preuve nouvelle, un mouvement éventuel vient d'ailleurs
                    // (recalcul) : on le dit, on ne l'interprète pas.
                    'observed' => $answered > 0,
                ];
                if ($detailed) {
                    $row['trail'] = collect($trails->get($key, []))
                        ->filter(fn ($t) => $t->occurred_at->greaterThanOrEqualTo($i->opened_at))
                        ->map(fn ($t) => ['at' => $t->occurred_at->toIso8601String(), 'from' => $t->status_before ?? MasteryState::STATUS_UNASSESSED, 'to' => $t->status_after, 'confidence' => $t->confidence_after, 'origin' => $t->origin])
                        ->values()->all();
                }
                $rows[] = $row;
            }
            $out[$i->id] = $this->summary($rows);
        }

        return $out;
    }

    /** @param  array<int, array<string, mixed>>  $rows */
    private function summary(array $rows): array
    {
        $observed = array_filter($rows, fn ($r) => $r['observed']);
        $count = fn (string $direction) => count(array_filter($observed, fn ($r) => $r['direction'] === $direction));

        return [
            'students' => $rows,
            'summary' => [
                'students' => count($rows),
                'withNewEvidence' => count($observed),
                'noNewEvidence' => count($rows) - count($observed),
                'improved' => $count(LearningTrend::IMPROVED),
                'declined' => $count(LearningTrend::DECLINED),
                'unchanged' => $count(LearningTrend::UNCHANGED),
                'firstAssessed' => $count(LearningTrend::FIRST_ASSESSED),
            ],
        ];
    }

    /**
     * L'état canonique de chaque élève sur le point, au moment du geste.
     *
     * @param  int[]  $studentIds
     * @return array{takenAt: string, students: array<string, array<string, mixed>>}
     */
    private function baselineOf(array $studentIds, int $pointId): array
    {
        $states = StudentLearningPointProgress::whereIn('user_id', $studentIds)->where('learning_point_id', $pointId)->get()->keyBy('user_id');
        $students = [];
        foreach ($studentIds as $id) {
            $s = $states->get($id);
            $students[(string) $id] = $s ? self::stateRow($s) : self::unassessed();
        }

        return ['takenAt' => Carbon::now()->toIso8601String(), 'students' => $students];
    }

    /** @return array<string, mixed> */
    private static function stateRow(StudentLearningPointProgress $s): array
    {
        return [
            'status' => $s->status,
            'reason' => $s->status_reason,
            'confidence' => (float) $s->confidence,
            'attempts' => (int) $s->attempts,
            'distinctItemsSuccess' => (int) $s->distinct_items_success,
            'lastEvidenceAt' => optional($s->last_evidence_at)->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private static function unassessed(): array
    {
        return ['status' => MasteryState::STATUS_UNASSESSED, 'reason' => null, 'confidence' => null, 'attempts' => 0, 'distinctItemsSuccess' => 0, 'lastEvidenceAt' => null];
    }

    /** @return array<string, mixed> */
    private function present(ClassroomIntervention $i, ?array $outcome): array
    {
        $lesson = $i->lesson ?? $i->learningPoint?->lesson;

        return [
            'id' => $i->id,
            'kind' => $i->kind,
            'status' => $i->status,
            'note' => $i->note,
            'studentMessage' => $i->student_message,
            'studentVisible' => $i->isStudentVisible(),
            'sourceSignal' => $i->source_signal,
            'openedAt' => $i->opened_at?->toIso8601String(),
            'closedAt' => $i->closed_at?->toIso8601String(),
            'reviewAfter' => $i->review_after?->toDateString(),
            'learningPoint' => $i->learningPoint ? ['code' => $i->learningPoint->code, 'title' => $i->learningPoint->title] : null,
            'lesson' => $lesson ? ['code' => $lesson->code, 'title' => $lesson->title] : null,
            'students' => $i->students->map(fn ($s) => ClassroomAccess::identity($s))->values()->all(),
            'outcome' => $outcome,
        ];
    }

    /** Les colonnes d'identité, qualifiées pour la relation many-to-many. */
    private function identityColumns(): string
    {
        return 'users.id,users.first_name,users.last_name';
    }

    private function assertFeature(User $teacher): void
    {
        if (! $this->entitlements->allows($teacher, EntitlementKeys::PROGRESS_STUDENT)) {
            throw new ClassroomException(ClassroomException::FEATURE_UNAVAILABLE, 'Votre offre ne comprend pas cette fonctionnalité.');
        }
    }
}
