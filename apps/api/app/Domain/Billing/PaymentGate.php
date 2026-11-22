<?php

namespace App\Domain\Billing;

use App\Domain\Access\PaidAccessSwitch;
use App\Domain\Admin\ActivityLogger;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\PlatformSetting;
use App\Models\User;

/**
 * Le paiement en ligne est-il ouvert ? Le SEUL lecteur de config/billing.php › payments.open
 * (docs/FRANCE_REBUILD_PLAN.md §4ter).
 *
 *   défaut         config/billing.php › payments.open (PAYMENTS_OPEN, false)
 *   ↓ surchargé par
 *   administrateur platform_settings `payments` (PATCH /admin/payments)
 *
 * Fermé : aucun chemin ne COMMENCE un paiement (paiement, demande d'abonnement, devis → 403 `payments_closed`), et
 * les autorités d'accès (EntitlementService, PlanEntitlementResolver, SchoolCapacityService) répondent « accès
 * complet » avec le motif `payments_closed`. Rien n'est écrit dans `subscriptions` ni `entitlements` : rouvrir rend
 * les paliers, les offres et les limites tels qu'ils sont configurés.
 *
 * Jamais bloqués, ouvert ou fermé : les webhooks, la gestion d'un abonnement existant, les codes d'activation et
 * toute l'administration.
 *
 * Singleton mémorisé par requête (AppServiceProvider le vide à la frontière) : `decide()` le consulte à chaque
 * palier, une requête SQL par appel serait du gaspillage.
 */
class PaymentGate implements PaidAccessSwitch
{
    public const CLOSED_CODE = 'payments_closed';

    public const CLOSED_MESSAGE = 'Le paiement en ligne n’est pas ouvert.';

    public const NOT_CONFIGURED_CODE = 'payments_not_configured';

    public const NOT_CONFIGURED_MESSAGE = "Le paiement ne peut pas être ouvert : le fournisseur de paiement n'est pas configuré.";

    /** La ligne de l'administrateur, lue une fois par requête. */
    private ?PlatformSetting $row = null;

    private bool $loaded = false;

    public function __construct(private ActivityLogger $logger) {}

    public function isOpen(): bool
    {
        return $this->settings()['open'];
    }

    /** @return array{open: bool} la valeur effective */
    public function settings(): array
    {
        $values = $this->row()?->values;
        $values = is_array($values) ? $values : [];

        return ['open' => (bool) ($values['open'] ?? $this->defaultOpen())];
    }

    /** Le défaut de l'environnement (PAYMENTS_OPEN), que la ligne de l'administrateur surcharge. */
    public function defaultOpen(): bool
    {
        return (bool) config('billing.payments.open');
    }

    /** @throws PaymentsClosedException */
    public function assertOpen(): void
    {
        if (! $this->isOpen()) {
            throw new PaymentsClosedException;
        }
    }

    /**
     * Le fournisseur configuré peut-il prendre un paiement ? Des NOMS seulement, jamais une valeur : la réponse va
     * à l'écran d'administration.
     *
     * @return array{provider: string, configured: bool, missing: string[]}
     */
    public function providerStatus(): array
    {
        $name = (string) config('billing.provider', 'stripe');
        $missing = [];

        // Le bac à sable n'existe qu'en local / test (AppServiceProvider) : là, il compte comme configuré.
        if (! app(PaymentProviderRegistry::class)->has($name)) {
            $missing[] = 'BILLING_PROVIDER';
        } elseif ($name !== SandboxPaymentProvider::NAME) {
            if (blank(config('services.stripe.secret'))) {
                $missing[] = 'STRIPE_SECRET';
            }
            // Sans secret de webhook, l'argent serait pris et l'accès ne s'ouvrirait jamais.
            if (blank(config('services.stripe.webhook_secret'))) {
                $missing[] = 'STRIPE_WEBHOOK_SECRET';
            }
            $active = collect(config('billing.plans', []))->filter(fn ($plan) => ($plan['active'] ?? false) === true);
            if ($active->isEmpty()) {
                $missing[] = 'billing.plans';
            }
            foreach ($active as $key => $plan) {
                if (blank($plan['price_id'] ?? null)) {
                    $missing[] = 'STRIPE_PRICE_'.strtoupper((string) $key);
                }
            }
        }

        return ['provider' => $name, 'configured' => $missing === [], 'missing' => $missing];
    }

    /**
     * Qui a changé l'interrupteur en dernier (null = jamais : la valeur est le défaut de l'environnement).
     *
     * @return array{at: ?string, by: ?array{id: int, name: string}}|null
     */
    public function lastChange(): ?array
    {
        $row = $this->row();
        if ($row === null) {
            return null;
        }
        $by = $row->updated_by !== null ? User::find($row->updated_by) : null;

        return [
            'at' => optional($row->updated_at)->toIso8601String(),
            'by' => $by === null ? null : ['id' => $by->id, 'name' => trim($by->first_name.' '.$by->last_name)],
        ];
    }

    /**
     * L'administrateur ouvre ou ferme. Ouvrir est REFUSÉ tant que le fournisseur ne peut pas encaisser : un
     * interrupteur ouvert sur un paiement cassé est pire qu'un interrupteur fermé. Fermer est toujours permis.
     *
     * @param  array{open?: bool}  $changes
     * @return array{open: bool}
     *
     * @throws PaymentsNotConfiguredException
     */
    public function update(User $admin, array $changes): array
    {
        if (($changes['open'] ?? false) === true) {
            $status = $this->providerStatus();
            if (! $status['configured']) {
                throw new PaymentsNotConfiguredException($status['missing']);
            }
        }

        $before = $this->settings();

        $row = PlatformSetting::firstOrNew(['key' => PlatformSetting::PAYMENTS_KEY]);
        $values = is_array($row->values) ? $row->values : [];
        if (array_key_exists('open', $changes)) {
            $values['open'] = (bool) $changes['open'];
        }
        $row->values = $values;
        $row->updated_by = $admin->id;
        $row->save();

        $this->row = $row;
        $this->loaded = true;
        // Les limites d'offre résolues pendant CETTE requête décrivaient l'ancien état.
        app(PlanEntitlementResolver::class)->forget();

        $after = $this->settings();
        $this->logger->log($admin, ActivityLogger::PAYMENTS_SETTINGS_CHANGED, 'platform_setting', $row->id, $before, $after);

        return $after;
    }

    /** Oublie la ligne lue (frontière de requête). */
    public function forget(): void
    {
        $this->row = null;
        $this->loaded = false;
    }

    private function row(): ?PlatformSetting
    {
        if (! $this->loaded) {
            $this->row = PlatformSetting::where('key', PlatformSetting::PAYMENTS_KEY)->first();
            $this->loaded = true;
        }

        return $this->row;
    }
}
