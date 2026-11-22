<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les RÉGLAGES de la plateforme que l'administrateur change depuis le tableau de bord (propriétaire, 2026-11-21 :
 * ouvrir / fermer les inscriptions sans toucher au .env). Une ligne par clé ; absence de ligne = les défauts du dépôt
 * (config/*.php). Première clé : `registration` (lue par RegistrationGate seul).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique();
            $table->json('values');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
