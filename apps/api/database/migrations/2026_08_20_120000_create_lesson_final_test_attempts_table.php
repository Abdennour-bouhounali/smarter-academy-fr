<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The student's LATEST final-test (evaluation-module) attempt for a lesson —
// score + full per-question review, so revisiting the final module always
// shows the last completed attempt instead of a blank quiz, until the
// student explicitly redoes it. Deliberately separate from both
// learning_evidence (per-question rows, no attempt-level score/grouping) and
// student_lesson_progress (journey position only, never assessment content —
// see that table's own migration comment). One row per (user, lesson): each
// submit overwrites the previous attempt, no history kept.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_final_test_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();

            $table->unsignedSmallInteger('score');
            $table->unsignedSmallInteger('total_questions');

            // Full per-question review snapshot — everything the results screen
            // needs to render without recomputing: e.g.
            // [{questionCode, picked, isCorrect, correctAnswer}, ...]. Client-owned
            // shape (same trust boundary as learning_evidence.answer — lesson
            // questions live in JSX, not a questions table).
            $table->json('answers');

            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_final_test_attempts');
    }
};
