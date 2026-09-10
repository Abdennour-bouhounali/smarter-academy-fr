<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Une séance de pratique : un élève, une leçon, un niveau, une suite
// d'exercices. Volontairement SÉPARÉE de lesson_final_test_attempts, qui
// garde une seule ligne par (élève, leçon) écrasée à chaque envoi : une
// séance de pratique est un événement historique, pas un instantané.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_sessions', function (Blueprint $table) {
            $table->id();

            // UUID fourni par le client, comme diagnostic_sessions : c'est ce
            // qui rend l'ouverture idempotente (un double-clic, une reprise
            // après rechargement) et la séance rechargeable par son URL.
            $table->char('session_id', 36)->unique();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('level');

            // open | completed | abandoned
            $table->string('status')->default('open');

            $table->unsignedSmallInteger('exercises_completed')->default(0);
            $table->unsignedSmallInteger('questions_answered')->default(0);
            $table->unsignedSmallInteger('correct_count')->default(0);

            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'lesson_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_sessions');
    }
};
