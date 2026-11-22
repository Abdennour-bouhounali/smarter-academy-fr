<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les SUJETS du programme, portés par le chapitre.
 *
 * Le programme officiel de 4AM (4 domaines, 28 sujets — voir
 * docs/ALGERIA_4AM_CURRICULUM.md) est arrêté, mais son DÉCOUPAGE EN LEÇONS ne
 * l'est pas : c'est une décision pédagogique de la phase 7, explicitement
 * laissée ouverte (« À DÉCOMPOSER »).
 *
 * D'où cette colonne. Sans elle, il n'y aurait que deux façons de faire
 * entrer le programme en base, et les deux sont fausses :
 *
 *   — créer 28 leçons, une par sujet : cela TRANCHERAIT le découpage, et la
 *     phase 7 hériterait de frontières que personne n'a choisies ;
 *   — ne rien stocker : la base ignorerait le seul curriculum algérien
 *     réellement fourni, et l'élève ne verrait pas son programme.
 *
 * Le chapitre porte donc ses sujets tels quels, et `lessons` reste vide.
 * Quand la phase 7 décidera des leçons, elles s'ajouteront normalement et
 * cette colonne deviendra la trace du programme dont elles dérivent.
 *
 * Nullable : les chapitres français hérités n'ont pas de sujets (leur
 * curriculum est décrit par leurs leçons), et la colonne ne doit rien
 * affirmer à leur place.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->json('topics')->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropColumn('topics');
        });
    }
};
