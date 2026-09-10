<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// « Hint usage must be recorded as historical events » (cible §12).
//
// Une table plutôt qu'un simple compteur, pour une raison précise :
// question_attempts.hints_used dit COMBIEN, jamais QUAND. L'écart entre la
// demande d'un indice et l'envoi de la réponse mesure la lutte productive —
// une information qu'on ne peut pas reconstituer après coup. Une table peu lue
// ne coûte rien ; l'historique perdu ne se rattrape pas.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hint_events', function (Blueprint $table) {
            $table->id();
            // Sûr parce que la ligne question_attempts naît à l'ouverture de
            // la question, avant toute demande d'indice.
            $table->foreignId('question_attempt_id')->constrained()->cascadeOnDelete();

            $table->unsignedTinyInteger('hint_index');   // 1..3
            $table->string('hint_type');                 // look | direction | strategy
            $table->timestamp('requested_at');
            $table->timestamps();

            // Un indice se révèle une fois : le rejeu n'invente pas d'événement.
            $table->unique(['question_attempt_id', 'hint_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hint_events');
    }
};
