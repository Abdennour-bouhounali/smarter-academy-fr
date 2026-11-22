<?php

namespace App\Domain\Classroom\Insights;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Support\OutcomeStats;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\LearningPointStateTransition;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Les FAITS bruts d'une classe, chargés une fois, en un nombre CONSTANT de
 * requêtes groupées (≈ 8), quel que soit le nombre d'élèves ou de preuves.
 *
 * C'est la seule porte de l'espace enseignant vers les tables
 * d'apprentissage pour ce qui est « intelligence » : signaux, changements
 * récents, aperçu d'un élève. Au-dessus, tout est calcul PUR sur ces
 * tableaux (AttentionSignals, RecentChanges, StudentSnapshot) — testable
 * sans base, et identique partout.
 *
 *   faits bruts        ce fichier : états canoniques, preuve de la fenêtre,
 *                      transitions de la fenêtre, dernière activité
 *   indicateurs        LearningTrend et les calculs purs
 *   interprétation     AttentionSignals (le « pourquoi » d'un signal)
 *
 * Périmètre : les membres ACTIFS de la classe × les learning points non
 * retirés des leçons EFFECTIVES. Rien d'autre n'est lu.
 */
final class ClassroomFacts
{
    /**
     * @param  array<int, array{id: int, firstName: ?string, lastName: ?string}>  $students
     * @param  int[]  $lessonIds
     * @param  array<int, array<string, mixed>>  $points  par id de learning point
     * @param  array<int, array<int, array<string, mixed>>>  $states  [élève][point]
     * @param  array<int, array<int, array<string, mixed>>>  $recentEvidence  [élève][point]
     * @param  array<int, array<int, array<string, mixed>>>  $recentTransitions  [élève][point]
     * @param  array<int, ?string>  $lastActivity  [élève] → ISO, dans le périmètre
     * @param  array<int, int[]>  $prerequisites  [point] → points prérequis (dans le périmètre)
     */
    public function __construct(
        public readonly InsightWindow $window,
        public readonly array $students,
        public readonly array $lessonIds,
        public readonly array $points,
        public readonly array $states,
        public readonly array $recentEvidence,
        public readonly array $recentTransitions,
        public readonly array $lastActivity,
        public readonly array $prerequisites,
    ) {}

    /**
     * @param  int[]  $lessonIds  les leçons effectives de la classe
     * @param  int[]|null  $onlyStudentIds  restreindre à ces élèves (l'aperçu d'un élève)
     */
    public static function load(Classroom $classroom, array $lessonIds, ?array $onlyStudentIds = null, ?InsightWindow $window = null): self
    {
        $window ??= InsightWindow::recent();

        $members = ClassroomMembership::where('classroom_id', $classroom->id)
            ->active()
            ->when($onlyStudentIds !== null, fn ($q) => $q->whereIn('student_id', $onlyStudentIds))
            ->with('student:'.ClassroomAccess::IDENTITY_COLUMNS)
            ->orderBy('joined_at')
            ->get();

        $students = [];
        foreach ($members as $m) {
            $students[(int) $m->student_id] = ClassroomAccess::identity($m->student, (int) $m->student_id);
        }
        $studentIds = array_keys($students);

        $points = self::points($lessonIds);
        $pointIds = array_keys($points);

        if ($studentIds === [] || $pointIds === []) {
            return new self($window, $students, $lessonIds, $points, [], [], [], array_fill_keys($studentIds, null), self::prerequisites($pointIds));
        }

        return new self(
            $window,
            $students,
            $lessonIds,
            $points,
            self::states($studentIds, $pointIds),
            self::recentEvidence($studentIds, $lessonIds, $window),
            self::recentTransitions($studentIds, $pointIds, $window),
            self::lastActivity($studentIds, $lessonIds),
            self::prerequisites($pointIds),
        );
    }

    /** L'état canonique d'un élève sur un point, ou « non évalué ». */
    public function state(int $studentId, int $pointId): array
    {
        return $this->states[$studentId][$pointId] ?? [
            'status' => MasteryState::STATUS_UNASSESSED,
            'reason' => null,
            'confidence' => null,
            'attempts' => 0,
            'failureCount' => 0,
            'distinctItemsSuccess' => 0,
            'lastEvidenceAt' => null,
            'lastSuccessAt' => null,
        ];
    }

    /**
     * Le statut au DÉBUT de la fenêtre : le `status_before` de la première
     * transition de la fenêtre ; sans transition, l'état n'a pas bougé et
     * c'est le statut courant.
     */
    public function statusAtWindowStart(int $studentId, int $pointId): ?string
    {
        $t = $this->recentTransitions[$studentId][$pointId] ?? null;
        if ($t === null) {
            return $this->state($studentId, $pointId)['status'];
        }

        return $t['startStatus'] ?? MasteryState::STATUS_UNASSESSED;
    }

    /** @return array<string, mixed> le point, avec sa leçon */
    public function point(int $pointId): array
    {
        return $this->points[$pointId];
    }

    // ── Requêtes ──────────────────────────────────────────────────────────

    /** @return array<int, array<string, mixed>> */
    private static function points(array $lessonIds): array
    {
        if ($lessonIds === []) {
            return [];
        }

        $rows = DB::table('learning_points as lp')
            ->join('lessons as l', 'l.id', '=', 'lp.lesson_id')
            ->whereIn('lp.lesson_id', $lessonIds)
            ->whereNull('lp.retired_at')
            ->orderBy('l.order')->orderBy('l.id')->orderBy('lp.order')
            ->get(['lp.id', 'lp.code', 'lp.title', 'lp.order', 'l.id as lesson_id', 'l.code as lesson_code', 'l.title as lesson_title']);

        $points = [];
        foreach ($rows as $r) {
            $points[(int) $r->id] = [
                'id' => (int) $r->id,
                'code' => $r->code,
                'title' => $r->title,
                'order' => (int) $r->order,
                'lessonId' => (int) $r->lesson_id,
                'lessonCode' => $r->lesson_code,
                'lessonTitle' => $r->lesson_title,
            ];
        }

        return $points;
    }

    private static function states(array $studentIds, array $pointIds): array
    {
        $states = [];
        foreach (DB::table('student_learning_point_progress')
            ->whereIn('user_id', $studentIds)
            ->whereIn('learning_point_id', $pointIds)
            ->get(['user_id', 'learning_point_id', 'status', 'status_reason', 'confidence', 'attempts', 'failure_count',
                'distinct_items_success', 'last_evidence_at', 'last_success_at']) as $r) {
            $states[(int) $r->user_id][(int) $r->learning_point_id] = [
                'status' => $r->status,
                'reason' => $r->status_reason,
                'confidence' => $r->confidence !== null ? (float) $r->confidence : null,
                'attempts' => (int) $r->attempts,
                'failureCount' => (int) $r->failure_count,
                'distinctItemsSuccess' => (int) $r->distinct_items_success,
                'lastEvidenceAt' => self::iso($r->last_evidence_at),
                'lastSuccessAt' => self::iso($r->last_success_at),
            ];
        }

        return $states;
    }

    /**
     * La preuve de la fenêtre, par (élève, point) : combien de réponses, de
     * réussites, de partiels, d'échecs — LA définition d'OutcomeStats,
     * appliquée à learning_evidence (les lignes antérieures à la colonne
     * `outcome` sont lues par leur booléen, comme Outcome::fromLegacy).
     */
    private static function recentEvidence(array $studentIds, array $lessonIds, InsightWindow $window): array
    {
        $outcome = "COALESCE(e.outcome, CASE WHEN e.is_correct = 1 THEN 'correct' ELSE 'incorrect' END)";

        $rows = OutcomeStats::selectInto(
            DB::table('learning_evidence as e')
                ->join('learning_evidence_learning_point as p', 'p.learning_evidence_id', '=', 'e.id')
                ->whereIn('e.user_id', $studentIds)
                ->whereIn('e.lesson_id', $lessonIds)
                ->where('e.submitted_at', '>=', $window->from)
                ->groupBy('e.user_id', 'p.learning_point_id')
                ->select('e.user_id', 'p.learning_point_id')
                ->selectRaw('MAX(e.submitted_at) as last_at')
                ->selectRaw('COUNT(DISTINCT e.item_key) as items'),
            $outcome,
        )->get();

        $out = [];
        foreach ($rows as $r) {
            $stats = OutcomeStats::fromRow($r);
            $out[(int) $r->user_id][(int) $r->learning_point_id] = [
                'answered' => $stats['successes'] + $stats['partials'] + $stats['failures'],
                'successes' => $stats['successes'],
                'partials' => $stats['partials'],
                'failures' => $stats['failures'],
                'successRate' => $stats['successRate'],
                'items' => (int) $r->items,
                'lastAt' => self::iso($r->last_at),
            ];
        }

        return $out;
    }

    /**
     * Les transitions de la fenêtre, par (élève, point) : le statut de
     * départ (celui d'avant la première), le nombre de mouvements, et si un
     * RECALCUL (changement de version du moteur) s'y trouve — auquel cas le
     * mouvement n'est pas un apprentissage et n'est pas interprété.
     */
    private static function recentTransitions(array $studentIds, array $pointIds, InsightWindow $window): array
    {
        $out = [];
        foreach (LearningPointStateTransition::query()
            ->whereIn('user_id', $studentIds)
            ->whereIn('learning_point_id', $pointIds)
            ->where('occurred_at', '>=', $window->from)
            ->orderBy('occurred_at')->orderBy('id')
            ->get(['user_id', 'learning_point_id', 'status_before', 'status_after', 'origin', 'occurred_at']) as $t) {
            $u = (int) $t->user_id;
            $lp = (int) $t->learning_point_id;
            if (! isset($out[$u][$lp])) {
                $out[$u][$lp] = [
                    'startStatus' => $t->status_before,
                    'moves' => 0,
                    'recalculated' => false,
                    'lastAt' => null,
                    'lastStatus' => null,
                ];
            }
            $out[$u][$lp]['moves']++;
            $out[$u][$lp]['recalculated'] = $out[$u][$lp]['recalculated'] || $t->origin === LearningPointStateTransition::ORIGIN_REPLAY;
            $out[$u][$lp]['lastAt'] = $t->occurred_at?->toIso8601String();
            $out[$u][$lp]['lastStatus'] = $t->status_after;
        }

        return $out;
    }

    /**
     * La dernière activité d'apprentissage DANS LE PÉRIMÈTRE de la classe :
     * la plus récente preuve (pratique, test final) ou progression de leçon
     * sur une leçon effective. Pas `users.last_activity_at`, qui dirait à
     * l'enseignant quand l'élève a travaillé AILLEURS.
     *
     * @return array<int, ?string>
     */
    public static function lastActivity(array $studentIds, array $lessonIds): array
    {
        $out = array_fill_keys($studentIds, null);
        if ($lessonIds === []) {
            return $out;
        }

        $evidence = DB::table('learning_evidence')
            ->whereIn('user_id', $studentIds)->whereIn('lesson_id', $lessonIds)
            ->groupBy('user_id')->select('user_id')->selectRaw('MAX(submitted_at) as at')
            ->pluck('at', 'user_id');
        $progress = DB::table('student_lesson_progress')
            ->whereIn('user_id', $studentIds)->whereIn('lesson_id', $lessonIds)
            ->groupBy('user_id')->select('user_id')->selectRaw('MAX(COALESCE(last_activity_at, completed_at, updated_at)) as at')
            ->pluck('at', 'user_id');

        foreach ($studentIds as $id) {
            $candidates = array_filter([$evidence[$id] ?? null, $progress[$id] ?? null]);
            $out[$id] = $candidates === [] ? null : self::iso(max(array_map(fn ($v) => Carbon::parse($v)->utc()->format('Y-m-d H:i:s'), $candidates)));
        }

        return $out;
    }

    /** @return array<int, int[]> */
    private static function prerequisites(array $pointIds): array
    {
        if ($pointIds === []) {
            return [];
        }

        $out = [];
        foreach (DB::table('learning_point_prerequisites')
            ->whereIn('learning_point_id', $pointIds)
            ->whereIn('prerequisite_learning_point_id', $pointIds)
            ->get(['learning_point_id', 'prerequisite_learning_point_id']) as $r) {
            $out[(int) $r->learning_point_id][] = (int) $r->prerequisite_learning_point_id;
        }

        return $out;
    }

    private static function iso(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return Carbon::parse($value, 'UTC')->toIso8601String();
    }
}
