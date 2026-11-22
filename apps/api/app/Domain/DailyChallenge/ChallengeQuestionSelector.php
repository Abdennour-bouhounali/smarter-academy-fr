<?php

namespace App\Domain\DailyChallenge;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Domain\Classroom\ClassroomProgressService;
use App\Domain\Classroom\StudyContextService;
use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\Support\AnswerEvaluator;
use App\Domain\Progress\Engine\MasteryState;
use App\Models\AssessmentItem;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\DailyChallenge;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Choisit les questions d'UN défi — de la RÉCUPÉRATION de ce qui a été
 * appris, pas un tirage au hasard, pas une nouvelle notion.
 *
 * Il LIT l'état canonique (student_learning_point_progress), la fraîcheur
 * dérivée (Freshness, D7), la preuve (learning_evidence) et le registre
 * d'items (assessment_items) ; il n'écrit jamais la maîtrise. Même séparation
 * que ExerciseSelector : la maîtrise mesure, le sélecteur choisit.
 *
 * Classement d'un point d'apprentissage (plus petit = choisi d'abord) :
 *
 *   0  retrieval         maîtrisé MAIS la fraîcheur décline (aging / stale)
 *   1  recent_mistake    une erreur récente (défi ou pratique)
 *   1  reinforce         « بحاجة إلى تعزيز »
 *   1  recently_learned  première preuve il y a peu — une place lui est
 *                        réservée pour ne pas ne réviser que l'ancien
 *   2  reinforce (gap)   en ثغرة mais déjà travaillé
 *   3  review            maîtrisé et frais
 *   +2 si réussi en défi ces derniers jours (espacement)
 *   9  warmup            jamais travaillé — seulement s'il n'y a rien d'autre
 *
 * Couverture : un point par question tant qu'il y en a ; au-delà, on
 * reprend la liste avec un AUTRE item (Q4 → LP A). Représentations : on
 * évite de répéter un gabarit et on alterne les types de réponse.
 *
 * Portée `classroom` : les MÊMES questions pour tous — les faits sont ceux
 * de la classe (répartition des états sur les membres actifs), pas d'un
 * élève. Portée `student` : les faits de l'élève.
 *
 * Déterministe : le départage est un hachage de (portée, date, clé).
 */
class ChallengeQuestionSelector
{
    public const REASON_RETRIEVAL = 'retrieval';

    public const REASON_RECENT_MISTAKE = 'recent_mistake';

    public const REASON_REINFORCE = 'reinforce';

    public const REASON_RECENTLY_LEARNED = 'recently_learned';

    public const REASON_REVIEW = 'review';

    public const REASON_WARMUP = 'warmup';

    public function __construct(
        private ExerciseRepository $exercises,
        private ClassroomProgressService $classProgress,
        private StudyContextService $studyContext,
        private DailyChallengeConfig $config,
    ) {}

    /**
     * @param  array<string, mixed>  $snapshot  config_snapshot du défi
     * @param  array{seed?: string, exclude?: string[], warmup?: bool}  $options  `seed` varie le départage (plusieurs
     *                                                          services le même jour, « مدار ») ; `exclude` écarte des item_key ;
     *                                                          `warmup` garde les points jamais travaillés APRÈS les appris
     *                                                          (« مدار », quand les appris sont épuisés)
     * @return array<int, array<string, mixed>> une entrée par position, dans l'ordre
     */
    public function select(string $scopeType, int $scopeId, string $date, array $snapshot, ?User $student = null, array $options = []): array
    {
        $count = (int) $snapshot['questionCount'];
        $seed = "{$scopeType}:{$scopeId}:{$date}".(isset($options['seed']) ? ':'.$options['seed'] : '');
        $today = CarbonImmutable::parse($date);

        [$lessonIds, $memberIds] = $scopeType === DailyChallenge::SCOPE_CLASSROOM
            ? $this->classroomScope($scopeId, $snapshot)
            : $this->studentScope($student, $snapshot);
        if ($lessonIds === []) {
            return [];
        }

        $points = LearningPoint::whereNull('retired_at')->whereIn('lesson_id', $lessonIds)
            ->when(($snapshot['learningPointCodes'] ?? []) !== [], fn ($q) => $q->whereIn('code', $snapshot['learningPointCodes']))
            ->get(['id', 'code', 'lesson_id']);
        if ($points->isEmpty()) {
            return [];
        }

        $facts = $this->facts($memberIds, $points->pluck('id')->all(), $scopeType, $scopeId, $today);
        $ranked = $this->rankPoints($points, $facts, count($memberIds), $seed, $today, (bool) ($options['warmup'] ?? false));

        $items = $this->candidateItems($points->pluck('id')->all(), $scopeType, $student, $lessonIds);
        if (($options['exclude'] ?? []) !== []) {
            $excluded = array_fill_keys($options['exclude'], true);
            foreach ($items as $lp => $list) {
                $items[$lp] = array_values(array_filter($list, fn ($i) => ! isset($excluded[$i['itemKey']])));
            }
        }
        $seen = $this->seenItems($memberIds, $scopeType, $scopeId, $today);

        return $this->pick($ranked, $items, $seen, $count, $seed, $snapshot['difficulty'] ?? null);
    }

    // ── Portée ───────────────────────────────────────────────────────────────

    /** @return array{0: int[], 1: int[]} [leçons, membres] */
    private function classroomScope(int $classroomId, array $snapshot): array
    {
        $classroom = Classroom::find($classroomId);
        if ($classroom === null) {
            return [[], []];
        }
        $lessonIds = $this->classProgress->effectiveLessonIds($classroom);
        if (($snapshot['lessonCodes'] ?? []) !== []) {
            $lessonIds = Lesson::whereIn('id', $lessonIds)->whereIn('code', $snapshot['lessonCodes'])->pluck('id')->all();
        }
        $members = ClassroomMembership::where('classroom_id', $classroomId)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->all();

        return [$lessonIds, $members];
    }

    /** @return array{0: int[], 1: int[]} */
    private function studentScope(?User $student, array $snapshot): array
    {
        if ($student === null) {
            return [[], []];
        }
        $gradeId = Grade::where('code', $student->grade)->value('id');
        if ($gradeId === null) {
            return [[], [$student->id]];
        }
        $hidden = $this->studyContext->hiddenLessonCodesFor($student);
        $lessonIds = Lesson::whereHas('chapter', fn ($q) => $q->where('grade_id', $gradeId))
            ->visibleToStudents()
            ->when($hidden !== [], fn ($q) => $q->whereNotIn('code', $hidden))
            // Une portée de leçons explicite (la « محطة التزوّد » d'un élève
            // dont l'enseignant a restreint les leçons) ; le défi personnel
            // n'en pose jamais.
            ->when(($snapshot['lessonCodes'] ?? []) !== [], fn ($q) => $q->whereIn('code', $snapshot['lessonCodes']))
            ->pluck('id')->all();

        return [$lessonIds, [$student->id]];
    }

    // ── Faits ────────────────────────────────────────────────────────────────

    /**
     * Par point : la répartition des états sur les élèves de la portée, les
     * erreurs récentes, la première preuve, la dernière réussite en défi.
     * Quatre requêtes groupées, quelle que soit la taille de la classe.
     *
     * @param  int[]  $memberIds
     * @param  int[]  $pointIds
     * @return array<int, array<string, mixed>>
     */
    private function facts(array $memberIds, array $pointIds, string $scopeType, int $scopeId, CarbonImmutable $today): array
    {
        $facts = [];
        if ($memberIds === []) {
            return $facts;
        }
        $staleCut = $today->subDays((int) config('mastery.freshness.fresh_days', 21));
        $mistakeCut = $today->subDays((int) $this->config->get('selection.recent_mistakes_days', 7));

        $states = DB::table('student_learning_point_progress')
            ->whereIn('user_id', $memberIds)
            ->whereIn('learning_point_id', $pointIds)
            ->groupBy('learning_point_id')
            ->selectRaw('learning_point_id, COUNT(*) as assessed')
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as mastered", [MasteryState::STATUS_MASTERED])
            ->selectRaw("SUM(CASE WHEN status = ? AND (last_evidence_at IS NULL OR last_evidence_at < ?) THEN 1 ELSE 0 END) as mastered_aging", [MasteryState::STATUS_MASTERED, $staleCut])
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as reinforce", [MasteryState::STATUS_REINFORCE])
            ->selectRaw("SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as gap", [MasteryState::STATUS_GAP])
            ->selectRaw('SUM(CASE WHEN last_failure_at IS NOT NULL AND last_failure_at >= ? THEN 1 ELSE 0 END) as recent_failures', [$mistakeCut])
            ->get();
        foreach ($states as $s) {
            $facts[(int) $s->learning_point_id] = [
                'assessed' => (int) $s->assessed,
                'mastered' => (int) $s->mastered,
                'masteredAging' => (int) $s->mastered_aging,
                'reinforce' => (int) $s->reinforce,
                'gap' => (int) $s->gap,
                'recentFailures' => (int) $s->recent_failures,
            ];
        }

        // La PREMIÈRE preuve de la portée sur chaque point : « récemment appris ».
        $first = DB::table('learning_evidence_learning_point as lelp')
            ->join('learning_evidence as le', 'le.id', '=', 'lelp.learning_evidence_id')
            ->whereIn('le.user_id', $memberIds)
            ->whereIn('lelp.learning_point_id', array_keys($facts) ?: [0])
            ->groupBy('lelp.learning_point_id')
            ->selectRaw('lelp.learning_point_id, MIN(le.submitted_at) as first_at')
            ->pluck('first_at', 'lelp.learning_point_id');
        foreach ($first as $lp => $at) {
            $facts[(int) $lp]['firstEvidenceAt'] = $at;
        }

        // Le passé du DÉFI dans cette portée : réussites (espacement) et erreurs.
        $retrievedCut = $today->subDays((int) $this->config->get('selection.recently_retrieved_days', 3))->format('Y-m-d');
        $challenge = DB::table('daily_challenge_answers as a')
            ->join('daily_challenge_attempts as t', 't.id', '=', 'a.daily_challenge_attempt_id')
            ->join('daily_challenge_questions as q', 'q.id', '=', 'a.daily_challenge_question_id')
            ->where('t.scope_type', $scopeType)->where('t.scope_id', $scopeId)
            ->where('t.challenge_date', '>=', $mistakeCut->format('Y-m-d'))
            ->where('t.challenge_date', '<', $today->format('Y-m-d'))
            ->whereNotNull('a.submitted_at')
            ->groupBy('q.learning_point_id')
            ->selectRaw('q.learning_point_id, SUM(CASE WHEN a.is_correct = 1 AND t.challenge_date >= ? THEN 1 ELSE 0 END) as recent_ok', [$retrievedCut])
            ->selectRaw('SUM(CASE WHEN a.is_correct = 0 THEN 1 ELSE 0 END) as fails, COUNT(*) as answered')
            ->get();
        foreach ($challenge as $c) {
            $facts[(int) $c->learning_point_id]['challengeRecentOk'] = (int) $c->recent_ok;
            $facts[(int) $c->learning_point_id]['challengeFails'] = (int) $c->fails;
            $facts[(int) $c->learning_point_id]['challengeAnswered'] = (int) $c->answered;
        }

        return $facts;
    }

    /**
     * @return array<int, array{id: int, lessonId: int, tier: int, reason: string, tie: int, recentlyLearned: bool}>
     */
    private function rankPoints(Collection $points, array $facts, int $members, string $seed, CarbonImmutable $today, bool $keepWarmup = false): array
    {
        $recentCut = $today->subDays((int) $this->config->get('selection.recently_learned_days', 14));
        $ranked = [];
        foreach ($points as $p) {
            $f = $facts[$p->id] ?? [];
            $assessed = (int) ($f['assessed'] ?? 0);
            $recentlyLearned = isset($f['firstEvidenceAt']) && CarbonImmutable::parse($f['firstEvidenceAt'])->greaterThanOrEqualTo($recentCut);

            if ($assessed === 0) {
                [$tier, $reason] = [9, self::REASON_WARMUP];
            } else {
                // Une part de la portée (1 pour un élève seul) : « au moins un tiers ».
                $share = fn (int $n) => $n * 3 >= $assessed;
                $mistakes = ($f['recentFailures'] ?? 0) + ($f['challengeFails'] ?? 0);
                $weak = ($f['reinforce'] ?? 0) + ($f['gap'] ?? 0);

                [$tier, $reason] = match (true) {
                    $share($f['masteredAging'] ?? 0) && ($f['masteredAging'] ?? 0) > 0 => [0, self::REASON_RETRIEVAL],
                    $mistakes > 0 && $share($weak) => [1, self::REASON_RECENT_MISTAKE],
                    $recentlyLearned => [1, self::REASON_RECENTLY_LEARNED],
                    ($f['reinforce'] ?? 0) > 0 && $share($f['reinforce']) => [1, self::REASON_REINFORCE],
                    $weak > ($f['mastered'] ?? 0) => [2, self::REASON_REINFORCE],
                    default => [3, self::REASON_REVIEW],
                };

                // Espacement : réussi en défi il y a peu → attend son tour.
                if (($f['challengeRecentOk'] ?? 0) > 0 && $reason !== self::REASON_RECENT_MISTAKE) {
                    $tier += 2;
                }
            }

            $ranked[] = [
                'id' => (int) $p->id, 'lessonId' => (int) $p->lesson_id, 'tier' => $tier, 'reason' => $reason,
                'tie' => crc32($seed.'|lp|'.$p->code), 'recentlyLearned' => $recentlyLearned && $assessed > 0,
            ];
        }

        usort($ranked, fn ($a, $b) => [$a['tier'], $a['tie']] <=> [$b['tier'], $b['tie']]);

        // Sans rien d'appris, on s'échauffe ; avec, on n'ajoute jamais de l'inconnu
        // — sauf demande explicite (`warmup`) : l'inconnu vient alors APRÈS (tri par rang).
        if ($keepWarmup) {
            return $ranked;
        }
        $learned = array_values(array_filter($ranked, fn ($r) => $r['reason'] !== self::REASON_WARMUP));

        return $learned !== [] ? $learned : $ranked;
    }

    // ── Items ────────────────────────────────────────────────────────────────

    /**
     * Les items de pratique publiés dont le point PRINCIPAL est candidat,
     * moins ceux que l'administration a retirés et — pour une classe — ceux
     * qu'un élève pourrait ne pas avoir le droit d'ouvrir (payants).
     *
     * @param  int[]  $pointIds
     * @param  int[]  $lessonIds
     * @return array<int, array<int, array<string, mixed>>> lp → items
     */
    private function candidateItems(array $pointIds, string $scopeType, ?User $student, array $lessonIds): array
    {
        $rows = AssessmentItem::query()
            ->active()
            ->visibleToStudents()
            ->where('source_kind', AssessmentItem::SOURCE_PRACTICE)
            ->join('assessment_item_learning_point as ailp', 'ailp.assessment_item_id', '=', 'assessment_items.id')
            ->whereIn('ailp.learning_point_id', $pointIds)
            ->where('ailp.role', 'primary')
            ->with('lesson:id,code,tier')
            ->get(['assessment_items.id', 'assessment_items.lesson_id', 'item_key', 'exercise_code', 'question_id', 'template_key', 'difficulty', 'answer_type', 'ailp.learning_point_id']);

        // Les exercices du registre, en une requête : masqués et paliers.
        $exercises = PracticeExercise::whereIn('lesson_id', $lessonIds)
            ->get(['lesson_id', 'exercise_code', 'tier', 'publication_status'])
            ->keyBy(fn ($e) => $e->lesson_id.'|'.$e->exercise_code);

        $byPoint = [];
        foreach ($rows as $row) {
            $key = $row->lesson_id.'|'.$row->exercise_code;
            $exercise = $exercises->get($key);
            if ($exercise !== null && ! $exercise->isVisibleToStudents()) {
                continue;
            }
            // Le défi ne sert que des questions qui COMPTENT pour la maîtrise
            // (AnswerEvaluator::countsForMastery) : une étape « بيّن أن »
            // auto-évaluée (`selfCheck`) ou une étape `counted: false` des
            // fiches BEM serait notée sur la parole de l'élève, ou ne
            // prouverait rien. Le type suffit pour `selfCheck` ; `counted`
            // n'existe que dans le contenu (lu en cache par le dépôt).
            if ($row->answer_type === 'selfCheck') {
                continue;
            }
            $question = $row->lesson?->code !== null
                ? $this->exercises->findQuestion($row->lesson->code, $row->exercise_code, $row->question_id)
                : null;
            if ($question !== null && ! AnswerEvaluator::countsForMastery($question)) {
                continue;
            }
            $tier = AccessTier::effective($exercise?->tier, $row->lesson?->tier);
            $byPoint[(int) $row->learning_point_id][] = [
                'lessonId' => (int) $row->lesson_id,
                'lessonCode' => $row->lesson?->code,
                'itemKey' => $row->item_key,
                'exerciseCode' => $row->exercise_code,
                'questionId' => $row->question_id,
                'templateKey' => $row->template_key,
                'difficulty' => $row->difficulty !== null ? (int) $row->difficulty : null,
                'answerType' => $row->answer_type,
                'premium' => $tier !== AccessTier::FREE,
            ];
        }

        // Une classe : les mêmes questions pour tous, donc rien que tous
        // puissent ouvrir — le contenu gratuit.
        // Un élève seul : le payant seulement s'il y a droit (une seule
        // résolution de droits, pas une par item).
        $premiumAllowed = $scopeType === DailyChallenge::SCOPE_STUDENT
            && $student !== null
            && app(EntitlementService::class)->satisfies($student, AccessTier::PREMIUM);
        if (! $premiumAllowed) {
            foreach ($byPoint as $lp => $list) {
                $byPoint[$lp] = array_values(array_filter($list, fn ($i) => ! $i['premium']));
            }
        }

        return $byPoint;
    }

    /**
     * Les items déjà vus : par l'élève (toute preuve), ou dans les défis
     * récents de la classe. Un item jamais vu est une vraie démonstration
     * (`first` / `variant`) ; un item déjà réussi ne vaudrait presque rien
     * pour la maîtrise (`repeat_after_success`, ×0,1).
     *
     * @param  int[]  $memberIds
     * @return array<string, true>
     */
    private function seenItems(array $memberIds, string $scopeType, int $scopeId, CarbonImmutable $today): array
    {
        $recent = DB::table('daily_challenge_questions as q')
            ->join('daily_challenges as c', 'c.id', '=', 'q.daily_challenge_id')
            ->where('c.scope_type', $scopeType)->where('c.scope_id', $scopeId)
            ->where('c.challenge_date', '>=', $today->subDays(14)->format('Y-m-d'))
            ->where('c.challenge_date', '<', $today->format('Y-m-d'))
            ->pluck('q.item_key')->all();
        $seen = array_fill_keys($recent, true);

        if ($scopeType === DailyChallenge::SCOPE_STUDENT && $memberIds !== []) {
            foreach (DB::table('learning_evidence')->where('user_id', $memberIds[0])->whereNotNull('item_key')->distinct()->pluck('item_key') as $key) {
                $seen[$key] = true;
            }
        }

        return $seen;
    }

    /**
     * @param  array<int, array<string, mixed>>  $ranked
     * @param  array<int, array<int, array<string, mixed>>>  $items
     * @param  array<string, true>  $seen
     * @return array<int, array<string, mixed>>
     */
    private function pick(array $ranked, array $items, array $seen, int $count, string $seed, ?string $difficulty): array
    {
        // Seuls les points qui ont au moins un item servable.
        $ranked = array_values(array_filter($ranked, fn ($r) => ! empty($items[$r['id']])));
        if ($ranked === []) {
            return [];
        }

        // Une place réservée à un point récemment appris (s'il n'est pas déjà dans les premiers).
        $first = array_slice($ranked, 0, $count);
        if (! array_filter($first, fn ($r) => $r['recentlyLearned'])) {
            foreach (array_slice($ranked, $count) as $i => $candidate) {
                if ($candidate['recentlyLearned']) {
                    $candidate['reason'] = self::REASON_RECENTLY_LEARNED;
                    array_splice($ranked, $count + $i, 1);
                    array_splice($ranked, max(0, min($count, count($ranked)) - 1), 0, [$candidate]);
                    break;
                }
            }
        }

        $picked = [];
        $usedItems = [];
        $usedTemplates = [];
        $lastType = null;
        $round = 0;
        while (count($picked) < $count && $round < $count) {
            $progress = false;
            foreach ($ranked as $point) {
                if (count($picked) >= $count) {
                    break;
                }
                $item = $this->bestItem($items[$point['id']], $point, $usedItems, $usedTemplates, $lastType, $seen, $seed, $difficulty);
                if ($item === null) {
                    continue;
                }
                $usedItems[$item['itemKey']] = true;
                if ($item['templateKey'] !== null) {
                    $usedTemplates[$item['templateKey']] = true;
                }
                $lastType = $item['answerType'];
                $picked[] = $item + ['learningPointId' => $point['id'], 'reason' => $point['reason']];
                $progress = true;
            }
            if (! $progress) {
                break;
            }
            $round++;
        }

        return $picked;
    }

    private function bestItem(array $candidates, array $point, array $usedItems, array $usedTemplates, ?string $lastType, array $seen, string $seed, ?string $difficulty): ?array
    {
        $want = $this->difficultyBand($difficulty, $point['reason']);
        $best = null;
        $bestKey = null;
        foreach ($candidates as $item) {
            if (isset($usedItems[$item['itemKey']])) {
                continue;
            }
            // La question doit exister dans le contenu livré (le registre est un index).
            if ($this->exercises->findQuestion((string) $item['lessonCode'], (string) $item['exerciseCode'], (string) $item['questionId']) === null) {
                continue;
            }
            $d = $item['difficulty'] ?? 3;
            $key = [
                ($d >= $want[0] && $d <= $want[1]) ? 0 : 1,
                isset($seen[$item['itemKey']]) ? 1 : 0,
                ($item['templateKey'] !== null && isset($usedTemplates[$item['templateKey']])) ? 1 : 0,
                $item['answerType'] === $lastType ? 1 : 0,
                crc32($seed.'|item|'.$item['itemKey']),
            ];
            if ($bestKey === null || $key < $bestKey) {
                [$best, $bestKey] = [$item, $key];
            }
        }

        return $best;
    }

    /** @return array{0: int, 1: int} la bande de difficulté souhaitée */
    private function difficultyBand(?string $difficulty, string $reason): array
    {
        return match ($difficulty) {
            'easy' => [1, 2],
            'medium' => [2, 4],
            'hard' => [3, 5],
            // Adaptatif : ce qui est su se récupère à bonne hauteur ; ce qui
            // est fragile se reprend en douceur.
            default => in_array($reason, [self::REASON_RETRIEVAL, self::REASON_REVIEW], true) ? [3, 5] : [1, 3],
        };
    }
}
