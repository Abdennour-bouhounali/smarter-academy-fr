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
        Schema::create('diagnostic_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Which grade's diagnostic this is (e.g. '6e') — not necessarily the
            // student's CURRENT grade (they may switch grades later; a completed
            // session stays a historical record of the grade it was taken for).
            // Free-text, same convention as users.grade: the grade catalogue
            // (packages/core) is the source of truth for valid values, not a DB enum.
            $table->string('grade');

            // 'in_progress' | 'completed'. No 'abandoned' state: an old
            // in_progress session is simply resumed on next visit — see
            // DiagnosticEngine::startOrResume().
            $table->string('status')->default('in_progress');

            // The question currently presented to the student, so a page refresh
            // re-shows the SAME question instead of silently skipping it or
            // generating a new one. Cleared once a response is recorded for it.
            $table->string('current_question_id')->nullable();
            $table->timestamp('current_question_presented_at')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            // The computed learning profile (strengths/reinforce/gaps grouping +
            // recommended starting point), persisted once at completion so it
            // stays stable even if the recommendation rules change later.
            // No separate `diagnostic_results` table: a result has no lifecycle
            // independent of its session, so it lives here as the session's
            // terminal-state snapshot rather than a 1:1 table.
            $table->json('profile_summary')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'grade', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_sessions');
    }
};
