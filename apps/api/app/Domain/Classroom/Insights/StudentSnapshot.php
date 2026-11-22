<?php

namespace App\Domain\Classroom\Insights;

use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Support\Freshness;
use App\Domain\Progress\Support\OutcomeStats;

/**
 * « لمحة » — l'aperçu d'UN élève pour son enseignant, en une lecture.
 *
 * Calcul PUR sur ClassroomFacts chargés pour cet élève. Trois choses que
 * l'enseignant ne doit pas confondre restent séparées :
 *
 *   APPRENTISSAGE  les statuts canoniques par point (forces, difficultés)
 *                  et leur MOUVEMENT sur la fenêtre (evolution)
 *   ACTIVITÉ       ce que l'élève a fait : réponses récentes, dernier point
 *                  travaillé, dernière activité dans le périmètre
 *   ENGAGEMENT     n'est pas déduit ici : l'absence d'activité est montrée
 *                  comme un fait daté, jamais comme un échec
 *
 * Rien n'est moyenné : « 3 points maîtrisés, 2 en difficulté » dit ce
 * qu'aucun pourcentage ne dit.
 */
final class StudentSnapshot
{
    /** @return array<string, mixed> */
    public static function compute(ClassroomFacts $facts, int $studentId, int $limit = 6): array
    {
        $counts = [MasteryState::STATUS_MASTERED => 0, MasteryState::STATUS_REINFORCE => 0, MasteryState::STATUS_GAP => 0, MasteryState::STATUS_UNASSESSED => 0];
        $reasons = ['insufficientEvidence' => 0, 'needsAssessment' => 0];
        $strengths = [];
        $difficulties = [];
        $changes = [];
        $recentTotals = ['successes' => 0, 'partials' => 0, 'failures' => 0];
        $activePoints = 0;
        $lastWorked = null;

        foreach ($facts->points as $pointId => $point) {
            $state = $facts->state($studentId, $pointId);
            $counts[$state['status']] = ($counts[$state['status']] ?? 0) + 1;
            if ($state['status'] === MasteryState::STATUS_REINFORCE && $state['reason'] === MasteryState::REASON_INSUFFICIENT_EVIDENCE) {
                $reasons['insufficientEvidence']++;
            }
            if ($state['status'] === MasteryState::STATUS_REINFORCE && $state['reason'] === MasteryState::REASON_NEEDS_ASSESSMENT) {
                $reasons['needsAssessment']++;
            }

            $recent = $facts->recentEvidence[$studentId][$pointId] ?? null;
            if ($recent !== null) {
                $activePoints++;
                foreach ($recentTotals as $k => $_) {
                    $recentTotals[$k] += $recent[$k];
                }
                if ($recent['lastAt'] !== null && ($lastWorked === null || $recent['lastAt'] > $lastWorked['at'])) {
                    $lastWorked = ['at' => $recent['lastAt'], 'pointId' => $pointId];
                }
            }

            $row = self::row($point, $state, $recent);
            if ($state['status'] === MasteryState::STATUS_MASTERED) {
                $strengths[] = $row + ['freshness' => Freshness::of($state['lastSuccessAt'] ?? $state['lastEvidenceAt'])];
            } elseif ($state['status'] === MasteryState::STATUS_GAP
                || ($state['status'] === MasteryState::STATUS_REINFORCE && $state['reason'] === MasteryState::REASON_THRESHOLD)) {
                // « Preuve insuffisante » et « à évaluer » ne sont PAS des
                // difficultés : l'élève n'a simplement pas encore tout montré.
                $difficulties[] = $row;
            }

            $moves = $facts->recentTransitions[$studentId][$pointId] ?? null;
            if ($moves !== null && ! $moves['recalculated']) {
                $direction = LearningTrend::direction($moves['startStatus'], $state['status']);
                if (in_array($direction, [LearningTrend::IMPROVED, LearningTrend::DECLINED, LearningTrend::FIRST_ASSESSED], true)) {
                    $changes[] = [
                        'code' => $point['code'],
                        'title' => $point['title'],
                        'lessonCode' => $point['lessonCode'],
                        'from' => $moves['startStatus'] ?? MasteryState::STATUS_UNASSESSED,
                        'to' => $state['status'],
                        'direction' => $direction,
                        'at' => $moves['lastAt'],
                    ];
                }
            }
        }

        usort($strengths, fn ($a, $b) => ($b['confidence'] ?? 0) <=> ($a['confidence'] ?? 0));
        usort($difficulties, fn ($a, $b) => [LearningTrend::rank($a['status']), $a['confidence'] ?? 1] <=> [LearningTrend::rank($b['status']), $b['confidence'] ?? 1]);
        usort($changes, fn ($a, $b) => strcmp((string) $b['at'], (string) $a['at']));

        $improved = count(array_filter($changes, fn ($c) => $c['direction'] === LearningTrend::IMPROVED));
        $declined = count(array_filter($changes, fn ($c) => $c['direction'] === LearningTrend::DECLINED));
        $first = count(array_filter($changes, fn ($c) => $c['direction'] === LearningTrend::FIRST_ASSESSED));
        $answered = array_sum($recentTotals);

        $current = null;
        if ($lastWorked !== null) {
            $p = $facts->point($lastWorked['pointId']);
            $current = ['code' => $p['code'], 'title' => $p['title'], 'lessonCode' => $p['lessonCode'], 'lessonTitle' => $p['lessonTitle'], 'at' => $lastWorked['at']];
        }

        return [
            'window' => $facts->window->toArray(),
            'learning' => [
                'learningPoints' => count($facts->points),
                'counts' => $counts,
                'assessed' => count($facts->points) - $counts[MasteryState::STATUS_UNASSESSED],
                'reasons' => $reasons,
                'strengths' => array_slice($strengths, 0, $limit),
                'difficulties' => array_slice($difficulties, 0, $limit),
                'strengthsTotal' => count($strengths),
                'difficultiesTotal' => count($difficulties),
            ],
            'evolution' => [
                'trend' => self::trend($improved, $declined, $first, $answered),
                'improved' => $improved,
                'declined' => $declined,
                'firstAssessed' => $first,
                'changes' => array_slice($changes, 0, 10),
            ],
            'activity' => [
                'lastActivityAt' => $facts->lastActivity[$studentId] ?? null,
                'recentAnswered' => $answered,
                'recentSuccessRate' => OutcomeStats::rate($recentTotals['successes'], $recentTotals['partials'], $recentTotals['failures']),
                'recentLearningPoints' => $activePoints,
                'currentLearningPoint' => $current,
            ],
        ];
    }

    /**
     * improving / declining / mixed / started / stable / no_recent_evidence —
     * lu sur les MOUVEMENTS de statut, jamais sur un pourcentage.
     */
    public static function trend(int $improved, int $declined, int $firstAssessed, int $answered): string
    {
        return match (true) {
            $improved > 0 && $declined > 0 => 'mixed',
            $improved > 0 => 'improving',
            $declined > 0 => 'declining',
            $firstAssessed > 0 => 'started',
            $answered > 0 => 'stable',
            default => 'no_recent_evidence',
        };
    }

    /** @return array<string, mixed> */
    private static function row(array $point, array $state, ?array $recent): array
    {
        return [
            'code' => $point['code'],
            'title' => $point['title'],
            'lessonCode' => $point['lessonCode'],
            'lessonTitle' => $point['lessonTitle'],
            'status' => $state['status'],
            'statusReason' => $state['reason'],
            'confidence' => $state['confidence'],
            'lastEvidenceAt' => $state['lastEvidenceAt'],
            'recentAnswered' => $recent['answered'] ?? 0,
            'recentFailures' => $recent['failures'] ?? 0,
        ];
    }
}
