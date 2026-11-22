<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une DÉROGATION individuelle sur une limite ou une fonctionnalité.
     *
     * « Ce professeur a droit à 3 classes au lieu d'une, pour ce partenariat,
     * jusqu'en juin » — sans créer une offre spéciale pour lui. Portée par
     * l'UTILISATEUR et non par l'abonnement : elle doit aussi s'appliquer à
     * quelqu'un qui n'a aucun abonnement (l'offre par défaut). `subscription_id`
     * reste disponible pour lier une dérogation à un abonnement précis, à
     * titre d'information.
     *
     * Ordre de résolution (PlanEntitlementResolver) :
     *   offre par défaut du type → version de l'abonnement en cours → dérogations actives.
     *
     * Jamais supprimée : révoquée (`revoked_at`), l'histoire reste — même
     * principe que `entitlements`.
     */
    public function up(): void
    {
        Schema::create('plan_entitlement_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->string('key', 64);
            $table->json('value')->nullable();
            $table->string('reason')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'key']);
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_entitlement_overrides');
    }
};
