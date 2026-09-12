<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * LES IDENTITÉS EXTERNES — « ce compte Google est ce compte Smarter ».
     *
     * Une TABLE, et non deux colonnes `google_id` / `provider` sur users.
     * Trois raisons, dans l'ordre d'importance :
     *
     *   1. Un élève peut avoir PLUSIEURS identités (Google aujourd'hui, un
     *      autre fournisseur demain) sans qu'on ajoute une colonne par
     *      fournisseur.
     *   2. L'unicité qui compte est (provider, provider_user_id) : une
     *      identité Google appartient à UN compte local, et un index unique
     *      composite le fait respecter par la BASE, pas par du code qu'on
     *      peut oublier d'appeler. C'est la garantie anti-détournement.
     *   3. Le mot de passe reste ce qu'il est — une méthode d'authentification
     *      parmi d'autres, pas l'identité elle-même.
     *
     * ── Ce qui n'est PAS stocké ──────────────────────────────────────────
     * Ni jeton d'accès, ni jeton de rafraîchissement Google. On ne demande
     * aucune permission d'API à Google : on lui demande QUI est la personne,
     * une fois, à la connexion. Conserver un jeton serait conserver un pouvoir
     * dont on n'a aucun usage — et une donnée de plus à protéger.
     *
     * `provider_email` est une ARCHIVE du courriel tel que Google l'a donné au
     * moment de la liaison. Il ne sert jamais à retrouver un compte (c'est le
     * rôle de provider_user_id, stable et non réattribuable) : il sert à
     * comprendre, plus tard, comment la liaison s'est faite.
     */
    public function up(): void
    {
        Schema::create('user_identities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // 'google'. Volontairement une chaîne et non un enum : ajouter un
            // fournisseur doit être une valeur de plus, pas une migration.
            $table->string('provider', 32);

            // L'identifiant STABLE chez le fournisseur (`sub` chez Google).
            // C'est lui qui fait l'identité — jamais le courriel, qui change.
            $table->string('provider_user_id');

            // Archive, pas clé de recherche (voir en-tête).
            $table->string('provider_email')->nullable();

            $table->timestamps();

            // LA garantie : une identité externe ne peut pas appartenir à deux
            // comptes locaux. Faite respecter par la base.
            $table->unique(['provider', 'provider_user_id']);
            // Un compte local n'a qu'une identité par fournisseur.
            $table->unique(['user_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_identities');
    }
};
