<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le REGISTRE des items d'évaluation — chaque question qui peut produire une
 * preuve, indexée avec ce que le serveur doit savoir SANS ouvrir le contenu :
 * ses learning points et leurs rôles, sa difficulté, son gabarit, sa clé de
 * réponse. Même statut que lesson_modules et practice_exercises : un index
 * du contenu (JSX, JSON), reconstruit par smarter:import-content-registry,
 * jamais édité à la main.
 *
 * Un item n'est jamais supprimé : une preuve historique doit rester
 * résoluble. Quand la source change, `content_version` change et l'ancienne
 * clé est retirée (`retired_at`), pas réécrite.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();

            // source:leçon:exercice:question — la même clé que learning_evidence.item_key.
            $table->string('item_key', 191)->unique();
            // final_test | practice
            $table->string('source_kind', 16);
            $table->string('exercise_code')->nullable();
            $table->string('question_id', 40);
            $table->string('template_key', 191)->nullable();

            $table->unsignedTinyInteger('difficulty');
            $table->string('cognitive_demand', 16)->nullable();
            // choice | multiChoice | rational | affine | interval | point | integerSet
            $table->string('answer_type', 24);

            // Titre court pour l'explication (« نشاط 4 — 90 زهرة… »), jamais l'énoncé.
            $table->string('title')->nullable();

            // [{code, role}] — validé contre learning_points à l'import.
            $table->json('learning_points');
            // Réservé au serveur : choix juste / expectedAnswer / evaluationPolicy /
            // misconceptionSignatures — ce qu'il faut pour juger sans le client.
            $table->json('answer_key')->nullable();
            // server | client — un item sans clé exploitable déclare `client`.
            $table->string('evaluation', 16)->default('server');

            // Empreinte de la question source : une question qui change de
            // sens change de version, l'historique ne bouge pas.
            $table->string('content_version', 64);

            $table->string('publication_status')->default('published');
            $table->timestamp('retired_at')->nullable();
            $table->timestamps();

            $table->index(['lesson_id', 'source_kind']);
            $table->index('template_key');
        });

        // Le pivot rend « combien d'items mesurent ce point » un COUNT indexé,
        // sans fouiller le JSON.
        Schema::create('assessment_item_learning_point', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_item_id')->constrained('assessment_items')->cascadeOnDelete();
            $table->foreignId('learning_point_id')->constrained()->cascadeOnDelete();
            $table->string('role', 16)->default('primary');
            $table->timestamps();

            $table->unique(['assessment_item_id', 'learning_point_id'], 'item_learning_point_unique');
            $table->index(['learning_point_id', 'role'], 'item_lp_by_point_role_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_item_learning_point');
        Schema::dropIfExists('assessment_items');
    }
};
