<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

/**
 * Le jeton Sanctum, sans une ÉCRITURE à chaque requête.
 *
 * Sanctum met `last_used_at` à jour à chaque appel authentifié : un UPDATE sur
 * `personal_access_tokens` pour chaque page, chaque cloche de notifications,
 * chaque sauvegarde de progression. Rien ne lit cette date à la seconde près
 * (aucun écran ne l'affiche) : on ne l'écrit que si la valeur connue a plus de
 * cinq minutes. Enregistré par AppServiceProvider (Sanctum::usePersonalAccessTokenModel).
 */
class PersonalAccessToken extends SanctumPersonalAccessToken
{
    public const LAST_USED_RESOLUTION_SECONDS = 300;

    public function save(array $options = [])
    {
        if ($this->exists && array_keys($this->getDirty()) === ['last_used_at']) {
            $previous = $this->getOriginal('last_used_at');
            if ($previous !== null && $this->asDateTime($previous)->gt(now()->subSeconds(self::LAST_USED_RESOLUTION_SECONDS))) {
                // Rien à écrire : on oublie la modification, comme si elle était enregistrée.
                $this->syncOriginalAttribute('last_used_at');

                return true;
            }
        }

        return parent::save($options);
    }
}
