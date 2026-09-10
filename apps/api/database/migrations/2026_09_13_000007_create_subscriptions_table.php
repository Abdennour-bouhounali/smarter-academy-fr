<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'abonnement — indépendant du statut de compte (users.account_status).
     * « Compte actif, abonnement expiré » est valide, et c'est justement
     * pourquoi les deux ne partagent pas une colonne.
     *
     * Volontairement AGNOSTIQUE DU FOURNISSEUR : `provider` est une chaîne
     * libre et `external_reference` la référence opaque de ce fournisseur.
     * Aucune hypothèse Stripe n'est codée en dur, parce qu'aucun paiement
     * n'est intégré aujourd'hui — le jour où il le sera, c'est une valeur de
     * plus dans une colonne, pas une refonte.
     *
     * Dans cette version, l'administration est en LECTURE SEULE : ces lignes
     * ne seront écrites que par une future intégration de paiement. La table
     * existe pour que l'accès puisse un jour s'y adosser, pas pour être
     * remplie à la main.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('plan')->default('free');
            // free | active | expired | cancelled | pending
            $table->string('status')->default('free');

            $table->timestamp('started_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->string('provider')->nullable();
            $table->string('external_reference')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
