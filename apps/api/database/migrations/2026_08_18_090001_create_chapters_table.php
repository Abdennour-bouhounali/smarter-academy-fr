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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_id')->constrained()->cascadeOnDelete();

            // The chapter/domain id from the official curriculum JSON
            // (levels[grade].domains[].id, e.g. 'nombres_calculs') — code is the
            // source of truth for content, this column just stores its id.
            $table->string('code');
            $table->string('title');
            $table->unsignedSmallInteger('order')->default(0);

            $table->timestamps();

            $table->unique(['grade_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
