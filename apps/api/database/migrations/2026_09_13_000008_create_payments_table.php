<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'historique des paiements.
     *
     * AUCUNE donnée de carte n'est stockée ici, et il n'y a délibérément
     * aucune colonne où en mettre : pas de numéro, pas de CVV, pas de date
     * d'expiration, pas de « détails » fourre-tout. Le seul lien avec le
     * fournisseur est une référence opaque.
     *
     * Le montant est en CENTIMES (entier) : un total d'argent ne se calcule
     * pas en flottant.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();

            $table->integer('amount_cents');
            $table->string('currency', 3)->default('EUR');
            // pending | succeeded | failed | refunded
            $table->string('status')->default('pending');

            $table->string('provider')->nullable();
            $table->string('external_reference')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
