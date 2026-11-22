<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le PRIX d'une version d'offre — INFORMATIF.
     *
     * La plateforme n'encaisse rien (ALGERIA_PLATFORM_MASTER_SPEC.md §17,
     * §18). Ce montant est ce que l'administration communique au client
     * pour un règlement en espèces ou par virement, hors plateforme. Il
     * sert aussi à dater la durée accordée à l'activation :
     *
     *   duration_days   combien de temps l'abonnement activé dure. Nul →
     *                   dérivé de billing_interval × interval_count.
     *
     * `provider_price_id` n'est là que pour ne pas fermer la porte à une
     * intégration future autorisée ; l'interface algérienne ne l'expose pas.
     */
    public function up(): void
    {
        Schema::create('plan_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_version_id')->constrained('plan_versions')->cascadeOnDelete();
            $table->char('currency', 3)->default('DZD');
            $table->unsignedBigInteger('amount_cents')->default(0);
            // month | year | one_time
            $table->string('billing_interval', 16)->default('year');
            $table->unsignedSmallInteger('interval_count')->default(1);
            $table->unsignedInteger('duration_days')->nullable();
            $table->unsignedSmallInteger('trial_days')->default(0);
            // active | inactive
            $table->string('status', 16)->default('active');
            $table->string('provider_price_id')->nullable();
            $table->timestamps();

            $table->index(['plan_version_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_prices');
    }
};
