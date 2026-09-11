<?php

namespace App\Console\Commands;

use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Models\Subscription;
use Illuminate\Console\Command;

/**
 * Réconcilie les droits d'accès avec les abonnements.
 *
 *   php artisan smarter:sync-entitlements [--subscription=ID] [--dry-run]
 *
 * À quoi cela sert, et à quoi cela NE sert PAS : c'est de l'ENTRETIEN, pas
 * une barrière de sécurité. Les dates d'un abonnement sont copiées dans le
 * droit, si bien qu'un droit expire tout seul même si cette commande n'a pas
 * tourné depuis des semaines. Ne pas la lancer ne donne l'accès à personne.
 *
 * Elle existe pour les cas où l'état a été modifié SANS passer par le
 * service : import de données, correction manuelle en base, et — le jour
 * venu — rattrapage d'un webhook de fournisseur manqué.
 */
class SyncSubscriptionEntitlements extends Command
{
    protected $signature = 'smarter:sync-entitlements
        {--subscription= : ne synchroniser qu\'un abonnement, par identifiant}
        {--dry-run : afficher ce qui changerait, sans rien écrire}';

    protected $description = 'Met les droits d\'accès en accord avec les abonnements.';

    public function handle(SubscriptionEntitlementSynchronizer $sync): int
    {
        if ($id = $this->option('subscription')) {
            $subscription = Subscription::find($id);
            if (! $subscription) {
                $this->error("Abonnement {$id} introuvable.");

                return self::FAILURE;
            }

            if ($this->option('dry-run')) {
                $this->line('Mode simulation : aucune écriture.');
                $this->line('  abonnement '.$subscription->id.' — statut '.$subscription->status);

                return self::SUCCESS;
            }

            $result = $sync->sync($subscription);
            $this->info("Abonnement {$subscription->id} : {$result['action']}");

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->line('Mode simulation : aucune écriture.');
            $this->line('  abonnements à examiner : '.Subscription::count());

            return self::SUCCESS;
        }

        $tally = $sync->syncAll();

        $this->table(
            ['action', 'nombre'],
            collect($tally)->map(fn ($n, $action) => [$action, $n])->values()->all(),
        );

        return self::SUCCESS;
    }
}
