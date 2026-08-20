<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Lesson progression — where a student is within a lesson's learning journey
// (stage/module position, completed modules). This is deliberately a separate
// table from student_learning_point_progress (knowledge progression /
// mastery): completion is not mastery, and the two must never be collapsed.
// See docs/architecture/PROGRESS_MODEL.md for the cross-device merge
// semantics (union / latest-wins / monotonic status).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            // A row's existence already means the lesson was started, so there
            // is no 'not_started' value: in_progress | completed.
            $table->string('status')->default('in_progress');
            // Latest-wins position (module number); nullable because a lesson
            // can be marked started before any module is visited.
            $table->unsignedSmallInteger('current_module')->nullable();
            // Monotonic union of completed module ids — merges never remove.
            $table->json('completed_modules');
            // Client-reported; drives the latest-wins comparison across devices.
            $table->timestamp('last_activity_at');
            // Set once when status first becomes completed; never cleared.
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::drop('student_lesson_progress');
    }
};
