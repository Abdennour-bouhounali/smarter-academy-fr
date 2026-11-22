<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « مدار » devient une salle de jeux : le jeu d'orbite (`orbit`) et
 * « دفاع الكوكب » (`defense`). Les cœurs, la محطة التزوّد, l'intégrité et les
 * réglages de l'enseignant sont COMMUNS ; une partie, un record et un
 * classement appartiennent à un jeu (MADAR_GAME.md §14).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('madar_runs', function (Blueprint $table) {
            $table->string('game', 16)->default('orbit')->after('user_id');
            // « دفاع الكوكب » : la vague atteinte (bornée par la durée réelle).
            $table->unsignedSmallInteger('wave')->nullable()->after('stars');
            $table->index(['classroom_id', 'game', 'week_start', 'score'], 'madar_runs_class_game_week_score');
        });

        Schema::table('madar_profiles', function (Blueprint $table) {
            $table->unsignedInteger('defense_best')->default(0)->after('best_at');
            $table->timestamp('defense_best_at', 3)->nullable()->after('defense_best');
            $table->unsignedSmallInteger('defense_best_wave')->default(0)->after('defense_best_at');
            $table->unsignedInteger('defense_runs')->default(0)->after('defense_best_wave');
        });

        Schema::table('madar_class_settings', function (Blueprint $table) {
            // Les jeux que l'enseignant ferme pour sa classe ([] = tous ouverts).
            $table->json('disabled_games')->nullable()->after('enabled');
        });
    }

    public function down(): void
    {
        Schema::table('madar_class_settings', fn (Blueprint $table) => $table->dropColumn('disabled_games'));
        Schema::table('madar_profiles', fn (Blueprint $table) => $table->dropColumn(['defense_best', 'defense_best_at', 'defense_best_wave', 'defense_runs']));
        Schema::table('madar_runs', function (Blueprint $table) {
            $table->dropIndex('madar_runs_class_game_week_score');
            $table->dropColumn(['game', 'wave']);
        });
    }
};
