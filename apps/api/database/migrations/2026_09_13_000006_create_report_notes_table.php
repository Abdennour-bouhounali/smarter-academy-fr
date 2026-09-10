<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Notes INTERNES d'administration sur un signalement.
     *
     * Elles ne sortent d'aucun point d'entrée destiné à l'élève — c'est une
     * règle de la spec (§16), et le seul endroit où elles sont sérialisées
     * est le détail admin d'un signalement.
     */
    public function up(): void
    {
        Schema::create('report_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index('student_report_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_notes');
    }
};
