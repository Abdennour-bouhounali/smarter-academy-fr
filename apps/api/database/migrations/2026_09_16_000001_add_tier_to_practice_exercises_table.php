<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le palier commercial d'un exercice.
     *
     * `null` et non `'free'` par défaut, et c'est TOUTE la différence : null
     * veut dire « rien de décidé ici, l'exercice suit sa leçon », tandis que
     * `'free'` voudrait dire « gratuit, quoi qu'il arrive à la leçon ». Sans
     * cette distinction, rendre une leçon payante laisserait ses exercices
     * ouverts — le contenu vendu fuirait par sa pratique.
     *
     * L'héritage est donc le DÉFAUT, et la valeur explicite une exception
     * qu'un administrateur pose sciemment (voir AccessTier::effective()).
     *
     * Aucune ligne existante n'est modifiée : elles prennent toutes null,
     * donc héritent, donc restent gratuites comme leurs leçons.
     */
    public function up(): void
    {
        Schema::table('practice_exercises', function (Blueprint $table) {
            $table->string('tier')->nullable()->after('question_count');
            $table->index('tier');
        });
    }

    public function down(): void
    {
        Schema::table('practice_exercises', function (Blueprint $table) {
            $table->dropIndex(['tier']);
            $table->dropColumn('tier');
        });
    }
};
