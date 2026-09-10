<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Une tentative sur UNE question — l'historique riche que la preuve ne porte
// pas. La preuve est ce que le moteur de maîtrise consomme ; la tentative est
// ce que l'élève et son carnet relisent. Ce n'est pas une duplication.
//
// La ligne naît à l'OUVERTURE de la question, pas à l'envoi de la réponse :
// c'est ce qui permet à hint_events de s'y rattacher, puisqu'un indice se
// demande AVANT de répondre. D'où trois colonnes nullables.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_attempt_id')->constrained()->cascadeOnDelete();

            // Dénormalisé volontairement : « mes erreurs » se lit alors sans
            // triple jointure.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('question_id');

            // Clé d'idempotence, jumelle de learning_evidence.attempt_id : un
            // renvoi (connexion coupée, double appui) est un non-événement.
            $table->char('attempt_uuid', 36)->unique();

            $table->json('submitted_answer')->nullable();
            $table->string('normalized_answer')->nullable();
            $table->string('outcome')->nullable();

            $table->unsignedTinyInteger('hints_used')->default(0);
            $table->string('misconception_id')->nullable();
            $table->unsignedSmallInteger('attempt_number')->default(1);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'outcome']);
            $table->index(['exercise_attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_attempts');
    }
};
