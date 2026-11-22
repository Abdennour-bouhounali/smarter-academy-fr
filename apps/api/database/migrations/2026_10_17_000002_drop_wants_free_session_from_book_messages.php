<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Retire « أرغب في حصة مجانية » de la plateforme (décision du propriétaire,
 * 2026-10-17) : la case n'existe plus dans le formulaire du livre, et la colonne
 * qui la stockait disparaît.
 *
 * Une migration À PART, et non une retouche de la création des tables : cette
 * dernière est déjà sur `main`, donc déjà jouée en production. Gardée par
 * `hasColumn` : sûre sur une base qui l'a déjà perdue (poste local).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('book_messages', 'wants_free_session')) {
            Schema::table('book_messages', function (Blueprint $table) {
                $table->dropColumn('wants_free_session');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('book_messages', 'wants_free_session')) {
            Schema::table('book_messages', function (Blueprint $table) {
                $table->boolean('wants_free_session')->default(false)->after('book_owner');
            });
        }
    }
};
