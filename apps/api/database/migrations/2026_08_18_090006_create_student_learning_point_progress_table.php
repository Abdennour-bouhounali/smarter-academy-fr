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
        // The "current mastery" rollup — one row per (student, learning point),
        // updated as learning_evidence accumulates. Deliberately a SEPARATE table
        // from diagnostic_skill_assessments (keyed by session_id + skill_id, not
        // user_id + learning_point_id): this is what guarantees a diagnostic
        // baseline is never silently overwritten by later lesson evidence — the
        // two live in disjoint tables with disjoint keys, not by extra guard logic.
        Schema::create('student_learning_point_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('learning_point_id')->constrained()->cascadeOnDelete();

            // 'unassessed' | 'mastered' | 'reinforce' | 'gap' — same vocabulary as
            // the diagnostic's App\Domain\Diagnostic\Support\MasteryModel, produced
            // here by a separate, parallel App\Domain\Progress\Support\MasteryModel
            // (not shared code — see that class's docblock for why).
            $table->string('status')->default('unassessed');
            $table->decimal('confidence', 4, 3)->default(0.5);

            $table->unsignedSmallInteger('attempts')->default(0);
            $table->unsignedSmallInteger('correct_count')->default(0);

            $table->timestamp('last_evidence_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'learning_point_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_learning_point_progress');
    }
};
