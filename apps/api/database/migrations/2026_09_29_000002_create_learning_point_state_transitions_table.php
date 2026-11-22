<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * L'HISTOIRE de l'état canonique d'un couple (élève, learning point).
 *
 * student_learning_point_progress est un état courant : chaque preuve
 * l'écrase. Cette table garde, pour chaque preuve qui l'a fait bouger,
 * l'état AVANT et APRÈS — ce que le moteur a réellement calculé à ce
 * moment-là, avec sa version. « Où en était-il la semaine dernière ? » est
 * la dernière ligne dont `occurred_at` précède la date.
 *
 * Append-only. Ce n'est pas un second état : student_learning_point_progress
 * reste LA vérité du présent, learning_evidence LA vérité de ce qui s'est
 * passé ; cette table est la trace de leur composition dans le temps.
 *
 *   origin = live      écrite par ProgressEngine::advance, dans la
 *                      transaction de la preuve
 *            replay    un rejeu (changement de version du moteur) a changé
 *                      l'état — à montrer comme « recalcul », pas comme un
 *                      apprentissage
 *            backfill  reconstruite après coup depuis la preuve
 *                      (smarter:mastery:transitions-backfill)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_point_state_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('learning_point_id')->constrained('learning_points')->cascadeOnDelete();
            $table->foreignId('learning_evidence_id')->nullable()->constrained('learning_evidence')->nullOnDelete();
            // null = aucune ligne d'état avant : « non évalué ».
            $table->string('status_before', 16)->nullable();
            $table->string('status_after', 16);
            $table->string('reason_after', 32)->nullable();
            $table->decimal('confidence_before', 4, 3)->nullable();
            $table->decimal('confidence_after', 4, 3);
            $table->unsignedTinyInteger('engine_version');
            $table->string('origin', 12)->default('live');
            // L'heure de la PREUVE (submitted_at), pas celle de l'écriture.
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['user_id', 'learning_point_id', 'occurred_at'], 'lpst_user_lp_occurred');
            $table->index(['learning_point_id', 'occurred_at'], 'lpst_lp_occurred');
            $table->index(['user_id', 'occurred_at'], 'lpst_user_occurred');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_point_state_transitions');
    }
};
