<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// 284 questions de test final citent déjà plusieurs learning points, toutes à
// poids égal. L'audit de 2de montre le coût : quand 69 points reposent sur une
// question partagée, une seule réponse tranche pour deux compétences, au seuil
// de 0,70. Le rôle permet de peser un point secondaire moins qu'un principal.
//
// La valeur par défaut 'primary' reproduit EXACTEMENT le comportement actuel :
// les 230 lignes existantes ne changent pas de sens, et le test final n'a pas
// besoin d'être annoté pour continuer de fonctionner.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_evidence_learning_point', function (Blueprint $table) {
            $table->string('role', 16)->default('primary')->after('learning_point_id');
        });
    }

    public function down(): void
    {
        Schema::table('learning_evidence_learning_point', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
