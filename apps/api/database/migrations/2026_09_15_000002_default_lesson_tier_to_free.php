<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le palier par défaut passe de `premium` à `free`.
     *
     * Pourquoi ce n'est pas un détail : tant qu'aucun droit d'accès n'était
     * appliqué, la valeur du défaut n'avait aucune conséquence — rien ne la
     * lisait. À partir du moment où ContentAccess consulte le palier, un
     * défaut `premium` devient un PIÈGE : toute leçon dont le catalogue
     * oublie `tier` se fermerait silencieusement aux élèves, et l'oubli ne se
     * verrait qu'en production, sur une leçon à la fois.
     *
     * Le défaut sûr est celui qui, en cas d'oubli, laisse la plateforme
     * ouverte. Le contenu payant se DÉCLARE ; il ne s'obtient pas par
     * distraction. (Même logique que la liste blanche de publication, en
     * sens inverse : là, l'inconnu ferme, parce que l'inconnu y est un état
     * de publication ; ici l'inconnu ouvre, parce que le palier absent
     * signifie « personne n'a décidé de le vendre ».)
     *
     * Aucune donnée existante n'est modifiée : les 133 leçons portent déjà
     * `free`. Cette migration protège les leçons à VENIR.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('tier')->default('free')->change();
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('tier')->default('premium')->change();
        });
    }
};
