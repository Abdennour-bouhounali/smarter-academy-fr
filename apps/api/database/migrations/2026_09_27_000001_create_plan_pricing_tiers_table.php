<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les PALIERS de prix par élève d'une version d'offre enseignant.
 *
 * L'offre enseignant ne se vend plus « par classes » mais « par sièges
 * élèves » : l'enseignant choisit combien d'élèves il veut encadrer, le
 * palier qui couvre ce nombre donne le prix unitaire, et le total en
 * découle. Les paliers appartiennent à une VERSION (immuable dès qu'un
 * abonnement la référence) : changer un prix, c'est publier une nouvelle
 * version, et personne n'est refacturé rétroactivement.
 *
 *   min_students … max_students   (max NULL = sans borne supérieure)
 *   price_per_student_cents        en centimes de dinar, INFORMATIF
 *
 * Aucun nombre de la grille n'est dans le code : l'administration la
 * configure, la valide (ni chevauchement ni trou) et la publie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_pricing_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_version_id')->constrained('plan_versions')->cascadeOnDelete();
            $table->unsignedInteger('min_students');
            $table->unsignedInteger('max_students')->nullable();
            $table->unsignedBigInteger('price_per_student_cents')->default(0);
            $table->char('currency', 3)->default('DZD');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['plan_version_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_pricing_tiers');
    }
};
