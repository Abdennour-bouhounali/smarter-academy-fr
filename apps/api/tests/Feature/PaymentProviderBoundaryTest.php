<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * LA frontière, rendue exécutable.
 *
 * L'architecture entière tient sur une seule règle :
 *
 *     fournisseur → abonnement local → droit → accès
 *
 *     et JAMAIS  fournisseur → accès
 *
 * Une règle écrite dans un document se perd au troisième correctif urgent :
 * il suffira d'un `if ($stripeSubscription->status === 'active')` glissé dans
 * ContentAccess un vendredi soir pour que l'ouverture d'une leçon dépende de
 * la disponibilité d'un service tiers. Ce test rend ce geste impossible à
 * commettre sans le voir.
 *
 * Il ne teste pas un comportement, il teste une DÉPENDANCE — et c'est
 * volontaire : la couche d'accès est correcte aujourd'hui, ce qu'il faut
 * protéger c'est qu'elle le reste.
 */
class PaymentProviderBoundaryTest extends TestCase
{
    /** Les termes qui n'ont rien à faire dans la couche d'accès. */
    private const FORBIDDEN = [
        'Domain\\Billing',
        'Domain\Billing',
        'Stripe',
        'stripe',
        'PaymentProvider',
        'ProviderEvent',
        'webhook',
        // Ajoutés en phase 6 : l'encaissement ne doit pas plus entrer dans la
        // couche d'accès que le webhook. Ouvrir une leçon ne dépend d'aucune
        // session de paiement.
        'Checkout',
        'PlanCatalog',
    ];

    public function test_the_access_layer_never_depends_on_the_billing_layer(): void
    {
        $files = glob(app_path('Domain/Access/*.php'));

        $this->assertNotEmpty($files, 'La couche d\'accès est introuvable : le test se croirait vert pour rien.');

        foreach ($files as $file) {
            $source = file_get_contents($file);
            $name = basename($file);

            foreach (self::FORBIDDEN as $needle) {
                $this->assertStringNotContainsString(
                    $needle,
                    $source,
                    "{$name} mentionne « {$needle} ». La couche d'accès doit rester "
                    ."ignorante du fournisseur : elle ne lit que `subscriptions` et "
                    ."`entitlements`, jamais un service de facturation."
                );
            }
        }
    }

    /**
     * La couche d'accès ne lit pas non plus les PAIEMENTS.
     *
     * « Un paiement existe » et « l'accès est ouvert » sont deux faits
     * distincts qu'un remboursement sépare. C'est l'abonnement qui fait
     * autorité, lui seul.
     */
    public function test_the_access_layer_never_reads_payments(): void
    {
        foreach (glob(app_path('Domain/Access/*.php')) as $file) {
            $source = file_get_contents($file);

            // On vise l'USAGE (le modèle, la table), pas le mot dans un
            // commentaire — les docblocks expliquent justement pourquoi les
            // paiements ne sont pas lus, et interdire le mot les censurerait.
            foreach (['App\\Models\\Payment', 'Payment::', "table('payments')", '"payments"'] as $needle) {
                $this->assertStringNotContainsString(
                    $needle,
                    $source,
                    basename($file).' lit les paiements. Un paiement n\'ouvre jamais '
                    .'l\'accès par lui-même : seul l\'abonnement le fait.'
                );
            }
        }
    }

    /**
     * Le sens de la dépendance, vérifié dans l'autre direction : la
     * facturation a le droit de connaître l'accès (elle appelle le
     * synchroniseur), l'inverse est interdit. Ce test confirme que la
     * facturation passe bien par le synchroniseur EXISTANT plutôt que
     * d'écrire des droits elle-même — sinon il y aurait deux mécanismes
     * d'accès, et le second finirait par diverger du premier.
     */
    public function test_billing_never_writes_entitlements_directly(): void
    {
        $files = glob(app_path('Domain/Billing/*.php'))
            + glob(app_path('Domain/Billing/*/*.php'));

        if ($files === []) {
            $this->markTestSkipped('Aucune couche de facturation.');
        }

        foreach ($files as $file) {
            $source = file_get_contents($file);

            foreach (['Entitlement::create', 'Entitlement::updateOrCreate', 'new Entitlement'] as $needle) {
                $this->assertStringNotContainsString(
                    $needle,
                    $source,
                    basename($file).' écrit un droit directement. La facturation doit '
                    .'passer par SubscriptionEntitlementSynchronizer — un second chemin '
                    .'vers les droits finirait par diverger du premier.'
                );
            }
        }
    }

    /**
     * L'encaissement n'écrit JAMAIS un abonnement ni un droit.
     *
     * Ouvrir une session de paiement est une INTENTION, pas un fait. Si
     * CheckoutService créait un abonnement « en attente », il existerait un
     * second chemin vers l'accès — et c'est exactement ce que toute cette
     * architecture évite. L'unique écrivain reste le webhook.
     */
    public function test_checkout_never_writes_a_subscription_or_an_entitlement(): void
    {
        $checkout = app_path('Domain/Billing/CheckoutService.php');

        if (! file_exists($checkout)) {
            $this->markTestSkipped('Aucun service d\'encaissement.');
        }

        $source = file_get_contents($checkout);

        foreach ([
            'Subscription::create',
            'Subscription::updateOrCreate',
            'Entitlement::create',
            'Entitlement::updateOrCreate',
            'new Subscription',
            'new Entitlement',
            '->save()',
        ] as $needle) {
            $this->assertStringNotContainsString(
                $needle,
                $source,
                "CheckoutService écrit « {$needle} ». Ouvrir un paiement ne doit RIEN "
                .'ouvrir : seul le webhook signé fait foi.'
            );
        }
    }

    /**
     * Le tarif ne vient jamais du client.
     *
     * Le contrôleur d'encaissement ne doit lire qu'une clé d'offre. S'il
     * acceptait un identifiant de tarif, l'acheteur fixerait son prix.
     */
    public function test_the_checkout_controller_only_accepts_a_plan_key(): void
    {
        $controller = app_path('Http/Controllers/BillingCheckoutController.php');

        if (! file_exists($controller)) {
            $this->markTestSkipped('Aucun contrôleur d\'encaissement.');
        }

        $source = file_get_contents($controller);

        foreach (['price_id', 'priceId', 'amount_cents', "input('amount", "input('currency", "input('user_id"] as $needle) {
            $this->assertStringNotContainsString(
                $needle,
                $source,
                "Le contrôleur lit « {$needle} » depuis la requête. Le tarif, le montant, "
                .'la devise et l\'identité viennent du SERVEUR.'
            );
        }
    }

    /**
     * Le SDK du fournisseur reste confiné. Si demain un second fournisseur
     * arrive, seul ce dossier doit être dupliqué.
     */
    public function test_the_stripe_sdk_is_confined_to_its_own_directory(): void
    {
        $everywhere = array_merge(
            glob(app_path('Domain/*/*.php')),
            glob(app_path('Domain/*/*/*.php')),
            glob(app_path('Http/Controllers/*.php')),
            glob(app_path('Http/Controllers/*/*.php')),
            glob(app_path('Models/*.php')),
        );

        foreach ($everywhere as $file) {
            if (str_contains($file, '/Domain/Billing/Stripe/')) {
                continue; // Le seul endroit autorisé.
            }

            $source = file_get_contents($file);

            $this->assertStringNotContainsString(
                'use Stripe\\',
                $source,
                basename($file).' importe le SDK Stripe hors de Domain/Billing/Stripe/. '
                .'Tout le reste de l\'application doit parler en types neutres.'
            );
        }
    }
}
