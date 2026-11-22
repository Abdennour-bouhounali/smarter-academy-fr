<?php

namespace App\Domain\Classroom;

use App\Domain\Classroom\Insights\InsightWindow;
use App\Domain\Classroom\Insights\LearningTrend;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Practice\NotebookPresenter;
use App\Domain\Practice\NotebookService;
use App\Domain\Practice\Support\AnswerEvaluator;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Explain\MasteryExplainer;
use App\Domain\Progress\Support\Freshness;
use App\Models\AssessmentItem;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\LearningPoint;
use App\Models\LearningPointStateTransition;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Classe × learning point — la carte d'apprentissage de l'enseignant.
 *
 * Une AGRÉGATION de l'état canonique (student_learning_point_progress),
 * jamais un stockage, cadrée sur les leçons EFFECTIVES de la classe
 * (publiées, non masquées) et sur ses membres ACTIFS :
 *
 *   map()              tous les points du périmètre (ou d'une leçon), avec
 *                      la DISTRIBUTION des statuts — un GROUP BY, jamais
 *                      une moyenne : une classe « à 70 % » peut cacher cinq
 *                      élèves en ثغرة, la distribution les montre
 *   learningPointDetail()  un point, élève par élève (les plus fragiles
 *                      d'abord), sa trajectoire semaine par semaine, les
 *                      items où la classe échoue, ses prérequis
 *   studentEvidence()  un point pour UN élève : l'explication du moteur,
 *                      l'histoire de son état, ses notes de cahier sur ce
 *                      point (portée enseignant, non archivées)
 *
 * Tous les statuts sont ceux du moteur. Rien ici ne recalcule une maîtrise.
 */
class ClassroomLearningPointService
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private ClassroomProgressService $progress,
        private MasteryExplainer $explainer,
        private NotebookService $notebook,
    ) {}

    /**
     * La carte : par learning point, les effectifs des quatre statuts, les
     * raisons, les « maîtrisé mais ancien », et la portée d'une difficulté.
     *
     * Avec `$lessonCode` : une leçon (la forme historique, `learningPoints`
     * à plat). Sans : tout le périmètre, groupé par leçon (`lessons`).
     *
     * @return array<string, mixed>
     */
    public function map(Classroom $classroom, ?string $lessonCode = null): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_CLASS);
        $lessonIds = $this->progress->effectiveLessonIds($classroom);

        if ($lessonCode !== null) {
            $lesson = $this->effectiveLesson($lessonIds, $lessonCode);
            $lessonIds = [$lesson->id];
        }

        $memberIds = $this->memberIds($classroom);
        $students = count($memberIds);
        $rows = $this->distribution($lessonIds, $memberIds);

        $lessons = [];
        foreach ($rows as $r) {
            $key = $r->lesson_code;
            $lessons[$key] ??= ['code' => $r->lesson_code, 'title' => $r->lesson_title, 'learningPoints' => []];
            $assessed = (int) $r->assessed;
            $lessons[$key]['learningPoints'][] = [
                'code' => $r->code,
                'title' => $r->title,
                'order' => (int) $r->order,
                'counts' => [
                    'mastered' => (int) $r->mastered,
                    'reinforce' => (int) $r->reinforce,
                    'gap' => (int) $r->gap,
                    'unassessed' => $students - $assessed,
                ],
                'reasons' => [
                    'insufficientEvidence' => (int) $r->insufficient_evidence,
                    'needsAssessment' => (int) $r->needs_assessment,
                ],
                'staleMastered' => (int) $r->stale_mastered,
                'difficultyScope' => LearningTrend::difficultyScope((int) $r->gap, $assessed),
            ];
        }

        if ($lessonCode !== null) {
            $only = array_values($lessons)[0] ?? ['code' => $lesson->code, 'title' => $lesson->title, 'learningPoints' => []];

            return [
                'lesson' => ['code' => $only['code'], 'title' => $only['title']],
                'students' => $students,
                'learningPoints' => $only['learningPoints'],
            ];
        }

        return ['students' => $students, 'lessons' => array_values($lessons)];
    }

    /**
     * LE SUIVI D'UNE LEÇON, élève par élève (« متابعة القسم », CLASS_SESSION.md §2bis) : pour chaque membre ACTIF de la
     * classe, son état sur chaque كفاءة de la leçon et ce qu'il a fait de chaque exercice — questions traitées, justes
     * (dernier essai), justes du premier coup. Lecture seule ; des faits, jamais une moyenne ni un classement.
     * Même offre que le détail par élève (PROGRESS_STUDENT) ; la leçon doit être dans le périmètre de la classe.
     *
     * @return array{lesson: array, learningPoints: list<array>, students: list<array>}
     */
    public function lessonTracking(Classroom $classroom, string $lessonCode): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_STUDENT);
        $lesson = $this->effectiveLesson($this->progress->effectiveLessonIds($classroom), $lessonCode);

        $members = ClassroomMembership::where('classroom_id', $classroom->id)->active()
            ->with('student:'.ClassroomAccess::IDENTITY_COLUMNS)->get();
        $ids = $members->pluck('student_id')->map(fn ($id) => (int) $id)->all();
        $points = LearningPoint::where('lesson_id', $lesson->id)->whereNull('retired_at')->orderBy('order')->get(['id', 'code', 'title', 'order']);
        $codes = $points->pluck('code', 'id');
        $states = StudentLearningPointProgress::whereIn('learning_point_id', $points->pluck('id'))->whereIn('user_id', $ids)
            ->get(['user_id', 'learning_point_id', 'status'])->groupBy('user_id');
        $attempts = DB::table('question_attempts as qa')
            ->join('exercise_attempts as ea', 'ea.id', '=', 'qa.exercise_attempt_id')
            ->join('practice_sessions as ps', 'ps.id', '=', 'ea.practice_session_id')
            ->where('ps.lesson_id', $lesson->id)->whereIn('qa.user_id', $ids)->whereNotNull('qa.submitted_at')
            ->get(['qa.user_id', 'ea.exercise_id', 'qa.question_id', 'qa.outcome', 'qa.attempt_number', 'qa.submitted_at'])
            ->groupBy('user_id');
        $right = fn ($a) => $a !== null && $a->outcome && AnswerEvaluator::isSuccessOutcome($a->outcome);

        $students = $members->map(function (ClassroomMembership $m) use ($states, $codes, $attempts, $right) {
            $mine = $attempts->get($m->student_id, collect());
            $exercises = $mine->groupBy('exercise_id')->map(function ($rows, $exerciseId) use ($right) {
                $byQuestion = $rows->sortBy('attempt_number')->groupBy('question_id');

                return [
                    'exerciseId' => (string) $exerciseId,
                    'answered' => $byQuestion->count(),
                    'correct' => $byQuestion->filter(fn ($q) => $right($q->last()))->count(),
                    'firstTry' => $byQuestion->filter(fn ($q) => $right($q->first()))->count(),
                    'lastAnsweredAt' => (string) $rows->max('submitted_at'),
                ];
            })->values()->all();

            return ClassroomAccess::identity($m->student, (int) $m->student_id) + [
                'points' => (object) $states->get($m->student_id, collect())
                    ->mapWithKeys(fn ($s) => [(string) $codes[$s->learning_point_id] => $s->status])->all(),
                'exercises' => $exercises,
                'lastActivityAt' => $mine->isEmpty() ? null : (string) $mine->max('submitted_at'),
            ];
        })->values()->all();

        return [
            'lesson' => ['code' => $lesson->code, 'title' => $lesson->title],
            'learningPoints' => $points->map(fn ($p) => ['code' => $p->code, 'title' => $p->title, 'order' => (int) $p->order])->values()->all(),
            'students' => $students,
        ];
    }

    /**
     * Un learning point, élève par élève — les plus fragiles d'abord — avec
     * sa trajectoire, les items qui résistent à la classe et ses prérequis.
     *
     * @return array<string, mixed>
     */
    public function learningPointDetail(Classroom $classroom, string $learningPointCode): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_STUDENT);
        $point = $this->scopedPoint($classroom, $learningPointCode);

        $members = ClassroomMembership::where('classroom_id', $classroom->id)->active()
            ->with('student:'.ClassroomAccess::IDENTITY_COLUMNS)
            ->get();
        $memberIds = $members->pluck('student_id')->map(fn ($id) => (int) $id)->all();
        $states = StudentLearningPointProgress::where('learning_point_id', $point->id)
            ->whereIn('user_id', $memberIds)
            ->get()->keyBy('user_id');
        $transitions = LearningPointStateTransition::where('learning_point_id', $point->id)
            ->whereIn('user_id', $memberIds)
            ->orderBy('occurred_at')->orderBy('id')
            ->get(['user_id', 'status_before', 'status_after', 'origin', 'occurred_at'])
            ->groupBy('user_id');
        $window = InsightWindow::recent();

        $order = [MasteryState::STATUS_GAP => 0, MasteryState::STATUS_REINFORCE => 1, MasteryState::STATUS_UNASSESSED => 2, MasteryState::STATUS_MASTERED => 3];

        $students = $members->map(function (ClassroomMembership $m) use ($states, $transitions, $window) {
            $s = $states->get($m->student_id);
            $status = $s?->status ?? MasteryState::STATUS_UNASSESSED;
            $mine = $transitions->get($m->student_id, collect());
            $inWindow = $mine->filter(fn ($t) => $t->occurred_at->greaterThanOrEqualTo($window->from));
            $recalculated = $inWindow->contains(fn ($t) => $t->origin === LearningPointStateTransition::ORIGIN_REPLAY);
            $startStatus = $inWindow->isEmpty() ? $status : ($inWindow->first()->status_before ?? MasteryState::STATUS_UNASSESSED);

            return ClassroomAccess::identity($m->student, (int) $m->student_id) + [
                'status' => $status,
                'statusReason' => $s?->status_reason,
                'confidence' => $s ? (float) $s->confidence : null,
                'attempts' => (int) ($s?->attempts ?? 0),
                'failureCount' => (int) ($s?->failure_count ?? 0),
                'distinctItemsSuccess' => (int) ($s?->distinct_items_success ?? 0),
                'assessmentSuccessCount' => (int) ($s?->assessment_success_count ?? 0),
                'maxDifficultySuccess' => (int) ($s?->max_difficulty_success ?? 0),
                'lastEvidenceAt' => optional($s?->last_evidence_at)->toIso8601String(),
                'freshness' => $s ? Freshness::of($s->last_evidence_at) : Freshness::STALE,
                // Le mouvement de la fenêtre : de l'état au début à l'état actuel.
                'recentDirection' => $recalculated ? null : LearningTrend::direction($startStatus, $status),
            ];
        })->sortBy([
            fn ($a, $b) => ($order[$a['status']] ?? 9) <=> ($order[$b['status']] ?? 9),
            fn ($a, $b) => ($a['confidence'] ?? 1) <=> ($b['confidence'] ?? 1),
        ])->values()->all();

        $gap = count(array_filter($students, fn ($s) => $s['status'] === MasteryState::STATUS_GAP));
        $assessed = count(array_filter($students, fn ($s) => $s['status'] !== MasteryState::STATUS_UNASSESSED));

        return [
            'learningPoint' => ['code' => $point->code, 'title' => $point->title],
            'lesson' => ['code' => $point->lesson->code, 'title' => $point->lesson->title],
            'difficultyScope' => LearningTrend::difficultyScope($gap, $assessed),
            'window' => $window->toArray(),
            'students' => $students,
            'trajectory' => $this->trajectory($memberIds, $states->keys()->map(fn ($id) => (int) $id)->all(), $transitions),
            'items' => $this->items($point, $memberIds),
            'prerequisites' => $this->prerequisites($point, $memberIds),
        ];
    }

    /**
     * Un point pour UN élève (déjà légitimé par ClassroomAccess) : ce que le
     * moteur en dit (le MÊME texte que l'élève voit), l'histoire de son état,
     * et ses notes de cahier sur ce point — la preuve écrite par l'élève,
     * lue sans rien y ajouter.
     *
     * @return array<string, mixed>
     */
    public function studentEvidence(Classroom $classroom, User $student, string $learningPointCode): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_STUDENT);
        $point = $this->scopedPoint($classroom, $learningPointCode);
        $lessonIds = $this->progress->effectiveLessonIds($classroom);

        $history = LearningPointStateTransition::where('user_id', $student->id)
            ->where('learning_point_id', $point->id)
            ->orderByDesc('occurred_at')->orderByDesc('id')
            ->limit(60)
            ->get()
            ->reverse()->values()
            ->map(fn (LearningPointStateTransition $t) => [
                'at' => $t->occurred_at->toIso8601String(),
                'from' => $t->status_before ?? MasteryState::STATUS_UNASSESSED,
                'to' => $t->status_after,
                'reason' => $t->reason_after,
                'confidenceBefore' => $t->confidence_before,
                'confidence' => $t->confidence_after,
                'direction' => LearningTrend::direction($t->status_before, $t->status_after),
                'origin' => $t->origin,
            ])->all();

        $notes = $this->notebook->searchForReader($student, $lessonIds, [
            'learningPointCode' => $point->code, 'sort' => 'newest', 'perPage' => 10,
        ]);
        $modules = $this->notebook->modulesFor($notes['notes']);

        return [
            'explanation' => $this->explainer->explain($student->id, $point),
            'history' => $history,
            'notebook' => [
                'total' => $notes['total'],
                'notes' => $notes['notes']->map(fn ($n) => NotebookPresenter::note($n, $modules))->all(),
            ],
        ];
    }

    /**
     * Le point, s'il appartient à une leçon effective de la classe ; sinon
     * refus (422, comme une leçon hors périmètre).
     */
    public function scopedPoint(Classroom $classroom, string $learningPointCode): LearningPoint
    {
        $point = LearningPoint::with('lesson:id,code,title')->where('code', $learningPointCode)->whereNull('retired_at')->first();
        if ($point === null || ! in_array($point->lesson_id, $this->progress->effectiveLessonIds($classroom), true)) {
            throw new DomainException('Ce point d\'apprentissage n\'est pas dans le périmètre de la classe.');
        }

        return $point;
    }

    // ── Lectures ──────────────────────────────────────────────────────────

    /**
     * UNE requête : les points des leçons données, leurs effectifs par statut
     * parmi les membres actifs.
     *
     * @param  int[]  $lessonIds
     * @param  int[]  $memberIds
     */
    private function distribution(array $lessonIds, array $memberIds)
    {
        if ($lessonIds === []) {
            return collect();
        }

        return DB::table('learning_points as lp')
            ->join('lessons as l', 'l.id', '=', 'lp.lesson_id')
            ->leftJoin('student_learning_point_progress as s', function ($join) use ($memberIds) {
                $join->on('s.learning_point_id', '=', 'lp.id')->whereIn('s.user_id', $memberIds === [] ? [0] : $memberIds);
            })
            ->whereIn('lp.lesson_id', $lessonIds)
            ->whereNull('lp.retired_at')
            ->groupBy('lp.id', 'lp.code', 'lp.title', 'lp.order', 'l.id', 'l.code', 'l.title', 'l.order')
            ->orderBy('l.order')->orderBy('l.id')->orderBy('lp.order')
            ->select('lp.id', 'lp.code', 'lp.title', 'lp.order', 'l.code as lesson_code', 'l.title as lesson_title')
            ->selectRaw('SUM(CASE WHEN s.status = ? THEN 1 ELSE 0 END) as mastered', [MasteryState::STATUS_MASTERED])
            ->selectRaw('SUM(CASE WHEN s.status = ? THEN 1 ELSE 0 END) as reinforce', [MasteryState::STATUS_REINFORCE])
            ->selectRaw('SUM(CASE WHEN s.status = ? THEN 1 ELSE 0 END) as gap', [MasteryState::STATUS_GAP])
            ->selectRaw('SUM(CASE WHEN s.status = ? AND s.status_reason = ? THEN 1 ELSE 0 END) as insufficient_evidence', [MasteryState::STATUS_REINFORCE, MasteryState::REASON_INSUFFICIENT_EVIDENCE])
            ->selectRaw('SUM(CASE WHEN s.status = ? AND s.status_reason = ? THEN 1 ELSE 0 END) as needs_assessment', [MasteryState::STATUS_REINFORCE, MasteryState::REASON_NEEDS_ASSESSMENT])
            ->selectRaw('SUM(CASE WHEN s.status = ? AND COALESCE(s.last_success_at, s.last_evidence_at) < ? THEN 1 ELSE 0 END) as stale_mastered', [MasteryState::STATUS_MASTERED, Freshness::staleCutoff()])
            ->selectRaw('SUM(CASE WHEN s.status IS NOT NULL AND s.status <> ? THEN 1 ELSE 0 END) as assessed', [MasteryState::STATUS_UNASSESSED])
            ->get();
    }

    /**
     * La classe sur ce point, semaine après semaine : combien d'élèves dans
     * chaque statut à la fin de chaque semaine (Africa/Algiers).
     *
     * L'état à une date est la dernière transition qui la précède. Un élève
     * qui a un état mais dont l'histoire n'a pas encore été enregistrée (preuve
     * antérieure à l'histoire, non reconstruite) est compté « inconnu » plutôt
     * que deviné.
     *
     * @param  int[]  $memberIds
     * @param  int[]  $withState  les membres qui ont une ligne d'état
     * @return array<int, array<string, mixed>>
     */
    private function trajectory(array $memberIds, array $withState, $transitionsByUser): array
    {
        $weeks = [];
        foreach (InsightWindow::weekEnds((int) config('teacher_insights.trajectory_weeks', 8)) as $end) {
            $counts = [MasteryState::STATUS_MASTERED => 0, MasteryState::STATUS_REINFORCE => 0, MasteryState::STATUS_GAP => 0, MasteryState::STATUS_UNASSESSED => 0, 'unknown' => 0];
            foreach ($memberIds as $id) {
                $counts[$this->statusAt($transitionsByUser->get($id), in_array($id, $withState, true), $end)]++;
            }
            $weeks[] = ['until' => $end->toIso8601String(), 'counts' => $counts];
        }

        return $weeks;
    }

    private function statusAt($transitions, bool $hasState, Carbon $at): string
    {
        if ($transitions === null || $transitions->isEmpty()) {
            return $hasState ? 'unknown' : MasteryState::STATUS_UNASSESSED;
        }

        $last = null;
        foreach ($transitions as $t) {
            if ($t->occurred_at->greaterThan($at)) {
                break;
            }
            $last = $t;
        }
        if ($last !== null) {
            return $last->status_after;
        }

        // Avant la première ligne d'histoire : « non évalué » si elle part de
        // rien, sinon l'état d'alors n'est pas connu.
        return $transitions->first()->status_before === null ? MasteryState::STATUS_UNASSESSED : 'unknown';
    }

    /**
     * Les items (exercices, questions de test final) de ce point sur
     * lesquels les membres ont répondu — ceux qui résistent le plus d'abord.
     * La preuve derrière « la classe bute sur ce point ».
     *
     * @param  int[]  $memberIds
     * @return array<int, array<string, mixed>>
     */
    private function items(LearningPoint $point, array $memberIds): array
    {
        if ($memberIds === []) {
            return [];
        }

        $outcome = "COALESCE(e.outcome, CASE WHEN e.is_correct = 1 THEN 'correct' ELSE 'incorrect' END)";
        $rows = DB::table('learning_evidence as e')
            ->join('learning_evidence_learning_point as p', 'p.learning_evidence_id', '=', 'e.id')
            ->where('p.learning_point_id', $point->id)
            ->whereIn('e.user_id', $memberIds)
            ->whereNotNull('e.item_key')
            ->groupBy('e.item_key')
            ->select('e.item_key')
            ->selectRaw("SUM(CASE WHEN {$outcome} IN ('correct', 'equivalent_correct', 'partially_correct', 'incorrect') THEN 1 ELSE 0 END) as answered")
            ->selectRaw("SUM(CASE WHEN {$outcome} = 'incorrect' THEN 1 ELSE 0 END) as failures")
            ->selectRaw('COUNT(DISTINCT e.user_id) as students')
            ->selectRaw("COUNT(DISTINCT CASE WHEN {$outcome} = 'incorrect' THEN e.user_id END) as students_failing")
            ->selectRaw('MAX(e.submitted_at) as last_at')
            ->orderByDesc('failures')
            ->limit(8)
            ->get();

        $items = AssessmentItem::whereIn('item_key', $rows->pluck('item_key'))->get()->keyBy('item_key');

        return $rows->map(function ($r) use ($items) {
            $item = $items->get($r->item_key);

            return [
                'itemKey' => $r->item_key,
                'title' => $item?->title,
                'source' => $item?->source_kind === 'practice' ? 'practice' : 'final_test',
                'exerciseCode' => $item?->exercise_code,
                'difficulty' => $item?->difficulty,
                'answered' => (int) $r->answered,
                'failures' => (int) $r->failures,
                'students' => (int) $r->students,
                'studentsFailing' => (int) $r->students_failing,
                'lastAt' => $r->last_at ? Carbon::parse($r->last_at, 'UTC')->toIso8601String() : null,
            ];
        })->filter(fn ($i) => $i['answered'] > 0)->values()->all();
    }

    /**
     * Les prérequis du point dans le périmètre, et combien de membres y sont
     * en « ثغرة » : là où une difficulté peut prendre racine.
     *
     * @param  int[]  $memberIds
     * @return array<int, array<string, mixed>>
     */
    private function prerequisites(LearningPoint $point, array $memberIds): array
    {
        $rows = DB::table('learning_point_prerequisites as pr')
            ->join('learning_points as lp', 'lp.id', '=', 'pr.prerequisite_learning_point_id')
            ->join('lessons as l', 'l.id', '=', 'lp.lesson_id')
            ->where('pr.learning_point_id', $point->id)
            ->whereNull('lp.retired_at')
            // Un prérequis d'une leçon NON publiée (1AM–3AM `coming_soon`, importée
            // `draft` — phase 2, 2026-10-14) n'existe pas encore pour la classe.
            ->where('l.publication_status', Lesson::PUB_PUBLISHED)
            ->get(['lp.id', 'lp.code', 'lp.title', 'l.code as lesson_code', 'l.title as lesson_title']);
        if ($rows->isEmpty()) {
            return [];
        }

        $gaps = $memberIds === [] ? collect() : DB::table('student_learning_point_progress')
            ->whereIn('learning_point_id', $rows->pluck('id'))
            ->whereIn('user_id', $memberIds)
            ->where('status', MasteryState::STATUS_GAP)
            ->groupBy('learning_point_id')
            ->selectRaw('learning_point_id, COUNT(*) as n')
            ->pluck('n', 'learning_point_id');

        return $rows->map(fn ($r) => [
            'code' => $r->code,
            'title' => $r->title,
            'lessonCode' => $r->lesson_code,
            'lessonTitle' => $r->lesson_title,
            'studentsInGap' => (int) ($gaps[$r->id] ?? 0),
        ])->values()->all();
    }

    /** La leçon, si elle est EFFECTIVE pour la classe ; sinon refus. */
    private function effectiveLesson(array $lessonIds, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->whereIn('id', $lessonIds)->first();
        if ($lesson === null) {
            throw new DomainException('Cette leçon n\'est pas dans le périmètre de la classe.');
        }

        return $lesson;
    }

    /** @return int[] */
    private function memberIds(Classroom $classroom): array
    {
        return ClassroomMembership::where('classroom_id', $classroom->id)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->all();
    }

    private function assertFeature(?User $teacher, string $key): void
    {
        if ($teacher === null || ! $this->entitlements->allows($teacher, $key)) {
            throw new ClassroomException(ClassroomException::FEATURE_UNAVAILABLE, 'Votre offre ne comprend pas cette fonctionnalité.');
        }
    }
}
