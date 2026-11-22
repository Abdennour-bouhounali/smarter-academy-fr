<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les sujets choisis par un appareil (nouvelle commande, inscription, بلاغ…) —
 * `App\Domain\Push\AdminPush::TOPICS`. NULL = tous les sujets du rôle du compte.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->json('topics')->nullable()->after('user_agent');
        });
    }

    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropColumn('topics');
        });
    }
};
