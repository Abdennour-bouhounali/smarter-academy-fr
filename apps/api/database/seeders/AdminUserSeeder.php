<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Garantit l'existence de l'administrateur initial.
 *
 * IDEMPOTENT : `updateOrCreate` sur l'email. Rejouer les seeders dix fois ne
 * crée pas dix administrateurs, et — c'est le point important — ne réécrit
 * PAS le mot de passe d'un compte déjà présent. Un admin qui a changé son
 * mot de passe depuis /admin/account ne se le voit pas remis à la valeur
 * d'amorçage au prochain déploiement.
 *
 * Le mot de passe ne vit que sous forme de hachage (le cast 'hashed' du
 * modèle s'en charge, on passe ici par Hash::make explicitement pour que ce
 * soit lisible). Il n'est jamais affiché : la sortie ne mentionne que
 * l'email, sinon la valeur d'amorçage finirait dans les journaux de
 * déploiement.
 *
 * Les identifiants viennent de l'environnement (ADMIN_EMAIL / ADMIN_PASSWORD,
 * documentés dans .env.example) ; les valeurs par défaut sont celles de la
 * spec, pour qu'une installation neuve fonctionne sans configuration.
 */
class AdminUserSeeder extends Seeder
{
    /**
     * Le mot de passe de repli n'existe QU'EN DÉVELOPPEMENT.
     *
     * En production, un identifiant écrit dans le dépôt est un identifiant
     * public : n'importe qui ayant lu le code connaît le compte
     * d'administration. La production exige donc ADMIN_PASSWORD, et échoue
     * bruyamment s'il manque — un amorçage qui refuse de s'exécuter se
     * remarque, un admin au mot de passe connu ne se remarque pas.
     */
    private const DEV_FALLBACK_PASSWORD = 'Admin@2026';

    public function run(): void
    {
        $email = (string) env('ADMIN_EMAIL', 'admin@gmail.com');
        $password = (string) env('ADMIN_PASSWORD', '');

        if ($password === '') {
            if (app()->environment('production')) {
                throw new RuntimeException(
                    'ADMIN_PASSWORD est obligatoire en production. '
                    .'Définissez-le dans l\'environnement avant de lancer AdminUserSeeder.'
                );
            }

            $password = self::DEV_FALLBACK_PASSWORD;
        }

        $existing = User::where('email', $email)->first();

        $attributes = [
            'first_name' => 'Smarter',
            'last_name' => 'Admin',
            'role' => User::ROLE_ADMIN,
            'account_status' => User::STATUS_ACTIVE,
        ];

        // Le mot de passe n'est posé qu'à la CRÉATION. Voir le docblock :
        // une resynchro ne doit pas annuler un changement d'identifiant.
        if (! $existing) {
            $attributes['password'] = Hash::make($password);
        }

        User::updateOrCreate(['email' => $email], $attributes);

        // L'email, jamais le mot de passe.
        $this->command?->info(
            $existing
                ? "Administrateur déjà présent : {$email} (mot de passe inchangé)"
                : "Administrateur créé : {$email}"
        );

        if (! $existing && ! app()->environment('production') && env('ADMIN_PASSWORD', '') === '') {
            $this->command?->warn(
                'Mot de passe de développement utilisé. Définissez ADMIN_PASSWORD avant tout déploiement.'
            );
        }
    }
}
