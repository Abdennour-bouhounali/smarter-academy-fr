<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La capacité que chaque code d'un lot lié à une offre enseignant ouvre.
 *
 * Une école qui paie « 10 enseignants × 30 élèves » reçoit un lot de 10
 * codes portant `student_seat_limit = 30` : chaque saisie fait naître un
 * abonnement de 30 sièges sur la version figée du lot, quelle que soit la
 * grille de prix du jour de la saisie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activation_code_batches', function (Blueprint $table) {
            $table->unsignedInteger('student_seat_limit')->nullable()->after('plan_version_id');
        });
    }

    public function down(): void
    {
        Schema::table('activation_code_batches', function (Blueprint $table) {
            $table->dropColumn('student_seat_limit');
        });
    }
};
