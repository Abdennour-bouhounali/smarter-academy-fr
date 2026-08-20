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
        Schema::create('diagnostic_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('diagnostic_sessions')->cascadeOnDelete();

            // References a question id from the grade's PHP-defined question bank
            // (app/Domain/Diagnostic/Grades/*), not a database row — questions are
            // versioned content, not runtime data. Same "code is the source of
            // truth, DB just stores the id" convention as users.grade.
            $table->string('question_id');
            $table->string('skill_id');
            $table->string('representation');
            $table->unsignedTinyInteger('difficulty');

            $table->boolean('is_correct');

            // Set only when the wrong answer matched a known misconception
            // signature for this question (see AnswerChecker) — most incorrect
            // responses have no specific misconception identified, which is a
            // meaningful distinction the mastery model relies on (§7 of the brief:
            // "incorrect" vs "incorrect because of a specific misconception").
            $table->string('misconception_id')->nullable();

            // The raw structured answer the student submitted (shape depends on
            // `representation` — e.g. {value:'B'} for a choice, {numerator,
            // denominator} for a fraction). Kept for evidence/audit and to let a
            // future pass re-derive anything without re-asking the student.
            $table->json('answer');

            $table->unsignedInteger('response_time_ms')->nullable();

            $table->timestamps();

            $table->index(['session_id', 'skill_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_responses');
    }
};
