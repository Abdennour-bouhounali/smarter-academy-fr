<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Qui a jugé la réponse d'une tentative de pratique : le serveur (phase 4),
 * ou le client (repli, ou tentative antérieure).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('question_attempts', function (Blueprint $table) {
            $table->string('evaluated_by', 16)->nullable()->after('outcome');
            // Ce que le client avait déclaré quand le serveur a jugé autrement — audit.
            $table->string('client_outcome', 32)->nullable()->after('evaluated_by');
        });
    }

    public function down(): void
    {
        Schema::table('question_attempts', function (Blueprint $table) {
            $table->dropColumn(['evaluated_by', 'client_outcome']);
        });
    }
};
