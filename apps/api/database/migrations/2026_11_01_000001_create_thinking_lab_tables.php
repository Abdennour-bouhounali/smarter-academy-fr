<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « مختبر التفكير » — phase 1 : l'état d'un élève sur chaque défi, et ses tentatives
 * (docs/architecture/THINKING_LAB.md §6).
 *
 * L'état est gardé PAR DÉFI (jamais un « numéro courant ») : une renumérotation
 * d'édition ne perd aucun progrès. `challenge_id` est l'id STABLE du contenu (slug),
 * une chaîne et jamais une clé étrangère : le contenu vit dans des fichiers versionnés.
 * Aucune preuve de maîtrise ici : le ladder est hors programme.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thinking_lab_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('challenge_id', 80);
            // trying | solved | learned
            $table->string('state', 16)->default('trying');
            $table->unsignedSmallInteger('attempts_counted')->default(0);
            // La clé la plus haute OUVERTE (0 = aucune) ; la clé k se débloque après la tentative k.
            $table->unsignedTinyInteger('keys_opened')->default(0);
            // L'instant de la première tentative COMPTÉE : le jour de réflexion part de là.
            $table->timestamp('first_attempt_at', 3)->nullable();
            $table->timestamp('last_counted_at', 3)->nullable();
            $table->timestamp('solved_at', 3)->nullable();
            $table->timestamp('learned_at', 3)->nullable();
            // alone | keys | learned | twin
            $table->string('outcome', 16)->nullable();
            $table->unsignedInteger('params_index')->default(0);
            $table->unsignedSmallInteger('edition')->default(1);
            $table->timestamp('postponed_at', 3)->nullable();
            // Les suites résolues d'un sommet et « ارفع السقف » : des drapeaux, jamais une réponse.
            $table->json('extras')->nullable();
            $table->timestamps(3);
            $table->unique(['user_id', 'challenge_id']);
            $table->index(['user_id', 'state']);
        });

        Schema::create('thinking_lab_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('progress_id')->constrained('thinking_lab_progress')->cascadeOnDelete();
            $table->string('answer_raw', 400);
            $table->string('answer_norm', 600)->nullable();
            $table->boolean('correct')->default(false);
            $table->boolean('counted')->default(false);
            // null (compté) | syntax | repeat | too_soon | no_draft
            $table->string('reason', 16)->nullable();
            $table->unsignedTinyInteger('mistake_index')->nullable();
            $table->text('draft')->nullable();
            $table->timestamp('created_at', 3)->useCurrent();
            $table->index(['progress_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thinking_lab_attempts');
        Schema::dropIfExists('thinking_lab_progress');
    }
};
