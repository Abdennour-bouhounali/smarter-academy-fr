<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Les UNITÉS du manuel scolaire (الوحدة) — le niveau entre le chapitre
     * (ميدان) et la leçon (درس), phase 8.
     *
     * Miroir du catalogue (packages/core/curriculum/dz/units_*.json →
     * exportCurriculum.mjs → smarter:import-curriculum), comme `chapters` et
     * `lessons` : la base n'est pas la source, elle suit. Une unité porte ce
     * que le manuel place en tête d'unité (objectifs, référence au livre) ;
     * les leçons la référencent par `lessons.unit_id` (nullable : les leçons
     * « un sujet = une leçon » de la phase 7 n'ont pas d'unité).
     */
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->unsignedSmallInteger('number')->nullable();
            $table->json('objectives')->nullable();
            $table->json('source_topic_codes')->nullable();
            $table->json('textbook')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();

            $table->unique(['chapter_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
