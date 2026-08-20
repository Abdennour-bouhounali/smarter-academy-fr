<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('diagnostic_skill_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('diagnostic_sessions')->cascadeOnDelete();

            // References a skill id from the grade's PHP-defined competency graph
            // (app/Domain/Diagnostic/Grades/*) — same code-is-source-of-truth
            // convention as question_id above.
            $table->string('skill_id');

            // 'unassessed' | 'mastered' | 'reinforce' | 'gap'. See MasteryModel.
            $table->string('status')->default('unassessed');

            // 0..1 — the live confidence estimate driving both `status` and the
            // adaptive engine's "has this skill got enough evidence yet?" check.
            $table->decimal('confidence', 4, 3)->default(0.5);

            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedTinyInteger('correct_count')->default(0);

            // Array of {id, count} — which misconceptions showed up while
            // assessing this skill and how many times. Aggregated from
            // diagnostic_responses.misconception_id, not a separate table: a
            // misconception only has meaning in the context of the skill it was
            // observed on.
            $table->json('misconceptions')->nullable();

            $table->timestamp('last_assessed_at')->nullable();
            $table->timestamps();

            $table->unique(['session_id', 'skill_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_skill_assessments');
    }
};
