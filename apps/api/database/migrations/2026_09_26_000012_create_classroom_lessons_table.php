<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * La VISIBILITÉ d'une leçon pour UNE classe — le troisième axe d'accès.
     *
     *   publication  (lessons.publication_status) → le contenu peut-il être servi ?
     *   palier       (lessons.tier + entitlements)  → à qui ?
     *   classe       (cette table)                  → ce professeur l'a-t-il masquée ?
     *
     * Les trois sont composés dans ContentAccess, et seulement là. Masquer
     * ici ne touche JAMAIS la publication globale : une leçon masquée pour
     * la classe A reste visible pour la classe B et pour les élèves
     * indépendants. Inversement, « visible » ici n'ouvre jamais une leçon
     * non publiée.
     *
     * Absence de ligne = visible. Le professeur n'écrit que ce qu'il masque
     * (ou remet), et une leçon ajoutée au programme apparaît sans qu'il ait
     * à agir.
     *
     *   visible | hidden
     */
    public function up(): void
    {
        Schema::create('classroom_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('status', 16)->default('visible');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['classroom_id', 'lesson_id']);
            $table->index(['lesson_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_lessons');
    }
};
