<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// How a lesson reached 'completed': 'path' (the student followed the learning
// journey to the final evaluation) or 'mastery' (the student took the
// always-open final evaluation directly — "Je pense déjà maîtriser" — and
// demonstrated sufficient mastery). Null while in progress. Kept on the
// lesson-progression row because it describes the journey, not the mastery
// itself (which lives in student_learning_point_progress).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_lesson_progress', function (Blueprint $table) {
            $table->string('completion_mode')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('student_lesson_progress', function (Blueprint $table) {
            $table->dropColumn('completion_mode');
        });
    }
};
