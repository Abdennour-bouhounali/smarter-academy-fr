<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les faits « des N derniers jours » d'un élève (l'aperçu enseignant) lisent
 * question_attempts par (élève, date de réponse). Sans cet index, la requête
 * parcourt tout l'historique de l'élève.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_attempts', function (Blueprint $table) {
            $table->index(['user_id', 'submitted_at'], 'qa_user_submitted');
        });
    }

    public function down(): void
    {
        Schema::table('question_attempts', function (Blueprint $table) {
            $table->dropIndex('qa_user_submitted');
        });
    }
};
