<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « قنّاص القيم » (`sniper`), le premier jeu de MATHÉMATIQUES de « فضاء الألعاب »,
 * n'a besoin d'aucune colonne : son record se lit dans `madar_runs`.
 *
 * Ce qui est nouveau : l'enseignant ferme un jeu pour UN élève de sa classe
 * (en plus de la classe entière, `madar_class_settings.disabled_games`).
 * Une ligne = un jeu fermé pour un élève dans une classe (MADAR_GAME.md §16).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('madar_student_game_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('game', 16);
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['classroom_id', 'student_id', 'game'], 'madar_student_game_blocks_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('madar_student_game_blocks');
    }
};
