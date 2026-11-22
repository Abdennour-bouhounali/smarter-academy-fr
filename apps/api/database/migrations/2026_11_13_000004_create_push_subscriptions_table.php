<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les abonnements Web Push d'un APPAREIL (navigateur) d'un compte de la librairie
 * (administrateur ou « مسيّر المكتبة ») : une notification à chaque nouvelle commande
 * de livre (BOOKS_STORE.md §6quater). Un compte peut en avoir plusieurs (téléphone,
 * ordinateur) ; l'adresse `endpoint` est fournie par le service de notification du
 * navigateur et identifie l'appareil (unique, via son empreinte : un TEXT long ne
 * s'indexe pas en MySQL).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('endpoint');
            $table->char('endpoint_hash', 64)->unique();
            $table->string('public_key', 255);
            $table->string('auth_token', 255);
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
