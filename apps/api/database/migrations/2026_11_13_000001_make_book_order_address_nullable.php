<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Le formulaire de commande d'un livre ne demande plus l'adresse complète
 * (2026-11-13) : wilaya + commune suffisent, l'adresse se précise à l'appel de
 * confirmation. Les commandes reçues gardent la leur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('book_orders', function (Blueprint $table) {
            $table->text('address')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Une commande sans adresse ne doit pas faire échouer le retour arrière.
        DB::table('book_orders')->whereNull('address')->update(['address' => '']);

        Schema::table('book_orders', function (Blueprint $table) {
            $table->text('address')->nullable(false)->change();
        });
    }
};
