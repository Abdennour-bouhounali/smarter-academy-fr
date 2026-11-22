<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ce qu'une DEMANDE d'offre enseignant demande : un nombre de sièges, et le
 * prix que le serveur en a calculé à cet instant (jamais celui que le client
 * aurait envoyé). La demande reste un geste administratif : elle n'ouvre
 * rien tant que l'administration n'a pas activé.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_requests', function (Blueprint $table) {
            $table->unsignedInteger('requested_student_seats')->nullable()->after('requested_plan_version_id');
            $table->unsignedBigInteger('unit_price_cents')->nullable()->after('requested_student_seats');
            $table->unsignedBigInteger('calculated_total_cents')->nullable()->after('unit_price_cents');
            $table->char('currency', 3)->nullable()->after('calculated_total_cents');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_requests', function (Blueprint $table) {
            $table->dropColumn(['requested_student_seats', 'unit_price_cents', 'calculated_total_cents', 'currency']);
        });
    }
};
