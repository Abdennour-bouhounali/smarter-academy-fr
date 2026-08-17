<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // The student's current grade (e.g. '6e', '3e', 'seconde') — one of
            // packages/core's courseLevels[].grades[].id values. Nullable: admins
            // don't have one, and it's not set until registration/onboarding.
            // Not validated against an exact enum here — the frontend catalogue
            // (packages/core) is the single source of truth for which grades
            // exist; the backend just stores whatever it's given.
            $table->string('grade')->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('grade');
        });
    }
};
