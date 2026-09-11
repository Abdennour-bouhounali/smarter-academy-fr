<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le registre des évènements reçus d'un fournisseur — et le VERROU
     * d'idempotence.
     *
     * Un fournisseur de paiement livre ses évènements « au moins une fois » :
     * deux fois, trois fois, dans le désordre, ou des heures plus tard. La
     * garantie qu'il faut tenir est donc :
     *
     *     même évènement → traité UNE SEULE fois
     *
     * Cette garantie est portée par `unique(provider, event_id)`, EN BASE. Pas
     * par un cache, pas par un verrou mémoire, pas par un SELECT préalable :
     * deux requêtes concurrentes passeraient toutes les deux un SELECT et
     * traiteraient toutes les deux. C'est l'INSERT qui tranche, parce que la
     * base sérialise les écritures et qu'une seule des deux peut gagner.
     *
     * L'identité est `event_id`, l'identifiant du FOURNISSEUR. Jamais un
     * horodatage : deux évènements distincts peuvent partager une seconde, et
     * une date n'est pas une identité.
     *
     * ── Ce qui n'est PAS stocké ────────────────────────────────────────────
     * Pas le payload complet. Un corps de webhook de paiement transporte des
     * données personnelles et des détails de facturation dont l'application
     * n'a aucun usage. On garde une EMPREINTE (`payload_hash`), qui suffit à
     * détecter une re-livraison dont le contenu aurait changé, et rien d'autre.
     */
    public function up(): void
    {
        Schema::create('provider_events', function (Blueprint $table) {
            $table->id();

            $table->string('provider');
            // L'identité venue du fournisseur (`evt_...`).
            $table->string('event_id');
            $table->string('type');

            // pending | processed | failed | ignored
            $table->string('status')->default('pending');

            // L'horloge du FOURNISSEUR — sert à ordonner, jamais à identifier.
            // C'est elle qui permet de reconnaître un évènement périmé.
            $table->timestamp('occurred_at')->nullable();
            $table->timestamp('received_at');
            $table->timestamp('processed_at')->nullable();

            $table->unsignedSmallInteger('attempts')->default(0);
            // Borné : un message d'erreur de fournisseur peut être très long,
            // et une colonne TEXT ici inviterait à y déverser un payload.
            $table->string('failure_reason', 500)->nullable();

            // À quoi cet évènement se rapporte, pour le diagnostic.
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider_object_id')->nullable();

            $table->string('payload_hash', 64)->nullable();

            $table->timestamps();

            // LE verrou d'idempotence.
            $table->unique(['provider', 'event_id'], 'provider_events_provider_event_unique');
            // « Que reste-t-il à rejouer ? » — la question de la commande de
            // rattrapage et de l'écran d'administration.
            $table->index(['status', 'received_at']);
            // « Tout ce qui concerne CET abonnement fournisseur. »
            $table->index('provider_object_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_events');
    }
};
