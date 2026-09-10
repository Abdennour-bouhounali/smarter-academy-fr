<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le signalement d'un élève — « Signaler un problème ».
     *
     * Principe directeur : l'élève ne désigne JAMAIS le contenu fautif. Il
     * choisit une catégorie, écrit une note s'il veut, et c'est tout. Le
     * contexte (leçon, module, étape, exercice, question, tentative) est
     * capté automatiquement et RÉSOLU CÔTÉ SERVEUR à partir des codes : les
     * clés étrangères ne viennent jamais du client.
     *
     * Les codes sont conservés À CÔTÉ des clés étrangères, et pas à leur
     * place : un signalement doit rester lisible même si le contenu qu'il
     * vise disparaît du registre. C'est une archive, pas une jointure.
     *
     * `fingerprint` est la clé d'agrégation déterministe (§17 de la spec) :
     * même leçon + même module/exercice + même question + même catégorie =
     * même empreinte. Vingt-cinq élèves qui butent sur la même question
     * forment un seul problème, sans recourir à un regroupement flou.
     */
    public function up(): void
    {
        Schema::create('student_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // --- Contexte résolu côté serveur (nullOnDelete : on garde le
            // signalement même si le registre change) ---
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lesson_module_id')->nullable()->constrained('lesson_modules')->nullOnDelete();

            // --- Contexte tel que l'élève l'a vécu, en clair ---
            $table->string('lesson_code')->nullable();
            $table->unsignedSmallInteger('module_number')->nullable();
            $table->string('step')->nullable();
            $table->string('exercise_code')->nullable();
            $table->string('question_id')->nullable();
            $table->string('practice_session_id')->nullable();
            $table->foreignId('question_attempt_id')->nullable()->constrained()->nullOnDelete();

            // content_error | wrong_answer | unclear_question | technical_problem
            // | display_problem | interaction_problem | typo | other
            $table->string('category');
            $table->text('note')->nullable();

            // new | in_review | resolved | dismissed | duplicate
            $table->string('status')->default('new');
            // low | medium | high | critical
            $table->string('priority')->default('medium');

            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('duplicate_of_id')->nullable()->constrained('student_reports')->nullOnDelete();

            // Diagnostic technique — strictement ce qui aide à reproduire un
            // bug. Pas d'adresse IP, pas de donnée personnelle.
            $table->string('route')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('screen')->nullable();
            $table->string('app_version')->nullable();
            $table->string('error_ref')->nullable();

            $table->string('fingerprint', 64);

            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index('fingerprint');
            $table->index('category');
            $table->index(['lesson_id', 'lesson_module_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_reports');
    }
};
