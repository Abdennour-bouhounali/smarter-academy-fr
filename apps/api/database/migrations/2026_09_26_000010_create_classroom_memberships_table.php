<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'APPARTENANCE d'un élève à une classe — une table, jamais une
     * colonne `classroom_id` sur l'élève.
     *
     * Une table parce qu'un élève peut appartenir à plusieurs classes (même
     * si l'interface en encourage une), et parce que l'histoire compte :
     * « il a quitté cette classe en mars » est une information. Une ligne
     * par couple (classe, élève), UNIQUE ; quitter puis revenir réactive la
     * ligne au lieu d'en créer une seconde.
     *
     *   active | left | removed
     *
     * Ce qui n'est JAMAIS touché par cette table : la progression, les
     * tentatives, la maîtrise, le cahier. L'appartenance est un contexte ;
     * l'apprentissage est à l'élève.
     */
    public function up(): void
    {
        Schema::create('classroom_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 16)->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            // join_code | invitation
            $table->string('joined_via', 16)->nullable();
            $table->unsignedBigInteger('invitation_id')->nullable();
            $table->foreignId('removed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['classroom_id', 'student_id']);
            $table->index(['student_id', 'status']);
            $table->index(['classroom_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_memberships');
    }
};
