<?php

namespace App\Domain\Billing;

use InvalidArgumentException;

/**
 * Les fournisseurs reconnus, par leur nom.
 *
 * Une liste blanche explicite : le nom vient de l'URL du webhook, donc d'une
 * source publique. Résoudre une classe depuis cette valeur serait offrir un
 * point d'instanciation arbitraire ; on ne retient que ce qui a été enregistré
 * au démarrage (voir AppServiceProvider).
 *
 * Existe aussi pour les tests : un faux fournisseur s'enregistre ici, et toute
 * la chaîne d'idempotence se teste sans SDK ni réseau.
 */
class PaymentProviderRegistry
{
    /** @var array<string, PaymentProvider> */
    private array $providers = [];

    public function register(PaymentProvider $provider): void
    {
        $this->providers[$provider->name()] = $provider;
    }

    public function get(string $name): PaymentProvider
    {
        return $this->providers[$name]
            ?? throw new InvalidArgumentException("Fournisseur de paiement inconnu : {$name}");
    }

    public function has(string $name): bool
    {
        return isset($this->providers[$name]);
    }

    /** @return string[] */
    public function names(): array
    {
        return array_keys($this->providers);
    }
}
