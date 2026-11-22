<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le REGISTRE des ressources pédagogiques d'une leçon — manipulations
     * (type d'un registre fermé, cf. packages/core/curriculum/manipulationTypes.js),
     * méthodes (طريقة), situations (وضعية), exemples — telles que
     * `lesson.config.js` les DÉCLARE (`resources[]`).
     *
     * Même frontière que `lesson_modules` : l'identité et le rattachement
     * (points d'apprentissage rendus visibles, module hôte, éléments du manuel
     * cités) vivent ici pour l'API et l'analyse ; le CONTENU (texte, étapes,
     * composant) reste dans les fichiers versionnés. Un code disparu est
     * `retired_at`, jamais supprimé.
     */
    public function up(): void
    {
        Schema::create('lesson_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            // manipulation | method | situation | example
            $table->string('kind', 16);
            // Pour une manipulation : son type (divisor-explorer, euclidean-algorithm…)
            $table->string('type', 40)->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('module_number')->nullable();
            $table->json('learning_point_codes')->nullable();
            $table->json('source_element_ids')->nullable();
            $table->json('config')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamp('retired_at')->nullable();
            $table->timestamps();

            $table->unique(['lesson_id', 'code']);
            $table->index(['lesson_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_resources');
    }
};
