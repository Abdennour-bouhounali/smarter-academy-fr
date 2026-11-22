<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le geste pédagogique de l'enseignant — « تدخّل ».
 *
 * Un enseignant voit une difficulté, agit (une observation, un suivi
 * individuel, un renforcement en classe, une révision de prérequis, une
 * leçon ou un exercice recommandé) et veut, plus tard, voir ce qui a suivi.
 *
 * `baseline` est l'état canonique de chaque élève visé, FIGÉ à la création :
 * la mesure (« ce qui a changé depuis ») compare cette photographie à l'état
 * d'aujourd'hui et à la preuve arrivée depuis — jamais une causalité.
 *
 * `note` est privée à l'enseignant ; `student_message` est ce que l'élève
 * voit, pour les seules recommandations. Deux colonnes parce que ce sont
 * deux destinataires.
 *
 * Le cahier de l'élève n'est pas touché : une intervention est une donnée
 * de l'ENSEIGNANT, jamais une note dans la كرّاسة de l'élève.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classroom_interventions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('learning_point_id')->nullable()->constrained('learning_points')->nullOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('kind', 32);
            $table->text('note')->nullable();
            $table->string('student_message', 500)->nullable();
            // open | closed
            $table->string('status', 16)->default('open');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->date('review_after')->nullable();
            // La signature qui a motivé le geste (type de signal), pour la trace.
            $table->string('source_signal', 48)->nullable();
            $table->json('baseline')->nullable();
            $table->unsignedTinyInteger('engine_version')->nullable();
            $table->timestamps();

            $table->index(['classroom_id', 'status', 'opened_at']);
            $table->index(['learning_point_id']);
        });

        Schema::create('classroom_intervention_students', function (Blueprint $table) {
            $table->id();
            // Nom de contrainte explicite : le nom généré dépasse les 64
            // caractères permis par MySQL.
            $table->unsignedBigInteger('classroom_intervention_id');
            $table->foreign('classroom_intervention_id', 'cis_intervention_fk')->references('id')->on('classroom_interventions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['classroom_intervention_id', 'student_id'], 'cis_intervention_student_unique');
            $table->index(['student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_intervention_students');
        Schema::dropIfExists('classroom_interventions');
    }
};
