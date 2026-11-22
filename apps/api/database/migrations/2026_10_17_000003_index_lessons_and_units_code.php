<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `lessons.code` et `units.code` n'étaient indexés que DERRIÈRE `chapter_id`
 * (l'unicité `(chapter_id, code)`), alors que l'application les cherche par
 * `where code = ?` seul — pratique, profil d'apprentissage, disponibilité.
 * Un balayage de table à chaque appel, qui grandit avec les 1AM–3AM.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', fn (Blueprint $table) => $table->index('code'));
        Schema::table('units', fn (Blueprint $table) => $table->index('code'));
    }

    public function down(): void
    {
        Schema::table('lessons', fn (Blueprint $table) => $table->dropIndex(['code']));
        Schema::table('units', fn (Blueprint $table) => $table->dropIndex(['code']));
    }
};
