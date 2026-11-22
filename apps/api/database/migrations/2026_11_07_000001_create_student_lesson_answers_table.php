<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * LES RÉPONSES DE L'ÉLÈVE PENDANT UNE LEÇON (pilote 2026-11-07, conseil + propriétaire) — gardées POUR L'ÉLÈVE seul : elles
 * reviennent quand il revient (rechargement, autre appareil, module revisité). Une table À PART de la progression : aucun
 * service enseignant, établissement, parent ou admin ne la lit ; jamais une preuve de maîtrise.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_lesson_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->json('answers');
            $table->timestamps();
            $table->unique(['user_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_lesson_answers');
    }
};
