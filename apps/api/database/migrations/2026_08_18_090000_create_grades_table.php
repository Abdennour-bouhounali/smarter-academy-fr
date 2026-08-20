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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();

            // Same free-text convention as users.grade / diagnostic_sessions.grade —
            // the grade catalogue in packages/core/curriculum/coursesData.js is the
            // source of truth for which codes exist ('6e', '5e', 'seconde', ...);
            // this table is a runtime index keyed by that same code, not a second
            // definition of it.
            $table->string('code')->unique();
            $table->string('name');

            // 'college' | 'lycee' — mirrors courseLevels[].id in coursesData.js.
            $table->string('level');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
