<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Le passage d'un élève sur UN exercice, dans une séance.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('practice_session_id')->constrained()->cascadeOnDelete();

            // Une CHAÎNE, pas une clé étrangère : le contenu des exercices vit
            // dans des fichiers versionnés (content/practice/), jamais en base.
            // Même convention que learning_evidence.question_code et que
            // diagnostic_responses.question_id — le code est la source.
            $table->string('exercise_id');

            $table->unsignedTinyInteger('level');
            $table->string('status')->default('in_progress'); // in_progress | completed | skipped
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['practice_session_id', 'exercise_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_attempts');
    }
};
