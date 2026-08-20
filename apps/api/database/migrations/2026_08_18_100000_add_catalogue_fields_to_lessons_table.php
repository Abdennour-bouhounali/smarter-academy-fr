<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Catalogue fields the API needs server-side: duration_minutes anchors the
// 45-minute-per-lesson invariant (checked by smarter:validate-curriculum),
// tier is the free/premium flag future entitlement enforcement will read.
// Presentation-only fields (icon, difficulty, partIndex) deliberately stay
// client-side in coursesData.js.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->unsignedSmallInteger('duration_minutes')->nullable()->after('status');
            $table->string('tier')->default('premium')->after('duration_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['duration_minutes', 'tier']);
        });
    }
};
