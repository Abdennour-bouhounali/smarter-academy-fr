<?php

namespace App\Domain\Access;

use App\Models\Entitlement;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * abonnement → droit d'accès. Rien d'autre.
 *
 * Ce service traduit un état d'abonnement FAISANT AUTORITÉ en lignes
 * `entitlements` de type `subscription`. Il n'autorise rien, ne regarde
 * aucune publication, ne sait pas ce qu'est une leçon payante, ne crée
 * aucune dérogation et ne traite aucun paiement. Cette étroitesse est le
 * but : c'est elle qui permet de brancher un jour un fournisseur de paiement
 * sans toucher à une seule ligne de la couche d'accès.
 *
 *     fournisseur → subscriptions → CE SERVICE → entitlements
 *                                                     ↓
 *                                            EntitlementService
 *                                                     ↓
 *                                               ContentAccess
 *
 * ── Les paiements ne sont jamais lus ───────────────────────────────────
 * La table `payments` n'apparaît pas dans ce fichier, et ne doit jamais y
 * apparaître. « Un paiement existe » et « l'accès est ouvert » sont deux
 * faits distincts qu'un remboursement sépare : c'est l'ABONNEMENT qui fait
 * autorité, lui seul. Un paiement réussi dont l'abonnement a été remboursé
 * n'ouvre rien.
 *
 * ── La règle, explicitement ────────────────────────────────────────────
 * Le vocabulaire vient de Subscription::STATUSES, tel qu'il existe déjà :
 *
 *   active    → droit ACTIF, de started_at à ends_at (null = sans terme)
 *   cancelled → droit ACTIF JUSQU'À ends_at, puis éteint par le temps.
 *               Résilier n'est pas se faire rembourser : la période déjà
 *               payée reste due à l'élève. Si ends_at est passé (ou absent,
 *               donc rien à honorer), le droit est révoqué.
 *   expired   → droit RÉVOQUÉ
 *   free      → aucun droit. Le palier gratuit est une règle, pas une ligne,
 *               et fabriquer ici un droit « free » contredirait le noyau.
 *   pending   → aucun droit. Un abonnement en attente n'a rien ouvert
 *               encore ; ouvrir sur « pending » donnerait l'accès avant le
 *               paiement, ce qui est exactement l'erreur que toute cette
 *               architecture existe pour éviter.
 *
 * ── Le temps reste la barrière, pas la synchronisation ─────────────────
 * Les dates sont COPIÉES dans le droit, si bien qu'un droit expire tout seul
 * même si ce service n'a pas tourné depuis des semaines
 * (Entitlement::isValid()). La synchronisation entretient l'état ; elle n'est
 * pas le rempart. Une décision d'accès reste juste sans elle.
 */
class SubscriptionEntitlementSynchronizer
{
    public function __construct(private EntitlementService $entitlements) {}

    /**
     * Les statuts qui ouvrent un droit — sous réserve des dates, que
     * Entitlement::isValid() applique ensuite.
     */
    private const GRANTING_STATUSES = [
        Subscription::STATUS_ACTIVE,
        Subscription::STATUS_CANCELLED,
    ];

