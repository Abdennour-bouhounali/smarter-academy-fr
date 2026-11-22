<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rattachement d'une leçon à son unité du manuel, sa NATURE (« lesson »
     * = un درس ; « synthesis » = « أدمج تعلّماتي », la synthèse d'unité, jamais
     * comptée comme un درس), l'origine de son titre et sa référence au manuel.
     * Additif : toutes les colonnes ont un défaut ou acceptent NULL.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->foreignId('unit_id')->nullable()->after('chapter_id')->constrained('units')->nullOnDelete();
            $table->string('kind', 16)->default('lesson')->after('code');
            $table->string('title_source', 24)->default('official_topic')->after('title');
            $table->json('textbook_ref')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropConstrainedForeignId('unit_id');
            $table->dropColumn(['kind', 'title_source', 'textbook_ref']);
        });
    }
};
