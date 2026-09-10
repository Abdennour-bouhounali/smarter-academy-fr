<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le journal des actions d'administration — qui a fait quoi, quand, et
     * sur quoi.
     *
     * `before` / `after` ne portent que l'état MÉTIER modifié (un statut de
     * publication, un statut de compte, un statut de signalement). Jamais de
     * mot de passe, jamais de jeton, jamais de secret : pour un changement
     * d'identifiant, on journalise QUE l'action a eu lieu, pas sa valeur.
     * ActivityLogger applique cette règle en un seul endroit.
     */
    public function up(): void
    {
        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->string('entity_id')->nullable();

            $table->json('before')->nullable();
            $table->json('after')->nullable();

            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
    }
};
