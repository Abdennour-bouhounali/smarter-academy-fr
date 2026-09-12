<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * REPARTIR DE ZÉRO CÔTÉ ÉLÈVES — un geste d'exploitation, explicite et tracé.
 *
 * Pourquoi une commande, et pas un `DELETE FROM users` :
 *
 *   1. Elle DIT ce qu'elle va détruire avant de le faire, et compte les lignes
 *      liées (progression, abonnements, paiements, signalements). Un SELECT
 *      qu'on lit vaut mieux qu'un DELETE qu'on espère.
 *   2. Elle ne peut PAS emporter un administrateur. C'est le garde-fou qui
 *      empêche de se verrouiller hors de sa propre plateforme.
 *   3. Elle exige `--force` en plus de la confirmation : rien ici ne s'exécute
 *      par inadvertance, ni par copier-coller d'un historique de terminal.
 *
 * ── Ce qu'elle détruit ───────────────────────────────────────────────────
 * Les comptes ÉLÈVES et, par cascade des clés étrangères, tout ce qui leur
 * est rattaché : progression, tentatives, preuves d'apprentissage, carnets,
 * signalements, abonnements, paiements, droits d'accès, jetons.
 *
 * C'est IRRÉVERSIBLE. Sur une base qui contient de vrais élèves, cette
 * commande détruit leur travail. Elle existe pour un usage précis — vider une
 * base de recette ou une mise en production initiale peuplée de comptes de
 * test — et pour aucun autre.
 *
 *     php artisan smarter:purge-students --dry-run   # voir sans rien casser
 *     php artisan smarter:purge-students --force     # exécuter
 */
class PurgeStudentAccounts extends Command
{
    protected $signature = 'smarter:purge-students
                            {--dry-run : Compter et afficher, sans rien supprimer}
                            {--force : Confirmer la suppression définitive}';

    protected $description = 'Supprime TOUS les comptes élèves et leurs données liées. Ne touche jamais un administrateur.';

    public function handle(): int
    {
        // Les administrateurs sont hors de portée, par construction : c'est
        // ce qui garantit qu'on ne se ferme pas la porte au nez.
        $students = User::where('role', '!=', User::ROLE_ADMIN);
        $count = (clone $students)->count();
        $admins = User::where('role', User::ROLE_ADMIN)->count();

        $this->info("Comptes élèves visés : {$count}");
        $this->info("Administrateurs préservés : {$admins}");

        if ($count === 0) {
            $this->info('Rien à supprimer.');

            return self::SUCCESS;
        }

        $ids = (clone $students)->pluck('id');

        // Ce que la cascade emportera. On le montre AVANT, parce qu'une
        // cascade silencieuse est la façon la plus courante de détruire plus
        // que ce que l'on croyait.
        $this->newLine();
        $this->line('Données liées qui seront détruites par cascade :');
        foreach ([
            'student_lesson_progress', 'learning_evidence', 'practice_sessions',
            'notebook_notes', 'student_reports', 'diagnostic_sessions',
            'subscriptions', 'payments', 'entitlements', 'personal_access_tokens',
            'user_identities',
        ] as $table) {
            if (! DB::getSchemaBuilder()->hasTable($table)) {
                continue;
            }
            $column = $table === 'personal_access_tokens' ? 'tokenable_id' : 'user_id';
            if (! DB::getSchemaBuilder()->hasColumn($table, $column)) {
                continue;
            }
            $n = DB::table($table)->whereIn($column, $ids)->count();
            $this->line(sprintf('  %-28s %d', $table, $n));
        }
        $this->newLine();

        if ($this->option('dry-run')) {
            $this->warn('Simulation : rien n’a été supprimé.');

            return self::SUCCESS;
        }

        if (! $this->option('force')) {
            $this->error('Refus : ajoutez --force pour exécuter réellement.');

            return self::FAILURE;
        }

        if (! $this->confirm("Supprimer définitivement {$count} compte(s) élève et TOUTES leurs données ?", false)) {
            $this->info('Annulé.');

            return self::SUCCESS;
        }

        // Un par un plutôt qu'un DELETE de masse : les suppressions en
        // cascade définies au niveau du modèle ne s'appliquent qu'ainsi, et
        // le coût est sans importance pour un geste exceptionnel.
        $deleted = 0;
        foreach ((clone $students)->cursor() as $user) {
            $user->tokens()->delete();
            $user->delete();
            $deleted++;
        }

        $this->info("{$deleted} compte(s) élève supprimé(s). {$admins} administrateur(s) préservé(s).");

        return self::SUCCESS;
    }
}
