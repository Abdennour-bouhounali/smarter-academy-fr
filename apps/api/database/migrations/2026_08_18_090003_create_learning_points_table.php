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
        Schema::create('learning_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();

            // Stable, deterministic, human-readable — e.g. '6e_resolution-problemes_P3'.
            // Derived once from coursesData.js's pointsToLearn order and never reused
            // for a different competency: lesson JSX question metadata
            // (assessment.learningPointIds) and learning_evidence both reference this
            // code, so once it's live it's an append-only identifier, not a display index.
            $table->string('code')->unique();
            $table->string('title');
            $table->unsignedSmallInteger('order');

            // Advisory, nullable cross-reference to a diagnostic skill id
            // (App\Domain\Diagnostic\Grades\SixiemeDiagnosticProvider::SKILLS keys) —
            // NOT a foreign key, and NOT populated for most learning points: a
            // diagnostic skill is a coarser adaptive-graph node, a learning point is a
            // finer curriculum unit, and the two vocabularies only sometimes line up.
            // Left null wherever no genuine correspondence was verified. Nothing about
            // the diagnostic reads or writes this column — it exists purely so a future
            // read can join the two worlds where a real link exists.
            $table->string('diagnostic_skill_id')->nullable();

            // Set (never hard-deleted) once a learning point disappears from the
            // curriculum source but learning_evidence may already reference it —
            // deleting the row would cascade-orphan that evidence.
            $table->timestamp('retired_at')->nullable();

            $table->timestamps();

            $table->index(['lesson_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_points');
    }
};
