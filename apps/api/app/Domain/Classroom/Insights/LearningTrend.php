<?php

namespace App\Domain\Classroom\Insights;

use App\Domain\Progress\Engine\MasteryState;

/**
 * Lire un MOUVEMENT dans les statuts canoniques — sans en inventer un second.
 *
 * Les statuts du moteur (gap < reinforce < mastered) sont ordonnés ;
 * « unassessed » ne l'est pas : ce n'est pas un niveau bas, c'est l'absence
 * de preuve. Passer de « non évalué » à « ثغرة » n'est donc pas un recul,
 * c'est une PREMIÈRE évaluation — et c'est ce que dit `direction()`.
 *
 * Fonctions pures, sans base : l'aperçu d'un élève, les changements d'une
 * classe, les signaux et la mesure d'une intervention lisent tous la même
 * définition de « a progressé », « a reculé », « stable ».
 */
final class LearningTrend
{
    public const IMPROVED = 'improved';

    public const DECLINED = 'declined';

    public const UNCHANGED = 'unchanged';

    public const FIRST_ASSESSED = 'first_assessed';

    public const NOT_ASSESSED = 'not_assessed';

    /** Portée d'une difficulté sur un point, dans une classe. */
    public const SCOPE_NONE = 'none';

    public const SCOPE_ISOLATED = 'isolated';

    public const SCOPE_SMALL_GROUP = 'small_group';

    public const SCOPE_CLASS_WIDE = 'class_wide';

    /** Le rang d'un statut évalué ; null pour « non évalué ». */
    public static function rank(?string $status): ?int
    {
        return match ($status) {
            MasteryState::STATUS_GAP => 0,
            MasteryState::STATUS_REINFORCE => 1,
            MasteryState::STATUS_MASTERED => 2,
            default => null,
        };
    }

    /**
     * Le mouvement entre deux statuts.
     *
     * `$from` null ou « unassessed » : rien à comparer — première évaluation
     * si `$to` est évalué, sinon toujours non évalué.
     */
    public static function direction(?string $from, ?string $to): string
    {
        $a = self::rank($from);
        $b = self::rank($to);

        if ($b === null) {
            return $a === null ? self::NOT_ASSESSED : self::UNCHANGED;
        }
        if ($a === null) {
            return self::FIRST_ASSESSED;
        }

        return $b > $a ? self::IMPROVED : ($b < $a ? self::DECLINED : self::UNCHANGED);
    }

    /**
     * Combien la difficulté sur un point est partagée : aucune, un élève,
     * un groupe, toute la classe. La moyenne cache cette distinction ; le
     * nombre d'élèves en « ثغرة » parmi les ÉVALUÉS la montre.
     */
    public static function difficultyScope(int $gap, int $assessed): string
    {
        if ($gap <= 0) {
            return self::SCOPE_NONE;
        }
        if ($gap < (int) config('teacher_insights.signals.class_difficulty_min_students', 2)) {
            return self::SCOPE_ISOLATED;
        }
        if ($assessed >= (int) config('teacher_insights.signals.class_wide_min_assessed', 3)
            && $gap / max(1, $assessed) >= (float) config('teacher_insights.signals.class_wide_share', 0.5)) {
            return self::SCOPE_CLASS_WIDE;
        }

        return self::SCOPE_SMALL_GROUP;
    }
}
