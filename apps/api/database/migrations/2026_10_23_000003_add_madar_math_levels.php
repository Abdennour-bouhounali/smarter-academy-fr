<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les jeux de mathématiques s'ADAPTENT au niveau de l'élève : 50 niveaux,
 * trois sous-niveaux chacun, soit 150 positions (0…149). Le serveur garde
 * la position de chaque élève par jeu (`madar_math_progress`) et, pour chaque
 * partie, la position de départ et celle d'arrivée (`madar_runs.level_start /
 * level_end`) : le niveau, donc les points, se bornent par la position de
 * départ (MADAR_GAME.md §16).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('madar_math_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('game', 16);
            // La position où l'élève reprendra (0…149).
            $table->unsignedSmallInteger('position')->default(0);
            // La plus haute position jamais atteinte : elle ouvre les niveaux.
            $table->unsignedSmallInteger('best_position')->default(0);
            $table->unsignedInteger('rounds')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'game'], 'madar_math_progress_unique');
        });

        Schema::table('madar_runs', function (Blueprint $table) {
            $table->unsignedSmallInteger('level_start')->nullable()->after('wave');
            $table->unsignedSmallInteger('level_end')->nullable()->after('level_start');
        });
    }

    public function down(): void
    {
        Schema::table('madar_runs', fn (Blueprint $table) => $table->dropColumn(['level_start', 'level_end']));
        Schema::dropIfExists('madar_math_progress');
    }
};
