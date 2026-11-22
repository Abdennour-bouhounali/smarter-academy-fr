<?php

namespace App\Domain\Classroom\Insights;

use App\Domain\Progress\Engine\MasteryState;
use Illuminate\Support\Carbon;

/**
 * « تستحقّ نظرة » — ce qui, dans une classe, mérite le regard de
 * l'enseignant. Calcul PUR sur ClassroomFacts : aucune requête, aucun
 * stockage. Un signal existe tant que les faits le portent ; il disparaît
 * dès qu'ils changent.
 *
 * Chaque signal dit :
 *   QUI       students[]       l'identité enseignant (jamais le courriel)
 *   QUOI      type             une des règles ci-dessous
 *   POURQUOI  indicator        les nombres qui ont déclenché la règle
 *   PREUVE    students[].facts la preuve de la fenêtre, élève par élève
 *   OÙ        learningPoint    le point concerné, avec sa leçon
 *   QUAND     lastEvidenceAt   la preuve la plus récente derrière le signal
 *   QUE FAIRE actions          les gestes d'intervention qui s'y prêtent
 *
 * Les règles retenues sont celles que la donnée porte SÛREMENT (audit
 * 2026-09-24, §16) :
 *
 *   class_difficulty     ≥ N élèves en « ثغرة » sur un même point (groupe ou
 *                        classe entière) — la difficulté partagée
 *   repeated_difficulty  en « ثغرة » ET ≥ N échecs récents sur ce point
 *   declined             le statut a BAISSÉ dans la fenêtre (hors recalcul)
 *   stalled              beaucoup de réponses récentes sur le point, sans
 *                        montée de statut ni maîtrise
 *   no_recent_activity   ENGAGEMENT, jamais apprentissage : aucune activité
 *                        dans le périmètre depuis N jours
 *
 * Ce qui n'est PAS un signal, délibérément : « non évalué » et « preuve
 * insuffisante » (ne pas savoir n'est pas une difficulté), le cahier (l'écrit
 * de l'élève n'est pas un détecteur, NOTEBOOK.md), le temps passé (non
 * collecté, D10), toute moyenne de classe (une moyenne cache le groupe en
 * difficulté — on compte des élèves, on ne moyenne pas).
 *
 * Aucun signal ne CLASSE les élèves : l'ordre des élèves d'un signal suit le
 * statut puis le nom, jamais un score.
 */
final class AttentionSignals
{
    public const CLASS_DIFFICULTY = 'class_difficulty';

    public const REPEATED_DIFFICULTY = 'repeated_difficulty';

    public const DECLINED = 'declined';

    public const STALLED = 'stalled';

    public const NO_RECENT_ACTIVITY = 'no_recent_activity';

    public const CATEGORY_LEARNING = 'learning';

    public const CATEGORY_ENGAGEMENT = 'engagement';

    /** L'ordre d'affichage des types — le plus partagé d'abord. */
    private const TYPE_ORDER = [
        self::CLASS_DIFFICULTY => 0,
        self::REPEATED_DIFFICULTY => 1,
        self::DECLINED => 2,
        self::STALLED => 3,
        self::NO_RECENT_ACTIVITY => 9,
    ];

