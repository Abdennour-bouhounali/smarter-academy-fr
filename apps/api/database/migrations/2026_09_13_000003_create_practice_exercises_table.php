<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le REGISTRE des exercices, jumeau de lesson_modules et pour la même
     * raison : le contenu reste dans content/practice/**.
     *
     * `exercise_code` porte exactement la chaîne que exercise_attempts
     * .exercise_id stocke déjà. Volontairement PAS une clé étrangère depuis
     * cette table-là : l'historique d'un élève ne doit pas dépendre de la
     * présence d'une ligne de registre, ni casser si un exercice est retiré
     * du contenu. Le registre sert l'administration, pas la traçabilité.
     */
    public function up(): void
    {
        Schema::create('practice_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();

            $table->string('exercise_code');
            $table->unsignedTinyInteger('level');
            $table->string('title')->nullable();
            $table->unsignedSmallInteger('question_count')->default(0);

            $table->string('publication_status')->default('published');
            $table->timestamp('retired_at')->nullable();

            $table->timestamps();

            $table->unique(['lesson_id', 'exercise_code']);
            $table->index('exercise_code');
            $table->index('publication_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_exercises');
    }
};
