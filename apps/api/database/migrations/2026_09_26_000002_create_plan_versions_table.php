<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une VERSION d'offre — ce à quoi un abonnement se rattache.
     *
     * Pourquoi versionner : un abonnement activé à la main sous « Teacher
     * Pro, 5 classes » doit rester « 5 classes » quand l'administrateur
     * décide demain que Teacher Pro en vaut 10. Modifier l'offre en place
     * réécrirait silencieusement les conditions de tout le monde, sans
     * trace. Une version référencée par au moins un abonnement devient donc
     * IMMUABLE ; toute évolution est une nouvelle version, qui devient
     * `current`, l'ancienne passant `superseded`. C'est PlanAdminService qui
     * tient cette règle, pas le SQL — le message rendu doit expliquer quoi
     * faire.
     *
     *   draft       en préparation, modifiable, référencée par personne
     *   current     la version servie aux nouvelles activations
     *   superseded  remplacée ; les abonnements existants la gardent
     */
    public function up(): void
    {
        Schema::create('plan_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('status', 16)->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['plan_id', 'version']);
            $table->index(['plan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_versions');
    }
};
