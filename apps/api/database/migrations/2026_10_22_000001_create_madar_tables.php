<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « مدار » — le jeu de l'espace élève (docs/architecture/MADAR_GAME.md).
 *
 * Deux systèmes restent séparés, comme pour le défi quotidien :
 *
 *   - la MAÎTRISE : chaque réponse de la « محطة التزوّد » entre par
 *     ProgressEngine comme une preuve ordinaire — aucune colonne de maîtrise ici ;
 *   - le JEU : cœurs, parties, scores, vaisseaux — ces tables, et elles seules.
 *
 * Un cœur ne s'achète pas : il se gagne en répondant juste (ou par la
 * dotation quotidienne que règle l'enseignant). Terminer une leçon ne débloque
 * rien dans le jeu (décision du propriétaire, 2026-10-22).
 */
return new class extends Migration
{
    public function up(): void
    {
        // L'état de jeu d'UN élève : ses cœurs, ses records, son vaisseau.
        Schema::create('madar_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('hearts')->default(0);
            // Le dernier jour (Alger) où la dotation quotidienne a été versée.
            $table->date('hearts_refilled_on')->nullable();
            $table->unsignedInteger('best_score')->default(0);
            $table->timestamp('best_at', 3)->nullable();
            $table->unsignedInteger('runs_count')->default(0);
            $table->unsignedInteger('stars_total')->default(0);
            $table->unsignedInteger('refuel_answered')->default(0);
            $table->unsignedInteger('refuel_correct')->default(0);
            $table->string('ship', 24)->default('sahm');
            $table->timestamps();
        });

        // Une PARTIE. Le serveur pose le début et la fin ; le score annoncé
        // par le client est borné par ce que la durée réelle rend possible.
        Schema::create('madar_runs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // La classe dans laquelle la partie compte (null : élève indépendant).
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->date('run_date');
            // Le dimanche (Alger) de la semaine : la saison du classement.
            $table->date('week_start');
            $table->unsignedInteger('seed');
            // in_progress | finished | abandoned
            $table->string('status', 16)->default('in_progress');
            $table->timestamp('started_at', 3);
            $table->timestamp('finished_at', 3)->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedInteger('claimed_score')->nullable();
            $table->unsignedInteger('score')->default(0);
            $table->unsignedSmallInteger('stars')->default(0);
            $table->unsignedTinyInteger('revives')->default(0);
            // Score annoncé au-delà du possible : ramené à la borne et signalé.
            $table->boolean('flagged')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'run_date']);
            $table->index(['classroom_id', 'week_start', 'score'], 'madar_runs_class_week_score');
        });

        // Une question de la « محطة التزوّد ». Servie SANS clé de réponse,
        // jugée par le serveur ; une réponse juste rend un cœur.
        Schema::create('madar_refuels', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('learning_point_id')->constrained('learning_points')->cascadeOnDelete();
            $table->string('exercise_code', 120);
            $table->string('question_id', 16);
            $table->string('item_key', 255);
            $table->string('template_key', 255)->nullable();
            $table->unsignedTinyInteger('difficulty')->nullable();
            $table->string('answer_type', 24);
            $table->string('reason', 24);
            $table->timestamp('served_at', 3);
            $table->timestamp('answered_at', 3)->nullable();
            $table->json('answer')->nullable();
            $table->string('outcome', 24)->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedTinyInteger('hearts_awarded')->default(0);
            // attempt_id de la preuve (learning_evidence) — la clé d'idempotence.
            $table->uuid('evidence_attempt_id')->unique();
            $table->timestamps();

            $table->index(['user_id', 'served_at']);
            $table->index(['classroom_id', 'served_at']);
            $table->index(['learning_point_id']);
        });

        // Les réglages de l'enseignant pour UNE classe. Absence de ligne = défauts.
        Schema::create('madar_class_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->unique()->constrained('classrooms')->cascadeOnDelete();
            $table->boolean('enabled')->default(true);
            $table->boolean('competition_enabled')->default(true);
            $table->unsignedTinyInteger('daily_free_hearts')->nullable();
            $table->unsignedSmallInteger('daily_run_cap')->nullable();
            // Les leçons dont viennent les questions d'approvisionnement ([] = toutes).
            $table->json('lesson_codes')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('madar_class_settings');
        Schema::dropIfExists('madar_refuels');
        Schema::dropIfExists('madar_runs');
        Schema::dropIfExists('madar_profiles');
    }
};
