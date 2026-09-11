<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Les champs du FOURNISSEUR, à côté des champs locaux — jamais à leur place.
     *
     * C'est toute la discipline de cette migration : `status`, `plan`,
     * `started_at`, `ends_at` et `cancelled_at` restent le vocabulaire LOCAL,
     * et restent seuls à faire autorité sur l'accès. Les colonnes ajoutées ici
     * décrivent ce que le fournisseur, lui, raconte. Les deux peuvent diverger
     * — un webhook perdu, un remboursement traité à la main — et c'est
     * précisément pour pouvoir CONSTATER cette divergence qu'on garde les deux
     * versions au lieu d'écraser l'une par l'autre.
     *
     * `provider_status` n'est lu par AUCUNE décision d'accès. Il sert à
     * répondre « pourquoi l'écart ? » dans l'administration, rien d'autre. La
     * garde de test PaymentProviderBoundaryTest empêche qu'il dérive vers la
     * couche d'accès.
     *
     * Toutes les colonnes sont nullables (ou à défaut faux) : les lignes
     * existantes restent valides sans réécriture. La table est d'ailleurs vide
     * — rien n'écrit encore dans `subscriptions` — mais la migration ne s'y
     * fie pas.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // L'identité du client CHEZ le fournisseur. Indispensable pour
            // rattacher un webhook à un compte : l'évènement ne porte pas
            // notre user_id, et on ne le prendra JAMAIS du corps d'une requête
            // cliente (voir ProviderSubscriptionAdapter).
            $table->string('provider_customer_id')->nullable()->after('provider');

            // Le statut BRUT du fournisseur, conservé tel quel. Diagnostic
            // uniquement.
            $table->string('provider_status')->nullable()->after('external_reference');

            // Le tarif du fournisseur. `plan` reste notre vocabulaire à nous.
            $table->string('provider_price_id')->nullable()->after('provider_status');

            // La fin de période annoncée par le fournisseur. Distincte de
            // `ends_at`, qui reste la borne locale recopiée dans le droit.
            $table->timestamp('current_period_end')->nullable()->after('ends_at');

            // L'intention de résiliation — « ça s'arrête à la fin du mois »
            // n'est pas « c'est fini ». Sans ce drapeau, une résiliation
            // programmée serait indiscernable d'une résiliation immédiate.
            $table->boolean('cancel_at_period_end')->default(false)->after('cancelled_at');

            // L'horodatage de l'évènement fournisseur qui a produit l'état
            // courant. C'est la mémoire qui permet d'IGNORER un évènement
            // arrivé en retard, plutôt que de le laisser réécrire un état plus
            // récent (voir ProviderSubscriptionAdapter::isStale).
            $table->timestamp('provider_synced_at')->nullable();

            // Un abonnement du fournisseur = UNE ligne locale. C'est ce qui
            // rend une double livraison de `subscription.created` inoffensive.
            //
            // Le couple (provider, external_reference) et non la référence
            // seule : deux fournisseurs peuvent émettre la même chaîne. Les
            // deux colonnes étant nullables, MySQL autorise autant de lignes
            // « sans fournisseur » qu'on veut — les NULL n'entrent pas en
            // collision dans un index unique.
            $table->unique(['provider', 'external_reference'], 'subscriptions_provider_reference_unique');
            $table->index('provider_customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropUnique('subscriptions_provider_reference_unique');
            $table->dropIndex(['provider_customer_id']);
            $table->dropColumn([
                'provider_customer_id',
                'provider_status',
                'provider_price_id',
                'current_period_end',
                'cancel_at_period_end',
                'provider_synced_at',
            ]);
        });
    }
};
