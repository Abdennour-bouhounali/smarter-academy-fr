<?php

namespace App\Domain\Madar;

use App\Models\MadarProfile;

/**
 * Les vaisseaux de « مدار » et ce qui les débloque. Rien ne s'achète et rien
 * ne vient d'une leçon terminée (décision du propriétaire, 2026-10-22) : un
 * vaisseau se gagne en VOLANT loin (record) ou en RÉPONDANT juste à la
 * « محطة التزوّد ». Miroir : apps/web/src/features/madar/engine/ships.js
 * (noms et couleurs côté client, règles ici).
 */
class MadarShips
{
    /** id → [critère, seuil] ; `null` = toujours ouvert. */
    public const CATALOGUE = [
        'sahm' => null,
        'saqr' => ['best', 800],
        'mudhannab' => ['refuel', 5],
        'nayzak' => ['best', 2500],
        'falak' => ['refuel', 20],
        'majarra' => ['best', 6000],
    ];

    public static function exists(string $id): bool
    {
        return array_key_exists($id, self::CATALOGUE);
    }

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

        return ($kind === 'best' ? (int) $profile->best_score : (int) $profile->refuel_correct) >= $threshold;
    }

    /** @return string[] */
    public static function unlocked(MadarProfile $profile): array
    {
        return array_values(array_filter(array_keys(self::CATALOGUE), fn ($id) => self::isUnlocked($id, $profile)));
    }

    /** @return array<int, array{id: string, unlocked: bool, rule: ?array{kind: string, threshold: int, progress: int}}> */
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
                    'progress' => $rule[0] === 'best' ? (int) $profile->best_score : (int) $profile->refuel_correct,
                ],
            ];
        }

        return $out;
    }
}
