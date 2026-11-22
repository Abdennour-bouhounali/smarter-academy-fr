<?php

namespace App\Domain\Madar;

use App\Models\MadarProfile;

/**
 * Les tourelles de « دفاع الكوكب » et ce qui les débloque — comme les
 * vaisseaux : TENIR des vagues (record de vague) ou RÉPONDRE juste à la
 * « محطة التزوّد ». Jamais une leçon terminée, jamais un achat.
 * Miroir : apps/web/src/features/madar/defense/constants.js › TURRETS.
 */
class MadarTurrets
{
    /** id → [critère, seuil] ; `null` = toujours ouvert. */
    public const CATALOGUE = [
        'laser' => null,
        'frost' => ['wave', 4],
        'pulse' => ['refuel', 3],
        'rail' => ['wave', 8],
        'tesla' => ['refuel', 12],
    ];

    public static function isUnlocked(string $id, MadarProfile $profile): bool
    {
        // `array_key_exists`, pas `??` : la règle `null` (« toujours ouvert ») est une valeur.
        if (! array_key_exists($id, self::CATALOGUE)) {
            return false;
        }
        $rule = self::CATALOGUE[$id];
        if ($rule === null) {
            return true;
        }
        [$kind, $threshold] = $rule;

        return ($kind === 'wave' ? (int) $profile->defense_best_wave : (int) $profile->refuel_correct) >= $threshold;
    }

    /** @return string[] */
    public static function unlocked(MadarProfile $profile): array
    {
        return array_values(array_filter(array_keys(self::CATALOGUE), fn ($id) => self::isUnlocked($id, $profile)));
    }

    public static function view(MadarProfile $profile): array
    {
        $out = [];
        foreach (self::CATALOGUE as $id => $rule) {
            $out[] = [
                'id' => $id,
                'unlocked' => self::isUnlocked($id, $profile),
                'rule' => $rule === null ? null : [
                    'kind' => $rule[0],
                    'threshold' => $rule[1],
                    'progress' => $rule[0] === 'wave' ? (int) $profile->defense_best_wave : (int) $profile->refuel_correct,
                ],
            ];
        }

        return $out;
    }
}
