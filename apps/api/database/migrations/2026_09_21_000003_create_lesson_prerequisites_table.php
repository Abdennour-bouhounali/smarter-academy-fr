<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Prérequis PÉDAGOGIQUES entre leçons (« pour comprendre L6, avoir vu
     * L3 et L5 »). Affichés à l'élève avec son état de maîtrise ; JAMAIS un
     * verrou d'accès (LESSON_CONTRACT : la progression reste non bloquante).
     * Aucune donnée élève ici : la table est resynchronisée intégralement.
     */
    public function up(): void
    {
        Schema::create('lesson_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('prerequisite_lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['lesson_id', 'prerequisite_lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_prerequisites');
    }
};
