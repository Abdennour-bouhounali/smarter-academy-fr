<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Les LIMITES et FONCTIONNALITÉS d'une version d'offre — des données,
     * jamais des constantes dans le code.
     *
     *     classrooms.max              → 5
     *     students_per_classroom.max  → 35
     *     lessons.visibility          → true
     *     content.allowed_grades      → ["4am"]
     *
     * La liste des clés reconnues, leur type et leur valeur par défaut
     * vivent dans App\Domain\Plans\EntitlementKeys : c'est le seul vocabulaire
     * que l'administration peut écrire ici (une clé inconnue est refusée en
     * 422), et le seul que PlanEntitlementResolver sait lire. `value` est
     * du JSON pour porter indifféremment un entier, un booléen ou une liste.
     *
     * À ne PAS confondre avec `entitlements` : celle-ci dit si un ÉLÈVE a le
     * droit commercial d'ouvrir du contenu payant ; celle-ci dit ce qu'une
     * OFFRE permet.
     */
    public function up(): void
    {
        Schema::create('plan_entitlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_version_id')->constrained('plan_versions')->cascadeOnDelete();
            $table->string('key', 64);
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(['plan_version_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_entitlements');
    }
};
