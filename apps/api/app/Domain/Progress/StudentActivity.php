<?php

namespace App\Domain\Progress;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * « Actif » : ce que ça veut dire, à un seul endroit.
 *
 * DÉFINITION — un élève est actif à l'instant où il POSE UN GESTE
 * D'APPRENTISSAGE que le serveur enregistre déjà :
 *
 *   — il se connecte ;
 *   — il enregistre une progression de leçon ;
 *   — il soumet une preuve d'apprentissage ;
 *   — il répond à une question d'exercice.
 *
 * Ce n'est PAS « il a ouvert une page » : rien n'enregistre les vues, et
 * inventer un pipeline d'événements pour le savoir serait bâtir une
 * infrastructure entière pour une seule colonne. Les statistiques d'activité
 * mesurent donc l'engagement RÉEL, pas la fréquentation — c'est une mesure
 * plus stricte, et elle est documentée comme telle côté administration.
 *
 * Écriture volontairement AMORTIE : au plus une par tranche de cinq minutes.
 * Un élève qui répond à quinze questions d'affilée ne doit pas provoquer
 * quinze écritures sur sa ligne `users` — la précision gagnée serait nulle,
 * le coût bien réel.
 */
class StudentActivity
{
    /** Sous ce seuil, on considère que la trace est déjà à jour. */
    private const THROTTLE_MINUTES = 5;

    public static function touch(?User $user): void
    {
        if ($user === null) {
            return;
        }

        $last = $user->last_activity_at;

        if ($last !== null && $last->greaterThan(now()->subMinutes(self::THROTTLE_MINUTES))) {
            return;
        }

        // Écriture directe, sans passer par le modèle : `touch()` est appelé
        // au fil d'écritures métier déjà transactionnelles, et il ne doit ni
        // déclencher d'événement Eloquent, ni toucher `updated_at`, ni
        // écraser une modification concurrente de la ligne.
        DB::table('users')->where('id', $user->id)->update([
            'last_activity_at' => now(),
        ]);

        $user->setAttribute('last_activity_at', now());
    }
}
