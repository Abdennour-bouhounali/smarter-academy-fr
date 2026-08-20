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
        Schema::create('learning_evidence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();

            // References a question id authored inline in the lesson's JSX — content
            // lives in the frontend by design (no `questions` table), same
            // code-is-the-source-of-truth convention as diagnostic_responses.question_id.
            $table->string('question_code');

            // Client-generated UUID, the idempotency key: a retried submission (a
            // dropped connection, a double-tap) with the same attempt_id is a no-op
            // rather than double-counted evidence.
            $table->string('attempt_id')->unique();

            // Computed CLIENT-SIDE. Unlike the diagnostic (server-owned questions,
            // server-graded via AnswerChecker), lesson questions live in JSX, so the
            // server cannot recompute correctness — it validates the student/lesson/
            // learning-point RELATIONSHIP instead (see ProgressEngine). This is a
            // deliberate, documented asymmetry from the diagnostic, not an oversight.
            $table->boolean('is_correct');

            // Always 'assessment' in practice — discovery/practice questions never
            // reach this endpoint (enforced client-side by the assessment.type check
            // AND is the only value ProgressEngine accepts server-side, as defense in
            // depth). Kept as a column rather than hard-coded so a future evidence
            // source (e.g. a teacher-entered assessment) has somewhere to say so.
            $table->string('assessment_type')->default('assessment');

            // Raw student answer, audit/evidence trail — same rationale as
            // diagnostic_responses.answer.
            $table->json('answer')->nullable();

            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->index(['user_id', 'lesson_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_evidence');
    }
};
