<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le REGISTRE DE CONSOMMATION — une ligne par unité consommée, jamais
 * modifiée, jamais supprimée avec l'objet qu'elle a créé.
 *
 * Ce n'est pas un compteur : « combien ce mois-ci » se COMPTE dans une
 * fenêtre (created_at ≥ début de période). Changer la période d'une
 * fonctionnalité (mois → à vie) ne perd donc rien, et l'administration
 * peut lire l'historique tel qu'il s'est passé.
 *
 *   usage_type   document_generation | notebook_copy  — deux ressources
 *                distinctes, jamais additionnées
 *   feature_key  la fonctionnalité dont le quota a été consommé
 *   context      l'instrument du مختبر pour un travail (whiteboard, …) —
 *                c'est ce qui donne « l'usage du مختبر par instrument »
 *   subject_id   l'objet créé (document, note), pour l'audit ; pas de clé
 *                étrangère : supprimer le travail ne rembourse pas le quota
 *   tier         le palier AU MOMENT de la consommation (rapport par palier)
 *
 * Écrite dans la MÊME transaction que l'objet créé, sous le verrou de la
 * ligne users (FeatureAccessService::consume) : deux requêtes simultanées
 * ne dépassent jamais le quota.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('usage_type', 40);
            $table->string('feature_key', 80);
            $table->string('context', 80)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('tier', 16);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'usage_type', 'created_at']);
            $table->index(['usage_type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_events');
    }
};
