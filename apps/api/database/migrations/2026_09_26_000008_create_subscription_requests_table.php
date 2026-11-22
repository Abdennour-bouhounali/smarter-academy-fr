<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une DEMANDE d'offre — un geste administratif, jamais un paiement.
     *
     * L'utilisateur dit « je voudrais Teacher Pro ». Rien ne s'ouvre : la
     * plateforme n'encaisse pas. L'administration le contacte, reçoit
     * l'argent hors plateforme, puis active l'offre sur le compte ou lui
     * envoie un code. La demande passe alors `fulfilled`, avec le lien vers
     * l'abonnement né. Refusée, elle garde son motif ; annulée par
     * l'utilisateur, elle reste. Jamais supprimée.
     *
     *   pending | fulfilled | rejected | cancelled
     */
    public function up(): void
    {
        Schema::create('subscription_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_plan_id')->constrained('plans')->cascadeOnDelete();
            $table->foreignId('requested_plan_version_id')->nullable()->constrained('plan_versions')->nullOnDelete();
            $table->string('status', 16)->default('pending');
            $table->timestamp('requested_at');
            $table->string('user_note', 500)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('rejection_reason')->nullable();
            $table->string('admin_note')->nullable();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_requests');
    }
};
