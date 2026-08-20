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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();

            // coursesData.js's lesson `id` (e.g. 'resolution-problemes') — this is
            // what learning_evidence.lesson_id ultimately resolves from, and what
            // the frontend's lessonCode in POST /lessons/{lessonCode}/evidence is.
            $table->string('code');

            // The official ministry object id (levels[grade].domains[].official_objects[].id,
            // e.g. 'resolution_problemes') — kept alongside `code` because the two can
            // differ (hyphenation, renames) and both are useful for cross-referencing
            // back to the official program JSON.
            $table->string('official_object_code')->nullable();

            $table->string('title');
            $table->text('description')->nullable();

            // Mirrors coursesData.js's lesson status ('available' | 'coming_soon') —
            // informational only, not enforced against anything.
            $table->string('status')->default('coming_soon');
            $table->unsignedSmallInteger('order')->default(0);

            $table->timestamps();

            $table->unique(['chapter_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
