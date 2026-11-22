<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « مدار » — l'intégrité de la « محطة التزوّد » (MADAR_GAME.md §5bis).
 *
 * On ne PROUVE pas qu'un élève a travaillé seul (un second téléphone échappe
 * à tout navigateur) ; on rend l'aide extérieure coûteuse et on protège la
 * maîtrise :
 *
 *   - un TEMPS par question (selon la difficulté, réglable par l'enseignant
 *     pour la classe et question par question) ; hors délai → aucun cœur ;
 *   - quitter la page pendant la question → aucun cœur ;
 *   - une réponse signalée (hors délai, page quittée, trop rapide) n'entre
 *     jamais dans la maîtrise ;
 *   - l'enseignant donne ou retire des cœurs, avec un motif.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('madar_refuels', function (Blueprint $table) {
            // Le délai FIGÉ au service (secondes) — un réglage changé ensuite ne le touche pas.
            $table->unsignedSmallInteger('time_limit_s')->nullable()->after('served_at');
            $table->unsignedInteger('response_ms')->nullable()->after('answered_at');
            $table->timestamp('left_at', 3)->nullable()->after('response_ms');
            $table->unsignedTinyInteger('left_count')->default(0)->after('left_at');
            // null | timeout | left | fast
            $table->string('flag', 16)->nullable()->after('hearts_awarded');
            $table->boolean('evidence_recorded')->default(false)->after('flag');
        });

        Schema::table('madar_class_settings', function (Blueprint $table) {
            // {"1": 45, "2": 60, …} — secondes par difficulté pour CETTE classe.
            $table->json('time_limits')->nullable()->after('lesson_codes');
        });

        // Le délai d'UNE question, posé par l'enseignant pour sa classe.
        Schema::create('madar_item_time_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->string('item_key', 255);
            $table->unsignedSmallInteger('seconds');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['classroom_id', 'item_key'], 'madar_item_limit_unique');
        });

        // Les cœurs donnés ou retirés par l'enseignant : un journal, jamais réécrit.
        Schema::create('madar_heart_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            // Demandé (+3, −2) puis réellement appliqué (plafond, plancher à 0).
            $table->smallInteger('delta');
            $table->smallInteger('applied');
            // effort | cheating | other
            $table->string('reason', 16);
            $table->string('note', 200)->nullable();
            // L'élève l'a vu (le message s'affiche une fois).
            $table->timestamp('seen_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'seen_at']);
            $table->index(['classroom_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('madar_heart_adjustments');
        Schema::dropIfExists('madar_item_time_limits');
        Schema::table('madar_class_settings', fn (Blueprint $table) => $table->dropColumn('time_limits'));
        Schema::table('madar_refuels', fn (Blueprint $table) => $table->dropColumn(['time_limit_s', 'response_ms', 'left_at', 'left_count', 'flag', 'evidence_recorded']));
    }
};
