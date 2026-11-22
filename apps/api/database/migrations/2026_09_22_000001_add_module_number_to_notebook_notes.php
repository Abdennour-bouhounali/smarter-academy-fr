<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le carnet s'ouvre désormais partout dans la leçon, pas seulement dans un
 * exercice. Une note prise depuis un module doit se souvenir DUQUEL — c'est
 * ce qui permet plus tard « ce que j'ai écrit dans ce module » et le retour
 * à l'endroit exact de la leçon.
 *
 * Un NUMÉRO, pas une clé étrangère vers lesson_modules : les modules sont
 * identifiés par leur numéro dans toute la plateforme (lesson.config.js,
 * useProgress, lesson_modules.number), et une note doit survivre à la
 * ré-importation du registre de contenu — même règle que `exercise_id` et
 * `question_id`, chaînes plutôt que FK, pour la même raison.
 *
 * Nullable : une note prise depuis la page d'accueil de la leçon, ou depuis
 * un exercice du moteur de pratique (qui vit hors des modules), n'a pas de
 * module. On n'en invente pas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notebook_notes', function (Blueprint $table) {
            $table->unsignedSmallInteger('module_number')->nullable()->after('learning_point_id');
        });
    }

    public function down(): void
    {
        Schema::table('notebook_notes', function (Blueprint $table) {
            $table->dropColumn('module_number');
        });
    }
};
