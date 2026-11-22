<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « فضاء الألعاب » — le troisième jeu, « المستكشف » (plates-formes, niveaux).
 * Une partie = un niveau ; un niveau réussi ouvre le suivant ; jusqu'à trois
 * étoiles par niveau, calculées par le SERVEUR (MADAR_GAME.md §15).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('madar_runs', function (Blueprint $table) {
            // « المستكشف » : le niveau a-t-il été terminé (et pas trop vite) ?
            $table->boolean('completed')->default(false)->after('wave');
        });

        Schema::create('madar_level_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('game', 16);
            $table->unsignedSmallInteger('level');
            $table->unsignedInteger('best_score')->default(0);
            $table->unsignedTinyInteger('stars')->default(0);
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('completed_at', 3)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'game', 'level'], 'madar_level_progress_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('madar_level_progress');
        Schema::table('madar_runs', fn (Blueprint $table) => $table->dropColumn('completed'));
    }
};
