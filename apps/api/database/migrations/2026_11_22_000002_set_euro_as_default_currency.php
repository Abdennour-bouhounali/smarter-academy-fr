<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * L'euro comme devise par défaut des prix — 2026-11-22.
 *
 * `plan_prices.currency` et `plan_pricing_tiers.currency` ont été créées
 * avec le défaut `DZD` (le produit algérien). L'application écrit toujours la
 * devise explicitement ; ce défaut ne sert qu'à une ligne insérée à la main,
 * et une telle ligne doit être en euros. Les lignes existantes ne changent pas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plan_prices', function (Blueprint $table) {
            $table->char('currency', 3)->default('EUR')->change();
        });
        Schema::table('plan_pricing_tiers', function (Blueprint $table) {
            $table->char('currency', 3)->default('EUR')->change();
        });
    }

    public function down(): void
    {
        Schema::table('plan_prices', function (Blueprint $table) {
            $table->char('currency', 3)->default('DZD')->change();
        });
        Schema::table('plan_pricing_tiers', function (Blueprint $table) {
            $table->char('currency', 3)->default('DZD')->change();
        });
    }
};
