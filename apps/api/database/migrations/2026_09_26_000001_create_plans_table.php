<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'OFFRE commerciale — configurée par l'administration, jamais par le code.
     *
     * Le produit algérien n'a AUCUN paiement en ligne : une offre est un
     * ensemble de limites et de fonctionnalités qu'un administrateur active
     * à la main (ou par code d'activation) après avoir reçu l'argent hors de
     * la plateforme. Ce que cette table porte, c'est l'IDENTITÉ commerciale
     * de l'offre ; ses limites vivent dans `plan_entitlements`, versionnées
     * par `plan_versions`, et son prix informatif dans `plan_prices`.
     *
     *   type            student | teacher — à qui l'offre s'adresse.
     *   status          draft | active | hidden | archived (voir Plan).
     *   is_default      L'offre EFFECTIVE de quiconque n'a pas d'abonnement
     *                   en cours : c'est elle qui rend le gratuit automatique
     *                   sans créer une ligne d'abonnement par compte.
     *   allows_requests L'utilisateur peut-il DEMANDER cette offre depuis la
     *                   plateforme ? Une demande n'active jamais rien — elle
     *                   dit à l'administration qu'il faut la contacter.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type', 16);
            $table->string('status', 16)->default('draft');
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->boolean('is_public')->default(false);
            $table->boolean('is_default')->default(false);
            $table->boolean('allows_requests')->default(true);
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['type', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
