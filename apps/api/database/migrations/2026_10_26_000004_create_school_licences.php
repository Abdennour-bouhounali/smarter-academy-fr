<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La LICENCE d'établissement (SCHOOL_ADMIN_SPACE.md, décision D1, phase 7) :
 * des sièges d'élèves achetés par l'établissement, activés à la main par
 * l'administration (aucun paiement en ligne, comme toute offre du produit).
 *
 * Une licence qui court couvre chaque élève membre actif d'une classe active
 * de l'établissement (accès complet), et ses élèves n'occupent plus les
 * sièges de leur enseignant. Aucune ligne de droit n'est écrite : la
 * couverture se calcule à chaque requête (SchoolCoverage).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_licences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('student_seats');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            // active | suspended | cancelled
            $table->string('status', 16)->default('active');
            $table->string('note', 500)->nullable();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['school_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_licences');
    }
};
