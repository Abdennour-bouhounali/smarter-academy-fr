<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le mot de passe devient FACULTATIF — parce qu'un compte Google n'en a
     * pas, et ne doit pas en avoir.
     *
     * L'alternative aurait été d'inscrire un mot de passe aléatoire pour ces
     * comptes. C'est le réflexe courant, et c'est un piège : ce secret existe
     * réellement en base, personne ne le connaît, personne ne peut donc le
     * révoquer ni le changer, et il rend `password` incapable de répondre à
     * la question « ce compte a-t-il une connexion par mot de passe ? ».
     *
     * NULL dit la vérité : ce compte s'authentifie autrement. Auth::attempt()
     * échoue proprement sur un hachage NULL (Hash::check() contre une chaîne
     * vide renvoie false), donc aucun mot de passe ne peut ouvrir un compte
     * Google — pas même la chaîne vide. Voir AuthController::login(), qui
     * refuse explicitement avant d'en arriver là.
     *
     * Additif et réversible : aucune ligne existante n'est modifiée — elles
     * ont toutes un mot de passe, et le gardent.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Irréversible en toute sécurité SI des comptes Google existent :
        // repasser la colonne en NOT NULL exigerait de leur inventer un mot
        // de passe, exactement ce que cette migration évite. On ne rétablit
        // donc la contrainte que si aucun compte sans mot de passe n'existe.
        $withoutPassword = \Illuminate\Support\Facades\DB::table('users')->whereNull('password')->count();

        if ($withoutPassword > 0) {
            throw new RuntimeException(
                "Impossible de revenir en arrière : {$withoutPassword} compte(s) sans mot de passe ".
                '(authentification Google). Rétablir NOT NULL obligerait à leur fabriquer un secret.'
            );
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
        });
    }
};
