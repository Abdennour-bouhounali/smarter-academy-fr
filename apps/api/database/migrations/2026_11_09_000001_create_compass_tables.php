<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « بوصلتي » (P1, 2026-11-09) — la jauge de départ et ses bandes. Contrat :
 * docs/architecture/YEAR_COMPASS.md.
 *
 * JAMAIS une preuve de maîtrise (aucune écriture dans learning_evidence) : ces
 * tables sont un SIGNAL pour l'élève et sa خطّة. Seul Domain/Compass les lit.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Où en est la classe, selon l'élève (« أين وصل قسمك؟ ») — un par élève.
        Schema::create('compass_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('pointer_mode', 16)->default('lesson'); // lesson | not_following
            $table->string('pointer_lesson', 80)->nullable();
            $table->timestamp('pointer_set_at')->nullable();
            $table->timestamps();
        });

        // Une jauge : sa portée (les cibles calculées par le client depuis le
        // calendrier et le réseau), son pointeur, son état.
        Schema::create('compass_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('grade', 8);
            $table->string('school_year', 9);
            $table->string('pointer_lesson', 80)->nullable();
            $table->string('pointer_source', 16); // student | default | teacher (P3)
            $table->json('targets');
            $table->string('status', 16)->default('active'); // active | finished
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        // Chaque question SERVIE, puis sa réponse corrigée par le serveur.
        Schema::create('compass_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compass_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('item_id', 32);
            $table->unsignedTinyInteger('level');
            $table->string('lesson_code', 80);
            $table->string('exercise_id', 120);
            $table->string('question_id', 40);
            $table->json('answer')->nullable();
            $table->boolean('correct')->nullable();
            $table->boolean('unsure')->default(false);
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'lesson_code', 'exercise_id']);
        });

        // La DERNIÈRE bande connue de chaque كفاءة pour l'élève — ce que lit la خطّة.
        Schema::create('compass_item_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('item_id', 32);
            $table->string('band', 16); // solid | consolidate | start
            $table->foreignId('compass_session_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('measured_at');
            $table->timestamps();
            $table->unique(['user_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compass_item_states');
        Schema::dropIfExists('compass_answers');
        Schema::dropIfExists('compass_sessions');
        Schema::dropIfExists('compass_profiles');
    }
};
