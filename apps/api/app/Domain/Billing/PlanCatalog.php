<?php

namespace App\Domain\Billing;

/**
 * Les offres achetables — l'autorité serveur sur « combien ça coûte ».
 *
 * Une seule question lui est posée : « cette clé d'offre existe-t-elle, et à
 * quel tarif du fournisseur correspond-elle ? ». Le navigateur n'envoie qu'une
 * clé ; c'est ici qu'elle devient un prix.
 *
 * ── Ce qu'une offre INDISPONIBLE veut dire ───────────────────────────────
 * Une offre déclarée `active` mais sans identifiant de prix configuré n'est
 * PAS achetable. C'est le cas d'un environnement où les variables Stripe
 * n'ont pas été renseignées, et il vaut mieux afficher « Indisponible » que
 * proposer un bouton qui produira une erreur au clic. `purchasable()` est
 * donc distinct de `active` : l'un est une intention commerciale, l'autre un
 * fait technique.
 */
class PlanCatalog
{
    /**
     * Une offre par sa clé interne, ou null si elle n'existe pas.
     *
     * @return array<string, mixed>|null
     */
    public function find(string $key): ?array
    {
        $plan = config("billing.plans.{$key}");

        return is_array($plan) ? $plan : null;
    }

    /**
     * L'offre est-elle réellement achetable MAINTENANT ?
     *
     * Deux conditions : elle est proposée à la vente, et son tarif est
     * configuré chez le fournisseur.
     */
    public function purchasable(string $key): bool
    {
        $plan = $this->find($key);

        return $plan !== null
            && ($plan['active'] ?? false) === true
            && ! empty($plan['price_id']);
    }

    /**
     * L'identifiant de tarif CHEZ LE FOURNISSEUR.
     *
     * C'est la seule fonction qui traduit une clé interne en tarif, et elle
     * ne lit que la configuration serveur. Aucune entrée client n'atteint
     * jamais cette valeur.
     */
    public function priceIdFor(string $key): ?string
    {
        return $this->purchasable($key) ? $this->find($key)['price_id'] : null;
    }

    /**
     * Le catalogue tel qu'on le montre à l'élève.
     *
     * N'expose JAMAIS `price_id` : un identifiant de tarif du fournisseur
     * n'apprend rien à un élève, et le publier invite à essayer de le
     * remplacer. Le client n'a besoin que de la clé interne pour demander un
     * paiement.
     *
     * @return array<int, array<string, mixed>>
     */
    public function publicList(): array
    {
        $plans = config('billing.plans', []);

        return collect($plans)
            ->filter(fn ($plan) => ($plan['active'] ?? false) === true)
            ->map(fn ($plan, $key) => [
                'key' => $key,
                'name' => $plan['name'] ?? $key,
                'description' => $plan['description'] ?? null,
                'amountCents' => $plan['amount_cents'] ?? null,
                'currency' => $plan['currency'] ?? 'EUR',
                'interval' => $plan['interval'] ?? null,
                // « Proposée » et « achetable » sont deux choses : l'interface
                // doit pouvoir afficher une offre grisée plutôt que de la
                // faire disparaître.
                'purchasable' => $this->purchasable($key),
            ])
            ->values()
            ->all();
    }

    /**
     * La clé d'offre correspondant à un tarif du fournisseur.
     *
     * Le chemin INVERSE de `priceIdFor()`, et il sert à une seule chose :
     * étiqueter correctement `subscriptions.plan` quand un webhook arrive.
     * Sans lui, un abonnement payant s'enregistrait avec le plan par défaut
     * (`free`) et l'administration affichait « free » pour quelqu'un qui
     * venait de payer (défaut trouvé en phase 6.5, contre l'API réelle).
     *
     * Renvoie null pour un tarif inconnu — un ancien tarif retiré du
     * catalogue, par exemple. L'appelant conserve alors ce qu'il avait
     * plutôt que d'inventer une valeur.
     */
    public function keyForPriceId(?string $priceId): ?string
    {
        if ($priceId === null || $priceId === '') {
            return null;
        }

        foreach (config('billing.plans', []) as $key => $plan) {
            if (($plan['price_id'] ?? null) === $priceId) {
                return (string) $key;
            }
        }

        return null;
    }

    /** Le mode de facturation — `test` ou `live`. */
    public function mode(): string
    {
        return config('billing.mode', 'test');
    }

    public function isLive(): bool
    {
        return $this->mode() === 'live';
    }
}
