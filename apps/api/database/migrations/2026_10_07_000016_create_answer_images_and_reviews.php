<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * RÉPONSES EN PHOTO et CORRECTION PAR L'ENSEIGNANT (prototype BEM `bahth-pgcd`,
 * décisions du propriétaire 2026-10-06 — EXERCISE_CONTRACT.md § « Image answers
 * and teacher validation »).
 *
 *  - `student_settings.practice_validation` : « self » (l'élève se corrige,
 *    défaut) ou « teacher » (« تصحيح الأستاذ », réglé élève par élève par
 *    l'enseignant d'une classe active).
 *  - `answer_images` : jusqu'à 3 photos de copie par étape, sur le disque PRIVÉ,
 *    réencodées (EXIF/GPS retirés, 1600 px), gardées 12 mois (`expires_at`).
 *    `annotation_path` = la copie annotée au stylo rouge par l'enseignant,
 *    une image À PART : l'original de l'élève n'est jamais modifié.
 *  - `answer_reviews` : une demande de correction par tentative. `kind` =
 *    « verdict » (la décision de l'enseignant EST l'issue : démonstration ou
 *    réponse en photo seulement) ou « feedback » (réponse saisie déjà jugée par
 *    le serveur ; l'enseignant ajoute un avis sur la rédaction et les photos).
 *  - `notifications` : la table standard de Laravel (canal `database`) — la
 *    cloche de l'élève. Aucun courriel (décision du propriétaire).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_settings', function (Blueprint $table) {
            $table->string('practice_validation', 16)->default('self')->after('practice_levels_open');
        });

        Schema::create('answer_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('question_attempt_id')->constrained('question_attempts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('disk_path');
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('height');
            $table->unsignedInteger('size');
            $table->string('annotation_path')->nullable();
            $table->foreignId('annotated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('annotated_at')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });

        Schema::create('answer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_attempt_id')->unique()->constrained('question_attempts')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('kind', 16);
            $table->string('status', 16)->default('pending');
            $table->string('verdict', 16)->nullable();
            $table->text('comment')->nullable();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->index(['student_id', 'status']);
        });

        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('answer_reviews');
        Schema::dropIfExists('answer_images');
        Schema::table('student_settings', function (Blueprint $table) {
            $table->dropColumn('practice_validation');
        });
    }
};
