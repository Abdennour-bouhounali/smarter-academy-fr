<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « التحدّي اليومي » — le défi quotidien (docs/architecture/DAILY_CHALLENGE.md).
 *
 * Deux systèmes restent séparés, ici comme dans le code :
 *
 *   - la MAÎTRISE : chaque réponse de défi entre par ProgressEngine comme une
 *     preuve ordinaire (learning_evidence) — aucune colonne de maîtrise ici ;
 *   - le JEU : points, série, classement — ces tables, et elles seules. Aucun
 *     point de défi ne touche jamais student_learning_point_progress.
 *
 * Un défi (daily_challenges) est UNE instance stable par (portée, jour) :
 * portée `classroom` (les mêmes questions pour toute la classe — c'est ce qui
 * rend l'analyse « Q3 : 61 % » et la compétition justes) ou `student` (un
 * élève indépendant, questions personnelles). La contrainte unique empêche
 * d'en régénérer un pour obtenir des questions plus faciles.
 */
return new class extends Migration
{
    public function up(): void
    {
        // La provenance d'une preuve de défi (`daily_challenge:{uuid}`) ne
        // tient pas dans les 36 caractères prévus pour un identifiant de séance
        // de pratique. Élargissement seul : aucune valeur existante ne change.
        Schema::table('learning_evidence', function (Blueprint $table) {
            $table->string('source_id', 64)->nullable()->change();
        });

        // Surcharges administrateur des valeurs de config/daily_challenge.php.
        Schema::create('daily_challenge_policies', function (Blueprint $table) {
            $table->id();
            $table->string('key', 32)->unique();
            $table->json('values');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Réglages de l'enseignant pour UNE classe. Absence de ligne = défauts.
        Schema::create('daily_challenge_class_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->unique()->constrained('classrooms')->cascadeOnDelete();
            $table->boolean('enabled')->default(true);
            $table->boolean('competition_enabled')->default(true);
            $table->boolean('show_top3')->default(false);
            $table->boolean('show_results_to_class')->default(false);
            $table->unsignedTinyInteger('question_count')->nullable();
            // null = adaptatif ; easy | medium | hard
            $table->string('difficulty', 16)->nullable();
            $table->json('lesson_codes')->nullable();
            $table->json('learning_point_codes')->nullable();
            $table->string('available_from', 5)->nullable();
            $table->string('available_until', 5)->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('daily_challenges', function (Blueprint $table) {
            $table->id();
            // classroom | student
            $table->string('scope_type', 16);
            $table->unsignedBigInteger('scope_id');
            $table->date('challenge_date');
            $table->json('config_snapshot');
            // generated | empty (rien à réviser : aucune question)
            $table->string('status', 16)->default('generated');
            $table->timestamps();

            $table->unique(['scope_type', 'scope_id', 'challenge_date'], 'dc_scope_date_unique');
            $table->index(['challenge_date']);
        });

        Schema::create('daily_challenge_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_challenge_id')->constrained('daily_challenges')->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('exercise_code', 120);
            $table->string('question_id', 16);
            $table->string('item_key', 255);
            $table->foreignId('learning_point_id')->constrained('learning_points')->cascadeOnDelete();
            $table->string('template_key', 255)->nullable();
            $table->unsignedTinyInteger('difficulty')->nullable();
            $table->string('answer_type', 24);
            // Pourquoi cette question : retrieval | reinforce | recent_mistake | recently_learned | review | warmup
            $table->string('reason', 24);
            $table->timestamps();

            $table->unique(['daily_challenge_id', 'position'], 'dcq_challenge_position_unique');
            $table->index(['learning_point_id']);
        });

        Schema::create('daily_challenge_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('daily_challenge_id')->constrained('daily_challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Copie de la portée du défi : les classements s'agrègent sans jointure.
            $table->string('scope_type', 16);
            $table->unsignedBigInteger('scope_id');
            $table->date('challenge_date');
            // in_progress | completed | expired
            $table->string('status', 16)->default('in_progress');
            $table->timestamp('started_at');
            $table->timestamp('expires_at');
            $table->timestamp('completed_at')->nullable();
            $table->unsignedTinyInteger('question_count');
            $table->unsignedTinyInteger('answered_count')->default(0);
            $table->unsignedTinyInteger('correct_count')->default(0);
            $table->unsignedTinyInteger('partial_count')->default(0);
            $table->unsignedInteger('base_score')->default(0);
            $table->unsignedInteger('speed_score')->default(0);
            $table->unsignedInteger('streak_bonus')->default(0);
            $table->unsignedInteger('total_score')->default(0);
            $table->unsignedInteger('penalty_applied')->default(0);
            $table->unsignedBigInteger('total_response_ms')->default(0);
            $table->unsignedInteger('average_response_time_ms')->nullable();
            $table->unsignedSmallInteger('streak_before')->default(0);
            $table->unsignedSmallInteger('streak_after')->default(0);
            // Rang dans la portée avant / après la clôture — pour « ↑ 2 », jamais inventé.
            $table->unsignedInteger('rank_before')->nullable();
            $table->unsignedInteger('rank_after')->nullable();
            $table->timestamps();

            $table->unique(['daily_challenge_id', 'user_id'], 'dca_challenge_user_unique');
            $table->index(['user_id', 'challenge_date']);
            $table->index(['scope_type', 'scope_id', 'challenge_date'], 'dca_scope_date_index');
        });

        Schema::create('daily_challenge_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_challenge_attempt_id')->constrained('daily_challenge_attempts')->cascadeOnDelete();
            $table->foreignId('daily_challenge_question_id')->constrained('daily_challenge_questions')->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            // Posé par le SERVEUR quand il sert la question ; jamais réécrit.
            $table->timestamp('started_at', 3);
            $table->timestamp('submitted_at', 3)->nullable();
            $table->unsignedInteger('response_time_ms')->nullable();
            $table->json('answer')->nullable();
            $table->string('outcome', 24)->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedSmallInteger('base_score')->default(0);
            $table->unsignedSmallInteger('speed_bonus')->default(0);
            $table->unsignedSmallInteger('final_score')->default(0);
            // attempt_id de la preuve (learning_evidence) — la même clé d'idempotence.
            $table->uuid('evidence_attempt_id')->unique();
            $table->timestamps();

            $table->unique(['daily_challenge_attempt_id', 'daily_challenge_question_id'], 'dcans_attempt_question_unique');
        });

        // Le score CUMULÉ par portée — la seule chose qu'un classement lit.
        Schema::create('daily_challenge_standings', function (Blueprint $table) {
            $table->id();
            $table->string('scope_type', 16);
            $table->unsignedBigInteger('scope_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('cumulative_score')->default(0);
            $table->unsignedInteger('challenges_completed')->default(0);
            $table->unsignedInteger('total_correct')->default(0);
            $table->unsignedInteger('total_answered')->default(0);
            $table->unsignedBigInteger('total_response_ms')->default(0);
            $table->unsignedInteger('penalties_total')->default(0);
            $table->date('last_completed_date')->nullable();
            // Pénalités de jours manqués déjà imputées jusqu'à cette date (incluse).
            $table->date('penalty_settled_through')->nullable();
            $table->timestamp('score_reached_at', 3)->nullable();
            $table->timestamps();

            $table->unique(['scope_type', 'scope_id', 'user_id'], 'dcs_scope_user_unique');
            $table->index(['scope_type', 'scope_id', 'cumulative_score'], 'dcs_scope_score_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_challenge_standings');
        Schema::dropIfExists('daily_challenge_answers');
        Schema::dropIfExists('daily_challenge_attempts');
        Schema::dropIfExists('daily_challenge_questions');
        Schema::dropIfExists('daily_challenges');
        Schema::dropIfExists('daily_challenge_class_settings');
        Schema::dropIfExists('daily_challenge_policies');
    }
};