    /**
     * @return array{ruleVersion: int, window: array, signals: array<int, array<string, mixed>>, summary: array<string, mixed>}
     */
    public static function compute(ClassroomFacts $facts): array
    {
        $signals = [];
        $covered = [];

        // ── 1. La difficulté PARTAGÉE, point par point ───────────────────
        foreach ($facts->points as $pointId => $point) {
            $gapIds = [];
            $assessed = 0;
            foreach ($facts->students as $studentId => $_) {
                $status = $facts->state($studentId, $pointId)['status'];
                if ($status !== MasteryState::STATUS_UNASSESSED) {
                    $assessed++;
                }
                if ($status === MasteryState::STATUS_GAP) {
                    $gapIds[] = $studentId;
                }
            }

            $scope = LearningTrend::difficultyScope(count($gapIds), $assessed);
            if (! in_array($scope, [LearningTrend::SCOPE_SMALL_GROUP, LearningTrend::SCOPE_CLASS_WIDE], true)) {
                continue;
            }

            foreach ($gapIds as $id) {
                $covered[$id][$pointId] = true;
            }
            $prerequisites = self::weakPrerequisites($facts, $pointId, $gapIds);

            $signals[] = self::signal(
                $facts, self::CLASS_DIFFICULTY, $pointId, $gapIds,
                indicator: [
                    'gap' => count($gapIds),
                    'assessed' => $assessed,
                    'members' => count($facts->students),
                    'scope' => $scope,
                ],
                prerequisites: $prerequisites,
                actions: array_values(array_filter([
                    'class_reinforcement',
                    $prerequisites !== [] ? 'review_prerequisite' : null,
                    'recommend_practice',
                ])),
            );
        }

        // ── 2. Élève × point : difficulté répétée, recul, stagnation ─────
        /** @var array<string, array<int, int>> $grouped type:point → élèves */
        $grouped = [];
        $minFailures = (int) config('teacher_insights.signals.repeated_difficulty_min_failures', 3);
        $minAttempts = (int) config('teacher_insights.signals.stalled_min_attempts', 5);

        foreach ($facts->students as $studentId => $_) {
            foreach ($facts->points as $pointId => $point) {
                if (isset($covered[$studentId][$pointId])) {
                    continue;
                }
                $state = $facts->state($studentId, $pointId);
                $recent = $facts->recentEvidence[$studentId][$pointId] ?? null;
                $moves = $facts->recentTransitions[$studentId][$pointId] ?? null;
                $direction = ($moves['recalculated'] ?? false)
                    ? null
                    : LearningTrend::direction($facts->statusAtWindowStart($studentId, $pointId), $state['status']);

                $type = null;
                if ($state['status'] === MasteryState::STATUS_GAP && ($recent['failures'] ?? 0) >= $minFailures) {
                    $type = self::REPEATED_DIFFICULTY;
                } elseif ($direction === LearningTrend::DECLINED) {
                    $type = self::DECLINED;
                } elseif (($recent['answered'] ?? 0) >= $minAttempts
                    && in_array($state['status'], [MasteryState::STATUS_GAP, MasteryState::STATUS_REINFORCE], true)
                    && in_array($direction, [LearningTrend::UNCHANGED, LearningTrend::FIRST_ASSESSED], true)) {
                    $type = self::STALLED;
                }

                if ($type !== null) {
                    $grouped["{$type}:{$pointId}"][] = $studentId;
                }
            }
        }

        foreach ($grouped as $key => $studentIds) {
            [$type, $pointId] = explode(':', $key);
            $pointId = (int) $pointId;
            $prerequisites = self::weakPrerequisites($facts, $pointId, $studentIds);
            $signals[] = self::signal(
                $facts, $type, $pointId, $studentIds,
                indicator: ['students' => count($studentIds)],
                prerequisites: $prerequisites,
                actions: array_values(array_filter([
                    'individual_followup',
                    $prerequisites !== [] ? 'review_prerequisite' : null,
                    'recommend_practice',
                ])),
            );
        }

        // ── 3. Engagement — séparé, jamais lu comme un échec ─────────────
        $inactive = self::inactiveStudents($facts);
        if ($inactive !== []) {
            $signals[] = [
                'key' => self::NO_RECENT_ACTIVITY,
                'type' => self::NO_RECENT_ACTIVITY,
                'category' => self::CATEGORY_ENGAGEMENT,
                'scope' => 'class',
                'learningPoint' => null,
                'indicator' => [
                    'days' => (int) config('teacher_insights.signals.inactive_days', 14),
                    'students' => count($inactive),
                    'neverStarted' => count(array_filter($inactive, fn ($s) => $s['lastActivityAt'] === null)),
                ],
                'students' => $inactive,
                'prerequisites' => [],
                'lastEvidenceAt' => null,
                'actions' => ['individual_followup'],
            ];
        }

        usort($signals, fn ($a, $b) => [self::TYPE_ORDER[$a['type']] ?? 9, -count($a['students']), $a['learningPoint']['order'] ?? 0]
            <=> [self::TYPE_ORDER[$b['type']] ?? 9, -count($b['students']), $b['learningPoint']['order'] ?? 0]);

        $concerned = [];
        foreach ($signals as $s) {
            if ($s['category'] === self::CATEGORY_LEARNING) {
                foreach ($s['students'] as $st) {
                    $concerned[$st['id']] = true;
                }
            }
        }

        return [
            'ruleVersion' => (int) config('teacher_insights.rule_version', 1),
            'window' => $facts->window->toArray(),
            'signals' => $signals,
            'summary' => [
                'learning' => count(array_filter($signals, fn ($s) => $s['category'] === self::CATEGORY_LEARNING)),
                'engagement' => count(array_filter($signals, fn ($s) => $s['category'] === self::CATEGORY_ENGAGEMENT)),
                'studentsConcerned' => count($concerned),
                'members' => count($facts->students),
            ],
        ];
    }

