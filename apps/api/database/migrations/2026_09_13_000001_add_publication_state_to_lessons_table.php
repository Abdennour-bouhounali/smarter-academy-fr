<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'état de publication, celui que le SERVEUR fait respecter.
     *
     * `lessons.status` existe déjà, mais sa propre migration le dit :
     * « informational only, not enforced against anything » — il ne fait que
     * refléter coursesData.js ('available' | 'coming_soon'), qui reste la
     * source du catalogue. On ne le touche pas : le frontend le lit encore.
     *
     * `publication_status` est la colonne que l'admin écrit et que le backend
     * oppose à l'élève. Deux colonnes, deux propriétaires — jamais l'inverse.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('publication_status')->default('published')->after('status');
            $table->timestamp('published_at')->nullable()->after('publication_status');
            $table->timestamp('archived_at')->nullable()->after('published_at');

            $table->index('publication_status');
        });

        // Reprise de l'existant : une leçon déjà ouverte aux élèves reste
        // ouverte, une leçon 'coming_soon' devient un brouillon. Aucun élève
        // ne perd l'accès à quoi que ce soit le jour de la migration.
        DB::table('lessons')->where('status', 'available')->update([
            'publication_status' => 'published',
            'published_at' => now(),
        ]);
        DB::table('lessons')->where('status', '!=', 'available')->update([
            'publication_status' => 'draft',
        ]);
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropIndex(['publication_status']);
            $table->dropColumn(['publication_status', 'published_at', 'archived_at']);
        });
    }
};
