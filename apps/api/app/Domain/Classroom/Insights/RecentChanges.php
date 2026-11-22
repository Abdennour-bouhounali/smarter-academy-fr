<?php

namespace App\Domain\Classroom\Insights;

/**
 * « ما الذي تغيّر؟ » — les mouvements de statut de la fenêtre, pour une
 * classe. Calcul PUR sur ClassroomFacts.
 *
 * Un mouvement est lu de l'état au DÉBUT de la fenêtre à l'état d'AUJOURD'HUI
 * (LearningTrend::direction) : trois allers-retours dans la fenêtre qui
 * reviennent au point de départ ne sont pas un progrès. Un couple dont la
 * fenêtre contient un RECALCUL (nouvelle version du moteur) est compté à
 * part : l'élève n'a rien appris à cet instant.
 */
final class RecentChanges
{
    /** @return array<string, mixed> */
    public static function compute(ClassroomFacts $facts, int $topPoints = 6): array
    {
        $totals = [LearningTrend::IMPROVED => 0, LearningTrend::DECLINED => 0, LearningTrend::FIRST_ASSESSED => 0, 'recalculated' => 0];
        $byPoint = [];
        $improvedStudents = [];
        $declinedStudents = [];

        foreach ($facts->recentTransitions as $studentId => $points) {
            if (! isset($facts->students[$studentId])) {
                continue;
            }
            foreach ($points as $pointId => $moves) {
                if (! isset($facts->points[$pointId])) {
                    continue;
                }
                if ($moves['recalculated']) {
                    $totals['recalculated']++;

                    continue;
                }
                $direction = LearningTrend::direction($moves['startStatus'], $facts->state($studentId, $pointId)['status']);
                if (! array_key_exists($direction, $totals)) {
                    continue;
                }
                $totals[$direction]++;
                $byPoint[$pointId][$direction] = ($byPoint[$pointId][$direction] ?? 0) + 1;
                if ($direction === LearningTrend::IMPROVED) {
                    $improvedStudents[$studentId] = true;
                }
                if ($direction === LearningTrend::DECLINED) {
                    $declinedStudents[$studentId] = true;
                }
            }
        }

        $points = [];
        foreach ($byPoint as $pointId => $counts) {
            $p = $facts->point($pointId);
            $points[] = [
                'code' => $p['code'],
                'title' => $p['title'],
                'lessonCode' => $p['lessonCode'],
                'lessonTitle' => $p['lessonTitle'],
                'improved' => $counts[LearningTrend::IMPROVED] ?? 0,
                'declined' => $counts[LearningTrend::DECLINED] ?? 0,
                'firstAssessed' => $counts[LearningTrend::FIRST_ASSESSED] ?? 0,
            ];
        }
        usort($points, fn ($a, $b) => ($b['improved'] + $b['declined'] + $b['firstAssessed']) <=> ($a['improved'] + $a['declined'] + $a['firstAssessed']));

        return [
            'window' => $facts->window->toArray(),
            'improved' => $totals[LearningTrend::IMPROVED],
            'declined' => $totals[LearningTrend::DECLINED],
            'firstAssessed' => $totals[LearningTrend::FIRST_ASSESSED],
            'recalculated' => $totals['recalculated'],
            'studentsImproved' => array_values(array_map(fn ($id) => $facts->students[$id], array_keys($improvedStudents))),
            'studentsDeclined' => array_values(array_map(fn ($id) => $facts->students[$id], array_keys($declinedStudents))),
            'byLearningPoint' => array_slice($points, 0, $topPoints),
        ];
    }
}
