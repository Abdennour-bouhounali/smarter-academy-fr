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
        // One evidence event (one question answered) can genuinely measure more
        // than one learning point (the spec allows an assessment question to list
        // several learningPointIds when it truly evaluates several competencies) —
        // a pivot avoids duplicating is_correct/answer per learning point.
        Schema::create('learning_evidence_learning_point', function (Blueprint $table) {
            $table->id();
            // Explicit table name: 'learning_evidence' is uncountable, so the
            // conventional pluralized guess ('learning_evidences') is wrong.
            $table->foreignId('learning_evidence_id')->constrained('learning_evidence')->cascadeOnDelete();
            $table->foreignId('learning_point_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Explicit name: the auto-generated one exceeds MySQL's 64-char
            // identifier limit for this long table name.
            $table->unique(['learning_evidence_id', 'learning_point_id'], 'evidence_learning_point_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_evidence_learning_point');
    }
};
