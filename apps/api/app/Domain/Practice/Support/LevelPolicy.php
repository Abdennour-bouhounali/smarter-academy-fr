<?php

namespace App\Domain\Practice\Support;

/**
 * Quels niveaux sont ouverts, et pourquoi les autres ne le sont pas.
 *
 * Fonction pure : elle reçoit des tableaux, elle rend une décision. Le nombre
 * de niveaux n'est PAS figé à cinq — il se déduit du contenu, pour qu'un
 * changement de découpage plus tard reste une affaire de contenu.
 *
 * Politique : un niveau s'ouvre quand le précédent a été travaillé. « Travaillé »
 * veut dire au moins un exercice terminé, pas « parfaitement réussi » : la
 * pratique est un lieu d'entraînement, pas une seconde évaluation qui
 * verrouille. Un niveau déjà ouvert le reste — on peut toujours redescendre.
 */
class LevelPolicy
{
    /** Exercices à terminer dans un niveau pour ouvrir le suivant. */
    public const EXERCISES_TO_UNLOCK_NEXT = 1;

    /**
     * @param  array<int, int>  $exerciseCounts  niveau → nombre d'exercices disponibles
     * @param  array<int, int>  $completedPerLevel  niveau → exercices terminés par l'élève
     * @return array<int, array{level: int, exerciseCount: int, completedCount: int, unlocked: bool, reason: ?string}>
     */
    public static function levels(array $exerciseCounts, array $completedPerLevel): array
    {
        $levels = array_keys($exerciseCounts);
        sort($levels);

        $out = [];
        foreach ($levels as $index => $level) {
            $available = $exerciseCounts[$level] ?? 0;
            $done = $completedPerLevel[$level] ?? 0;

            if ($available === 0) {
                $out[] = self::row($level, 0, $done, false, 'Aucun exercice disponible pour l\'instant.');

                continue;
            }
            if ($index === 0) {
                $out[] = self::row($level, $available, $done, true, null);

                continue;
            }

            $previous = $levels[$index - 1];
            $previousDone = $completedPerLevel[$previous] ?? 0;
            $unlocked = $previousDone >= self::EXERCISES_TO_UNLOCK_NEXT || $done > 0;

            $out[] = self::row(
                $level, $available, $done, $unlocked,
                $unlocked ? null : "Termine un exercice du niveau {$previous} pour ouvrir celui-ci.",
            );
        }

        return $out;
    }

    /**
     * Le niveau à conseiller : le plus haut niveau ouvert qui reste à finir,
     * sinon le dernier ouvert.
     */
    public static function recommendedLevel(array $levels): ?int
    {
        $unlocked = array_values(array_filter($levels, fn ($l) => $l['unlocked']));
        if ($unlocked === []) {
            return null;
        }
        foreach ($unlocked as $level) {
            if ($level['completedCount'] < $level['exerciseCount']) {
                return $level['level'];
            }
        }

        return end($unlocked)['level'];
    }

    private static function row(int $level, int $count, int $done, bool $unlocked, ?string $reason): array
    {
        return [
            'level' => $level,
            'exerciseCount' => $count,
            'completedCount' => $done,
            'unlocked' => $unlocked,
            'reason' => $reason,
        ];
    }
}
