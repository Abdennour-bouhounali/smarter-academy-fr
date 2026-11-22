<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La CAPACITÉ ACHETÉE, figée sur l'abonnement.
 *
 * `student_seat_limit` est le nombre d'élèves que cet abonnement autorise
 * l'enseignant à encadrer ; il l'emporte sur `students_total.max` de la
 * version. Le prix unitaire, le total et la devise sont recopiés AU MOMENT
 * de l'activation : une grille modifiée ensuite (dans une nouvelle version)
 * ne change rien à ce que cet abonnement a coûté ni à ce qu'il ouvre.
 *
 * Additif : NULL pour tout abonnement existant (élève, ou enseignant activé
 * avant les sièges), qui continue de lire les limites de sa version.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedInteger('student_seat_limit')->nullable()->after('plan_version_id');
            $table->unsignedBigInteger('seat_unit_price_cents')->nullable()->after('student_seat_limit');
            $table->unsignedBigInteger('seat_total_cents')->nullable()->after('seat_unit_price_cents');
            $table->char('seat_currency', 3)->nullable()->after('seat_total_cents');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['student_seat_limit', 'seat_unit_price_cents', 'seat_total_cents', 'seat_currency']);
        });
    }
};
