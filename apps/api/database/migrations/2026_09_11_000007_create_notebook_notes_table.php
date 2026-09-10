<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Le carnet de l'élève : ses notes et ses erreurs marquées, durables (cible
// §20). Les deux index couvrent d'emblée « Mes erreurs par chapitre » et
// « Mes erreurs par Learning Point » — sans construire ces tableaux de bord
// maintenant, mais sans rendre leur construction coûteuse plus tard.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notebook_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // nullOnDelete plutôt que cascade : une note reste utile à l'élève
            // même si la leçon disparaît du catalogue.
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('learning_point_id')->nullable()->constrained()->nullOnDelete();

            // Chaînes, pas des clés étrangères : contenu en fichiers versionnés.
            $table->string('exercise_id')->nullable();
            $table->string('question_id')->nullable();

            $table->text('content');
            // calcul | methode | lecture | signe | etourderie | autre
            $table->string('mistake_type')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'lesson_id']);
            $table->index(['user_id', 'learning_point_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notebook_notes');
    }
};