    /**
     * Les signaux qui concernent UN élève (son aperçu) : les mêmes règles,
     * filtrées — jamais un second calcul.
     *
     * @param  array<int, array<string, mixed>>  $signals
     * @return array<int, array<string, mixed>>
     */
    public static function forStudent(array $signals, int $studentId): array
    {
        $out = [];
        foreach ($signals as $s) {
            $mine = array_values(array_filter($s['students'], fn ($st) => $st['id'] === $studentId));
            if ($mine !== []) {
                $out[] = ['students' => $mine] + $s;
            }
        }

        return $out;
    }

    // ── Construction ──────────────────────────────────────────────────────

    /**
     * @param  int[]  $studentIds
     * @return array<string, mixed>
     */
    private static function signal(ClassroomFacts $facts, string $type, int $pointId, array $studentIds, array $indicator, array $prerequisites, array $actions): array
    {
        $point = $facts->point($pointId);
        $students = array_map(fn (int $id) => self::studentFacts($facts, $id, $pointId), $studentIds);
        usort($students, fn ($a, $b) => [LearningTrend::rank($a['status']) ?? 9, $a['lastName'] ?? '', $a['firstName'] ?? '']
            <=> [LearningTrend::rank($b['status']) ?? 9, $b['lastName'] ?? '', $b['firstName'] ?? '']);

        $last = null;
        foreach ($students as $s) {
            $at = $s['recent']['lastAt'] ?? $s['lastEvidenceAt'];
            if ($at !== null && ($last === null || $at > $last)) {
                $last = $at;
            }
        }

        return [
            'key' => "{$type}:{$point['code']}",
            'type' => $type,
            'category' => self::CATEGORY_LEARNING,
            'scope' => $type === self::CLASS_DIFFICULTY ? 'class' : 'student',
            'learningPoint' => [
                'code' => $point['code'],
                'title' => $point['title'],
                'order' => $point['order'],
                'lessonCode' => $point['lessonCode'],
                'lessonTitle' => $point['lessonTitle'],
            ],
            'indicator' => $indicator,
            'students' => $students,
            'prerequisites' => $prerequisites,
            'lastEvidenceAt' => $last,
            'actions' => $actions,
        ];
    }

    /** @return array<string, mixed> */
    private static function studentFacts(ClassroomFacts $facts, int $studentId, int $pointId): array
    {
        $state = $facts->state($studentId, $pointId);
        $recent = $facts->recentEvidence[$studentId][$pointId] ?? null;

        return $facts->students[$studentId] + [
            'status' => $state['status'],
            'statusReason' => $state['reason'],
            'confidence' => $state['confidence'],
            'statusAtWindowStart' => $facts->statusAtWindowStart($studentId, $pointId),
            'lastEvidenceAt' => $state['lastEvidenceAt'],
            'recent' => [
                'answered' => $recent['answered'] ?? 0,
                'successes' => $recent['successes'] ?? 0,
                'partials' => $recent['partials'] ?? 0,
                'failures' => $recent['failures'] ?? 0,
                'items' => $recent['items'] ?? 0,
                'lastAt' => $recent['lastAt'] ?? null,
            ],
        ];
    }

    /**
     * Les prérequis (dans le périmètre) sur lesquels des élèves concernés
     * sont EUX AUSSI en « ثغرة » — une piste pour l'enseignant, pas un
     * diagnostic.
     *
     * @param  int[]  $studentIds
     * @return array<int, array<string, mixed>>
     */
    private static function weakPrerequisites(ClassroomFacts $facts, int $pointId, array $studentIds): array
    {
        $out = [];
        foreach ($facts->prerequisites[$pointId] ?? [] as $preId) {
            $inGap = count(array_filter($studentIds, fn ($id) => $facts->state($id, $preId)['status'] === MasteryState::STATUS_GAP));
            if ($inGap > 0) {
                $p = $facts->point($preId);
                $out[] = ['code' => $p['code'], 'title' => $p['title'], 'lessonCode' => $p['lessonCode'], 'lessonTitle' => $p['lessonTitle'], 'studentsInGap' => $inGap];
            }
        }

        return $out;
    }

    /** @return array<int, array<string, mixed>> */
    private static function inactiveStudents(ClassroomFacts $facts): array
    {
        $days = (int) config('teacher_insights.signals.inactive_days', 14);
        $cutoff = $facts->window->now->copy()->subDays($days);
        $out = [];
        foreach ($facts->students as $id => $identity) {
            $at = $facts->lastActivity[$id] ?? null;
            if ($at === null || Carbon::parse($at)->lessThan($cutoff)) {
                $out[] = $identity + ['lastActivityAt' => $at];
            }
        }
        usort($out, fn ($a, $b) => [$a['lastName'] ?? '', $a['firstName'] ?? ''] <=> [$b['lastName'] ?? '', $b['firstName'] ?? '']);

        return $out;
    }
}