    /**
     * Met le droit d'accès en accord avec UN abonnement.
     *
     * Idempotent : deux exécutions de suite produisent exactement le même
     * état. La ligne de droit est retrouvée par sa `reference` (voir
     * referenceFor), donc une deuxième passe MET À JOUR au lieu de créer un
     * doublon — sinon un travail planifié lancé toutes les heures aurait
     * fabriqué un droit par heure.
     *
     * @return array{action: string, entitlement: ?Entitlement}
     */
    public function sync(Subscription $subscription): array
    {
        $reference = self::referenceFor($subscription);

        return DB::transaction(function () use ($subscription, $reference) {
            $existing = Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)
                ->where('reference', $reference)
                ->lockForUpdate()
                ->first();

            if (! $this->grantsAccess($subscription)) {
                // Rien à ouvrir. Un droit déjà là est révoqué — jamais
                // supprimé : « cet élève a eu accès du 3 au 12 » est ce qu'un
                // audit vient chercher.
                if ($existing === null) {
                    return ['action' => 'none', 'entitlement' => null];
                }

                if ($existing->status === Entitlement::STATUS_REVOKED) {
                    return ['action' => 'unchanged', 'entitlement' => $existing];
                }

                $existing->update([
                    'status' => Entitlement::STATUS_REVOKED,
                    'revoked_at' => Carbon::now(),
                    'reason' => "Abonnement {$subscription->status}",
                ]);

                $this->entitlements->forget($subscription->user);

                return ['action' => 'revoked', 'entitlement' => $existing];
            }

            $attributes = [
                'user_id' => $subscription->user_id,
                'type' => Entitlement::TYPE_SUBSCRIPTION,
                // Les dates sont COPIÉES depuis l'abonnement, jamais
                // recalculées : l'abonnement fait autorité sur sa propre
                // période, et une date dérivée ici finirait par diverger de
                // ce que voit la comptabilité.
                'starts_at' => $this->effectiveStart($subscription),
                'expires_at' => $subscription->ends_at,
                'status' => Entitlement::STATUS_ACTIVE,
                'source' => $subscription->provider ?? 'subscription',
                'reference' => $reference,
                'reason' => null,
                'revoked_at' => null,
                'revoked_by' => null,
            ];

            if ($existing === null) {
                $entitlement = Entitlement::create($attributes);
                $this->entitlements->forget($subscription->user);

                return ['action' => 'created', 'entitlement' => $entitlement];
            }

            // Le propriétaire ne change JAMAIS. Un abonnement réattribué à un
            // autre compte doit produire un nouveau droit, pas déplacer
            // l'ancien : déplacer effacerait la trace de l'accès du premier
            // élève, qui a bel et bien eu lieu.
            unset($attributes['user_id']);

            $changed = $this->differs($existing, $attributes);
            if ($changed) {
                $existing->update($attributes);
                $this->entitlements->forget($subscription->user);
            }

            return ['action' => $changed ? 'updated' : 'unchanged', 'entitlement' => $existing];
        });
    }

    /** Tous les abonnements d'un élève. Utile après un changement de compte. */
    public function syncUser(User $user): array
    {
        $results = [];
        foreach ($user->subscriptions()->get() as $subscription) {
            $results[] = $this->sync($subscription);
        }

        $this->entitlements->forget($user);

        return $results;
    }

    /**
     * Réconcilie TOUT. Prévu pour une commande d'entretien, pas pour une
     * requête HTTP.
     *
     * @return array<string, int> le compte par action
     */
    public function syncAll(): array
    {
        $tally = ['created' => 0, 'updated' => 0, 'revoked' => 0, 'unchanged' => 0, 'none' => 0];

        Subscription::with('user')->chunkById(200, function ($chunk) use (&$tally) {
            foreach ($chunk as $subscription) {
                $result = $this->sync($subscription);
                $tally[$result['action']]++;
            }
        });

        return $tally;
    }

    /**
     * La date de DÉBUT du droit.
     *
     * Asymétrie volontaire avec la date de fin, et elle mérite d'être dite :
     *
     *   fin   → TOUJOURS celle de l'abonnement. C'est elle qui ferme l'accès ;
     *           l'avancer volerait du temps déjà payé.
     *   début → jamais dans le futur pour un abonnement DÉJÀ actif.
     *
     * Pourquoi : la date de début vient du fournisseur, donc d'une autre
     * horloge. Quelques secondes d'avance — ou un serveur qui retarde —
     * suffisaient à rendre le droit « pas encore commencé », et l'élève qui
     * venait de payer restait dehors. Constaté en conditions réelles
     * (phase 6.5) : l'accès est resté fermé après un vrai paiement.
     *
     * Ramener le début à « maintenant » n'accorde RIEN de plus : l'abonnement
     * est actif et payé, le droit allait de toute façon s'ouvrir. Cela évite
     * seulement une fenêtre de refus injustifié.
     *
     * ── Ce qui distingue un décalage d'une PLANIFICATION ────────────────
     * Une avance de quelques secondes est un artefact d'horloge. Une avance
     * d'une semaine est une intention commerciale : un abonnement qui
     * commence réellement plus tard doit garder sa date, et l'accès s'ouvrira
     * tout seul le jour venu (comportement documenté et testé).
     *
     * La correction se limite donc à une FENÊTRE ÉTROITE. Au-delà, la date du
     * fournisseur est respectée telle quelle.
     */
    private const CLOCK_SKEW_TOLERANCE_SECONDS = 300;

    private function effectiveStart(Subscription $subscription): ?Carbon
    {
        $start = $subscription->started_at;

        if ($start === null || $subscription->status !== Subscription::STATUS_ACTIVE) {
            return $start;
        }

        $now = Carbon::now();

        if (! $start->isFuture()) {
            return $start;
        }

        // Au-delà de la fenêtre : c'est une planification, on n'y touche pas.
        return $start->diffInSeconds($now, absolute: true) <= self::CLOCK_SKEW_TOLERANCE_SECONDS
            ? $now
            : $start;
    }

    /**
     * Cet abonnement ouvre-t-il un droit ?
     *
     * Ne juge que le STATUT. Les dates ne sont pas testées ici : elles sont
     * copiées dans le droit, qui les fait respecter à chaque lecture. Un
     * abonnement futur produit donc bien une ligne — inactive jusqu'à sa date
     * de début — ce qui est exactement ce qu'on veut : l'accès s'ouvrira tout
     * seul le jour venu, sans qu'une tâche ait besoin de repasser.
     *
     * L'exception est `cancelled` sans `ends_at` : il n'y a aucune période à
     * honorer, donc rien à ouvrir.
     */
    private function grantsAccess(Subscription $subscription): bool
    {
        if (! in_array($subscription->status, self::GRANTING_STATUSES, true)) {
            return false;
        }

        if ($subscription->status === Subscription::STATUS_CANCELLED) {
            return $subscription->ends_at !== null;
        }

        return true;
    }

    /**
     * L'identité STABLE d'un droit issu d'un abonnement.
     *
     * C'est la clé de l'idempotence : construite depuis l'identifiant interne
     * de l'abonnement, elle ne dépend ni de la date d'exécution, ni du statut,
     * ni des dates — sinon un renouvellement changerait la clé et créerait un
     * second droit à côté du premier.
     *
     * L'identifiant INTERNE et non `external_reference` : ce dernier est
     * nullable et appartient à un fournisseur qui n'existe pas encore. Le jour
     * où il existera, la référence restera valable telle quelle.
     */
    public static function referenceFor(Subscription $subscription): string
    {
        return 'subscription:'.$subscription->id;
    }

    /** @param array<string, mixed> $attributes */
    private function differs(Entitlement $entitlement, array $attributes): bool
    {
        foreach ($attributes as $key => $value) {
            $current = $entitlement->getAttribute($key);

            // Les dates se comparent par INSTANT, pas par chaîne : une même
            // date lue depuis la base et depuis un modèle en mémoire n'a pas
            // toujours la même représentation, et comparer les chaînes
            // déclencherait une écriture à chaque passage — donc une écriture
            // par abonnement à chaque tour de la tâche d'entretien.
            if ($current instanceof Carbon || $value instanceof Carbon) {
                if ($current === null || $value === null) {
                    // L'un des deux seulement est nul : c'est un changement
                    // (par exemple un abonnement qui reçoit une date de fin).
                    if ($current !== $value) {
                        return true;
                    }

                    continue;
                }

                if (! Carbon::parse($current)->equalTo(Carbon::parse($value))) {
                    return true;
                }

                continue;
            }

            if ($current !== $value) {
                return true;
            }
        }

        return false;
    }
}
