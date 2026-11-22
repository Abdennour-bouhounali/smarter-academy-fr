<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le mode de livraison choisi à la commande (2026-11-22) : « home » (à
 * domicile) ou « desk » (retrait au bureau du transporteur). Le serveur en
 * déduit le frais, figé dans `delivery_fee`. Les commandes reçues avant gardent
 * NULL : leur frais a été fixé à la main.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('book_orders', function (Blueprint $table) {
            $table->string('delivery_mode', 8)->nullable()->after('delivery_fee');
        });
    }

    public function down(): void
    {
        Schema::table('book_orders', function (Blueprint $table) {
            $table->dropColumn('delivery_mode');
        });
    }
};
