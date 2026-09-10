<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le REGISTRE des modules — pas leur contenu.
     *
     * Le contenu d'un module vit dans son JSX et sa déclaration dans
     * `lesson.config.js`, et il doit y rester : il se relit en revue, il se
     * livre avec le code. Même frontière que content/practice pour les
     * exercices (voir ExerciseRepository).
     *
     * Ce que cette table apporte, c'est ce que le fichier ne peut pas porter :
     * un état de publication que le SERVEUR fait respecter. La synchro
     * (smarter:import-curriculum) possède l'IDENTITÉ — code, titre, étape ;
     * l'admin possède l'ÉTAT — publication_status. Une resynchro n'écrase
     * jamais une décision d'admin.
     *
     * `code` est le `id` du config ('00', '01'…), et c'est aussi ce que
     * student_lesson_progress.completed_modules stocke déjà sous forme de
     * chaînes — d'où `retired_at` plutôt qu'une suppression : effacer une
     * ligne orphelinerait une progression d'élève.
     */
    public function up(): void
    {
        Schema::create('lesson_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();

            $table->string('code');
            $table->unsignedSmallInteger('number');
            $table->string('slug')->nullable();
            $table->string('title');
            $table->text('description')->nullable();

            // prerequisite_check | trigger | discovery | manipulation |
            // formalization | practice_lab | evaluation
            $table->string('stage')->nullable();

            $table->unsignedSmallInteger('estimated_min')->nullable();
            $table->unsignedTinyInteger('difficulty')->nullable();

            // Nullable et non pas [] par défaut : 265 modules sur 1082 n'en
            // déclarent aucun (diagnostic, déclencheur, évaluation), et « ce
            // module n'enseigne aucun point » doit se distinguer de « on n'a
            // pas encore regardé ».
            $table->json('teaches_learning_point_codes')->nullable();

            $table->string('publication_status')->default('published');
            $table->timestamp('retired_at')->nullable();

            $table->timestamps();

            $table->unique(['lesson_id', 'code']);
            $table->index(['lesson_id', 'number']);
            $table->index('publication_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_modules');
    }
};
