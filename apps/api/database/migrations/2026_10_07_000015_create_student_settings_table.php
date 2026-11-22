<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les RÉGLAGES d'un élève (2026-10-06) — une ligne par élève, créée à la
 * première modification ; absente = valeurs par défaut.
 *
 * Premier réglage : `practice_levels_open` — les cinq niveaux de difficulté de
 * l'espace d'exercices ouverts d'emblée, sans passer par les précédents (par
 * défaut : un niveau s'ouvre quand le précédent a un exercice terminé).
 * Qui le décide : l'ENSEIGNANT pour un élève membre actif d'une classe active,
 * l'élève lui-même sinon (StudentSettingsService). `updated_by` garde l'auteur.
 *
 * D'autres réglages viendront s'ajouter ici (décision du propriétaire).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('practice_levels_open')->default(false);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_settings');
    }
};
